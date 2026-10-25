import { memo } from 'react';
import {
  rWidgets,
  widgetSlotCount,
  widgetSlotKey,
  type RWidgetId,
  type WidgetBar as BarId,
} from '../../../../../shared/contracts/rCatalog/widgets';
import type { OverlaySettingsView } from '../../model/useRacingOverlay';
import { bool, num, str } from '../rSettings';
import type { WidgetData } from './data';
import { barWidgets } from './bars';
import { renderWidget } from './registry';
import { ThemedWidget } from './ThemedWidget';
import type { WidgetIconType, WidgetTheme, WidgetThemeSettings } from './themes';

type Values = OverlaySettingsView['values'];

const themes: readonly WidgetTheme[] = [
  'default',
  'hex',
  'glass',
  'carbon',
  'slider',
  'lcd',
  'transparent',
  'stripe',
];
const iconTypes: readonly WidgetIconType[] = ['ICON', 'TEXT', 'NONE'];

const slotTheme = (
  values: Values,
  bar: BarId,
  index: number,
): { settings: WidgetThemeSettings; iconType: WidgetIconType } => {
  const key = (field: string) => widgetSlotKey(bar, index, field);
  const themeName = str(values, key('Theme'), 'transparent');
  const iconName = str(values, key('IconType'), 'ICON');
  return {
    iconType: iconTypes.find((type) => type === iconName) ?? 'ICON',
    settings: {
      theme: themes.find((theme) => theme === themeName) ?? 'transparent',
      opacity: num(values, key('Opacity'), 0.8),
      colors: {
        background: bool(values, key('BackgroundColorEnabled'), false)
          ? str(values, key('BackgroundColor'), '#000000')
          : undefined,
        icon: bool(values, key('IconColorEnabled'), false)
          ? str(values, key('OverlayLabelOrIconColor'), '#444444')
          : undefined,
        value: bool(values, key('ValueColorEnabled'), false)
          ? str(values, key('ValueColor'), '#ffffff')
          : undefined,
      },
      scrollTextEnabled: bool(values, key('ScrollTextEnabled'), false),
      scrollTextSpeed: 10,
      fixedWidth: bool(values, key('FixedWidth'), false),
      width: num(values, key('Width'), 120),
    },
  };
};

type SlotProps = Readonly<{
  bar: BarId;
  index: number;
  values: Values;
  data: WidgetData;
}>;

/** One widget of a bar, or nothing when the slot is empty. */
export const WidgetSlot = memo(function WidgetSlot({ bar, index, values, data }: SlotProps) {
  const id = barWidgets(values, bar, index + 1)[index] ?? 'None';
  const widget = renderWidget(id, data);
  if (widget === null) return null;
  const { settings, iconType } = slotTheme(values, bar, index);
  return (
    <ThemedWidget
      themeSettings={settings}
      widgetSizeCategory={widget.size}
      classNames={widget.className}
      title={{ show: iconType, icon: widget.icon, text: widget.text }}
    >
      {widget.value}
    </ThemedWidget>
  );
});

type Props = Readonly<{
  bar: BarId;
  values: Values;
  data: WidgetData;
  className: string;
  slots?: number;
}>;

/** The row of up to four widgets above or below the driver list. */
export const WidgetBar = memo(function WidgetBar({
  bar,
  values,
  data,
  className,
  slots = widgetSlotCount,
}: Props) {
  return (
    <div className={className}>
      {Array.from({ length: slots }, (_, index) => (
        <WidgetSlot key={index} bar={bar} index={index} values={values} data={data} />
      ))}
    </div>
  );
});
