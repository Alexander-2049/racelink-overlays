import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const smallest = 4;
const largest = 200;
/** Adjustments per window size and layout; content that does not scale exactly with the font converges by then. */
const maxSteps = 12;

export type FitMode = 'contain' | 'height' | 'width';

export type ViewportSize = Readonly<{ width: number; height: number }>;

/** The size of the overlay window, following resizes. */
export function useViewportSize(): ViewportSize {
  const [viewport, setViewport] = useState<ViewportSize>(() => ({
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
  return viewport;
}

type Cap = Readonly<{ key: unknown; width: number; height: number; font: number }>;
interface Steps {
  key: unknown;
  width: number;
  height: number;
  count: number;
}

/**
 * The font size that makes an overlay fill its window. The R- overlays size
 * every part in em, so the content grows with the font size: `height`
 * fits the content's height to the window (parts that stretch take the spare
 * width), `width` fits its width, `contain` fits both. A content wider than
 * the window always shrinks to fit. The root font size follows too, for the
 * styles written in rem. `layoutKey` changes when the settings change
 * what the overlay shows.
 *
 * Returns the font size and the ref for the element that wraps the overlay
 * box; the box is the element's first child.
 */
export function useFitFont(
  mode: FitMode,
  layoutKey: unknown,
  initial = 14,
): readonly [number, (element: HTMLElement | null) => void] {
  const [fontSize, setFontSize] = useState(initial);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const viewport = useViewportSize();
  // The largest font size that fitted the other side, until the window or the
  // layout changes; without it growing to fit one side and shrinking for the
  // other would alternate forever.
  const cap = useRef<Cap | null>(null);
  const steps = useRef<Steps>({ key: undefined, width: 0, height: 0, count: 0 });
  // Styles and images that arrive after the first layout change the size too.
  const [measure, remeasure] = useState(0);

  useEffect(() => {
    const box = element?.firstElementChild ?? element;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      remeasure((value) => value + 1);
    });
    observer.observe(box);
    return () => {
      observer.disconnect();
    };
  }, [element]);

  useLayoutEffect(() => {
    if (element === null) return;
    // The overlay box clips its content, so its own scroll size shows what overflows.
    const box = element.firstElementChild ?? element;
    const rect = box.getBoundingClientRect();
    const width = Math.max(rect.width, box.scrollWidth);
    const height = Math.max(rect.height, box.scrollHeight);
    if (width <= 0 || height <= 0) return;
    // A pixel of slack keeps rounding from clipping the edges.
    const byHeight = (fontSize * Math.max(1, viewport.height - 1)) / height;
    const byWidth = (fontSize * Math.max(1, viewport.width - 1)) / width;
    let next =
      mode === 'height' ? byHeight : mode === 'width' ? byWidth : Math.min(byHeight, byWidth);
    const overflows =
      (mode === 'height' && width > viewport.width + 1) ||
      (mode === 'width' && height > viewport.height + 1);
    const current = cap.current;
    if (
      current !== null &&
      (current.key !== layoutKey ||
        current.width !== viewport.width ||
        current.height !== viewport.height)
    ) {
      cap.current = null;
    }
    if (overflows) {
      const fitted = mode === 'height' ? byWidth : byHeight;
      cap.current = {
        key: layoutKey,
        width: viewport.width,
        height: viewport.height,
        font: Math.min(cap.current?.font ?? Infinity, fitted),
      };
    }
    if (cap.current !== null) next = Math.min(next, cap.current.font);
    next = Math.min(largest, Math.max(smallest, next));
    const step = steps.current;
    if (
      step.key !== layoutKey ||
      step.width !== viewport.width ||
      step.height !== viewport.height
    ) {
      steps.current = { key: layoutKey, width: viewport.width, height: viewport.height, count: 0 };
    }
    if (
      Math.abs(next - fontSize) > Math.max(0.1, fontSize * 0.005) &&
      steps.current.count < maxSteps
    ) {
      steps.current.count += 1;
      setFontSize(next);
    }
  }, [element, fontSize, viewport, mode, layoutKey, measure]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${String(fontSize)}px`;
  }, [fontSize]);

  const ref = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);
  return [fontSize, ref] as const;
}
