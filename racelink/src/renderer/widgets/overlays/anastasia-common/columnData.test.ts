// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeDriver } from '../streamer-common/testDrivers.ts';
import type { RelativeRow, StandingsRowModel } from '../streamer-common/index.ts';
import { relativesColumnHasData, standingsColumnHasData, type ColumnContext } from './columnData.ts';

const ctx: ColumnContext = {
  infoOf: () => ({ countryCode: null, brand: null, licence: null, rating: null, ratingChange: null }),
  showLaps: true,
  gainLaps: 3,
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

test('offline (no iRacing data) the rating, licence and flag columns are empty', () => {
  for (const id of ['rating', 'licence', 'ratingChange', 'flag', 'gain', 'pit', 'gainHistory', 'bestLap', 'lastLap'])
    assert.equal(standingsColumnHasData(id, row(), ctx), false, id);
  for (const id of ['position', 'name', 'number', 'classStripe']) assert.equal(standingsColumnHasData(id, row(), ctx), true, id);
});

test('the gap columns wait for a gap; lap times wait for the race to start', () => {
  assert.equal(standingsColumnHasData('gap', row({ gap: { kind: 'leader' } }), ctx), false);
  assert.equal(standingsColumnHasData('gap', row({ gap: { kind: 'seconds', seconds: 3 } }), ctx), true);
  const timed = row({ driver: makeDriver({ carIdx: 1, lastLapSeconds: 90 }) });
  assert.equal(standingsColumnHasData('lastLap', timed, ctx), true);
  assert.equal(standingsColumnHasData('lastLap', timed, { ...ctx, showLaps: false }), false);
});

test('relatives: empty rows have nothing; pit shows the lane or the laps since the stop', () => {
  const me: RelativeRow = {
    kind: 'car',
    driver: makeDriver({ carIdx: 1 }),
    isReference: true,
    seconds: 0,
    lapping: false,
    lapped: false,
    inPit: false,
  };
  assert.equal(relativesColumnHasData('name', { kind: 'empty', index: 0 }, ctx), false);
  assert.equal(relativesColumnHasData('gap', me, ctx), false);
  assert.equal(relativesColumnHasData('pit', me, ctx), false);
  assert.equal(relativesColumnHasData('pit', { ...me, inPit: true }, ctx), true);
});
