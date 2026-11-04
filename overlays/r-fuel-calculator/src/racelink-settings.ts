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
  /** Background opacity */
  readonly Opacity: number;
  /** Font */
  readonly FontFamily: "Montserrat" | "Roboto" | "RobotoMono" | "TitilliumWeb" | "Exo2" | "BarlowCondensed" | "JetBrainsMono" | "Geist";
  /** Weight */
  readonly FontWeight: "Regular" | "Medium" | "Semibold" | "Bold" | "Extra";
  /** Overlay header */
  readonly ShowTitle: boolean;
  /** Header colour */
  readonly OverlayTitleColor: string;
  /** Decimal places */
  readonly DecimalCount: number;
  /** Fuel gauge */
  readonly ShowFuelBar: boolean;
  /** Fuel amount */
  readonly ShowFuel: boolean;
  /** Consumption history */
  readonly ShowFuelHistory: boolean;
  /** Fuel history opacity */
  readonly FuelHistoryOpacity: number;
  /** Time on fuel */
  readonly ShowTimeRemainingUntilEmpty: boolean;
  /** Target time on fuel */
  readonly ShowTimeRemainingUntilEmptyTarget: boolean;
  /** Laps to empty */
  readonly ShowLapsRemainingUntilEmpty: boolean;
  /** Lap target */
  readonly ShowLapsRemainingUntilEmptyTarget: boolean;
  /** Average consumption of all laps */
  readonly ShowAllLapsAverage: boolean;
  /** Colour: Avg */
  readonly AllLapsAverageColor: string;
  /** Highest consumption */
  readonly ShowHighestLap: boolean;
  /** Colour: Max */
  readonly HighestLapColor: string;
  /** Lowest consumption */
  readonly ShowLowestLap: boolean;
  /** Colour: Min */
  readonly LowestLapColor: string;
  /** Last lap */
  readonly ShowLastLap: boolean;
  /** Colour: Last */
  readonly LastLapColor: string;
  /** Avg. of the last 5 laps */
  readonly ShowLast5Average: boolean;
  /** Colour: L5 */
  readonly Last5AverageColor: string;
  /** Avg. of the last 10 laps */
  readonly ShowLast10Average: boolean;
  /** Colour: L10 */
  readonly Last10AverageColor: string;
  /** Consumption */
  readonly ShowAverageFuel: boolean;
  /** Laps left */
  readonly ShowLaps: boolean;
  /** Total pit stops */
  readonly ShowTotalPitstops: boolean;
  /** Amount to refuel */
  readonly ShowRefuel: boolean;
  /** Total fuel to add */
  readonly ShowTotalRefuel: boolean;
  /** Fuel at the finish */
  readonly ShowFuelAtEnd: boolean;
  /** Refuel strategy in use */
  readonly RefuelingStrategy: "AllLapsAverage" | "HighestLap" | "LowestLap" | "LastLap" | "Last5Average" | "Last10Average";
  /** Extra fuel (per lap) */
  readonly RefuelAdditionalFuelInLaps: number;
  /** Refuel window */
  readonly ShowFuelWindowBar: boolean;
  /** Refuel window status */
  readonly ShowFuelWindowStatus: boolean;
}

export const defaultSettings: Settings = {
  "Opacity": 0.8,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "ShowTitle": true,
  "OverlayTitleColor": "#d10404",
  "DecimalCount": 1,
  "ShowFuelBar": true,
  "ShowFuel": true,
  "ShowFuelHistory": true,
  "FuelHistoryOpacity": 0.5,
  "ShowTimeRemainingUntilEmpty": false,
  "ShowTimeRemainingUntilEmptyTarget": true,
  "ShowLapsRemainingUntilEmpty": false,
  "ShowLapsRemainingUntilEmptyTarget": true,
  "ShowAllLapsAverage": true,
  "AllLapsAverageColor": "#ffffff",
  "ShowHighestLap": true,
  "HighestLapColor": "#ffffff",
  "ShowLowestLap": true,
  "LowestLapColor": "#ffffff",
  "ShowLastLap": false,
  "LastLapColor": "#ffffff",
  "ShowLast5Average": false,
  "Last5AverageColor": "#ffffff",
  "ShowLast10Average": false,
  "Last10AverageColor": "#ffffff",
  "ShowAverageFuel": true,
  "ShowLaps": true,
  "ShowTotalPitstops": false,
  "ShowRefuel": true,
  "ShowTotalRefuel": false,
  "ShowFuelAtEnd": true,
  "RefuelingStrategy": "Last10Average",
  "RefuelAdditionalFuelInLaps": 1.2,
  "ShowFuelWindowBar": false,
  "ShowFuelWindowStatus": false
};
