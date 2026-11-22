import type { CSSProperties } from 'react';
import type { RacelinkOverlay, TelemetryTopics } from '@racelink/overlay';
import { lineLayout } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/blindSpotLayout.ts';
import { referenceCarIdx } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/driverMarks.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import {
  alongsidePosition,
  offsetMetersFromFractions,
  spotterView,
  type SpotterView,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common';
import type { Settings } from './racelink-settings';

const renderHz = 20;

type Side = Readonly<{ cars: number; position: number }>;

/** A sample for placing the overlay: a car on the left, drifting along the bar. */
const sample = (seconds: number): readonly [Side, Side] => [
  { cars: 1, position: Math.sin(seconds * 0.9) },
  { cars: 0, position: 0 },
];

/** Metres ahead (positive) of the watched car for each car near it, nearest first. */
const nearbyOffsets = (telemetry: TelemetryTopics, reach: number): number[] => {
  const { drivers, session } = telemetry;
  const refIdx = referenceCarIdx(session);
  const reference = drivers.find((driver) => driver.carIdx === refIdx);
  const length = session.trackLengthMeters;
  if (reference === undefined || length === null || length <= 0) return [];
  return drivers
    .filter(
      (driver) =>
        driver.carIdx !== reference.carIdx &&
        !driver.isPaceCar &&
        !driver.isSpectator &&
        !driver.onPitRoad &&
        driver.trackSurface !== 'notInWorld',
    )
    .map((driver) => offsetMetersFromFractions(reference.lapDistanceFraction, driver.lapDistanceFraction, length))
    .filter((offset) => Math.abs(offset) <= reach)
    .sort((a, b) => Math.abs(a) - Math.abs(b));
};

/** What is alongside on each side, from the game's spotter or, without one, the radar. */
const readSides = (
  overlay: RacelinkOverlay<Settings>,
  telemetry: TelemetryTopics,
  settings: Settings,
): readonly [Side, Side] => {
  const ahead = settings.distAhead;
  const behind = settings.distBehind;
  if (overlay.supports('car.spotter')) {
    const view: SpotterView = spotterView(telemetry.car.spotter);
    if (!view.active) return [{ cars: 0, position: 0 }, { cars: 0, position: 0 }];
    const offsets = nearbyOffsets(telemetry, Math.max(ahead, behind) * 2);
    // iRacing does not say which side a car is on: the nearest car goes to the
    // left, the next to the right when cars are on both sides.
    const leftOffset = offsets[0];
    const rightOffset = view.left > 0 ? offsets[1] : offsets[0];
    const at = (offset: number | undefined): number =>
      offset === undefined ? 0 : alongsidePosition(offset, ahead, behind);
    return [
      { cars: view.left, position: at(leftOffset) },
      { cars: view.right, position: at(rightOffset ?? leftOffset) },
    ];
  }
  const radar = telemetry.radar;
  if (radar === null) return [{ cars: 0, position: 0 }, { cars: 0, position: 0 }];
  const reach = radar.vehicleLengthMeters;
  const near = Math.max(0.5, radar.vehicleWidthMeters / 2);
  const side = (left: boolean): Side => {
    const cars = radar.cars
      .filter(
        (car) =>
          Math.abs(car.yMeters) <= reach &&
          Math.abs(car.xMeters) >= near &&
          Math.abs(car.xMeters) <= 3.5 &&
          car.xMeters < 0 === left,
      )
      .sort((a, b) => Math.abs(a.yMeters) - Math.abs(b.yMeters));
    const nearest = cars[0];
    return {
      cars: Math.min(2, cars.length),
      position: nearest === undefined ? 0 : alongsidePosition(nearest.yMeters, ahead, behind),
    };
  };
  return [side(true), side(false)];
};

const colorOf = (settings: Settings): string => {
  if (settings.colorMode === 'CUSTOM') return settings.customColor;
  return settings.colorMode === 'THEME' ? 'var(--an-accent)' : '#ffb624';
};

function Bar({ side, settings, edge }: Readonly<{ side: Side; settings: Settings; edge: 'left' | 'right' }>) {
  const layout = lineLayout(side.cars, side.position, settings.lineLength, settings.moving);
  const barWidth = settings.showTrack ? Math.max(settings.trackWidth, settings.lineWidth) : settings.lineWidth;
  const style = { [edge]: `${String(settings.edgeInset)}px`, width: `${String(barWidth)}px` } as CSSProperties;
  return (
    <div className="bs-bar" style={style}>
      {settings.showTrack && (
        <div
          className="bs-track"
          style={{ width: `${String(settings.trackWidth)}px`, opacity: settings.trackOpacity, borderRadius: settings.roundEnds ? '999px' : 0 }}
        />
      )}
      {layout !== null && (
        <div
          className={`bs-line ${settings.smooth ? 'smooth' : ''}`}
          style={{
            top: `${String(layout.topPercent)}%`,
            height: `${String(layout.heightPercent)}%`,
            width: `${String(settings.lineWidth)}px`,
            background: colorOf(settings),
            opacity: settings.lineOpacity,
            borderRadius: settings.roundEnds ? '999px' : 0,
          }}
        />
      )}
    </div>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings, status } = useOverlay(overlay, renderHz);
  const real = readSides(overlay, telemetry, settings);
  const hidden = settings.onlyOnTrack && !telemetry.car.isOnTrack && status !== 'demo';
  const idle = real[0].cars + real[1].cars === 0;
  const showSample = idle && (settings.preview || status === 'demo');
  const [left, right] = showSample ? sample(performance.now() / 1000) : hidden ? ([{ cars: 0, position: 0 }, { cars: 0, position: 0 }] as const) : real;
  return (
    <div className="an bs-root" data-theme={settings.theme}>
      <Bar side={left} settings={settings} edge="left" />
      <Bar side={right} settings={settings} edge="right" />
    </div>
  );
}
