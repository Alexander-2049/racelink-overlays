import type { CSSProperties, ReactNode } from 'react';
import { gForceComparisonModes } from '../../../../shared/contracts/rCatalog/g-force-meter';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { hexToRgba } from '../r-common/driver/format';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { useFitFont } from '../r-common/useFitFont';
import { buildWidgetData } from '../r-common/widgets/data';
import { barHasWidgets } from '../r-common/widgets/bars';
import { WidgetSlot } from '../r-common/widgets/WidgetBar';
import { GMeterCanvas } from './GMeterCanvas';
import { AvgIcon, LapTimeIcon, MaxIcon, PersonalIcon, ValueBackdrop } from './icons';

const topics: readonly TelemetryTopic[] = [
  'connection',
  'car',
  'controls',
  'vehicle',
  'session',
  'timing',
  'weather',
  'fuel',
  'drivers',
];

/** The meter is 210 px wide at a 14 px font. */
const meterEm = 15;
const widgetSlots = 3;

type Mode = (typeof gForceComparisonModes)[number];

/** Fixed decimals that round toward minus infinity. */
const toFixedDown = (value: number, places: number): string => {
  const scale = 10 ** places;
  return (Math.floor(value * scale) / scale).toFixed(places);
};

const lapTimeText = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return '--:--.---';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  const whole = Math.floor(rest);
  return `${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}.${String(Math.floor((rest - whole) * 1000)).padStart(3, '0')}`;
};

const modeNames: Readonly<Record<Mode, string>> = {
  personalLastLap: 'Previous last',
  personalBestLap: 'Personal best',
  personalSessionBestLap: 'Personal s.best',
};

function EnvelopeStats({
  color,
  envelope,
  lapSeconds,
}: Readonly<{ color: string; envelope: readonly number[]; lapSeconds: number | null }>) {
  const max = Math.max(0, ...envelope);
  const average =
    envelope.length === 0 ? 0 : envelope.reduce((sum, value) => sum + value, 0) / envelope.length;
  const style = {
    '--compStatColor': color,
    '--compStatColorBg': hexToRgba(color, 0.2),
  } as CSSProperties;
  return (
    <div className="ComparisonPanelRow compComp" style={style}>
      <div>
        <span className="smlabel">
          <AvgIcon />
        </span>
        <span className="smvalue smvalueavg">
          {average > 0 ? `${toFixedDown(average, 1)}G` : '-.-'}
        </span>
      </div>
      <div>
        <span className="smlabel">
          <MaxIcon />
        </span>
        <span className="smvalue smvaluemax">{max > 0 ? `${toFixedDown(max, 1)}G` : '-.-'}</span>
      </div>
      <div>
        <LapTimeIcon />
        <span>
          <span className="simpleNumber">{lapTimeText(lapSeconds)}</span>
        </span>
      </div>
    </div>
  );
}

