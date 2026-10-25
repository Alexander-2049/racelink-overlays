import { tint, type Rgba } from '../nfsmw-common/tint';
import { objects } from './assets/eaTrax';
import { drawLine, lineWidth, type TextLine } from './text';
import type { SceneObject, Track } from './types';

/** The group everything hangs from; the disc's centre is the origin. */
const rootIndex = 2;
const discCenter = [-66, 0] as const;

/** Bar lengths: the game picks the shortest that fits the text. */
export type Variant = 'Short' | 'Medium' | 'Long';
// The chyron as the game describes it: objects in a tree, each with a base
// state and scripts of keyframed tracks (position, size, colour), in the
// game's interface units. Times are in milliseconds.
/** Text width each bar takes, in units: from the text's start to the tab. */
const capacity: Readonly<Record<Variant, number>> = { Short: 155, Medium: 206, Long: 275 };

/** How long the chyron stays before it hides, and how long hiding takes. */
export const holdMs = 5100;
export const hideMs = 1620;
/** One turn of the ring around the disc. */
const ringTurnMs = 2800;
/** How much lower each line sits than its position, in units (measured in the game). */
const textDrop: Readonly<Record<'title' | 'artist' | 'album', number>> = {
  title: 0.3,
  artist: 1.5,
  album: 0.5,
};

/** The part of the scene the overlay shows, in units around the disc's centre. */
export const stage = { x: -72, y: -38, width: 428, height: 76 } as const;

const value = (track: Track, time: number): readonly number[] => {
  const keys = track.keys;
  const first = keys[0];
  if (!first) return [];
  let t = time;
  if (track.loop && track.length > 0) t = ((t % track.length) + track.length) % track.length;
  if (t <= first.t) return first.v;
  for (let index = 1; index < keys.length; index += 1) {
    const key = keys[index];
    const previous = keys[index - 1];
    if (!key || !previous) continue;
    if (t <= key.t) {
      const share = key.t > previous.t ? (t - previous.t) / (key.t - previous.t) : 1;
      return previous.v.map((from, i) => from + ((key.v[i] ?? from) - from) * share);
    }
  }
  return keys[keys.length - 1]?.v ?? first.v;
};

/** The scripts that run on each object while the chyron shows, and while it hides. */
const showing = (variant: Variant): Readonly<Record<number, string>> => ({
  3: `extend${variant}`,
  4: `extend${variant}`,
  5: 'appear',
  9: 'appear',
  10: 'appear',
  11: 'flash',
  14: 'appear',
});
const hiding = (variant: Variant): Readonly<Record<number, string>> => ({
  3: `retract${variant}`,
  4: `retract${variant}`,
  5: 'disappear',
  9: 'disappear',
  10: 'disappear',
  11: 'flash',
  14: 'disappear',
});

export interface Chyron {
  readonly variant: Variant;
  readonly lines: Readonly<Record<'title' | 'artist' | 'album', TextLine | null>>;
}

/** Text lines of a track and the bar that fits them. */
export const chyronOf = (title: string, artist: string | null, album: string | null): Chyron => {
  const line = (text: string | null, scale: number): TextLine | null =>
    text ? { text, scale, squeeze: 1 } : null;
  const lines = {
    title: line(title, 0.8),
    artist: line(artist, 0.75),
    album: line(album, 0.75),
  };
  const widths = Object.values(lines).map((entry) =>
    entry ? lineWidth(entry.text) * entry.scale : 0,
  );
  const widest = Math.max(0, ...widths);
  const variant: Variant =
    widest <= capacity.Short ? 'Short' : widest <= capacity.Medium ? 'Medium' : 'Long';
  // Text longer than the longest bar is narrowed to fit, line by line.
  const fit = (entry: TextLine | null): TextLine | null => {
    if (!entry) return null;
    const width = lineWidth(entry.text) * entry.scale;
    return { ...entry, squeeze: width > capacity.Long ? capacity.Long / width : 1 };
  };
  return {
    variant,
    lines: { title: fit(lines.title), artist: fit(lines.artist), album: fit(lines.album) },
  };
};

