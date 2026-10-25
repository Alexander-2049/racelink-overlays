import { useEffect, useMemo, useState } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { DriverFlagBadge } from '../r-common/driver/driver';
import { cx } from '../r-common/driver/cx';
import type { RDriverFlag, RIratingFormat, RRowSettings } from '../r-common/driver/model';
import { readPositionData, type PositionOptions } from '../r-common/driver/positions';
import { RowShell } from '../r-common/driver/rows';
import { readRowSettings, readTheme, standingsColumnKeys } from '../r-common/driver/rowSettings';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { buildWidgetData } from '../r-common/widgets/data';
import { barWidgets } from '../r-common/widgets/bars';
import { standingsGroups, type ClassGroup } from './standingsRows';
import { SideColumns, type SideSettings } from './SideColumns';
import { sideColumnKeys } from './sideColumnKeys';
import { StandingsBottomBar, StandingsTopBar } from './StandingsBars';
import { StandingsContainer } from './StandingsContainer';
import { StandingsMainRows } from './StandingsMainRows';

/** The board renders this often at most; more renders only cost CPU. */
const boardRenderHz = 10;

const topics: readonly TelemetryTopic[] = [
  'connection',
  'car',
  'controls',
  'vehicle',
  'session',
  'timing',
  'fuel',
  'drivers',
  'weather',
];

const sessionLetters = { race: 'R', qualify: 'Q', practice: 'P', warmup: 'P' } as const;

/** Moves the sliding side menu to the next column on a timer. */
const useSlidingColumn = (enabled: boolean, delaySeconds: number) => {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let hideTimer: number | undefined;
    const interval = window.setInterval(
      () => {
        setHidden(true);
        hideTimer = window.setTimeout(() => {
          setHidden(false);
          setIndex((current) => current + 1);
        }, 700);
      },
      1000 * Math.max(delaySeconds, 5),
    );
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(hideTimer);
    };
  }, [enabled, delaySeconds]);
  return { index, hidden };
};

