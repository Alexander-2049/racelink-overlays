import {
  graphicsLayout,
  physicsLayout,
  staticLayout,
  type AcRallyFrame,
  type FieldSpec,
  type PageLayout,
  type PageValues,
} from '../../lib/acRallySharedMemory.js';
import {
  bool,
  list,
  nullable,
  num,
  obj,
  oneOf,
  str,
  type ArrayNode,
  type BooleanNode,
  type Infer,
  type NumberNode,
  type ObjectNode,
  type StringNode,
} from '../schema.js';
import { acRally } from './common.js';

/** AcTrackGripStatus in shared-memory order. */
export const acRallyTrackGripValues = [
  'green',
  'fast',
  'optimum',
  'greasy',
  'damp',
  'wet',
  'flooded',
] as const;
/** AcRainIntensity in shared-memory order. */
export const acRallyRainIntensityValues = [
  'none',
  'drizzle',
  'light',
  'medium',
  'heavy',
  'thunderstorm',
] as const;

type Vec3Node = ObjectNode<{ x: NumberNode; y: NumberNode; z: NumberNode }>;
type NodeFor<S> = S extends { kind: 'wstr' }
  ? StringNode
  : S extends { kind: 'vec3' }
    ? ArrayNode<Vec3Node>
    : S extends { count: number }
      ? ArrayNode<NumberNode>
      : S extends { kind: 'bool32' }
        ? BooleanNode
        : NumberNode;
type RawFields<L extends PageLayout, K extends keyof L> = { readonly [P in K]: NodeFor<L[P]> };

const vec3Node: Vec3Node = obj(
  { x: num('X component.'), y: num('Y component.'), z: num('Z component.') },
  'Vector.',
);
const nodeFor = (spec: FieldSpec) => {
  if (spec.kind === 'wstr') return str(spec.doc);
  if (spec.kind === 'vec3') return list(vec3Node, spec.doc);
  if ('count' in spec) return list(num('Element.'), spec.doc);
  if (spec.kind === 'bool32') return bool(spec.doc);
  return num(spec.doc);
};

/** Schema of the named shared-memory fields, described from the layout table. */
const rawPage = <L extends PageLayout, const K extends keyof L & string>(
  layout: L,
  keys: readonly K[],
  description: string,
): ObjectNode<RawFields<L, K>> =>
  obj(
    Object.fromEntries(keys.map((key) => [key, nodeFor(layout[key])])) as RawFields<L, K>,
    description,
  );

/**
 * Niche shared-memory values that have no normalized field elsewhere. Names and
 * units are AC Rally's own (Kunos's ACC layout).
 */
export const acRallyRawPhysicsKeys = [
  'velocity',
  'wheelSlip',
  'wheelAngularSpeed',
  'carDamage',
  'turboBoost',
  'airDensity',
  'localAngularVelocity',
  'localVelocity',
  'finalFF',
  'tyreContactPoint',
  'tyreContactNormal',
  'tyreContactHeading',
  'suspensionDamage',
  'brakePressure',
  'frontBrakeCompound',
  'rearBrakeCompound',
  'padLife',
  'discLife',
  'kerbVibration',
  'slipVibrations',
  'gVibrations',
  'absVibrations',
] as const satisfies readonly (keyof typeof physicsLayout)[];
export const acRallyRawGraphicsKeys = [
  'status',
  'sessionType',
  'iCurrentTime',
  'iLastTime',
  'iBestTime',
  'iSplit',
  'iDeltaLapTime',
  'iEstimatedLapTime',
  'isDeltaPositive',
  'isValidLap',
  'completedLaps',
  'position',
  'sessionTimeLeft',
  'distanceTraveled',
  'normalizedCarPosition',
  'currentSectorIndex',
  'lastSectorTime',
  'tyreCompound',
  'flag',
  'penalty',
  'penaltyTime',
  'surfaceGrip',
  'isSetupMenuVisible',
  'engineMap',
  'tcCut',
  'fuelXLap',
  'usedFuel',
  'fuelEstimatedLaps',
  'exhaustTemperature',
  'lightsStage',
  'rainLights',
  'flashingLights',
  'wiperLv',
  'directionLightsLeft',
  'directionLightsRight',
  'rainTyres',
  'trackStatus',
  'clock',
] as const satisfies readonly (keyof typeof graphicsLayout)[];
export const acRallyRawStaticKeys = [
  'carModel',
  'track',
  'trackConfiguration',
  'carSkin',
  'playerName',
  'playerSurname',
  'playerNick',
  'sectorCount',
  'maxTorque',
  'maxPower',
  'maxTurboBoost',
  'suspensionMaxTravel',
  'tyreRadius',
  'trackSplineLength',
  'penaltiesEnabled',
  'aidFuelRate',
  'aidTireRate',
  'aidMechanicalDamage',
  'aidAllowTyreBlankets',
  'aidStability',
  'aidAutoClutch',
  'aidAutoBlip',
  'isOnline',
  'dryTyresName',
  'wetTyresName',
] as const satisfies readonly (keyof typeof staticLayout)[];

