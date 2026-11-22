import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { lineLayout } from './blindSpotLayout.ts';

describe('lineLayout', () => {
  it('draws nothing without a car alongside', () => {
    assert.equal(lineLayout(0, 0, 30, true), null);
  });
  it('fills the bar for two cars', () => {
    assert.deepEqual(lineLayout(2, 0.3, 30, true), { topPercent: 0, heightPercent: 100 });
  });
  it('centres a level car and moves it with the position', () => {
    assert.deepEqual(lineLayout(1, 0, 30, true), { topPercent: 35, heightPercent: 30 });
    assert.deepEqual(lineLayout(1, 1, 30, true), { topPercent: 0, heightPercent: 30 });
    assert.deepEqual(lineLayout(1, -1, 30, true), { topPercent: 70, heightPercent: 30 });
  });
  it('keeps the middle when not moving and clamps odd input', () => {
    assert.deepEqual(lineLayout(1, 1, 30, false), { topPercent: 35, heightPercent: 30 });
    assert.deepEqual(lineLayout(1, 9, 30, true), { topPercent: 0, heightPercent: 30 });
    assert.deepEqual(lineLayout(1, Number.NaN, 200, true), { topPercent: 0, heightPercent: 100 });
  });
});
