import { useEffect, useRef } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { str } from '../r-common/rSettings';
import { drawFeng, type Running } from '../nfsmw-common/feng';
import { hudObjects, type HudObjectName } from '../nfsmw-common/hud/hudSingleRace';
import {
  competitors,
  followedDriver,
  formatTime,
  RaceClock,
  type Driver,
} from '../nfsmw-common/race';
import { commonTexture } from '../nfsmw-common/textures';
import { useStageCanvas, type Stage } from '../nfsmw-common/useStageCanvas';

const topics: readonly TelemetryTopic[] = ['connection', 'session', 'timing', 'drivers'];

/** The top right of the game's screen: position, race time, lap and the four rows. */
const stage: Stage = { x: 230, y: -220, width: 200, height: 144 };
const roots: readonly HudObjectName[] = ['status', 'timerGlow', 'rows'];

/** Names show for a while, then the distances do, then the names again. */
const flipMs = 3000;
const disappearMs = 160;
/** How long the race time blinks after a lap. */
const pulseMs = 2400;
const metersToFeet = 3.28084;

/** What a row shows. */
interface Row {
  readonly carIdx: number;
  readonly number: string;
  readonly name: string;
  readonly gap: string;
  readonly followed: boolean;
}

interface Board {
  readonly position: string;
  readonly racers: string;
  readonly raceTime: string;
  readonly laps: string;
  readonly rows: readonly Row[];
  /** Laps the followed car completed, to blink the time after each. */
  readonly carIdx: number;
  readonly lapsCompleted: number;
}

/** While the layout is edited without a race, the board shows a sample. */
const sample: Board = {
  position: '1',
  racers: '4',
  raceTime: '2:27.31',
  laps: '2/3',
  rows: [
    { carIdx: 0, number: '1', name: 'RAZOR', gap: '—', followed: true },
    { carIdx: 1, number: '2', name: 'BULL', gap: '-398 FT', followed: false },
    { carIdx: 2, number: '3', name: 'MING', gap: '-849 FT', followed: false },
    { carIdx: 3, number: '4', name: 'BARON', gap: 'K.O.', followed: false },
  ],
  carIdx: 0,
  lapsCompleted: 0,
};

const nameOf = (driver: Driver, format: string): string => {
  const name =
    format === 'first'
      ? driver.firstName || driver.name
      : format === 'full'
        ? driver.name
        : driver.lastName || driver.name;
  return name.toUpperCase();
};

