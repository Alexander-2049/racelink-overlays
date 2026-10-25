/** Prediction never runs further ahead than this past the latest sample. */
const maxAheadMs = 250;
/** A larger jump between two samples is a reset or a teleport, not motion. */
const maxStepPerSample = 0.05;
/** How quickly the estimated speed follows new samples. */
const rateFollow = 0.5;

const wrap = (value: number): number => ((value % 1) + 1) % 1;

type CarTrack = Readonly<{ progress: number; at: number; rate: number }>;

/**
 * Moves cars along the lap between driver samples. Positions arrive about ten
 * times a second and unevenly; a marker that only chases the latest sample
 * speeds up after each one and slows down before the next. Predicting from
 * the estimated speed gives a target that moves continuously.
 *
 * Times are on the performance.now() clock: `at` is when a sample was taken.
 */
export class ProgressPredictor {
  private readonly cars = new Map<number, CarTrack>();

  public sample(carId: number, progress: number, at: number): void {
    const previous = this.cars.get(carId);
    if (previous && at <= previous.at) return;
    let rate = 0;
    if (previous) {
      let step = progress - previous.progress;
      if (step < -0.5) step += 1;
      if (step > 0.5) step -= 1;
      const elapsed = at - previous.at;
      // Moving forward by a plausible amount: follow the speed; otherwise stop predicting.
      if (step >= 0 && step < maxStepPerSample && elapsed < 1_000) {
        const measured = step / elapsed;
        rate =
          previous.rate === 0 ? measured : previous.rate + (measured - previous.rate) * rateFollow;
      }
    }
    this.cars.set(carId, { progress: wrap(progress), at, rate });
  }

  /** Expected lap progress at `now`, or null for a car without samples. */
  public predict(carId: number, now: number): number | null {
    const car = this.cars.get(carId);
    if (!car) return null;
    const ahead = Math.min(Math.max(now - car.at, 0), maxAheadMs);
    return wrap(car.progress + car.rate * ahead);
  }

  /** Forgets cars that are no longer reported. */
  public retain(carIds: ReadonlySet<number>): void {
    for (const carId of this.cars.keys()) if (!carIds.has(carId)) this.cars.delete(carId);
  }
}