/** Standings overlay: the field by car class, with side columns. */
export default function App() {
  const overlay = useRacingOverlay(topics, boardRenderHz);
  const { values, order } = overlay.settings;
  const general = readGeneral(values);
  const theme = readTheme(values);
  const lumina = theme === 'LUMINA';
  const opacity = general.opacity;

  const options: PositionOptions = {
    nameFormat: str(values, 'DriverNameFormat', '0'),
    teamNameFormat: str(values, 'TeamRacingNameFormat', '0'),
    iratingFormat: str(values, 'IratingFormat', 'NUMBERINK') as RIratingFormat,
    lapDeltaCount: num(values, 'LapDeltaCount', 3),
    physicalUnitsImperial: false,
  };
  const data = readPositionData(overlay, options);
  const widgetData = buildWidgetData(overlay);
  const groups: ClassGroup[] = useMemo(
    () =>
      standingsGroups(
        data,
        {
          multiClass: bool(values, 'EnableMultiClass', true),
          topDrivers: num(values, 'NumberOfTopDrivers', 3),
          linesAhead: num(values, 'NumberOfLineAhead', 3),
          linesBehind: num(values, 'NumberOfLineBehind', 3),
          minimumDrivers: num(values, 'MinimumDrivers', 10),
          driversInOtherClasses: num(values, 'NumberOfDriversInOtherClasses', 3),
        },
        widgetData.lapsTotal,
      ),
    [data, values, widgetData.lapsTotal],
  );

  const rowSettings = readRowSettings(
    values,
    order.MainColumnOrder,
    standingsColumnKeys,
    num(values, 'Width', 175),
  );
  // The main rows draw only the main columns; every other toggle belongs to the side columns.
  const mainSettings: RRowSettings = {
    ...rowSettings,
    ShowTireCompounds: false,
    ShowCurrentStint: false,
    ShowCompletedStint: false,
    ShowJokerLap: false,
    ShowPushToPass: false,
    ShowFastestLapTime: false,
    ShowLastLapTime: false,
    ShowLast5LapTimeAvg: false,
    ShowLast10LapTimeAvg: false,
    ShowLapNumber: false,
    ShowLapDelta: false,
    ShowDriverOfftracks: false,
    ShowVirtualEnergy: false,
    ShowTimeDistance: false,
    ShowPhysicalDistance: false,
    ShowDriverGear: false,
    ShowPosition: true,
  };
  // The side columns read the same toggles plus a few of their own.
  const sideOrder = sideColumnKeys.map((key) => {
    const at = order.SideColumnOrder?.indexOf(key) ?? -1;
    return at < 0
      ? order.SideColumnOrder === undefined
        ? sideColumnKeys.indexOf(key) + 1
        : 0
      : at + 1;
  });
  const side: SideSettings = {
    ShowPositionsChanged: bool(values, 'ShowPositionsChanged', false),
    ShowIntervalDistance: bool(values, 'ShowIntervalDistance', false),
    ShowGap: bool(values, 'ShowGap', true),
    ShowRelativeTimeDistance: bool(values, 'ShowRelativeTimeDistance', false),
    EnableSlidingSideMenu: bool(values, 'EnableSlidingSideMenu', false),
    HideSideColumnHeader: bool(values, 'HideSideColumnHeader', false),
    EnableMultiClass: bool(values, 'EnableMultiClass', true),
    sideOrder,
    showCarClassNameLabels: bool(values, 'ShowCarClassNameLabels', false),
    showCarClassSof: bool(values, 'ShowCarClassSof', false),
    showCarClassNumOfDrivers: bool(values, 'ShowCarClassNumOfDrivers', false),
    showCarClassLapCounters: bool(values, 'ShowCarClassLapCounters', false),
  };
  const sliding = useSlidingColumn(
    side.EnableSlidingSideMenu,
    num(values, 'SlidingMenuDelayInSecond', 20),
  );
  const isRace = data.sessionType === 'race';
  const sessionLetter =
    (sessionLetters as Readonly<Record<string, 'R' | 'Q' | 'P'>>)[data.sessionType] ?? 'T';
  const topWidgetFirst = barWidgets(values, 'Top')[0] !== 'None';
  const showFlags = bool(values, 'ShowDriverFlag', false);
  const flagSide = str(values, 'DriverFlagSide', 'right');
  const flagsLeft = side.EnableSlidingSideMenu ? showFlags : showFlags && flagSide === 'left';
  const flagsRight =
    !side.EnableSlidingSideMenu && showFlags && (flagSide === 'right' || flagSide === '');
  const density = rowSettings.Density;

  const filterFlag = (flag: RDriverFlag | null): RDriverFlag | null => {
    if (flag === null) return null;
    if (flag === 'fastest') return bool(values, 'DriverFlagExcludeFastestLap', false) ? null : flag;
    if (flag === 'pitting') return bool(values, 'DriverFlagExcludePitting', false) ? null : flag;
    if (flag === 'checkered')
      return bool(values, 'DriverFlagExcludeCheckered', false) ? null : flag;
    return bool(values, 'DriverFlagExcludePenalties', false) ? null : flag;
  };

  const flagsColumn = (
    <>
      {groups
        .filter((group) => side.EnableMultiClass || group.isReferenceClass)
        .flatMap((group, groupIndex, all) =>
          group.rows.map((row, index) => (
            <RowShell
              key={`${String(group.classId)}-${String(row.position.driverIdx)}`}
              theme={theme}
              density={density}
              isReference={false}
              posIndex={index + 1}
              lastIndex={groupIndex === all.length - 1 ? group.rows.length : -1}
              opacity={0}
              backgroundMode="none"
              inactive={row.position.driverIsNotPresent}
              settings={rowSettings}
              highlight="ROW_END"
              isLapped={false}
              isLapping={false}
              rowIsEmpty={false}
              withRightPadding={false}
            >
              <DriverFlagBadge
                value={filterFlag(row.position.driverFlag)}
                size={lumina ? '21' : '19'}
              />
            </RowShell>
          )),
        )}
    </>
  );

  const topBar = (
    <StandingsTopBar
      values={values}
      data={widgetData}
      theme={theme}
      density={density}
      sessionLetter={sessionLetter}
      showSessionLabel={bool(values, 'ShowSessionLabel', true)}
      showOverallDriversCount={bool(values, 'ShowOverallDriversCount', false)}
      hideSideColumnHeader={side.HideSideColumnHeader}
      totalDrivers={groups.reduce((sum, group) => sum + group.numberOfDrivers, 0)}
    />
  );
  const bottomBar = (
    <StandingsBottomBar values={values} data={widgetData} theme={theme} density={density} />
  );
  const columns = (
    <SideColumns
      groups={groups}
      settings={rowSettings}
      side={side}
      theme={theme}
      density={density}
      sideOpacity={opacity}
      showPositionsChanged={isRace}
      showLapDelta
      showColumnOnIndex={sliding.index}
    />
  );

  if (groups.length === 0) return null;
  return (
    <RContainer
      general={general}
      title="Standings Overlay"
      disableBackgroundColor
      className="StandingsOverlay"
      darkMode={bool(values, 'DarkMode', false)}
    >
      {flagsLeft && (
        <StandingsContainer theme={theme} opacity={0} cutRight>
          {flagsColumn}
        </StandingsContainer>
      )}
      <StandingsContainer
        theme={theme}
        opacity={opacity}
        paddingTop={topWidgetFirst ? undefined : lumina ? '3' : '4'}
      >
        {topBar}
        <StandingsMainRows
          groups={groups}
          settings={mainSettings}
          theme={theme}
          multiClass={side.EnableMultiClass}
          header={{
            showClassName: side.showCarClassNameLabels,
            showSof: side.showCarClassSof,
            showNumberOfDrivers: side.showCarClassNumOfDrivers,
            showLapCounters: side.showCarClassLapCounters,
          }}
        />
        {bottomBar}
      </StandingsContainer>
      <div className="StandingsSideContainer">
        {side.EnableSlidingSideMenu ? (
          <div className="StandingsSlidingMenu">
            <div className={cx('slidingPart', { hideColumn: sliding.hidden })}>
              <StandingsContainer
                theme={theme}
                opacity={Math.max(0, num(values, 'SideBarOpacity', 0.5))}
                direction="col"
                cutLeft
              >
                {columns}
              </StandingsContainer>
            </div>
          </div>
        ) : (
          <StandingsContainer
            theme={theme}
            opacity={Math.max(0, num(values, 'SideBarOpacity', 0.5))}
            direction="col"
            cutLeft
          >
            {columns}
          </StandingsContainer>
        )}
        <div className="StandingsWidgetSpacer">{bottomBar}</div>
      </div>
      {flagsRight && (
        <StandingsContainer theme={theme} opacity={0} cutLeft>
          {flagsColumn}
        </StandingsContainer>
      )}
    </RContainer>
  );
}
