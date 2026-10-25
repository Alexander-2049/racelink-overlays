import type { SelectOption, SettingDefinition } from '../../overlay-api/settings.js';

/**
 * Building blocks shared by the R- overlays and their settings. Keys keep
 * the same names across the overlays so the
 * renderer code reads like the original.
 */

export const rFontFamilies: readonly SelectOption[] = [
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'RobotoMono', label: 'Roboto Mono' },
  { value: 'TitilliumWeb', label: 'Titillium Web' },
  { value: 'Exo2', label: 'Exo 2' },
  { value: 'BarlowCondensed', label: 'Barlow Condensed' },
  { value: 'JetBrainsMono', label: 'JetBrains Mono' },
  { value: 'Geist', label: 'Geist' },
];

export const rFontWeights: readonly SelectOption[] = [
  { value: 'Regular', label: 'Обычный' },
  { value: 'Medium', label: 'Средний' },
  { value: 'Semibold', label: 'Полужирный' },
  { value: 'Bold', label: 'Жирный' },
  { value: 'Extra', label: 'Сверхжирный' },
];

export const rDriverNameFormats: readonly SelectOption[] = [
  { value: '0', label: 'Имя Фамилия' },
  { value: '1', label: 'Фамилия Имя' },
  { value: '2', label: 'И. Фамилия' },
  { value: '3', label: 'Фамилия И.' },
  { value: '4', label: 'Имя Ф.' },
  { value: '5', label: 'Ф. Имя' },
  { value: '6', label: 'Имя' },
  { value: '7', label: 'Фамилия' },
  { value: '8', label: 'ИФА' },
  { value: '9', label: 'ФИМ' },
  { value: '10', label: 'ФАМ' },
  { value: '11', label: 'ИМЯ' },
  { value: '12', label: 'Полное имя' },
];

type AppearanceDefaults = Readonly<{
  /** `null`: the overlay scales with its window and has no font size setting. */
  fontSize: number | null;
  opacity: number;
  fontFamily?: string;
  fontWeight?: string;
  showTitle?: boolean;
  /** Overlays that draw no title bar have no title color. */
  titleColor?: boolean;
  /** Overlays whose width is a setting. */
  width?: Readonly<{ default: number; min: number; max: number }>;
}>;

/** The "Appearance" settings every R- overlay has: size, font, background, title. */
export const rAppearanceSettings = (defaults: AppearanceDefaults): readonly SettingDefinition[] => [
  ...(defaults.width
    ? ([
        {
          key: 'Width',
          label: 'Ширина оверлея',
          type: 'number',
          default: defaults.width.default,
          min: defaults.width.min,
          max: defaults.width.max,
          step: 1,
          unit: 'px',
        },
      ] as const)
    : []),
  ...(defaults.fontSize === null
    ? []
    : ([
        {
          key: 'FontSize',
          label: 'Размер',
          type: 'number',
          default: defaults.fontSize,
          min: 6,
          max: 60,
          step: 1,
          unit: 'px',
        },
      ] as const)),
  {
    key: 'Opacity',
    label: 'Непрозрачность фона',
    type: 'number',
    default: defaults.opacity,
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    key: 'FontFamily',
    label: 'Шрифт',
    type: 'select',
    default: defaults.fontFamily ?? 'Montserrat',
    options: rFontFamilies,
  },
  {
    key: 'FontWeight',
    label: 'Толщина',
    type: 'select',
    default: defaults.fontWeight ?? 'Semibold',
    options: rFontWeights,
  },
  {
    key: 'ShowTitle',
    label: 'Заголовок оверлея',
    type: 'boolean',
    default: defaults.showTitle ?? false,
  },
  ...(defaults.titleColor === false
    ? []
    : ([
        {
          key: 'OverlayTitleColor',
          label: 'Цвет заголовка',
          type: 'color',
          default: '#d10404',
          visibleIf: { ShowTitle: true },
        },
      ] as const)),
];
