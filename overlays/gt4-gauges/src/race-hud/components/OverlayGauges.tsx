import type { GaugeColors } from "../config/gaugeTheme";
import {
  defaultFuelLayout,
  defaultGaugeAngles,
  defaultGaugeGeometry,
  defaultGaugeLayout,
  defaultPedalLayout,
} from "../config/hudConfig";
import type { HudModel } from "../model";
import { getNiceStep } from "../utils/gaugeMath";
import FuelIndicator from "./FuelIndicator";
import GaugeDial from "./GaugeDial";
import PedalIndicator from "./PedalIndicator";

type OverlayGaugesProps = {
  idPrefix: string;
  hud: HudModel;
  colors: GaugeColors;
};

const layout = defaultGaugeLayout;
const pedalLayout = defaultPedalLayout;
const fuelLayout = defaultFuelLayout;

const formatSpeedLabel = (value: number) => String(Math.round(value));
const formatRpmLabel = (value: number) => String(Math.round(value / 1000));

/** Pedals and fuel stay where they are when the dial they sit on is hidden. */
const OverlayGauges = ({ idPrefix, hud, colors }: OverlayGaugesProps) => {
  const { visibility } = hud;
  const speedMajorStep = getNiceStep(hud.maxSpeed, 8);
  const showFuel = visibility.fuelIndicator && hud.fuelPercent !== null;
  const brake = {
    offsetX: pedalLayout.brakeOffsetX,
    offsetY: pedalLayout.brakeOffsetY,
    scale: pedalLayout.scale,
    value: hud.brake,
    color: hud.visual.brakeColor,
    mirrored: true,
  };
  const throttle = {
    offsetX: pedalLayout.gasOffsetX,
    offsetY: pedalLayout.gasOffsetY,
    scale: pedalLayout.scale,
    value: hud.throttle,
    color: hud.visual.throttleColor,
  };
  const fuel = {
    offsetX: fuelLayout.offsetX,
    offsetY: fuelLayout.offsetY,
    scale: fuelLayout.scale,
    value: hud.fuelPercent ?? 0,
    color: hud.visual.fuelColor,
  };

  return (
    <>
      {visibility.speedometer ? (
        <GaugeDial
          centerX={layout.speedCenterX}
          centerY={layout.speedCenterY}
          size={layout.speedSize}
          value={hud.speed}
          maxValue={hud.maxSpeed}
          startAngle={defaultGaugeAngles.speedStartAngle}
          endAngle={defaultGaugeAngles.speedEndAngle}
          majorStep={speedMajorStep}
          minorStepsPerMajor={4}
          showOdometer={hud.odometer !== null}
          odometerValue={hud.odometer ?? 0}
          labelFormatter={formatSpeedLabel}
          pedal={visibility.pedals ? brake : undefined}
          fuel={showFuel ? fuel : undefined}
          showRedline={false}
          idPrefix={`${idPrefix}-speed`}
          colors={colors}
          geometry={defaultGaugeGeometry}
        />
      ) : (
        <>
          {showFuel ? (
            <FuelIndicator
              x={layout.speedCenterX + fuel.offsetX * layout.speedSize}
              y={layout.speedCenterY + fuel.offsetY * layout.speedSize}
              scale={fuel.scale * layout.speedSize}
              value={fuel.value}
              color={fuel.color}
              idPrefix={`${idPrefix}-fuel`}
            />
          ) : null}
          {visibility.pedals ? (
            <PedalIndicator
              x={layout.speedCenterX + brake.offsetX * layout.speedSize}
              y={layout.speedCenterY + brake.offsetY * layout.speedSize}
              scale={brake.scale * layout.speedSize}
              value={brake.value}
              color={brake.color}
              mirrored
              idPrefix={`${idPrefix}-brake-pedal`}
            />
          ) : null}
        </>
      )}
      {visibility.rpmDial ? (
        <GaugeDial
          centerX={layout.tachCenterX}
          centerY={layout.tachCenterY}
          size={layout.tachSize}
          value={hud.rpm}
          maxValue={hud.maxRpm}
          startAngle={defaultGaugeAngles.tachStartAngle}
          endAngle={defaultGaugeAngles.tachEndAngle}
          majorStep={hud.rpmStep}
          majorStartValue={hud.rpmStep}
          angleStartValue={hud.rpmStep}
          minorStepsPerMajor={4}
          labelFormatter={formatRpmLabel}
          pedal={visibility.pedals ? throttle : undefined}
          showRedline={hud.redlineFromRpm !== null}
          redlineFromValue={hud.redlineFromRpm ?? undefined}
          redlineToValue={hud.redlineToRpm}
          idPrefix={`${idPrefix}-tach`}
          colors={colors}
          geometry={defaultGaugeGeometry}
        />
      ) : visibility.pedals ? (
        <PedalIndicator
          x={layout.tachCenterX + throttle.offsetX * layout.tachSize}
          y={layout.tachCenterY + throttle.offsetY * layout.tachSize}
          scale={throttle.scale * layout.tachSize}
          value={throttle.value}
          color={throttle.color}
          idPrefix={`${idPrefix}-throttle-pedal`}
        />
      ) : null}
    </>
  );
};

export default OverlayGauges;
