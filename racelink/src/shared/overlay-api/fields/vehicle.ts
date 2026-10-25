import { bool, list, nullable, num, obj, oneOf, type Infer, type Unit } from '../schema.js';
import {
  iracing,
  iracingAc,
  iracingLmu,
  lmu,
  lmuAc,
  telemetryGames,
  withAcRally,
} from './common.js';

export const wheelIds = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight'] as const;
export type WheelId = (typeof wheelIds)[number];

const value = (description: string, unit: Unit) => nullable(num({ description, unit }));

const wheelNode = obj(
  {
    id: oneOf(wheelIds, 'Wheel position.'),
    brakeTemperatureC: nullable(
      num({ description: 'Brake disc temperature.', unit: 'celsius', games: withAcRally(lmuAc) }),
    ),
    brakePressureFraction: nullable(
      num({ description: 'Brake line pressure.', unit: 'ratio', range: [0, 1], games: lmu }),
    ),
    brakeRemainingFraction: nullable(
      num({
        description: 'Brake pad remaining; 1 is new.',
        unit: 'ratio',
        range: [0, 1],
        games: lmu,
      }),
    ),
    tyreTemperatureC: list(num({ description: 'Surface temperature.', unit: 'celsius' }), {
      description:
        'Tyre surface temperatures from inner to outer edge; empty when unavailable. iRacing measures them only in the pit stall.',
      games: withAcRally([...iracing, ...lmuAc]),
    }),
    tyreInnerLayerTemperatureC: list(
      num({ description: 'Inner layer temperature.', unit: 'celsius' }),
      {
        description:
          'Tyre inner layer temperatures from inner to outer edge; empty when unavailable.',
        games: lmu,
      },
    ),
    tyreCarcassTemperatureC: nullable(
      num({ description: 'Tyre carcass temperature.', unit: 'celsius', games: withAcRally(lmu) }),
    ),
    tyrePressureKpa: nullable(
      num({ description: 'Tyre pressure.', unit: 'kpa', games: withAcRally(lmu) }),
    ),
    tyreRemainingFraction: nullable(
      num({
        description: 'Tyre tread remaining; 1 is new. iRacing measures it only in the pit stall.',
        unit: 'ratio',
        range: [0, 1],
        games: [...iracing, ...lmuAc],
      }),
    ),
    tyreTreadZonesFraction: list(
      num({ description: 'Tread remaining; 1 is new.', unit: 'ratio', range: [0, 1] }),
      {
        description:
          'Tyre tread remaining from inner to outer edge; empty when unavailable. iRacing measures it only in the pit stall.',
        games: iracing,
        since: '2.5',
      },
    ),
    tyreChangeRequested: nullable(
      bool({
        description: 'The tyre is set to be changed at the next pit stop.',
        games: iracing,
        since: '2.5',
      }),
    ),
    tyreLoadN: nullable(num({ description: 'Vertical tyre load.', unit: 'newtons', games: lmu })),
    tyreDeflectionMm: nullable(num({ description: 'Tyre deflection.', unit: 'mm', games: lmu })),
    frictionLateralN: nullable(
      num({ description: 'Lateral tyre force.', unit: 'newtons', games: lmu }),
    ),
    frictionLongitudinalN: nullable(
      num({ description: 'Longitudinal tyre force.', unit: 'newtons', games: lmu }),
    ),
    slipAngleRad: nullable(
      num({ description: 'Tyre slip angle.', unit: 'rad', games: withAcRally(lmu) }),
    ),
    slipRatio: nullable(
      num({ description: 'Longitudinal slip ratio.', unit: 'ratio', games: withAcRally(lmu) }),
    ),
    camberRad: nullable(num({ description: 'Camber angle.', unit: 'rad', games: lmu })),
    toeRad: nullable(num({ description: 'Toe angle.', unit: 'rad', games: lmu })),
    suspensionForceN: nullable(
      num({ description: 'Suspension (pushrod) force.', unit: 'newtons', games: lmu }),
    ),
    suspensionPositionMm: nullable(
      num({ description: 'Suspension deflection.', unit: 'mm', games: withAcRally(lmu) }),
    ),
    rideHeightMm: nullable(
      num({ description: 'Ride height at the wheel.', unit: 'mm', games: lmu }),
    ),
    isFlat: nullable(bool({ description: 'The tyre is punctured.', games: lmu })),
    isDetached: nullable(bool({ description: 'The wheel came off.', games: lmu })),
  },
  'One wheel.',
);

