// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  customStrategy,
  extraFuel,
  formatFuel,
  fuelUnit,
  lastCleanLaps,
  lowFuelState,
  refuelLiters,
  toUnit,
  trimmedAverage,
} from './fuelModel.ts';

const near = (actual: number | null, expected: number, eps = 1e-6): void => {
  assert.ok(actual !== null && Math.abs(actual - expected) < eps, `${String(actual)} != ${String(expected)}`);
};

test('units: litres, gallons, kilograms and pounds', () => {
  near(toUnit(10, fuelUnit('liters', false, null)), 10);
  near(toUnit(10, fuelUnit('liters', true, null)), 10 / 3.785411784);
  near(toUnit(10, fuelUnit('liters', true, null, true)), 10 / 4.54609);
  near(toUnit(10, fuelUnit('kilograms', false, 0.74)), 7.4);
  near(toUnit(10, fuelUnit('kilograms', true, 0.74)), 7.4 * 2.20462262);
  // Without a density the usual 0.75 is used.
  near(toUnit(10, fuelUnit('kilograms', false, null)), 7.5);
  assert.equal(fuelUnit('liters', true, null).symbol, 'gal');
});

test('the average drops the smallest and the largest lap when there are three or more', () => {
  assert.equal(trimmedAverage([]), null);
  near(trimmedAverage([2.0, 2.2]), 2.1);
  near(trimmedAverage([1.0, 2.0, 3.0]), 2.0);
  near(trimmedAverage([1.5, 2.0, 2.1, 2.2, 9.0]), 2.1);
  near(trimmedAverage([Number.NaN, 2, 0, -1]), 2);
});

test('clean laps are the last N clean ones', () => {
  const history = [
    { usedLiters: 2.0, isClean: true },
    { usedLiters: 9.0, isClean: false },
    { usedLiters: 2.1, isClean: true },
    { usedLiters: 2.2, isClean: true },
  ];
  assert.deepEqual(lastCleanLaps(history, 2), [2.1, 2.2]);
  assert.deepEqual(lastCleanLaps(history), [2.0, 2.1, 2.2]);
});

test('fuel to add: enough, short, with a margin, limited by the tank', () => {
  assert.equal(refuelLiters(30, 2, 10), 0);
  near(refuelLiters(10, 2, 10), 10);
  near(refuelLiters(10, 2, 10, 1), 12);
  near(refuelLiters(10, 2, 10, 1, 15), 5);
  assert.equal(refuelLiters(10, 0, 10), 0);
  assert.equal(refuelLiters(10, 2, 0), 0);
});

test('the extra number in its three modes', () => {
  const base = { levelLiters: 10, perLap: 2, lapsLeft: 10 };
  // Needs 20 L; has 10; to add 10.
  near(extraFuel('lapLess', base), 8);
  near(extraFuel('lapMore', base), 12);
  // Spare mode: nothing spare, so zero; with an order it counts.
  assert.equal(extraFuel('spare', base), 0);
  near(extraFuel('spare', { ...base, pitOrderLiters: 14 }), 4);
  // Enough fuel already: the order is not counted on top.
  near(extraFuel('spare', { levelLiters: 25, perLap: 2, lapsLeft: 10, pitOrderLiters: 14 }), 5);
  // Within two litres short counts as covered.
  assert.equal(extraFuel('spare', { levelLiters: 19, perLap: 2, lapsLeft: 10, pitOrderLiters: 14 }), 0);
  assert.equal(extraFuel('spare', { ...base, onPitRoad: true }), null);
  assert.equal(extraFuel('spare', { ...base, lapsLeft: 0 }), null);
});

test('low fuel state', () => {
  assert.equal(lowFuelState(10, 2), 0);
  assert.equal(lowFuelState(4, 2), 1);
  assert.equal(lowFuelState(1.5, 2), 2);
  assert.equal(lowFuelState(10, null), 0);
});

test('a custom consumption makes a strategy', () => {
  const strategy = customStrategy(2, 10, 8, 40);
  assert.ok(strategy);
  near(strategy.lapsRemaining, 5);
  near(strategy.refuelLiters, 6);
  near(strategy.litersAtFinish, -6);
  near(strategy.targetLaps, -3);
  assert.equal(customStrategy(0, 10, 8, 40), null);
  assert.equal(customStrategy(2, 10, null, 40)?.refuelLiters, null);
});

test('fuel text', () => {
  assert.equal(formatFuel(null, fuelUnit('liters', false, null)), '-');
  assert.equal(formatFuel(12.34, fuelUnit('liters', false, null)), '12.3');
  assert.equal(formatFuel(123.4, fuelUnit('liters', false, null)), '123');
});
