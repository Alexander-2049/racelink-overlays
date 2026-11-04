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
  /** Always show */
  readonly AlwaysShow: boolean;
  /** Display time after leaving the pits (s) */
  readonly ShowDurationAfterLeavingPits: number;
  /** Show the pit limiter */
  readonly ShowPitLimiter: boolean;
  /** Show the speed delta */
  readonly ShowPitSpeedDelta: boolean;
  /** Show the distance to the pit stall */
  readonly ShowPitStallDistance: boolean;
  /** Pit stall detection range */
  readonly PitBoxDetectionRange: number;
  /** Show tyre temperature */
  readonly ShowTireTemp: boolean;
  /** Show tyre wear */
  readonly ShowTireWear: boolean;
  /** Tyre wear display */
  readonly PitTireWearVersion: "OPACITY" | "SIZED" | "COLORED" | "COLORED_AND_SIZED";
}

export const defaultSettings: Settings = {
  "Opacity": 0.6,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "ShowTitle": false,
  "OverlayTitleColor": "#d10404",
  "AlwaysShow": false,
  "ShowDurationAfterLeavingPits": 15,
  "ShowPitLimiter": true,
  "ShowPitSpeedDelta": true,
  "ShowPitStallDistance": true,
  "PitBoxDetectionRange": 200,
  "ShowTireTemp": true,
  "ShowTireWear": true,
  "PitTireWearVersion": "OPACITY"
};
