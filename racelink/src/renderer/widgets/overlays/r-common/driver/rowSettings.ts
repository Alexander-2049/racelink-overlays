import type { OverlaySettingsView } from '../../model/useRacingOverlay';
import { bool, num, str } from '../rSettings';
import type {
  RDensity,
  RFlaggedHighlight,
  RIratingFormat,
  RRowSettings,
  RTagSize,
  RTheme,
} from './model';

type Values = OverlaySettingsView['values'];

const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  allowed.find((candidate) => candidate === value) ?? fallback;

/** Column keys of the Relative overlay, in their fixed order. */
export const relativeColumnKeys = [
  'ShowCarClass',
  'ShowDriverNumber',
  'ShowDriverCarBrand',
  'ShowTireCompounds',
  'ShowDriverNationalityFlagBadge',
  'ShowDriverName',
  'ShowCurrentStint',
  'ShowCompletedStint',
  'ShowDriverNationalityText',
  'ShowJokerLap',
  'ShowPushToPass',
  'ShowLicence',
  'ShowIrating',
  'ShowFastestLapTime',
  'ShowLastLapTime',
  'ShowLast5LapTimeAvg',
  'ShowLast10LapTimeAvg',
  'ShowLapNumber',
  'ShowLapDelta',
  'ShowDriverOfftracks',
  'ShowVirtualEnergy',
  'ShowTimeDistance',
  'ShowPhysicalDistance',
  'ShowDriverGear',
] as const;

/** The main columns of the Standings rows. */
export const standingsColumnKeys = [
  'ShowCarClass',
  'ShowDriverNumber',
  'ShowDriverNationalityFlagBadge',
  'ShowDriverName',
  'ShowDriverNationalityText',
  'ShowLicence',
  'ShowIrating',
  'ShowDriverCarBrand',
] as const;

export const rThemes: readonly RTheme[] = ['CLASSIC', 'LUMINA'];

/** Reads the order list a setting holds as 1-based column numbers. */
const readColumnOrder = (
  order: readonly string[] | undefined,
  keys: readonly string[],
): number[] => {
  if (order === undefined) return keys.map((_, index) => index + 1);
  return keys.map((key) => {
    const at = order.indexOf(key);
    return at < 0 ? 0 : at + 1;
  });
};

export const readTheme = (values: Values): RTheme =>
  pick(str(values, 'Theme', 'LUMINA'), rThemes, 'LUMINA');

