import type { CSSProperties, ReactNode } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import { fuelBoard } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/fuelBoard.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import {
  fuelUnit,
  toUnit,
  type FuelUnit,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common';
import type { Settings } from './racelink-settings';

type RowId = Settings['rows'][number]['id'];

const renderHz = 5;

const labels: Readonly<Record<RowId, string>> = {
  margin: 'Margin (Laps):',
  add: 'Add:',
  remaining: 'Remaining:',
  estLaps: 'Est. Laps:',
  perLap: 'Per lap:',
  lapsLeft: 'Laps to go:',
  atFinish: 'Fuel at end:',
  extra: 'Extra:',
};

const amount = (liters: number | null, unit: FuelUnit): string =>
  liters === null ? '--' : `${toUnit(liters, unit).toFixed(1)} ${unit.symbol}`;

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings } = useOverlay(overlay, renderHz);
  const { fuel, session, car } = telemetry;
  const imperial = session.displayUnits === 'imperial';
  const unit: FuelUnit =
    settings.unit === 'LITERS'
      ? fuelUnit('liters', false, fuel.kgPerLiter)
      : settings.unit === 'GALLONS'
        ? fuelUnit('liters', true, fuel.kgPerLiter)
        : fuelUnit(fuel.displayUnit, imperial, fuel.kgPerLiter);
  const calculator = fuel.calculator;
  const board = fuelBoard({
    levelLiters: fuel.levelLiters,
    capacityLiters: calculator?.capacityLiters ?? fuel.capacityLiters,
    history: calculator?.history ?? [],
    strategies: calculator?.strategies ?? null,
    modelPerLapLiters: fuel.perLapLiters,
    lapsToFinish: calculator?.lapsToFinish ?? null,
    source: settings.source,
    customPerLapLiters: settings.customPerLap,
    marginLaps: settings.marginLaps,
    extraMode: settings.extraMode,
    onPitRoad: car.isInPitlane,
  });
  const warn = settings.warnColors ? board.warning : 0;
  const warnClass = warn === 2 ? 'bad' : warn === 1 ? 'warn' : '';

  const value = (id: RowId): ReactNode => {
    switch (id) {
      case 'margin':
        return settings.marginLaps.toFixed(1);
      case 'add':
        return amount(board.addLiters, unit);
      case 'remaining':
        return <span className={warnClass}>{amount(fuel.levelLiters, unit)}</span>;
      case 'estLaps':
        return <span className={warnClass}>{board.lapsOfFuel === null ? '--' : board.lapsOfFuel.toFixed(1)}</span>;
      case 'perLap':
        return amount(board.perLapLiters, unit);
      case 'lapsLeft':
        return board.lapsLeft === null ? '--' : String(board.lapsLeft);
      case 'atFinish':
        return (
          <span className={board.atFinishLiters !== null && board.atFinishLiters < 0 ? 'bad' : ''}>
            {amount(board.atFinishLiters, unit)}
          </span>
        );
      case 'extra':
        return amount(board.extraLiters, unit);
    }
  };

  const style = {
    '--an-size': `${String(settings.fontSize)}px`,
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
  } as CSSProperties;

  return (
    <div className="an fu-root" data-theme={settings.theme} style={style}>
      <div className="an-panel fu-panel" data-accent={settings.accentLine ? 'on' : 'off'}>
        {settings.showTitle && (
          <div className="fu-title">
            <b>{settings.title}</b>
            <span>{settings.subtitle}</span>
          </div>
        )}
        <div className="fu-rows">
          {settings.rows
            .filter((row) => row.visible)
            .map((row) => (
              <div key={row.id} className="fu-row">
                <span className="fu-label">{labels[row.id]}</span>
                <span className="fu-value">{value(row.id)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
