import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import { formatGear, formatSpeed } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/format.ts';
import { SpeedExtremes } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/speedExtremes.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import type { Settings } from './racelink-settings';

type Part = Settings['parts'][number]['id'];

const renderHz = 30;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

function Bar({ value, kind, label }: Readonly<{ value: number; kind: string; label: string | null }>) {
  return (
    <div className="pd-barcell">
      <div className={`pd-bar ${kind}`}>
        <div className="pd-fill" style={{ height: `${String(Math.round(clamp01(value) * 100))}%` }} />
      </div>
      {label !== null && <span className="pd-pct">{label}</span>}
    </div>
  );
}

function Wheel({ degrees }: Readonly<{ degrees: number }>) {
  return (
    <svg className="pd-wheel" viewBox="0 0 100 100" aria-hidden="true">
      <g style={{ transform: `rotate(${degrees.toFixed(1)}deg)`, transformOrigin: '50px 50px' }}>
        <circle cx="50" cy="50" r="42" className="pd-rim" />
        <path d="M10 52 Q50 62 90 52" className="pd-spoke" />
        <path d="M50 58 V92" className="pd-spoke" />
        <rect x="46" y="4" width="8" height="12" rx="2" className="pd-top" />
      </g>
    </svg>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings } = useOverlay(overlay, renderHz);
  const tracker = useMemo(
    () => new SpeedExtremes(settings.extremesMode === 'LAP' ? 'lap' : 'corner', settings.swing),
    [settings.extremesMode, settings.swing],
  );
  // Every telemetry frame feeds the tracker, whatever the draw rate.
  useEffect(
    () =>
      overlay.on('telemetry', ({ car, session }) => {
        tracker.update({ speedKph: car.speedKph, lap: session.lap, inPit: car.isInPitlane });
      }),
    [overlay, tracker],
  );

  const { car, session } = telemetry;
  const imperial = settings.speedUnit === 'AUTO' ? session.displayUnits === 'imperial' : settings.speedUnit === 'MPH';
  const unit = imperial ? 'mph' : 'km/h';
  const { min, max } = tracker.shown;
  const angle =
    car.steeringAngleRad === null
      ? (car.steering * settings.wheelRange) / 2
      : (-car.steeringAngleRad * 180) / Math.PI;
  const percent = (value: number): string | null =>
    settings.pedalPercent ? String(Math.round(clamp01(value) * 100)) : null;

  const render = (part: Part): ReactNode => {
    switch (part) {
      case 'gear':
        return (
          <div key={part} className="pd-gear">
            <b className="pd-gearnum">{formatGear(car.gear)}</b>
            <span className="pd-speed">
              {formatSpeed(car.speedKph, imperial)}
              {settings.showUnit && <small>{` ${unit}`}</small>}
            </span>
          </div>
        );
      case 'extremes':
        return settings.showMax || settings.showMin ? (
          <div key={part} className="pd-ext">
            {settings.showMax && (
              <span style={{ color: settings.maxColor }}>{max === null ? '--' : formatSpeed(max, imperial)}</span>
            )}
            {settings.showMin && (
              <span style={{ color: settings.minColor }}>{min === null ? '--' : formatSpeed(min, imperial)}</span>
            )}
          </div>
        ) : null;
      case 'pedals':
        return (
          <div key={part} className="pd-pedals">
            {settings.showClutch && <Bar kind="clutch" value={car.clutch} label={percent(car.clutch)} />}
            <Bar
              kind={`brake ${settings.absMark && car.absActive ? 'abs' : ''}`}
              value={car.brake}
              label={percent(car.brake)}
            />
            <Bar kind="throttle" value={car.throttle} label={percent(car.throttle)} />
          </div>
        );
      case 'wheel':
        return <Wheel key={part} degrees={angle} />;
    }
  };

  const style = {
    '--an-size': `${String(settings.fontSize)}px`,
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
  } as CSSProperties;

  return (
    <div className="an pd-root" data-theme={settings.theme} style={style}>
      <div className="an-panel pd-panel" data-accent={settings.accentLine ? 'on' : 'off'}>
        {settings.parts.filter((part) => part.visible).map((part) => render(part.id))}
      </div>
    </div>
  );
}
