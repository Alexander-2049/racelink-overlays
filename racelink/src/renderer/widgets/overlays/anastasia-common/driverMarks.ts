// Small rules of the boards that need no host: which car they follow and how a
// last lap is marked. Pure.
import type { DriverTelemetry } from '@racelink/overlay';

/** The car the boards follow: the camera's car, else the player's. */
export const referenceCarIdx = (
  session: Readonly<{ focusedCarIdx: number | null; playerCarIdx: number | null }>,
): number | null => session.focusedCarIdx ?? session.playerCarIdx;

/** The class's best lap, from the session's class list. */
export const classBestLap = (
  classes: readonly Readonly<{ classId: number | null; bestLapSeconds: number | null }>[],
  classId: number | null,
): number | null => classes.find((entry) => entry.classId === classId)?.bestLapSeconds ?? null;

/** Own best lap, a class record or neither: how the last lap is marked. */
export type LapMark = 'class' | 'personal' | null;

export const lapMark = (
  driver: Pick<DriverTelemetry, 'lastLapSeconds' | 'bestLapSeconds'>,
  classBest: number | null,
): LapMark => {
  const { lastLapSeconds: last, bestLapSeconds: best } = driver;
  if (last === null || best === null || Math.abs(last - best) > 0.0005) return null;
  if (classBest !== null && Math.abs(last - classBest) <= 0.0005) return 'class';
  return 'personal';
};
