import type { TelemetryTopics } from '@racelink/overlay';
import { formatClock, formatRating } from './format';
import { titleKanji } from './phrases';
import type { Settings } from './racelink-settings';

type ItemId = Settings['headerItems'][number]['id'];

const sessionNames: Readonly<Record<TelemetryTopics['session']['type'], string>> = {
  practice: 'PRACTICE',
  qualify: 'QUALIFY',
  race: 'RACE',
  warmup: 'WARMUP',
  testing: 'TESTING',
  hotlap: 'HOTLAP',
  other: 'SESSION',
};

const item = (id: ItemId, telemetry: TelemetryTopics): string | null => {
  const { session, weather } = telemetry;
  switch (id) {
    case 'session':
      return sessionNames[session.type];
    case 'remaining':
      if (session.lapsTotal !== null && session.lapsTotal > 0 && session.lapsTotal < 10000)
        return `LAP ${String(session.lap)}/${String(session.lapsTotal)}`;
      return session.timeRemainingSeconds === null ||
        !Number.isFinite(session.timeRemainingSeconds) ||
        session.timeRemainingSeconds < 0
        ? `LAP ${String(session.lap)}`
        : formatClock(session.timeRemainingSeconds);
    case 'sof':
      return session.strengthOfField === null
        ? null
        : `SOF ${formatRating(session.strengthOfField)}`;
    case 'incidents': {
      const incidents = session.ext.iracing?.incidents;
      if (incidents === undefined || incidents.count === null) return null;
      return incidents.limit === null || incidents.limit <= 0
        ? `${String(incidents.count)}x`
        : `${String(incidents.count)}x / ${String(incidents.limit)}x`;
    }
    case 'trackTemp':
      return weather.trackTemperatureC === null
        ? null
        : `${weather.trackTemperatureC.toFixed(0)}°C`;
  }
};

type Props = Readonly<{ telemetry: TelemetryTopics; items: Settings['headerItems'] }>;

/** The title plate and the session chips above the rows. */
export function Header({ telemetry, items }: Props) {
  const chips = items
    .filter((entry) => entry.visible)
    .map((entry) => ({ id: entry.id, text: item(entry.id, telemetry) }))
    .filter((chip): chip is { id: ItemId; text: string } => chip.text !== null);
  return (
    <div className="header">
      <div className="title">
        <span className="titleKanji">{titleKanji}</span>
        <span className="titleText">RELATIVE</span>
      </div>
      <div className="chips">
        {chips.map((chip) => (
          <span key={chip.id} className={`chip chip-${chip.id}`}>
            {chip.text}
          </span>
        ))}
      </div>
    </div>
  );
}
