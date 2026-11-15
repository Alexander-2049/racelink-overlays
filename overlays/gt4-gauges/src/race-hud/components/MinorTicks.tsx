import type { GaugeTickGeometryProps } from "./GaugeDial.types";
import { polarToCartesian } from "../utils/gaugeMath";

type MinorTicksProps = GaugeTickGeometryProps & {
  fromValue: number;
  toValue: number;
  steps: number;
  angleForValue: (value: number) => number;
};

const MinorTicks = ({ fromValue, toValue, steps, ...props }: MinorTicksProps) => {
  const valueStep = (toValue - fromValue) / steps;

  return Array.from({ length: steps - 1 }, (_, index) => (
    <MinorTick
      key={index}
      value={fromValue + valueStep * (index + 1)}
      stepIndex={index + 1}
      {...props}
    />
  ));
};

type MinorTickProps = GaugeTickGeometryProps & {
  value: number;
  stepIndex: number;
  angleForValue: (value: number) => number;
};

const MinorTick = ({ centerX, centerY, size, value, stepIndex, angleForValue, colors, geometry }: MinorTickProps) => {
  const isLongTick = stepIndex === 2;
  const outerRadius = size * geometry.minorTickOuterRadiusFactor;
  const tickLength = isLongTick
    ? size * geometry.majorTickLengthFactor
    : size * geometry.minorTickLengthFactor;
  const angle = angleForValue(value);
  const tickStart = polarToCartesian(centerX, centerY, outerRadius - tickLength, angle);
  const tickEnd = polarToCartesian(centerX, centerY, outerRadius, angle);

  return (
    <line
      x1={tickStart.x}
      y1={tickStart.y}
      x2={tickEnd.x}
      y2={tickEnd.y}
      stroke={colors.majorTick}
      strokeWidth={isLongTick ? geometry.majorTickWidth : geometry.minorTickWidth}
      className="gauge-minor-tick"
    />
  );
};

export default MinorTicks;
