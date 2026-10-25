import type {
  OrderSetting,
  SelectOption,
  SettingDefinition,
  SettingsGroup,
  SettingsPage,
} from '../../overlay-api/settings.js';
import { rDriverNameFormats } from './common.js';

/**
 * Settings pages shared by the R-Standings and R-Relatives driver rows. Keys
 * and defaults are shared; `defaults` carries the values that differ
 * between the two overlays.
 */

export type RowDefaults = Readonly<Record<string, boolean | number | string>>;

const option = (value: string, label: string): SelectOption => ({ value, label });

const densityOptions = [
  option('COZY', 'Свободно'),
  option('COMFORTABLE', 'Комфортно'),
  option('COMPACT', 'Компактно'),
];
const themeOptions = [option('CLASSIC', 'Classic'), option('LUMINA', 'Lumina')];
const highlightOptions = [
  option('ROW_END', 'Конец строки'),
  option('FULL_ROW', 'Вся строка'),
  option('POSITION', 'Позиция'),
  option('DRIVERNAME', 'Имя пилота'),
];
const teamNameOptions = [
  option('0', 'Команда и пилот'),
  option('1', 'Пилот и команда'),
  option('2', 'Команда'),
  option('3', 'Пилот'),
];
const iratingOptions = [
  option('NUMBER', 'Число (1523)'),
  option('NUMBERINK', 'В тысячах (1.5k)'),
  option('NUMBERINKNODEC', 'В тысячах без десятых (2K)'),
];
const tagSizeOptions = [
  option('SMALL', 'Малый'),
  option('MEDIUM', 'Средний'),
  option('LARGE', 'Большой'),
];
const batteryOptions = ['XS', 'S', 'M', 'L', 'XL'].map((size) => option(size, size));

/** A boolean setting; `defaults` overrides the shared default. */
export const toggle = (
  defaults: RowDefaults,
  key: string,
  label: string,
  fallback: boolean,
  extra: Partial<Pick<SettingDefinition, 'visibleIf' | 'description'>> = {},
): SettingDefinition => ({
  key,
  label,
  type: 'boolean',
  default: typeof defaults[key] === 'boolean' ? defaults[key] : fallback,
  ...extra,
});

export const slider = (
  defaults: RowDefaults,
  key: string,
  label: string,
  fallback: number,
  min: number,
  max: number,
  step = 1,
  extra: Partial<Pick<SettingDefinition, 'visibleIf' | 'description'>> & { unit?: string } = {},
): SettingDefinition => ({
  key,
  label,
  type: 'number',
  default: typeof defaults[key] === 'number' ? defaults[key] : fallback,
  min,
  max,
  step,
  ...extra,
});

export const choice = (
  defaults: RowDefaults,
  key: string,
  label: string,
  options: readonly SelectOption[],
  fallback: string,
  extra: Partial<Pick<SettingDefinition, 'visibleIf' | 'description'>> = {},
): SettingDefinition => ({
  key,
  label,
  type: 'select',
  default: typeof defaults[key] === 'string' ? defaults[key] : fallback,
  options,
  ...extra,
});

export const tint = (
  defaults: RowDefaults,
  key: string,
  label: string,
  fallback: string,
  extra: Partial<Pick<SettingDefinition, 'visibleIf' | 'description'>> = {},
): SettingDefinition => ({
  key,
  label,
  type: 'color',
  default: typeof defaults[key] === 'string' ? defaults[key] : fallback,
  ...extra,
});

/** A column order setting: every column can be moved, none hidden. */
export const columnOrder = (
  key: string,
  label: string,
  columns: readonly (readonly [string, string])[],
): OrderSetting => ({
  key,
  label,
  type: 'order',
  hideable: false,
  default: columns.map(([id]) => ({ id, visible: true })),
  items: columns.map(([id, name]) => option(id, name)),
});

const page = (id: string, label: string, groups: readonly SettingsGroup[]): SettingsPage => ({
  id,
  label,
  groups,
});

const lapTimeColumn = (
  d: RowDefaults,
  show: string,
  label: string,
  decimals: string,
  drop: string,
  showDefault: boolean,
): readonly SettingDefinition[] => [
  toggle(d, show, label, showDefault),
  slider(d, decimals, 'Цифр после запятой', 3, 0, 3, 1, { visibleIf: { [show]: true } }),
  toggle(d, drop, 'Скрыть минуту', false, { visibleIf: { [show]: true } }),
];

