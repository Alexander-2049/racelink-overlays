import { useId } from "react";
import CenterBridgeGradient from "./components/CenterBridgeGradient";
import CenterReadout from "./components/CenterReadout";
import GForceIndicator from "./components/GForceIndicator";
import OverlayGauges from "./components/OverlayGauges";
import OverlayGradientDefs from "./OverlayGradientDefs";
import {
  defaultFuelLayout,
  defaultGaugeLayout,
  defaultPedalLayout,
} from "./config/hudConfig";
import { createGaugeColorsFromVisual, resolveGaugeColors } from "./config/gaugeTheme";
import type { HudModel } from "./model";
import { createRaceHudStyle } from "./utils/visualStyle";
import "./styles/raceHudBase.css";
import "./styles/gaugeDial.css";
import "./styles/centerReadout.css";

const RaceHudOverlay = ({ hud }: { hud: HudModel }) => {
  const svgIdPrefix = useId().replace(/:/g, "-");
  const colors = resolveGaugeColors(createGaugeColorsFromVisual(hud.visual));
  const { visibility } = hud;

  return (
    <div className="race-hud" style={createRaceHudStyle(hud.visual)}>
      <svg
        className="race-hud__svg"
        viewBox={HUD_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <OverlayGradientDefs idPrefix={svgIdPrefix} colors={colors} />
        {visibility.gear || visibility.speed ? (
          <CenterBridgeGradient
            idPrefix={svgIdPrefix}
            gaugeLayout={defaultGaugeLayout}
            pedalLayout={defaultPedalLayout}
          />
        ) : null}
        <CenterReadout
          gear={hud.gear}
          speed={hud.speed}
          speedUnit={hud.speedUnit}
          shiftState={hud.shiftState}
          pitLimiter={hud.pitLimiter}
          showGear={visibility.gear}
          showSpeed={visibility.speed}
        />
        {visibility.gForces ? (
          <GForceIndicator value={hud.lateralAccelerationG} maxGForce={hud.maxGForce} />
        ) : null}
        <OverlayGauges idPrefix={svgIdPrefix} hud={hud} colors={colors} />
      </svg>
    </div>
  );
};

// The drawing area: both dials with the pedal and fuel arcs that stick out of them.
// Fixed, so hiding an element never moves the others.
const FUEL_LOCAL_MIN_X = -45;
const FUEL_LOCAL_MIN_Y = -5;
const FUEL_LOCAL_MAX_Y = 144;
const PEDAL_LOCAL_MAX_X = 59;

const createHudViewBox = () => {
  const g = defaultGaugeLayout;
  const speedRadius = g.speedSize / 2;
  const tachRadius = g.tachSize / 2;
  const fuelScale = defaultFuelLayout.scale * g.speedSize;
  const fuelX = g.speedCenterX + defaultFuelLayout.offsetX * g.speedSize;
  const fuelY = g.speedCenterY + defaultFuelLayout.offsetY * g.speedSize;
  const throttleScale = defaultPedalLayout.scale * g.tachSize;
  const throttleX = g.tachCenterX + defaultPedalLayout.gasOffsetX * g.tachSize;
  const minX = Math.min(g.speedCenterX - speedRadius, fuelX + FUEL_LOCAL_MIN_X * fuelScale);
  const minY = Math.min(g.speedCenterY - speedRadius, fuelY + FUEL_LOCAL_MIN_Y * fuelScale);
  const maxX = Math.max(g.tachCenterX + tachRadius, throttleX + PEDAL_LOCAL_MAX_X * throttleScale);
  const maxY = Math.max(g.speedCenterY + speedRadius, fuelY + FUEL_LOCAL_MAX_Y * fuelScale);
  return [minX, minY, maxX - minX, maxY - minY].join(" ");
};

const HUD_VIEWBOX = createHudViewBox();

export default RaceHudOverlay;
