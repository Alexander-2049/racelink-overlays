import type { SelectOption } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { choice, type RowDefaults } from '../rCatalog/rowPages.js';

const defaults: RowDefaults = {};
const option = (value: string, label: string): SelectOption => ({ value, label });

/** NFSMW-Leaderboard: position, race time, lap and the four nearest racers of the game's HUD. */
export const nfsmwLeaderboard: OverlayDefinition = {
  kind: 'nfsmw-leaderboard',
  name: 'NFSMW-Leaderboard',
  category: 'race',
  defaultBounds: { x: 1478, y: 45, width: 450, height: 324 },
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
                'positionMode',
                'Позиция',
                [option('overall', 'Общая'), option('class', 'В классе')],
                'overall',
                { description: 'В классе — позиции и соперники только своего класса.' },
              ),
              choice(
                defaults,
                'nameFormat',
                'Имя гонщика',
                [option('last', 'Фамилия'), option('first', 'Имя'), option('full', 'Полностью')],
                'last',
              ),
              choice(
                defaults,
                'units',
                'Расстояние до соперников',
                [
                  option('auto', 'Как в игре'),
                  option('metric', 'Метры'),
                  option('imperial', 'Футы'),
                ],
                'auto',
                { description: 'Строки по очереди показывают имена и расстояние до них.' },
              ),
            ],
          },
        ],
      },
    ],
  },
};