/** Appearance: size, theme, density, fonts, row look. `extra` adds overlay-specific rows. */
export const appearancePage = (d: RowDefaults, extra: readonly SettingDefinition[]): SettingsPage =>
  page('appearance', 'Производительность и вид', [
    {
      settings: [
        choice(d, 'Theme', 'Тема', themeOptions, 'LUMINA'),
        choice(d, 'Density', 'Плотность', densityOptions, 'COMFORTABLE'),
        toggle(d, 'DarkMode', 'Тёмный режим', false),
        toggle(d, 'PositionsBackgroundSeparation', 'Разделение строк', true),
        toggle(d, 'LineSeparator', 'Разделительные линии', false, {
          visibleIf: { Theme: 'CLASSIC' },
        }),
        toggle(d, 'ShowCarClassBgColor', 'Цветные строки по классу авто', true, {
          visibleIf: { Theme: 'LUMINA' },
        }),
        choice(d, 'FlaggedCarsHighlight', 'Подсветка машин с кругом', highlightOptions, 'ROW_END'),
        ...extra,
      ],
    },
  ]);

export const referencePage = (d: RowDefaults): SettingsPage =>
  page('reference', 'Ряды: сравниваемый пилот', [
    {
      settings: [
        toggle(d, 'ReferenceCarStripedBg', 'Фон в полоску', false),
        toggle(d, 'ReferenceCarCustomColors', 'Включить кастомизируемые цвета', false),
        tint(d, 'ReferenceCarBgColor', 'Цвет фона', '#ffda59', {
          visibleIf: { ReferenceCarCustomColors: true },
        }),
        tint(d, 'ReferenceCarStripeColor', 'Цвет полосок', '#d8af0f', {
          visibleIf: { ReferenceCarCustomColors: true },
        }),
        slider(
          d,
          'HighlightedLapTimeOpacity',
          'Непрозрачность выделенных времён круга',
          0.5,
          0,
          1,
          0.05,
        ),
      ],
    },
  ]);

export const infoColumnsPage = (
  d: RowDefaults,
  title: string,
  options: Readonly<{ position: boolean; distance: boolean; lapAndJoker: boolean; gear: boolean }>,
): SettingsPage =>
  page('columns-info', title, [
    {
      settings: [
        ...(options.position ? [toggle(d, 'ShowPosition', 'Позиция пилота', true)] : []),
        toggle(d, 'ShowCarClass', 'Класс машины', true),
        toggle(d, 'ShowDriverNumber', 'Номер пилота', false),
        toggle(d, 'ShowDriverNationalityFlagBadge', 'Национальность флагом', false),
        toggle(d, 'ShowDriverName', 'Имя водителя', true),
        choice(d, 'DriverNameFormat', 'Формат имени пилота', rDriverNameFormats, '0', {
          visibleIf: { ShowDriverName: true },
        }),
        choice(d, 'TeamRacingNameFormat', 'Формат командных гонок', teamNameOptions, '3', {
          visibleIf: { ShowDriverName: true },
        }),
        toggle(d, 'ShowDriverNationalityText', 'Национальность текстом', false),
        toggle(d, 'ShowDriverCarBrand', 'Марка авто', false),
        toggle(d, 'BrandColorIsColored', 'Цветной логотип', true, {
          visibleIf: { ShowDriverCarBrand: true },
        }),
        toggle(d, 'BrandColorHighlight', 'Выделение цветом марки', false, {
          visibleIf: { ShowDriverCarBrand: true },
        }),
        ...(options.distance
          ? [
              toggle(d, 'ShowTimeDistance', 'Разрыв', true),
              slider(d, 'TimeDistanceDecimals', 'Цифр после запятой', 1, 0, 3, 1, {
                visibleIf: { ShowTimeDistance: true },
              }),
              toggle(d, 'ShowPhysicalDistance', 'Физическая дистанция', false),
            ]
          : []),
        ...(options.gear ? [toggle(d, 'ShowDriverGear', 'Номер передачи', false)] : []),
        ...(options.lapAndJoker
          ? [
              toggle(d, 'ShowLapNumber', 'Номер круга', false),
              toggle(d, 'ShowJokerLap', 'Круг-Joker', false),
            ]
          : []),
      ],
    },
  ]);

