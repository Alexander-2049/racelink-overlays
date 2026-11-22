// What Racelink's asset index says about iRacing's cars and flairs: the brand of
// a car (for its logo) and the country of a flair (for its flag).
import { assetUrls } from '@racelink/overlay';
import { useEffect, useState } from 'react';
import { emptyTables, tablesOf, type AssetTables } from './assetTables.ts';

let cached: Promise<AssetTables> | null = null;

const load = (): Promise<AssetTables> => {
  cached ??= fetch(assetUrls.index)
    .then((response) => (response.ok ? response.json() : null))
    .then((index: unknown) => tablesOf(index))
    .catch((): AssetTables => emptyTables);
  return cached;
};

/** The tables; empty until the index loads, and without a running Racelink. */
export const useAssetTables = (): AssetTables => {
  const [tables, setTables] = useState<AssetTables>(emptyTables);
  useEffect(() => {
    let alive = true;
    void load().then((loaded) => {
      if (alive) setTables(loaded);
    });
    return () => {
      alive = false;
    };
  }, []);
  return tables;
};

/** The logo of a car, or null when its brand has none. */
export const carLogoUrl = (tables: AssetTables, carId: number | null): string | null => {
  if (carId === null) return null;
  const brand = tables.brands[String(carId)];
  return brand === undefined ? null : assetUrls.carLogo(brand);
};

/** The flag of a driver's country (iRacing flair), or null when it has none. */
export const flagUrl = (tables: AssetTables, flairId: number | null | undefined): string | null => {
  if (flairId === null || flairId === undefined) return null;
  const code = tables.flairs[String(flairId)];
  return code === undefined ? null : assetUrls.flag(code);
};
