import type { OverlayKind } from './layouts.js';

export type OverlayVisibility = Readonly<{
  showWhenOnTrack: boolean;
  showWhenInPitlane: boolean;
  showWhenInGarage: boolean;
  showWhenInReplay: boolean;
  showWhenGameClosed: boolean;
  showWhenPractice: boolean;
  showWhenOpenQualify: boolean;
  showWhenLoneQualify: boolean;
  showWhenRace: boolean;
  showWhenOfflineTesting: boolean;
}>;

const sessions = {
  showWhenPractice: true,
  showWhenOpenQualify: true,
  showWhenLoneQualify: true,
  showWhenRace: true,
  showWhenOfflineTesting: true,
} as const;
const base = (value: Partial<OverlayVisibility>): OverlayVisibility => ({
  showWhenOnTrack: true,
  showWhenInPitlane: true,
  showWhenInGarage: false,
  showWhenInReplay: true,
  showWhenGameClosed: false,
  ...sessions,
  ...value,
});

/** Visibility of a newly added Workshop or local overlay. */
export const packageOverlayVisibility: OverlayVisibility = base({});

// Copied from Racelink overlay manifests for the built-in iRacing overlays.
export const overlayVisibilityDefaults: Record<OverlayKind, OverlayVisibility> = {
  abs: base({ showWhenInReplay: false }),
  'arcade-map': base({ showWhenInGarage: true }),
  'blind-spot': base({}),
  dash: base({ showWhenInReplay: false }),
  'g-force-circle': base({ showWhenInPitlane: false, showWhenInReplay: false }),
  'input-telemetry': base({}),
  'rejoin-indicator': base({ showWhenInPitlane: false, showWhenLoneQualify: false }),
  relatives: base({ showWhenInReplay: false }),
  'relatives-pro': base({ showWhenInReplay: false }),
  'rpm-led': base({ showWhenInReplay: false }),
  'stage-delta': base({ showWhenInReplay: false }),
  standings: base({ showWhenInGarage: true }),
  'standings-pro': base({ showWhenInGarage: true }),
  'r-flags': base({ showWhenInReplay: false }),
  'r-digiflag': base({ showWhenInReplay: false }),
  'r-input-telemetry': base({}),
  'r-relatives': base({ showWhenInReplay: false }),
  'r-standings': base({ showWhenInGarage: true }),
  'r-fuel-calculator': base({ showWhenInGarage: true }),
  'r-g-force-meter': base({ showWhenInReplay: false }),
  'r-delta-trace': base({ showWhenInReplay: false }),
  'r-laptime-graph': base({ showWhenInReplay: false }),
  'r-lap-timing': base({ showWhenInReplay: false }),
  'r-boost-box': base({ showWhenInReplay: false }),
  'r-pitbox-helper': base({ showWhenInReplay: false }),
  'nfsmw-speedometer': base({}),
  'nfsmw-ea-trax': base({}),
  'nfsmw-minimap': base({}),
  'nfsmw-leaderboard': base({}),
  'nfsmw-lap-time': base({ showWhenInReplay: false }),
  'dota-invoker-cooldowns': base({}),
  'track-map': base({ showWhenInGarage: true }),
  weather: base({}),
  // Chat belongs to the stream, not the session: it shows whatever the game does.
  'twitch-chat': base({ showWhenInGarage: true, showWhenGameClosed: true }),
  wind: base({}),
};
