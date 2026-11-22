// The figures of the fuel board, worked out from what the Overlay API gives.
// Pure; built on the shared fuel model.
import {
  extraFuel,
  lapsOfFuel,
  lastCleanLaps,
  lowFuelState,
  refuelLiters,
  trimmedAverage,
  type ExtraMode,
  type LowFuelState,
} from '../streamer-common/fuelModel.ts';

export type FuelSource = 'AVERAGE' | 'LAST' | 'ALL' | 'LOWEST' | 'HIGHEST' | 'CUSTOM';

type StrategyRef = Readonly<{ perLapLiters: number }> | null | undefined;

export type FuelBoardInput = Readonly<{
  levelLiters: number;
  capacityLiters: number | null;
  /** Fuel used per lap of each recent lap, oldest first, with whether it was clean. */
  history: readonly Readonly<{ usedLiters: number; isClean: boolean }>[];
  strategies: Readonly<{
    allLaps?: StrategyRef;
    last5?: StrategyRef;
    lowest?: StrategyRef;
    highest?: StrategyRef;
    lastLap?: StrategyRef;
  }> | null;
  /** The model's own reference consumption (`fuel.perLapLiters`). */
  modelPerLapLiters: number | null;
  /** Laps still to drive; null when the session length is unknown. */
  lapsToFinish: number | null;
  source: FuelSource;
  customPerLapLiters: number;
  marginLaps: number;
  extraMode: ExtraMode;
  onPitRoad: boolean;
}>;

export type FuelBoard = Readonly<{
  perLapLiters: number | null;
  /** Laps the fuel in the tank lasts. */
  lapsOfFuel: number | null;
  /** Laps still to drive (whole). */
  lapsLeft: number | null;
  /** Fuel to add at the next stop with the margin; zero when the tank lasts. */
  addLiters: number | null;
  /** Fuel left at the finish without a stop; negative when it runs dry. */
  atFinishLiters: number | null;
  extraLiters: number | null;
  warning: LowFuelState;
}>;

/** The consumption per lap the chosen source gives; null while none is known. */
export const consumptionOf = (input: FuelBoardInput): number | null => {
  const { strategies } = input;
  const pick = (strategy: StrategyRef): number | null => strategy?.perLapLiters ?? null;
  switch (input.source) {
    case 'CUSTOM':
      return input.customPerLapLiters > 0 ? input.customPerLapLiters : null;
    case 'LAST':
      return pick(strategies?.lastLap);
    case 'ALL':
      return pick(strategies?.allLaps);
    case 'LOWEST':
      return pick(strategies?.lowest);
    case 'HIGHEST':
      return pick(strategies?.highest);
    case 'AVERAGE':
      return (
        trimmedAverage(lastCleanLaps(input.history, 5)) ??
        pick(strategies?.last5) ??
        input.modelPerLapLiters
      );
  }
};

export const fuelBoard = (input: FuelBoardInput): FuelBoard => {
  const perLap = consumptionOf(input);
  const lapsLeft = input.lapsToFinish === null ? null : Math.max(0, Math.ceil(input.lapsToFinish - 1e-9));
  if (perLap === null)
    return {
      perLapLiters: null,
      lapsOfFuel: null,
      lapsLeft,
      addLiters: null,
      atFinishLiters: null,
      extraLiters: null,
      warning: 0,
    };
  const add =
    lapsLeft === null
      ? null
      : refuelLiters(input.levelLiters, perLap, lapsLeft, input.marginLaps, input.capacityLiters);
  return {
    perLapLiters: perLap,
    lapsOfFuel: lapsOfFuel(input.levelLiters, perLap),
    lapsLeft,
    addLiters: add,
    atFinishLiters: lapsLeft === null ? null : input.levelLiters - lapsLeft * perLap,
    extraLiters:
      lapsLeft === null
        ? null
        : extraFuel(input.extraMode, {
            levelLiters: input.levelLiters,
            perLap,
            lapsLeft,
            onPitRoad: input.onPitRoad,
          }),
    warning: lowFuelState(input.levelLiters, perLap),
  };
};
