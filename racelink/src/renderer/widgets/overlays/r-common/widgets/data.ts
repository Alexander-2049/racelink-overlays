import type { RacingOverlay } from '../../model/useRacingOverlay';
import { toHHMM, toHHMMSS, toMMSSMS } from '../driver/format';

/** Everything the widgets show, in the units of the game's display setting. */
export type WidgetData = Readonly<{
  imperial: boolean;
  trackName: string;
  sessionType: string;
  sessionTitle: string;
  sessionElapsed: number | null;
  sessionRemaining: number | null;
  sessionRemainingCalculated: boolean;
  lap: number;
  lapsTotal: number | null;
  lapsTotalCalculated: boolean;
  lapsRemaining: number | null;
  incidents: number | null;
  incidentLimit: number | null;
  sof: number | null;
  trackTempC: number | null;
  airTempC: number | null;
  windSpeedMps: number | null;
  humidityFraction: number | null;
  trackWetness: string | null;
  timeOfDaySeconds: number | null;
  speedKph: number;
  rpm: number;
  gear: number;
  absActive: boolean;
  tractionControl: number | null;
  brakeBiasFraction: number | null;
  waterTempC: number | null;
  oilTempC: number | null;
  fuelLiters: number | null;
  fuelLapsRemaining: number | null;
  pushToPassCount: number | null;
  currentLapSeconds: number | null;
  lastLapSeconds: number | null;
  bestLapSeconds: number | null;
  carName: string;
  carNumber: string;
  position: number | null;
  startPosition: number | null;
  iRating: number | null;
  iRatingChange: number | null;
  drivers: number;
  classDrivers: number;
}>;

const sessionTypeNames: Readonly<Record<string, string>> = {
  practice: 'Practice',
  qualify: 'Qualify',
  race: 'Race',
  warmup: 'Warmup',
  testing: 'Test',
  hotlap: 'Hotlap',
  other: 'Session',
};

export const buildWidgetData = (overlay: RacingOverlay): WidgetData => {
  const { session, car, controls, vehicle, timing, fuel, weather, drivers } = overlay.telemetry;
  const player =
    drivers.find((driver) => driver.isPlayer) ??
    drivers.find((driver) => driver.carIdx === session.focusedCarIdx);
  const competitors = drivers.filter((driver) => !driver.isPaceCar && !driver.isSpectator);
  const playerClass = player
    ? session.classes.find((entry) => entry.classId === player.classId)
    : undefined;
  const iracing = session.ext.iracing;
  return {
    imperial: session.displayUnits === 'imperial',
    trackName: session.trackName,
    sessionType: sessionTypeNames[session.type] ?? 'Session',
    sessionTitle: sessionTypeNames[session.type] ?? 'Session',
    sessionElapsed: session.sessionTimeSeconds,
    sessionRemaining: session.timeRemainingSeconds,
    sessionRemainingCalculated: false,
    lap: session.lap,
    lapsTotal:
      session.lapsTotal ??
      (session.estimatedTotalLaps === null ? null : Math.ceil(session.estimatedTotalLaps)),
    lapsTotalCalculated: session.lapsTotal === null && session.estimatedTotalLaps !== null,
    lapsRemaining:
      session.lapsRemaining ??
      (session.estimatedLapsRemaining === null ? null : Math.ceil(session.estimatedLapsRemaining)),
    incidents: iracing?.incidents.count ?? null,
    incidentLimit: iracing?.incidents.limit ?? null,
    sof: session.strengthOfField,
    trackTempC: weather.trackTemperatureC,
    airTempC: weather.airTemperatureC,
    windSpeedMps: weather.windSpeedMps,
    humidityFraction: weather.humidityFraction,
    trackWetness: weather.trackWetness,
    timeOfDaySeconds: session.timeOfDaySeconds,
    speedKph: car.speedKph,
    rpm: car.rpm,
    gear: car.gear,
    absActive: car.absActive,
    tractionControl: controls.tcLevel,
    brakeBiasFraction: controls.brakeBiasFrontFraction,
    waterTempC: vehicle.engine.waterTemperatureC,
    oilTempC: vehicle.engine.oilTemperatureC,
    fuelLiters: fuel.levelLiters,
    fuelLapsRemaining: fuel.lapsRemaining,
    pushToPassCount: controls.pushToPass.count,
    currentLapSeconds: timing.lap.currentSeconds,
    lastLapSeconds: timing.lap.lastSeconds,
    bestLapSeconds: timing.lap.bestSeconds,
    carName: player?.carName ?? '',
    carNumber: player?.carNumber ?? '',
    position: player?.position ?? null,
    startPosition: player?.startPosition ?? null,
    iRating: player?.ext.iracing?.iRating ?? null,
    iRatingChange: player?.ext.iracing?.iRatingChange ?? null,
    drivers: competitors.length,
    classDrivers: playerClass?.driverCount ?? 0,
  };
};

export const formatClock = (seconds: number | null, twelveHour: boolean): string => {
  if (seconds === null) return '-';
  const hours = Math.floor(seconds / 3600) % 24;
  const minutes = Math.floor(seconds / 60) % 60;
  const two = (value: number) => String(value).padStart(2, '0');
  if (!twelveHour) return `${two(hours)}:${two(minutes)}`;
  return `${String(hours % 12 === 0 ? 12 : hours % 12)}:${two(minutes)} ${hours < 12 ? 'AM' : 'PM'}`;
};

export const formatSessionTimer = (elapsed: number | null, remaining: number | null) => ({
  elapsed: elapsed === null ? null : toHHMMSS(elapsed),
  remaining: remaining === null ? null : toHHMM(remaining),
  unit: remaining === null ? '' : remaining < 3600 ? 'm' : 'h',
});

export const formatLapTime = (seconds: number | null): string =>
  seconds !== null && Number.isFinite(seconds) && seconds > 0
    ? toMMSSMS(seconds, 3, false)
    : '--:--.---';
