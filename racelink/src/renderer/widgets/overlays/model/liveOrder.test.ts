// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classOrOverallPlace,
  classPlace,
  liveClassChange,
  liveOverallChange,
  overallPlace,
} from './liveOrder.ts';

const live = (position: number, classPosition: number | null) => ({
  position,
  classPosition,
  lapDistanceFraction: null,
  raceDistanceLaps: null,
  source: 'track',
  sinceSeconds: null,
  isFinished: false,
});

test('live places win over the official ones', () => {
  const driver = { position: 5, classPosition: 3, live: live(4, 2) };
  assert.equal(overallPlace(driver), 4);
  assert.equal(classPlace(driver), 2);
  assert.equal(classOrOverallPlace(driver), 2);
});

test('older apps without live fields keep the official places', () => {
  const driver = { position: 5, classPosition: 3 };
  assert.equal(overallPlace(driver), 5);
  assert.equal(classPlace(driver), 3);
  assert.equal(classOrOverallPlace(driver), 3);
  assert.equal(classOrOverallPlace({ position: 5, classPosition: null }), 5);
  assert.equal(classOrOverallPlace({ position: null, classPosition: null }), null);
});

test('a null live class place falls back to the official one', () => {
  const driver = { position: 5, classPosition: 3, live: live(4, null) };
  assert.equal(classPlace(driver), 3);
});

test('live position changes are read when present', () => {
  const change = { overall: 1, class: 2, liveOverall: 3, liveClass: -1 };
  assert.equal(liveClassChange({ positionChange: change }), -1);
  assert.equal(liveOverallChange({ positionChange: change }), 3);
  assert.equal(liveClassChange({}), null);
  assert.equal(liveOverallChange({ positionChange: null }), null);
});
