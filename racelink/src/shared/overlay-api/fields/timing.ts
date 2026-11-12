import { bool, int, list, nullable, num, obj, oneOf, type Infer } from '../schema.js';
import { circuitGames, iracing, iracingLmu, lmu, telemetryGames } from './common.js';

const seconds = (description: string) => nullable(num({ description, unit: 'seconds' }));

/** Lap times, history, stints, and fuel strategy of the player. Published at ~4 Hz. */
export const timingNode = obj(
  {
    lap: obj(
      {
        currentSeconds: seconds('Time on the current lap.'),
        lastSeconds: seconds('Last lap time.'),
        bestSeconds: seconds('Best lap time in the session.'),
        deltaToBestSeconds: seconds('Live delta to the best lap; negative is faster.'),
        sectorsSeconds: list(nullable(num({ description: 'Sector time.', unit: 'seconds' })), {
          description: 'Last completed sector times; empty when unavailable.',
          games: lmu,
        }),
      },
      'Current lap timing.',
    ),
    history: list(
      obj(
        {
          lapNumber: nullable(int('Lap number.')),
          lapTimeSeconds: num({ description: 'Lap time.', unit: 'seconds' }),
          deltaToPreviousSeconds: seconds('Difference to the previous lap.'),
          isValid: nullable(bool('The lap counted.')),
          fuelUsedLiters: nullable(num({ description: 'Fuel used on the lap.', unit: 'liters' })),
          tyreWearPercent: nullable(num({ description: 'Tyre wear on the lap.', unit: 'percent' })),
        },
        'One completed lap.',
      ),
      'Completed laps of the session, newest first.',
    ),
    stints: list(
      obj(
        {
          isCurrent: bool('This is the running stint.'),
          laps: int({ description: 'Laps in the stint.', unit: 'laps' }),
          totalSeconds: num({ description: 'Stint duration.', unit: 'seconds' }),
          bestLapSeconds: seconds('Best lap of the stint.'),
          averageLapSeconds: seconds('Average lap of the stint.'),
          consistencyPercent: nullable(
            num({ description: 'Lap time consistency.', unit: 'percent' }),
          ),
          fuelUsedLiters: nullable(num({ description: 'Fuel used in the stint.', unit: 'liters' })),
          tyreWearPercent: nullable(
            num({ description: 'Tyre wear in the stint.', unit: 'percent' }),
          ),
        },
        'One stint.',
      ),
      'Stints of the session, newest first. A stint ends on a refuel or tyre change.',
    ),
    stintLap: nullable(int({ description: 'Laps since the last pit exit.', unit: 'laps' })),
  },
  'Lap times, history, and stints of the player.',
);

const laps = (description: string) => nullable(num({ description, unit: 'laps' }));
const liters = (description: string) => nullable(num({ description, unit: 'liters' }));

export const fuelWindowStatusValues = ['closed', 'soon', 'open', 'pitted'] as const;
export type FuelWindowStatus = (typeof fuelWindowStatusValues)[number];

/** One way to pick the reference consumption, as the fuel calculator offers them. */
const fuelStrategyNode = nullable(
  obj(
    {
      perLapLiters: num({ description: 'Reference consumption per lap.', unit: 'liters' }),
      lapsRemaining: num({ description: 'Laps the fuel in the tank lasts.', unit: 'laps' }),
      timeRemainingSeconds: seconds('Time the fuel in the tank lasts.'),
      targetLaps: laps(
        'Laps the fuel lasts minus the laps still to drive; negative means a stop is needed.',
      ),
      targetSeconds: seconds('targetLaps as time, at the estimate lap time.'),
      refuelLiters: liters(
        'Fuel to add if the player stops now, limited by the free space in the tank; no safety margin.',
      ),
      totalRefuelLiters: liters(
        'Fuel still to add over the rest of the session; no safety margin.',
      ),
      stops: nullable(
        num({ description: 'Stops still needed: totalRefuelLiters per tank capacity.' }),
      ),
      litersToFinish: nullable(
        num({
          description: 'Fuel the rest of the session needs at this consumption; no safety margin.',
          unit: 'liters',
          since: '2.15',
        }),
      ),
      litersAtFinish: liters(
        'Fuel left at the finish without stopping; negative when it runs out. The same amount as targetLaps, in litres.',
      ),
      window: nullable(
        obj(
          {
            status: oneOf(
              fuelWindowStatusValues,
              'closed: too early to stop, soon: opens within two laps, open: a stop now reaches the finish, pitted: the player refuelled and needs no more stops.',
            ),
            firstLap: int({
              description: 'Earliest lap at whose end a full tank reaches the finish.',
              unit: 'laps',
            }),
            lastLap: int({
              description: 'Last lap the fuel completes; stop at its end at the latest.',
              unit: 'laps',
            }),
            refuelLiters: num({
              description: 'Fuel to add at the stop; no safety margin.',
              unit: 'liters',
            }),
          },
          'The next pit window; null when no stop is needed or the session length is unknown.',
        ),
      ),
    },
    'Estimates with one reference consumption; null until a clean lap is known.',
  ),
);

/**
 * The fuel calculator: estimates for each choice of reference
 * consumption, from clean laps of this session and earlier sessions with the
 * same car and track.
 */
