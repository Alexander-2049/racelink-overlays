import { bool, int, list, nullable, num, obj, oneOf, str, type Infer } from '../schema.js';
import { iracing, iracingLmu, lmu, telemetryGames, withAcRally } from './common.js';

export const trackWetnessValues = [
  'dry',
  'mostlyDry',
  'veryLightlyWet',
  'lightlyWet',
  'moderatelyWet',
  'veryWet',
  'extremelyWet',
] as const;

/** Weather and track conditions. Published at ~4 Hz. */
export const weatherNode = obj(
  {
    airTemperatureC: nullable(
      num({ description: 'Air temperature.', unit: 'celsius', games: telemetryGames }),
    ),
    trackTemperatureC: nullable(
      num({ description: 'Track surface temperature.', unit: 'celsius', games: telemetryGames }),
    ),
    windSpeedMps: nullable(
      num({ description: 'Wind speed.', unit: 'mps', games: withAcRally(iracingLmu) }),
    ),
    windDirectionRad: nullable(
      num({
        description: 'Direction the wind blows from, in world space.',
        unit: 'rad',
        games: withAcRally(iracingLmu),
      }),
    ),
    humidityFraction: nullable(
      num({ description: 'Relative humidity.', unit: 'ratio', range: [0, 1], games: iracing }),
    ),
    precipitationFraction: nullable(
      num({
        description: 'Precipitation intensity.',
        unit: 'ratio',
        range: [0, 1],
        games: iracing,
      }),
    ),
    trackWetness: nullable(
      oneOf(trackWetnessValues, { description: 'How wet the track is.', games: iracing }),
    ),
    forecast: list(
      obj(
        {
          temperatureC: num({ description: 'Air temperature.', unit: 'celsius' }),
          rainChanceFraction: num({ description: 'Chance of rain.', unit: 'ratio', range: [0, 1] }),
          sky: int('Sky type index from 0 (clear) upward.'),
        },
        'One forecast node.',
      ),
      {
        description:
          'Forecast at session start, 25%, 50%, 75%, and finish; empty when unavailable.',
        games: lmu,
      },
    ),
  },
  'Weather and track conditions.',
);

const radarCarNode = obj(
  {
    carIdx: int('Car index; matches drivers[].carIdx.'),
    driverName: nullable(str('Driver name.')),
    className: nullable(str('Car class name.')),
    position: nullable(int('Overall position.')),
    lapDelta: int({ description: 'Laps ahead (+) or behind (-) the player.', unit: 'laps' }),
    xMeters: num({
      description: 'Lateral offset; positive is right of the player.',
      unit: 'meters',
    }),
    yMeters: num({
      description: 'Longitudinal offset; positive is ahead of the player.',
      unit: 'meters',
    }),
    distanceMeters: num({ description: 'Straight-line distance to the player.', unit: 'meters' }),
    relativeHeadingRad: num({ description: 'Heading relative to the player.', unit: 'rad' }),
    speedKph: nullable(num({ description: 'Ground speed.', unit: 'kph' })),
    onPitRoad: bool('The car is on pit road.'),
    isLeftBlindSpot: bool('The car is in the left blind spot.'),
    isRightBlindSpot: bool('The car is in the right blind spot.'),
  },
  'A nearby car.',
);

/** Nearby cars around the player in car-relative coordinates. Published at ~20 Hz. */
export const radarNode = nullable(
  obj(
    {
      rangeMeters: num({ description: 'Radius of the radar.', unit: 'meters' }),
      vehicleWidthMeters: num({ description: 'Car width used for blind spots.', unit: 'meters' }),
      vehicleLengthMeters: num({ description: 'Car length used for blind spots.', unit: 'meters' }),
      nearestLeftMeters: nullable(num({ description: 'Closest car on the left.', unit: 'meters' })),
      nearestRightMeters: nullable(
        num({ description: 'Closest car on the right.', unit: 'meters' }),
      ),
      cars: list(radarCarNode, 'Cars within range, nearest first.'),
    },
    { description: 'Nearby cars around the player; null when unavailable.', games: lmu },
  ),
);

export type WeatherTelemetry = Infer<typeof weatherNode>;
export type RadarTelemetry = Infer<typeof radarNode>;
