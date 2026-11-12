import { bool, int, nullable, num, obj, oneOf, type Infer } from '../schema.js';
import { circuitGames, iracingLmu, telemetryGames, withAcRally } from './common.js';

export const spotterValues = [
  'off',
  'clear',
  'left',
  'right',
  'both',
  'twoLeft',
  'twoRight',
] as const;
export type SpotterState = (typeof spotterValues)[number];

/** The player's car: inputs and the core instrument cluster. Published at ~30 Hz. */
export const carNode = obj(
  {
    speedKph: num({ description: 'Ground speed.', unit: 'kph' }),
    rpm: num({ description: 'Engine speed.', unit: 'rpm' }),
    maxRpm: nullable(num({ description: 'Engine rev limit (redline).', unit: 'rpm' })),
    gear: int('Selected gear: -1 reverse, 0 neutral, 1+ forward gears.'),
    throttle: num({ description: 'Throttle pedal.', unit: 'ratio', range: [0, 1] }),
    brake: num({ description: 'Brake pedal.', unit: 'ratio', range: [0, 1] }),
    clutch: num({
      description: 'Clutch pedal; 1 is fully pressed (disengaged).',
      unit: 'ratio',
      range: [0, 1],
    }),
    steering: num({
      description: 'Steering input from full left (-1) to full right (1).',
      unit: 'ratio',
      range: [-1, 1],
    }),
    steeringAngleRad: nullable(
      num({
        description: 'Steering wheel angle; positive turns left.',
        unit: 'rad',
        games: iracingLmu,
      }),
    ),
    fuelLiters: num({ description: 'Fuel in the tank.', unit: 'liters' }),
    fuelCapacityLiters: nullable(
      num({ description: 'Fuel tank capacity.', unit: 'liters', games: withAcRally(iracingLmu) }),
    ),
    isOnTrack: bool('The car is driving on track (not in garage, menus, or replay).'),
    isInPitlane: bool('The car is in the pit lane or pit stall.'),
    isInGarage: bool('The player is in the garage or setup screen.'),
    absActive: bool({
      description: 'ABS is intervening right now. Always false where the game does not report it.',
      games: withAcRally(iracingLmu),
    }),
    tractionControlActive: nullable(
      bool({
        description: 'Traction control is intervening right now.',
        games: withAcRally(circuitGames),
      }),
    ),
    pitLimiterActive: nullable(
      bool({ description: 'Pit speed limiter is engaged.', games: withAcRally(iracingLmu) }),
    ),
    spotter: oneOf(spotterValues, {
      description: 'Cars alongside, as a spotter would call them.',
      games: iracingLmu,
    }),
    shiftLights: nullable(
      obj(
        {
          firstRpm: num({ description: 'First shift light.', unit: 'rpm' }),
          shiftRpm: num({ description: 'Optimal shift point.', unit: 'rpm' }),
          blinkRpm: num({ description: 'Lights start blinking.', unit: 'rpm' }),
        },
        'Shift light thresholds. LMU, AC, and AC Rally values are derived from the rev limit.',
      ),
    ),
    accelerationG: obj(
      {
        lateral: num({ description: 'Lateral acceleration; positive is left.', unit: 'g' }),
        longitudinal: num({
          description: 'Longitudinal acceleration; positive is forward.',
          unit: 'g',
        }),
        vertical: nullable(num({ description: 'Vertical acceleration.', unit: 'g' })),
      },
      'Body acceleration of the car.',
    ),
    headingRad: nullable(
      num({
        description: 'World heading (yaw) of the car.',
        unit: 'rad',
        games: withAcRally(iracingLmu),
      }),
    ),
  },
  { description: 'The player car: inputs, engine, and core state.', games: telemetryGames },
);

export type CarTelemetry = Infer<typeof carNode>;
