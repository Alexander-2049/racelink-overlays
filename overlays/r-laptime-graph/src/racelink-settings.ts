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
  /** Background opacity */
  readonly Opacity: number;
  /** Font */
  readonly FontFamily: "Montserrat" | "Roboto" | "RobotoMono" | "TitilliumWeb" | "Exo2" | "BarlowCondensed" | "JetBrainsMono" | "Geist";
  /** Weight */
  readonly FontWeight: "Regular" | "Medium" | "Semibold" | "Bold" | "Extra";
  /** Overlay header */
  readonly ShowTitle: boolean;
  /** Header colour */
  readonly OverlayTitleColor: string;
  /** Limit the number of laps */
  readonly LimitLapCount: boolean;
  /** Laps to show */
  readonly LapCount: number;
  /** Lap time filter */
  readonly IsFilterOn: boolean;
  /** Filter below (s) */
  readonly FilterOutLower: number;
  /** Filter above (s) */
  readonly FilterOutHigher: number;
}

export const defaultSettings: Settings = {
  "Opacity": 0.75,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "ShowTitle": true,
  "OverlayTitleColor": "#d10404",
  "LimitLapCount": true,
  "LapCount": 20,
  "IsFilterOn": false,
  "FilterOutLower": 5,
  "FilterOutHigher": 5
};
