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
  readonly theme: "CLEAN" | "ARROW" | "GLOW" | "BUBBLES" | "POPUP" | "DIAL";
  /** Striped background */
  readonly backgroundIsStriped: boolean;
  /** Overlay layout */
  readonly layoutFormat: "row" | "column";
  /** Comparison mode */
  readonly referenceType: "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Background opacity */
  readonly Opacity: number;
  /** Font */
  readonly FontFamily: "Montserrat" | "Roboto" | "RobotoMono" | "TitilliumWeb" | "Exo2" | "BarlowCondensed" | "JetBrainsMono" | "Geist";
  /** Weight */
  readonly FontWeight: "Regular" | "Medium" | "Semibold" | "Bold" | "Extra";
  /** Type */
  readonly "entities.0.type": "NONE" | "CURRENT" | "PREDICTED" | "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Show the delta */
  readonly "entities.0.showDelta": boolean;
  /** Show the completed lap time */
  readonly "entities.0.showLastLapAfterFinish": boolean;
  /** Type */
  readonly "entities.1.type": "NONE" | "CURRENT" | "PREDICTED" | "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Show the delta */
  readonly "entities.1.showDelta": boolean;
  /** Show the completed lap time */
  readonly "entities.1.showLastLapAfterFinish": boolean;
  /** Type */
  readonly "entities.2.type": "NONE" | "CURRENT" | "PREDICTED" | "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Show the delta */
  readonly "entities.2.showDelta": boolean;
  /** Show the completed lap time */
  readonly "entities.2.showLastLapAfterFinish": boolean;
  /** Type */
  readonly "entities.3.type": "NONE" | "CURRENT" | "PREDICTED" | "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Show the delta */
  readonly "entities.3.showDelta": boolean;
  /** Show the completed lap time */
  readonly "entities.3.showLastLapAfterFinish": boolean;
  /** Type */
  readonly "entities.4.type": "NONE" | "CURRENT" | "PREDICTED" | "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Show the delta */
  readonly "entities.4.showDelta": boolean;
  /** Show the completed lap time */
  readonly "entities.4.showLastLapAfterFinish": boolean;
}

export const defaultSettings: Settings = {
  "theme": "CLEAN",
  "backgroundIsStriped": true,
  "layoutFormat": "row",
  "referenceType": "personalBestLap",
  "Opacity": 1,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "entities.0.type": "personalSessionBestLap",
  "entities.0.showDelta": false,
  "entities.0.showLastLapAfterFinish": false,
  "entities.1.type": "NONE",
  "entities.1.showDelta": false,
  "entities.1.showLastLapAfterFinish": false,
  "entities.2.type": "NONE",
  "entities.2.showDelta": false,
  "entities.2.showLastLapAfterFinish": false,
  "entities.3.type": "NONE",
  "entities.3.showDelta": false,
  "entities.3.showLastLapAfterFinish": false,
  "entities.4.type": "NONE",
  "entities.4.showDelta": false,
  "entities.4.showLastLapAfterFinish": false
};
