// What the b16a1 Standings table draws, worked out from the Overlay API: the
// header of each class and the cells of each row. The rows themselves (which
// to show, gaps, places gained, pit state) come from streamer-common; this adds
// the lap count of a class, the time, the lap-time flags and the pit and gain
// history cells. Pure.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { SessionTelemetry } from '../../../../shared/overlay-api/fields/session';
import type { WeatherTelemetry } from '../../../../shared/overlay-api/fields/environment';
import {
  buildStandings,
  gainHistory,
  type SessionPhase,
  type StandingsGroupModel,
  type StandingsOptions,
  type StandingsRowModel,
} from '../streamer-common/index.ts';
import { classOrOverallPlace } from '../model/liveOrder.ts';
import { clockTime, durationShort, sessionLetter } from './format.ts';

/** The car the overlay is about: the one the camera follows, else the player's. */
export const referenceCarIdx = (drivers: readonly DriverTelemetry[]): number | null =>
  (drivers.find((driver) => driver.isFocused) ?? drivers.find((driver) => driver.isPlayer))
    ?.carIdx ?? null;

export type ClassHeader = Readonly<{
  /** `R`, `Q`, ...; only on the first class. */
  sessionLetter: string;
  className: string;
  color: string;
  /** Current lap of the class leader (race) or of the focused car; null when unknown. */
  lap: number | null;
  /** `25`, or `≈25.27` when estimated from the clock; empty when unknown. */
  lapsTotal: string;
  /** Time left, `10:53`, or the time elapsed when the session has no end. */
  time: string;
  /** Session length, `45m`; empty when there is none. */
  timeTotal: string;
  strengthOfField: number | null;
  driverCount: number;
  airC: number | null;
  trackC: number | null;
  humidity: number | null;
}>;

export type LapTimeCell = Readonly<{
  seconds: number | null;
  /** The time is this driver's best of the session. */
  personalBest: boolean;
  /** The time is the best of the class. */
  classBest: boolean;
  /** The class leader has run another lap since: the time is old. */
  stale: boolean;
}>;

export type PitCell =
  | Readonly<{ kind: 'in'; seconds: number | null }>
  | Readonly<{ kind: 'last'; lap: number; seconds: number | null }>
  | null;

/** A lap-time difference against the focused car: positive means the driver was faster. */
export type HistoryCell = Readonly<{ seconds: number | null }>;

export type StandingsRowView = Readonly<{
  base: StandingsRowModel;
  lapTime: LapTimeCell;
  pit: PitCell;
  /** `null` for the focused car itself, which has nothing to compare with. */
  history: readonly HistoryCell[] | null;
}>;

export type StandingsGroupView = Readonly<{
  header: ClassHeader;
  isFirst: boolean;
  isReferenceClass: boolean;
  rows: readonly StandingsRowView[];
  cutBelow: readonly boolean[];
}>;

export type StandingsViewInput = Readonly<{
  drivers: readonly DriverTelemetry[];
  session: SessionTelemetry;
  weather: Pick<WeatherTelemetry, 'airTemperatureC' | 'trackTemperatureC' | 'humidityFraction'>;
  phase: SessionPhase;
  options: StandingsOptions;
  lapTimeSource: 'last' | 'best';
  historyLimit: number;
}>;

const classOf = (drivers: readonly DriverTelemetry[], classId: number | null): DriverTelemetry[] =>
  drivers.filter(
    (driver) =>
      driver.classId === classId &&
      !driver.isPaceCar &&
      !driver.isSpectator &&
      classOrOverallPlace(driver) !== null,
  );

const leaderOf = (members: readonly DriverTelemetry[]): DriverTelemetry | undefined =>
  [...members].sort(
    (a, b) => (classOrOverallPlace(a) ?? 0) - (classOrOverallPlace(b) ?? 0),
  )[0];

/** The time a lap takes the leader: the average of his last laps, else his last or best lap. */
const referenceLap = (leader: DriverTelemetry): number | null =>
  leader.lapAverageSeconds.last5 ?? leader.lastLapSeconds ?? leader.bestLapSeconds;

/**
 * Laps of a class: the leader's lap now and the length of the race in laps. A
 * race with a lap limit shows the limit; a timed one shows an estimate from the
 * clock and the leader's pace (`≈25.27`).
 */
