// Which table columns have anything to show. A column with data is shown at
// once; one whose data is gone stays for `holdMs` first, so a brief gap in the
// data (a lost packet, a lap with no time) does not make the table blink.
// Pure: the caller supplies the clock.

export type PresenceUpdate = Readonly<{
  /** Ids of the columns to show. */
  visible: ReadonlySet<string>;
  /** Milliseconds until a column is due to hide, for a timer; null when none is. */
  nextCheckMs: number | null;
}>;

export class ColumnPresence {
  private readonly lastSeen = new Map<string, number>();
  private readonly shown = new Set<string>();
  private readonly holdMs: number;

  constructor(holdMs: number) {
    this.holdMs = holdMs;
  }

  /** `hasData[id]` says whether any visible row has data in the column now. */
  update(now: number, hasData: Readonly<Record<string, boolean>>): PresenceUpdate {
    for (const id of [...this.shown]) if (!(id in hasData)) this.forget(id);
    let nextCheckMs: number | null = null;
    for (const [id, has] of Object.entries(hasData)) {
      if (has) {
        this.lastSeen.set(id, now);
        this.shown.add(id);
        continue;
      }
      if (!this.shown.has(id)) continue;
      const left = this.holdMs - (now - (this.lastSeen.get(id) ?? now));
      if (left <= 0) {
        this.forget(id);
      } else {
        nextCheckMs = nextCheckMs === null ? left : Math.min(nextCheckMs, left);
      }
    }
    return { visible: new Set(this.shown), nextCheckMs };
  }

  private forget(id: string): void {
    this.shown.delete(id);
    this.lastSeen.delete(id);
  }
}
