import { cx } from '../r-common/driver/cx';
import type { RDensity, RTheme } from '../r-common/driver/model';
import type { OverlaySettingsView } from '../model/useRacingOverlay';
import type { WidgetData } from '../r-common/widgets/data';
import { barHasWidgets, barWidgets } from '../r-common/widgets/bars';
import { WidgetSlot } from '../r-common/widgets/WidgetBar';
import {
  PracticeLetterIcon,
  QualifyLetterIcon,
  RaceLetterIcon,
  SmallHelmet,
  TestLetterIcon,
} from './icons';

type Values = OverlaySettingsView['values'];

type BarProps = Readonly<{
  values: Values;
  data: WidgetData;
  theme: RTheme;
  density: RDensity;
  sessionLetter: 'R' | 'Q' | 'P' | 'T';
  showSessionLabel: boolean;
  showOverallDriversCount: boolean;
  hideSideColumnHeader: boolean;
  totalDrivers: number;
}>;

const barClasses = (name: string, theme: RTheme, density: RDensity): string =>
  cx(name, {
    themeClassic: theme === 'CLASSIC',
    themeModern: theme === 'LUMINA',
    densityCompact: density === 'COMPACT',
    densityComfortable: density === 'COMFORTABLE',
    densityCosy: density === 'COZY',
  });

const topBarHasContent = (values: Values, showOverallDriversCount: boolean): boolean =>
  barHasWidgets(values, 'Top') || showOverallDriversCount;

const letterIcon = (letter: BarProps['sessionLetter']) => {
  switch (letter) {
    case 'R':
      return <RaceLetterIcon />;
    case 'Q':
      return <QualifyLetterIcon />;
    case 'P':
      return <PracticeLetterIcon />;
    case 'T':
      return <TestLetterIcon />;
  }
};

/** The strip above the standings: session label, widgets and the driver count. */
export function StandingsTopBar(props: BarProps) {
  const { values, data, theme, density } = props;
  const classic = theme === 'CLASSIC';
  const ids = barWidgets(values, 'Top');
  const hasContent = topBarHasContent(values, props.showOverallDriversCount);
  if (!hasContent) {
    return props.hideSideColumnHeader ? null : (
      <div className={barClasses('topStandingsInfoBar', theme, density)} />
    );
  }
  return (
    <div className={barClasses('topStandingsInfoBar', theme, density)}>
      {ids[0] !== 'None' && (
        <div className="standingTopFirstWidgetCont">
          {props.showSessionLabel && (
            <>
              <div className="raceInfoType">
                {classic ? <span>{props.sessionLetter}</span> : letterIcon(props.sessionLetter)}
              </div>
              {classic && <div className="separator" />}
            </>
          )}
          <WidgetSlot bar="Top" index={0} values={values} data={data} />
        </div>
      )}
      {ids[1] !== 'None' && <WidgetSlot bar="Top" index={1} values={values} data={data} />}
      {ids[2] !== 'None' && <WidgetSlot bar="Top" index={2} values={values} data={data} />}
      {props.showOverallDriversCount && (
        <div className="numberOfDrivers">
          <SmallHelmet />
          <span className="TabularNumber">{props.totalDrivers}</span>
        </div>
      )}
    </div>
  );
}

/** The strip below the standings: up to three widgets. */
export function StandingsBottomBar({
  values,
  data,
  theme,
  density,
}: Pick<BarProps, 'values' | 'data' | 'theme' | 'density'>) {
  if (!barHasWidgets(values, 'Bottom')) return null;
  return (
    <div className={barClasses('bottomStandingsInfoBar', theme, density)}>
      {[0, 1, 2].map((index) => (
        <WidgetSlot key={index} bar="Bottom" index={index} values={values} data={data} />
      ))}
    </div>
  );
}
