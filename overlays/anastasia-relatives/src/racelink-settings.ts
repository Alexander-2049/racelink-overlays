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
  readonly theme: "ANASTASIA" | "NEUTRAL" | "MIDNIGHT" | "ROSE";
  /** Size */
  readonly fontSize: number;
  /** Background opacity */
  readonly opacity: number;
  /** Corner radius */
  readonly radius: number;
  /** Accent line on top */
  readonly accentLine: boolean;
  /** Animations */
  readonly animations: boolean;
  /** Hide empty columns */
  readonly hideEmptyColumns: boolean;
  /** Rows (you in the middle) */
  readonly rows: number;
  /** Hide cars in the pit lane */
  readonly excludePit: boolean;
  /** Hide other cars while you qualify alone */
  readonly loneQualify: boolean;
  /** Colour cars a lap ahead (red) or behind (blue) */
  readonly lapColors: boolean;
  /** Driver name */
  readonly nameFormat: "0" | "2" | "3" | "1" | "7" | "10";
  /** Decimals of the time */
  readonly gapDecimals: number;
  /** Columns */
  readonly columns: readonly Readonly<{ id: "classStripe" | "position" | "number" | "name" | "flag" | "brand" | "pit" | "licence" | "rating" | "ratingChange" | "gap"; visible: boolean }>[];
  /** Header */
  readonly showHeader: boolean;
  /** Header items */
  readonly headerItems: readonly Readonly<{ id: "trackTemp" | "airTemp" | "sof" | "incidents" | "clock"; visible: boolean }>[];
  /** Temperature */
  readonly temperatureUnit: "AUTO" | "C" | "F";
  /** Clock shows */
  readonly clockSource: "REAL" | "GAME";
  /** 12-hour clock */
  readonly clock12h: boolean;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "fontSize": 15,
  "opacity": 0.8,
  "radius": 6,
  "accentLine": true,
  "animations": true,
  "hideEmptyColumns": true,
  "rows": 7,
  "excludePit": false,
  "loneQualify": true,
  "lapColors": true,
  "nameFormat": "0",
  "gapDecimals": 1,
  "columns": [
    {
      "id": "classStripe",
      "visible": false
    },
    {
      "id": "position",
      "visible": true
    },
    {
      "id": "number",
      "visible": true
    },
    {
      "id": "name",
      "visible": true
    },
    {
      "id": "flag",
      "visible": false
    },
    {
      "id": "brand",
      "visible": false
    },
    {
      "id": "pit",
      "visible": true
    },
    {
      "id": "licence",
      "visible": true
    },
    {
      "id": "rating",
      "visible": true
    },
    {
      "id": "ratingChange",
      "visible": false
    },
    {
      "id": "gap",
      "visible": true
    }
  ],
  "showHeader": true,
  "headerItems": [
    {
      "id": "trackTemp",
      "visible": true
    },
    {
      "id": "airTemp",
      "visible": true
    },
    {
      "id": "sof",
      "visible": true
    },
    {
      "id": "incidents",
      "visible": true
    },
    {
      "id": "clock",
      "visible": true
    }
  ],
  "temperatureUnit": "AUTO",
  "clockSource": "REAL",
  "clock12h": false
};
