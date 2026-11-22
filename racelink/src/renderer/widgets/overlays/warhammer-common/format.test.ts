// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  formatDuration,
  formatGap,
  formatIRating,
  formatLapTime,
  formatLicence,
  formatName,
  formatPitTime,
  formatRelative,
  formatSeconds,
  formatTemperature,
  formatTimeOfDay,
  formatTotalDuration,
  safeColor,
  textOn,
} from './format.ts';

test('lap times and gaps cut, never round up, and switch to minutes at 60 s', () => {
  assert.equal(formatLapTime(122.2), '2:02.2');
  assert.equal(formatLapTime(121.96), '2:01.9');
  assert.equal(formatLapTime(59.96), '59.9');
  assert.equal(formatLapTime(122.236, 3), '2:02.236');
  assert.equal(formatLapTime(null), '--:--.-');
  assert.equal(formatLapTime(0), '--:--.-');
  assert.equal(formatSeconds(61, 0), '1:01');
  assert.equal(formatGap(23.94), '23.9');
  assert.equal(formatGap(102.1), '1:42.1');
  assert.equal(formatGap(null), '');
  assert.equal(formatGap(Number.NaN), '');
});

test('time to a car, with or without a sign', () => {
  assert.equal(formatRelative(-3.24, 1, false), '3.2');
  assert.equal(formatRelative(-3.24, 1, true), '-3.2');
  assert.equal(formatRelative(3.24, 1, true), '+3.2');
  assert.equal(formatRelative(0, 1, true), '0.0');
  assert.equal(formatRelative(null, 1, true), '');
});

test('pit time: seconds below a minute, minutes from it', () => {
  assert.equal(formatPitTime(42.64), '42.6');
  assert.equal(formatPitTime(63.9), '1:03');
  assert.equal(formatPitTime(null), '');
});

test('durations and session lengths', () => {
  assert.equal(formatDuration(541), '9:01');
  assert.equal(formatDuration(3909), '1:05:09');
  assert.equal(formatDuration(-1), '-');
  assert.equal(formatTotalDuration(4 * 3600), '4h');
  assert.equal(formatTotalDuration(45 * 60), '45m');
  assert.equal(formatTotalDuration(5400), '1h30m');
  assert.equal(formatTotalDuration(0), '');
});

test('names in each shape; a single name stays whole', () => {
  const driver = { name: 'Mikhail Ivanov3', firstName: 'Mikhail', lastName: 'Ivanov3' };
  assert.equal(formatName(driver, 'initialLast'), 'M. Ivanov3');
  assert.equal(formatName(driver, 'firstLast'), 'Mikhail Ivanov3');
  assert.equal(formatName(driver, 'last'), 'Ivanov3');
  assert.equal(formatName(driver, 'lastInitial'), 'Ivanov3 M.');
  assert.equal(formatName(driver, 'firstInitial'), 'Mikhail I.');
  const single = { name: 'Fernando', firstName: 'Fernando', lastName: '' };
  assert.equal(formatName(single, 'initialLast'), 'Fernando');
  assert.equal(formatName({ name: '', firstName: '', lastName: '' }, 'last'), '?');
  assert.equal(
    formatName({ name: 'Иван Петров', firstName: 'Иван', lastName: 'Петров' }, 'initialLast'),
    'И. Петров',
  );
});

test('iRating, licence and temperature', () => {
  assert.equal(formatIRating(4812), '4.8k');
  assert.equal(formatIRating(4899), '4.8k');
  assert.equal(formatIRating(4812, 'full'), '4812');
  assert.equal(formatIRating(950), '950');
  assert.equal(formatIRating(null), '');
  assert.equal(formatLicence({ className: 'A', safetyRating: 4.49 }), 'A4.4');
  assert.equal(formatLicence({ className: 'B', safetyRating: 1.4 }, 'rating'), '1.4');
  assert.equal(formatLicence({ className: 'R', safetyRating: null }), 'R');
  assert.equal(formatLicence(null), '');
  assert.equal(formatTemperature(19.4, 'celsius'), '19°C');
  assert.equal(formatTemperature(20, 'fahrenheit'), '68°F');
  assert.equal(formatTemperature(null, 'celsius'), '');
});

test('time of day wraps at midnight and honours 12 hour clocks', () => {
  assert.equal(formatTimeOfDay(23 * 3600 + 5 * 60, false), '23:05');
  assert.equal(formatTimeOfDay(25 * 3600, false), '01:00');
  assert.equal(formatTimeOfDay(13 * 3600 + 30 * 60, true), '1:30 PM');
  assert.equal(formatTimeOfDay(0, true), '12:00 AM');
  assert.equal(formatTimeOfDay(null, false), '');
});

test('colours: text on a colour, and only plain hex goes into a style', () => {
  assert.equal(textOn('#ffffff'), '#111111');
  assert.equal(textOn('#0153db'), '#ffffff');
  assert.equal(safeColor('#ff7a1a', '#000'), '#ff7a1a');
  assert.equal(safeColor('red; background: url(x)', '#000'), '#000');
  assert.equal(safeColor(null, '#abc'), '#abc');
});
