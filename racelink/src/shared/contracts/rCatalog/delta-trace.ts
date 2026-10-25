import type { SelectOption } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rFontFamilies, rFontWeights } from './common.js';
import { choice, slider, tint, toggle, type RowDefaults } from './rowPages.js';
import { widgetBarGroups } from './widgets.js';

const option = (value: string, label: string): SelectOption => ({ value, label });

/** Laps the trace is measured against. */
export const deltaTraceTargets = [
  'personalBestLap',
  'personalSessionBestLap',
  'personalLastLap',
] as const;
export const deltaTraceCursorStyles = ['LINE', 'DOT', 'PLAYHEAD', 'CHEVRON', 'CROSSHAIR'] as const;
export const deltaTraceAxisStyles = ['SOLID', 'DASHED', 'DOTTED', 'NONE'] as const;
export const deltaTraceLineStyles = ['SOLID', 'DASHED', 'DOTTED'] as const;
export const deltaTraceBarThemes = ['GRADIENT', 'SIMPLE', 'BARS', 'HEATMAP', 'MINIMAL'] as const;
export const deltaTracePanelPositions = ['RIGHT', 'LEFT', 'TOP', 'BOTTOM'] as const;
export const deltaTraceSectionModes = [
  'TURN_AND_STRAIGHT',
  'TURNS_ONLY',
  'PER_SEGMENT',
  'SECTORS',
] as const;

const defaults: RowDefaults = {};
const ghost = { visibleIf: { ghostMode: 'PERSONAL_LAST' } };
const sections = { visibleIf: { showSectionDeltas: true } };
const weakSpot = { visibleIf: { showWeakSpot: true } };
const weakSpotMap = { visibleIf: { showWeakSpot: true, showWeakSpotMiniMap: true } };
const turnLimits = { visibleIf: { showTurnLimits: true } };
const turnNumbers = { visibleIf: { showTurnMarkers: true } };