/** NFSMW-Leaderboard: the game's race status at the top right of the screen. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const { session, timing, drivers } = overlay.telemetry;
  const clock = useRef(new RaceClock());
  const board = useRef<Board | null>(null);
  const animating = useRef(true);
  const pulse = useRef<{ carIdx: number; laps: number; at: number }>({
    carIdx: -1,
    laps: 0,
    at: Number.NEGATIVE_INFINITY,
  });

  const classMode = str(values, 'positionMode', 'overall') === 'class';
  const units = str(values, 'units', 'auto');
  const imperial = units === 'auto' ? session.displayUnits === 'imperial' : units === 'imperial';
  const nameFormat = str(values, 'nameFormat', 'last');

  clock.current.update(drivers, session.sessionTimeSeconds);
  const followed = followedDriver(drivers);
  let current: Board | null = null;
  if (followed) {
    const field = competitors(drivers).filter(
      (driver) => !classMode || driver.classId === followed.classId,
    );
    const positionOf = (driver: Driver) => (classMode ? driver.classPosition : driver.position);
    const trackMeters = session.trackLengthMeters;
    const gapOf = (driver: Driver): string => {
      if (driver.isOut) return 'K.O.';
      if (driver.carIdx === followed.carIdx) return '—';
      const meters =
        trackMeters !== null && trackMeters > 0
          ? (driver.raceDistanceLaps - followed.raceDistanceLaps) * trackMeters
          : driver.gaps.relativeMeters;
      if (meters === null) return '';
      // Behind in the order is minus, as the game shows it.
      const ownPosition = positionOf(followed);
      const theirs = positionOf(driver);
      const behind = ownPosition !== null && theirs !== null ? theirs > ownPosition : meters < 0;
      const value = Math.round(Math.abs(imperial ? meters * metersToFeet : meters));
      return `${behind ? '-' : '+'}${value.toLocaleString('en-US')} ${imperial ? 'FT' : 'M'}`;
    };
    // The followed car and the three nearest to it on the road, in race order.
    const nearest = field
      .filter((driver) => driver.carIdx !== followed.carIdx && positionOf(driver) !== null)
      .sort(
        (a, b) =>
          Math.abs(a.raceDistanceLaps - followed.raceDistanceLaps) -
          Math.abs(b.raceDistanceLaps - followed.raceDistanceLaps),
      )
      .slice(0, 3);
    const shown = [followed, ...nearest].sort(
      (a, b) => (positionOf(a) ?? Infinity) - (positionOf(b) ?? Infinity),
    );
    const lapsTotal = session.lapsTotal ?? session.estimatedTotalLaps;
    const lap = Math.max(1, followed.lap);
    current = {
      position: String(positionOf(followed) ?? '-'),
      racers: String(field.length),
      raceTime: formatTime(
        clock.current.elapsed(
          followed,
          session.sessionTimeSeconds,
          followed.isPlayer ? timing.lap.currentSeconds : null,
        ),
      ),
      laps:
        lapsTotal !== null && lapsTotal > 0
          ? `${String(Math.min(lap, Math.round(lapsTotal)))}/${String(Math.round(lapsTotal))}`
          : String(lap),
      rows: shown.map((driver) => ({
        carIdx: driver.carIdx,
        number: String(positionOf(driver) ?? '-'),
        name: nameOf(driver, nameFormat),
        gap: gapOf(driver),
        followed: driver.carIdx === followed.carIdx,
      })),
      carIdx: followed.carIdx,
      lapsCompleted: followed.lapsCompleted,
    };
  }
  const shownBoard = current ?? (overlay.editMode ? sample : null);
  // While the layout is edited the board stands still: it redraws only with new data.
  const animate = !overlay.editMode;
  useEffect(() => {
    board.current = shownBoard;
    animating.current = animate;
  });

  const { canvas, width, height } = useStageCanvas(stage, (context, now) => {
    const data = board.current;
    if (!data) return false;
    // A lap of the same car: the race time and its icon blink.
    const last = pulse.current;
    if (data.carIdx !== last.carIdx || data.lapsCompleted < last.laps)
      pulse.current = {
        carIdx: data.carIdx,
        laps: data.lapsCompleted,
        at: Number.NEGATIVE_INFINITY,
      };
    else if (data.lapsCompleted > last.laps)
      pulse.current = { carIdx: data.carIdx, laps: data.lapsCompleted, at: now };
    const sincePulse = now - pulse.current.at;
    const pulsing = sincePulse < pulseMs * 2;
    const cycle = now % (flipMs * 2);
    const showGaps = cycle >= flipMs;
    const inPhase = cycle % flipMs;
    const flip: Running =
      inPhase >= flipMs - disappearMs
        ? { script: 'disappear', elapsed: inPhase - (flipMs - disappearMs) }
        : { script: 'appear', elapsed: inPhase };

    const rowIndex = (name: string): number => Number(/^row(\d)/.exec(name)?.[1] ?? -1);
    drawFeng(context, hudObjects, roots, {
      texture: commonTexture,
      running: (name) => {
        if (pulsing && (name === 'raceTime' || name === 'timerIcon' || name === 'timerGlow'))
          return { script: 'pulse', elapsed: sincePulse };
        if (name.endsWith('Name')) return flip;
        if (name.endsWith('Back') && data.rows[rowIndex(name)]?.followed)
          return { script: 'highlight', elapsed: now };
        return null;
      },
      hidden: (name) => rowIndex(name) >= 0 && !data.rows[rowIndex(name)],
      text: (name) => {
        switch (name) {
          case 'position':
            return data.position;
          case 'racers':
            return data.racers;
          case 'raceTime':
            return data.raceTime;
          case 'laps':
            return data.laps;
          case 'lapLabel':
            return 'LAP';
          default: {
            const row = data.rows[rowIndex(name)];
            if (!row) return null;
            if (name.endsWith('Number')) return row.number;
            return showGaps ? row.gap : row.name;
          }
        }
      },
    });
    return animating.current;
  });

  return (
    <div className="nfsmwLeaderboard">
      <canvas ref={canvas} style={{ width, height }} />
    </div>
  );
}
