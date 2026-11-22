// Fuel arithmetic for a stream overlay: units, a trimmed average of clean laps,
// fuel to add with a safety margin, the "extra" figure in its three modes and
// the low-fuel state. Pure. The API's `timing.fuelCalculator` already has
// strategies per reference consumption; this module covers what it leaves out
// (a custom consumption, a safety margin, display units).
import type { FuelStrategyView } from './fuelTypes.ts';

export const litersPerUsGallon = 3.785411784;
export const litersPerImperialGallon = 4.54609;

export type FuelUnitKind = 'liters' | 'kilograms' | 'usGallons' | 'imperialGallons';

export type FuelUnit = Readonly<{
  kind: FuelUnitKind;
  symbol: string;
  /** Multiply litres by this to get the unit. */
  perLiter: number;
}>;

/**
 * The unit a car's fuel is shown in. The API always gives litres. `displayUnit`
 * is the car setup's unit (`fuel.displayUnit`), `imperial` the game's unit
 * system (`session.displayUnits`), `imperialGallons` for cars that use them.
 */
export const fuelUnit = (
  displayUnit: 'liters' | 'kilograms',
  imperial: boolean,
  kgPerLiter: number | null,
  imperialGallons = false,
): FuelUnit => {
  const density = kgPerLiter !== null && kgPerLiter > 0 ? kgPerLiter : 0.75;
  if (displayUnit === 'kilograms')
    return imperial
      ? { kind: 'kilograms', symbol: 'lb', perLiter: density * 2.20462262 }
      : { kind: 'kilograms', symbol: 'kg', perLiter: density };
  if (!imperial) return { kind: 'liters', symbol: 'L', perLiter: 1 };
  return imperialGallons
    ? { kind: 'imperialGallons', symbol: 'gal', perLiter: 1 / litersPerImperialGallon }
    : { kind: 'usGallons', symbol: 'gal', perLiter: 1 / litersPerUsGallon };
};

export const toUnit = (liters: number, unit: FuelUnit): number => liters * unit.perLiter;
export const fromUnit = (value: number, unit: FuelUnit): number => value / unit.perLiter;

/**
 * Average consumption of clean laps: with three or more laps the smallest and
 * the largest are dropped first, so a lap with a slow-down or a push does not
 * move it. Null without laps.
 */
export const trimmedAverage = (laps: readonly number[]): number | null => {
  const valid = laps.filter((lap) => Number.isFinite(lap) && lap > 0);
  if (valid.length === 0) return null;
  const sorted = [...valid].sort((a, b) => a - b);
  const kept = sorted.length >= 3 ? sorted.slice(1, -1) : sorted;
  return kept.reduce((sum, lap) => sum + lap, 0) / kept.length;
};

/** The last `count` clean laps (oldest first in, oldest first out). */
export const lastCleanLaps = (
  history: readonly Readonly<{ usedLiters: number; isClean: boolean }>[],
  count = 5,
): number[] => history.filter((lap) => lap.isClean).slice(-count).map((lap) => lap.usedLiters);

/** Laps the fuel in the tank lasts at `perLap`. */
export const lapsOfFuel = (levelLiters: number, perLap: number): number | null =>
  perLap > 0 ? levelLiters / perLap : null;

/**
 * Fuel to add, in litres, to reach the end of `lapsLeft` laps at `perLap`.
 * Zero when there is enough. `marginLaps` adds that many laps of fuel on top
 * and `capacityLiters`, when given, limits the result to the free space.
 */
export const refuelLiters = (
  levelLiters: number,
  perLap: number,
  lapsLeft: number,
  marginLaps = 0,
  capacityLiters: number | null = null,
): number => {
  if (!(perLap > 0) || !(lapsLeft > 0)) return 0;
  const need = (lapsLeft + Math.max(0, marginLaps)) * perLap - levelLiters;
  const add = Math.max(0, need);
  return capacityLiters === null ? add : Math.min(add, Math.max(0, capacityLiters - levelLiters));
};

/** How the "extra" number reads: spare fuel, fuel for one lap less, or one lap more. */
export type ExtraMode = 'spare' | 'lapLess' | 'lapMore';

/**
 * - `spare`: fuel left at the finish (never below zero), plus what is ordered
 *   in the pit unless the tank already lasts to within a small slack.
 * - `lapLess`: fuel to add minus one lap of fuel.
 * - `lapMore`: fuel to add plus one lap of fuel.
 */
export const extraFuel = (
  mode: ExtraMode,
  input: Readonly<{
    levelLiters: number;
    perLap: number;
    lapsLeft: number;
    /** Fuel ordered for the next stop, litres. */
    pitOrderLiters?: number;
    onPitRoad?: boolean;
  }>,
): number | null => {
  const { levelLiters, perLap, lapsLeft } = input;
  if (!(perLap > 0) || !(lapsLeft > 0)) return null;
  const toAdd = refuelLiters(levelLiters, perLap, lapsLeft);
  if (mode === 'lapLess') return toAdd - perLap;
  if (mode === 'lapMore') return toAdd + perLap;
  if (input.onPitRoad === true) return null;
  const spare = levelLiters - lapsLeft * perLap;
  // Already covered (or nearly: two litres of slack): the order is not counted.
  const order = spare >= -2 ? 0 : (input.pitOrderLiters ?? 0);
  return Math.max(0, spare + order);
};

/** 0 enough, 1 about two laps of fuel, 2 a lap or less. */
export type LowFuelState = 0 | 1 | 2;

export const lowFuelState = (levelLiters: number, perLap: number | null): LowFuelState => {
  if (perLap === null || !(perLap > 0)) return 0;
  const laps = levelLiters / perLap;
  if (laps <= 1) return 2;
  if (laps <= 2) return 1;
  return 0;
};

/**
 * A strategy for a consumption the player typed in (the API has none for it).
 * `lapsLeft` is the laps still to drive, null when the session length is unknown.
 */
export const customStrategy = (
  perLap: number,
  levelLiters: number,
  lapsLeft: number | null,
  capacityLiters: number | null,
): FuelStrategyView | null => {
  if (!(perLap > 0)) return null;
  const lapsRemaining = levelLiters / perLap;
  const toFinish = lapsLeft === null ? null : lapsLeft * perLap;
  return {
    perLapLiters: perLap,
    lapsRemaining,
    refuelLiters:
      lapsLeft === null ? null : refuelLiters(levelLiters, perLap, lapsLeft, 0, capacityLiters),
    litersToFinish: toFinish,
    litersAtFinish: toFinish === null ? null : levelLiters - toFinish,
    targetLaps: lapsLeft === null ? null : lapsRemaining - lapsLeft,
  };
};

/** A fuel amount as text in the given unit, one decimal below 100 and none above. */
export const formatFuel = (liters: number | null, unit: FuelUnit): string => {
  if (liters === null || !Number.isFinite(liters)) return '-';
  const value = toUnit(liters, unit);
  return Math.abs(value) < 100 ? value.toFixed(1) : value.toFixed(0);
};
