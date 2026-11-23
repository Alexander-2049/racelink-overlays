import { useRef, type CSSProperties, type ReactNode } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import {
  compassPoint,
  PrecipitationTracker,
  windView,
  wetnessLevel,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import {
  IconCloud,
  IconDrizzle,
  IconRain,
  IconStorm,
  IconSun,
  IconTrendDown,
  IconTrendUp,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Icons';
import { FitStage } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/FitStage';
import { Root } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/useOverlay';
import type { Settings } from './racelink-settings';

const renderHz = 4;

const wetnessWords = [
  'Dry',
  'Mostly dry',
  'Very lightly wet',
  'Lightly wet',
  'Moderately wet',
  'Very wet',
  'Extremely wet',
] as const;

const rainIcon = (fraction: number): ReactNode => {
  if (fraction < 0.005) return <IconSun />;
  if (fraction < 0.1) return <IconCloud />;
  if (fraction < 0.35) return <IconDrizzle />;
  if (fraction < 0.7) return <IconRain />;
  return <IconStorm />;
};

function WindArrow({ radians }: Readonly<{ radians: number }>) {
  return (
    <svg
      className="wh-wind-arrow"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ transform: `rotate(${String(radians)}rad)` }}
    >
      <path d="M12 3v18M12 3 6.5 8.5M12 3l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings } = useOverlay(overlay, renderHz);
  const rain = useRef(new PrecipitationTracker());
  const { weather, session, car } = telemetry;

  rain.current.update(weather.precipitationFraction, Date.now());
  const smoothed = rain.current.value;
  const level = wetnessLevel(weather.trackWetness);
  const wind = windView(weather, {
    imperial:
      settings.windUnit === 'mph' || (settings.windUnit === 'auto' && session.displayUnits === 'imperial'),
    headingRad: settings.windFrame === 'car' ? car.headingRad : null,
  });

  const blocks: Readonly<Record<Settings['blocks'][number]['id'], ReactNode>> = {
    wetness: (
      <div className="wh-block">
        <span className="wh-block-label">Track Wetness</span>
        <span className="wh-mono wh-block-value">{level === null ? '-' : wetnessWords[level]}</span>
        {settings.showWetnessScale && (
          <span className="wh-scale" aria-hidden="true">
            {wetnessWords.map((word, index) => (
              <span key={word} className={level !== null && level > 0 && index <= level ? 'wh-pip wh-pip--on' : 'wh-pip'} />
            ))}
          </span>
        )}
      </div>
    ),
    precipitation: (
      <div className="wh-block">
        <span className="wh-block-label">Precipitation</span>
        <span className="wh-block-row">
          <span className="wh-block-icon">{rainIcon(smoothed ?? 0)}</span>
          <span className="wh-mono wh-block-value">
            {smoothed === null ? '-' : `${(smoothed * 100).toFixed(settings.precipitationDecimals)}%`}
          </span>
          {settings.showTrend && rain.current.trend !== 'steady' && (
            <span
              className={
                rain.current.trend === 'rising' ? 'wh-block-trend wh-warn' : 'wh-block-trend wh-good'
              }
              title={rain.current.trend}
            >
              {rain.current.trend === 'rising' ? <IconTrendUp /> : <IconTrendDown />}
            </span>
          )}
        </span>
      </div>
    ),
    wind: (
      <div className="wh-block">
        <span className="wh-block-label">
          Wind{settings.windFrame === 'north' && wind !== null ? ` from ${compassPoint(wind.arrowRad + Math.PI)}` : ''}
        </span>
        {wind === null ? (
          <span className="wh-mono wh-block-value">-</span>
        ) : (
          <span className="wh-block-row" style={{ '--wh-strength': String(wind.strength) } as CSSProperties}>
            <span className="wh-block-icon wh-windcolor">
              <WindArrow radians={wind.arrowRad} />
            </span>
            <span className="wh-mono wh-block-value wh-windcolor">{wind.speed}</span>
            <span className="wh-block-unit wh-dim">{wind.unit}</span>
          </span>
        )}
      </div>
    ),
  };

  const shown = settings.blocks.filter((block) => block.visible).map((block) => block.id);
  if (shown.length === 0) return null;

  return (
    <Root theme={settings.theme} opacity={settings.opacity} fontSize={settings.fontSize} className="wh-weather">
      <FitStage>
      <div className={settings.layout === 'horizontal' ? 'wh-card wh-card--row' : 'wh-card'}>
        {shown.map((id) => (
          <div key={id} className="wh-slot">
            {blocks[id]}
          </div>
        ))}
      </div>
      </FitStage>
    </Root>
  );
}
