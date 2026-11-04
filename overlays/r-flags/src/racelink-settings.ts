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
  /** Size */
  readonly FontSize: number;
  /** Background opacity */
  readonly Opacity: number;
  /** Font */
  readonly FontFamily: "Montserrat" | "Roboto" | "RobotoMono" | "TitilliumWeb" | "Exo2" | "BarlowCondensed" | "JetBrainsMono" | "Geist";
  /** Weight */
  readonly FontWeight: "Regular" | "Medium" | "Semibold" | "Bold" | "Extra";
  /** Overlay header */
  readonly ShowTitle: boolean;
  /** Animation */
  readonly EnableAnimation: boolean;
  /** Preview flag */
  readonly ShowFlagInPreview: "checkered" | "white" | "green" | "yellow" | "red" | "blue" | "debris" | "crossed" | "oneLapToGreen" | "tenToGo" | "fiveToGo" | "randomWaving" | "caution" | "black" | "disqualify" | "furled" | "repair" | "startReady" | "startSet" | "startGo";
  /** Turn on */
  readonly "Flags.Checkered.enabled": boolean;
  /** Header */
  readonly "Flags.Checkered.headerText": string;
  /** Flag text */
  readonly "Flags.Checkered.flagText": string;
  /** Turn on */
  readonly "Flags.White.enabled": boolean;
  /** Header */
  readonly "Flags.White.headerText": string;
  /** Flag text */
  readonly "Flags.White.flagText": string;
  /** Turn on */
  readonly "Flags.Green.enabled": boolean;
  /** Header */
  readonly "Flags.Green.headerText": string;
  /** Flag text */
  readonly "Flags.Green.flagText": string;
  /** Turn on */
  readonly "Flags.Yellow.enabled": boolean;
  /** Header */
  readonly "Flags.Yellow.headerText": string;
  /** Flag text */
  readonly "Flags.Yellow.flagText": string;
  /** Turn on */
  readonly "Flags.Red.enabled": boolean;
  /** Header */
  readonly "Flags.Red.headerText": string;
  /** Flag text */
  readonly "Flags.Red.flagText": string;
  /** Turn on */
  readonly "Flags.Blue.enabled": boolean;
  /** Header */
  readonly "Flags.Blue.headerText": string;
  /** Flag text */
  readonly "Flags.Blue.flagText": string;
  /** Turn on */
  readonly "Flags.Debris.enabled": boolean;
  /** Header */
  readonly "Flags.Debris.headerText": string;
  /** Flag text */
  readonly "Flags.Debris.flagText": string;
  /** Turn on */
  readonly "Flags.Crossed.enabled": boolean;
  /** Header */
  readonly "Flags.Crossed.headerText": string;
  /** Flag text */
  readonly "Flags.Crossed.flagText": string;
  /** Turn on */
  readonly "Flags.OneLapToGreen.enabled": boolean;
  /** Header */
  readonly "Flags.OneLapToGreen.headerText": string;
  /** Flag text */
  readonly "Flags.OneLapToGreen.flagText": string;
  /** Turn on */
  readonly "Flags.TenToGo.enabled": boolean;
  /** Header */
  readonly "Flags.TenToGo.headerText": string;
  /** Flag text */
  readonly "Flags.TenToGo.flagText": string;
  /** Turn on */
  readonly "Flags.FiveToGo.enabled": boolean;
  /** Header */
  readonly "Flags.FiveToGo.headerText": string;
  /** Flag text */
  readonly "Flags.FiveToGo.flagText": string;
  /** Turn on */
  readonly "Flags.RandomWaving.enabled": boolean;
  /** Header */
  readonly "Flags.RandomWaving.headerText": string;
  /** Flag text */
  readonly "Flags.RandomWaving.flagText": string;
  /** Turn on */
  readonly "Flags.Caution.enabled": boolean;
  /** Header */
  readonly "Flags.Caution.headerText": string;
  /** Flag text */
  readonly "Flags.Caution.flagText": string;
  /** Turn on */
  readonly "Flags.Black.enabled": boolean;
  /** Header */
  readonly "Flags.Black.headerText": string;
  /** Flag text */
  readonly "Flags.Black.flagText": string;
  /** Turn on */
  readonly "Flags.Disqualify.enabled": boolean;
  /** Header */
  readonly "Flags.Disqualify.headerText": string;
  /** Flag text */
  readonly "Flags.Disqualify.flagText": string;
  /** Turn on */
  readonly "Flags.Furled.enabled": boolean;
  /** Header */
  readonly "Flags.Furled.headerText": string;
  /** Flag text */
  readonly "Flags.Furled.flagText": string;
  /** Turn on */
  readonly "Flags.Repair.enabled": boolean;
  /** Header */
  readonly "Flags.Repair.headerText": string;
  /** Flag text */
  readonly "Flags.Repair.flagText": string;
  /** Turn on */
  readonly "Flags.StartReady.enabled": boolean;
  /** Header */
  readonly "Flags.StartReady.headerText": string;
  /** Flag text */
  readonly "Flags.StartReady.flagText": string;
  /** Turn on */
  readonly "Flags.StartSet.enabled": boolean;
  /** Header */
  readonly "Flags.StartSet.headerText": string;
  /** Flag text */
  readonly "Flags.StartSet.flagText": string;
  /** Turn on */
  readonly "Flags.StartGo.enabled": boolean;
  /** Header */
  readonly "Flags.StartGo.headerText": string;
  /** Flag text */
  readonly "Flags.StartGo.flagText": string;
}

