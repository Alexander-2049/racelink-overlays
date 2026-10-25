import type { OverlayDefinition } from '../overlayCatalog.js';
import { rAppearanceSettings } from './common.js';
import { rPreviewFlag } from './flags.js';

export const rDigiflag: OverlayDefinition = {
  kind: 'r-digiflag',
  name: 'R-Digiflag',
  category: 'race',
  defaultBounds: { x: 40, y: 80, width: 210, height: 210 },
  defaultEnabled: false,
  settings: {
    pages: [
      {
        id: 'general',
        label: 'Основное',
        groups: [
          {
            settings: [
              {
                key: 'Type',
                label: 'Тип',
                type: 'select',
                default: 'big',
                options: [
                  { value: 'big', label: 'Большой' },
                  { value: 'small', label: 'Малый' },
                  { value: 'doublestrip', label: 'Две полосы' },
                ],
              },
              {
                key: 'HideWhenNoFlag',
                label: 'Скрывать, когда не активен',
                type: 'boolean',
                default: false,
              },
              rPreviewFlag,
            ],
          },
          {
            label: 'Настройки полос',
            settings: [
              {
                key: 'DoubleStripDistance',
                label: 'Дистанция между',
                type: 'number',
                default: 200,
                min: 0,
                max: 1000,
                step: 1,
                unit: 'px',
                visibleIf: { Type: 'doublestrip' },
              },
            ],
          },
          { label: 'Вид', settings: rAppearanceSettings({ fontSize: 14, opacity: 0.8 }) },
        ],
      },
    ],
  },
};
