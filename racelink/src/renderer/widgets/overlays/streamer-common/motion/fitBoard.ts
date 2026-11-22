// Fitting a board of rows to its window, as the built-in standings and
// relatives do: the window height decides how many rows show, a window
// narrower than the columns scales the board down. One step of the search;
// the hook measures and calls it again until it settles. Pure.

/** A board is never drawn smaller than this; below it the text cannot be read. */
export const smallestScale = 0.4;

export type FitMeasure = Readonly<{
  scale: number;
  capacity: number;
  maxScale: number;
  viewportWidth: number;
  viewportHeight: number;
  /** Width the board needs (layout pixels, before scaling). */
  neededWidth: number;
  /** Rows drawn now, and the height of one with the gap after it; null before there are rows. */
  rowCount: number;
  rowPitch: number | null;
  /** Window height (layout pixels) left after the board and the padding; negative when it overflows. */
  freeHeight: number;
  /** Height of the board with the padding, for the last-resort shrink. */
  tallHeight: number;
}>;

export type FitResult = Readonly<{ scale: number; capacity: number }>;

const floor2 = (value: number): number => Math.floor(value * 100) / 100;

export const fitStep = (m: FitMeasure): FitResult => {
  let scale = m.scale;
  const available = m.viewportWidth / m.scale;
  if (m.neededWidth > available + 0.5)
    scale = Math.max(smallestScale, Math.min(m.maxScale, floor2(m.viewportWidth / m.neededWidth)));

  let capacity = m.capacity;
  if (m.rowPitch !== null && m.rowPitch > 0) {
    if (m.freeHeight < -0.5)
      capacity = Math.max(1, m.rowCount + Math.floor(m.freeHeight / m.rowPitch));
    if (m.freeHeight < -0.5 && m.capacity <= 1) {
      // The fewest rows still do not fit: scale down to the window height.
      scale = Math.min(scale, Math.max(smallestScale, floor2(m.viewportHeight / m.tallHeight)));
    } else if (m.rowCount >= m.capacity) {
      // More rows only when every allowed row is drawn: a short field leaves space free.
      capacity = m.rowCount + Math.floor(m.freeHeight / m.rowPitch);
    }
  }
  return { scale, capacity: Math.max(1, capacity) };
};
