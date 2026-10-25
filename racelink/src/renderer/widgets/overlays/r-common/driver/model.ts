import type { PublishedDriverTag } from '../../../../../shared/contracts/driverTags';

/**
 * The driver data the R- rows draw; `rPositions.ts` builds it from the
 * Overlay API.
 */

export type RLicenceKind = 'NONE' | 'LFM' | 'EMO' | 'R3E';

export type RLicence = Readonly<{
  /** Licence class, for example "A". */
  name: string;
  /** Safety rating text, for example "4.82". */
  safetyRank: string | number;
  bgColor: string;
  darkBgColor: string;
  color: string;
  kind: RLicenceKind;
  /** The sim reports a safety rating in three digits. */
  threeDigitRating?: boolean;
}>;

export type RPit = Readonly<{
  lapNumber: number;
  timeSpentInSeconds: number | null;
  /** `InPit` while the car is still in the pit lane. */
  status?: string;
  isValid?: boolean;
}>;

export type RPitEntry = Readonly<{
  currentPit?: RPit | null;
  pits?: readonly RPit[];
  numberOfLapsSinceLastPitted?: number;
  lastStint?: Readonly<{ numberOfLapsCompleted: number; stintNumber: number }> | null;
}>;

export type RLapTime = Readonly<{
  lapTime: number | null;
  isPersonalBest?: boolean;
  isSessionBest?: boolean;
  isExpired?: boolean;
  isFastestInSession?: boolean;
  isFaster?: boolean;
  isSlower?: boolean;
}>;

export type RTireStint = Readonly<{ compound: number; laps: number }>;

export type RPushToPass = Readonly<{
  count: number | null;
  state: 'active' | 'available' | 'cooldown' | 'empty' | 'na';
  type?: 'countdownSeconds' | 'countdownUsage';
  cooldown?: number;
}>;

export type RNationality = Readonly<{
  name?: string;
  shortName?: string;
  countryCode?: string;
  /** Three-letter names are drawn for Assetto Corsa. */
  threeLetters?: boolean;
}>;

export type RDriverFlag =
  'black' | 'blackAndWhite' | 'repair' | 'slowdown' | 'fastest' | 'pitting' | 'checkered';

export type RPosition = Readonly<{
  driverIdx: number;
  driverNumber: string;
  driverNumberMaxLetters?: number;
  position: number;
  driverName: string;
  secondaryDriverName?: string;
  driverLicence: RLicence | null;
  carClassColor: string;
  irating: number | string;
  iratingDelta: number | null;
  showIratingDelta: boolean;
  /** Seconds to the reference car; negative means ahead of it. */
  distanceInTime: number | null;
  distanceInPhysical: string | null;
  carOnPitRoad: boolean;
  carIsLapped: boolean;
  carIsLapping: boolean;
  carIsReference: boolean;
  gear: number | null;
  pitEntry: RPitEntry | null;
  showPitEntry: boolean;
  rowIsEmpty: boolean;
  jokerLapsCompleted: number;
  isRadioOn: boolean;
  carBrand: string | null;
  tireCompoundsHistory: readonly RTireStint[];
  driverIsNotPresent: boolean;
  isOutLap: boolean;
  isTowing: boolean;
  lapNumber: number | null;
  driverTags: readonly PublishedDriverTag[];
  driverNote: string | null;
  driverFlag: RDriverFlag | null;
  lapDelta: readonly (number | null)[];
  offTrackCount: number;
  nationality: RNationality | null;
  lastLapTime: RLapTime | null;
  last5LapTimeAvg: RLapTime | null;
  last10LapTimeAvg: RLapTime | null;
  fastestLapTime: RLapTime | null;
  pushToPass: RPushToPass | null;
  virtualEnergy: number | null;
}>;

