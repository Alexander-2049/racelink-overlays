import { gameIds, type GameId } from '../contracts/games.js';
import { error, type Issue } from './issues.js';

/**
 * Overlay settings: one schema format for built-in and Workshop overlays.
 * The host renders the settings panel from the schema and always delivers a
 * complete, valid value object to the overlay (see `resolveSettings`).
 */

export type OrderItem = Readonly<{ id: string; visible: boolean }>;
/** A wheel, button box or gamepad button as an overlay sees it: the device's name and the button number, from 1. */
export type BoundButton = Readonly<{ deviceName: string; button: number }>;
/**
 * What the user bound to an overlay action (a `binding` setting): a keyboard
 * shortcut (`Ctrl+1`), a controller button, both or neither. The overlay
 * receives the action as a message when it is pressed; the value only tells
 * what to show.
 */
export type BindingValue = Readonly<{ key: string | null; button: BoundButton | null }>;
export type SettingValue = boolean | number | string | readonly OrderItem[] | BindingValue;
export type SettingValues = Readonly<Record<string, SettingValue>>;
/** Show the setting only when every listed setting has the given value. */
export type VisibleIf = Readonly<Record<string, boolean | number | string>>;

type SettingBase = Readonly<{
  key: string;
  label: string;
  description?: string;
  /** Show the setting only while one of these games is selected. */
  games?: readonly GameId[];
  visibleIf?: VisibleIf;
  /** Kept with the overlay but not shown in the settings panel. */
  hidden?: boolean;
}>;

export type BooleanSetting = SettingBase & Readonly<{ type: 'boolean'; default: boolean }>;
export type NumberSetting = SettingBase &
  Readonly<{
    type: 'number';
    default: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
  }>;
export type SelectOption = Readonly<{ value: string; label: string }>;
export type SelectSetting = SettingBase &
  Readonly<{ type: 'select'; default: string; options: readonly SelectOption[] }>;
export type ColorSetting = SettingBase & Readonly<{ type: 'color'; default: string }>;
export type TextSetting = SettingBase &
  Readonly<{ type: 'text'; default: string; maxLength?: number }>;
export type OrderSetting = SettingBase &
  Readonly<{
    type: 'order';
    default: readonly OrderItem[];
    items: readonly SelectOption[];
    /** Items can be switched off as well as reordered. */
    hideable?: boolean;
  }>;
/**
 * An action the user can bind to a key or a controller button. Pressing it
 * sends the overlay `{ type: 'action', action: key }`; the setting's value is
 * what is bound, which the user changes in the overlay's «Бинды» tab only.
 */
export type BindingSetting = SettingBase & Readonly<{ type: 'binding'; default: BindingValue }>;

export type SettingDefinition =
  | BooleanSetting
  | NumberSetting
  | SelectSetting
  | ColorSetting
  | TextSetting
  | OrderSetting
  | BindingSetting;
export type SettingType = SettingDefinition['type'];
export const settingTypes: readonly SettingType[] = [
  'boolean',
  'number',
  'select',
  'color',
  'text',
  'order',
  'binding',
];

/** Nothing bound: the value of every `binding` setting until the user binds it. */
export const emptyBinding: BindingValue = { key: null, button: null };

export type SettingsGroup = Readonly<{ label?: string; settings: readonly SettingDefinition[] }>;
export type SettingsPage = Readonly<{
  id: string;
  label: string;
  groups: readonly SettingsGroup[];
}>;
export type SettingsSchema = Readonly<{ pages: readonly SettingsPage[] }>;

export const emptySettingsSchema: SettingsSchema = { pages: [] };
export const settingKeyPattern = /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/;
export const colorPattern = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;
const defaultTextLength = 200;

export const settingDefinitions = (schema: SettingsSchema): readonly SettingDefinition[] =>
  schema.pages.flatMap((page) => page.groups.flatMap((group) => group.settings));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOrderItem = (value: unknown): value is OrderItem =>
  isRecord(value) && typeof value.id === 'string' && typeof value.visible === 'boolean';

