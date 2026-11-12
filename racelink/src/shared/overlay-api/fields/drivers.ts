import { driverTagKeys } from '../../contracts/driverTags.js';
import type { GameId } from '../../contracts/games.js';
import { bool, int, list, nullable, num, obj, oneOf, str, type Infer } from '../schema.js';
import { flag, iracing, iracingLmu, lmu, trackSurfaceValues } from './common.js';

/** What is wrong with a car right now (`drivers[].hazard.kind`). */
export const driverHazardValues = ['offTrack', 'stopped', 'slow', 'reverse'] as const;
export type DriverHazardKind = (typeof driverHazardValues)[number];

const seconds = (meta: string | Readonly<{ description: string; games?: readonly GameId[] }>) =>
  nullable(
    num(
      typeof meta === 'string'
        ? { description: meta, unit: 'seconds' }
        : { ...meta, unit: 'seconds' },
    ),
  );

const tagNode = obj(
  {
    key: oneOf(driverTagKeys, 'Stable tag key. Draw icons by key; never match on the name.'),
    name: str('Tag label.'),
    color: str({ description: 'Tag color.', unit: 'color' }),
  },
  'A tag the user gave the driver.',
);

export const driverNode = obj(
  {
    carIdx: int('Stable index of the car for the session; use it as a key.'),
    position: nullable(int('Overall position.')),
    classPosition: nullable(int('Position in class.')),
    startPosition: nullable(int({ description: 'Overall grid position.', games: iracingLmu })),
    startClassPosition: nullable(int({ description: 'Grid position in class.', games: iracing })),
    name: str('Full driver name.'),
    firstName: str('First name.'),
    lastName: str('Last name; empty when the game reports one name.'),
    carNumber: str('Car number as shown on the car.'),
    classId: nullable(int('Car class identifier.')),
    className: str('Car class name.'),
    classColor: str({ description: 'Car class color.', unit: 'color' }),
    carId: nullable(int({ description: 'Car model identifier.', games: iracing })),
    carName: str('Car model name.'),
    teamId: nullable(int({ description: 'Team identifier.', games: iracing })),
    teamName: str({ description: 'Team name; empty when unavailable.', games: iracingLmu }),
    customerId: nullable(
      int({
        description: 'Simulator account id; null for AI or when unavailable.',
        games: iracing,
      }),
    ),
    isPlayer: bool('The car is driven by the user.'),
    isFocused: bool('The camera follows the car.'),
    isSpectator: bool('The entry is a spectator, not a competitor.'),
    isPaceCar: bool('The car is the pace car.'),
    lap: int('Current lap.'),
    lapsCompleted: int({ description: 'Completed laps.', unit: 'laps' }),
    lapDistanceFraction: num({ description: 'Position on the lap.', unit: 'ratio', range: [0, 1] }),
    raceDistanceLaps: num({ description: 'Completed laps plus lap position.', unit: 'laps' }),
    lastLapSeconds: seconds('Last lap time.'),
    bestLapSeconds: seconds('Best lap time.'),
    speedKph: nullable(num({ description: 'Ground speed.', unit: 'kph' })),
    trackSurface: oneOf(trackSurfaceValues, 'Where the car is.'),
    onPitRoad: bool('The car is on pit road.'),
    flag: nullable(flag('Flag shown to this car.')),
    tyreCompound: nullable(int({ description: 'Tyre compound index.', games: iracingLmu })),
    gear: nullable(
      int({
        description: 'Selected gear: -1 reverse, 0 neutral, 1+ forward gears.',
        games: iracing,
      }),
    ),
    offTrackCount: int({
      description: 'Times the car left the track since the session started.',
      games: iracing,
    }),
    hazard: nullable(
      obj(
        {
          kind: oneOf(
            driverHazardValues,
            'offTrack: the game says the car is off the track; stopped: under 20 km/h on the track while most of the field races; slow: under half the speed the field drives at this place of the lap; reverse: moving backwards along the lap (a spin).',
          ),
          sinceSeconds: num({
            description: 'How long the hazard has lasted, by the session clock.',
            unit: 'seconds',
          }),
          isDangerous: bool(
            'The car is on the racing surface, where others may run into it (stopped, slow or reversing; not off the track).',
          ),
        },
        {
          description:
            'The car is in trouble now: off the track, stopped, crawling or going backwards; held three seconds after it ends. Not under a safety car, on the formation lap or at the start (only off the track counts then), nor in the pits. Null when the car runs normally.',
          since: '2.12',
        },
      ),
    ),
    lapHistorySeconds: list(num({ description: 'Lap time.', unit: 'seconds' }), {
      description: 'Times of the last completed laps, oldest first; at most ten.',
      games: iracing,
    }),
    pushToPass: nullable(
      obj(
        {
          active: bool('Push to pass is being used.'),
          count: nullable(int('Uses left, or used so far.')),
        },
        { description: 'Push-to-pass state of the car.', games: iracing },
      ),
    ),
    pit: obj(
      {
        stops: nullable(int({ description: 'Pit stops this session.', games: iracingLmu })),
        entrySessionTime: seconds(
          'Session time of the current pit entry. Follows the session clock: it stands still while the game or a recording is paused.',
        ),
        timeInPitSeconds: seconds(
          'Time spent on the current pit visit, by the session clock; draw it as given.',
        ),
        lapsSinceExit: nullable(
          int({ description: 'Laps since the last pit exit.', unit: 'laps', games: iracing }),
        ),
        isOnOutLap: bool({ description: 'The car is on its out lap.', games: iracing }),
        lastStopLap: nullable(
          int({
            description: 'Lap of the last completed pit visit.',
            unit: 'laps',
            games: iracing,
          }),
        ),
        lastStopSeconds: seconds({
          description: 'Time spent in the pit lane on the last completed pit visit.',
          games: iracing,
        }),
        lastStintLaps: nullable(
          int({
            description: 'Laps driven on the stint before the last pit visit.',
            unit: 'laps',
            games: iracing,
          }),
        ),
      },
      'Pit stop tracking.',
    ),
    virtualEnergyFraction: nullable(
      num({
        description: 'Virtual energy the car has left, as the game shows it in its standings.',
        unit: 'ratio',
        range: [0, 1],
        games: lmu,
      }),
    ),
    gaps: obj(
      {
        toClassLeaderSeconds: seconds('Gap to the class leader.'),
        toClassLeaderLaps: nullable(
          int({ description: 'Laps behind the class leader.', unit: 'laps' }),
        ),
        toAheadSeconds: seconds('Interval to the car ahead in class.'),
        toAheadLaps: nullable(
          int({ description: 'Laps behind the car ahead in class.', unit: 'laps' }),
        ),
        toLeaderSeconds: seconds({
          description:
            'Gap to the overall leader, across classes; in a race timed on the reference lap of the class of this car.',
          games: iracingLmu,
        }),
        toLeaderLaps: nullable(
          int({ description: 'Laps behind the overall leader.', unit: 'laps', games: iracingLmu }),
        ),
        relativeSeconds: seconds({
          description:
            'On-track time to the focused car; positive means this car is ahead. Timed on the reference lap of the class of the chasing car.',
          games: iracingLmu,
        }),
        relativeLaps: nullable(
          int({
            description:
              'Whole laps of race distance to the focused car: 1 or more means this car is lapping it, -1 or less that it is lapped.',
            unit: 'laps',
          }),
        ),
        relativeMeters: nullable(
          num({
            description: 'On-track distance to the focused car; positive means this car is ahead.',
            unit: 'meters',
          }),
        ),
      },
      {
        description:
          'Time gaps. In a race they come from reference laps; in other sessions from best laps.',
      },
    ),
    hasSessionBestLap: bool('The car holds the fastest lap of the session.'),
    hasClassBestLap: bool('The car holds the fastest lap of its class.'),
    lapAverageSeconds: obj(
      {
        last5: seconds('Average of the last five laps (fewer when fewer are known).'),
        last10: seconds('Average of the last ten laps (fewer when fewer are known).'),
      },
      { description: 'Averages of lapHistorySeconds.', games: iracing },
    ),
    isRadioActive: bool({
      description: 'The driver is transmitting on the radio.',
      games: iracing,
    }),
    isOut: bool({ description: 'The car retired.', games: iracingLmu }),
    tags: list(tagNode, {
      description: 'User tags, sorted by priority; tags[0] is the primary tag.',
      games: iracing,
    }),
    ext: obj(
      {
        iracing: nullable(
          obj(
            {
              iRating: nullable(int('iRating.')),
              iRatingChange: nullable(int('Projected iRating change.')),
              license: obj(
                {
                  className: str('Licence class, for example "A".'),
                  safetyRating: nullable(num('Safety rating, for example 4.82.')),
                  color: nullable(str({ description: 'Licence color.', unit: 'color' })),
                },
                'Licence.',
              ),
              flairId: nullable(int('Flair (country) identifier.')),
              clubName: str('Club name.'),
              jokerLapsCompleted: nullable(int('Rallycross joker laps completed.')),
            },
            { description: 'iRacing-only driver data.', games: iracing },
          ),
        ),
      },
      'Game-specific driver data; each key is null when another game is running.',
    ),
  },
  'One car in the session.',
);

/** Every car in the session. Published at ~10 Hz. */
export const driversNode = list(driverNode, 'Every car in the session, in no particular order.');

export type DriverTelemetry = Infer<typeof driverNode>;
export type DriversTelemetry = Infer<typeof driversNode>;