export const defaultSettings: Settings = {
  "FontSize": 14,
  "Opacity": 0.8,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "ShowTitle": true,
  "EnableAnimation": true,
  "ShowFlagInPreview": "green",
  "Flags.Checkered.enabled": true,
  "Flags.Checkered.headerText": "session is over",
  "Flags.Checkered.flagText": "checkered flag",
  "Flags.White.enabled": true,
  "Flags.White.headerText": "one more lap",
  "Flags.White.flagText": "white flag",
  "Flags.Green.enabled": true,
  "Flags.Green.headerText": "resume racing",
  "Flags.Green.flagText": "green flag",
  "Flags.Yellow.enabled": true,
  "Flags.Yellow.headerText": "accident ahead",
  "Flags.Yellow.flagText": "yellow flag",
  "Flags.Red.enabled": true,
  "Flags.Red.headerText": "session is suspended",
  "Flags.Red.flagText": "red flag",
  "Flags.Blue.enabled": true,
  "Flags.Blue.headerText": "let others by",
  "Flags.Blue.flagText": "blue flag",
  "Flags.Debris.enabled": true,
  "Flags.Debris.headerText": "debris on track",
  "Flags.Debris.flagText": "debris",
  "Flags.Crossed.enabled": true,
  "Flags.Crossed.headerText": "Crossed",
  "Flags.Crossed.flagText": "crossed",
  "Flags.OneLapToGreen.enabled": false,
  "Flags.OneLapToGreen.headerText": "One lap to green",
  "Flags.OneLapToGreen.flagText": "session flag",
  "Flags.TenToGo.enabled": true,
  "Flags.TenToGo.headerText": "10 laps to go",
  "Flags.TenToGo.flagText": "session flag",
  "Flags.FiveToGo.enabled": true,
  "Flags.FiveToGo.headerText": "5 laps to go",
  "Flags.FiveToGo.flagText": "session flag",
  "Flags.RandomWaving.enabled": true,
  "Flags.RandomWaving.headerText": "Random flag",
  "Flags.RandomWaving.flagText": "random flag",
  "Flags.Caution.enabled": true,
  "Flags.Caution.headerText": "Caution",
  "Flags.Caution.flagText": "caution flag",
  "Flags.Black.enabled": true,
  "Flags.Black.headerText": "Penalty",
  "Flags.Black.flagText": "black flag",
  "Flags.Disqualify.enabled": true,
  "Flags.Disqualify.headerText": "You got disqualified",
  "Flags.Disqualify.flagText": "black flag",
  "Flags.Furled.enabled": true,
  "Flags.Furled.headerText": "You cut the track",
  "Flags.Furled.flagText": "black flag",
  "Flags.Repair.enabled": true,
  "Flags.Repair.headerText": "Required repair",
  "Flags.Repair.flagText": "black flag",
  "Flags.StartReady.enabled": true,
  "Flags.StartReady.headerText": "Get ready",
  "Flags.StartReady.flagText": "start lights",
  "Flags.StartSet.enabled": true,
  "Flags.StartSet.headerText": "Get ready",
  "Flags.StartSet.flagText": "start lights",
  "Flags.StartGo.enabled": true,
  "Flags.StartGo.headerText": "Go!",
  "Flags.StartGo.flagText": "start lights"
};
