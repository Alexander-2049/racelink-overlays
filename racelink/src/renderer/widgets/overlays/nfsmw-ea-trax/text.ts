import { drawTextLine, lineWidth } from '../nfsmw-common/text';
import type { Rgba } from '../nfsmw-common/tint';

export { lineWidth };

/** A line of the chyron: its text, size and how much it is narrowed to fit. */
export interface TextLine {
  readonly text: string;
  readonly scale: number;
  readonly squeeze: number;
}

/** Draws a line left-aligned at (x, y): y is the top of the line. */
export const drawLine = (
  context: CanvasRenderingContext2D,
  line: TextLine,
  x: number,
  y: number,
  color: Rgba,
  alpha: number,
): void => {
  drawTextLine(context, line.text, x, y, line.scale * line.squeeze, line.scale, color, alpha);
};
