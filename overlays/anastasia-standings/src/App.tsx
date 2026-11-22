import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react';
import { assetUrls, type DriverTelemetry, type RacelinkOverlay } from '@racelink/overlay';
import { Asset } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/Asset';
import { driverInfo } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/driverInfo';
import {
  classBestLap,
  lapMark,
  referenceCarIdx,
} from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/driverMarks.ts';
import {
  formatClock,
  formatDelta,
  formatGapTime,
  formatLapTime,
  formatPitTime,
  formatRating,
  formatSof,
  formatTemperature,
  formatTotalTime,
  sessionLetter,
} from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/format.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import {
  buildStandings,
  gainHistory,
  SessionPhaseTracker,
  type GapCell,
  type StandingsRowModel,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common';
import { standingsColumnHasData } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/columnData.ts';
import { alignStyle, fitBoardAttribute, fitRowAttribute, useFitBoard } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useFitBoard.ts';
import { ghostStyle, rowKeyAttribute, useTableMotion } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useTableMotion.ts';
import type { Box } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/rowPlan.ts';
import type { Settings } from './racelink-settings';

type ColumnId = Settings['columns'][number]['id'];
type HeaderId = Settings['headerItems'][number]['id'];

/** A row with its place in its class: what motion keeps to draw a row that left. */
type Entry = Readonly<{ row: StandingsRowModel; at: number }>;

const renderHz = 10;
const infinity = '∞';

/** Width of each column; the name takes what is left. */
const widths: Readonly<Record<ColumnId, string>> = {
  position: '2.1em',
  classStripe: '0.3em',
  gain: '3.1em',
  number: '2.7em',
  flag: '1.7em',
  name: 'minmax(6em, 1fr)',
  brand: '1.6em',
  licence: '3.2em',
  rating: '3.3em',
  ratingChange: '3em',
  gap: '3.9em',
  int: '3.9em',
  lastLap: '4.3em',
  bestLap: '4.3em',
  pit: '6.4em',
  gainHistory: 'repeat(var(--gain-laps), 2.5em)',
};

function Chevron({ up }: Readonly<{ up: boolean }>) {
  return (
    <svg className="st-chevron" viewBox="0 0 10 10" aria-hidden="true">
      <path d={up ? 'M1.5 7 5 3 8.5 7' : 'M1.5 3 5 7 8.5 3'} />
    </svg>
  );
}

const gapText = (gap: GapCell, label: string, decimals: number): ReactNode => {
  switch (gap.kind) {
    case 'leader':
      return <span className="st-dim">{label}</span>;
    case 'laps':
      return `${String(gap.laps)}L`;
    case 'seconds':
      return formatGapTime(gap.seconds, decimals);
    case 'none':
      return '';
  }
};

type Context = Readonly<{
  settings: Settings;
  reference: DriverTelemetry | undefined;
  isTeamRacing: boolean | null;
  classes: readonly Readonly<{ classId: number | null; bestLapSeconds: number | null }>[];
  showLaps: boolean;
}>;

const cell = (column: ColumnId, row: StandingsRowModel, ctx: Context): ReactNode => {
  const { driver } = row;
  const { settings } = ctx;
  const info = driverInfo(driver, settings.nameFormat, ctx.isTeamRacing);
  switch (column) {
    case 'position':
      return (
        <span key={column} className="st-pos">
          {row.position}
        </span>
      );
    case 'classStripe':
      return <span key={column} className="st-stripe" style={{ background: driver.classColor }} />;
    case 'gain': {
      const change = row.positionChange;
      return (
        <span key={column} className={`st-gain ${change !== null && change > 0 ? 'up' : 'down'}`}>
          {change !== null && change !== 0 && (
            <>
              <Chevron up={change > 0} />
              <span>{Math.abs(change)}</span>
            </>
          )}
        </span>
      );
    }
    case 'number':
      return (
        <span key={column} className="st-num">
          {info.carNumber}
        </span>
      );
    case 'flag':
      return info.countryCode === null ? (
        <span key={column} />
      ) : (
        <Asset key={column} className="an-pic st-flag" src={assetUrls.flag(info.countryCode)} />
      );
    case 'name':
      return (
        <span key={column} className="st-name">
          {info.name}
        </span>
      );
    case 'brand':
      return info.brand === null ? (
        <span key={column} />
      ) : (
        <Asset key={column} className="an-pic st-brand" src={assetUrls.carLogo(info.brand)} />
      );
    case 'licence':
      return (
        <span key={column} className="st-chipcell">
          {info.licence !== null && (
            <span className="an-chip an-lic" style={{ background: info.licence.color }}>
              {info.licence.text}
            </span>
          )}
        </span>
      );
    case 'rating':
      return (
        <span key={column} className="st-chipcell">
          {info.rating !== null && <span className="an-chip an-ir">{formatRating(info.rating)}</span>}
        </span>
      );
    case 'ratingChange': {
      const change = info.ratingChange;
      return (
        <span key={column} className={`st-rc ${change !== null && change < 0 ? 'down' : 'up'}`}>
          {change === null || change === 0 ? '' : `${change > 0 ? '+' : '−'}${String(Math.abs(change))}`}
        </span>
      );
    }
    case 'gap':
      return (
        <span key={column} className="st-time">
          {gapText(row.gap, 'GAP', settings.gapDecimals)}
        </span>
      );
    case 'int':
      return (
        <span key={column} className="st-time">
          {gapText(row.interval, 'INT', settings.gapDecimals)}
        </span>
      );
    case 'lastLap': {
      const mark = settings.markLaps ? lapMark(driver, classBestLap(ctx.classes, driver.classId)) : null;
      return (
        <span key={column} className={`st-time st-lap ${mark ?? ''}`}>
          {ctx.showLaps && driver.lastLapSeconds !== null
            ? formatLapTime(driver.lastLapSeconds, settings.lapDecimals)
            : ''}
        </span>
      );
    }
    case 'bestLap':
      return (
        <span key={column} className="st-time">
          {driver.bestLapSeconds === null ? '' : formatLapTime(driver.bestLapSeconds, settings.lapDecimals)}
        </span>
      );
    case 'pit': {
      if (row.pit !== 'none')
        return (
          <span key={column} className="st-pit">
            <span className="st-pitnow">PIT</span>
            <span className="st-ptime">{formatPitTime(driver.pit.timeInPitSeconds)}</span>
          </span>
        );
      const since = driver.pit.lapsSinceExit;
      return (
        <span key={column} className="st-pit">
          {since !== null && (
            <>
              <span className="st-since">{`L${String(since)}`}</span>
              <span className="st-ptime">
                {driver.pit.lastStopSeconds === null ? '' : formatPitTime(driver.pit.lastStopSeconds)}
              </span>
            </>
          )}
        </span>
      );
    }
    case 'gainHistory': {
      const laps = settings.gainLaps;
      if (row.isReference)
        return (
          <span key={column} className="st-hist-self" style={{ gridColumn: `span ${String(laps)}` }}>
            {infinity}
          </span>
        );
      const values = gainHistory(driver, ctx.reference, laps);
      const cells = values.length === 0 ? Array.from({ length: laps }, (): null => null) : values;
      return cells.map((value, at) => (
        <span
          // The lap slot is the identity: values are positional.
          key={`${column}${String(at)}`}
          className={`st-hist ${value === null ? '' : value > 0 ? 'faster' : 'slower'}`}
        >
          {formatDelta(value, 1)}
        </span>
      ));
    }
  }
};

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings } = useOverlay(overlay, renderHz);
  const configured = settings.columns.filter((column) => column.visible).map((column) => column.id);
  const fit = useFitBoard(configured.join(), 10, 1);
  const tracker = useRef(new SessionPhaseTracker());
  const { session, drivers, weather } = telemetry;
  const refIdx = referenceCarIdx(session);
  const reference = drivers.find((driver) => driver.carIdx === refIdx);
  const leaderLaps = drivers.reduce((most, driver) => Math.max(most, driver.lapsCompleted), 0);
  const phase = tracker.current.update({ session, reference, leaderLapsCompleted: leaderLaps });

  const groups = useMemo(
    () =>
      buildStandings({
        drivers,
        classes: session.classes,
        referenceCarIdx: refIdx,
        sessionType: session.type,
        phase,
        options: {
          topRows: settings.topRows,
          bottomRows: settings.bottomRows,
          numClasses: settings.numClasses,
          multiclassRows: settings.multiclassRows,
          condensed: settings.condensed,
          maxRows: fit.capacity,
        },
      }),
    [
      drivers,
      session.classes,
      session.type,
      refIdx,
      phase,
      settings.topRows,
      settings.bottomRows,
      settings.numClasses,
      settings.multiclassRows,
      settings.condensed,
      fit.capacity,
    ],
  );

  const imperial =
    settings.temperatureUnit === 'AUTO' ? session.displayUnits === 'imperial' : settings.temperatureUnit === 'F';
  const first = groups[0];
  const isRace = session.type === 'race';
  const lead = first?.rows.find((row) => row.position === 1)?.driver;
  const currentLap = isRace
    ? (lead?.lapsCompleted ?? leaderLaps) + (phase === 'grid' ? 0 : 1)
    : (reference?.lap ?? session.lap);
  const totalLaps = session.lapsTotal ?? session.estimatedTotalLaps;
  const lapsText =
    totalLaps === null
      ? String(currentLap)
      : session.lapsTotal === null
        ? `${String(currentLap)}/≈${totalLaps.toFixed(2)}`
        : `${String(currentLap)}/${String(totalLaps)}`;
  const timeText =
    settings.timeMode === 'REMAINING'
      ? formatClock(session.timeRemainingSeconds)
      : [formatClock(session.sessionTimeSeconds), formatTotalTime(session.sessionDurationSeconds)]
          .filter((part) => part !== '')
          .join('/');
  const incidents = session.ext.iracing?.incidents;
  const carCount = first?.driverCount ?? 0;
  const sof = first?.strengthOfField ?? session.strengthOfField;

  const headerCell = (id: HeaderId): ReactNode => {
    switch (id) {
      case 'session':
        return (
          <b key={id} className="st-h-session">
            {sessionLetter(session.type)}
          </b>
        );
      case 'class':
        return first === undefined || first.className === '' ? null : (
          <span key={id} style={{ color: first.color }}>
            {first.className}
          </span>
        );
      case 'laps':
        return <span key={id}>{lapsText}</span>;
      case 'time':
        return <span key={id}>{timeText}</span>;
      case 'airTemp':
        return weather.airTemperatureC === null ? null : (
          <span key={id}>{`A ${formatTemperature(weather.airTemperatureC, imperial)}`}</span>
        );
      case 'trackTemp':
        return weather.trackTemperatureC === null ? null : (
          <span key={id}>{`T ${formatTemperature(weather.trackTemperatureC, imperial)}`}</span>
        );
      case 'sof':
        return sof === null ? null : <span key={id}>{`SOF ${formatSof(sof)}`}</span>;
      case 'drivers':
        return carCount === 0 ? null : <span key={id}>{`${String(carCount)} cars`}</span>;
      case 'incidents':
        return incidents?.count === null || incidents === undefined ? null : (
          <span key={id}>{`✕ ${String(incidents.count)}${incidents.limit === null ? '' : `/${String(incidents.limit)}`}`}</span>
        );
    }
  };
  const headerItems = settings.headerItems.filter((item) => item.visible).map((item) => headerCell(item.id));

  const style = {
    '--an-size': `${String(settings.fontSize)}px`,
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
    '--gain-laps': String(settings.gainLaps),
  } as CSSProperties;
  const ctx: Context = {
    settings,
    reference,
    isTeamRacing: session.isTeamRacing,
    classes: session.classes,
    showLaps: phase !== 'grid' || !isRace,
  };

  const entries: Entry[] = groups.flatMap((group) => group.rows.map((row, at) => ({ row, at })));
  const motion = useTableMotion({
    items: entries,
    getKey: (entry) => String(entry.row.driver.carIdx),
    columns: configured,
    hasData: (id, entry) =>
      standingsColumnHasData(id, entry.row, {
        infoOf: (driver) => driverInfo(driver, settings.nameFormat, session.isTeamRacing),
        showLaps: ctx.showLaps,
        gainLaps: settings.gainLaps,
        reference,
      }),
    animations: settings.animations,
    hideEmpty: settings.hideEmptyColumns,
    ghosts: true,
  });
  const columns = motion.columns;
  const template = columns
    .map((column) =>
      column === 'gainHistory'
        ? `repeat(var(--gain-laps), ${motion.track(column, '2.5em')})`
        : motion.track(column, widths[column], '4em'),
    )
    .join(' ');
  const renderRow = (entry: Entry, ghost?: Box) => {
    const { row, at } = entry;
    return (
      <div
        key={ghost === undefined ? row.driver.carIdx : `gone${String(row.driver.carIdx)}`}
        className={`st-row ${row.isReference ? 'own' : ''} ${at % 2 === 1 ? 'odd' : ''} ${row.cutBelow ? 'cut' : ''}`}
        style={ghost === undefined ? undefined : ghostStyle(ghost)}
        {...{ [rowKeyAttribute]: String(row.driver.carIdx) }}
        {...(ghost === undefined ? { [fitRowAttribute]: '' } : { 'data-fx-ghost': '' })}
      >
        {columns.map((column) => cell(column, row, ctx))}
      </div>
    );
  };

  return (
    <div className="an st-root" data-theme={settings.theme} data-align={settings.align} style={style}>
      <div
        ref={fit.ref}
        style={{ ...fit.style, ...alignStyle(settings.align === 'BOTTOM' ? 'bottom' : 'top') }}
      >
      <div
        className="an-panel st-panel"
        data-accent={settings.accentLine ? 'on' : 'off'}
        ref={motion.rootRef}
        style={{ '--cols': template } as CSSProperties}
        {...{ [fitBoardAttribute]: '' }}
      >
        {settings.showHeader && <div className="st-header">{headerItems}</div>}
        {groups.map((group, groupAt) => (
          <div key={group.classId ?? 'none'} className="st-group">
            {groupAt > 0 && (
              <div className="st-classsep" style={{ color: group.color }}>
                {group.className}
              </div>
            )}
            {group.rows.map((row, at) => renderRow({ row, at }))}
          </div>
        ))}
        {motion.ghosts.map((ghost) => renderRow(ghost.item, ghost.box))}
      </div>
      </div>
    </div>
  );
}