const isBoundButton = (value: unknown): value is BoundButton =>
  isRecord(value) &&
  typeof value.deviceName === 'string' &&
  typeof value.button === 'number' &&
  Number.isInteger(value.button) &&
  value.button >= 1 &&
  value.button <= 512;

export const isBindingValue = (value: unknown): value is BindingValue =>
  isRecord(value) &&
  (value.key === null || (typeof value.key === 'string' && value.key.length <= 40)) &&
  (value.button === null || isBoundButton(value.button));

/** Checks one value against its definition. */
export const isValidSettingValue = (setting: SettingDefinition, value: unknown): boolean => {
  switch (setting.type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'number':
      return (
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= setting.min &&
        value <= setting.max
      );
    case 'select':
      return typeof value === 'string' && setting.options.some((option) => option.value === value);
    case 'color':
      return typeof value === 'string' && colorPattern.test(value);
    case 'text':
      return typeof value === 'string' && value.length <= (setting.maxLength ?? defaultTextLength);
    case 'order':
      return (
        Array.isArray(value) &&
        value.every(isOrderItem) &&
        value.length === setting.items.length &&
        setting.items.every((item) => value.some((entry: OrderItem) => entry.id === item.value))
      );
    case 'binding':
      return isBindingValue(value);
  }
};

/**
 * Repairs a stored order list: keeps the saved order and visibility of known
 * items, appends new items from the default, and drops removed ones.
 */
const resolveOrder = (setting: OrderSetting, value: unknown): readonly OrderItem[] => {
  if (!Array.isArray(value)) return setting.default;
  const known = new Set(setting.items.map((item) => item.value));
  const seen = new Set<string>();
  const saved: OrderItem[] = [];
  for (const entry of value) {
    const item: OrderItem | null =
      typeof entry === 'string'
        ? { id: entry, visible: true }
        : isOrderItem(entry)
          ? { id: entry.id, visible: setting.hideable === false ? true : entry.visible }
          : null;
    if (!item || !known.has(item.id) || seen.has(item.id)) continue;
    seen.add(item.id);
    saved.push(item);
  }
  const missing = setting.default.filter((item) => !seen.has(item.id));
  return [...saved, ...missing];
};

/**
 * Returns a complete, valid value object for the schema. Unknown keys are
 * dropped; invalid or missing values fall back to the default. This also
 * migrates settings when an overlay update changes its schema.
 */
export const resolveSettings = (schema: SettingsSchema, stored: unknown): SettingValues => {
  const source = isRecord(stored) ? stored : {};
  const result: Record<string, SettingValue> = {};
  for (const setting of settingDefinitions(schema)) {
    const value = source[setting.key];
    if (setting.type === 'order') result[setting.key] = resolveOrder(setting, value);
    else if (setting.type === 'binding')
      result[setting.key] = isBindingValue(value)
        ? { key: value.key, button: value.button }
        : emptyBinding;
    else if (setting.type === 'number' && typeof value === 'number' && Number.isFinite(value))
      result[setting.key] = Math.min(setting.max, Math.max(setting.min, value));
    else
      result[setting.key] = isValidSettingValue(setting, value)
        ? (value as SettingValue)
        : setting.default;
  }
  return result;
};

export const defaultSettings = (schema: SettingsSchema): SettingValues =>
  resolveSettings(schema, {});

/** Whether the settings panel should show a setting for these values and game. */
export const isSettingShown = (
  setting: SettingDefinition,
  values: SettingValues,
  gameId: GameId | null,
): boolean =>
  setting.hidden !== true &&
  (setting.games === undefined || gameId === null || setting.games.includes(gameId)) &&
  Object.entries(setting.visibleIf ?? {}).every(([key, expected]) => values[key] === expected);

// ---------------------------------------------------------------------------
// Parsing untrusted schemas (manifest files)
// ---------------------------------------------------------------------------

