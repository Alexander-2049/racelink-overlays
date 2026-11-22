import type { DriverTelemetry, TelemetryTopics } from '@racelink/overlay';
import { circularMeters, type CarSample } from '../../../racelink/src/renderer/widgets/overlays/overtake-banner/overtake';
import type { Settings } from './racelink-settings';

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A picture Racelink serves on this computer; anything else is not shown. */
export const localPicture = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('http://127.0.0.1:') ? value : null;

/** The URL of the car iRacing draws for a driver. */
export const carPictureOf = (driver: DriverTelemetry): string | null => {
  const iracing: unknown = driver.ext.iracing;
  const render = isRecord(iracing) && isRecord(iracing.render) ? iracing.render : {};
  return localPicture(render.carUrl);
};

const holdingFlags = new Set(['caution', 'cautionWaving', 'red', 'startReady', 'startSet', 'startGo']);

export type Frame = Readonly<{ active: boolean; samples: CarSample[] }>;

/** What the detector needs from one telemetry frame. */
export const frameOf = (telemetry: TelemetryTopics, settings: Settings): Frame => {
  const { drivers, session } = telemetry;
  const subject =
    drivers.find((d) => (settings.driver === 'focused' ? d.isFocused : d.isPlayer)) ??
    drivers.find((d) => d.isPlayer);
  if (!subject) return { active: false, samples: [] };
  const flag = session.flag;
  const active =
    subject.trackSurface === 'onTrack' &&
    !subject.onPitRoad &&
    (settings.sessions === 'all' || session.type === 'race') &&
    !(settings.ignoreCaution && flag !== null && holdingFlags.has(flag));
  if (!active) return { active: false, samples: [] };
  const length = session.trackLengthMeters ?? 4000;
  const samples = drivers
    .filter((d) => d.carIdx !== subject.carIdx)
    .map((d): CarSample => {
      const rel = circularMeters(subject.lapDistanceFraction, d.lapDistanceFraction, length);
      // Laps between the two in race distance, beyond the gap on the track.
      const lapsApart = Math.round(subject.raceDistanceLaps - d.raceDistanceLaps - rel / length);
      const eligible =
        !d.isSpectator &&
        !d.isPaceCar &&
        !d.isOut &&
        !d.onPitRoad &&
        d.trackSurface === 'onTrack' &&
        (settings.otherClasses || d.classId === subject.classId) &&
        (settings.lapped || session.type !== 'race' || lapsApart === 0);
      return { carIdx: d.carIdx, relMeters: rel, eligible };
    });
  return { active: true, samples };
};
