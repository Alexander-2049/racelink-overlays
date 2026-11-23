// Standings for a stream: which rows to show (the top plus a window around the
// focused car, other classes trimmed), what a gap cell holds in each phase,
// gained and lost places, the pit indicator and the lap-by-lap gain history.
// Pure. It reads the Overlay API driver fields only; the gaps themselves come
// from the API (`drivers[].gaps`), this module decides how they are shown.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { SessionTelemetry } from '../../../../shared/overlay-api/fields/session';
import {
  gapBasis,
  showsPitIndicators,
  showsPositionChange,
  type SessionPhase,
} from './sessionPhase.ts';
import { limitStandingsRows } from './trimRows.ts';
import {
  classOrOverallPlace,
  liveClassChange,
  type LiveFields,
} from '../model/liveOrder.ts';

export type StandingsOptions = Readonly<{
  /** Rows always shown from the top of the focused class. */
  topRows: number;
  /** Rows shown below the top: a window around the focused car. */
  bottomRows: number;
  /** Classes shown, the focused car's class first. */
  numClasses: number;
  /** Rows of each other class. */
  multiclassRows: number;
  /** Mark the start and end of each unbroken run of rows. */
  condensed: boolean;
  /** Most rows the window has room for; fewer rows are dropped by priority. */
  maxRows?: number;
}>;

export const defaultStandingsOptions: StandingsOptions = {
  topRows: 5,
  bottomRows: 9,
  numClasses: 3,
  multiclassRows: 3,
  condensed: true,
};

const whole = (value: number): number => Math.max(0, Math.floor(value));

/**
 * The rows of one class to show, as an inclusive range of zero-based indexes.
 * `referenceAt` is the focused car's index in the class, or -1 for another class.
 * Returns `null` when the class has nothing to show.
 */
export const visibleRange = (
  count: number,
  referenceAt: number,
  options: StandingsOptions,
): readonly [number, number] | null => {
  if (count <= 0) return null;
  const top = whole(options.topRows);
  const bottom = whole(options.bottomRows);
  const total = top + bottom;
  if (referenceAt < 0) {
    const rows = Math.min(count, whole(options.multiclassRows));
    return rows === 0 ? null : [0, rows - 1];
  }
  if (count <= total) return [0, count - 1];
  const below = Math.ceil(bottom / 2);
  const above = Math.floor(bottom / 2);
  if (referenceAt + below - 1 < total) return [0, total - 1];
  if (referenceAt < top) return [0, top - 1];
  if (referenceAt + above >= count) return [count - bottom, count - 1];
  return [referenceAt - above, referenceAt + below - 1];
};

/** `0` a lone row, `1` first of a run, `-1` last of a run, `null` inside it. */
export type GroupPlacement = 0 | 1 | -1 | null;

/** What a gap or interval cell holds. */
export type GapCell =
  | Readonly<{ kind: 'leader' }>
  | Readonly<{ kind: 'seconds'; seconds: number }>
  | Readonly<{ kind: 'laps'; laps: number }>
  | Readonly<{ kind: 'none' }>;

const none: GapCell = { kind: 'none' };

/**
 * A gap cell. The leader shows "leader"; whole laps behind show as laps;
 * seconds only when they are positive; before a race starts the cell is empty
 * (nobody has run yet, the gaps would be to the grid).
 */
export const gapCell = (
  isClassLeader: boolean,
  seconds: number | null,
  laps: number | null,
  phase: SessionPhase,
  sessionType: SessionTelemetry['type'],
): GapCell => {
  if (sessionType === 'race' && gapBasis(sessionType, phase) === 'best-lap') return none;
  if (isClassLeader) return { kind: 'leader' };
  if (laps !== null && laps > 0) return { kind: 'laps', laps };
  if (seconds !== null && seconds > 0 && Number.isFinite(seconds)) return { kind: 'seconds', seconds };
  return none;
};

/** Pit state of a car: nothing, in the pit lane, stopped in its box, or being towed there. */
export type PitIndicator = 'none' | 'lane' | 'box' | 'towing';

