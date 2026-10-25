import type { SelectOption, SettingDefinition } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { choice, slider, tint, toggle, type RowDefaults } from './rowPages.js';
import { widgetBarGroups } from './widgets.js';

/** The components of the Input Telemetry overlay, in their fixed order. */
export const inputTelemetryComponents = [
  'ShowGearSpeed',
  'ShowWheel',
  'ShowTelemetry',
  'ShowPedals',
  'gMeter',
] as const;

const componentLabels: Readonly<Record<string, string>> = {
  ShowGearSpeed: 'Передача и скорость',
  ShowWheel: 'Руль',
  ShowTelemetry: 'След телеметрии',
  ShowPedals: 'Инпуты педалей',
  gMeter: 'G-метр',
};

const option = (value: string, label: string): SelectOption => ({ value, label });

const wheelOptions = [
  option('iracing', 'iRacing'),
  option('simple', 'Простой'),
  option('f1', 'F1'),
  option('formula', 'Formula'),
  option('gt', 'GT'),
  option('normal', 'Обычный'),
  option('rally', 'Ралли'),
  option('truck', 'Грузовик'),
  option('oldschool', 'Олдскул'),
  option('ship', 'Штурвал'),
  option('ascherv2', 'Ascher V2'),
  option('fanatecformula', 'Fanatec Formula'),
  option('fanatecporsche', 'Fanatec Porsche'),
  option('fanatecpodiumnascar', 'Fanatec Podium NASCAR'),
];
const gridOptions = [option('none', 'Нет'), option('line', 'Линия'), option('dashed', 'Пунктир')];
const absOptions = [option('OFF', 'Выкл'), option('LINE', 'Линия'), option('DOTTED', 'Точки')];

const defaults: RowDefaults = {};

const flag = (
  key: string,
  label: string,
  fallback: boolean,
  visibleIf?: SettingDefinition['visibleIf'],
): SettingDefinition =>
  toggle(defaults, key, label, fallback, visibleIf === undefined ? {} : { visibleIf });

const onlyWith = (key: string) => ({ visibleIf: { [key]: true } });

