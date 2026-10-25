const urls = import.meta.glob<string>('./assets/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const images = new Map<string, HTMLImageElement>();

/** Starts loading the textures once; `onLoad` runs as each one arrives. */
export const loadTextures = (onLoad: () => void): (() => void) => {
  let active = true;
  if (images.size === 0) {
    for (const [file, url] of Object.entries(urls)) {
      const image = new Image();
      image.onload = () => {
        if (active) onLoad();
      };
      image.src = url;
      images.set(file.replace('./assets/', '').replace('.png', ''), image);
    }
  }
  return () => {
    active = false;
  };
};

/** A loaded texture by its file name without extension. */
export const texture = (name: string): HTMLImageElement | null => {
  const image = images.get(name);
  return image && image.complete && image.naturalWidth > 0 ? image : null;
};