export type RDensity = 'COMPACT' | 'COMFORTABLE' | 'COZY';
export type RTheme = 'CLASSIC' | 'LUMINA';
export type RFlaggedHighlight = 'ROW_END' | 'FULL_ROW' | 'POSITION' | 'DRIVERNAME';
export type RIratingFormat = 'NUMBER' | 'NUMBERINK' | 'NUMBERINKNODEC';
export type RTagSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type RBackgroundMode = 'normal' | 'light' | 'none';

/** Settings the driver rows read, by their setting keys. */
export type RRowSettings = Readonly<{
  Density: RDensity;
  Opacity: number;
  FlaggedCarsHighlight: RFlaggedHighlight;
  ShowCarClassBgColor: boolean;
  BackgroundSeparation: boolean;
  ReferenceCarCustomColors: boolean;
  ReferenceCarStripedBg: boolean;
  ReferenceCarBgColor: string;
  ReferenceCarStripeColor: string;
  HighlightedLapTimeOpacity: number;

  ShowPosition: boolean;
  ShowCarClass: boolean;
  ShowDriverNumber: boolean;
  ShowDriverCarBrand: boolean;
  BrandColorIsColored: boolean;
  BrandColorHighlight: boolean;
  ShowTireCompounds: boolean;
  NumberOfTireCompoundsToShow: number;
  ShowLapsCompletedOnTireCompounds: boolean;
  ShowDriverNationalityFlagBadge: boolean;
  ShowDriverNationalityText: boolean;
  ShowDriverName: boolean;
  NameWidth: number;
  DriverNameFormat: string;
  ShowDriverNote: boolean;
  DriverNoteColor: string;
  IsDriverTagEnabled: boolean;
  IsDriverTagColored: boolean;
  DriverTagSize: RTagSize;
  CustomDriverTagSize: RTagSize;
  ShowDriverFlag: boolean;
  DriverFlagSide: string;
  ShowPitLap: boolean;
  ShowPitTime: boolean;
  ShowOutLap: boolean;
  ShowCurrentStint: boolean;
  CurrentStintColor: string;
  ShowCompletedStint: boolean;
  CompletedStintColor: string;
  ShowJokerLap: boolean;
  ShowPushToPass: boolean;
  ShowLicence: boolean;
  ShowSafetyRating: boolean;
  ShowIrating: boolean;
  ShowIratingGain: boolean;
  IratingFormat: RIratingFormat;
  ShowFastestLapTime: boolean;
  FastestLapTimeDecimals: number;
  DropFastestLapTimeMinute: boolean;
  ShowLastLapTime: boolean;
  LastLapTimeDecimals: number;
  DropLastLapTimeMinute: boolean;
  ShowLast5LapTimeAvg: boolean;
  Last5LapTimeAvgDecimals: number;
  DropLast5LapMinute: boolean;
  ShowLast10LapTimeAvg: boolean;
  Last10LapTimeAvgDecimals: number;
  DropLast10LapMinute: boolean;
  ShowLapNumber: boolean;
  ShowLapDelta: boolean;
  LapDeltaCount: number;
  ShowDriverOfftracks: boolean;
  DisableOfftrackAnim: boolean;
  ShowVirtualEnergy: boolean;
  NRG_HideBattery: boolean;
  NRG_HidePctNumber: boolean;
  NRG_HidePctSign: boolean;
  NRG_BatteryWhiteOnly: boolean;
  NRG_BatterySize: string;
  ShowTimeDistance: boolean;
  TimeDistanceDecimals: number;
  ShowPhysicalDistance: boolean;
  ShowDriverGear: boolean;
  /** Column key to its place from the left (1-based); 0 hides the order. */
  ColumnOrder: readonly number[];
}>;

/** What the row component receives. */
export type RRowProps = Readonly<{
  position: RPosition;
  settings: RRowSettings;
  posIndex: number;
  lastIndex: number;
  columnDigits: number;
  backgroundMode: RBackgroundMode;
  ColumnOrderKeys: readonly string[];
}>;