export const rInputTelemetry: OverlayDefinition = {
  kind: 'r-input-telemetry',
  name: 'R-Input Telemetry',
  category: 'driving',
  defaultBounds: { x: 40, y: 80, width: 760, height: 130 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            settings: [
              choice(
                defaults,
                'Theme',
                'Тема',
                [option('CLASSIC', 'Classic'), option('LUMINA', 'Lumina')],
                'LUMINA',
              ),
              flag('DarkMode', 'Тёмный режим', false),
              slider(defaults, 'RenderFPS', 'Частота рендеринга (FPS)', 60, 5, 144, 1),
              // The overlay scales with its window: no size setting.
              ...rAppearanceSettings({ fontSize: null, opacity: 0.8 }),
            ],
          },
        ],
      },
      {
        id: 'component-order',
        label: 'Порядок компонентов',
        groups: [
          {
            settings: [
              {
                key: 'order.ComponentOrder',
                label: 'Порядок компонентов',
                type: 'order',
                hideable: false,
                default: inputTelemetryComponents.map((id) => ({ id, visible: true })),
                items: inputTelemetryComponents.map((id) => option(id, componentLabels[id] ?? id)),
              },
            ],
          },
        ],
      },
      {
        id: 'wheel',
        label: 'Рули и передачи',
        groups: [
          {
            settings: [
              flag('ShowWheel', 'Руль', true),
              choice(
                defaults,
                'WheelType',
                'Тип руля',
                wheelOptions,
                'iracing',
                onlyWith('ShowWheel'),
              ),
              flag('ShowGear', 'Передачи', true, { WheelType: 'simple' }),
              flag('ShowSpeed', 'Скорость', true, { WheelType: 'simple' }),
            ],
          },
        ],
      },
      {
        id: 'gear-speed',
        label: 'Передача и скорость',
        groups: [
          {
            settings: [
              flag('ShowGearSpeed', 'Передача и скорость', true),
              flag('ShowGearSpeed_Gear', 'Передача', true, { ShowGearSpeed: true }),
              flag('ShowGearSpeed_Speed', 'Скорость', true, { ShowGearSpeed: true }),
              slider(defaults, 'ShowGearSpeed_GearSize', 'Размер передачи', 60, 20, 150, 1, {
                unit: 'px',
                ...onlyWith('ShowGearSpeed'),
              }),
            ],
          },
        ],
      },
      {
        id: 'trace',
        label: 'След телеметрии',
        groups: [
          {
            settings: [
              flag('ShowTelemetry', 'График телеметрии', true),
              slider(defaults, 'TelemetryHistorySeconds', 'Длительность истории', 6.5, 1, 30, 0.5, {
                unit: 'с',
                ...onlyWith('ShowTelemetry'),
              }),
              slider(
                defaults,
                'TelemetryLineSize',
                'Размер линии',
                8,
                1,
                30,
                1,
                onlyWith('ShowTelemetry'),
              ),
              flag('HighlightTelemetryLines', 'Выделенное', false, { ShowTelemetry: true }),
              tint(
                defaults,
                'TelemetryBackgroundColor',
                'Цвет фона',
                '#ffffff07',
                onlyWith('ShowTelemetry'),
              ),
            ],
          },
          {
            label: 'Линии',
            settings: [
              flag('ShowThrottleTelemetry', 'Показывать газ', true, { ShowTelemetry: true }),
              tint(
                defaults,
                'ThrottleLineColor',
                'Цвет газа',
                '#08D41C',
                onlyWith('ShowTelemetry'),
              ),
              slider(
                defaults,
                'ThrottleLineOpacity',
                'Непрозрачность газа',
                100,
                0,
                100,
                1,
                onlyWith('ShowTelemetry'),
              ),
              flag('ShowBrakeTelemetry', 'Показывать тормоз', true, { ShowTelemetry: true }),
              tint(
                defaults,
                'BrakeLineColor',
                'Цвет тормоза',
                '#ff0000',
                onlyWith('ShowTelemetry'),
              ),
              slider(
                defaults,
                'BrakeLineOpacity',
                'Непрозрачность тормоза',
                100,
                0,
                100,
                1,
                onlyWith('ShowTelemetry'),
              ),
              flag('ShowABSBrakeTelemetry', 'Показывать АБС', true, { ShowTelemetry: true }),
              choice(
                defaults,
                'ABSBrakeTelemetryLine',
                'Стиль линий',
                absOptions,
                'LINE',
                onlyWith('ShowTelemetry'),
              ),
              tint(defaults, 'BrakeABSLineColor', 'Цвет АБС', '#ffc400', onlyWith('ShowTelemetry')),
              flag('ShowClutchTelemetry', 'Показывать сцепление', false, { ShowTelemetry: true }),
              tint(
                defaults,
                'CluthLineColor',
                'Цвет сцепления',
                '#0000FF',
                onlyWith('ShowTelemetry'),
              ),
              flag('ShowSpeedTelemetry', 'Показывать скорость', false, { ShowTelemetry: true }),
              tint(
                defaults,
                'SpeedLineColor',
                'Цвет скорости',
                '#85C1E9',
                onlyWith('ShowTelemetry'),
              ),
              flag('ShowWheelTelemetry', 'Показывать руль', false, { ShowTelemetry: true }),
              tint(defaults, 'WheelLineColor', 'Цвет руля', '#c4c4c4', onlyWith('ShowTelemetry')),
            ],
          },
          {
            label: 'Сетка',
            settings: [
              choice(
                defaults,
                'VerticalGridLine',
                'Вертикальные линии',
                gridOptions,
                'line',
                onlyWith('ShowTelemetry'),
              ),
              choice(
                defaults,
                'HorizontalGridLine',
                'Горизонтальные линии',
                gridOptions,
                'dashed',
                onlyWith('ShowTelemetry'),
              ),
              choice(
                defaults,
                'MiddleAxisGridLine',
                'Средняя линия',
                gridOptions,
                'line',
                onlyWith('ShowTelemetry'),
              ),
            ],
          },
        ],
      },
      {
        id: 'pedals',
        label: 'Инпуты педалей',
        groups: [
          {
            settings: [
              flag('ShowPedals', 'Инпуты педалей', true),
              choice(
                defaults,
                'PedalBarsStyle',
                'Стиль полос',
                [option('classic', 'Классический'), option('minimal', 'Минимальный')],
                'classic',
                onlyWith('ShowPedals'),
              ),
              choice(
                defaults,
                'PedalInputIndicator',
                'Индикатор края',
                [option('none', 'Нет'), option('caps', 'Колпачки')],
                'caps',
                onlyWith('ShowPedals'),
              ),
              flag('ShowInputValues', 'Значения инпутов', true, { ShowPedals: true }),
              flag('ShowThrottleBar', 'Показывать газ', true, { ShowPedals: true }),
              flag('ShowBrakeBar', 'Показывать тормоз', true, { ShowPedals: true }),
              flag('ShowABSInBar', 'Показывать АБС в полосе', true, { ShowPedals: true }),
              flag('ShowClutchBar', 'Показывать сцепление', true, { ShowPedals: true }),
            ],
          },
        ],
      },
      {
        id: 'g-meter',
        label: 'G-метр',
        groups: [
          {
            label: 'G-метр в реальном времени',
            settings: [
              flag('gMeter', 'G-метр', false),
              flag('GDot', 'Точка', true, { gMeter: true }),
              tint(defaults, 'GDotColor', 'Цвет точки', '#AEBBFF', onlyWith('gMeter')),
              tint(defaults, 'GDotHistoryColor', 'Цвет следа', '#5A78FF', onlyWith('gMeter')),
              slider(defaults, 'GDotDecay', 'Время затухания следа', 3, 0.5, 10, 0.5, {
                unit: 'с',
                ...onlyWith('gMeter'),
              }),
              slider(defaults, 'GDotHistory', 'Длина следа', 200, 10, 600, 10, onlyWith('gMeter')),
              slider(defaults, 'GDotRadius', 'Радиус точки', 4, 1, 12, 1, onlyWith('gMeter')),
              flag('GCurrent', 'Текущее значение', false, { gMeter: true }),
              flag('GPeak', 'Пиковое значение', false, { gMeter: true }),
            ],
          },
          {
            label: 'Предел сцепления',
            settings: [
              flag('GEnvelope', 'Контур предела', true, { gMeter: true }),
              tint(defaults, 'GEnvelopeColor', 'Цвет контура', '#FFFFFF', onlyWith('gMeter')),
              slider(
                defaults,
                'GEnvelopeLineSize',
                'Толщина контура',
                1,
                1,
                6,
                1,
                onlyWith('gMeter'),
              ),
            ],
          },
        ],
      },
      {
        id: 'widgets',
        label: 'Виджеты',
        groups: [
          ...widgetBarGroups(
            'Top',
            Array.from({ length: 5 }, () => ({ widget: 'None' as const })),
            5,
          ),
          ...widgetBarGroups(
            'Bottom',
            Array.from({ length: 5 }, () => ({ widget: 'None' as const })),
            5,
          ),
        ],
      },
    ],
  },
};
