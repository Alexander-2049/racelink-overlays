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
  /** Driver */
  readonly driver: "focused" | "player";
  /** Country flag */
  readonly showFlag: boolean;
  /** Helmet */
  readonly showHelmet: boolean;
  /** Car */
  readonly showCar: boolean;
  /** Plate */
  readonly plate: boolean;
  /** Background opacity */
  readonly opacity: number;
}

export const defaultSettings: Settings = {
  "driver": "focused",
  "showFlag": true,
  "showHelmet": true,
  "showCar": true,
  "plate": false,
  "opacity": 0.9
};
