// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tablesOf } from './assetTables.ts';
import { absPath, gearText, InputHistory, speedValue, tracePath, wheelDegrees } from './inputsModel.ts';

test('the wheel follows the game angle, else the ratio over the lock', () => {
  // The game's angle is positive to the left; the drawing turns clockwise.
  assert.equal(Math.round(wheelDegrees(Math.PI / 2, 0, 540)), -90);
  assert.equal(wheelDegrees(null, 1, 540), 270);
  assert.equal(wheelDegrees(null, -2, 540), -270);
  assert.equal(wheelDegrees(null, Number.NaN, 540), 0);
});

test('speed and gear text', () => {
  assert.equal(speedValue(248.4, 'kph'), 248);
  assert.equal(speedValue(100, 'mph'), 62);
  assert.equal(speedValue(-5, 'kph'), 0);
  assert.equal(gearText(-1), 'R');
  assert.equal(gearText(0), 'N');
  assert.equal(gearText(5), '5');
});

test('the history keeps the window and clamps pedals', () => {
  const history = new InputHistory();
  for (let at = 0; at <= 20; at += 1)
    history.push({ at, throttle: 2, brake: -1, clutch: Number.NaN, abs: false }, 10);
  const all = history.all;
  assert.ok(all.length <= 12 && all.length >= 10);
  assert.equal(all[0]?.throttle, 1);
  assert.equal(all[0]?.brake, 0);
  assert.equal(all[0]?.clutch, 0);
});

test('trace paths: x by age, y inverted, the ABS only where it worked', () => {
  const samples = [
    { at: 0, throttle: 0, brake: 1, clutch: 0, abs: true },
    { at: 5, throttle: 1, brake: 0.5, clutch: 0, abs: true },
    { at: 8, throttle: 1, brake: 0.2, clutch: 0, abs: false },
    { at: 10, throttle: 1, brake: 0.8, clutch: 0, abs: true },
  ];
  assert.equal(
    tracePath(samples, 10, 10, (s) => s.throttle),
    'M0.0 100.0L500.0 0.0L800.0 0.0L1000.0 0.0',
  );
  assert.equal(absPath(samples, 10, 10), 'M0.0 0.0L500.0 50.0M1000.0 20.0');
  assert.equal(tracePath([], 10, 10, (s) => s.brake), '');
});

test('asset tables are read defensively', () => {
  const tables = tablesOf({
    carLogos: { iracingCars: { '3': 'pontiac', '4': 7 } },
    flags: { iracingFlairs: { '16': 'au' } },
  });
  assert.deepEqual(tables.brands, { '3': 'pontiac' });
  assert.deepEqual(tables.flairs, { '16': 'au' });
  assert.deepEqual(tablesOf(null).brands, {});
  assert.deepEqual(tablesOf({ carLogos: 'x' }).brands, {});
});