/** G-Force Meter: the force with its trail, the traction envelope and a lap to compare. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const { car, vehicle } = overlay.telemetry;
  const gForce = vehicle.gForce;
  const circle = str(values, 'Shape', 'RECTANGLE') === 'CIRCLE';
  const comparisonOn = bool(values, 'GComparisonEnv', false);
  const envelopeOn = bool(values, 'GEnvelope', true);
  const showLabel = comparisonOn && bool(values, 'ShowComparisonLabel', true);
  const showComparisonStats = comparisonOn && bool(values, 'ShowComparisonStats', false);
  const showEnvelopeStats = envelopeOn && bool(values, 'ShowEnvelopeStats', false);
  const hasWidgets = barHasWidgets(values, 'Bottom', widgetSlots);
  const showCurrent = bool(values, 'GCurrent', true);
  const showPeak = bool(values, 'GPeak', true);
  const [fontSize, fit] = useFitFont(
    'contain',
    `${String(circle)}${String(showLabel)}${String(showComparisonStats)}${String(showEnvelopeStats)}${String(hasWidgets)}${String(showCurrent)}${String(showPeak)}`,
  );
  const general = { ...readGeneral(values), fontSize, showTitle: false };
  const size = Math.round(fontSize * meterEm);
  const mode: Mode =
    gForceComparisonModes.find(
      (entry) => entry === str(values, 'ComparisonMode', 'personalBestLap'),
    ) ?? 'personalBestLap';
  const comparison =
    mode === 'personalBestLap'
      ? gForce.personalBest
      : mode === 'personalSessionBestLap'
        ? gForce.sessionBest
        : gForce.lastLap;
  const envelope = str(values, 'EnvelopeMode', 'session') === 'lap' ? gForce.lap : gForce.session;
  const lateral = car.accelerationG.lateral;
  const longitudinal = car.accelerationG.longitudinal;
  const current = Math.hypot(lateral, longitudinal);
  const peak = Math.max(gForce.peakG, current);
  // The scale steps in half-g with headroom, so the envelope sits inside the
  // meter and does not swell with every new peak.
  const scaleG = Math.max(2, Math.ceil((peak * 1.15) / 0.5) * 0.5);
  // Screen right is positive lateral force, the top is braking.
  const sides = [
    gForce.sidesG.braking,
    gForce.sidesG.left,
    gForce.sidesG.accelerating,
    gForce.sidesG.right,
  ];
  const opacity = general.opacity;
  const borderOpacity = num(values, 'BorderOpacity', 1);
  const panelOpacity = num(values, 'PanelOpacity', 1);
  const widgetData = buildWidgetData(overlay);

  const meter = (
    <GMeterCanvas
      size={size}
      lateral={lateral}
      longitudinal={longitudinal}
      paused={!car.isOnTrack && !overlay.demoMode}
      maxG={scaleG}
      showEdge={
        circle
          ? bool(values, 'ShowCircleOuterRing', true)
          : bool(values, 'ShowRectangleOuterRing', false)
      }
      edgeSize={circle ? 0.1 : 0.15}
      edgeOpacity={borderOpacity}
      dotVisible={bool(values, 'GDot', true)}
      dotRadius={num(values, 'GDotRadius', 4)}
      currentDotColor={str(values, 'GDotColor', '#AEBBFF')}
      dotHistorySize={Math.round(num(values, 'GDotHistory', 200))}
      dotHistoryColor={str(values, 'GDotHistoryColor', '#5A78FF')}
      decayMs={1000 * num(values, 'GDotDecay', 3)}
      envelope={envelope}
      envelopeVisible={envelopeOn}
      envelopeColor={str(values, 'GEnvelopeColor', '#FFFFFF')}
      envelopeLineWidth={num(values, 'GEnvelopeLineSize', 2)}
      comparisonEnvelope={comparison?.envelope ?? null}
      comparisonEnvelopeVisible={comparisonOn}
      comparisonEnvelopeColor={str(values, 'GComparisonEnvColor', '#FF7878')}
      comparisonEnvelopeLineWidth={num(values, 'GComparisonEnvLineSize', 2)}
      comparisonEnvelopeDash={
        str(values, 'GComparisonEnvLineType', 'LINE') === 'DOTTED' ? [1, 1] : null
      }
    />
  );
  const crosshair = bool(values, 'ShowTracInnerRings', false) && (
    <div className="gcanvasCrossair" />
  );
  const value = (text: ReactNode) => <div>{text}</div>;

  const shape: ReactNode = circle ? (
    <div
      className={cx('GForceMeterCleanCircleShape', {
        axisLines: bool(values, 'ShowCircleAxisLines', false),
      })}
      style={{ '--bgOpacity': opacity, '--borderOpacity': borderOpacity } as CSSProperties}
    >
      <div className="gcanvasCont">
        {crosshair}
        {meter}
      </div>
      <div className="GForceMeterCleanFrame">
        {(showCurrent || showPeak) && (
          <div className="botValue">
            <ValueBackdrop opacity={Math.min(1, 1.5 * opacity)} />
            <div>
              {showCurrent && (
                <>
                  {toFixedDown(current, 1)}
                  {!showPeak && <span>G</span>}
                </>
              )}
              {showCurrent && showPeak && <div className="botseparator">·</div>}
              {showPeak && (
                <div className="notcurr">
                  {toFixedDown(peak, 1)}
                  {!showCurrent && <span>G</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div
      className={cx('GForceMeterCleanRectangularShape', {
        flatBottom: hasWidgets || comparisonOn,
        axisLines: bool(values, 'ShowRectangleAxisLines', true),
      })}
      style={
        {
          '--bgOpacity': opacity,
          '--crossairOpacity': Math.min(1, 1.5 * opacity),
          '--borderOpacity': borderOpacity,
        } as CSSProperties
      }
    >
      <div className="GForceInputCanvasCont">
        <div className="gcanvasCont">
          {crosshair}
          {meter}
        </div>
      </div>
      <div className="GForceMeterCleanFrame">
        {showPeak && (
          <div className="topValue">
            <ValueBackdrop />
            {value(
              <>
                {toFixedDown(sides[0] ?? 0, 1)} <span>G</span>
              </>,
            )}
          </div>
        )}
        {(showCurrent || showPeak) && (
          <div className="botValue">
            <ValueBackdrop />
            <div>
              {showPeak && toFixedDown(current, 1)}
              {showCurrent && showPeak && <div className="botseparator">·</div>}
              {showCurrent && <div className="notcurr">{toFixedDown(peak, 1)}</div>}
            </div>
          </div>
        )}
        {showPeak && (
          <div className="leftValue">
            <ValueBackdrop />
            {value(
              <>
                {toFixedDown(sides[3] ?? 0, 1)} <span>G</span>
              </>,
            )}
          </div>
        )}
        {showPeak && (
          <div className="rightValue">
            <ValueBackdrop />
            {value(
              <>
                {toFixedDown(sides[1] ?? 0, 1)} <span>G</span>
              </>,
            )}
          </div>
        )}
      </div>
    </div>
  );

  const comparisonColor = str(values, 'GComparisonEnvColor', '#FF7878');
  const envelopeColor = str(values, 'GEnvelopeColor', '#FFFFFF');
  const panelStyle = {
    backgroundColor: hexToRgba('#202024', panelOpacity),
    overflow: 'hidden',
    '--compColor': comparisonColor,
    '--myColor': envelopeColor,
    '--compColorBg': hexToRgba(comparisonColor, 0.2),
    '--myColorBg': hexToRgba(envelopeColor, 0.2),
  } as CSSProperties;

  return (
    <div ref={fit} className="rFit">
      <RContainer
        general={general}
        title="G-Force Meter"
        titlePlacement="top"
        className="GForceMeterOverlay"
        disableTitle
        disableBackgroundColor
      >
        <div className="GForceMeterOverlay_inner">
          <div className="GForceMeterOverlayCleanContainer">
            <div
              className="GForceMeterClean"
              style={
                {
                  '--gMeterCanvasSize': `calc(${String(size)}px)`,
                  '--gforce-curr': str(values, 'GDotColor', '#AEBBFF'),
                  '--peak-colors': envelopeColor,
                  '--gforce-bgcolor': hexToRgba(str(values, 'BackgroundColor', '#202024'), opacity),
                  '--ring-color': str(values, 'InnerRingsColor', '#000000'),
                  '--ring-size': num(values, 'InnerRingsSize', 2),
                } as CSSProperties
              }
            >
              {shape}
            </div>
            <div className={cx('GForceMeterOverlayCleanBotContainer', { roundedCorners: circle })}>
              {(showLabel || showComparisonStats || showEnvelopeStats) && (
                <div className="GForceMeterCleanComparisonPanel" style={panelStyle}>
                  {showLabel && (
                    <div className="ComparisonPanelRow">
                      <div>
                        <PersonalIcon /> <span>VS</span>
                      </div>
                      <div>
                        <div className="comparisonLabelDot" />
                        <span>{modeNames[mode]}</span>
                      </div>
                    </div>
                  )}
                  {showComparisonStats && (
                    <EnvelopeStats
                      color={comparisonColor}
                      envelope={comparison?.envelope ?? []}
                      lapSeconds={comparison?.lapSeconds ?? null}
                    />
                  )}
                  {showEnvelopeStats && (
                    <EnvelopeStats
                      color={envelopeColor}
                      envelope={envelope}
                      lapSeconds={gForce.lastLap?.lapSeconds ?? null}
                    />
                  )}
                </div>
              )}
              {hasWidgets && (
                <div
                  className="GForceMeterCleanBotWidgets"
                  style={
                    {
                      backgroundColor: hexToRgba('#000000', panelOpacity),
                      overflow: 'hidden',
                      '--clean-bot-wid-width': `${String(size)}px`,
                    } as CSSProperties
                  }
                >
                  {Array.from({ length: widgetSlots }, (_, index) => (
                    <WidgetSlot
                      key={index}
                      bar="Bottom"
                      index={index}
                      values={values}
                      data={widgetData}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </RContainer>
    </div>
  );
}
