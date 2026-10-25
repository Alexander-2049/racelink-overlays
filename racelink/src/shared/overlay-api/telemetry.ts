import { gameIds } from '../contracts/games.js';
import type { RaceDirectorState } from '../contracts/raceDirector.js';
import { isTrackGeometry, type TrackGeometry } from '../contracts/track.js';
import { carNode, type CarTelemetry } from './fields/car.js';
import { circuitGames, everyGame } from './fields/common.js';
import { controlsNode, type ControlsTelemetry } from './fields/controls.js';
import { deltaNode, type DeltaTelemetry } from './fields/delta.js';
import { dotaNode, type DotaTelemetry } from './fields/dota.js';
import { driversNode, type DriversTelemetry } from './fields/drivers.js';
import {
  radarNode,
  weatherNode,
  type RadarTelemetry,
  type WeatherTelemetry,
} from './fields/environment.js';
import { sessionNode, type SessionTelemetry } from './fields/session.js';
import { streamNode, type StreamTelemetry } from './fields/stream.js';
import { systemNode, type SystemTelemetry } from './fields/system.js';
import { fuelNode, timingNode, type FuelTelemetry, type TimingTelemetry } from './fields/timing.js';
import { vehicleNode, type VehicleTelemetry } from './fields/vehicle.js';
import {
  describeFields,
  external,
  nullable,
  num,
  obj,
  oneOf,
  type FieldDescriptor,
  type Infer,
  type Node,
} from './schema.js';

/** Major version of the public overlay API. Changes inside a major are additive only. */
export const overlayApiVersion = 2;
/** Minor version of the field catalog; bump it when fields are added. */
export const overlayApiRevision = '2.6';

const connectionNode = obj(
  {
    status: oneOf(['connected', 'disconnected'], 'Whether a game is sending telemetry.'),
    game: nullable(oneOf(gameIds, 'Game that is sending telemetry.')),
    mode: oneOf(['live', 'demo'], 'Demo mode sends generated data instead of game telemetry.'),
  },
  { description: 'Connection to the game.', games: everyGame },
);

const performanceNode = obj(
  {
    sourceHz: num({ description: 'Telemetry read rate.', unit: 'count' }),
    averageReadMs: num('Average read time in milliseconds.'),
    maximumReadMs: num('Slowest read in milliseconds.'),
    connectedClients: num({ description: 'Connected WebSocket clients.', unit: 'count' }),
  },
  { description: 'Racelink telemetry pipeline metrics.', games: everyGame },
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isRaceDirectorState = (value: unknown): value is RaceDirectorState =>
  isRecord(value) &&
  typeof value.available === 'boolean' &&
  Array.isArray(value.drivers) &&
  Array.isArray(value.cameras);

export const topicNodes = {
  connection: connectionNode,
  car: carNode,
  controls: controlsNode,
  vehicle: vehicleNode,
  session: sessionNode,
  timing: timingNode,
  delta: deltaNode,
  fuel: fuelNode,
  drivers: driversNode,
  weather: weatherNode,
  radar: radarNode,
  track: nullable(
    external('TrackGeometry', isTrackGeometry, {
      description: 'Track outline and pit lane in world coordinates; null when unknown.',
      games: ['iracing'],
    }),
  ),
  performance: performanceNode,
  system: systemNode,
  stream: streamNode,
  dota: dotaNode,
  'race-director': external('RaceDirectorState', isRaceDirectorState, {
    description: 'iRacing replay and camera state used by the Race Director page.',
    games: ['iracing'],
  }),
} as const satisfies Readonly<Record<string, Node>>;

export type TelemetryTopic = keyof typeof topicNodes;
export const telemetryTopics = Object.keys(topicNodes) as readonly TelemetryTopic[];
/** Data of every topic. An interface so the compiler resolves the inferred types once. */
export interface TelemetryTopics {
  readonly connection: Infer<typeof connectionNode>;
  readonly car: CarTelemetry;
  readonly controls: ControlsTelemetry;
  readonly vehicle: VehicleTelemetry;
  readonly session: SessionTelemetry;
  readonly timing: TimingTelemetry;
  readonly delta: DeltaTelemetry;
  readonly fuel: FuelTelemetry;
  readonly drivers: DriversTelemetry;
  readonly weather: WeatherTelemetry;
  readonly radar: RadarTelemetry;
  readonly track: TrackGeometry | null;
  readonly performance: Infer<typeof performanceNode>;
  readonly system: SystemTelemetry;
  readonly stream: StreamTelemetry;
  readonly dota: DotaTelemetry;
  readonly 'race-director': RaceDirectorState;
}
/** Compile-time check that the interface matches the catalog. */
export type TelemetryTopicsMatchCatalog = {
  readonly [K in TelemetryTopic]: Infer<(typeof topicNodes)[K]>;
} extends TelemetryTopics
  ? true
  : never;
const catalogMatches: TelemetryTopicsMatchCatalog = true;
// eslint-disable-next-line @typescript-eslint/no-meaningless-void-operator -- marks the compile-time check as used.
void catalogMatches;

export const isTelemetryTopic = (value: unknown): value is TelemetryTopic =>
  typeof value === 'string' && value in topicNodes;

/** Minimum time between two messages of a topic sent to one client. */
export const topicIntervalMs: Readonly<Record<TelemetryTopic, number>> = {
  connection: 250,
  car: 16,
  controls: 100,
  vehicle: 50,
  session: 250,
  timing: 250,
  delta: 16,
  fuel: 250,
  drivers: 100,
  weather: 1000,
  radar: 50,
  track: 1000,
  performance: 1000,
  system: 250,
  stream: 250,
  dota: 50,
  'race-director': 250,
};

/** Every field of every topic, flattened for docs, `fields.json`, and Data Explorer. */
export const describeTelemetry = (): readonly FieldDescriptor[] =>
  telemetryTopics.flatMap((topic) => describeFields(topicNodes[topic], topic, circuitGames, '2.0'));
