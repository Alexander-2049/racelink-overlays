import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { assetUrls, type RacelinkOverlay } from '@racelink/overlay';
import { Asset } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/Asset';
import { driverInfo } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/driverInfo';
import { referenceCarIdx } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/driverMarks.ts';
import {
  formatGapTime,
  formatRating,
  formatSof,
  formatTemperature,
} from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/format.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import {
  buildRelatives,
  type RelativeRow,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common';
import type { Settings } from './racelink-settings';

type ColumnId = Settings['columns'][number]['id'];
type HeaderId = Settings['headerItems'][number]['id'];
type CarRow = Extract<RelativeRow, { kind: 'car' }>;

const renderHz = 6;

const widths: Readonly<Record<ColumnId, string>> = {
  classStripe: '0.3em',
  position: '2.2em',
  number: '3.2em',
  name: 'minmax(6em, 1fr)',
  flag: '1.7em',
  brand: '1.6em',
  pit: '4.6em',
  licence: '3.2em',
  rating: '3.3em',
  ratingChange: '3em',
  gap: '3.6em',
};

/** The time of day as a clock, 24 or 12 hours. */
const clockText = (seconds: number, twelve: boolean): string => {
  const total = Math.floor(seconds) % 86400;
  const hours = Math.floor(total / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  if (!twelve) return `${String(hours).padStart(2, '0')}:${minutes}`;
  return `${String(hours % 12 === 0 ? 12 : hours % 12)}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
};

const cell = (column: ColumnId, row: CarRow, settings: Settings, isTeamRacing: boolean | null): ReactNode => {
  const { driver } = row;
  const info = driverInfo(driver, settings.nameFormat, isTeamRacing);
  switch (column) {
    case 'classStripe':
      return <span key={column} className="rl-stripe" style={{ background: driver.classColor }} />;
    case 'position':
      return (
        <span key={column} className="rl-pos">
          {driver.classPosition ?? driver.position ?? ''}
        </span>
      );
    case 'number':
      return (
        <span key={column} className="rl-num">
          {info.carNumber === '' ? '' : `#${info.carNumber}`}
        </span>
      );
    case 'name':
      return (
        <span key={column} className="rl-name">
          {info.name}
        </span>
      );
    case 'flag':
      return info.countryCode === null ? (
        <span key={column} />
      ) : (
        <Asset key={column} className="an-pic rl-pic" src={assetUrls.flag(info.countryCode)} />
      );
    case 'brand':
      return info.brand === null ? (
        <span key={column} />
      ) : (
        <Asset key={column} className="an-pic rl-pic" src={assetUrls.carLogo(info.brand)} />
      );
    case 'pit': {
      if (row.inPit)
        return (
          <span key={column} className="rl-pitcell">
            <span className="rl-chip rl-pit">PIT</span>
          </span>
        );
      const since = driver.pit.lapsSinceExit;
      return (
        <span key={column} className="rl-pitcell">
          {since !== null && <span className="rl-chip rl-since">{`L${String(since)}`}</span>}
        </span>
      );
    }
    case 'licence':
      return (
        <span key={column} className="rl-chipcell">
          {info.licence !== null && (
            <span className="an-chip an-lic" style={{ background: info.licence.color }}>
              {info.licence.text}
            </span>
          )}
        </span>
      );
    case 'rating':
      return (
        <span key={column} className="rl-chipcell">
          {info.rating !== null && <span className="an-chip an-ir">{formatRating(info.rating)}</span>}
        </span>
      );
    case 'ratingChange': {
      const change = info.ratingChange;
      return (
        <span key={column} className={`rl-rc ${change !== null && change < 0 ? 'down' : 'up'}`}>
          {change === null || change === 0 ? '' : `${change > 0 ? '+' : '−'}${String(Math.abs(change))}`}
        </span>
      );
    }
    case 'gap':
      return (
        <span key={column} className="rl-gap">
          {row.seconds === null ? '' : formatGapTime(row.seconds, settings.gapDecimals)}
        </span>
      );
  }
};

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings } = useOverlay(overlay, renderHz);
  const { session, drivers, weather, car } = telemetry;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const refIdx = referenceCarIdx(session);
  const rows = buildRelatives({
    drivers,
    referenceCarIdx: refIdx,
    sessionType: session.type,
    playerOnTrack: car.isOnTrack,
    options: { rows: settings.rows, excludePit: settings.excludePit, loneQualify: settings.loneQualify },
  });
  const columns = settings.columns.filter((column) => column.visible).map((column) => column.id);
  const template = columns.map((column) => widths[column]).join(' ');
  const imperial =
    settings.temperatureUnit === 'AUTO' ? session.displayUnits === 'imperial' : settings.temperatureUnit === 'F';
  const incidents = session.ext.iracing?.incidents;

  const headerCell = (id: HeaderId): ReactNode => {
    switch (id) {
      case 'trackTemp':
        return weather.trackTemperatureC === null ? null : (
          <span key={id}>{`T ${formatTemperature(weather.trackTemperatureC, imperial)}`}</span>
        );
      case 'airTemp':
        return weather.airTemperatureC === null ? null : (
          <span key={id}>{`A ${formatTemperature(weather.airTemperatureC, imperial)}`}</span>
        );
      case 'sof':
        return session.strengthOfField === null ? null : (
          <span key={id}>{`SOF ${formatSof(session.strengthOfField)}`}</span>
        );
      case 'incidents':
        return incidents?.count === null || incidents === undefined ? null : (
          <span key={id}>{`✕ ${String(incidents.count)}`}</span>
        );
      case 'clock': {
        const seconds =
          settings.clockSource === 'GAME'
            ? session.timeOfDaySeconds
            : now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        return seconds === null ? null : (
          <span key={id} className="rl-clock">
            {clockText(seconds, settings.clock12h)}
          </span>
        );
      }
    }
  };
  const items = settings.headerItems.filter((item) => item.visible).map((item) => headerCell(item.id));

  const style = {
    '--an-size': `${String(settings.fontSize)}px`,
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
    '--cols': template,
  } as CSSProperties;

  return (
    <div className="an rl-root" data-theme={settings.theme} style={style}>
      <div className="an-panel rl-panel" data-accent={settings.accentLine ? 'on' : 'off'}>
        {settings.showHeader && <div className="rl-header">{items}</div>}
        {rows.map((row) =>
          row.kind === 'empty' ? (
            <div key={`empty${String(row.index)}`} className="rl-row rl-empty" />
          ) : (
            <div
              key={row.driver.carIdx}
              className={`rl-row ${row.isReference ? 'own' : ''} ${
                settings.lapColors && row.lapping ? 'lapping' : ''
              } ${settings.lapColors && row.lapped ? 'lapped' : ''} ${row.inPit && !row.isReference ? 'inpit' : ''}`}
            >
              {columns.map((column) => cell(column, row, settings, session.isTeamRacing))}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

