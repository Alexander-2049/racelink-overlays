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
  /** Type */
  readonly Type: "big" | "small" | "doublestrip";
  /** Hide when inactive */
  readonly HideWhenNoFlag: boolean;
  /** Preview flag */
  readonly ShowFlagInPreview: "checkered" | "white" | "green" | "yellow" | "red" | "blue" | "debris" | "crossed" | "oneLapToGreen" | "tenToGo" | "fiveToGo" | "randomWaving" | "caution" | "black" | "disqualify" | "furled" | "repair" | "startReady" | "startSet" | "startGo";
  /** Spacing */
  readonly DoubleStripDistance: number;
  /** Size */
  readonly FontSize: number;
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
}

export const defaultSettings: Settings = {
  "Type": "big",
  "HideWhenNoFlag": false,
  "ShowFlagInPreview": "green",
  "DoubleStripDistance": 200,
  "FontSize": 14,
  "Opacity": 0.8,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "ShowTitle": false,
  "OverlayTitleColor": "#d10404"
};