export const pitIndicator = (
  driver: Pick<DriverTelemetry, 'onPitRoad' | 'trackSurface'>,
  sessionType: SessionTelemetry['type'],
  phase: SessionPhase,
): PitIndicator => {
  if (!showsPitIndicators(sessionType, phase)) return 'none';
  if (driver.trackSurface === 'pitStall') return driver.onPitRoad ? 'box' : 'towing';
  return driver.onPitRoad ? 'lane' : 'none';
};

/**
 * Places gained (positive) or lost since the start, in the class. Null outside
 * a started race or when the grid place is unknown.
 */
export const positionChange = (
  driver: Pick<DriverTelemetry, 'startClassPosition' | 'classPosition'> & LiveFields,
  sessionType: SessionTelemetry['type'],
  phase: SessionPhase,
): number | null => {
  if (!showsPositionChange(sessionType, phase)) return null;
  // The live change (Overlay API 2.21) goes first; older apps do not send it.
  const live = liveClassChange(driver);
  if (live !== null) return live;
  const place = driver.live?.classPosition ?? driver.classPosition;
  if (driver.startClassPosition === null || place === null) return null;
  return driver.startClassPosition - place;
};

/**
 * Lap-by-lap time against the focused car for the last `limit` laps, newest
 * last: positive means the driver was faster on that lap. Laps one of them has
 * no time for are `null`.
 */
export const gainHistory = (
  driver: Pick<DriverTelemetry, 'lapHistorySeconds'>,
  reference: Pick<DriverTelemetry, 'lapHistorySeconds'> | undefined,
  limit: number,
): (number | null)[] => {
  const count = whole(limit);
  const out: (number | null)[] = [];
  if (reference === undefined) return out;
  for (let step = count - 1; step >= 0; step -= 1) {
    const own = driver.lapHistorySeconds[driver.lapHistorySeconds.length - 1 - step];
    const theirs = reference.lapHistorySeconds[reference.lapHistorySeconds.length - 1 - step];
    out.push(own === undefined || theirs === undefined ? null : theirs - own);
  }
  return out;
};

export type StandingsRowModel = Readonly<{
  driver: DriverTelemetry;
  /** Position in the class. */
  position: number;
  isReference: boolean;
  gap: GapCell;
  interval: GapCell;
  positionChange: number | null;
  pit: PitIndicator;
  groupPlacement: GroupPlacement;
  /** Rows were left out between this one and the next. */
  cutBelow: boolean;
}>;

export type StandingsGroupModel = Readonly<{
  classId: number | null;
  className: string;
  color: string;
  strengthOfField: number | null;
  /** Competitors with a position in the class. */
  driverCount: number;
  isReferenceClass: boolean;
  rows: readonly StandingsRowModel[];
}>;

export type StandingsInput = Readonly<{
  drivers: readonly DriverTelemetry[];
  classes: SessionTelemetry['classes'];
  referenceCarIdx: number | null;
  sessionType: SessionTelemetry['type'];
  phase: SessionPhase;
  options?: StandingsOptions;
}>;

const classPosition = (driver: DriverTelemetry): number | null => classOrOverallPlace(driver);

