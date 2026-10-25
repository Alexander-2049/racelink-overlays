import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import {
  appearancePage,
  driverFlagsPage,
  infoColumnsPage,
  lapTimePage,
  orderOf,
  pitPage,
  ratingColumnsPage,
  referencePage,
  slider,
  tagsPage,
  toggle,
  type RowDefaults,
} from './rowPages.js';
import { widgetBarGroups } from './widgets.js';

/** The main columns of the Standings rows, in their fixed order. */
export const standingsMainColumns = [
  'ShowCarClass',
  'ShowDriverNumber',
  'ShowDriverNationalityFlagBadge',
  'ShowDriverName',
  'ShowDriverNationalityText',
  'ShowLicence',
  'ShowIrating',
  'ShowDriverCarBrand',
] as const;

/** The side columns right of the rows, in their fixed order. */
export const standingsSideColumns = [
  'ShowPositionsChanged',
  'ShowTireCompounds',
  'ShowCurrentStint',
  'ShowCompletedStint',
  'ShowIntervalDistance',
  'ShowGap',
  'ShowDriverOfftracks',
  'ShowRelativeTimeDistance',
  'ShowLapNumber',
  'ShowPushToPass',
  'ShowFastestLapTime',
  'ShowLastLapTime',
  'ShowLast5LapTimeAvg',
  'ShowLast10LapTimeAvg',
  'ShowLapDelta',
  'ShowJokerLap',
  'ShowVirtualEnergy',
] as const;

const defaults: RowDefaults = {
  ShowIratingGain: false,
  ShowLicence: false,
  ShowSafetyRating: false,
  ShowOutLap: false,
  ShowFastestLapTime: true,
  LapDeltaCount: 3,
  TeamRacingNameFormat: '0',
  ShowDriverFlag: false,
};

export const rStandings: OverlayDefinition = {
  kind: 'r-standings',
  name: 'R-Standings',
  category: 'race',
  defaultBounds: { x: 40, y: 80, width: 450, height: 286 },
  defaultEnabled: false,
  settings: {
    pages: [
      appearancePage(defaults, [
        slider(defaults, 'NumberOfLineAhead', 'Количество пилотов впереди', 3, 0, 20),
        slider(defaults, 'NumberOfLineBehind', 'Количество пилотов позади', 3, 0, 20),
        slider(defaults, 'NumberOfTopDrivers', 'Количество лидирующих пилотов', 3, 0, 20),
        slider(defaults, 'MinimumDrivers', 'Минимальное число видимых водителей', 10, 0, 40),
        slider(
          defaults,
          'SideBarOpacity',
          'Непрозрачность заднего фона боковых столбцов',
          0.5,
          0,
          1,
          0.05,
        ),
        toggle(defaults, 'ShowSessionLabel', 'Метка сессии', true),
        toggle(defaults, 'ShowOverallDriversCount', 'Кол-во пилотов', false),
        toggle(defaults, 'HideSideColumnHeader', 'Скрыть названия столбцов', false),
        ...rAppearanceSettings({
          fontSize: 14,
          opacity: 0.8,
          width: { default: 175, min: 100, max: 600 },
        }),
      ]),
      referencePage(defaults),
      {
        id: 'class-headers',
        label: 'Заголовки классов',
        groups: [
          {
            settings: [
              toggle(defaults, 'ShowCarClassNameLabels', 'Название класса', false),
              toggle(defaults, 'ShowCarClassSof', 'SOF по классам', false),
              toggle(defaults, 'ShowCarClassNumOfDrivers', 'Кол-во пилотов класса', false),
              toggle(defaults, 'ShowCarClassLapCounters', 'Счетчики кругов по классам', false),
            ],
          },
        ],
      },
      {
        id: 'multiclass',
        label: 'Мультикласс',
        groups: [
          {
            settings: [
              toggle(defaults, 'EnableMultiClass', 'Мультикласс', true),
              slider(
                defaults,
                'NumberOfDriversInOtherClasses',
                'Количество пилотов в классах',
                3,
                0,
                20,
                1,
                {
                  visibleIf: { EnableMultiClass: true },
                },
              ),
            ],
          },
        ],
      },
      infoColumnsPage(defaults, 'Осн. столбцы: инфо', {
        position: false,
        distance: false,
        lapAndJoker: false,
        gear: false,
      }),
      ratingColumnsPage(defaults, 'Осн. столбцы: рейтинги'),
      {
        id: 'columns-order',
        label: 'Осн. столбцы: порядок',
        groups: [
          {
            settings: [
              orderOf('order.MainColumnOrder', 'Порядок основных столбцов', standingsMainColumns),
            ],
          },
        ],
      },
      {
        id: 'side-columns',
        label: 'Боковые столбцы',
        groups: [
          {
            settings: [
              toggle(defaults, 'ShowPositionsChanged', 'Изменение позиций', false),
              toggle(defaults, 'ShowIntervalDistance', 'Дистанция', false),
              toggle(defaults, 'ShowGap', 'Разрыв', true),
              toggle(defaults, 'ShowRelativeTimeDistance', 'Относительное время', false),
              toggle(defaults, 'ShowLapNumber', 'Номер круга', false),
              toggle(defaults, 'ShowJokerLap', 'Круг-Joker', false),
            ],
          },
        ],
      },
      lapTimePage(defaults, 'Боковые столбцы: времена круга'),
      {
        id: 'side-order',
        label: 'Боковые столбцы: порядок',
        groups: [
          {
            settings: [
              orderOf('order.SideColumnOrder', 'Порядок боковых столбцов', standingsSideColumns),
            ],
          },
        ],
      },
      {
        id: 'sliding-menu',
        label: 'Выдвижное меню',
        groups: [
          {
            settings: [
              toggle(defaults, 'EnableSlidingSideMenu', 'Выдвижное боковое меню', false),
              slider(defaults, 'SlidingMenuDelayInSecond', 'Скорость изменения', 20, 5, 120, 1, {
                unit: 'с',
                visibleIf: { EnableSlidingSideMenu: true },
              }),
            ],
          },
        ],
      },
      pitPage(defaults, 'Инфо о питах'),
      tagsPage(defaults),
      driverFlagsPage(defaults, 'right'),
      {
        id: 'widgets',
        label: 'Виджеты',
        groups: [
          ...widgetBarGroups(
            'Top',
            [{ widget: 'SessionTimer', iconType: 'NONE' }, { widget: 'None' }, { widget: 'None' }],
            3,
          ),
          ...widgetBarGroups(
            'Bottom',
            [{ widget: 'None' }, { widget: 'None' }, { widget: 'None' }],
            3,
          ),
        ],
      },
    ],
  },
};
