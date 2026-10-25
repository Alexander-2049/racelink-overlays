import type { TrackGeometry, TrackPoint, TrackSidePoint } from '../../../../shared/contracts/track';

/** A point of a route: lap progress and world position (metres). */
interface RoutePoint {
  readonly progress: number;
  readonly x: number;
  readonly y: number;
}

/** A route densified for smooth drawing and lookups by lap progress. */
export interface Route {
  readonly points: readonly RoutePoint[];
  readonly lengthMeters: number;
  /** The lap ends where it starts; a point-to-point route does not. */
  readonly closed: boolean;
  readonly path: Path2D;
}

/** Densified points sit about this far apart. */
const stepMeters = 2;

type Xy = readonly [number, number];

/**
 * A point of the centripetal Catmull-Rom curve between p1 and p2 (u from 0
 * to 1). Unlike the uniform curve it never loops when neighbouring points
 * are unevenly far apart (15 m in corners, hundreds on straights).
 */
const centripetal = (p0: Xy, p1: Xy, p2: Xy, p3: Xy, u: number): Xy => {
  const knot = (a: Xy, b: Xy) => Math.max(1e-4, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
  const t0 = 0;
  const t1 = t0 + knot(p0, p1);
  const t2 = t1 + knot(p1, p2);
  const t3 = t2 + knot(p2, p3);
  const t = t1 + (t2 - t1) * u;
  const mix = (a: Xy, b: Xy, from: number, to: number): Xy => {
    const share = (t - from) / (to - from);
    return [a[0] + (b[0] - a[0]) * share, a[1] + (b[1] - a[1]) * share];
  };
  const a1 = mix(p0, p1, t0, t1);
  const a2 = mix(p1, p2, t1, t2);
  const a3 = mix(p2, p3, t2, t3);
  const b1 = mix(a1, a2, t0, t2);
  const b2 = mix(a2, a3, t1, t3);
  return mix(b1, b2, t1, t2);
};

/**
 * The lap as a smooth curve through the measured points (5 m to hundreds of
 * metres apart, too far for straight segments in corners).
 */
export const routeOf = (points: readonly TrackPoint[]): Route | null => {
  // The last point repeats the first one on a closed lap.
  const first = points[0];
  const last = points[points.length - 1];
  const closed =
    !!first && !!last && first !== last && first[2] === last[2] && first[3] === last[3];
  const ring = closed ? points.slice(0, -1) : points;
  const count = ring.length;
  if (count < 2) return null;
  const at = (index: number): TrackPoint => {
    const point = closed
      ? ring[((index % count) + count) % count]
      : ring[Math.max(0, Math.min(count - 1, index))];
    if (!point) throw new Error('route point out of range');
    return point;
  };
  const dense: RoutePoint[] = [];
  const segments = closed ? count : count - 1;
  for (let index = 0; index < segments; index += 1) {
    const p0 = at(index - 1);
    const p1 = at(index);
    const p2 = at(index + 1);
    const p3 = at(index + 2);
    const fromProgress = p1[1];
    const toProgress = p2[1] < fromProgress ? p2[1] + 1 : p2[1];
    const steps = Math.max(1, Math.ceil(Math.hypot(p2[2] - p1[2], p2[3] - p1[3]) / stepMeters));
    const xy = (point: TrackPoint): Xy => [point[2], point[3]];
    const curve: Xy[] = [];
    for (let step = 0; step < steps; step += 1)
      curve.push(centripetal(xy(p0), xy(p1), xy(p2), xy(p3), step / steps));
    curve.push(xy(p2));
    // Progress runs with the distance along the curve.
    const lengths = [0];
    for (let step = 1; step < curve.length; step += 1) {
      const from = curve[step - 1] ?? xy(p1);
      const to = curve[step] ?? xy(p2);
      lengths.push((lengths[step - 1] ?? 0) + Math.hypot(to[0] - from[0], to[1] - from[1]));
    }
    const total = lengths[lengths.length - 1] ?? 0;
    for (let step = 0; step < steps; step += 1) {
      const [x, y] = curve[step] ?? xy(p1);
      const share = total > 0 ? (lengths[step] ?? 0) / total : step / steps;
      dense.push({ progress: fromProgress + (toProgress - fromProgress) * share, x, y });
    }
  }
  const end = closed ? at(0) : at(count - 1);
  dense.push({ progress: closed ? 1 : end[1], x: end[2], y: end[3] });
  const path = new Path2D();
  dense.forEach((point, index) => {
    if (index === 0) path.moveTo(point.x, point.y);
    else path.lineTo(point.x, point.y);
  });
  if (closed) path.closePath();
  return { points: dense, lengthMeters: last?.[0] ?? 0, closed, path };
};

/** Where a car at this lap progress is. */
export const pointAt = (route: Route, progress: number): { x: number; y: number } | null => {
  const points = route.points;
  if (points.length === 0) return null;
  const target = ((progress % 1) + 1) % 1;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if ((points[middle]?.progress ?? 0) <= target) low = middle;
    else high = middle - 1;
  }
  const from = points[low];
  const to = points[Math.min(points.length - 1, low + 1)];
  if (!from || !to) return null;
  const span = to.progress - from.progress;
  const share = span > 0 ? Math.min(1, Math.max(0, (target - from.progress) / span)) : 0;
  return { x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share };
};

