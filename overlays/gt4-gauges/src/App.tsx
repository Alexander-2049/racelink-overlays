// Telemetry and settings → what the HUD draws.
import { useEffect, useRef } from 'react';
import RaceHudOverlay from './race-hud/RaceHudOverlay';
import { defaultVisualTuning, type GaugeVisualTuning, type LayoutVisibility } from './race-hud/config/hudConfig';
import type { HudModel, ShiftState } from './race-hud/model';
import { kphToDisplaySpeed, MILES_PER_KILOMETER, resolveSpeedUnit, type SpeedUnit } from './race-hud/utils/speedUnits';
import type { Settings } from './racelink-settings';
import { useOverlayRevision, type Overlay } from './useOverlay';

/** Automatic speedometer scale: where it starts and the step it grows by, per unit. */
const AUTO_SPEED_SCALE: Record<SpeedUnit, { base: number; step: number }> = {
  kph: { base: 280, step: 40 },
  mph: { base: 160, step: 20 },
};
const DEFAULT_MAX_RPM = 8000;
/** The longest gap between two car samples the odometer bridges (a pause, a hidden window). */
const MAX_SAMPLE_GAP_SECONDS = 0.5;

const App = ({ overlay }: { overlay: Overlay }) => {
  useOverlayRevision(overlay, 60);
  const tripKm = useTripDistance(overlay);
  const topSpeedKph = useTopSpeed(overlay);
  const { settings } = overlay;
  const { car } = overlay.telemetry;

  // Reading a topic subscribes to it: the session only for the game's units, fuel only
  // when the car topic lacks the tank capacity.
  const speedUnit = resolveSpeedUnit(
    settings.speedUnit,
    settings.speedUnit === 'auto' ? overlay.telemetry.session.displayUnits : null,
  );
  const fuelCapacity =
    settings.showFuelIndicator ? (car.fuelCapacityLiters ?? overlay.telemetry.fuel.capacityLiters) : null;

  const rpmLimit = car.maxRpm ?? car.shiftLights?.blinkRpm ?? DEFAULT_MAX_RPM;
  const rpmStep = rpmLimit > 12_000 ? 2000 : 1000;
  const maxRpm = Math.max(rpmStep * 2, Math.ceil(rpmLimit / rpmStep) * rpmStep);

  const hud: HudModel = {
    speed: kphToDisplaySpeed(car.speedKph, speedUnit),
    maxSpeed: resolveMaxSpeed(settings.speedScale, speedUnit, topSpeedKph),
    speedUnit,
    gear: car.gear,
    rpm: car.rpm,
    maxRpm,
    rpmStep,
    redlineFromRpm: resolveRedline(settings.redline, car.shiftLights?.shiftRpm ?? null, rpmLimit),
    redlineToRpm: maxRpm,
    shiftState: settings.shiftFlash ? resolveShiftState(car.rpm, car.shiftLights) : 'none',
    pitLimiter: settings.pitLimiter && car.pitLimiterActive === true,
    throttle: car.throttle * 100,
    brake: car.brake * 100,
    lateralAccelerationG: (settings.invertGForce ? -1 : 1) * car.accelerationG.lateral,
    maxGForce: settings.maxGForce,
    fuelPercent: fuelCapacity && fuelCapacity > 0 ? (car.fuelLiters / fuelCapacity) * 100 : null,
    odometer: displayDistance(resolveOdometerKm(settings.odometer, car.odometerMeters, tripKm), speedUnit),
    visibility: readVisibility(settings),
    visual: readVisual(settings),
  };

  return <RaceHudOverlay hud={hud} />;
};

/**
 * The odometer in km: the car's total as Racelink counts it, or the trip since
 * the overlay opened (also while the total is unknown).
 */
const resolveOdometerKm = (
  mode: Settings['odometer'],
  odometerMeters: number | null,
  tripKm: number,
): number | null => {
  if (mode === 'off') return null;
  if (mode === 'total' && odometerMeters !== null) return odometerMeters / 1000;
  return tripKm;
};

