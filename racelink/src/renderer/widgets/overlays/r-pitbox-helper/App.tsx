import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { pitTireWearVersions } from '../../../../shared/contracts/rCatalog/pitbox-helper';
import type { WheelTelemetry } from '../../../../shared/overlay-api/fields/vehicle';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { useFitFont } from '../r-common/useFitFont';

const topics: readonly TelemetryTopic[] = ['connection', 'car', 'vehicle', 'session', 'drivers'];

type Sides = Readonly<{ leftSide: number | null; middle: number | null; rightSide: number | null }>;
const noSides: Sides = { leftSide: null, middle: null, rightSide: null };

/**
 * Zones listed from the inner to the outer edge, as the car's left, middle
 * and right side of the tyre: a left tyre's outer edge is on the left.
 */
const sidesOf = (zones: readonly number[], single: number | null, left: boolean): Sides => {
  if (zones.length >= 3) {
    const inner = zones[0] ?? null;
    const middle = zones[1] ?? null;
    const outer = zones[zones.length - 1] ?? null;
    return left
      ? { leftSide: outer, middle, rightSide: inner }
      : { leftSide: inner, middle, rightSide: outer };
  }
  if (zones.length === 1) {
    const value = zones[0] ?? null;
    return { leftSide: value, middle: value, rightSide: value };
  }
  return single === null ? noSides : { leftSide: single, middle: single, rightSide: single };
};

const round = (sides: Sides, scale: (value: number) => number): Sides => ({
  leftSide: sides.leftSide === null ? null : Math.round(scale(sides.leftSide)),
  middle: sides.middle === null ? null : Math.round(scale(sides.middle)),
  rightSide: sides.rightSide === null ? null : Math.round(scale(sides.rightSide)),
});

/** Wear colours, from worn (red) to new (green) over 1-100 %. */
const wearColors = [
  '#0CB71A',
  '#2CBB17',
  '#46BF14',
  '#60C311',
  '#7AC70E',
  '#94CB0C',
  '#ADCE09',
  '#C7D206',
  '#E1D604',
  '#FADA01',
  '#FACA01',
  '#F2B401',
  '#EB9F01',
  '#E48A01',
  '#DD7501',
  '#C83701',
  '#C12201',
  '#C12201',
  '#B80801',
  '#B80801',
].reverse();

const wearColor = (value: number | null): string => {
  if (value === null) return '#ffffff';
  const position = ((Math.min(100, Math.max(1, value)) - 1) / 99) * (wearColors.length - 1);
  return wearColors[Math.round(position)] ?? '#ffffff';
};
const wearShare = (value: number | null, invert = false): string =>
  invert
    ? value === null
      ? '0%'
      : `${String(100 - value)}%`
    : value === null
      ? '100%'
      : `${String(value)}%`;

function TireIcon() {
  return (
    <svg width="36" height="50" viewBox="0 0 36 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="RL-tire">
        <rect id="tire-bg" width="36" height="50" rx="10" fill="#212121" />
        <path
          id="tireLeftSide"
          d="M1 11C1 5.47715 5.47715 1 11 1V1V49V49C5.47715 49 1 44.5228 1 39V11Z"
          fill="white"
        />
        <rect id="tireMiddle" x="13" y="1" width="10" height="48" fill="white" />
        <path
          id="tireRightSide"
          d="M25 1V1C30.5228 1 35 5.47715 35 11V39C35 44.5228 30.5228 49 25 49V49V1Z"
          fill="white"
        />
      </g>
    </svg>
  );
}

function TireChangeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.75109 12.1274L3.62359 8.99988L2.55859 10.0574L6.75109 14.2499L15.7511 5.24988L14.6936 4.19238L6.75109 12.1274Z"
        fill="#828282"
      />
    </svg>
  );
}

type TireProps = Readonly<{
  wear: Sides;
  temp: Sides;
  tempUnit: string;
  showWear: boolean;
  showTemp: boolean;
  change: boolean;
  previous: boolean;
  version: string;
  reversed?: boolean;
}>;

