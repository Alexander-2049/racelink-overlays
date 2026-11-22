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
  /** Header */
  readonly showHeader: boolean;
  /** Header text */
  readonly title: string;
  /** Twitch mark before each message */
  readonly showPlatform: boolean;
  /** Badges (streamer, moderator, VIP, subscriber) */
  readonly showBadges: boolean;
  /** Emotes as pictures */
  readonly showEmotes: boolean;
  /** Twitch channel */
  readonly channel: string;
  /** Messages shown */
  readonly maxMessages: number;
  /** Hide a message after (0 keeps them) */
  readonly hideAfter: number;
  /** Hide commands (messages starting with !) */
  readonly hideCommands: boolean;
  /** Hide these users (bots), separated by commas */
  readonly hiddenUsers: string;
  /** Highlight these words, separated by commas */
  readonly highlight: string;
}

export const defaultSettings: Settings = {
  "theme": "ANASTASIA",
  "fontSize": 15,
  "opacity": 0.8,
  "radius": 6,
  "accentLine": true,
  "showHeader": true,
  "title": "Chat",
  "showPlatform": true,
  "showBadges": true,
  "showEmotes": true,
  "channel": "anastasia_striking",
  "maxMessages": 12,
  "hideAfter": 0,
  "hideCommands": true,
  "hiddenUsers": "nightbot, moobot, streamelements, jeetbot",
  "highlight": ""
};
