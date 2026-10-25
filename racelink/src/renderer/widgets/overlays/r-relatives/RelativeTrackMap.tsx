import type { CSSProperties } from 'react';
import type { DriverTelemetry } from '../../../../shared/overlay-api/fields/drivers';
import { cx } from '../r-common/driver/cx';

type Props = Readonly<{
  drivers: readonly DriverTelemetry[];
  referenceCarIdx: number | undefined;
}>;

/** A strip that shows every car's place around the lap. */
export function RelativeTrackMap({ drivers, referenceCarIdx }: Props) {
  return (
    <div className="RelativeTrackMap">
      <div className="startLine" />
      <div className="finishLine" />
      {drivers.map((driver) => {
        const isReference = driver.carIdx === referenceCarIdx;
        if (driver.isPaceCar || (driver.onPitRoad && !isReference)) return null;
        const percent = Number((driver.lapDistanceFraction * 100).toFixed(2));
        return (
          <div
            key={driver.carIdx}
            className="trackMapDriveCont"
            style={
              {
                '--pct': `${String(percent)}%`,
                zIndex: 10 * Math.max(0, 64 - (driver.position ?? 64)),
              } as CSSProperties
            }
          >
            <div
              className={cx('trackMapDrive', {
                isReferenceDriver: isReference,
                zeroPosition: percent <= 0.1,
                hundredPosition: percent === 100,
              })}
              style={{ left: `${String(percent)}%`, background: driver.classColor }}
            />
          </div>
        );
      })}
    </div>
  );
}
