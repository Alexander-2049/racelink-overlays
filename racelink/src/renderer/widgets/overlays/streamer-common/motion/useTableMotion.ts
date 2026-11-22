// Motion of a table of rows and columns for the streamer overlays:
//  - rows that change place slide to it (FLIP by the row key), new rows fade in,
//    rows that leave fade out where they were (optional);
//  - a column with no data in any row is left out, and opens or closes smoothly
//    when data comes or goes, with a hold so it does not blink.
// The logic is in columnPresence.ts, columnMotion.ts and rowPlan.ts (tested);
// this file is the glue to the DOM. Rows carry `data-fx-key`; the table root is
// the element the hook returns a ref for.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ColumnMotion, columnTrack } from './columnMotion.ts';
import { ColumnPresence } from './columnPresence.ts';
import { planRows, massChange, type Box } from './rowPlan.ts';

export const rowKeyAttribute = 'data-fx-key';
const moveMs = 260;
const enterMs = 280;
const leaveMs = 220;
const columnMs = 280;
const defaultHoldMs = 4000;

/** Motion is off when the viewer asks the system for less of it. */
export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const layoutBox = (element: HTMLElement, root: HTMLElement): Box => {
  let top = 0;
  let left = 0;
  let node: HTMLElement | null = element;
  while (node !== null && node !== root) {
    top += node.offsetTop;
    left += node.offsetLeft;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }
  return { top, left, width: element.offsetWidth, height: element.offsetHeight };
};

/** The vertical offset a transform animation has reached, in pixels. */
const visualOffset = (element: HTMLElement): number => {
  const transform = getComputedStyle(element).transform;
  if (transform === 'none' || transform === '') return 0;
  return new DOMMatrixReadOnly(transform).m42;
};

export type Ghost<T> = Readonly<{ key: string; item: T; box: Box }>;

export type TableMotionOptions<T, C extends string> = Readonly<{
  items: readonly T[];
  getKey: (item: T) => string;
  /** Configured columns, in order. */
  columns: readonly C[];
  /** Whether a row has anything to show in the column; columns it is not asked about never hide. */
  hasData: (id: C, item: T) => boolean;
  /** The Animations setting. */
  animations: boolean;
  /** The Hide empty columns setting. */
  hideEmpty: boolean;
  /** Keep a row that left on screen, fading out, until it is gone. */
  ghosts?: boolean;
  holdMs?: number;
}>;

export type TableMotion<T, C extends string> = Readonly<{
  /** Ref for the table root: it holds the rows, so it must be the rows' positioning context. */
  rootRef: (element: HTMLElement | null) => void;
  /** Columns to draw, in order: those with data and those on their way in or out. */
  columns: readonly C[];
  /** The grid track of a column of the given width; `estimate` stands in for a width that is not a length. */
  track: (id: C, width: string, estimate?: string) => string;
  /** Rows that left and are fading out; draw them with `ghostStyle` and without `data-fit-row`. */
  ghosts: readonly Ghost<T>[];
  /** Whether motion is on (setting on and the system does not ask for less). */
  active: boolean;
}>;

export const ghostStyle = (box: Box): Readonly<Record<string, string | number>> => ({
  position: 'absolute',
  top: box.top,
  left: box.left,
  width: box.width,
  height: box.height,
  margin: 0,
  pointerEvents: 'none',
});

