// Whether an Anastasia table column has anything to show in a row; a column
// with nothing in any row is left out of the table. Pure.
import {
  gainHistory,
  type RelativeRow,
  type StandingsRowModel,
} from '../streamer-common/index.ts';
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';

/** What the boards draw of a driver (the app passes `driverInfo`). */
export type DriverFacts = Readonly<{
  countryCode: string | null;
  brand: string | null;
  licence: unknown;
  rating: number | null;
  ratingChange: number | null;
}>;

export type ColumnContext = Readonly<{
  infoOf: (driver: DriverTelemetry) => DriverFacts;
  /** Lap times are shown (not before a race starts). */
  showLaps: boolean;
  gainLaps: number;
  reference: DriverTelemetry | undefined;
}>;

const isSeconds = (cell: StandingsRowModel['gap']): boolean => cell.kind === 'seconds' || cell.kind === 'laps';

/** Columns not listed here always have data (place, number, name, class stripe). */
export const standingsColumnHasData = (
  id: string,
  row: StandingsRowModel,
  ctx: ColumnContext,
): boolean => {
  const { driver } = row;
  const info = ctx.infoOf(driver);
  switch (id) {
    case 'gain':
      return (row.positionChange ?? 0) !== 0;
    case 'flag':
      return info.countryCode !== null;
    case 'brand':
      return info.brand !== null;
    case 'licence':
      return info.licence !== null;
    case 'rating':
      return info.rating !== null;
    case 'ratingChange':
      return (info.ratingChange ?? 0) !== 0;
    // The leader's label alone is not a gap.
    case 'gap':
      return isSeconds(row.gap);
    case 'int':
      return isSeconds(row.interval);
    case 'lastLap':
      return ctx.showLaps && driver.lastLapSeconds !== null;
    case 'bestLap':
      return driver.bestLapSeconds !== null;
    case 'pit':
      return row.pit !== 'none' || driver.pit.lapsSinceExit !== null;
    case 'gainHistory':
      return (
        !row.isReference &&
        gainHistory(driver, ctx.reference, Math.max(1, ctx.gainLaps)).some((value) => value !== null)
      );
    default:
      return true;
  }
};

/** The same for Relatives rows (a car; the empty rows have nothing). */
export const relativesColumnHasData = (
  id: string,
  row: RelativeRow,
  ctx: ColumnContext,
): boolean => {
  if (row.kind === 'empty') return false;
  const { driver } = row;
  const info = ctx.infoOf(driver);
  switch (id) {
    case 'flag':
      return info.countryCode !== null;
    case 'brand':
      return info.brand !== null;
    case 'licence':
      return info.licence !== null;
    case 'rating':
      return info.rating !== null;
    case 'ratingChange':
      return (info.ratingChange ?? 0) !== 0;
    case 'pit':
      return row.inPit || driver.pit.lapsSinceExit !== null;
    case 'gap':
      return !row.isReference && row.seconds !== null;
    default:
      return true;
  }
};
