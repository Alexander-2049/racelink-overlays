export type GaugeVisualTuning = {
  labelFontSize: number;
  odometerFontSize: number;
  labelStrokeWidth: number;
  odometerStrokeWidth: number;
  tickColor: string;
  labelFill: string;
  odometerFill: string;
  fuelColor: string;
  fuelTextColor: string;
  fuelTextOpacity: number;
  throttleColor: string;
  brakeColor: string;
  needleStartColor: string;
  needleEndColor: string;
  gearColor: string;
  gearBackgroundColor: string;
  gearBackgroundOpacity: number;
  speedReadoutColor: string;
  speedUnitColor: string;
  speedUnitOpacity: number;
  backgroundGradientColor: string;
  backgroundGradientOpacity: number;
  centerGradientColor: string;
  centerGradientOpacity: number;
  gForceBallColor: string;
  redlineColor: string;
  shiftFlashColor: string;
};

export type LayoutVisibility = {
  fuelIndicator: boolean;
  speedometer: boolean;
  rpmDial: boolean;
  gForces: boolean;
  gear: boolean;
  speed: boolean;
  pedals: boolean;
};

export type GaugeGeometry = {
  majorTickOuterRadiusFactor: number;
  majorTickLengthFactor: number;
  majorTickWidth: number;
  minorTickOuterRadiusFactor: number;
  minorTickLengthFactor: number;
  minorTickWidth: number;
  labelRadiusFactor: number;
  redlineOuterRadiusFactor: number;
  redlineThicknessFactor: number;
  needleLengthFactor: number;
  needleWidthFactor: number;
};

export type PedalLayout = {
  gasOffsetX: number;
  gasOffsetY: number;
  brakeOffsetX: number;
  brakeOffsetY: number;
  scale: number;
};

export type FuelLayout = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

export type GaugeLayout = {
  speedCenterX: number;
  speedCenterY: number;
  speedSize: number;
  tachCenterX: number;
  tachCenterY: number;
  tachSize: number;
};

export type GaugeAngles = {
  speedStartAngle: number;
  speedEndAngle: number;
  tachStartAngle: number;
  tachEndAngle: number;
};

export const DEFAULT_GAUGE_SIZE = 429;

export const defaultVisualTuning: GaugeVisualTuning = {
  labelFontSize: 22,
  odometerFontSize: 20,
  labelStrokeWidth: 1.7,
  odometerStrokeWidth: 1.5,
  tickColor: "#C9C9C9",
  labelFill: "#E9EDF5",
  odometerFill: "#A9DDFF",
  fuelColor: "#91B7E4",
  fuelTextColor: "#A0A0A0",
  fuelTextOpacity: 0.82,
  throttleColor: "#91B7E4",
  brakeColor: "#D71920",
  needleStartColor: "#FF2A22",
  needleEndColor: "#B00000",
  gearColor: "#000000",
  gearBackgroundColor: "#8FAED0",
  gearBackgroundOpacity: 0.86,
  speedReadoutColor: "#A9DDFF",
  speedUnitColor: "#D8DEE8",
  speedUnitOpacity: 0.78,
  backgroundGradientColor: "#000000",
  backgroundGradientOpacity: 0.8,
  centerGradientColor: "#000000",
  centerGradientOpacity: 0.8,
  gForceBallColor: "#A9DDFF",
  redlineColor: "#FF1712",
  shiftFlashColor: "#FF2A22",
};

export const defaultLayoutVisibility: LayoutVisibility = {
  fuelIndicator: true,
  speedometer: true,
  rpmDial: true,
  gForces: true,
  gear: true,
  speed: true,
  pedals: true,
};

export const defaultGaugeGeometry: GaugeGeometry = {
  majorTickOuterRadiusFactor: 0.46,
  majorTickLengthFactor: 0.045,
  majorTickWidth: 2.7,
  minorTickOuterRadiusFactor: 0.46,
  minorTickLengthFactor: 0.01125,
  minorTickWidth: 2.15,
  labelRadiusFactor: 0.355,
  redlineOuterRadiusFactor: 0.485,
  redlineThicknessFactor: 0.13,
  needleLengthFactor: 1.29,
  needleWidthFactor: 2,
};

export const defaultPedalLayout: PedalLayout = {
  gasOffsetX: -0.57,
  gasOffsetY: -0.324,
  brakeOffsetX: 0.37,
  brakeOffsetY: -0.324,
  scale: 0.003412,
};

export const defaultFuelLayout: FuelLayout = {
  offsetX: -0.579,
  offsetY: -0.324,
  scale: 0.003412,
};

export const defaultGaugeLayout: GaugeLayout = {
  speedCenterX: 360,
  speedCenterY: 250,
  speedSize: DEFAULT_GAUGE_SIZE,
  tachCenterX: 1072,
  tachCenterY: 250,
  tachSize: DEFAULT_GAUGE_SIZE,
};

export const defaultGaugeAngles: GaugeAngles = {
  speedStartAngle: 230,
  speedEndAngle: 464,
  tachStartAngle: 256,
  tachEndAngle: 489,
};
