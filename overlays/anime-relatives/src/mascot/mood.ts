import type { FxKind } from '../phrases';

/** How the mascot feels, and so how she moves. */
export type Mood = 'idle' | 'celebrate' | 'shocked' | 'cheer' | 'dance';

export const moodOf: Readonly<Record<FxKind, Mood>> = {
  pass: 'celebrate',
  passed: 'shocked',
  battle: 'cheer',
  best: 'dance',
  finish: 'dance',
};

/** How long she reacts to a moment, ms. */
export const reactionMs = 3400;
