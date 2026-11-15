import { useEffect, useState } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import type { Settings } from './racelink-settings';

export type Overlay = RacelinkOverlay<Settings>;

/** A counter that changes whenever telemetry or settings change, at most `maxHz` times a second. */
export const useOverlayRevision = (overlay: Overlay, maxHz: number): number => {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const minGap = 1000 / maxHz;
    let last = 0;
    let timer = 0;
    const publish = (): void => {
      timer = 0;
      last = performance.now();
      setRevision((value) => value + 1);
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
  return revision;
};
