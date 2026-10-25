import { memo, type CSSProperties } from 'react';
import type { PublishedDriverTag } from '../../../../../shared/contracts/driverTags';
import { DriverTagIcon } from '../../../../entities/driver-tag';
import { cx } from './cx';
import { convertSecToReadable, adjustColorShade } from './format';
import {
  AnimatedSoundWave,
  BlackAndWhiteFlagIcon,
  BlackFlagIcon,
  CheckeredFlagIcon,
  FastestFlagIcon,
  PittingFlagIcon,
  RepairFlagIcon,
  SlowdownFlagIcon,
} from './icons';
import type { RDriverFlag, RLicence, RPitEntry, RTagSize } from './model';

type DriverFlagProps = Readonly<{
  value: RDriverFlag | null;
  size?: '19' | '21' | '24' | '26';
  showBorder?: boolean;
  showRounded?: boolean;
}>;

const flagIcon = (flag: RDriverFlag) => {
  switch (flag) {
    case 'black':
      return <BlackFlagIcon />;
    case 'blackAndWhite':
      return <BlackAndWhiteFlagIcon />;
    case 'repair':
      return <RepairFlagIcon />;
    case 'slowdown':
      return <SlowdownFlagIcon />;
    case 'fastest':
      return <FastestFlagIcon />;
    case 'pitting':
      return <PittingFlagIcon />;
    case 'checkered':
      return <CheckeredFlagIcon />;
  }
};

/** The icon of a flag a driver is shown (checkered, pitting, fastest lap…). */
export const DriverFlagBadge = memo(function DriverFlagBadge({
  value,
  size,
  showBorder,
  showRounded,
}: DriverFlagProps) {
  if (value === null) return <div className="overlayBadge DriverFlag" />;
  return (
    <div
      className={cx('overlayBadge DriverFlag', {
        size_19: size === '19',
        size_21: size === '21',
        size_24: size === '24',
        size_26: size === '26',
        showBorder,
        showRounded,
      })}
    >
      {flagIcon(value)}
    </div>
  );
});

type TagsProps = Readonly<{
  tags: readonly PublishedDriverTag[];
  inactive: boolean;
  size: RTagSize;
}>;

/** The user's tags of a driver, drawn with Racelink's own tag icons. */
export const DriverTags = memo(function DriverTags({ tags, inactive, size }: TagsProps) {
  return (
    <div
      className={cx('overlayBadge DriverTags', {
        inactive,
        'tagSize-medium': size === 'MEDIUM',
        'tagSize-large': size === 'LARGE',
      })}
    >
      {tags.map((tag) => (
        <div key={tag.key} className="DriverTag">
          <DriverTagIcon tag={tag} size={size === 'LARGE' ? 22 : size === 'MEDIUM' ? 18 : 15} />
        </div>
      ))}
    </div>
  );
});

type PitBadgeProps = Readonly<{
  pitEntry: RPitEntry | null;
  showPitLap: boolean;
  showPitTime: boolean;
  showIsOutLap: boolean;
  size?: string;
}>;

const pitTimeText = (seconds: number): string => {
  if (seconds >= 999) return '∞';
  if (seconds >= 10)
    return seconds >= 60 ? convertSecToReadable(String(seconds)) : `${seconds.toFixed(0)}s`;
  return `${seconds.toFixed(1)}s`;
};

