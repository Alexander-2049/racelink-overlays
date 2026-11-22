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
  /** Line colour */
  readonly colorMode: "AMBER" | "THEME" | "CUSTOM";
  /** My colour */
  readonly customColor: string;
  /** Line width */
  readonly lineWidth: number;
  /** Line opacity */
  readonly lineOpacity: number;
  /** Round ends */
  readonly roundEnds: boolean;
  /** Distance from the edge */
  readonly edgeInset: number;
  /** Dim bar behind the line */
  readonly showTrack: boolean;
  /** Dim bar width */
  readonly trackWidth: number;
  /** Dim bar opacity */
  readonly trackOpacity: number;
  /** The line follows the car */
  readonly moving: boolean;
  /** Length of the line of one car */
  readonly lineLength: number;
  /** Reach ahead */
  readonly distAhead: number;
  /** Reach behind */
  readonly distBehind: number;
  /** Smooth movement */
  readonly smooth: boolean;
  /** Only while you drive on the track */
  readonly onlyOnTrack: boolean;
  /** Show a sample to place the overlay */
  readonly preview: boolean;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "colorMode": "AMBER",
  "customColor": "#ffb624",
  "lineWidth": 10,
  "lineOpacity": 1,
  "roundEnds": false,
  "edgeInset": 0,
  "showTrack": false,
  "trackWidth": 20,
  "trackOpacity": 0.2,
  "moving": true,
  "lineLength": 30,
  "distAhead": 4,
  "distBehind": 4,
  "smooth": true,
  "onlyOnTrack": true,
  "preview": false
};
