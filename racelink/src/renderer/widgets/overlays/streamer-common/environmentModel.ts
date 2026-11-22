// Wind, track wetness and rain for a stream overlay. Pure; reads the Overlay API
// `weather` fields.
import type { WeatherTelemetry } from '../../../../shared/overlay-api/fields/environment';

export type WindView = Readonly<{
  /** Speed in the chosen unit, rounded. */
  speed: number;
  unit: 'km/h' | 'mph';
  /** Where the wind blows to, radians clockwise from the top of the screen. */
  arrowRad: number;
  /** 0 calm .. 1 at or above `strongKph`. Drives the colour. */
  strength: number;
}>;

const kphPerMps = 3.6;
const mphPerMps = 2.2369362920544;
const twoPi = Math.PI * 2;

const wrap = (angle: number): number => {
  const wrapped = angle % twoPi;
  return wrapped < 0 ? wrapped + twoPi : wrapped;
};

/**
 * The wind arrow. The API's direction is where the wind blows FROM in world
 * space, so the arrow points the opposite way: where it blows to. Give the
 * car's heading (radians, the same world frame) to see it relative to the car,
 * with the car's nose at the top; without it the top is north.
 * Null when speed or direction is unknown.
 */
export const windView = (
  weather: Pick<WeatherTelemetry, 'windSpeedMps' | 'windDirectionRad'>,
  options: Readonly<{ imperial: boolean; headingRad?: number | null; strongKph?: number }> = {
    imperial: false,
  },
): WindView | null => {
  const { windSpeedMps: speedMps, windDirectionRad: from } = weather;
  if (speedMps === null || from === null || !Number.isFinite(speedMps) || !Number.isFinite(from))
    return null;
  const heading = options.headingRad ?? 0;
  const kph = Math.max(0, speedMps) * kphPerMps;
  const strong = options.strongKph ?? 60;
  return {
    speed: Math.round(options.imperial ? Math.max(0, speedMps) * mphPerMps : kph),
    unit: options.imperial ? 'mph' : 'km/h',
    arrowRad: wrap(from + Math.PI - heading),
    strength: Math.min(1, kph / strong),
  };
};

/** Compass point (N, NE, ...) of a direction in radians clockwise from north. */
export const compassPoint = (radians: number): string => {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
  return points[Math.round(wrap(radians) / (twoPi / 8)) % 8] ?? 'N';
};

const wetnessLevels = [
  'dry',
  'mostlyDry',
  'veryLightlyWet',
  'lightlyWet',
  'moderatelyWet',
  'veryWet',
  'extremelyWet',
] as const;

/** Wetness as a level 0 (dry) to 6 (extremely wet); null when unknown. */
export const wetnessLevel = (wetness: WeatherTelemetry['trackWetness']): number | null =>
  wetness === null ? null : wetnessLevels.indexOf(wetness);

/** The track counts as wet from "lightly wet" up: the point where wet tyres come into play. */
export const isTrackWet = (wetness: WeatherTelemetry['trackWetness']): boolean => {
  const level = wetnessLevel(wetness);
  return level !== null && level >= 3;
};

/**
 * Smooths the rain reading and gives it a trend, so a gauge does not flicker.
 * Exponential smoothing; `trend` compares with the value `lookbackMs` ago.
 */
export class PrecipitationTracker {
  private smoothed: number | null = null;
  private readonly samples: { at: number; value: number }[] = [];

  private readonly lookbackMs: number;
  private readonly alpha: number;
  private readonly deadband: number;

  constructor(lookbackMs = 60_000, alpha = 0.2, deadband = 0.02) {
    this.lookbackMs = lookbackMs;
    this.alpha = alpha;
    this.deadband = deadband;
  }

  /** The smoothed intensity, 0..1; null before the first reading. */
  get value(): number | null {
    return this.smoothed;
  }

  update(fraction: number | null, nowMs: number): void {
    if (fraction === null || !Number.isFinite(fraction)) return;
    const clamped = Math.min(1, Math.max(0, fraction));
    this.smoothed =
      this.smoothed === null ? clamped : this.smoothed + this.alpha * (clamped - this.smoothed);
    this.samples.push({ at: nowMs, value: this.smoothed });
    while (this.samples.length > 1 && (this.samples[1]?.at ?? 0) <= nowMs - this.lookbackMs)
      this.samples.shift();
  }

  /** `rising`, `falling` or `steady` against the oldest sample within the lookback. */
  get trend(): 'rising' | 'falling' | 'steady' {
    const first = this.samples[0];
    if (first === undefined || this.smoothed === null) return 'steady';
    const change = this.smoothed - first.value;
    if (change > this.deadband) return 'rising';
    if (change < -this.deadband) return 'falling';
    return 'steady';
  }
}
