/** Settings a built-in overlay receives from its layout: values, column visibility and order. */
export type OverlaySettingValue = string | number | boolean | null | (string | number)[];

export interface OverlaySettingsState {
  values?: Record<string, OverlaySettingValue>;
  visibility?: Record<string, boolean>;
  order?: Record<string, string[]>;
}
