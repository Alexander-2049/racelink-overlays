/** A colour the textures are multiplied by, with its alpha (0-255 each). */
export type Rgba = readonly [number, number, number, number];

/** Tinted textures kept at most; colours that animate would grow it without end. */
const cacheLimit = 256;
const tinted = new Map<string, HTMLCanvasElement>();

/**
 * A texture multiplied by a colour, as the game draws its HUD: grey artwork
 * takes the colour, its alpha is kept. Cached per texture and colour.
 */
export const tint = (image: HTMLImageElement, color: Rgba): HTMLCanvasElement => {
  const key = `${image.src}|${String(color[0])},${String(color[1])},${String(color[2])}`;
  const cached = tinted.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (context) {
    context.drawImage(image, 0, 0);
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = `rgb(${String(color[0])}, ${String(color[1])}, ${String(color[2])})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(image, 0, 0);
  }
  if (tinted.size >= cacheLimit) {
    const oldest = tinted.keys().next().value;
    if (oldest !== undefined) tinted.delete(oldest);
  }
  tinted.set(key, canvas);
  return canvas;
};
