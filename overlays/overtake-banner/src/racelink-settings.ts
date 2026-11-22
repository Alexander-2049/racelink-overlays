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
  /** Whose passes */
  readonly driver: "player" | "focused";
  /** Sessions */
  readonly sessions: "race" | "all";
  /** Cars of other classes */
  readonly otherClasses: boolean;
  /** Lapped and lapping cars */
  readonly lapped: boolean;
  /** Not under caution or red flag */
  readonly ignoreCaution: boolean;
  /** Show for (seconds) */
  readonly displaySeconds: number;
  /** Same car again after (seconds) */
  readonly cooldownSeconds: number;
  /** Passes waiting */
  readonly maxQueue: number;
  /** Car picture */
  readonly showCar: boolean;
  /** Brand */
  readonly showBrand: boolean;
  /** Model */
  readonly showModel: boolean;
  /** Driver name */
  readonly showName: boolean;
  /** Car number */
  readonly showNumber: boolean;
  /** Class */
  readonly showClass: boolean;
  /** Position */
  readonly showPosition: boolean;
  /** Banner sits */
  readonly align: "right" | "left" | "center";
  /** Mirror the car */
  readonly mirrorCar: boolean;
  /** Class colour stripe */
  readonly classStripe: boolean;
  /** Panel colour */
  readonly panelColor: string;
  /** Panel opacity */
  readonly panelOpacity: number;
  /** Text colour */
  readonly textColor: string;
}

export const defaultSettings: Settings = {
  "driver": "player",
  "sessions": "race",
  "otherClasses": true,
  "lapped": false,
  "ignoreCaution": true,
  "displaySeconds": 4.5,
  "cooldownSeconds": 20,
  "maxQueue": 3,
  "showCar": true,
  "showBrand": true,
  "showModel": true,
  "showName": false,
  "showNumber": false,
  "showClass": false,
  "showPosition": false,
  "align": "right",
  "mirrorCar": true,
  "classStripe": false,
  "panelColor": "#2b2b29",
  "panelOpacity": 0.78,
  "textColor": "#f3f2ee"
};
