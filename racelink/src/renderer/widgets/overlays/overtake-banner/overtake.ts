// Overtake Banner: detects that the driver passed a car on the track, queues
// the passes and times the banner. Pure code; the overlay only feeds it data.
// Positions in iRacing's standings change only at the start/finish line, so a
// pass is found from the cars' distance along the lap, not from the position.

/** One car as the detector sees it. */
export type CarSample = Readonly<{
  carIdx: number;
  /** Metres along the track to the driver; positive: the car is ahead. Null: unknown. */
  relMeters: number | null;
  /** On the track, not in the pits, not retired, a competitor. */
  eligible: boolean;
}>;

export type TrackerOptions = Readonly<{
  /** Alongside zone: inside it the side does not change (metres). */
  gateMeters: number;
  /** A pass counts only if the car was this close ahead (metres). */
  rangeMeters: number;
  /** A jump of this size between two samples is a lap wrap or a teleport, not a pass. */
  jumpMeters: number;
  /** The car must stay behind this far (metres) ... */
  confirmMeters: number;
  /** ... for this long (ms), so a pass and re-pass shows nothing. */
  confirmMs: number;
  /** The car must have been ahead this recently before the pass (ms). */
  aheadWithinMs: number;
  /** The same car is not shown again within this time (ms). */
  cooldownMs: number;
}>;

export const defaultTrackerOptions: TrackerOptions = {
  gateMeters: 3,
  rangeMeters: 90,
  jumpMeters: 120,
  confirmMeters: 7,
  confirmMs: 800,
  aheadWithinMs: 6000,
  cooldownMs: 20000,
};

type CarState = {
  rel: number;
  side: 'ahead' | 'behind' | 'none';
  aheadAt: number | null;
  aheadRel: number;
  pendingSince: number | null;
  shownAt: number | null;
};

/** Signed distance along the lap from `fromFraction` to `toFraction`, shortest way round. */
export const circularMeters = (
  fromFraction: number,
  toFraction: number,
  trackLengthMeters: number,
): number => {
  let d = toFraction - fromFraction;
  d -= Math.floor(d + 0.5);
  return d * trackLengthMeters;
};

export class OvertakeTracker {
  private readonly cars = new Map<number, CarState>();
  private options: TrackerOptions;

  constructor(options: Partial<TrackerOptions> = {}) {
    this.options = { ...defaultTrackerOptions, ...options };
  }

  setOptions(options: Partial<TrackerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  reset(): void {
    this.cars.clear();
  }

  /**
   * Feeds one frame; returns the cars passed for good in it.
   * `active` false (the driver is in the pits, a caution, the start) forgets everything.
   */
  update(nowMs: number, samples: readonly CarSample[], active: boolean): number[] {
    const o = this.options;
    if (!active) {
      this.cars.clear();
      return [];
    }
    const seen = new Set<number>();
    const passed: number[] = [];
    for (const sample of samples) {
      if (!sample.eligible || sample.relMeters === null || !Number.isFinite(sample.relMeters)) continue;
      seen.add(sample.carIdx);
      const rel = sample.relMeters;
      let st = this.cars.get(sample.carIdx);
      if (!st || Math.abs(rel - st.rel) > o.jumpMeters) {
        // A new car, or one that jumped (lap wrap, reset): no history.
        st = {
          rel,
          side: rel > o.gateMeters ? 'ahead' : rel < -o.gateMeters ? 'behind' : 'none',
          aheadAt: rel > o.gateMeters ? nowMs : null,
          aheadRel: rel,
          pendingSince: null,
          shownAt: st?.shownAt ?? null,
        };
        this.cars.set(sample.carIdx, st);
        continue;
      }
      const side = rel > o.gateMeters ? 'ahead' : rel < -o.gateMeters ? 'behind' : st.side;
      if (side === 'ahead') {
        st.aheadAt = nowMs;
        st.aheadRel = rel;
        st.pendingSince = null;
      } else if (
        side === 'behind' &&
        st.side === 'ahead' &&
        st.aheadAt !== null &&
        nowMs - st.aheadAt <= o.aheadWithinMs &&
        st.aheadRel <= o.rangeMeters
      ) {
        st.pendingSince = nowMs;
      }
      st.side = side;
      st.rel = rel;
      if (
        st.pendingSince !== null &&
        side === 'behind' &&
        rel < -o.confirmMeters &&
        nowMs - st.pendingSince >= o.confirmMs
      ) {
        st.pendingSince = null;
        if (st.shownAt === null || nowMs - st.shownAt >= o.cooldownMs) {
          st.shownAt = nowMs;
          passed.push(sample.carIdx);
        }
      }
    }
    // A car that went to the pits, retired or left: forget it, but keep the cooldown.
    for (const [idx, st] of this.cars) {
      if (seen.has(idx)) continue;
      if (st.shownAt === null) this.cars.delete(idx);
      else {
        st.side = 'none';
        st.aheadAt = null;
        st.pendingSince = null;
      }
    }
    return passed;
  }
}

// ---- Queue and timing of the banner ------------------------------------------------

export type Pass = Readonly<{ id: number; carIdx: number; at: number }>;

export type PresenterOptions = Readonly<{
  displayMs: number;
  inMs: number;
  outMs: number;
  gapMs: number;
  maxQueue: number;
  /** A queued pass older than this is dropped. */
  staleMs: number;
  /** With a queue waiting, a banner stays at least this long. */
  minDisplayMs: number;
}>;

export const defaultPresenterOptions: PresenterOptions = {
  displayMs: 4500,
  inMs: 450,
  outMs: 250,
  gapMs: 250,
  maxQueue: 3,
  staleMs: 12000,
  minDisplayMs: 2400,
};

export type BannerView = Readonly<{ pass: Pass; phase: 'in' | 'shown' | 'out' }>;

export class Presenter {
  private queue: Pass[] = [];
  private current: { pass: Pass; startedAt: number; shownMs: number } | null = null;
  private freeAt = 0;
  private nextId = 1;
  private options: PresenterOptions;

