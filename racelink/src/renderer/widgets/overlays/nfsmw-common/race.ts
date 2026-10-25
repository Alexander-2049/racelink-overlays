import type { TelemetryTopics } from '../../../../shared/overlay-api/telemetry';

export type Driver = TelemetryTopics['drivers'][number];

/** The car the camera follows, else the player's. */
export const followedDriver = (drivers: readonly Driver[]): Driver | null =>
  drivers.find((driver) => driver.isFocused) ?? drivers.find((driver) => driver.isPlayer) ?? null;

/** Cars that race: no spectators, no pace car. */
export const competitors = (drivers: readonly Driver[]): Driver[] =>
  drivers.filter((driver) => !driver.isSpectator && !driver.isPaceCar);

/** A time as the game shows it: 1:13.41. */
export const formatTime = (seconds: number): string => {
  const hundredths = Math.max(0, Math.round(seconds * 100));
  const minutes = Math.floor(hundredths / 6000);
  const rest = hundredths - minutes * 6000;
  const whole = Math.floor(rest / 100);
  return `${String(minutes)}:${String(whole).padStart(2, '0')}.${String(rest % 100).padStart(2, '0')}`;
};

/** A gap in seconds: 3.49 below a minute, 1:02.30 above. */
export const formatGap = (seconds: number): string => {
  const value = Math.abs(seconds);
  return value < 60 ? value.toFixed(2) : formatTime(value);
};

const usable = (seconds: number | null | undefined): seconds is number =>
  typeof seconds === 'number' && Number.isFinite(seconds) && seconds > 0;

/**
 * How long a car has been running in the session: its completed laps and the
 * lap it is on. Laps the game no longer lists are counted at their average.
 */
export class RaceClock {
  /** Per car: completed laps when last seen, and the session time of its last line crossing. */
  private readonly cars = new Map<number, { laps: number; crossedAt: number | null }>();

  public update(drivers: readonly Driver[], sessionTime: number): void {
    for (const driver of drivers) {
      const seen = this.cars.get(driver.carIdx);
      if (!seen || driver.lapsCompleted < seen.laps)
        this.cars.set(driver.carIdx, { laps: driver.lapsCompleted, crossedAt: null });
      else if (driver.lapsCompleted > seen.laps)
        this.cars.set(driver.carIdx, { laps: driver.lapsCompleted, crossedAt: sessionTime });
    }
  }

  /** Seconds since the car started its first lap; `currentLap` is the game's own lap timer when known. */
  public elapsed(driver: Driver, sessionTime: number, currentLap: number | null): number {
    const history = driver.lapHistorySeconds.filter(usable);
    const typical =
      history.length > 0
        ? history.reduce((sum, lap) => sum + lap, 0) / history.length
        : usable(driver.lastLapSeconds)
          ? driver.lastLapSeconds
          : usable(driver.bestLapSeconds)
            ? driver.bestLapSeconds
            : 0;
    const laps = Math.max(0, driver.lapsCompleted);
    const listed = history.slice(-laps);
    const completed =
      listed.reduce((sum, lap) => sum + lap, 0) + Math.max(0, laps - listed.length) * typical;
    const crossedAt = this.cars.get(driver.carIdx)?.crossedAt ?? null;
    const current =
      currentLap !== null && currentLap >= 0
        ? currentLap
        : crossedAt !== null
          ? Math.max(0, sessionTime - crossedAt)
          : driver.lapDistanceFraction * typical;
    return completed + current;
  }
}
