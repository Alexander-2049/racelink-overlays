// The strip of small facts above the rows of the standings and the relatives.
import type { ReactNode } from 'react';
import type { TelemetryTopics } from '@racelink/overlay';
import {
  formatPercent,
  formatSof,
  formatTemperature,
  formatTimeOfDay,
  formatClockTime,
  type TemperatureUnit,
} from './format.ts';
import {
  IconAirTemp,
  IconClock,
  IconDrivers,
  IconDrop,
  IconIncidents,
  IconOil,
  IconTrackTemp,
  IconWater,
} from './Icons';
import {
  incidentsText,
  lapCounterText,
  sessionClockText,
  sessionLetter,
  type ClockMode,
} from './sessionInfo.ts';

export type InfoId =
  | 'session'
  | 'laps'
  | 'airTemp'
  | 'trackTemp'
  | 'humidity'
  | 'sof'
  | 'drivers'
  | 'incidents'
  | 'waterTemp'
  | 'oilTemp'
  | 'clock';

export type InfoContext = Readonly<{
  telemetry: TelemetryTopics;
  tempUnit: 'auto' | TemperatureUnit;
  clockMode: ClockMode;
  lapDecimals: number;
  /** The lap shown in the lap counter. */
  lap: number | null;
  /** Competitors in the session. */
  drivers: number;
  clockSource?: 'real' | 'game';
  hour12?: boolean;
  /** Redraws on this: the clock chip shows the real time. */
  now?: number;
}>;

const unitOf = (context: InfoContext): TemperatureUnit =>
  context.tempUnit === 'auto'
    ? context.telemetry.session.displayUnits === 'imperial'
      ? 'fahrenheit'
      : 'celsius'
    : context.tempUnit;

type Chip = Readonly<{ icon: ReactNode; text: string; label?: string }>;

/** A chip for an item; null when the game gives nothing to show. */
const chipOf = (id: InfoId, context: InfoContext): Chip | null => {
  const { telemetry } = context;
  const unit = unitOf(context);
  const some = (text: string, icon: ReactNode): Chip | null =>
    text === '' ? null : { icon, text };
  switch (id) {
    case 'session': {
      const { session } = telemetry;
      return {
        icon: null,
        label: sessionLetter(session.type),
        text: sessionClockText(session, context.clockMode),
      };
    }
    case 'laps':
      return some(
        lapCounterText(context.lap, telemetry.session, context.lapDecimals),
        null,
      );
    case 'airTemp':
      return some(formatTemperature(telemetry.weather.airTemperatureC, unit), <IconAirTemp />);
    case 'trackTemp':
      return some(formatTemperature(telemetry.weather.trackTemperatureC, unit), <IconTrackTemp />);
    case 'humidity':
      return some(formatPercent(telemetry.weather.humidityFraction), <IconDrop />);
    case 'sof': {
      const sof = formatSof(telemetry.session.strengthOfField);
      return sof === '' ? null : { icon: null, label: 'SOF', text: sof };
    }
    case 'drivers':
      return context.drivers > 0
        ? { icon: <IconDrivers />, text: String(context.drivers) }
        : null;
    case 'incidents':
      return some(incidentsText(telemetry.session.ext.iracing?.incidents), <IconIncidents />);
    case 'waterTemp':
      return some(
        formatTemperature(telemetry.vehicle.engine?.waterTemperatureC, unit),
        <IconWater />,
      );
    case 'oilTemp':
      return some(formatTemperature(telemetry.vehicle.engine?.oilTemperatureC, unit), <IconOil />);
    case 'clock': {
      const hour12 = context.hour12 === true;
      const text =
        context.clockSource === 'game'
          ? formatTimeOfDay(telemetry.session.timeOfDaySeconds, hour12)
          : formatClockTime(new Date(context.now ?? Date.now()), hour12);
      return some(text, <IconClock />);
    }
  }
};

export function InfoStrip({
  items,
  context,
}: Readonly<{ items: readonly Readonly<{ id: InfoId; visible: boolean }>[]; context: InfoContext }>) {
  const chips = items
    .filter((item) => item.visible)
    .map((item) => ({ id: item.id, chip: chipOf(item.id, context) }))
    .filter((entry): entry is { id: InfoId; chip: Chip } => entry.chip !== null);
  return (
    <div className="wh-chips">
      {chips.map(({ id, chip }, index) => (
        <span key={id} className={index === 0 ? 'wh-chip wh-chip--first' : 'wh-chip'}>
          {chip.label !== undefined && <span className="wh-label wh-chip-label">{chip.label}</span>}
          {chip.icon}
          <span className="wh-mono">{chip.text}</span>
        </span>
      ))}
    </div>
  );
}
