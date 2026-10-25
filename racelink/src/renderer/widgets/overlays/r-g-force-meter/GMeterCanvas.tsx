import { useEffect, useRef, type CSSProperties } from 'react';
import { hexToRgba } from '../r-common/driver/format';

export type GMeterCanvasProps = Readonly<{
  size: number;
  /** Lateral and longitudinal force in g, in the terms of `car.accelerationG`. */
  lateral: number;
  longitudinal: number;
  paused: boolean;
  /** The scale: the force at the edge of the meter. */
  maxG: number;
  showEdge: boolean;
  edgeSize: number;
  edgeOpacity: number;
  dotVisible: boolean;
  dotRadius: number;
  currentDotColor: string;
  dotHistorySize: number;
  dotHistoryColor: string;
  decayMs: number;
  envelope: readonly number[] | null;
  envelopeVisible: boolean;
  envelopeColor: string;
  envelopeLineWidth: number;
  comparisonEnvelope: readonly number[] | null;
  comparisonEnvelopeVisible: boolean;
  comparisonEnvelopeColor: string;
  comparisonEnvelopeLineWidth: number;
  comparisonEnvelopeDash: readonly number[] | null;
}>;

interface Trail {
  cap: number;
  length: number;
  start: number;
  x: Float32Array;
  y: Float32Array;
  at: Float64Array;
}

const newTrail = (cap: number): Trail => ({
  cap,
  length: 0,
  start: 0,
  x: new Float32Array(cap),
  y: new Float32Array(cap),
  at: new Float64Array(cap),
});

/**
 * An envelope with the bins nobody reached filled from their neighbours and
 * each bin averaged with the two beside it, so one odd sample does not make a
 * spike and an unvisited direction does not pull the line to the centre.
 */
const smoothEnvelope = (bins: readonly number[]): number[] => {
  const count = bins.length;
  const known = bins.map((value) => (Number.isFinite(value) && value > 0 ? value : null));
  const filled = known.map((value, index) => {
    if (value !== null) return value;
    for (let step = 1; step < count; step += 1) {
      const before = known[(index - step + count) % count];
      const after = known[(index + step) % count];
      if (before != null && after != null) return (before + after) / 2;
      if (before != null) return before;
      if (after != null) return after;
    }
    return 0;
  });
  return filled.map(
    (value, index) =>
      ((filled[(index - 1 + count) % count] ?? value) +
        value * 2 +
        (filled[(index + 1) % count] ?? value)) /
      4,
  );
};

/**
 * The G meter canvas: the force as a dot with a fading trail, and the
 * traction envelopes as closed lines. A dot sits at x = lateral, y = longitudinal
 * (braking up); envelope bin i points at -180 + 360 i / n degrees.
 */
