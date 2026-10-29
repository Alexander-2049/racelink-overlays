import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { fxEvent, FxDetector, type FxEvent } from './events';
import { burstMs, FxLayer, type Burst } from './Fx';
import { Header } from './Header';
import { girlAspect, lookOf } from './mascot/looks';
import { Mascot } from './mascot/Mascot';
import { moodOf, reactionMs, type Mood } from './mascot/mood';
import { Petals } from './Petals';
import { isJapanese, mascotLine, sfxText, type FxKind } from './phrases';
import type { Settings } from './racelink-settings';
import { buildRows } from './relative';
import { Row, type ColumnId } from './Row';
import { useOverlay, type Overlay } from './useOverlay';

/** The board renders this often at most; effects run on every telemetry frame. */
const renderHz = 20;

const power: Readonly<Record<Settings['intensity'], number>> = { CHILL: 0.6, HYPE: 1, MAX: 1.7 };

/** In demo mode the board shows off its effects in turn. */
const showcase: readonly FxKind[] = ['pass', 'passed', 'battle', 'best', 'pass', 'passed'];
const showcaseMs = 4200;
const showcaseFirstMs = 2400;

const reactsTo = (settings: Settings, kind: FxKind): boolean => {
  switch (kind) {
    case 'pass':
      return settings.reactPass;
    case 'passed':
      return settings.reactPassed;
    case 'battle':
      return settings.reactBattle;
    case 'best':
      return settings.reactBest;
    case 'finish':
      return settings.reactFinish;
  }
};

/** Board motion of each moment; `amp` is in px at full intensity. */
const shakes: Readonly<Record<FxKind, Readonly<{ amp: number; ms: number; flash: string | null }>>> = {
  pass: { amp: 5, ms: 520, flash: 'rgba(255, 246, 200, 0.55)' },
  passed: { amp: 9, ms: 640, flash: 'rgba(255, 30, 70, 0.45)' },
  battle: { amp: 0, ms: 0, flash: null },
  best: { amp: 2, ms: 600, flash: 'rgba(200, 150, 255, 0.4)' },
  finish: { amp: 7, ms: 900, flash: 'rgba(255, 255, 255, 0.6)' },
};

