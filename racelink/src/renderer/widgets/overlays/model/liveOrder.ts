/**
 * Live order of the drivers (Overlay API 2.21, iRacing race sessions): the
 * places by the road, not the official ones that move only at the line. Older
 * Racelink versions do not send `live` and `positionChange`, so every reader
 * falls back to the official fields.
 */
export type LiveInfo = Readonly<{
  position: number;
  classPosition?: number | null;
  lapDistanceFraction?: number | null;
  raceDistanceLaps?: number | null;
  source?: 'track' | 'estimate' | 'hold' | 'finished' | 'official';
  sinceSeconds?: number | null;
  isFinished?: boolean;
}>;

export type PositionChangeInfo = Readonly<{
  overall?: number | null;
  class?: number | null;
  liveOverall?: number | null;
  liveClass?: number | null;
}>;

/** The 2.21 fields a driver may carry; both may be absent or null. */
export type LiveFields = Readonly<{
  live?: LiveInfo | null;
  positionChange?: PositionChangeInfo | null;
}>;

type WithPlaces = Readonly<{ position: number | null; classPosition: number | null }>;

const fieldsOf = (driver: object): LiveFields => driver as LiveFields;

/** Overall place now: the live one when the app sends it, else the official one. */
export const overallPlace = (driver: WithPlaces): number | null =>
  fieldsOf(driver).live?.position ?? driver.position;

/** Class place now: the live one when present, else the official one. */
export const classPlace = (driver: WithPlaces): number | null =>
  fieldsOf(driver).live?.classPosition ?? driver.classPosition;

/**
 * Class place, or the overall one for a driver without a class place. The
 * live place goes first when it exists.
 */
export const classOrOverallPlace = (driver: WithPlaces): number | null => {
  const live = fieldsOf(driver).live;
  return live?.classPosition ?? driver.classPosition ?? live?.position ?? driver.position;
};

/** Places gained in the class by the live order; null when the app does not send it. */
export const liveClassChange = (driver: object): number | null =>
  fieldsOf(driver).positionChange?.liveClass ?? null;

/** Places gained overall by the live order; null when the app does not send it. */
export const liveOverallChange = (driver: object): number | null =>
  fieldsOf(driver).positionChange?.liveOverall ?? null;
