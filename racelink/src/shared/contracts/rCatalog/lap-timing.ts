import type { SelectOption, SettingsGroup } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rFontFamilies, rFontWeights } from './common.js';
import { choice, slider, toggle, type RowDefaults } from './rowPages.js';

const option = (value: string, label: string): SelectOption => ({ value, label });

/** What a Lap Timing block shows. */
export const lapTimingEntityTypes = [
  'NONE',
  'CURRENT',
  'PREDICTED',
  'personalBestLap',
  'personalSessionBestLap',
  'personalLastLap',
] as const;
export type LapTimingEntityType = (typeof lapTimingEntityTypes)[number];

/** Laps a block can be compared with. */
export const lapTimingReferenceTypes = [
  'personalBestLap',
  'personalSessionBestLap',
  'personalLastLap',
] as const;

export const lapTimingThemes = ['CLEAN', 'ARROW', 'GLOW', 'BUBBLES', 'POPUP', 'DIAL'] as const;
export const lapTimingBlockCount = 5;

const typeOptions = [
  option('NONE', 'Нет'),
  option('CURRENT', 'Текущий круг'),
  option('PREDICTED', 'Прогноз круга'),
  option('personalBestLap', 'Личный лучший'),
  option('personalSessionBestLap', 'Лучший в сессии'),
  option('personalLastLap', 'Последний круг'),
];
const referenceOptions = typeOptions.filter((entry) =>
  lapTimingReferenceTypes.some((type) => type === entry.value),
);

const defaults: RowDefaults = {};

const blockGroup = (index: number): SettingsGroup => {
  const key = (field: string) => `entities.${String(index)}.${field}`;
  return {
    label: `Блок #${String(index + 1)}`,
    settings: [
      choice(
        defaults,
        key('type'),
        'Тип',
        typeOptions,
        index === 0 ? 'personalSessionBestLap' : 'NONE',
      ),
      toggle(defaults, key('showDelta'), 'Показать дельту', false),
      toggle(
        defaults,
        key('showLastLapAfterFinish'),
        'Показывать время завершённого круга',
        false,
        {
          description:
            'После пересечения линии старт/финиш 5 секунд показывает последний круг, затем возвращает выбранный режим.',
        },
      ),
    ],
  };
};

/** Lap Timing: up to five blocks of lap times with deltas. */
export const rLapTiming: OverlayDefinition = {
  kind: 'r-lap-timing',
  name: 'R-Lap Timing',
  category: 'timing',
  defaultBounds: { x: 40, y: 80, width: 520, height: 70 },
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
                'theme',
                'Тема',
                lapTimingThemes.map((theme) =>
                  option(theme, theme.charAt(0) + theme.slice(1).toLowerCase()),
                ),
                'CLEAN',
              ),
              toggle(defaults, 'backgroundIsStriped', 'Фон в полоску', true),
              choice(
                defaults,
                'layoutFormat',
                'Макет оверлея',
                [option('row', 'Строка'), option('column', 'Столбец')],
                'row',
              ),
              choice(
                defaults,
                'referenceType',
                'Режим сравнения',
                referenceOptions,
                'personalBestLap',
              ),
              // The overlay scales with its window: no size setting.
              slider(defaults, 'Opacity', 'Непрозрачность фона', 1, 0, 1, 0.05),
              choice(defaults, 'FontFamily', 'Шрифт', rFontFamilies, 'Montserrat'),
              choice(defaults, 'FontWeight', 'Толщина', rFontWeights, 'Semibold'),
            ],
          },
        ],
      },
      {
        id: 'blocks',
        label: 'Блоки',
        groups: Array.from({ length: lapTimingBlockCount }, (_, index) => blockGroup(index)),
      },
    ],
  },
};
