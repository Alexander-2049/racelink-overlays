// What the overlay shouts. Japanese glyphs come from the Dela Gothic One subset
// in fonts/: after changing a Japanese phrase run `scripts/subset-font.py`.

export type Language = 'JP' | 'EN' | 'MIX';

/** The moments the overlay reacts to. */
export type FxKind = 'pass' | 'passed' | 'battle' | 'best' | 'finish';

type Phrase = Readonly<{ jp: string; en: string }>;

/** The big comic sound effect drawn in the explosion. */
const sfx: Readonly<Record<FxKind, readonly Phrase[]>> = {
  pass: [
    { jp: 'ドーン!', en: 'BOOM!' },
    { jp: 'ズバッ!', en: 'ZOOM!' },
    { jp: 'ドカーン!', en: 'KABOOM!' },
  ],
  passed: [
    { jp: 'ガーン!', en: 'OOF!' },
    { jp: 'ナニ?!', en: 'NANI?!' },
    { jp: 'ズキュン!', en: 'WHAM!' },
  ],
  battle: [{ jp: 'ゴゴゴ', en: 'BATTLE!' }],
  best: [{ jp: 'キラッ!', en: 'BEST LAP!' }],
  finish: [{ jp: 'ゴール!', en: 'FINISH!' }],
};

/** What the mascot says in her speech bubble. */
const lines: Readonly<Record<FxKind, readonly Phrase[]>> = {
  pass: [
    { jp: 'やった!', en: 'YATTA!' },
    { jp: 'すごい!', en: 'SUGOI!' },
    { jp: 'いいね!', en: 'NICE ONE!' },
  ],
  passed: [
    { jp: 'うそ!?', en: 'NO WAY!?' },
    { jp: 'くやしい…', en: 'KUYASHII…' },
    { jp: 'まだまだ!', en: 'NOT OVER!' },
  ],
  battle: [
    { jp: 'がんばって!', en: 'GANBATTE!' },
    { jp: 'いけー!', en: 'GO GO GO!' },
  ],
  best: [{ jp: '最速!', en: 'FASTEST!' }],
  finish: [{ jp: 'おつかれ!', en: 'OTSUKARE!' }],
};

/** The battle tag on a row fighting the reference car, and the header's title. */
export const battleTag: Phrase = { jp: 'バトル', en: 'BATTLE' };
export const titleKanji = '相対';

const pick = (phrases: readonly Phrase[], seed: number): Phrase =>
  phrases[Math.abs(seed) % phrases.length] ?? { jp: '!', en: '!' };

/** Whether a phrase with this seed is said in Japanese; `MIX` alternates by the seed. */
export const isJapanese = (language: Language, seed: number): boolean =>
  language === 'JP' || (language === 'MIX' && seed % 2 === 0);

export const say = (phrase: Phrase, language: Language, seed: number): string =>
  isJapanese(language, seed) ? phrase.jp : phrase.en;

export const sfxText = (kind: FxKind, language: Language, seed: number): string =>
  say(pick(sfx[kind], seed), language, seed);

export const mascotLine = (kind: FxKind, language: Language, seed: number): string =>
  say(pick(lines[kind], seed >> 1), language, seed);