/** Number of direction bins of a G-force envelope. */
export const gForceEnvelopeBins = 72;

const envelope = (description: string) =>
  list(num({ description: 'Largest force in this direction.', unit: 'g' }), description);

const envelopeLapNode = nullable(
  obj(
    {
      envelope: envelope('Envelope of the lap.'),
      lapSeconds: nullable(num({ description: 'Time of the lap.', unit: 'seconds' })),
    },
    'The envelope of one lap; null when there is none.',
  ),
);

/**
 * The traction envelope: the largest force seen in each direction. An
 * envelope has 72 bins of 5 degrees; bin i points at angle a = -180 + 5 * i
 * degrees, that is lateral = sin(a), longitudinal = cos(a) in the terms of
 * `car.accelerationG`. Bin 0 is braking, bin 36 is accelerating.
 */
const gForceNode = obj(
  {
    peakG: num({ description: 'Largest force of the session envelope.', unit: 'g' }),
    sidesG: obj(
      {
        braking: num({ description: 'Largest braking force.', unit: 'g' }),
        accelerating: num({ description: 'Largest accelerating force.', unit: 'g' }),
        left: num({ description: 'Largest force to the left (positive lateral).', unit: 'g' }),
        right: num({ description: 'Largest force to the right.', unit: 'g' }),
      },
      'Largest forces of the session by direction.',
    ),
    lap: envelope('Envelope of the current lap so far.'),
    session: envelope(
      'Envelope of the session: every clean lap and the current lap. On a rally stage, everything driven.',
    ),
    lastLap: envelopeLapNode,
    sessionBest: envelopeLapNode,
    personalBest: envelopeLapNode,
  },
  {
    description: `G-force envelopes (${String(gForceEnvelopeBins)} bins of 5 degrees). Laps for comparison: the last clean lap, the best lap of the session and the personal best of this car and track.`,
    games: telemetryGames,
    since: '2.5',
  },
);

