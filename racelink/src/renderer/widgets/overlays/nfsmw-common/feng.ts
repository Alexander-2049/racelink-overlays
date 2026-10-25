// A small runtime for the game's interface packages: objects in a tree, each
// with a base state and scripts of keyframed tracks, in the game's units
// (a screen 480 units high, its centre the origin, y down).
import { drawText, type Justify } from './text';
import { tint, type Rgba } from './tint';
import type { Track } from './types';

export type TrackName = 'color' | 'position' | 'size' | 'rotation';

export interface FengScript {
  readonly length: number;
  /** The script that follows when this one ends. */
  readonly chain: string | null;
  readonly tracks: Readonly<Partial<Record<TrackName, Track>>>;
}

/** An object of an interface package. Rotation is a quaternion (x, y, z, w). */
export interface FengObject {
  readonly kind: 'group' | 'image' | 'text';
  readonly parent: string | null;
  readonly texture: string | null;
  readonly text: {
    readonly justify: Justify;
    /** Widest line in font units at scale 1; 0 for any. */
    readonly maxWidth: number;
    readonly sample: string;
  } | null;
  readonly color: readonly number[];
  readonly position: readonly number[];
  readonly size: readonly number[];
  readonly rotation: readonly number[];
  readonly scripts: Readonly<Record<string, FengScript>>;
}

/** The value of a track `time` ms into its script: linear between keys. */
export const trackValue = (track: Track, time: number): readonly number[] => {
  const keys = track.keys;
  const first = keys[0];
  if (!first) return [];
  let t = time;
  if (track.loop && track.length > 0 && Number.isFinite(t))
    t = ((t % track.length) + track.length) % track.length;
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

/** A script an object runs, and how long ago it started. */
export interface Running {
  readonly script: string;
  readonly elapsed: number;
}

const resting: Running = { script: 'init', elapsed: Number.POSITIVE_INFINITY };

/** Follows a script into the scripts chained after it. */
const settle = (
  object: FengObject,
  running: Running,
): { readonly script: FengScript | null; readonly time: number } => {
  let script = object.scripts[running.script];
  let time = running.elapsed;
  if (!script) return { script: null, time };
  // A script may chain to itself; a few steps reach any resting state.
  for (let step = 0; step < 8 && time > script.length && script.chain; step += 1) {
    const next: FengScript | undefined = object.scripts[script.chain];
    if (!next) break;
    time -= script.length;
    script = next;
  }
  return { script, time };
};

/** A property of an object under a running script; the resting state fills in the rest. */
export const propertyOf = (
  object: FengObject,
  name: TrackName,
  running: Running | null,
): readonly number[] => {
  for (const candidate of running ? [running, resting] : [resting]) {
    const { script, time } = settle(object, candidate);
    const track = script?.tracks[name];
    if (track) return trackValue(track, time);
  }
  return object[name];
};

/** A 2D affine transform: a, b, c, d, e, f as the canvas takes them. */
type Matrix = readonly [number, number, number, number, number, number];

const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];

/**
 * The screen part of a rotation. A half turn about an axis in the screen's
 * plane mirrors the object across that axis, as the game uses it.
 */
const rotationMatrix = (q: readonly number[]): Matrix => {
  const [qx = 0, qy = 0, qz = 0, qw = 1] = q;
  const norm = Math.hypot(qx, qy, qz, qw) || 1;
  const x = qx / norm;
  const y = qy / norm;
  const z = qz / norm;
  const w = qw / norm;
  return [
    1 - 2 * (y * y + z * z),
    2 * (x * y + z * w),
    2 * (x * y - z * w),
    1 - 2 * (x * x + z * z),
    0,
    0,
  ];
};

export interface SceneState {
  /** What runs on an object; null for its resting state. */
  readonly running: (name: string) => Running | null;
  /** The text of a text object; null leaves it out. */
  readonly text: (name: string) => string | null;
  /** A loaded texture by its name. */
  readonly texture: (name: string) => HTMLImageElement | null;
  /** Another texture for an object, as the game swaps them at run time. */
  readonly textureOf?: (name: string) => string | null;
  /** Leaves an object and its children out. */
  readonly hidden?: (name: string) => boolean;
}

