import type { SelectOption } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { choice, tint, toggle, type RowDefaults } from '../rCatalog/rowPages.js';

const defaults: RowDefaults = {};
const option = (value: string, label: string): SelectOption => ({ value, label });

/** The eleven gauge styles of the game. */
const styles = Array.from({ length: 11 }, (_, index) =>
  option(String(index), `Стиль ${String(index + 1)}`),
);
/** The game's ten gauge colours, in its order, and a colour of one's own. */
const palette = [
  option('1', 'Белый'),
  option('2', 'Серый'),
  option('3', 'Оранжевый'),
  option('4', 'Красный'),
  option('5', 'Розовый'),
  option('6', 'Голубой'),
  option('7', 'Салатовый'),
  option('8', 'Бирюзовый'),
  option('9', 'Синий'),
  option('10', 'Сиреневый'),
  option('custom', 'Свой цвет'),
];
const barSources = [
  option('fuel', 'Топливо'),
  option('battery', 'Заряд батареи'),
  option('none', 'Нет'),
];

/** NFSMW-Speedometer: the tachometer, gear, speed and bars of the game's HUD. */
export const nfsmwSpeedometer: OverlayDefinition = {
  kind: 'nfsmw-speedometer',
  name: 'NFSMW-Speedometer',
  category: 'driving',
  defaultBounds: { x: 1500, y: 640, width: 372, height: 374 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            label: 'Оформление',
            settings: [
              choice(defaults, 'hudStyle', 'Стиль шкалы', styles, '0'),
              choice(defaults, 'gaugeFacePalette', 'Цвет циферблата', palette, '3'),
              tint(defaults, 'gaugeFaceColor', 'Свой цвет циферблата', '#FDC172', {
                visibleIf: { gaugeFacePalette: 'custom' },
              }),
              choice(defaults, 'needlePalette', 'Цвет стрелок', palette, '3'),
              tint(defaults, 'needleColor', 'Свой цвет стрелок', '#FDC172', {
                visibleIf: { needlePalette: 'custom' },
              }),
              choice(defaults, 'letteringPalette', 'Цвет разметки', palette, '1'),
              tint(defaults, 'letteringColor', 'Свой цвет разметки', '#FDFDFD', {
                visibleIf: { letteringPalette: 'custom' },
              }),
            ],
          },
          {
            label: 'Показания',
            settings: [
              choice(
                defaults,
                'units',
                'Единицы скорости',
                [option('auto', 'Как в игре'), option('kmh', 'км/ч'), option('mph', 'mph')],
                'auto',
              ),
              toggle(defaults, 'showTurbo', 'Шкала наддува', true, {
                description: 'Видна, когда игра сообщает давление наддува.',
              }),
              choice(defaults, 'nitrousSource', 'Левая шкала (закись)', barSources, 'fuel', {
                description: 'Значок закиси пульсирует, пока батарея отдаёт энергию.',
              }),
              choice(
                defaults,
                'breakerSource',
                'Правая шкала (speedbreaker)',
                barSources,
                'battery',
              ),
            ],
          },
        ],
      },
    ],
  },
};
