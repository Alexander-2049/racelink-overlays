import type {
  OrderItem,
  OrderSetting,
  SettingDefinition,
  SettingsSchema,
} from '../overlay-api/settings.js';
import type { OverlayDefinition } from './overlayCatalog.js';

/**
 * "Standings Pro" and "Relatives Pro" keep every setting of the classic
 * overlays and only change defaults, plus three switches of their own.
 */

const order = (visible: readonly string[], hidden: readonly string[]): readonly OrderItem[] => [
  ...visible.map((id) => ({ id, visible: true })),
  ...hidden.map((id) => ({ id, visible: false })),
];

const mapSettings = (
  schema: SettingsSchema,
  change: (setting: SettingDefinition) => SettingDefinition | readonly SettingDefinition[] | null,
): SettingsSchema => ({
  pages: schema.pages.map((page) => ({
    ...page,
    groups: page.groups.map((group) => ({
      ...group,
      settings: group.settings.flatMap((setting) => {
        const changed = change(setting);
        if (changed === null) return [];
        return 'key' in changed ? [changed] : changed;
      }),
    })),
  })),
});

const reorder = (
  setting: OrderSetting,
  visible: readonly string[],
  extraItems: OrderSetting['items'] = [],
): OrderSetting => {
  const items = [...setting.items, ...extraItems];
  const known = items.map((item) => item.value);
  const first = visible.filter((id) => known.includes(id));
  const hidden = known.filter((id) => !first.includes(id));
  return { ...setting, items, default: order(first, hidden) };
};

/** Settings only the classic boards draw: the Pro boards fit the window their own way. */
const classicOnly: ReadonlySet<string> = new Set(['scale', 'showFlagFrame']);

const nameSwitches: readonly SettingDefinition[] = [
  {
    key: 'driverNameShowFlag',
    label: 'Флаг страны',
    type: 'boolean',
    default: false,
  },
];

const afterTags = (
  setting: SettingDefinition,
  extra: readonly SettingDefinition[],
): SettingDefinition | readonly SettingDefinition[] =>
  setting.key === 'driverNameShowTags' ? [setting, ...extra] : setting;

const withDefaults = (
  setting: SettingDefinition,
  defaults: Readonly<Partial<Record<string, boolean | number | string>>>,
): SettingDefinition => {
  const value = defaults[setting.key];
  return value === undefined ? setting : ({ ...setting, default: value } as SettingDefinition);
};

export const buildStandingsPro = (base: OverlayDefinition): OverlayDefinition => ({
  ...base,
  kind: 'standings-pro',
  name: 'Standings Pro',
  defaultBounds: { x: 40, y: 80, width: 700, height: 284 },
  settings: mapSettings(base.settings, (setting) => {
    if (setting.key === 'driverBadgeFormat' || classicOnly.has(setting.key)) return null;
    if (setting.key === 'order.headerOrder' && setting.type === 'order') {
      return reorder(setting, ['sessionType', 'sessionClock']);
    }
    if (setting.key === 'order.footerOrder' && setting.type === 'order') {
      return reorder(setting, ['currentLap', 'timeRemaining', 'trackTemp', 'airTemp']);
    }
    if (setting.key === 'order.driverOrder' && setting.type === 'order') {
      return reorder(setting, [
        'position',
        'classStripe',
        'name',
        'radio',
        'stint',
        'license',
        'ratingChange',
        'carManufacturer',
        'positionChange',
        'gap',
        'bestLapTime',
        'lastLapTime',
      ]);
    }
    const teamSwitch: SettingDefinition = {
      key: 'driverNameShowTeam',
      label: 'Команда в первой строке',
      description: 'Название команды сверху, имя пилота мелким шрифтом под ним.',
      type: 'boolean',
      default: true,
    };
    const next = afterTags(setting, [...nameSwitches, teamSwitch]);
    if (next !== setting) return next;
    return withDefaults(setting, { showFooter: false, topPerClass: 5 });
  }),
  orderVisibility: base.orderVisibility,
});

export const buildRelativesPro = (base: OverlayDefinition): OverlayDefinition => {
  const airTemp = { value: 'airTemp', label: 'Темп. воздуха' } as const;
  const orderVisibility = {
    ...base.orderVisibility,
    'order.headerOrder': { ...base.orderVisibility?.['order.headerOrder'], airTemp: 'airTemp' },
    'order.footerOrder': {
      ...base.orderVisibility?.['order.footerOrder'],
      airTemp: 'footerAirTemp',
    },
  };
  return {
    ...base,
    kind: 'relatives-pro',
    name: 'Relatives Pro',
    defaultBounds: { x: 40, y: 80, width: 571, height: 300 },
    settings: mapSettings(base.settings, (setting) => {
      if (setting.key === 'driverBadgeFormat' || classicOnly.has(setting.key)) return null;
      if (setting.key === 'order.headerOrder' && setting.type === 'order') {
        return reorder(setting, ['sof', 'incidents', 'trackTemp', 'airTemp'], [airTemp]);
      }
      if (setting.key === 'order.footerOrder' && setting.type === 'order') {
        return reorder(setting, ['timeRemaining', 'currentLap'], [airTemp]);
      }
      if (setting.key === 'order.driverOrder' && setting.type === 'order') {
        return reorder(setting, [
          'carNumber',
          'classStripe',
          'name',
          'radio',
          'license',
          'ratingChange',
          'delta',
        ]);
      }
      const next = afterTags(setting, nameSwitches);
      if (next !== setting) return next;
      return withDefaults(setting, { driverDeltaDecimalPlaces: '1' });
    }),
    orderVisibility,
  };
};
