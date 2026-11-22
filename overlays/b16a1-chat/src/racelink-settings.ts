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
  /** Twitch channel */
  readonly channel: string;
  /** Messages shown at most */
  readonly maxMessages: number;
  /** Hide a message after */
  readonly hideAfterSeconds: number;
  /** Theme */
  readonly theme: "b16a1" | "vivid" | "graphite" | "ocean" | "paper";
  /** Panel opacity */
  readonly opacity: number;
  /** Text size */
  readonly fontSize: number;
  /** Badges */
  readonly showBadges: boolean;
  /** Emotes as pictures */
  readonly showEmotes: boolean;
  /** Newest message */
  readonly messagesAt: "bottom" | "top";
  /** Hide these users */
  readonly hiddenUsers: string;
  /** Hide commands (!something) */
  readonly hideCommands: boolean;
  /** Highlight messages with */
  readonly highlightWords: string;
}

export const defaultSettings: Settings = {
  "channel": "b16a1series",
  "maxMessages": 20,
  "hideAfterSeconds": 0,
  "theme": "b16a1",
  "opacity": 0,
  "fontSize": 22,
  "showBadges": true,
  "showEmotes": true,
  "messagesAt": "bottom",
  "hiddenUsers": "",
  "hideCommands": false,
  "highlightWords": ""
};
