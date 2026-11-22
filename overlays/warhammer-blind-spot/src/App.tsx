import type { CSSProperties } from 'react';
import type { DriverTelemetry, RacelinkOverlay, TelemetryTopics } from '@racelink/overlay';
import {
  alongsidePosition,
  offsetMetersFromFractions,
  spotterFromRadar,
  spotterView,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import { Root } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/useOverlay';
import type { Settings } from './racelink-settings';

const renderHz = 30;

/** What one bar shows: nothing, a line at a place between behind (-1) and ahead (1), or the whole bar. */
export type SideState =
  | Readonly<{ kind: 'off' }>
  | Readonly<{ kind: 'line'; position: number }>
  | Readonly<{ kind: 'full' }>;

const off: SideState = { kind: 'off' };

/** A car this close to the player along the lap is the one alongside. */
const searchMeters = 12;

/** Cars alongside, from where they are on the lap: the nearest one gives the line its place. */
const nearestOffset = (
  telemetry: TelemetryTopics,
  player: DriverTelemetry,
): number | null => {
  const length = telemetry.session.trackLengthMeters;
  if (length === null || length <= 0) return null;
  let best: number | null = null;
  for (const driver of telemetry.drivers) {
    if (driver.carIdx === player.carIdx || driver.isSpectator || driver.isPaceCar) continue;
    if (driver.trackSurface === 'notInWorld' || driver.onPitRoad) continue;
    const offset = offsetMetersFromFractions(
      player.lapDistanceFraction,
      driver.lapDistanceFraction,
      length,
    );
    if (Math.abs(offset) > searchMeters) continue;
    if (best === null || Math.abs(offset) < Math.abs(best)) best = offset;
  }
  return best;
};

/** The two bars for the current frame. */
export const sidesOf = (
  telemetry: TelemetryTopics,
  settings: Pick<Settings, 'distAhead' | 'distBehind'>,
): Readonly<{ left: SideState; right: SideState }> => {
  const { car, radar } = telemetry;
  let view = spotterView(car.spotter);
  const radarCars = radar?.cars ?? [];
  if (!view.active && car.spotter === 'off' && radar !== null) view = spotterFromRadar(radar);
  if (!view.active) return { left: off, right: off };

  const player = telemetry.drivers.find((driver) => driver.isPlayer);
  const lineFor = (side: 'left' | 'right'): SideState => {
    // Radar: the car's own place beside the player.
    const alongside = radarCars.filter(
      (entry) => (side === 'left' ? entry.xMeters < 0 : entry.xMeters > 0) && Math.abs(entry.xMeters) < 3.5,
    );
    const nearest = alongside.sort((a, b) => Math.abs(a.yMeters) - Math.abs(b.yMeters))[0];
    if (nearest !== undefined)
      return {
        kind: 'line',
        position: alongsidePosition(nearest.yMeters, settings.distAhead, settings.distBehind),
      };
    const offset = player === undefined ? null : nearestOffset(telemetry, player);
    return offset === null
      ? { kind: 'full' }
      : {
          kind: 'line',
          position: alongsidePosition(offset, settings.distAhead, settings.distBehind),
        };
  };
  const side = (count: number, which: 'left' | 'right', both: boolean): SideState =>
    count === 0 ? off : count >= 2 || both ? { kind: 'full' } : lineFor(which);
  const both = view.left > 0 && view.right > 0;
  return { left: side(view.left, 'left', both), right: side(view.right, 'right', both) };
};

function Bar({
  side,
  state,
  settings,
  idle,
}: Readonly<{ side: 'left' | 'right'; state: SideState; settings: Settings; idle: boolean }>) {
  const lit = state.kind !== 'off';
  const length = state.kind === 'full' ? 100 : settings.lineLength;
  // Ahead is up: position 1 puts the line at the top edge, -1 at the bottom.
  const top = state.kind === 'line' ? ((1 - state.position) / 2) * (100 - length) : 0;
  const style = {
    '--wh-bar': `${String(settings.barWidth)}px`,
    '--wh-line': `${String(Math.min(settings.lineWidth, settings.barWidth))}px`,
    '--wh-top': `${top.toFixed(2)}%`,
    '--wh-length': `${String(length)}%`,
  } as CSSProperties;
  return (
    <div
      className={[
        'wh-bs',
        `wh-bs--${side}`,
        lit ? 'wh-bs--lit' : idle ? 'wh-bs--idle' : '',
        settings.rounded ? 'wh-bs--round' : '',
        settings.smooth ? 'wh-bs--smooth' : '',
      ].join(' ')}
      style={style}
    >
      <div className="wh-bs-line" />
    </div>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings, editMode } = useOverlay(overlay, renderHz);

  const onTrack = telemetry.car.isOnTrack;
  let sides = onTrack ? sidesOf(telemetry, settings) : { left: off, right: off };
  // In the layout editor both bars show, so the overlay can be placed.
  if (editMode) sides = { left: { kind: 'line', position: 0 }, right: { kind: 'line', position: 0.4 } };

  return (
    <Root theme={settings.theme} opacity={settings.opacity} fontSize={15} className="wh-blind">
      <Bar side="left" state={sides.left} settings={settings} idle={settings.alwaysShowBars} />
      <Bar side="right" state={sides.right} settings={settings} idle={settings.alwaysShowBars} />
    </Root>
  );
}
