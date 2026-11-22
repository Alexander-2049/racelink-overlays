// Where a session is in its life, as the streamer overlays need it: what to show
// before the start, while racing, after the flag and once everything is over.
// Pure; built only on the Overlay API session and driver fields.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { SessionTelemetry } from '../../../../shared/overlay-api/fields/session';

/**
 * - `waiting`: no session data yet.
 * - `grid`: a race that has not started (get in car, warm-up, formation, start lights).
 * - `running`: green; every non-race session while it runs.
 * - `checkered`: the flag is out, cars are still finishing.
 * - `finished`: the flag is out and the session is over for the focused car.
 */
export type SessionPhase = 'waiting' | 'grid' | 'running' | 'checkered' | 'finished';

export type PhaseInput = Readonly<{
  session: Pick<
    SessionTelemetry,
    'type' | 'name' | 'flag' | 'flagDetail' | 'timeRemainingSeconds' | 'sessionTimeSeconds'
  > &
    Partial<Pick<SessionTelemetry, 'eventKey'>>;
  /** The focused (or player) car; its flag tells when it has finished. */
  reference?: Pick<DriverTelemetry, 'flag' | 'lapsCompleted'> | undefined;
  /** Largest `lapsCompleted` among competitors: the race has been run when it is above 0. */
  leaderLapsCompleted?: number;
}>;

const startFlags: ReadonlySet<string> = new Set(['startReady', 'startSet', 'startHidden']);

/**
 * Follows a session over time. The game does not publish a session state, so the
 * phase is latched from flags: a race is `grid` until the green (or a lap) is
 * seen, `checkered` after the flag and `finished` when the focused car has
 * taken it (or the clock has run out). A new session resets everything.
 */
export class SessionPhaseTracker {
  private identity = '';
  private lastTime = Number.NEGATIVE_INFINITY;
  private started = false;
  private checkered = false;
  private current: SessionPhase = 'waiting';

  get phase(): SessionPhase {
    return this.current;
  }

  /** True once the race start has been seen in this session. */
  get hasStarted(): boolean {
    return this.started;
  }

  reset(): void {
    this.identity = '';
    this.lastTime = Number.NEGATIVE_INFINITY;
    this.started = false;
    this.checkered = false;
    this.current = 'waiting';
  }

  update(input: PhaseInput): SessionPhase {
    const { session } = input;
    const identity = `${session.eventKey ?? ''}|${session.type}|${session.name}`;
    // A different session, or the clock jumping back (a restart), begins afresh.
    if (identity !== this.identity || session.sessionTimeSeconds + 1 < this.lastTime) {
      this.reset();
      this.identity = identity;
    }
    this.lastTime = session.sessionTimeSeconds;
    const flag = session.flagDetail ?? session.flag;
    const isRace = session.type === 'race';

    if (flag === 'checkered' || input.reference?.flag === 'checkered') this.checkered = true;
    if (!isRace) {
      this.started = true;
    } else if (flag === 'green' || flag === 'startGo' || (input.leaderLapsCompleted ?? 0) > 0) {
      this.started = true;
    } else if (flag !== null && startFlags.has(flag)) {
      this.started = false;
    }

    if (!this.started) this.current = 'grid';
    else if (!this.checkered) this.current = 'running';
    else {
      const over =
        input.reference?.flag === 'checkered' ||
        (session.timeRemainingSeconds !== null && session.timeRemainingSeconds <= 0);
      this.current = over ? 'finished' : 'checkered';
    }
    return this.current;
  }
}

/** Gaps in a race are to the leader on the road; otherwise they come from best laps. */
export const gapBasis = (
  type: SessionTelemetry['type'],
  phase: SessionPhase,
): 'race' | 'best-lap' =>
  type === 'race' && phase !== 'grid' && phase !== 'waiting' ? 'race' : 'best-lap';

/** Gained and lost places mean something once a race has started. */
export const showsPositionChange = (
  type: SessionTelemetry['type'],
  phase: SessionPhase,
): boolean =>
  type === 'race' && (phase === 'running' || phase === 'checkered' || phase === 'finished');

/** Pit indicators are for the race; they go quiet after the flag. */
export const showsPitIndicators = (type: SessionTelemetry['type'], phase: SessionPhase): boolean =>
  type === 'race' && phase === 'running';