type Reader = Readonly<{
  issues: Issue[];
  path: string;
}>;

const fieldError = (reader: Reader, path: string, message: string): null => {
  reader.issues.push(error('SETTING_FIELD', path, message));
  return null;
};

const readString = (
  reader: Reader,
  source: Record<string, unknown>,
  key: string,
  path: string,
  options: Readonly<{ optional?: boolean; max?: number; pattern?: RegExp }> = {},
): string | undefined => {
  const value = source[key];
  if (value === undefined && options.optional) return undefined;
  if (typeof value !== 'string' || value.trim() === '') {
    fieldError(reader, `${path}.${key}`, 'expected a non-empty string');
    return undefined;
  }
  if (options.max !== undefined && value.length > options.max) {
    fieldError(reader, `${path}.${key}`, `must be at most ${String(options.max)} characters`);
    return undefined;
  }
  if (options.pattern && !options.pattern.test(value)) {
    fieldError(reader, `${path}.${key}`, `must match ${options.pattern.source}`);
    return undefined;
  }
  return value;
};

const readNumber = (
  reader: Reader,
  source: Record<string, unknown>,
  key: string,
  path: string,
  optional = false,
): number | undefined => {
  const value = source[key];
  if (value === undefined && optional) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fieldError(reader, `${path}.${key}`, 'expected a finite number');
    return undefined;
  }
  return value;
};

const readOptions = (
  reader: Reader,
  value: unknown,
  path: string,
): readonly SelectOption[] | undefined => {
  if (!Array.isArray(value) || value.length === 0) {
    fieldError(reader, path, 'expected a non-empty array of { value, label }');
    return undefined;
  }
  const options: SelectOption[] = [];
  const seen = new Set<string>();
  value.forEach((entry: unknown, index) => {
    const at = `${path}[${String(index)}]`;
    if (!isRecord(entry)) return fieldError(reader, at, 'expected { value, label }');
    const optionValue = readString(reader, entry, 'value', at, { max: 64 });
    const label = readString(reader, entry, 'label', at, { max: 96 });
    if (optionValue === undefined || label === undefined) return;
    if (seen.has(optionValue)) {
      reader.issues.push(
        error('SETTING_OPTION_DUPLICATE', `${at}.value`, `duplicate option "${optionValue}"`),
      );
      return;
    }
    seen.add(optionValue);
    options.push({ value: optionValue, label });
  });
  return options;
};