interface Placed {
  readonly name: string;
  readonly object: FengObject;
  readonly matrix: Matrix;
  readonly z: number;
  readonly color: Rgba;
  readonly order: number;
}

const childrenCache = new WeakMap<object, ReadonlyMap<string | null, readonly string[]>>();
const childrenOf = (objects: Readonly<Record<string, FengObject>>) => {
  const cached = childrenCache.get(objects);
  if (cached) return cached;
  const map = new Map<string | null, string[]>();
  for (const [name, object] of Object.entries(objects)) {
    const list = map.get(object.parent) ?? [];
    list.push(name);
    map.set(object.parent, list);
  }
  childrenCache.set(objects, map);
  return map;
};

/** Steps of 4 keep the tinted textures of fading colours few. */
const channel = (share: number) => Math.min(255, Math.max(0, Math.round((share * 255) / 4) * 4));

/**
 * Draws the trees under `roots` in the context's current transform (game
 * units). Far objects first: the game's depth decides what covers what.
 */
export const drawFeng = <Name extends string>(
  context: CanvasRenderingContext2D,
  objects: Readonly<Record<Name, FengObject>>,
  roots: readonly Name[],
  state: SceneState,
): void => {
  const children = childrenOf(objects);
  const placed: Placed[] = [];
  const lookup: Readonly<Record<string, FengObject | undefined>> = objects;
  const visit = (name: string, parent: Matrix, z: number, tint4: Rgba) => {
    const object = lookup[name];
    if (!object || state.hidden?.(name)) return;
    const running = state.running(name);
    const [px = 0, py = 0, pz = 0] = propertyOf(object, 'position', running);
    const color = propertyOf(object, 'color', running);
    const own = (i: number) => Math.max(0, Math.min(255, color[i] ?? 255)) / 255;
    const combined: Rgba = [
      tint4[0] * own(0),
      tint4[1] * own(1),
      tint4[2] * own(2),
      tint4[3] * own(3),
    ];
    if (combined[3] <= 0.002) return;
    const placedAt = multiply(
      multiply(parent, [1, 0, 0, 1, px, py]),
      rotationMatrix(propertyOf(object, 'rotation', running)),
    );
    if (object.kind === 'group') {
      const [sx = 1, sy = 1] = propertyOf(object, 'size', running);
      const inner = multiply(placedAt, [sx, 0, 0, sy, 0, 0]);
      for (const child of children.get(name) ?? []) visit(child, inner, z + pz, combined);
      return;
    }
    placed.push({
      name,
      object,
      matrix: placedAt,
      z: z + pz,
      color: combined,
      order: placed.length,
    });
  };
  for (const root of roots) visit(root, [1, 0, 0, 1, 0, 0], 0, [1, 1, 1, 1]);

  placed.sort((a, b) => b.z - a.z || a.order - b.order);
  for (const item of placed) {
    const running = state.running(item.name);
    const [sx = 0, sy = 0] = propertyOf(item.object, 'size', running);
    const rgb: Rgba = [channel(item.color[0]), channel(item.color[1]), channel(item.color[2]), 255];
    context.save();
    context.transform(...item.matrix);
    if (item.object.kind === 'text' && item.object.text) {
      const text = state.text(item.name);
      if (text)
        drawText(context, text, 0, 0, {
          justify: item.object.text.justify,
          scaleX: sx,
          scaleY: sy,
          maxWidth: item.object.text.maxWidth,
          color: rgb,
          alpha: item.color[3],
        });
    } else {
      const textureName = state.textureOf?.(item.name) ?? item.object.texture;
      const image = textureName ? state.texture(textureName) : null;
      if (image && sx !== 0 && sy !== 0) {
        context.globalAlpha = item.color[3];
        context.scale(Math.sign(sx), Math.sign(sy));
        const width = Math.abs(sx);
        const height = Math.abs(sy);
        context.drawImage(tint(image, rgb), -width / 2, -height / 2, width, height);
      }
    }
    context.restore();
  }
};