function PitSingleTireStatus({
  wear,
  temp,
  tempUnit,
  showWear,
  showTemp,
  change,
  previous,
  version,
  reversed = false,
}: TireProps) {
  const style = {
    '--tireLeftSideWear': wearShare(wear.leftSide),
    '--tireLeftSideWearInvert': wearShare(wear.leftSide, true),
    '--tireLeftSideWearColor': wearColor(wear.leftSide),
    '--tireMiddleWear': wearShare(wear.middle),
    '--tireMiddleWearInvert': wearShare(wear.middle, true),
    '--tireMiddleWearColor': wearColor(wear.middle),
    '--tireRightSideWear': wearShare(wear.rightSide),
    '--tireRightSideWearInvert': wearShare(wear.rightSide, true),
    '--tireRightSideWearColor': wearColor(wear.rightSide),
  } as CSSProperties;
  const metric = (value: number | null, unit: string, hundred: boolean) => (
    <div className={cx('aTireMetric', { hundredPercent: hundred })}>
      <span>{value === null ? '-' : `${String(value)}${unit}`}</span>
    </div>
  );
  return (
    <div
      className={cx('pitSingleTireStatus', { isShowingPreviousTireState: previous })}
      style={style}
    >
      {showWear && (
        <div className="topTireMetrics">
          {metric(wear.leftSide, '%', wear.leftSide === 100)}
          {metric(wear.middle, '%', wear.middle === 100)}
          {metric(wear.rightSide, '%', wear.rightSide === 100)}
        </div>
      )}
      <div className={cx('middleTireMetrics', version, { reversed, hideTireWear: !showWear })}>
        <div className="aTireMetric">
          <span />
        </div>
        <TireIcon />
        <div className="aTireMetric">
          <span className="aTireChangeIconContainer">{change && <TireChangeIcon />}</span>
        </div>
      </div>
      {showTemp && (
        <div className="bottomTireMetrics">
          {metric(temp.leftSide, tempUnit, temp.leftSide !== null && temp.leftSide >= 100)}
          {metric(temp.middle, tempUnit, temp.middle !== null && temp.middle >= 100)}
          {metric(temp.rightSide, tempUnit, temp.rightSide !== null && temp.rightSide >= 100)}
        </div>
      )}
    </div>
  );
}

