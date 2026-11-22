// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  gapBasis,
  SessionPhaseTracker,
  showsPitIndicators,
  showsPositionChange,
} from './sessionPhase.ts';

type Session = Parameters<SessionPhaseTracker['update']>[0]['session'];
const session = (patch: Partial<Session> = {}): Session => ({
  type: 'race',
  name: 'Race',
  flag: null,
  flagDetail: null,
  timeRemainingSeconds: 1200,
  sessionTimeSeconds: 10,
  ...patch,
});

test('a race waits on the grid until the green flag', () => {
  const tracker = new SessionPhaseTracker();
  assert.equal(tracker.phase, 'waiting');
  assert.equal(tracker.update({ session: session({ flagDetail: 'startReady' }) }), 'grid');
  assert.equal(
    tracker.update({ session: session({ flagDetail: 'startSet', sessionTimeSeconds: 11 }) }),
    'grid',
  );
  assert.equal(
    tracker.update({ session: session({ flagDetail: 'green', sessionTimeSeconds: 12 }) }),
    'running',
  );
  // The green does not send it back to the grid when the flag clears.
  assert.equal(tracker.update({ session: session({ sessionTimeSeconds: 40 }) }), 'running');
});

test('a race without a flag yet is on the grid; a lap means it started', () => {
  const tracker = new SessionPhaseTracker();
  assert.equal(tracker.update({ session: session(), leaderLapsCompleted: 0 }), 'grid');
  assert.equal(
    tracker.update({ session: session({ sessionTimeSeconds: 20 }), leaderLapsCompleted: 1 }),
    'running',
  );
});

test('practice and qualifying run at once', () => {
  const tracker = new SessionPhaseTracker();
  assert.equal(
    tracker.update({ session: session({ type: 'practice', name: 'Practice' }) }),
    'running',
  );
  assert.equal(
    tracker.update({ session: session({ type: 'qualify', name: 'Qualify' }) }),
    'running',
  );
});

test('the flag, then the focused car taking it, then the clock', () => {
  const tracker = new SessionPhaseTracker();
  tracker.update({ session: session({ flagDetail: 'green' }) });
  assert.equal(
    tracker.update({ session: session({ flagDetail: 'checkered', sessionTimeSeconds: 100 }) }),
    'checkered',
  );
  assert.equal(
    tracker.update({
      session: session({ flagDetail: 'checkered', sessionTimeSeconds: 101 }),
      reference: { flag: 'checkered', lapsCompleted: 30 },
    }),
    'finished',
  );
  const other = new SessionPhaseTracker();
  other.update({ session: session({ flagDetail: 'green' }) });
  other.update({ session: session({ flagDetail: 'checkered', sessionTimeSeconds: 100 }) });
  assert.equal(
    other.update({ session: session({ timeRemainingSeconds: 0, sessionTimeSeconds: 101 }) }),
    'finished',
  );
});

test('a new session, or the clock going back, starts over', () => {
  const tracker = new SessionPhaseTracker();
  tracker.update({ session: session({ flagDetail: 'green', sessionTimeSeconds: 500 }) });
  assert.equal(
    tracker.update({ session: session({ flagDetail: 'startReady', sessionTimeSeconds: 2 }) }),
    'grid',
  );
  tracker.update({ session: session({ flagDetail: 'green', sessionTimeSeconds: 30 }) });
  assert.equal(
    tracker.update({ session: session({ name: 'Race 2', sessionTimeSeconds: 31 }) }),
    'grid',
  );
});

test('what each phase shows', () => {
  assert.equal(gapBasis('race', 'grid'), 'best-lap');
  assert.equal(gapBasis('race', 'running'), 'race');
  assert.equal(gapBasis('practice', 'running'), 'best-lap');
  assert.equal(showsPositionChange('race', 'grid'), false);
  assert.equal(showsPositionChange('race', 'checkered'), true);
  assert.equal(showsPositionChange('qualify', 'running'), false);
  assert.equal(showsPitIndicators('race', 'running'), true);
  assert.equal(showsPitIndicators('race', 'checkered'), false);
});
