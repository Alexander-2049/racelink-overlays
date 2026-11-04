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
  /** Show LAP TIME */
  readonly showLapTime: boolean;
  /** SPLIT TIME */
  readonly splitMode: "auto" | "leader" | "best" | "off";
  /** SPLIT TIME checkpoints per lap */
  readonly splitsPerLap: number;
}

export const defaultSettings: Settings = {
  "showLapTime": true,
  "splitMode": "auto",
  "splitsPerLap": 3
};
