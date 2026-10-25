import { useMemo, useRef } from 'react';
import { inputTelemetryComponents } from '../../../../shared/contracts/rCatalog/input-telemetry';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { hexToRgba } from '../r-common/driver/format';
import { OrderableColumn } from '../r-common/driver/rows';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { buildWidgetData } from '../r-common/widgets/data';
import { barHasWidgets } from '../r-common/widgets/bars';
import { WidgetBar } from '../r-common/widgets/WidgetBar';
import type { AbsLine, GridLine, Sample } from './chart';
import { GForceMeter } from './GForceMeter';
import { PedalBars } from './PedalBars';
import { TelemetryTrace } from './TelemetryTrace';
import { useFitFontSize } from './useFitFontSize';
import { wheelImages } from './wheels';

const topics: readonly TelemetryTopic[] = [
  'connection',
  'car',
  'controls',
  'session',
  'drivers',
  'timing',
  'weather',
  'fuel',
  'vehicle',
];

const widgetSlots = 5;

const gridLines: readonly GridLine[] = ['none', 'line', 'dashed'];
const absLines: readonly AbsLine[] = ['OFF', 'LINE', 'DOTTED'];
const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  allowed.find((candidate) => candidate === value) ?? fallback;

const gearText = (gear: number): string => (gear < 0 ? 'R' : gear === 0 ? 'N' : String(gear));

