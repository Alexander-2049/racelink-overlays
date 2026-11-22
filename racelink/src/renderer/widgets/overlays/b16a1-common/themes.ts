// Colour themes of the b16a1 overlay set. A theme is a list of CSS custom
// properties (`--b-*`) that base.css reads; every overlay of the set takes its
// `theme` setting from `themeIds`, and the first is the default.
//
// The default, `b16a1`, is the streamer's look (near-black panels, a lime
// accent, yellow and red for the details) turned down so it does not tire the
// eye next to a game. `vivid` is the same palette at full strength.
// Pure: no React, no DOM.

export const themeIds = ['b16a1', 'vivid', 'graphite', 'ocean', 'paper'] as const;
export type ThemeId = (typeof themeIds)[number];

export const themeLabels: Readonly<Record<ThemeId, string>> = {
  b16a1: 'b16a1 (softened)',
  vivid: 'b16a1 vivid (acid lime)',
  graphite: 'Graphite (neutral dark)',
  ocean: 'Ocean (cool dark)',
  paper: 'Paper (light)',
};

type Tokens = Readonly<{
  /** Panel colour as `r g b` (used with an alpha). */
  bg: string;
  /** Every other row. */
  alt: string;
  /** The focused car's row. */
  ref: string;
  fg: string;
  dim: string;
  accent: string;
  /** Text on the accent colour. */
  accentInk: string;
  good: string;
  bad: string;
  warn: string;
  /** Text of the focused car. */
  refText: string;
  /** Text of cars in other classes. */
  otherText: string;
  /** Text shadow / halo, for text drawn without a panel. */
  shadow: string;
  /** Throttle, brake, clutch. */
  throttle: string;
  brake: string;
  clutch: string;
  /** ABS marking on the brake. */
  abs: string;
  /** Licence badge colour when the game gives none. */
  licence: string;
  /** Font style of the numbers and labels. */
  fontStyle: 'normal' | 'italic';
  fontWeight: string;
}>;

const tokens: Readonly<Record<ThemeId, Tokens>> = {
  b16a1: {
    bg: '19 20 16',
    alt: '34 36 28',
    ref: '66 74 24',
    fg: '#e7e9dd',
    dim: '#9da28e',
    accent: '#b6d13d',
    accentInk: '#14160c',
    good: '#82cc6c',
    bad: '#d8695b',
    warn: '#d9c04b',
    refText: '#e3cf62',
    otherText: '#d8695b',
    shadow: '#000000',
    throttle: '#7ec96a',
    brake: '#d8695b',
    clutch: '#6aa5d9',
    abs: '#e3b341',
    licence: '#3f7fd6',
    fontStyle: 'normal',
    fontWeight: '600',
  },
  vivid: {
    bg: '8 8 6',
    alt: '28 30 18',
    ref: '78 98 0',
    fg: '#ffffff',
    dim: '#aeb39a',
    accent: '#d7ff00',
    accentInk: '#000000',
    good: '#5bff4a',
    bad: '#ff4d3d',
    warn: '#ffd800',
    refText: '#ffe600',
    otherText: '#ff5a4a',
    shadow: '#000000',
    throttle: '#4bff3a',
    brake: '#ff3b30',
    clutch: '#3aa0ff',
    abs: '#ffc400',
    licence: '#1f6fff',
    fontStyle: 'italic',
    fontWeight: '800',
  },
  graphite: {
    bg: '24 26 29',
    alt: '36 39 43',
    ref: '45 64 94',
    fg: '#e8eaed',
    dim: '#9aa0a8',
    accent: '#8ab4f8',
    accentInk: '#0d1624',
    good: '#7bc98b',
    bad: '#df786d',
    warn: '#dfc06a',
    refText: '#a9c8fa',
    otherText: '#df786d',
    shadow: '#000000',
    throttle: '#7bc98b',
    brake: '#df786d',
    clutch: '#8ab4f8',
    abs: '#dfc06a',
    licence: '#4a82d4',
    fontStyle: 'normal',
    fontWeight: '600',
  },
  ocean: {
    bg: '11 22 30',
    alt: '19 35 47',
    ref: '16 72 86',
    fg: '#dfeaf0',
    dim: '#8fa8b4',
    accent: '#4fc3d9',
    accentInk: '#06222a',
    good: '#6fd0a0',
    bad: '#e68a7a',
    warn: '#e8c872',
    refText: '#7fdcec',
    otherText: '#e68a7a',
    shadow: '#000000',
    throttle: '#6fd0a0',
    brake: '#e68a7a',
    clutch: '#5aa9e6',
    abs: '#e8c872',
    licence: '#3b82c4',
    fontStyle: 'normal',
    fontWeight: '600',
  },
  paper: {
    bg: '244 244 239',
    alt: '230 231 223',
    ref: '250 233 130',
    fg: '#1d2018',
    dim: '#666b5b',
    accent: '#58780a',
    accentInk: '#ffffff',
    good: '#2b7d36',
    bad: '#b8382b',
    warn: '#8d6e00',
    refText: '#6b5200',
    otherText: '#b8382b',
    shadow: '#ffffff',
    throttle: '#2b7d36',
    brake: '#b8382b',
    clutch: '#2a6db5',
    abs: '#b8860b',
    licence: '#2a6db5',
    fontStyle: 'normal',
    fontWeight: '600',
  },
};

/** The theme a setting names; the default when it names none. */
export const themeOf = (value: unknown): ThemeId =>
  themeIds.find((id) => id === value) ?? themeIds[0];

/** Panel opacity as a number 0..1 from a percentage setting. */
export const alphaOf = (percent: number): number =>
  Number.isFinite(percent) ? Math.min(1, Math.max(0, percent / 100)) : 1;

/** The custom properties of a theme; put them on the overlay's root element. */
export const themeVars = (value: unknown, opacityPercent: number): Record<string, string> => {
  const t = tokens[themeOf(value)];
  return {
    '--b-bg': t.bg,
    '--b-alt': t.alt,
    '--b-ref': t.ref,
    '--b-alpha': String(alphaOf(opacityPercent)),
    '--b-fg': t.fg,
    '--b-dim': t.dim,
    '--b-accent': t.accent,
    '--b-accent-ink': t.accentInk,
    '--b-good': t.good,
    '--b-bad': t.bad,
    '--b-warn': t.warn,
    '--b-ref-text': t.refText,
    '--b-other-text': t.otherText,
    '--b-shadow': t.shadow,
    '--b-throttle': t.throttle,
    '--b-brake': t.brake,
    '--b-clutch': t.clutch,
    '--b-abs': t.abs,
    '--b-licence': t.licence,
    '--b-font-style': t.fontStyle,
    '--b-font-weight': t.fontWeight,
  };
};

/** Wind speed 0..1 to a colour: calm is green, strong is red, through yellow. */
export const windColor = (strength: number): string => {
  const s = Math.min(1, Math.max(0, strength));
  // Hue 130 (green) down to 8 (red); muted by lightness and saturation.
  const hue = Math.round(130 - 122 * s);
  return `hsl(${String(hue)} 62% 58%)`;
};
