/** A keyframe: time in ms and the value then. */
export interface Key {
  readonly t: number;
  readonly v: readonly number[];
}

/** Values over time; a looping track repeats every `length` ms. */
export interface Track {
  readonly length: number;
  readonly loop: boolean;
  readonly keys: readonly Key[];
}

/** x, y, width, height (in 256ths of the texture), left, top, advance (units). */
export type Glyph = readonly [number, number, number, number, number, number, number];

/** A bitmap font of the game. */
export interface FontData {
  readonly lineHeight: number;
  readonly baseline: number;
  readonly textureUnits: number;
  readonly glyphs: Readonly<Record<number, Glyph>>;
  /** Extra advance between two characters, by "left,right" character codes. */
  readonly kerning: Readonly<Record<string, number>>;
}
