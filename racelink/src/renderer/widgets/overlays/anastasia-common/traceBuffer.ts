// A rolling history of samples for a trace graph. Pure.

export type TraceSample = Readonly<{
  /** Milliseconds on any steady clock (the page's `performance.now()`). */
  t: number;
  throttle: number;
  brake: number;
  clutch: number;
  steering: number;
}>;

/**
 * Keeps the samples of the last `windowMs`. Samples closer than `minGapMs` to
 * the newest one are dropped, so a fast feed does not grow the history; a
 * sample older than the newest one is ignored.
 */
export class TraceBuffer {
  private items: TraceSample[] = [];
  private readonly windowMs: number;
  private readonly minGapMs: number;

  constructor(windowMs: number, minGapMs = 8) {
    this.windowMs = Math.max(100, windowMs);
    this.minGapMs = Math.max(0, minGapMs);
  }

  get samples(): readonly TraceSample[] {
    return this.items;
  }

  push(sample: TraceSample): void {
    const last = this.items[this.items.length - 1];
    if (last !== undefined && sample.t - last.t < this.minGapMs) return;
    this.items.push(sample);
    this.prune(sample.t);
  }

  /** Drops samples older than the window as seen from `now`. */
  prune(now: number): void {
    const from = now - this.windowMs;
    let cut = 0;
    // Keep one sample before the window so the line reaches the left edge.
    while (cut + 1 < this.items.length && (this.items[cut + 1]?.t ?? 0) < from) cut += 1;
    if (cut > 0) this.items = this.items.slice(cut);
  }

  clear(): void {
    this.items = [];
  }
}
