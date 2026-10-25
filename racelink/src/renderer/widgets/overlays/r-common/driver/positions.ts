import type { DriverTelemetry } from '../../../../../shared/overlay-api/fields/drivers';
import type {
  SessionTelemetry,
  SessionType,
} from '../../../../../shared/overlay-api/fields/session';
import type { RacingOverlay } from '../../model/useRacingOverlay';
import { carBrandOf } from './carBrands';
import { adjustColorShade, toFixedDown } from './format';
import { nationalityOfFlair } from './helpers';
import type {
  RIratingFormat,
  RLapTime,
  RLicence,
  RPit,
  RPitEntry,
  RPosition,
  RPushToPass,
  RTireStint,
} from './model';

/** Settings that change what a position holds (as opposed to how it is drawn). */
export type PositionOptions = Readonly<{
  nameFormat: string;
  teamNameFormat: string;
  iratingFormat: RIratingFormat;
  lapDeltaCount: number;
  physicalUnitsImperial: boolean;
}>;

type Context = Readonly<{
  reference: DriverTelemetry | undefined;
  isRace: boolean;
  isTeamRacing: boolean;
  /** Virtual energy left, known for the player's car only. */
  playerVirtualEnergy: number | null;
  options: PositionOptions;
}>;

const initial = (value: string): string =>
  value === '' ? '' : `${value.charAt(0).toUpperCase()}.`;
const letters = (value: string, count: number): string => value.slice(0, count).toUpperCase();

/** A driver's name in one of the thirteen formats. */
export const formatDriverName = (
  driver: Pick<DriverTelemetry, 'name' | 'firstName' | 'lastName'>,
  format: string,
): string => {
  const first = driver.firstName;
  const last = driver.lastName;
  switch (format) {
    case '1':
      return `${last} ${first}`.trim();
    case '2':
      return `${initial(first)} ${last}`.trim();
    case '3':
      return `${last} ${initial(first)}`.trim();
    case '4':
      return `${first} ${initial(last)}`.trim();
    case '5':
      return `${initial(last)} ${first}`.trim();
    case '6':
      return first;
    case '7':
      return last === '' ? first : last;
    case '8':
      return `${letters(first, 1)}${letters(last, 2)}`;
    case '9':
      return `${letters(last, 1)}${letters(first, 2)}`;
    case '10':
      return letters(last === '' ? first : last, 3);
    case '11':
      return letters(first, 3);
    case '12':
      return driver.name;
    default:
      return `${first} ${last}`.trim();
  }
};

const textColorOn = (hex: string): string => {
  const digits = hex.replace('#', '');
  const value = Number.parseInt(
    digits.length === 3 ? digits.replace(/./g, (c) => c + c) : digits,
    16,
  );
  if (!Number.isFinite(value)) return '#ffffff';
  const luma =
    (0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) / 255;
  return luma > 0.5 ? '#000000' : '#ffffff';
};

const licenceOf = (driver: DriverTelemetry): RLicence | null => {
  const license = driver.ext.iracing?.license;
  if (license === undefined || license.className === '') return null;
  const background = license.color ?? '#ffffff';
  return {
    name: license.className,
    safetyRank: license.safetyRating === null ? '' : toFixedDown(license.safetyRating, 1),
    bgColor: background,
    darkBgColor: adjustColorShade(background, -70),
    color: textColorOn(background),
    kind: 'NONE',
  };
};

const iratingText = (rating: number | null, format: RIratingFormat): string => {
  if (rating === null) return '-';
  if (format === 'NUMBER') return String(rating);
  const thousands = Math.floor(rating / 100) / 10;
  return format === 'NUMBERINKNODEC'
    ? `${toFixedDown(thousands, 0)}K`
    : `${toFixedDown(thousands, 1)}k`;
};

/** A lap time; it is the session best when it equals the driver's best and that best leads the session. */
const lapTimeOf = (driver: DriverTelemetry, seconds: number | null): RLapTime => {
  const best = driver.bestLapSeconds;
  const isPersonalBest = seconds !== null && best !== null && seconds <= best;
  return {
    lapTime: seconds,
    isPersonalBest,
    isSessionBest: isPersonalBest && driver.hasSessionBestLap,
    isExpired: false,
  };
};

const averageOf = (seconds: number | null): RLapTime | null =>
  seconds === null ? null : { lapTime: seconds };

