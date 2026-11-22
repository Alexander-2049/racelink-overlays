import type { RacelinkOverlay } from '@racelink/overlay';
import { useRef, type CSSProperties } from 'react';
import { FitBox } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/FitBox';
import { DropIcon } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/icons';
import { themeVars, windColor } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/themes.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/useOverlay';
import {
  compassPoint,
  PrecipitationTracker,
  windView,
  wetnessLevel,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import type { Settings } from './racelink-settings';

type Overlay = RacelinkOverlay<Settings>;

const trendMark = { rising: '↗', falling: '↘', steady: '→' } as const;

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings } = useOverlay(overlay, 10);
  const rain = useRef(new PrecipitationTracker());
  const { weather, car } = telemetry;
  rain.current.update(weather.precipitationFraction, performance.now());

  const fromCar = settings.orientation === 'car' && car.headingRad !== null;
  const view = windView(weather, {
    imperial: settings.unit === 'mph',
    headingRad: fromCar ? car.headingRad : null,
    strongKph: settings.strongKph,
  });
  const color = view === null ? 'var(--b-dim)' : windColor(view.strength);
  const arrow = view === null ? 0 : (view.arrowRad * 180) / Math.PI;
  const from = weather.windDirectionRad;
  const wet = wetnessLevel(weather.trackWetness);
  const rainValue = rain.current.value;

  return (
    <div className="b-root wd-root" style={themeVars(settings.theme, settings.opacity) as CSSProperties}>
      <FitBox anchor="center">
        <div className="wd-panel b-panel">
          {settings.showTitle && <div className="wd-title b-dim">WIND</div>}
          <div className="wd-main">
            <svg className="wd-ring" viewBox="-50 -50 100 100" aria-hidden="true">
              <circle r="44" className="wd-circle" />
              {fromCar && <path d="M-6 -41h12l-6 9z" className="wd-nose" />}
              <g transform={`rotate(${String(arrow)})`} style={{ color, opacity: view === null ? 0.3 : 1 }}>
                <path d="M0 -34 L14 4 L4 0 V32 H-4 V0 L-14 4 Z" fill="currentColor" />
              </g>
            </svg>
            <div className="wd-read">
              <span className="wd-speed" style={{ color }}>
                {view === null ? '--' : view.speed}
              </span>
              <span className="wd-unit b-dim">{settings.unit === 'mph' ? 'mph' : 'km/h'}</span>
              {settings.showCompass && from !== null && (
                <span className="wd-compass b-dim">from {compassPoint(from)}</span>
              )}
            </div>
          </div>
          {settings.showRain && (
            <div className="wd-rain">
              <DropIcon />
              <span>{rainValue === null ? '--' : `${String(Math.round(rainValue * 100))}%`}</span>
              <span className="b-dim">{rainValue === null ? '' : trendMark[rain.current.trend]}</span>
              <span className="wd-wet" aria-label="Track wetness">
                {Array.from({ length: 6 }, (_, at) => (
                  <i key={at} className={wet !== null && at < wet ? 'is-on' : ''} />
                ))}
              </span>
            </div>
          )}
        </div>
      </FitBox>
    </div>
  );
}
