// The textures the NFSMW- overlays share: the game's HUD artwork and its font.
const urls = import.meta.glob<string>(['./hud/*.png', './font/*.png'], {
  eager: true,
  query: '?url',
  import: 'default',
});

const images = new Map<string, HTMLImageElement>();
let pending = 0;
const listeners = new Set<() => void>();

/** Starts loading every texture once; `onLoad` runs as each one arrives. */
export const loadCommonTextures = (onLoad: () => void): (() => void) => {
  listeners.add(onLoad);
  if (images.size === 0) {
    for (const [file, url] of Object.entries(urls)) {
      const name = file.replace(/^.*\//, '').replace('.png', '');
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

export const commonTexturesReady = (): boolean => images.size > 0 && pending === 0;

/** A loaded texture by its file name without extension, lower case. */
export const commonTexture = (name: string): HTMLImageElement | null => {
  const image = images.get(name);
  return image && image.complete && image.naturalWidth > 0 ? image : null;
};
