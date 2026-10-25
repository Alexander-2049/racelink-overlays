import type { TrackGeometry } from '../../../../shared/contracts/track';
import type { Section } from './trace';

/** A point of the track line: position on the lap and map coordinates. */
export interface MapPoint {
  readonly p: number;
  readonly x: number;
  readonly y: number;
}

/** A coloured part of the highlighted arc. */
export interface ColorSegment extends Section {
  readonly color: string;
}

/** The share of the lap a section covers, across the line too. */
export const spanOf = (section: Section) => {
  const end = section.endPct < section.startPct ? section.endPct + 1 : section.endPct;
  return Math.max(0, Math.min(1, end - section.startPct));
};

/** The track line ordered by lap position; null without geometry. */
export const mapPointsOf = (track: TrackGeometry | null): readonly MapPoint[] | null => {
  const points = (track?.track_points ?? [])
    .map(([, p, x, y]) => ({ p, x, y }))
    .filter((point) => point.p >= 0 && point.p <= 1)
    .sort((a, b) => a.p - b.p);
  return points.length > 2 ? points : null;
};

/**
 * The arc of a weak spot coloured by the delta along it: ten parts, red where
 * time was lost and green where it was gained, stronger the larger the change.
 */
export const deltaGradient = (
  deltaAt: (pct: number) => number,
  section: Section,
): ColorSegment[] => {
  const span = spanOf(section);
  const parts = Array.from({ length: 10 }, (_, index) => {
    const startPct = section.startPct + (index / 10) * span;
    const endPct = section.startPct + ((index + 1) / 10) * span;
    return { startPct, endPct, diff: deltaAt(endPct) - deltaAt(startPct) };
  }).filter((part) => Number.isFinite(part.diff));
  if (parts.length === 0) return [];
  // Each part takes the mean of its neighbours, so the colour changes smoothly.
  const smoothed = parts.map((part, index) => {
    const near = parts.slice(Math.max(0, index - 10), index + 11);
    return { ...part, diff: near.reduce((sum, other) => sum + other.diff, 0) / near.length };
  });
  const largest = Math.max(0, ...smoothed.map((part) => Math.abs(part.diff)));
  return smoothed.map((part) => {
    const alpha = (0.4 + 0.55 * (largest > 0 ? Math.abs(part.diff) / largest : 0)).toFixed(2);
    return {
      startPct: part.startPct,
      endPct: part.endPct,
      color: part.diff >= 0 ? `rgba(254, 23, 31, ${alpha})` : `rgba(47, 244, 54, ${alpha})`,
    };
  });
};
