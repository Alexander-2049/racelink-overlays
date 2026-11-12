import { bool, int, list, nullable, num, obj, type Infer } from '../schema.js';
import { acRally, circuitGames } from './common.js';

const seconds = (description: string) => num({ description, unit: 'seconds' });

/** A reference lap the current lap is compared against at the same position. */
const lapReferenceNode = nullable(
  obj(
    {
      lapSeconds: seconds('Time of the reference lap.'),
      deltaSeconds: nullable(
        seconds(
          'Time on the current lap minus the reference at the same position; negative is faster. Null while the lap is not comparable.',
        ),
      ),
      predictedSeconds: nullable(
        seconds('Lap time if the rest of the lap goes like the reference.'),
      ),
    },
    'A reference lap; null when there is none.',
  ),
);

const kph = (description: string) => num({ description, unit: 'kph' });

/** The same extreme on a reference lap, near the same place. */
const speedReferenceNode = nullable(
  obj(
    {
      speedKph: kph(
        'For a settled extreme, the reference lap’s own extreme within a short stretch around the same place (50 m for a corner, 100 m for a straight); for one still forming, the reference’s speed at the same place.',
      ),
      deltaKph: kph('This extreme minus the reference’s; positive is faster.'),
    },
    'The extreme on a reference lap; null without that lap or its speeds.',
  ),
);

/** A corner minimum or a straight maximum of the player car. */
const speedExtremeNode = (kind: 'corner' | 'straight') =>
  nullable(
    obj(
      {
        speedKph: kph(
          kind === 'corner' ? 'Lowest speed through the corner.' : 'Highest speed on the straight.',
        ),
        lapDistanceFraction: num({
          description: 'Where on the lap it was reached.',
          unit: 'ratio',
          range: [0, 1],
        }),
        isFinal: bool(
          kind === 'corner'
            ? 'The car is speeding up again (3 km/h or 2 % above it): the minimum is settled. False while it still slows.'
            : 'The car is slowing again (3 km/h or 2 % below it): the maximum is settled. False while it still speeds up.',
        ),
        turnNumber: nullable(
          int(
            kind === 'corner'
              ? 'Turn of `session.turns` that holds it; null when none does.'
              : 'Always null for a straight.',
          ),
        ),
        personalBest: speedReferenceNode,
        sessionBest: speedReferenceNode,
        lastLap: speedReferenceNode,
      },
      kind === 'corner'
        ? 'The corner minimum: the one forming while the car slows, else the last one; null before the first corner, and in the pit lane.'
        : 'The straight maximum: the one forming while the car speeds up, else the last one; null before the first straight, and in the pit lane.',
    ),
  );

/** One lap's top speed, as the best or the worst of a period. */
const topSpeedLapNode = (description: string) =>
  obj(
    {
      speedKph: kph('The fastest speed of that lap.'),
      lapNumber: int('Lap of the session it was set on.'),
    },
    description,
  );

/** The highest and the lowest top speed among the clean laps of a period. */
const topSpeedPeriodNode = (description: string) =>
  nullable(
    obj(
      {
        lapCount: int({ description: 'Clean laps the period holds.', unit: 'laps' }),
        best: topSpeedLapNode('The lap with the highest top speed.'),
        worst: topSpeedLapNode('The lap with the lowest top speed.'),
      },
      description,
    ),
  );

/**
 * Live time delta against the best recorded runs of the same stage and car, by
 * distance. Published at ~60 Hz; null off a stage. The stage is split into
 * equal sectors by distance.
 */
export const deltaNode = nullable(
  obj(
    {
      distanceMeters: num({
        description: 'Distance along the stage, or from the start line on a circuit.',
        unit: 'meters',
      }),
      stage: nullable(
        obj(
          {
            deltaSeconds: seconds(
              'Delta to the best run at the same distance; negative is faster. Frozen at the finish.',
            ),
            elapsedSeconds: seconds('Time since the start.'),
            referenceSeconds: seconds('Time of the best run.'),
            finished: bool('The run crossed the finish; the values are final.'),
            resultSeconds: nullable(
              seconds('Final difference to the best run once finished; negative is faster.'),
            ),
          },
          {
            description: 'Delta to the best run of the whole stage; null without one.',
            games: acRally,
          },
        ),
      ),
      sector: nullable(
        obj(
          {
            deltaSeconds: seconds(
              'Delta to the best run of this sector at the same distance; negative is faster.',
            ),
            elapsedSeconds: seconds('Time since the sector started.'),
            referenceSeconds: seconds('Time of the best run of this sector.'),
            index: int('Current sector, from 0.'),
            count: int({ description: 'Sectors of the stage.', unit: 'count' }),
          },
          {
            description: 'Delta to the best run of the current sector; null without one.',
            games: acRally,
          },
        ),
      ),
      lastSector: nullable(
        obj(
          {
            index: int('Completed sector, from 0.'),
            timeSeconds: seconds('Time of the completed sector.'),
            resultSeconds: nullable(
              seconds('Difference to the best run of the sector; negative is faster.'),
            ),
          },
          {
            description: 'The most recently completed sector of this run; null before the first.',
            games: acRally,
          },
        ),
      ),
      lap: nullable(
        obj(
          {
            lapNumber: int('Lap being driven: laps completed plus one.'),
            lapDistanceFraction: num({
              description: 'Position on the lap.',
              unit: 'ratio',
              range: [0, 1],
            }),
            currentSeconds: seconds('Time on this lap, from the start line.'),
            isClean: bool(
              'The lap is still comparable: started at the line, no pit lane, no caution.',
            ),
            personalBest: lapReferenceNode,
            sessionBest: lapReferenceNode,
            lastLap: lapReferenceNode,
            sectorStartFractions: list(
              num({ description: 'Sector start.', unit: 'ratio', range: [0, 1] }),
              'Where the sectors start on the lap, the first at 0; empty when the game does not say.',
            ),
            speedExtremes: obj(
              {
                corner: speedExtremeNode('corner'),
                straight: speedExtremeNode('straight'),
              },
              {
                description:
                  'Slowest speed through the latest corner and fastest on the latest straight, found while driving, each compared with the personal best, the session best and the last lap at the same place.',
                since: '2.8',
              },
            ),
            topSpeed: obj(
              {
                session: topSpeedPeriodNode('Clean laps of the session; null before the first.'),
                stint: topSpeedPeriodNode(
                  'Clean laps since the last visit to the pit lane; null before the first.',
                ),
                last5: topSpeedPeriodNode('The last 5 clean laps; null before the first.'),
                last10: topSpeedPeriodNode('The last 10 clean laps; null before the first.'),
              },
              {
                description:
                  'The best and the worst top speed of a clean lap over the session, the stint and the last laps. Updated when a lap is completed.',
                since: '2.15',
              },
            ),
          },
          {
            description:
              'Live delta of the player lap to the personal best of this car and track (all sessions), the best lap of this session and the last complete lap; null off a circuit.',
            games: circuitGames,
            since: '2.5',
          },
        ),
      ),
    },
    {
      description:
        'Live delta: to the best recorded stage runs on a rally stage, to reference laps on a circuit.',
      games: [...circuitGames, ...acRally],
      since: '2.2',
    },
  ),
);

export type DeltaTelemetry = Infer<typeof deltaNode>;
export type StageDeltaTelemetry = NonNullable<DeltaTelemetry>;
export type LapDeltaTelemetry = NonNullable<StageDeltaTelemetry['lap']>;
export type LapReferenceTelemetry = NonNullable<LapDeltaTelemetry['personalBest']>;
