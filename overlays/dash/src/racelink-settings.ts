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
  /** Show green */
  readonly showGreen: boolean;
  /** Show yellow */
  readonly showYellow: boolean;
  /** Show orange */
  readonly showOrange: boolean;
  /** Show red */
  readonly showRed: boolean;
  /** Background transparency */
  readonly backgroundOpacity: number;
}

export const defaultSettings: Settings = {
  "showGreen": true,
  "showYellow": true,
  "showOrange": true,
  "showRed": true,
  "backgroundOpacity": 60
};
