// GENERATED FROM racelink.overlay.json BY racelink-overlay. DO NOT EDIT.
//
// Settings live in "settings" of racelink.overlay.json (or Racelink Studio → Settings):
// Racelink builds the settings panel and the values it sends from there, never from
// this file, and the next update overwrites anything written here by hand.
//
// To add or change a setting:
//   1. Edit "settings" in racelink.overlay.json.
//   2. This file updates by itself while `npm run dev` runs and on `npm run build`;
//      run `npm run typegen` to update it now.
//   3. Read the value as overlay.settings.<key>.
//
// "Property ... does not exist on type 'Settings'" means this file is out of date:
// run `npm run typegen`, do not edit it.

export interface Settings {
  /** Speed unit */
  readonly speedUnit: "auto" | "kph" | "mph";
  /** Speedometer scale */
  readonly speedScale: "auto" | "160" | "200" | "240" | "280" | "320" | "360" | "400";
  /** Odometer */
  readonly odometer: "total" | "trip" | "off";
  /** PIT in place of the unit while the pit limiter is on */
  readonly pitLimiter: boolean;
  /** Red zone */
  readonly redline: "shift" | "limit" | "off";
  /** Gear flashes at the shift point */
  readonly shiftFlash: boolean;
  /** Flash colour */
  readonly shiftFlashColor: string;
  /** Scale */
  readonly maxGForce: number;
  /** Ball moves into the corner */
  readonly invertGForce: boolean;
  /** Speedometer */
  readonly showSpeedometer: boolean;
  /** Tachometer */
  readonly showRpmDial: boolean;
  /** Gear */
  readonly showGear: boolean;
  /** Speed */
  readonly showSpeed: boolean;
  /** Pedals */
  readonly showPedals: boolean;
  /** Fuel */
  readonly showFuelIndicator: boolean;
  /** G-forces */
  readonly showGForces: boolean;
  /** Needle */
  readonly needleColor: string;
  /** Numbers and ticks */
  readonly gaugeMarkColor: string;
  /** Red zone */
  readonly redlineColor: string;
  /** Odometer */
  readonly odometerColor: string;
  /** Throttle */
  readonly throttleColor: string;
  /** Brake */
  readonly brakeColor: string;
  /** Fuel */
  readonly fuelColor: string;
  /** Fuel icon and letters */
  readonly fuelTextColor: string;
  /** Fuel icon and letters opacity */
  readonly fuelTextOpacity: number;
  /** Gear */
  readonly gearColor: string;
  /** Gear background */
  readonly gearBackgroundColor: string;
  /** Gear background opacity */
  readonly gearBackgroundOpacity: number;
  /** Speed */
  readonly speedReadoutColor: string;
  /** Speed unit */
  readonly speedUnitColor: string;
  /** Speed unit opacity */
  readonly speedUnitOpacity: number;
  /** G-force ball */
  readonly gForceBallColor: string;
  /** Dials */
  readonly backgroundGradientColor: string;
  /** Dials opacity */
  readonly backgroundGradientOpacity: number;
  /** Centre */
  readonly centerGradientColor: string;
  /** Centre opacity */
  readonly centerGradientOpacity: number;
}

export const defaultSettings: Settings = {
  "speedUnit": "auto",
  "speedScale": "auto",
  "odometer": "total",
  "pitLimiter": true,
  "redline": "shift",
  "shiftFlash": true,
  "shiftFlashColor": "#FF2A22",
  "maxGForce": 2,
  "invertGForce": false,
  "showSpeedometer": true,
  "showRpmDial": true,
  "showGear": true,
  "showSpeed": true,
  "showPedals": true,
  "showFuelIndicator": true,
  "showGForces": true,
  "needleColor": "#FF2A22",
  "gaugeMarkColor": "#C9C9C9",
  "redlineColor": "#FF1712",
  "odometerColor": "#A9DDFF",
  "throttleColor": "#91B7E4",
  "brakeColor": "#D71920",
  "fuelColor": "#91B7E4",
  "fuelTextColor": "#A0A0A0",
  "fuelTextOpacity": 0.82,
  "gearColor": "#000000",
  "gearBackgroundColor": "#8FAED0",
  "gearBackgroundOpacity": 0.86,
  "speedReadoutColor": "#A9DDFF",
  "speedUnitColor": "#D8DEE8",
  "speedUnitOpacity": 0.78,
  "gForceBallColor": "#A9DDFF",
  "backgroundGradientColor": "#000000",
  "backgroundGradientOpacity": 0.8,
  "centerGradientColor": "#000000",
  "centerGradientOpacity": 0.8
};
