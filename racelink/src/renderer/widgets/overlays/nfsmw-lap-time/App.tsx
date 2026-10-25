import { useEffect, useRef } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { bool, num, str } from '../r-common/rSettings';
import { drawFeng, type Running } from '../nfsmw-common/feng';
import { hudObjects, type HudObjectName } from '../nfsmw-common/hud/hudSingleRace';
import { followedDriver, formatGap, formatTime } from '../nfsmw-common/race';
import { commonTexture } from '../nfsmw-common/textures';
import { useStageCanvas, type Stage } from '../nfsmw-common/useStageCanvas';

const topics: readonly TelemetryTopic[] = ['connection', 'session', 'timing', 'drivers'];

/** The middle of the game's screen, under the mirror: where its messages show. */
const stage: Stage = { x: -200, y: -150, width: 400, height: 150 };
const roots: readonly HudObjectName[] = ['messages'];

type Kind = 'lap' | 'splitAhead' | 'splitBehind';
/** How long each message runs: the length of its script. */
const durationMs: Readonly<Record<Kind, number>> = {
  lap: 2400,
  splitAhead: 3200,
  splitBehind: 3200,
};
/** The lap time can come a moment after the line; past this the message shows what there is. */
const lapTimeWaitMs = 1500;
/** A larger step between two samples is a reset or a teleport: no split. */
const maxStep = 0.05;

interface Message {
  readonly kind: Kind;
  readonly text: string;
  readonly startedAt: number;
}

/** While the layout is edited a message stands, so it can be placed. */
const lapSample: Message = { kind: 'lap', text: 'LAP TIME\n1:13.41', startedAt: 0 };
const editElapsedMs = 1000;

/** A SPLIT TIME message as the split mode shows it, for a changed setting. */
const splitSample = (mode: string, startedAt: number): Message =>
  mode === 'best'
    ? { kind: 'splitAhead', text: 'SPLIT TIME\n- 0.42', startedAt }
    : { kind: 'splitBehind', text: 'SPLIT TIME\n- 1.25', startedAt };

