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
  /** Size */
  readonly fontSize: number;
  /** Background opacity */
  readonly opacity: number;
  /** Blocks */
  readonly blocks: readonly Readonly<{ id: "wetness" | "precipitation" | "wind"; visible: boolean }>[];
  /** Layout */
  readonly layout: "vertical" | "horizontal";
  /** Seven step scale under the wetness */
  readonly showWetnessScale: boolean;
  /** Trend of the rain (rising or falling) */
  readonly showTrend: boolean;
  /** Decimals of precipitation */
  readonly precipitationDecimals: number;
  /** Arrow points */
  readonly windFrame: "north" | "car";
  /** Speed */
  readonly windUnit: "auto" | "kph" | "mph";
}

export const defaultSettings: Settings = {
  "theme": "ember",
  "fontSize": 15,
  "opacity": 0.72,
  "blocks": [
    {
      "id": "wetness",
      "visible": true
    },
    {
      "id": "precipitation",
      "visible": true
    },
    {
      "id": "wind",
      "visible": true
    }
  ],
  "layout": "vertical",
  "showWetnessScale": true,
  "showTrend": true,
  "precipitationDecimals": 1,
  "windFrame": "north",
  "windUnit": "auto"
};