/** Assetto Corsa Rally-only session data. */
export const acRallyNode = obj(
  {
    carModel: str('Player car model.'),
    gameVersion: str('Game version reported in shared memory.'),
    sharedMemoryVersion: str('Shared memory layout version.'),
    isEngineRunning: bool('The engine is running.'),
    ignitionOn: bool('The ignition is on.'),
    starterEngineOn: bool('The starter is engaged.'),
    autoShifterOn: bool('Automatic gearbox is on.'),
    isAiControlled: bool('The AI drives the car.'),
    trackGrip: nullable(oneOf(acRallyTrackGripValues, 'Track grip state.')),
    rainIntensity: nullable(oneOf(acRallyRainIntensityValues, 'Current rain intensity.')),
    raw: obj(
      {
        physics: rawPage(physicsLayout, acRallyRawPhysicsKeys, 'Raw `acpmf_physics` values.'),
        graphics: rawPage(graphicsLayout, acRallyRawGraphicsKeys, 'Raw `acpmf_graphics` values.'),
        static: rawPage(staticLayout, acRallyRawStaticKeys, 'Raw `acpmf_static` values.'),
      },
      'Niche shared-memory values in the game’s own names and units; see the AC Rally adapter.',
    ),
  },
  { description: 'Assetto Corsa Rally-only session data.', games: acRally, since: '2.1' },
);

export type AcRallySessionTelemetry = Infer<typeof acRallyNode>;

const pick = <L extends PageLayout, K extends keyof L>(
  values: PageValues<L>,
  keys: readonly K[],
): { readonly [P in K]: PageValues<L>[P] } =>
  Object.fromEntries(keys.map((key) => [key, values[key]])) as {
    readonly [P in K]: PageValues<L>[P];
  };

/** The `session.ext.acRally` block of a decoded shared-memory frame. */
export const acRallySession = (frame: AcRallyFrame): AcRallySessionTelemetry => ({
  carModel: frame.static.carModel,
  gameVersion: frame.static.acVersion,
  sharedMemoryVersion: frame.static.smVersion,
  isEngineRunning: frame.physics.isEngineRunning,
  ignitionOn: frame.physics.ignitionOn,
  starterEngineOn: frame.physics.starterEngineOn,
  autoShifterOn: frame.physics.autoShifterOn,
  isAiControlled: frame.physics.isAiControlled,
  trackGrip: acRallyTrackGripValues[frame.graphics.trackGripStatus] ?? null,
  rainIntensity: acRallyRainIntensityValues[frame.graphics.rainIntensity] ?? null,
  raw: {
    physics: pick(frame.physics, acRallyRawPhysicsKeys),
    graphics: pick(frame.graphics, acRallyRawGraphicsKeys),
    static: pick(frame.static, acRallyRawStaticKeys),
  },
});
