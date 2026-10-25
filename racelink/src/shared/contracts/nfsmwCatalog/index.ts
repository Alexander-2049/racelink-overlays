import type { OverlayDefinition } from '../overlayCatalog.js';
import type { OverlayKind } from '../layouts.js';
import { nfsmwEaTrax } from './eaTrax.js';
import { nfsmwLapTime } from './lapTime.js';
import { nfsmwLeaderboard } from './leaderboard.js';
import { nfsmwMinimap } from './minimap.js';
import { nfsmwSpeedometer } from './speedometer.js';

/** The NFSMW- overlays: parts of the game's HUD. */
export type NfsmwKind = Extract<OverlayKind, `nfsmw-${string}`>;

export const nfsmwCatalog: Readonly<Record<NfsmwKind, OverlayDefinition>> = {
  'nfsmw-speedometer': nfsmwSpeedometer,
  'nfsmw-ea-trax': nfsmwEaTrax,
  'nfsmw-minimap': nfsmwMinimap,
  'nfsmw-leaderboard': nfsmwLeaderboard,
  'nfsmw-lap-time': nfsmwLapTime,
};
