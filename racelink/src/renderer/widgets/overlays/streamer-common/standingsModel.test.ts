// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildStandings,
  defaultStandingsOptions,
  gainHistory,
  gapCell,
  pitIndicator,
  positionChange,
  projectedRatingChanges,
  strengthOfField,
  visibleRange,
} from './standingsModel.ts';
import { makeDriver } from './testDrivers.ts';

const options = { ...defaultStandingsOptions, topRows: 3, bottomRows: 4 };

test('a class that fits is shown whole', () => {
  assert.deepEqual(visibleRange(7, 2, options), [0, 6]);
  assert.deepEqual(visibleRange(0, -1, options), null);
});

test('near the top the first rows are shown', () => {
  // Rows 3 + 4 = 7; the focused car at index 1 and 3 are inside the first seven.
  assert.deepEqual(visibleRange(20, 1, options), [0, 6]);
  assert.deepEqual(visibleRange(20, 4, options), [0, 6]);
});

test('in the middle the top is dropped for a window round the car', () => {
  // Window: 2 above, 2 below (bottom = 4, ceil = 2, floor = 2 -> [i-2, i+1]).
  assert.deepEqual(visibleRange(20, 10, options), [8, 11]);
});

test('near the bottom the last rows are shown', () => {
  assert.deepEqual(visibleRange(20, 19, options), [16, 19]);
  assert.deepEqual(visibleRange(20, 18, options), [16, 19]);
});

test('another class shows its first rows only', () => {
  assert.deepEqual(visibleRange(20, -1, options), [0, 2]);
  assert.deepEqual(visibleRange(2, -1, options), [0, 1]);
});

test('gap cells follow the phase', () => {
  assert.deepEqual(gapCell(true, null, null, 'running', 'race'), { kind: 'leader' });
  assert.deepEqual(gapCell(false, 3.2, null, 'running', 'race'), { kind: 'seconds', seconds: 3.2 });
  assert.deepEqual(gapCell(false, 3.2, 2, 'running', 'race'), { kind: 'laps', laps: 2 });
  assert.deepEqual(gapCell(false, -1, null, 'running', 'race'), { kind: 'none' });
  assert.deepEqual(gapCell(true, null, null, 'grid', 'race'), { kind: 'none' });
  // Before the start of practice there is no grid: gaps are best-lap gaps.
  assert.deepEqual(gapCell(false, 0.4, null, 'running', 'practice'), { kind: 'seconds', seconds: 0.4 });
});

test('places gained or lost count in a started race only', () => {
  const driver = { startClassPosition: 8, classPosition: 5 };
  assert.equal(positionChange(driver, 'race', 'running'), 3);
  assert.equal(positionChange(driver, 'race', 'grid'), null);
  assert.equal(positionChange(driver, 'qualify', 'running'), null);
  assert.equal(positionChange({ startClassPosition: null, classPosition: 5 }, 'race', 'running'), null);
});

test('pit indicators: lane, box, towing, and none after the flag', () => {
  assert.equal(pitIndicator({ onPitRoad: true, trackSurface: 'approachingPits' }, 'race', 'running'), 'lane');
  assert.equal(pitIndicator({ onPitRoad: true, trackSurface: 'pitStall' }, 'race', 'running'), 'box');
  assert.equal(pitIndicator({ onPitRoad: false, trackSurface: 'pitStall' }, 'race', 'running'), 'towing');
  assert.equal(pitIndicator({ onPitRoad: true, trackSurface: 'pitStall' }, 'race', 'checkered'), 'none');
  assert.equal(pitIndicator({ onPitRoad: false, trackSurface: 'onTrack' }, 'race', 'running'), 'none');
});

test('gain history compares lap times with the focused car, newest last', () => {
  const driver = { lapHistorySeconds: [90, 91, 89] };
  const reference = { lapHistorySeconds: [92, 90] };
  assert.deepEqual(gainHistory(driver, reference, 3), [null, 1, 1]);
  assert.deepEqual(gainHistory(driver, undefined, 3), []);
});

test('class groups: focused class first, rows windowed, others trimmed', () => {
  const drivers = [];
  for (let place = 1; place <= 12; place += 1)
    drivers.push(
      makeDriver({
        carIdx: place,
        classId: 1,
        position: place,
        classPosition: place,
        startClassPosition: place + 1,
        gaps: {
          ...makeDriver({ carIdx: 0 }).gaps,
          toClassLeaderSeconds: place === 1 ? null : place,
          toAheadSeconds: place === 1 ? null : 1,
        },
      }),
    );
  for (let place = 1; place <= 5; place += 1)
    drivers.push(
      makeDriver({ carIdx: 100 + place, classId: 2, position: 13 + place, classPosition: place }),
    );
  drivers.push(makeDriver({ carIdx: 99, isPaceCar: true, position: 1, classPosition: 1 }));
  const groups = buildStandings({
    drivers,
    classes: [],
    referenceCarIdx: 105,
    sessionType: 'race',
    phase: 'running',
    options,
  });
  assert.equal(groups.length, 2);
  assert.equal(groups[0]?.classId, 2, 'the focused class is first');
  assert.equal(groups[0]?.isReferenceClass, true);
  assert.equal(groups[0]?.rows.length, 5);
  assert.equal(groups[1]?.rows.length, 3);
  const rows = groups[1]?.rows ?? [];
  assert.equal(rows[0]?.gap.kind, 'leader');
  assert.equal(rows[1]?.gap.kind, 'seconds');
  assert.equal(rows[1]?.positionChange, 1);
  assert.equal(rows[0]?.groupPlacement, 1);
  assert.equal(rows[2]?.groupPlacement, -1);
  assert.equal(
    groups.flatMap((group) => group.rows).some((row) => row.driver.isPaceCar),
    false,
  );
});

test('a window leaves a cut after the top rows', () => {
  const drivers = [];
  for (let place = 1; place <= 20; place += 1)
    drivers.push(makeDriver({ carIdx: place, position: place, classPosition: place }));
  const groups = buildStandings({
    drivers,
    classes: [],
    referenceCarIdx: 10,
    sessionType: 'race',
    phase: 'running',
    options,
  });
  const rows = groups[0]?.rows ?? [];
  assert.deepEqual(
    rows.map((row) => row.position),
    [8, 9, 10, 11],
  );
});

test('rating projection: winner gains, last loses, and it is roughly zero-sum', () => {
  const changes = projectedRatingChanges([2500, 2400, 2300, 2200, 2100, 2000]);
  assert.ok((changes[0] ?? 0) > 0);
  assert.ok((changes[5] ?? 0) < 0);
  const sum = changes.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum) <= 12, `sum ${String(sum)}`);
  assert.deepEqual(projectedRatingChanges([2000]), [0]);
});

test('strength of field', () => {
  assert.equal(strengthOfField([]), null);
  assert.equal(strengthOfField([2000, 2000]), 2000);
  const sof = strengthOfField([1000, 3000]) ?? 0;
  assert.ok(sof > 1000 && sof < 2000, 'closer to the weaker driver');
});
