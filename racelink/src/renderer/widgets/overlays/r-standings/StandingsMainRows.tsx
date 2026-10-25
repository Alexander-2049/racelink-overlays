import { Fragment, memo } from 'react';
import { cx } from '../r-common/driver/cx';
import type { RRowSettings, RTheme } from '../r-common/driver/model';
import { DriverRow } from '../r-common/driver/rows';
import { standingsColumnKeys } from '../r-common/driver/rowSettings';
import { ClassHeader } from './ClassHeader';
import type { ClassGroup, StandingsRow } from './standingsRows';

type HeaderOptions = Readonly<{
  showClassName: boolean;
  showSof: boolean;
  showNumberOfDrivers: boolean;
  showLapCounters: boolean;
}>;

type RowProps = Readonly<{
  row: StandingsRow;
  index: number;
  count: number;
  lastGroup: boolean;
  theme: RTheme;
  settings: RRowSettings;
}>;

const MainRow = memo(function MainRow({ row, index, count, lastGroup, theme, settings }: RowProps) {
  return (
    <div
      className={cx('mainPositionRowContainer', {
        slicedBottom: row.slicedBottom,
        isReferenceBg: row.position.carIsReference,
        luminaTheme: theme === 'LUMINA',
        classicTheme: theme === 'CLASSIC',
      })}
      data-current-position={row.position.position}
    >
      <DriverRow
        theme={theme}
        position={row.position}
        settings={settings}
        posIndex={index + 1}
        lastIndex={lastGroup ? count : -1}
        columnDigits={2}
        backgroundMode="normal"
        ColumnOrderKeys={standingsColumnKeys}
      />
    </div>
  );
});

type Props = Readonly<{
  groups: readonly ClassGroup[];
  settings: RRowSettings;
  theme: RTheme;
  multiClass: boolean;
  header: HeaderOptions;
}>;

/** The main rows of the Standings overlay, grouped by car class. */
export function StandingsMainRows({ groups, settings, theme, multiClass, header }: Props) {
  const shown = groups.filter((group) => group.isReferenceClass || multiClass);
  return (
    <>
      {shown.map((group, groupIndex) => (
        <Fragment key={group.classId}>
          <ClassHeader
            numberOfDrivers={group.numberOfDrivers}
            shortName={group.shortName}
            sof={group.sof}
            color={group.color}
            currentLap={group.currentLap}
            estimatedTotalLaps={group.estimatedTotalLaps}
            estimatedTotalLapsCalculated={group.estimatedTotalLapsCalculated}
            showClassName={header.showClassName}
            showSof={header.showSof}
            showNumberOfDrivers={header.showNumberOfDrivers}
            showLapCounters={header.showLapCounters}
            theme={theme}
            density={settings.Density}
          />
          {group.rows.map((row, index) => (
            <MainRow
              key={`${row.position.driverName}-${String(row.position.driverIdx)}`}
              row={row}
              index={index}
              count={group.rows.length}
              lastGroup={groupIndex === shown.length - 1}
              theme={theme}
              settings={settings}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
}
