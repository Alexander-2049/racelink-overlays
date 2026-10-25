import { Fragment, memo, type ReactNode } from 'react';
import {
  DriverOfftracks,
  JokerLap,
  LapNumber,
  PitStint,
  PushToPass,
  TabularNumber,
  TireCompounds,
  VirtualEnergy,
} from '../r-common/driver/badges';
import { cx } from '../r-common/driver/cx';
import { convertSecToReadable, toFixedDown } from '../r-common/driver/format';
import { lapColumnDigits } from '../r-common/driver/helpers';
import type { RDensity, RRowSettings, RTheme } from '../r-common/driver/model';
import { OrderableColumn, RowShell } from '../r-common/driver/rows';
import {
  AverageLapTime,
  DeltaLapTime,
  FastestLapTime,
  LastLapTime,
} from '../r-common/driver/timing';
import { ClassHeader } from './ClassHeader';
import { sideColumnKeys } from './sideColumnKeys';
import { PositionDownIcon, PositionSameIcon, PositionUpIcon } from './icons';
import type { ClassGroup, Gap, StandingsRow } from './standingsRows';

export type SideSettings = Readonly<{
  ShowPositionsChanged: boolean;
  ShowIntervalDistance: boolean;
  ShowGap: boolean;
  ShowRelativeTimeDistance: boolean;
  EnableSlidingSideMenu: boolean;
  HideSideColumnHeader: boolean;
  EnableMultiClass: boolean;
  sideOrder: readonly number[];
  showCarClassNameLabels: boolean;
  showCarClassSof: boolean;
  showCarClassNumOfDrivers: boolean;
  showCarClassLapCounters: boolean;
}>;

const headerOf = (key: string, s: RRowSettings): string => {
  switch (key) {
    case 'ShowTireCompounds':
      return 'Tire';
    case 'ShowIntervalDistance':
      return 'Int';
    case 'ShowDriverOfftracks':
      return 'Off';
    case 'ShowRelativeTimeDistance':
      return 'Rel.';
    case 'ShowLapNumber':
      return 'Lap';
    case 'ShowPushToPass':
      return 'P2P';
    case 'ShowLast5LapTimeAvg':
      if (!s.DropLast5LapMinute) return 'Last 5';
      return s.Last5LapTimeAvgDecimals <= 1 ? 'L5' : 'Last 5';
    case 'ShowLast10LapTimeAvg':
      if (!s.DropLast10LapMinute) return s.Last10LapTimeAvgDecimals === 0 ? 'L10' : 'Last 10';
      return s.Last10LapTimeAvgDecimals <= 2 ? 'L10' : 'Last 10';
    case 'ShowLapDelta':
      return 'Delta';
    case 'ShowVirtualEnergy':
      return 'NRG';
    case 'ShowFastestLapTime':
      if (!s.DropFastestLapTimeMinute) return s.FastestLapTimeDecimals === 0 ? 'Fast.' : 'Fastest';
      if (s.FastestLapTimeDecimals === 2 || s.FastestLapTimeDecimals === 1) return 'Fast.';
      return s.FastestLapTimeDecimals === 0 ? 'F.' : 'Fastest';
    case 'ShowGap':
      return 'Gap';
    case 'ShowLastLapTime':
      return s.DropLastLapTimeMinute && s.LastLapTimeDecimals === 0 ? 'L.' : 'Last';
    case 'ShowJokerLap':
      return 'Jok.';
    case 'ShowCompletedStint':
      return 'Compl.';
    case 'ShowCurrentStint':
      return 'Curr.';
    default:
      return '';
  }
};

const gapText = (gap: Gap | null, decimals: number | null): string => {
  if (gap === null || gap.gapValue === null) return '-';
  if (gap.gapMetric === 'laps') return toFixedDown(gap.gapValue, 0);
  if (decimals !== null) {
    return gap.gapValue >= 60
      ? convertSecToReadable(String(gap.gapValue))
      : gap.gapValue.toFixed(decimals);
  }
  if (gap.gapValue >= 60) return convertSecToReadable(String(gap.gapValue));
  return toFixedDown(gap.gapValue, gap.gapValue >= 10 ? 0 : 1);
};

function GapBadge({
  gap,
  decimals,
  legacy,
  className,
}: Readonly<{ gap: Gap | null; decimals: number; legacy: boolean; className: string }>) {
  return (
    <div
      className={cx(className, {
        legacy,
        decimalsCount1: decimals === 1,
        decimalsCount2: decimals === 2,
        decimalsCount3: decimals === 3,
      })}
    >
      <TabularNumber legacy={legacy}>
        {gapText(gap, decimals)}
        {gap?.gapMetric === 'laps' ? 'L' : ''}
      </TabularNumber>
    </div>
  );
}

