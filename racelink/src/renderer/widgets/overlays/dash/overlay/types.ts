export interface DashboardBox {
  visible?: boolean | null;
  label?: string | null;
  value?: string | null;
  highlight?: number | null;
  fill?: boolean | null;
  blink?: boolean | null;
}

export interface DashboardRealtime {
  pushToPassActive?: boolean | null;
  pushToPassCount?: number | null;
  pushToPassCooldownSeconds?: number | null;
  drsStatus?: number | null;
  drsCount?: number | null;
  ersBatteryPct?: number | null;
  boostLevel?: number | null;
  enginePowerLevel?: number | null;
  lapDeployPct?: number | null;
  fuelMixLevel?: number | null;
  throttleShapeLevel?: number | string | null;
  deployModeLabel?: string | null;
  tractionControlActive?: boolean | null;
  frontAntiRollBarSetting?: number | null;
  frontAntiRollBarMode?: string | null;
  entryDiffPreloadBase?: number | null;
  entryDiffPreloadOffset?: number | null;
  tc2Level?: number | null;
  exitDiffLevel?: number | null;
  rearWingAngle?: number | null;
  rearAntiRollBarSetting?: number | null;
  rearAntiRollBarMode?: string | null;
  entryDiffBase?: number | null;
  entryDiffOffset?: number | null;
  tcLevel?: number | null;
  absActive?: boolean | null;
  brakeBias?: number | null;
  brakeValve?: number | null;
  weightJacker?: number | null;
  absLevel?: number | null;
  peakBrakeBias?: number | null;
  brakeBiasMigration?: number | null;
  fuelLevelLiters?: number | null;
  fuelLapsRemaining?: number | null;
  fuelPitWindowOpen?: boolean | null;
  distanceToPitEntryMeters?: number | null;
}

export interface LiveOverlayData {
  dashboard: DashboardRealtime | null;
}

export interface DashSettings {
  showGreen: boolean;
  showYellow: boolean;
  showOrange: boolean;
  showRed: boolean;
  backgroundOpacity: number;
}
