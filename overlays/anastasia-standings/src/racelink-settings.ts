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
  /** Stick to */
  readonly align: "TOP" | "BOTTOM";
  /** Rows from the top */
  readonly topRows: number;
  /** Rows round the watched car */
  readonly bottomRows: number;
  /** Classes shown */
  readonly numClasses: number;
  /** Rows of each other class */
  readonly multiclassRows: number;
  /** Mark where rows were left out */
  readonly condensed: boolean;
  /** Driver name */
  readonly nameFormat: "0" | "2" | "3" | "1" | "4" | "7" | "10";
  /** Columns */
  readonly columns: readonly Readonly<{ id: "position" | "classStripe" | "gain" | "number" | "flag" | "name" | "brand" | "licence" | "rating" | "ratingChange" | "gap" | "int" | "lastLap" | "bestLap" | "pit" | "gainHistory"; visible: boolean }>[];
  /** Decimals of gaps */
  readonly gapDecimals: number;
  /** Decimals of lap times */
  readonly lapDecimals: number;
  /** Laps of the time-against-you column */
  readonly gainLaps: number;
  /** Colour personal and class best laps */
  readonly markLaps: boolean;
  /** Header */
  readonly showHeader: boolean;
  /** Header items */
  readonly headerItems: readonly Readonly<{ id: "session" | "class" | "laps" | "time" | "airTemp" | "trackTemp" | "sof" | "drivers" | "incidents"; visible: boolean }>[];
  /** Time */
  readonly timeMode: "ELAPSED" | "REMAINING";
  /** Temperature */
  readonly temperatureUnit: "AUTO" | "C" | "F";
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "fontSize": 15,
  "opacity": 0.8,
  "radius": 6,
  "accentLine": true,
  "align": "TOP",
  "topRows": 5,
  "bottomRows": 9,
  "numClasses": 3,
  "multiclassRows": 3,
  "condensed": true,
  "nameFormat": "0",
  "columns": [
    {
      "id": "position",
      "visible": true
    },
    {
      "id": "classStripe",
      "visible": false
    },
    {
      "id": "gain",
      "visible": true
    },
    {
      "id": "number",
      "visible": true
    },
    {
      "id": "flag",
      "visible": false
    },
    {
      "id": "name",
      "visible": true
    },
    {
      "id": "brand",
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
    },
    {
      "id": "int",
      "visible": true
    },
    {
      "id": "lastLap",
      "visible": true
    },
    {
      "id": "bestLap",
      "visible": false
    },
    {
      "id": "pit",
      "visible": true
    },
    {
      "id": "gainHistory",
      "visible": true
    }
  ],
  "gapDecimals": 1,
  "lapDecimals": 1,
  "gainLaps": 3,
  "markLaps": true,
  "showHeader": true,
  "headerItems": [
    {
      "id": "session",
      "visible": true
    },
    {
      "id": "class",
      "visible": true
    },
    {
      "id": "laps",
      "visible": true
    },
    {
      "id": "time",
      "visible": true
    },
    {
      "id": "airTemp",
      "visible": true
    },
    {
      "id": "trackTemp",
      "visible": false
    },
    {
      "id": "sof",
      "visible": true
    },
    {
      "id": "drivers",
      "visible": true
    },
    {
      "id": "incidents",
      "visible": false
    }
  ],
  "timeMode": "ELAPSED",
  "temperatureUnit": "AUTO"
};
