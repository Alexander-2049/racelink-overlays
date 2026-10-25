import type { SelectOption } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { choice, slider, toggle, type RowDefaults } from './rowPages.js';

const option = (value: string, label: string): SelectOption => ({ value, label });

export const pitTireWearVersions = ['OPACITY', 'SIZED', 'COLORED', 'COLORED_AND_SIZED'] as const;

const defaults: RowDefaults = {};

/** Pitbox Helper: limiter, speed to the limit, distance to the box and tyres. */
export const rPitboxHelper: OverlayDefinition = {
  kind: 'r-pitbox-helper',
  name: 'R-Pitbox Helper',
  category: 'strategy',
  defaultBounds: { x: 40, y: 80, width: 166, height: 230 },
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
              ...rAppearanceSettings({ fontSize: null, opacity: 0.6 }),
              toggle(defaults, 'AlwaysShow', 'Всегда показывать', false),
              slider(
                defaults,
                'ShowDurationAfterLeavingPits',
                'Время отображения после выезда из боксов (в сек.)',
                15,
                0,
                60,
                1,
              ),
              toggle(defaults, 'ShowPitLimiter', 'Показывать ограничитель скорости', true),
              toggle(defaults, 'ShowPitSpeedDelta', 'Показывать дельту скорости', true),
              toggle(defaults, 'ShowPitStallDistance', 'Показывать дистанцию до пит-столла', true),
              slider(
                defaults,
                'PitBoxDetectionRange',
                'Дальность до детекции пит-столла',
                200,
                20,
                1000,
                10,
                {
                  unit: 'м',
                  description:
                    'С какого расстояния до пит-столла начинает заполняться индикатор дистанции.',
                  visibleIf: { ShowPitStallDistance: true },
                },
              ),
            ],
          },
        ],
      },
      {
        id: 'tires',
        label: 'Износ шин',
        groups: [
          {
            settings: [
              toggle(defaults, 'ShowTireTemp', 'Показывать температуру шин', true),
              toggle(defaults, 'ShowTireWear', 'Показывать износ шин', true),
              choice(
                defaults,
                'PitTireWearVersion',
                'Визуализация износа шин',
                [
                  option('OPACITY', 'Оттенки серого'),
                  option('SIZED', 'График'),
                  option('COLORED', 'Цвет'),
                  option('COLORED_AND_SIZED', 'Цвет и график'),
                ],
                'OPACITY',
                { visibleIf: { ShowTireWear: true } },
              ),
            ],
          },
        ],
      },
    ],
  },
};
