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