interface Placed {
  readonly index: number;
  readonly object: SceneObject;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly scale: number;
  readonly color: Rgba;
  readonly size: readonly number[];
}

/**
 * Draws the chyron `elapsed` ms after it started showing; `clock` turns the
 * ring. The context is in units around the disc's centre.
 */
export const drawChyron = (
  context: CanvasRenderingContext2D,
  chyron: Chyron,
  elapsed: number,
  clock: number,
  texture: (name: string) => HTMLImageElement | null,
): void => {
  const hide = elapsed >= holdMs;
  const active = hide ? hiding(chyron.variant) : showing(chyron.variant);
  const scriptTime = hide ? elapsed - holdMs : elapsed;
  const property = (index: number, name: 'color' | 'position' | 'size'): readonly number[] => {
    const object = objects[index];
    if (!object) return [];
    const scriptName = active[index];
    const track = scriptName ? object.scripts[scriptName]?.tracks[name] : undefined;
    if (track) return value(track, scriptTime);
    const init = object.scripts.init?.tracks[name];
    if (init) return value(init, Number.POSITIVE_INFINITY);
    return object[name];
  };

  const placed: Placed[] = [];
  const visit = (index: number, x: number, y: number, z: number, scale: number, tint4: Rgba) => {
    const object = objects[index];
    if (!object) return;
    const position = property(index, 'position');
    const color = property(index, 'color');
    const own = (i: number) => Math.max(0, Math.min(255, color[i] ?? 255)) / 255;
    const combined: Rgba = [
      tint4[0] * own(0),
      tint4[1] * own(1),
      tint4[2] * own(2),
      tint4[3] * own(3),
    ];
    const px = index === rootIndex ? 0 : x + (position[0] ?? 0) * scale;
    const py = index === rootIndex ? 0 : y + (position[1] ?? 0) * scale;
    const pz = index === rootIndex ? 0 : z + (position[2] ?? 0);
    const size = property(index, 'size');
    const childScale = object.kind === 'group' ? scale * (size[0] ?? 1) : scale;
    if (object.kind === 'image' || object.kind === 'text')
      placed.push({ index, object, x: px, y: py, z: pz, scale, color: combined, size });
    objects.forEach((child, childIndex) => {
      if (child.parent === index) visit(childIndex, px, py, pz, childScale, combined);
    });
  };
  visit(rootIndex, 0, 0, 0, 1, [1, 1, 1, 1]);

  context.save();
  context.translate(-discCenter[0], -discCenter[1]);
  // Far objects first; the game's depth decides what covers what.
  placed.sort((a, b) => b.z - a.z || a.index - b.index);
  for (const item of placed) {
    const alpha = item.color[3];
    if (alpha <= 0.002) continue;
    // Steps of 4 keep the tinted textures of fading colours few.
    const channel = (share: number) => Math.min(255, Math.round((share * 255) / 4) * 4);
    const rgb: Rgba = [channel(item.color[0]), channel(item.color[1]), channel(item.color[2]), 255];
    if (item.object.kind === 'text') {
      const role = item.object.role;
      const line = role ? chyron.lines[role] : null;
      if (!role || !line) continue;
      drawLine(context, line, item.x, item.y + textDrop[role], rgb, alpha);
      continue;
    }
    const image = item.object.texture ? texture(item.object.texture) : null;
    if (!image) continue;
    const width = (item.size[0] ?? 0) * item.scale;
    const height = (item.size[1] ?? 0) * item.scale;
    if (width <= 0 || height <= 0) continue;
    context.save();
    context.translate(item.x, item.y);
    if (item.object.scripts.animate) {
      // The ring turns anticlockwise, one turn per 2.8 s.
      context.rotate(-((clock % ringTurnMs) / ringTurnMs) * 2 * Math.PI);
    }
    context.globalAlpha = alpha;
    context.drawImage(tint(image, rgb), -width / 2, -height / 2, width, height);
    context.restore();
  }
  context.restore();
};
