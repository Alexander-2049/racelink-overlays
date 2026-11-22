import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

type Size = Readonly<{ width: number; height: number }>;

/** The scale that fits a content of `inner` into `outer` without cropping; 1 when either is unknown. */
export const fitScale = (outer: Size, inner: Size, max = 6): number => {
  if (inner.width <= 0 || inner.height <= 0 || outer.width <= 0 || outer.height <= 0) return 1;
  return Math.min(max, outer.width / inner.width, outer.height / inner.height);
};

/**
 * Draws its content at its natural size and scales the whole of it to the
 * window, so an overlay of fixed columns follows the window as it is resized.
 * `anchor` says where the content sits when the window is taller than it.
 */
export function FitBox({
  children,
  anchor = 'top',
}: Readonly<{ children: ReactNode; anchor?: 'top' | 'bottom' | 'center' }>) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const box = outer.current;
    const content = inner.current;
    if (!box || !content) return;
    const measure = (): void => {
      setScale(
        fitScale(
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

  const origin = anchor === 'bottom' ? 'left bottom' : anchor === 'center' ? 'left center' : 'left top';
  return (
    <div ref={outer} className={`b-fit b-fit--${anchor}`}>
      <div ref={inner} className="b-fit-content" style={{ transform: `scale(${String(scale)})`, transformOrigin: origin }}>
        {children}
      </div>
    </div>
  );
}
