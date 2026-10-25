import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { slider, toggle, type RowDefaults } from './rowPages.js';

const defaults: RowDefaults = {};

/** LapTime Graph: the session's lap times as a line chart. */
export const rLaptimeGraph: OverlayDefinition = {
  kind: 'r-laptime-graph',
  name: 'R-LapTime Graph',
  category: 'timing',
  defaultBounds: { x: 40, y: 80, width: 450, height: 300 },
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
              ...rAppearanceSettings({ fontSize: null, opacity: 0.75, showTitle: true }),
            ],
          },
        ],
      },
      {
        id: 'filters',
        label: 'Фильтры времени круга',
        groups: [
          {
            settings: [
              toggle(defaults, 'LimitLapCount', 'Ограничить количество кругов', true, {
                description: 'Ограничивает количество кругов на графике.',
              }),
              slider(defaults, 'LapCount', 'Количество кругов для отображения', 20, 2, 100, 1, {
                visibleIf: { LimitLapCount: true },
              }),
              toggle(defaults, 'IsFilterOn', 'Фильтр времени круга', false, {
                description: 'Убирает с графика лишние круги: первые, с пит-стопом, круги выезда.',
              }),
              slider(defaults, 'FilterOutLower', 'Фильтр ниже (сек)', 5, 0, 60, 0.5, {
                visibleIf: { IsFilterOn: true },
                description: 'Убирает круги быстрее медианы больше чем на это число секунд.',
              }),
              slider(defaults, 'FilterOutHigher', 'Фильтр выше (сек)', 5, 0, 60, 0.5, {
                visibleIf: { IsFilterOn: true },
                description: 'Убирает круги медленнее медианы больше чем на это число секунд.',
              }),
            ],
          },
        ],
      },
    ],
  },
};
