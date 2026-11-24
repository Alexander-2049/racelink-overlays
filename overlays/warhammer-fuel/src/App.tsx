import type { CSSProperties } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import {
  fromUnit,
  fuelUnit,
  lowFuelState,
  toUnit,
  type FuelUnit,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import {
  buildFuelRows,
  fuelFigure,
  fuelSources,
  wholeLapsToFinish,
  type FuelRow,
  type FuelRowKey,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/fuelPanel.ts';
import { Root } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/useOverlay';
import { FitStage } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/FitStage';
import { rowKeyAttribute, useTableMotion } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useTableMotion.ts';
import type { Settings } from './racelink-settings';

const renderHz = 8;

const rowLabels: Readonly<Record<FuelRowKey, string>> = {
  average: 'Average',
  qualify: 'Qualify',
  last: 'Last',
  custom: 'Mine',
};

const columnLabels = ['Laps Remain', 'Refuel', 'Fuel at End'] as const;

const unitFor = (
  setting: Settings['units'],
  fuel: Readonly<{ displayUnit: 'liters' | 'kilograms'; kgPerLiter: number | null }>,
  imperial: boolean,
): FuelUnit => {
  switch (setting) {
    case 'auto':
      return fuelUnit(fuel.displayUnit, imperial, fuel.kgPerLiter);
    case 'liters':
      return fuelUnit('liters', false, null);
    case 'usGallons':
      return fuelUnit('liters', true, null, false);
    case 'imperialGallons':
      return fuelUnit('liters', true, null, true);
    case 'kilograms':
      return fuelUnit('kilograms', false, fuel.kgPerLiter);
  }
};

function Pair({ label, value }: Readonly<{ label: string | null; value: string }>) {
  return (
    <div className="wh-cell">
      <span className="wh-cell-label">{label ?? ' '}</span>
      <span className="wh-mono wh-cell-value">{value}</span>
    </div>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings } = useOverlay(overlay, renderHz);
  const { fuel, session, car } = telemetry;
  const calculator = fuel.calculator;
  const unit = unitFor(settings.units, fuel, session.displayUnits === 'imperial');

  const sources = fuelSources(calculator?.history ?? [], session.type, {
    average: calculator?.strategies.allLaps?.perLapLiters ?? fuel.perLapLiters,
    last: calculator?.strategies.lastLap?.perLapLiters ?? fuel.lastLapLiters,
  });
  const keys: FuelRowKey[] = [
    ...(settings.showAverage ? (['average'] as const) : []),
    ...(settings.showQualify ? (['qualify'] as const) : []),
    ...(settings.showLast ? (['last'] as const) : []),
    ...(settings.showCustom ? (['custom'] as const) : []),
  ];
  const rows: FuelRow[] = buildFuelRows({
    levelLiters: fuel.levelLiters,
    lapsToFinish: wholeLapsToFinish(calculator?.lapsToFinish ?? null),
    capacityLiters: calculator?.capacityLiters ?? fuel.capacityLiters,
    sources,
    customPerLapLiters: settings.customPerLap > 0 ? fromUnit(settings.customPerLap, unit) : null,
    extraMode: settings.extraMode,
    onPitRoad: car.isInPitlane,
    unit,
    cushion: settings.cushion,
    rows: keys,
  });

  // The panel keeps its layout and scales as a whole to the window; the rows fade in and out.
  const motion = useTableMotion({
    items: rows,
    getKey: (row) => row.key,
    columns: [] as readonly string[],
    hasData: () => true,
    animations: settings.animations,
    hideEmpty: false,
  });
  const raceLaps = session.estimatedTotalLaps ?? calculator?.raceLaps ?? null;
  const low = settings.warnLowFuel ? lowFuelState(fuel.levelLiters, sources.average ?? sources.last) : 0;
  const levelTone = low === 2 ? 'wh-bad' : low === 1 ? 'wh-warn' : '';

  return (
    <Root theme={settings.theme} opacity={settings.opacity} fontSize={settings.fontSize} className="wh-fuel">
      <FitStage>
      <div className="wh-panel">
        {(settings.showLevel || settings.showLapsInRace || settings.showPitBadge) && (
          <div className="wh-top">
            {settings.showLevel && (
              <div className="wh-cell wh-cell--big">
                <span className="wh-cell-label wh-light">Fuel Level</span>
                <span className={`wh-mono wh-cell-value ${levelTone}`}>
                  {fuelFigure(toUnit(fuel.levelLiters, unit))}
                </span>
              </div>
            )}
            {settings.showLapsInRace && (
              <div className="wh-cell wh-cell--big">
                <span className="wh-cell-label wh-light">Laps in Race</span>
                <span className="wh-mono wh-cell-value">
                  {raceLaps === null ? '-' : raceLaps.toFixed(1)}
                </span>
              </div>
            )}
            {settings.showPitBadge && (
              <span className={car.isInPitlane ? 'wh-pitbadge wh-pitbadge--on wh-label' : 'wh-pitbadge wh-label'}>
                PIT
              </span>
            )}
          </div>
        )}
        <div className="wh-grid" ref={motion.rootRef}>
          {rows.map((row, rowIndex) => {
            const style = { '--wh-row': `var(--wh-src-${row.key})` } as CSSProperties;
            const cells: readonly (string | null)[] = [
              rowLabels[row.key],
              ...columnLabels,
            ];
            const values = [
              fuelFigure(toUnit(row.perLapLiters, unit)),
              fuelFigure(row.lapsOfFuel),
              fuelFigure(row.refuelLiters === null ? null : toUnit(row.refuelLiters, unit)),
              fuelFigure(row.atEndLiters === null ? null : toUnit(row.atEndLiters, unit)),
            ];
            return (
              <div key={row.key} className="wh-fuelrow" style={style} {...{ [rowKeyAttribute]: row.key }}>
                {values.map((value, column) => (
                  <Pair
                    key={column}
                    label={column === 0 || rowIndex === 0 ? (cells[column] ?? null) : null}
                    value={value}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div className="wh-unit wh-dim">{unit.symbol}</div>
      </div>
      </FitStage>
    </Root>
  );
}
