// What the boards draw of one driver, read from the Overlay API driver:
// the name, the car brand, the country, the licence and the rating.
import type { DriverTelemetry } from '@racelink/overlay';
import { carBrandOf } from '../r-common/driver/carBrands';
import { nationalityOfFlair } from '../r-common/driver/helpers';
import { formatDriverName } from '../r-common/driver/positions';
import { formatLicence } from './format.ts';

/** The parts of a driver read here: both the API's and the shared models' driver fit. */
export type DriverLike = Pick<
  DriverTelemetry,
  'name' | 'firstName' | 'lastName' | 'teamName' | 'carNumber' | 'carId' | 'carName'
> &
  Readonly<{
    ext: Readonly<{
      iracing: Readonly<{
        iRating: number | null;
        iRatingChange: number | null;
        flairId: number | null;
        license: Readonly<{ className: string; safetyRating: number | null; color: string | null }>;
      }> | null;
    }>;
  }>;

export type DriverInfo = Readonly<{
  name: string;
  carNumber: string;
  brand: string | null;
  countryCode: string | null;
  /** `A4.4` and the licence colour; null outside iRacing or without a licence. */
  licence: Readonly<{ text: string; color: string }> | null;
  rating: number | null;
  ratingChange: number | null;
}>;

/** A driver's name by the format setting; a team race shows the team. */
export const driverName = (
  driver: DriverLike,
  nameFormat: string,
  isTeamRacing: boolean | null,
): string => {
  if (isTeamRacing === true && driver.teamName !== '') return driver.teamName;
  const name = formatDriverName(driver, nameFormat);
  return name === '' ? driver.name : name;
};

export const driverInfo = (
  driver: DriverLike,
  nameFormat: string,
  isTeamRacing: boolean | null,
): DriverInfo => {
  const iracing = driver.ext.iracing;
  const brand = carBrandOf(driver.carId, driver.carName);
  const license = iracing?.license;
  return {
    name: driverName(driver, nameFormat, isTeamRacing),
    carNumber: driver.carNumber,
    brand: brand === 'n_a' ? null : brand,
    countryCode: nationalityOfFlair(iracing?.flairId ?? null)?.countryCode ?? null,
    licence:
      license === undefined || license.className === ''
        ? null
        : {
            text: formatLicence(license.className, license.safetyRating),
            color: license.color ?? '#5b6573',
          },
    rating: iracing?.iRating ?? null,
    ratingChange: iracing?.iRatingChange ?? null,
  };
};
