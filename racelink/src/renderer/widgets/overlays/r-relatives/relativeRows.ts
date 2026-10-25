import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import { emptyPosition, toPosition, type PositionData } from '../r-common/driver/positions';
import type { RPosition } from '../r-common/driver/model';

type Options = Readonly<{
  linesAhead: number;
  linesBehind: number;
  excludeCarsInPit: boolean;
}>;

/** Signed distance around the lap from `from` to `to`, in -0.5..0.5 of a lap. */
const lapOffset = (from: DriverTelemetry, to: DriverTelemetry): number => {
  let offset = to.lapDistanceFraction - from.lapDistanceFraction;
  if (offset > 0.5) offset -= 1;
  if (offset < -0.5) offset += 1;
  return offset;
};

/**
 * The cars around the reference car by track position: `linesAhead` rows above,
 * the reference car, `linesBehind` rows below. Missing cars are empty rows.
 */
export const relativeRows = (data: PositionData, options: Options): RPosition[] => {
  const { reference, competitors, context } = data;
  if (reference === undefined) return [];
  const others = competitors.filter(
    (driver) =>
      driver.carIdx !== reference.carIdx &&
      driver.trackSurface !== 'notInWorld' &&
      !(options.excludeCarsInPit && driver.onPitRoad),
  );
  const ahead = others
    .filter((driver) => lapOffset(reference, driver) > 0)
    .sort((a, b) => lapOffset(reference, a) - lapOffset(reference, b))
    .slice(0, options.linesAhead)
    .reverse();
  const behind = others
    .filter((driver) => lapOffset(reference, driver) <= 0)
    .sort((a, b) => lapOffset(reference, b) - lapOffset(reference, a))
    .slice(0, options.linesBehind);
  const rows: RPosition[] = [];
  for (let index = 0; index < options.linesAhead - ahead.length; index += 1)
    rows.push(emptyPosition(index));
  rows.push(...ahead.map((driver) => toPosition(driver, context)));
  rows.push(toPosition(reference, context));
  rows.push(...behind.map((driver) => toPosition(driver, context)));
  for (let index = 0; index < options.linesBehind - behind.length; index += 1) {
    rows.push(emptyPosition(options.linesAhead + 1 + index));
  }
  return rows;
};
