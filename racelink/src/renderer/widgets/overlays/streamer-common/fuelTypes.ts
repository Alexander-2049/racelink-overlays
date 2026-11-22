// A fuel strategy as the streamer overlays handle it: the fields of the
// API's strategies that every overlay uses, and the same for a custom one.
import type { FuelTelemetry } from '../../../../shared/overlay-api/fields/timing';

export type FuelStrategyView = Readonly<{
  perLapLiters: number;
  lapsRemaining: number;
  refuelLiters: number | null;
  litersToFinish: number | null;
  litersAtFinish: number | null;
  targetLaps: number | null;
}>;

type ApiStrategy = NonNullable<
  NonNullable<FuelTelemetry['calculator']>['strategies']['allLaps']
>;

/** The API's strategy in the shape above. */
export const strategyView = (strategy: ApiStrategy | null | undefined): FuelStrategyView | null =>
  strategy === null || strategy === undefined
    ? null
    : {
        perLapLiters: strategy.perLapLiters,
        lapsRemaining: strategy.lapsRemaining,
        refuelLiters: strategy.refuelLiters,
        litersToFinish: strategy.litersToFinish,
        litersAtFinish: strategy.litersAtFinish,
        targetLaps: strategy.targetLaps,
      };
