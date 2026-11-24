import type { CSSProperties } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
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

function Pair({ label, value, tone }: Readonly<{ label: string | null; value: string; tone?: string }>) {
  return (
    <div className="fu-cell">
      <span className="fu-cell-label">{label ?? ' '}</span>
      <span className={tone === undefined ? 'fu-cell-value' : `fu-cell-value ${tone}`}>{value}</span>
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
    customPerLapLiters: settings.myPerLap > 0 ? fromUnit(settings.myPerLap, unit) : null,
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
  const levelTone = low === 2 ? 'bad' : low === 1 ? 'warn' : '';

  const style = {
    '--an-size': `${String(settings.fontSize)}px`,
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
    ...(settings.colorMode === 'CUSTOM'
      ? {
          '--fu-main': settings.textColor,
          '--fu-good': settings.goodColor,
          '--fu-bad': settings.badColor,
        }
      : {}),
  } as CSSProperties;

  return (
    <div className="an fu-root" data-theme={settings.theme} data-colors={settings.colorMode} style={style}>
      <FitStage>
        <div className="an-panel fu-panel" data-accent={settings.accentLine ? 'on' : 'off'}>
          {(settings.showLevel || settings.showLapsInRace || settings.showPitBadge) && (
            <div className="fu-top">
              {settings.showLevel && (
                <div className="fu-cell fu-cell--big">
                  <span className="fu-cell-label fu-light">Fuel Level</span>
                  <span className={`fu-cell-value ${levelTone}`}>{fuelFigure(toUnit(fuel.levelLiters, unit))}</span>
                </div>
              )}
              {settings.showLapsInRace && (
                <div className="fu-cell fu-cell--big">
                  <span className="fu-cell-label fu-light">Laps in Race</span>
                  <span className="fu-cell-value">{raceLaps === null ? '-' : raceLaps.toFixed(1)}</span>
                </div>
              )}
              {settings.showPitBadge && (
                <span className={car.isInPitlane ? 'fu-pitbadge fu-pitbadge--on' : 'fu-pitbadge'}>PIT</span>
              )}
            </div>
          )}
          <div className="fu-grid" ref={motion.rootRef}>
            {rows.map((row, rowIndex) => {
              const rowStyle = { '--fu-row': `var(--an-fu-${row.key})` } as CSSProperties;
              const labels: readonly string[] = [rowLabels[row.key], ...columnLabels];
              const values = [
                fuelFigure(toUnit(row.perLapLiters, unit)),
                fuelFigure(row.lapsOfFuel),
                fuelFigure(row.refuelLiters === null ? null : toUnit(row.refuelLiters, unit)),
                fuelFigure(row.atEndLiters === null ? null : toUnit(row.atEndLiters, unit)),
              ];
              const endTone = row.atEndLiters === null ? undefined : row.atEndLiters < 0 ? 'bad' : 'good';
              return (
                <div key={row.key} className="fu-row" style={rowStyle} {...{ [rowKeyAttribute]: row.key }}>
                  {values.map((value, column) => (
                    <Pair
                      key={column}
                      label={column === 0 || rowIndex === 0 ? (labels[column] ?? null) : null}
                      value={value}
                      tone={column === 3 ? endTone : undefined}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          <div className="fu-unit">{unit.symbol}</div>
        </div>
      </FitStage>
    </div>
  );
}