/** Pitbox Helper: pit limiter, speed to the limit, distance to the box and the tyres. */
export default function App() {
  const overlay = useRacingOverlay(topics, 20);
  const { values } = overlay.settings;
  const { car, session, vehicle, drivers } = overlay.telemetry;
  const showTemp = bool(values, 'ShowTireTemp', true);
  const showWear = bool(values, 'ShowTireWear', true);
  const showLimiter = bool(values, 'ShowPitLimiter', true);
  const showSpeed = bool(values, 'ShowPitSpeedDelta', true);
  const showDistance = bool(values, 'ShowPitStallDistance', true);
  const [fontSize, fit] = useFitFont(
    'contain',
    `${String(showTemp)}${String(showWear)}${String(showLimiter)}${String(showSpeed)}${String(showDistance)}`,
  );
  const general = { ...readGeneral(values), fontSize };
  const version =
    pitTireWearVersions.find((entry) => entry === str(values, 'PitTireWearVersion', 'OPACITY')) ??
    'OPACITY';
  const imperial = session.displayUnits === 'imperial';
  const player = drivers.find((driver) => driver.isPlayer) ?? null;

  const inPitLane = car.isInPitlane;
  const approaching = player?.trackSurface === 'approachingPits';
  const inStall = player?.trackSurface === 'pitStall' || (inPitLane && car.speedKph < 1);
  const limit = session.pit.speedLimitKph;
  const speed = imperial ? car.speedKph * 0.621371 : car.speedKph;
  const limitInUnits = limit === null ? null : imperial ? limit * 0.621371 : limit;
  const speedDelta = limitInUnits === null ? 0 : speed - limitInUnits;
  const distance = session.pit.distanceToBoxMeters;

  // The overlay stays up for a while after the car leaves the pit lane.
  const [leftPitsAt, setLeftPitsAt] = useState<number | null>(null);
  const wasInPits = useRef(inPitLane);
  useEffect(() => {
    if (wasInPits.current && !inPitLane) setLeftPitsAt(performance.now());
    wasInPits.current = inPitLane;
  }, [inPitLane]);
  const [, refresh] = useState(0);
  const lingerMs = num(values, 'ShowDurationAfterLeavingPits', 15) * 1000;
  useEffect(() => {
    if (leftPitsAt === null) return;
    const timer = window.setTimeout(() => {
      refresh((value) => value + 1);
    }, lingerMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [leftPitsAt, lingerMs]);
  const lingering = leftPitsAt !== null && performance.now() - leftPitsAt < lingerMs;
  const active =
    inPitLane ||
    approaching ||
    lingering ||
    bool(values, 'AlwaysShow', false) ||
    overlay.demoMode ||
    overlay.editMode;
  if (!active) return null;

  const wheel = (id: WheelTelemetry['id']) =>
    vehicle.wheels.find((entry) => entry.id === id) ?? null;
  const tireOf = (id: WheelTelemetry['id'], left: boolean) => {
    const entry = wheel(id);
    const wear = round(
      sidesOf(entry?.tyreTreadZonesFraction ?? [], entry?.tyreRemainingFraction ?? null, left),
      (value) => value * 100,
    );
    const temp = round(sidesOf(entry?.tyreTemperatureC ?? [], null, left), (value) =>
      imperial ? (value * 9) / 5 + 32 : value,
    );
    return { wear, temp, change: entry?.tyreChangeRequested === true };
  };
  // iRacing measures tyres only in the pit stall: elsewhere they are the last stop's.
  const previous = overlay.gameId === 'iracing' && !inStall;
  const tempUnit = imperial ? 'F' : 'C';
  const limiter = car.pitLimiterActive;
  const range = Math.max(1, num(values, 'PitBoxDetectionRange', 200));
  const progress =
    distance !== null && distance <= range ? 100 - (100 / range) * Number(distance.toFixed(2)) : 0;
  const onRoad = !inPitLane && !approaching;
  const positive =
    speedDelta > 0 ? (speedDelta > 20 ? '100%' : `${String(5 * speedDelta)}%`) : '0%';
  const negative =
    speedDelta < 0 ? (speedDelta < -20 ? '100%' : `${String(Math.abs(5 * speedDelta))}%`) : '0%';
  const showTires = showTemp || showWear;
  const tires = {
    frontLeft: tireOf('frontLeft', true),
    frontRight: tireOf('frontRight', false),
    rearLeft: tireOf('rearLeft', true),
    rearRight: tireOf('rearRight', false),
  };

  return (
    <div ref={fit} className="rFit">
      <RContainer
        general={general}
        title="pitbox helper"
        titlePlacement="top"
        className="PitboxHelperOverlay"
      >
        <div className="PitboxHelperOverlayContent">
          {showLimiter && (
            <div
              className={cx('pitLimiterStatus', {
                pitLimiterIsOn: limiter === true && inPitLane,
                pitLimiterIsOnWhenOnRoad: limiter === true && !inPitLane,
                pitLimiterIsOff: limiter === false && inPitLane,
                outlap: limiter === false && !inPitLane,
                pitLimiterIsNA: limiter === null,
                driverIsInPitLane: inPitLane,
                driverIsOnRoad: !inPitLane,
              })}
            >
              {limiter === true && <span>pit limiter on</span>}
              {limiter === false && inPitLane && <span>pit limiter off</span>}
              {limiter === false && !inPitLane && (
                <span>
                  {approaching
                    ? 'in lap'
                    : player?.pit.isOnOutLap === true
                      ? 'out lap'
                      : 'pit limiter off'}
                </span>
              )}
              {limiter === null && <span>no pit limiter</span>}
            </div>
          )}
          {(showDistance || showSpeed || showTires) && (
            <div className="PitboxHelperInnerContent">
              <div
                className={cx('PitBoxHelperDistanceAndSpeedConttainer', {
                  noTireDataToShow: !showTires,
                })}
              >
                {showDistance &&
                  (inStall ? (
                    <div className="pitDistanceStatus">
                      <div className="pitDistanceBarSimple">
                        <div className="pitDistanceBarInnerSimple" />
                      </div>
                      <span>in box</span>
                    </div>
                  ) : (
                    <div className="pitDistanceStatus">
                      {!onRoad && (
                        <div className="pitDistanceBar">
                          <div
                            className="pitDistanceBarInner"
                            style={
                              { '--pitDistanceInPct': `${String(progress)}%` } as CSSProperties
                            }
                          />
                        </div>
                      )}
                      {onRoad && (
                        <div className="pitDistanceBarSimple">
                          <div className="pitDistanceBarInnerSimple" />
                        </div>
                      )}
                      {!onRoad && <span>{distance === null ? '-' : distance.toFixed(0)} m</span>}
                      {onRoad && <span>exit</span>}
                    </div>
                  ))}
                {showSpeed && (
                  <div
                    className="pitSpeedStatus"
                    style={
                      {
                        '--positiveDeltaBarPct': onRoad ? '0%' : positive,
                        '--negativeDeltaBarPct': onRoad ? '0%' : negative,
                      } as CSSProperties
                    }
                  >
                    <div className="pitSpeedBarLeft">
                      <div className={cx('pitSpeedBarInner', { driverIsOnRoad: onRoad })}>
                        <span>
                          {speedDelta > 0 ? '+' : '-'}{' '}
                          {(Math.floor(1000 * Math.abs(speedDelta)) / 1000).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="pitSpeedBarRight">
                      <div className={cx('pitSpeedBarInner', { driverIsOnRoad: onRoad })}>
                        <span>{imperial ? 'mph' : 'kph'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {showTires && (
                <div className="pitTireStatus">
                  {(['frontLeft', 'frontRight', 'rearLeft', 'rearRight'] as const).map((id) => (
                    <PitSingleTireStatus
                      key={id}
                      wear={tires[id].wear}
                      temp={tires[id].temp}
                      tempUnit={tempUnit}
                      showWear={showWear}
                      showTemp={showTemp}
                      change={tires[id].change}
                      previous={previous}
                      version={version}
                      reversed={id === 'frontRight' || id === 'rearRight'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </RContainer>
    </div>
  );
}
