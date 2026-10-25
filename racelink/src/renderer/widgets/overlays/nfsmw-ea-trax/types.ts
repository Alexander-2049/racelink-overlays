import type { Track } from '../nfsmw-common/types';

export type { Key, Track } from '../nfsmw-common/types';

export type TrackName = 'color' | 'position' | 'size' | 'rotation';

export interface Script {
  readonly length: number;
  readonly tracks: Readonly<Partial<Record<TrackName, Track>>>;
}

/** An object of the game's interface package, in its units. */
export interface SceneObject {
  readonly kind: 'timer' | 'group' | 'image' | 'text';
  readonly parent: number | null;
  readonly texture: string | null;
  readonly role: 'title' | 'artist' | 'album' | null;
  readonly color: readonly number[];
  readonly position: readonly number[];
  readonly size: readonly number[];
  readonly rotation: readonly number[];
  readonly scripts: Readonly<Record<string, Script>>;
}
