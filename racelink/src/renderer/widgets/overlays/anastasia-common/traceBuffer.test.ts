import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TraceBuffer, type TraceSample } from './traceBuffer.ts';

const at = (t: number): TraceSample => ({ t, throttle: 0, brake: 0, clutch: 0, steering: 0 });

describe('TraceBuffer', () => {
  it('keeps samples inside the window plus one before it', () => {
    const buffer = new TraceBuffer(1000, 0);
    for (const t of [0, 400, 800, 1200, 1600, 2000]) buffer.push(at(t));
    // From 1000: 1200, 1600, 2000, and 800 as the one before.
    assert.deepEqual(
      buffer.samples.map((sample) => sample.t),
      [800, 1200, 1600, 2000],
    );
  });

  it('drops samples that come too close together', () => {
    const buffer = new TraceBuffer(1000, 10);
    buffer.push(at(0));
    buffer.push(at(5));
    buffer.push(at(12));
    assert.equal(buffer.samples.length, 2);
  });

  it('forgets old samples as time passes without new ones', () => {
    const buffer = new TraceBuffer(1000, 0);
    buffer.push(at(0));
    buffer.push(at(500));
    buffer.prune(5000);
    assert.equal(buffer.samples.length, 1);
    assert.equal(buffer.samples[0]?.t, 500);
  });

  it('clears', () => {
    const buffer = new TraceBuffer(1000, 0);
    buffer.push(at(0));
    buffer.clear();
    assert.equal(buffer.samples.length, 0);
  });
});
