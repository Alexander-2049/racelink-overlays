import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import { TabularNumber } from './badges';
import { cx } from './cx';
import { convertSecToReadable, lapTimePlaceholder, toFixedDown, toMMSSMS } from './format';
import type { RLapTime } from './model';

const defaultHighlightOpacity = 0.5;

type LapTimeProps = Readonly<{
  lapTime: number | null;
  isGreen?: boolean;
  isPurple?: boolean;
  isRed?: boolean;
  inactive?: boolean;
  carIsReference?: boolean;
  driverIdx: number;
  highlightedBackgroundOpacity?: number;
  decimals?: number | null;
  dropMinute?: boolean;
  align?: 'center' | 'left';
  sizeByContent?: boolean;
  legacy?: boolean;
  disableTextShadow?: boolean;
}>;

/** One lap time cell; it flashes when the time changes for the same driver. */
export const LapTimeElement = memo(function LapTimeElement(props: LapTimeProps) {
  const decimals = props.decimals ?? 3;
  const hasTime = props.lapTime !== null && props.lapTime > 0;
  const text =
    hasTime && props.lapTime !== null
      ? toMMSSMS(props.lapTime, decimals, props.dropMinute === true)
      : null;
  const [flash, setFlash] = useState(true);
  const previous = useRef({ lapTime: props.lapTime, driverIdx: props.driverIdx });
  useEffect(() => {
    const before = previous.current;
    previous.current = { lapTime: props.lapTime, driverIdx: props.driverIdx };
    setFlash(
      before.lapTime !== null &&
        before.lapTime !== props.lapTime &&
        before.driverIdx === props.driverIdx,
    );
  }, [props.lapTime, props.driverIdx]);
  const style = {
    '--highlightedBackgroundOpacity': props.highlightedBackgroundOpacity ?? defaultHighlightOpacity,
    '--decimals': decimals,
  } as CSSProperties;
  return (
    <div
      className={cx('overlayBadge LapTimeElement', {
        carIsReference: props.carIsReference,
        isLapTimeGreen: props.isGreen,
        isLapTimePurple: props.isPurple,
        isLapTimeRed: props.isRed,
        inactive: props.inactive,
        noValue: !hasTime,
        allowAnim: flash,
        disableAnim: !flash,
        dropMinute: props.dropMinute,
        alignCenter: props.align === undefined || props.align === 'center',
        alignLeft: props.align === 'left',
        legacy: props.legacy,
        autoWidthSize: props.sizeByContent,
        noTextShadow: props.disableTextShadow,
      })}
      style={style}
    >
      <span className="simpleNumber">
        {text ?? lapTimePlaceholder(decimals, props.dropMinute === true)}
      </span>
    </div>
  );
});

type LapCellProps = Readonly<{
  visible: boolean;
  value: RLapTime | null;
  carIsReference: boolean;
  inactive: boolean;
  driverIdx: number;
  highlightedBackgroundOpacity?: number;
  decimals?: number;
  dropMinute?: boolean;
  align?: 'center' | 'left';
  sizeByContent?: boolean;
  legacy?: boolean;
}>;

/** The fastest lap of a driver; purple when it is the fastest of the session. */
export const FastestLapTime = memo(function FastestLapTime(props: LapCellProps) {
  if (!props.visible) return null;
  return (
    <LapTimeElement
      carIsReference={props.carIsReference}
      isGreen={false}
      isPurple={props.value?.isFastestInSession ?? false}
      lapTime={props.value?.lapTime ?? null}
      driverIdx={props.driverIdx}
      inactive={props.inactive}
      highlightedBackgroundOpacity={props.highlightedBackgroundOpacity}
      decimals={props.decimals}
      dropMinute={props.dropMinute}
      align={props.align}
      sizeByContent={props.sizeByContent}
      legacy={props.legacy}
    />
  );
});

/** The last lap of a driver; green for a personal best, purple for the session best. */
export const LastLapTime = memo(function LastLapTime(props: LapCellProps) {
  if (!props.visible) return null;
  const expired = props.value?.isExpired === true;
  return (
    <LapTimeElement
      carIsReference={props.carIsReference}
      isGreen={props.value?.isPersonalBest ?? false}
      isPurple={props.value?.isSessionBest ?? false}
      lapTime={expired ? null : (props.value?.lapTime ?? null)}
      inactive={props.inactive}
      driverIdx={props.driverIdx}
      highlightedBackgroundOpacity={props.highlightedBackgroundOpacity}
      decimals={props.decimals}
      dropMinute={props.dropMinute}
      align={props.align}
      sizeByContent={props.sizeByContent}
      legacy={props.legacy}
    />
  );
});

