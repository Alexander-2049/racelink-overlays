/** A point of a delta trace: position on the lap and delta in seconds. */
export interface TracePoint {
  readonly p: number;
  readonly d: number;
}

/** Delta at a position of a list of samples, interpolated. */
export const deltaOfSamples =
  (samples: readonly TracePoint[]) =>
  (pct: number): number => {
    const first = samples[0];
    const last = samples[samples.length - 1];
    if (!first || !last) return NaN;
    if (pct <= first.p) return first.d;
    if (pct >= last.p) return last.d;
    for (let index = 0; index < samples.length - 1; index += 1) {
      const a = samples[index];
      const b = samples[index + 1];
      if (!a || !b) continue;
      if (pct >= a.p && pct <= b.p) {
        const span = b.p - a.p;
        return span <= 0 ? a.d : a.d + ((pct - a.p) / span) * (b.d - a.d);
      }
    }
    return NaN;
  };

/** A part of the lap, as shares of it. */
export interface Section {
  readonly startPct: number;
  readonly endPct: number;
}

/** A turn or a sector on the lap: where it starts and ends, and where its number goes. */
export interface Marker {
  readonly number: number;
  readonly name: string | null;
  readonly start: number;
  readonly end: number;
  readonly position: number;
}

/**
 * How the lap is cut into sections: a turn with the straight after it, turns
 * only, or turns and straights each on their own.
 */
export type SectionMode = 'TURN_AND_STRAIGHT' | 'TURNS_ONLY' | 'PER_SEGMENT';

/** The sections of a lap from its turns (or sectors); overlapping turns are merged. */
export const buildSections = (markers: readonly Marker[], mode: SectionMode): Section[] => {
  const pieces = markers
    .filter((marker) => Number.isFinite(marker.start) && Number.isFinite(marker.end))
    .flatMap((marker) =>
      marker.start <= marker.end
        ? [{ startPct: marker.start, endPct: marker.end }]
        : [
            ...(marker.start < 1 ? [{ startPct: marker.start, endPct: 1 }] : []),
            ...(marker.end > 0 ? [{ startPct: 0, endPct: marker.end }] : []),
          ],
    )
    .sort((a, b) => a.startPct - b.startPct);
  const turns: Section[] = [];
  let reached = 0;
  for (const piece of pieces) {
    if (piece.endPct <= reached) continue;
    turns.push({ startPct: Math.max(reached, piece.startPct), endPct: piece.endPct });
    reached = piece.endPct;
  }
  if (mode === 'TURNS_ONLY') return turns;
  if (mode === 'TURN_AND_STRAIGHT') {
    const first = turns[0];
    const sections: Section[] =
      first && first.startPct > 0 ? [{ startPct: 0, endPct: first.startPct }] : [];
    turns.forEach((turn, index) => {
      sections.push({ startPct: turn.startPct, endPct: turns[index + 1]?.startPct ?? 1 });
    });
    return sections;
  }
  const sections: Section[] = [];
  let end = 0;
  for (const turn of turns) {
    if (turn.startPct > end) sections.push({ startPct: end, endPct: turn.startPct });
    sections.push(turn);
    end = turn.endPct;
  }
  if (end < 1) sections.push({ startPct: end, endPct: 1 });
  return sections;
};

/** How a section is named: "T5" (or "S2"), "After T5" for the straight after it, or "Start". */
export interface SectionLabel {
  readonly label: string;
  readonly kind: 'turn' | 'sector' | null;
  readonly number: string | null;
  readonly name: string | null;
}

export const sectionLabel = (
  startPct: number,
  markers: readonly Marker[],
  sectors: boolean,
): SectionLabel => {
  const prefix = sectors ? 'S' : 'T';
  const at = markers.find((marker) => Math.abs(marker.start - startPct) < 0.002);
  if (at)
    return {
      label: `${prefix}${String(at.number)}`,
      kind: sectors ? 'sector' : 'turn',
      number: String(at.number),
      name: at.name,
    };
  let before: Marker | null = null;
  for (const marker of [...markers].sort((a, b) => a.start - b.start))
    if (marker.end <= startPct) before = marker;
  return before
    ? { label: `After ${prefix}${String(before.number)}`, kind: null, number: null, name: null }
    : { label: 'Start', kind: null, number: null, name: null };
};
