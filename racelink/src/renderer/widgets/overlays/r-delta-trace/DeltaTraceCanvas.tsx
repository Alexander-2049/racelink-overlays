import { useEffect, useRef } from 'react';
import { hexToRgba } from '../r-common/driver/format';
import { deltaOfSamples, type Marker, type Section, type TracePoint } from './trace';

export type CursorSample = Readonly<{ pct: number; delta: number; ts: number }>;

export type DeltaTraceSettings = Readonly<{
  minSpread: number;
  maxSpread: number;
  areaFill: boolean;
  lineWidth: number;
  colorPositive: string;
  colorNegative: string;
  zeroAxisStyle: string;
  zeroAxisColor: string;
  /** Turns of the track; empty when the layout is not known. */
  turns: readonly Marker[];
  showTurnMarkers: boolean;
  showTurnLimits: boolean;
  turnMarkerStyle: string;
  turnLineStyle: string;
  turnNumberStyle: string;
  turnNumberColor: string;
  turnColor: string;
  sectors: readonly Marker[];
  /** The parts of the lap the section bars show. */
  sections: readonly Section[];
  showSectorMarkers: boolean;
  showSectorNumbers: boolean;
  sectorColor: string;
  sectorNumberColor: string;
  showSectionDeltas: boolean;
  sectionBarTheme: string;
  showSectionDeltaNumbers: boolean;
  sectionDeltaDecimals: number;
  showSectionDeltaSigns: boolean;
  showPositionCursor: boolean;
  cursorStyle: string;
  cursorColor: string;
  ghostColor: string;
  ghostLineStyle: string;
  showGhostLine: boolean;
  ghostLineOpacity: number;
  showGhostAreaFill: boolean;
  showGhostSectionDeltas: boolean;
  highlightedRange: Section | null;
  highlightColor: string;
  textScale: number;
  fontFamily: string;
}>;

/** What the canvas draws; read on every animation frame. */
export interface DeltaTraceFrame {
  samples: readonly TracePoint[];
  ghost: readonly TracePoint[];
  latest: CursorSample | null;
  previous: CursorSample | null;
  lapDistPct: number | null;
}

const padding = 4;
const traceInset = 3;
const fillTop = 0.55;
const fillZero = 0.3;
const cursorLineAlpha = 0.45;
const dotRadius = 3;
const playheadSize = 5;
const chevronWidth = 7;
const chevronHeight = 5;
const crosshairHalf = 5;
const ghostLineWidth = 1;
const ghostFillEdge = 0.22;
const ghostFillMiddle = 0.06;
const sectionsReservedBase = 26;
const sectionsReservedMinimal = 5;
const sectionsGap = 4;
const barGap = 4;
const barRadius = 2;
const unpostedColor = hexToRgba('#3F3F44', 0.5);
const unpostedStroke = 'rgba(255, 255, 255, 0.025)';
const barStroke = 'rgba(255, 255, 255, 0.2)';
const labelColor = 'rgba(255, 255, 255, 0.95)';
const labelShadow = 'rgba(0, 0, 0, 0.7)';
const minLabelWidth = 28;
const minLabelDelta = 0.005;
const turnLineAlpha = 0.22;
const turnLineDash = [3, 3];
const turnTickHeight = 6;
const turnTickAlpha = 0.85;
const turnRegionAlpha = 0.06;
const turnGradientAlpha = 0.15;
const turnUnderlineAlpha = 0.5;
const turnUnderlineHeight = 2;
const turnNumberGap = 16;
const turnPrefixedGap = 22;
const turnBigFont = 44;
const turnBigShare = 0.55;
const turnBigGap = 24;
const turnBigAlpha = 0.18;

/** A section's delta: the trace at its end minus at its start; `null` before the car got there. */
const sectionDelta = (deltaAt: (pct: number) => number, section: Section): number | null => {
  const start = deltaAt(section.startPct);
  const end = deltaAt(section.endPct);
  return Number.isFinite(start) && Number.isFinite(end) ? end - start : null;
};

