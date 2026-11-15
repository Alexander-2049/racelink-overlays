export type SpeedUnit = "kph" | "mph";
export type SpeedUnitSetting = SpeedUnit | "auto";

export const MILES_PER_KILOMETER = 0.621371;

/** The unit to show: the setting, or the game's display units when it is "auto" (km/h if unknown). */
export const resolveSpeedUnit = (
  setting: SpeedUnitSetting,
  displayUnits: "metric" | "imperial" | null | undefined,
): SpeedUnit => {
  if (setting !== "auto") return setting;
  return displayUnits === "imperial" ? "mph" : "kph";
};

export const kphToDisplaySpeed = (speedKph: number, speedUnit: SpeedUnit) =>
  speedUnit === "mph" ? speedKph * MILES_PER_KILOMETER : speedKph;
