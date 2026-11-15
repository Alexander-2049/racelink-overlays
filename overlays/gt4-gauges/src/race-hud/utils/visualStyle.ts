import type { CSSProperties } from "react";
import type { GaugeVisualTuning } from "../config/hudConfig";

export const createRaceHudStyle = (visual: GaugeVisualTuning) =>
  ({
    "--gauge-label-font-size": `${visual.labelFontSize}px`,
    "--gauge-odometer-font-size": `${visual.odometerFontSize}px`,
    "--gauge-label-stroke-width": `${visual.labelStrokeWidth}px`,
    "--gauge-odometer-stroke-width": `${visual.odometerStrokeWidth}px`,
    "--fuel-text-color": visual.fuelTextColor,
    "--fuel-text-opacity": visual.fuelTextOpacity,
    "--gear-color": visual.gearColor,
    "--gear-background-color": visual.gearBackgroundColor,
    "--gear-background-opacity": visual.gearBackgroundOpacity,
    "--speed-readout-color": visual.speedReadoutColor,
    "--speed-unit-color": visual.speedUnitColor,
    "--speed-unit-opacity": visual.speedUnitOpacity,
    "--g-force-ball-color": visual.gForceBallColor,
    "--shift-flash-color": visual.shiftFlashColor,
  }) as CSSProperties;