const readSetting = (reader: Reader, value: unknown, path: string): SettingDefinition | null => {
  if (!isRecord(value)) {
    fieldError(reader, path, 'expected a setting object');
    return null;
  }
  const before = reader.issues.length;
  const key = readString(reader, value, 'key', path, { pattern: settingKeyPattern });
  const label = readString(reader, value, 'label', path, { max: 96 });
  const description = readString(reader, value, 'description', path, { optional: true, max: 400 });
  const type = value.type;
  if (typeof type !== 'string' || !settingTypes.includes(type as SettingType)) {
    fieldError(reader, `${path}.type`, `expected one of ${settingTypes.join(', ')}`);
    return null;
  }
  let games: readonly GameId[] | undefined;
  if (value.games !== undefined) {
    if (
      !Array.isArray(value.games) ||
      value.games.length === 0 ||
      !value.games.every((game) => gameIds.includes(game as GameId))
    )
      fieldError(reader, `${path}.games`, `expected a non-empty array of ${gameIds.join(', ')}`);
    else games = value.games as GameId[];
  }
  let visibleIf: VisibleIf | undefined;
  if (value.visibleIf !== undefined) {
    if (
      !isRecord(value.visibleIf) ||
      !Object.values(value.visibleIf).every(
        (item) => typeof item === 'boolean' || typeof item === 'string' || typeof item === 'number',
      )
    )
      fieldError(reader, `${path}.visibleIf`, 'expected { settingKey: value }');
    else visibleIf = value.visibleIf as VisibleIf;
  }
  if (value.hidden !== undefined && typeof value.hidden !== 'boolean')
    fieldError(reader, `${path}.hidden`, 'expected a boolean');
  if (key === undefined || label === undefined || reader.issues.length > before) return null;
  const base = {
    key,
    label,
    ...(description === undefined ? {} : { description }),
    ...(games === undefined ? {} : { games }),
    ...(visibleIf === undefined ? {} : { visibleIf }),
    ...(value.hidden === true ? { hidden: true } : {}),
  };
  const defaultPath = `${path}.default`;
  const badDefault = (message: string): null => {
    reader.issues.push(error('SETTING_DEFAULT_TYPE', defaultPath, message));
    return null;
  };
  switch (type as SettingType) {
    case 'boolean':
      return typeof value.default === 'boolean'
        ? { ...base, type: 'boolean', default: value.default }
        : badDefault('expected a boolean');
    case 'number': {
      const min = readNumber(reader, value, 'min', path);
      const max = readNumber(reader, value, 'max', path);
      const step = readNumber(reader, value, 'step', path, true);
      const unit = readString(reader, value, 'unit', path, { optional: true, max: 16 });
      if (min === undefined || max === undefined) return null;
      if (min > max) return (fieldError(reader, `${path}.min`, 'min must not exceed max'), null);
      if (step !== undefined && step <= 0)
        return (fieldError(reader, `${path}.step`, 'step must be positive'), null);
      if (typeof value.default !== 'number' || !Number.isFinite(value.default))
        return badDefault('expected a finite number');
      if (value.default < min || value.default > max) {
        reader.issues.push(
          error(
            'SETTING_DEFAULT_RANGE',
            defaultPath,
            `${String(value.default)} is outside ${String(min)}..${String(max)}`,
          ),
        );
        return null;
      }
      return {
        ...base,
        type: 'number',
        default: value.default,
        min,
        max,
        ...(step === undefined ? {} : { step }),
        ...(unit === undefined ? {} : { unit }),
      };
    }
    case 'select': {
      const options = readOptions(reader, value.options, `${path}.options`);
      if (!options) return null;
      if (typeof value.default !== 'string') return badDefault('expected an option value');
      if (!options.some((option) => option.value === value.default)) {
        reader.issues.push(
          error('SETTING_DEFAULT_RANGE', defaultPath, `"${value.default}" is not an option value`),
        );
        return null;
      }
      return { ...base, type: 'select', default: value.default, options };
    }
    case 'color':
      return typeof value.default === 'string' && colorPattern.test(value.default)
        ? { ...base, type: 'color', default: value.default }
        : badDefault('expected #rrggbb or #rrggbbaa');
    case 'text': {
      const maxLength = readNumber(reader, value, 'maxLength', path, true);
      if (
        maxLength !== undefined &&
        (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 2000)
      )
        return (fieldError(reader, `${path}.maxLength`, 'expected an integer 1..2000'), null);
      if (typeof value.default !== 'string') return badDefault('expected a string');
      if (value.default.length > (maxLength ?? defaultTextLength)) {
        reader.issues.push(
          error('SETTING_DEFAULT_RANGE', defaultPath, 'default is longer than maxLength'),
        );
        return null;
      }
      return {
        ...base,
        type: 'text',
        default: value.default,
        ...(maxLength === undefined ? {} : { maxLength }),
      };
    }
    case 'order': {
      const items = readOptions(reader, value.items, `${path}.items`);
      if (!items) return null;
      if (value.hideable !== undefined && typeof value.hideable !== 'boolean')
        return (fieldError(reader, `${path}.hideable`, 'expected a boolean'), null);
      const hideable = value.hideable === true;
      const setting: OrderSetting = {
        ...base,
        type: 'order',
        items,
        default: items.map((item) => ({ id: item.value, visible: true })),
        ...(hideable ? { hideable } : {}),
      };
      if (value.default === undefined) return setting;
      const ordered = Array.isArray(value.default)
        ? value.default.map((entry: unknown) =>
            typeof entry === 'string' ? { id: entry, visible: true } : entry,
          )
        : null;
      if (!ordered || !isValidSettingValue(setting, ordered))
        return badDefault('expected every item exactly once, as ids or { id, visible }');
      return { ...setting, default: ordered as OrderItem[] };
    }
    case 'binding':
      // The user binds actions; an overlay cannot suggest a key or a button.
      return value.default === undefined
        ? { ...base, type: 'binding', default: emptyBinding }
        : badDefault('binding settings have no default');
  }
};