export const classLaps = (
  session: Pick<
    SessionTelemetry,
    'type' | 'lap' | 'lapsTotal' | 'timeRemainingSeconds' | 'estimatedTotalLaps'
  >,
  leader: DriverTelemetry | undefined,
  reference: DriverTelemetry | undefined,
  phase: SessionPhase,
): Readonly<{ lap: number | null; total: string }> => {
  if (leader === undefined) return { lap: null, total: '' };
  const isRace = session.type === 'race';
  const isReferenceClass = reference !== undefined && reference.classId === leader.classId;
  let lap: number | null;
  if (isRace) lap = phase === 'grid' || phase === 'waiting' ? 0 : leader.lapsCompleted + 1;
  else lap = isReferenceClass ? reference.lap : null;

  if (session.lapsTotal !== null && session.lapsTotal > 0) {
    return { lap, total: String(session.lapsTotal) };
  }
  if (!isRace) return { lap, total: '' };
  if (isReferenceClass && session.estimatedTotalLaps !== null)
    return { lap, total: `≈${session.estimatedTotalLaps.toFixed(2)}` };
  const pace = referenceLap(leader);
  const remaining = session.timeRemainingSeconds;
  if (pace === null || pace <= 0 || remaining === null || remaining < 0) return { lap, total: '' };
  return { lap, total: `≈${(leader.raceDistanceLaps + remaining / pace).toFixed(2)}` };
};

const lapTimeCell = (
  driver: DriverTelemetry,
  leaderLaps: number,
  source: 'last' | 'best',
  isRace: boolean,
): LapTimeCell => {
  const seconds = source === 'best' ? driver.bestLapSeconds : driver.lastLapSeconds;
  const personalBest =
    driver.bestLapSeconds !== null &&
    driver.lastLapSeconds !== null &&
    Math.abs(driver.bestLapSeconds - driver.lastLapSeconds) < 0.0005;
  return {
    seconds,
    personalBest: source === 'last' && personalBest,
    classBest: driver.hasClassBestLap && (source === 'best' || personalBest),
    stale: source === 'last' && isRace && driver.lapsCompleted < leaderLaps,
  };
};

const pitCell = (row: StandingsRowModel): PitCell => {
  const { driver, pit } = row;
  if (pit !== 'none') {
    return { kind: 'in', seconds: driver.pit.timeInPitSeconds };
  }
  if (driver.pit.lastStopLap !== null) {
    return { kind: 'last', lap: driver.pit.lastStopLap, seconds: driver.pit.lastStopSeconds };
  }
  return null;
};

/** The whole table: a header and the rows with their cells, for every class shown. */
export const buildStandingsView = (input: StandingsViewInput): StandingsGroupView[] => {
  const { drivers, session, weather, phase } = input;
  const referenceIdx = referenceCarIdx(drivers);
  const reference = drivers.find((driver) => driver.carIdx === referenceIdx);
  const groups: StandingsGroupModel[] = buildStandings({
    drivers,
    classes: session.classes,
    referenceCarIdx: referenceIdx,
    sessionType: session.type,
    phase,
    options: input.options,
  });
  const isRace = session.type === 'race';
  // Time left, or elapsed when the session has no end.
  const left = clockTime(session.timeRemainingSeconds);
  const time = left !== '' ? left : clockTime(session.sessionTimeSeconds);

  return groups.map((group, index): StandingsGroupView => {
    const members = classOf(drivers, group.classId);
    const leader = leaderOf(members);
    const leaderLaps = leader?.lapsCompleted ?? 0;
    const laps = classLaps(session, leader, reference, phase);
    const rows = group.rows.map(
      (row): StandingsRowView => ({
        base: row,
        lapTime: lapTimeCell(row.driver, leaderLaps, input.lapTimeSource, isRace),
        pit: pitCell(row),
        history: row.isReference
          ? null
          : gainHistory(row.driver, reference, input.historyLimit).map((seconds) => ({ seconds })),
      }),
    );
    return {
      header: {
        sessionLetter: sessionLetter(session.type),
        className: group.className,
        color: group.color,
        lap: laps.lap,
        lapsTotal: laps.total,
        time,
        timeTotal: durationShort(session.sessionDurationSeconds),
        strengthOfField: group.strengthOfField,
        driverCount: group.driverCount,
        airC: weather.airTemperatureC,
        trackC: weather.trackTemperatureC,
        humidity: weather.humidityFraction,
      },
      isFirst: index === 0,
      isReferenceClass: group.isReferenceClass,
      rows,
      cutBelow: group.rows.map((row) => row.cutBelow),
    };
  });
};