export const ratingColumnsPage = (d: RowDefaults, title: string): SettingsPage =>
  page('columns-ratings', title, [
    {
      settings: [
        toggle(d, 'ShowLicence', 'Лицензия пилота', true),
        toggle(d, 'ShowSafetyRating', 'Рейтинг безопасности', true),
        toggle(d, 'ShowIrating', 'iRating', true),
        toggle(d, 'ShowIratingGain', 'Изменение iRating', false),
        choice(d, 'IratingFormat', 'Формат iRating', iratingOptions, 'NUMBERINK', {
          visibleIf: { ShowIrating: true },
        }),
      ],
    },
  ]);

export const lapTimePage = (d: RowDefaults, title: string): SettingsPage =>
  page('columns-laptimes', title, [
    {
      settings: [
        ...lapTimeColumn(
          d,
          'ShowFastestLapTime',
          'Быстрейшее время круга',
          'FastestLapTimeDecimals',
          'DropFastestLapTimeMinute',
          false,
        ),
        ...lapTimeColumn(
          d,
          'ShowLastLapTime',
          'Последнее время круга',
          'LastLapTimeDecimals',
          'DropLastLapTimeMinute',
          false,
        ),
        ...lapTimeColumn(
          d,
          'ShowLast5LapTimeAvg',
          'Ср. последних 5 кругов',
          'Last5LapTimeAvgDecimals',
          'DropLast5LapMinute',
          false,
        ),
        ...lapTimeColumn(
          d,
          'ShowLast10LapTimeAvg',
          'Ср. время последних 10 кругов',
          'Last10LapTimeAvgDecimals',
          'DropLast10LapMinute',
          false,
        ),
        toggle(d, 'ShowLapDelta', 'Дельта по времени круга', false),
        slider(d, 'LapDeltaCount', 'Количество видимых времён', 1, 1, 4, 1, {
          visibleIf: { ShowLapDelta: true },
        }),
      ],
    },
  ]);

export const pitPage = (d: RowDefaults, title: string): SettingsPage =>
  page('columns-pit', title, [
    {
      label: 'Питы',
      settings: [
        toggle(d, 'ShowPitLap', 'Круг с пит-стопом', false),
        toggle(d, 'ShowPitTime', 'Время пит-стопа', false),
        toggle(d, 'ShowOutLap', 'Аутлап', true),
        toggle(d, 'ShowCurrentStint', 'Инфо текущего стинта', false),
        tint(d, 'CurrentStintColor', 'Цвет текущего стинта', '#d84b0f', {
          visibleIf: { ShowCurrentStint: true },
        }),
        toggle(d, 'ShowCompletedStint', 'Инфо завершённых стинтов', false),
        tint(d, 'CompletedStintColor', 'Цвет завершённого стинта', '#d87c0f', {
          visibleIf: { ShowCompletedStint: true },
        }),
      ],
    },
    {
      label: 'Шины',
      settings: [
        toggle(d, 'ShowTireCompounds', 'Комплекты резины', false),
        slider(d, 'NumberOfTireCompoundsToShow', 'Макс. история замен шин', 3, 1, 8, 1, {
          visibleIf: { ShowTireCompounds: true },
        }),
        toggle(d, 'ShowLapsCompletedOnTireCompounds', 'Показывать круги на комплекте', false, {
          visibleIf: { ShowTireCompounds: true },
        }),
      ],
    },
    {
      label: 'Push 2 Pass',
      settings: [toggle(d, 'ShowPushToPass', 'Push 2 Pass', false)],
    },
    {
      label: 'Оффтреки',
      settings: [
        toggle(d, 'ShowDriverOfftracks', 'Число оффтреков', false),
        toggle(d, 'DisableOfftrackAnim', 'Выключить анимацию', false, {
          visibleIf: { ShowDriverOfftracks: true },
        }),
      ],
    },
    {
      label: 'Virtual Energy',
      settings: [
        toggle(d, 'ShowVirtualEnergy', 'Virtual Energy', false),
        toggle(d, 'NRG_HideBattery', 'Скрыть батарею', false, {
          visibleIf: { ShowVirtualEnergy: true },
        }),
        choice(d, 'NRG_BatterySize', 'Размер батареи', batteryOptions, 'M', {
          visibleIf: { ShowVirtualEnergy: true },
        }),
        toggle(d, 'NRG_HidePctNumber', 'Скрыть число', false, {
          visibleIf: { ShowVirtualEnergy: true },
        }),
        toggle(d, 'NRG_HidePctSign', 'Скрыть знак %', false, {
          visibleIf: { ShowVirtualEnergy: true },
        }),
        toggle(d, 'NRG_BatteryWhiteOnly', 'Отключить цвета', false, {
          visibleIf: { ShowVirtualEnergy: true },
        }),
      ],
    },
  ]);

