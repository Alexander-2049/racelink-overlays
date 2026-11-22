// The rows of the Warhammer fuel panel: for each way of picking the fuel one lap
// takes (average of the last clean laps, the last qualifying lap, the last lap,
// a number typed in) how many laps the tank lasts, how much to add and what is
// left at the flag. Pure; built on the arithmetic of streamer-common.
import {
  extraFuel,
  fromUnit,
  lapsOfFuel,
  lastCleanLaps,
  refuelLiters,
  toUnit,
  trimmedAverage,
  type ExtraMode,
  type FuelUnit,
} from '../streamer-common/index.ts';

export type FuelLap = Readonly<{
  usedLiters: number;
  isClean: boolean;
  isCurrentSession: boolean;
}>;

export type FuelRowKey = 'average' | 'qualify' | 'last' | 'custom';

export type FuelRow = Readonly<{
  key: FuelRowKey;
  /** Litres one lap takes. */
  perLapLiters: number;
  /** Laps the fuel in the tank lasts. */
  lapsOfFuel: number;
  /** Litres to add to reach the flag, with the safety cushion; null when the length is unknown. */
  refuelLiters: number | null;
  /** Litres left at the flag; null when unknown or while in the pit lane. */
  atEndLiters: number | null;
}>;

export type FuelSources = Readonly<{
  average: number | null;
  qualify: number | null;
  last: number | null;
}>;

/**
 * The litres per lap of each source. The average takes the last five clean
 * laps (the smallest and largest dropped from three on); the qualifying figure
 * is the last clean lap of an earlier session, or of this one while it is
 * qualifying; the last figure is the last clean lap. Fallbacks (the API's own
 * strategies) fill what the history does not give.
 */
export const fuelSources = (
  history: readonly FuelLap[],
  sessionType: string,
  fallback: Readonly<{ average: number | null; last: number | null }>,
): FuelSources => {
  const qualifying = history.filter((lap) =>
    sessionType === 'qualify' ? lap.isCurrentSession : !lap.isCurrentSession,
  );
  return {
    average: trimmedAverage(lastCleanLaps(history, 5)) ?? fallback.average,
    qualify: lastCleanLaps(qualifying, 1)[0] ?? null,
    last: lastCleanLaps(history, 1)[0] ?? fallback.last,
  };
};

export type FuelRowsInput = Readonly<{
  levelLiters: number;
  /** Laps still to drive (whole); null when the length of the session is unknown. */
  lapsToFinish: number | null;
  capacityLiters: number | null;
  sources: FuelSources;
  /** A consumption typed in, litres per lap; 0 or null for none. */
  customPerLapLiters: number | null;
  extraMode: ExtraMode;
  onPitRoad: boolean;
  unit: FuelUnit;
  /** Added to a refuel of at least `cushionFrom`, in the unit shown. */
  cushion?: number;
  cushionFrom?: number;
  /** Rows to build, in order. */
  rows: readonly FuelRowKey[];
}>;

const perLapOf = (key: FuelRowKey, input: FuelRowsInput): number | null => {
  const value =
    key === 'custom'
      ? input.customPerLapLiters
      : input.sources[key];
  return value !== null && Number.isFinite(value) && value > 0 ? value : null;
};

/** The rows with a consumption to work from; a source with no laps yet has no row. */
export const buildFuelRows = (input: FuelRowsInput): FuelRow[] => {
  const cushion = input.cushion ?? 0.5;
  const cushionFrom = input.cushionFrom ?? 1;
  const rows: FuelRow[] = [];
  for (const key of input.rows) {
    const perLap = perLapOf(key, input);
    if (perLap === null) continue;
    const lapsLeft = input.lapsToFinish;
    let refuel: number | null = null;
    if (lapsLeft !== null) {
      const plain = refuelLiters(input.levelLiters, perLap, lapsLeft, 0, input.capacityLiters);
      refuel =
        toUnit(plain, input.unit) >= cushionFrom ? plain + fromUnit(cushion, input.unit) : plain;
    }
    rows.push({
      key,
      perLapLiters: perLap,
      lapsOfFuel: lapsOfFuel(input.levelLiters, perLap) ?? 0,
      refuelLiters: refuel,
      atEndLiters:
        lapsLeft === null
          ? null
          : extraFuel(input.extraMode, {
              levelLiters: input.levelLiters,
              perLap,
              lapsLeft,
              onPitRoad: input.onPitRoad,
            }),
    });
  }
  return rows;
};

/** The laps to drive as a whole number: a part of a lap still has to be driven. */
export const wholeLapsToFinish = (lapsToFinish: number | null): number | null =>
  lapsToFinish === null || !Number.isFinite(lapsToFinish) || lapsToFinish < 0
    ? null
    : Math.ceil(lapsToFinish - 1e-6);

/** A fuel figure with two decimals. */
export const fuelFigure = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? '-' : value.toFixed(2);
