// The part of the app's overlay runtime the overlays use, on the public SDK.
// Copied to racelink/src/renderer/shared/api/racelink-runtime/ by
// scripts/import-from-app.mjs; edit it here.
import type { DemoSample, TelemetryTopic, TelemetryTopics } from '@racelink/overlay';
import { currentOverlay } from '../../../widgets/overlays/model/useRacingOverlay';

/** The demo values of a topic over the last `seconds`; empty outside demo mode. */
export const demoHistory = <T extends TelemetryTopic>(
  topic: T,
  seconds: number,
  hz?: number,
): readonly DemoSample<TelemetryTopics[T]>[] =>
  currentOverlay()?.demoHistory(topic, seconds, hz) ?? [];
