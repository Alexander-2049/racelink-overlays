// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeDriver } from '../streamer-common/testDrivers.ts';
import type { RelativeRow, StandingsRowModel } from '../streamer-common/index.ts';
import { relativesColumnHasData, standingsColumnHasData, type ColumnContext } from './columnData.ts';

const ctx: ColumnContext = {
  showLicence: true,
  showIRating: true,
  licenceFormat: 'classRating',
  iRatingFormat: 'k',
  gainHistoryLaps: 3,
  isRace: true,
  reference: undefined,
};

const row = (patch: Partial<StandingsRowModel> = {}): StandingsRowModel => ({
  driver: makeDriver({ carIdx: 1 }),
  position: 1,
  isReference: false,
  gap: { kind: 'none' },
  interval: { kind: 'none' },
  positionChange: null,
  pit: 'none',
  groupPlacement: null,
  cutBelow: false,
  ...patch,
});

test('before the start the gap columns are empty, and the leader label alone is no gap', () => {
  assert.equal(standingsColumnHasData('gap', row({ gap: { kind: 'leader' } }), ctx), false);
  assert.equal(standingsColumnHasData('gap', row({ gap: { kind: 'seconds', seconds: 2 } }), ctx), true);
  assert.equal(standingsColumnHasData('interval', row({ interval: { kind: 'laps', laps: 1 } }), ctx), true);
});

test('columns without data stay empty; the basics never are', () => {
  for (const id of ['gain', 'ratings', 'ratingChange', 'pitState', 'lapTime', 'pitLap', 'pitTime', 'gainHistory'])
    assert.equal(standingsColumnHasData(id, row(), ctx), false, id);
  for (const id of ['position', 'name', 'number', 'classStripe']) assert.equal(standingsColumnHasData(id, row(), ctx), true, id);
});

test('a column the settings switch off has nothing even when the data is there', () => {
  const driver = makeDriver({ carIdx: 1 });
  const rated = { ...driver, ext: { iracing: { iRating: 3200, license: { className: 'A', safetyRating: 3.5 } } } } as never;
  assert.equal(standingsColumnHasData('ratings', row({ driver: rated }), ctx), true);
  assert.equal(
    standingsColumnHasData('ratings', row({ driver: rated }), { ...ctx, showLicence: false, showIRating: false }),
    false,
  );
});

test('pit stops and lap times show their columns', () => {
  const driver = makeDriver({ carIdx: 1, lastLapSeconds: 91.2 });
  assert.equal(standingsColumnHasData('lapTime', row({ driver }), ctx), true);
  assert.equal(standingsColumnHasData('pitState', row({ pit: 'lane' }), ctx), true);
});

test('relatives: empty rows have nothing; the focused car has no time', () => {
  const driver = makeDriver({ carIdx: 1 });
  const empty: RelativeRow = { kind: 'empty', index: 0 };
  const me: RelativeRow = { kind: 'car', driver, isReference: true, seconds: 0, lapping: false, lapped: false, inPit: false };
  const other: RelativeRow = { ...me, isReference: false, seconds: 1.4 };
  assert.equal(relativesColumnHasData('name', empty, ctx), false);
  assert.equal(relativesColumnHasData('time', me, ctx), false);
  assert.equal(relativesColumnHasData('time', other, ctx), true);
  assert.equal(relativesColumnHasData('pitLap', other, ctx), false);
});
