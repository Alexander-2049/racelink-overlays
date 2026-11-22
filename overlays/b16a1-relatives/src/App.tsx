import type { RacelinkOverlay } from '@racelink/overlay';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { carLogoUrl, flagUrl, useAssetTables } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/assets';
import type { AssetTables } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/assetTables.ts';
import { FitBox } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/FitBox';
import {
  AirIcon,
  ChevronDown,
  ChevronUp,
  ClockIcon,
  DropIcon,
  FuelIcon,
  IncidentIcon,
  TrackIcon,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/icons';
import {
  clockTime,
  driverName,
  durationShort,
  percentText,
  ratingText,
  temperatureText,
  timeOfDay,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/format.ts';
import {
  footerLap,
  fuelFraction,
  incidentsText,
  relativeGapText,
  rowTone,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/relativesView.ts';
import { referenceCarIdx } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/standingsView.ts';
import { themeVars } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/themes.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/useOverlay';
import { buildRelatives } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import type { Settings } from './racelink-settings';

type Overlay = RacelinkOverlay<Settings>;
type ColumnId = Settings['columns'][number]['id'];

const widths: Readonly<Record<ColumnId, string>> = {
  position: '1.4em',
  number: '3em',
  flag: '1.5em',
  name: 'minmax(8em, 1fr)',
  brand: '1.5em',
  licence: '3.3em',
  rating: '6.6em',
  gap: '3em',
};

/** The real clock, ticking once a second while it is shown. */
const useWallClock = (on: boolean): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [on]);
  return now;
};

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings, editMode } = useOverlay(overlay, 10);
  const assets = useAssetTables();
  const now = useWallClock(settings.clock === 'real');
  const { drivers, session, weather, fuel } = telemetry;
  const referenceIdx = referenceCarIdx(drivers);
  const reference = drivers.find((driver) => driver.carIdx === referenceIdx);
  const player = drivers.find((driver) => driver.isPlayer);
  const rows = buildRelatives({
    drivers,
    referenceCarIdx: referenceIdx,
    sessionType: session.type,
    playerOnTrack: player !== undefined && player.trackSurface === 'onTrack',
    options: {
      rows: settings.rows,
      excludePit: settings.excludePit,
      loneQualify: settings.loneQualify,
    },
  });
  const columns = settings.columns.filter((column) => column.visible).map((column) => column.id);
  const template = columns.map((id) => widths[id]).join(' ');
  const fahrenheit = settings.temperatureUnit === 'f';
  const referenceClass = reference?.classId ?? null;
  const classInfo = session.classes.find((info) => info.classId === referenceClass);
  const sof = classInfo?.strengthOfField ?? session.strengthOfField;

  const left = ((): ReactNode => {
    switch (settings.headerLeft) {
      case 'fuel': {
        const fraction = fuelFraction(fuel.levelLiters, fuel.capacityLiters);
        return fraction === null ? null : (
          <>
            <FuelIcon />
            {percentText(fraction)}
          </>
        );
      }
      case 'airTemp':
        return weather.airTemperatureC === null ? null : (
          <>
            <AirIcon />
            {temperatureText(weather.airTemperatureC, fahrenheit)}
          </>
        );
      case 'trackTemp':
        return weather.trackTemperatureC === null ? null : (
          <>
            <TrackIcon />
            {temperatureText(weather.trackTemperatureC, fahrenheit)}
          </>
        );
      case 'humidity':
        return weather.humidityFraction === null ? null : (
          <>
            <DropIcon />
            {percentText(weather.humidityFraction)}
          </>
        );
      case 'off':
        return null;
    }
  })();
  const incidents = settings.showIncidents ? incidentsText(session.ext.iracing?.incidents ?? null) : '';
  const date = new Date(now);
  const clock =
    settings.clock === 'off'
      ? ''
      : settings.clock === 'sim'
        ? timeOfDay(session.timeOfDaySeconds, settings.clock12)
        : timeOfDay((date.getHours() * 60 + date.getMinutes()) * 60, settings.clock12);
  const showSof = settings.showSof && sof !== null;
  const hasHeader = settings.showHeader && (left !== null || showSof || incidents !== '' || clock !== '');

  const timeLeft = clockTime(session.timeRemainingSeconds);
  const total = durationShort(session.sessionDurationSeconds);
  const lap = footerLap(session);

  return (
    <div className="b-root rl-root" style={themeVars(settings.theme, settings.opacity) as CSSProperties}>
      <FitBox anchor={settings.align}>
        <div className="rl-panel b-panel">
          {hasHeader && (
            <div className="rl-header">
              <span className="rl-h-item">{left}</span>
              <span className="rl-h-item">{showSof ? `SOF ${String(sof)}` : ''}</span>
              <span className="rl-h-item">
                {incidents !== '' && (
                  <>
                    <IncidentIcon />
                    {incidents}
                  </>
                )}
              </span>
              <span className="rl-h-item">
                {clock !== '' && (
                  <>
                    <ClockIcon />
                    {clock}
                  </>
                )}
              </span>
            </div>
          )}
          <div className="rl-rows">
            {rows.length === 0 && editMode && <div className="b-hint">Relatives appear when you drive.</div>}
            {rows.map((row) => {
              if (row.kind === 'empty') return <div key={`e${String(row.index)}`} className="rl-row is-empty" />;
              const { driver } = row;
              const tone = rowTone(driver, row.isReference, referenceClass);
              return (
                <div
                  key={driver.carIdx}
                  className={`rl-row tone-${tone}${row.inPit && settings.showPitBadge ? ' in-pit' : ''}`}
                  style={{ gridTemplateColumns: template, '--cls': driver.classColor } as CSSProperties}
                >
                  {columns.map((id) => (
                    <Cell key={id} id={id} row={row} settings={settings} assets={assets} />
                  ))}
                </div>
              );
            })}
          </div>
          {settings.showFooter && (lap !== '' || timeLeft !== '') && (
            <div className="rl-footer">
              <span>{lap === '' ? '' : `Lap: ${lap}`}</span>
              <span>{timeLeft === '' ? '' : `Race: ${timeLeft}${total === '' ? '' : `/${total}`}`}</span>
            </div>
          )}
        </div>
      </FitBox>
    </div>
  );
}

