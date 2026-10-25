import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { DriverFlagBadge } from '../r-common/driver/driver';
import { cx } from '../r-common/driver/cx';
import { lapColumnDigits } from '../r-common/driver/helpers';
import { hexToRgba } from '../r-common/driver/format';
import { readPositionData, type PositionOptions } from '../r-common/driver/positions';
import { DriverRow } from '../r-common/driver/rows';
import { readRowSettings, readTheme, relativeColumnKeys } from '../r-common/driver/rowSettings';
import type { RDriverFlag, RIratingFormat, RPosition } from '../r-common/driver/model';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { buildWidgetData } from '../r-common/widgets/data';
import { barHasWidgets } from '../r-common/widgets/bars';
import { WidgetBar } from '../r-common/widgets/WidgetBar';
import { FlagFrame, type FlagFramePosition } from './FlagFrame';
import { relativeRows } from './relativeRows';
import { RelativeTrackMap } from './RelativeTrackMap';

/** The board renders this often at most; more renders only cost CPU. */
const boardRenderHz = 15;

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

const flagSizes = { COMPACT: '19', COMFORTABLE: '24', COZY: '26' } as const;
const framePositions: readonly FlagFramePosition[] = ['TOP', 'BOTTOM', 'LEFT', 'RIGHT'];