/** The settings the driver rows read. `order` is the order list of the `ColumnOrder` setting. */
export const readRowSettings = (
  values: Values,
  order: readonly string[] | undefined,
  keys: readonly string[],
  nameWidth: number,
): RRowSettings => ({
  Density: pick<RDensity>(
    str(values, 'Density', 'COMFORTABLE'),
    ['COMPACT', 'COMFORTABLE', 'COZY'],
    'COMFORTABLE',
  ),
  Opacity: num(values, 'Opacity', 0.8),
  FlaggedCarsHighlight: pick<RFlaggedHighlight>(
    str(values, 'FlaggedCarsHighlight', 'ROW_END'),
    ['ROW_END', 'FULL_ROW', 'POSITION', 'DRIVERNAME'],
    'ROW_END',
  ),
  ShowCarClassBgColor: bool(values, 'ShowCarClassBgColor', true),
  BackgroundSeparation: bool(values, 'PositionsBackgroundSeparation', true),
  ReferenceCarCustomColors: bool(values, 'ReferenceCarCustomColors', false),
  ReferenceCarStripedBg: bool(values, 'ReferenceCarStripedBg', false),
  ReferenceCarBgColor: str(values, 'ReferenceCarBgColor', '#ffda59'),
  ReferenceCarStripeColor: str(values, 'ReferenceCarStripeColor', '#d8af0f'),
  HighlightedLapTimeOpacity: num(values, 'HighlightedLapTimeOpacity', 0.5),

  ShowPosition: bool(values, 'ShowPosition', true),
  ShowCarClass: bool(values, 'ShowCarClass', true),
  ShowDriverNumber: bool(values, 'ShowDriverNumber', false),
  ShowDriverCarBrand: bool(values, 'ShowDriverCarBrand', false),
  BrandColorIsColored: bool(values, 'BrandColorIsColored', true),
  BrandColorHighlight: bool(values, 'BrandColorHighlight', false),
  ShowTireCompounds: bool(values, 'ShowTireCompounds', false),
  NumberOfTireCompoundsToShow: num(values, 'NumberOfTireCompoundsToShow', 3),
  ShowLapsCompletedOnTireCompounds: bool(values, 'ShowLapsCompletedOnTireCompounds', false),
  ShowDriverNationalityFlagBadge: bool(values, 'ShowDriverNationalityFlagBadge', false),
  ShowDriverNationalityText: bool(values, 'ShowDriverNationalityText', false),
  ShowDriverName: bool(values, 'ShowDriverName', true),
  NameWidth: nameWidth,
  DriverNameFormat: str(values, 'DriverNameFormat', '0'),
  ShowDriverNote: bool(values, 'ShowDriverNote', false),
  DriverNoteColor: str(values, 'DriverNoteColor', '#A6FC2E'),
  IsDriverTagEnabled: bool(values, 'IsDriverTagEnabled', true),
  IsDriverTagColored: bool(values, 'IsDriverTagColored', true),
  DriverTagSize: pick<RTagSize>(
    str(values, 'DriverTagSize', 'SMALL'),
    ['SMALL', 'MEDIUM', 'LARGE'],
    'SMALL',
  ),
  CustomDriverTagSize: pick<RTagSize>(
    str(values, 'CustomDriverTagSize', 'MEDIUM'),
    ['SMALL', 'MEDIUM', 'LARGE'],
    'MEDIUM',
  ),
  ShowDriverFlag: bool(values, 'ShowDriverFlag', false),
  DriverFlagSide: str(values, 'DriverFlagSide', 'left'),
  ShowPitLap: bool(values, 'ShowPitLap', false),
  ShowPitTime: bool(values, 'ShowPitTime', false),
  ShowOutLap: bool(values, 'ShowOutLap', true),
  ShowCurrentStint: bool(values, 'ShowCurrentStint', false),
  CurrentStintColor: str(values, 'CurrentStintColor', '#d84b0f'),
  ShowCompletedStint: bool(values, 'ShowCompletedStint', false),
  CompletedStintColor: str(values, 'CompletedStintColor', '#d87c0f'),
  ShowJokerLap: bool(values, 'ShowJokerLap', false),
  ShowPushToPass: bool(values, 'ShowPushToPass', false),
  ShowLicence: bool(values, 'ShowLicence', true),
  ShowSafetyRating: bool(values, 'ShowSafetyRating', true),
  ShowIrating: bool(values, 'ShowIrating', true),
  ShowIratingGain: bool(values, 'ShowIratingGain', false),
  IratingFormat: pick<RIratingFormat>(
    str(values, 'IratingFormat', 'NUMBERINK'),
    ['NUMBER', 'NUMBERINK', 'NUMBERINKNODEC'],
    'NUMBERINK',
  ),
  ShowFastestLapTime: bool(values, 'ShowFastestLapTime', false),
  FastestLapTimeDecimals: num(values, 'FastestLapTimeDecimals', 3),
  DropFastestLapTimeMinute: bool(values, 'DropFastestLapTimeMinute', false),
  ShowLastLapTime: bool(values, 'ShowLastLapTime', false),
  LastLapTimeDecimals: num(values, 'LastLapTimeDecimals', 3),
  DropLastLapTimeMinute: bool(values, 'DropLastLapTimeMinute', false),
  ShowLast5LapTimeAvg: bool(values, 'ShowLast5LapTimeAvg', false),
  Last5LapTimeAvgDecimals: num(values, 'Last5LapTimeAvgDecimals', 3),
  DropLast5LapMinute: bool(values, 'DropLast5LapMinute', false),
  ShowLast10LapTimeAvg: bool(values, 'ShowLast10LapTimeAvg', false),
  Last10LapTimeAvgDecimals: num(values, 'Last10LapTimeAvgDecimals', 3),
  DropLast10LapMinute: bool(values, 'DropLast10LapMinute', false),
  ShowLapNumber: bool(values, 'ShowLapNumber', false),
  ShowLapDelta: bool(values, 'ShowLapDelta', false),
  LapDeltaCount: num(values, 'LapDeltaCount', 1),
  ShowDriverOfftracks: bool(values, 'ShowDriverOfftracks', false),
  DisableOfftrackAnim: bool(values, 'DisableOfftrackAnim', false),
  ShowVirtualEnergy: bool(values, 'ShowVirtualEnergy', false),
  NRG_HideBattery: bool(values, 'NRG_HideBattery', false),
  NRG_HidePctNumber: bool(values, 'NRG_HidePctNumber', false),
  NRG_HidePctSign: bool(values, 'NRG_HidePctSign', false),
  NRG_BatteryWhiteOnly: bool(values, 'NRG_BatteryWhiteOnly', false),
  NRG_BatterySize: str(values, 'NRG_BatterySize', 'M'),
  ShowTimeDistance: bool(values, 'ShowTimeDistance', true),
  TimeDistanceDecimals: num(values, 'TimeDistanceDecimals', 1),
  ShowPhysicalDistance: bool(values, 'ShowPhysicalDistance', false),
  ShowDriverGear: bool(values, 'ShowDriverGear', false),
  ColumnOrder: readColumnOrder(order, keys),
});
