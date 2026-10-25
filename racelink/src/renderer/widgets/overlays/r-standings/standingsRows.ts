import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { RPosition } from '../r-common/driver/model';
import { toPosition, type PositionData } from '../r-common/driver/positions';

export type Gap = Readonly<{ gapValue: number | null; gapMetric: 'seconds' | 'laps' }>;

/** A driver as the standings show it: the main row plus the side columns. */
export type StandingsRow = Readonly<{
  position: RPosition;
  /** Gap to the class leader. */
  gap: Gap | null;
  /** Gap to the car ahead in the class. */
  interval: Gap | null;
  positionsChanged: number | null;
  /** Seconds to the reference car; negative for cars ahead. */
  relativeSeconds: number | null;
  /** The list jumps over cars after this row. */
  slicedBottom: boolean;
}>;

export type ClassGroup = Readonly<{
  classId: number;
  shortName: string;
  color: string;
  sof: number | null;
  numberOfDrivers: number;
  currentLap: number | null;
  estimatedTotalLaps: number | null;
  estimatedTotalLapsCalculated: boolean;
  isReferenceClass: boolean;
  rows: readonly StandingsRow[];
}>;

type Options = Readonly<{
  multiClass: boolean;
  topDrivers: number;
  linesAhead: number;
  linesBehind: number;
  minimumDrivers: number;
  driversInOtherClasses: number;
}>;

const gapOf = (seconds: number | null, laps: number | null): Gap | null => {
  if (laps !== null && laps > 0) return { gapValue: laps, gapMetric: 'laps' };
  return seconds === null ? null : { gapValue: seconds, gapMetric: 'seconds' };
};

/** Indexes to show for a class: leaders, the reference car's neighbours, padded to `minimum`. */
const visibleIndexes = (count: number, referenceAt: number, options: Options): number[] => {
  const shown = new Set<number>();
  for (let index = 0; index < Math.min(options.topDrivers, count); index += 1) shown.add(index);
  if (referenceAt >= 0) {
    for (
      let index = Math.max(0, referenceAt - options.linesAhead);
      index <= Math.min(count - 1, referenceAt + options.linesBehind);
      index += 1
    ) {
      shown.add(index);
    }
  }
  // Fill up to the minimum, first behind the last shown row, then above the first one.
  let probe = Math.max(...shown, -1) + 1;
  while (shown.size < Math.min(options.minimumDrivers, count) && probe < count) {
    shown.add(probe);
    probe += 1;
  }
  probe = Math.min(...shown, count) - 1;
  while (shown.size < Math.min(options.minimumDrivers, count) && probe >= 0) {
    shown.add(probe);
    probe -= 1;
  }
  return [...shown].sort((a, b) => a - b);
};

const positionOf = (driver: DriverTelemetry): number =>
  driver.classPosition ?? driver.position ?? Number.MAX_SAFE_INTEGER;

/** The class groups the Standings overlay lists, in class order. */
export const standingsGroups = (
  data: PositionData,
  options: Options,
  estimatedTotalLaps: number | null,
): ClassGroup[] => {
  const { competitors, reference, context } = data;
  const classes = new Map<number, DriverTelemetry[]>();
  for (const driver of competitors) {
    if (driver.position === null && driver.classPosition === null) continue;
    const key = driver.classId ?? 0;
    classes.set(key, [...(classes.get(key) ?? []), driver]);
  }
  const referenceClass = reference?.classId ?? 0;
  const groups: ClassGroup[] = [];
  const ordered = [...classes.entries()]
    .map(([classId, drivers]) => ({
      classId,
      drivers: drivers.sort((a, b) => positionOf(a) - positionOf(b)),
    }))
    .sort((a, b) => (a.drivers[0]?.position ?? 0) - (b.drivers[0]?.position ?? 0));
  for (const { classId, drivers } of ordered) {
    const isReferenceClass = classId === referenceClass;
    if (!isReferenceClass && !options.multiClass) continue;
    const referenceAt = drivers.findIndex((driver) => driver.carIdx === reference?.carIdx);
    const indexes = isReferenceClass
      ? visibleIndexes(drivers.length, referenceAt, options)
      : visibleIndexes(drivers.length, -1, {
          ...options,
          topDrivers: options.driversInOtherClasses,
          minimumDrivers: 0,
        });
    const rows: StandingsRow[] = indexes.map((index, at) => {
      const driver = drivers[index];
      if (driver === undefined) throw new Error('unreachable: index comes from the class list');
      const next = indexes[at + 1];
      const changed =
        context.isRace && driver.startClassPosition !== null && driver.classPosition !== null
          ? driver.startClassPosition - driver.classPosition
          : null;
      return {
        position: toPosition(driver, context),
        gap: gapOf(driver.gaps.toClassLeaderSeconds, driver.gaps.toClassLeaderLaps),
        interval: gapOf(driver.gaps.toAheadSeconds, driver.gaps.toAheadLaps),
        positionsChanged: changed,
        relativeSeconds: driver.gaps.relativeSeconds === null ? null : -driver.gaps.relativeSeconds,
        slicedBottom: next !== undefined && next !== index + 1,
      };
    });
    const leader = drivers[0];
    groups.push({
      classId,
      shortName: leader?.className ?? '',
      color: leader?.classColor ?? '#ffffff',
      sof: data.classes.find((entry) => (entry.classId ?? 0) === classId)?.strengthOfField ?? null,
      numberOfDrivers: drivers.length,
      currentLap: leader?.lap ?? null,
      estimatedTotalLaps,
      estimatedTotalLapsCalculated: estimatedTotalLaps !== null,
      isReferenceClass,
      rows,
    });
  }
  return groups;
};
