// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRelatives, lapOffset } from './relativesModel.ts';
import { makeDriver } from './testDrivers.ts';

const at = (carIdx: number, fraction: number, extra = {}) =>
  makeDriver({ carIdx, lapDistanceFraction: fraction, ...extra });

const idsOf = (rows: ReturnType<typeof buildRelatives>): (number | string)[] =>
  rows.map((row) => (row.kind === 'car' ? row.driver.carIdx : 'empty'));

test('lap offsets wrap round the start line', () => {
  assert.ok(Math.abs(lapOffset(0.95, 0.05) - 0.1) < 1e-9);
  assert.ok(Math.abs(lapOffset(0.05, 0.95) + 0.1) < 1e-9);
  assert.equal(lapOffset(0.2, 0.4), 0.4 - 0.2);
});

test('cars ahead on top, the focused car in the middle, cars behind below', () => {
  const drivers = [
    at(1, 0.5),
    at(2, 0.52),
    at(3, 0.54),
    at(4, 0.56),
    at(5, 0.48),
    at(6, 0.46),
    at(7, 0.44),
    at(8, 0.42),
  ];
  const rows = buildRelatives({ drivers, referenceCarIdx: 1, sessionType: 'practice' });
  assert.deepEqual(idsOf(rows), [4, 3, 2, 1, 5, 6, 7]);
  const middle = rows[3];
  assert.equal(middle?.kind === 'car' && middle.isReference, true);
});

test('missing cars are empty rows so the height holds', () => {
  const rows = buildRelatives({
    drivers: [at(1, 0.5), at(2, 0.51)],
    referenceCarIdx: 1,
    sessionType: 'practice',
  });
  assert.equal(rows.length, 7);
  assert.deepEqual(idsOf(rows), ['empty', 'empty', 2, 1, 'empty', 'empty', 'empty']);
});

test('the list wraps round the start line', () => {
  const rows = buildRelatives({
    drivers: [at(1, 0.98), at(2, 0.01), at(3, 0.95)],
    referenceCarIdx: 1,
    sessionType: 'practice',
  });
  assert.deepEqual(idsOf(rows).slice(2, 5), [2, 1, 3]);
});

test('pace car, spectators and cars not in the world are left out; pit cars on request', () => {
  const drivers = [
    at(1, 0.5),
    at(2, 0.51, { isPaceCar: true }),
    at(3, 0.52, { isSpectator: true }),
    at(4, 0.53, { trackSurface: 'notInWorld' }),
    at(5, 0.54, { onPitRoad: true }),
  ];
  const all = buildRelatives({ drivers, referenceCarIdx: 1, sessionType: 'race' });
  assert.deepEqual(idsOf(all).filter((id) => id !== 'empty'), [5, 1]);
  const noPit = buildRelatives({
    drivers,
    referenceCarIdx: 1,
    sessionType: 'race',
    options: { rows: 7, excludePit: true, loneQualify: true },
  });
  assert.deepEqual(idsOf(noPit).filter((id) => id !== 'empty'), [1]);
});

test('lapped and lapping show in a race only', () => {
  const drivers = [
    at(1, 0.5),
    at(2, 0.51, { gaps: { ...at(2, 0).gaps, relativeLaps: 1, relativeSeconds: 4 } }),
    at(3, 0.49, { gaps: { ...at(3, 0).gaps, relativeLaps: -1, relativeSeconds: -6 } }),
  ];
  const race = buildRelatives({ drivers, referenceCarIdx: 1, sessionType: 'race' });
  const cars = race.filter((row) => row.kind === 'car');
  assert.equal(cars.find((row) => row.driver.carIdx === 2)?.lapping, true);
  assert.equal(cars.find((row) => row.driver.carIdx === 3)?.lapped, true);
  assert.equal(cars.find((row) => row.driver.carIdx === 1)?.seconds, 0);
  const practice = buildRelatives({ drivers, referenceCarIdx: 1, sessionType: 'practice' });
  assert.equal(
    practice.some((row) => row.kind === 'car' && (row.lapped || row.lapping)),
    false,
  );
});

test('nobody else shows in a lone qualifying while the player is on track', () => {
  const rows = buildRelatives({
    drivers: [at(1, 0.5), at(2, 0.51)],
    referenceCarIdx: 1,
    sessionType: 'qualify',
    playerOnTrack: true,
  });
  assert.deepEqual(idsOf(rows).filter((id) => id !== 'empty'), [1]);
});

test('no focused car, no rows', () => {
  assert.deepEqual(
    buildRelatives({ drivers: [at(1, 0.5)], referenceCarIdx: null, sessionType: 'race' }),
    [],
  );
});