  constructor(options: Partial<PresenterOptions> = {}) {
    this.options = { ...defaultPresenterOptions, ...options };
  }

  setOptions(options: Partial<PresenterOptions>): void {
    this.options = { ...this.options, ...options };
    while (this.queue.length > this.options.maxQueue) this.queue.shift();
  }

  /** Adds a pass; a car already shown or waiting is not added twice. */
  push(carIdx: number, nowMs: number): void {
    if (this.current?.pass.carIdx === carIdx) return;
    if (this.queue.some((p) => p.carIdx === carIdx)) return;
    this.queue.push({ id: this.nextId++, carIdx, at: nowMs });
    while (this.queue.length > this.options.maxQueue) this.queue.shift();
  }

  clear(): void {
    this.queue = [];
    this.current = null;
  }

  get pending(): number {
    return this.queue.length;
  }

  /** What to draw at `nowMs`; call about ten times a second. */
  view(nowMs: number): BannerView | null {
    const o = this.options;
    if (this.current && nowMs >= this.current.startedAt + this.current.shownMs + o.outMs) {
      this.freeAt = nowMs + o.gapMs;
      this.current = null;
    }
    if (!this.current && nowMs >= this.freeAt) {
      this.queue = this.queue.filter((p) => nowMs - p.at <= o.staleMs);
      const pass = this.queue.shift();
      if (pass) {
        const shownMs = this.queue.length > 0 ? Math.min(o.displayMs, o.minDisplayMs) : o.displayMs;
        this.current = { pass, startedAt: nowMs, shownMs };
      }
    }
    const c = this.current;
    if (!c) return null;
    const age = nowMs - c.startedAt;
    const phase = age < o.inMs ? 'in' : age < c.shownMs ? 'shown' : 'out';
    return { pass: c.pass, phase };
  }
}

// ---- Car names -----------------------------------------------------------------------

const multiWordBrands = [
  'Aston Martin',
  'Alfa Romeo',
  'Mercedes-AMG',
  'Mercedes-Benz',
  'Rolls Royce',
  'Land Rover',
  'Super Formula',
];

/** "Ferrari 296 GT3" gives brand "Ferrari", model "296 GT3"; a one-word name has no brand. */
export const splitCarName = (carName: string): Readonly<{ brand: string; model: string }> => {
  const name = carName.trim().replace(/\s+/g, ' ');
  for (const brand of multiWordBrands) {
    if (name.toLowerCase().startsWith(`${brand.toLowerCase()} `)) {
      return { brand: name.slice(0, brand.length), model: name.slice(brand.length + 1) };
    }
  }
  const space = name.indexOf(' ');
  if (space <= 0) return { brand: '', model: name };
  return { brand: name.slice(0, space), model: name.slice(space + 1) };
};

// ---- Picture preloading --------------------------------------------------------------

/** Asks for pictures a few at a time, each once, so iRacing draws them before they are shown. */
export class Preloader {
  private readonly requested = new Set<string>();
  private readonly waiting: string[] = [];
  private running = 0;
  private readonly load: (url: string) => Promise<void>;
  private readonly concurrency: number;

  constructor(load: (url: string) => Promise<void>, concurrency = 2) {
    this.load = load;
    this.concurrency = concurrency;
  }

  request(urls: readonly (string | null)[]): void {
    for (const url of urls) {
      if (url === null || this.requested.has(url)) continue;
      this.requested.add(url);
      this.waiting.push(url);
    }
    this.pump();
  }

  private pump(): void {
    while (this.running < this.concurrency) {
      const url = this.waiting.shift();
      if (url === undefined) return;
      this.running += 1;
      void this.load(url)
        .catch(() => undefined)
        .then(() => {
          this.running -= 1;
          this.pump();
        });
    }
  }
}
