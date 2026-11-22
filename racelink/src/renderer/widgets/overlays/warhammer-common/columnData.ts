// Whether a Warhammer table column has anything to show in a row; a column
// with nothing in any row is left out of the table. Pure.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import {
  gainHistory,
  type RelativeRow,
  type StandingsRowModel,
} from '../streamer-common/index.ts';
import { formatIRating, formatLicence, formatPitTime } from './format.ts';

export type ColumnContext = Readonly<{
  showLicence: boolean;
  showIRating: boolean;
  licenceFormat: 'classRating' | 'rating' | 'class';
  iRatingFormat: 'k' | 'full';
  gainHistoryLaps: number;
  isRace: boolean;
  reference: DriverTelemetry | undefined;
}>;

const hasRatings = (driver: DriverTelemetry, ctx: ColumnContext): boolean => {
  const iracing = driver.ext.iracing;
  const licence = ctx.showLicence ? formatLicence(iracing?.license, ctx.licenceFormat) : '';
  const rating = ctx.showIRating ? formatIRating(iracing?.iRating, ctx.iRatingFormat) : '';
  return licence !== '' || rating !== '';
};

const hasBrand = (driver: DriverTelemetry): boolean => driver.carId !== null || driver.carName !== '';

/** Columns not listed here always have data (place, number, name, class stripe). */
export const standingsColumnHasData = (
  id: string,
  row: StandingsRowModel,
  ctx: ColumnContext,
): boolean => {
  const { driver } = row;
  switch (id) {
    case 'gain':
      return (row.positionChange ?? 0) !== 0;
    case 'brand':
      return hasBrand(driver);
    case 'ratings':
      return hasRatings(driver, ctx);
    case 'ratingChange':
      return ctx.isRace && driver.ext.iracing?.iRatingChange !== null && driver.ext.iracing?.iRatingChange !== undefined;
    case 'pitState':
      return row.pit !== 'none';
    // The leader's label alone is not a gap.
    case 'gap':
      return row.gap.kind === 'seconds' || row.gap.kind === 'laps';
    case 'interval':
      return row.interval.kind === 'seconds' || row.interval.kind === 'laps';
    case 'lapTime':
      return (ctx.isRace ? driver.lastLapSeconds : driver.bestLapSeconds) !== null;
    case 'pitLap':
      return driver.pit.lastStopLap !== null;
    case 'pitTime': {
      const live = driver.onPitRoad && driver.pit.timeInPitSeconds !== null;
      return formatPitTime(live ? driver.pit.timeInPitSeconds : driver.pit.lastStopSeconds) !== '';
    }
    case 'gainHistory':
      return (
        !row.isReference &&
        gainHistory(driver, ctx.reference, Math.max(1, Math.round(ctx.gainHistoryLaps))).some(
          (value) => value !== null,
        )
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
  switch (id) {
    case 'brand':
      return hasBrand(driver);
    case 'pitLap':
      return driver.pit.lastStopLap !== null;
    case 'ratings':
      return hasRatings(driver, ctx);
    case 'time':
      return !row.isReference && row.seconds !== null;
    default:
      return true;
  }
};
