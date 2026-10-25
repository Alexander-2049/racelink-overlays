import type { SelectOption } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { choice, slider, tint, toggle, type RowDefaults } from './rowPages.js';
import { widgetBarGroups } from './widgets.js';

const option = (value: string, label: string): SelectOption => ({ value, label });

/** Laps the envelope can be compared with. */
export const gForceComparisonModes = [
  'personalBestLap',
  'personalSessionBestLap',
  'personalLastLap',
] as const;

const defaults: RowDefaults = {};
const circle = { visibleIf: { Shape: 'CIRCLE' } };
const rectangle = { visibleIf: { Shape: 'RECTANGLE' } };

/** G-Force Meter: the force dot with its trail and the traction envelope. */
export const rGForceMeter: OverlayDefinition = {
  kind: 'r-g-force-meter',
  name: 'R-G-Force Meter',
  category: 'driving',
  defaultBounds: { x: 40, y: 80, width: 210, height: 238 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            settings: [
              // The overlay scales with its window: no size setting.
              ...rAppearanceSettings({ fontSize: null, opacity: 0.75, titleColor: false }),
              choice(
                defaults,
                'Shape',
                'Форма',
                [option('RECTANGLE', 'Прямоугольник'), option('CIRCLE', 'Круг')],
                'RECTANGLE',
              ),
              tint(defaults, 'BackgroundColor', 'Цвет фона', '#202024'),
              slider(defaults, 'BorderOpacity', 'Непрозрачность обводки', 1, 0, 1, 0.05),
              slider(defaults, 'PanelOpacity', 'Непрозрачность панелей', 1, 0, 1, 0.05),
              toggle(defaults, 'ShowRectangleAxisLines', 'Оси', true, rectangle),
              toggle(defaults, 'ShowCircleAxisLines', 'Оси', false, circle),
              toggle(defaults, 'ShowRectangleOuterRing', 'Внешняя обводка', false, rectangle),
              toggle(defaults, 'ShowCircleOuterRing', 'Внешняя обводка', true, circle),
              toggle(defaults, 'ShowTracInnerRings', 'Внутренняя обводка', false),
              tint(defaults, 'InnerRingsColor', 'Цвет внутренней обводки', '#000000', {
                visibleIf: { ShowTracInnerRings: true },
              }),
              slider(defaults, 'InnerRingsSize', 'Толщина внутренней обводки', 2, 1, 10, 1, {
                visibleIf: { ShowTracInnerRings: true },
              }),
            ],
          },
        ],
      },
      {
        id: 'current',
        label: 'Текущая G-нагрузка',
        groups: [
          {
            settings: [
              toggle(defaults, 'GDot', 'Включено', true),
              tint(defaults, 'GDotColor', 'Цвет', '#AEBBFF', { visibleIf: { GDot: true } }),
              slider(defaults, 'GDotRadius', 'Размер', 4, 1, 15, 1, { visibleIf: { GDot: true } }),
              tint(defaults, 'GDotHistoryColor', 'Цвет истории', '#5A78FF', {
                visibleIf: { GDot: true },
              }),
              slider(defaults, 'GDotHistory', 'Размер истории (шт.)', 200, 1, 1000, 1, {
                visibleIf: { GDot: true },
              }),
              slider(defaults, 'GDotDecay', 'Затухание (сек)', 3, 0.1, 10, 0.1, {
                visibleIf: { GDot: true },
              }),
            ],
          },
          {
            label: 'Значения G-нагрузки',
            settings: [
              toggle(defaults, 'GCurrent', 'Текущая G-нагрузка', true),
              toggle(defaults, 'GPeak', 'Максимальная нагрузка', true),
            ],
          },
        ],
      },
      {
        id: 'envelope',
        label: 'Предел сцепления',
        groups: [
          {
            settings: [
              toggle(defaults, 'GEnvelope', 'Включено', true),
              choice(
                defaults,
                'EnvelopeMode',
                'Огибающая',
                [option('session', 'За сессию'), option('lap', 'За круг')],
                'session',
                { visibleIf: { GEnvelope: true } },
              ),
              tint(defaults, 'GEnvelopeColor', 'Цвет', '#FFFFFF', {
                visibleIf: { GEnvelope: true },
              }),
              slider(defaults, 'GEnvelopeLineSize', 'Толщина линии', 2, 1, 10, 1, {
                visibleIf: { GEnvelope: true },
              }),
              toggle(defaults, 'ShowEnvelopeStats', 'Статистика огибающей', false, {
                visibleIf: { GEnvelope: true },
              }),
            ],
          },
          {
            label: 'Сравнение',
            settings: [
              toggle(defaults, 'GComparisonEnv', 'Сравнение включено', false),
              choice(
                defaults,
                'ComparisonMode',
                'Режим сравнения',
                [
                  option('personalBestLap', 'Личный лучший'),
                  option('personalSessionBestLap', 'Лучший в сессии'),
                  option('personalLastLap', 'Прошлый круг'),
                ],
                'personalBestLap',
                { visibleIf: { GComparisonEnv: true } },
              ),
              tint(defaults, 'GComparisonEnvColor', 'Цвет', '#FF7878', {
                visibleIf: { GComparisonEnv: true },
              }),
              slider(defaults, 'GComparisonEnvLineSize', 'Толщина линии', 2, 1, 10, 1, {
                visibleIf: { GComparisonEnv: true },
              }),
              choice(
                defaults,
                'GComparisonEnvLineType',
                'Тип линий',
                [option('LINE', 'Линия'), option('DOTTED', 'Точки')],
                'LINE',
                { visibleIf: { GComparisonEnv: true } },
              ),
              toggle(defaults, 'ShowComparisonLabel', 'Подпись сравнения', true, {
                visibleIf: { GComparisonEnv: true },
              }),
              toggle(defaults, 'ShowComparisonStats', 'Статистика сравнения', false, {
                visibleIf: { GComparisonEnv: true },
              }),
            ],
          },
        ],
      },
      {
        id: 'widgets',
        label: 'Виджеты',
        groups: widgetBarGroups(
          'Bottom',
          [{ widget: 'BrakeBias' }, { widget: 'WindSpeed' }, { widget: 'TrackTemp' }],
          3,
        ),
      },
    ],
  },
};
