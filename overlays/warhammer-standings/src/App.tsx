import { useRef, type CSSProperties, type ReactNode } from 'react';
import type { DriverTelemetry, RacelinkOverlay } from '@racelink/overlay';
import {
  buildStandings,
  gainHistory,
  SessionPhaseTracker,
  type GapCell,
  type StandingsGroupModel,
  type StandingsRowModel,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import { Brand } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Brand';
import {
  formatGap,
  formatIRating,
  formatLapTime,
  formatLicence,
  formatName,
  formatPitTime,
  formatSof,
  safeColor,
  textOn,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/format.ts';
import { IconTrendDown, IconTrendUp } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Icons';
import {
  InfoStrip,
  type InfoId,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/InfoStrip';
import { Root } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import {
  historyText,
  historyTone,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/sessionInfo.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/useOverlay';
import { standingsColumnHasData as columnHasData } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/columnData.ts';
import { fitBoardAttribute, fitRowAttribute, useFitBoard } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useFitBoard.ts';
import { ghostStyle, rowKeyAttribute, useTableMotion } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useTableMotion.ts';
import type { Box } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/rowPlan.ts';
import type { Settings } from './racelink-settings';

type Column = Settings['columns'][number]['id'];

/** A row with the group it is in: what motion keeps to draw a row that left. */
type Entry = Readonly<{ row: StandingsRowModel; at: number; cut: boolean }>;

const renderHz = 10;

/** Widths of the columns, in em of the overlay's font size. */
const widths: Readonly<Record<Column, string>> = {
  position: '1.7em',
  gain: '2.9em',
  classStripe: '0.35em',
  number: '2.7em',
  name: 'minmax(5em, 1fr)',
  brand: '1.5em',
  ratings: 'max-content',
  ratingChange: '2.6em',
  pitState: '2.4em',
  gap: '3.9em',
  interval: '3.6em',
  lapTime: '4.2em',
  pitLap: '2.7em',
  pitTime: '3em',
  gainHistory: 'max-content',
};

const gapText = (cell: GapCell, leaderLabel: string, decimals: number): string => {
  switch (cell.kind) {
    case 'leader':
      return leaderLabel;
    case 'laps':
      return `${String(cell.laps)}L`;
    case 'seconds':
      return formatGap(cell.seconds, decimals);
    case 'none':
      return '';
  }
};

function Cell({
  column,
  row,
  reference,
  settings,
  isRace,
  isTeam,
}: Readonly<{
  column: Column;
  row: StandingsRowModel;
  reference: DriverTelemetry | undefined;
  settings: Settings;
  isRace: boolean;
  isTeam: boolean;
}>): ReactNode {
  const { driver } = row;
  const iracing = driver.ext.iracing;
  switch (column) {
    case 'position':
      return <span className="wh-mono wh-pos">{row.position}</span>;
    case 'gain': {
      const change = row.positionChange;
      if (change === null || change === 0) return <span />;
      return (
        <span className={change > 0 ? 'wh-gain wh-good' : 'wh-gain wh-bad'}>
          {change > 0 ? <IconTrendUp /> : <IconTrendDown />}
          <span className="wh-mono">{Math.abs(change)}</span>
        </span>
      );
    }
    case 'classStripe':
      return <span className="wh-stripe" style={{ background: safeColor(driver.classColor, '#888') }} />;
    case 'number':
      return <span className="wh-mono wh-dim">#{driver.carNumber}</span>;
    case 'name':
      return (
        <span className="wh-name wh-ellipsis">
          {isTeam && driver.teamName !== ''
            ? driver.teamName
            : formatName(driver, settings.nameFormat)}
        </span>
      );
    case 'brand':
      return <Brand carId={driver.carId} carName={driver.carName} />;
    case 'ratings': {
      const licence = settings.showLicence
        ? formatLicence(iracing?.license, settings.licenceFormat)
        : '';
      const rating = settings.showIRating ? formatIRating(iracing?.iRating, settings.iRatingFormat) : '';
      if (licence === '' && rating === '') return <span />;
      const color = safeColor(iracing?.license.color, '#0153db');
      return (
        <span
          className="wh-pair wh-mono"
          style={{ '--wh-licence': color, '--wh-licence-fg': textOn(color) } as CSSProperties}
        >
          {licence !== '' && <span className="wh-licence">{licence}</span>}
          {rating !== '' && (
            <span className={licence === '' ? 'wh-irating wh-irating--solo' : 'wh-irating'}>
              {rating}
            </span>
          )}
        </span>
      );
    }
    case 'ratingChange': {
      const change = isRace ? iracing?.iRatingChange : null;
      if (change === null || change === undefined) return <span />;
      return (
        <span className={change >= 0 ? 'wh-mono wh-good' : 'wh-mono wh-bad'}>
          {change > 0 ? '+' : ''}
          {change}
        </span>
      );
    }
    case 'pitState':
      return row.pit === 'none' ? (
        <span />
      ) : (
        <span className="wh-tag wh-tag--pit wh-label">{row.pit === 'towing' ? 'TOW' : 'PIT'}</span>
      );
    case 'gap':
      return <span className="wh-mono wh-num">{gapText(row.gap, 'GAP', settings.gapDecimals)}</span>;
    case 'interval':
      return (
        <span className="wh-mono wh-num">{gapText(row.interval, 'INT', settings.gapDecimals)}</span>
      );
    case 'lapTime': {
      const seconds = isRace ? driver.lastLapSeconds : driver.bestLapSeconds;
      if (seconds === null) return <span />;
      let tone = '';
      if (settings.highlightBest && driver.bestLapSeconds === seconds) {
        tone = driver.hasClassBestLap || driver.hasSessionBestLap ? 'wh-bestlap' : 'wh-good';
      }
      return (
        <span className={`wh-mono wh-num ${tone}`}>{formatLapTime(seconds, settings.lapTimeDecimals)}</span>
      );
    }
    case 'pitLap':
      return driver.pit.lastStopLap === null ? (
        <span />
      ) : (
        <span className="wh-tag wh-tag--lap wh-mono">L{driver.pit.lastStopLap}</span>
      );
    case 'pitTime': {
      const live = driver.onPitRoad && driver.pit.timeInPitSeconds !== null;
      const seconds = live ? driver.pit.timeInPitSeconds : driver.pit.lastStopSeconds;
      return (
        <span className={live ? 'wh-mono wh-num wh-warn' : 'wh-mono wh-num wh-dim'}>
          {formatPitTime(seconds)}
        </span>
      );
    }
    case 'gainHistory': {
      const laps = Math.max(1, Math.round(settings.gainHistoryLaps));
      if (row.isReference)
        return (
          <span className="wh-history">
            {Array.from({ length: laps }, (_, index) => (
              <span key={index} className="wh-mono wh-dim">
                ∞
              </span>
            ))}
          </span>
        );
      const values = gainHistory(driver, reference, laps);
      return (
        <span className="wh-history">
          {Array.from({ length: laps }, (_, index) => {
            const value = values[index] ?? null;
            if (value === null) return <span key={index} className="wh-mono" />;
            const tone = historyTone(value);
            return (
              <span
                key={index}
                className={`wh-mono ${tone === 'quicker' ? 'wh-bad' : tone === 'slower' ? 'wh-good' : 'wh-dim'}`}
              >
                {historyText(value)}
              </span>
            );
          })}
        </span>
      );
    }
  }
}

function ClassHeader({ group }: Readonly<{ group: StandingsGroupModel }>) {
  const sof = group.strengthOfField === null ? '' : formatSof(group.strengthOfField);
  return (
    <div className="wh-classhead">
      <span className="wh-stripe" style={{ background: safeColor(group.color, '#888') }} />
      <span className="wh-label">{group.className}</span>
      {sof !== '' && <span className="wh-mono wh-dim">SOF {sof}</span>}
      <span className="wh-mono wh-dim">{group.driverCount}</span>
    </div>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings, editMode } = useOverlay(overlay, renderHz);
  const configured = settings.columns.filter((column) => column.visible).map((column) => column.id);
  const fit = useFitBoard(configured.join(), 10, 1);
  const tracker = useRef(new SessionPhaseTracker());
  const { session, drivers } = telemetry;

  const referenceCarIdx = session.focusedCarIdx ?? session.playerCarIdx;
  const reference = drivers.find((driver) => driver.carIdx === referenceCarIdx);
  const competitors = drivers.filter((driver) => !driver.isPaceCar && !driver.isSpectator);
  const phase = tracker.current.update({
    session,
    reference,
    leaderLapsCompleted: competitors.reduce((best, driver) => Math.max(best, driver.lapsCompleted), 0),
  });
  const groups = buildStandings({
    drivers,
    classes: session.classes,
    referenceCarIdx,
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
  });

  const isRace = session.type === 'race';
  const columnContext = {
    showLicence: settings.showLicence,
    showIRating: settings.showIRating,
    licenceFormat: settings.licenceFormat,
    iRatingFormat: settings.iRatingFormat,
    gainHistoryLaps: settings.gainHistoryLaps,
    isRace,
    reference,
  } as const;
  const entries: Entry[] = groups.flatMap((group) =>
    group.rows.map((row, at) => ({ row, at, cut: row.cutBelow })),
  );
  const motion = useTableMotion({
    items: entries,
    getKey: (entry) => String(entry.row.driver.carIdx),
    columns: configured,
    hasData: (id, entry) => columnHasData(id, entry.row, columnContext),
    animations: settings.animations,
    hideEmpty: settings.hideEmptyColumns,
    ghosts: true,
  });
  const columns = motion.columns;
  const template = columns
    .map((column) => motion.track(column, widths[column], column === 'ratings' ? '6.5em' : '5em'))
    .join(' ');
  const leader = competitors.find(
    (driver) =>
      driver.classId === reference?.classId && (driver.classPosition ?? driver.position) === 1,
  );
  const lap = isRace ? (leader?.lap ?? reference?.lap ?? null) : (reference?.lap ?? null);

  const renderRow = (entry: Entry, ghost?: Box) => {
    const { row } = entry;
    return (
      <div
        key={ghost === undefined ? row.driver.carIdx : `gone${String(row.driver.carIdx)}`}
        className={[
          'wh-row',
          row.isReference ? 'wh-row--ref' : '',
          row.cutBelow && settings.condensed ? 'wh-row--cut' : '',
        ].join(' ')}
        style={{ gridTemplateColumns: template, ...(ghost === undefined ? undefined : ghostStyle(ghost)) }}
        {...{ [rowKeyAttribute]: String(row.driver.carIdx) }}
        {...(ghost === undefined ? { [fitRowAttribute]: '' } : { 'data-fx-ghost': '' })}
      >
        {columns.map((column) => (
          <Cell
            key={column}
            column={column}
            row={row}
            reference={reference}
            settings={settings}
            isRace={isRace}
            isTeam={session.isTeamRacing === true}
          />
        ))}
      </div>
    );
  };
  const body =
    groups.length === 0 ? (
      editMode ? <div className="wh-empty wh-dim">Waiting for the session</div> : null
    ) : (
      groups.map((group) => (
        <section key={group.classId ?? 'none'} className="wh-group">
          {settings.classHeaders && groups.length > 1 && <ClassHeader group={group} />}
          {group.rows.map((row, at) => renderRow({ row, at, cut: row.cutBelow }))}
        </section>
      ))
    );
  if (body === null) return null;

  return (
    <Root theme={settings.theme} opacity={settings.opacity} fontSize={settings.fontSize} className="wh-standings">
      <div ref={fit.ref} style={fit.style}>
      <div className="wh-panel" ref={motion.rootRef} {...{ [fitBoardAttribute]: '' }}>
        {settings.showHeader && (
          <div className="wh-head">
            <InfoStrip
              items={settings.headerItems as readonly Readonly<{ id: InfoId; visible: boolean }>[]}
              context={{
                telemetry,
                tempUnit: settings.tempUnit,
                clockMode: settings.clockMode,
                lapDecimals: settings.lapDecimals,
                lap,
                drivers: competitors.length,
              }}
            />
          </div>
        )}
        {body}
        {motion.ghosts.map((ghost) => renderRow(ghost.item, ghost.box))}
      </div>
      </div>
    </Root>
  );
}
