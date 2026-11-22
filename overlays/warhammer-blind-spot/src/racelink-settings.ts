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
  readonly theme: "ember" | "graphite" | "tide" | "clear";
  /** Bar opacity */
  readonly opacity: number;
  /** Bar width */
  readonly barWidth: number;
  /** Line width */
  readonly lineWidth: number;
  /** Line length */
  readonly lineLength: number;
  /** Round ends */
  readonly rounded: boolean;
  /** Move smoothly */
  readonly smooth: boolean;
  /** Show the bars while nobody is alongside */
  readonly alwaysShowBars: boolean;
  /** Distance ahead */
  readonly distAhead: number;
  /** Distance behind */
  readonly distBehind: number;
}

export const defaultSettings: Settings = {
  "theme": "ember",
  "opacity": 0.35,
  "barWidth": 20,
  "lineWidth": 10,
  "lineLength": 35,
  "rounded": true,
  "smooth": true,
  "alwaysShowBars": false,
  "distAhead": 4,
  "distBehind": 4
};