/** Which way the lap runs at this progress, in radians. */
export const headingAt = (route: Route, progress: number): number => {
  const ahead = route.lengthMeters > 0 ? 5 / route.lengthMeters : 0.001;
  // Near the end of a point-to-point route, look back instead of past its end.
  const lastProgress = route.points[route.points.length - 1]?.progress ?? 1;
  const atEnd = !route.closed && (((progress % 1) + 1) % 1) + ahead > lastProgress;
  const here = pointAt(route, atEnd ? progress - ahead : progress);
  const next = pointAt(route, atEnd ? progress : progress + ahead);
  return here && next ? Math.atan2(next.y - here.y, next.x - here.x) : 0;
};

/** A side route (pit road) as a path. */
export const sidePathOf = (route: readonly TrackSidePoint[]): Path2D => {
  const path = new Path2D();
  route.forEach((point, index) => {
    if (index === 0) path.moveTo(point[2], point[3]);
    else path.lineTo(point[2], point[3]);
  });
  return path;
};

/** Where the track's background picture lies in the world, in metres. */
export interface TerrainFrame {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** Metres per unit of the picture. */
  readonly metersPerUnit: number;
}

/** The background picture's place: its active area spans the lap's points. */
export const terrainFrameOf = (track: TrackGeometry): TerrainFrame | null => {
  const placement = track.background?.placement;
  if (!placement || track.track_points.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of track.track_points) {
    const radius = point[4] / 2;
    minX = Math.min(minX, point[2] - radius);
    minY = Math.min(minY, point[3] - radius);
    maxX = Math.max(maxX, point[2] + radius);
    maxY = Math.max(maxY, point[3] + radius);
  }
  const { activeBounds, viewBox } = placement;
  const sourceWidth = activeBounds.maxX - activeBounds.minX;
  const sourceHeight = activeBounds.maxY - activeBounds.minY;
  if (sourceWidth <= 0 || sourceHeight <= 0) return null;
  const perX = (maxX - minX) / sourceWidth;
  const perY = (maxY - minY) / sourceHeight;
  return {
    x: minX - (activeBounds.minX - viewBox.minX) * perX,
    y: minY - (activeBounds.minY - viewBox.minY) * perY,
    width: viewBox.width * perX,
    height: viewBox.height * perY,
    metersPerUnit: (perX + perY) / 2,
  };
};

/** Layers of the background pictures. */
const pavedLayers = ['Pavement', 'pavement', 'Bridge', 'Bridge_1_', 'Background'];
const waterLayers = ['Water', 'Water_1_'];
const hiddenLayers = ['Buildings', 'Building', 'Layer_20'];

const select = (layers: readonly string[]) =>
  layers.map((layer) => `#${layer}, #${layer} *`).join(', ');

/**
 * The background picture redrawn as the game's map draws the city: paved
 * ground as its roads, water darker, no buildings. The outline picture goes
 * under the fill picture, so neighbouring shapes share one outline.
 */
export const terrainPictures = (
  svg: string,
  outlineUnits: number,
  colors: { readonly road: string; readonly outline: string; readonly water: string },
): { readonly outline: string; readonly fill: string } => {
  const hide = `${select(hiddenLayers)} { display: none !important; }`;
  const outline = `<style>${hide} ${select(pavedLayers)} { fill: ${colors.outline} !important; stroke: ${colors.outline} !important; stroke-width: ${String(outlineUnits * 2)} !important; stroke-linejoin: round !important; } ${select(waterLayers)} { display: none !important; }</style>`;
  const fill = `<style>${hide} ${select(pavedLayers)} { fill: ${colors.road} !important; stroke: none !important; } ${select(waterLayers)} { fill: ${colors.water} !important; stroke: none !important; }</style>`;
  const inject = (style: string) => svg.replace(/(<svg[^>]*>)/, `$1${style}`);
  return { outline: inject(outline), fill: inject(fill) };
};
