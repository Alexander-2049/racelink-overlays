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
  readonly theme: "b16a1" | "vivid" | "graphite" | "ocean" | "paper";
  /** Background opacity */
  readonly opacity: number;
  /** The arrow is drawn */
  readonly orientation: "car" | "north";
  /** Speed */
  readonly unit: "kph" | "mph";
  /** Red at */
  readonly strongKph: number;
  /** Title */
  readonly showTitle: boolean;
  /** Compass point the wind blows from */
  readonly showCompass: boolean;
  /** Rain and track wetness */
  readonly showRain: boolean;
}

export const defaultSettings: Settings = {
  "theme": "b16a1",
  "opacity": 80,
  "orientation": "car",
  "unit": "kph",
  "strongKph": 60,
  "showTitle": false,
  "showCompass": false,
  "showRain": false
};
