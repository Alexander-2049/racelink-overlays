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
  /** Theme */
  readonly theme: "b16a1" | "vivid" | "graphite" | "ocean" | "paper";
  /** Background opacity */
  readonly opacity: number;
  /** Clutch */
  readonly showClutch: boolean;
  /** Brake */
  readonly showBrake: boolean;
  /** Throttle */
  readonly showThrottle: boolean;
  /** ABS on the brake */
  readonly showAbs: boolean;
  /** ABS colour */
  readonly absColor: string;
  /** Percent on the bars */
  readonly showValues: boolean;
  /** Gear */
  readonly showGear: boolean;
  /** Speed */
  readonly showSpeed: boolean;
  /** Speed unit */
  readonly speedUnit: "kph" | "mph";
  /** Steering wheel */
  readonly showWheel: boolean;
  /** Wheel turns up to */
  readonly wheelDegrees: number;
  /** Trace of throttle and brake */
  readonly showTrace: boolean;
  /** Seconds shown */
  readonly traceSeconds: number;
  /** Clutch in the trace */
  readonly traceClutch: boolean;
}

export const defaultSettings: Settings = {
  "theme": "b16a1",
  "opacity": 80,
  "showClutch": true,
  "showBrake": true,
  "showThrottle": true,
  "showAbs": true,
  "absColor": "#e3b341",
  "showValues": false,
  "showGear": true,
  "showSpeed": true,
  "speedUnit": "kph",
  "showWheel": true,
  "wheelDegrees": 540,
  "showTrace": false,
  "traceSeconds": 10,
  "traceClutch": false
};