/** Relative overlay: the cars around you, with gaps. */
export default function App() {
  const overlay = useRacingOverlay(topics, boardRenderHz);
  const { values, order } = overlay.settings;
  const general = readGeneral(values);
  const theme = readTheme(values);
  const opacity = general.opacity;
  const lumina = theme === 'LUMINA';
  const classic = !lumina;

  const options: PositionOptions = {
    nameFormat: str(values, 'DriverNameFormat', '0'),
    teamNameFormat: str(values, 'TeamRacingNameFormat', '3'),
    iratingFormat: str(values, 'IratingFormat', 'NUMBERINK') as RIratingFormat,
    lapDeltaCount: num(values, 'LapDeltaCount', 1),
    physicalUnitsImperial: false,
  };
  const data = readPositionData(overlay, options);
  const [capacity, setCapacity] = useState(7);
  const rowsBox = useRef<HTMLDivElement>(null);
  const others = capacity - 1;
  const rows = useMemo(
    () =>
      relativeRows(data, {
        linesAhead: Math.ceil(others / 2),
        linesBehind: Math.floor(others / 2),
        excludeCarsInPit: bool(values, 'ExcludeCarsInPit', false),
      }),
    [data, values, others],
  );
  const widgetData = buildWidgetData(overlay);
  const topEmpty = !barHasWidgets(values, 'Top');
  const bottomEmpty = !barHasWidgets(values, 'Bottom');
  const rowSettings = readRowSettings(values, order.ColumnOrder, relativeColumnKeys, 0);
  const columnDigits = lapColumnDigits(rows.map((row) => row.lapNumber));
  const backgroundMode = topEmpty && bottomEmpty ? 'normal' : 'light';
  const driverFlagSide = str(values, 'DriverFlagSide', 'left');
  const showFlags = bool(values, 'ShowDriverFlag', false);
  const flagsLeft = showFlags && driverFlagSide === 'left';
  const flagsRight = showFlags && driverFlagSide === 'right';
  const framePosition = str(values, 'FlagFramePosition', 'TOP');
  const density = rowSettings.Density;

  // The window decides how many rows fit: the row height and the space around
  // the rows are measured, so every theme, font size and density fills it.
  useLayoutEffect(() => {
    const box = rowsBox.current;
    if (box === null || rows.length === 0) return;
    const content = box.closest('.RelativeOverlay')?.querySelector(':scope > :not(.overlay_title)');
    if (content === null || content === undefined) return;
    const borders = box.offsetHeight - box.clientHeight;
    const rowHeight = (box.getBoundingClientRect().height - borders) / rows.length;
    if (rowHeight <= 0) return;
    const chrome = content.getBoundingClientRect().height - rowHeight * rows.length;
    const fit = Math.max(1, Math.floor((window.innerHeight - chrome) / rowHeight));
    setCapacity((current) => (current === fit ? current : fit));
  });

  const filterFlag = (flag: RDriverFlag | null): RDriverFlag | null => {
    if (flag === null) return null;
    if (flag === 'fastest') return bool(values, 'DriverFlagExcludeFastestLap', false) ? null : flag;
    if (flag === 'pitting') return bool(values, 'DriverFlagExcludePitting', false) ? null : flag;
    if (flag === 'checkered')
      return bool(values, 'DriverFlagExcludeCheckered', false) ? null : flag;
    return bool(values, 'DriverFlagExcludePenalties', false) ? null : flag;
  };

  const rowElements = (row: RPosition, index: number) => {
    const props = {
      position: row,
      settings: rowSettings,
      posIndex: index,
      lastIndex: rows.length - 1,
      columnDigits,
      backgroundMode,
      ColumnOrderKeys: relativeColumnKeys,
    } as const;
    if (classic) {
      return (
        <div key={row.driverIdx} className="positionsRowContainer">
          <DriverRow {...props} theme={theme} />
          {index !== rows.length - 1 && (
            <div
              className={cx('separator', {
                hideLineSeparator: !bool(values, 'LineSeparator', false),
              })}
              style={{ opacity }}
            />
          )}
        </div>
      );
    }
    return <DriverRow key={row.driverIdx} {...props} theme={theme} />;
  };

  const background = lumina
    ? { backgroundColor: hexToRgba('#0A0A0B', opacity) }
    : { backgroundColor: hexToRgba('#000000', opacity), overflow: 'hidden' as const };

  return (
    <RContainer
      general={general}
      title="Relative Overlay"
      disableBackgroundColor
      className={cx('RelativeOverlay', {
        hideEmptyOverlay: rows.length === 0,
        FlagFrameEnabled: bool(values, 'ShowFlagFrame', false),
        FlagFrameDisabled: !bool(values, 'ShowFlagFrame', false),
        themeClassic: classic,
        themeModern: lumina,
        showDriverFlagLeft: flagsLeft,
        showDriverFlagRight: flagsRight,
        topAndBottomEmpty: topEmpty && bottomEmpty,
      })}
      style={{
        ['--relativeOverlayShadow' as string]: hexToRgba('#000000', Math.min(1, 5 * opacity)),
        ['--bgOpacity' as string]: String(opacity),
      }}
      darkMode={bool(values, 'DarkMode', false)}
    >
      <FlagFrame
        isEnabled={bool(values, 'ShowFlagFrame', false)}
        position={framePositions.find((position) => position === framePosition) ?? 'TOP'}
        flag={overlay.telemetry.session.flagDetail}
        rounded={lumina}
      >
        <div className="positionsContainer" style={background}>
          {bool(values, 'ShowTrackMap', false) && (
            <div className="trackMapCont">
              <RelativeTrackMap
                drivers={data.competitors}
                referenceCarIdx={data.reference?.carIdx}
              />
            </div>
          )}
          {!topEmpty && (
            <WidgetBar
              bar="Top"
              values={values}
              data={widgetData}
              className={cx('topInfoBar', {
                densityCompact: density === 'COMPACT',
                densityComfortable: density === 'COMFORTABLE',
                densityCosy: density === 'COZY',
              })}
            />
          )}
          {classic ? (
            <div ref={rowsBox}>{rows.map(rowElements)}</div>
          ) : (
            <div className="positionsRealContainerCont">
              <div ref={rowsBox} className="positionsRealContainer">
                {rows.map(rowElements)}
              </div>
              {(flagsLeft || flagsRight) && (
                <div className={cx('positionsRealContainerFlags', { flagsLeft, flagsRight })}>
                  {rows.map((row) => (
                    <div
                      key={row.driverIdx}
                      className={cx('driverFlagCol', {
                        densityCompact: density === 'COMPACT',
                        densityComfortable: density === 'COMFORTABLE',
                        densityCosy: density === 'COZY',
                      })}
                    >
                      <DriverFlagBadge
                        value={filterFlag(row.driverFlag)}
                        size={flagSizes[density]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!bottomEmpty && (
            <WidgetBar
              bar="Bottom"
              values={values}
              data={widgetData}
              className={cx('bottomInfoBar', {
                densityCompact: density === 'COMPACT',
                densityComfortable: density === 'COMFORTABLE',
                densityCosy: density === 'COZY',
              })}
            />
          )}
        </div>
      </FlagFrame>
    </RContainer>
  );
}
