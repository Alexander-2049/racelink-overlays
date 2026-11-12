// What the radar shows for the trouble ahead (`session.hazardAhead`): how many
// lights burn, how fast they blink, where the arrow points. No DOM here.

/** Light columns on each side of the dome. */
export const ledColumns = 12;
/** How far ahead Racelink looks for trouble (`session.hazardAhead`). */
export const rangeMeters = 1000;
/** Blink period at the far edge of slow blinking, at the near edge, and at the trouble (ms). */
const slowestMs = 900;
const nearMs = 450;
const fastestMs = 150;
/** Share of a blink the lights burn. */
const onShare = 0.6;
/** Brightness of the side away from the trouble. */
export const farSideLevel = 0.35;

export type Direction = 'ahead' | 'left' | 'right';

export interface Hazard {
  readonly distanceMeters: number;
  readonly bearingDegrees: number | null;
  readonly direction: Direction | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Light columns that burn on each side: one far away, all of them close. */
export const litColumns = (distanceMeters: number): number => {
  if (!Number.isFinite(distanceMeters)) return 0;
  const share = 1 - clamp(distanceMeters, 0, rangeMeters) / rangeMeters;
  return clamp(Math.ceil(share * ledColumns), 1, ledColumns);
};

/**
 * How long one blink takes (ms): fast closer than `near`, slow closer than
 * `far`, both quicker as the trouble nears; null beyond `far`: the lights
 * glow without blinking.
 */
export const blinkPeriodMs = (distanceMeters: number, near: number, far: number): number | null => {
  if (!Number.isFinite(distanceMeters)) return null;
  const farEdge = Math.max(1, far);
  const nearEdge = clamp(near, 0, farEdge);
  const distance = Math.max(0, distanceMeters);
  if (distance >= farEdge) return null;
  if (distance >= nearEdge) {
    const span = farEdge - nearEdge;
    const share = span > 0 ? (distance - nearEdge) / span : 0;
    return nearMs + (slowestMs - nearMs) * share;
  }
  const share = nearEdge > 0 ? distance / nearEdge : 0;
  return fastestMs + (nearMs - fastestMs) * share;
};

/** Brightness of the left and the right lights: the side of the trouble burns brighter. */
export const sideLevels = (direction: Direction | null): { left: number; right: number } => {
  if (direction === 'left') return { left: 1, right: farSideLevel };
  if (direction === 'right') return { left: farSideLevel, right: 1 };
  return { left: 1, right: 1 };
};

/**
 * The blinking: a phase that runs at the current period, so a period that
 * changes does not jump. `beep` is true on the frame the lights come on.
 */
export class Blinker {
  private phase = 0;
  private wasOn = false;

  advance(
    elapsedMs: number,
    periodMs: number | null,
  ): { readonly on: boolean; readonly beep: boolean } {
    if (periodMs === null || !(periodMs > 0)) {
      // Steady glow; the next blinking starts with the lights on and a beep.
      this.phase = 0;
      this.wasOn = false;
      return { on: true, beep: false };
    }
    const step = Number.isFinite(elapsedMs) ? clamp(elapsedMs, 0, 1000) : 0;
    this.phase = (this.phase + step / periodMs) % 1;
    const on = this.phase < onShare;
    const beep = on && !this.wasOn;
    this.wasOn = on;
    return { on, beep };
  }

  reset(): void {
    this.phase = 0;
    this.wasOn = false;
  }
}

/** Moves `current` toward `target` with time constant `tauMs`. */
export const approach = (
  current: number,
  target: number,
  elapsedMs: number,
  tauMs: number,
): number => {
  if (!Number.isFinite(current)) return target;
  const share = 1 - Math.exp(-Math.max(0, elapsedMs) / Math.max(1, tauMs));
  return current + (target - current) * share;
};

/** `approach` for an angle in degrees, the short way round. */
export const approachAngle = (
  current: number,
  target: number,
  elapsedMs: number,
  tauMs: number,
): number => {
  if (!Number.isFinite(current)) return target;
  const difference = ((((target - current) % 360) + 540) % 360) - 180;
  return approach(current, current + difference, elapsedMs, tauMs);
};
