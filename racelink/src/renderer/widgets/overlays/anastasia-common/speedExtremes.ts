// The slowest and the fastest speed a stream's pedal display shows: either the
// last corner's minimum and the last straight's maximum, or the last lap's.
// Pure; fed with one speed per telemetry frame.

export type ExtremesMode = 'corner' | 'lap';

export type SpeedSample = Readonly<{
  speedKph: number;
  /** The lap the car is on; `null` when unknown. */
  lap: number | null;
  /** Pit lane speeds are not corners: they are skipped. */
  inPit: boolean;
}>;

/**
 * - `corner`: a zigzag over the speed. A peak counts as the straight's top
 *   speed once the car has slowed by `swingKph` from it, a trough as the
 *   corner's minimum once the car has sped up by `swingKph` from it. The
 *   figures show the last confirmed ones, so they do not twitch with every lift.
 * - `lap`: the lowest and highest speed of the last completed lap (the running
 *   lap's until one is complete).
 */
export class SpeedExtremes {
  private readonly mode: ExtremesMode;
  private readonly swing: number;
  private minValue: number | null = null;
  private maxValue: number | null = null;

  // Zigzag state.
  private direction: 'up' | 'down' | null = null;
  private candidate = 0;
  private low = Number.POSITIVE_INFINITY;
  private high = Number.NEGATIVE_INFINITY;
  private lowSeen = false;
  private highSeen = false;
  private count = 0;

  // Lap state.
  private lap: number | null = null;
  private lapMin = Number.POSITIVE_INFINITY;
  private lapMax = Number.NEGATIVE_INFINITY;

  constructor(mode: ExtremesMode = 'corner', swingKph = 15) {
    this.mode = mode;
    this.swing = Math.max(1, swingKph);
  }

  reset(): void {
    this.minValue = null;
    this.maxValue = null;
    this.direction = null;
    this.candidate = 0;
    this.low = Number.POSITIVE_INFINITY;
    this.high = Number.NEGATIVE_INFINITY;
    this.lowSeen = false;
    this.highSeen = false;
    this.count = 0;
    this.lap = null;
    this.lapMin = Number.POSITIVE_INFINITY;
    this.lapMax = Number.NEGATIVE_INFINITY;
  }

  update(sample: SpeedSample): void {
    if (!Number.isFinite(sample.speedKph) || sample.speedKph < 0 || sample.inPit) return;
    if (this.mode === 'lap') this.updateLap(sample);
    else this.updateCorner(sample.speedKph);
  }

  private updateLap(sample: SpeedSample): void {
    const { speedKph, lap } = sample;
    if (this.lap !== null && lap !== null && lap < this.lap) this.reset();
    if (lap !== null && this.lap !== null && lap > this.lap) {
      // The lap is over: its extremes stay on show until the next one is over.
      if (Number.isFinite(this.lapMin)) {
        this.minValue = this.lapMin;
        this.maxValue = this.lapMax;
      }
      this.lapMin = Number.POSITIVE_INFINITY;
      this.lapMax = Number.NEGATIVE_INFINITY;
    }
    this.lap = lap ?? this.lap;
    this.lapMin = Math.min(this.lapMin, speedKph);
    this.lapMax = Math.max(this.lapMax, speedKph);
  }

  private updateCorner(speed: number): void {
    if (this.direction === null) {
      // The very first sample is where the data starts, not a corner or a straight.
      if (speed < this.low) {
        this.low = speed;
        this.lowSeen = this.count > 0;
      }
      if (speed > this.high) {
        this.high = speed;
        this.highSeen = this.count > 0;
      }
      this.count += 1;
      if (speed - this.low >= this.swing) {
        if (this.lowSeen) this.minValue = this.low;
        this.direction = 'up';
        this.candidate = speed;
      } else if (this.high - speed >= this.swing) {
        if (this.highSeen) this.maxValue = this.high;
        this.direction = 'down';
        this.candidate = speed;
      }
      return;
    }
    if (this.direction === 'up') {
      if (speed > this.candidate) this.candidate = speed;
      else if (this.candidate - speed >= this.swing) {
        this.maxValue = this.candidate;
        this.direction = 'down';
        this.candidate = speed;
      }
    } else if (speed < this.candidate) this.candidate = speed;
    else if (speed - this.candidate >= this.swing) {
      this.minValue = this.candidate;
      this.direction = 'up';
      this.candidate = speed;
    }
  }

  /**
   * What to show: the confirmed figures, or in `lap` mode before the first lap
   * is over the running lap's.
   */
  get shown(): Readonly<{ min: number | null; max: number | null }> {
    if (this.mode === 'lap' && this.minValue === null && Number.isFinite(this.lapMin))
      return { min: this.lapMin, max: this.lapMax };
    return { min: this.minValue, max: this.maxValue };
  }
}
