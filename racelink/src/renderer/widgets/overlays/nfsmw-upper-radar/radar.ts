// What the radar shows for the trouble ahead (`session.hazardAhead`), as the
// game does it: every pulse the bar goes dark for a frame and fills again
// from the dome outwards, always at the same speed, then stays full until the
// next pulse. Closer trouble pulses more often; far away the bar just stays
// full. No DOM here.

/** Light columns on each side of the dome. */
export const ledColumns = 12;
/** How far ahead Racelink looks for trouble (`session.hazardAhead`). */
export const rangeMeters = 1000;
/** The bar is dark this long at the start of a pulse (one frame of the game). */
export const darkMs = 17;
/** Then it fills from the dome outwards in this long (measured in the game: 6 frames). */
export const fillMs = 100;
/** Time between pulses at the trouble, at the near edge and at the far edge (ms). */
const touchingMs = 155;
const nearMs = 600;
const farMs = 1400;
/** Brightness of the side away from the trouble. */
export const farSideLevel = 0.35;

export type Direction = 'ahead' | 'left' | 'right';

export interface Hazard {
  readonly distanceMeters: number;
  readonly bearingDegrees: number | null;
  readonly direction: Direction | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Time between pulses (ms): often closer than `near`, less often closer than
 * `far`, both more often as the trouble nears; null beyond `far`: the bar
 * stays full without pulsing.
 */
export const pulsePeriodMs = (distanceMeters: number, near: number, far: number): number | null => {
  if (!Number.isFinite(distanceMeters)) return null;
  const farEdge = Math.max(1, far);
  const nearEdge = clamp(near, 0, farEdge);
  const distance = Math.max(0, distanceMeters);
  if (distance >= farEdge) return null;
  if (distance >= nearEdge) {
    const span = farEdge - nearEdge;
    const share = span > 0 ? (distance - nearEdge) / span : 0;
    return nearMs + (farMs - nearMs) * share;
  }
  const share = nearEdge > 0 ? distance / nearEdge : 0;
  return touchingMs + (nearMs - touchingMs) * share;
};

/** Columns lit `elapsed` ms into a pulse: dark, then filling at a steady speed, then full. */
export const litAt = (elapsedMs: number): number => {
  if (elapsedMs < darkMs) return 0;
  return clamp(Math.ceil(((elapsedMs - darkMs) / fillMs) * ledColumns), 0, ledColumns);
};

/** Brightness of the left and the right lights: the side of the trouble burns brighter. */
export const sideLevels = (direction: Direction | null): { left: number; right: number } => {
  if (direction === 'left') return { left: 1, right: farSideLevel };
  if (direction === 'right') return { left: farSideLevel, right: 1 };
  return { left: 1, right: 1 };
};

/**
 * The pulses: the time into the current one, kept across a period that
 * changes. `beep` is true on the frame a pulse starts.
 */
export class Pulser {
  /** Time into the current pulse; null while the bar stands full without pulsing. */
  private elapsed: number | null = null;

  advance(
    elapsedMs: number,
    periodMs: number | null,
  ): { readonly lit: number; readonly beep: boolean } {
    if (periodMs === null || !(periodMs > 0)) {
      // A steady bar; pulsing starts again at once, with a beep.
      this.elapsed = null;
      return { lit: ledColumns, beep: false };
    }
    const step = Number.isFinite(elapsedMs) ? clamp(elapsedMs, 0, 1000) : 0;
    let beep = false;
    if (this.elapsed === null) {
      this.elapsed = 0;
      beep = true;
    } else {
      this.elapsed += step;
      if (this.elapsed >= periodMs) {
        this.elapsed %= periodMs;
        beep = true;
      }
    }
    return { lit: litAt(this.elapsed), beep };
  }

  reset(): void {
    this.elapsed = null;
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
