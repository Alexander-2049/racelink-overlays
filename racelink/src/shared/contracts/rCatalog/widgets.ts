import type { SelectOption, SettingDefinition, SettingsGroup } from '../../overlay-api/settings.js';

/**
 * The widgets of the top and bottom bars of Standings and Relatives. Only
 * widgets Racelink has data for are offered.
 */
export const rWidgets = [
  { id: 'None', label: 'Нет' },
  { id: 'CurrentPosition', label: 'Позиция' },
  { id: 'Speed', label: 'Скорость' },
  { id: 'Rpm', label: 'Обороты' },
  { id: 'Gear', label: 'Передача' },
  { id: 'TrackTemp', label: 'Температура трассы' },
  { id: 'AirTemp', label: 'Температура воздуха' },
  { id: 'WindSpeed', label: 'Скорость ветра' },
  { id: 'RelativeHumidity', label: 'Влажность' },
  { id: 'TrackWetDryStatus', label: 'Состояние трассы' },
  { id: 'Sof', label: 'SOF' },
  { id: 'Incidents', label: 'Инциденты' },
  { id: 'SessionTimer', label: 'Таймер сессии' },
  { id: 'RemainingSessionTime', label: 'Осталось времени' },
  { id: 'LapCounter', label: 'Счётчик кругов' },
  { id: 'CurrentLapNumber', label: 'Номер круга' },
  { id: 'RemainingLaps', label: 'Осталось кругов' },
  { id: 'TrackTime', label: 'Время в игре' },
  { id: 'LocalPCTime', label: 'Время ПК (24 ч)' },
  { id: 'LocalPCTime12h', label: 'Время ПК (12 ч)' },
  { id: 'LastLapTime', label: 'Последний круг' },
  { id: 'FastestLapTime', label: 'Лучший круг' },
  { id: 'CurrentLapTime', label: 'Текущий круг' },
  { id: 'BrakeBias', label: 'Баланс тормозов' },
  { id: 'WaterTemp', label: 'Температура воды' },
  { id: 'OilTemp', label: 'Температура масла' },
  { id: 'Abs', label: 'ABS' },
  { id: 'TractionControl', label: 'Контроль тяги' },
  { id: 'Fuel', label: 'Топливо' },
  { id: 'RemainingFuelLaps', label: 'Кругов на топливе' },
  { id: 'PushToPass', label: 'Push to Pass' },
  { id: 'SessionType', label: 'Тип сессии' },
  { id: 'TrackName', label: 'Трасса' },
  { id: 'CarName', label: 'Машина' },
  { id: 'CarNumber', label: 'Номер машины' },
  { id: 'iRating', label: 'iRating' },
  { id: 'PositionGained', label: 'Набранные позиции' },
  { id: 'TotalNumberOfDrivers', label: 'Число пилотов' },
  { id: 'TotalNumberOfClassDrivers', label: 'Пилотов в классе' },
] as const;

export type RWidgetId = (typeof rWidgets)[number]['id'];

export const rWidgetOptions: readonly SelectOption[] = rWidgets.map((widget) => ({
  value: widget.id,
  label: widget.label,
}));

export const rWidgetThemes: readonly SelectOption[] = [
  { value: 'transparent', label: 'Прозрачная' },
  { value: 'default', label: 'Стандартная' },
  { value: 'carbon', label: 'Карбон' },
  { value: 'glass', label: 'Стекло' },
  { value: 'hex', label: 'Шестиугольник' },
  { value: 'slider', label: 'Слайдер' },
  { value: 'lcd', label: 'LCD' },
  { value: 'stripe', label: 'Полоса' },
];

export const rWidgetIconTypes: readonly SelectOption[] = [
  { value: 'ICON', label: 'Иконка' },
  { value: 'TEXT', label: 'Текст' },
  { value: 'NONE', label: 'Ничего' },
];

export type WidgetBar = 'Top' | 'Bottom';
export const widgetSlotCount = 4;

type SlotDefaults = Readonly<{ widget: RWidgetId; theme?: string; iconType?: string }>;

const slotKey = (bar: WidgetBar, index: number, field: string): string =>
  `${bar}Widget${String(index + 1)}.${field}`;

/** Settings of one widget slot: which widget and how it looks. */
const slotSettings = (
  bar: WidgetBar,
  index: number,
  defaults: SlotDefaults,
): readonly SettingDefinition[] => {
  const key = (field: string) => slotKey(bar, index, field);
  return [
    {
      key: key('Widget'),
      label: 'Виджет',
      type: 'select',
      default: defaults.widget,
      options: rWidgetOptions,
    },
    {
      key: key('Theme'),
      label: 'Тема',
      type: 'select',
      default: defaults.theme ?? 'transparent',
      options: rWidgetThemes,
    },
    {
      key: key('IconType'),
      label: 'Заголовок виджета',
      type: 'select',
      default: defaults.iconType ?? 'ICON',
      options: rWidgetIconTypes,
    },
    {
      key: key('Opacity'),
      label: 'Непрозрачность',
      type: 'number',
      default: 0.8,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      key: key('BackgroundColorEnabled'),
      label: 'Свой цвет фона',
      type: 'boolean',
      default: false,
    },
    {
      key: key('BackgroundColor'),
      label: 'Цвет фона',
      type: 'color',
      default: '#000000',
      visibleIf: { [key('BackgroundColorEnabled')]: true },
    },
    { key: key('IconColorEnabled'), label: 'Свой цвет иконки', type: 'boolean', default: false },
    {
      key: key('OverlayLabelOrIconColor'),
      label: 'Цвет иконки',
      type: 'color',
      default: '#444444',
      visibleIf: { [key('IconColorEnabled')]: true },
    },
    { key: key('ValueColorEnabled'), label: 'Свой цвет значения', type: 'boolean', default: false },
    {
      key: key('ValueColor'),
      label: 'Цвет значения',
      type: 'color',
      default: '#ffffff',
      visibleIf: { [key('ValueColorEnabled')]: true },
    },
    { key: key('ScrollTextEnabled'), label: 'Бегущий текст', type: 'boolean', default: false },
    { key: key('FixedWidth'), label: 'Фиксированная ширина', type: 'boolean', default: false },
    {
      key: key('Width'),
      label: 'Ширина',
      type: 'number',
      default: 120,
      min: 40,
      max: 600,
      step: 1,
      unit: 'px',
      visibleIf: { [key('FixedWidth')]: true },
    },
  ];
};

/** Setting groups for the four slots of a bar. */
export const widgetBarGroups = (
  bar: WidgetBar,
  defaults: readonly SlotDefaults[],
  count: number = widgetSlotCount,
): readonly SettingsGroup[] =>
  Array.from({ length: count }, (_, index) => ({
    label: `${bar === 'Top' ? 'Верхняя' : 'Нижняя'} панель, виджет ${String(index + 1)}`,
    settings: slotSettings(bar, index, defaults[index] ?? { widget: 'None' }),
  }));

export { slotKey as widgetSlotKey };
