// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fuelFigure, buildFuelRows, fuelSources, wholeLapsToFinish } from './fuelPanel.ts';
import { fuelUnit } from '../streamer-common/index.ts';

const lap = (usedLiters: number, isCurrentSession = true, isClean = true) => ({
  usedLiters,
  isClean,
  isCurrentSession,
});
const litres = fuelUnit('liters', false, null);

test('sources: trimmed average of the last clean laps, qualifying lap, last lap', () => {
  const history = [
    lap(3.5, false),
    lap(3.6, false),
    lap(3.4),
    lap(3.5),
    lap(3.3, true, false),
    lap(3.9),
    lap(3.4),
  ];
  const sources = fuelSources(history, 'race', { average: null, last: null });
  // Last five clean laps: 3.5 (earlier) ... the lap that was not clean is skipped.
  assert.ok(sources.average !== null && Math.abs(sources.average - 3.5) < 0.2);
  assert.equal(sources.last, 3.4);
  // The qualifying figure is the last clean lap of an earlier session.
  assert.equal(sources.qualify, 3.6);
});

test('in qualifying the qualifying figure is this session; no laps means the fallbacks', () => {
  const history = [lap(3.6, false), lap(3.2)];
  assert.equal(fuelSources(history, 'qualify', { average: null, last: null }).qualify, 3.2);
  const none = fuelSources([], 'race', { average: 3.1, last: 3.0 });
  assert.equal(none.average, 3.1);
  assert.equal(none.last, 3.0);
  assert.equal(none.qualify, null);
});

const base = {
  levelLiters: 20.36,
  lapsToFinish: 6,
  capacityLiters: 100,
  sources: { average: 3.43, qualify: 3.5, last: null },
  customPerLapLiters: null,
  extraMode: 'spare' as const,
  onPitRoad: false,
  unit: litres,
  rows: ['average', 'qualify', 'last', 'custom'] as const,
};

test('rows: laps of fuel, refuel with the cushion, fuel at the flag; sources without laps are skipped', () => {
  const rows = buildFuelRows({ ...base, levelLiters: 25 });
  assert.deepEqual(
    rows.map((row) => row.key),
    ['average', 'qualify'],
  );
  const average = rows[0];
  assert.ok(average !== undefined);
  assert.ok(Math.abs(average.lapsOfFuel - 25 / 3.43) < 1e-9);
  assert.equal(average.refuelLiters, 0);
  assert.ok(Math.abs((average.atEndLiters ?? 0) - (25 - 6 * 3.43)) < 1e-9);
});

test('a refuel of a litre or more gets half a litre on top; less than that does not', () => {
  const needs = buildFuelRows({ ...base, levelLiters: 10 })[0];
  assert.ok(needs !== undefined);
  // 6 * 3.43 - 10 = 10.58, plus the cushion.
  assert.ok(Math.abs((needs.refuelLiters ?? 0) - 11.08) < 1e-9);
  const small = buildFuelRows({ ...base, levelLiters: 20 })[0];
  assert.ok(small !== undefined);
  assert.ok(Math.abs((small.refuelLiters ?? 0) - (6 * 3.43 - 20)) < 1e-9);
});

test('the refuel never asks for more than the tank holds', () => {
  const row = buildFuelRows({ ...base, levelLiters: 10, capacityLiters: 15 })[0];
  assert.ok(row !== undefined);
  // The free space is 5 L; the cushion goes on top of what is asked, as the pit order is clamped later.
  assert.ok((row.refuelLiters ?? 0) <= 5.5 + 1e-9);
});

test('without a session length refuel and fuel at the end are unknown; the pit lane hides the latter', () => {
  const unknown = buildFuelRows({ ...base, lapsToFinish: null })[0];
  assert.equal(unknown?.refuelLiters, null);
  assert.equal(unknown?.atEndLiters, null);
  const pit = buildFuelRows({ ...base, onPitRoad: true })[0];
  assert.equal(pit?.atEndLiters, null);
});

test('a custom consumption adds a row; zero adds none', () => {
  const rows = buildFuelRows({ ...base, customPerLapLiters: 3.8 });
  assert.equal(rows.at(-1)?.key, 'custom');
  assert.equal(buildFuelRows({ ...base, customPerLapLiters: 0 }).some((row) => row.key === 'custom'), false);
});

test('laps to finish are whole, and figures have two decimals', () => {
  assert.equal(wholeLapsToFinish(5.2), 6);
  assert.equal(wholeLapsToFinish(6), 6);
  assert.equal(wholeLapsToFinish(null), null);
  assert.equal(wholeLapsToFinish(-1), null);
  assert.equal(fuelFigure(0.666), '0.67');
  assert.equal(fuelFigure(null), '-');
});
