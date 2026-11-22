// Relatives for a stream: the cars round the focused car by track position,
// with empty rows to keep the height, and what marks each row (lapped, lapping,
// pit, the focused car). Pure; the time to each car is `gaps.relativeSeconds`
// from the Overlay API.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { SessionTelemetry } from '../../../../shared/overlay-api/fields/session';

export type RelativesOptions = Readonly<{
  /** Rows in all; the focused car sits in the middle. */
  rows: number;
  /** Leave cars in the pit lane out (the focused car is never left out). */
  excludePit: boolean;
  /** Hide other cars while the player is out alone in a lone qualifying. */
  loneQualify: boolean;
}>;

export const defaultRelativesOptions: RelativesOptions = {
  rows: 7,
  excludePit: false,
  loneQualify: true,
};

/** Signed distance round the lap from `from` to `to`, in -0.5..0.5 of a lap. */
export const lapOffset = (from: number, to: number): number => {
  const offset = to - from;
  if (offset > 0.5) return offset - 1;
  if (offset < -0.5) return offset + 1;
  return offset;
};

export type RelativeRow =
  | Readonly<{
      kind: 'car';
      driver: DriverTelemetry;
      isReference: boolean;
      /** Seconds to the focused car; positive means the car is ahead. Null when unknown. */
      seconds: number | null;
      /** The car is a lap or more ahead of the focused car (race only). */
      lapping: boolean;
      /** The car is a lap or more behind the focused car (race only). */
      lapped: boolean;
      inPit: boolean;
    }>
  | Readonly<{ kind: 'empty'; index: number }>;

export type RelativesInput = Readonly<{
  drivers: readonly DriverTelemetry[];
  referenceCarIdx: number | null;
  sessionType: SessionTelemetry['type'];
  /** The player is on track (for the lone-qualify rule). */
  playerOnTrack?: boolean;
  options?: RelativesOptions;
}>;

/** Whether a car takes part in the list at all. */
const isListed = (driver: DriverTelemetry): boolean =>
  !driver.isSpectator && !driver.isPaceCar && driver.trackSurface !== 'notInWorld';

/**
 * Rows from the car furthest ahead (top) to the furthest behind (bottom).
 * With `rows` = 7 there are three cars each side. Missing cars are `empty`
 * rows so the overlay never changes height. Empty when there is no focused car.
 */
export const buildRelatives = (input: RelativesInput): RelativeRow[] => {
  const options = input.options ?? defaultRelativesOptions;
  const total = Math.max(1, Math.floor(options.rows));
  const reference = input.drivers.find((driver) => driver.carIdx === input.referenceCarIdx);
  if (reference === undefined) return [];
  const aheadCount = Math.floor(total / 2);
  const behindCount = total - 1 - aheadCount;

  const alone =
    options.loneQualify && input.sessionType === 'qualify' && input.playerOnTrack === true;
  const others = alone
    ? []
    : input.drivers.filter(
        (driver) =>
          driver.carIdx !== reference.carIdx &&
          isListed(driver) &&
          !(options.excludePit && driver.onPitRoad),
      );
  const offsetOf = (driver: DriverTelemetry): number =>
    lapOffset(reference.lapDistanceFraction, driver.lapDistanceFraction);
  const ahead = others
    .filter((driver) => offsetOf(driver) > 0)
    .sort((a, b) => offsetOf(a) - offsetOf(b))
    .slice(0, aheadCount)
    .reverse();
  const behind = others
    .filter((driver) => offsetOf(driver) <= 0)
    .sort((a, b) => offsetOf(b) - offsetOf(a))
    .slice(0, behindCount);

  const isRace = input.sessionType === 'race';
  const car = (driver: DriverTelemetry, isReference: boolean): RelativeRow => {
    const laps = driver.gaps.relativeLaps ?? 0;
    return {
      kind: 'car',
      driver,
      isReference,
      seconds: isReference ? 0 : driver.gaps.relativeSeconds,
      lapping: isRace && !isReference && laps >= 1,
      lapped: isRace && !isReference && laps <= -1,
      inPit: driver.onPitRoad,
    };
  };
  const rows: RelativeRow[] = [];
  for (let index = 0; index < aheadCount - ahead.length; index += 1)
    rows.push({ kind: 'empty', index });
  rows.push(...ahead.map((driver) => car(driver, false)));
  rows.push(car(reference, true));
  rows.push(...behind.map((driver) => car(driver, false)));
  for (let index = 0; index < behindCount - behind.length; index += 1)
    rows.push({ kind: 'empty', index: aheadCount + 1 + index });
  return rows;
};