export const PittedLapAndTime = memo(function PittedLapAndTime({
  pitEntry,
  showPitLap,
  showPitTime,
  showIsOutLap,
  size,
}: PitBadgeProps) {
  const pit =
    pitEntry?.currentPit ??
    (pitEntry?.pits && pitEntry.pits.length > 0 ? pitEntry.pits[pitEntry.pits.length - 1] : null) ??
    null;
  const spent = pit?.timeSpentInSeconds ?? null;
  const time = spent === null ? undefined : pitTimeText(spent);
  const hasPit = (showPitLap || showPitTime) && pit !== null && pit.lapNumber !== 0;
  if (!hasPit && !showIsOutLap && !showPitLap) return null;
  return (
    <div
      className={cx('overlayBadge pittedLapAndTime', {
        variationNormal: size === '19',
        variationSmall: size === undefined || size === '16',
      })}
    >
      {showIsOutLap && (
        <div className="badgeContainer pitInfoContainer">
          <div className="outLap">
            <span>OUT</span>
          </div>
        </div>
      )}
      {hasPit && (
        <div
          className={cx('badgeContainer pitInfoContainer', {
            inprogress: pit.status === 'InPit',
            noPitLap: !showPitLap,
          })}
        >
          {showPitLap && (
            <div className="pitLap">
              <span>L{pit.lapNumber}</span>
            </div>
          )}
          {showPitTime && (
            <div className="pitTime">
              <span>{spent !== null && spent !== 0 ? time : '-'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

type DriverNameProps = Readonly<{
  driverName: string;
  secondaryDriverName?: string;
  driverNote?: string | null;
  driverNoteColor: string;
  driverNameWidth: number;
  carOnPitRoad: boolean;
  carIsLapped: boolean;
  carIsLapping: boolean;
  carIsReference: boolean;
  isRadioOn: boolean;
  isOutLap: boolean;
  inactive?: boolean;
  upperCaseAll: boolean;
  nameSizing: 'nameNormal' | 'nameLarge';
  legacy?: boolean;
  driverTagsEnabled: boolean;
  driverTags: readonly PublishedDriverTag[];
  driverTagSize: RTagSize;
  driverFlag: RDriverFlag | null;
  driverFlagEnabled: boolean;
  pitEntry: RPitEntry | null;
  showPitLap: boolean;
  showPitTime: boolean;
  showOutLap: boolean;
  pitBadgeSizing?: string;
}>;

export const DriverName = memo(function DriverName(props: DriverNameProps) {
  const pits = props.pitEntry;
  const hasPitData =
    (pits?.currentPit?.lapNumber ?? 0) > 0 ||
    (pits?.pits?.filter((pit) => (pit.isValid ?? true) && (pit.timeSpentInSeconds ?? 0) > 0)
      .length ?? 0) > 0;
  const inactive = props.inactive === true;
  const showPitLap = props.showPitLap && hasPitData;
  const showPitTime = !inactive && props.showPitTime && hasPitData;
  const showOutLap = !inactive && props.isOutLap && props.showOutLap;
  const showTags = props.driverTagsEnabled && props.driverTags.length > 0;
  const showFlag = props.driverFlagEnabled && props.driverFlag !== null;
  const endComponent = showOutLap || showPitLap || showPitTime || showTags || showFlag;
  const normal = props.nameSizing === 'nameNormal';
  const large = props.nameSizing === 'nameLarge';
  const style = {
    width: props.driverNameWidth > 0 ? `${String(props.driverNameWidth)}px` : 'auto',
    '--builtinTagCount': props.driverTags.length,
    '--customTagCount': 0,
    '--builtinTagItemSize': large ? '1.5em' : '1.2em',
    '--customTagItemSize': '1.2em',
    '--driverNoteColor': props.driverNoteColor,
  } as CSSProperties;
  return (
    <div
      style={style}
      className={cx('overlayBadge driverName', {
        carOnPitRoad: props.carOnPitRoad,
        carIsLapped: props.carIsLapped,
        carIsLapping: props.carIsLapping,
        carIsReference: props.carIsReference,
        inactive,
        upperCaseAll: props.upperCaseAll,
        radioIsOn: props.isRadioOn,
        endComponentVisible: endComponent,
        nameNormal: normal,
        nameLarge: large,
        legacy: props.legacy,
        hasSecondaryDriver:
          props.secondaryDriverName !== undefined || (props.driverNote ?? '') !== '',
      })}
    >
      {props.isRadioOn && <AnimatedSoundWave className="soundWaveIcon" />}
      <span
        className={cx('driverNameText', {
          showPitLap,
          showPitTime,
          showOutLap: !inactive && showOutLap,
          driverTagsVisible: showTags,
          driverFlagsVisible: showFlag,
        })}
      >
        {props.driverName}
      </span>
      {props.secondaryDriverName !== undefined && props.secondaryDriverName !== '' && (
        <span className="secondaryDriverText">
          {props.secondaryDriverName}
          {props.driverNote !== null &&
            props.driverNote !== undefined &&
            props.driverNote !== '' && (
              <span className="driverNoteText"> · {props.driverNote}</span>
            )}
        </span>
      )}
      {(props.secondaryDriverName === undefined || props.secondaryDriverName === '') &&
        props.driverNote !== null &&
        props.driverNote !== undefined &&
        props.driverNote !== '' && <span className="driverNoteText">{props.driverNote}</span>}
      {endComponent && (
        <div className="endComponent">
          {showFlag && (
            <DriverFlagBadge
              value={props.driverFlag}
              size="19"
              showBorder={!normal && !large}
              showRounded
            />
          )}
          {showTags && (
            <DriverTags tags={props.driverTags} inactive={inactive} size={props.driverTagSize} />
          )}
          {(showOutLap || showPitLap || showPitTime) && (
            <PittedLapAndTime
              showIsOutLap={showOutLap}
              showPitLap={showPitLap}
              showPitTime={showPitTime}
              pitEntry={props.pitEntry}
              size={props.pitBadgeSizing ?? (large ? '19' : '16')}
            />
          )}
        </div>
      )}
    </div>
  );
});

type LicenceProps = Readonly<{
  showLicence: boolean;
  showSafetyRating: boolean;
  driverLicence: RLicence | null;
  inactive: boolean;
  size?: string;
}>;

export const DriverLicence = memo(function DriverLicence(props: LicenceProps) {
  const licence = props.driverLicence;
  if ((!props.showSafetyRating && !props.showLicence) || licence === null) return null;
  const rating = Number(licence.safetyRank);
  const showRating = props.showSafetyRating && String(licence.safetyRank) !== '' && rating >= 0;
  const style = {
    '--textColor': licence.color,
    '--lighterBgColor': licence.darkBgColor,
    '--darkModeTextColor': adjustColorShade(licence.bgColor, 35),
    '--bgColor': licence.bgColor,
  } as CSSProperties;
  return (
    <div
      className={cx('SafetyRating', {
        noSafetyRating: !showRating,
        noSafetyLicense: !props.showLicence,
        bigLicense: false,
        safetyRating3Digit: licence.threeDigitRating === true,
        inactive: props.inactive,
        variationNormal: props.size === '19',
        variationSmall: props.size === undefined || props.size === '17',
      })}
      style={style}
    >
      {showRating && (
        <div className="safetyNum">
          <span>{licence.safetyRank}</span>
        </div>
      )}
      {props.showLicence && (
        <div className="safetyLabel">
          <span>{licence.name}</span>
        </div>
      )}
    </div>
  );
});

type IratingProps = Readonly<{
  showIrating: boolean;
  showIratingGain: boolean;
  showIratingDelta: boolean;
  irating: number | string;
  iratingDelta: number | null;
  inactive: boolean;
  showIratingRawNumber: boolean;
  showIratingInKNoDec: boolean;
  size?: string;
}>;

export const IratingBadge = memo(function IratingBadge(props: IratingProps) {
  const gainShown = props.showIratingGain && props.showIratingDelta;
  if (!props.showIrating && !gainShown) return null;
  const delta = props.iratingDelta ?? 0;
  const gain = gainShown && delta >= 0;
  const lose = gainShown && delta < 0;
  return (
    <div
      className={cx('overlayBadge iratingBadge', {
        showIrating: props.showIrating,
        showIratingRaw: props.showIratingRawNumber,
        showIratingInKNoDec: props.showIratingInKNoDec,
        showIratingGain: gainShown,
        gain,
        lose,
        inactive: props.inactive,
        variationNormal: props.size === '19',
        variationSmall: props.size === undefined || props.size === '16',
      })}
    >
      {props.showIrating && (
        <span className={cx('irating simpleNumber', { showIratingGain: gainShown })}>
          {props.irating}
        </span>
      )}
      {gain && <i className="fa fa-angle-up gain" />}
      {lose && <i className="fa fa-angle-down lose" />}
      {gainShown && <span className="iratingDelta simpleNumber">{Math.abs(delta) || '-'}</span>}
    </div>
  );
});
