import type { DriverTelemetry } from '@racelink/overlay';
import { nationalityOfFlair } from '../../../racelink/src/renderer/widgets/overlays/r-common/driver/helpers';

/** Everything the card shows of one driver. */
export type Card = Readonly<{
  carIdx: number;
  name: string;
  carNumber: string;
  classColor: string;
  countryCode: string | null;
  countryName: string | null;
  /** The car with its livery and the helmet, as iRacing itself draws them (Overlay API 2.19). */
  carUrl: string | null;
  helmetUrl: string | null;
}>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A picture Racelink serves on this computer; anything else is not shown. */
export const localPicture = (value: unknown): string | null =>
  typeof value === 'string' && value.startsWith('http://127.0.0.1:') ? value : null;

export const cardOf = (driver: DriverTelemetry): Card => {
  const iracing: unknown = driver.ext.iracing;
  const ext = isRecord(iracing) ? iracing : {};
  // `ext.iracing.render` is read defensively: an older Racelink does not send it.
  const render = isRecord(ext.render) ? ext.render : {};
  const flairId = typeof ext.flairId === 'number' ? ext.flairId : null;
  const nationality = nationalityOfFlair(flairId);
  return {
    carIdx: driver.carIdx,
    name: driver.name,
    carNumber: driver.carNumber,
    classColor: driver.classColor,
    countryCode: nationality?.countryCode ?? null,
    countryName: nationality?.name ?? null,
    carUrl: localPicture(render.carUrl),
    helmetUrl: localPicture(render.helmetUrl),
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
