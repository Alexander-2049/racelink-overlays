import type { GaugeGeometry } from "../config/hudConfig";
import { describeRingSegment } from "../utils/svgPath";

type GaugeRedlineProps = {
  centerX: number;
  centerY: number;
  size: number;
  maxValue: number;
  majorStep: number;
  fromValue?: number;
  toValue?: number;
  isVisible: boolean;
  angleForValue: (value: number) => number;
  idPrefix: string;
  geometry: GaugeGeometry;
};

const GaugeRedline = ({
  centerX,
  centerY,
  size,
  maxValue,
  majorStep,
  fromValue,
  toValue,
  isVisible,
  angleForValue,
  idPrefix,
  geometry,
}: GaugeRedlineProps) => {
  const resolvedFrom = fromValue ?? Math.max(maxValue * 0.875, maxValue - majorStep);
  const resolvedTo = toValue ?? maxValue;
  const clampedFrom = Math.max(0, Math.min(maxValue, resolvedFrom));
  const clampedTo = Math.max(clampedFrom, Math.min(maxValue, resolvedTo));

  if (!isVisible || clampedTo <= clampedFrom) return null;

  return (
    <path
      d={describeRingSegment({
        centerX,
        centerY,
        innerRadius:
          size *
          Math.max(0, geometry.redlineOuterRadiusFactor - geometry.redlineThicknessFactor),
        outerRadius: size * geometry.redlineOuterRadiusFactor,
        startAngle: angleForValue(clampedFrom),
        endAngle: angleForValue(clampedTo),
      })}
      fill={`url(#${idPrefix}-redline-gradient)`}
      className="gauge-redline"
    />
  );
};

export default GaugeRedline;