const displayDistance = (km: number | null, unit: SpeedUnit): number | null =>
  km === null ? null : unit === 'mph' ? km * MILES_PER_KILOMETER : km;

/** Distance driven since the overlay opened, in km, integrated from the car's speed. */
const useTripDistance = (overlay: Overlay): number => {
  const trip = useRef<{ km: number; sampledAt: number | null }>({ km: 0, sampledAt: null });
  useEffect(
    () =>
      overlay.on('telemetry', ({ car }) => {
        const sampledAt = overlay.sampledAt.car;
        if (sampledAt === undefined || sampledAt === trip.current.sampledAt) return;
        const previous = trip.current.sampledAt;
        trip.current.sampledAt = sampledAt;
        if (previous === null) return;
        const seconds = (sampledAt - previous) / 1000;
        if (seconds > 0 && seconds <= MAX_SAMPLE_GAP_SECONDS) {
          trip.current.km += (Math.max(0, car.speedKph) * seconds) / 3600;
        }
      }),
    [overlay],
  );
  return trip.current.km;
};

/** Highest speed seen since the overlay opened, in km/h: the automatic scale widens to it. */
const useTopSpeed = (overlay: Overlay): number => {
  const top = useRef(0);
  top.current = Math.max(top.current, overlay.telemetry.car.speedKph);
  return top.current;
};

const resolveMaxSpeed = (scale: Settings['speedScale'], unit: SpeedUnit, topSpeedKph: number): number => {
  if (scale !== 'auto') return Number(scale);
  const { base, step } = AUTO_SPEED_SCALE[unit];
  const top = kphToDisplaySpeed(topSpeedKph, unit);
  return Math.max(base, Math.ceil(top / step) * step);
};

const resolveRedline = (mode: Settings['redline'], shiftRpm: number | null, rpmLimit: number): number | null => {
  if (mode === 'off') return null;
  if (mode === 'shift' && shiftRpm !== null && shiftRpm < rpmLimit) return shiftRpm;
  return Math.max(0, rpmLimit - 1000);
};

const resolveShiftState = (
  rpm: number,
  lights: { readonly shiftRpm: number; readonly blinkRpm: number } | null,
): ShiftState => {
  if (!lights || lights.shiftRpm <= 0) return 'none';
  if (lights.blinkRpm > lights.shiftRpm && rpm >= lights.blinkRpm) return 'blink';
  return rpm >= lights.shiftRpm ? 'shift' : 'none';
};

const readVisibility = (s: Settings): LayoutVisibility => ({
  fuelIndicator: s.showFuelIndicator,
  speedometer: s.showSpeedometer,
  rpmDial: s.showRpmDial,
  gForces: s.showGForces,
  gear: s.showGear,
  speed: s.showSpeed,
  pedals: s.showPedals,
});

const readVisual = (s: Settings): GaugeVisualTuning => ({
  ...defaultVisualTuning,
  fuelColor: s.fuelColor,
  fuelTextColor: s.fuelTextColor,
  fuelTextOpacity: s.fuelTextOpacity,
  tickColor: s.gaugeMarkColor,
  labelFill: s.gaugeMarkColor,
  odometerFill: s.odometerColor,
  needleStartColor: s.needleColor,
  needleEndColor: s.needleColor,
  redlineColor: s.redlineColor,
  brakeColor: s.brakeColor,
  throttleColor: s.throttleColor,
  gearColor: s.gearColor,
  gearBackgroundColor: s.gearBackgroundColor,
  gearBackgroundOpacity: s.gearBackgroundOpacity,
  speedReadoutColor: s.speedReadoutColor,
  speedUnitColor: s.speedUnitColor,
  speedUnitOpacity: s.speedUnitOpacity,
  backgroundGradientColor: s.backgroundGradientColor,
  backgroundGradientOpacity: s.backgroundGradientOpacity,
  centerGradientColor: s.centerGradientColor,
  centerGradientOpacity: s.centerGradientOpacity,
  gForceBallColor: s.gForceBallColor,
  shiftFlashColor: s.shiftFlashColor,
});

export default App;
