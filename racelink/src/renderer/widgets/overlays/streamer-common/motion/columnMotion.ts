// The width of a column that opens or closes: 0..1 over `durationMs`, eased.
// A column whose target flips halfway turns back from where it is, so nothing
// jumps. Pure: the caller supplies the clock.

type Track = { from: number; to: 0 | 1; start: number; duration: number };

const ease = (t: number): number => 1 - (1 - t) ** 3;

export class ColumnMotion {
  private readonly tracks = new Map<string, Track>();
  private readonly durationMs: number;

  constructor(durationMs: number) {
    this.durationMs = durationMs;
  }

  /** Sets where a column should end up; `animate` false puts it there at once. */
  set(now: number, id: string, target: 0 | 1, animate: boolean): void {
    const track = this.tracks.get(id);
    if (track === undefined) {
      this.tracks.set(id, {
        from: animate ? 1 - target : target,
        to: target,
        start: now,
        duration: animate ? this.durationMs : 0,
      });
      return;
    }
    if (track.to === target) return;
    this.tracks.set(id, {
      from: this.progress(id, now),
      to: target,
      start: now,
      duration: animate ? this.durationMs : 0,
    });
  }

  /** How open the column is: 0 closed, 1 open. */
  progress(id: string, now: number): number {
    const track = this.tracks.get(id);
    if (track === undefined) return 0;
    if (track.duration <= 0) return track.to;
    const t = Math.min(1, Math.max(0, (now - track.start) / track.duration));
    return track.from + (track.to - track.from) * ease(t);
  }

  /** The column has reached its target. */
  settled(id: string, now: number): boolean {
    const track = this.tracks.get(id);
    return track === undefined || track.duration <= 0 || now - track.start >= track.duration;
  }

  /** The column takes part in the layout: open, or on its way. */
  rendered(id: string, now: number): boolean {
    const track = this.tracks.get(id);
    if (track === undefined) return false;
    return track.to === 1 || !this.settled(id, now);
  }

  allSettled(now: number): boolean {
    return [...this.tracks.keys()].every((id) => this.settled(id, now));
  }

  /** Forgets columns that are no longer in the table. */
  keepOnly(ids: ReadonlySet<string>): void {
    for (const id of [...this.tracks.keys()]) if (!ids.has(id)) this.tracks.delete(id);
  }
}

const lengthPattern = /^\d+(\.\d+)?(em|rem|px)$/;

/**
 * The grid track of a column. An open column keeps its own width; one on its
 * way scales a length by `var(--fx-c-<id>)` (the animation sets it each frame;
 * `progress` is the fallback before the first one). A width that is not a
 * plain length (`max-content`) is replaced by `estimate` while it moves.
 */
export const columnTrack = (
  id: string,
  width: string,
  estimate: string,
  progress: number,
  moving: boolean,
): string => {
  if (!moving) return width;
  const length = lengthPattern.test(width) ? width : estimate;
  return `calc(${length} * var(--fx-c-${id}, ${progress.toFixed(3)}))`;
};
