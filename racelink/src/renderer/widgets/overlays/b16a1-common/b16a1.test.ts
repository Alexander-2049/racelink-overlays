// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { makeDriver } from '../streamer-common/testDrivers.ts';
import {
  clockTime,
  deltaText,
  driverName,
  durationShort,
  gapSeconds,
  lapTime,
  percentText,
  ratingText,
  sessionLetter,
  temperatureText,
  timeOfDay,
} from './format.ts';
import { footerLap, fuelFraction, incidentsText, relativeGapText, rowTone } from './relativesView.ts';
import { buildStandingsView, classLaps, referenceCarIdx } from './standingsView.ts';
import { themeIds, themeOf, themeVars, windColor } from './themes.ts';

test('lap times and gaps', () => {
  assert.equal(lapTime(107.131), '1:47.131');
  // Rounding up to a whole second never prints a thousand milliseconds.
  assert.equal(lapTime(59.9996), '0:59.999');
  assert.equal(lapTime(null), '');
  assert.equal(lapTime(-1), '');
  assert.equal(gapSeconds(1.892), '1.892');
  assert.equal(gapSeconds(123.456), '123.46');
  assert.equal(deltaText(0.43), '0.4');
  assert.equal(deltaText(-36.2), '36');
});

test('ratings, clocks and temperatures', () => {
  assert.equal(ratingText(6204, false), '6204');
  assert.equal(ratingText(6204, true), '6.2k');
  assert.equal(ratingText(850, true), '850');
  assert.equal(clockTime(653), '10:53');
  assert.equal(clockTime(3909), '1:05:09');
  assert.equal(clockTime(null), '');
  assert.equal(clockTime(10 * 24 * 3600), '');
  assert.equal(durationShort(2700), '45m');
  assert.equal(durationShort(5400), '1h30m');
  assert.equal(durationShort(7200), '2h');
  assert.equal(timeOfDay(20 * 3600 + 35 * 60), '20:35');
  assert.equal(timeOfDay(20 * 3600 + 35 * 60, true), '8:35 PM');
  assert.equal(temperatureText(18.8, false), '18.8°C');
  assert.equal(temperatureText(20, true), '68.0°F');
  assert.equal(percentText(0.843), '84.3%');
  assert.equal(percentText(null), '');
});

test('driver names and session letters', () => {
  const driver = { name: 'Francesco Mautone', firstName: 'Francesco', lastName: 'Mautone' };
  assert.equal(driverName(driver, 'full'), 'Francesco Mautone');
  assert.equal(driverName(driver, 'initial'), 'F. Mautone');
  assert.equal(driverName(driver, 'last'), 'Mautone');
  assert.equal(driverName(driver, 'short'), 'Mautone F.');
  assert.equal(driverName({ name: 'Solo', firstName: 'Solo', lastName: '' }, 'last'), 'Solo');
  assert.equal(sessionLetter('race'), 'R');
  assert.equal(sessionLetter('qualify'), 'Q');
  assert.equal(sessionLetter('other'), '');
});

test('relatives: tone, incidents, fuel, gaps and the lap footer', () => {
  assert.equal(rowTone({ classId: 1 }, true, 1), 'reference');
  assert.equal(rowTone({ classId: 1 }, false, 1), 'same');
  assert.equal(rowTone({ classId: 2 }, false, 1), 'other');
  assert.equal(incidentsText({ count: 8, warningInitialLimit: 17, limit: 25 }), '8/17/25');
  assert.equal(incidentsText({ count: 3, warningInitialLimit: null, limit: null }), '3');
  assert.equal(incidentsText({ count: null, warningInitialLimit: 17, limit: 25 }), '');
  assert.equal(incidentsText(null), '');
  assert.equal(fuelFraction(23.25, 50), 0.465);
  assert.equal(fuelFraction(5, null), null);
  assert.equal(fuelFraction(80, 50), 1);
  assert.equal(relativeGapText(-2.84, false), '2.8');
  assert.equal(relativeGapText(null, false), '');
  assert.equal(relativeGapText(null, true), '0.0');
  assert.equal(footerLap({ lap: 17, lapsTotal: null, estimatedTotalLaps: 23.09 }), '17/≈23.09');
  assert.equal(footerLap({ lap: 4, lapsTotal: 20, estimatedTotalLaps: null }), '4/20');
  assert.equal(footerLap({ lap: 0, lapsTotal: 20, estimatedTotalLaps: null }), '');
});

test('themes: every id is valid, unknown falls back to the first, opacity is clamped', () => {
  for (const id of themeIds) {
    const vars = themeVars(id, 80);
    assert.equal(vars['--b-alpha'], '0.8');
    assert.match(vars['--b-bg'] ?? '', /^\d+ \d+ \d+$/);
    assert.match(vars['--b-accent'] ?? '', /^#[0-9a-f]{6}$/);
  }
  assert.equal(themeOf('nope'), 'b16a1');
  assert.equal(themeVars('b16a1', 250)['--b-alpha'], '1');
  assert.equal(themeVars('b16a1', -5)['--b-alpha'], '0');
  assert.equal(themeVars('b16a1', Number.NaN)['--b-alpha'], '1');
  assert.notEqual(windColor(0), windColor(1));
  assert.equal(windColor(5), windColor(1));
});

test('every overlay of the set offers exactly the themes of the code, default first', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../../overlays');
  const ids = fs.readdirSync(root).filter((name) => name.startsWith('b16a1-'));
  assert.ok(ids.length >= 5);
  for (const id of ids) {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, id, 'racelink.overlay.json'), 'utf8'),
    ) as { settings: { pages: { groups: { settings: { key: string; default: unknown; options?: { value: string }[] }[] }[] }[] } };
    const settings = manifest.settings.pages.flatMap((page) =>
      page.groups.flatMap((group) => group.settings),
    );
    const theme = settings.find((setting) => setting.key === 'theme');
    assert.ok(theme, `${id} has a theme setting`);
    assert.deepEqual(
      theme.options?.map((option) => option.value),
      [...themeIds],
      id,
    );
    assert.equal(theme.default, themeIds[0], id);
  }
});

