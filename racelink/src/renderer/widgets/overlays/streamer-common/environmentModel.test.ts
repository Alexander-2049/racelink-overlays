// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compassPoint,
  isTrackWet,
  PrecipitationTracker,
  windView,
  wetnessLevel,
} from './environmentModel.ts';
import {
  alongsidePosition,
  offsetMetersFromFractions,
  spotterFromRadar,
  spotterView,
} from './spotterModel.ts';

test('wind speed in km/h and mph, and the arrow points where it blows to', () => {
  const view = windView({ windSpeedMps: 10, windDirectionRad: 0 });
  assert.equal(view?.speed, 36);
  assert.equal(view?.unit, 'km/h');
  // From the north, it blows south: the arrow points down.
  assert.ok(Math.abs((view?.arrowRad ?? 0) - Math.PI) < 1e-9);
  assert.equal(windView({ windSpeedMps: 10, windDirectionRad: 0 }, { imperial: true })?.speed, 22);
});

test('the wind arrow is relative to the car when its heading is known', () => {
  // Wind from the north, the car facing east (pi/2 clockwise): the wind comes from its left.
  const view = windView(
    { windSpeedMps: 5, windDirectionRad: 0 },
    { imperial: false, headingRad: Math.PI / 2 },
  );
  assert.ok(Math.abs((view?.arrowRad ?? 0) - Math.PI / 2) < 1e-9);
});

test('wind strength saturates at 60 km/h; unknown wind is null', () => {
  assert.equal(windView({ windSpeedMps: 30, windDirectionRad: 1 })?.strength, 1);
  assert.ok(Math.abs((windView({ windSpeedMps: 5, windDirectionRad: 1 })?.strength ?? 0) - 0.3) < 1e-9);
  assert.equal(windView({ windSpeedMps: null, windDirectionRad: 1 }), null);
  assert.equal(windView({ windSpeedMps: 3, windDirectionRad: null }), null);
});

test('compass points', () => {
  assert.equal(compassPoint(0), 'N');
  assert.equal(compassPoint(Math.PI / 2), 'E');
  assert.equal(compassPoint(-Math.PI / 2), 'W');
  assert.equal(compassPoint(Math.PI), 'S');
});

test('track wetness levels', () => {
  assert.equal(wetnessLevel('dry'), 0);
  assert.equal(wetnessLevel('extremelyWet'), 6);
  assert.equal(wetnessLevel(null), null);
  assert.equal(isTrackWet('veryLightlyWet'), false);
  assert.equal(isTrackWet('lightlyWet'), true);
  assert.equal(isTrackWet(null), false);
});

test('precipitation is smoothed and has a trend', () => {
  const tracker = new PrecipitationTracker(60_000, 0.5, 0.02);
  assert.equal(tracker.value, null);
  tracker.update(0, 0);
  assert.equal(tracker.trend, 'steady');
  tracker.update(1, 1000);
  tracker.update(1, 2000);
  assert.ok((tracker.value ?? 0) > 0.5 && (tracker.value ?? 1) < 1);
  assert.equal(tracker.trend, 'rising');
  const falling = new PrecipitationTracker(60_000, 0.5, 0.02);
  falling.update(1, 0);
  for (let second = 1; second < 6; second += 1) falling.update(0, second * 1000);
  assert.equal(falling.trend, 'falling');
  // A long calm: the oldest sample in the look-back is calm too.
  for (let second = 6; second < 200; second += 1) falling.update(0, second * 1000);
  assert.equal(falling.trend, 'steady');
  tracker.update(null, 300_000);
  tracker.update(Number.NaN, 301_000);
});

test('spotter state to a view', () => {
  assert.deepEqual(spotterView('clear'), { left: 0, right: 0, active: false });
  assert.deepEqual(spotterView('both'), { left: 1, right: 1, active: true });
  assert.deepEqual(spotterView('twoLeft'), { left: 2, right: 0, active: true });
  assert.deepEqual(spotterView('right'), { left: 0, right: 1, active: true });
  assert.deepEqual(spotterView('off'), { left: 0, right: 0, active: false });
});

test('radar cars alongside', () => {
  const radar = {
    rangeMeters: 30,
    vehicleWidthMeters: 2,
    vehicleLengthMeters: 4.5,
    nearestLeftMeters: null,
    nearestRightMeters: null,
    cars: [
      { carIdx: 2, xMeters: -2.2, yMeters: 1 },
      { carIdx: 3, xMeters: 2.0, yMeters: -4 },
      { carIdx: 4, xMeters: 2.0, yMeters: 12 },
      { carIdx: 5, xMeters: 9, yMeters: 0 },
    ],
  } as unknown as Parameters<typeof spotterFromRadar>[0];
  assert.deepEqual(spotterFromRadar(radar), { left: 1, right: 1, active: true });
  assert.deepEqual(spotterFromRadar(null), { left: 0, right: 0, active: false });
});

test('the line between the cars: ahead, behind, level and across the start line', () => {
  assert.equal(alongsidePosition(2, 4, 4), 0.5);
  assert.equal(alongsidePosition(-8, 4, 4), -1);
  assert.equal(alongsidePosition(0, 4, 4), 0);
  assert.ok(Math.abs(offsetMetersFromFractions(0.999, 0.001, 1000) - 2) < 1e-9);
  assert.ok(Math.abs(offsetMetersFromFractions(0.001, 0.999, 1000) + 2) < 1e-9);
});
