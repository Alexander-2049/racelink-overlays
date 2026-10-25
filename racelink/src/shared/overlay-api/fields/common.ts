import type { GameId } from '../../contracts/games.js';
import { oneOf } from '../schema.js';

/** Circuit games with a full adapter. Fields default to being populated by all of them. */
export const circuitGames = [
  'iracing',
  'le-mans-ultimate',
  'assetto-corsa',
] as const satisfies readonly GameId[];
/**
 * Every game with a telemetry adapter. AC Rally publishes car telemetry only, so
 * a field lists it explicitly when its adapter populates the value.
 */
export const telemetryGames = [
  ...circuitGames,
  'assetto-corsa-rally',
] as const satisfies readonly GameId[];

export const dota = ['dota-2'] as const satisfies readonly GameId[];
/** Every game Racelink reads, racing or not: for the topics every game fills. */
export const everyGame = [...telemetryGames, ...dota] as const satisfies readonly GameId[];

export const iracing = ['iracing'] as const satisfies readonly GameId[];
export const lmu = ['le-mans-ultimate'] as const satisfies readonly GameId[];
export const ac = ['assetto-corsa'] as const satisfies readonly GameId[];
export const iracingLmu = ['iracing', 'le-mans-ultimate'] as const satisfies readonly GameId[];
export const iracingAc = ['iracing', 'assetto-corsa'] as const satisfies readonly GameId[];
export const lmuAc = ['le-mans-ultimate', 'assetto-corsa'] as const satisfies readonly GameId[];
export const acRally = ['assetto-corsa-rally'] as const satisfies readonly GameId[];
/** The given games plus AC Rally, for fields its adapter also populates. */
export const withAcRally = <const G extends readonly GameId[]>(games: G) =>
  [...games, ...acRally] as const;

export const flagValues = [
  'green',
  'yellow',
  'yellowWaving',
  'caution',
  'cautionWaving',
  'blue',
  'white',
  'checkered',
  'red',
  'black',
  'meatball',
  'disqualify',
  'penalty',
  'startReady',
  'startSet',
  'startGo',
] as const;
export type Flag = (typeof flagValues)[number];
export const flag = (description: string) => oneOf(flagValues, description);

/** Finer flag states than `flag`; the sims report the extra ones as separate bits. */
export const flagDetailValues = [
  'green',
  'greenHeld',
  'oneLapToGreen',
  'tenToGo',
  'fiveToGo',
  'yellow',
  'yellowWaving',
  'caution',
  'cautionWaving',
  'randomWaving',
  'crossed',
  'debris',
  'blue',
  'white',
  'checkered',
  'red',
  'black',
  'disqualify',
  'furled',
  'repair',
  'startHidden',
  'startReady',
  'startSet',
  'startGo',
] as const;
export type FlagDetail = (typeof flagDetailValues)[number];
export const flagDetail = (description: string) => oneOf(flagDetailValues, description);

export const trackSurfaceValues = [
  'notInWorld',
  'offTrack',
  'pitStall',
  'approachingPits',
  'onTrack',
] as const;
export type TrackSurface = (typeof trackSurfaceValues)[number];