const pitEntryOf = (driver: DriverTelemetry): RPitEntry => {
  const { pit } = driver;
  const current: RPit | null = driver.onPitRoad
    ? {
        lapNumber: driver.lap,
        timeSpentInSeconds: pit.timeInPitSeconds,
        status: 'InPit',
        isValid: true,
      }
    : null;
  const stops: RPit[] =
    pit.lastStopLap !== null && pit.lastStopSeconds !== null
      ? [{ lapNumber: pit.lastStopLap, timeSpentInSeconds: pit.lastStopSeconds, isValid: true }]
      : [];
  return {
    currentPit: current,
    pits: stops,
    numberOfLapsSinceLastPitted: pit.lapsSinceExit ?? undefined,
    lastStint:
      pit.lastStintLaps !== null
        ? { numberOfLapsCompleted: pit.lastStintLaps, stintNumber: pit.stops ?? 1 }
        : null,
  };
};

const pushToPassOf = (driver: DriverTelemetry): RPushToPass | null =>
  driver.pushToPass === null
    ? null
    : {
        state: driver.pushToPass.active
          ? 'active'
          : (driver.pushToPass.count ?? 0) > 0
            ? 'available'
            : 'empty',
        count: driver.pushToPass.count,
        type: 'countdownUsage',
      };

const driverFlagOf = (driver: DriverTelemetry, isBest: boolean): RPosition['driverFlag'] => {
  if (driver.flag === 'checkered') return 'checkered';
  if (driver.flag === 'black' || driver.flag === 'disqualify') return 'black';
  if (driver.flag === 'meatball') return 'repair';
  if (driver.flag === 'penalty') return 'slowdown';
  if (isBest) return 'fastest';
  if (driver.onPitRoad) return 'pitting';
  return null;
};

const tires = (driver: DriverTelemetry): readonly RTireStint[] =>
  driver.tyreCompound === null
    ? []
    : [{ compound: driver.tyreCompound, laps: driver.pit.lapsSinceExit ?? 0 }];

/** The on-track distance to the focused car (from Racelink), as text. */
const physicalDistance = (driver: DriverTelemetry, imperial: boolean): string | null => {
  const signed = driver.gaps.relativeMeters;
  if (signed === null) return null;
  const meters = Math.abs(signed);
  return imperial ? `${String(Math.round(meters * 1.09361))}yd` : `${String(Math.round(meters))}m`;
};

/** One driver as the R- rows show it. `distanceInTime` is negative for cars ahead. */
export const toPosition = (driver: DriverTelemetry, context: Context): RPosition => {
  const reference = context.reference;
  const isReference = reference?.carIdx === driver.carIdx;
  const relativeSeconds = driver.gaps.relativeSeconds;
  const relativeLaps = driver.gaps.relativeLaps ?? 0;
  const history = driver.lapHistorySeconds;
  const deltas: (number | null)[] = [];
  for (let step = 0; step < context.options.lapDeltaCount; step += 1) {
    const at = history.length - 1 - step;
    const current = history[at];
    const previous = history[at - 1];
    deltas.push(current !== undefined && previous !== undefined ? previous - current : null);
  }
  const teamName = driver.teamName;
  const driverName = formatDriverName(driver, context.options.nameFormat);
  let primary = driverName;
  let secondary: string | undefined;
  if (context.isTeamRacing && teamName !== '') {
    switch (context.options.teamNameFormat) {
      case '0':
        primary = teamName;
        secondary = driverName;
        break;
      case '1':
        secondary = teamName;
        break;
      case '2':
        primary = teamName;
        break;
      default:
        break;
    }
  }
  const rating = driver.ext.iracing?.iRating ?? null;
  const change = driver.ext.iracing?.iRatingChange ?? null;
  return {
    driverIdx: driver.carIdx,
    driverNumber: driver.carNumber,
    driverNumberMaxLetters: driver.carNumber.length > 3 ? 4 : undefined,
    position: driver.classPosition ?? driver.position ?? 0,
    driverName: primary,
    secondaryDriverName: secondary,
    driverLicence: licenceOf(driver),
    carClassColor: driver.classColor,
    irating: iratingText(rating, context.options.iratingFormat),
    iratingDelta: change,
    showIratingDelta: context.isRace && change !== null,
    distanceInTime: isReference ? 0 : relativeSeconds === null ? null : -relativeSeconds,
    distanceInPhysical: physicalDistance(driver, context.options.physicalUnitsImperial),
    carOnPitRoad: driver.onPitRoad,
    carIsLapped: context.isRace && !isReference && relativeLaps <= -1,
    carIsLapping: context.isRace && !isReference && relativeLaps >= 1,
    carIsReference: isReference,
    gear: driver.gear,
    pitEntry: pitEntryOf(driver),
    showPitEntry: true,
    rowIsEmpty: false,
    jokerLapsCompleted: driver.ext.iracing?.jokerLapsCompleted ?? 0,
    isRadioOn: driver.isRadioActive,
    carBrand: carBrandOf(driver.carId, driver.carName),
    tireCompoundsHistory: tires(driver),
    driverIsNotPresent: driver.isOut || driver.trackSurface === 'notInWorld',
    isOutLap: driver.pit.isOnOutLap,
    isTowing: driver.trackSurface === 'pitStall' && !driver.onPitRoad,
    lapNumber: driver.lap > 0 ? driver.lap : null,
    driverTags: driver.tags,
    driverNote: null,
    driverFlag: driverFlagOf(driver, driver.hasSessionBestLap),
    lapDelta: deltas,
    offTrackCount: driver.offTrackCount,
    nationality: nationalityOfFlair(driver.ext.iracing?.flairId ?? null),
    lastLapTime: lapTimeOf(driver, driver.lastLapSeconds),
    last5LapTimeAvg: averageOf(driver.lapAverageSeconds.last5),
    last10LapTimeAvg: averageOf(driver.lapAverageSeconds.last10),
    fastestLapTime: {
      lapTime: driver.bestLapSeconds,
      isFastestInSession: driver.hasSessionBestLap,
    },
    pushToPass: pushToPassOf(driver),
    virtualEnergy: driver.isPlayer ? context.playerVirtualEnergy : null,
  };
};

