import { memo, useMemo } from 'react';
import { spanOf, type ColorSegment, type MapPoint } from './mapGeometry';
import type { Section } from './trace';

/** Arcs shorter than this share of the lap are not drawn. */
const minimumSpan = 1e-4;
/** Margin around the arc, as a share of its larger side. */
const arcMargin = 0.25;
/** Margin around the whole track, as a share of its larger side. */
const trackMargin = 0.1;
/** Line widths are this share of the view, times the width settings. */
const strokeShare = 0.002;
/** The track around the arc stays visible over this many arc lengths. */
const contextSpan = 2.5;

/** The map point at a lap position, between the two nearest points. */
const pointAt = (points: readonly MapPoint[], position: number): MapPoint => {
  const p = ((position % 1) + 1) % 1;
  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if ((points[middle]?.p ?? 0) <= p) low = middle;
    else high = middle;
  }
  const first = points[0] ?? { p: 0, x: 0, y: 0 };
  const last = points[points.length - 1] ?? first;
  // Past the last point the line closes back to the first.
  const [a, b] =
    p < first.p || p >= last.p
      ? [last, { ...first, p: first.p + 1 }]
      : [points[low] ?? first, points[high] ?? last];
  const at = p < first.p ? p + 1 : p;
  const share = b.p > a.p ? (at - a.p) / (b.p - a.p) : 0;
  return { p, x: a.x + (b.x - a.x) * share, y: a.y + (b.y - a.y) * share };
};

/** An SVG path along the track from `start` over `span` of the lap. */
const arcPath = (points: readonly MapPoint[], start: number, span: number): string => {
  const steps = Math.max(8, Math.ceil(span * 400));
  return Array.from({ length: steps + 1 }, (_, step) => {
    const point = pointAt(points, start + (step / steps) * span);
    return `${step === 0 ? 'M' : 'L'}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(' ');
};

const bounds = (points: readonly MapPoint[]) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  return { minX, minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

const viewOf = (box: ReturnType<typeof bounds>, margin: number) => {
  const pad = margin * Math.max(box.width, box.height);
  return {
    viewBox: `${String(box.minX - pad)} ${String(box.minY - pad)} ${String(box.width + 2 * pad)} ${String(box.height + 2 * pad)}`,
    size: Math.max(box.width, box.height) + 2 * pad,
  };
};

type Props = Readonly<{
  points: readonly MapPoint[] | null;
  /** The weak spot; null shows the whole track. */
  section: Section | null;
  width: number;
  height: number;
  colorSegments: readonly ColorSegment[] | null;
  highlightColor: string;
  highlightWidth: number;
  baseColor: string;
  baseWidth: number;
}>;

/**
 * The weak spot on the track map: the part of the track around it, the arc
 * itself highlighted (in one colour or by the delta along it). Without a weak
 * spot the whole track shows; without geometry, an empty frame.
 */
function WeakSpotMapComponent({
  points,
  section,
  width,
  height,
  colorSegments,
  highlightColor,
  highlightWidth,
  baseColor,
  baseWidth,
}: Props) {
  const drawing = useMemo(() => {
    if (!points) return null;
    const span = section ? spanOf(section) : 0;
    if (!section || span < minimumSpan) {
      const path = arcPath(points, 0, 1);
      const view = viewOf(bounds(points), trackMargin);
      return { whole: true, path, view, context: null, arcs: [] };
    }
    const arcPoints = Array.from({ length: 65 }, (_, step) =>
      pointAt(points, section.startPct + (step / 64) * span),
    );
    const view = viewOf(bounds(arcPoints), arcMargin);
    const contextLength = Math.min(1, span * contextSpan);
    const context = arcPath(points, section.startPct + span / 2 - contextLength / 2, contextLength);
    const arcs = (
      colorSegments && colorSegments.length > 0
        ? colorSegments
        : [{ ...section, color: highlightColor }]
    )
      .filter((segment) => spanOf(segment) >= minimumSpan)
      .map((segment) => ({
        color: segment.color,
        d: arcPath(points, segment.startPct, spanOf(segment)),
      }));
    return { whole: false, path: null, view, context, arcs };
  }, [points, section, colorSegments, highlightColor]);

  if (!drawing)
    return (
      <div className="TrackMapPanel">
        <div className="trackMapPanelPlaceholder" style={{ width, height }} />
      </div>
    );
  const stroke = strokeShare * drawing.view.size;
  return (
    <div className="TrackMapPanel">
      <svg
        width={width}
        height={height}
        viewBox={drawing.view.viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', opacity: drawing.whole ? 0.75 : 1 }}
      >
        {drawing.whole && drawing.path !== null && (
          <path
            d={drawing.path}
            fill="none"
            stroke={baseColor}
            strokeWidth={stroke * baseWidth * 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {drawing.context !== null && (
          <path
            d={drawing.context}
            fill="none"
            stroke={baseColor}
            strokeWidth={stroke * baseWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {drawing.arcs.map((arc) => (
          <path
            key={arc.d}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke * highlightWidth}
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}

export const WeakSpotMap = memo(WeakSpotMapComponent);