type RowOf = Extract<ReturnType<typeof buildRelatives>[number], { kind: 'car' }>;

function Cell({
  id,
  row,
  settings,
  assets,
}: Readonly<{ id: ColumnId; row: RowOf; settings: Settings; assets: AssetTables }>) {
  const { driver } = row;
  switch (id) {
    case 'position':
      return <span className="rl-pos">{driver.classPosition ?? driver.position ?? ''}</span>;
    case 'number':
      return <span className="rl-num">#{driver.carNumber}</span>;
    case 'flag': {
      const url = flagUrl(assets, driver.ext.iracing?.flairId);
      return url === null ? <span /> : <img className="rl-flag" src={url} alt="" />;
    }
    case 'name':
      return (
        <span className="rl-name">
          {driverName(driver, settings.nameFormat)}
          {settings.showPitBadge && row.inPit && <b className="rl-pit">PIT</b>}
          {settings.showLapMarks && (row.lapping || row.lapped) && (
            <b className="rl-lap">{row.lapping ? '+1 L' : '-1 L'}</b>
          )}
        </span>
      );
    case 'brand': {
      const url = carLogoUrl(assets, driver.carId);
      return url === null ? <span /> : <img className="rl-brand" src={url} alt="" />;
    }
    case 'licence': {
      const licence = driver.ext.iracing?.license;
      if (!licence || licence.safetyRating === null) return <span />;
      return (
        <span className="rl-lic" style={licence.color ? ({ '--lic': licence.color } as CSSProperties) : undefined}>
          {licence.className}
          {licence.safetyRating.toFixed(1)}
        </span>
      );
    }
    case 'rating': {
      const iracing = driver.ext.iracing;
      if (!iracing || iracing.iRating === null) return <span />;
      const change = iracing.iRatingChange;
      return (
        <span className="rl-ir">
          <span>{ratingText(iracing.iRating, settings.ratingFormat === 'compact')}</span>
          {change !== null && change !== 0 && (
            <span className={change > 0 ? 'b-good rl-ir-change' : 'b-bad rl-ir-change'}>
              {change > 0 ? <ChevronUp /> : <ChevronDown />}
              {Math.abs(change)}
            </span>
          )}
        </span>
      );
    }
    case 'gap':
      return <span className="rl-gap">{relativeGapText(row.seconds, row.isReference)}</span>;
  }
}
