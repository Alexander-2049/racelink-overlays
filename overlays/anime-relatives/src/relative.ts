import type { DriverTelemetry, PublishedDriverTag, TelemetryTopics } from '@racelink/overlay';
import { carBrandOf } from '../../../racelink/src/renderer/widgets/overlays/r-common/driver/carBrands';
import { nationalityOfFlair } from '../../../racelink/src/renderer/widgets/overlays/r-common/driver/helpers';
import { formatDriverName } from '../../../racelink/src/renderer/widgets/overlays/r-common/driver/positions';
import { classOrOverallPlace } from '../../../racelink/src/renderer/widgets/overlays/model/liveOrder';

/** One line of the board: a car, or an empty slot that keeps the board's height. */
export type Row = Readonly<{
  key: number;
  carIdx: number | null;
  isReference: boolean;
  position: number | null;
  classColor: string;
  carNumber: string;
  brand: string | null;
  countryCode: string | null;
  name: string;
  tags: readonly PublishedDriverTag[];
  licence: Readonly<{ text: string; color: string }> | null;
  rating: number | null;
  ratingChange: number | null;
  inPit: boolean;
  outLap: boolean;
  lastLap: number | null;
  /** Seconds to the reference car; negative means ahead of it. */
  gap: number | null;
  /** The car is a lap or more ahead of the reference car (it laps you). */
  lapping: boolean;
  /** The car is a lap or more behind the reference car. */
  lapped: boolean;
  /** Close enough to the reference car, on the same lap, to fight for the place. */
  battle: boolean;
}>;

export type RowOptions = Readonly<{
  capacity: number;
  nameFormat: string;
  excludePit: boolean;
  battleGap: number;
}>;

/** Signed distance around the lap from `from` to `to`, in -0.5..0.5 of a lap. */
export const lapOffset = (from: DriverTelemetry, to: DriverTelemetry): number => {
  let offset = to.lapDistanceFraction - from.lapDistanceFraction;
  if (offset > 0.5) offset -= 1;
  if (offset < -0.5) offset += 1;
  return offset;
};

/** The car the board is centred on: the camera's car, else the player's. */
export const referenceOf = (telemetry: TelemetryTopics): DriverTelemetry | undefined => {
  const { drivers, session } = telemetry;
  return (
    drivers.find((driver) => driver.carIdx === session.focusedCarIdx) ??
    drivers.find((driver) => driver.isPlayer)
  );
};

/** On-track metres from the reference car to `driver`; positive means ahead. */
export const metersTo = (
  reference: DriverTelemetry,
  driver: DriverTelemetry,
  trackLength: number,
): number => driver.gaps.relativeMeters ?? lapOffset(reference, driver) * trackLength;

/**
 * Seconds from the reference car to `driver`, positive ahead. Games without
 * Racelink's relative timing get an estimate from the distance and speed.
 */
export const secondsTo = (
  reference: DriverTelemetry,
  driver: DriverTelemetry,
  trackLength: number,
): number => {
  if (driver.gaps.relativeSeconds !== null) return driver.gaps.relativeSeconds;
  const speed = Math.max(15, (reference.speedKph ?? 0) / 3.6);
  return metersTo(reference, driver, trackLength) / speed;
};

export const trackLengthOf = (telemetry: TelemetryTopics): number =>
  telemetry.session.trackLengthMeters ?? 4000;

const emptyRow = (key: number): Row => ({
  key: -1 - key,
  carIdx: null,
  isReference: false,
  position: null,
  classColor: 'transparent',
  carNumber: '',
  brand: null,
  countryCode: null,
  name: '',
  tags: [],
  licence: null,
  rating: null,
  ratingChange: null,
  inPit: false,
  outLap: false,
  lastLap: null,
  gap: null,
  lapping: false,
  lapped: false,
  battle: false,
});

const toRow = (
  driver: DriverTelemetry,
  reference: DriverTelemetry,
  isRace: boolean,
  trackLength: number,
  options: RowOptions,
): Row => {
  const isReference = driver.carIdx === reference.carIdx;
  const laps = driver.gaps.relativeLaps ?? 0;
  const gap = isReference ? 0 : -secondsTo(reference, driver, trackLength);
  const iracing = driver.ext.iracing;
  const brand = carBrandOf(driver.carId, driver.carName);
  const license = iracing?.license;
  return {
    key: driver.carIdx,
    carIdx: driver.carIdx,
    isReference,
    position: classOrOverallPlace(driver),
    classColor: driver.classColor,
    carNumber: driver.carNumber,
    brand: brand === 'n_a' ? null : brand,
    countryCode: nationalityOfFlair(iracing?.flairId ?? null)?.countryCode ?? null,
    name: formatDriverName(driver, options.nameFormat) || driver.name,
    tags: driver.tags,
    licence:
      license === undefined || license.className === ''
        ? null
        : {
            text: `${license.className} ${license.safetyRating === null ? '' : license.safetyRating.toFixed(2)}`.trim(),
            color: license.color ?? '#888888',
          },
    rating: iracing?.iRating ?? null,
    ratingChange: isRace ? (iracing?.iRatingChange ?? null) : null,
    inPit: driver.onPitRoad,
    outLap: driver.pit.isOnOutLap,
    lastLap: driver.lastLapSeconds,
    gap,
    lapping: isRace && !isReference && laps >= 1,
    lapped: isRace && !isReference && laps <= -1,
    battle:
      !isReference &&
      laps === 0 &&
      !driver.onPitRoad &&
      !reference.onPitRoad &&
      Math.abs(gap) < options.battleGap,
  };
};

/**
 * The cars around the reference car by track position: cars ahead above it,
 * cars behind below it, `capacity` rows in all.
 */
export const buildRows = (telemetry: TelemetryTopics, options: RowOptions): Row[] => {
  const reference = referenceOf(telemetry);
  if (reference === undefined) return [];
  const isRace = telemetry.session.type === 'race';
  const trackLength = trackLengthOf(telemetry);
  const others = telemetry.drivers.filter(
    (driver) =>
      driver.carIdx !== reference.carIdx &&
      !driver.isPaceCar &&
      !driver.isSpectator &&
      driver.trackSurface !== 'notInWorld' &&
      !(options.excludePit && driver.onPitRoad),
  );
  const slots = Math.max(0, options.capacity - 1);
  const linesAhead = Math.ceil(slots / 2);
  const linesBehind = Math.floor(slots / 2);
  const ahead = others
    .filter((driver) => lapOffset(reference, driver) > 0)
    .sort((a, b) => lapOffset(reference, a) - lapOffset(reference, b))
    .slice(0, linesAhead)
    .reverse();
  const behind = others
    .filter((driver) => lapOffset(reference, driver) <= 0)
    .sort((a, b) => lapOffset(reference, b) - lapOffset(reference, a))
    .slice(0, linesBehind);
  const row = (driver: DriverTelemetry) => toRow(driver, reference, isRace, trackLength, options);
  const rows: Row[] = [];
  for (let index = 0; index < linesAhead - ahead.length; index += 1) rows.push(emptyRow(index));
  rows.push(...ahead.map(row), row(reference), ...behind.map(row));
  for (let index = 0; index < linesBehind - behind.length; index += 1)
    rows.push(emptyRow(linesAhead + index));
  return rows;
};