export function GMeterCanvas(props: GMeterCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(props);
  const trail = useRef<Trail>(newTrail(Math.max(1, props.dotHistorySize)));
  const colors = useRef(new Map<string, string>());
  const pausedAt = useRef<number | null>(null);
  const pausedFor = useRef(0);

  useEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    trail.current = newTrail(Math.max(1, props.dotHistorySize));
  }, [props.dotHistorySize]);

  // The clock stops while paused, so the trail does not fade away.
  useEffect(() => {
    const now = performance.now();
    if (props.paused) pausedAt.current ??= now;
    else if (pausedAt.current !== null) {
      pausedFor.current += now - pausedAt.current;
      pausedAt.current = null;
    }
  }, [props.paused]);

  useEffect(() => {
    const store = trail.current;
    if (props.paused && store.length > 0) return;
    if (!props.dotVisible) return;
    const now = performance.now() - pausedFor.current;
    const index = (store.start + store.length) % store.cap;
    store.x[index] = props.lateral;
    store.y[index] = props.longitudinal;
    store.at[index] = now;
    if (store.length < store.cap) store.length += 1;
    else store.start = (store.start + 1) % store.cap;
  }, [props.lateral, props.longitudinal, props.paused, props.dotVisible]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const ratio = window.devicePixelRatio || 1;
    element.width = props.size * ratio;
    element.height = props.size * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, [props.size]);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const color = (hex: string, alpha: number) => {
      const key = `${hex}_${String(alpha)}`;
      let value = colors.current.get(key);
      if (value === undefined) {
        value = hexToRgba(hex, alpha);
        colors.current.set(key, value);
      }
      return value;
    };
    const drawEnvelope = (
      bins: readonly number[],
      max: number,
      center: number,
      scale: number,
      stroke: string,
      lineWidth: number,
      dash: readonly number[] | null,
    ) => {
      const count = bins.length;
      if (count < 3) return;
      const points = smoothEnvelope(bins).map((value, index) => {
        const force = Math.max(0, Math.min(value, max));
        const angle = -Math.PI + (2 * Math.PI * index) / count;
        return {
          x: center + force * Math.sin(angle) * scale,
          y: center + force * Math.cos(angle) * scale,
        };
      });
      context.setLineDash(dash && dash.length > 0 ? [...dash] : []);
      // A smooth closed curve through the middles of the bins, not a jagged polygon.
      context.beginPath();
      const last = points[points.length - 1] ?? { x: center, y: center };
      const first = points[0] ?? last;
      context.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length] ?? point;
        context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
      });
      context.closePath();
      context.shadowColor = '#000000';
      context.shadowOffsetX = lineWidth / 2;
      context.shadowOffsetY = lineWidth / 2;
      context.lineWidth = lineWidth;
      context.strokeStyle = stroke;
      context.stroke();
      context.setLineDash([]);
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
    };
    let frame = 0;
    const draw = () => {
      const settings = latest.current;
      const store = trail.current;
      const now = (pausedAt.current ?? performance.now()) - pausedFor.current;
      while (store.length > 0 && now - (store.at[store.start] ?? 0) >= settings.decayMs) {
        store.start = (store.start + 1) % store.cap;
        store.length -= 1;
      }
      const size = settings.size;
      const center = size / 2;
      context.clearRect(0, 0, size, size);
      const max = settings.maxG > 0 ? settings.maxG : 1;
      const scale = center / max;
      if (settings.envelopeVisible && settings.envelope && settings.envelope.length >= 3) {
        drawEnvelope(
          settings.envelope,
          max,
          center,
          scale,
          settings.envelopeColor,
          settings.envelopeLineWidth,
          null,
        );
      }
      if (
        settings.comparisonEnvelopeVisible &&
        settings.comparisonEnvelope &&
        settings.comparisonEnvelope.length >= 3
      ) {
        drawEnvelope(
          settings.comparisonEnvelope,
          max,
          center,
          scale,
          settings.comparisonEnvelopeColor,
          settings.comparisonEnvelopeLineWidth,
          settings.comparisonEnvelopeDash,
        );
      }
      if (settings.dotVisible && store.length > 0) {
        const newest = (store.start + store.length - 1) % store.cap;
        for (let step = 0; step < store.length; step += 1) {
          const index = (store.start + step) % store.cap;
          const x = center + (store.x[index] ?? 0) * scale;
          const y = center + (store.y[index] ?? 0) * scale;
          const age = (now - (store.at[index] ?? 0)) / settings.decayMs;
          const isNewest = index === newest;
          const alpha = Math.round((1 - Math.min(1, Math.max(0, age))) ** 1.6 * 100) / 100;
          const radius = Math.max(1, settings.dotRadius * (1 - Math.min(1, 0.4 * age)));
          context.beginPath();
          context.arc(x, y, radius, 0, 2 * Math.PI);
          context.fillStyle = isNewest
            ? settings.currentDotColor
            : color(settings.dotHistoryColor, alpha);
          context.fill();
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const style: CSSProperties = {
    display: 'block',
    borderRadius: '50%',
    background: 'transparent',
    width: `${String(props.size)}px`,
    height: `${String(props.size)}px`,
    border: props.showEdge
      ? `${String(props.edgeSize)}em solid rgba(0,0,0,${String(props.edgeOpacity)})`
      : `${String(props.edgeSize)}em solid transparent`,
    position: 'relative',
    zIndex: 3,
  };
  return <canvas ref={canvas} style={style} width={props.size} height={props.size} />;
}
