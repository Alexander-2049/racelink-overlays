import { memo, type CSSProperties } from 'react';
import { TabularNumber } from '../r-common/driver/badges';
import { cx } from '../r-common/driver/cx';
import { adjustColorShade, hexToRgba } from '../r-common/driver/format';
import type { RDensity, RTheme } from '../r-common/driver/model';
import { BigHelmet, SmallHelmet } from './icons';

export type ClassHeaderProps = Readonly<{
  numberOfDrivers: number;
  shortName: string;
  sof: number | null;
  color: string;
  currentLap: number | null;
  estimatedTotalLaps: number | null;
  estimatedTotalLapsCalculated: boolean;
  showClassName: boolean;
  showSof: boolean;
  showNumberOfDrivers: boolean;
  showLapCounters: boolean;
  theme: RTheme;
  density: RDensity;
  invisible?: boolean;
  width0?: boolean;
  height0?: boolean;
  sidePanelMode?: boolean;
}>;

/** The strip above each car class: its name, drivers, SOF and lap counter. */
export const ClassHeader = memo(function ClassHeader(props: ClassHeaderProps) {
  const { showClassName, showSof, showNumberOfDrivers, showLapCounters } = props;
  if (!(showClassName || showSof || showNumberOfDrivers || showLapCounters)) return null;
  const hasLap = (props.currentLap ?? -1) > 0;
  const hasTotal = props.estimatedTotalLaps !== null && props.estimatedTotalLaps > 0;
  const color = props.color.toLowerCase() === '#ffffff' ? '#4F4F4F' : props.color;
  const background = showNumberOfDrivers ? color : `${color}00`;
  const intensity = props.color.toLowerCase() === '#ffffff' ? 1 : 0.7;
  const lap = (
    <span className="carClassLapCounter">
      <TabularNumber>
        {hasLap ? props.currentLap : '-'}/{hasTotal && props.estimatedTotalLapsCalculated && '~'}
        {hasTotal ? props.estimatedTotalLaps : '-'}
      </TabularNumber>
    </span>
  );
  if (props.theme === 'LUMINA') {
    const style = {
      '--carClassColor': props.color,
      '--carClassColorDarker': '#00000050',
      '--lightBgColor': color,
      '--bgColorWithOpacity': background,
      '--opacityIntensity': intensity,
      '--lightCarClassColor': hexToRgba(color, 0.5),
      '--darkCarClassColor': adjustColorShade(color, -180),
    } as CSSProperties;
    const left = showNumberOfDrivers || showClassName;
    return (
      <div
        className={cx('carClassDetails themeLumina', {
          invisible: props.invisible,
          width0: props.width0,
          densityCompact: props.density === 'COMPACT',
          densityComfortable: props.density === 'COMFORTABLE',
          densityCosy: props.density === 'COZY',
          sidePanelMode: props.sidePanelMode,
          height0: props.height0,
        })}
        style={style}
      >
        {left && (
          <div className="leftCarClassHeader">
            {showNumberOfDrivers && (
              <div className="carClassNumOfDriversContainer">
                <SmallHelmet /> <TabularNumber>{props.numberOfDrivers}</TabularNumber>
              </div>
            )}
            {showClassName && <span className="carClassName">{props.shortName}</span>}
          </div>
        )}
        {showSof && (
          <span className="carClassSof">
            <TabularNumber>
              SOF <span className="sofnum">{props.sof ?? '-'}</span>
            </TabularNumber>
          </span>
        )}
        {showLapCounters && lap}
      </div>
    );
  }
  const style = {
    '--carClassColor': props.color,
    '--lightBgColor': color,
    '--bgColorWithOpacity': background,
    '--opacityIntensity': intensity,
  } as CSSProperties;
  return (
    <div className="columnItemSpacer cis_md">
      <div
        className={cx('carClassDetails themeClassic', {
          invisible: props.invisible,
          width0: props.width0,
          height0: props.height0,
        })}
        style={style}
      >
        {showClassName && <span className="carClassName">{props.shortName}</span>}
        {showSof && (
          <span className="carClassSof">
            <span>SOF {props.sof ?? '-'}</span>
          </span>
        )}
        <div className="carClassDetailsSpacer" />
        {showLapCounters && lap}
        {showNumberOfDrivers && (
          <div className="carClassNumOfDriversContainer">
            <div className="carClassNumOfDrivers">
              <div className="carClassNumOfDriversLabel">
                {props.numberOfDrivers} <BigHelmet />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
