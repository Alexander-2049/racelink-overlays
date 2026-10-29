import { useEffect, useState } from 'react';
import type { OverlayStatus, RacelinkOverlay, TelemetryTopics } from '@racelink/overlay';
import type { Settings } from './racelink-settings';

export type Overlay = RacelinkOverlay<Settings>;

export type OverlayState = Readonly<{
  telemetry: TelemetryTopics;
  settings: Settings;
  status: OverlayStatus;
}>;

const read = (overlay: Overlay): OverlayState => ({
  telemetry: overlay.telemetry,
  settings: overlay.settings,
  status: overlay.status,
});

/** Telemetry, settings and status, rendered at most `maxHz` times a second. */
export const useOverlay = (overlay: Overlay, maxHz: number): OverlayState => {
  const [state, setState] = useState(() => read(overlay));
  useEffect(() => {
    const minGap = 1000 / maxHz;
    let last = 0;
    let timer = 0;
    const publish = (): void => {
      timer = 0;
      last = performance.now();
      setState(read(overlay));
    };
    const schedule = (): void => {
      if (timer !== 0) return;
      timer = window.setTimeout(publish, Math.max(0, last + minGap - performance.now()));
    };
    const off = [
      overlay.on('telemetry', schedule),
      overlay.on('settings', publish),
      overlay.on('status', publish),
    ];
    return () => {
      for (const unsubscribe of off) unsubscribe();
      window.clearTimeout(timer);
    };
  }, [overlay, maxHz]);
  return state;
};
