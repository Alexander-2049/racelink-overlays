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
  /** Size */
  readonly fontSize: number;
  /** Background opacity */
  readonly opacity: number;
  /** Corner radius */
  readonly radius: number;
  /** Accent line on top */
  readonly accentLine: boolean;
  /** Animations */
  readonly animations: boolean;
  /** Text colours */
  readonly colorMode: "THEME" | "CUSTOM";
  /** Text colour */
  readonly textColor: string;
  /** Accent colour (enough fuel, PIT) */
  readonly goodColor: string;
  /** Negative colour (not enough fuel) */
  readonly badColor: string;
  /** Fuel level */
  readonly showLevel: boolean;
  /** Laps in the race */
  readonly showLapsInRace: boolean;
  /** PIT badge */
  readonly showPitBadge: boolean;
  /** Average of the last clean laps */
  readonly showAverage: boolean;
  /** Qualifying lap */
  readonly showQualify: boolean;
  /** Last lap */
  readonly showLast: boolean;
  /** My figure */
  readonly showCustom: boolean;
  /** My figure: fuel per lap, in the unit shown (0 is off) */
  readonly myPerLap: number;
  /** Unit */
  readonly units: "auto" | "liters" | "usGallons" | "imperialGallons" | "kilograms";
  /** Fuel at the end */
  readonly extraMode: "spare" | "lapLess" | "lapMore";
  /** Cushion added to a refuel of one unit or more */
  readonly cushion: number;
  /** Colour the level when two laps or less are left */
  readonly warnLowFuel: boolean;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "fontSize": 15,
  "opacity": 0.8,
  "radius": 6,
  "accentLine": true,
  "animations": true,
  "colorMode": "THEME",
  "textColor": "#f6f1fd",
  "goodColor": "#6ee7a8",
  "badColor": "#fb7185",
  "showLevel": true,
  "showLapsInRace": true,
  "showPitBadge": true,
  "showAverage": true,
  "showQualify": true,
  "showLast": true,
  "showCustom": false,
  "myPerLap": 0,
  "units": "auto",
  "extraMode": "spare",
  "cushion": 0.5,
  "warnLowFuel": true
};
