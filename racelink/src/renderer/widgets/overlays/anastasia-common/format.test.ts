import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  formatClock,
  formatGapTime,
  formatGear,
  formatLapTime,
  formatLicence,
  formatPitTime,
  formatRating,
  formatSpeed,
  formatTemperature,
  formatTotalTime,
  readableColor,
  sessionLetter,
  textOn,
} from './format.ts';

describe('formatLapTime', () => {
  it('prints minutes, seconds and the decimals asked for', () => {
    assert.equal(formatLapTime(122.3, 1), '2:02.3');
    assert.equal(formatLapTime(122.3456, 3), '2:02.346');
    assert.equal(formatLapTime(59.96, 1), '1:00.0');
    assert.equal(formatLapTime(65, 0), '1:05');
  });
  it('shows a dash for nothing', () => {
    assert.equal(formatLapTime(null), '-:--.-');
    assert.equal(formatLapTime(-1), '-:--.-');
  });
});

describe('formatGapTime', () => {
  it('prints seconds below a minute and minutes above', () => {
    assert.equal(formatGapTime(6.7), '6.7');
    assert.equal(formatGapTime(79.9), '1:19.9');
    assert.equal(formatGapTime(100), '1:40.0');
    assert.equal(formatGapTime(-8.74), '8.7');
    assert.equal(formatGapTime(null), '');
  });
});

describe('formatPitTime', () => {
  it('prints short stops with a decimal and long ones as a clock', () => {
    assert.equal(formatPitTime(34.5), '34.5');
    assert.equal(formatPitTime(63), '1:03');
    assert.equal(formatPitTime(null), '');
  });
});

describe('formatClock and formatTotalTime', () => {
  it('prints a clock', () => {
    assert.equal(formatClock(3 * 3600 + 38 * 60 + 15), '3:38:15');
    assert.equal(formatClock(75), '1:15');
    assert.equal(formatClock(null), '--:--');
  });
  it('prints a session length compactly', () => {
    assert.equal(formatTotalTime(4 * 3600), '4h');
    assert.equal(formatTotalTime(45 * 60), '45m');
    assert.equal(formatTotalTime(3600 + 30 * 60), '1:30:00');
    assert.equal(formatTotalTime(null), '');
  });
});

describe('ratings and licences', () => {
  it('shortens iRating from a thousand', () => {
    assert.equal(formatRating(4800), '4.8k');
    assert.equal(formatRating(950), '950');
    assert.equal(formatRating(null), '');
  });
  it('joins class and safety rating', () => {
    assert.equal(formatLicence('A', 4.42), 'A4.4');
    assert.equal(formatLicence('R', null), 'R');
    assert.equal(formatLicence('', 3), '');
  });
});

describe('small formats', () => {
  it('letters the session', () => {
    assert.equal(sessionLetter('race'), 'R');
    assert.equal(sessionLetter('qualify'), 'Q');
    assert.equal(sessionLetter('hotlap'), 'TA');
    assert.equal(sessionLetter('other'), '');
  });
  it('converts temperature and speed', () => {
    assert.equal(formatTemperature(19.4, false), '19°C');
    assert.equal(formatTemperature(20, true), '68°F');
    assert.equal(formatSpeed(251, false), '251');
    assert.equal(formatSpeed(100, true), '62');
  });
  it('names gears', () => {
    assert.equal(formatGear(-1), 'R');
    assert.equal(formatGear(0), 'N');
    assert.equal(formatGear(5), '5');
    assert.equal(formatGear(null), '');
  });
  it('picks text for a background', () => {
    assert.equal(textOn('#ffffff'), '#111111');
    assert.equal(textOn('#112233'), '#ffffff');
    assert.equal(textOn('nonsense'), '#ffffff');
  });
});

describe('readableColor', () => {
  const luma = (hex: string): number => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
  };
  it('keeps a bright colour', () => {
    assert.equal(readableColor('#00ff7f'), '#00ff7f');
  });
  it('lightens a dark one', () => {
    const out = readableColor('#0000ff');
    assert.ok(luma(out) >= 0.41);
    assert.match(out, /^#[0-9a-f]{6}$/);
  });
  it('falls back when unset or malformed', () => {
    assert.equal(readableColor(null, '#abcdef'), '#abcdef');
    assert.equal(readableColor('red', '#abcdef'), '#abcdef');
  });
});
