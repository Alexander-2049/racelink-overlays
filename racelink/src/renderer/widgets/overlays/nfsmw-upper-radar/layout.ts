// The radar of the game's race HUD (HUD_SingleRace interface package): its
// objects where the APPEAR script leaves them, in the game's units (a screen
// 480 units high, its centre the origin, y down).
import type { Stage } from '../nfsmw-common/stageCanvas';

export interface Placed {
  readonly x: number;
  readonly y: number;
  /** Width and height; a negative width mirrors the texture. */
  readonly size: readonly [number, number];
  readonly color: readonly [number, number, number];
}

/** The strip under the mirror, with a little room around it. */
export const stage: Stage = { x: -98, y: -221, width: 196, height: 40 };

/** How long the radar takes to slide in (APPEAR script). */
export const appearMs = 600;

/** The backing with holes for the lights (Radar_Backing). */
export const backing = {
  x: -0.5,
  y: -200.947,
  size: [185, 32],
  color: [0, 0, 0],
  alpha: 200,
  appearOffsetY: -41,
} as const satisfies Placed & { readonly alpha: number; readonly appearOffsetY: number };

/** The group of the dome, the arrow and the lights. */
export const group = { alpha: 235, appearOffsetY: -43 } as const;

const green = [194, 242, 66] as const;
const ledGreen = [195, 242, 66] as const;
/** The radar's second colour in the package: the dome, the arrow and the lights turn amber. */
export const warmColor = [255, 174, 64] as const;

/** The dome (Radar_Icon). */
export const dome: Placed = { x: -1, y: -200, size: [32, 32], color: green };
/** The arrow to the threat (Radar_DirectionArrow), turned about its middle. */
export const arrow: Placed = { x: -1, y: -196, size: [32, 32], color: green };
/** The lights (Radar_LEDs_Color); the right ones are the left ones mirrored. */
export const leds = {
  left: { x: -54, y: -201, size: [128, 32], color: ledGreen },
  right: { x: 53, y: -200.997, size: [-128, 32], color: ledGreen },
} as const satisfies Record<string, Placed>;

/**
 * Where to cut the light texture (texture pixels) so `lit` columns burn from
 * the dome outwards: the columns are 24 pixels apart, the one by the dome
 * starts at 390.
 */
export const ledCropX = (lit: number): number => 414 - 24 * lit - 4;
