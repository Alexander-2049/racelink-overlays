// Whether a b16a1 table column has anything to show in a row; a column with
// nothing in any row is left out of the table. Pure.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { StandingsRowView } from './standingsView.ts';

/** What the pictures need to exist: a flag for the flair, a logo for the car. */
export type PictureLookup = Readonly<{
  flag: (flairId: number | null | undefined) => boolean;
  brand: (carId: number | null | undefined) => boolean;
}>;

const hasLicence = (driver: DriverTelemetry): boolean =>
  (driver.ext.iracing?.license.safetyRating ?? null) !== null;

const hasRating = (driver: DriverTelemetry): boolean => (driver.ext.iracing?.iRating ?? null) !== null;

/** Columns not listed here always have data (place, number, name, laps). */
export const standingsColumnHasData = (
  id: string,
  row: StandingsRowView,
  pictures: PictureLookup,
): boolean => {
  const { base, lapTime, pit, history } = row;
  const { driver } = base;
  switch (id) {
    case 'gain':
      return (base.positionChange ?? 0) !== 0;
    case 'flag':
      return pictures.flag(driver.ext.iracing?.flairId);
    case 'team':
      return driver.teamName !== '';
    case 'brand':
      return pictures.brand(driver.carId);
    case 'carName':
      return driver.carName !== '';
    case 'licence':
      return hasLicence(driver);
    case 'rating':
      return hasRating(driver);
    // The leader's label alone is not a gap.
    case 'gap':
      return base.gap.kind === 'seconds' || base.gap.kind === 'laps';
    case 'interval':
      return base.interval.kind === 'seconds' || base.interval.kind === 'laps';
    case 'lapTime':
      return lapTime.seconds !== null;
    case 'bestLap':
      return driver.bestLapSeconds !== null;
    case 'stops':
      return driver.pit.stops !== null;
    case 'pit':
      return pit !== null;
    case 'history':
      return history !== null && history.some((cell) => cell.seconds !== null);
    case 'tyre':
      return driver.tyreCompound !== null;
    default:
      return true;
  }
};

/** The same for the b16a1 Relatives rows (a car; the empty rows have nothing). */
export const relativesColumnHasData = (
  id: string,
  car: Readonly<{ driver: DriverTelemetry; isReference: boolean; seconds: number | null }> | null,
  pictures: PictureLookup,
): boolean => {
  if (car === null) return false;
  const { driver } = car;
  switch (id) {
    case 'flag':
      return pictures.flag(driver.ext.iracing?.flairId);
    case 'brand':
      return pictures.brand(driver.carId);
    case 'licence':
      return hasLicence(driver);
    case 'rating':
      return hasRating(driver);
    case 'gap':
      return !car.isReference && car.seconds !== null;
    default:
      return true;
  }
};