/** Class groups with their rows, the focused car's class first. */
export const buildStandings = (input: StandingsInput): StandingsGroupModel[] => {
  const options = input.options ?? defaultStandingsOptions;
  const competitors = input.drivers.filter(
    (driver) => !driver.isPaceCar && !driver.isSpectator && classPosition(driver) !== null,
  );
  const reference = competitors.find((driver) => driver.carIdx === input.referenceCarIdx);

  const byClass = new Map<number | null, DriverTelemetry[]>();
  for (const driver of competitors) {
    const list = byClass.get(driver.classId) ?? [];
    list.push(driver);
    byClass.set(driver.classId, list);
  }
  const ordered = [...byClass.entries()]
    .map(([classId, drivers]) => ({
      classId,
      drivers: drivers.sort((a, b) => (classPosition(a) ?? 0) - (classPosition(b) ?? 0)),
    }))
    // Classes in the order their leaders run overall.
    .sort(
      (a, b) =>
        (a.drivers[0]?.position ?? Number.MAX_SAFE_INTEGER) -
        (b.drivers[0]?.position ?? Number.MAX_SAFE_INTEGER),
    );
  const referenceClass = reference?.classId;
  const referenceFirst =
    reference === undefined
      ? ordered
      : [
          ...ordered.filter((entry) => entry.classId === referenceClass),
          ...ordered.filter((entry) => entry.classId !== referenceClass),
        ];

  const groups = referenceFirst.slice(0, Math.max(1, whole(options.numClasses))).flatMap((entry) => {
    const isReferenceClass = reference !== undefined && entry.classId === referenceClass;
    const referenceAt = isReferenceClass
      ? entry.drivers.findIndex((driver) => driver.carIdx === reference.carIdx)
      : -1;
    const range = visibleRange(entry.drivers.length, referenceAt, options);
    if (range === null) return [];
    const shown = entry.drivers.slice(range[0], range[1] + 1);
    const leader = entry.drivers[0];
    const rows = shown.map((driver, at): StandingsRowModel => {
      const isLeader = (classPosition(driver) ?? 0) === (classPosition(leader ?? driver) ?? 0);
      const placement: GroupPlacement = !options.condensed
        ? null
        : shown.length === 1
          ? 0
          : at === 0
            ? 1
            : at === shown.length - 1
              ? -1
              : null;
      return {
        driver,
        position: classPosition(driver) ?? 0,
        isReference: driver.carIdx === input.referenceCarIdx,
        gap: gapCell(
          isLeader,
          driver.gaps.toClassLeaderSeconds,
          driver.gaps.toClassLeaderLaps,
          input.phase,
          input.sessionType,
        ),
        interval: gapCell(
          isLeader,
          driver.gaps.toAheadSeconds,
          driver.gaps.toAheadLaps,
          input.phase,
          input.sessionType,
        ),
        positionChange: positionChange(driver, input.sessionType, input.phase),
        pit: pitIndicator(driver, input.sessionType, input.phase),
        groupPlacement: placement,
        cutBelow: false,
      };
    });
    // A run ends where the next shown row is not the next place.
    const marked = rows.map((row, at) => {
      const next = rows[at + 1];
      return next !== undefined && next.position !== row.position + 1
        ? { ...row, cutBelow: true }
        : row;
    });
    const info = input.classes.find((candidate) => candidate.classId === entry.classId);
    return [
      {
        classId: entry.classId,
        className: info?.name ?? leader?.className ?? '',
        color: info?.color ?? leader?.classColor ?? '#ffffff',
        strengthOfField: info?.strengthOfField ?? null,
        driverCount: entry.drivers.length,
        isReferenceClass,
        rows: marked,
      },
    ];
  });
  return options.maxRows === undefined ? groups : limitStandingsRows(groups, options.maxRows);
};

/**
 * Projected iRating change for a finishing order, for series with this rating
 * (used when the API does not publish `iRatingChange`, e.g. a custom order).
 * `ratings` are in finishing order; the result has the same order.
 * Needs at least two drivers; otherwise all zeros.
 */
export const projectedRatingChanges = (ratings: readonly number[]): number[] => {
  const count = ratings.length;
  if (count < 2) return ratings.map(() => 0);
  const scale = 1600 / Math.LN2;
  const weights = ratings.map((rating) => Math.exp(-rating / scale));
  return weights.map((own, index) => {
    let expected = -0.5;
    for (const other of weights) {
      const numerator = (1 - own) * other;
      expected += numerator / ((1 - other) * own + numerator);
    }
    const fudge = (count / 2 - (index + 1)) / 100;
    return Math.round((200 * (count - (index + 1) - expected - fudge)) / count);
  });
};

/** Strength of field from ratings: 1600/ln2 * ln(N / sum 2^(-r/1600)). Null when empty. */
export const strengthOfField = (ratings: readonly number[]): number | null => {
  if (ratings.length === 0) return null;
  const total = ratings.reduce((sum, rating) => sum + Math.pow(2, -rating / 1600), 0);
  return Math.round((1600 / Math.LN2) * Math.log(ratings.length / total));
};
