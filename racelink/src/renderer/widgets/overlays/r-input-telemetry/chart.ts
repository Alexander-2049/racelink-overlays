/** Time-based buffers and canvas drawing of the telemetry trace (R-Input Telemetry). */

/** One car sample; every channel but `speed` is in 0..1. */
export type Sample = Readonly<{
  throttle: number;
  brake: number;
  clutch: number;
  abs: boolean;
  /** 0..1 with 0.5 as straight ahead. */
  steering: number;
  speed: number;
}>;

const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export type ChannelId = 'throttle' | 'brake' | 'clutch' | 'steering' | 'speed';
const channelIds: readonly ChannelId[] = ['throttle', 'brake', 'clutch', 'steering', 'speed'];

/** A gap longer than this holds the last value instead of drawing a slanted line. */
const staleGapMs = 250;

/**
 * The samples of the last few seconds in ring buffers, each with the time it was
 * taken. The trace is drawn by time, so uneven delivery does not bend it.
 */
export class Track {
  private head = 0;
  private len = 0;
  private readonly times: Float64Array;
  private readonly channels: Readonly<Record<ChannelId, Float32Array>>;
  private readonly abs: Uint8Array;
  private speedMax = 0;

  constructor(readonly capacity: number) {
    this.times = new Float64Array(capacity);
    this.abs = new Uint8Array(capacity);
    this.channels = {
      throttle: new Float32Array(capacity),
      brake: new Float32Array(capacity),
      clutch: new Float32Array(capacity),
      steering: new Float32Array(capacity),
      speed: new Float32Array(capacity),
    };
  }

  size(): number {
    return this.len;
  }

  push(time: number, sample: Sample): void {
    if (this.len > 0 && time <= this.timeAt(this.len - 1)) return;
    const slot = this.head;
    this.times[slot] = time;
    this.abs[slot] = sample.abs ? 1 : 0;
    this.channels.throttle[slot] = clamp01(sample.throttle);
    this.channels.brake[slot] = clamp01(sample.brake);
    this.channels.clutch[slot] = clamp01(sample.clutch);
    this.channels.steering[slot] = Number.isFinite(sample.steering) ? sample.steering : 0.5;
    // Speed is drawn against the highest speed seen so far.
    const speed = Number.isFinite(sample.speed) ? Math.max(0, sample.speed) : 0;
    this.speedMax = Math.max(this.speedMax, speed);
    this.channels.speed[slot] = this.speedMax > 0 ? speed / this.speedMax : 0;
    this.head = (slot + 1) % this.capacity;
    this.len = Math.min(this.len + 1, this.capacity);
  }

  private slot(index: number): number {
    return (this.head - this.len + index + this.capacity) % this.capacity;
  }

  timeAt(index: number): number {
    return this.times[this.slot(index)] ?? 0;
  }

  valueAt(channel: ChannelId, index: number): number {
    return this.channels[channel][this.slot(index)] ?? 0;
  }

  absAt(index: number): boolean {
    return this.abs[this.slot(index)] === 1;
  }
}

/** The part of a track inside the window, with the edges cut by interpolation. */
export interface View {
  count: number;
  x: Float32Array;
  abs: Uint8Array;
  values: Readonly<Record<ChannelId, Float32Array>>;
}

export const createView = (capacity: number): View => {
  const size = capacity + 4;
  return {
    count: 0,
    x: new Float32Array(size),
    abs: new Uint8Array(size),
    values: {
      throttle: new Float32Array(size),
      brake: new Float32Array(size),
      clutch: new Float32Array(size),
      steering: new Float32Array(size),
      speed: new Float32Array(size),
    },
  };
};

/**
 * Fills `view` with the samples between `end - windowMs` and `end` as x positions
 * (0 at the left edge, `width` at the right). The right edge holds the last value
 * when no newer sample has arrived yet.
 */
export const fillView = (
  view: View,
  track: Track,
  end: number,
  windowMs: number,
  width: number,
): void => {
  view.count = 0;
  const total = track.size();
  if (total === 0) return;
  const start = end - windowMs;
  const toX = (time: number) => ((time - start) / windowMs) * width;
  const add = (x: number, abs: boolean, read: (channel: ChannelId) => number) => {
    const at = view.count;
    if (at >= view.x.length) return;
    view.x[at] = x;
    view.abs[at] = abs ? 1 : 0;
    for (const channel of channelIds) view.values[channel][at] = read(channel);
    view.count = at + 1;
  };
  // First sample at or after the left edge; the one before it anchors the line.
  let first = 0;
  while (first < total && track.timeAt(first) < start) first += 1;
  if (first > 0) {
    const before = first - 1;
    const hold = first >= total || track.timeAt(first) - track.timeAt(before) > staleGapMs;
    const u = hold
      ? 0
      : (start - track.timeAt(before)) / (track.timeAt(first) - track.timeAt(before));
    add(0, track.absAt(before), (channel) => {
      const from = track.valueAt(channel, before);
      return hold ? from : from + u * (track.valueAt(channel, first) - from);
    });
  }
  // About two points per pixel are plenty.
  const stride = Math.max(1, Math.floor((total - first) / Math.max(1, width * 2)));
  let previous = first > 0 ? first - 1 : -1;
  for (let index = first; index < total; index += stride) {
    const time = track.timeAt(index);
    if (time > end) break;
    if (previous >= 0 && time - track.timeAt(previous) > staleGapMs) {
      const held = previous;
      add(toX(time), track.absAt(held), (channel) => track.valueAt(channel, held));
    }
    add(toX(time), track.absAt(index), (channel) => track.valueAt(channel, index));
    previous = index;
  }
  // Close the line exactly on the right edge.
  if (previous < 0) return;
  const last = previous;
  const next = last + 1;
  const lastTime = track.timeAt(last);
  if (lastTime >= end) return;
  const interpolate = next < total && track.timeAt(next) - lastTime <= staleGapMs;
  const u = interpolate ? (end - lastTime) / (track.timeAt(next) - lastTime) : 0;
  add(width, track.absAt(last), (channel) => {
    const from = track.valueAt(channel, last);
    return interpolate ? from + u * (track.valueAt(channel, next) - from) : from;
  });
};