/** Parses an untrusted settings schema, reporting every problem with its JSON path. */
export const parseSettingsSchema = (
  value: unknown,
  path = 'settings',
): Readonly<{ schema: SettingsSchema; issues: readonly Issue[] }> => {
  const reader: Reader = { issues: [], path };
  if (value === undefined) return { schema: emptySettingsSchema, issues: [] };
  if (!isRecord(value) || !Array.isArray(value.pages)) {
    fieldError(reader, path, 'expected { pages: [...] }');
    return { schema: emptySettingsSchema, issues: reader.issues };
  }
  const keys = new Map<string, string>();
  const pageIds = new Set<string>();
  const pages: SettingsPage[] = [];
  value.pages.forEach((page: unknown, pageIndex) => {
    const pagePath = `${path}.pages[${String(pageIndex)}]`;
    if (!isRecord(page)) return fieldError(reader, pagePath, 'expected a page object');
    const id = readString(reader, page, 'id', pagePath, { pattern: settingKeyPattern });
    const label = readString(reader, page, 'label', pagePath, { max: 64 });
    if (id !== undefined && pageIds.has(id))
      fieldError(reader, `${pagePath}.id`, `duplicate page "${id}"`);
    if (id !== undefined) pageIds.add(id);
    if (!Array.isArray(page.groups))
      return fieldError(reader, `${pagePath}.groups`, 'expected an array');
    const groups: SettingsGroup[] = [];
    page.groups.forEach((group: unknown, groupIndex) => {
      const groupPath = `${pagePath}.groups[${String(groupIndex)}]`;
      if (!isRecord(group) || !Array.isArray(group.settings))
        return fieldError(reader, groupPath, 'expected { label?, settings: [...] }');
      const groupLabel = readString(reader, group, 'label', groupPath, { optional: true, max: 64 });
      const settings: SettingDefinition[] = [];
      group.settings.forEach((entry: unknown, settingIndex) => {
        const settingPath = `${groupPath}.settings[${String(settingIndex)}]`;
        const setting = readSetting(reader, entry, settingPath);
        if (!setting) return;
        const first = keys.get(setting.key);
        if (first) {
          reader.issues.push(
            error(
              'SETTING_KEY_DUPLICATE',
              `${settingPath}.key`,
              `"${setting.key}" is already used at ${first}`,
            ),
          );
          return;
        }
        keys.set(setting.key, settingPath);
        settings.push(setting);
      });
      groups.push(groupLabel === undefined ? { settings } : { label: groupLabel, settings });
    });
    if (id !== undefined && label !== undefined) pages.push({ id, label, groups });
  });
  const schema: SettingsSchema = { pages };
  for (const setting of settingDefinitions(schema))
    for (const [key, expected] of Object.entries(setting.visibleIf ?? {})) {
      const target = settingDefinitions(schema).find((candidate) => candidate.key === key);
      if (
        !target ||
        target.type === 'order' ||
        target.type === 'binding' ||
        typeof target.default !== typeof expected
      )
        reader.issues.push(
          error(
            'SETTING_VISIBLE_IF',
            `${keys.get(setting.key) ?? path}.visibleIf.${key}`,
            target ? `expected a ${typeof target.default} value` : `unknown setting "${key}"`,
          ),
        );
    }
  return { schema, issues: reader.issues };
};
