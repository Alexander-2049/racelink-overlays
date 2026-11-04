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
  /** Shape */
  readonly Shape: "RECTANGLE" | "CIRCLE";
  /** Background colour */
  readonly BackgroundColor: string;
  /** Outline opacity */
  readonly BorderOpacity: number;
  /** Panel opacity */
  readonly PanelOpacity: number;
  /** Axes */
  readonly ShowRectangleAxisLines: boolean;
  /** Axes */
  readonly ShowCircleAxisLines: boolean;
  /** Outer outline */
  readonly ShowRectangleOuterRing: boolean;
  /** Outer outline */
  readonly ShowCircleOuterRing: boolean;
  /** Inner outline */
  readonly ShowTracInnerRings: boolean;
  /** Inner outline colour */
  readonly InnerRingsColor: string;
  /** Inner outline width */
  readonly InnerRingsSize: number;
  /** On */
  readonly GDot: boolean;
  /** Colour */
  readonly GDotColor: string;
  /** Size */
  readonly GDotRadius: number;
  /** History colour */
  readonly GDotHistoryColor: string;
  /** History size (points) */
  readonly GDotHistory: number;
  /** Fade (s) */
  readonly GDotDecay: number;
  /** Current G-force */
  readonly GCurrent: boolean;
  /** Maximum load */
  readonly GPeak: boolean;
  /** On */
  readonly GEnvelope: boolean;
  /** Envelope */
  readonly EnvelopeMode: "session" | "lap";
  /** Colour */
  readonly GEnvelopeColor: string;
  /** Line width */
  readonly GEnvelopeLineSize: number;
  /** Envelope stats */
  readonly ShowEnvelopeStats: boolean;
  /** Comparison on */
  readonly GComparisonEnv: boolean;
  /** Comparison mode */
  readonly ComparisonMode: "personalBestLap" | "personalSessionBestLap" | "personalLastLap";
  /** Colour */
  readonly GComparisonEnvColor: string;
  /** Line width */
  readonly GComparisonEnvLineSize: number;
  /** Line type */
  readonly GComparisonEnvLineType: "LINE" | "DOTTED";
  /** Comparison label */
  readonly ShowComparisonLabel: boolean;
  /** Comparison stats */
  readonly ShowComparisonStats: boolean;
  /** Widget */
  readonly "BottomWidget1.Widget": "None" | "CurrentPosition" | "Speed" | "Rpm" | "Gear" | "TrackTemp" | "AirTemp" | "WindSpeed" | "RelativeHumidity" | "TrackWetDryStatus" | "Sof" | "Incidents" | "SessionTimer" | "RemainingSessionTime" | "LapCounter" | "CurrentLapNumber" | "RemainingLaps" | "TrackTime" | "LocalPCTime" | "LocalPCTime12h" | "LastLapTime" | "FastestLapTime" | "CurrentLapTime" | "BrakeBias" | "WaterTemp" | "OilTemp" | "Abs" | "TractionControl" | "Fuel" | "RemainingFuelLaps" | "PushToPass" | "SessionType" | "TrackName" | "CarName" | "CarNumber" | "iRating" | "PositionGained" | "TotalNumberOfDrivers" | "TotalNumberOfClassDrivers";
  /** Theme */
  readonly "BottomWidget1.Theme": "transparent" | "default" | "carbon" | "glass" | "hex" | "slider" | "lcd" | "stripe";
  /** Widget title */
  readonly "BottomWidget1.IconType": "ICON" | "TEXT" | "NONE";
  /** Opacity */
  readonly "BottomWidget1.Opacity": number;
  /** Custom background colour */
  readonly "BottomWidget1.BackgroundColorEnabled": boolean;
  /** Background colour */
  readonly "BottomWidget1.BackgroundColor": string;
  /** Custom icon colour */
  readonly "BottomWidget1.IconColorEnabled": boolean;
  /** Icon colour */
  readonly "BottomWidget1.OverlayLabelOrIconColor": string;
  /** Custom value colour */
  readonly "BottomWidget1.ValueColorEnabled": boolean;
  /** Value colour */
  readonly "BottomWidget1.ValueColor": string;
  /** Scrolling text */
  readonly "BottomWidget1.ScrollTextEnabled": boolean;
  /** Fixed width */
  readonly "BottomWidget1.FixedWidth": boolean;
  /** Width */
  readonly "BottomWidget1.Width": number;
  /** Widget */
  readonly "BottomWidget2.Widget": "None" | "CurrentPosition" | "Speed" | "Rpm" | "Gear" | "TrackTemp" | "AirTemp" | "WindSpeed" | "RelativeHumidity" | "TrackWetDryStatus" | "Sof" | "Incidents" | "SessionTimer" | "RemainingSessionTime" | "LapCounter" | "CurrentLapNumber" | "RemainingLaps" | "TrackTime" | "LocalPCTime" | "LocalPCTime12h" | "LastLapTime" | "FastestLapTime" | "CurrentLapTime" | "BrakeBias" | "WaterTemp" | "OilTemp" | "Abs" | "TractionControl" | "Fuel" | "RemainingFuelLaps" | "PushToPass" | "SessionType" | "TrackName" | "CarName" | "CarNumber" | "iRating" | "PositionGained" | "TotalNumberOfDrivers" | "TotalNumberOfClassDrivers";
  /** Theme */
  readonly "BottomWidget2.Theme": "transparent" | "default" | "carbon" | "glass" | "hex" | "slider" | "lcd" | "stripe";
  /** Widget title */
  readonly "BottomWidget2.IconType": "ICON" | "TEXT" | "NONE";
  /** Opacity */
  readonly "BottomWidget2.Opacity": number;
  /** Custom background colour */
  readonly "BottomWidget2.BackgroundColorEnabled": boolean;
  /** Background colour */
  readonly "BottomWidget2.BackgroundColor": string;
  /** Custom icon colour */
  readonly "BottomWidget2.IconColorEnabled": boolean;
  /** Icon colour */
  readonly "BottomWidget2.OverlayLabelOrIconColor": string;
  /** Custom value colour */
  readonly "BottomWidget2.ValueColorEnabled": boolean;
  /** Value colour */
  readonly "BottomWidget2.ValueColor": string;
  /** Scrolling text */
  readonly "BottomWidget2.ScrollTextEnabled": boolean;
  /** Fixed width */
  readonly "BottomWidget2.FixedWidth": boolean;
  /** Width */
  readonly "BottomWidget2.Width": number;
  /** Widget */
  readonly "BottomWidget3.Widget": "None" | "CurrentPosition" | "Speed" | "Rpm" | "Gear" | "TrackTemp" | "AirTemp" | "WindSpeed" | "RelativeHumidity" | "TrackWetDryStatus" | "Sof" | "Incidents" | "SessionTimer" | "RemainingSessionTime" | "LapCounter" | "CurrentLapNumber" | "RemainingLaps" | "TrackTime" | "LocalPCTime" | "LocalPCTime12h" | "LastLapTime" | "FastestLapTime" | "CurrentLapTime" | "BrakeBias" | "WaterTemp" | "OilTemp" | "Abs" | "TractionControl" | "Fuel" | "RemainingFuelLaps" | "PushToPass" | "SessionType" | "TrackName" | "CarName" | "CarNumber" | "iRating" | "PositionGained" | "TotalNumberOfDrivers" | "TotalNumberOfClassDrivers";
  /** Theme */
  readonly "BottomWidget3.Theme": "transparent" | "default" | "carbon" | "glass" | "hex" | "slider" | "lcd" | "stripe";
  /** Widget title */
  readonly "BottomWidget3.IconType": "ICON" | "TEXT" | "NONE";
  /** Opacity */
  readonly "BottomWidget3.Opacity": number;
  /** Custom background colour */
  readonly "BottomWidget3.BackgroundColorEnabled": boolean;
  /** Background colour */
  readonly "BottomWidget3.BackgroundColor": string;
  /** Custom icon colour */
  readonly "BottomWidget3.IconColorEnabled": boolean;
  /** Icon colour */
  readonly "BottomWidget3.OverlayLabelOrIconColor": string;
  /** Custom value colour */
  readonly "BottomWidget3.ValueColorEnabled": boolean;
  /** Value colour */
  readonly "BottomWidget3.ValueColor": string;
  /** Scrolling text */
  readonly "BottomWidget3.ScrollTextEnabled": boolean;
  /** Fixed width */
  readonly "BottomWidget3.FixedWidth": boolean;
  /** Width */
  readonly "BottomWidget3.Width": number;
}

