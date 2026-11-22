import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SpeedExtremes } from './speedExtremes.ts';

const feed = (
  tracker: SpeedExtremes,
  speeds: readonly number[],
  lap: number | null = 1,
  inPit = false,
): void => {
  for (const speedKph of speeds) tracker.update({ speedKph, lap, inPit });
};

describe('SpeedExtremes, corner mode', () => {
  it('shows nothing until a peak or a trough is confirmed', () => {
    const tracker = new SpeedExtremes('corner', 15);
    feed(tracker, [100, 120, 140, 160]);
    assert.equal(tracker.shown.min, null);
    assert.equal(tracker.shown.max, null);
  });

  it('confirms the straight maximum once the car has slowed down', () => {
    const tracker = new SpeedExtremes('corner', 15);
    feed(tracker, [100, 180, 250, 251, 240, 200]);
    assert.equal(tracker.shown.max, 251);
    assert.equal(tracker.shown.min, null);
  });

  it('confirms the corner minimum once the car has sped up again', () => {
    const tracker = new SpeedExtremes('corner', 15);
    feed(tracker, [250, 251, 200, 120, 89, 95, 130]);
    assert.equal(tracker.shown.max, 251);
    assert.equal(tracker.shown.min, 89);
  });

  it('ignores lifts smaller than the swing', () => {
    const tracker = new SpeedExtremes('corner', 15);
    feed(tracker, [250, 251, 200, 120, 89, 95, 130, 200, 255, 250, 252, 254, 240, 200]);
    assert.equal(tracker.shown.max, 255);
    assert.equal(tracker.shown.min, 89);
  });

  it('skips the pit lane and bad samples', () => {
    const tracker = new SpeedExtremes('corner', 15);
    feed(tracker, [250, 251, 200, 120, 89, 95, 130]);
    feed(tracker, [60, 10, 60], 1, true);
    feed(tracker, [Number.NaN, -5]);
    assert.equal(tracker.shown.min, 89);
    assert.equal(tracker.shown.max, 251);
  });

  it('reset forgets everything', () => {
    const tracker = new SpeedExtremes('corner', 15);
    feed(tracker, [250, 251, 200, 120, 89, 95, 130]);
    tracker.reset();
    assert.equal(tracker.shown.min, null);
    assert.equal(tracker.shown.max, null);
  });
});

describe('SpeedExtremes, lap mode', () => {
  it('shows the running lap until one is complete', () => {
    const tracker = new SpeedExtremes('lap');
    feed(tracker, [100, 200, 90, 180], 1);
    assert.deepEqual(tracker.shown, { min: 90, max: 200 });
  });

  it('shows the last completed lap, then the next', () => {
    const tracker = new SpeedExtremes('lap');
    feed(tracker, [100, 200, 90], 1);
    feed(tracker, [150, 160], 2);
    assert.deepEqual(tracker.shown, { min: 90, max: 200 });
    feed(tracker, [70, 240], 2);
    feed(tracker, [150], 3);
    assert.deepEqual(tracker.shown, { min: 70, max: 240 });
  });

  it('starts afresh when the lap counter goes back', () => {
    const tracker = new SpeedExtremes('lap');
    feed(tracker, [100, 200, 90], 5);
    feed(tracker, [150], 6);
    feed(tracker, [120, 130], 1);
    assert.deepEqual(tracker.shown, { min: 120, max: 130 });
  });
});
