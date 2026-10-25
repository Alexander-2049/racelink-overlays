import type { SelectOption } from '../../overlay-api/settings.js';
import { invokerCombos } from '../dotaInvoker.js';
import type { OverlayDefinition } from '../overlayCatalog.js';
import { choice, toggle, type RowDefaults } from '../rCatalog/rowPages.js';

const defaults: RowDefaults = {};
const option = (value: string, label: string): SelectOption => ({ value, label });
/** Shown until the user picks: the two examples of the combo list. */
const defaultCombos = new Set(['snap-tornado-meteor', 'snap-tornado-sunstrike']);
const combosShown = { showCombos: true };

/** Invoker Spell Cooldown: the ten invoked spells with their cooldowns, as the game's ability bar draws them. */
export const dotaInvokerCooldowns: OverlayDefinition = {
  kind: 'dota-invoker-cooldowns',
  name: 'Invoker Spell Cooldown',
  category: 'other',
  // One game pixel per unit at 1080p, above the ability bar.
  defaultBounds: { x: 630, y: 860, width: 660, height: 66 },
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
                'orientation',
                'Расположение',
                [option('row', 'В ряд'), option('column', 'В столбец')],
                'row',
              ),
              toggle(defaults, 'showSpells', 'Способности', true),
              toggle(defaults, 'onlyCooling', 'Только способности на перезарядке', false, {
                description:
                  'Готовые способности не показываются; остальные стоят с начала ряда, размер не меняется.',
              }),
              choice(
                defaults,
                'showWhen',
                'Когда показывать',
                [option('always', 'Всегда'), option('held', 'Пока зажата клавиша')],
                'always',
                {
                  description:
                    'Клавишу Racelink читает сам и только пока Dota на переднем плане (только Windows). В режиме редактирования оверлей виден всегда.',
                },
              ),
              choice(
                defaults,
                'holdKey',
                'Клавиша',
                [
                  option('alt', 'Alt'),
                  option('ctrl', 'Ctrl'),
                  option('shift', 'Shift'),
                  option('space', 'Пробел'),
                  option('tab', 'Tab'),
                  option('capslock', 'Caps Lock'),
                  option('mouse3', 'Средняя кнопка мыши'),
                  option('mouse4', 'Боковая кнопка мыши 1'),
                  option('mouse5', 'Боковая кнопка мыши 2'),
                ],
                'alt',
                { visibleIf: { showWhen: 'held' } },
              ),
              toggle(defaults, 'showTimer', 'Секунды до готовности', true),
              toggle(defaults, 'showMana', 'Синие иконки, когда не хватает маны', true, {
                description:
                  'Как на панели способностей игры: способность, на которую не хватает маны, синеет.',
              }),
            ],
          },
        ],
      },
      {
        id: 'combos',
        label: 'Прокасты',
        groups: [
          {
            settings: [
              toggle(defaults, 'showCombos', 'Показывать прокасты', false, {
                description:
                  'Квадрат из кусочков способностей прокаста: синеет, если на весь прокаст не хватает маны, и считает секунды, пока не будут готовы все его способности.',
              }),
              {
                key: 'order.combos',
                label: 'Какие прокасты и в каком порядке',
                type: 'order',
                hideable: true,
                items: invokerCombos.map((combo) => option(combo.id, combo.label)),
                default: invokerCombos.map((combo) => ({
                  id: combo.id,
                  visible: defaultCombos.has(combo.id),
                })),
                visibleIf: combosShown,
              },
              choice(
                defaults,
                'comboStyle',
                'Как делить квадрат',
                [
                  option('strips', 'Полосы'),
                  option('diagonal', 'Наискосок'),
                  option('pie', 'Секторы'),
                ],
                'strips',
                { visibleIf: combosShown },
              ),
              choice(
                defaults,
                'comboMana',
                'Мана',
                [
                  option('missing', 'Сколько не хватает'),
                  option('cost', 'Стоимость прокаста'),
                  option('none', 'Не показывать число'),
                ],
                'missing',
                { visibleIf: combosShown },
              ),
              choice(
                defaults,
                'comboPlace',
                'Где',
                [option('after', 'После способностей'), option('before', 'Перед способностями')],
                'after',
                { visibleIf: combosShown },
              ),
            ],
          },
        ],
      },
    ],
  },
  orderVisibility: {
    'order.combos': Object.fromEntries(
      invokerCombos.map((combo) => [combo.id, `combo.${combo.id}`]),
    ),
  },
};
