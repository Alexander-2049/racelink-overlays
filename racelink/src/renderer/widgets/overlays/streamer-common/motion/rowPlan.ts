// What to animate when the rows of a table change: which rows moved (and by
// how far), which are new, which left. A change that touches most of the table
// (another session, another class) is not animated. Pure.

export type Box = Readonly<{ top: number; left: number; width: number; height: number }>;

export type RowPlan = Readonly<{
  moves: readonly Readonly<{ key: string; dy: number }>[];
  enters: readonly string[];
  leaves: readonly string[];
  /** Too much changed at once: draw it without animation. */
  reset: boolean;
}>;

/** Share of the rows that may come or go before the change counts as a new table. */
export const massChange = 0.6;

export const planRows = (
  prev: ReadonlyMap<string, Box>,
  next: ReadonlyMap<string, Box>,
): RowPlan => {
  const moves: { key: string; dy: number }[] = [];
  const enters: string[] = [];
  const leaves: string[] = [];
  for (const [key, box] of next) {
    const before = prev.get(key);
    if (before === undefined) enters.push(key);
    else if (Math.abs(before.top - box.top) >= 1) moves.push({ key, dy: before.top - box.top });
  }
  for (const key of prev.keys()) if (!next.has(key)) leaves.push(key);
  const size = Math.max(prev.size, next.size);
  const reset =
    prev.size === 0 ||
    next.size === 0 ||
    (size > 3 && enters.length + leaves.length > size * massChange);
  return { moves, enters, leaves, reset };
};