export function useTableMotion<T, C extends string>(options: TableMotionOptions<T, C>): TableMotion<T, C> {
  const { items, getKey, columns, animations } = options;
  const active = animations && !prefersReducedMotion();
  const rootElement = useRef<HTMLElement | null>(null);
  const rootRef = useCallback((element: HTMLElement | null) => {
    rootElement.current = element;
  }, []);
  const [, rerender] = useState(0);
  const poke = useCallback(() => {
    rerender((value) => value + 1);
  }, []);
  const now = performance.now();

  // Which columns have data (with the hold) and how open each one is.
  const presence = useRef<ColumnPresence | null>(null);
  presence.current ??= new ColumnPresence(options.holdMs ?? defaultHoldMs);
  const motion = useRef(new ColumnMotion(columnMs));
  const started = useRef(false);
  let hold: number | null = null;
  const wanted = new Set<string>();
  if (options.hideEmpty) {
    const have: Record<string, boolean> = {};
    for (const id of columns) have[id] = items.some((item) => options.hasData(id, item));
    const update = presence.current.update(now, have);
    hold = update.nextCheckMs;
    for (const id of update.visible) wanted.add(id);
  } else {
    for (const id of columns) wanted.add(id);
  }
  motion.current.keepOnly(new Set(columns));
  for (const id of columns) motion.current.set(now, id, wanted.has(id) ? 1 : 0, active && started.current);
  const rendered = columns.filter((id) => motion.current.rendered(id, now));
  const moving = new Set(rendered.filter((id) => !motion.current.settled(id, now)));

  // Rows: what was drawn last time, and the rows that left since.
  const committed = useRef<{ items: Map<string, T>; boxes: Map<string, Box> }>({
    items: new Map(),
    boxes: new Map(),
  });
  const ghostRows = useRef(new Map<string, { item: T; box: Box; until: number }>());
  const keys = new Set(items.map(getKey));
  if (!active || options.ghosts !== true) {
    ghostRows.current.clear();
  } else {
    const prev = committed.current;
    const gone = [...prev.items.keys()].filter((key) => !keys.has(key));
    const mass = prev.items.size > 3 && gone.length > prev.items.size * massChange;
    for (const key of gone) {
      const item = prev.items.get(key);
      const box = prev.boxes.get(key);
      if (!mass && item !== undefined && box !== undefined && !ghostRows.current.has(key))
        ghostRows.current.set(key, { item, box, until: now + leaveMs });
    }
    for (const [key, ghost] of ghostRows.current)
      if (keys.has(key) || ghost.until <= now) ghostRows.current.delete(key);
  }
  const ghosts = [...ghostRows.current].map(([key, ghost]) => ({ key, item: ghost.item, box: ghost.box }));

  useLayoutEffect(() => {
    started.current = true;
    const root = rootElement.current;
    if (root === null) return;
    if (getComputedStyle(root).position === 'static') root.style.position = 'relative';
    const elements = new Map<string, HTMLElement>();
    for (const element of root.querySelectorAll<HTMLElement>(`[${rowKeyAttribute}]`))
      if (!element.hasAttribute('data-fx-ghost')) elements.set(element.getAttribute(rowKeyAttribute) ?? '', element);
    const boxes = new Map<string, Box>();
    for (const [key, element] of elements) boxes.set(key, layoutBox(element, root));

    if (active) {
      const plan = planRows(committed.current.boxes, boxes);
      if (!plan.reset) {
        for (const { key, dy } of plan.moves) {
          const element = elements.get(key);
          if (element === undefined) continue;
          const from = visualOffset(element) + dy;
          for (const animation of element.getAnimations()) animation.cancel();
          element.animate(
            [{ transform: `translateY(${String(from)}px)` }, { transform: 'translateY(0)' }],
            { duration: moveMs, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
          );
        }
        for (const key of plan.enters)
          elements.get(key)?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: enterMs, easing: 'ease-out' });
      }
      for (const element of root.querySelectorAll<HTMLElement>('[data-fx-ghost]')) {
        if (element.dataset.fxStarted === '1') continue;
        element.dataset.fxStarted = '1';
        element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: leaveMs, easing: 'ease-in', fill: 'forwards' });
      }
    }
    committed.current = { items: new Map(items.map((item) => [getKey(item), item])), boxes };
  });

  // Column widths are animated by a CSS variable per column, set every frame.
  const frame = useRef<number | null>(null);
  useLayoutEffect(() => {
    const root = rootElement.current;
    if (root === null || frame.current !== null || motion.current.allSettled(performance.now())) return;
    root.setAttribute('data-fx-busy', '');
    const step = (): void => {
      frame.current = null;
      const time = performance.now();
      const target = rootElement.current;
      if (target === null) return;
      for (const id of columns) target.style.setProperty(`--fx-c-${id}`, String(motion.current.progress(id, time)));
      if (motion.current.allSettled(time)) {
        for (const id of columns) target.style.removeProperty(`--fx-c-${id}`);
        target.removeAttribute('data-fx-busy');
        poke();
        return;
      }
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  });
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    [],
  );

  // A timer wakes the table when a column is due to hide or a ghost to go.
  const ghostUntil = [...ghostRows.current.values()].reduce((least, ghost) => Math.min(least, ghost.until - now), Infinity);
  const wake = Math.min(hold ?? Infinity, ghostUntil);
  useEffect(() => {
    if (!Number.isFinite(wake)) return;
    const timer = window.setTimeout(poke, Math.max(16, wake + 20));
    return () => {
      window.clearTimeout(timer);
    };
  });

  const track = (id: C, width: string, estimate = '4em'): string =>
    columnTrack(id, width, estimate, motion.current.progress(id, now), moving.has(id));
  return { rootRef, columns: rendered, track, ghosts, active };
}
