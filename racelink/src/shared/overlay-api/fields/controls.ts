import { bool, int, nullable, num, obj, str, type Infer } from '../schema.js';
import { iracing, iracingAc, iracingLmu, telemetryGames, withAcRally } from './common.js';

const setting = (description: string) => nullable(num({ description, games: iracing }));

/** In-car adjustments the driver can change while driving. Published at ~10 Hz. */
export const controlsNode = obj(
  {
    brakeBiasFrontFraction: nullable(
      num({
        description: 'Front axle share of braking force.',
        unit: 'ratio',
        range: [0, 1],
        games: telemetryGames,
      }),
    ),
    brakeBiasMigration: setting('Brake bias migration setting.'),
    peakBrakeBias: setting('Peak brake bias setting.'),
    brakeValve: setting('Brake valve setting.'),
    absLevel: nullable(num({ description: 'ABS setting.', games: withAcRally(iracingAc) })),
    tcLevel: nullable(
      num({ description: 'Traction control setting.', games: withAcRally(iracingAc) }),
    ),
    tc2Level: setting('Secondary traction control setting.'),
    throttleShapeLevel: setting('Throttle map setting.'),
    fuelMixLevel: setting('Fuel mixture setting.'),
    enginePowerLevel: setting('Engine power setting.'),
    boostLevel: setting('Boost setting.'),
    rearWingAngle: setting('Rear wing angle setting.'),
    weightJacker: setting('Weight jacker setting.'),
    antiRollBar: obj(
      {
        frontSetting: setting('Front anti-roll bar setting.'),
        frontMode: nullable(
          str({ description: 'Front anti-roll bar mode label.', games: iracing }),
        ),
        rearSetting: setting('Rear anti-roll bar setting.'),
        rearMode: nullable(str({ description: 'Rear anti-roll bar mode label.', games: iracing })),
      },
      'Anti-roll bar adjustments.',
    ),
    differential: obj(
      {
        entryBase: setting('Differential entry base setting.'),
        entryOffset: setting('Differential entry offset.'),
        entryPreloadBase: setting('Differential entry preload base setting.'),
        entryPreloadOffset: setting('Differential entry preload offset.'),
        exitLevel: setting('Differential exit setting.'),
      },
      'Differential adjustments.',
    ),
    ers: obj(
      {
        batteryPercent: nullable(
          num({ description: 'Hybrid battery charge.', unit: 'percent', games: iracing }),
        ),
        lapDeployPercent: nullable(
          num({ description: 'Energy deployed this lap.', unit: 'percent', games: iracing }),
        ),
        deployMode: nullable(str({ description: 'Deploy mode label.', games: iracing })),
      },
      'Hybrid energy recovery system.',
    ),
    drs: obj(
      {
        active: nullable(bool({ description: 'DRS is open.', games: iracingLmu })),
        status: nullable(
          int({
            description: 'iRacing DRS state: 0 off, 1 detected, 2 available, 3 active.',
            games: iracing,
          }),
        ),
        count: nullable(int({ description: 'DRS activations left.', games: iracing })),
      },
      'Drag reduction system.',
    ),
    pushToPass: obj(
      {
        active: nullable(bool({ description: 'Push-to-pass is active.', games: iracing })),
        count: nullable(int({ description: 'Push-to-pass activations left.', games: iracing })),
        cooldownSeconds: nullable(
          num({
            description: 'Time until push-to-pass can be used again.',
            unit: 'seconds',
            games: iracing,
          }),
        ),
      },
      'Push-to-pass.',
    ),
  },
  'Driver-adjustable controls such as brake bias, ABS, and TC.',
);

export type ControlsTelemetry = Infer<typeof controlsNode>;
