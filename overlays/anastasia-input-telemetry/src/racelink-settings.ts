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
  readonly theme: "ANASTASIA" | "NEUTRAL" | "MIDNIGHT" | "ROSE";
  /** Seconds shown */
  readonly seconds: number;
  /** Line width */
  readonly thickness: number;
  /** Fill under the lines */
  readonly fill: boolean;
  /** Background opacity */
  readonly opacity: number;
  /** Corner radius */
  readonly radius: number;
  /** Draws per second */
  readonly fps: number;
  /** Grid lines */
  readonly gridLines: number;
  /** Grid opacity */
  readonly gridOpacity: number;
  /** Show the grid */
  readonly showGrid: boolean;
  /** Throttle */
  readonly showThrottle: boolean;
  /** Throttle colour */
  readonly throttleColor: string;
  /** Brake */
  readonly showBrake: boolean;
  /** Brake colour */
  readonly brakeColor: string;
  /** Clutch */
  readonly showClutch: boolean;
  /** Clutch colour */
  readonly clutchColor: string;
  /** Steering */
  readonly showSteering: boolean;
  /** Steering colour */
  readonly steeringColor: string;
  /** Value at the end of each line */
  readonly showValues: boolean;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "seconds": 8,
  "thickness": 2,
  "fill": false,
  "opacity": 0,
  "radius": 6,
  "fps": 30,
  "gridLines": 3,
  "gridOpacity": 0.25,
  "showGrid": true,
  "showThrottle": true,
  "throttleColor": "#4ade80",
  "showBrake": true,
  "brakeColor": "#ef5a6f",
  "showClutch": false,
  "clutchColor": "#5b9dff",
  "showSteering": false,
  "steeringColor": "#e5e7eb",
  "showValues": false
};
