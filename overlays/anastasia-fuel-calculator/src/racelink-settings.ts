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
  /** Title line */
  readonly showTitle: boolean;
  /** Title */
  readonly title: string;
  /** Small text next to the title */
  readonly subtitle: string;
  /** Rows and their order */
  readonly rows: readonly Readonly<{ id: "margin" | "add" | "remaining" | "estLaps" | "perLap" | "lapsLeft" | "atFinish" | "extra"; visible: boolean }>[];
  /** Consumption taken from */
  readonly source: "AVERAGE" | "LAST" | "ALL" | "LOWEST" | "HIGHEST" | "CUSTOM";
  /** My consumption per lap */
  readonly customPerLap: number;
  /** Margin */
  readonly marginLaps: number;
  /** Extra fuel is */
  readonly extraMode: "spare" | "lapLess" | "lapMore";
  /** Unit */
  readonly unit: "AUTO" | "LITERS" | "GALLONS";
  /** Colour the last two laps of fuel */
  readonly warnColors: boolean;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "fontSize": 15,
  "opacity": 0.8,
  "radius": 6,
  "accentLine": true,
  "showTitle": true,
  "title": "FUEL",
  "subtitle": "Next pit stop",
  "rows": [
    {
      "id": "margin",
      "visible": true
    },
    {
      "id": "add",
      "visible": true
    },
    {
      "id": "remaining",
      "visible": true
    },
    {
      "id": "estLaps",
      "visible": true
    },
    {
      "id": "perLap",
      "visible": false
    },
    {
      "id": "lapsLeft",
      "visible": false
    },
    {
      "id": "atFinish",
      "visible": false
    },
    {
      "id": "extra",
      "visible": false
    }
  ],
  "source": "AVERAGE",
  "customPerLap": 3,
  "marginLaps": 1,
  "extraMode": "spare",
  "unit": "AUTO",
  "warnColors": true
};
