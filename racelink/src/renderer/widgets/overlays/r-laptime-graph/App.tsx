import { useMemo } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, rFontFace } from '../r-common/rSettings';
import { useViewportSize } from '../r-common/useFitFont';
import { LapTimeGraph, type GraphLap } from './LapTimeGraph';

const topics: readonly TelemetryTopic[] = ['connection', 'timing'];

/** The default window is 300 px tall at a 14 px font. */
const designHeight = 300;

const median = (values: readonly number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
};

/** LapTime Graph: the session's lap times; the chart fills the window. */
export default function App() {
  const overlay = useRacingOverlay(topics, 4);
  const { values } = overlay.settings;
  const viewport = useViewportSize();
  const fontSize = Math.min(48, Math.max(8, (14 * viewport.height) / designHeight));
  const general = { ...readGeneral(values), fontSize };
  const history = overlay.telemetry.timing.history;
  const limit = bool(values, 'LimitLapCount', true)
    ? Math.round(num(values, 'LapCount', 20))
    : Infinity;
  const filterOn = bool(values, 'IsFilterOn', false);
  const lower = num(values, 'FilterOutLower', 5);
  const higher = num(values, 'FilterOutHigher', 5);

  const laps = useMemo((): readonly GraphLap[] => {
    let list = [...history]
      .reverse()
      .filter((lap) => lap.lapTimeSeconds > 0)
      .map((lap, index) => ({
        lapNumber: lap.lapNumber ?? index + 1,
        seconds: lap.lapTimeSeconds,
      }));
    if (filterOn && list.length > 0) {
      const middle = median(list.map((lap) => lap.seconds));
      list = list.filter((lap) => lap.seconds >= middle - lower && lap.seconds <= middle + higher);
    }
    return Number.isFinite(limit) ? list.slice(Math.max(0, list.length - limit)) : list;
  }, [history, filterOn, lower, higher, limit]);

  return (
    <RContainer
      general={general}
      title="laptime graph"
      titlePlacement="top"
      className="LapTimeGraphOverlay"
      style={{ width: '100%', height: '100%' }}
    >
      <LapTimeGraph
        laps={laps}
        scale={fontSize / 9}
        fontFamily={rFontFace(general.fontFamily, general.fontWeight)}
      />
    </RContainer>
  );
}
