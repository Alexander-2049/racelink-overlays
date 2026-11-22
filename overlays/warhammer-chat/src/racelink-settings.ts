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
  readonly theme: "ember" | "graphite" | "tide" | "clear";
  /** Size */
  readonly fontSize: number;
  /** Background opacity */
  readonly opacity: number;
  /** Twitch channel */
  readonly channel: string;
  /** Messages shown at most */
  readonly maxMessages: number;
  /** Hide a message after (0 keeps it) */
  readonly hideAfterSeconds: number;
  /** Badges */
  readonly showBadges: boolean;
  /** Emotes as pictures */
  readonly showEmotes: boolean;
  /** Bold text */
  readonly boldText: boolean;
  /** New messages */
  readonly align: "bottom" | "top";
  /** Hide commands (starting with !) */
  readonly hideCommands: boolean;
  /** Hide messages of (comma separated logins) */
  readonly hiddenUsers: string;
  /** Highlight messages with (comma separated words) */
  readonly highlightWords: string;
}

export const defaultSettings: Settings = {
  "theme": "ember",
  "fontSize": 15,
  "opacity": 0.6,
  "channel": "warhammerracing",
  "maxMessages": 50,
  "hideAfterSeconds": 0,
  "showBadges": true,
  "showEmotes": true,
  "boldText": false,
  "align": "bottom",
  "hideCommands": false,
  "hiddenUsers": "moobot, nightbot",
  "highlightWords": ""
};
