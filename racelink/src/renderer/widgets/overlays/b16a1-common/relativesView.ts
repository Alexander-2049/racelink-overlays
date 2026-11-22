// Small decisions of the b16a1 Relatives table. Pure.
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import type { SessionTelemetry } from '../../../../shared/overlay-api/fields/session';

/** Text colour of a row: the focused car, a car of its class, or a car of another class. */
export type RowTone = 'reference' | 'same' | 'other';

export const rowTone = (
  driver: Pick<DriverTelemetry, 'classId'>,
  isReference: boolean,
  referenceClassId: number | null,
): RowTone => {
  if (isReference) return 'reference';
  return driver.classId === referenceClassId ? 'same' : 'other';
};

/**
 * Incidents as the game's limits put them: `8/17/25` is eight points, a
 * penalty at 17, disqualification at 25. A limit the series does not set is
 * left out; empty when the game gives no incident count.
 */
export const incidentsText = (
  incidents: Readonly<{
    count: number | null;
    limit: number | null;
    warningInitialLimit: number | null;
  }> | null,
): string => {
  if (incidents === null || incidents.count === null) return '';
  const parts = [String(incidents.count)];
  if (incidents.warningInitialLimit !== null && incidents.warningInitialLimit > 0)
    parts.push(String(incidents.warningInitialLimit));
  if (incidents.limit !== null && incidents.limit > 0) parts.push(String(incidents.limit));
  return parts.join('/');
};

/** Fuel left as a ratio 0..1; null when the tank size is unknown. */
export const fuelFraction = (
  liters: number | null | undefined,
  capacityLiters: number | null | undefined,
): number | null => {
  if (
    typeof liters !== 'number' ||
    typeof capacityLiters !== 'number' ||
    !Number.isFinite(liters) ||
    !Number.isFinite(capacityLiters) ||
    capacityLiters <= 0
  )
    return null;
  return Math.min(1, Math.max(0, liters / capacityLiters));
};

/** A car gap to the focused car as the table shows it: tenths, no sign. Empty when unknown. */
export const relativeGapText = (seconds: number | null, isReference: boolean): string => {
  if (isReference) return '0.0';
  if (seconds === null || !Number.isFinite(seconds)) return '';
  return Math.abs(seconds).toFixed(1);
};

/** The lap of the focused car for the footer: `17/≈23.09`. */
export const footerLap = (
  session: Pick<SessionTelemetry, 'lap' | 'lapsTotal' | 'estimatedTotalLaps'>,
): string => {
  if (session.lap <= 0) return '';
  if (session.lapsTotal !== null && session.lapsTotal > 0)
    return `${String(session.lap)}/${String(session.lapsTotal)}`;
  if (session.estimatedTotalLaps !== null)
    return `${String(session.lap)}/≈${session.estimatedTotalLaps.toFixed(2)}`;
  return String(session.lap);
};