/** Vehicle dynamics, tyres, powertrain, and damage. Published at ~20 Hz. */
export const vehicleNode = obj(
  {
    attitude: obj(
      {
        rollRad: nullable(num({ description: 'Body roll.', unit: 'rad' })),
        pitchRad: nullable(num({ description: 'Body pitch.', unit: 'rad' })),
      },
      { description: 'Body attitude.', games: withAcRally(iracing) },
    ),
    aero: obj(
      {
        frontDownforceN: value('Front downforce.', 'newtons'),
        rearDownforceN: value('Rear downforce.', 'newtons'),
        dragN: value('Aerodynamic drag.', 'newtons'),
      },
      { description: 'Aerodynamic forces.', games: lmu },
    ),
    suspension: obj(
      {
        frontRideHeightMm: value('Front ride height.', 'mm'),
        rearRideHeightMm: value('Rear ride height.', 'mm'),
        rakeMm: value('Rear minus front ride height.', 'mm'),
        frontThirdDeflectionMm: value('Front third spring deflection.', 'mm'),
        rearThirdDeflectionMm: value('Rear third spring deflection.', 'mm'),
      },
      { description: 'Chassis suspension.', games: lmu },
    ),
    weightDistribution: obj(
      {
        frontPercent: value('Share of tyre load on the front axle.', 'percent'),
        rearPercent: value('Share of tyre load on the rear axle.', 'percent'),
        leftPercent: value('Share of tyre load on the left side.', 'percent'),
        rightPercent: value('Share of tyre load on the right side.', 'percent'),
      },
      { description: 'Weight distribution from tyre loads.', games: lmu },
    ),
    wheels: list(wheelNode, {
      description: `Wheels in order ${wheelIds.join(', ')}; empty when the game reports none.`,
      games: withAcRally([...iracing, ...lmuAc]),
    }),
    engine: obj(
      {
        torqueNm: value('Engine torque.', 'nm'),
        waterTemperatureC: nullable(
          num({
            description: 'Coolant temperature.',
            unit: 'celsius',
            games: withAcRally(iracingLmu),
          }),
        ),
        oilTemperatureC: nullable(
          num({ description: 'Oil temperature.', unit: 'celsius', games: iracingLmu }),
        ),
        turboBoostKpa: value('Turbo boost pressure.', 'kpa'),
        isOverheating: nullable(bool('The engine is overheating.')),
      },
      { description: 'Combustion engine.', games: iracingLmu },
    ),
    electricMotor: obj(
      {
        torqueNm: value('Motor torque.', 'nm'),
        rpm: value('Motor speed.', 'rpm'),
        temperatureC: value('Motor temperature.', 'celsius'),
        waterTemperatureC: value('Motor coolant temperature.', 'celsius'),
        state: nullable(
          oneOf(['inactive', 'propulsion', 'regeneration'], 'What the electric motor is doing.'),
        ),
      },
      { description: 'Hybrid electric motor.', games: lmu },
    ),
    battery: obj(
      {
        chargeFraction: nullable(
          num({ description: 'Battery charge.', unit: 'ratio', range: [0, 1] }),
        ),
        virtualEnergyFraction: nullable(
          num({
            description: 'Virtual energy remaining.',
            unit: 'ratio',
            range: [0, 1],
            games: lmu,
          }),
        ),
        deployBudgetFraction: nullable(
          num({
            description: 'Electric deploy energy left for this lap.',
            unit: 'ratio',
            range: [0, 1],
            games: iracingAc,
            since: '2.5',
          }),
        ),
        isDeploying: nullable(
          bool({ description: 'The electric motor drives the car.', since: '2.5' }),
        ),
        isHarvesting: nullable(
          bool({ description: 'The battery is being charged.', since: '2.5' }),
        ),
        lastLapChargeFraction: nullable(
          num({
            description: 'Battery charge at the end of the last lap.',
            unit: 'ratio',
            range: [0, 1],
            since: '2.5',
          }),
        ),
        lastLapDeployBudgetFraction: nullable(
          num({
            description: 'Deploy energy left at the end of the last lap.',
            unit: 'ratio',
            range: [0, 1],
            games: iracingAc,
            since: '2.5',
          }),
        ),
      },
      { description: 'Hybrid battery and virtual energy.', games: [...iracing, ...lmuAc] },
    ),
    gForce: gForceNode,
    steeringTorqueNm: value('Steering shaft torque.', 'nm'),
    elevationMeters: value('Height of the car in world coordinates.', 'meters'),
    damage: obj(
      {
        aeroFraction: nullable(
          num({ description: 'Aero damage; 0 is undamaged.', unit: 'ratio', games: lmu }),
        ),
        suspensionFraction: list(
          nullable(num({ description: 'Suspension damage.', unit: 'ratio' })),
          {
            description: 'Suspension damage per wheel; empty when unavailable.',
            games: lmu,
          },
        ),
        isDetached: nullable(bool({ description: 'A car part came off.', games: lmu })),
        repairSeconds: obj(
          {
            total: value('Total repair time.', 'seconds'),
            bodyFront: value('Front body repair time.', 'seconds'),
            bodyRear: value('Rear body repair time.', 'seconds'),
            bodyLeft: value('Left body repair time.', 'seconds'),
            bodyRight: value('Right body repair time.', 'seconds'),
            bodyCenter: value('Centre body repair time.', 'seconds'),
            suspension: list(nullable(num({ description: 'Repair time.', unit: 'seconds' })), {
              description: 'Suspension repair time per wheel; empty when unavailable.',
            }),
          },
          { description: 'Estimated repair times.', games: [...iracing, ...lmu] },
        ),
      },
      'Car damage.',
    ),
    pitStopEstimateSeconds: nullable(
      num({
        description: 'Estimated duration of the planned pit stop.',
        unit: 'seconds',
        games: lmu,
      }),
    ),
  },
  'Vehicle dynamics, tyres, powertrain, and damage.',
);

export type VehicleTelemetry = Infer<typeof vehicleNode>;
export type WheelTelemetry = VehicleTelemetry['wheels'][number];
