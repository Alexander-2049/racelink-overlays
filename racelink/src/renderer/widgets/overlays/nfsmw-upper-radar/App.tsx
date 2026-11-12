import { useEffect, useRef } from 'react';
import type { TelemetryTopic } from '@racelink/overlay';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { bool, num } from '../r-common/rSettings';
import { useCanvasStage } from '../nfsmw-common/stageCanvas';
import { tint } from '../nfsmw-common/tint';
import {
  appearMs,
  arrow,
  backing,
  dome,
  group,
  ledCropX,
  leds,
  stage,
  type Placed,
} from './layout';
import { approach, approachAngle, Pulser, pulsePeriodMs, sideLevels, type Hazard } from './radar';
import { loadBeep, playBeep } from './sound';
import { loadRadarTextures, radarTexture, radarTexturesReady } from './textures';

const topics: readonly TelemetryTopic[] = ['connection', 'session'];

/** While the layout is edited the radar stands lit, so it can be placed. */
const editSample: Hazard = { distanceMeters: 120, bearingDegrees: 35, direction: 'right' };
/** Smoothing of the distance and the arrow between data updates (ms). */
const distanceTauMs = 150;
const arrowTauMs = 120;

interface Shown {
  readonly hazard: Hazard | null;
  readonly near: number;
  readonly far: number;
  readonly showArrow: boolean;
  readonly sound: boolean;
  readonly soundInDemo: boolean;
  readonly volume: number;
  readonly editing: boolean;
  readonly demo: boolean;
}

/** Draws a texture centred at the object's place, mirrored for a negative size, cropped to `source`. */
const drawPlaced = (
  context: CanvasRenderingContext2D,
  item: Placed,
  image: HTMLImageElement,
  color: readonly [number, number, number],
  alpha: number,
  options: {
    readonly offsetY?: number;
    readonly rotation?: number;
    readonly sourceX?: number;
  } = {},
) => {
  if (alpha <= 0.002) return;
  const [width, height] = item.size;
  context.save();
  context.translate(item.x, item.y + (options.offsetY ?? 0));
  if (options.rotation) context.rotate(options.rotation);
  context.scale(Math.sign(width), Math.sign(height));
  context.globalAlpha = alpha;
  const w = Math.abs(width);
  const h = Math.abs(height);
  const tinted = tint(image, [color[0], color[1], color[2], 255]);
  const textureWidth = image.naturalWidth;
  const sourceX = Math.min(textureWidth, Math.max(0, options.sourceX ?? 0));
  const share = sourceX / textureWidth;
  context.drawImage(
    tinted,
    sourceX * (tinted.width / textureWidth),
    0,
    tinted.width * (1 - share),
    tinted.height,
    -w / 2 + w * share,
    -h / 2,
    w * (1 - share),
    h,
  );
  context.restore();
};

/** NFSMW-Upper Radar: the game's radar detector, warning of trouble on the track ahead. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const hazardAhead = overlay.telemetry.session.hazardAhead;

  const shown = useRef<Shown | null>(null);
  shown.current = {
    hazard: overlay.editMode
      ? editSample
      : hazardAhead
        ? {
            distanceMeters: hazardAhead.distanceMeters,
            bearingDegrees: hazardAhead.bearingDegrees ?? null,
            direction: hazardAhead.direction ?? null,
          }
        : null,
    near: num(values, 'nearMeters', 250),
    far: num(values, 'farMeters', 600),
    showArrow: bool(values, 'showArrow', true),
    sound: bool(values, 'sound', true),
    soundInDemo: bool(values, 'soundInDemo', false),
    volume: Math.min(100, Math.max(0, num(values, 'volume', 70))) / 100,
    editing: overlay.editMode,
    demo: overlay.demoMode,
  };

  // What is drawn now: smoothed toward the data between updates.
  const drawn = useRef({ distance: Number.NaN, angle: Number.NaN, last: 0, appearedAt: -1 });
  const pulser = useRef(new Pulser());

  useEffect(() => {
    void loadBeep();
  }, []);

  const { canvas, width, height } = useCanvasStage(
    stage,
    (context, now) => {
      const state = shown.current;
      if (!state) return false;
      const memory = drawn.current;
      if (memory.appearedAt < 0) memory.appearedAt = now;
      const elapsed = memory.last > 0 ? now - memory.last : 0;
      memory.last = now;

      // The radar slides down and fades in as the game shows it.
      const appear = Math.min(1, (now - memory.appearedAt) / appearMs);
      const hazard = state.hazard;
      let lit = 0;
      let levels = { left: 1, right: 1 };
      let arrowAngle: number | null = null;
      if (hazard) {
        memory.distance = approach(memory.distance, hazard.distanceMeters, elapsed, distanceTauMs);
        const target = state.showArrow ? (hazard.bearingDegrees ?? 0) : 0;
        memory.angle = approachAngle(memory.angle, target, elapsed, arrowTauMs);
        if (state.showArrow) levels = sideLevels(hazard.direction);
        const period = state.editing ? null : pulsePeriodMs(memory.distance, state.near, state.far);
        const pulse = pulser.current.advance(elapsed, period);
        lit = pulse.lit;
        if (pulse.beep && state.sound && !state.editing && (!state.demo || state.soundInDemo))
          playBeep(state.volume);
        arrowAngle = memory.angle;
      } else {
        memory.distance = Number.NaN;
        memory.angle = Number.NaN;
        pulser.current.reset();
      }

      const backingImage = radarTexture('radar_backing');
      const ledImage = radarTexture('radar_leds_color');
      const domeImage = radarTexture('radar_icon');
      const arrowImage = radarTexture('radar_directionarrow');

      // Far objects first, as the game's depth orders them.
      if (backingImage)
        drawPlaced(context, backing, backingImage, backing.color, (backing.alpha * appear) / 255, {
          offsetY: backing.appearOffsetY * (1 - appear),
        });
      const groupAlpha = (group.alpha * appear) / 255;
      const groupOffset = group.appearOffsetY * (1 - appear);
      if (domeImage)
        drawPlaced(context, dome, domeImage, dome.color, groupAlpha, {
          offsetY: groupOffset,
        });
      if (ledImage && lit > 0) {
        // Lights burn from the dome outwards.
        const sourceX = ledCropX(lit);
        drawPlaced(context, leds.left, ledImage, leds.left.color, groupAlpha * levels.left, {
          offsetY: groupOffset,
          sourceX,
        });
        drawPlaced(context, leds.right, ledImage, leds.right.color, groupAlpha * levels.right, {
          offsetY: groupOffset,
          sourceX,
        });
      }
      if (arrowImage && arrowAngle !== null)
        drawPlaced(context, arrow, arrowImage, arrow.color, groupAlpha, {
          offsetY: groupOffset,
          rotation: (arrowAngle * Math.PI) / 180,
        });

      // Animate while appearing, pulsing or turning; a standing radar draws once.
      const settling =
        hazard !== null &&
        (Math.abs(memory.distance - hazard.distanceMeters) > 0.5 ||
          Math.abs((arrowAngle ?? 0) - (state.showArrow ? (hazard.bearingDegrees ?? 0) : 0)) > 0.2);
      const pulsing =
        hazard !== null &&
        !state.editing &&
        pulsePeriodMs(memory.distance, state.near, state.far) !== null;
      return !radarTexturesReady() || appear < 1 || pulsing || settling;
    },
    loadRadarTextures,
  );

  return (
    <div className="nfsmwUpperRadar">
      <canvas ref={canvas} style={{ width, height }} />
    </div>
  );
}
