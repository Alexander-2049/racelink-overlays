// The radar's textures, from the game's race HUD texture pack (HUDTEXRACE.BIN).
const urls = import.meta.glob<string>('./textures/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const images = new Map<string, HTMLImageElement>();
let pending = 0;
const listeners = new Set<() => void>();

/** Starts loading the textures once; `onLoad` runs as each one arrives. */
export const loadRadarTextures = (onLoad: () => void): (() => void) => {
  listeners.add(onLoad);
  if (images.size === 0)
    for (const [file, url] of Object.entries(urls)) {
      const image = new Image();
      pending += 1;
      image.onload = image.onerror = () => {
        pending -= 1;
        for (const listener of listeners) listener();
      };
      image.src = url;
      images.set(file.replace(/^.*\//, '').replace('.png', ''), image);
    }
  return () => {
    listeners.delete(onLoad);
  };
};

export const radarTexturesReady = (): boolean => images.size > 0 && pending === 0;

/** A loaded texture by its file name without extension. */
export const radarTexture = (name: string): HTMLImageElement | null => {
  const image = images.get(name);
  return image && image.complete && image.naturalWidth > 0 ? image : null;
};
