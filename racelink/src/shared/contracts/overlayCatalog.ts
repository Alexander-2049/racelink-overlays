import type { OverlayCategory } from '../overlay-api/categories.js';
import type { SettingsSchema } from '../overlay-api/settings.js';
import type { OverlayBounds, OverlayKind } from './layouts.js';
import { buildRelativesPro, buildStandingsPro } from './proBoardCatalog.js';
import { dotaCatalog, type DotaKind } from './dotaCatalog/index.js';
import { nfsmwCatalog, type NfsmwKind } from './nfsmwCatalog/index.js';
import { rCatalog, type RKind } from './rCatalog/index.js';

export type OverlayDefinition = Readonly<{
  kind: OverlayKind;
  name: string;
  /** Group in "Add overlay". */
  category: OverlayCategory;
  defaultBounds: OverlayBounds;
  defaultEnabled: boolean;
  settings: SettingsSchema;
  /**
   * Built-in widgets read item visibility under legacy names: maps an order
   * setting key and item id to the `visibility` key the widget expects.
   */
  orderVisibility?: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

type ProKind = 'standings-pro' | 'relatives-pro';

const plainCatalog: Readonly<
  Record<Exclude<OverlayKind, ProKind | RKind | NfsmwKind | DotaKind>, OverlayDefinition>
> = {
  'rpm-led': {
    kind: 'rpm-led',
    name: 'RPM LED',
    category: 'driving',
    defaultBounds: {
      x: 870,
      y: 80,
      width: 500,
      height: 72,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'display',
          label: 'Display',
          groups: [
            {
              settings: [
                {
                  key: 'ledCount',
                  label: 'LED count',
                  type: 'number',
                  default: 18,
                  min: 6,
                  max: 32,
                  step: 1,
                },
                {
                  key: 'showReading',
                  label: 'Show RPM reading',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  abs: {
    kind: 'abs',
    name: 'ABS Indicator',
    category: 'driving',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 290,
      height: 198,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'colors',
          label: 'Цвета',
          groups: [
            {
              settings: [
                {
                  key: 'activeColor',
                  label: 'Активный цвет',
                  type: 'color',
                  default: '#f59e0b',
                },
                {
                  key: 'inactiveColor',
                  label: 'Неактивный цвет',
                  type: 'color',
                  default: '#404040',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  'arcade-map': {
    kind: 'arcade-map',
    name: 'Arcade Map',
    category: 'awareness',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 360,
      height: 360,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'map',
          label: 'Карта',
          groups: [
            {
              settings: [
                {
                  key: 'visibleRadiusMeters',
                  label: 'Радиус отображения',
                  type: 'number',
                  default: 250,
                  min: 50,
                  max: 1000,
                  step: 10,
                },
                {
                  key: 'driverMarkerStyle',
                  label: 'Стиль маркера гонщика',
                  type: 'select',
                  default: 'navigator',
                  options: [
                    {
                      value: 'navigator',
                      label: 'Навигационная стрелка',
                    },
                    {
                      value: 'chevron',
                      label: 'Гоночный шеврон',
                    },
                    {
                      value: 'circle',
                      label: 'Кружок',
                    },
                    {
                      value: 'car',
                      label: 'Компактная машина',
                    },
                  ],
                },
                {
                  key: 'driverMarkerSizePercent',
                  label: 'Размер маркера гонщика',
                  type: 'number',
                  default: 200,
                  min: 50,
                  max: 300,
                  step: 10,
                },
                {
                  key: 'rotateCamera',
                  label: 'Поворачивать камеру',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'colorByDriverTag',
                  label: 'Цвет гонщика по тегу',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
        {
          id: 'calibration',
          label: 'Калибровка',
          groups: [
            {
              settings: [
                {
                  key: 'trackProgressOffset',
                  label: 'Смещение прогресса трека',
                  type: 'number',
                  default: 0,
                  min: -1,
                  max: 1,
                },
                {
                  key: 'showTrackId',
                  label: 'Показывать ID трека',
                  type: 'boolean',
                  default: false,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  'blind-spot': {
    kind: 'blind-spot',
    name: 'Blind Spot',
    category: 'awareness',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 451,
      height: 240,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'display',
          label: 'Отображение',
          groups: [
            {
              settings: [
                {
                  key: 'showOnlyWhenOnTrack',
                  label: 'Показывать только на трассе',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'width',
                  label: 'Ширина индикатора',
                  type: 'number',
                  default: 20,
                  min: 5,
                  max: 100,
                  step: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 0.3,
                  min: 0,
                  max: 1,
                  step: 0.05,
                },
                {
                  key: 'accentColor',
                  label: 'Акцентный цвет',
                  type: 'color',
                  default: '#f59e0b',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  dash: {
    kind: 'dash',
    name: 'Dash',
    category: 'driving',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 582,
      height: 230,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'visibility',
          label: 'Видимость',
          groups: [
            {
              settings: [
                {
                  key: 'showGreen',
                  label: 'Показывать зелёный',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showYellow',
                  label: 'Показывать жёлтый',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showOrange',
                  label: 'Показывать оранжевый',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showRed',
                  label: 'Показывать красный',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 60,
                  min: 0,
                  max: 100,
                  step: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  'g-force-circle': {
    kind: 'g-force-circle',
    name: 'G-Force Circle',
    category: 'driving',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 320,
      height: 320,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'display',
          label: 'Отображение',
          groups: [
            {
              settings: [
                {
                  key: 'showInputBars',
                  label: 'Показывать полосы педалей',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showPeakBrake',
                  label: 'Показывать пик торможения',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showPeakAcceleration',
                  label: 'Показывать пик разгона',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'absHighlightColor',
                  label: 'Цвет подсветки ABS',
                  type: 'color',
                  default: '#ffffff',
                },
              ],
            },
          ],
        },
        {
          id: 'scale',
          label: 'Шкала',
          groups: [
            {
              settings: [
                {
                  key: 'maxG',
                  label: 'Максимальное G',
                  type: 'number',
                  default: 4,
                  min: 2,
                  max: 12,
                  step: 0.5,
                },
              ],
            },
          ],
        },
        {
          id: 'history',
          label: 'История',
          groups: [
            {
              settings: [
                {
                  key: 'historySeconds',
                  label: 'Длительность истории',
                  type: 'number',
                  default: 3,
                  min: 0.5,
                  max: 10,
                  step: 0.5,
                },
                {
                  key: 'smoothingEnabled',
                  label: 'Включить сглаживание',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'smoothingSamples',
                  label: 'Сила сглаживания',
                  type: 'number',
                  default: 3,
                  min: 1,
                  max: 12,
                  step: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'readout',
          label: 'Показание',
          groups: [
            {
              settings: [
                {
                  key: 'showCenterValue',
                  label: 'Показывать центральное значение',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'centerValueMode',
                  label: 'Центральный режим',
                  type: 'select',
                  default: 'combined',
                  options: [
                    {
                      value: 'combined',
                      label: 'Суммарное планарное G',
                    },
                    {
                      value: 'longitudinal',
                      label: 'Продольное G',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  'input-telemetry': {
    kind: 'input-telemetry',
    name: 'Telemetry',
    category: 'driving',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 666,
      height: 113,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'layout',
          label: 'Макет',
          groups: [
            {
              settings: [
                {
                  key: 'order.mainOrder',
                  label: 'Порядок основных элементов',
                  type: 'order',
                  items: [
                    {
                      value: 'traces',
                      label: 'Трассы',
                    },
                    {
                      value: 'speedometer',
                      label: 'Спидометр',
                    },
                    {
                      value: 'bars',
                      label: 'Полосы',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'traces',
                      visible: true,
                    },
                    {
                      id: 'speedometer',
                      visible: true,
                    },
                    {
                      id: 'bars',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'order.barOrder',
                  label: 'Порядок полос',
                  type: 'order',
                  items: [
                    {
                      value: 'throttle',
                      label: 'Газ',
                    },
                    {
                      value: 'brake',
                      label: 'Тормоз',
                    },
                    {
                      value: 'clutch',
                      label: 'Сцепление',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'throttle',
                      visible: true,
                    },
                    {
                      id: 'brake',
                      visible: true,
                    },
                    {
                      id: 'clutch',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'order.speedometerOrder',
                  label: 'Drive Readout Order',
                  type: 'order',
                  items: [
                    {
                      value: 'shiftLights',
                      label: 'Shift Lights',
                    },
                    {
                      value: 'gear',
                      label: 'Gear',
                    },
                    {
                      value: 'speed',
                      label: 'Speed',
                    },
                    {
                      value: 'units',
                      label: 'Units',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'shiftLights',
                      visible: true,
                    },
                    {
                      id: 'gear',
                      visible: true,
                    },
                    {
                      id: 'speed',
                      visible: true,
                    },
                    {
                      id: 'units',
                      visible: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'display',
          label: 'Отображение',
          groups: [
            {
              settings: [
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 0.7,
                  min: 0,
                  max: 0.95,
                  step: 0.05,
                },
              ],
            },
          ],
        },
        {
          id: 'traces',
          label: 'Трассы',
          groups: [
            {
              settings: [
                {
                  key: 'traceHistorySeconds',
                  label: 'Длина истории трасс (секунды)',
                  type: 'number',
                  default: 6.5,
                  min: 0.5,
                  max: 20,
                  step: 0.5,
                },
                {
                  key: 'order.traceLayers',
                  label: 'Слои трасс',
                  type: 'order',
                  items: [
                    {
                      value: 'brake',
                      label: 'Тормоз',
                    },
                    {
                      value: 'throttle',
                      label: 'Газ',
                    },
                    {
                      value: 'clutch',
                      label: 'Сцепление',
                    },
                    {
                      value: 'steering',
                      label: 'Руль',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'brake',
                      visible: true,
                    },
                    {
                      id: 'throttle',
                      visible: true,
                    },
                    {
                      id: 'clutch',
                      visible: true,
                    },
                    {
                      id: 'steering',
                      visible: true,
                    },
                  ],
                },
                {
                  key: 'traceThrottleWidth',
                  label: 'Ширина линии газа',
                  type: 'number',
                  default: 3,
                  min: 1,
                  max: 8,
                  step: 0.5,
                },
                {
                  key: 'traceBrakeWidth',
                  label: 'Ширина линии тормоза',
                  type: 'number',
                  default: 3,
                  min: 1,
                  max: 8,
                  step: 0.5,
                },
                {
                  key: 'traceClutchWidth',
                  label: 'Ширина линии сцепления',
                  type: 'number',
                  default: 3,
                  min: 1,
                  max: 8,
                  step: 0.5,
                },
                {
                  key: 'traceSteeringWidth',
                  label: 'Ширина линии руля',
                  type: 'number',
                  default: 1.5,
                  min: 1,
                  max: 8,
                  step: 0.5,
                },
                {
                  key: 'traceThrottleColor',
                  label: 'Цвет газа для трассы',
                  type: 'color',
                  default: '#22c55e',
                },
                {
                  key: 'traceBrakeColor',
                  label: 'Цвет тормоза для трассы',
                  type: 'color',
                  default: '#ef4444',
                },
                {
                  key: 'traceAbsColor',
                  label: 'Цвет ABS для трассы',
                  type: 'color',
                  default: '#fbff0c',
                },
                {
                  key: 'traceClutchColor',
                  label: 'Цвет сцепления для трассы',
                  type: 'color',
                  default: '#3b82f6',
                },
                {
                  key: 'traceSteeringColor',
                  label: 'Цвет руля для трассы',
                  type: 'color',
                  default: '#ffffff',
                },
                {
                  key: 'traceBrakeAbsHighlightEnabled',
                  label: 'Подсвечивать след тормоза при ABS',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
        {
          id: 'bars',
          label: 'Полосы',
          groups: [
            {
              settings: [
                {
                  key: 'barWidth',
                  label: 'Ширина полос',
                  type: 'number',
                  default: 20,
                  min: 8,
                  max: 40,
                  step: 1,
                },
                {
                  key: 'barThrottleColor',
                  label: 'Цвет газа для полос',
                  type: 'color',
                  default: '#22c55e',
                },
                {
                  key: 'barBrakeColor',
                  label: 'Цвет тормоза для полос',
                  type: 'color',
                  default: '#ef4444',
                },
                {
                  key: 'barAbsColor',
                  label: 'Цвет ABS для полос',
                  type: 'color',
                  default: '#ffffff',
                },
                {
                  key: 'barClutchColor',
                  label: 'Цвет сцепления для полос',
                  type: 'color',
                  default: '#3b82f6',
                },
              ],
            },
          ],
        },
        {
          id: 'speedometer',
          label: 'Drive Readout',
          groups: [
            {
              settings: [
                {
                  key: 'units',
                  label: 'Speed Units',
                  type: 'select',
                  default: 'kph',
                  options: [
                    {
                      value: 'kph',
                      label: 'км/ч',
                    },
                    {
                      value: 'mph',
                      label: 'миль/ч',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    orderVisibility: {
      'order.mainOrder': {
        traces: 'showTraces',
        speedometer: 'showSpeedometer',
        bars: 'showBars',
      },
      'order.barOrder': {
        throttle: 'showThrottle',
        brake: 'showBrake',
        clutch: 'showClutch',
      },
      'order.speedometerOrder': {
        shiftLights: 'showShiftLights',
        gear: 'showGear',
        speed: 'showSpeed',
        units: 'showUnits',
      },
      'order.traceLayers': {
        brake: 'showTraceBrake',
        throttle: 'showTraceThrottle',
        clutch: 'showTraceClutch',
        steering: 'showTraceSteering',
      },
    },
  },
  'rejoin-indicator': {
    kind: 'rejoin-indicator',
    name: 'Rejoin Indicator',
    category: 'awareness',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 463.1628320740401,
      height: 100,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'behavior',
          label: 'Поведение',
          groups: [
            {
              settings: [
                {
                  key: 'showAtSpeed',
                  label: 'Показывать при скорости не выше',
                  type: 'number',
                  default: 30,
                  min: 0,
                  max: 120,
                  step: 1,
                },
                {
                  key: 'careGap',
                  label: 'Безопасный интервал',
                  type: 'number',
                  default: 2,
                  min: 0.5,
                  max: 15,
                  step: 0.1,
                },
                {
                  key: 'stopGap',
                  label: 'Интервал осторожности',
                  type: 'number',
                  default: 1,
                  min: 0.3,
                  max: 10,
                  step: 0.1,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 0.74,
                  min: 0.2,
                  max: 0.95,
                  step: 0.05,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  relatives: {
    kind: 'relatives',
    name: 'Relatives',
    category: 'race',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 635.5,
      height: 440,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'header',
          label: 'Заголовок',
          groups: [
            {
              settings: [
                {
                  key: 'order.headerOrder',
                  label: 'Порядок заголовка',
                  type: 'order',
                  items: [
                    {
                      value: 'trackName',
                      label: 'Название трассы',
                    },
                    {
                      value: 'trackTemp',
                      label: 'Темп. трассы',
                    },
                    {
                      value: 'sof',
                      label: 'SOF',
                    },
                    {
                      value: 'incidents',
                      label: 'Инциденты',
                    },
                    {
                      value: 'simClock',
                      label: 'Часы симулятора',
                    },
                    {
                      value: 'sessionType',
                      label: 'Тип сессии',
                    },
                    {
                      value: 'drivers',
                      label: 'Пилоты',
                    },
                    {
                      value: 'currentLap',
                      label: 'Текущий круг',
                    },
                    {
                      value: 'timeRemaining',
                      label: 'Оставшееся время',
                    },
                    {
                      value: 'weather',
                      label: 'Погода',
                    },
                    {
                      value: 'trackWetness',
                      label: 'Влажность трассы',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'trackName',
                      visible: false,
                    },
                    {
                      id: 'trackTemp',
                      visible: false,
                    },
                    {
                      id: 'sof',
                      visible: true,
                    },
                    {
                      id: 'incidents',
                      visible: true,
                    },
                    {
                      id: 'simClock',
                      visible: true,
                    },
                    {
                      id: 'sessionType',
                      visible: false,
                    },
                    {
                      id: 'drivers',
                      visible: false,
                    },
                    {
                      id: 'currentLap',
                      visible: false,
                    },
                    {
                      id: 'timeRemaining',
                      visible: false,
                    },
                    {
                      id: 'weather',
                      visible: false,
                    },
                    {
                      id: 'trackWetness',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'headerCurrentLapDisplay',
                  label: 'Отображение',
                  type: 'select',
                  default: 'lap-only',
                  options: [
                    {
                      value: 'lap-only',
                      label: 'Lap 5',
                    },
                    {
                      value: 'lap-and-total',
                      label: '5 / 15.6 laps',
                    },
                  ],
                },
                {
                  key: 'headerTimeRemainingDisplay',
                  label: 'Источник',
                  type: 'select',
                  default: 'auto',
                  options: [
                    {
                      value: 'auto',
                      label: '12:34 or ~12:34',
                    },
                    {
                      value: 'known',
                      label: '12:34',
                    },
                    {
                      value: 'estimate',
                      label: '~12:34',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'footer',
          label: 'Нижняя панель',
          groups: [
            {
              settings: [
                {
                  key: 'order.footerOrder',
                  label: 'Порядок нижней панели',
                  type: 'order',
                  items: [
                    {
                      value: 'sessionType',
                      label: 'Тип сессии',
                    },
                    {
                      value: 'drivers',
                      label: 'Пилоты',
                    },
                    {
                      value: 'currentLap',
                      label: 'Текущий круг',
                    },
                    {
                      value: 'timeRemaining',
                      label: 'Оставшееся время',
                    },
                    {
                      value: 'trackTemp',
                      label: 'Темп. трассы',
                    },
                    {
                      value: 'sof',
                      label: 'SOF',
                    },
                    {
                      value: 'incidents',
                      label: 'Инциденты',
                    },
                    {
                      value: 'simClock',
                      label: 'Часы симулятора',
                    },
                    {
                      value: 'weather',
                      label: 'Погода',
                    },
                    {
                      value: 'trackWetness',
                      label: 'Влажность трассы',
                    },
                    {
                      value: 'trackName',
                      label: 'Название трассы',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'sessionType',
                      visible: true,
                    },
                    {
                      id: 'drivers',
                      visible: true,
                    },
                    {
                      id: 'currentLap',
                      visible: true,
                    },
                    {
                      id: 'timeRemaining',
                      visible: true,
                    },
                    {
                      id: 'trackTemp',
                      visible: false,
                    },
                    {
                      id: 'sof',
                      visible: false,
                    },
                    {
                      id: 'incidents',
                      visible: false,
                    },
                    {
                      id: 'simClock',
                      visible: false,
                    },
                    {
                      id: 'weather',
                      visible: false,
                    },
                    {
                      id: 'trackWetness',
                      visible: false,
                    },
                    {
                      id: 'trackName',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'footerCurrentLapDisplay',
                  label: 'Отображение',
                  type: 'select',
                  default: 'lap-and-total',
                  options: [
                    {
                      value: 'lap-only',
                      label: 'Lap 5',
                    },
                    {
                      value: 'lap-and-total',
                      label: '5 / 15.6 laps',
                    },
                  ],
                },
                {
                  key: 'footerTimeRemainingDisplay',
                  label: 'Источник',
                  type: 'select',
                  default: 'auto',
                  options: [
                    {
                      value: 'auto',
                      label: '12:34 or ~12:34',
                    },
                    {
                      value: 'known',
                      label: '12:34',
                    },
                    {
                      value: 'estimate',
                      label: '~12:34',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'drivers',
          label: 'Пилоты',
          groups: [
            {
              settings: [
                {
                  key: 'order.driverOrder',
                  label: 'Порядок строк',
                  type: 'order',
                  items: [
                    {
                      value: 'classPosition',
                      label: 'Поз. в классе',
                    },
                    {
                      value: 'classStripe',
                      label: 'Полоса класса',
                    },
                    {
                      value: 'carNumber',
                      label: 'Машина #',
                    },
                    {
                      value: 'name',
                      label: 'Пилот',
                    },
                    {
                      value: 'radio',
                      label: 'Голосовой чат',
                    },
                    {
                      value: 'carManufacturer',
                      label: 'Производитель',
                    },
                    {
                      value: 'license',
                      label: 'Лицензия',
                    },
                    {
                      value: 'ratingChange',
                      label: 'iRating +/-',
                    },
                    {
                      value: 'delta',
                      label: 'Отрыв',
                    },
                    {
                      value: 'compound',
                      label: 'Состав',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'classPosition',
                      visible: true,
                    },
                    {
                      id: 'classStripe',
                      visible: true,
                    },
                    {
                      id: 'carNumber',
                      visible: true,
                    },
                    {
                      id: 'name',
                      visible: true,
                    },
                    {
                      id: 'radio',
                      visible: true,
                    },
                    {
                      id: 'carManufacturer',
                      visible: true,
                    },
                    {
                      id: 'license',
                      visible: true,
                    },
                    {
                      id: 'ratingChange',
                      visible: true,
                    },
                    {
                      id: 'delta',
                      visible: true,
                    },
                    {
                      id: 'compound',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'driverNameFormat',
                  label: 'Формат имени',
                  type: 'select',
                  default: 'name-surname',
                  options: [
                    {
                      value: 'name-middlename-surname',
                      label: 'Max Emilian Verstappen',
                    },
                    {
                      value: 'name-m.-surname',
                      label: 'Max E. Verstappen',
                    },
                    {
                      value: 'name-surname',
                      label: 'Max Verstappen',
                    },
                    {
                      value: 'n.-surname',
                      label: 'M. Verstappen',
                    },
                    {
                      value: 'surname-n.',
                      label: 'Verstappen M.',
                    },
                    {
                      value: 'surname',
                      label: 'Verstappen',
                    },
                  ],
                },
                {
                  key: 'driverNameRemoveNumbers',
                  label: 'Убирать числа из имён',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverNameShowStatusBadges',
                  label: 'Значки статуса',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverNameShowTags',
                  label: 'Теги гонщиков',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverManufacturerHideIfSingleMake',
                  label: 'Скрывать в монокубке',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverBadgeFormat',
                  label: 'Формат бейджа',
                  type: 'select',
                  default: 'license-color-rating-bw',
                  options: [
                    {
                      value: 'license-color-fullrating-combo',
                      label: 'B 3.8 1412',
                    },
                    {
                      value: 'fullrating-color-no-license',
                      label: '1412',
                    },
                    {
                      value: 'rating-color-no-license',
                      label: '1.4k',
                    },
                    {
                      value: 'license-color-fullrating-bw',
                      label: 'B 3.8 | 1412',
                    },
                    {
                      value: 'license-color-rating-bw',
                      label: 'B 3.8 | 1.4k',
                    },
                    {
                      value: 'rating-only-color-rating-bw',
                      label: '3.8 | 1.4k',
                    },
                    {
                      value: 'license-color-rating-bw-no-license',
                      label: 'B | 1.4k',
                    },
                    {
                      value: 'license-bw-rating-bw',
                      label: 'B 3.8 | 1.4k',
                    },
                    {
                      value: 'rating-only-bw-rating-bw',
                      label: '3.8 | 1.4k',
                    },
                    {
                      value: 'license-bw-rating-bw-no-license',
                      label: 'B | 1.4k',
                    },
                    {
                      value: 'rating-bw-no-license',
                      label: '1.4k',
                    },
                    {
                      value: 'fullrating-bw-no-license',
                      label: '1412',
                    },
                  ],
                },
                {
                  key: 'driverDeltaDecimalPlaces',
                  label: 'Знаки после запятой',
                  type: 'select',
                  default: '2',
                  options: [
                    {
                      value: '1',
                      label: '0.0',
                    },
                    {
                      value: '2',
                      label: '0.00',
                    },
                    {
                      value: '3',
                      label: '0.000',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'display',
          label: 'Отображение',
          groups: [
            {
              settings: [
                {
                  key: 'showFooter',
                  label: 'Показывать нижнюю панель',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'livePositions',
                  label: 'Использовать живые позиции',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'alignment',
                  label: 'Выравнивание',
                  type: 'select',
                  default: 'bottom',
                  options: [
                    {
                      value: 'top',
                      label: 'Сверху',
                    },
                    {
                      value: 'bottom',
                      label: 'Снизу',
                    },
                  ],
                },
                {
                  key: 'compact',
                  label: 'Компактный',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'scale',
                  label: 'Масштаб',
                  description: 'Узкое или низкое окно уменьшает доску ещё сильнее.',
                  type: 'number',
                  default: 100,
                  min: 50,
                  max: 200,
                  step: 5,
                  unit: '%',
                },
                {
                  key: 'showFlagFrame',
                  label: 'Рамка флага сессии',
                  description: 'Рамка цвета флага: жёлтый, синий, белый, клетчатый и другие.',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 0.7,
                  min: 0.2,
                  max: 0.95,
                  step: 0.05,
                },
              ],
            },
          ],
        },
      ],
    },
    orderVisibility: {
      'order.headerOrder': {
        trackName: 'trackName',
        trackTemp: 'trackTemp',
        sof: 'sof',
        incidents: 'incidents',
        simClock: 'simClock',
        sessionType: 'sessionType',
        drivers: 'drivers',
        currentLap: 'currentLap',
        timeRemaining: 'timeRemaining',
        weather: 'weather',
        trackWetness: 'trackWetness',
      },
      'order.footerOrder': {
        sessionType: 'footerSessionType',
        drivers: 'footerDrivers',
        currentLap: 'footerCurrentLap',
        timeRemaining: 'footerTimeRemaining',
        trackTemp: 'footerTrackTemp',
        sof: 'footerSof',
        incidents: 'footerIncidents',
        simClock: 'footerSimClock',
        weather: 'footerWeather',
        trackWetness: 'footerTrackWetness',
        trackName: 'footerTrackName',
      },
      'order.driverOrder': {
        classPosition: 'classPosition',
        classStripe: 'classStripe',
        carNumber: 'carNumber',
        name: 'name',
        radio: 'radio',
        carManufacturer: 'carManufacturer',
        license: 'license',
        ratingChange: 'ratingChange',
        delta: 'delta',
        compound: 'compound',
      },
    },
  },
  'stage-delta': {
    kind: 'stage-delta',
    name: 'Stage Delta',
    category: 'timing',
    defaultBounds: {
      x: 1020,
      y: 1500,
      width: 520,
      height: 190,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'display',
          label: 'Display',
          groups: [
            {
              settings: [
                {
                  key: 'showStage',
                  label: 'Show stage delta',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showSector',
                  label: 'Show sector delta',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showSectorResult',
                  label: 'Show the result of the last sector',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'stageTextPosition',
                  label: 'Stage delta text',
                  type: 'select',
                  default: 'above',
                  options: [
                    {
                      value: 'above',
                      label: 'Above the bar',
                    },
                    {
                      value: 'below',
                      label: 'Below the bar',
                    },
                  ],
                },
                {
                  key: 'sectorTextPosition',
                  label: 'Sector delta text',
                  type: 'select',
                  default: 'below',
                  options: [
                    {
                      value: 'above',
                      label: 'Above the bar',
                    },
                    {
                      value: 'below',
                      label: 'Below the bar',
                    },
                  ],
                },
                {
                  key: 'decimalPlaces',
                  label: 'Decimal places',
                  type: 'number',
                  default: 2,
                  min: 1,
                  max: 3,
                  step: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'style',
          label: 'Style',
          groups: [
            {
              settings: [
                {
                  key: 'deltaBarRangeSeconds',
                  label: 'Delta bar range, seconds',
                  type: 'number',
                  default: 2,
                  min: 0.1,
                  max: 10,
                  step: 0.1,
                },
                {
                  key: 'barThickness',
                  label: 'Bar thickness, px',
                  type: 'number',
                  default: 12,
                  min: 4,
                  max: 32,
                  step: 1,
                },
                {
                  key: 'textScale',
                  label: 'Text size, %',
                  type: 'number',
                  default: 100,
                  min: 50,
                  max: 200,
                  step: 5,
                },
                {
                  key: 'fasterColor',
                  label: 'Faster colour',
                  type: 'color',
                  default: '#36d67e',
                },
                {
                  key: 'slowerColor',
                  label: 'Slower colour',
                  type: 'color',
                  default: '#ff5a4f',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  standings: {
    kind: 'standings',
    name: 'Standings',
    category: 'race',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 959,
      height: 420,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'header',
          label: 'Заголовок',
          groups: [
            {
              settings: [
                {
                  key: 'showHeader',
                  label: 'Показывать заголовок',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'order.headerOrder',
                  label: 'Порядок заголовка',
                  type: 'order',
                  items: [
                    {
                      value: 'trackName',
                      label: 'Название трассы',
                    },
                    {
                      value: 'sessionType',
                      label: 'Тип сессии',
                    },
                    {
                      value: 'drivers',
                      label: 'Пилоты',
                    },
                    {
                      value: 'trackWetness',
                      label: 'Влажность трассы',
                    },
                    {
                      value: 'sof',
                      label: 'SOF',
                    },
                    {
                      value: 'incidents',
                      label: 'Инциденты',
                    },
                    {
                      value: 'sessionClock',
                      label: 'Часы сессии',
                    },
                    {
                      value: 'sessionProgress',
                      label: 'Прогресс сессии',
                    },
                    {
                      value: 'currentLap',
                      label: 'Текущий круг',
                    },
                    {
                      value: 'timeRemaining',
                      label: 'Оставшееся время',
                    },
                    {
                      value: 'trackTemp',
                      label: 'Темп. трассы',
                    },
                    {
                      value: 'airTemp',
                      label: 'Темп. воздуха',
                    },
                    {
                      value: 'simClock',
                      label: 'Часы симулятора',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'trackName',
                      visible: false,
                    },
                    {
                      id: 'sessionType',
                      visible: true,
                    },
                    {
                      id: 'drivers',
                      visible: true,
                    },
                    {
                      id: 'trackWetness',
                      visible: false,
                    },
                    {
                      id: 'sof',
                      visible: true,
                    },
                    {
                      id: 'incidents',
                      visible: false,
                    },
                    {
                      id: 'sessionClock',
                      visible: false,
                    },
                    {
                      id: 'sessionProgress',
                      visible: false,
                    },
                    {
                      id: 'currentLap',
                      visible: false,
                    },
                    {
                      id: 'timeRemaining',
                      visible: true,
                    },
                    {
                      id: 'trackTemp',
                      visible: false,
                    },
                    {
                      id: 'airTemp',
                      visible: false,
                    },
                    {
                      id: 'simClock',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'headerCurrentLapDisplay',
                  label: 'Отображение',
                  type: 'select',
                  default: 'lap-only',
                  options: [
                    {
                      value: 'lap-only',
                      label: 'Lap 5',
                    },
                    {
                      value: 'lap-and-total',
                      label: '5 / 15.6 laps',
                    },
                  ],
                },
                {
                  key: 'headerTimeRemainingDisplay',
                  label: 'Источник',
                  type: 'select',
                  default: 'auto',
                  options: [
                    {
                      value: 'auto',
                      label: '12:34 or ~12:34',
                    },
                    {
                      value: 'known',
                      label: '12:34',
                    },
                    {
                      value: 'estimate',
                      label: '~12:34',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'footer',
          label: 'Нижняя панель',
          groups: [
            {
              settings: [
                {
                  key: 'showFooter',
                  label: 'Показывать нижнюю панель',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'order.footerOrder',
                  label: 'Порядок нижней панели',
                  type: 'order',
                  items: [
                    {
                      value: 'trackName',
                      label: 'Название трассы',
                    },
                    {
                      value: 'airTemp',
                      label: 'Темп. воздуха',
                    },
                    {
                      value: 'trackWetness',
                      label: 'Влажность трассы',
                    },
                    {
                      value: 'currentLap',
                      label: 'Текущий круг',
                    },
                    {
                      value: 'drivers',
                      label: 'Пилоты',
                    },
                    {
                      value: 'incidents',
                      label: 'Инциденты',
                    },
                    {
                      value: 'sessionClock',
                      label: 'Часы сессии',
                    },
                    {
                      value: 'sessionProgress',
                      label: 'Прогресс сессии',
                    },
                    {
                      value: 'sof',
                      label: 'SOF',
                    },
                    {
                      value: 'trackTemp',
                      label: 'Темп. трассы',
                    },
                    {
                      value: 'timeRemaining',
                      label: 'Оставшееся время',
                    },
                    {
                      value: 'simClock',
                      label: 'Часы симулятора',
                    },
                    {
                      value: 'sessionType',
                      label: 'Тип сессии',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'trackName',
                      visible: true,
                    },
                    {
                      id: 'airTemp',
                      visible: true,
                    },
                    {
                      id: 'trackWetness',
                      visible: true,
                    },
                    {
                      id: 'currentLap',
                      visible: true,
                    },
                    {
                      id: 'drivers',
                      visible: false,
                    },
                    {
                      id: 'incidents',
                      visible: false,
                    },
                    {
                      id: 'sessionClock',
                      visible: false,
                    },
                    {
                      id: 'sessionProgress',
                      visible: false,
                    },
                    {
                      id: 'sof',
                      visible: false,
                    },
                    {
                      id: 'trackTemp',
                      visible: false,
                    },
                    {
                      id: 'timeRemaining',
                      visible: false,
                    },
                    {
                      id: 'simClock',
                      visible: false,
                    },
                    {
                      id: 'sessionType',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'footerCurrentLapDisplay',
                  label: 'Отображение',
                  type: 'select',
                  default: 'lap-and-total',
                  options: [
                    {
                      value: 'lap-only',
                      label: 'Lap 5',
                    },
                    {
                      value: 'lap-and-total',
                      label: '5 / 15.6 laps',
                    },
                  ],
                },
                {
                  key: 'footerTimeRemainingDisplay',
                  label: 'Источник',
                  type: 'select',
                  default: 'auto',
                  options: [
                    {
                      value: 'auto',
                      label: '12:34 or ~12:34',
                    },
                    {
                      value: 'known',
                      label: '12:34',
                    },
                    {
                      value: 'estimate',
                      label: '~12:34',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'drivers',
          label: 'Пилоты',
          groups: [
            {
              settings: [
                {
                  key: 'topPerClass',
                  label: 'Топ по классу',
                  type: 'number',
                  default: 3,
                  min: 1,
                  max: 12,
                  step: 1,
                },
                {
                  key: 'showAllClasses',
                  label: 'Показывать все классы',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'pinTopInFocusedClass',
                  label: 'Всегда показывать лучших пилотов моего класса',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'livePositions',
                  label: 'Использовать живые позиции',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'positionChangeAnimation',
                  label: 'Анимация смены позиции',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'order.driverOrder',
                  label: 'Порядок пилотов',
                  type: 'order',
                  items: [
                    {
                      value: 'position',
                      label: 'Позиция',
                    },
                    {
                      value: 'positionChange',
                      label: 'Поз +/-',
                    },
                    {
                      value: 'classStripe',
                      label: 'Полоса класса',
                    },
                    {
                      value: 'carNumber',
                      label: 'Машина #',
                    },
                    {
                      value: 'name',
                      label: 'Пилот',
                    },
                    {
                      value: 'radio',
                      label: 'Голосовой чат',
                    },
                    {
                      value: 'carManufacturer',
                      label: 'Производитель',
                    },
                    {
                      value: 'license',
                      label: 'Лицензия',
                    },
                    {
                      value: 'ratingChange',
                      label: 'iRating +/-',
                    },
                    {
                      value: 'stint',
                      label: 'Стинт',
                    },
                    {
                      value: 'delta',
                      label: 'Отставание по лучшему кругу',
                    },
                    {
                      value: 'bestLapInterval',
                      label: 'Интервал по лучшему кругу',
                    },
                    {
                      value: 'bestLapTime',
                      label: 'Лучший круг',
                    },
                    {
                      value: 'lastLapTime',
                      label: 'Последний круг',
                    },
                    {
                      value: 'compound',
                      label: 'Состав',
                    },
                    {
                      value: 'gap',
                      label: 'Отставание от лидера',
                    },
                    {
                      value: 'interval',
                      label: 'Интервал до гонщика впереди',
                    },
                    {
                      value: 'status',
                      label: 'Статус',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'position',
                      visible: true,
                    },
                    {
                      id: 'positionChange',
                      visible: true,
                    },
                    {
                      id: 'classStripe',
                      visible: true,
                    },
                    {
                      id: 'carNumber',
                      visible: true,
                    },
                    {
                      id: 'name',
                      visible: true,
                    },
                    {
                      id: 'radio',
                      visible: true,
                    },
                    {
                      id: 'carManufacturer',
                      visible: true,
                    },
                    {
                      id: 'license',
                      visible: true,
                    },
                    {
                      id: 'ratingChange',
                      visible: true,
                    },
                    {
                      id: 'stint',
                      visible: true,
                    },
                    {
                      id: 'delta',
                      visible: true,
                    },
                    {
                      id: 'bestLapInterval',
                      visible: true,
                    },
                    {
                      id: 'bestLapTime',
                      visible: true,
                    },
                    {
                      id: 'lastLapTime',
                      visible: true,
                    },
                    {
                      id: 'compound',
                      visible: true,
                    },
                    {
                      id: 'gap',
                      visible: true,
                    },
                    {
                      id: 'interval',
                      visible: true,
                    },
                    {
                      id: 'status',
                      visible: false,
                    },
                  ],
                },
                {
                  key: 'driverNameFormat',
                  label: 'Формат имени',
                  type: 'select',
                  default: 'name-surname',
                  options: [
                    {
                      value: 'name-middlename-surname',
                      label: 'Max Emilian Verstappen',
                    },
                    {
                      value: 'name-m.-surname',
                      label: 'Max E. Verstappen',
                    },
                    {
                      value: 'name-surname',
                      label: 'Max Verstappen',
                    },
                    {
                      value: 'n.-surname',
                      label: 'M. Verstappen',
                    },
                    {
                      value: 'surname-n.',
                      label: 'Verstappen M.',
                    },
                    {
                      value: 'surname',
                      label: 'Verstappen',
                    },
                  ],
                },
                {
                  key: 'driverNameRemoveNumbers',
                  label: 'Убирать числа из имён',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverNameShowStatusBadges',
                  label: 'Значки статуса',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverNameShowTags',
                  label: 'Теги гонщиков',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverManufacturerHideIfSingleMake',
                  label: 'Скрывать в монокубке',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverBadgeFormat',
                  label: 'Формат бейджа',
                  type: 'select',
                  default: 'license-color-rating-bw',
                  options: [
                    {
                      value: 'license-color-fullrating-combo',
                      label: 'B 3.8 1412',
                    },
                    {
                      value: 'fullrating-color-no-license',
                      label: '1412',
                    },
                    {
                      value: 'rating-color-no-license',
                      label: '1.4k',
                    },
                    {
                      value: 'license-color-fullrating-bw',
                      label: 'B 3.8 | 1412',
                    },
                    {
                      value: 'license-color-rating-bw',
                      label: 'B 3.8 | 1.4k',
                    },
                    {
                      value: 'rating-only-color-rating-bw',
                      label: '3.8 | 1.4k',
                    },
                    {
                      value: 'license-color-rating-bw-no-license',
                      label: 'B | 1.4k',
                    },
                    {
                      value: 'license-bw-rating-bw',
                      label: 'B 3.8 | 1.4k',
                    },
                    {
                      value: 'rating-only-bw-rating-bw',
                      label: '3.8 | 1.4k',
                    },
                    {
                      value: 'license-bw-rating-bw-no-license',
                      label: 'B | 1.4k',
                    },
                    {
                      value: 'rating-bw-no-license',
                      label: '1.4k',
                    },
                    {
                      value: 'fullrating-bw-no-license',
                      label: '1412',
                    },
                  ],
                },
                {
                  key: 'driverDeltaDecimalPlaces',
                  label: 'Знаков после запятой',
                  type: 'select',
                  default: '2',
                  options: [
                    {
                      value: '1',
                      label: '0.0',
                    },
                    {
                      value: '2',
                      label: '0.00',
                    },
                    {
                      value: '3',
                      label: '0.000',
                    },
                  ],
                },
                {
                  key: 'driverDeltaShowWhenPractice',
                  label: 'Показывать в практике',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverDeltaShowWhenOpenQualify',
                  label: 'Показывать в открытой квалификации',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverDeltaShowWhenLoneQualify',
                  label: 'Показывать в одиночной квалификации',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverDeltaShowWhenRace',
                  label: 'Показывать в гонке',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverDeltaShowWhenOfflineTesting',
                  label: 'Показывать в офлайн-тестах',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverBestLapIntervalDecimalPlaces',
                  label: 'Знаков после запятой',
                  type: 'select',
                  default: '2',
                  options: [
                    {
                      value: '1',
                      label: '0.0',
                    },
                    {
                      value: '2',
                      label: '0.00',
                    },
                    {
                      value: '3',
                      label: '0.000',
                    },
                  ],
                },
                {
                  key: 'driverBestLapIntervalShowWhenPractice',
                  label: 'Показывать в практике',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverBestLapIntervalShowWhenOpenQualify',
                  label: 'Показывать в открытой квалификации',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverBestLapIntervalShowWhenLoneQualify',
                  label: 'Показывать в одиночной квалификации',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverBestLapIntervalShowWhenRace',
                  label: 'Показывать в гонке',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverBestLapIntervalShowWhenOfflineTesting',
                  label: 'Показывать в офлайн-тестах',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'bestLapTimeFormat',
                  label: 'Формат времени',
                  type: 'select',
                  default: 'full',
                  options: [
                    {
                      value: 'full',
                      label: '1:42.123',
                    },
                    {
                      value: 'mixed',
                      label: '1:42.1',
                    },
                    {
                      value: 'minutes',
                      label: '1:42',
                    },
                    {
                      value: 'seconds-full',
                      label: '42.123',
                    },
                    {
                      value: 'seconds-mixed',
                      label: '42.1',
                    },
                    {
                      value: 'seconds',
                      label: '42',
                    },
                  ],
                },
                {
                  key: 'lastLapTimeFormat',
                  label: 'Формат времени',
                  type: 'select',
                  default: 'full',
                  options: [
                    {
                      value: 'full',
                      label: '1:42.123',
                    },
                    {
                      value: 'mixed',
                      label: '1:42.1',
                    },
                    {
                      value: 'minutes',
                      label: '1:42',
                    },
                    {
                      value: 'seconds-full',
                      label: '42.123',
                    },
                    {
                      value: 'seconds-mixed',
                      label: '42.1',
                    },
                    {
                      value: 'seconds',
                      label: '42',
                    },
                  ],
                },
                {
                  key: 'driverGapShowWhenPractice',
                  label: 'Показывать в практике',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverGapShowWhenOpenQualify',
                  label: 'Показывать в открытой квалификации',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverGapShowWhenLoneQualify',
                  label: 'Показывать в одиночной квалификации',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverGapShowWhenRace',
                  label: 'Показывать в гонке',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverGapShowWhenOfflineTesting',
                  label: 'Показывать в офлайн-тестах',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverIntervalShowWhenPractice',
                  label: 'Показывать в практике',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverIntervalShowWhenOpenQualify',
                  label: 'Показывать в открытой квалификации',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverIntervalShowWhenLoneQualify',
                  label: 'Показывать в одиночной квалификации',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverIntervalShowWhenRace',
                  label: 'Показывать в гонке',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverIntervalShowWhenOfflineTesting',
                  label: 'Показывать в офлайн-тестах',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'driverIntervalTrendColoringEnabled',
                  label: 'Цвета тенденции',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'driverIntervalTrendLookbackSeconds',
                  label: 'Секунд для сравнения',
                  type: 'number',
                  default: 15,
                  min: 1,
                  max: 60,
                  step: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'alignment',
                  label: 'Выравнивание',
                  type: 'select',
                  default: 'top',
                  options: [
                    {
                      value: 'top',
                      label: 'Сверху',
                    },
                    {
                      value: 'bottom',
                      label: 'Снизу',
                    },
                  ],
                },
                {
                  key: 'compact',
                  label: 'Компактный',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'scale',
                  label: 'Масштаб',
                  description: 'Узкое или низкое окно уменьшает доску ещё сильнее.',
                  type: 'number',
                  default: 100,
                  min: 50,
                  max: 200,
                  step: 5,
                  unit: '%',
                },
                {
                  key: 'showFlagFrame',
                  label: 'Рамка флага сессии',
                  description: 'Рамка цвета флага: жёлтый, синий, белый, клетчатый и другие.',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 0.7,
                  min: 0.2,
                  max: 0.95,
                  step: 0.05,
                },
                {
                  key: 'fastestLapTextColor',
                  label: 'Цвет лучшего круга класса',
                  type: 'color',
                  default: '#a855f7',
                },
                {
                  key: 'personalBestTextColor',
                  label: 'Цвет личного лучшего круга',
                  type: 'color',
                  default: '#22c55e',
                },
              ],
            },
          ],
        },
      ],
    },
    orderVisibility: {
      'order.headerOrder': {
        trackName: 'trackName',
        sessionType: 'sessionType',
        drivers: 'drivers',
        trackWetness: 'trackWetness',
        sof: 'sof',
        incidents: 'incidents',
        sessionClock: 'sessionClock',
        sessionProgress: 'sessionProgress',
        currentLap: 'currentLap',
        timeRemaining: 'timeRemaining',
        trackTemp: 'trackTemp',
        airTemp: 'airTemp',
        simClock: 'simClock',
      },
      'order.footerOrder': {
        trackName: 'footerTrackName',
        airTemp: 'footerAirTemp',
        trackWetness: 'footerTrackWetness',
        currentLap: 'footerCurrentLap',
        drivers: 'footerDrivers',
        incidents: 'footerIncidents',
        sessionClock: 'footerSessionClock',
        sessionProgress: 'footerSessionProgress',
        sof: 'footerSof',
        trackTemp: 'footerTrackTemp',
        timeRemaining: 'footerTimeRemaining',
        simClock: 'footerSimClock',
        sessionType: 'footerSessionType',
      },
      'order.driverOrder': {
        position: 'position',
        positionChange: 'positionChange',
        classStripe: 'classStripe',
        carNumber: 'carNumber',
        name: 'name',
        radio: 'radio',
        carManufacturer: 'carManufacturer',
        license: 'license',
        ratingChange: 'ratingChange',
        stint: 'stint',
        delta: 'delta',
        bestLapInterval: 'bestLapInterval',
        bestLapTime: 'bestLapTime',
        lastLapTime: 'lastLapTime',
        compound: 'compound',
        gap: 'gap',
        interval: 'interval',
        status: 'status',
      },
    },
  },
  'track-map': {
    kind: 'track-map',
    name: 'Track Map',
    category: 'awareness',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 533,
      height: 325,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'general',
          label: 'ÐžÐ±Ñ‰ÐµÐµ',
          groups: [
            {
              settings: [
                {
                  key: 'enableTurnNames',
                  label: 'Ð’ÐºÐ»ÑŽÑ‡Ð¸Ñ‚ÑŒ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ñ Ð¿Ð¾Ð²Ð¾Ñ€Ð¾Ñ‚Ð¾Ð²',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'showCarNumbers',
                  label: 'ÐŸÐ¾ÐºÐ°Ð·Ñ‹Ð²Ð°Ñ‚ÑŒ Ð½Ð¾Ð¼ÐµÑ€Ð° Ð¼Ð°ÑˆÐ¸Ð½',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'colorByDriverTag',
                  label: 'Цвет гонщика по тегу',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'displayMode',
                  label: 'Ð ÐµÐ¶Ð¸Ð¼ Ð¾Ñ‚Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ñ',
                  type: 'select',
                  default: 'carNumber',
                  options: [
                    {
                      value: 'carNumber',
                      label: 'ÐÐ¾Ð¼ÐµÑ€ Ð¼Ð°ÑˆÐ¸Ð½Ñ‹',
                    },
                    {
                      value: 'sessionPosition',
                      label: 'ÐŸÐ¾Ð·Ð¸Ñ†Ð¸Ñ Ð² ÑÐµÑÑÐ¸Ð¸',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'markers',
          label: 'ÐœÐ°Ñ€ÐºÐµÑ€Ñ‹',
          groups: [
            {
              settings: [
                {
                  key: 'driverCircleSize',
                  label: 'Ð Ð°Ð·Ð¼ÐµÑ€ ÐºÑ€ÑƒÐ¶ÐºÐ¾Ð² Ð¿Ð¸Ð»Ð¾Ñ‚Ð¾Ð²',
                  type: 'number',
                  default: 44,
                  min: 10,
                  max: 100,
                  step: 1,
                },
                {
                  key: 'playerCircleSize',
                  label: 'Ð Ð°Ð·Ð¼ÐµÑ€ ÐºÑ€ÑƒÐ³Ð° Ð¸Ð³Ñ€Ð¾ÐºÐ°',
                  type: 'number',
                  default: 43,
                  min: 10,
                  max: 100,
                  step: 1,
                },
              ],
            },
          ],
        },
        {
          id: 'track',
          label: 'Ð¢Ñ€Ð°ÑÑÐ°',
          groups: [
            {
              settings: [
                {
                  key: 'invertTrackColors',
                  label: 'Ð˜Ð½Ð²ÐµÑ€Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ñ†Ð²ÐµÑ‚Ð° Ñ‚Ñ€Ð°ÑÑÑ‹',
                  type: 'boolean',
                  default: false,
                },
                {
                  key: 'trackOutlineWidth',
                  label: 'Ð¨Ð¸Ñ€Ð¸Ð½Ð° ÐºÐ¾Ð½Ñ‚ÑƒÑ€Ð° Ñ‚Ñ€Ð°ÑÑÑ‹',
                  type: 'number',
                  default: 25,
                  min: 1,
                  max: 30,
                  step: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  },
  weather: {
    kind: 'weather',
    name: 'Weather',
    category: 'weather',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 320,
      height: 420,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'layout',
          label: 'Макет',
          groups: [
            {
              settings: [
                {
                  key: 'order.elementOrder',
                  label: 'Порядок элементов',
                  type: 'order',
                  items: [
                    {
                      value: 'trackTemp',
                      label: 'Температура трассы',
                    },
                    {
                      value: 'airTemp',
                      label: 'Температура воздуха',
                    },
                    {
                      value: 'wind',
                      label: 'Ветер',
                    },
                    {
                      value: 'humidity',
                      label: 'Влажность',
                    },
                    {
                      value: 'wetness',
                      label: 'Мокрость',
                    },
                    {
                      value: 'trackState',
                      label: 'Состояние трассы',
                    },
                  ],
                  hideable: true,
                  default: [
                    {
                      id: 'trackTemp',
                      visible: true,
                    },
                    {
                      id: 'airTemp',
                      visible: true,
                    },
                    {
                      id: 'wind',
                      visible: true,
                    },
                    {
                      id: 'humidity',
                      visible: true,
                    },
                    {
                      id: 'wetness',
                      visible: true,
                    },
                    {
                      id: 'trackState',
                      visible: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'display',
          label: 'Отображение',
          groups: [
            {
              settings: [
                {
                  key: 'units',
                  label: 'Единицы температуры',
                  type: 'select',
                  default: 'auto',
                  options: [
                    {
                      value: 'auto',
                      label: 'Авто',
                    },
                    {
                      value: 'Metric',
                      label: 'Цельсий',
                    },
                    {
                      value: 'Imperial',
                      label: 'Фаренгейт',
                    },
                  ],
                },
                {
                  key: 'showOnlyWhenOnTrack',
                  label: 'Показывать только на трассе',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'practiceVisibility',
                  label: 'Практика',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'openQualifyVisibility',
                  label: 'Открытая квалификация',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'loneQualifyVisibility',
                  label: 'Одиночная квалификация',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'raceVisibility',
                  label: 'Гонка',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'offlineTestingVisibility',
                  label: 'Оффлайн-тест',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'backgroundOpacity',
                  label: 'Прозрачность фона',
                  type: 'number',
                  default: 0.7,
                  min: 0.2,
                  max: 0.95,
                  step: 0.05,
                },
              ],
            },
          ],
        },
      ],
    },
    orderVisibility: {
      'order.elementOrder': {
        trackTemp: 'trackTemp',
        airTemp: 'airTemp',
        wind: 'wind',
        humidity: 'humidity',
        wetness: 'wetness',
        trackState: 'trackState',
      },
    },
  },
  'twitch-chat': {
    kind: 'twitch-chat',
    name: 'Twitch Chat',
    category: 'other',
    defaultBounds: {
      x: 40,
      y: 640,
      width: 380,
      height: 320,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'chat',
          label: 'Чат',
          groups: [
            {
              settings: [
                {
                  key: 'channel',
                  label: 'Канал Twitch',
                  description:
                    'Имя канала, как в ссылке twitch.tv/<канал>. Racelink читает чат без входа в Twitch.',
                  type: 'text',
                  default: '',
                  maxLength: 25,
                },
                {
                  key: 'maxMessages',
                  label: 'Сообщений на экране',
                  description: 'Не больше, чем помещается в окно оверлея.',
                  type: 'number',
                  default: 50,
                  min: 1,
                  max: 50,
                  step: 1,
                },
                {
                  key: 'hideAfterSeconds',
                  label: 'Скрывать сообщение через',
                  description: '0 — не скрывать.',
                  type: 'number',
                  default: 0,
                  min: 0,
                  max: 600,
                  step: 5,
                  unit: 'с',
                },
                {
                  key: 'messagesAt',
                  label: 'Расположение сообщений',
                  type: 'select',
                  default: 'bottom',
                  options: [
                    { value: 'bottom', label: 'Снизу: новые внизу, как в Twitch' },
                    { value: 'top', label: 'Сверху: новые вверху' },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'header',
          label: 'Шапка',
          groups: [
            {
              settings: [
                {
                  key: 'headerAt',
                  label: 'Шапка с каналом и метриками',
                  type: 'select',
                  default: 'off',
                  options: [
                    { value: 'top', label: 'Сверху' },
                    { value: 'bottom', label: 'Снизу' },
                    { value: 'off', label: 'Не показывать' },
                  ],
                },
                {
                  key: 'showRate',
                  label: 'Сообщений в минуту',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showChatters',
                  label: 'Сколько людей пишет',
                  description: 'Разные авторы среди последних сообщений.',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showModes',
                  label: 'Режимы чата',
                  description: 'Медленный режим, только фолловеры, подписчики или смайлы.',
                  type: 'boolean',
                  default: true,
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'fontSize',
                  label: 'Размер текста',
                  type: 'number',
                  default: 15,
                  min: 10,
                  max: 32,
                  step: 1,
                  unit: 'px',
                },
                {
                  key: 'showBadges',
                  label: 'Значки (модератор, VIP, подписчик)',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'showEmotes',
                  label: 'Смайлы Twitch картинками',
                  type: 'boolean',
                  default: true,
                },
                {
                  key: 'textColor',
                  label: 'Цвет текста',
                  type: 'color',
                  default: '#f4f4f5',
                },
                {
                  key: 'backgroundColor',
                  label: 'Фон сообщения',
                  type: 'color',
                  default: '#0e1114b3',
                },
              ],
            },
          ],
        },
      ],
    },
  },
  wind: {
    kind: 'wind',
    name: 'Wind',
    category: 'weather',
    defaultBounds: {
      x: 40,
      y: 80,
      width: 120,
      height: 121,
    },
    defaultEnabled: false,
    settings: {
      pages: [
        {
          id: 'display',
          label: 'Отображение',
          groups: [
            {
              settings: [
                {
                  key: 'units',
                  label: 'Единицы скорости',
                  type: 'select',
                  default: 'auto',
                  options: [
                    {
                      value: 'auto',
                      label: 'Авто',
                    },
                    {
                      value: 'Metric',
                      label: 'км/ч',
                    },
                    {
                      value: 'Imperial',
                      label: 'миль/ч',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'appearance',
          label: 'Внешний вид',
          groups: [
            {
              settings: [
                {
                  key: 'textColor',
                  label: 'Цвет текста',
                  type: 'color',
                  default: '#e2e8f0',
                },
                {
                  key: 'accentColor',
                  label: 'Акцентный цвет',
                  type: 'color',
                  default: '#38a2ff',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

export const overlayCatalog: Readonly<Record<OverlayKind, OverlayDefinition>> = {
  ...plainCatalog,
  ...rCatalog,
  ...nfsmwCatalog,
  ...dotaCatalog,
  'standings-pro': buildStandingsPro(plainCatalog.standings),
  'relatives-pro': buildRelativesPro(plainCatalog.relatives),
};

export const isOverlayKind = (value: unknown): value is OverlayKind =>
  typeof value === 'string' && Object.hasOwn(overlayCatalog, value);