export const defaultSettings: Settings = {
  "Opacity": 0.75,
  "FontFamily": "Montserrat",
  "FontWeight": "Semibold",
  "ShowTitle": false,
  "Shape": "RECTANGLE",
  "BackgroundColor": "#202024",
  "BorderOpacity": 1,
  "PanelOpacity": 1,
  "ShowRectangleAxisLines": true,
  "ShowCircleAxisLines": false,
  "ShowRectangleOuterRing": false,
  "ShowCircleOuterRing": true,
  "ShowTracInnerRings": false,
  "InnerRingsColor": "#000000",
  "InnerRingsSize": 2,
  "GDot": true,
  "GDotColor": "#AEBBFF",
  "GDotRadius": 4,
  "GDotHistoryColor": "#5A78FF",
  "GDotHistory": 200,
  "GDotDecay": 3,
  "GCurrent": true,
  "GPeak": true,
  "GEnvelope": true,
  "EnvelopeMode": "session",
  "GEnvelopeColor": "#FFFFFF",
  "GEnvelopeLineSize": 2,
  "ShowEnvelopeStats": false,
  "GComparisonEnv": false,
  "ComparisonMode": "personalBestLap",
  "GComparisonEnvColor": "#FF7878",
  "GComparisonEnvLineSize": 2,
  "GComparisonEnvLineType": "LINE",
  "ShowComparisonLabel": true,
  "ShowComparisonStats": false,
  "BottomWidget1.Widget": "BrakeBias",
  "BottomWidget1.Theme": "transparent",
  "BottomWidget1.IconType": "ICON",
  "BottomWidget1.Opacity": 0.8,
  "BottomWidget1.BackgroundColorEnabled": false,
  "BottomWidget1.BackgroundColor": "#000000",
  "BottomWidget1.IconColorEnabled": false,
  "BottomWidget1.OverlayLabelOrIconColor": "#444444",
  "BottomWidget1.ValueColorEnabled": false,
  "BottomWidget1.ValueColor": "#ffffff",
  "BottomWidget1.ScrollTextEnabled": false,
  "BottomWidget1.FixedWidth": false,
  "BottomWidget1.Width": 120,
  "BottomWidget2.Widget": "WindSpeed",
  "BottomWidget2.Theme": "transparent",
  "BottomWidget2.IconType": "ICON",
  "BottomWidget2.Opacity": 0.8,
  "BottomWidget2.BackgroundColorEnabled": false,
  "BottomWidget2.BackgroundColor": "#000000",
  "BottomWidget2.IconColorEnabled": false,
  "BottomWidget2.OverlayLabelOrIconColor": "#444444",
  "BottomWidget2.ValueColorEnabled": false,
  "BottomWidget2.ValueColor": "#ffffff",
  "BottomWidget2.ScrollTextEnabled": false,
  "BottomWidget2.FixedWidth": false,
  "BottomWidget2.Width": 120,
  "BottomWidget3.Widget": "TrackTemp",
  "BottomWidget3.Theme": "transparent",
  "BottomWidget3.IconType": "ICON",
  "BottomWidget3.Opacity": 0.8,
  "BottomWidget3.BackgroundColorEnabled": false,
  "BottomWidget3.BackgroundColor": "#000000",
  "BottomWidget3.IconColorEnabled": false,
  "BottomWidget3.OverlayLabelOrIconColor": "#444444",
  "BottomWidget3.ValueColorEnabled": false,
  "BottomWidget3.ValueColor": "#ffffff",
  "BottomWidget3.ScrollTextEnabled": false,
  "BottomWidget3.FixedWidth": false,
  "BottomWidget3.Width": 120
};
