import { useEffect, useRef } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { num } from '../r-common/rSettings';
import { loadCommonTextures } from '../nfsmw-common/textures';
import { useViewportSize } from '../r-common/useFitFont';
import { chyronOf, drawChyron, hideMs, holdMs, stage, type Chyron } from './scene';
import { loadTextures, texture } from './textures';

const topics: readonly TelemetryTopic[] = ['connection', 'system'];

/** What is on screen: the chyron of a track since a moment, or nothing. */
interface Showing {
  readonly chyron: Chyron;
  readonly startedAt: number;
}

/** While the layout is edited the chyron stands open, so it can be placed. */
const editSample = chyronOf('Shapeshifter', 'Celldweller feat. Styles Of Beyond', null);
/** A moment of the chyron when it is fully open. */
const openMs = 2000;

/** A track waiting for its chyron. */
interface Pending {
  readonly key: string;
  readonly chyron: Chyron;
  readonly at: number;
}

/**
 * NFSMW-EA Trax: the game's "now playing" chyron. It comes a while after a
 * track starts, stays for about five seconds and folds away.
 */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const media = overlay.telemetry.system.media;
  // In demo mode the chyron comes at once, so the look is seen without waiting.
  const delayMs = overlay.demoMode
    ? 0
    : Math.max(0, num(overlay.settings.values, 'delaySeconds', 3)) * 1000;
  const viewport = useViewportSize();
  const canvas = useRef<HTMLCanvasElement>(null);
  const pending = useRef<Pending | null>(null);
  const showing = useRef<Showing | null>(null);
  const lastKey = useRef<string | null>(null);
  const dirty = useRef(true);
  const editing = useRef<Chyron | null>(null);

  const playing = media?.status === 'playing' ? media : null;
  const key = playing?.trackKey ?? null;
  const title = playing?.title ?? '';
  const artist = playing?.artist ?? null;
  const album = playing?.album ?? null;

  // A new track: its chyron comes after the delay. Pausing or stopping before
  // then cancels it.
  useEffect(() => {
    if (key === null) {
      pending.current = null;
      return;
    }
    if (key === lastKey.current) return;
    lastKey.current = key;
    pending.current = {
      key,
      chyron: chyronOf(title, artist, album),
      at: performance.now() + delayMs,
    };
  }, [key, title, artist, album, delayMs]);

  // In edit mode the chyron of what plays (or a sample) stands open.
  const editChyron = overlay.editMode
    ? playing
      ? chyronOf(title, artist, album)
      : editSample
    : null;
  useEffect(() => {
    editing.current = editChyron;
    dirty.current = true;
  });

  const scale = Math.min(viewport.width / stage.width, viewport.height / stage.height);
  const width = Math.max(1, Math.floor(stage.width * scale));
  const height = Math.max(1, Math.floor(stage.height * scale));

  useEffect(() => {
    dirty.current = true;
  }, [width, height]);

  useEffect(() => {
    const stopLoading = loadTextures(() => {
      dirty.current = true;
    });
    // The game's font is shared with the other NFSMW- overlays.
    const stopLoadingFont = loadCommonTextures(() => {
      dirty.current = true;
    });
    let frame = 0;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const waiting = pending.current;
      if (waiting && now >= waiting.at) {
        // The newest track replaces whatever shows.
        showing.current = { chyron: waiting.chyron, startedAt: now };
        pending.current = null;
      }
      const current = showing.current;
      if (current && now - current.startedAt >= holdMs + hideMs) {
        showing.current = null;
        dirty.current = true;
      }
      const still = editing.current;
      // The open chyron of the edit mode is drawn again only when something changes.
      if (!showing.current && !dirty.current) return;
      dirty.current = false;
      const element = canvas.current;
      const context = element?.getContext('2d');
      if (!element || !context) return;
      const ratio = window.devicePixelRatio || 1;
      const pixelWidth = Math.max(1, Math.round(element.clientWidth * ratio));
      const pixelHeight = Math.max(1, Math.round(element.clientHeight * ratio));
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth;
        element.height = pixelHeight;
      }
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, pixelWidth, pixelHeight);
      const shown = showing.current;
      if (!shown && !still) return;
      const zoom = (element.clientWidth / stage.width) * ratio;
      context.setTransform(zoom, 0, 0, zoom, -stage.x * zoom, -stage.y * zoom);
      context.imageSmoothingQuality = 'high';
      if (shown) drawChyron(context, shown.chyron, now - shown.startedAt, now, texture);
      else if (still) drawChyron(context, still, openMs, now, texture);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      stopLoading();
      stopLoadingFont();
    };
  }, []);

  return (
    <div className="nfsmwEaTrax">
      <canvas ref={canvas} style={{ width, height }} />
    </div>
  );
}
