import type { OverlayDefinition } from '../overlayCatalog.js';
import type { OverlayKind } from '../layouts.js';
import { rBoostBox } from './boost-box.js';
import { rDeltaTrace } from './delta-trace.js';
import { rDigiflag } from './digiflag.js';
import { rFuelCalculator } from './fuel-calculator.js';
import { rGForceMeter } from './g-force-meter.js';
import { rFlags } from './flags.js';
import { rInputTelemetry } from './input-telemetry.js';
import { rLapTiming } from './lap-timing.js';
import { rLaptimeGraph } from './laptime-graph.js';
import { rPitboxHelper } from './pitbox-helper.js';
import { rRelatives } from './relatives.js';
import { rStandings } from './standings.js';

/** The R- overlays, together with their settings. */
export type RKind = Extract<OverlayKind, `r-${string}`>;

export const rCatalog: Readonly<Record<RKind, OverlayDefinition>> = {
  'r-flags': rFlags,
  'r-digiflag': rDigiflag,
  'r-input-telemetry': rInputTelemetry,
  'r-relatives': rRelatives,
  'r-standings': rStandings,
  'r-boost-box': rBoostBox,
  'r-lap-timing': rLapTiming,
  'r-laptime-graph': rLaptimeGraph,
  'r-pitbox-helper': rPitboxHelper,
  'r-fuel-calculator': rFuelCalculator,
  'r-g-force-meter': rGForceMeter,
  'r-delta-trace': rDeltaTrace,
};
