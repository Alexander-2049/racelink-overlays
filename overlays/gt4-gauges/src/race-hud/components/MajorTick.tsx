import type { GaugeTickGeometryProps } from "./GaugeDial.types";
import { polarToCartesian } from "../utils/gaugeMath";

type MajorTickProps = GaugeTickGeometryProps & {
  angle: number;
  label: string;
};

const MajorTick = ({ centerX, centerY, size, angle, label, colors, geometry }: MajorTickProps) => {
  const outerRadius = size * geometry.majorTickOuterRadiusFactor;
  const innerRadius = outerRadius - size * geometry.majorTickLengthFactor * 0.5;
  const tickStart = polarToCartesian(centerX, centerY, innerRadius, angle);
  const tickEnd = polarToCartesian(centerX, centerY, outerRadius, angle);
  const labelPoint = polarToCartesian(
    centerX,
    centerY,
    size * geometry.labelRadiusFactor,
    angle,
  );

  return (
    <>
      <line
        x1={tickStart.x}
        y1={tickStart.y}
        x2={tickEnd.x}
        y2={tickEnd.y}
        stroke={colors.majorTick}
        strokeWidth={geometry.majorTickWidth}
        className="gauge-major-tick"
      />
      <text
        x={labelPoint.x}
        y={labelPoint.y}
        fill={colors.labelFill}
        stroke={colors.labelStroke}
        className="gauge-label"
      >
        {label}
      </text>
    </>
  );
};

export default MajorTick;