/** An average of the last laps. */
export const AverageLapTime = memo(function AverageLapTime(props: LapCellProps) {
  if (!props.visible) return null;
  return (
    <LapTimeElement
      isGreen={props.value?.isFaster === true}
      isPurple={false}
      isRed={props.value?.isSlower === true}
      lapTime={props.value?.lapTime ?? null}
      carIsReference={props.carIsReference}
      driverIdx={props.driverIdx}
      inactive={props.inactive}
      highlightedBackgroundOpacity={props.highlightedBackgroundOpacity}
      decimals={props.decimals}
      dropMinute={props.dropMinute}
      align={props.align}
      sizeByContent={props.sizeByContent}
      legacy={props.legacy}
    />
  );
});

type DeltaProps = Readonly<{
  visible: boolean;
  value: readonly (number | null)[];
  count?: number;
  decimals?: number;
  carIsReference?: boolean;
  highlightedBackgroundOpacity?: number;
  showPrefix?: boolean;
  legacy?: boolean;
}>;

const deltaPlaceholder = (decimals: number): string => `-.${'-'.repeat(Math.max(1, decimals))}`;

/** The deltas of the last laps to the leader's, newest last. */
export const DeltaLapTime = memo(function DeltaLapTime(props: DeltaProps) {
  const decimals = props.decimals ?? 1;
  const referenceCar = props.carIsReference === true;
  const hasValue = props.value.some((entry) => entry !== null) || referenceCar;
  const count = Math.max(props.count ?? props.value.length, 0);
  if (!props.visible) return null;
  const placeholder = deltaPlaceholder(decimals);
  const cells = Array.from({ length: count }, (_, index) => {
    const entry = index < props.value.length ? (props.value[index] ?? null) : null;
    let text: string | null = null;
    let gain = false;
    let lose = false;
    let magnitude: number | null = null;
    if (entry !== null) magnitude = Math.abs(entry);
    if (referenceCar) magnitude = 0;
    if (magnitude !== null) {
      text =
        magnitude >= 10
          ? String(Number(magnitude.toFixed(decimals - 1)))
          : toFixedDown(magnitude, decimals);
      gain = entry !== null && entry > 0;
      lose = entry !== null && entry < 0;
    }
    const prefix = props.showPrefix === true && text !== null;
    return (
      <div
        key={`${text ?? 'empty'}-${String(index)}`}
        className={cx('aDeltaEntry', { gain, lose })}
      >
        {prefix && lose && '+'}
        {prefix && gain && '-'}
        {text ?? placeholder}
      </div>
    );
  });
  const style = {
    '--highlightedBackgroundOpacity': props.highlightedBackgroundOpacity ?? defaultHighlightOpacity,
    '--decimals': decimals,
  } as CSSProperties;
  return (
    <div
      className={cx('overlayBadge deltaLapTime', { noValue: !hasValue, legacy: props.legacy })}
      style={style}
    >
      {cells}
    </div>
  );
});

type TimeDistanceProps = Readonly<{
  visible: boolean;
  value: number | null;
  timeDecimals: number;
  carOnPitRoad?: boolean;
  carIsLapped?: boolean;
  carIsLapping?: boolean;
  textSize?: 'large';
  legacy?: boolean;
}>;

export const TimeDistance = memo(function TimeDistance(props: TimeDistanceProps) {
  if (!props.visible) return null;
  const value = props.value ?? 0;
  const text = Number.isNaN(value)
    ? ''
    : convertSecToReadable(toFixedDown(value, props.timeDecimals));
  return (
    <div
      className={cx(`overlayBadge timeDistance timeDecimals_${String(props.timeDecimals)}`, {
        carOnPitRoad: props.carOnPitRoad,
        carIsLapped: props.carIsLapped,
        carIsLapping: props.carIsLapping,
        legacy: props.legacy,
        textSizeLarge: props.textSize === 'large',
      })}
    >
      <span>{text}</span>
    </div>
  );
});

type PhysicalDistanceProps = Readonly<{
  visible: boolean;
  value: string | null;
  carOnPitRoad?: boolean;
  carIsLapped?: boolean;
  carIsLapping?: boolean;
  legacy?: boolean;
}>;

export const PhysicalDistance = memo(function PhysicalDistance(props: PhysicalDistanceProps) {
  if (!props.visible) return null;
  return (
    <div
      className={cx('overlayBadge physicalDistance', {
        carOnPitRoad: props.carOnPitRoad,
        carIsLapped: props.carIsLapped,
        carIsLapping: props.carIsLapping,
        legacy: props.legacy,
      })}
    >
      <span>{props.value ?? ''}</span>
    </div>
  );
});

export { TabularNumber };
