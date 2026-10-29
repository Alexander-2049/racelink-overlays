import type { DriverTelemetry, TelemetryTopics } from '@racelink/overlay';
import type { FxKind } from './phrases';
import { metersTo, referenceOf, secondsTo, trackLengthOf } from './relative';

/** Something worth an explosion. */
export type FxEvent = Readonly<{
  id: number;
  kind: FxKind;
  /** The other car of an overtake or battle. */
  carIdx: number | null;
  /** Lapped traffic: a smaller bang, and the mascot stays calm. */
  minor: boolean;
}>;

export type DetectOptions = Readonly<{
  raceOnly: boolean;
  battleGap: number;
}>;

/** A car closer than this counts as alongside: it keeps the side it was on. */
const alongsideMeters = 3;
/** A swap of sides further away than this is a jump (pit exit, tow, lap wrap), not a pass. */
const passWindowMeters = 40;
/** The same car makes no new event this soon, so cars side by side do not flicker. */
const repeatMs = 3500;
/** A battle is announced after this long close together, then not again for a while. */
const battleAfterMs = 2000;
const battleRepeatMs = 25000;

let nextId = 1;
export const fxEvent = (kind: FxKind, carIdx: number | null, minor = false): FxEvent => ({
  id: nextId++,
  kind,
  carIdx,
  minor,
});

/**
 * Turns telemetry frames into overtakes, battles, best laps and the finish of
 * the reference car. Keeps per-car history; one per overlay.
 */
export class FxDetector {
  private referenceIdx: number | null = null;
  private readonly side = new Map<number, 1 | -1>();
  private readonly lastEventAt = new Map<number, number>();
  private readonly closeSince = new Map<number, number>();
  private readonly battleAt = new Map<number, number>();
  private bestLap: number | null = null;
  private checkered = false;

  /** The reference car took the chequered flag: the party lasts until the session changes. */
  get finished(): boolean {
    return this.checkered;
  }

  private reset(referenceIdx: number | null): void {
    this.referenceIdx = referenceIdx;
    this.side.clear();
    this.lastEventAt.clear();
    this.closeSince.clear();
    this.battleAt.clear();
    this.bestLap = null;
    this.checkered = false;
  }

  update(telemetry: TelemetryTopics, options: DetectOptions, now: number): FxEvent[] {
    const reference = referenceOf(telemetry);
    if (reference === undefined) {
      if (this.referenceIdx !== null) this.reset(null);
      return [];
    }
    if (reference.carIdx !== this.referenceIdx) this.reset(reference.carIdx);
    const events: FxEvent[] = [];
    const isRace = telemetry.session.type === 'race';
    const active = isRace || !options.raceOnly;
    const trackLength = trackLengthOf(telemetry);

    for (const driver of telemetry.drivers) {
      if (driver.carIdx === reference.carIdx || driver.isPaceCar || driver.isSpectator) continue;
      const event = this.overtake(reference, driver, trackLength, now);
      if (event !== null && active) events.push(event);
      const battle = this.battle(reference, driver, trackLength, options.battleGap, now);
      if (battle !== null && active) events.push(battle);
    }

    const best = reference.bestLapSeconds;
    if (best !== null) {
      if (this.bestLap !== null && best < this.bestLap - 0.0005 && active)
        events.push(fxEvent('best', null));
      this.bestLap = best;
    }

    const checkered = isRace && reference.flag === 'checkered';
    if (checkered && !this.checkered) events.push(fxEvent('finish', null));
    this.checkered = checkered || (this.checkered && isRace);
    return events;
  }

  private overtake(
    reference: DriverTelemetry,
    driver: DriverTelemetry,
    trackLength: number,
    now: number,
  ): FxEvent | null {
    const present = driver.trackSurface !== 'notInWorld' && !driver.isOut;
    const meters = metersTo(reference, driver, trackLength);
    const previous = this.side.get(driver.carIdx);
    const side: 1 | -1 | undefined =
      meters > alongsideMeters ? 1 : meters < -alongsideMeters ? -1 : previous;
    if (!present || side === undefined) {
      this.side.delete(driver.carIdx);
      return null;
    }
    this.side.set(driver.carIdx, side);
    if (previous === undefined || previous === side) return null;
    if (Math.abs(meters) > passWindowMeters) return null;
    if (driver.onPitRoad || reference.onPitRoad) return null;
    if (now - (this.lastEventAt.get(driver.carIdx) ?? -Infinity) < repeatMs) return null;
    this.lastEventAt.set(driver.carIdx, now);
    const laps = driver.gaps.relativeLaps ?? 0;
    // Ahead before and behind now: the reference car went past it.
    return previous === 1
      ? fxEvent('pass', driver.carIdx, laps <= -1)
      : fxEvent('passed', driver.carIdx, laps >= 1);
  }

  private battle(
    reference: DriverTelemetry,
    driver: DriverTelemetry,
    trackLength: number,
    battleGap: number,
    now: number,
  ): FxEvent | null {
    const close =
      (driver.gaps.relativeLaps ?? 0) === 0 &&
      !driver.onPitRoad &&
      !reference.onPitRoad &&
      driver.trackSurface === 'onTrack' &&
      Math.abs(secondsTo(reference, driver, trackLength)) < battleGap;
    if (!close) {
      this.closeSince.delete(driver.carIdx);
      return null;
    }
    const since = this.closeSince.get(driver.carIdx) ?? now;
    this.closeSince.set(driver.carIdx, since);
    if (now - since < battleAfterMs) return null;
    if (now - (this.battleAt.get(driver.carIdx) ?? -Infinity) < battleRepeatMs) return null;
    this.battleAt.set(driver.carIdx, now);
    return fxEvent('battle', driver.carIdx);
  }
}
