import { useEffect, useRef, type CSSProperties } from 'react';
import { hexToRgba } from '../r-common/driver/format';

export type GForceSettings = Readonly<{
  dot: boolean;
  dotColor: string;
  dotHistoryColor: string;
  dotDecaySeconds: number;
  dotHistory: number;
  dotRadius: number;
  envelope: boolean;
  envelopeColor: string;
  envelopeLineSize: number;
  showCurrent: boolean;
  showPeak: boolean;
}>;

type Props = Readonly<{
  /** Longitudinal and lateral force in g, as the driver feels them: forward is up, left is right. */
  longitudinal: number;
  lateral: number;
  paused: boolean;
  size: number;
  settings: GForceSettings;
}>;

interface Dot {
  x: number;
  y: number;
  at: number;
}

const bins = 36;

/** The G meter: a dot trail on a circle with the highest cornering force marked as an outline. */
export function GForceMeter({ longitudinal, lateral, paused, size, settings }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef({ longitudinal, lateral, paused });
  const dots = useRef<Dot[]>([]);
  const envelope = useRef<number[]>(Array.from({ length: bins }, () => 0));
  const peak = useRef(0);
  const current = useRef(0);
  const readout = useRef<HTMLDivElement>(null);
  const config = useRef(settings);

  useEffect(() => {
    input.current = { longitudinal, lateral, paused };
    config.current = settings;
  });

  useEffect(() => {
    const element = canvas.current;
    if (element === null) return;
    const ratio = window.devicePixelRatio || 1;
    element.width = size * ratio;
    element.height = size * ratio;
    element.style.width = `${String(size)}px`;
    element.style.height = `${String(size)}px`;
    const context = element.getContext('2d');
    if (context === null) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    let frame = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const now = performance.now();
      const options = config.current;
      const { longitudinal: gy, lateral: gx, paused: isPaused } = input.current;
      if (!isPaused) {
        const magnitude = Math.hypot(gx, gy);
        current.current = magnitude;
        peak.current = Math.max(peak.current, magnitude);
        dots.current.push({ x: gx, y: gy, at: now });
        if (dots.current.length > options.dotHistory) dots.current.shift();
        const angle = Math.atan2(gx, gy);
        const bin = Math.min(bins - 1, Math.floor(((angle + Math.PI) / (2 * Math.PI)) * bins));
        envelope.current[bin] = Math.max(envelope.current[bin] ?? 0, magnitude);
      }
      const decayMs = options.dotDecaySeconds * 1000;
      while (dots.current.length > 0 && now - (dots.current[0]?.at ?? now) >= decayMs)
        dots.current.shift();
      const maxG = peak.current > 0 ? peak.current : 1;
      const radius = size / 2;
      const scale = radius / maxG;
      context.clearRect(0, 0, size, size);
      if (options.envelope && envelope.current.some((value) => value > 0)) {
        context.beginPath();
        for (let index = 0; index <= bins; index += 1) {
          const at = index % bins;
          const value = Math.min(envelope.current[at] ?? 0, maxG);
          const angle = -Math.PI + (2 * Math.PI * at) / bins;
          const x = radius + value * Math.sin(angle) * scale;
          const y = radius + value * Math.cos(angle) * scale;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.shadowColor = '#000000';
        context.shadowOffsetX = options.envelopeLineSize;
        context.shadowOffsetY = options.envelopeLineSize;
        context.lineWidth = options.envelopeLineSize;
        context.strokeStyle = options.envelopeColor;
        context.stroke();
        context.shadowColor = 'transparent';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
      }
      if (options.dot) {
        const trail = dots.current;
        trail.forEach((dot, index) => {
          const head = index === trail.length - 1;
          const age = Math.min(1, Math.max(0, (now - dot.at) / decayMs));
          const alpha = head ? 1 : Number(Math.pow(1 - age, 1.6).toFixed(2));
          context.beginPath();
          context.arc(
            radius + dot.x * scale,
            radius + dot.y * scale,
            Math.max(1, options.dotRadius * (1 - Math.min(1, 0.4 * age))),
            0,
            2 * Math.PI,
          );
          context.fillStyle = head ? options.dotColor : hexToRgba(options.dotHistoryColor, alpha);
          context.fill();
        });
      }
      const text = readout.current;
      if (text !== null) {
        const now1 = text.querySelector('.gmeter_gforce_g_curr');
        const peak1 = text.querySelector('.gmeter_gforce_g_peak');
        if (now1 !== null) now1.textContent = current.current.toFixed(1);
        if (peak1 !== null) peak1.textContent = peak.current.toFixed(1);
      }
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [size]);

  return (
    <div className="inputTelemetryGForce">
      <div
        className="GForceMeterSimple"
        style={{ minWidth: `${String(size)}px`, minHeight: `${String(size)}px` }}
      >
        <canvas
          ref={canvas}
          style={{
            display: 'block',
            borderRadius: '50%',
            background: 'transparent',
            border: '0.1em solid transparent',
            position: 'relative',
            zIndex: 3,
          }}
        />
        {(settings.showCurrent || settings.showPeak) && (
          <div className="gmeter_gforce_g" ref={readout}>
            {settings.showCurrent && (
              <span
                className="gmeter_gforce_g_curr"
                style={{ ['--gforce-curr' as string]: settings.dotColor }}
              >
                0.0
              </span>
            )}
            {settings.showPeak && <span className="gmeter_gforce_g_peak">0.0</span>}
          </div>
        )}
      </div>
    </div>
  );
}
