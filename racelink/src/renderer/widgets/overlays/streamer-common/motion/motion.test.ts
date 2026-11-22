// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ColumnPresence } from './columnPresence.ts';
import { ColumnMotion, columnTrack } from './columnMotion.ts';
import { planRows, type Box } from './rowPlan.ts';
import { fitStep, smallestScale, type FitMeasure } from './fitBoard.ts';
import { buildStandings, defaultStandingsOptions } from '../standingsModel.ts';
import { limitStandingsRows } from '../trimRows.ts';
import { makeDriver } from '../testDrivers.ts';

test('a column with data shows at once and holds when the data goes', () => {
  const presence = new ColumnPresence(4000);
  assert.deepEqual([...presence.update(0, { rating: false, name: true }).visible], ['name']);
  assert.deepEqual([...presence.update(100, { rating: true, name: true }).visible].sort(), [
    'name',
    'rating',
  ]);
  const held = presence.update(2000, { rating: false, name: true });
  assert.ok(held.visible.has('rating'));
  assert.equal(held.nextCheckMs, 2100);
  // Data returns: the hold starts over.
  presence.update(3000, { rating: true, name: true });
  assert.ok(presence.update(6500, { rating: false, name: true }).visible.has('rating'));
  assert.ok(!presence.update(7100, { rating: false, name: true }).visible.has('rating'));
});

test('a column that leaves the table is forgotten', () => {
  const presence = new ColumnPresence(1000);
  presence.update(0, { a: true });
  assert.equal(presence.update(10, {}).visible.size, 0);
  assert.equal(presence.update(20, { a: false }).visible.size, 0);
});

test('a column opens over the duration and closes the same way', () => {
  const motion = new ColumnMotion(200);
  motion.set(0, 'gap', 1, false);
  assert.equal(motion.progress('gap', 0), 1);
  assert.ok(motion.settled('gap', 0));
  motion.set(1000, 'gap', 0, true);
  assert.ok(motion.rendered('gap', 1050));
  const mid = motion.progress('gap', 1100);
  assert.ok(mid > 0 && mid < 1);
  assert.ok(!motion.settled('gap', 1100));
  assert.equal(motion.progress('gap', 1200), 0);
  assert.ok(!motion.rendered('gap', 1200));
});

test('a column that turns back halfway continues from where it is', () => {
  const motion = new ColumnMotion(200);
  motion.set(0, 'x', 0, false);
  motion.set(0, 'x', 1, true);
  const at = motion.progress('x', 100);
  motion.set(100, 'x', 0, true);
  assert.ok(Math.abs(motion.progress('x', 100) - at) < 1e-9);
  assert.ok(motion.progress('x', 150) < at);
});

test('a new column animates in when asked, and is just there when not', () => {
  const motion = new ColumnMotion(200);
  motion.set(0, 'a', 1, true);
  assert.equal(motion.progress('a', 0), 0);
  assert.ok(motion.rendered('a', 0));
  motion.set(0, 'b', 1, false);
  assert.equal(motion.progress('b', 0), 1);
  assert.ok(!motion.allSettled(50));
  assert.ok(motion.allSettled(250));
});

test('a moving column scales its length; an open one keeps its width', () => {
  assert.equal(columnTrack('gap', '3.9em', '4em', 1, false), '3.9em');
  assert.equal(columnTrack('gap', '3.9em', '4em', 0.5, true), 'calc(3.9em * var(--fx-c-gap, 0.500))');
  assert.equal(
    columnTrack('r', 'max-content', '6em', 0.25, true),
    'calc(6em * var(--fx-c-r, 0.250))',
  );
});

const box = (top: number): Box => ({ top, left: 0, width: 100, height: 20 });

test('rows that changed place move by the distance they were off', () => {
  const prev = new Map([['a', box(0)], ['b', box(20)], ['c', box(40)], ['d', box(60)]]);
  const next = new Map([['b', box(0)], ['a', box(20)], ['c', box(40)], ['d', box(60)]]);
  const plan = planRows(prev, next);
  assert.deepEqual(plan.moves, [
    { key: 'b', dy: 20 },
    { key: 'a', dy: -20 },
  ]);
  assert.deepEqual([plan.enters, plan.leaves, plan.reset], [[], [], false]);
});