function PositionChangedBadge({
  value,
  legacy,
}: Readonly<{ value: number | null; legacy: boolean }>) {
  const amount = value ?? 0;
  return (
    <div
      className={cx('overlayBadge positionChanged', {
        gain: amount > 0,
        lose: amount < 0,
        neutral: amount === 0,
        legacy,
      })}
    >
      {amount > 0 && <PositionUpIcon />}
      {amount < 0 && <PositionDownIcon />}
      {amount === 0 && <PositionSameIcon />}
      <span>{Math.abs(amount)}</span>
    </div>
  );
}

type HeaderCellProps = Readonly<{
  header: string;
  isHeader: boolean;
  legacy: boolean;
  headerPadding?: '3' | '6';
  children: ReactNode;
}>;

/** A cell, or — in the header row — the column title sized by an example cell. */
const HeaderCell = memo(function HeaderCell({
  header,
  isHeader,
  legacy,
  headerPadding,
  children,
}: HeaderCellProps) {
  if (!isHeader) return <>{children}</>;
  return (
    <div
      className={cx('stcolheader', {
        padding6: headerPadding === '6',
        padding3: headerPadding === '3',
        legacy,
      })}
    >
      <div className="stcolheadersizeby">{children}</div>
      <div className="stcolheadertext">{header}</div>
    </div>
  );
});

type RowCellsProps = Readonly<{
  row: StandingsRow;
  settings: RRowSettings;
  side: SideSettings;
  isHeader: boolean;
  legacy: boolean;
  columnDigits: number;
  showPositionsChanged: boolean;
  showLapDelta: boolean;
}>;

