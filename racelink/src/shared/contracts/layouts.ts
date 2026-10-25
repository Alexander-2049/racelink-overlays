import type { OverlayVisibility } from './overlayVisibility.js';
import type { SettingValue, SettingValues } from '../overlay-api/settings.js';
import type { GameId } from './games.js';
export const overlayKinds = [
  'abs',
  'arcade-map',
  'blind-spot',
  'dash',
  'g-force-circle',
  'input-telemetry',
  'rejoin-indicator',
  'relatives',
  'relatives-pro',
  'rpm-led',
  'stage-delta',
  'standings',
  'standings-pro',
  'r-flags',
  'r-digiflag',
  'r-input-telemetry',
  'r-relatives',
  'r-standings',
  'r-fuel-calculator',
  'r-g-force-meter',
  'r-delta-trace',
  'r-laptime-graph',
  'r-lap-timing',
  'r-boost-box',
  'r-pitbox-helper',
  'nfsmw-speedometer',
  'nfsmw-ea-trax',
  'nfsmw-minimap',
  'nfsmw-leaderboard',
  'nfsmw-lap-time',
  'dota-invoker-cooldowns',
  'track-map',
  'weather',
  'twitch-chat',
  'wind',
] as const;
export type OverlayKind = (typeof overlayKinds)[number];
/**
 * Package overlays are identified by source and stable id:
 * `workshop:<publishedFileId>`, `local:<overlay id>`, or `dev:<overlay id>`.
 */
export const packageIdPattern = /^(workshop:[1-9][0-9]{0,19}|(local|dev):[a-z0-9][a-z0-9-]{0,63})$/;
export const isPackageId = (value: unknown): value is string =>
  typeof value === 'string' && packageIdPattern.test(value);

export type OverlaySource =
  | Readonly<{ type: 'builtin'; kind: OverlayKind }>
  | Readonly<{ type: 'package'; packageId: string }>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
export const isOverlaySource = (value: unknown): value is OverlaySource =>
  isRecord(value) &&
  ((value.type === 'builtin' &&
    typeof value.kind === 'string' &&
    (overlayKinds as readonly string[]).includes(value.kind)) ||
    (value.type === 'package' && isPackageId(value.packageId)));
const isOrderItem = (value: unknown): boolean =>
  isRecord(value) && typeof value.id === 'string' && typeof value.visible === 'boolean';
/** Shape check for a single stored value; the overlay's schema validates the meaning. */
export const isSettingValue = (value: unknown): value is SettingValue =>
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (Array.isArray(value) && value.every(isOrderItem));
export type OverlayBounds = Readonly<{ x: number; y: number; width: number; height: number }>;
export type OverlayConfig = Readonly<{
  id: string;
  source: OverlaySource;
  name: string;
  enabled: boolean;
  bounds: OverlayBounds;
  visibility: OverlayVisibility;
  /** Stored values. Resolve them against the overlay's schema before use. */
  settings: SettingValues;
  /** Key of the overlay's stream page for OBS; set once its link was asked for. */
  streamKey?: string;
}>;
/** A button of a wheel, button box or gamepad: its device and number, from 1. */
export type ControllerButton = Readonly<{ device: string; deviceName: string; button: number }>;
export type LayoutConfig = Readonly<{
  id: string;
  name: string;
  gameId: GameId;
  overlays: readonly OverlayConfig[];
  /** The controller button that switches to this layout. */
  button?: ControllerButton;
  /** The keyboard shortcut that switches to this layout (`Ctrl+1`). */
  key?: string;
}>;
export type LayoutState = Readonly<{
  activeLayoutId: string;
  activeGameId: GameId;
  editMode: boolean;
  demoMode: boolean;
  overlaysVisible: boolean;
  layouts: readonly LayoutConfig[];
  /** The layout last active in each game, by game id; it comes back with the game. */
  lastActiveLayouts?: Readonly<Partial<Record<GameId, string>>>;
}>;
export type LayoutApi = Readonly<{
  getState: () => Promise<LayoutState>;
  activate: (layoutId: string) => Promise<LayoutState>;
  create: (name: string) => Promise<LayoutState>;
  rename: (layoutId: string, name: string) => Promise<LayoutState>;
  remove: (layoutId: string) => Promise<LayoutState>;
  addOverlay: (layoutId: string, source: OverlaySource) => Promise<LayoutState>;
  removeOverlay: (layoutId: string, overlayId: string) => Promise<LayoutState>;
  setOverlayEnabled: (
    layoutId: string,
    overlayId: string,
    enabled: boolean,
  ) => Promise<LayoutState>;
  setOverlaySetting: (
    layoutId: string,
    overlayId: string,
    key: string,
    value: SettingValue,
  ) => Promise<LayoutState>;
  setOverlayBounds: (
    layoutId: string,
    overlayId: string,
    bounds: OverlayBounds,
  ) => Promise<LayoutState>;
  setOverlayVisibility: (
    layoutId: string,
    overlayId: string,
    visibility: OverlayVisibility,
  ) => Promise<LayoutState>;
  setEditMode: (enabled: boolean) => Promise<LayoutState>;
  setDemoMode: (enabled: boolean) => Promise<LayoutState>;
  setOverlaysVisible: (enabled: boolean) => Promise<LayoutState>;
  /**
   * The link of the overlay's stream page for OBS, made on first ask; `renew`
   * replaces it and the old link stops working. Null for an unknown overlay.
   */
  getStreamLink: (
    layoutId: string,
    overlayId: string,
    renew: boolean,
  ) => Promise<StreamLink | null>;
  /** The next controller button pressed switches to this layout; null stops waiting. */
  recordButton: (layoutId: string | null) => Promise<void>;
  clearButton: (layoutId: string) => Promise<LayoutState>;
  /**
   * The keyboard shortcut that switches to this layout; null removes it. The
   * host keeps the old one when the system refuses the new one.
   */
  setKey: (layoutId: string, key: string | null) => Promise<LayoutState>;
  /** A button was pressed for the layout that waited for one. */
  subscribeButtonRecorded: (listener: (recorded: RecordedButton) => void) => () => void;
  /** Moves overlays of the active layout that no display shows back on screen. */
  bringOverlaysOnScreen: () => Promise<Readonly<{ moved: number }>>;
  subscribe: (listener: (state: LayoutState) => void) => () => void;
}>;

export type StreamLink = Readonly<{ url: string }>;
export type RecordedButton = Readonly<{ layoutId: string; deviceName: string; button: number }>;
export const layoutChannels = {
  getState: 'layouts:get-state',
  activate: 'layouts:activate',
  create: 'layouts:create',
  rename: 'layouts:rename',
  remove: 'layouts:remove',
  addOverlay: 'layouts:add-overlay',
  removeOverlay: 'layouts:remove-overlay',
  setOverlayEnabled: 'layouts:set-overlay-enabled',
  setOverlaySetting: 'layouts:set-overlay-setting',
  setOverlayBounds: 'layouts:set-overlay-bounds',
  setOverlayVisibility: 'layouts:set-overlay-visibility',
  setEditMode: 'layouts:set-edit-mode',
  setDemoMode: 'layouts:set-demo-mode',
  setOverlaysVisible: 'layouts:set-overlays-visible',
  getStreamLink: 'layouts:get-stream-link',
  bringOverlaysOnScreen: 'layouts:bring-overlays-on-screen',
  recordButton: 'layouts:record-button',
  clearButton: 'layouts:clear-button',
  setKey: 'layouts:set-key',
  buttonRecorded: 'controllers:recorded',
  changed: 'layouts:changed',
} as const;
