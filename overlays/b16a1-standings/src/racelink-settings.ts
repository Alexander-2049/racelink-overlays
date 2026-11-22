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
  /** Table sticks to */
  readonly align: "top" | "bottom";
  /** Top places */
  readonly topRows: number;
  /** Places around you */
  readonly bottomRows: number;
  /** Separate the top from the window */
  readonly condensed: boolean;
  /** Classes shown */
  readonly numClasses: number;
  /** Rows of each other class */
  readonly multiclassRows: number;
  /** Columns */
  readonly columns: readonly Readonly<{ id: "position" | "gain" | "number" | "flag" | "name" | "team" | "brand" | "carName" | "licence" | "rating" | "gap" | "interval" | "lapTime" | "bestLap" | "laps" | "stops" | "pit" | "history" | "tyre"; visible: boolean }>[];
  /** Name */
  readonly nameFormat: "full" | "initial" | "short" | "last";
  /** Name column width */
  readonly nameWidth: number;
  /** iRating */
  readonly ratingFormat: "full" | "compact";
  /** Gap decimals */
  readonly gapDigits: "1" | "2" | "3";
  /** Lap time column shows */
  readonly lapTimeSource: "last" | "best";
  /** Laps in the difference to you */
  readonly historyLaps: number;
  /** Header of each class */
  readonly showHeaders: boolean;
  /** Header items */
  readonly headerColumns: readonly Readonly<{ id: "session" | "class" | "laps" | "time" | "sof" | "airTemp" | "trackTemp" | "humidity" | "drivers"; visible: boolean }>[];
  /** Temperature */
  readonly temperatureUnit: "c" | "f";
}

export const defaultSettings: Settings = {
  "theme": "b16a1",
  "opacity": 78,
  "align": "top",
  "topRows": 5,
  "bottomRows": 15,
  "condensed": true,
  "numClasses": 3,
  "multiclassRows": 3,
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
      "id": "team",
      "visible": false
    },
    {
      "id": "brand",
      "visible": true
    },
    {
      "id": "carName",
      "visible": false
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
      "id": "bestLap",
      "visible": false
    },
    {
      "id": "laps",
      "visible": false
    },
    {
      "id": "stops",
      "visible": false
    },
    {
      "id": "pit",
      "visible": true
    },
    {
      "id": "history",
      "visible": true
    },
    {
      "id": "tyre",
      "visible": true
    }
  ],
  "nameFormat": "full",
  "nameWidth": 12.5,
  "ratingFormat": "full",
  "gapDigits": "3",
  "lapTimeSource": "last",
  "historyLaps": 3,
  "showHeaders": true,
  "headerColumns": [
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
      "id": "sof",
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
      "id": "drivers",
      "visible": true
    }
  ],
  "temperatureUnit": "c"
};
