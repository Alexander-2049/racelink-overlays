// Shortens a standings table to the rows the window has room for. The
// focused car and the leader stay longest; other classes give up rows first,
// then the rows farthest from the focused car. Pure.
import type { GroupPlacement, StandingsGroupModel, StandingsRowModel } from './standingsModel.ts';

const farthest = (rows: readonly StandingsRowModel[]): number => {
  const at = rows.findIndex((row) => row.isReference);
  let best = -1;
  let bestScore = -1;
  rows.forEach((_, index) => {
    if (index === 0 || index === at) return;
    const score = at < 0 ? index : Math.abs(index - at);
    if (score >= bestScore) {
      best = index;
      bestScore = score;
    }
  });
  if (best >= 0) return best;
  // Only the leader and the focused car are left.
  return rows.length > 1 && at !== 0 ? 0 : -1;
};

const remark = (rows: readonly StandingsRowModel[]): StandingsRowModel[] => {
  const condensed = rows.some((row) => row.groupPlacement !== null);
  return rows.map((row, at) => {
    const next = rows[at + 1];
    const placement: GroupPlacement = !condensed
      ? null
      : rows.length === 1
        ? 0
        : at === 0
          ? 1
          : at === rows.length - 1
            ? -1
            : null;
    return {
      ...row,
      cutBelow: next !== undefined && next.position !== row.position + 1,
      groupPlacement: placement,
    };
  });
};

export const limitStandingsRows = (
  groups: readonly StandingsGroupModel[],
  maxRows: number,
): StandingsGroupModel[] => {
  const limit = Math.max(1, Math.floor(maxRows));
  const rowsOf = groups.map((group) => [...group.rows]);
  const alive = groups.map(() => true);
  const count = (): number =>
    rowsOf.reduce((sum, rows, at) => sum + (alive[at] === true ? rows.length : 0), 0);
  if (count() <= limit) return [...groups];
  const main = Math.max(
    0,
    groups.findIndex((group) => group.isReferenceClass),
  );
  while (count() > limit) {
    // Other classes first: the longest one gives up its last row.
    let other = -1;
    rowsOf.forEach((rows, at) => {
      if (at === main || alive[at] !== true || rows.length < 2) return;
      if (other < 0 || rows.length >= (rowsOf[other]?.length ?? 0)) other = at;
    });
    if (other >= 0) {
      rowsOf[other]?.pop();
      continue;
    }
    // Then whole other classes, the last first.
    let lone = -1;
    rowsOf.forEach((_, at) => {
      if (at !== main && alive[at] === true) lone = at;
    });
    if (lone >= 0) {
      alive[lone] = false;
      continue;
    }
    const rows = rowsOf[main];
    const drop = rows === undefined ? -1 : farthest(rows);
    if (rows === undefined || drop < 0) break;
    rows.splice(drop, 1);
  }
  return groups.flatMap((group, at) =>
    alive[at] === true ? [{ ...group, rows: remark(rowsOf[at] ?? []) }] : [],
  );
};
