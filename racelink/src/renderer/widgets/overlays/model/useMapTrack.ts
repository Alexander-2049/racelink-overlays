import { useEffect, useState } from 'react';
import { fetchTrack } from '@racelink/overlay';
import type { TrackGeometry } from '../../../../shared/contracts/track';

let demoTrack: Promise<TrackGeometry | null> | null = null;

/** The demo track from Racelink's assets, asked for once per page; a failure is asked again. */
const loadDemoTrack = (): Promise<TrackGeometry | null> => {
  demoTrack ??= fetchTrack('demo').then((track) => {
    if (!track) demoTrack = null;
    return track;
  });
  return demoTrack;
};

/**
 * The track a map draws. In demo mode that is the demo track from Racelink's
 * assets (`/v2/assets/tracks/demo.json`), whether the demo frames carry a track
 * or not (a demo of a game without maps, a Studio preview); without Racelink it
 * is the frames' own track.
 */
export const useMapTrack = (
  track: TrackGeometry | null,
  demoMode: boolean,
): TrackGeometry | null => {
  const [demo, setDemo] = useState<TrackGeometry | null>(null);
  useEffect(() => {
    if (!demoMode || demo) return;
    let active = true;
    void loadDemoTrack().then((loaded) => {
      if (active && loaded) setDemo(loaded);
    });
    return () => {
      active = false;
    };
  }, [demoMode, demo]);
  return demoMode ? (demo ?? track) : track;
};
