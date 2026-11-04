import type { DesktopPlatform } from './desktop.js';
import type { OverlayKind } from './layouts.js';

export const gameIds = [
  'iracing',
  'le-mans-ultimate',
  'assetto-corsa',
  'assetto-corsa-competizione',
  'assetto-corsa-evo',
  'assetto-corsa-rally',
  'project-motor-racing',
  'rfactor-2',
] as const;

export type GameId = (typeof gameIds)[number];

export type GameCapabilities = Readonly<{
  telemetry: boolean;
  setups: boolean;
  maps: boolean;
  classes: boolean;
  pits: boolean;
  flags: boolean;
}>;

export type GameDefinition = Readonly<{
  id: GameId;
  name: string;
  capabilities: GameCapabilities;
}>;

export type OverlayCapability = 'telemetry' | 'maps' | 'classes' | 'pits' | 'flags';

export const overlayCapabilityRequirements: Readonly<
  Record<OverlayKind, readonly OverlayCapability[]>
> = {
  abs: ['telemetry'],
  'arcade-map': ['telemetry', 'maps', 'classes'],
  'blind-spot': ['telemetry'],
  dash: ['telemetry'],
  'g-force-circle': ['telemetry'],
  'input-telemetry': ['telemetry'],
  'rejoin-indicator': ['telemetry', 'maps'],
  relatives: ['telemetry', 'classes'],
  'relatives-pro': ['telemetry', 'classes'],
  'rpm-led': ['telemetry'],
  'stage-delta': ['telemetry'],
  standings: ['telemetry', 'classes'],
  'standings-pro': ['telemetry', 'classes'],
  'r-flags': ['telemetry'],
  'r-digiflag': ['telemetry'],
  'r-input-telemetry': ['telemetry'],
  'r-relatives': ['telemetry', 'classes'],
  'r-standings': ['telemetry', 'classes'],
  'r-fuel-calculator': ['telemetry'],
  'r-g-force-meter': ['telemetry'],
  'r-delta-trace': ['telemetry'],
  'r-laptime-graph': ['telemetry'],
  'r-lap-timing': ['telemetry'],
  'r-boost-box': ['telemetry'],
  'r-pitbox-helper': ['telemetry', 'pits'],
  'nfsmw-speedometer': ['telemetry'],
  'nfsmw-ea-trax': [],
  'nfsmw-minimap': ['telemetry', 'maps'],
  'nfsmw-leaderboard': ['telemetry'],
  'nfsmw-lap-time': ['telemetry'],
  'track-map': ['telemetry', 'maps', 'classes'],
  weather: ['telemetry'],
  'twitch-chat': [],
  wind: ['telemetry'],
};

const overlayGameRestrictions: Readonly<Partial<Record<OverlayKind, readonly GameId[]>>> = {
  abs: ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'arcade-map': ['iracing'],
  'blind-spot': ['iracing'],
  dash: ['iracing', 'assetto-corsa'],
  'g-force-circle': ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'input-telemetry': ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'rejoin-indicator': ['iracing'],
  relatives: ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'relatives-pro': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'rpm-led': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'stage-delta': ['assetto-corsa-rally'],
  standings: ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'standings-pro': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-flags': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-digiflag': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-input-telemetry': ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'r-relatives': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-standings': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-fuel-calculator': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-g-force-meter': ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'r-delta-trace': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-laptime-graph': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-lap-timing': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-boost-box': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'r-pitbox-helper': ['iracing', 'le-mans-ultimate'],
  'nfsmw-speedometer': ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'nfsmw-ea-trax': ['iracing', 'le-mans-ultimate', 'assetto-corsa', 'assetto-corsa-rally'],
  'nfsmw-minimap': ['iracing'],
  'nfsmw-leaderboard': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'nfsmw-lap-time': ['iracing', 'le-mans-ultimate', 'assetto-corsa'],
  'track-map': ['iracing'],
  weather: ['iracing', 'le-mans-ultimate'],
  wind: ['iracing', 'le-mans-ultimate'],
};

const unavailableCapabilities: GameCapabilities = {
  telemetry: false,
  setups: false,
  maps: false,
  classes: false,
  pits: false,
  flags: false,
};

