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
  /** Gauge style */
  readonly hudStyle: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
  /** Dial colour */
  readonly gaugeFacePalette: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "custom";
  /** Custom dial colour */
  readonly gaugeFaceColor: string;
  /** Needle colour */
  readonly needlePalette: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "custom";
  /** Custom needle colour */
  readonly needleColor: string;
  /** Marking colour */
  readonly letteringPalette: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "custom";
  /** Custom marking colour */
  readonly letteringColor: string;
  /** Speed units */
  readonly units: "auto" | "kmh" | "mph";
  /** Boost gauge */
  readonly showTurbo: boolean;
  /** Left gauge (nitrous) */
  readonly nitrousSource: "fuel" | "battery" | "none";
  /** Right gauge (speedbreaker) */
  readonly breakerSource: "fuel" | "battery" | "none";
}

export const defaultSettings: Settings = {
  "hudStyle": "0",
  "gaugeFacePalette": "3",
  "gaugeFaceColor": "#FDC172",
  "needlePalette": "3",
  "needleColor": "#FDC172",
  "letteringPalette": "1",
  "letteringColor": "#FDFDFD",
  "units": "auto",
  "showTurbo": true,
  "nitrousSource": "fuel",
  "breakerSource": "battery"
};
