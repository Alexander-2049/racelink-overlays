import { useEffect, useRef, type RefObject } from 'react';
import { useViewportSize } from '../r-common/useFitFont';

/** The part of the game's screen an overlay shows, in its units. */
export interface Stage {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * A canvas that shows `stage` as large as the window allows, keeping its
 * proportions. `draw` gets the context in game units and returns whether it
 * animates. The canvas is drawn again only after new data, a new size or a
 * texture (`loadTextures` calls back as each one arrives), or while the last
 * drawing animated: several overlays redrawing every frame for nothing make
 * the whole desktop sluggish.
 */
export const useCanvasStage = (
  stage: Stage,
  draw: (context: CanvasRenderingContext2D, now: number) => boolean,
  loadTextures: (onLoad: () => void) => () => void,
): {
  readonly canvas: RefObject<HTMLCanvasElement | null>;
  readonly width: number;
  readonly height: number;
} => {
  const viewport = useViewportSize();
  const canvas = useRef<HTMLCanvasElement>(null);
  const latestDraw = useRef(draw);
  const dirty = useRef(true);
  useEffect(() => {
    latestDraw.current = draw;
    dirty.current = true;
  });

  const scale = Math.min(viewport.width / stage.width, viewport.height / stage.height);
  const width = Math.max(1, Math.floor(stage.width * scale));
  const height = Math.max(1, Math.floor(stage.height * scale));

  useEffect(() => {
    const stopLoading = loadTextures(() => {
      dirty.current = true;
    });
    let frame = 0;
    let animating = true;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const element = canvas.current;
      const context = element?.getContext('2d');
      if (!element || !context) return;
      const ratio = window.devicePixelRatio || 1;
      const pixelWidth = Math.max(1, Math.round(element.clientWidth * ratio));
      const pixelHeight = Math.max(1, Math.round(element.clientHeight * ratio));
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth;
        element.height = pixelHeight;
        dirty.current = true;
      }
      if (!dirty.current && !animating) return;
      dirty.current = false;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, pixelWidth, pixelHeight);
      const zoom = (element.clientWidth / stage.width) * ratio;
      context.setTransform(zoom, 0, 0, zoom, -stage.x * zoom, -stage.y * zoom);
      context.imageSmoothingQuality = 'high';
      animating = latestDraw.current(context, now);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      stopLoading();
    };
  }, [stage, loadTextures]);

  return { canvas, width, height };
};
