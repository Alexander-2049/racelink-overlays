import { useEffect, useRef, type CSSProperties } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import { TraceBuffer, type TraceSample } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/traceBuffer.ts';
import type { Settings } from './racelink-settings';

type Series = Readonly<{ key: 'throttle' | 'brake' | 'clutch' | 'steering'; color: string }>;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

const seriesOf = (settings: Settings): Series[] => {
  const list: Series[] = [];
  if (settings.showSteering) list.push({ key: 'steering', color: settings.steeringColor });
  if (settings.showClutch) list.push({ key: 'clutch', color: settings.clutchColor });
  if (settings.showBrake) list.push({ key: 'brake', color: settings.brakeColor });
  if (settings.showThrottle) list.push({ key: 'throttle', color: settings.throttleColor });
  return list;
};

/** 0 (bottom) .. 1 (top) of a sample for a series; steering is -1..1 centred. */
const levelOf = (sample: TraceSample, key: Series['key']): number =>
  key === 'steering' ? (Math.max(-1, Math.min(1, sample.steering)) + 1) / 2 : clamp01(sample[key]);

const draw = (
  canvas: HTMLCanvasElement,
  buffer: TraceBuffer,
  settings: Settings,
  gridColor: string,
): void => {
  const ratio = window.devicePixelRatio;
  const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext('2d');
  if (ctx === null) return;
  ctx.clearRect(0, 0, width, height);
  const thick = settings.thickness * ratio;
  const pad = thick / 2 + ratio;
  const top = pad;
  const span = Math.max(1, height - pad * 2);
  const yOf = (level: number): number => top + span * (1 - level);

  if (settings.showGrid && settings.gridLines > 0) {
    ctx.globalAlpha = settings.gridOpacity;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = Math.max(1, ratio);
    const count = settings.gridLines;
    for (let index = 0; index < count; index += 1) {
      const level = count === 1 ? 0.5 : index / (count - 1);
      const y = Math.round(yOf(level)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  const now = performance.now();
  const windowMs = settings.seconds * 1000;
  const samples = buffer.samples;
  const xOf = (t: number): number => width - ((now - t) / windowMs) * width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const series of seriesOf(settings)) {
    if (samples.length === 0) break;
    ctx.beginPath();
    samples.forEach((sample, index) => {
      const x = xOf(sample.t);
      const y = yOf(levelOf(sample, series.key));
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const last = samples[samples.length - 1];
    if (last !== undefined) ctx.lineTo(width, yOf(levelOf(last, series.key)));
    ctx.strokeStyle = series.color;
    ctx.lineWidth = thick;
    ctx.stroke();
    if (settings.fill) {
      ctx.lineTo(width, yOf(0));
      const first = samples[0];
      ctx.lineTo(first === undefined ? 0 : xOf(first.t), yOf(0));
      ctx.closePath();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = series.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (settings.showValues && last !== undefined && series.key !== 'steering') {
      const size = Math.max(10 * ratio, Math.min(height * 0.28, 18 * ratio));
      ctx.font = `700 ${String(size)}px Bahnschrift, 'Segoe UI', sans-serif`;
      ctx.fillStyle = series.color;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const y = Math.max(size + 2, yOf(levelOf(last, series.key)) - thick);
      ctx.fillText(String(Math.round(clamp01(last[series.key]) * 100)), width - 4 * ratio, y);
    }
  }
};

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  // Redraws on settings changes only; the graph draws itself on a timer.
  const { settings } = useOverlay(overlay, 2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef(new TraceBuffer(settings.seconds * 1000));

  useEffect(() => {
    const buffer = bufferRef;
    buffer.current = new TraceBuffer(settings.seconds * 1000);
    // The demo opens with its last seconds already drawn.
    for (const { sampledAt, data } of overlay.demoHistory('car', settings.seconds, 60))
      buffer.current.push({
        t: sampledAt,
        throttle: data.throttle,
        brake: data.brake,
        clutch: data.clutch,
        steering: data.steering,
      });
    const off = overlay.on('telemetry', ({ car }) => {
      buffer.current.push({
        t: performance.now(),
        throttle: car.throttle,
        brake: car.brake,
        clutch: car.clutch,
        steering: car.steering,
      });
    });
    return off;
  }, [overlay, settings.seconds]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const current = overlay.settings;
      bufferRef.current.prune(performance.now());
      const grid = getComputedStyle(canvas).getPropertyValue('--an-fg').trim() || '#ffffff';
      draw(canvas, bufferRef.current, current, grid);
    }, 1000 / Math.max(10, settings.fps));
    return () => {
      window.clearInterval(timer);
    };
  }, [overlay, settings.fps]);

  const style = {
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
  } as CSSProperties;
  return (
    <div className="an tr-root" data-theme={settings.theme} style={style}>
      <div className="an-panel tr-panel">
        <canvas ref={canvasRef} className="tr-canvas" />
      </div>
    </div>
  );
}
