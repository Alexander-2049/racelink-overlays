// The make of a car as a small white logo (the R- overlays' logos, see brands.css).
import { memo } from 'react';
import { carBrandOf } from '../r-common/driver/carBrands';
import './brands.css';

export const Brand = memo(function Brand({
  carId,
  carName,
}: Readonly<{ carId: number | null; carName: string }>) {
  const brand = carBrandOf(carId, carName);
  return <span className={`wh-brand ${brand}`} title={carName} aria-hidden="true" />;
});