export type GridLine = 'none' | 'line' | 'dashed';
export type AbsLine = 'OFF' | 'LINE' | 'DOTTED';

const gridDash: readonly number[] = [4, 4];
const absDash: readonly number[] = [5, 2];
const shadowBlur = 3;
const shadowAlpha = 0.66;
const absShadowAlpha = 0.66;

export const withAlpha = (color: string, alpha: number): string => {
  const value = Math.max(0, Math.min(1, alpha));
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(color)) {
    let digits = color.slice(1).split('');
    if (digits.length === 3)
      digits = [
        digits[0] ?? '0',
        digits[0] ?? '0',
        digits[1] ?? '0',
        digits[1] ?? '0',
        digits[2] ?? '0',
        digits[2] ?? '0',
      ];
    const rgb = Number(`0x${digits.join('')}`);
    return `rgba(${String((rgb >> 16) & 255)},${String((rgb >> 8) & 255)},${String(rgb & 255)},${String(value)})`;
  }
  if (color.startsWith('rgba('))
    return color.replace(/rgba\(([^)]+),\s*[^)]+\)/, `rgba($1,${String(value)})`);
  if (color.startsWith('rgb(')) return color.replace(/rgb\(([^)]+)\)/, `rgba($1,${String(value)})`);
  return color;
};

type GridOptions = Readonly<{
  width: number;
  height: number;
  lumina: boolean;
  horizontal: GridLine;
  middle: GridLine;
  vertical: GridLine;
  /** How far the trace has scrolled, in pixels. */
  scroll: number;
}>;

/** The scrolling grid behind the traces. */
export const drawGrid = (context: CanvasRenderingContext2D, options: GridOptions): void => {
  const { width, height, scroll } = options;
  if (width <= 0) return;
  context.strokeStyle = options.lumina ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.2)';
  context.lineWidth = 1;
  context.shadowBlur = 0;
  context.shadowColor = 'transparent';
  const dashLength = gridDash.reduce((sum, part) => sum + part, 0);
  const dashOffset = dashLength > 0 ? scroll % dashLength : 0;
  const horizontalLine = (fraction: number, style: GridLine) => {
    if (style === 'none') return;
    if (style === 'dashed') {
      context.setLineDash([...gridDash]);
      context.lineDashOffset = dashOffset;
    } else {
      context.setLineDash([]);
      context.lineDashOffset = 0;
    }
    const y = height - height * fraction;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  };
  horizontalLine(0.25, options.horizontal);
  horizontalLine(0.5, options.middle);
  horizontalLine(0.75, options.horizontal);
  if (options.vertical !== 'none') {
    context.lineDashOffset = 0;
    context.setLineDash(options.vertical === 'dashed' ? [...gridDash] : []);
    const step = width / 4;
    const shift = scroll % step;
    context.beginPath();
    for (let x = step - shift; x < width - 0.5; x += step) {
      if (x <= 0.5) continue;
      context.moveTo(x, 0);
      context.lineTo(x, height);
    }
    context.stroke();
  }
  context.setLineDash([]);
  context.lineDashOffset = 0;
};

type LineOptions = Readonly<{
  view: View;
  channel: ChannelId;
  color: string;
  glow: boolean;
  strokeWidth: number;
  height: number;
  /** Recolors the stretches where the sample's ABS flag is on (the ABS part of the brake). */
  secondary?: Readonly<{ color: string; style: AbsLine }>;
}>;

/** One trace over the view. */
export const drawLine = (context: CanvasRenderingContext2D, options: LineOptions): void => {
  const { view, channel, color, height, secondary } = options;
  const count = view.count;
  if (count === 0) return;
  const values = view.values[channel];
  context.lineWidth = options.strokeWidth;
  context.strokeStyle = color;
  context.shadowBlur = options.glow ? shadowBlur : 0;
  context.shadowColor = options.glow ? withAlpha(color, shadowAlpha) : 'transparent';
  context.setLineDash([]);
  context.beginPath();
  let masked = secondary !== undefined && view.abs[0] === 1;
  if (masked && secondary !== undefined) {
    context.strokeStyle = secondary.color;
    context.shadowColor = withAlpha(secondary.color, absShadowAlpha);
    if (secondary.style === 'DOTTED') context.setLineDash([...absDash]);
  }
  for (let index = 0; index < count; index += 1) {
    const x = view.x[index] ?? 0;
    const y = height - height * (values[index] ?? 0);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
    if (secondary !== undefined) {
      const now = view.abs[index] === 1;
      if (now !== masked) {
        context.stroke();
        if (now) {
          context.strokeStyle = secondary.color;
          context.shadowColor = withAlpha(secondary.color, absShadowAlpha);
          if (secondary.style === 'DOTTED') context.setLineDash([...absDash]);
        } else {
          context.strokeStyle = color;
          context.shadowColor = options.glow ? withAlpha(color, shadowAlpha) : 'transparent';
          context.setLineDash([]);
        }
        context.beginPath();
        context.moveTo(x, y);
        masked = now;
      }
    }
  }
  context.stroke();
};
