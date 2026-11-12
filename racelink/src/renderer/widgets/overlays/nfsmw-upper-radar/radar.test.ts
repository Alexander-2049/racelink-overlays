// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  approachAngle,
  darkMs,
  farSideLevel,
  fillMs,
  ledColumns,
  litAt,
  Pulser,
  pulsePeriodMs,
  sideLevels,
} from './radar.ts';

test('a pulse is dark for a frame, then fills at a steady speed, then stays full', () => {
  assert.equal(litAt(0), 0);
  assert.equal(litAt(darkMs - 1), 0);
  const quarter = litAt(darkMs + fillMs / 4);
  const half = litAt(darkMs + fillMs / 2);
  assert.equal(quarter, ledColumns / 4);
  assert.equal(half, ledColumns / 2);
  assert.equal(litAt(darkMs + fillMs), ledColumns);
  assert.equal(litAt(5000), ledColumns);
});

test('far away the bar stands full; closer it pulses, more often as the trouble nears', () => {
  assert.equal(pulsePeriodMs(800, 250, 600), null);
  assert.equal(pulsePeriodMs(600, 250, 600), null);
  const slow = pulsePeriodMs(500, 250, 600);
  const edge = pulsePeriodMs(250, 250, 600);
  const fast = pulsePeriodMs(100, 250, 600);
  const touching = pulsePeriodMs(0, 250, 600);
  assert.ok(slow !== null && edge !== null && fast !== null && touching !== null);
  assert.ok(slow > edge && edge > fast && fast > touching);
  assert.equal(edge, 600);
  assert.equal(touching, 350);
  // Even the fastest pulse has time to fill the bar.
  assert.ok(touching > darkMs + fillMs);
  assert.equal(pulsePeriodMs(Number.NaN, 250, 600), null);
});

test('a near edge beyond the far edge still pulses near the trouble', () => {
  const period = pulsePeriodMs(100, 900, 300);
  assert.ok(period !== null && period < 600);
  assert.equal(pulsePeriodMs(400, 900, 300), null);
});

test('the side of the trouble burns brighter', () => {
  assert.deepEqual(sideLevels('left'), { left: 1, right: farSideLevel });
  assert.deepEqual(sideLevels('right'), { left: farSideLevel, right: 1 });
  assert.deepEqual(sideLevels('ahead'), { left: 1, right: 1 });
  assert.deepEqual(sideLevels(null), { left: 1, right: 1 });
});

test('the pulser beeps once a pulse and fills the bar each time', () => {
  const pulser = new Pulser();
  let beeps = 0;
  let darkFrames = 0;
  let fullFrames = 0;
  // Two seconds at 60 fps with a pulse every 500 ms: four pulses.
  for (let frame = 0; frame < 120; frame += 1) {
    const { lit, beep } = pulser.advance(1000 / 60, 500);
    if (beep) beeps += 1;
    if (lit === 0) darkFrames += 1;
    if (lit === ledColumns) fullFrames += 1;
  }
  assert.equal(beeps, 4);
  assert.ok(darkFrames >= 4 && darkFrames <= 8, String(darkFrames));
  assert.ok(fullFrames > 80, String(fullFrames));
  // A steady bar is full and silent; pulsing again starts with a beep, dark.
  assert.deepEqual(pulser.advance(16, null), { lit: ledColumns, beep: false });
  assert.deepEqual(pulser.advance(16, 500), { lit: 0, beep: true });
});

test('the arrow turns the short way round', () => {
  const next = approachAngle(170, -170, 1000, 100);
  assert.ok(next > 170 && next < 191, String(next));
  assert.equal(approachAngle(Number.NaN, 30, 16, 100), 30);
});
