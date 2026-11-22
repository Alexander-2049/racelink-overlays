import type { RacelinkOverlay } from '@racelink/overlay';
import { useRef, type CSSProperties, type ReactNode } from 'react';
import type { DriverTelemetry } from '../../../racelink/src/shared/overlay-api/fields/drivers';
import { carLogoUrl, flagUrl, useAssetTables } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/assets';
import type { AssetTables } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/assetTables.ts';
import { standingsColumnHasData } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/columnData.ts';
import { alignStyle, fitBoardAttribute, fitRowAttribute, useFitBoard } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useFitBoard.ts';
import { ghostStyle, rowKeyAttribute, useTableMotion } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/useTableMotion.ts';
import type { Box } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/motion/rowPlan.ts';
import {
  AirIcon,
  CarsIcon,
  ChevronDown,
  ChevronUp,
  DropIcon,
  InfinityIcon,
  TrackIcon,
  TyreDry,
  TyreWet,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/icons';
import {
  deltaText,
  driverName,
  gapSeconds,
  lapTime,
  percentText,
  ratingText,
  temperatureText,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/format.ts';
import {
  buildStandingsView,
  referenceCarIdx,
  type ClassHeader,
  type StandingsGroupView,
  type StandingsRowView,
} from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/standingsView.ts';
import { themeVars } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/themes.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/useOverlay';
import { SessionPhaseTracker, type GapCell } from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import type { Settings } from './racelink-settings';

type Overlay = RacelinkOverlay<Settings>;
type ColumnId = Settings['columns'][number]['id'];
type HeaderId = Settings['headerColumns'][number]['id'];

/** Width of each column in letter widths (the name's comes from the settings). */
const widths: Readonly<Record<Exclude<ColumnId, 'name'>, number>> = {
  position: 1.5,
  gain: 2.7,
  number: 2.5,
  flag: 1.5,
  team: 8,
  brand: 1.5,
  carName: 8,
  licence: 3.3,
  rating: 5.8,
  gap: 4.5,
  interval: 4.5,
  lapTime: 5.1,
  bestLap: 5.1,
  laps: 2.2,
  stops: 1.8,
  pit: 5.6,
  history: 0, // set from the number of laps
  tyre: 1.6,
};

const gapText = (cell: GapCell, digits: number, label: string): ReactNode => {
  switch (cell.kind) {
    case 'leader':
      return <span className="st-label">{label}</span>;
    case 'laps':
      return `+${String(cell.laps)} L`;
    case 'seconds':
      return gapSeconds(cell.seconds, digits);
    case 'none':
      return null;
  }
};

function Licence({ driver }: Readonly<{ driver: DriverTelemetry }>) {
  const licence = driver.ext.iracing?.license;
  if (!licence || licence.safetyRating === null) return null;
  const style = licence.color ? ({ '--lic': licence.color } as CSSProperties) : undefined;
  return (
    <span className="st-lic" style={style}>
      {licence.className}
      {licence.safetyRating.toFixed(1)}
    </span>
  );
}

function Rating({ driver, compact }: Readonly<{ driver: DriverTelemetry; compact: boolean }>) {
  const iracing = driver.ext.iracing;
  if (!iracing || iracing.iRating === null) return null;
  const change = iracing.iRatingChange;
  return (
    <span className="st-ir">
      <span className="st-ir-value">{ratingText(iracing.iRating, compact)}</span>
      {change !== null && change !== 0 && (
        <span className={change > 0 ? 'st-ir-change b-good' : 'st-ir-change b-bad'}>
          {change > 0 ? <ChevronUp /> : <ChevronDown />}
          {Math.abs(change)}
        </span>
      )}
    </span>
  );
}

type Context = Readonly<{
  settings: Settings;
  assets: AssetTables;
  digits: number;
  fahrenheit: boolean;
}>;

function Cell({ id, row, ctx }: Readonly<{ id: ColumnId; row: StandingsRowView; ctx: Context }>) {
  const { base, lapTime: lap, pit, history } = row;
  const { driver } = base;
  switch (id) {
    case 'position':
      return <span className="st-pos">{base.position}</span>;
    case 'gain': {
      const gain = base.positionChange;
      if (gain === null || gain === 0) return <span />;
      return (
        <span className={gain > 0 ? 'st-gain b-good' : 'st-gain b-bad'}>
          {gain > 0 ? <ChevronUp /> : <ChevronDown />}
          {Math.abs(gain)}
        </span>
      );
    }
    case 'number':
      return <span className="st-num">{driver.carNumber}</span>;
    case 'flag': {
      const url = flagUrl(ctx.assets, driver.ext.iracing?.flairId);
      return url === null ? <span /> : <img className="st-flag" src={url} alt="" />;
    }
    case 'name':
      return <span className="st-name">{driverName(driver, ctx.settings.nameFormat)}</span>;
    case 'team':
      return <span className="st-text b-dim">{driver.teamName}</span>;
    case 'brand': {
      const url = carLogoUrl(ctx.assets, driver.carId);
      return url === null ? <span /> : <img className="st-brand" src={url} alt="" />;
    }
    case 'carName':
      return <span className="st-text b-dim">{driver.carName}</span>;
    case 'licence':
      return <Licence driver={driver} />;
    case 'rating':
      return <Rating driver={driver} compact={ctx.settings.ratingFormat === 'compact'} />;
    case 'gap':
      return <span className="st-time">{gapText(base.gap, ctx.digits, 'GAP')}</span>;
    case 'interval':
      return <span className="st-time">{gapText(base.interval, ctx.digits, 'INT')}</span>;
    case 'lapTime': {
      const cls = lap.classBest ? 'st-lap is-class-best' : lap.personalBest ? 'st-lap is-best' : lap.stale ? 'st-lap is-stale' : 'st-lap';
      return <span className={cls}>{lapTime(lap.seconds)}</span>;
    }
    case 'bestLap':
      return <span className="st-lap">{lapTime(driver.bestLapSeconds)}</span>;
    case 'laps':
      return <span className="st-text">{driver.lapsCompleted}</span>;
    case 'stops':
      return <span className="st-text">{driver.pit.stops ?? ''}</span>;
    case 'pit':
      if (pit === null) return <span />;
      return pit.kind === 'in' ? (
        <span className="st-pit">
          <b className="b-warn">PIT</b>
          <span>{pit.seconds === null ? '' : Math.round(pit.seconds)}</span>
        </span>
      ) : (
        <span className="st-pit b-warn">
          <span>L{pit.lap}</span>
          <span>{pit.seconds === null ? '' : pit.seconds.toFixed(1)}</span>
        </span>
      );
    case 'history':
      return (
        <span className="st-history">
          {(history ?? Array.from({ length: ctx.settings.historyLaps }, () => null)).map((cell, at) => (
            // The cells are the last laps in order and never reorder.
            <span key={at} className={cell === null || cell.seconds === null ? '' : cell.seconds > 0 ? 'b-bad' : 'b-good'}>
              {cell === null ? <InfinityIcon /> : cell.seconds === null ? '' : deltaText(cell.seconds)}
            </span>
          ))}
        </span>
      );
    case 'tyre':
      return (
        <span className="st-tyre b-dim">
          {driver.tyreCompound === null ? null : driver.tyreCompound === 1 ? <TyreWet /> : <TyreDry />}
        </span>
      );
  }
};

function Header({
  header,
  isFirst,
  order,
  ctx,
}: Readonly<{ header: ClassHeader; isFirst: boolean; order: readonly HeaderId[]; ctx: Context }>) {
  const parts: ReactNode[] = [];
  const add = (key: string, node: ReactNode): void => {
    parts.push(
      <span key={key} className="st-h-item">
        {node}
      </span>,
    );
  };
  for (const id of order) {
    switch (id) {
      case 'session':
        if (isFirst && header.sessionLetter !== '') add(id, <b className="st-h-letter">{header.sessionLetter}</b>);
        break;
      case 'class':
        add(id, <b className="st-h-class" style={{ '--cls': header.color } as CSSProperties}>{header.className}</b>);
        break;
      case 'laps':
        if (header.lap !== null)
          add(id, header.lapsTotal === '' ? String(header.lap) : `${String(header.lap)}/${header.lapsTotal}`);
        break;
      case 'time':
        if (isFirst && header.time !== '')
          add(id, header.timeTotal === '' ? header.time : `${header.time}/${header.timeTotal}`);
        break;
      case 'sof':
        if (header.strengthOfField !== null) add(id, `SOF ${String(header.strengthOfField)}`);
        break;
      case 'airTemp':
        if (isFirst && header.airC !== null)
          add(id, <><AirIcon />{temperatureText(header.airC, ctx.fahrenheit)}</>);
        break;
      case 'trackTemp':
        if (isFirst && header.trackC !== null)
          add(id, <><TrackIcon />{temperatureText(header.trackC, ctx.fahrenheit)}</>);
        break;
      case 'humidity':
        if (isFirst && header.humidity !== null) add(id, <><DropIcon />{percentText(header.humidity)}</>);
        break;
      case 'drivers':
        add(id, <><CarsIcon />{header.driverCount}</>);
        break;
    }
  }
  if (parts.length === 0) return null;
  return <div className="st-header">{parts}</div>;
}

/** A row of the table with the group it is in: what motion keeps to draw a row that left. */
type Entry = Readonly<{ group: StandingsGroupView; row: StandingsRowView; at: number }>;

const entryKey = (entry: Entry): string => String(entry.row.base.driver.carIdx);

function Row({
  entry,
  columns,
  template,
  ctx,
  ghost,
}: Readonly<{ entry: Entry; columns: readonly ColumnId[]; template: string; ctx: Context; ghost?: Box }>) {
  const { group, row, at } = entry;
  const { base } = row;
  const classes = [
    'st-row',
    at % 2 === 1 ? 'is-alt' : '',
    base.isReference ? 'is-ref' : '',
    ctx.settings.condensed && group.cutBelow[at] === true ? 'is-cut' : '',
  ]
    .filter((name) => name !== '')
    .join(' ');
  const marks = {
    [rowKeyAttribute]: entryKey(entry),
    ...(ghost === undefined ? { [fitRowAttribute]: '' } : { 'data-fx-ghost': '' }),
  };
  return (
    <div
      className={classes}
      style={{ gridTemplateColumns: template, ...(ghost === undefined ? undefined : ghostStyle(ghost)) }}
      {...marks}
    >
      {columns.map((id) => (
        <Cell key={id} id={id} row={row} ctx={ctx} />
      ))}
    </div>
  );
}

function Group({
  group,
  entries,
  columns,
  template,
  headerOrder,
  showHeader,
  ctx,
}: Readonly<{
  group: StandingsGroupView;
  entries: readonly Entry[];
  columns: readonly ColumnId[];
  template: string;
  headerOrder: readonly HeaderId[];
  showHeader: boolean;
  ctx: Context;
}>) {
  return (
    <section className="st-group">
      {showHeader && <Header header={group.header} isFirst={group.isFirst} order={headerOrder} ctx={ctx} />}
      {entries.map((entry) => (
        <Row key={entryKey(entry)} entry={entry} columns={columns} template={template} ctx={ctx} />
      ))}
    </section>
  );
}

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings, editMode } = useOverlay(overlay, 10);
  const assets = useAssetTables();
  const tracker = useRef(new SessionPhaseTracker());
  const { drivers, session, weather } = telemetry;

  const referenceIdx = referenceCarIdx(drivers);
  const leaderLaps = Math.max(0, ...drivers.filter((driver) => !driver.isPaceCar).map((driver) => driver.lapsCompleted));
  const phase = tracker.current.update({
    session,
    reference: drivers.find((driver) => driver.carIdx === referenceIdx),
    leaderLapsCompleted: leaderLaps,
  });

  const configured = settings.columns.filter((column) => column.visible).map((column) => column.id);
  const historyLaps = Math.max(1, Math.round(settings.historyLaps));
  const fit = useFitBoard(configured.join(), 10, 1);
  const groups = buildStandingsView({
    drivers,
    session,
    weather,
    phase,
    options: {
      topRows: settings.topRows,
      bottomRows: settings.bottomRows,
      numClasses: settings.numClasses,
      multiclassRows: settings.multiclassRows,
      condensed: settings.condensed,
      maxRows: fit.capacity,
    },
    lapTimeSource: settings.lapTimeSource,
    historyLimit: historyLaps,
  });
  const ctx: Context = {
    settings,
    assets,
    digits: Number(settings.gapDigits),
    fahrenheit: settings.temperatureUnit === 'f',
  };
  const headerOrder = settings.headerColumns.filter((column) => column.visible).map((column) => column.id);
  const pictures = {
    flag: (id: number | null | undefined) => flagUrl(assets, id) !== null,
    brand: (id: number | null | undefined) => carLogoUrl(assets, id ?? null) !== null,
  };
  const entries: Entry[] = groups.flatMap((group) => group.rows.map((row, at) => ({ group, row, at })));
  const motion = useTableMotion({
    items: entries,
    getKey: entryKey,
    columns: configured,
    hasData: (id, entry) => standingsColumnHasData(id, entry.row, pictures),
    animations: settings.animations,
    hideEmpty: settings.hideEmptyColumns,
    ghosts: true,
  });
  const columns = motion.columns;
  const template = columns
    .map((id) => {
      if (id === 'name') return `minmax(${String(settings.nameWidth)}em, 1fr)`;
      if (id === 'history') return motion.track(id, `${String(historyLaps * 2.6)}em`);
      return motion.track(id, `${String(widths[id])}em`);
    })
    .join(' ');

  return (
    <div
      className="b-root st-root"
      style={{ ...themeVars(settings.theme, settings.opacity), fontSize: `${String(settings.fontSize)}px` } as CSSProperties}
    >
      <div ref={fit.ref} style={{ ...fit.style, ...alignStyle(settings.align) }}>
        <div {...{ [fitBoardAttribute]: '' }}>
          <div className="st-table" ref={motion.rootRef}>
            {groups.map((group) => (
              <Group
                key={group.header.className + String(group.isFirst)}
                group={group}
                entries={entries.filter((entry) => entry.group === group)}
                columns={columns}
                template={template}
                headerOrder={headerOrder}
                showHeader={settings.showHeaders}
                ctx={ctx}
              />
            ))}
            {motion.ghosts.map((ghost) => (
              <Row key={"gone" + ghost.key} entry={ghost.item} columns={columns} template={template} ctx={ctx} ghost={ghost.box} />
            ))}
            {groups.length === 0 && editMode && <div className="b-hint b-panel">Standings appear when a session has cars.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
