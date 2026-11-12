import { bool, int, list, nullable, num, obj, oneOf, str, type Infer } from '../schema.js';
import { acRallyNode } from './acRally.js';
import { driverHazardValues } from './drivers.js';
import { ac, circuitGames, flag, flagDetail, iracing, iracingLmu, lmu } from './common.js';

export const sessionTypeValues = [
  'practice',
  'qualify',
  'race',
  'warmup',
  'testing',
  'hotlap',
  'other',
] as const;
export type SessionType = (typeof sessionTypeValues)[number];

/** Which way the hazard ahead is from the focused car (`session.hazardAhead.direction`). */
export const hazardDirectionValues = ['ahead', 'left', 'right'] as const;
export type HazardDirection = (typeof hazardDirectionValues)[number];

/** The running session, track, and race control state. Published at ~4 Hz. */
export const sessionNode = obj(
  {
    type: oneOf(sessionTypeValues, 'Normalized session type.'),
    name: str('Session label shown by the game, for example "Lone Qualify".'),
    trackName: str('Track display name.'),
    trackId: nullable(int({ description: 'Game track identifier.', games: iracing })),
    trackLengthMeters: nullable(
      num({ description: 'Lap length.', unit: 'meters', games: iracingLmu }),
    ),
    isOval: nullable(bool({ description: 'The track is an oval.', games: iracing })),
    eventKey: nullable(
      str({
        description: 'Stable identity of the event, all its sessions, and its replay.',
        games: iracing,
      }),
    ),
    sessionTimeSeconds: num({ description: 'Time elapsed in the session.', unit: 'seconds' }),
    sessionDurationSeconds: nullable(
      num({ description: 'Scheduled session length.', unit: 'seconds', games: iracing }),
    ),
    timeRemainingSeconds: nullable(
      num({ description: 'Time left in the session.', unit: 'seconds' }),
    ),
    timeOfDaySeconds: nullable(
      num({ description: 'In-game time of day since midnight.', unit: 'seconds', games: iracing }),
    ),
    lap: int('Current lap of the player car.'),
    lapsTotal: nullable(
      int({ description: 'Scheduled laps; null for timed sessions.', unit: 'laps' }),
    ),
    lapsRemaining: nullable(
      int({ description: 'Laps left for the leader.', unit: 'laps', games: iracing }),
    ),
    estimatedTotalLaps: nullable(
      num({
        description: 'Estimated race length, including timed races.',
        unit: 'laps',
        games: iracing,
      }),
    ),
    estimatedLapsRemaining: nullable(
      num({ description: 'Estimated laps left for the player.', unit: 'laps', games: iracing }),
    ),
    flag: nullable(flag('Most important flag currently shown to the player.')),
    flagDetail: nullable(
      flagDetail(
        'Most important flag shown to the player, with the session-state flags (debris, crossed, laps to green, furled, repair) the plain `flag` folds together.',
      ),
    ),
    hazardAhead: nullable(
      obj(
        {
          carIdx: int('The nearest car in trouble ahead.'),
          kind: oneOf(driverHazardValues, 'Its `drivers[].hazard.kind`.'),
          distanceMeters: num({
            description: 'How far ahead of the focused car it is along the lap.',
            unit: 'meters',
          }),
          count: int('Cars in trouble within 1000 m ahead.'),
          lapDistanceFraction: num({
            description: 'Where on the lap the car in trouble is.',
            unit: 'ratio',
            range: [0, 1],
            since: '2.16',
          }),
          turn: nullable(
            obj(
              {
                number: int('Turn number, as `session.turns` numbers it.'),
                name: nullable(str('Name of the corner; null when it has none.')),
              },
              {
                description:
                  'The turn the car in trouble is in, from `session.turns`; null on a straight or when the layout is not known.',
                games: circuitGames,
                since: '2.16',
              },
            ),
          ),
          isBeyondTurn: bool({
            description:
              'A turn lies between the focused car and the car in trouble, so it is round a corner and out of sight. Worked out from the track centreline (iRacing) or from `session.turns`.',
            since: '2.16',
          }),
          bearingDegrees: nullable(
            num({
              description:
                'Which way the car in trouble is from the focused car: the angle between where the focused car points and the straight line to it. 0 is straight ahead, positive to the right, negative to the left, -180 to 180. iRacing takes the heading of the track at the focused car; Le Mans Ultimate the places of the cars in the world.',
              unit: 'deg',
              range: [-180, 180],
              games: iracingLmu,
              since: '2.16',
            }),
          ),
          direction: nullable(
            oneOf(hazardDirectionValues, {
              description:
                '`bearingDegrees` in words: `ahead` within 15° of straight ahead, otherwise `left` or `right`.',
              games: iracingLmu,
              since: '2.16',
            }),
          ),
        },
        {
          description:
            'The nearest car in trouble within 1000 m ahead of the focused car: stopped, crawling or reversing on the track, or nearly standing off it (`drivers[].hazard`). It works where the game shows no yellow flag. Null when the way ahead is clear or the track length is unknown.',
          since: '2.12',
        },
      ),
    ),
    displayUnits: oneOf(['metric', 'imperial'], {
      description: 'Units chosen in the game. Data is always metric; use this to format it.',
      games: iracing,
    }),
    playerCarIdx: nullable(int('Index of the player car in `drivers`.')),
    focusedCarIdx: nullable(int('Index of the car the camera follows.')),
    isTeamRacing: nullable(bool({ description: 'The event is a team event.', games: iracing })),
    strengthOfField: nullable(
      int({ description: 'Strength of field of all competitors (iRating).', games: iracing }),
    ),
    classes: list(
      obj(
        {
          classId: nullable(int('Car class identifier.')),
          name: str('Car class name.'),
          color: str({ description: 'Car class color.', unit: 'color' }),
          driverCount: int('Competitors in the class.'),
          strengthOfField: nullable(
            int({ description: 'Strength of field of the class (iRating).', games: iracing }),
          ),
          bestLapSeconds: nullable(
            num({ description: 'Fastest lap in the class.', unit: 'seconds' }),
          ),
        },
        'A car class in the session.',
      ),
      'Car classes of the competitors, the class of the overall leader first.',
    ),
    pit: obj(
      {
        speedLimitKph: nullable(
          num({ description: 'Pit lane speed limit.', unit: 'kph', games: iracing }),
        ),
        entryLapFraction: nullable(
          num({ description: 'Pit entry position on the lap.', unit: 'ratio', games: iracing }),
        ),
        exitLapFraction: nullable(
          num({ description: 'Pit exit position on the lap.', unit: 'ratio', games: iracing }),
        ),
        boxLapFraction: nullable(
          num({ description: 'Pit box position on the lap.', unit: 'ratio' }),
        ),
        distanceToEntryMeters: nullable(
          num({
            description: 'Distance from the player to pit entry.',
            unit: 'meters',
            games: iracing,
          }),
        ),
        distanceToBoxMeters: nullable(
          num({
            description:
              'Distance along the track from the player to the pit box ahead; null when the box is unknown.',
            unit: 'meters',
            since: '2.5',
          }),
        ),
      },
      { description: 'Pit lane geometry and limits.', games: iracingLmu },
    ),
    navigation: obj(
      {
        lapDistanceMeters: nullable(
          num({ description: 'Distance from the start line.', unit: 'meters' }),
        ),
        lapDistanceFraction: nullable(
          num({ description: 'Position on the lap.', unit: 'ratio', range: [0, 1] }),
        ),
        sessionDistanceMeters: nullable(
          num({ description: 'Distance driven in the session.', unit: 'meters' }),
        ),
      },
      'Where the player is on the lap.',
    ),
    turns: list(
      obj(
        {
          number: int('Turn number, as track maps number it.'),
          name: nullable(
            str('Name of the corner, for example "Eau Rouge"; null when it has none.'),
          ),
          startLapFraction: num({
            description: 'Where the turn starts on the lap.',
            unit: 'ratio',
            range: [0, 1],
          }),
          endLapFraction: num({
            description: 'Where the turn ends on the lap.',
            unit: 'ratio',
            range: [0, 1],
          }),
          labelLapFraction: num({
            description: 'Where the turn number belongs on the lap: its apex, roughly.',
            unit: 'ratio',
            range: [0, 1],
          }),
        },
        'A turn. One that crosses the line comes as two pieces with the same number.',
      ),
      {
        description:
          'Turns of the track in lap order, from the line; empty when the layout is not known.',
        games: circuitGames,
        since: '2.5',
      },
    ),
    ext: obj(
      {
        iracing: nullable(
          obj(
            {
              sessionNum: int('iRacing session number.'),
              incidents: obj(
                {
                  count: nullable(int('Incident points of the player (or team).')),
                  limit: nullable(int('Disqualification limit.')),
                  warningInitialLimit: nullable(int('Points before the first warning.')),
                  warningSubsequentLimit: nullable(int('Points between later warnings.')),
                },
                'Incident points.',
              ),
              isBeforeRaceStart: bool('The race has not started yet.'),
              isStandingStart: bool('The race uses a standing start.'),
              isShortParadeLap: bool('The race uses a short parade lap.'),
              qualifyingStartLapFraction: num({
                description: 'Qualifying start position.',
                unit: 'ratio',
              }),
              raceStartLapFraction: num({ description: 'Race start position.', unit: 'ratio' }),
              trackType: str('iRacing track type, for example "road course".'),
              trackRubber: str('Dynamic track rubber state label.'),
              garageVisible: bool('The garage screen is open.'),
              garageFuelLiters: nullable(
                num({ description: 'Fuel set in the garage.', unit: 'liters' }),
              ),
              sessions: list(
                obj(
                  {
                    type: str('Session type label.'),
                    subType: str('Session sub-type label.'),
                    laps: nullable(int({ description: 'Scheduled laps.', unit: 'laps' })),
                    durationSeconds: nullable(
                      num({ description: 'Scheduled length.', unit: 'seconds' }),
                    ),
                  },
                  'One session of the event.',
                ),
                'All sessions of the event.',
              ),
            },
            { description: 'iRacing-only session data.', games: iracing },
          ),
        ),
        lmu: nullable(
          obj(
            {
              yellowFlagState: int('rFactor yellow flag state.'),
            },
            { description: 'Le Mans Ultimate-only session data.', games: lmu },
          ),
        ),
        ac: nullable(
          obj(
            {
              pluginAvailable: bool({
                description:
                  "Racelink's app for Assetto Corsa runs in the game and shares the other cars. Without it `drivers` holds no cars.",
                since: '2.14',
              }),
            },
            { description: 'Assetto Corsa-only session data.', games: ac },
          ),
        ),
        acRally: nullable(acRallyNode),
      },
      'Game-specific session data; each key is null when another game is running.',
    ),
  },
  'Session, track, and race control state.',
);

export type SessionTelemetry = Infer<typeof sessionNode>;
