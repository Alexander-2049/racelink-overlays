import { memo, useMemo, type CSSProperties } from 'react';
import type { FxKind } from './phrases';

/** One effect on the board, placed in board pixels. */
export type Burst = Readonly<{
  id: number;
  kind: FxKind;
  minor: boolean;
  x: number;
  y: number;
  /** The comic sound effect, or null when they are off. */
  text: string | null;
  /** The text is Japanese (another font). */
  japanese: boolean;
  /** Particle count and size scale with the intensity. */
  power: number;
  explosion: boolean;
}>;

/** How long each effect plays, ms; the board removes it afterwards. */
export const burstMs: Readonly<Record<FxKind, number>> = {
  pass: 1500,
  passed: 1500,
  best: 1700,
  battle: 2200,
  finish: 3600,
};

/** Small deterministic random numbers, so a burst draws the same on every render. */
const random = (seed: number) => {
  let state = (seed * 2654435761) >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10000) / 10000;
  };
};

const starPoints = (spikes: number, seed: number): string => {
  const next = random(seed);
  const points: string[] = [];
  for (let index = 0; index < spikes * 2; index += 1) {
    const angle = (Math.PI * index) / spikes;
    const radius = index % 2 === 0 ? 46 + next() * 4 : 26 + next() * 8;
    points.push(`${(50 + Math.cos(angle) * radius).toFixed(1)},${(50 + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return points.join(' ');
};

const palettes: Readonly<Record<FxKind, readonly string[]>> = {
  pass: ['#fff35c', '#ff9a1f', '#ff3d6e', '#ffffff'],
  passed: ['#5ab4ff', '#9b5cff', '#ff2a4d', '#ffffff'],
  best: ['#ffe066', '#c58bff', '#7af5ff', '#ffffff'],
  battle: ['#c58bff'],
  finish: ['#ff5fa2', '#ffe066', '#5ab4ff', '#7dffb0', '#ffffff'],
};

function Explosion({ burst }: Readonly<{ burst: Burst }>) {
  const parts = useMemo(() => {
    const next = random(burst.id);
    const count = Math.round((burst.minor ? 8 : 16) * burst.power);
    const colors = palettes[burst.kind];
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 + next() * 0.5;
      const distance = (2.2 + next() * 3.2) * (burst.minor ? 0.6 : 1);
      return {
        index,
        style: {
          '--dx': `${(Math.cos(angle) * distance).toFixed(2)}em`,
          '--dy': `${(Math.sin(angle) * distance * 0.75).toFixed(2)}em`,
          '--spin': `${String(Math.round(next() * 720 - 360))}deg`,
          '--size': `${(0.25 + next() * 0.45).toFixed(2)}em`,
          '--delay': `${String(Math.round(next() * 90))}ms`,
          background: colors[index % colors.length],
        } as CSSProperties,
        star: burst.kind === 'best' || index % 3 === 0,
      };
    });
  }, [burst]);
  const points = useMemo(() => starPoints(burst.kind === 'passed' ? 11 : 14, burst.id), [burst]);
  const scale = (burst.minor ? 0.6 : 1) * Math.min(1.5, 0.75 + burst.power * 0.3);
  return (
    <div
      className={`burst burst-${burst.kind}`}
      style={{ left: burst.x, top: burst.y, '--scale': String(scale) } as CSSProperties}
    >
      {burst.explosion && (
        <>
          <div className="flashBall" />
          <div className="shockwave" />
          <div className="shockwave late" />
          <svg className="starburst" viewBox="0 0 100 100" aria-hidden>
            <polygon className="outer" points={points} />
            <polygon className="inner" points={points} transform="translate(50 50) scale(0.72) translate(-50 -50)" />
          </svg>
          {parts.map((part) => (
            <i key={part.index} className={part.star ? 'spark star' : 'spark'} style={part.style} />
          ))}
        </>
      )}
      {burst.text !== null && (
        <span className={`sfx ${burst.japanese ? 'jp' : 'en'}`}>{burst.text}</span>
      )}
    </div>
  );
}

/** JoJo-style menacing letters rising beside a close battle. */
function Menace({ burst }: Readonly<{ burst: Burst }>) {
  if (burst.text === null) return null;
  // Japanese rises letter by letter; English as one word.
  const letters = burst.japanese ? [...burst.text] : [burst.text];
  return (
    <div className="menace" style={{ left: burst.x, top: burst.y }}>
      {letters.map((letter, index) => (
        <span
          key={index}
          className={burst.japanese ? 'jp' : 'en'}
          style={{ '--i': index } as CSSProperties}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

function Confetti({ burst }: Readonly<{ burst: Burst }>) {
  const pieces = useMemo(() => {
    const next = random(burst.id);
    const colors = palettes.finish;
    return Array.from({ length: Math.round(28 * burst.power) }, (_, index) => ({
      index,
      style: {
        left: `${(next() * 100).toFixed(1)}%`,
        '--fall': `${(1.6 + next() * 1.6).toFixed(2)}s`,
        '--delay': `${String(Math.round(next() * 900))}ms`,
        '--drift': `${(next() * 4 - 2).toFixed(2)}em`,
        '--spin': `${String(Math.round(next() * 1080))}deg`,
        background: colors[index % colors.length],
      } as CSSProperties,
    }));
  }, [burst]);
  return (
    <div className="confetti">
      {pieces.map((piece) => (
        <i key={piece.index} style={piece.style} />
      ))}
      {burst.text !== null && (
        <span className={`finishText sfx ${burst.japanese ? 'jp' : 'en'}`}>{burst.text}</span>
      )}
    </div>
  );
}

/** Everything that flies over the rows. */
export const FxLayer = memo(function FxLayer({ bursts }: Readonly<{ bursts: readonly Burst[] }>) {
  return (
    <div className="fxLayer" aria-hidden>
      {bursts.map((burst) =>
        burst.kind === 'battle' ? (
          <Menace key={burst.id} burst={burst} />
        ) : burst.kind === 'finish' ? (
          <Confetti key={burst.id} burst={burst} />
        ) : (
          <Explosion key={burst.id} burst={burst} />
        ),
      )}
    </div>
  );
});
