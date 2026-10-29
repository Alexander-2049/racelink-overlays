import { memo, useMemo, type CSSProperties } from 'react';

/** Sakura petals drifting down behind the rows. */
export const Petals = memo(function Petals({ power }: Readonly<{ power: number }>) {
  const petals = useMemo(
    () =>
      Array.from({ length: Math.round(7 * power) }, (_, index) => {
        // Spread evenly, with a fixed wobble per petal: no randomness between renders.
        const spread = (index * 0.6180339887) % 1;
        return {
          index,
          style: {
            left: `${(spread * 100).toFixed(1)}%`,
            '--fall': `${(7 + ((index * 3.7) % 5)).toFixed(1)}s`,
            '--delay': `${(-((index * 2.3) % 9)).toFixed(1)}s`,
            '--drift': `${(((index * 1.9) % 6) - 3).toFixed(1)}em`,
            '--size': `${(0.55 + ((index * 0.37) % 0.5)).toFixed(2)}em`,
          } as CSSProperties,
        };
      }),
    [power],
  );
  return (
    <div className="petals" aria-hidden>
      {petals.map((petal) => (
        <i key={petal.index} style={petal.style} />
      ))}
    </div>
  );
});
