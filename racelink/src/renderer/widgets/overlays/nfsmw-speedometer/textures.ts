import layout from './textures/layout.json';

export { tint, type Rgba } from '../nfsmw-common/tint';

/** Where a cropped full-screen texture sits on a 1920x1080 screen. */
export interface ScreenBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

const urls = import.meta.glob<string>('./textures/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const images = new Map<string, HTMLImageElement>();
let pending = 0;
const listeners = new Set<() => void>();

/** Starts loading every texture once; `onLoad` runs as each one arrives. */
export const loadTextures = (onLoad: () => void): (() => void) => {
  listeners.add(onLoad);
  if (images.size === 0) {
    for (const [file, url] of Object.entries(urls)) {
      const name = file.replace('./textures/', '').replace('.png', '');
      const image = new Image();
      pending += 1;
      image.onload = image.onerror = () => {
        pending -= 1;
        for (const listener of listeners) listener();
      };
      image.src = url;
      images.set(name, image);
    }
  }
  return () => {
    listeners.delete(onLoad);
  };
};

export const texturesReady = (): boolean => images.size > 0 && pending === 0;

/** A loaded texture by its file name without extension, lower case. */
export const texture = (name: string): HTMLImageElement | null => {
  const image = images.get(name);
  return image && image.complete && image.naturalWidth > 0 ? image : null;
};

/** Screen boxes of the cropped digit, gear and unit textures. */
export const screenBoxes: Readonly<Record<string, ScreenBox>> = layout;
