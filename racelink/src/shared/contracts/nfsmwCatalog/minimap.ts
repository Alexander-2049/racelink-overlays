import type { OverlayDefinition } from '../overlayCatalog.js';
import { slider, toggle, type RowDefaults } from '../rCatalog/rowPages.js';

const defaults: RowDefaults = {};

/** NFSMW-Minimap: the game's round map, turning with the car. */
export const nfsmwMinimap: OverlayDefinition = {
  kind: 'nfsmw-minimap',
  name: 'NFSMW-Minimap',
  category: 'awareness',
  defaultBounds: { x: 7, y: 666, width: 372, height: 374 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            settings: [
              slider(defaults, 'visibleRadiusMeters', 'Радиус карты', 250, 50, 1000, 10, {
                unit: 'м',
              }),
              toggle(defaults, 'showTerrain', 'Местность вокруг трассы', true, {
                description: 'Асфальт и вода с карты трассы, в цветах карты игры.',
              }),
              toggle(defaults, 'showOpponents', 'Соперники', true),
              toggle(defaults, 'showStartLine', 'Линия старта', true),
            ],
          },
        ],
      },
    ],
  },
};
