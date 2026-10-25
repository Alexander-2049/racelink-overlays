import type { SettingDefinition, SettingsGroup } from '../../overlay-api/settings.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';

export type RFlagCategory = 'global' | 'black' | 'start';

export type RFlagEntry = Readonly<{
  /** `session.flagDetail` value this entry answers to. */
  id: string;
  /** Flag type, used as the CSS class of the flag. */
  type: string;
  label: string;
  header: string;
  text: string;
  category: RFlagCategory;
  enabled: boolean;
}>;

/** Flags the Flags overlay can show, with their default texts. */
export const rFlagEntries: readonly RFlagEntry[] = [
  {
    id: 'checkered',
    type: 'Checkered',
    label: 'Клетчатый',
    header: 'session is over',
    text: 'checkered flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'white',
    type: 'White',
    label: 'Белый',
    header: 'one more lap',
    text: 'white flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'green',
    type: 'Green',
    label: 'Зелёный',
    header: 'resume racing',
    text: 'green flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'yellow',
    type: 'Yellow',
    label: 'Жёлтый',
    header: 'accident ahead',
    text: 'yellow flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'red',
    type: 'Red',
    label: 'Красный',
    header: 'session is suspended',
    text: 'red flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'blue',
    type: 'Blue',
    label: 'Синий',
    header: 'let others by',
    text: 'blue flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'debris',
    type: 'Debris',
    label: 'Мусор на трассе',
    header: 'debris on track',
    text: 'debris',
    category: 'global',
    enabled: true,
  },
  {
    id: 'crossed',
    type: 'Crossed',
    label: 'Скрещённые',
    header: 'Crossed',
    text: 'crossed',
    category: 'global',
    enabled: true,
  },
  {
    id: 'oneLapToGreen',
    type: 'OneLapToGreen',
    label: 'Круг до зелёного',
    header: 'One lap to green',
    text: 'session flag',
    category: 'global',
    enabled: false,
  },
  {
    id: 'tenToGo',
    type: 'TenToGo',
    label: '10 кругов до финиша',
    header: '10 laps to go',
    text: 'session flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'fiveToGo',
    type: 'FiveToGo',
    label: '5 кругов до финиша',
    header: '5 laps to go',
    text: 'session flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'randomWaving',
    type: 'RandomWaving',
    label: 'Случайный',
    header: 'Random flag',
    text: 'random flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'caution',
    type: 'Caution',
    label: 'Нейтрализация',
    header: 'Caution',
    text: 'caution flag',
    category: 'global',
    enabled: true,
  },
  {
    id: 'black',
    type: 'Black',
    label: 'Чёрный',
    header: 'Penalty',
    text: 'black flag',
    category: 'black',
    enabled: true,
  },
  {
    id: 'disqualify',
    type: 'Disqualify',
    label: 'Дисквалификация',
    header: 'You got disqualified',
    text: 'black flag',
    category: 'black',
    enabled: true,
  },
  {
    id: 'furled',
    type: 'Furled',
    label: 'Срезка трассы',
    header: 'You cut the track',
    text: 'black flag',
    category: 'black',
    enabled: true,
  },
  {
    id: 'repair',
    type: 'Repair',
    label: 'Обязательный ремонт',
    header: 'Required repair',
    text: 'black flag',
    category: 'black',
    enabled: true,
  },
  {
    id: 'startReady',
    type: 'StartReady',
    label: 'Старт: готовность',
    header: 'Get ready',
    text: 'start lights',
    category: 'start',
    enabled: true,
  },
  {
    id: 'startSet',
    type: 'StartSet',
    label: 'Старт: внимание',
    header: 'Get ready',
    text: 'start lights',
    category: 'start',
    enabled: true,
  },
  {
    id: 'startGo',
    type: 'StartGo',
    label: 'Старт: go',
    header: 'Go!',
    text: 'start lights',
    category: 'start',
    enabled: true,
  },
];

/** Detail flags that show the entry of a related flag. */
export const rFlagAliases: Readonly<Record<string, string>> = {
  greenHeld: 'green',
  yellowWaving: 'yellow',
  cautionWaving: 'caution',
};

const flagGroup = (entry: RFlagEntry): SettingsGroup => ({
  label: entry.label,
  settings: [
    {
      key: `Flags.${entry.type}.enabled`,
      label: 'Включить',
      type: 'boolean',
      default: entry.enabled,
    },
    {
      key: `Flags.${entry.type}.headerText`,
      label: 'Заголовок',
      type: 'text',
      default: entry.header,
      maxLength: 60,
    },
    {
      key: `Flags.${entry.type}.flagText`,
      label: 'Текст флага',
      type: 'text',
      default: entry.text,
      maxLength: 60,
    },
  ],
});

const categoryPage = (id: string, label: string, category: RFlagCategory) => ({
  id,
  label,
  groups: rFlagEntries.filter((entry) => entry.category === category).map(flagGroup),
});

export const rPreviewFlag: SettingDefinition = {
  key: 'ShowFlagInPreview',
  label: 'Флаг в предпросмотре',
  description: 'Какой флаг показывать в демо-режиме и при настройке расположения.',
  type: 'select',
  default: 'green',
  options: rFlagEntries.map((entry) => ({ value: entry.id, label: entry.label })),
};

export const rFlags: OverlayDefinition = {
  kind: 'r-flags',
  name: 'R-Flags',
  category: 'race',
  defaultBounds: { x: 40, y: 80, width: 200, height: 56 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            settings: [
              ...rAppearanceSettings({
                fontSize: 14,
                opacity: 0.8,
                showTitle: true,
                titleColor: false,
              }),
              { key: 'EnableAnimation', label: 'Анимация', type: 'boolean', default: true },
              rPreviewFlag,
            ],
          },
        ],
      },
      categoryPage('global', 'Основные флаги', 'global'),
      categoryPage('black', 'Чёрные флаги', 'black'),
      categoryPage('start', 'Стартовые флаги', 'start'),
    ],
  },
};
