// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  circularMeters,
  OvertakeTracker,
  Preloader,
  Presenter,
  splitCarName,
  type CarSample,
} from './overtake.ts';

const car = (rel: number | null, eligible = true, carIdx = 1): CarSample => ({ carIdx, relMeters: rel, eligible });

/** Runs a car through `rels` at 100 ms steps; returns the times it was reported. */
const run = (rels: readonly number[], tracker = new OvertakeTracker(), start = 0): number[] => {
  const hits: number[] = [];
  rels.forEach((rel, i) => {
    const t = start + i * 100;
    if (tracker.update(t, [car(rel)], true).length > 0) hits.push(t);
  });
  return hits;
};

const sweep = (from: number, to: number, step: number): number[] => {
  const out: number[] = [];
  for (let v = from; step < 0 ? v >= to : v <= to; v += step) out.push(v);
  return out;
};

test('circular distance takes the short way across the start line', () => {
  assert.ok(Math.abs(circularMeters(0.99, 0.01, 5000) - 100) < 1e-6);
  assert.ok(Math.abs(circularMeters(0.01, 0.99, 5000) + 100) < 1e-6);
  assert.equal(circularMeters(0.2, 0.2, 5000), 0);
});

test('a car passed on the track is reported once, after it stays behind', () => {
  const hits = run([...sweep(40, -20, -2), ...Array<number>(20).fill(-20)]);
  assert.equal(hits.length, 1);
});

test('a pass found from distance works where the standings do not move', () => {
  // The standings are not an input at all: only the distance decides.
  const hits = run([10, 8, 5, 2, -2, -5, -9, -12, -15, -15, -15, -15, -15, -15, -15, -15, -15]);
  assert.equal(hits.length, 1);
});

test('a pass and a re-pass within the confirmation time shows nothing', () => {
  const hits = run([20, 10, -5, -10, -10, -5, 10, 20, 30, 30, 30, 30, 30, 30, 30, 30, 30]);
  assert.deepEqual(hits, []);
});

test('a car that was never ahead is not passed (it fell back from alongside)', () => {
  assert.deepEqual(run([0, -1, -4, -10, -12, -12, -12, -12, -12, -12, -12, -12, -12]), []);
});

test('a car far ahead that vanishes behind is a lap wrap, not a pass', () => {
  assert.deepEqual(run([300, -300, -300, -300, -300, -300, -300, -300, -300, -300, -300]), []);
});

test('a car that goes to the pits is forgotten and does not count', () => {
  const tracker = new OvertakeTracker();
  tracker.update(0, [car(20)], true);
  tracker.update(100, [car(5)], true);
  tracker.update(200, [car(-1, false)], true); // pit lane
  const hits: number[] = [];
  for (let t = 300; t < 2000; t += 100) {
    if (tracker.update(t, [car(-15)], true).length > 0) hits.push(t);
  }
  assert.deepEqual(hits, []);
});

test('the same car is not shown again within the cooldown', () => {
  const tracker = new OvertakeTracker({ cooldownMs: 20000 });
  const pass = [...sweep(30, -20, -5), ...Array<number>(12).fill(-20)];
  const again = [...sweep(-20, 30, 5), ...sweep(30, -20, -5), ...Array<number>(12).fill(-20)];
  const first = run(pass, tracker, 0);
  const second = run(again, tracker, 3000);
  assert.equal(first.length, 1);
  assert.equal(second.length, 0);
  const third = run(again, tracker, 40000);
  assert.equal(third.length, 1);
});

test('nothing is found while the detector is not active', () => {
  const tracker = new OvertakeTracker();
  const rels = [...sweep(40, -20, -2), ...Array<number>(20).fill(-20)];
  const hits = rels.flatMap((rel, i) => tracker.update(i * 100, [car(rel)], false));
  assert.deepEqual(hits, []);
});

test('several cars passed at once are all reported', () => {
  const tracker = new OvertakeTracker();
  const found: number[] = [];
  for (let i = 0; i < 40; i += 1) {
    const base = 30 - i * 2;
    const samples = [car(base, true, 1), car(base + 8, true, 2)];
    found.push(...tracker.update(i * 100, samples, true));
  }
  for (let i = 40; i < 60; i += 1) {
    found.push(...tracker.update(i * 100, [car(-50, true, 1), car(-42, true, 2)], true));
  }
  assert.deepEqual([...found].sort(), [1, 2]);
});

test('the queue shows passes one after another and shortens banners while others wait', () => {
  const p = new Presenter({ displayMs: 4000, minDisplayMs: 2000, inMs: 400, outMs: 200, gapMs: 100 });
  p.push(7, 0);
  p.push(8, 10);
  p.push(7, 20); // a duplicate
  assert.equal(p.pending, 2);
  assert.equal(p.view(0)?.pass.carIdx, 7);
  assert.equal(p.view(100)?.phase, 'in');
  assert.equal(p.view(1000)?.phase, 'shown');
  assert.equal(p.view(2100)?.phase, 'out'); // shortened: 8 is waiting
  assert.equal(p.view(2150)?.pass.carIdx, 7);
  assert.equal(p.view(2250), null); // the gap
  assert.equal(p.view(2500)?.pass.carIdx, 8);
  assert.equal(p.view(2500 + 3000)?.phase, 'shown'); // alone: the full time
  assert.equal(p.view(2500 + 4300), null);
});

test('the queue is limited and stale passes are dropped', () => {
  const p = new Presenter({ maxQueue: 2, staleMs: 1000 });
  p.push(1, 0);
  p.push(2, 0);
  p.push(3, 0);
  assert.equal(p.pending, 2);
  assert.equal(p.view(5000), null); // all older than staleMs
});

test('a car name splits into brand and model', () => {
  assert.deepEqual(splitCarName('Ferrari 296 GT3'), { brand: 'Ferrari', model: '296 GT3' });
  assert.deepEqual(splitCarName('Aston Martin Vantage GT4'), { brand: 'Aston Martin', model: 'Vantage GT4' });
  assert.deepEqual(splitCarName('Mercedes-AMG GT3 2020'), { brand: 'Mercedes-AMG', model: 'GT3 2020' });
  assert.deepEqual(splitCarName('  Skip   Barber '), { brand: 'Skip', model: 'Barber' });
  assert.deepEqual(splitCarName('Mustang'), { brand: '', model: 'Mustang' });
  assert.deepEqual(splitCarName(''), { brand: '', model: '' });
});

test('the preloader asks for each picture once, a few at a time', async () => {
  const started: string[] = [];
  const releases: (() => void)[] = [];
  const preloader = new Preloader(
    (url) =>
      new Promise<void>((resolve, reject) => {
        started.push(url);
        releases.push(url === 'bad' ? () => { reject(new Error('404')); } : resolve);
      }),
    2,
  );
  preloader.request(['a', 'b', null, 'c', 'a', 'bad']);
  assert.deepEqual(started, ['a', 'b']);
  releases[0]?.();
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(started, ['a', 'b', 'c']);
  preloader.request(['c', 'd']);
  releases[1]?.();
  releases[2]?.();
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(started, ['a', 'b', 'c', 'bad', 'd']);
});
