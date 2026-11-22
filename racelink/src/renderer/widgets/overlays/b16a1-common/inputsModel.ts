// Pure helpers of the b16a1 Input Telemetry overlay: the wheel angle and the
// rolling record of the pedals for the trace.

export type InputSample = Readonly<{
  /** Seconds on any steady clock. */
  at: number;
  throttle: number;
  brake: number;
  clutch: number;
  abs: boolean;
}>;

const clamp01 = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/**
 * The wheel as drawn, in degrees clockwise. The game's angle is positive to the
 * left; without it the ratio -1..1 (right positive) is spread over `lockDegrees`
 * from lock to lock.
 */
export const wheelDegrees = (
  angleRad: number | null,
  ratio: number,
  lockDegrees: number,
): number => {
  if (angleRad !== null && Number.isFinite(angleRad)) return (-angleRad * 180) / Math.PI;
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(1, Math.max(-1, ratio)) * (lockDegrees / 2);
};

/** Speed in the unit asked for, as a whole number. */
export const speedValue = (kph: number, unit: 'kph' | 'mph'): number =>
  Math.round(Math.max(0, kph) * (unit === 'mph' ? 0.621371 : 1));

/** Gear text: R, N or the number. */
export const gearText = (gear: number): string => (gear < 0 ? 'R' : gear === 0 ? 'N' : String(gear));

/** Keeps the last `seconds` of samples. */
export class InputHistory {
  private samples: InputSample[] = [];

  push(sample: InputSample, seconds: number): void {
    this.samples.push({
      ...sample,
      throttle: clamp01(sample.throttle),
      brake: clamp01(sample.brake),
      clutch: clamp01(sample.clutch),
    });
    const from = sample.at - seconds;
    let drop = 0;
    while (drop < this.samples.length - 1 && (this.samples[drop + 1]?.at ?? 0) <= from) drop += 1;
    if (drop > 0) this.samples = this.samples.slice(drop);
  }

  get all(): readonly InputSample[] {
    return this.samples;
  }
}

/** SVG path of one channel over the window ending at `now`; x runs 0..1000, y 0 (full) to 100 (zero). */
export const tracePath = (
  samples: readonly InputSample[],
  now: number,
  seconds: number,
  pick: (sample: InputSample) => number,
): string =>
  samples
    .map((sample, index) => {
      const x = Math.max(0, 1000 - ((now - sample.at) / seconds) * 1000);
      const y = 100 - pick(sample) * 100;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join('');

/** Path pieces of the brake line while the ABS works, to be drawn dotted over the brake. */
export const absPath = (
  samples: readonly InputSample[],
  now: number,
  seconds: number,
): string => {
  const parts: string[] = [];
  let open = false;
  for (const sample of samples) {
    const x = Math.max(0, 1000 - ((now - sample.at) / seconds) * 1000);
    const y = 100 - sample.brake * 100;
    if (sample.abs) {
      parts.push(`${open ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
      open = true;
    } else {
      open = false;
    }
  }
  return parts.join('');
};
