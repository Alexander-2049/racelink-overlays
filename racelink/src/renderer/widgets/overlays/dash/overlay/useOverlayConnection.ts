import { useMemo } from 'react';
import type { TelemetryTopics } from '../../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../../model/useRacingOverlay';
import type { DashboardRealtime, LiveOverlayData } from './types';

const toDashboard = ({ car, controls, fuel, session }: TelemetryTopics): DashboardRealtime => ({
  pushToPassActive: controls.pushToPass.active,
  pushToPassCount: controls.pushToPass.count,
  pushToPassCooldownSeconds: controls.pushToPass.cooldownSeconds,
  drsStatus: controls.drs.status,
  drsCount: controls.drs.count,
  ersBatteryPct: controls.ers.batteryPercent,
  boostLevel: controls.boostLevel,
  enginePowerLevel: controls.enginePowerLevel,
  lapDeployPct: controls.ers.lapDeployPercent,
  fuelMixLevel: controls.fuelMixLevel,
  throttleShapeLevel: controls.throttleShapeLevel,
  deployModeLabel: controls.ers.deployMode,
  tractionControlActive: car.tractionControlActive,
  frontAntiRollBarSetting: controls.antiRollBar.frontSetting,
  frontAntiRollBarMode: controls.antiRollBar.frontMode,
  entryDiffPreloadBase: controls.differential.entryPreloadBase,
  entryDiffPreloadOffset: controls.differential.entryPreloadOffset,
  tc2Level: controls.tc2Level,
  exitDiffLevel: controls.differential.exitLevel,
  rearWingAngle: controls.rearWingAngle,
  rearAntiRollBarSetting: controls.antiRollBar.rearSetting,
  rearAntiRollBarMode: controls.antiRollBar.rearMode,
  entryDiffBase: controls.differential.entryBase,
  entryDiffOffset: controls.differential.entryOffset,
  tcLevel: controls.tcLevel,
  absActive: car.absActive,
  // The dash shows brake bias as a front percentage.
  brakeBias:
    controls.brakeBiasFrontFraction === null ? null : controls.brakeBiasFrontFraction * 100,
  brakeValve: controls.brakeValve,
  weightJacker: controls.weightJacker,
  absLevel: controls.absLevel,
  peakBrakeBias: controls.peakBrakeBias,
  brakeBiasMigration: controls.brakeBiasMigration,
  fuelLevelLiters: fuel.levelLiters,
  fuelLapsRemaining: fuel.lapsRemaining,
  fuelPitWindowOpen: fuel.pitWindowOpen,
  distanceToPitEntryMeters: session.pit.distanceToEntryMeters,
});

export const useOverlayConnection = () => {
  const runtime = useRacingOverlay();
  const { telemetry } = runtime;
  const data = useMemo((): LiveOverlayData => ({ dashboard: toDashboard(telemetry) }), [telemetry]);
  return { ...runtime, data };
};