/** An empty placeholder row that keeps the overlay's height. */
export const emptyPosition = (index: number): RPosition => ({
  ...toPosition(
    {
      carIdx: -1 - index,
      position: null,
      classPosition: null,
      startPosition: null,
      startClassPosition: null,
      name: '',
      firstName: '',
      lastName: '',
      carNumber: '',
      classId: null,
      className: '',
      classColor: '#ffffff',
      carId: null,
      carName: '',
      teamId: null,
      teamName: '',
      customerId: null,
      isPlayer: false,
      isFocused: false,
      isSpectator: false,
      isPaceCar: false,
      lap: 0,
      lapsCompleted: 0,
      lapDistanceFraction: 0,
      raceDistanceLaps: 0,
      lastLapSeconds: null,
      bestLapSeconds: null,
      speedKph: null,
      trackSurface: 'onTrack',
      onPitRoad: false,
      flag: null,
      tyreCompound: null,
      gear: null,
      offTrackCount: 0,
      lapHistorySeconds: [],
      pushToPass: null,
      pit: {
        stops: null,
        entrySessionTime: null,
        timeInPitSeconds: null,
        lapsSinceExit: null,
        isOnOutLap: false,
        lastStopLap: null,
        lastStopSeconds: null,
        lastStintLaps: null,
      },
      gaps: {
        toClassLeaderSeconds: null,
        toClassLeaderLaps: null,
        toAheadSeconds: null,
        toAheadLaps: null,
        toLeaderSeconds: null,
        toLeaderLaps: null,
        relativeSeconds: null,
        relativeLaps: null,
        relativeMeters: null,
      },
      hasSessionBestLap: false,
      hasClassBestLap: false,
      lapAverageSeconds: { last5: null, last10: null },
      isRadioActive: false,
      isOut: false,
      tags: [],
      ext: { iracing: null },
    },
    {
      reference: undefined,
      isRace: false,
      isTeamRacing: false,
      playerVirtualEnergy: null,
      options: {
        nameFormat: '0',
        teamNameFormat: '3',
        iratingFormat: 'NUMBERINK',
        lapDeltaCount: 0,
        physicalUnitsImperial: false,
      },
    },
  ),
  rowIsEmpty: true,
});

export type PositionData = Readonly<{
  competitors: readonly DriverTelemetry[];
  /** The session's car classes, with their strength of field (from Racelink). */
  classes: SessionTelemetry['classes'];
  reference: DriverTelemetry | undefined;
  context: Context;
  sessionType: SessionType;
}>;

/** Competitors, the reference car and what is needed to turn them into positions. */
export const readPositionData = (
  overlay: RacingOverlay,
  options: PositionOptions,
): PositionData => {
  const { drivers, session, vehicle } = overlay.telemetry;
  const competitors = drivers.filter((driver) => !driver.isPaceCar && !driver.isSpectator);
  const reference =
    drivers.find((driver) => driver.carIdx === session.focusedCarIdx) ??
    drivers.find((driver) => driver.isPlayer);
  return {
    competitors,
    classes: session.classes,
    reference,
    sessionType: session.type,
    context: {
      reference,
      isRace: session.type === 'race',
      isTeamRacing: session.isTeamRacing === true,
      playerVirtualEnergy: vehicle.battery.virtualEnergyFraction,
      options,
    },
  };
};
