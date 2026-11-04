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
  readonly theme: "SAKURA" | "NEON" | "SHONEN" | "MANGA";
  /** Size */
  readonly fontSize: number;
  /** Background opacity */
  readonly opacity: number;
  /** Driver name */
  readonly nameFormat: "0" | "2" | "3" | "1" | "4";
  /** Hide cars in the pit lane */
  readonly excludePit: boolean;
  /** Header */
  readonly showHeader: boolean;
  /** Header items */
  readonly headerItems: readonly Readonly<{ id: "session" | "remaining" | "sof" | "incidents" | "trackTemp"; visible: boolean }>[];
  /** Columns */
  readonly columns: readonly Readonly<{ id: "position" | "classStripe" | "number" | "brand" | "flag" | "name" | "tags" | "licence" | "rating" | "ratingChange" | "pit" | "lastLap" | "gap"; visible: boolean }>[];
  /** Intensity */
  readonly intensity: "CHILL" | "HYPE" | "MAX";
  /** Shake the board */
  readonly shake: boolean;
  /** Explosions */
  readonly explosions: boolean;
  /** Comic sound effects */
  readonly sfxText: boolean;
  /** Language of the effects */
  readonly language: "MIX" | "JP" | "EN";
  /** Rows slide when cars swap places */
  readonly rowSwap: boolean;
  /** Only in races */
  readonly raceOnly: boolean;
  /** Battle aura on close cars */
  readonly battleAura: boolean;
  /** Battle gap */
  readonly battleGap: number;
  /** Speed lines on your row */
  readonly speedLines: boolean;
  /** Sakura petals */
  readonly petals: boolean;
  /** Mascot */
  readonly mascotEnabled: boolean;
  /** Who */
  readonly mascot: "HANA" | "YUKI" | "RIN" | "MIO" | "AKANE" | "CUSTOM";
  /** Hair */
  readonly mascotHair: "TWIN" | "SHORT" | "BOB" | "LONG" | "HIME";
  /** Hair colour */
  readonly mascotHairColor: "PINK" | "BLONDE" | "SILVER" | "BROWN" | "DARK";
  /** Outfit */
  readonly mascotOutfit: "HOODIE" | "SEIFUKU1" | "SEIFUKU2" | "PE" | "WINTER" | "DRESS" | "PAJAMA";
  /** Glasses */
  readonly mascotGlasses: "NONE" | "RED" | "BLACK" | "ROUND";
  /** Flower hair clip */
  readonly mascotFlower: boolean;
  /** Choker */
  readonly mascotChoker: boolean;
  /** When she shows */
  readonly mascotMode: "ALWAYS" | "EVENTS";
  /** Side */
  readonly mascotSide: "RIGHT" | "LEFT";
  /** Size */
  readonly mascotSize: number;
  /** Speech bubbles */
  readonly mascotBubbles: boolean;
  /** Your overtakes (she celebrates) */
  readonly reactPass: boolean;
  /** Being overtaken (she is shocked) */
  readonly reactPassed: boolean;
  /** Close battles (she cheers) */
  readonly reactBattle: boolean;
  /** Your best laps (she dances) */
  readonly reactBest: boolean;
  /** The chequered flag (dance party) */
  readonly reactFinish: boolean;
}

export const defaultSettings: Settings = {
  "theme": "SAKURA",
  "fontSize": 14,
  "opacity": 0.85,
  "nameFormat": "0",
  "excludePit": false,
  "showHeader": true,
  "headerItems": [
    {
      "id": "session",
      "visible": true
    },
    {
      "id": "remaining",
      "visible": true
    },
    {
      "id": "sof",
      "visible": true
    },
    {
      "id": "incidents",
      "visible": true
    },
    {
      "id": "trackTemp",
      "visible": false
    }
  ],
  "columns": [
    {
      "id": "position",
      "visible": true
    },
    {
      "id": "classStripe",
      "visible": true
    },
    {
      "id": "number",
      "visible": true
    },
    {
      "id": "brand",
      "visible": true
    },
    {
      "id": "flag",
      "visible": false
    },
    {
      "id": "name",
      "visible": true
    },
    {
      "id": "tags",
      "visible": true
    },
    {
      "id": "licence",
      "visible": true
    },
    {
      "id": "rating",
      "visible": true
    },
    {
      "id": "ratingChange",
      "visible": false
    },
    {
      "id": "pit",
      "visible": true
    },
    {
      "id": "lastLap",
      "visible": false
    },
    {
      "id": "gap",
      "visible": true
    }
  ],
  "intensity": "HYPE",
  "shake": true,
  "explosions": true,
  "sfxText": true,
  "language": "MIX",
  "rowSwap": true,
  "raceOnly": false,
  "battleAura": true,
  "battleGap": 0.5,
  "speedLines": true,
  "petals": true,
  "mascotEnabled": true,
  "mascot": "HANA",
  "mascotHair": "TWIN",
  "mascotHairColor": "PINK",
  "mascotOutfit": "HOODIE",
  "mascotGlasses": "NONE",
  "mascotFlower": false,
  "mascotChoker": false,
  "mascotMode": "EVENTS",
  "mascotSide": "RIGHT",
  "mascotSize": 100,
  "mascotBubbles": true,
  "reactPass": true,
  "reactPassed": true,
  "reactBattle": true,
  "reactBest": true,
  "reactFinish": true
};
