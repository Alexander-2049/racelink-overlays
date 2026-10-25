import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import {
  appearancePage,
  choice,
  driverFlagsPage,
  infoColumnsPage,
  lapTimePage,
  orderOf,
  pitPage,
  ratingColumnsPage,
  referencePage,
  tagsPage,
  toggle,
  type RowDefaults,
} from './rowPages.js';
import { widgetBarGroups } from './widgets.js';

/** The Relative overlay's driver columns, in their fixed order. */
export const relativeColumns = [
  'ShowCarClass',
  'ShowDriverNumber',
  'ShowDriverCarBrand',
  'ShowTireCompounds',
  'ShowDriverNationalityFlagBadge',
  'ShowDriverName',
  'ShowCurrentStint',
  'ShowCompletedStint',
  'ShowDriverNationalityText',
  'ShowJokerLap',
  'ShowPushToPass',
  'ShowLicence',
  'ShowIrating',
  'ShowFastestLapTime',
  'ShowLastLapTime',
  'ShowLast5LapTimeAvg',
  'ShowLast10LapTimeAvg',
  'ShowLapNumber',
  'ShowLapDelta',
  'ShowDriverOfftracks',
  'ShowVirtualEnergy',
  'ShowTimeDistance',
  'ShowPhysicalDistance',
  'ShowDriverGear',
] as const;

const defaults: RowDefaults = {
  ShowIratingGain: true,
  ShowDriverFlag: false,
};

export const rRelatives: OverlayDefinition = {
  kind: 'r-relatives',
  name: 'R-Relatives',
  category: 'race',
  defaultBounds: { x: 40, y: 80, width: 430, height: 340 },
  defaultEnabled: false,
  settings: {
    pages: [
      appearancePage(defaults, [
        toggle(defaults, 'ExcludeCarsInPit', 'Скрывать машины на питлейне', false),
        ...rAppearanceSettings({ fontSize: 14, opacity: 0.8 }),
      ]),
      referencePage(defaults),
      {
        id: 'columns-order',
        label: 'Столбцы: порядок',
        groups: [{ settings: [orderOf('order.ColumnOrder', 'Порядок столбцов', relativeColumns)] }],
      },
      infoColumnsPage(defaults, 'Столбцы: инфо', {
        position: true,
        distance: true,
        lapAndJoker: true,
        gear: true,
      }),
      ratingColumnsPage(defaults, 'Столбцы: рейтинги'),
      lapTimePage(defaults, 'Столбцы: времена круга'),
      pitPage(defaults, 'Столбцы: инфо о питах'),
      tagsPage(defaults),
      driverFlagsPage(defaults, 'left'),
      {
        id: 'flag-frame',
        label: 'Окно флага',
        groups: [
          {
            settings: [
              toggle(defaults, 'ShowFlagFrame', 'Показать окно флага', false),
              choice(
                defaults,
                'FlagFramePosition',
                'Позиция флага',
                [
                  { value: 'TOP', label: 'Верх' },
                  { value: 'BOTTOM', label: 'Низ' },
                  { value: 'LEFT', label: 'Слева' },
                  { value: 'RIGHT', label: 'Справа' },
                ],
                'TOP',
                { visibleIf: { ShowFlagFrame: true } },
              ),
            ],
          },
        ],
      },
      {
        id: 'flat-map',
        label: 'Линейная карта',
        groups: [
          { settings: [toggle(defaults, 'ShowTrackMap', 'Закрепить линейную карту', false)] },
        ],
      },
      {
        id: 'widgets',
        label: 'Виджеты',
        groups: [
          ...widgetBarGroups('Top', [
            { widget: 'Sof' },
            { widget: 'Incidents' },
            { widget: 'None' },
            { widget: 'None' },
          ]),
          ...widgetBarGroups('Bottom', [
            { widget: 'SessionTimer' },
            { widget: 'LapCounter' },
            { widget: 'Abs' },
            { widget: 'None' },
          ]),
        ],
      },
    ],
  },
};
