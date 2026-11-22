// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeDriver } from '../streamer-common/testDrivers.ts';
import { relativesColumnHasData, standingsColumnHasData, type PictureLookup } from './columnData.ts';
import type { StandingsRowView } from './standingsView.ts';

const pictures: PictureLookup = { flag: () => false, brand: (id) => id === 7 };

const view = (patch: Partial<StandingsRowView['base']>): StandingsRowView =>
  ({
    base: {
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
    },
    lapTime: { seconds: null, personalBest: false, classBest: false, stale: false },
    pit: null,
    history: null,
  }) as StandingsRowView;

test('a gap column is empty until somebody has a gap; the leader label does not count', () => {
  assert.equal(standingsColumnHasData('gap', view({ gap: { kind: 'leader' } }), pictures), false);
  assert.equal(standingsColumnHasData('gap', view({ gap: { kind: 'seconds', seconds: 1.2 } }), pictures), true);
  assert.equal(standingsColumnHasData('gap', view({ gap: { kind: 'laps', laps: 1 } }), pictures), true);
});

test('columns of data the game does not give are empty', () => {
  const row = view({});
  for (const id of ['gain', 'rating', 'licence', 'tyre', 'stops', 'pit', 'history', 'team', 'carName', 'lapTime'])
    assert.equal(standingsColumnHasData(id, row, pictures), false, id);
  for (const id of ['position', 'name', 'number', 'laps']) assert.equal(standingsColumnHasData(id, row, pictures), true, id);
});

test('a column has data when one row has it', () => {
  assert.equal(standingsColumnHasData('gain', view({ positionChange: -2 }), pictures), true);
  assert.equal(standingsColumnHasData('brand', view({ driver: makeDriver({ carIdx: 1, carId: 7 }) }), pictures), true);
  assert.equal(standingsColumnHasData('brand', view({ driver: makeDriver({ carIdx: 1, carId: 8 }) }), pictures), false);
});

test('relatives: empty rows have nothing; the focused car has no gap', () => {
  const driver = makeDriver({ carIdx: 1 });
  assert.equal(relativesColumnHasData('name', null, pictures), false);
  assert.equal(relativesColumnHasData('gap', { driver, isReference: true, seconds: 0 }, pictures), false);
  assert.equal(relativesColumnHasData('gap', { driver, isReference: false, seconds: -1.5 }, pictures), true);
  assert.equal(relativesColumnHasData('rating', { driver, isReference: false, seconds: 1 }, pictures), false);
});
