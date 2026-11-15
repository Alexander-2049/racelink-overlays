import GaugeNeedle from "./GaugeNeedle";
import GaugeOdometer from "./GaugeOdometer";
import PedalIndicator from "./PedalIndicator";
import FuelIndicator from "./FuelIndicator";
import GaugeRedline from "./GaugeRedline";
import GaugeShell from "./GaugeShell";
import GaugeTicks from "./GaugeTicks";
import { defaultGaugeGeometry } from "../config/hudConfig";
import { defaultGaugeLayout } from "../config/hudConfig";
import { buildMajorValues, mapValueToAngle, roundUpToStep } from "../utils/gaugeMath";
import type { GaugeDialProps } from "./GaugeDial.types";

const GaugeDial = ({
  centerX,
  centerY,
  size,
  value,
  maxValue,
  startAngle = 235,
  endAngle = 485,
  majorStep,
  majorStartValue = 0,
  angleStartValue = 0,
  minorStepsPerMajor = 4,
  labelFormatter = (value) => String(value),
  pedal,
  fuel,
  odometerValue,
  showOdometer = false,
  showRedline = false,
  redlineFromValue,
  redlineToValue,
  idPrefix,
  colors,
  geometry = defaultGaugeGeometry,
}: GaugeDialProps) => {
  const scaleMaxValue = roundUpToStep(maxValue, majorStep, majorStartValue);
  const majorValues = buildMajorValues(maxValue, majorStep, majorStartValue);
  const angleForTick = (gaugeValue: number) =>
    mapValueToAngle(gaugeValue, angleStartValue, scaleMaxValue, startAngle, endAngle);
  const angleForNeedle = (gaugeValue: number) =>
    mapValueToAngle(
      gaugeValue,
      angleStartValue,
      scaleMaxValue,
      startAngle,
      endAngle,
      false,
  );
  const baseNeedleLength = size * 0.35;
  const odometerScale = size / defaultGaugeLayout.speedSize;

  return (
    <g>
      <GaugeShell centerX={centerX} centerY={centerY} size={size} idPrefix={idPrefix} />
      {pedal ? (
        <PedalIndicator
          x={centerX + pedal.offsetX * size}
          y={centerY + pedal.offsetY * size}
          scale={pedal.scale * size}
          value={pedal.value}
          color={pedal.color}
          mirrored={pedal.mirrored}
          idPrefix={`${idPrefix}-pedal`}
        />
      ) : null}
      {fuel ? (
        <FuelIndicator
          x={centerX + fuel.offsetX * size}
          y={centerY + fuel.offsetY * size}
          scale={fuel.scale * size}
          value={fuel.value}
          color={fuel.color}
          idPrefix={`${idPrefix}-fuel`}
        />
      ) : null}
      <GaugeRedline
        centerX={centerX}
        centerY={centerY}
        size={size}
        maxValue={scaleMaxValue}
        majorStep={majorStep}
        fromValue={redlineFromValue}
        toValue={redlineToValue}
        isVisible={showRedline}
        angleForValue={angleForTick}
        idPrefix={idPrefix}
        geometry={geometry}
      />
      <GaugeTicks
        centerX={centerX}
        centerY={centerY}
        size={size}
        majorValues={majorValues}
        minorStepsPerMajor={minorStepsPerMajor}
        angleForValue={angleForTick}
        labelFormatter={labelFormatter}
        colors={colors}
        geometry={geometry}
      />
      <GaugeNeedle
        centerX={centerX}
        centerY={centerY}
        length={baseNeedleLength * geometry.needleLengthFactor}
        width={baseNeedleLength * (5 / 179) * geometry.needleWidthFactor}
        angle={angleForNeedle(value)}
        idPrefix={idPrefix}
      />
      {showOdometer ? (
        <GaugeOdometer
          centerX={centerX}
          centerY={centerY}
          size={size}
          value={odometerValue ?? 0}
          colors={colors}
          fontScale={odometerScale}
        />
      ) : null}
    </g>
  );
};

export default GaugeDial;
export type { GaugeDialProps };

