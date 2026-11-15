import type { GaugeVisualTuning, LayoutVisibility } from "./config/hudConfig";
import type { SpeedUnit } from "./utils/speedUnits";

/** Shift light state of the tachometer: below the shift point, at it, past the blink point. */
export type ShiftState = "none" | "shift" | "blink";

/** Everything the HUD draws, already in display units. */
export type HudModel = {
  /** Speed in `speedUnit`. */
  speed: number;
  /** Top of the speedometer scale in `speedUnit`. */
  maxSpeed: number;
  speedUnit: SpeedUnit;
  gear: number;
  rpm: number;
  /** Top of the tachometer scale (a whole step). */
  maxRpm: number;
  /** Major step of the tachometer (1000 or 2000 rpm). */
  rpmStep: number;
  redlineFromRpm: number | null;
  redlineToRpm: number;
  shiftState: ShiftState;
  pitLimiter: boolean;
  /** Pedals 0..100. */
  throttle: number;
  brake: number;
  lateralAccelerationG: number;
  maxGForce: number;
  /** Fuel 0..100, null when the tank capacity is unknown. */
  fuelPercent: number | null;
  /** Odometer in km or miles, null when hidden. */
  odometer: number | null;
  visibility: LayoutVisibility;
  visual: GaugeVisualTuning;
};
