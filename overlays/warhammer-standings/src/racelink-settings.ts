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
  /** Driver name */
  readonly nameFormat: "initialLast" | "firstLast" | "last" | "lastInitial" | "firstInitial";
  /** Animations */
  readonly animations: boolean;
  /** Hide empty columns */
  readonly hideEmptyColumns: boolean;
  /** Show the strip */
  readonly showHeader: boolean;
  /** Strip items */
  readonly headerItems: readonly Readonly<{ id: "session" | "laps" | "airTemp" | "trackTemp" | "humidity" | "sof" | "drivers" | "incidents"; visible: boolean }>[];
  /** Columns */
  readonly columns: readonly Readonly<{ id: "position" | "gain" | "classStripe" | "number" | "name" | "brand" | "ratings" | "ratingChange" | "pitState" | "gap" | "interval" | "lapTime" | "pitLap" | "pitTime" | "gainHistory"; visible: boolean }>[];
  /** Top rows */
  readonly topRows: number;
  /** Rows round the car you watch */
  readonly bottomRows: number;
  /** Classes */
  readonly numClasses: number;
  /** Rows of the other classes */
  readonly multiclassRows: number;
  /** Mark where rows are left out */
  readonly condensed: boolean;
  /** Class names when there are several */
  readonly classHeaders: boolean;
  /** Session clock */
  readonly clockMode: "remaining" | "elapsed";
  /** Decimals of the estimated laps */
  readonly lapDecimals: number;
  /** Decimals of gaps */
  readonly gapDecimals: number;
  /** Decimals of lap times */
  readonly lapTimeDecimals: number;
  /** Laps against you */
  readonly gainHistoryLaps: number;
  /** Colour personal and class best laps */
  readonly highlightBest: boolean;
  /** Safety rating pill */
  readonly showLicence: boolean;
  /** iRating pill */
  readonly showIRating: boolean;
  /** Safety rating format */
  readonly licenceFormat: "classRating" | "rating" | "class";
  /** iRating format */
  readonly iRatingFormat: "k" | "full";
  /** Temperature */
  readonly tempUnit: "auto" | "celsius" | "fahrenheit";
}

export const defaultSettings: Settings = {
  "theme": "ember",
  "fontSize": 14,
  "opacity": 0.82,
  "nameFormat": "initialLast",
  "animations": true,
  "hideEmptyColumns": true,
  "showHeader": true,
  "headerItems": [
    {
      "id": "session",
      "visible": true
    },
    {
      "id": "laps",
      "visible": true
    },
    {
      "id": "airTemp",
      "visible": true
    },
    {
      "id": "trackTemp",
      "visible": true
    },
    {
      "id": "humidity",
      "visible": true
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
  "columns": [
    {
      "id": "position",
      "visible": true
    },
    {
      "id": "gain",
      "visible": true
    },
    {
      "id": "classStripe",
      "visible": false
    },
    {
      "id": "number",
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
      "id": "ratings",
      "visible": true
    },
    {
      "id": "ratingChange",
      "visible": false
    },
    {
      "id": "pitState",
      "visible": false
    },
    {
      "id": "gap",
      "visible": true
    },
    {
      "id": "interval",
      "visible": true
    },
    {
      "id": "lapTime",
      "visible": true
    },
    {
      "id": "pitLap",
      "visible": true
    },
    {
      "id": "pitTime",
      "visible": true
    },
    {
      "id": "gainHistory",
      "visible": true
    }
  ],
  "topRows": 3,
  "bottomRows": 5,
  "numClasses": 3,
  "multiclassRows": 3,
  "condensed": true,
  "classHeaders": true,
  "clockMode": "remaining",
  "lapDecimals": 2,
  "gapDecimals": 1,
  "lapTimeDecimals": 1,
  "gainHistoryLaps": 3,
  "highlightBest": true,
  "showLicence": true,
  "showIRating": true,
  "licenceFormat": "classRating",
  "iRatingFormat": "k",
  "tempUnit": "auto"
};