/** NFSMW-Lap Time: the game's LAP TIME and SPLIT TIME messages. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const { session, timing, drivers } = overlay.telemetry;
  const message = useRef<Message | null>(null);
  const editing = useRef(false);
  const seen = useRef<{ carIdx: number; laps: number; fraction: number } | null>(null);
  const waitingLap = useRef<{ before: number | null; until: number } | null>(null);

  const showLapTime = bool(values, 'showLapTime', true);
  const splitsPerLap = Math.round(Math.min(6, Math.max(0, num(values, 'splitsPerLap', 3))));
  const modeSetting = str(values, 'splitMode', 'auto');
  const splitMode =
    modeSetting === 'auto' ? (session.type === 'race' ? 'leader' : 'best') : modeSetting;
  const followed = followedDriver(drivers);

  // Which message the edit mode holds open: the one whose settings changed last.
  const editSample = useRef<Message | null>(lapSample);
  useEffect(() => {
    editing.current = overlay.editMode;
  });

  // In demo and edit mode a changed setting shows its message at once, so the
  // change is seen: LAP TIME for its page, SPLIT TIME for its own.
  const lapKey = String(showLapTime);
  const splitKey = `${splitMode}:${String(splitsPerLap)}`;
  const shownKeys = useRef({ lapKey, splitKey });
  const previewing = overlay.demoMode || overlay.editMode;
  useEffect(() => {
    const before = shownKeys.current;
    shownKeys.current = { lapKey, splitKey };
    if (!previewing) return;
    const now = performance.now();
    if (before.lapKey !== lapKey) {
      editSample.current = showLapTime ? lapSample : null;
      message.current = showLapTime ? { ...lapSample, startedAt: now } : null;
    } else if (before.splitKey !== splitKey) {
      const shows = splitMode !== 'off' && splitsPerLap > 0;
      editSample.current = shows ? splitSample(splitMode, 0) : null;
      message.current = shows ? splitSample(splitMode, now) : null;
    }
  }, [lapKey, splitKey, previewing, showLapTime, splitMode, splitsPerLap]);

  useEffect(() => {
    if (!followed) {
      seen.current = null;
      return;
    }
    const now = performance.now();
    const show = (kind: Kind, text: string) => {
      message.current = { kind, text, startedAt: now };
    };
    const lastLap = followed.isPlayer
      ? (timing.lap.lastSeconds ?? followed.lastLapSeconds)
      : followed.lastLapSeconds;
    const previous = seen.current;
    seen.current = {
      carIdx: followed.carIdx,
      laps: followed.lapsCompleted,
      fraction: followed.lapDistanceFraction,
    };
    if (!previous || previous.carIdx !== followed.carIdx) {
      waitingLap.current = null;
      return;
    }
    if (followed.lapsCompleted > previous.laps)
      waitingLap.current = { before: lastLap, until: now + lapTimeWaitMs };
    const waiting = waitingLap.current;
    if (waiting && ((lastLap !== waiting.before && lastLap !== null) || now >= waiting.until)) {
      waitingLap.current = null;
      if (showLapTime && lastLap !== null && lastLap > 0)
        show('lap', `LAP TIME\n${formatTime(lastLap)}`);
      return;
    }
    // A split point passed on this lap.
    const from = previous.fraction;
    const to = followed.lapDistanceFraction;
    if (splitsPerLap === 0 || splitMode === 'off' || to <= from || to - from > maxStep) return;
    const crossed = Array.from(
      { length: splitsPerLap },
      (_, i) => (i + 1) / (splitsPerLap + 1),
    ).some((point) => from < point && to >= point);
    if (!crossed) return;
    // A split does not cut the lap time short.
    const showing = message.current;
    if (showing?.kind === 'lap' && now - showing.startedAt < durationMs.lap) return;
    let gap: number | null = null;
    let ahead = false;
    if (splitMode === 'best') {
      if (!followed.isPlayer || timing.lap.deltaToBestSeconds === null) return;
      gap = timing.lap.deltaToBestSeconds;
      ahead = gap < 0;
      show(
        ahead ? 'splitAhead' : 'splitBehind',
        `SPLIT TIME\n${ahead ? '-' : '+'} ${formatGap(gap)}`,
      );
      return;
    }
    // As in the game: the lead over second place, or the deficit to the leader.
    if (followed.classPosition === 1) {
      const second = drivers.find(
        (driver) => driver.classId === followed.classId && driver.classPosition === 2,
      );
      gap = second?.gaps.toAheadSeconds ?? null;
      ahead = true;
    } else gap = followed.gaps.toClassLeaderSeconds;
    if (gap === null || gap <= 0) return;
    show(
      ahead ? 'splitAhead' : 'splitBehind',
      `SPLIT TIME\n${ahead ? '+' : '-'} ${formatGap(gap)}`,
    );
  });

  const { canvas, width, height } = useStageCanvas(stage, (context, now) => {
    let current = message.current;
    let elapsed = current ? now - current.startedAt : 0;
    if (current && elapsed >= durationMs[current.kind]) {
      message.current = null;
      current = null;
    }
    const sample = editSample.current;
    if (!current && editing.current && sample) {
      current = sample;
      elapsed = editElapsedMs;
    }
    if (!current) return false;
    const shown = current;
    const running = (name: string): Running | null => {
      if (name === 'messageBody')
        return { script: shown.kind === 'lap' ? 'zoomin' : shown.kind, elapsed };
      if (shown.kind === 'lap' && name === 'messageIcon') return { script: 'lapIcon', elapsed };
      if (shown.kind === 'lap' && name === 'messageGlow') return { script: 'lapGlow', elapsed };
      return null;
    };
    drawFeng(context, hudObjects, roots, {
      texture: commonTexture,
      running,
      // The game puts the stopwatch on the message's icon.
      textureOf: (name) => (name === 'messageIcon' ? 'timer_icon' : null),
      text: (name) => (name === 'messageText' || name === 'messageShadow' ? shown.text : null),
    });
    // A message plays on; the sample of the edit mode stands still.
    return shown !== sample;
  });

  return (
    <div className="nfsmwLapTime">
      <canvas ref={canvas} style={{ width, height }} />
    </div>
  );
}
