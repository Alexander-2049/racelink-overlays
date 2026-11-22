// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  historyText,
  historyTone,
  incidentsText,
  lapCounterText,
  sessionClockText,
  sessionLetter,
} from './sessionInfo.ts';

test('session letters', () => {
  assert.equal(sessionLetter('race'), 'R');
  assert.equal(sessionLetter('qualify'), 'Q');
  assert.equal(sessionLetter('practice'), 'P');
  assert.equal(sessionLetter('warmup'), 'W');
});

test('the clock shows time left over the length, and falls back to time elapsed', () => {
  const base = { timeRemainingSeconds: 541, sessionTimeSeconds: 13859, sessionDurationSeconds: 14400 };
  assert.equal(sessionClockText(base, 'remaining'), '9:01/4h');
  assert.equal(sessionClockText(base, 'elapsed'), '3:50:59/4h');
  // "Unlimited" sessions report a huge time left: the clock counts up and has no length.
  const unlimited = {
    timeRemainingSeconds: 604800 * 2,
    sessionTimeSeconds: 125,
    sessionDurationSeconds: 604800 * 2,
  };
  assert.equal(sessionClockText(unlimited, 'remaining'), '2:05');
  const unknown = { timeRemainingSeconds: null, sessionTimeSeconds: 60, sessionDurationSeconds: null };
  assert.equal(sessionClockText(unknown, 'remaining'), '1:00');
});

test('the lap counter: fixed laps, an estimate, or the lap alone', () => {
  assert.equal(
    lapCounterText(113, { lapsTotal: null, estimatedTotalLaps: 116.6667 }, 2),
    '113/≈116.67',
  );
  assert.equal(
    lapCounterText(112, { lapsTotal: null, estimatedTotalLaps: 116.6667 }, 1),
    '112/≈116.7',
  );
  assert.equal(lapCounterText(12, { lapsTotal: 30, estimatedTotalLaps: 30 }, 2), '12/30');
  assert.equal(lapCounterText(4, { lapsTotal: null, estimatedTotalLaps: null }, 2), '4');
  assert.equal(lapCounterText(null, { lapsTotal: 30, estimatedTotalLaps: null }, 2), '');
});

test('incidents with and without a limit', () => {
  assert.equal(incidentsText({ count: 14, limit: null }), '14');
  assert.equal(incidentsText({ count: 4, limit: 17 }), '4/17');
  assert.equal(incidentsText({ count: null, limit: 17 }), '');
  assert.equal(incidentsText(null), '');
});

test('gain history tone and text', () => {
  assert.equal(historyTone(0.4), 'quicker');
  assert.equal(historyTone(-0.2), 'slower');
  assert.equal(historyTone(0.02), 'level');
  assert.equal(historyText(-0.29), '0.2');
  assert.equal(historyText(42.6), '43');
});
