export type TrackPoint = [number, number, number, number, number];
export type TrackSidePoint = [number, number, number, number];
export interface TrackBackgroundPlacement {
  viewBox: { minX: number; minY: number; width: number; height: number };
  activeBounds: { minX: number; minY: number; maxX: number; maxY: number };
}
export interface TrackGeometry {
  metadata: Record<string, unknown>;
  background?: { svg: string; placement: TrackBackgroundPlacement };
  pointSchema: string[];
  track_points: TrackPoint[];
  pitroadSchema: string[];
  pitroad: TrackSidePoint[][];
  pitroadAnchorSchema: string[];
  pitroad_anchors: TrackSidePoint[][];
  jokerLapSchema: string[];
  joker_lap: TrackSidePoint[][];
  jokerLapAnchorSchema: string[];
  joker_lap_anchors: TrackSidePoint[][];
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');
const point = (value: unknown, length: number): boolean =>
  Array.isArray(value) &&
  value.length >= length &&
  value.slice(0, length).every((item) => typeof item === 'number' && Number.isFinite(item));
const routes = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every((route) => Array.isArray(route) && route.every((item) => point(item, 4)));
export const isTrackBackgroundPlacement = (value: unknown): value is TrackBackgroundPlacement => {
  if (!record(value) || !record(value.viewBox) || !record(value.activeBounds)) return false;
  const { viewBox, activeBounds } = value;
  return (
    ['minX', 'minY', 'width', 'height'].every(
      (key) => typeof viewBox[key] === 'number' && Number.isFinite(viewBox[key]),
    ) &&
    ['minX', 'minY', 'maxX', 'maxY'].every(
      (key) => typeof activeBounds[key] === 'number' && Number.isFinite(activeBounds[key]),
    )
  );
};
export const isTrackGeometry = (value: unknown): value is TrackGeometry => {
  if (
    !record(value) ||
    !record(value.metadata) ||
    !Array.isArray(value.track_points) ||
    !value.track_points.every((item) => point(item, 5))
  )
    return false;
  if (
    ![
      'pointSchema',
      'pitroadSchema',
      'pitroadAnchorSchema',
      'jokerLapSchema',
      'jokerLapAnchorSchema',
    ].every((key) => strings(value[key]))
  )
    return false;
  if (
    !['pitroad', 'pitroad_anchors', 'joker_lap', 'joker_lap_anchors'].every((key) =>
      routes(value[key]),
    )
  )
    return false;
  return (
    value.background === undefined ||
    (record(value.background) &&
      typeof value.background.svg === 'string' &&
      isTrackBackgroundPlacement(value.background.placement))
  );
};
