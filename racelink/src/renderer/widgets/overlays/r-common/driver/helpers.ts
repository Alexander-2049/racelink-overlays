import { getCountryCodeFromFlairId } from '../../../../../shared/lib/iracingFlair';
import type { RNationality } from './model';

/** The country of a driver from the game's flair id. */
export const nationalityOfFlair = (flairId: number | null): RNationality | null => {
  if (flairId === null || flairId <= 0) return null;
  const countryCode = getCountryCodeFromFlairId(flairId);
  return countryCode
    ? { countryCode, name: countryCode.toUpperCase(), shortName: countryCode.toUpperCase() }
    : null;
};

/** The number of digits the lap column needs for the largest lap in the list. */
export const lapColumnDigits = (laps: readonly (number | null)[]): number => {
  let max = 0;
  for (const lap of laps) if (lap !== null && lap > max) max = lap;
  return Math.max(2, String(max).length);
};