const options = { topRows: 5, bottomRows: 15, numClasses: 3, multiclassRows: 3, condensed: true };
const session = (patch: Record<string, unknown> = {}) =>
  ({
    type: 'race',
    name: 'Race',
    lap: 17,
    lapsTotal: null,
    estimatedTotalLaps: null,
    sessionTimeSeconds: 2047,
    sessionDurationSeconds: 2700,
    timeRemainingSeconds: 653,
    classes: [],
    ...patch,
  }) as never;

test('class laps: a lap limit, an estimate from the clock, and nothing without a pace', () => {
  const leader = makeDriver({
    carIdx: 1,
    classPosition: 1,
    lapsCompleted: 19,
    raceDistanceLaps: 19.5,
    lapAverageSeconds: { last5: 107, last10: null },
  });
  const limited = classLaps(session({ lapsTotal: 30 }), leader, undefined, 'running');
  assert.deepEqual(limited, { lap: 20, total: '30' });
  const timed = classLaps(session(), leader, undefined, 'running');
  assert.equal(timed.lap, 20);
  // 19.5 laps run, 653 s left at 107 s a lap.
  assert.equal(timed.total, `≈${(19.5 + 653 / 107).toFixed(2)}`);
  const noPace = classLaps(
    session(),
    makeDriver({ carIdx: 2, classPosition: 1, lapsCompleted: 3 }),
    undefined,
    'running',
  );
  assert.equal(noPace.total, '');
  assert.equal(classLaps(session(), leader, undefined, 'grid').lap, 0);
  // The focused car's own class takes the game's estimate.
  const own = makeDriver({ carIdx: 3, classId: 1, lap: 17 });
  assert.equal(
    classLaps(session({ estimatedTotalLaps: 23.09 }), leader, own, 'running').total,
    '≈23.09',
  );
});

test('the standings view: headers, lap-time flags, pit cells and the gain history', () => {
  const me = makeDriver({
    carIdx: 0,
    isFocused: true,
    classPosition: 2,
    position: 2,
    lapsCompleted: 5,
    lastLapSeconds: 100,
    bestLapSeconds: 99,
    lapHistorySeconds: [101, 100, 100],
    startClassPosition: 3,
  });
  const leader = makeDriver({
    carIdx: 1,
    classPosition: 1,
    position: 1,
    lapsCompleted: 6,
    lastLapSeconds: 98.5,
    bestLapSeconds: 98.5,
    hasClassBestLap: true,
    lapHistorySeconds: [99, 98.6, 98.5],
    pit: { ...makeDriver({ carIdx: 9 }).pit, lastStopLap: 4, lastStopSeconds: 44.3 },
  });
  const other = makeDriver({ carIdx: 2, classId: 2, className: 'LMP2', classPosition: 1, position: 3 });
  const view = buildStandingsView({
    drivers: [me, leader, other],
    session: session({ type: 'race' }),
    weather: { airTemperatureC: 18.8, trackTemperatureC: 20, humidityFraction: 0.843 },
    phase: 'running',
    options,
    lapTimeSource: 'last',
    historyLimit: 3,
  });
  assert.equal(referenceCarIdx([me, leader]), 0);
  assert.equal(view.length, 2);
  const first = view[0];
  assert.ok(first);
  assert.equal(first.isFirst, true);
  assert.equal(first.header.sessionLetter, 'R');
  assert.equal(first.header.time, '10:53');
  assert.equal(first.header.timeTotal, '45m');
  assert.equal(first.header.driverCount, 2);
  const [leaderRow, meRow] = first.rows;
  assert.ok(leaderRow && meRow);
  // The leader's last lap is his class best and his best; the focused car's lap is old and his best of 99 is not.
  assert.equal(leaderRow.lapTime.classBest, true);
  assert.equal(leaderRow.lapTime.personalBest, true);
  assert.equal(meRow.lapTime.stale, true);
  assert.equal(meRow.lapTime.personalBest, false);
  assert.deepEqual(leaderRow.pit, { kind: 'last', lap: 4, seconds: 44.3 });
  assert.equal(meRow.pit, null);
  assert.equal(meRow.history, null);
  // The leader was faster than the focused car on each of the last laps.
  assert.deepEqual(
    leaderRow.history?.map((cell) => (cell.seconds === null ? null : Math.round(cell.seconds * 10) / 10)),
    [2, 1.4, 1.5],
  );
  assert.equal(view[1]?.isFirst, false);
  assert.equal(view[1]?.header.className, 'LMP2');
});

test('a car in the pit lane shows PIT with its time, only in a race', () => {
  const me = makeDriver({ carIdx: 0, isFocused: true, classPosition: 1, position: 1 });
  const pitting = makeDriver({
    carIdx: 1,
    classPosition: 2,
    position: 2,
    onPitRoad: true,
    trackSurface: 'pitStall',
    pit: { ...makeDriver({ carIdx: 9 }).pit, timeInPitSeconds: 24 },
  });
  const make = (type: string) =>
    buildStandingsView({
      drivers: [me, pitting],
      session: session({ type }),
      weather: { airTemperatureC: null, trackTemperatureC: null, humidityFraction: null },
      phase: 'running',
      options,
      lapTimeSource: 'last',
      historyLimit: 3,
    })[0]?.rows[1]?.pit;
  assert.deepEqual(make('race'), { kind: 'in', seconds: 24 });
  assert.equal(make('practice'), null);
});
