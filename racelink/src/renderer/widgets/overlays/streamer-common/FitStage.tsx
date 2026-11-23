import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Size = Readonly<{ width: number; height: number }>;

/** The scale that fits `inner` into `outer` without cropping; 1 when either is unknown. */
export const fitStageScale = (outer: Size, inner: Size, max = 6): number => {
  if (inner.width <= 0 || inner.height <= 0 || outer.width <= 0 || outer.height <= 0) return 1;
  return Math.min(max, outer.width / inner.width, outer.height / inner.height);
};

/**
 * Draws its content at its natural size and scales the whole of it to the
 * window, so an overlay of a fixed design follows the window as it is resized.
 */
export function FitStage({ children }: Readonly<{ children: ReactNode }>) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const box = outer.current;
    const content = inner.current;
    if (!box || !content) return;
    const measure = (): void => {
      setScale(
        fitStageScale(
          { width: box.clientWidth, height: box.clientHeight },
          { width: content.offsetWidth, height: content.offsetHeight },
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={outer} style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'flex-start' }}>
      <div ref={inner} style={{ width: 'max-content', flex: 'none', transform: `scale(${String(scale)})`, transformOrigin: 'left top' }}>
        {children}
      </div>
    </div>
  );
}