const shakeFrames = (kind: FxKind, amp: number): Keyframe[] => {
  if (kind === 'pass' || kind === 'best')
    return [
      { transform: 'none' },
      { transform: `translate(0, ${String(-amp)}px) scale(1.035)` },
      { transform: `translate(${String(amp * 0.6)}px, ${String(amp * 0.4)}px) scale(0.99)` },
      { transform: `translate(${String(-amp * 0.4)}px, ${String(-amp * 0.2)}px)` },
      { transform: 'none' },
    ];
  const frames: Keyframe[] = [{ transform: 'none' }];
  for (let step = 0; step < 8; step += 1) {
    const fade = 1 - step / 8;
    const x = (step % 2 === 0 ? 1 : -1) * amp * fade;
    const y = (step % 3 === 0 ? -1 : 1) * amp * 0.35 * fade;
    frames.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(x * 0.12).toFixed(2)}deg)` });
  }
  frames.push({ transform: 'none' });
  return frames;
};

type Reaction = Readonly<{ mood: Mood; key: number; text: string; japanese: boolean }>;

/** Columns that only some games fill: hidden in the others, even when ticked. */
const columnFields: Readonly<Partial<Record<ColumnId, string>>> = {
  flag: 'drivers[].ext.iracing.flairId',
  licence: 'drivers[].ext.iracing.license',
  rating: 'drivers[].ext.iracing.iRating',
  ratingChange: 'drivers[].ext.iracing.iRatingChange',
};

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings, status } = useOverlay(overlay, renderHz);
  const [capacity, setCapacity] = useState(7);
  const [bursts, setBursts] = useState<readonly Burst[]>([]);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [finished, setFinished] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const lastEventAt = useRef(0);
  const timers = useRef(new Set<number>());

  const later = useCallback((ms: number, run: () => void) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      run();
    }, ms);
    timers.current.add(timer);
  }, []);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const game = overlay.game;
  const columns = useMemo(
    () =>
      settings.columns
        .filter((column) => column.visible)
        .map((column) => column.id as ColumnId)
        .filter((id) => {
          const field = columnFields[id];
          return field === undefined || game === null || overlay.supports(field);
        }),
    [settings.columns, game, overlay],
  );
  const rows = useMemo(
    () =>
      buildRows(telemetry, {
        capacity,
        nameFormat: settings.nameFormat,
        excludePit: settings.excludePit,
        battleGap: settings.battleGap,
      }),
    [telemetry, capacity, settings.nameFormat, settings.excludePit, settings.battleGap],
  );

  /** Plays one moment: explosion at the car's row, board shake, mascot reaction. */
  const play = useCallback(
    (event: FxEvent) => {
      const current = settingsRef.current;
      const board = boardRef.current;
      if (board === null) return;
      lastEventAt.current = performance.now();
      const strength = power[current.intensity] * (event.minor ? 0.5 : 1);
      const boardBox = board.getBoundingClientRect();
      const target =
        (event.carIdx === null ? null : board.querySelector(`[data-car="${String(event.carIdx)}"]`)) ??
        board.querySelector('.row.reference');
      const rowBox = target?.getBoundingClientRect();
      const x =
        rowBox === undefined
          ? boardBox.width / 2
          : rowBox.left - boardBox.left + rowBox.width * (event.kind === 'battle' ? 0.82 : 0.38 + ((event.id * 37) % 30) / 100);
      const y = rowBox === undefined ? boardBox.height / 2 : rowBox.top - boardBox.top + rowBox.height / 2;
      const showText = current.sfxText;
      const explosion = current.explosions && event.kind !== 'battle';
      if (explosion || showText || event.kind === 'finish') {
        const burst: Burst = {
          id: event.id,
          kind: event.kind,
          minor: event.minor,
          x,
          y,
          text: showText ? sfxText(event.kind, current.language, event.id) : null,
          japanese: isJapanese(current.language, event.id),
          power: strength,
          explosion,
        };
        setBursts((list) => [...list.slice(-6), burst]);
        later(burstMs[event.kind], () => {
          setBursts((list) => list.filter((item) => item.id !== event.id));
        });
      }
      const shake = shakes[event.kind];
      if (current.shake && shake.amp > 0)
        board.animate(shakeFrames(event.kind, shake.amp * strength), {
          duration: shake.ms,
          easing: 'ease-out',
        });
      const flash = flashRef.current;
      if (current.explosions && flash !== null && shake.flash !== null) {
        flash.style.background = shake.flash;
        flash.animate([{ opacity: Math.min(1, 0.5 + strength * 0.4) }, { opacity: 0 }], {
          duration: 380,
          easing: 'ease-out',
        });
      }
      if (current.mascotEnabled && !event.minor && reactsTo(current, event.kind)) {
        const seed = event.id + 1;
        setReaction({
          mood: moodOf[event.kind],
          key: event.id,
          text: mascotLine(event.kind, current.language, seed),
          japanese: isJapanese(current.language, seed),
        });
        later(reactionMs, () => {
          setReaction((now) => (now?.key === event.id ? null : now));
        });
      }
    },
    [later],
  );

  // Every telemetry frame goes through the detector, whatever the render rate.
  useEffect(() => {
    const detector = new FxDetector();
    return overlay.on('telemetry', (frame) => {
      const current = settingsRef.current;
      const events = detector.update(
        frame,
        { raceOnly: current.raceOnly, battleGap: current.battleGap },
        performance.now(),
      );
      for (const event of events) play(event);
      setFinished(detector.finished);
    });
  }, [overlay, play]);

  // Demo data drives the effects in turn, so previews show what the board does.
  useEffect(() => {
    if (status !== 'demo') return;
    let step = 0;
    let timer = 0;
    const next = (ms: number) => {
      timer = window.setTimeout(() => {
        next(showcaseMs);
        show();
      }, ms);
    };
    const show = () => {
      if (step > 0 && performance.now() - lastEventAt.current < 3000) return;
      const board = boardRef.current;
      if (board === null) return;
      const kind = showcase[step % showcase.length] ?? 'pass';
      step += 1;
      const cars = [...board.querySelectorAll<HTMLElement>('.row[data-car]')];
      const reference = cars.findIndex((row) => row.classList.contains('reference'));
      const neighbour = cars[kind === 'passed' ? reference - 1 : reference + 1];
      const carIdx = neighbour?.dataset.car === undefined ? null : Number(neighbour.dataset.car);
      play(fxEvent(kind, kind === 'best' ? null : carIdx));
    };
    // The first one plays early, while a preview is being captured.
    next(showcaseFirstMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [status, play]);

  // As many rows as the window has room for, whatever the font size.
  useLayoutEffect(() => {
    const box = rowsRef.current;
    if (box === null) return;
    const measure = () => {
      const row = box.querySelector<HTMLElement>('.row');
      if (row === null) return;
      const height = row.getBoundingClientRect().height;
      if (height <= 0) return;
      const fit = Math.max(1, Math.floor((box.clientHeight + 1) / height));
      setCapacity((now) => (now === fit ? now : fit));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => {
      observer.disconnect();
    };
  }, [settings.fontSize, settings.showHeader, rows.length > 0]);

  // Rows that swap places slide past each other instead of jumping.
  const tops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const box = rowsRef.current;
    if (box === null) return;
    const next = new Map<string, number>();
    for (const element of box.querySelectorAll<HTMLElement>('.row[data-car]')) {
      const car = element.dataset.car ?? '';
      const top = element.offsetTop;
      next.set(car, top);
      const before = tops.current.get(car);
      if (settings.rowSwap && before !== undefined && before !== top)
        element.animate(
          [{ transform: `translateY(${String(before - top)}px)`, zIndex: 3 }, { transform: 'none', zIndex: 3 }],
          { duration: 560, easing: 'cubic-bezier(0.25, 1.35, 0.45, 1)' },
        );
    }
    tops.current = next;
  }, [rows, settings.rowSwap]);

  const mascotOn = settings.mascotEnabled;
  const mood: Mood = reaction?.mood ?? (finished && settings.reactFinish ? 'dance' : 'idle');
  const mascotShown = mascotOn && (settings.mascotMode === 'ALWAYS' || reaction !== null || finished);
  const scale = settings.mascotSize / 100;
  const isRace = telemetry.session.type === 'race';
  const mascot = mascotOn && (
    <div
      className={[
        'mascotSlot',
        settings.mascotMode === 'ALWAYS' ? 'docked' : 'popup',
        settings.mascotSide === 'LEFT' ? 'left' : 'right',
        mascotShown ? 'shown' : 'hidden',
      ].join(' ')}
      style={{ '--mascotScale': String(scale), '--mascotAspect': String(girlAspect) } as CSSProperties}
    >
      <Mascot
        look={lookOf(settings)}
        mood={mascotShown ? mood : 'idle'}
        seed={reaction?.key ?? 0}
        bubble={
          settings.mascotBubbles && reaction !== null
            ? { text: reaction.text, japanese: reaction.japanese, key: reaction.key }
            : null
        }
      />
    </div>
  );

  const theme = `theme-${settings.theme.toLowerCase()}`;
  const look = { fontSize: `${String(settings.fontSize)}px`, '--opacity': String(settings.opacity) } as CSSProperties;
  return (
    <div className={`anime ${theme} ${rows.length === 0 ? 'noRows' : ''}`} style={look}>
      {settings.mascotSide === 'LEFT' && mascot}
      <div className="boardSlot">
        {/* The shaken board gets the look itself: inherited, it went back to an earlier one (anime.css). */}
        <div ref={boardRef} className={`board ${theme}`} style={look}>
          <div className="boardBg" />
          {settings.petals && <Petals power={power[settings.intensity]} />}
          {settings.showHeader && <Header telemetry={telemetry} items={settings.headerItems} />}
          <div ref={rowsRef} className="rows">
            {rows.map((row) => (
              <Row
                key={row.key}
                row={row}
                columns={columns}
                isRace={isRace}
                battleAura={settings.battleAura}
                speedLines={settings.speedLines}
                language={settings.language}
              />
            ))}
          </div>
          <FxLayer bursts={bursts} />
          <div ref={flashRef} className="flash" />
        </div>
      </div>
      {settings.mascotSide === 'RIGHT' && mascot}
    </div>
  );
}