test('new and gone rows are told apart', () => {
  const prev = new Map([['a', box(0)], ['b', box(20)], ['c', box(40)], ['d', box(60)]]);
  const next = new Map([['a', box(0)], ['b', box(20)], ['c', box(40)], ['e', box(60)]]);
  const plan = planRows(prev, next);
  assert.deepEqual(plan.enters, ['e']);
  assert.deepEqual(plan.leaves, ['d']);
  assert.ok(!plan.reset);
});

test('a first draw or a wholesale change is not animated', () => {
  const rows = new Map([['a', box(0)], ['b', box(20)], ['c', box(40)], ['d', box(60)]]);
  assert.ok(planRows(new Map(), rows).reset);
  const other = new Map([['w', box(0)], ['x', box(20)], ['y', box(40)], ['z', box(60)]]);
  assert.ok(planRows(rows, other).reset);
});

const measure = (patch: Partial<FitMeasure>): FitMeasure => ({
  scale: 1,
  capacity: 10,
  maxScale: 1,
  viewportWidth: 500,
  viewportHeight: 400,
  neededWidth: 400,
  rowCount: 10,
  rowPitch: 20,
  freeHeight: 0,
  tallHeight: 300,
  ...patch,
});

test('a board wider than the window scales down, never below the floor', () => {
  assert.equal(fitStep(measure({ neededWidth: 1000 })).scale, 0.5);
  assert.equal(fitStep(measure({ neededWidth: 5000 })).scale, smallestScale);
  assert.equal(fitStep(measure({})).scale, 1);
});

test('rows that overflow the height are dropped; spare height adds rows', () => {
  assert.equal(fitStep(measure({ freeHeight: -45 })).capacity, 7);
  assert.equal(fitStep(measure({ freeHeight: 65 })).capacity, 13);
  // A short field (fewer rows than allowed) leaves the space free.
  assert.equal(fitStep(measure({ rowCount: 6, freeHeight: 100 })).capacity, 10);
});

test('with one row left that still does not fit the board scales to the height', () => {
  const result = fitStep(measure({ capacity: 1, rowCount: 1, freeHeight: -50, tallHeight: 800 }));
  assert.equal(result.scale, 0.5);
  assert.equal(result.capacity, 1);
});

const field = (): ReturnType<typeof makeDriver>[] => [
  ...Array.from({ length: 12 }, (_, at) =>
    makeDriver({ carIdx: at, position: at + 1, classPosition: at + 1, classId: 1, isFocused: at === 6 }),
  ),
  ...Array.from({ length: 5 }, (_, at) =>
    makeDriver({ carIdx: 20 + at, position: 13 + at, classPosition: at + 1, classId: 2 }),
  ),
];

test('maxRows keeps the focused car and the leader and trims other classes first', () => {
  const build = (maxRows: number | undefined) =>
    buildStandings({
      drivers: field(),
      classes: [],
      referenceCarIdx: 6,
      sessionType: 'race',
      phase: 'racing',
      options: { ...defaultStandingsOptions, topRows: 3, bottomRows: 6, multiclassRows: 3, maxRows },
    });
  const whole = build(undefined);
  const total = whole.reduce((sum, group) => sum + group.rows.length, 0);
  const less = build(total - 2);
  assert.equal(less.reduce((sum, group) => sum + group.rows.length, 0), total - 2);
  assert.equal(less[1]?.rows.length, 1);
  const tiny = build(2);
  assert.equal(tiny.length, 1);
  assert.deepEqual(
    tiny[0]?.rows.map((row) => row.driver.carIdx),
    [0, 6],
  );
  assert.equal(tiny[0]?.rows[0]?.cutBelow, true);
  assert.equal(build(1)[0]?.rows[0]?.driver.carIdx, 6);
});

test('limiting a table that fits changes nothing', () => {
  const groups = buildStandings({
    drivers: field(),
    classes: [],
    referenceCarIdx: 6,
    sessionType: 'race',
    phase: 'racing',
  });
  assert.deepEqual(limitStandingsRows(groups, 500), groups);
});
