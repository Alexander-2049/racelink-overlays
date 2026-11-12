// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  approachAngle,
  blinkPeriodMs,
  Blinker,
  farSideLevel,
  ledColumns,
  litColumns,
  sideLevels,
} from './radar.ts';

test('more lights burn as the trouble nears', () => {
  assert.equal(litColumns(999), 1);
  assert.equal(litColumns(1000), 1);
  assert.equal(litColumns(5000), 1);
  assert.equal(litColumns(500), 6);
  assert.equal(litColumns(0), ledColumns);
  assert.equal(litColumns(-10), ledColumns);
  assert.equal(litColumns(Number.NaN), 0);
});

test('far away the lights glow, then blink slowly, then fast', () => {
  assert.equal(blinkPeriodMs(800, 250, 600), null);
  assert.equal(blinkPeriodMs(600, 250, 600), null);
  const slow = blinkPeriodMs(500, 250, 600);
  const edge = blinkPeriodMs(250, 250, 600);
  const fast = blinkPeriodMs(100, 250, 600);
  const touching = blinkPeriodMs(0, 250, 600);
  assert.ok(slow !== null && edge !== null && fast !== null && touching !== null);
  assert.ok(slow > edge && edge > fast && fast > touching);
  assert.equal(edge, 450);
  assert.equal(touching, 150);
  assert.equal(blinkPeriodMs(Number.POSITIVE_INFINITY, 250, 600), null);
});

test('a near edge beyond the far edge still blinks fast near the trouble', () => {
  const period = blinkPeriodMs(100, 900, 300);
  assert.ok(period !== null && period < 450);
  assert.equal(blinkPeriodMs(400, 900, 300), null);
});

test('the side of the trouble burns brighter', () => {
  assert.deepEqual(sideLevels('left'), { left: 1, right: farSideLevel });
  assert.deepEqual(sideLevels('right'), { left: farSideLevel, right: 1 });
  assert.deepEqual(sideLevels('ahead'), { left: 1, right: 1 });
  assert.deepEqual(sideLevels(null), { left: 1, right: 1 });
});

test('the blinker beeps once each time the lights come on', () => {
  const blinker = new Blinker();
  let beeps = 0;
  let offFrames = 0;
  // Two seconds at 60 fps with a 400 ms blink: five blinks.
  for (let frame = 0; frame < 120; frame += 1) {
    const { on, beep } = blinker.advance(1000 / 60, 400);
    if (beep) beeps += 1;
    if (!on) offFrames += 1;
  }
  assert.ok(beeps >= 4 && beeps <= 6, String(beeps));
  assert.ok(offFrames > 30 && offFrames < 60, String(offFrames));
  // A steady glow is on and silent.
  assert.deepEqual(blinker.advance(16, null), { on: true, beep: false });
  // Blinking again starts with a beep.
  assert.equal(blinker.advance(16, 400).beep, true);
});

test('the arrow turns the short way round', () => {
  const next = approachAngle(170, -170, 1000, 100);
  assert.ok(next > 170 && next < 191, String(next));
  assert.equal(approachAngle(Number.NaN, 30, 16, 100), 30);
});
