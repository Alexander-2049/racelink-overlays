import {
  rWidgets,
  widgetSlotCount,
  widgetSlotKey,
  type RWidgetId,
  type WidgetBar as BarId,
} from '../../../../../shared/contracts/rCatalog/widgets';
import type { OverlaySettingsView } from '../../model/useRacingOverlay';
import { str } from '../rSettings';

type Values = OverlaySettingsView['values'];

const widgetIds = new Set<string>(rWidgets.map((widget) => widget.id));
const isWidgetId = (value: string): value is RWidgetId => widgetIds.has(value);

/** The widget ids chosen for a bar, left to right. */
export const barWidgets = (
  values: Values,
  bar: BarId,
  slots: number = widgetSlotCount,
): RWidgetId[] =>
  Array.from({ length: slots }, (_, index) => {
    const id = str(values, widgetSlotKey(bar, index, 'Widget'), 'None');
    return isWidgetId(id) ? id : 'None';
  });

export const barHasWidgets = (
  values: Values,
  bar: BarId,
  slots: number = widgetSlotCount,
): boolean => barWidgets(values, bar, slots).some((id) => id !== 'None');
