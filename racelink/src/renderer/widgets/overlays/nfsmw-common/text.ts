import { fontMwBody as font } from './font/fontMwBody';
import { commonTexture } from './textures';
import { tint, type Rgba } from './tint';
import type { Glyph } from './types';

const glyphs: Readonly<Record<number, Glyph | undefined>> = font.glyphs;
const kerning: Readonly<Record<string, number | undefined>> = font.kerning;

/** Characters the game's font lacks are drawn with a system font of this cap height. */
const fallbackCapHeight = 14;
const fallbackBaseline = 18;
const fallbackFont = 'bold 10px "Arial Black", Arial, sans-serif';
const capHeightPerPx = 0.716;
/** From the top of one line to the next, at scale 1: as the game spaces lines. */
export const linePitch = font.lineHeight + font.baseline;

const glyphOf = (char: string): Glyph | undefined => glyphs[char.codePointAt(0) ?? 0];
const kern = (previous: string | null, char: string): number =>
  previous === null
    ? 0
    : (kerning[`${String(previous.codePointAt(0))},${String(char.codePointAt(0))}`] ?? 0);

let measure: CanvasRenderingContext2D | null = null;
/** Advance of a character the font lacks, in units at scale 1. */
const fallbackAdvance = (char: string): number => {
  measure ??= document.createElement('canvas').getContext('2d');
  if (!measure) return 8;
  measure.font = fallbackFont;
  const unitsPerPx = fallbackCapHeight / (10 * capHeightPerPx);
  return measure.measureText(char).width * unitsPerPx;
};

/** Width of a line at scale 1, in units: the sum of advances with kerning. */
export const lineWidth = (text: string): number => {
  let width = 0;
  let previous: string | null = null;
  for (const char of text) {
    const glyph = glyphOf(char);
    width += (glyph ? glyph[6] : fallbackAdvance(char)) + kern(previous, char);
    previous = char;
  }
  return width;
};

/**
 * Draws a line of the game's font left-aligned at (x, y): y is the top of the
 * line. The font texture holds white glyphs, tinted to the colour.
 */
export const drawTextLine = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  color: Rgba,
  alpha: number,
): void => {
  const sheet = commonTexture('font_mw_body');
  if (!sheet || alpha <= 0) return;
  const tinted = tint(sheet, color);
  const pixels = sheet.naturalWidth / font.textureUnits;
  context.save();
  context.globalAlpha = alpha;
  let pen = x;
  let previous: string | null = null;
  for (const char of text) {
    pen += kern(previous, char) * scaleX;
    const glyph = glyphOf(char);
    if (glyph) {
      const [gx, gy, width, height, left, top, advance] = glyph;
      if (width > 0 && height > 0)
        context.drawImage(
          tinted,
          gx * pixels,
          gy * pixels,
          width * pixels,
          height * pixels,
          pen + left * scaleX,
          y + top * scaleY,
          width * scaleX,
          height * scaleY,
        );
      pen += advance * scaleX;
    } else {
      // A character the game's font lacks (Cyrillic, for one).
      const unitsPerPx = fallbackCapHeight / (10 * capHeightPerPx);
      context.save();
      context.translate(pen, y + fallbackBaseline * scaleY);
      context.scale(scaleX * unitsPerPx, scaleY * unitsPerPx);
      context.font = fallbackFont;
      context.fillStyle = `rgb(${String(color[0])}, ${String(color[1])}, ${String(color[2])})`;
      context.fillText(char, 0, 0);
      context.restore();
      pen += fallbackAdvance(char) * scaleX;
    }
    previous = char;
  }
  context.restore();
};

export type Justify = 'left' | 'center' | 'right';

/**
 * Draws text as the game's text objects do: lines split at "\n", aligned on
 * x, y the top of the first line. A line wider than `maxWidth` (units at
 * scale 1; 0 for none) is narrowed to fit.
 */
export const drawText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    readonly justify: Justify;
    readonly scaleX: number;
    readonly scaleY: number;
    readonly maxWidth: number;
    readonly color: Rgba;
    readonly alpha: number;
  },
): void => {
  const { justify, scaleX, scaleY, maxWidth, color, alpha } = options;
  text.split('\n').forEach((line, index) => {
    const natural = lineWidth(line);
    const squeeze = maxWidth > 0 && natural > maxWidth ? maxWidth / natural : 1;
    const width = natural * scaleX * squeeze;
    const left = justify === 'left' ? x : justify === 'center' ? x - width / 2 : x - width;
    drawTextLine(
      context,
      line,
      left,
      y + index * linePitch * scaleY,
      scaleX * squeeze,
      scaleY,
      color,
      alpha,
    );
  });
};