/** The cells of one side row, as `[column key, node]`. */
const rowCells = ({
  row,
  settings: s,
  side,
  isHeader,
  legacy,
  columnDigits,
  showPositionsChanged,
  showLapDelta,
}: RowCellsProps): [string, ReactNode][] => {
  const p = row.position;
  const header = (key: string, children: ReactNode, padding?: '3' | '6') => (
    <HeaderCell
      header={headerOf(key, s)}
      isHeader={isHeader}
      legacy={legacy}
      headerPadding={padding}
    >
      {children}
    </HeaderCell>
  );
  const cells: [string, ReactNode][] = [];
  if (side.ShowPositionsChanged && showPositionsChanged)
    cells.push([
      'ShowPositionsChanged',
      header(
        'ShowPositionsChanged',
        <PositionChangedBadge value={row.positionsChanged} legacy={legacy} />,
      ),
    ]);
  if (s.ShowTireCompounds)
    cells.push([
      'ShowTireCompounds',
      header(
        'ShowTireCompounds',
        <TireCompounds
          visible
          tireCount={s.NumberOfTireCompoundsToShow}
          tireCompoundsHistory={p.tireCompoundsHistory}
          showLaps={s.ShowLapsCompletedOnTireCompounds}
          legacy={legacy}
        />,
      ),
    ]);
  if (s.ShowCurrentStint)
    cells.push([
      'ShowCurrentStint',
      header(
        'ShowCurrentStint',
        <PitStint
          type="current"
          lapsCompleted={p.pitEntry?.numberOfLapsSinceLastPitted}
          color={s.CurrentStintColor}
          size={legacy ? '16' : '19'}
        />,
      ),
    ]);
  if (s.ShowCompletedStint)
    cells.push([
      'ShowCompletedStint',
      header(
        'ShowCompletedStint',
        <PitStint
          type="completed"
          lapsCompleted={p.pitEntry?.lastStint?.numberOfLapsCompleted}
          stintNumber={p.pitEntry?.lastStint?.stintNumber}
          color={s.CompletedStintColor}
          size={legacy ? '16' : '19'}
        />,
      ),
    ]);
  if (side.ShowIntervalDistance)
    cells.push([
      'ShowIntervalDistance',
      header(
        'ShowIntervalDistance',
        <GapBadge
          className="overlayBadge intervalDistance"
          gap={row.interval}
          decimals={1}
          legacy={legacy}
        />,
      ),
    ]);
  if (side.ShowGap)
    cells.push([
      'ShowGap',
      header(
        'ShowGap',
        <GapBadge className="overlayBadge Gap" gap={row.gap} decimals={1} legacy={legacy} />,
      ),
    ]);
  if (s.ShowDriverOfftracks)
    cells.push([
      'ShowDriverOfftracks',
      header(
        'ShowDriverOfftracks',
        <DriverOfftracks
          visible
          count={p.offTrackCount}
          alignText="left"
          disableAnim={s.DisableOfftrackAnim}
          driverIdx={p.driverIdx}
          legacy={legacy}
        />,
      ),
    ]);
  if (side.ShowRelativeTimeDistance)
    cells.push([
      'ShowRelativeTimeDistance',
      header(
        'ShowRelativeTimeDistance',
        <GapBadge
          className="overlayBadge Gap"
          gap={
            row.relativeSeconds === null
              ? null
              : { gapValue: row.relativeSeconds, gapMetric: 'seconds' }
          }
          decimals={1}
          legacy={legacy}
        />,
      ),
    ]);
  if (s.ShowLapNumber)
    cells.push([
      'ShowLapNumber',
      header(
        'ShowLapNumber',
        <LapNumber visible lapNumber={p.lapNumber} legacy={legacy} columnDigits={columnDigits} />,
      ),
    ]);
  if (s.ShowPushToPass)
    cells.push([
      'ShowPushToPass',
      header(
        'ShowPushToPass',
        <PushToPass visible value={p.pushToPass} size={legacy ? '19' : '21'} />,
      ),
    ]);
  if (s.ShowFastestLapTime)
    cells.push([
      'ShowFastestLapTime',
      header(
        'ShowFastestLapTime',
        <FastestLapTime
          visible
          value={p.fastestLapTime}
          carIsReference={p.carIsReference}
          inactive={false}
          driverIdx={p.driverIdx}
          highlightedBackgroundOpacity={s.HighlightedLapTimeOpacity}
          decimals={s.FastestLapTimeDecimals}
          dropMinute={s.DropFastestLapTimeMinute}
          sizeByContent
          legacy={legacy}
        />,
        '6',
      ),
    ]);
  if (s.ShowLastLapTime)
    cells.push([
      'ShowLastLapTime',
      header(
        'ShowLastLapTime',
        <LastLapTime
          visible
          value={p.lastLapTime}
          carIsReference={p.carIsReference}
          inactive={false}
          driverIdx={p.driverIdx}
          highlightedBackgroundOpacity={s.HighlightedLapTimeOpacity}
          decimals={s.LastLapTimeDecimals}
          dropMinute={s.DropLastLapTimeMinute}
          sizeByContent
          legacy={legacy}
        />,
        '6',
      ),
    ]);
  if (s.ShowLast5LapTimeAvg)
    cells.push([
      'ShowLast5LapTimeAvg',
      header(
        'ShowLast5LapTimeAvg',
        <AverageLapTime
          visible
          value={p.last5LapTimeAvg}
          carIsReference={p.carIsReference}
          inactive={false}
          driverIdx={p.driverIdx}
          highlightedBackgroundOpacity={s.HighlightedLapTimeOpacity}
          decimals={s.Last5LapTimeAvgDecimals}
          dropMinute={s.DropLast5LapMinute}
          sizeByContent
          legacy={legacy}
        />,
        '6',
      ),
    ]);
  if (s.ShowLast10LapTimeAvg)
    cells.push([
      'ShowLast10LapTimeAvg',
      header(
        'ShowLast10LapTimeAvg',
        <AverageLapTime
          visible
          value={p.last10LapTimeAvg}
          carIsReference={p.carIsReference}
          inactive={false}
          driverIdx={p.driverIdx}
          highlightedBackgroundOpacity={s.HighlightedLapTimeOpacity}
          decimals={s.Last10LapTimeAvgDecimals}
          dropMinute={s.DropLast10LapMinute}
          sizeByContent
          legacy={legacy}
        />,
        '6',
      ),
    ]);
  if (showLapDelta && s.ShowLapDelta)
    cells.push([
      'ShowLapDelta',
      header(
        'ShowLapDelta',
        <DeltaLapTime
          visible
          value={p.lapDelta}
          count={s.LapDeltaCount}
          carIsReference={p.carIsReference}
          highlightedBackgroundOpacity={s.HighlightedLapTimeOpacity}
          legacy={legacy}
        />,
      ),
    ]);
  if (s.ShowVirtualEnergy)
    cells.push([
      'ShowVirtualEnergy',
      header(
        'ShowVirtualEnergy',
        <VirtualEnergy
          visible
          value={p.virtualEnergy}
          hideBattery={s.NRG_HideBattery}
          hidePctNumber={s.NRG_HidePctNumber}
          hidePctSign={s.NRG_HidePctSign}
          whiteOnly={s.NRG_BatteryWhiteOnly}
          batterySize={s.NRG_BatterySize}
          legacy={legacy}
        />,
        '6',
      ),
    ]);
  if (s.ShowJokerLap)
    cells.push([
      'ShowJokerLap',
      header('ShowJokerLap', <JokerLap visible isCompleted={p.jokerLapsCompleted > 0} isColumn />),
    ]);
  return cells;
};

