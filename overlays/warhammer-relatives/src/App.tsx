import type { CSSProperties, ReactNode } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import {
  buildRelatives,
  type RelativeRow,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import { Brand } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Brand';
import {
  formatIRating,
  formatLicence,
  formatName,
  formatRelative,
  safeColor,
  textOn,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/format.ts';
import {
  InfoStrip,
  type InfoId,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/InfoStrip';
import { Root } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import {
  lapCounterText,
  sessionClockText,
  sessionWord,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/sessionInfo.ts';
import {
  useNow,
  useOverlay,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/useOverlay';
import type { Settings } from './racelink-settings';

type Column = Settings['columns'][number]['id'];

const renderHz = 15;

const widths: Readonly<Record<Column, string>> = {
  position: '1.8em',
  number: '3.2em',
  name: 'minmax(5em, 1fr)',
  brand: '1.5em',
  pitLap: '2.9em',
  ratings: 'max-content',
  time: '3.6em',
};

type CarRow = Extract<RelativeRow, { kind: 'car' }>;

function Cell({
  column,
  row,
  settings,
  isTeam,
}: Readonly<{ column: Column; row: CarRow; settings: Settings; isTeam: boolean }>): ReactNode {
  const { driver } = row;
  const iracing = driver.ext.iracing;
  switch (column) {
    case 'position':
      return <span className="wh-mono wh-pos">{driver.classPosition ?? driver.position ?? ''}</span>;
    case 'number':
      return <span className="wh-mono wh-num-car">#{driver.carNumber}</span>;
    case 'name':
      return (
        <span className="wh-name wh-ellipsis">
          {isTeam && driver.teamName !== ''
            ? driver.teamName
            : formatName(driver, settings.nameFormat)}
          {settings.showPit && row.inPit && !row.isReference && (
            <span className="wh-tag wh-tag--pit wh-label wh-pit-tag">PIT</span>
          )}
        </span>
      );
    case 'brand':
      return <Brand carId={driver.carId} carName={driver.carName} />;
    case 'pitLap':
      return driver.pit.lastStopLap === null ? (
        <span />
      ) : (
        <span className="wh-tag wh-tag--lap wh-mono">L{driver.pit.lastStopLap}</span>
      );
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
    case 'time':
      return (
        <span className="wh-mono wh-time">
          {formatRelative(
            row.seconds === null ? null : -row.seconds,
            settings.timeDecimals,
            settings.signedTime,
          )}
        </span>
      );
  }
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings, editMode } = useOverlay(overlay, renderHz);
  const now = useNow(1000);
  const { session, drivers } = telemetry;

  const referenceCarIdx = session.focusedCarIdx ?? session.playerCarIdx;
  const reference = drivers.find((driver) => driver.carIdx === referenceCarIdx);
  const rows = buildRelatives({
    drivers,
    referenceCarIdx,
    sessionType: session.type,
    playerOnTrack: telemetry.car.isOnTrack,
    options: { rows: settings.rows, excludePit: settings.excludePit, loneQualify: settings.loneQualify },
  });
  if (rows.length === 0)
    return editMode ? (
      <Root theme={settings.theme} opacity={settings.opacity} fontSize={settings.fontSize}>
        <div className="wh-empty wh-dim">Waiting for the session</div>
      </Root>
    ) : null;

  const columns = settings.columns.filter((column) => column.visible).map((column) => column.id);
  const template = columns.map((column) => widths[column]).join(' ');
  const competitors = drivers.filter((driver) => !driver.isPaceCar && !driver.isSpectator).length;

  return (
    <Root theme={settings.theme} opacity={settings.opacity} fontSize={settings.fontSize} className="wh-relatives">
      <div className="wh-panel">
        {settings.showHeader && (
          <div className="wh-head">
            <InfoStrip
              items={settings.headerItems as readonly Readonly<{ id: InfoId; visible: boolean }>[]}
              context={{
                telemetry,
                tempUnit: settings.tempUnit,
                clockMode: settings.clockMode,
                lapDecimals: settings.lapDecimals,
                lap: reference?.lap ?? null,
                drivers: competitors,
                clockSource: settings.clockSource,
                hour12: settings.hour12,
                now,
              }}
            />
          </div>
        )}
        <div className="wh-rows">
          {rows.map((row) => {
            if (row.kind === 'empty')
              return <div key={`empty-${String(row.index)}`} className="wh-row wh-row--empty" />;
            const tone = row.isReference
              ? 'wh-row--ref'
              : settings.colorByLap && row.lapping
                ? 'wh-row--lapping'
                : settings.colorByLap && row.lapped
                  ? 'wh-row--lapped'
                  : '';
            const dim = settings.showPit && row.inPit && !row.isReference ? 'wh-row--pit' : '';
            return (
              <div
                key={row.driver.carIdx}
                className={`wh-row ${tone} ${dim}`}
                style={{ gridTemplateColumns: template }}
              >
                {columns.map((column) => (
                  <Cell
                    key={column}
                    column={column}
                    row={row}
                    settings={settings}
                    isTeam={session.isTeamRacing === true}
                  />
                ))}
              </div>
            );
          })}
        </div>
        {settings.showFooter && (
          <div className="wh-foot">
            <span>
              <span className="wh-dim">Lap </span>
              <span className="wh-mono">
                {lapCounterText(reference?.lap ?? null, session, settings.lapDecimals)}
              </span>
            </span>
            <span>
              <span className="wh-dim">{sessionWord(session.type)} </span>
              <span className="wh-mono">{sessionClockText(session, settings.clockMode)}</span>
            </span>
          </div>
        )}
      </div>
    </Root>
  );
}