const darken = (hex: string, amount: number): string => {
  const value = hex.replace('#', '');
  if (value.length !== 6) return hex;
  const channel = (at: number) =>
    Math.max(0, Math.min(255, Math.round(parseInt(value.slice(at, at + 2), 16) * (1 - amount))))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(2)}${channel(4)}`;
};

/** The delta trace: the live delta along the lap, filled red where time is lost and green where gained. */
export function DeltaTraceCanvas({
  frame,
  settings,
}: Readonly<{ frame: { current: DeltaTraceFrame }; settings: DeltaTraceSettings }>) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const config = useRef(settings);
  const size = useRef({ width: 0, height: 0 });

  useEffect(() => {
    config.current = settings;
  });

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        size.current = { width: entry.contentRect.width, height: entry.contentRect.height };
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    let animation = 0;
    const draw = () => {
      animation = requestAnimationFrame(draw);
      const s = config.current;
      const { samples, ghost, latest, previous, lapDistPct } = frame.current;
      const width = Math.max(1, Math.floor(size.current.width));
      const height = Math.max(2, Math.floor(size.current.height));
      const ratio = window.devicePixelRatio || 1;
      if (
        element.width !== Math.floor(width * ratio) ||
        element.height !== Math.floor(height * ratio)
      ) {
        element.width = Math.floor(width * ratio);
        element.height = Math.floor(height * ratio);
        element.style.height = `${String(height)}px`;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineCap = 'butt';
      context.lineJoin = 'round';

      // Layout: the trace on top, the section bars (and ghost bars) below.
      const sections = s.sections;
      const reserved = (theme: string) => {
        const base = theme === 'MINIMAL' ? sectionsReservedMinimal : sectionsReservedBase;
        return Math.max(base, Math.round(base * s.textScale));
      };
      const showSections = s.showSectionDeltas && sections.length > 0;
      const showGhostBars = s.showGhostSectionDeltas && ghost.length > 1 && sections.length > 0;
      const sectionsHeight = showSections ? reserved(s.sectionBarTheme) : 0;
      const ghostHeight = showGhostBars ? reserved(s.sectionBarTheme) : 0;
      const gap = showSections || showGhostBars ? sectionsGap : 0;
      const ghostGap = showSections && showGhostBars ? sectionsGap : 0;
      const traceHeight = Math.max(2, height - sectionsHeight - ghostHeight - gap - ghostGap);
      const halfH = traceHeight / 2;
      const sectionsTop = height - sectionsHeight;
      const ghostTop = sectionsTop - ghostGap - ghostHeight;

      // The trace buffer: one value per two pixels, interpolated between samples.
      const count = Math.max(50, Math.floor(width / 2));
      const buffer = new Float32Array(count).fill(NaN);
      let spread = s.minSpread / 2;
      let lastIndex = -1;
      let lastValue = 0;
      for (const sample of samples) {
        const pct = Math.max(0, Math.min(0.9999999, sample.p));
        const index = Math.floor(pct * count);
        if (lastIndex < 0) {
          for (let fill = 0; fill < index; fill += 1)
            buffer[fill] = (fill / Math.max(1, index)) * sample.d;
          buffer[index] = sample.d;
        } else if (index <= lastIndex) {
          buffer[index] = sample.d;
        } else {
          for (let fill = lastIndex + 1; fill <= index; fill += 1) {
            buffer[fill] =
              lastValue + ((fill - lastIndex) / (index - lastIndex)) * (sample.d - lastValue);
          }
        }
        lastIndex = index;
        lastValue = sample.d;
      }
      for (const value of buffer)
        if (Number.isFinite(value)) spread = Math.max(spread, Math.abs(value));
      spread = Math.min(spread, Math.max(s.minSpread, s.maxSpread) / 2);
      const usable = Math.max(1, halfH - traceInset);
      const xOf = (index: number) => (index / Math.max(1, count - 1)) * width;
      const yOf = (delta: number) => halfH - (delta / spread) * usable;
      const deltaAt = (pct: number) =>
        buffer[Math.max(0, Math.min(count - 1, Math.floor(pct * count)))] ?? NaN;

      // The car position, carried forward between samples.
      let cursorPct: number | null = null;
      let cursorDelta = 0;
      if (latest) {
        cursorPct = latest.pct;
        cursorDelta = latest.delta;
        if (previous && latest.ts > previous.ts && latest.pct > previous.pct) {
          const span = latest.pct - previous.pct;
          if (span < 0.1) {
            const rate = span / (latest.ts - previous.ts);
            const elapsed = Math.min(performance.now() - latest.ts, 2 * (latest.ts - previous.ts));
            cursorPct = Math.min(0.9999999, latest.pct + rate * elapsed);
          }
        }
      } else if (lapDistPct !== null && Number.isFinite(lapDistPct)) {
        cursorPct = Math.max(0, Math.min(0.9999999, lapDistPct));
      }

      // Sectors: every other one shaded, numbers along the bottom.
      if (s.showSectorMarkers) {
        context.fillStyle = hexToRgba(s.sectorColor, 0.14);
        s.sectors.forEach((sector, index) => {
          if (index % 2 !== 0 || sector.end <= sector.start) return;
          const left = Math.round(sector.start * width);
          context.fillRect(
            left,
            0,
            Math.max(1, Math.round(sector.end * width) - left),
            traceHeight,
          );
        });
      }
      if (s.showSectorNumbers) {
        context.font = `${String(Math.max(7, Math.round(11 * s.textScale)))}px ${s.fontFamily}`;
        context.fillStyle = s.sectorNumberColor;
        context.textAlign = 'center';
        context.textBaseline = 'bottom';
        const y = traceHeight - Math.round(3 * s.textScale);
        const minGap = Math.round(22 * s.textScale);
        let lastX = -Infinity;
        for (const sector of s.sectors) {
          const x = ((sector.start + sector.end) / 2) * width;
          if (x - lastX < minGap) continue;
          context.fillText(`S${String(sector.number)}`, x, y);
          lastX = x;
        }
      }
      // Turns: their limits, then their numbers.
      if (s.showTurnLimits && s.turns.length > 0) {
        const edges = (turn: Marker) => [
          Math.round(turn.start * width),
          Math.round(turn.end * width),
        ];
        const withMiddle =
          s.turnMarkerStyle === 'MIDDLE' || s.turnMarkerStyle === 'START_MIDDLE_END';
        const withEnds =
          s.turnMarkerStyle === 'START_END' || s.turnMarkerStyle === 'START_MIDDLE_END';
        const strokeAt = (xs: readonly number[], top: number, bottom: number) => {
          context.beginPath();
          for (const x of xs) {
            context.moveTo(x + 0.5, top);
            context.lineTo(x + 0.5, bottom);
          }
          context.stroke();
        };
        const markers = (turn: Marker) => [
          ...(withEnds ? edges(turn) : []),
          ...(withMiddle ? [Math.round(turn.position * width)] : []),
        ];
        const fillTurns = (fill: string | CanvasGradient, top: number, height: number) => {
          context.fillStyle = fill;
          for (const turn of s.turns) {
            if (turn.end <= turn.start) continue;
            const [left = 0, right = 0] = edges(turn);
            context.fillRect(left, top, Math.max(1, right - left), height);
          }
        };
        switch (s.turnLineStyle) {
          case 'TOP_TICKS':
          case 'BOTTOM_TICKS': {
            context.strokeStyle = hexToRgba(s.turnColor, turnTickAlpha);
            context.lineWidth = 1;
            const top = s.turnLineStyle === 'TOP_TICKS' ? 0 : traceHeight - turnTickHeight;
            strokeAt(s.turns.flatMap(markers), top, top + turnTickHeight);
            break;
          }
          case 'REGIONS':
            fillTurns(hexToRgba(s.turnColor, turnRegionAlpha), 0, traceHeight);
            break;
          case 'GRADIENT_REGIONS': {
            const gradient = context.createLinearGradient(0, 0, 0, traceHeight);
            gradient.addColorStop(0, hexToRgba(s.turnColor, 0));
            gradient.addColorStop(1, hexToRgba(s.turnColor, turnGradientAlpha));
            fillTurns(gradient, 0, traceHeight);
            break;
          }
          case 'UNDERLINES':
          case 'UPPERLINES':
            fillTurns(
              hexToRgba(s.turnColor, turnUnderlineAlpha),
              s.turnLineStyle === 'UPPERLINES' ? 0 : traceHeight - turnUnderlineHeight,
              turnUnderlineHeight,
            );
            break;
          default:
            context.strokeStyle = hexToRgba(s.turnColor, turnLineAlpha);
            context.lineWidth = 1;
            if (withEnds) strokeAt(s.turns.flatMap(edges), 0, traceHeight);
            if (withMiddle) {
              context.setLineDash(turnLineDash);
              strokeAt(
                s.turns.map((turn) => Math.round(turn.position * width)),
                0,
                traceHeight,
              );
              context.setLineDash([]);
            }
        }
      }
      if (s.showTurnMarkers && s.turns.length > 0) {
        // A turn across the line comes in two pieces; its number shows once.
        const seen = new Set<number>();
        let lastX = -Infinity;
        if (s.turnNumberStyle === 'BIG') {
          const size = Math.max(
            14,
            Math.min(turnBigFont * s.textScale, Math.floor(traceHeight * turnBigShare)),
          );
          const gap = Math.round(turnBigGap * s.textScale);
          context.font = `bold ${String(size)}px ${s.fontFamily}`;
          context.fillStyle = hexToRgba(s.turnNumberColor, turnBigAlpha);
          context.textAlign = 'left';
          context.textBaseline = 'middle';
          for (const turn of s.turns) {
            const x = turn.start * width + 2;
            if (x - lastX < gap || seen.has(turn.number)) continue;
            seen.add(turn.number);
            context.fillText(String(turn.number), x, traceHeight / 2);
            lastX = x;
          }
        } else {
          const prefixed = s.turnNumberStyle === 'PREFIXED';
          const gap = Math.round((prefixed ? turnPrefixedGap : turnNumberGap) * s.textScale);
          context.font = `${String(Math.max(7, Math.round(11 * s.textScale)))}px ${s.fontFamily}`;
          context.fillStyle = s.turnNumberColor;
          context.textAlign = 'center';
          context.textBaseline = 'bottom';
          const y = traceHeight - Math.round(3 * s.textScale);
          for (const turn of s.turns) {
            const x = turn.position * width;
            if (x - lastX < gap || seen.has(turn.number)) continue;
            seen.add(turn.number);
            context.fillText(`${prefixed ? 'T' : ''}${String(turn.number)}`, x, y);
            lastX = x;
          }
        }
      }

      // Zero axis.
      if (s.zeroAxisStyle !== 'NONE') {
        context.strokeStyle = s.zeroAxisColor;
        context.lineWidth = 1;
        context.setLineDash(
          s.zeroAxisStyle === 'DOTTED' ? [1, 3] : s.zeroAxisStyle === 'DASHED' ? [4, 4] : [],
        );
        context.beginPath();
        context.moveTo(0, halfH);
        context.lineTo(width, halfH);
        context.stroke();
        context.setLineDash([]);
      }

      // The ghost lap.
      if (ghost.length > 1) {
        const gx = (pct: number) => pct * width;
        if (s.showGhostAreaFill) {
          const gradient = context.createLinearGradient(0, 0, 0, 2 * halfH);
          gradient.addColorStop(0, hexToRgba(s.ghostColor, ghostFillEdge));
          gradient.addColorStop(0.5, hexToRgba(s.ghostColor, ghostFillMiddle));
          gradient.addColorStop(1, hexToRgba(s.ghostColor, ghostFillEdge));
          context.fillStyle = gradient;
          context.beginPath();
          context.moveTo(gx(ghost[0]?.p ?? 0), halfH);
          for (const point of ghost) context.lineTo(gx(point.p), yOf(point.d));
          context.lineTo(gx(ghost[ghost.length - 1]?.p ?? 0), halfH);
          context.closePath();
          context.fill();
        }
        if (s.showGhostLine) {
          context.strokeStyle = hexToRgba(
            s.ghostColor,
            Math.max(0, Math.min(1, s.ghostLineOpacity)),
          );
          context.lineWidth = ghostLineWidth;
          context.setLineDash(
            s.ghostLineStyle === 'DASHED' ? [4, 3] : s.ghostLineStyle === 'DOTTED' ? [1, 3] : [],
          );
          context.beginPath();
          ghost.forEach((point, index) => {
            if (index === 0) context.moveTo(gx(point.p), yOf(point.d));
            else context.lineTo(gx(point.p), yOf(point.d));
          });
          context.stroke();
          context.setLineDash([]);
        }
      }

      // Area fill, red above zero (losing), green below (gaining).
      const red = context.createLinearGradient(0, 0, 0, halfH);
      red.addColorStop(0, hexToRgba(s.colorPositive, fillTop));
      red.addColorStop(1, hexToRgba(s.colorPositive, fillZero));
      const green = context.createLinearGradient(0, halfH, 0, traceHeight);
      green.addColorStop(0, hexToRgba(s.colorNegative, fillZero));
      green.addColorStop(1, hexToRgba(s.colorNegative, fillTop));
      if (s.areaFill) {
        for (const side of ['above', 'below'] as const) {
          context.fillStyle = side === 'above' ? red : green;
          context.beginPath();
          for (let index = 0; index < count - 1; index += 1) {
            const a = buffer[index] ?? NaN;
            const b = buffer[index + 1] ?? NaN;
            if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
            const inA = side === 'above' ? a >= 0 : a < 0;
            const inB = side === 'above' ? b >= 0 : b < 0;
            if (!inA && !inB) continue;
            const x1 = xOf(index);
            const x2 = xOf(index + 1);
            if (inA && inB) {
              context.moveTo(x1, halfH);
              context.lineTo(x1, yOf(a));
              context.lineTo(x2, yOf(b));
              context.lineTo(x2, halfH);
              context.closePath();
            } else {
              const cross = x1 + (a / (a - b)) * (x2 - x1);
              if (inA) {
                context.moveTo(x1, halfH);
                context.lineTo(x1, yOf(a));
                context.lineTo(cross, halfH);
              } else {
                context.moveTo(cross, halfH);
                context.lineTo(x2, yOf(b));
                context.lineTo(x2, halfH);
              }
              context.closePath();
            }
          }
          context.fill();
        }
      }
      // The trace line.
      context.lineWidth = s.lineWidth;
      for (const positive of [true, false]) {
        context.strokeStyle = positive ? s.colorPositive : s.colorNegative;
        context.beginPath();
        let drawing = false;
        for (let index = 0; index < count - 1; index += 1) {
          const a = buffer[index] ?? NaN;
          const b = buffer[index + 1] ?? NaN;
          if (!Number.isFinite(a) || !Number.isFinite(b) || (a + b) / 2 >= 0 !== positive) {
            drawing = false;
            continue;
          }
          if (!drawing) {
            context.moveTo(xOf(index), yOf(a));
            drawing = true;
          }
          context.lineTo(xOf(index + 1), yOf(b));
        }
        context.stroke();
      }

      // The cursor.
      if (s.showPositionCursor && cursorPct !== null) {
        const x = cursorPct * width;
        const line = Math.round(x) + 0.5;
        const y = yOf(cursorDelta);
        const strokeLine = () => {
          context.strokeStyle = hexToRgba(s.cursorColor, cursorLineAlpha);
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(line, 0);
          context.lineTo(line, traceHeight);
          context.stroke();
        };
        switch (s.cursorStyle) {
          case 'DOT':
            context.beginPath();
            context.arc(x, y, dotRadius, 0, 2 * Math.PI);
            context.fillStyle = hexToRgba(s.cursorColor, 0.95);
            context.fill();
            context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            context.lineWidth = 1;
            context.stroke();
            break;
          case 'PLAYHEAD':
            strokeLine();
            context.fillStyle = hexToRgba(s.cursorColor, 0.85);
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x + playheadSize, playheadSize);
            context.lineTo(x, 2 * playheadSize);
            context.lineTo(x - playheadSize, playheadSize);
            context.closePath();
            context.fill();
            break;
          case 'CHEVRON':
            context.fillStyle = hexToRgba(s.cursorColor, 0.8);
            context.beginPath();
            context.moveTo(x - chevronWidth / 2, 0);
            context.lineTo(x + chevronWidth / 2, 0);
            context.lineTo(x, chevronHeight);
            context.closePath();
            context.fill();
            break;
          case 'CROSSHAIR':
            strokeLine();
            context.beginPath();
            context.moveTo(x - crosshairHalf, Math.round(y) + 0.5);
            context.lineTo(x + crosshairHalf, Math.round(y) + 0.5);
            context.stroke();
            break;
          default:
            strokeLine();
        }
      }

      // Section bars.
      const drawBars = (
        valueAt: (pct: number) => number,
        top: number,
        barHeight: number,
        tint: boolean,
        highlight: Section | null,
      ) => {
        const positive = tint ? darken(s.colorPositive, 0.45) : s.colorPositive;
        const negative = tint ? darken(s.colorNegative, 0.45) : s.colorNegative;
        const bars = sections
          .map((section, index) => {
            const left = Math.round(section.startPct * width);
            const right = Math.round(section.endPct * width);
            const before = index === 0 ? 0 : barGap / 2;
            const after = index === sections.length - 1 ? 0 : barGap / 2;
            return {
              section,
              left,
              x: left + before,
              barWidth: Math.max(1, right - left - before - after),
              sectionWidth: right - left,
              delta: sectionDelta(valueAt, section),
            };
          })
          .filter((bar) => bar.sectionWidth > 0);
        const maxAbs = Math.max(0.01, ...bars.map((bar) => Math.abs(bar.delta ?? 0)));
        const rounded = (x: number, w: number, fill: string | CanvasGradient, stroke: string) => {
          context.beginPath();
          context.roundRect(x, top, w, barHeight, barRadius);
          context.fillStyle = fill;
          context.fill();
          context.beginPath();
          context.roundRect(
            x + 0.5,
            top + 0.5,
            Math.max(0, w - 1),
            Math.max(0, barHeight - 1),
            barRadius - 0.5,
          );
          context.lineWidth = 1;
          context.strokeStyle = stroke;
          context.stroke();
        };
        const theme = s.sectionBarTheme;
        if (theme === 'BARS') {
          const middle = top + barHeight / 2;
          context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(0, middle + 0.5);
          context.lineTo(width, middle + 0.5);
          context.stroke();
        }
        for (const bar of bars) {
          if (bar.delta === null) {
            if (theme === 'BARS') {
              context.fillStyle = unpostedColor;
              context.fillRect(bar.x, top + barHeight / 2 - 1, bar.barWidth, 2);
            } else if (theme === 'MINIMAL') {
              const line = Math.min(Math.round(3 * s.textScale), Math.max(1, barHeight - 1));
              context.fillStyle = unpostedColor;
              context.fillRect(bar.x, top + barHeight - line - 1, bar.barWidth, line);
            } else rounded(bar.x, bar.barWidth, unpostedColor, unpostedStroke);
            continue;
          }
          const color = bar.delta >= 0 ? positive : negative;
          switch (theme) {
            case 'SIMPLE':
              rounded(bar.x, bar.barWidth, hexToRgba(color, 0.55), barStroke);
              break;
            case 'BARS': {
              const middle = top + barHeight / 2;
              const extent = Math.max(
                2,
                (Math.min(1, Math.abs(bar.delta) / maxAbs) * barHeight) / 2 - 1,
              );
              context.fillStyle = hexToRgba(color, 0.75);
              if (bar.delta >= 0) context.fillRect(bar.x, middle - extent, bar.barWidth, extent);
              else context.fillRect(bar.x, middle, bar.barWidth, extent);
              break;
            }
            case 'HEATMAP': {
              const share = Math.min(1, Math.abs(bar.delta) / maxAbs);
              rounded(bar.x, bar.barWidth, hexToRgba(color, 0.15 + share * 0.6), barStroke);
              break;
            }
            case 'MINIMAL': {
              const line = Math.min(Math.round(3 * s.textScale), Math.max(1, barHeight - 1));
              context.fillStyle = hexToRgba(color, 0.85);
              context.fillRect(bar.x, top + barHeight - line - 1, bar.barWidth, line);
              break;
            }
            default: {
              const gradient = context.createLinearGradient(0, top, 0, top + barHeight);
              gradient.addColorStop(0, hexToRgba(color, 0.7));
              gradient.addColorStop(1, hexToRgba(color, 0.3));
              rounded(bar.x, bar.barWidth, gradient, barStroke);
            }
          }
        }
        if (highlight) {
          const bar = bars.find(
            (candidate) => candidate.left === Math.round(highlight.startPct * width),
          );
          if (bar && bar.delta === null) {
            const gradient = context.createLinearGradient(0, top, 0, top + barHeight);
            gradient.addColorStop(0.9, hexToRgba(s.highlightColor, 0.2));
            gradient.addColorStop(1, hexToRgba(s.highlightColor, 1));
            context.beginPath();
            context.roundRect(bar.x, top, bar.barWidth, barHeight, barRadius);
            context.fillStyle = gradient;
            context.fill();
          }
        }
        if (s.showSectionDeltaNumbers && theme !== 'MINIMAL') {
          const decimals = Math.max(1, Math.min(3, Math.round(s.sectionDeltaDecimals)));
          context.font = `200 ${String(Math.max(7, Math.round(14 * s.textScale)))}px ${s.fontFamily}`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          const padX = Math.round(2 * s.textScale);
          const sample = `${s.showSectionDeltaSigns ? '-' : ''}9.${'9'.repeat(decimals)}`;
          const needed = context.measureText(sample).width + 2 * padX;
          for (const bar of bars) {
            if (bar.delta === null || Math.abs(bar.delta) < minLabelDelta) continue;
            if (bar.sectionWidth < Math.round(minLabelWidth * s.textScale) || bar.barWidth < needed)
              continue;
            const text = s.showSectionDeltaSigns
              ? bar.delta >= 0
                ? `+${bar.delta.toFixed(decimals)}`
                : bar.delta.toFixed(decimals)
              : Math.abs(bar.delta).toFixed(decimals);
            if (theme !== 'SIMPLE') {
              context.shadowColor = labelShadow;
              context.shadowBlur = 2 * s.textScale;
            }
            context.fillStyle = labelColor;
            context.fillText(text, bar.x + bar.barWidth / 2, top + barHeight / 2);
            context.shadowBlur = 0;
            context.shadowColor = 'transparent';
          }
        }
      };
      if (showSections) drawBars(deltaAt, sectionsTop, sectionsHeight, false, s.highlightedRange);
      if (showGhostBars) drawBars(deltaOfSamples(ghost), ghostTop, ghostHeight, true, null);
    };
    animation = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animation);
    };
  }, [frame]);

  return (
    <div ref={box} className="DeltaTrace" style={{ padding }}>
      <canvas ref={canvas} />
    </div>
  );
}
