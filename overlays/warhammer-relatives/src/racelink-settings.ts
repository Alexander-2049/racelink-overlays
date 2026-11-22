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
  /** Rows */
  readonly rows: number;
  /** Animations */
  readonly animations: boolean;
  /** Hide empty columns */
  readonly hideEmptyColumns: boolean;
  /** Show the strip */
  readonly showHeader: boolean;
  /** Strip items */
  readonly headerItems: readonly Readonly<{ id: "waterTemp" | "oilTemp" | "humidity" | "trackTemp" | "airTemp" | "sof" | "incidents" | "clock"; visible: boolean }>[];
  /** Columns */
  readonly columns: readonly Readonly<{ id: "position" | "number" | "name" | "brand" | "pitLap" | "ratings" | "time"; visible: boolean }>[];
  /** Show the footer (lap and session clock) */
  readonly showFooter: boolean;
  /** Colour cars a lap ahead and a lap behind */
  readonly colorByLap: boolean;
  /** Dim cars in the pit lane and mark them PIT */
  readonly showPit: boolean;
  /** Leave cars in the pit lane out */
  readonly excludePit: boolean;
  /** Hide other cars while you qualify alone */
  readonly loneQualify: boolean;
  /** Sign the time (+ behind, - ahead) */
  readonly signedTime: boolean;
  /** Decimals of the time */
  readonly timeDecimals: number;
  /** Session clock */
  readonly clockMode: "remaining" | "elapsed";
  /** Decimals of the estimated laps */
  readonly lapDecimals: number;
  /** Clock in the strip */
  readonly clockSource: "real" | "game";
  /** 12 hour clock */
  readonly hour12: boolean;
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
  "fontSize": 15,
  "opacity": 0.82,
  "nameFormat": "firstLast",
  "rows": 7,
  "animations": true,
  "hideEmptyColumns": true,
  "showHeader": true,
  "headerItems": [
    {
      "id": "waterTemp",
      "visible": true
    },
    {
      "id": "oilTemp",
      "visible": true
    },
    {
      "id": "humidity",
      "visible": true
    },
    {
      "id": "trackTemp",
      "visible": true
    },
    {
      "id": "airTemp",
      "visible": false
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
  "columns": [
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
      "id": "brand",
      "visible": false
    },
    {
      "id": "pitLap",
      "visible": true
    },
    {
      "id": "ratings",
      "visible": true
    },
    {
      "id": "time",
      "visible": true
    }
  ],
  "showFooter": true,
  "colorByLap": true,
  "showPit": true,
  "excludePit": false,
  "loneQualify": true,
  "signedTime": false,
  "timeDecimals": 1,
  "clockMode": "remaining",
  "lapDecimals": 1,
  "clockSource": "real",
  "hour12": false,
  "showLicence": true,
  "showIRating": true,
  "licenceFormat": "classRating",
  "iRatingFormat": "k",
  "tempUnit": "auto"
};
