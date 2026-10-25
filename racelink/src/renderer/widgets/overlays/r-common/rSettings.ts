import type { OverlaySettingsView } from '../model/useRacingOverlay';

/**
 * Every font face is named `<Family><Weight>` (MontserratSemibold); the
 * plain family name is the regular weight.
 */
export const rFontFace = (family: string, weight: string): string =>
  weight === 'Regular' ? family : `${family}${weight}`;

export type RGeneral = Readonly<{
  fontSize: number;
  opacity: number;
  fontFamily: string;
  fontWeight: string;
  showTitle: boolean;
  titleColor: string;
}>;

type Values = OverlaySettingsView['values'];

export const num = (values: Values, key: string, fallback: number): number => {
  const value = values[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};
export const bool = (values: Values, key: string, fallback: boolean): boolean => {
  const value = values[key];
  return typeof value === 'boolean' ? value : fallback;
};
export const str = (values: Values, key: string, fallback: string): string => {
  const value = values[key];
  return typeof value === 'string' ? value : fallback;
};

/** The appearance settings shared by every R- overlay. */
export const readGeneral = (values: Values): RGeneral => ({
  fontSize: num(values, 'FontSize', 14),
  opacity: num(values, 'Opacity', 0.8),
  fontFamily: str(values, 'FontFamily', 'Montserrat'),
  fontWeight: str(values, 'FontWeight', 'Semibold'),
  showTitle: bool(values, 'ShowTitle', false),
  titleColor: str(values, 'OverlayTitleColor', '#d10404'),
});