/** Delta Trace: the live delta along the lap, a ghost of the last lap, turn and sector deltas and the weak spot. */
export const rDeltaTrace: OverlayDefinition = {
  kind: 'r-delta-trace',
  name: 'R-Delta Trace',
  category: 'timing',
  defaultBounds: { x: 40, y: 80, width: 700, height: 170 },
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
                [option('LUMINA', 'Lumina'), option('CLASSIC', 'Classic')],
                'LUMINA',
              ),
              // The overlay scales with its window: no size setting.
              slider(defaults, 'Opacity', 'Непрозрачность', 0.8, 0, 1, 0.05),
              choice(defaults, 'FontFamily', 'Шрифт', rFontFamilies, 'Montserrat'),
              choice(defaults, 'FontWeight', 'Толщина', rFontWeights, 'Semibold'),
            ],
          },
        ],
      },
      {
        id: 'target',
        label: 'Target Mode',
        groups: [
          {
            settings: [
              choice(
                defaults,
                'targetMode',
                'Режим',
                [
                  option('personalBestLap', 'Личный лучший'),
                  option('personalSessionBestLap', 'Лучший в сессии'),
                  option('personalLastLap', 'Прошлый круг'),
                ],
                'personalBestLap',
                {
                  description: 'Целевой круг, с которым сравнивается текущий по всей длине круга.',
                },
              ),
            ],
          },
        ],
      },
      {
        id: 'live',
        label: 'Live Trace',
        groups: [
          {
            label: 'Индикаторы',
            settings: [
              toggle(defaults, 'showDeltaValue', 'Значение дельты', true),
              toggle(defaults, 'showModeIndicator', 'Target Mode', true),
              toggle(defaults, 'showReferenceLapTime', 'Время целевого круга', true),
            ],
          },
          {
            label: 'Границы следа',
            settings: [
              slider(
                defaults,
                'histogramMinSpread',
                'Минимальный диапазон (сек)',
                1,
                0.1,
                10,
                0.1,
                {
                  description: 'Минимальный вертикальный диапазон следа в секундах.',
                },
              ),
              slider(
                defaults,
                'histogramMaxSpread',
                'Максимальный диапазон (сек)',
                10,
                0.5,
                30,
                0.5,
                {
                  description: 'Максимальный вертикальный диапазон следа в секундах.',
                },
              ),
              slider(
                defaults,
                'lapResetDelaySeconds',
                'Задержка сброса круга (сек)',
                3,
                0,
                15,
                0.5,
                {
                  description:
                    'Сколько секунд после пересечения линии старт/финиш держать след завершённого круга.',
                },
              ),
              tint(defaults, 'histogramBackgroundColor', 'Цвет фона', '#000000'),
            ],
          },
          {
            label: 'Линия следа',
            settings: [
              toggle(defaults, 'histogramAreaFill', 'Заливка области', true),
              slider(defaults, 'histogramLineWidth', 'Толщина линии (px)', 1, 0.5, 6, 0.5),
              tint(defaults, 'histogramLineColorPositive', 'Цвет потерь', '#D40000'),
              tint(defaults, 'histogramLineColorNegative', 'Цвет прироста', '#09B61A'),
            ],
          },
          {
            label: 'Нулевая ось',
            settings: [
              choice(
                defaults,
                'histogramZeroAxisStyle',
                'Стиль нулевой оси',
                [
                  option('SOLID', 'Сплошная'),
                  option('DASHED', 'Штрихи'),
                  option('DOTTED', 'Точки'),
                  option('NONE', 'Нет'),
                ],
                'SOLID',
              ),
              tint(defaults, 'histogramZeroAxisColor', 'Цвет', '#ffffff28'),
            ],
          },
          {
            label: 'Курсор позиции машины',
            settings: [
              toggle(defaults, 'showPositionCursor', 'Курсор позиции машины', true),
              choice(
                defaults,
                'cursorStyle',
                'Стиль курсора',
                [
                  option('LINE', 'Линия'),
                  option('DOT', 'Точка'),
                  option('PLAYHEAD', 'Указатель'),
                  option('CHEVRON', 'Шеврон'),
                  option('CROSSHAIR', 'Перекрестие'),
                ],
                'LINE',
                { visibleIf: { showPositionCursor: true } },
              ),
              tint(defaults, 'positionCursorColor', 'Цвет курсора', '#ffffff', {
                visibleIf: { showPositionCursor: true },
              }),
            ],
          },
        ],
      },
      {
        id: 'ghost',
        label: 'Ghost Trace',
        groups: [
          {
            settings: [
              choice(
                defaults,
                'ghostMode',
                'Источник',
                [option('NONE', 'Нет'), option('PERSONAL_LAST', 'Прошлый круг')],
                'PERSONAL_LAST',
                {
                  description:
                    'След прошлого круга поверх гистограммы, измеренный относительно того же целевого круга.',
                },
              ),
              tint(defaults, 'ghostColor', 'Цвет', '#ffffff', ghost),
              choice(
                defaults,
                'ghostLineStyle',
                'Стиль линии',
                [
                  option('SOLID', 'Сплошная'),
                  option('DASHED', 'Штрихи'),
                  option('DOTTED', 'Точки'),
                ],
                'DASHED',
                ghost,
              ),
              toggle(defaults, 'showGhostLine', 'Линия Ghost', true, ghost),
              slider(defaults, 'ghostLineOpacity', 'Непрозрачность линии', 0.35, 0, 1, 0.05, ghost),
              toggle(defaults, 'showGhostAreaFill', 'Заливка области', true, ghost),
              toggle(
                defaults,
                'showGhostSectionDeltas',
                'Показывать дельту участков Ghost',
                false,
                ghost,
              ),
            ],
          },
        ],
      },
      {
        id: 'turns',
        label: 'Номера поворотов',
        groups: [
          {
            label: 'Номера и границы поворотов',
            settings: [
              toggle(defaults, 'showTurnMarkers', 'Показывать номера поворотов', true, {
                description:
                  'Добавляет на след маркеры и подписи поворотов, чтобы было видно, где на трассе каждый поворот. Если повороты трассы неизвестны, вместо них показываются секторы.',
              }),
              choice(
                defaults,
                'turnNumberStyle',
                'Стиль',
                [option('PLAIN', '5'), option('PREFIXED', 'T5'), option('BIG', 'Крупные')],
                'PLAIN',
                turnNumbers,
              ),
              tint(defaults, 'turnNumberColor', 'Цвет номеров', '#bdbdbd', turnNumbers),
              toggle(defaults, 'showTurnLimits', 'Показывать границы поворотов', true),
              choice(
                defaults,
                'turnLineStyle',
                'Визуализация',
                [
                  option('REGIONS', 'Области'),
                  option('GRADIENT_REGIONS', 'Области с градиентом'),
                  option('LINES', 'Линии'),
                  option('TOP_TICKS', 'Риски сверху'),
                  option('BOTTOM_TICKS', 'Риски снизу'),
                  option('UNDERLINES', 'Черта снизу'),
                  option('UPPERLINES', 'Черта сверху'),
                ],
                'REGIONS',
                turnLimits,
              ),
              choice(
                defaults,
                'turnMarkerStyle',
                'Маркеры',
                [
                  option('MIDDLE', 'Середина'),
                  option('START_END', 'Начало и конец'),
                  option('START_MIDDLE_END', 'Начало, середина и конец'),
                ],
                'MIDDLE',
                {
                  ...turnLimits,
                  description: 'Для визуализации линиями и рисками.',
                },
              ),
              tint(defaults, 'turnColor', 'Цвет поворотов', '#ffffff', turnLimits),
            ],
          },
        ],
      },
      {
        id: 'sectors',
        label: 'Секторы трассы',
        groups: [
          {
            settings: [
              toggle(defaults, 'showSectorMarkers', 'Показывать маркеры секторов', false),
              toggle(defaults, 'showSectorNumbers', 'Показывать номера секторов', false),
              tint(defaults, 'sectorColor', 'Цвет секторов', '#ffffff'),
              tint(defaults, 'sectorNumberColor', 'Цвет номеров', '#bdbdbd'),
            ],
          },
        ],
      },
      {
        id: 'sections',
        label: 'Участки следа',
        groups: [
          {
            settings: [
              toggle(defaults, 'showSectionDeltas', 'Показывать дельту участков', true, {
                description:
                  'Делит круг на повороты и прямые и показывает дельту каждого участка цветной полосой: красный — потеря, зелёный — выигрыш.',
              }),
              choice(
                defaults,
                'sectionDeltaMode',
                'Режим хронометража',
                [
                  option('TURN_AND_STRAIGHT', 'Поворот с прямой после него'),
                  option('TURNS_ONLY', 'Только повороты'),
                  option('PER_SEGMENT', 'Повороты и прямые отдельно'),
                  option('SECTORS', 'Секторы'),
                ],
                'TURN_AND_STRAIGHT',
                {
                  ...sections,
                  description: 'Если повороты трассы неизвестны, участками служат секторы.',
                },
              ),
              choice(
                defaults,
                'sectionBarTheme',
                'Стиль',
                [
                  option('GRADIENT', 'Градиент'),
                  option('SIMPLE', 'Простой'),
                  option('BARS', 'Столбцы'),
                  option('HEATMAP', 'Тепловая карта'),
                  option('MINIMAL', 'Минимальный'),
                ],
                'SIMPLE',
                sections,
              ),
              toggle(defaults, 'showSectionDeltaNumbers', 'Значения дельты', true, sections),
              slider(defaults, 'sectionDeltaDecimals', 'Десятичные знаки', 1, 1, 3, 1, sections),
              toggle(defaults, 'showSectionDeltaSigns', 'Показывать знаки +/-', false, sections),
            ],
          },
        ],
      },
      {
        id: 'weak-spot',
        label: 'Weak Spot',
        groups: [
          {
            settings: [
              toggle(defaults, 'showWeakSpot', 'Показывать панель Weak Spot', true, {
                description:
                  'Участок с наибольшей потерью времени на прошлом круге: улучшив его, вы выиграете больше всего.',
              }),
              slider(defaults, 'weakSpotSectionCount', 'Количество участков', 1, 1, 5, 1, weakSpot),
              choice(
                defaults,
                'weakSpotPanelPosition',
                'Позиция',
                [
                  option('RIGHT', 'Справа'),
                  option('LEFT', 'Слева'),
                  option('TOP', 'Сверху'),
                  option('BOTTOM', 'Снизу'),
                ],
                'RIGHT',
                weakSpot,
              ),
              toggle(
                defaults,
                'highlightWeakSpotInSectionBar',
                'Отметить на полосе участков',
                true,
                weakSpot,
              ),
              toggle(defaults, 'showWeakSpotMiniMap', 'Карта участка', true, {
                ...weakSpot,
                description: 'Участок на карте трассы. Нужна геометрия трассы (iRacing).',
              }),
              toggle(
                defaults,
                'showPerSectionWeakSpotMap',
                'Карта у каждого участка',
                false,
                weakSpotMap,
              ),
              choice(
                defaults,
                'weakSpotHighlightStyle',
                'Выделение на карте',
                [option('SOLID', 'Сплошное'), option('DELTA_GRADIENT', 'По дельте')],
                'SOLID',
                weakSpotMap,
              ),
              tint(defaults, 'weakSpotHighlightColor', 'Цвет выделения', '#FE171F', weakSpot),
              slider(
                defaults,
                'weakSpotHighlightLineWidth',
                'Толщина выделения',
                25,
                1,
                60,
                1,
                weakSpotMap,
              ),
              tint(defaults, 'weakSpotBaseTrackColor', 'Цвет трассы', '#D9D9E1', weakSpotMap),
              slider(
                defaults,
                'weakSpotBaseTrackLineWidth',
                'Толщина трассы',
                25,
                1,
                60,
                1,
                weakSpotMap,
              ),
              toggle(
                defaults,
                'showLiveWeakSpotDelta',
                'Показывать дельту в реальном времени',
                true,
                {
                  ...weakSpot,
                  description: 'Ваша текущая дельта на этом участке: стало ли лучше.',
                },
              ),
              toggle(defaults, 'showWeakSpotLapTime', 'Показывать время круга', true, weakSpot),
              toggle(defaults, 'showHistogramCanvas', 'Показывать панель Delta Trace', true, {
                ...weakSpot,
                description: 'Если выключено, видна только панель Weak Spot.',
              }),
            ],
          },
        ],
      },
      {
        id: 'widgets',
        label: 'Виджеты',
        groups: [...widgetBarGroups('Top', []), ...widgetBarGroups('Bottom', [])],
      },
    ],
  },
};
