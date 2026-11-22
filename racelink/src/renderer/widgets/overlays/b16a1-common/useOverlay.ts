import { useEffect, useState } from 'react';
import type { OverlayStatus, RacelinkOverlay, TelemetryTopics } from '@racelink/overlay';

export type OverlayState<S> = Readonly<{
  telemetry: TelemetryTopics;
  settings: S;
  status: OverlayStatus;
  editMode: boolean;
}>;

const read = <S>(overlay: RacelinkOverlay<S>): OverlayState<S> => ({
  telemetry: overlay.telemetry,
  settings: overlay.settings,
  status: overlay.status,
  editMode: overlay.editMode,
});

/** Telemetry, settings and status, rendered at most `maxHz` times a second. */
export const useOverlay = <S>(overlay: RacelinkOverlay<S>, maxHz: number): OverlayState<S> => {
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
      overlay.on('host', publish),
    ];
    return () => {
      for (const unsubscribe of off) unsubscribe();
      window.clearTimeout(timer);
    };
  }, [overlay, maxHz]);
  return state;
};