export const gameCatalog: readonly GameDefinition[] = [
  {
    id: 'iracing',
    name: 'iRacing',
    capabilities: {
      telemetry: true,
      setups: true,
      maps: true,
      classes: true,
      pits: true,
      flags: true,
    },
  },
  {
    id: 'le-mans-ultimate',
    name: 'Le Mans Ultimate',
    capabilities: {
      telemetry: true,
      setups: false,
      maps: false,
      classes: false,
      pits: true,
      flags: true,
    },
  },
  {
    id: 'assetto-corsa',
    name: 'Assetto Corsa',
    capabilities: {
      telemetry: true,
      setups: false,
      maps: false,
      // AC has a single race class. Race-Element uses the same explicit fallback.
      classes: true,
      pits: true,
      flags: true,
    },
  },
  {
    id: 'assetto-corsa-competizione',
    name: 'Assetto Corsa Competizione',
    capabilities: unavailableCapabilities,
  },
  { id: 'assetto-corsa-evo', name: 'Assetto Corsa EVO', capabilities: unavailableCapabilities },
  {
    id: 'assetto-corsa-rally',
    name: 'Assetto Corsa Rally',
    // Car telemetry only: rally stages have no maps, classes, pits, or flags in Racelink.
    capabilities: { ...unavailableCapabilities, telemetry: true },
  },
  {
    id: 'project-motor-racing',
    name: 'Project Motor Racing',
    capabilities: unavailableCapabilities,
  },
  { id: 'rfactor-2', name: 'rFactor 2', capabilities: unavailableCapabilities },
];

export const gameChannels = {
  getActive: 'games:get-active',
  setActive: 'games:set-active',
  getSteamRichPresence: 'games:get-steam-rich-presence',
  setSteamRichPresence: 'games:set-steam-rich-presence',
  getShareMedia: 'games:get-share-media',
  setShareMedia: 'games:set-share-media',
} as const;

export type GameApi = Readonly<{
  getActive: () => Promise<GameId>;
  setActive: (gameId: GameId) => Promise<GameId>;
  getSteamRichPresence: () => Promise<boolean>;
  setSteamRichPresence: (enabled: boolean) => Promise<boolean>;
  /** Whether overlays see the track the computer plays (`system.media`). */
  getShareMedia: () => Promise<boolean>;
  setShareMedia: (enabled: boolean) => Promise<boolean>;
}>;

/**
 * Can a game's data reach Racelink on this operating system? Mirrors
 * `game_availability` in racelink-contracts (PLAN.md, part C.2).
 */
export type GameAvailability =
  | Readonly<{ state: 'available' }>
  /** Works under Proton once the Racelink shared-memory bridge runs next to the game. */
  | Readonly<{ state: 'needs-bridge' }>
  /** The interface names the reason in its language. */
  | Readonly<{ state: 'unsupported'; reason: 'anti-cheat' | 'platform' }>;

export const gameAvailability = (gameId: GameId, platform: DesktopPlatform): GameAvailability => {
  if (platform === 'win32') return { state: 'available' };
  if (platform === 'linux') {
    if (gameId === 'iracing') return { state: 'unsupported', reason: 'anti-cheat' };
    if (
      gameId === 'le-mans-ultimate' ||
      gameId === 'assetto-corsa' ||
      gameId === 'assetto-corsa-rally'
    )
      return { state: 'needs-bridge' };
    return { state: 'available' };
  }
  return getGameDefinition(gameId).capabilities.telemetry
    ? { state: 'unsupported', reason: 'platform' }
    : { state: 'available' };
};

export const isGameId = (value: unknown): value is GameId =>
  typeof value === 'string' && gameIds.includes(value as GameId);

export const getGameDefinition = (gameId: GameId): GameDefinition =>
  gameCatalog.find((game) => game.id === gameId) ?? gameCatalog[0];

export const supportsOverlay = (gameId: GameId, overlayKind: OverlayKind): boolean => {
  const capabilities = getGameDefinition(gameId).capabilities;
  const allowedGames = overlayGameRestrictions[overlayKind];
  return (
    (allowedGames === undefined || allowedGames.includes(gameId)) &&
    overlayCapabilityRequirements[overlayKind].every((capability) => capabilities[capability])
  );
};
