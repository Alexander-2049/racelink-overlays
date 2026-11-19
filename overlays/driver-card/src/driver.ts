import { assetsUrl, type DriverTelemetry } from '@racelink/overlay';
import { nationalityOfFlair } from '../../../racelink/src/renderer/widgets/overlays/r-common/driver/helpers';

/** A design a driver picked in iRacing: a pattern number and its colours. */
export type Design = Readonly<{ pattern: number; colors: readonly string[] }>;

/** Everything the card shows of one driver. */
export type Card = Readonly<{
  carIdx: number;
  name: string;
  carNumber: string;
  classColor: string;
  countryCode: string | null;
  countryName: string | null;
  helmet: Design | null;
  car: Design | null;
  carSideUrl: string | null;
  carTemplateUrl: string | null;
}>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const colorPattern = /^#[0-9a-f]{6}$/i;

/**
 * `drivers[].ext.iracing.design.*` (Overlay API 2.19). Read defensively: an
 * older Racelink does not send it, and the data is not this page's to trust.
 */
export const designOf = (value: unknown): Design | null => {
  if (!isRecord(value)) return null;
  const { pattern, colors } = value;
  if (typeof pattern !== 'number' || !Number.isInteger(pattern) || pattern < 0) return null;
  if (!Array.isArray(colors)) return null;
  const valid = colors.filter((color): color is string => typeof color === 'string' && colorPattern.test(color));
  return valid.length > 0 ? { pattern, colors: valid.slice(0, 3) } : null;
};

/** A picture Racelink serves on this computer; anything else is not shown. */
const localPicture = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('http://127.0.0.1:') ? value : null;

/** The helmet Racelink draws in a driver's colours (`assetUrls.helmet` of SDK 2.16). */
export const helmetUrl = (design: Design | null): string => {
  const colors = (design?.colors ?? []).map((color) => color.slice(1).toLowerCase());
  const query = colors.length > 0 ? `?c=${colors.join(',')}` : '';
  return `${assetsUrl}/helmets/${String(design?.pattern ?? 0)}.svg${query}`;
};

export const cardOf = (driver: DriverTelemetry): Card => {
  const iracing: unknown = driver.ext.iracing;
  const ext = isRecord(iracing) ? iracing : {};
  const design = isRecord(ext.design) ? ext.design : {};
  const paint = isRecord(ext.paint) ? ext.paint : {};
  const flairId = typeof ext.flairId === 'number' ? ext.flairId : null;
  const nationality = nationalityOfFlair(flairId);
  return {
    carIdx: driver.carIdx,
    name: driver.name,
    carNumber: driver.carNumber,
    classColor: driver.classColor,
    countryCode: nationality?.countryCode ?? null,
    countryName: nationality?.name ?? null,
    helmet: designOf(design.helmet),
    car: designOf(design.car),
    carSideUrl: localPicture(paint.carSideUrl),
    carTemplateUrl: localPicture(paint.carTemplateUrl),
  };
};

/** The driver the card follows: the focused car, or the player. */
export const pickDriver = (
  drivers: readonly DriverTelemetry[],
  which: string,
): DriverTelemetry | null =>
  drivers.find((driver) => (which === 'player' ? driver.isPlayer : driver.isFocused)) ??
  drivers.find((driver) => driver.isPlayer) ??
  null;