const fuelCalculatorNode = nullable(
  obj(
    {
      capacityLiters: nullable(
        num({
          description:
            'Most fuel the car can carry in this session: the tank, or less when the series limits it. Estimates use this.',
          unit: 'liters',
          since: '2.15',
        }),
      ),
      lapSeconds: seconds(
        'Lap time used for the time estimates: average of the last five clean laps, or the best lap.',
      ),
      lapsToFinish: laps(
        'Laps the player still drives from the current position; null when the session length is unknown.',
      ),
      raceLaps: nullable(
        int({ description: 'Estimated laps of the whole session for the player.', unit: 'laps' }),
      ),
      lapsCompleted: int({ description: 'Laps the player completed.', unit: 'laps' }),
      hasRefueled: bool('The player added fuel in this session.'),
      strategies: obj(
        {
          allLaps: fuelStrategyNode,
          last5: fuelStrategyNode,
          last10: fuelStrategyNode,
          lowest: fuelStrategyNode,
          highest: fuelStrategyNode,
          lastLap: fuelStrategyNode,
        },
        'Average of all clean laps, of the last 5 and 10, the lowest and the highest lap, and the last lap.',
      ),
      history: list(
        obj(
          {
            lapNumber: int('Lap number in its session.'),
            usedLiters: num({
              description: 'Fuel used, scaled to a full lap when the lap was joined late.',
              unit: 'liters',
            }),
            measuredLiters: num({ description: 'Fuel used as measured.', unit: 'liters' }),
            isCurrentSession: bool('The lap was driven in this session.'),
            isClean: bool('Green flag, no pit lane, measured from the start line.'),
          },
          'Fuel used on one lap.',
        ),
        'Fuel used per lap, oldest first: earlier sessions with this car and track, then this one. At most 60.',
      ),
    },
    {
      description: 'Fuel calculator estimates and the consumption history behind them.',
      games: circuitGames,
      since: '2.5',
    },
  ),
);

/** Fuel level and the fuel strategy model. Published at ~4 Hz. */
export const fuelNode = obj(
  {
    levelLiters: num({ description: 'Fuel in the tank.', unit: 'liters', games: telemetryGames }),
    capacityLiters: nullable(
      num({ description: 'Tank capacity.', unit: 'liters', games: telemetryGames }),
    ),
    maxAllowedLiters: nullable(
      num({ description: 'Fuel allowed by the series.', unit: 'liters', games: iracing }),
    ),
    kgPerLiter: nullable(
      num({ description: 'Fuel density in kilograms per litre.', games: iracing }),
    ),
    displayUnit: oneOf(['liters', 'kilograms'], {
      description: 'Fuel unit of the car setup. Data is always in litres; convert with kgPerLiter.',
      games: iracing,
    }),
    perLapLiters: nullable(
      num({
        description: 'Reference consumption per lap used by the model.',
        unit: 'liters',
        games: iracing,
      }),
    ),
    lastLapLiters: nullable(
      num({ description: 'Fuel used on the last lap.', unit: 'liters', games: iracing }),
    ),
    lastLapValid: nullable(
      bool({ description: 'The last lap counts as a clean sample.', games: iracing }),
    ),
    currentLapLiters: nullable(
      num({ description: 'Fuel used so far this lap.', unit: 'liters', games: iracing }),
    ),
    projectedLapLiters: nullable(
      num({
        description: 'Projected fuel use of the current lap.',
        unit: 'liters',
        games: iracing,
      }),
    ),
    lapsRemaining: nullable(
      num({ description: 'Laps the fuel lasts.', unit: 'laps', games: iracingLmu }),
    ),
    timeRemainingSeconds: nullable(
      num({ description: 'Time the fuel lasts.', unit: 'seconds', games: iracing }),
    ),
    stintLaps: laps('Laps per full tank.'),
    stopsRemaining: nullable(
      num({ description: 'Pit stops still needed to finish.', games: iracing }),
    ),
    totalStops: nullable(
      num({ description: 'Pit stops needed for the whole race.', games: iracing }),
    ),
    lapsUntilPitWindow: laps('Laps until the next stop is needed.'),
    pitWindowOpen: nullable(
      bool({ description: 'A stop now can finish the race.', games: iracing }),
    ),
    samples: obj(
      {
        recentLiters: list(
          num({ description: 'Fuel per lap.', unit: 'liters' }),
          'Recent valid laps.',
        ),
        historicalLiters: list(
          num({ description: 'Fuel per lap.', unit: 'liters' }),
          'Stored laps of this car and track.',
        ),
        sessionLiters: list(
          num({ description: 'Fuel per lap.', unit: 'liters' }),
          'Laps of this session.',
        ),
        mergedCount: int('Samples used by the model.'),
        referenceWetnessLevel: nullable(int('Track wetness of the stored reference.')),
      },
      { description: 'Consumption samples behind the model.', games: iracing },
    ),
    calculator: fuelCalculatorNode,
  },
  'Fuel level and strategy.',
);

export type TimingTelemetry = Infer<typeof timingNode>;
export type FuelTelemetry = Infer<typeof fuelNode>;