export const tagsPage = (d: RowDefaults): SettingsPage =>
  page('badges-tags', 'Значки: тэги гонщика', [
    {
      settings: [
        toggle(d, 'IsDriverTagEnabled', 'Показывать пометку гонщика', true),
        toggle(d, 'IsDriverTagColored', 'Цветной тег гонщика', true, {
          visibleIf: { IsDriverTagEnabled: true },
        }),
        choice(d, 'DriverTagSize', 'Размер', tagSizeOptions, 'SMALL', {
          visibleIf: { IsDriverTagEnabled: true },
        }),
        choice(d, 'CustomDriverTagSize', 'Свой размер', tagSizeOptions, 'MEDIUM', {
          visibleIf: { IsDriverTagEnabled: true },
        }),
        toggle(d, 'ShowDriverNote', 'Показывать заметки водителя', false),
        tint(d, 'DriverNoteColor', 'Цвет заметки', '#A6FC2E', {
          visibleIf: { ShowDriverNote: true },
        }),
      ],
    },
  ]);

export const driverFlagsPage = (d: RowDefaults, sideDefault: string): SettingsPage =>
  page('driver-flags', 'Флаги гонщиков', [
    {
      settings: [
        toggle(d, 'ShowDriverFlag', 'Показывать флаги гонщиков', false),
        choice(
          d,
          'DriverFlagSide',
          'Положение флага',
          [option('left', 'Слева'), option('right', 'Справа'), option('aftername', 'После имени')],
          sideDefault,
          { visibleIf: { ShowDriverFlag: true } },
        ),
        toggle(d, 'DriverFlagExcludeFastestLap', 'Исключать быстрейший круг', false, {
          visibleIf: { ShowDriverFlag: true },
        }),
        toggle(d, 'DriverFlagExcludePenalties', 'Исключать штрафы', false, {
          visibleIf: { ShowDriverFlag: true },
        }),
        toggle(d, 'DriverFlagExcludePitting', 'Исключать круг с питами', false, {
          visibleIf: { ShowDriverFlag: true },
        }),
        toggle(d, 'DriverFlagExcludeCheckered', 'Не показывать клетчатый', false, {
          visibleIf: { ShowDriverFlag: true },
        }),
      ],
    },
  ]);

/** Labels of the driver row columns, in their fixed order. */
export const rowColumnLabels: Readonly<Record<string, string>> = {
  ShowCarClass: 'Класс машины',
  ShowDriverNumber: 'Номер пилота',
  ShowDriverCarBrand: 'Марка авто',
  ShowTireCompounds: 'Комплекты резины',
  ShowDriverNationalityFlagBadge: 'Национальность флагом',
  ShowDriverName: 'Имя водителя',
  ShowCurrentStint: 'Текущий стинт',
  ShowCompletedStint: 'Завершённый стинт',
  ShowDriverNationalityText: 'Национальность текстом',
  ShowJokerLap: 'Круг-Joker',
  ShowPushToPass: 'Push 2 Pass',
  ShowLicence: 'Лицензия',
  ShowIrating: 'iRating',
  ShowFastestLapTime: 'Быстрейшее время круга',
  ShowLastLapTime: 'Последнее время круга',
  ShowLast5LapTimeAvg: 'Ср. 5 кругов',
  ShowLast10LapTimeAvg: 'Ср. 10 кругов',
  ShowLapNumber: 'Номер круга',
  ShowLapDelta: 'Дельта круга',
  ShowDriverOfftracks: 'Оффтреки',
  ShowVirtualEnergy: 'Virtual Energy',
  ShowTimeDistance: 'Разрыв',
  ShowPhysicalDistance: 'Физическая дистанция',
  ShowDriverGear: 'Передача',
  ShowPositionsChanged: 'Изменение позиций',
  ShowIntervalDistance: 'Дистанция',
  ShowGap: 'Разрыв',
  ShowRelativeTimeDistance: 'Относительное время',
  ShowTopSpeed: 'Максимальная скорость',
  ShowLastLapTopSpeed: 'Максимальная скорость круга',
};

export const orderOf = (key: string, label: string, columns: readonly string[]): OrderSetting =>
  columnOrder(
    key,
    label,
    columns.map((column) => [column, rowColumnLabels[column] ?? column] as const),
  );
