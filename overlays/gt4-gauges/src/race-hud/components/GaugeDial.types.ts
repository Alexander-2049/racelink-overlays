import type { GaugeGeometry } from "../config/hudConfig";
import type { GaugeColors } from "../config/gaugeTheme";

export type GaugeDialProps = {
  centerX: number;
  centerY: number;
  size: number;
  value: number;
  maxValue: number;
  startAngle?: number;
  endAngle?: number;
  majorStep: number;
  majorStartValue?: number;
  angleStartValue?: number;
  minorStepsPerMajor?: number;
  labelFormatter?: (value: number) => string;
  pedal?: {
    offsetX: number;
    offsetY: number;
    scale: number;
    value: number;
    color: string;
    mirrored?: boolean;
  };
  fuel?: {
    offsetX: number;
    offsetY: number;
    scale: number;
    value: number;
    color?: string;
  };
  odometerValue?: number;
  showOdometer?: boolean;
  showRedline?: boolean;
  redlineFromValue?: number;
  redlineToValue?: number;
  idPrefix: string;
  colors: GaugeColors;
  geometry?: GaugeGeometry;
};

export type GaugeTickGeometryProps = {
  centerX: number;
  centerY: number;
  size: number;
  colors: GaugeColors;
  geometry: GaugeGeometry;
};
