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
  /** Parts and their order */
  readonly parts: readonly Readonly<{ id: "gear" | "extremes" | "pedals" | "wheel"; visible: boolean }>[];
  /** Speed */
  readonly speedUnit: "AUTO" | "KPH" | "MPH";
  /** Unit under the speed */
  readonly showUnit: boolean;
  /** Clutch bar */
  readonly showClutch: boolean;
  /** Pedal figures in per cent */
  readonly pedalPercent: boolean;
  /** Brighten the brake bar while ABS works */
  readonly absMark: boolean;
  /** Wheel turn lock to lock (when the game gives no angle) */
  readonly wheelRange: number;
  /** Found */
  readonly extremesMode: "CORNER" | "LAP";
  /** Change that counts as a corner or a straight */
  readonly swing: number;
  /** Fastest speed */
  readonly showMax: boolean;
  /** Slowest speed */
  readonly showMin: boolean;
  /** Fastest speed colour */
  readonly maxColor: string;
  /** Slowest speed colour */
  readonly minColor: string;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "fontSize": 15,
  "opacity": 0.8,
  "radius": 6,
  "accentLine": true,
  "parts": [
    {
      "id": "gear",
      "visible": true
    },
    {
      "id": "extremes",
      "visible": true
    },
    {
      "id": "pedals",
      "visible": true
    },
    {
      "id": "wheel",
      "visible": true
    }
  ],
  "speedUnit": "AUTO",
  "showUnit": true,
  "showClutch": true,
  "pedalPercent": false,
  "absMark": true,
  "wheelRange": 900,
  "extremesMode": "CORNER",
  "swing": 15,
  "showMax": true,
  "showMin": true,
  "maxColor": "#a78bfa",
  "minColor": "#f472b6"
};
