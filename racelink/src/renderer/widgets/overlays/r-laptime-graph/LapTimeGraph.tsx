import { useEffect, useRef } from 'react';

export type GraphLap = Readonly<{ lapNumber: number; seconds: number }>;

type Props = Readonly<{
  laps: readonly GraphLap[];
  /** `FontSize / 9`: line, point and label sizes grow with it. */
  scale: number;
  fontFamily: string;
}>;

const faster = '#09B61A';
const slower = '#D40000';
const neutral = 'rgba(0,0,0,0.1)';

const median = (values: readonly number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};

/** Chart.js's "nice number" for tick spacing. */
const niceNumber = (range: number): number => {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * 10 ** exponent;
};

/** `mm:ss.S` of milliseconds. */
const tickLabel = (milliseconds: number): string => {
  const total = Math.max(0, milliseconds) / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;
  const whole = Math.floor(seconds);
  const tenth = Math.floor((seconds - whole) * 10);
  return `${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}.${String(tenth)}`;
};

type Point = Readonly<{ x: number; y: number }>;

/** Chart.js's spline control points (tension 0.4). */
const controlPoints = (
  previous: Point,
  current: Point,
  next: Point,
  tension: number,
): { before: Point; after: Point } => {
  const d01 = Math.hypot(current.x - previous.x, current.y - previous.y);
  const d12 = Math.hypot(next.x - current.x, next.y - current.y);
  const s01 = d01 / (d01 + d12 || 1);
  const s12 = d12 / (d01 + d12 || 1);
  const fa = tension * s01;
  const fb = tension * s12;
  return {
    before: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y),
    },
    after: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y),
    },
  };
};

/** The lap times of the session as a line chart: green when a lap is faster than the one before. */
export function LapTimeGraph({ laps, scale, fontFamily }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useRef({ width: 0, height: 0 });
  const draw = useRef<() => void>(() => undefined);

  draw.current = () => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const { width, height } = size.current;
    const ratio = window.devicePixelRatio || 1;
    element.width = Math.max(1, Math.floor(width * ratio));
    element.height = Math.max(1, Math.floor(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const thin = Number((1 * scale).toFixed(1));
    const radius = Number((2 * scale).toFixed(1));
    const lineWidth = Number((2.4 * scale).toFixed(1));
    const padding = 2 * scale;
    const values = laps.map((lap) => lap.seconds * 1000);
    const middle = median(values);
    const low = Math.min(Math.max(0, middle - 500), ...values);
    const high = Math.max(middle + 500, ...values);
    const spacing = niceNumber((high - low) / 4 || 1000);
    const min = Math.floor(low / spacing) * spacing;
    const max = Math.ceil(high / spacing) * spacing;
    const ticks: number[] = [];
    for (let tick = min; tick <= max + spacing / 2; tick += spacing) ticks.push(tick);

    const fontPx = Number((8 * scale).toFixed(0));
    context.font = `${String(fontPx)}px ${fontFamily}`;
    const labelWidth = Math.max(...ticks.map((tick) => context.measureText(tickLabel(tick)).width));
    const left = padding;
    const top = padding + fontPx / 2;
    const right = width - padding - labelWidth - 6 * scale;
    const bottom = height - padding - fontPx / 2;
    if (right <= left || bottom <= top) return;
    const yOf = (milliseconds: number) =>
      bottom - ((milliseconds - min) / (max - min)) * (bottom - top);
    const xOf = (index: number) =>
      laps.length <= 1 ? (left + right) / 2 : left + (index / (laps.length - 1)) * (right - left);

    // Vertical grid: one line per lap.
    context.strokeStyle = neutral;
    context.lineWidth = 2 * thin;
    for (let index = 0; index < laps.length; index += 1) {
      const x = Math.round(xOf(index)) + 0.5;
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, bottom);
      context.stroke();
    }
    // Horizontal grid and labels on the right.
    context.lineWidth = thin;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillStyle = '#858585';
    ticks.forEach((tick, index) => {
      const y = Math.round(yOf(tick)) + 0.5;
      context.strokeStyle = index % 2 === 0 && index <= 4 ? '#BDBDBD' : '#444444';
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(right, y);
      context.stroke();
      context.fillText(tickLabel(tick), right + 6 * scale, y);
    });
    // The axis border on the right.
    context.strokeStyle = '#ffffff';
    context.setLineDash([thin, Number((2 * thin).toFixed())]);
    context.beginPath();
    context.moveTo(right + 0.5, top);
    context.lineTo(right + 0.5, bottom);
    context.stroke();
    context.setLineDash([]);

    const points = values.map((value, index) => ({ x: xOf(index), y: yOf(value) }));
    context.lineWidth = lineWidth;
    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      if (!start || !end) continue;
      const before = points[index - 1] ?? start;
      const after = points[index + 2] ?? end;
      const startControl = controlPoints(before, start, end, 0.4).after;
      const endControl = controlPoints(start, end, after, 0.4).before;
      context.strokeStyle = start.y < end.y ? slower : start.y > end.y ? faster : neutral;
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.bezierCurveTo(
        startControl.x,
        Math.min(bottom, Math.max(top, startControl.y)),
        endControl.x,
        Math.min(bottom, Math.max(top, endControl.y)),
        end.x,
        end.y,
      );
      context.stroke();
    }
    points.forEach((point, index) => {
      const previous = values[index - 1];
      const value = values[index] ?? 0;
      context.fillStyle = previous === undefined || value < previous ? faster : slower;
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fill();
    });
  };

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        size.current = { width: entry.contentRect.width, height: entry.contentRect.height };
        draw.current();
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    draw.current();
  }, [laps, scale, fontFamily]);

  return (
    <div ref={box} className="LapTimeGraph">
      <canvas ref={canvas} />
    </div>
  );
}