type SideColumnsProps = Readonly<{
  groups: readonly ClassGroup[];
  settings: RRowSettings;
  side: SideSettings;
  theme: RTheme;
  density: RDensity;
  sideOpacity: number;
  showPositionsChanged: boolean;
  showLapDelta: boolean;
  /** With the sliding menu: the index of the column on show. */
  showColumnOnIndex?: number;
}>;

/** The columns right of the main rows: gaps, lap times, stints and more, per class. */
export function SideColumns(props: SideColumnsProps) {
  const { groups, settings, side, theme, density } = props;
  const legacy = theme === 'CLASSIC';
  const columnDigits = lapColumnDigits(
    groups.flatMap((group) => group.rows.map((row) => row.position.lapNumber)),
  );
  const visibleGroups = groups.filter((group) => side.EnableMultiClass || group.isReferenceClass);
  const firstRow = visibleGroups[0]?.rows[0];
  const sideSettings = { ...settings, Opacity: legacy ? settings.Opacity : 0.3 * settings.Opacity };

  const renderRow = (
    row: StandingsRow,
    options: {
      isHeader: boolean;
      classIndex: number;
      index: number;
      count: number;
      lastGroup: boolean;
    },
  ) => {
    const cells = rowCells({
      row,
      settings,
      side,
      isHeader: options.isHeader,
      legacy,
      columnDigits,
      showPositionsChanged: props.showPositionsChanged,
      showLapDelta: props.showLapDelta,
    });
    const placed = cells.map(([key, node]) => {
      const keyIndex = sideColumnKeys.indexOf(key as (typeof sideColumnKeys)[number]);
      const order = keyIndex >= 0 ? (side.sideOrder[keyIndex] ?? -1) : -1;
      return { key, node, order };
    });
    const slide = side.EnableSlidingSideMenu
      ? [placed[(props.showColumnOnIndex ?? 0) % Math.max(placed.length, 1)]]
      : placed;
    return (
      <Fragment
        key={`${String(options.classIndex)}-${String(options.index)}-${String(row.position.driverIdx)}`}
      >
        {options.classIndex !== 0 && options.index === 0 && !options.isHeader && (
          <ClassHeader
            invisible={theme !== 'LUMINA'}
            numberOfDrivers={1}
            shortName="na"
            color={row.position.carClassColor}
            sof={1}
            currentLap={1}
            estimatedTotalLaps={1}
            estimatedTotalLapsCalculated={false}
            showClassName={side.showCarClassNameLabels}
            showSof={side.showCarClassSof}
            showNumberOfDrivers={side.showCarClassNumOfDrivers}
            showLapCounters={side.showCarClassLapCounters}
            theme={theme}
            density={density}
            sidePanelMode
            height0={options.classIndex === 1}
          />
        )}
        <RowShell
          theme={theme}
          density={options.isHeader ? 'COMPACT' : density}
          isReference={!options.isHeader && row.position.carIsReference}
          posIndex={options.index + 1}
          lastIndex={options.lastGroup ? options.count : -1}
          opacity={sideSettings.Opacity}
          backgroundMode="none"
          inactive={row.position.driverIsNotPresent}
          settings={sideSettings}
          highlight="ROW_END"
          isLapped={false}
          isLapping={false}
          rowIsEmpty={false}
          withRightPadding={false}
        >
          <div className="standingsSideGap" />
          {slide.map((cell) =>
            cell === undefined ? null : (
              <OrderableColumn key={cell.key} order={cell.order}>
                {cell.node}
              </OrderableColumn>
            ),
          )}
        </RowShell>
        {row.slicedBottom && !options.isHeader && (
          <div
            className={cx('standingsSlicedBottom', {
              luminaTheme: theme === 'LUMINA',
              classicTheme: legacy,
            })}
          />
        )}
      </Fragment>
    );
  };

  return (
    <>
      {!side.HideSideColumnHeader &&
        firstRow !== undefined &&
        renderRow(firstRow, {
          isHeader: true,
          classIndex: 0,
          index: 0,
          count: 1,
          lastGroup: false,
        })}
      {visibleGroups.map((group, groupIndex) =>
        group.rows.map((row, index) =>
          renderRow(row, {
            isHeader: false,
            classIndex: groupIndex + 1,
            index,
            count: group.rows.length,
            lastGroup: groupIndex === visibleGroups.length - 1,
          }),
        ),
      )}
    </>
  );
}