/** Input Telemetry: steering wheel, pedal bars, trace, gear and speed, G meter. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values, order } = overlay.settings;
  const layout = useRef<HTMLDivElement>(null);
  const trace = useRef<HTMLDivElement>(null);
  // The window sets the size: the overlay stretches to fill it.
  const fittedFontSize = useFitFontSize(layout, trace, 14, values);
  const general = { ...readGeneral(values), fontSize: fittedFontSize };
  const car = overlay.telemetry.car;
  const imperial = overlay.telemetry.session.displayUnits === 'imperial';
  const lumina = str(values, 'Theme', 'LUMINA') === 'LUMINA';
  const opacity = general.opacity;
  const widgetData = buildWidgetData(overlay);

  const sample = useMemo(
    (): Sample => ({
      throttle: car.throttle,
      brake: car.brake,
      clutch: car.clutch,
      abs: car.absActive,
      steering: (car.steering + 1) / 2,
      speed: car.speedKph,
    }),
    [car.throttle, car.brake, car.clutch, car.absActive, car.steering, car.speedKph],
  );

  const placed = (key: (typeof inputTelemetryComponents)[number]): number => {
    const at = order.ComponentOrder?.indexOf(key) ?? -1;
    return at < 0
      ? order.ComponentOrder === undefined
        ? inputTelemetryComponents.indexOf(key) + 1
        : -1
      : at + 1;
  };
  const show = {
    wheel: bool(values, 'ShowWheel', true),
    trace: bool(values, 'ShowTelemetry', true),
    pedals: bool(values, 'ShowPedals', true),
    gMeter: bool(values, 'gMeter', false),
    gearSpeed: bool(values, 'ShowGearSpeed', true),
  };
  const anyComponent = show.wheel || show.trace || show.pedals || show.gMeter || show.gearSpeed;
  const orders = {
    wheel: show.wheel ? placed('ShowWheel') : -1,
    trace: show.trace ? placed('ShowTelemetry') : -1,
    pedals: show.pedals ? placed('ShowPedals') : -1,
    gMeter: show.gMeter ? placed('gMeter') : -1,
    gearSpeed: show.gearSpeed ? placed('ShowGearSpeed') : -1,
  };
  const traceIsLast =
    orders.trace > orders.pedals &&
    orders.trace > orders.wheel &&
    orders.trace > orders.gMeter &&
    orders.trace > orders.gearSpeed;
  const topEmpty = !barHasWidgets(values, 'Top', widgetSlots);
  const bottomEmpty = !barHasWidgets(values, 'Bottom', widgetSlots);
  const hasWidgetRows = !topEmpty || !bottomEmpty;
  const layoutStyle = hasWidgetRows
    ? { backgroundColor: hexToRgba(lumina ? '#0A0A0B' : '#000000', opacity) }
    : {};
  const panelOpacity = hasWidgetRows ? 0.75 * opacity : opacity;
  const containerClass = lumina ? 'LuminaContainer' : 'ClassicContainer';
  const panelStyle = lumina
    ? {
        backgroundColor: hexToRgba('#0A0A0B', panelOpacity),
        ['--bgColor' as string]: hexToRgba('#0A0A0B', 0.3 * panelOpacity),
      }
    : { backgroundColor: hexToRgba('#000000', panelOpacity) };

  const wheelType = bool(values, 'CustomWheelType', false)
    ? 'iracing'
    : str(values, 'WheelType', 'iracing');
  const simpleWheel = wheelType === 'simple';
  const fontSize = general.fontSize;
  let wheelSize = 7 * fontSize;
  if (lumina) wheelSize = simpleWheel ? 7 * fontSize : 5.5 * fontSize;
  const steeringDegrees =
    car.steeringAngleRad === null ? 0 : (car.steeringAngleRad * 180) / Math.PI;
  const gearAndSpeed = (
    <div
      className={cx('gearAndSpeed', {
        speedOff: !bool(values, 'ShowSpeed', true),
        gearOff: !bool(values, 'ShowGear', true),
      })}
    >
      {bool(values, 'ShowGear', true) && (
        <div className="gear" key={`gear_number${String(car.gear)}`}>
          <span>{gearText(car.gear)}</span>
        </div>
      )}
      {bool(values, 'ShowSpeed', true) && (
        <div className="speed">
          <div className="value">
            <span>{Math.round(imperial ? car.speedKph * 0.621371 : car.speedKph)}</span>
          </div>
          <div className="title">{imperial ? 'MPH' : 'KPH'}</div>
        </div>
      )}
    </div>
  );

  const pedalSettings = {
    minimal: str(values, 'PedalBarsStyle', 'classic') === 'minimal',
    indicator: pick(str(values, 'PedalInputIndicator', 'caps'), ['none', 'caps'] as const, 'caps'),
    showValues: bool(values, 'ShowInputValues', true),
    showClutch: bool(values, 'ShowClutchBar', true),
    showBrake: bool(values, 'ShowBrakeBar', true),
    showThrottle: bool(values, 'ShowThrottleBar', true),
    showAbsInBar: bool(values, 'ShowABSInBar', true),
    throttleColor: str(values, 'ThrottleLineColor', '#08D41C'),
    brakeColor: str(values, 'BrakeLineColor', '#ff0000'),
    absColor: str(values, 'BrakeABSLineColor', '#ffc400'),
    clutchColor: str(values, 'CluthLineColor', '#0000FF'),
  };

  const traceSettings = {
    fontSize,
    historySeconds: num(values, 'TelemetryHistorySeconds', 6.5),
    telemetryLineSize: num(values, 'TelemetryLineSize', 8),
    showThrottle: bool(values, 'ShowThrottleTelemetry', true),
    showBrake: bool(values, 'ShowBrakeTelemetry', true),
    showAbs: bool(values, 'ShowABSBrakeTelemetry', true),
    absLine: pick(str(values, 'ABSBrakeTelemetryLine', 'LINE'), absLines, 'LINE'),
    showClutch: bool(values, 'ShowClutchTelemetry', false),
    showSpeed: bool(values, 'ShowSpeedTelemetry', false),
    showWheel: bool(values, 'ShowWheelTelemetry', false),
    highlight: bool(values, 'HighlightTelemetryLines', false),
    background: str(values, 'TelemetryBackgroundColor', '#ffffff07'),
    horizontalGrid: pick(str(values, 'HorizontalGridLine', 'dashed'), gridLines, 'dashed'),
    middleGrid: pick(str(values, 'MiddleAxisGridLine', 'line'), gridLines, 'line'),
    verticalGrid: pick(str(values, 'VerticalGridLine', 'line'), gridLines, 'line'),
    throttleColor: pedalSettings.throttleColor,
    brakeColor: pedalSettings.brakeColor,
    absColor: pedalSettings.absColor,
    clutchColor: pedalSettings.clutchColor,
    speedColor: str(values, 'SpeedLineColor', '#85C1E9'),
    wheelColor: str(values, 'WheelLineColor', '#c4c4c4'),
    throttleOpacity: num(values, 'ThrottleLineOpacity', 100),
    brakeOpacity: num(values, 'BrakeLineOpacity', 100),
  };

  const gForce = {
    dot: bool(values, 'GDot', true),
    dotColor: str(values, 'GDotColor', '#AEBBFF'),
    dotHistoryColor: str(values, 'GDotHistoryColor', '#5A78FF'),
    dotDecaySeconds: num(values, 'GDotDecay', 3),
    dotHistory: num(values, 'GDotHistory', 200),
    dotRadius: num(values, 'GDotRadius', 4),
    envelope: bool(values, 'GEnvelope', true),
    envelopeColor: str(values, 'GEnvelopeColor', '#FFFFFF'),
    envelopeLineSize: num(values, 'GEnvelopeLineSize', 1),
    showCurrent: bool(values, 'GCurrent', false),
    showPeak: bool(values, 'GPeak', false),
  };

  return (
    <RContainer
      general={general}
      title="Telemetry"
      disableBackgroundColor
      className={cx('InputTelemetryOverlayV2', {
        themeLumina: lumina,
        themeClassic: !lumina,
        hasWidgetRows,
      })}
      darkMode={bool(values, 'DarkMode', false)}
      disableTitle={lumina}
    >
      <div ref={layout} className="inputTelemetryWidgetsLayout" style={layoutStyle}>
        {!topEmpty && (
          <WidgetBar
            bar="Top"
            values={values}
            data={widgetData}
            slots={widgetSlots}
            className="topInfoBar"
          />
        )}
        <div className="inputTelemetryWidgetsLayoutRow">
          {anyComponent && (
            <div
              className={cx(containerClass, {
                opacity0: panelOpacity === 0,
                layoutrow: true,
                leftAligned: true,
                noRightPadding: traceIsLast,
                hasWidgets: hasWidgetRows,
              })}
              style={panelStyle}
            >
              {show.wheel && (
                <OrderableColumn order={orders.wheel}>
                  <div className={cx('wheelAndGearsComp', `wheelIs_${wheelType}`)}>
                    {simpleWheel ? (
                      <svg
                        className="telemetryWheel"
                        width={wheelSize}
                        height={wheelSize}
                        viewBox="0 0 70 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          minWidth: `${String(wheelSize)}px`,
                          ['--steer' as string]: `${String(-steeringDegrees)}deg`,
                        }}
                      >
                        <circle cx="35" cy="35" r="28.5" stroke="black" strokeWidth="3" />
                        <circle cx="35" cy="35" r="26.5" stroke="white" strokeOpacity="0.15" />
                        <path
                          d="M9.01986 20C11.6529 15.4394 15.44 11.6523 20.0006 9.01924L21.5006 11.6173C17.3961 13.9871 13.9877 17.3955 11.6179 21.5L9.01986 20Z"
                          fill="white"
                          transform="rotate(45 35 35)"
                        />
                      </svg>
                    ) : (
                      <img
                        className="telemetryWheel"
                        src={wheelImages[wheelType] ?? wheelImages.iracing}
                        width={wheelSize}
                        height={wheelSize}
                        alt=""
                        style={{
                          minWidth: `${String(wheelSize)}px`,
                          ['--steer' as string]: `${String(-steeringDegrees)}deg`,
                        }}
                      />
                    )}
                    {simpleWheel && gearAndSpeed}
                  </div>
                </OrderableColumn>
              )}
              {show.trace && (
                <OrderableColumn order={orders.trace}>
                  <TelemetryTrace
                    ref={trace}
                    sample={sample}
                    sampledAt={overlay.sampledAt.car}
                    settings={traceSettings}
                    lumina={lumina}
                    isLast={traceIsLast}
                    renderFps={num(values, 'RenderFPS', 60)}
                    demoMode={overlay.demoMode}
                  />
                </OrderableColumn>
              )}
              {show.pedals && (
                <OrderableColumn order={orders.pedals}>
                  <PedalBars
                    inputs={{
                      throttle: car.throttle,
                      brake: car.brake,
                      clutch: car.clutch,
                      abs: car.absActive,
                    }}
                    settings={pedalSettings}
                    lumina={lumina}
                  />
                </OrderableColumn>
              )}
              {show.gearSpeed && (
                <OrderableColumn order={orders.gearSpeed}>
                  <div className="gearSpeed">
                    {bool(values, 'ShowGearSpeed_Gear', true) && (
                      <span
                        className="gearSpeedGear"
                        style={{
                          fontSize: `${String(num(values, 'ShowGearSpeed_GearSize', 60) / 14)}em`,
                        }}
                      >
                        {gearText(car.gear)}
                      </span>
                    )}
                    {bool(values, 'ShowGearSpeed_Speed', true) && (
                      <div className="gearSpeedValueBlock">
                        <span className="gearSpeedValue">
                          {Math.round(imperial ? car.speedKph * 0.621371 : car.speedKph)}
                        </span>
                        <div className="gearSpeedSeparator" />
                        <span className="gearSpeedUnit">{imperial ? 'MPH' : 'KPH'}</span>
                      </div>
                    )}
                  </div>
                </OrderableColumn>
              )}
              {show.gMeter && (
                <OrderableColumn order={orders.gMeter}>
                  <GForceMeter
                    longitudinal={car.accelerationG.longitudinal}
                    lateral={car.accelerationG.lateral}
                    paused={false}
                    size={lumina ? 6 * fontSize : 7 * fontSize}
                    settings={gForce}
                  />
                </OrderableColumn>
              )}
            </div>
          )}
        </div>
        {!bottomEmpty && (
          <WidgetBar
            bar="Bottom"
            values={values}
            data={widgetData}
            slots={widgetSlots}
            className="bottomInfoBar"
          />
        )}
      </div>
    </RContainer>
  );
}
