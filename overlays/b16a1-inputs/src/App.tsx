import type { RacelinkOverlay } from '@racelink/overlay';
import { useRef, type CSSProperties } from 'react';
import {
  absPath,
  gearText,
  InputHistory,
  speedValue,
  tracePath,
  wheelDegrees,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/inputsModel.ts';
import { themeVars } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/themes.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/useOverlay';
import type { Settings } from './racelink-settings';

type Overlay = RacelinkOverlay<Settings>;

function Bar({
  value,
  kind,
  abs = false,
  showValue,
}: Readonly<{ value: number; kind: 'clutch' | 'brake' | 'throttle'; abs?: boolean; showValue: boolean }>) {
  const level = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div className={`in-bar in-bar--${kind}`}>
      <div className="in-fill" style={{ height: `${String(level * 100)}%` }}>
        {abs && <div className="in-abs" />}
      </div>
      {showValue && <span className="in-value">{Math.round(level * 100)}</span>}
    </div>
  );
}

function Wheel({ degrees }: Readonly<{ degrees: number }>) {
  return (
    <svg className="in-wheel" viewBox="-50 -50 100 100" aria-hidden="true">
      <g transform={`rotate(${degrees.toFixed(1)})`}>
        <circle r="42" className="in-rim" />
        <circle r="30" className="in-hole" />
        <path d="M-31 2H31V12H8V34H-8V12H-31Z" className="in-spokes" />
        <rect x="-4" y="-48" width="8" height="10" className="in-mark" />
      </g>
    </svg>
  );
}

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings } = useOverlay(overlay, 30);
  const history = useRef(new InputHistory());
  const { car } = telemetry;
  const abs = settings.showAbs && car.absActive;
  const now = performance.now() / 1000;
  if (settings.showTrace) {
    history.current.push(
      { at: now, throttle: car.throttle, brake: car.brake, clutch: car.clutch, abs: car.absActive },
      settings.traceSeconds,
    );
  }
  const samples = history.current.all;
  const seconds = settings.traceSeconds;
  const style = { ...themeVars(settings.theme, settings.opacity), '--abs': settings.absColor } as CSSProperties;

  return (
    <div className="b-root in-root" style={style}>
      <div className="in-pedals">
        <div className="in-panel b-panel">
          <div className="in-bars">
            {settings.showClutch && <Bar kind="clutch" value={car.clutch} showValue={settings.showValues} />}
            {settings.showBrake && <Bar kind="brake" value={car.brake} abs={abs} showValue={settings.showValues} />}
            {settings.showThrottle && <Bar kind="throttle" value={car.throttle} showValue={settings.showValues} />}
          </div>
          {settings.showGear && <div className="in-gear">{gearText(car.gear)}</div>}
          {settings.showSpeed && (
            <div className="in-speed">
              <b>{speedValue(car.speedKph, settings.speedUnit)}</b>
              <span className="b-dim">{settings.speedUnit === 'mph' ? 'mph' : 'km/h'}</span>
            </div>
          )}
          {settings.showWheel && (
            <Wheel degrees={wheelDegrees(car.steeringAngleRad, car.steering, settings.wheelDegrees)} />
          )}
        </div>
      </div>
      {settings.showTrace && (
        <svg className="in-trace b-panel" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" x2="1000" y1={y} y2={y} className="in-grid" />
          ))}
          {settings.traceClutch && (
            <path d={tracePath(samples, now, seconds, (s) => s.clutch)} className="in-line in-line--clutch" />
          )}
          <path d={tracePath(samples, now, seconds, (s) => s.brake)} className="in-line in-line--brake" />
          {settings.showAbs && <path d={absPath(samples, now, seconds)} className="in-line in-line--abs" />}
          <path d={tracePath(samples, now, seconds, (s) => s.throttle)} className="in-line in-line--throttle" />
        </svg>
      )}
    </div>
  );
}
