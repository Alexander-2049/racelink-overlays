import { useEffect, useMemo, useRef, useState, type Ref, type RefObject } from 'react';
import { demoHistory } from '../../../shared/api/racelink-runtime';
import { cx } from '../r-common/driver/cx';
import {
  createView,
  drawGrid,
  drawLine,
  fillView,
  Track,
  withAlpha,
  type AbsLine,
  type GridLine,
  type Sample,
} from './chart';

export type TraceSettings = Readonly<{
  fontSize: number;
  historySeconds: number;
  telemetryLineSize: number;
  showThrottle: boolean;
  showBrake: boolean;
  showAbs: boolean;
  absLine: AbsLine;
  showClutch: boolean;
  showSpeed: boolean;
  showWheel: boolean;
  highlight: boolean;
  background: string;
  horizontalGrid: GridLine;
  middleGrid: GridLine;
  verticalGrid: GridLine;
  throttleColor: string;
  brakeColor: string;
  absColor: string;
  clutchColor: string;
  speedColor: string;
  wheelColor: string;
  throttleOpacity: number;
  brakeOpacity: number;
}>;

type Props = Readonly<{
  ref?: Ref<HTMLDivElement>;
  sample: Sample;
  /** When the sample was taken, on the `performance.now()` clock. */
  sampledAt: number | undefined;
  settings: TraceSettings;
  lumina: boolean;
  isLast: boolean;
  renderFps: number;
  /** Demo data: the trace opens full, with the seconds before the overlay opened. */
  demoMode: boolean;
}>;

/** The trace is drawn this far in the past, so its right edge lies between two real samples. */
const renderDelayMs = 50;
const maxSamplesPerSecond = 250;

const dimensions = (width: number, fontSize: number, telemetryLineSize: number) => ({
  width: Math.max(1, Math.floor(width)),
  height: 6.5 * fontSize,
  strokeWidth: (fontSize * telemetryLineSize) / 60,
});

/** The width of an element, following its size. */
function useWidth(element: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const target = element.current;
    if (target === null) return;
    const observer = new ResizeObserver(() => {
      setWidth(target.clientWidth);
    });
    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [element]);
  return width;
}

/** The scrolling trace of throttle, brake, clutch, speed and steering. */
export function TelemetryTrace({
  ref,
  sample,
  sampledAt,
  settings,
  lumina,
  isLast,
  renderFps,
  demoMode,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const boxWidth = useWidth(box);
  const { fontSize, historySeconds, telemetryLineSize } = settings;
  // Keyed by the numbers: a new settings object every render must not reset the canvas.
  const size = useMemo(
    () => dimensions(boxWidth, fontSize, telemetryLineSize),
    [boxWidth, fontSize, telemetryLineSize],
  );
  const windowMs = Math.max(500, (historySeconds || 6.5) * 1000);
  const capacity = Math.ceil((windowMs / 1000) * maxSamplesPerSecond) + 64;
  const track = useMemo(() => new Track(capacity), [capacity]);
  const view = useMemo(() => createView(capacity), [capacity]);
  const settingsRef = useRef(settings);
  const latest = useRef({ sample, sampledAt });
  useEffect(() => {
    settingsRef.current = settings;
    latest.current = { sample, sampledAt };
  });

  useEffect(() => {
    if (!demoMode) return;
    for (const { sampledAt: at, data: car } of demoHistory('car', windowMs / 1000))
      track.push(at, {
        throttle: car.throttle,
        brake: car.brake,
        clutch: car.clutch,
        abs: car.absActive,
        steering: (car.steering + 1) / 2,
        speed: car.speedKph,
      });
  }, [demoMode, track, windowMs]);

  // A new car sample is a new point, even when every value is the same.
  useEffect(() => {
    track.push(latest.current.sampledAt ?? performance.now(), latest.current.sample);
  }, [sampledAt, track]);

  useEffect(() => {
    const element = canvas.current;
    if (element === null) return;
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    element.width = Math.floor(size.width * ratio);
    element.height = Math.floor(size.height * ratio);
    // The canvas follows its box, so the box can shrink as well as grow.
    element.style.width = '100%';
    element.style.height = `${String(size.height)}px`;
    const context = element.getContext('2d');
    if (context === null) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.miterLimit = 1;
    // A frame a little early still counts, or a 60 fps limit would drop every other frame.
    const interval = 1000 / Math.max(1, renderFps) - 4;
    let last = 0;
    let frame = 0;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - last < interval) return;
      last = time;
      const current = settingsRef.current;
      const end = performance.now() - renderDelayMs;
      context.clearRect(0, 0, size.width, size.height);
      if (current.background) {
        context.fillStyle = current.background;
        context.fillRect(0, 0, size.width, size.height);
      }
      drawGrid(context, {
        width: size.width,
        height: size.height,
        lumina,
        horizontal: current.horizontalGrid,
        middle: current.middleGrid,
        vertical: current.verticalGrid,
        scroll: (end / windowMs) * size.width,
      });
      fillView(view, track, end, windowMs, size.width);
      const line = (
        channel: Parameters<typeof drawLine>[1]['channel'],
        color: string,
        extra: {
          strokeWidth?: number;
          secondary?: Parameters<typeof drawLine>[1]['secondary'];
        } = {},
      ) => {
        drawLine(context, {
          view,
          channel,
          color,
          glow: current.highlight,
          strokeWidth: extra.strokeWidth ?? size.strokeWidth,
          height: size.height,
          secondary: extra.secondary,
        });
      };
      if (current.showClutch) line('clutch', current.clutchColor);
      if (current.showThrottle)
        line('throttle', withAlpha(current.throttleColor, current.throttleOpacity / 100));
      if (current.showBrake)
        line('brake', withAlpha(current.brakeColor, current.brakeOpacity / 100), {
          secondary: current.showAbs
            ? {
                color: withAlpha(current.absColor, current.brakeOpacity / 100),
                style: current.absLine,
              }
            : undefined,
        });
      if (current.showSpeed) line('speed', current.speedColor);
      if (current.showWheel)
        line('steering', current.wheelColor, { strokeWidth: 0.5 * size.strokeWidth });
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [size, renderFps, lumina, windowMs, track, view]);

  return (
    <div
      ref={ref}
      className={cx('telemetryCanvasCont', { themeLumina: lumina, themeClassic: !lumina, isLast })}
    >
      <div ref={box} className="telemetryCanvasInnerCont">
        <canvas ref={canvas} className="canvasinputs" />
      </div>
    </div>
  );
}
