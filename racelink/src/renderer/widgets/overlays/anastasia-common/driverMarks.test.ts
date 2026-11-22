import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classBestLap, lapMark, referenceCarIdx } from './driverMarks.ts';

describe('referenceCarIdx', () => {
  it('prefers the camera, then the player', () => {
    assert.equal(referenceCarIdx({ focusedCarIdx: 4, playerCarIdx: 2 }), 4);
    assert.equal(referenceCarIdx({ focusedCarIdx: null, playerCarIdx: 2 }), 2);
    assert.equal(referenceCarIdx({ focusedCarIdx: null, playerCarIdx: null }), null);
  });
});

describe('lapMark', () => {
  it('marks a last lap that is the own best', () => {
    assert.equal(lapMark({ lastLapSeconds: 122.3, bestLapSeconds: 122.3 }, 121), 'personal');
  });
  it('marks a class record above a personal best', () => {
    assert.equal(lapMark({ lastLapSeconds: 121, bestLapSeconds: 121 }, 121), 'class');
  });
  it('marks nothing for an ordinary lap or missing times', () => {
    assert.equal(lapMark({ lastLapSeconds: 123, bestLapSeconds: 122 }, 121), null);
    assert.equal(lapMark({ lastLapSeconds: null, bestLapSeconds: 122 }, 121), null);
  });
});

describe('classBestLap', () => {
  it('reads the class from the list', () => {
    const classes = [
      { classId: 1, bestLapSeconds: 120.5 },
      { classId: 2, bestLapSeconds: null },
    ];
    assert.equal(classBestLap(classes, 1), 120.5);
    assert.equal(classBestLap(classes, 2), null);
    assert.equal(classBestLap(classes, 9), null);
  });
});
