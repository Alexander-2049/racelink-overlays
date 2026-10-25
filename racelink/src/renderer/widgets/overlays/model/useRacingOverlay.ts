// The app's overlay hook, on the public SDK: the overlays keep the code they
// have in Racelink. Copied to racelink/src/renderer/widgets/overlays/model/
// by scripts/import-from-app.mjs; edit it here.
import { useEffect, useState } from 'react';
import {
  createOverlay,
  type RacelinkOverlay,
  type TelemetryTopic,
  type TelemetryTopics,
} from '@racelink/overlay';

type ScalarValue = string | number | boolean;
type Settings = Record<string, unknown>;

/** Settings as the overlays read them. Fresh objects; overlays may not mutate them. */
export interface OverlaySettingsView {
  values: Record<string, ScalarValue>;
  visibility: Record<string, boolean>;
  order: Record<string, string[]>;
}

/** Order setting key → item id → the visibility key the overlay reads. */
type OrderVisibility = Readonly<Record<string, Readonly<Record<string, string>>>>;

let overlay: RacelinkOverlay<Settings> | null = null;
let orderVisibility: OrderVisibility = {};

/**
 * Connects to Racelink once per page. Resolves when the instance's settings
 * are known, so the overlay never draws its defaults for a moment.
 */
export function initOverlay(defaults: object, aliases: OrderVisibility): Promise<void> {
  orderVisibility = aliases;
  const created = createOverlay<Settings>({ defaults: defaults as Settings });
  overlay = created;
  return new Promise((resolve) => {
    if (created.ready) resolve();
    else created.on('ready', () => {
      resolve();
    });
  });
}

/** The connected overlay, for helpers that need it (demo history). */
export const currentOverlay = (): RacelinkOverlay<Settings> | null => overlay;

/**
 * Splits settings into the shape the overlays read: plain values,
 * `visibility.*` flags (including order item visibility) and order id lists.
 */
const toView = (values: Settings): OverlaySettingsView => {
  const plain: Record<string, ScalarValue> = {};
  const visibility: Record<string, boolean> = {};
  const order: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      const items = value as readonly { id: string; visible: boolean }[];
      order[key.replace(/^order\./, '')] = items.map((item) => item.id);
      const aliases = orderVisibility[key] ?? {};
      for (const item of items) {
        const alias = aliases[item.id];
        if (alias) visibility[alias] = item.visible;
      }
    } else if (key.startsWith('visibility.') && typeof value === 'boolean')
      visibility[key.slice('visibility.'.length)] = value;
    else if (value !== null && typeof value !== 'object') plain[key] = value as ScalarValue;
  }
  return { values: plain, visibility, order };
};

type Snapshot = Readonly<{
  telemetry: TelemetryTopics;
  settings: OverlaySettingsView;
  demoMode: boolean;
  editMode: boolean;
  gameId: string | null;
  sampledAt: Readonly<Partial<Record<TelemetryTopic, number>>>;
  /** Some telemetry has arrived. */
  isReady: boolean;
}>;

const snapshot = (current: RacelinkOverlay<Settings>, settings: OverlaySettingsView): Snapshot => ({
  telemetry: current.telemetry,
  settings,
  demoMode: current.status === 'demo',
  editMode: current.editMode,
  gameId: current.game,
  sampledAt: current.sampledAt,
  isReady: Object.keys(current.sampledAt).length > 0,
});

/**
 * Telemetry and settings for an overlay. `maxHz` limits how often it renders;
 * overlays that animate from telemetry keep the default (every message).
 */
export const useRacingOverlay = (topics?: readonly TelemetryTopic[], maxHz?: number) => {
  const current = overlay;
  if (!current) throw new Error('initOverlay() runs before the overlay renders.');
  const [state, setState] = useState<Snapshot>(() => snapshot(current, toView(current.settings)));
  useEffect(() => {
    if (topics) current.subscribe(topics);
    let settings = toView(current.settings);
    let last = 0;
    let timer = 0;
    const minGap = maxHz ? 1000 / maxHz : 0;
    const publish = (): void => {
      timer = 0;
      last = performance.now();
      setState(snapshot(current, settings));
    };
    const schedule = (): void => {
      if (timer !== 0) return;
      const wait = Math.max(0, last + minGap - performance.now());
      if (wait === 0) publish();
      else timer = window.setTimeout(publish, wait);
    };
    const offTelemetry = current.on('telemetry', schedule);
    const offSettings = current.on('settings', (next) => {
      settings = toView(next);
      publish();
    });
    const offHost = current.on('host', publish);
    const offStatus = current.on('status', publish);
    return () => {
      offTelemetry();
      offSettings();
      offHost();
      offStatus();
      window.clearTimeout(timer);
    };
    // The topic list of an overlay never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, maxHz]);
  return state;
};

export type RacingOverlay = ReturnType<typeof useRacingOverlay>;
