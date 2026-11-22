// The header and footer facts of a session as the Warhammer overlays print them:
// the session letter, the clock with its total, the lap counter, incidents.
// Pure; reads the Overlay API session fields only.
import type { SessionTelemetry } from '../../../../shared/overlay-api/fields/session';
import { formatDuration, formatTotalDuration } from './format.ts';

type SessionType = SessionTelemetry['type'];

/** The one-letter label of a session: P, Q, R, W (warm-up), T (testing), H (hot lap). */
export const sessionLetter = (type: SessionType): string => {
  switch (type) {
    case 'practice':
      return 'P';
    case 'qualify':
      return 'Q';
    case 'race':
      return 'R';
    case 'warmup':
      return 'W';
    case 'testing':
      return 'T';
    case 'hotlap':
      return 'H';
    case 'other':
      return '?';
  }
};

/** The word of a session for a footer line. */
export const sessionWord = (type: SessionType): string => {
  switch (type) {
    case 'practice':
      return 'Practice';
    case 'qualify':
      return 'Qualify';
    case 'race':
      return 'Race';
    case 'warmup':
      return 'Warm-up';
    case 'testing':
      return 'Test';
    case 'hotlap':
      return 'Hot lap';
    case 'other':
      return 'Session';
  }
};

/** A session length beyond a week is the game's "unlimited": nothing is shown for it. */
const week = 7 * 24 * 3600;

const sensible = (seconds: number | null): seconds is number =>
  seconds !== null && Number.isFinite(seconds) && seconds >= 0 && seconds < week;

export type ClockMode = 'remaining' | 'elapsed';

/**
 * The session clock: `9:01/4h` (time left over the session length). Time left
 * when the game has it and the mode asks for it, else the time elapsed; the
 * length is left out when unknown.
 */
export const sessionClockText = (
  session: Pick<
    SessionTelemetry,
    'timeRemainingSeconds' | 'sessionTimeSeconds' | 'sessionDurationSeconds'
  >,
  mode: ClockMode,
): string => {
  const useRemaining = mode === 'remaining' && sensible(session.timeRemainingSeconds);
  const shown = useRemaining ? session.timeRemainingSeconds : session.sessionTimeSeconds;
  const total = sensible(session.sessionDurationSeconds)
    ? formatTotalDuration(session.sessionDurationSeconds)
    : '';
  const left = formatDuration(shown);
  return total === '' ? left : `${left}/${total}`;
};

/**
 * The lap counter: `113/≈116.67` (the leader's lap over the estimated length),
 * `12/30` with a fixed number of laps, only the lap without a length.
 * `decimals` is for the estimate.
 */
export const lapCounterText = (
  currentLap: number | null,
  session: Pick<SessionTelemetry, 'lapsTotal' | 'estimatedTotalLaps'>,
  decimals: number,
): string => {
  if (currentLap === null || currentLap < 0) return '';
  const lap = String(currentLap);
  if (session.lapsTotal !== null && session.lapsTotal > 0 && session.lapsTotal < 100000)
    return `${lap}/${String(session.lapsTotal)}`;
  const estimate = session.estimatedTotalLaps;
  if (estimate !== null && Number.isFinite(estimate) && estimate > 0 && estimate < 100000)
    return `${lap}/≈${estimate.toFixed(Math.min(3, Math.max(0, decimals)))}`;
  return lap;
};

/** Incidents: `14`, or `14/17` when the session has a limit. */
export const incidentsText = (
  incidents: Readonly<{ count: number | null; limit: number | null }> | null | undefined,
): string => {
  if (incidents === null || incidents === undefined || incidents.count === null) return '';
  return incidents.limit !== null && incidents.limit > 0
    ? `${String(incidents.count)}/${String(incidents.limit)}`
    : String(incidents.count);
};

/** `quicker`: the car took time from you on that lap; `slower`: you took it from the car. */
export type HistoryTone = 'quicker' | 'slower' | 'level';

/** Below this many seconds a lap is level. */
const levelSeconds = 0.05;

/** A lap-by-lap difference (`gainHistory`: positive means the car was faster than you). */
export const historyTone = (difference: number): HistoryTone =>
  Math.abs(difference) < levelSeconds ? 'level' : difference > 0 ? 'quicker' : 'slower';

/** The difference as text: `0.4`, whole seconds from ten on. */
export const historyText = (difference: number): string => {
  const size = Math.abs(difference);
  return size >= 10 ? String(Math.round(size)) : (Math.floor(size * 10 + 1e-9) / 10).toFixed(1);
};
