import type { SelectOption } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { choice, slider, toggle, type RowDefaults } from '../rCatalog/rowPages.js';

const defaults: RowDefaults = {};
const option = (value: string, label: string): SelectOption => ({ value, label });

/** NFSMW-Lap Time: the game's LAP TIME message after each lap and SPLIT TIME on the way. */
export const nfsmwLapTime: OverlayDefinition = {
  kind: 'nfsmw-lap-time',
  name: 'NFSMW-Lap Time',
  category: 'timing',
  defaultBounds: { x: 510, y: 203, width: 900, height: 338 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'lapTime',
        label: 'LAP TIME',
        groups: [
          {
            settings: [
              toggle(defaults, 'showLapTime', 'Показывать LAP TIME', true, {
                description: 'Время круга, когда машина пересекает линию.',
              }),
            ],
          },
        ],
      },
      {
        id: 'splitTime',
        label: 'SPLIT TIME',
        groups: [
          {
            settings: [
              choice(
                defaults,
                'splitMode',
                'SPLIT TIME',
                [
                  option('auto', 'Как в игре'),
                  option('leader', 'Отрыв от второго / отставание от лидера'),
                  option('best', 'Дельта к лучшему кругу'),
                  option('off', 'Не показывать'),
                ],
                'auto',
                {
                  description:
                    'Как в игре: в гонке — отрыв от второго места или отставание от лидера класса, в остальных сессиях — дельта к своему лучшему кругу.',
                },
              ),
              slider(defaults, 'splitsPerLap', 'Отсечек SPLIT TIME за круг', 3, 1, 6, 1),
            ],
          },
        ],
      },
    ],
  },
};
