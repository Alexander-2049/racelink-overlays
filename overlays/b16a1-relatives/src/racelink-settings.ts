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
  /** Rows */
  readonly rows: number;
  /** Leave cars in the pit lane out */
  readonly excludePit: boolean;
  /** Alone in a lone qualifying */
  readonly loneQualify: boolean;
  /** PIT mark on cars in the pit lane */
  readonly showPitBadge: boolean;
  /** Mark cars a lap ahead or behind (race) */
  readonly showLapMarks: boolean;
  /** Columns */
  readonly columns: readonly Readonly<{ id: "position" | "number" | "flag" | "name" | "brand" | "licence" | "rating" | "gap"; visible: boolean }>[];
  /** Name */
  readonly nameFormat: "full" | "initial" | "short" | "last";
  /** iRating */
  readonly ratingFormat: "full" | "compact";
  /** Header */
  readonly showHeader: boolean;
  /** Left */
  readonly headerLeft: "fuel" | "airTemp" | "trackTemp" | "humidity" | "off";
  /** Strength of field */
  readonly showSof: boolean;
  /** Incidents */
  readonly showIncidents: boolean;
  /** Clock */
  readonly clock: "sim" | "real" | "off";
  /** 12-hour clock */
  readonly clock12: boolean;
  /** Temperature */
  readonly temperatureUnit: "c" | "f";
  /** Footer */
  readonly showFooter: boolean;
}

export const defaultSettings: Settings = {
  "theme": "b16a1",
  "opacity": 80,
  "align": "top",
  "rows": 7,
  "excludePit": false,
  "loneQualify": true,
  "showPitBadge": false,
  "showLapMarks": false,
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
      "id": "flag",
      "visible": false
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
    }
  ],
  "nameFormat": "full",
  "ratingFormat": "compact",
  "showHeader": true,
  "headerLeft": "fuel",
  "showSof": true,
  "showIncidents": true,
  "clock": "sim",
  "clock12": false,
  "temperatureUnit": "c",
  "showFooter": true
};
