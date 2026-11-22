// Blind-spot indicator state. Pure. iRacing publishes `car.spotter` (which side
// has a car alongside); Le Mans Ultimate also has `radar` with the cars' offsets.
import type { SpotterState } from '../../../../shared/overlay-api/fields/car';
import type { RadarTelemetry } from '../../../../shared/overlay-api/fields/environment';

export type SpotterView = Readonly<{
  /** Cars alongside on the left, 0..2. */
  left: number;
  /** Cars alongside on the right, 0..2. */
  right: number;
  /** Something is alongside: draw the indicator. */
  active: boolean;
}>;

export const spotterView = (state: SpotterState): SpotterView => {
  const left = state === 'left' || state === 'both' ? 1 : state === 'twoLeft' ? 2 : 0;
  const right = state === 'right' || state === 'both' ? 1 : state === 'twoRight' ? 2 : 0;
  return { left, right, active: left + right > 0 };
};

type RadarCar = NonNullable<RadarTelemetry>['cars'][number];

/**
 * The same view from radar cars (no `car.spotter` in the game): a car is
 * alongside when it is within a car length ahead or behind, and to one side
 * between half a car width and `maxSideMeters`.
 */
export const spotterFromRadar = (
  radar: RadarTelemetry,
  maxSideMeters = 3.5,
): SpotterView => {
  if (radar === null) return { left: 0, right: 0, active: false };
  const reach = radar.vehicleLengthMeters;
  const near = Math.max(0.5, radar.vehicleWidthMeters / 2);
  let left = 0;
  let right = 0;
  for (const car of radar.cars as readonly RadarCar[]) {
    if (Math.abs(car.yMeters) > reach) continue;
    const side = Math.abs(car.xMeters);
    if (side < near || side > maxSideMeters) continue;
    if (car.xMeters < 0) left += 1;
    else right += 1;
  }
  return { left: Math.min(2, left), right: Math.min(2, right), active: left + right > 0 };
};

/**
 * Where the line sits between the player's car and the one alongside:
 * -1 (the other car is `behindMeters` behind) to 1 (`aheadMeters` ahead), 0 level.
 */
export const alongsidePosition = (
  offsetMeters: number,
  aheadMeters: number,
  behindMeters: number,
): number => {
  if (offsetMeters >= 0) return aheadMeters > 0 ? Math.min(1, offsetMeters / aheadMeters) : 1;
  return behindMeters > 0 ? Math.max(-1, offsetMeters / behindMeters) : -1;
};

/**
 * The same offset from lap fractions, wrapping the start line: how far ahead
 * (positive) the other car is, in metres, on a track of `trackLengthMeters`.
 */
export const offsetMetersFromFractions = (
  ownFraction: number,
  otherFraction: number,
  trackLengthMeters: number,
): number => {
  let diff = otherFraction - ownFraction;
  if (diff > 0.5) diff -= 1;
  else if (diff < -0.5) diff += 1;
  return diff * trackLengthMeters;
};
