import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/** The trace keeps at least this share of the width; the rest of the panel scales to fit. */
const traceShare = 0.4;
const smallest = 4;
const largest = 160;

/**
 * The font size that makes the overlay fill its window. Everything in the
 * overlay is sized in em, so its height follows the font size: the window
 * height sets the size, and a narrow window shrinks it so the fixed parts
 * (wheel, pedals, gear, G meter) leave room for the trace. `layoutKey`
 * changes when the settings change what the overlay shows.
 */
export function useFitFontSize(
  layout: RefObject<HTMLElement | null>,
  trace: RefObject<HTMLElement | null>,
  initial: number,
  layoutKey: unknown,
): number {
  const [fontSize, setFontSize] = useState(initial);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  useLayoutEffect(() => {
    const element = layout.current;
    if (element === null) return;
    const container = element.parentElement;
    const style = container === null ? null : getComputedStyle(container);
    const chrome =
      style === null
        ? 0
        : parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) +
          parseFloat(style.borderTopWidth) +
          parseFloat(style.borderBottomWidth);
    const height = element.getBoundingClientRect().height;
    if (height <= 0) return;
    // A pixel of slack keeps rounding from clipping the bottom edge.
    let next = (fontSize * Math.max(1, viewport.height - chrome - 1)) / height;
    const traceWidth = trace.current?.getBoundingClientRect().width ?? 0;
    const fixed = element.scrollWidth - traceWidth;
    if (fixed > 0) {
      const room = viewport.width * (trace.current === null ? 1 : 1 - traceShare);
      next = Math.min(next, (fontSize * room) / fixed);
    }
    next = Math.min(largest, Math.max(smallest, next));
    if (Math.abs(next - fontSize) > 0.1) setFontSize(next);
  }, [layout, trace, fontSize, viewport, layoutKey]);

  return fontSize;
}
