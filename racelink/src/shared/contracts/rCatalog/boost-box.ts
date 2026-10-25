import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { toggle, type RowDefaults } from './rowPages.js';

const defaults: RowDefaults = {};

/** Boost Box: hybrid deploy and battery charge with the last lap's values. */
export const rBoostBox: OverlayDefinition = {
  kind: 'r-boost-box',
  name: 'R-Boost Box',
  category: 'strategy',
  defaultBounds: { x: 40, y: 80, width: 260, height: 90 },
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
              ...rAppearanceSettings({ fontSize: null, opacity: 0.8, showTitle: true }),
              toggle(defaults, 'ShowLastLapInfoBox', 'Время последнего круга', true),
            ],
          },
        ],
      },
    ],
  },
};
