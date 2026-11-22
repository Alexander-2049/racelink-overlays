// Fits a board of driver rows to the overlay window, as the built-in standings
// and relatives do: the window height decides how many rows show, a window
// narrower than the columns scales the board down instead of cutting columns
// off, and a wider one gives its spare width to the flexible (name) column.
// The search itself is `fitStep` (tested); this hook measures the DOM.
//
// Mark the rows with `data-fit-row` and the block that keeps its natural
// height (everything but the free space: header, rows, footer) with
// `data-fit-board`. `layoutKey` changes when the settings change what a row
// shows; the scale is found again from `maxScale` then.
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { fitStep } from './fitBoard.ts';

export const fitBoardAttribute = 'data-fit-board';
export const fitRowAttribute = 'data-fit-row';

/** Adjustments per window size, layout and second: rows that change the layout converge by then. */
const maxSteps = 8;
const stepWindowMs = 1000;

export type ViewportSize = Readonly<{ width: number; height: number }>;

export function useViewportSize(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  useEffect(() => {
    const update = (): void => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);
  return viewport;
}

export type FitBoard = Readonly<{
  /** How many rows fit the window height. */
  capacity: number;
  ref: (element: HTMLElement | null) => void;
  style: CSSProperties;
}>;

const verticalPadding = (element: HTMLElement): number => {
  const style = getComputedStyle(element);
  return (Number.parseFloat(style.paddingTop) || 0) + (Number.parseFloat(style.paddingBottom) || 0);
};

export function useFitBoard(layoutKey: unknown, initialCapacity = 10, maxScale = 1): FitBoard {
  const viewport = useViewportSize();
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(maxScale);
  const [capacity, setCapacity] = useState(initialCapacity);
  const steps = useRef({ key: undefined as unknown, width: 0, height: 0, count: 0, since: 0 });

  useLayoutEffect(() => {
    if (element === null) return;
    const step = steps.current;
    if (step.key !== layoutKey || step.width !== viewport.width || step.height !== viewport.height) {
      steps.current = {
        key: layoutKey,
        width: viewport.width,
        height: viewport.height,
        count: 0,
        since: performance.now(),
      };
      // A new window or layout may need less scaling: start again from full size.
      if (scale !== maxScale) {
        setScale(maxScale);
        return;
      }
    }
    if (performance.now() - steps.current.since > stepWindowMs) {
      steps.current.count = 0;
      steps.current.since = performance.now();
    }
    if (steps.current.count >= maxSteps) return;

    // Layout sizes (offset*, client*) ignore the transform, so they are in board pixels.
    const board = element.querySelector<HTMLElement>(`[${fitBoardAttribute}]`);
    const rows = element.querySelectorAll<HTMLElement>(`[${fitRowAttribute}]`);
    const first = rows.item(0) as HTMLElement | null;
    let rowPitch: number | null = null;
    let freeHeight = 0;
    let tallHeight = 0;
    if (board !== null && first !== null && first.offsetHeight > 0) {
      const parent = first.parentElement;
      const gap = parent ? Number.parseFloat(getComputedStyle(parent).rowGap) || 0 : 0;
      rowPitch = first.offsetHeight + gap;
      freeHeight = element.clientHeight - verticalPadding(element) - board.offsetHeight;
      tallHeight = board.offsetHeight + verticalPadding(element);
    }
    const next = fitStep({
      scale,
      capacity,
      maxScale,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      neededWidth: element.offsetWidth,
      rowCount: rows.length,
      rowPitch,
      freeHeight,
      tallHeight,
    });
    if (next.scale !== scale || next.capacity !== capacity) {
      steps.current.count += 1;
      setScale(next.scale);
      setCapacity(next.capacity);
    }
  });

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);
  // Fixed to the window, so a board scaled down never makes the page scroll.
  const style: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: `${String(viewport.width / scale)}px`,
    height: `${String(viewport.height / scale)}px`,
    minWidth: 'min-content',
    transform: scale === 1 ? undefined : `scale(${String(scale)})`,
    transformOrigin: '0 0',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };
  return { capacity, ref, style };
}

/** Where the board sits when the window is taller than it. */
export const alignStyle = (align: 'top' | 'bottom' | 'center'): CSSProperties => ({
  justifyContent: align === 'bottom' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
});
