import type { OverlayDefinition } from '../overlayCatalog.js';
import { slider, type RowDefaults } from '../rCatalog/rowPages.js';

const defaults: RowDefaults = {};

/** NFSMW-EA Trax: the game's chyron with the track that plays now. */
export const nfsmwEaTrax: OverlayDefinition = {
  kind: 'nfsmw-ea-trax',
  name: 'NFSMW-EA Trax',
  category: 'other',
  defaultBounds: { x: 60, y: 40, width: 856, height: 152 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            settings: [
              slider(defaults, 'delaySeconds', 'Задержка после смены трека (сек)', 3, 0, 15, 0.5, {
                description:
                  'Через сколько секунд после начала трека появляется плашка. Трек берётся из системных медиа-элементов управления (Настройки → Интеграции).',
              }),
            ],
          },
        ],
      },
    ],
  },
};
