import type { GaugeVisualTuning } from "./hudConfig";

export type GaugeGradientStop = {
  offset?: string;
  color: string;
  opacity?: number;
};

export type GaugeColors = {
  rimGradient: GaugeGradientStop[];
  fillGradient: GaugeGradientStop[];
  centerFillGradient: GaugeGradientStop[];
  needleGradient: GaugeGradientStop[];
  redlineGradient: GaugeGradientStop[];
  majorTick: string;
  minorTick: string;
  labelFill: string;
  labelStroke: string;
  odometerFill: string;
  odometerStroke: string;
};

export const defaultGaugeColors: GaugeColors = {
  rimGradient: [
    { color: "#D9D9D9" },
    { offset: "100%", color: "#737373", opacity: 0 },
  ],
  fillGradient: [
    { offset: "20.7%", color: "#000000", opacity: 0.8 },
    { offset: "44.2%", color: "#000000", opacity: 0.56 },
    { offset: "70.7%", color: "#000000", opacity: 0.19 },
    { offset: "89.9%", color: "#666666", opacity: 0 },
  ],
  centerFillGradient: [
    { offset: "20.7%", color: "#000000", opacity: 0.8 },
    { offset: "44.2%", color: "#000000", opacity: 0.56 },
    { offset: "70.7%", color: "#000000", opacity: 0.19 },
    { offset: "89.9%", color: "#666666", opacity: 0 },
  ],
  needleGradient: [
    { offset: "35.6%", color: "#FF2A22" },
    { offset: "100%", color: "#B00000" },
  ],
  redlineGradient: [
    { offset: "0%", color: "#FF3A32" },
    { offset: "45%", color: "#FF1712" },
    { offset: "100%", color: "#B00000" },
  ],
  majorTick: "#C9C9C9",
  minorTick: "#C9C9C9",
  labelFill: "#E9EDF5",
  labelStroke: "rgba(0, 0, 0, 0.42)",
  odometerFill: "#A9DDFF",
  odometerStroke: "rgba(0, 0, 0, 0.35)",
};

const createHudFillGradient = (
  color: string,
  maxOpacity: number,
): GaugeGradientStop[] => [
  { offset: "20.7%", color, opacity: maxOpacity },
  { offset: "44.2%", color, opacity: maxOpacity * 0.7 },
  { offset: "70.7%", color, opacity: maxOpacity * 0.2375 },
  { offset: "89.9%", color, opacity: 0 },
];

export const createGaugeColorsFromVisual = (
  visual: GaugeVisualTuning,
): Partial<GaugeColors> => ({
  fillGradient: createHudFillGradient(
    visual.backgroundGradientColor,
    visual.backgroundGradientOpacity,
  ),
  centerFillGradient: createHudFillGradient(
    visual.centerGradientColor,
    visual.centerGradientOpacity,
  ),
  majorTick: visual.tickColor,
  minorTick: visual.tickColor,
  labelFill: visual.labelFill,
  odometerFill: visual.odometerFill,
  needleGradient: [
    { offset: "35.6%", color: visual.needleStartColor },
    { offset: "100%", color: shade(visual.needleEndColor, 0.69) },
  ],
  redlineGradient: [
    { offset: "0%", color: tint(visual.redlineColor, 0.12) },
    { offset: "45%", color: visual.redlineColor },
    { offset: "100%", color: shade(visual.redlineColor, 0.69) },
  ],
});

const parseHex = (color: string) => {
  const match = /^#([0-9a-f]{6})/i.exec(color);
  if (!match) return null;
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const toHex = (channels: number[]) =>
  `#${channels
    .map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0"))
    .join("")}`;

/** The colour darkened to `factor` of its brightness (the far end of the needle and redline). */
const shade = (color: string, factor: number) => {
  const channels = parseHex(color);
  return channels ? toHex(channels.map((channel) => channel * factor)) : color;
};

/** The colour moved `amount` of the way towards white. */
const tint = (color: string, amount: number) => {
  const channels = parseHex(color);
  return channels ? toHex(channels.map((channel) => channel + (255 - channel) * amount)) : color;
};

export const resolveGaugeColors = (
  colors: Partial<GaugeColors> = {},
): GaugeColors => ({
  ...defaultGaugeColors,
  ...colors,
});
