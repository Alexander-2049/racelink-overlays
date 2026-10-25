import type { SelectOption, SettingDefinition } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { choice, slider, tint, toggle, type RowDefaults } from './rowPages.js';

const option = (value: string, label: string): SelectOption => ({ value, label });

/** The refuelling strategies, in order, with the calculator field each reads. */
export const fuelStrategies = [
  { id: 'AllLapsAverage', field: 'allLaps', short: 'Avg', label: 'Средний расход всех кругов' },
  { id: 'HighestLap', field: 'highest', short: 'Max', label: 'Наибольший расход' },
  { id: 'LowestLap', field: 'lowest', short: 'Min', label: 'Наименьший расход' },
  { id: 'LastLap', field: 'lastLap', short: 'Last', label: 'Последний круг' },
  { id: 'Last5Average', field: 'last5', short: 'L5', label: 'Ср. последних 5 кругов' },
  { id: 'Last10Average', field: 'last10', short: 'L10', label: 'Ср. последних 10 кругов' },
] as const;
export type FuelStrategyId = (typeof fuelStrategies)[number]['id'];

const strategyDescriptions: Readonly<Record<FuelStrategyId, string>> = {
  AllLapsAverage: 'Расход по среднему всех кругов сессии.',
  HighestLap: 'Расход по кругу с наибольшим расходом в сессии.',
  LowestLap: 'Расход по кругу с наименьшим расходом в сессии.',
  LastLap: 'Расход по последнему кругу сессии.',
  Last5Average: 'Расход по среднему последних 5 кругов сессии.',
  Last10Average: 'Расход по среднему последних 10 кругов сессии.',
};

const shownByDefault: Readonly<Record<FuelStrategyId, boolean>> = {
  AllLapsAverage: true,
  HighestLap: true,
  LowestLap: true,
  LastLap: false,
  Last5Average: false,
  Last10Average: false,
};

const defaults: RowDefaults = {};

const strategyRows = (): readonly SettingDefinition[] =>
  fuelStrategies.flatMap((strategy) => [
    toggle(defaults, `Show${strategy.id}`, strategy.label, shownByDefault[strategy.id], {
      description: strategyDescriptions[strategy.id],
    }),
    tint(defaults, `${strategy.id}Color`, `Цвет: ${strategy.short}`, '#ffffff', {
      visibleIf: { [`Show${strategy.id}`]: true },
    }),
  ]);

/** Fuel Calculator: fuel level, consumption strategies, pit window and history. */
export const rFuelCalculator: OverlayDefinition = {
  kind: 'r-fuel-calculator',
  name: 'R-Fuel Calculator',
  category: 'strategy',
  defaultBounds: { x: 40, y: 80, width: 560, height: 192 },
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
              slider(defaults, 'DecimalCount', 'Цифр после запятой', 1, 0, 3, 1),
              toggle(defaults, 'ShowFuelBar', 'Топливный индикатор', true),
              toggle(defaults, 'ShowFuel', 'Количество топлива', true),
              toggle(defaults, 'ShowFuelHistory', 'История расхода', true),
              slider(
                defaults,
                'FuelHistoryOpacity',
                'Непрозрачность топливной истории',
                0.5,
                0,
                1,
                0.05,
                {
                  visibleIf: { ShowFuelHistory: true },
                },
              ),
              toggle(defaults, 'ShowTimeRemainingUntilEmpty', 'Время с топливом', false, {
                description: 'Сколько времени хватит топлива в баке.',
              }),
              toggle(
                defaults,
                'ShowTimeRemainingUntilEmptyTarget',
                'Целевое время с топливом',
                true,
                {
                  description:
                    'Запас или нехватка времени на топливе до конца сессии: плюс — топлива хватит с запасом, минус — не хватит.',
                  visibleIf: { ShowTimeRemainingUntilEmpty: true },
                },
              ),
              toggle(defaults, 'ShowLapsRemainingUntilEmpty', 'Кругов до пустого бака', false),
              toggle(defaults, 'ShowLapsRemainingUntilEmptyTarget', 'Цель по кругам', true, {
                visibleIf: { ShowLapsRemainingUntilEmpty: true },
              }),
            ],
          },
        ],
      },
      {
        id: 'strategies',
        label: 'Стратегии дозаправки',
        groups: [{ label: 'Ряды расхода', settings: strategyRows() }],
      },
      {
        id: 'columns',
        label: 'Столбцы расхода',
        groups: [
          {
            settings: [
              toggle(defaults, 'ShowAverageFuel', 'Расход', true),
              toggle(defaults, 'ShowLaps', 'Кругов осталось', true),
              toggle(defaults, 'ShowTotalPitstops', 'Всего питстопов', false),
              toggle(defaults, 'ShowRefuel', 'Количество для дозаправки', true),
              toggle(defaults, 'ShowTotalRefuel', 'Полное количество топлива к дозаправке', false),
              toggle(defaults, 'ShowFuelAtEnd', 'Топлива на финише', true),
            ],
          },
        ],
      },
      {
        id: 'refueling',
        label: 'Дозаправка',
        groups: [
          {
            settings: [
              choice(
                defaults,
                'RefuelingStrategy',
                'Используемая стратегия дозаправки',
                fuelStrategies.map((strategy) => option(strategy.id, strategy.label)),
                'Last10Average',
              ),
              slider(
                defaults,
                'RefuelAdditionalFuelInLaps',
                'Дополнительное топливо (на круг)',
                1.2,
                0,
                5,
                0.1,
                {
                  description: 'Запас к дозаправке, в кругах расхода.',
                },
              ),
              toggle(defaults, 'ShowFuelWindowBar', 'Окно дозаправки', false, {
                description:
                  'Полоса предстоящих кругов гонки: каждая черта — круг, зелёные — круги, на которых можно заехать на дозаправку, жёлтая — текущий.',
              }),
              toggle(defaults, 'ShowFuelWindowStatus', 'Статус окна дозаправки', false, {
                description: 'Статус окна дозаправки по выбранной стратегии.',
              }),
            ],
          },
        ],
      },
    ],
  },
};
