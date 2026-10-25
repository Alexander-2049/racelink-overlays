/**
 * Driver tags are user opinions about other drivers. Tag keys are a stable
 * public contract for overlays: they never change meaning or get renamed.
 */
export const driverTagKeys = [
  'dangerous',
  'dirty',
  'aggressive',
  'friend',
  'pro',
  'streamer',
  'clean',
] as const;
export type DriverTagKey = (typeof driverTagKeys)[number];

/**
 * Tag as published to overlays. Lists are sorted by priority (catalog order),
 * so `tags[0]` is the driver's primary tag.
 */
export type PublishedDriverTag = Readonly<{ key: DriverTagKey; name: string; color: string }>;

/** Ordered by priority: the first tag a driver has decides their map color. */
export const driverTags: readonly PublishedDriverTag[] = [
  { key: 'dangerous', name: 'Dangerous', color: '#facc15' },
  { key: 'dirty', name: 'Dirty driver', color: '#f97316' },
  { key: 'aggressive', name: 'Aggressive', color: '#ef4444' },
  { key: 'friend', name: 'Friend', color: '#38bdf8' },
  { key: 'pro', name: 'Pro driver', color: '#a855f7' },
  { key: 'streamer', name: 'Streamer', color: '#d946ef' },
  { key: 'clean', name: 'Clean driver', color: '#22c55e' },
];

export const isDriverTagKey = (value: unknown): value is DriverTagKey =>
  typeof value === 'string' && driverTagKeys.includes(value as DriverTagKey);

export const isPublishedDriverTag = (value: unknown): value is PublishedDriverTag =>
  typeof value === 'object' &&
  value !== null &&
  'key' in value &&
  'name' in value &&
  'color' in value &&
  isDriverTagKey(value.key) &&
  typeof value.name === 'string' &&
  typeof value.color === 'string' &&
  /^#[0-9a-f]{6}$/i.test(value.color);

/** Reads an untrusted tag list, dropping malformed entries. */
export const parsePublishedDriverTags = (value: unknown): readonly PublishedDriverTag[] =>
  Array.isArray(value) ? value.filter(isPublishedDriverTag) : [];

export type DirectorySession = Readonly<{
  sessionKey: string;
  trackName: string;
  sessionType: string;
  isReplay: boolean;
  lastSeenAt: number;
}>;

export type DirectoryDriver = Readonly<{
  customerId: number;
  name: string;
  carNumber: string;
  /** Country reported by the game, if any. */
  countryCode: string | null;
  lastSeenAt: number;
  inLatestSession: boolean;
  tags: readonly PublishedDriverTag[];
}>;

export type DriverDirectorySnapshot = Readonly<{
  latestSession: DirectorySession | null;
  /** Sorted by `lastSeenAt`, newest first; one entry per driver. */
  drivers: readonly DirectoryDriver[];
}>;

export type DriverDirectoryResult =
  Readonly<{ ok: true }> | Readonly<{ ok: false; code: 'INVALID_INPUT' | 'STORAGE_ERROR' }>;

export const driverDirectoryChannels = {
  snapshot: 'driver-directory:snapshot',
  changed: 'driver-directory:changed',
  setTag: 'driver-directory:set-tag',
} as const;

export type DriverDirectoryApi = Readonly<{
  snapshot: () => Promise<DriverDirectorySnapshot>;
  /** Called whenever drivers are seen or tags change. Returns an unsubscribe. */
  subscribe: (listener: () => void) => () => void;
  setTag: (
    customerId: number,
    tag: DriverTagKey,
    assigned: boolean,
  ) => Promise<DriverDirectoryResult>;
}>;
