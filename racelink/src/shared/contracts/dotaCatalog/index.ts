import type { OverlayKind } from '../layouts.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { dotaInvokerCooldowns } from './invokerCooldowns.js';

/** The Dota- overlays: parts of the Dota 2 HUD, from Game State Integration. */
export type DotaKind = Extract<OverlayKind, `dota-${string}`>;

export const dotaCatalog: Readonly<Record<DotaKind, OverlayDefinition>> = {
  'dota-invoker-cooldowns': dotaInvokerCooldowns,
};
