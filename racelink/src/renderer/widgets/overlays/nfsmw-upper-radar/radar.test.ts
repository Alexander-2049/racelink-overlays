// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  approachAngle,
  darkMs,
  farSideLevel,
  isInFront,
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

test('the bar pulses from the moment the trouble shows, more often as it nears', () => {
  const edgeOfRange = pulsePeriodMs(1000, 250, 600);
  const distant = pulsePeriodMs(800, 250, 600);
  const farEdge = pulsePeriodMs(600, 250, 600);
  assert.equal(edgeOfRange, 2400);
  assert.equal(farEdge, 1400);
  assert.ok(edgeOfRange > distant && distant > farEdge);
  // Beyond the range and with the far edge at the range it still pulses.
  assert.equal(pulsePeriodMs(5000, 250, 600), 2400);
  assert.equal(pulsePeriodMs(1000, 250, 1000), 2400);
  const slow = pulsePeriodMs(500, 250, 600);
  const edge = pulsePeriodMs(250, 250, 600);
  const fast = pulsePeriodMs(100, 250, 600);
  const touching = pulsePeriodMs(0, 250, 600);
  assert.ok(farEdge > slow && slow > edge && edge > fast && fast > touching);
  assert.equal(edge, 600);
  assert.equal(touching, 130);
  // Even the fastest pulse has time to fill the bar.
  assert.ok(touching > darkMs + fillMs);
  assert.equal(pulsePeriodMs(Number.NaN, 250, 600), 2400);
});

test('a near edge beyond the far edge still pulses near the trouble', () => {
  const period = pulsePeriodMs(100, 900, 300);
  assert.ok(period < 600);
  assert.ok(pulsePeriodMs(400, 900, 300) > 1400);
});

test('trouble behind the car is left out', () => {
  const at = (bearingDegrees: number | null) => ({
    distanceMeters: 200,
    bearingDegrees,
    direction: null,
  });
  assert.equal(isInFront(at(null)), true);
  assert.equal(isInFront(at(0)), true);
  assert.equal(isInFront(at(-90)), true);
  assert.equal(isInFront(at(120)), false);
  assert.equal(isInFront(at(-179)), false);
  assert.equal(isInFront(at(Number.NaN)), true);
});

test('both sides burn the same unless the side of the trouble is highlighted', () => {
  assert.deepEqual(sideLevels('left', false), { left: 1, right: 1 });
  assert.deepEqual(sideLevels('right', false), { left: 1, right: 1 });
  assert.deepEqual(sideLevels('left', true), { left: 1, right: farSideLevel });
  assert.deepEqual(sideLevels('right', true), { left: farSideLevel, right: 1 });
  assert.deepEqual(sideLevels('ahead', true), { left: 1, right: 1 });
  assert.deepEqual(sideLevels(null, true), { left: 1, right: 1 });
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
  // A steady bar (edit mode) is full and silent; pulsing again starts with a beep, dark.
  assert.deepEqual(pulser.advance(16, null), { lit: ledColumns, beep: false });
  assert.deepEqual(pulser.advance(16, 500), { lit: 0, beep: true });
});

test('the arrow turns the short way round', () => {
  const next = approachAngle(170, -170, 1000, 100);
  assert.ok(next > 170 && next < 191, String(next));
  assert.equal(approachAngle(Number.NaN, 30, 16, 100), 30);
});
