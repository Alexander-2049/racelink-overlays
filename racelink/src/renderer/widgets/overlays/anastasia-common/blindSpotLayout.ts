// Where the blind-spot line sits on its side of the screen. Pure.

export type LineLayout = Readonly<{
  /** Distance of the line's top from the top of the bar, 0..100 (%). */
  topPercent: number;
  /** Length of the line, 0..100 (%). */
  heightPercent: number;
}>;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

/**
 * The line for `cars` alongside on one side. Two cars fill the bar; one car is
 * a segment of `lengthPercent` that moves along the bar with `position`
 * (-1 the car is far behind, at the bottom, to 1 far ahead, at the top);
 * `moving` off keeps it in the middle. Nothing alongside: `null`.
 */
export const lineLayout = (
  cars: number,
  position: number,
  lengthPercent: number,
  moving: boolean,
): LineLayout | null => {
  if (cars <= 0) return null;
  if (cars >= 2) return { topPercent: 0, heightPercent: 100 };
  const height = clamp(lengthPercent, 5, 100);
  const room = 100 - height;
  const along = moving && Number.isFinite(position) ? clamp(position, -1, 1) : 0;
  // Ahead (+1) is the top of the bar.
  return { topPercent: (room / 2) * (1 - along), heightPercent: height };
};
