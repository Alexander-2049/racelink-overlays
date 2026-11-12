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
  /** Fast blinking closer than */
  readonly nearMeters: number;
  /** Blinking closer than */
  readonly farMeters: number;
  /** Arrow to the trouble */
  readonly showArrow: boolean;
  /** Beep */
  readonly sound: boolean;
  /** Volume */
  readonly volume: number;
}

export const defaultSettings: Settings = {
  "nearMeters": 250,
  "farMeters": 600,
  "showArrow": true,
  "sound": true,
  "volume": 70
};
