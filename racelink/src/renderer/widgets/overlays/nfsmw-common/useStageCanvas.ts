import type { RefObject } from 'react';
import { useCanvasStage, type Stage } from './stageCanvas';
import { loadCommonTextures } from './textures';

export type { Stage } from './stageCanvas';

/** `useCanvasStage` with the textures the NFSMW- overlays share. */
export const useStageCanvas = (
  stage: Stage,
  draw: (context: CanvasRenderingContext2D, now: number) => boolean,
): {
  readonly canvas: RefObject<HTMLCanvasElement | null>;
  readonly width: number;
  readonly height: number;
} => useCanvasStage(stage, draw, loadCommonTextures);
