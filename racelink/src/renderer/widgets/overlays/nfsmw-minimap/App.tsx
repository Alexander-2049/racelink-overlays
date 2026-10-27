import { useEffect, useMemo, useRef, useState } from 'react';
import type { TrackGeometry } from '../../../../shared/contracts/track';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { ProgressPredictor } from '../model/progressPredictor';
import { useMapTrack } from '../model/useMapTrack';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { bool, num } from '../r-common/rSettings';
import { drawFeng } from '../nfsmw-common/feng';
import { hudObjects } from '../nfsmw-common/hud/hudSingleRace';
import { competitors, followedDriver, type Driver } from '../nfsmw-common/race';
import { tint } from '../nfsmw-common/tint';
import { commonTexture } from '../nfsmw-common/textures';
import { useStageCanvas, type Stage } from '../nfsmw-common/useStageCanvas';
import {
  headingAt,
  pointAt,
  routeOf,
  sidePathOf,
  terrainFrameOf,
  terrainPictures,
  type Route,
} from './map';

const topics: readonly TelemetryTopic[] = ['connection', 'session', 'drivers', 'track'];

/** The minimap's centre on the game's screen, and the area around it the overlay shows. */
const center = { x: -341, y: 139.25 } as const;
const stage: Stage = { x: center.x - 82.665, y: center.y - 83.11, width: 165.33, height: 166.22 };
/** The map shows inside this radius; the backing's black rim lies around it. */
const mapRadius = 64;

// Colours of the game's map, measured in the game.
const colors = {
  ground: 'rgb(70, 67, 71)',
  road: 'rgb(128, 124, 128)',
  route: 'rgb(212, 208, 212)',
  outline: 'rgb(14, 12, 14)',
  water: 'rgb(48, 50, 58)',
  startGreen: 'rgb(46, 160, 86)',
} as const;
/** Widths in the game's units. */
const routeOutline = 3.6;
const routeFill = 2;
const pitOutline = 2.6;
const pitFill = 1.2;
const terrainOutline = 0.8;
/** The player's icon is the HUD's orange; the others keep the icon's green. */
const playerColor = [255, 195, 115, 255] as const;
/** 90% of a turn of the map settles in about a second. */
const turnPerSecond = 2.3;

const useImage = (source: string | null): HTMLImageElement | null => {
  const [loaded, setLoaded] = useState<{ source: string; image: HTMLImageElement } | null>(null);
  useEffect(() => {
    if (!source) return;
    const image = new Image();
    let active = true;
    image.onload = () => {
      if (active) setLoaded({ source, image });
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    return () => {
      active = false;
      image.onload = null;
    };
  }, [source]);
  return loaded && loaded.source === source ? loaded.image : null;
};

/** The start line as the game marks it: four white squares over a green bar. */
const drawStartLine = (context: CanvasRenderingContext2D) => {
  context.fillStyle = colors.outline;
  context.fillRect(-12.5, -6.3, 25, 12.6);
  context.fillStyle = 'rgb(232, 232, 232)';
  for (let square = 0; square < 4; square += 1)
    context.fillRect(-11.3 + square * 5.85, -5.1, 4.65, 4.4);
  context.fillStyle = colors.startGreen;
  context.fillRect(-11.3, 0.5, 22.6, 4.6);
};

/** NFSMW-Minimap: the game's round map, turning with the car. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const { drivers } = overlay.telemetry;
  const track = useMapTrack(overlay.telemetry.track, overlay.demoMode);
  const radiusMeters = Math.min(1000, Math.max(50, num(values, 'visibleRadiusMeters', 250)));
  const showTerrain = bool(values, 'showTerrain', true);
  const showOpponents = bool(values, 'showOpponents', true);
  const showStartLine = bool(values, 'showStartLine', true);
  const unitsPerMeter = mapRadius / radiusMeters;

  const predictor = useRef(new ProgressPredictor());
  const latest = useRef<{ drivers: readonly Driver[]; followed: Driver | null }>({
    drivers: [],
    followed: null,
  });
  const cameraHeading = useRef<number | null>(null);
  const lastFrame = useRef<number | null>(null);
  const editing = useRef(false);
  const moving = useRef(true);

  const geometry: TrackGeometry | null = track;
  const route = useMemo<Route | null>(
    () => (geometry ? routeOf(geometry.track_points) : null),
    [geometry],
  );
  const pitPaths = useMemo(() => (geometry ? geometry.pitroad.map(sidePathOf) : []), [geometry]);
  const frame = useMemo(() => (geometry ? terrainFrameOf(geometry) : null), [geometry]);
  const pictures = useMemo(() => {
    const svg = geometry?.background?.svg;
    if (!svg || !frame || !showTerrain) return null;
    const outlineUnits = terrainOutline / unitsPerMeter / frame.metersPerUnit;
    return terrainPictures(svg, outlineUnits, colors);
  }, [geometry, frame, showTerrain, unitsPerMeter]);
  const outlinePicture = useImage(pictures?.outline ?? null);
  const fillPicture = useImage(pictures?.fill ?? null);

  const field = competitors(drivers);
  const followed = followedDriver(field);
  const sampledAt = overlay.sampledAt.drivers ?? null;
  useEffect(() => {
    latest.current = { drivers: field, followed };
    // Without a track the frame still shows while the layout is edited, and in the demo.
    editing.current = overlay.editMode || overlay.demoMode;
    // Cars glide between samples, except while the layout is edited.
    moving.current = !overlay.editMode;
    const at = sampledAt ?? performance.now();
    const reported = new Set<number>();
    for (const driver of field) {
      if (driver.trackSurface === 'notInWorld') continue;
      reported.add(driver.carIdx);
      predictor.current.sample(driver.carIdx, driver.lapDistanceFraction, at);
    }
    predictor.current.retain(reported);
  });

  const { canvas, width, height } = useStageCanvas(stage, (context, now) => {
    const { drivers: cars, followed: car } = latest.current;
    const elapsed =
      lastFrame.current === null ? 0 : Math.min(0.1, (now - lastFrame.current) / 1000);
    lastFrame.current = now;
    const progressOf = (driver: Driver) =>
      predictor.current.predict(driver.carIdx, now) ?? driver.lapDistanceFraction;
    const ready = route !== null && car !== null && car.trackSurface !== 'notInWorld';
    if (!ready && !editing.current) return false;

    drawFeng(context, hudObjects, ['mapBacking'], {
      texture: commonTexture,
      running: () => null,
      text: () => null,
    });
    if (route && car) {
      const progress = progressOf(car);
      const here = pointAt(route, progress);
      if (here) {
        const target = headingAt(route, progress);
        const previous = cameraHeading.current;
        const share = moving.current ? 1 - Math.exp(-turnPerSecond * elapsed) : 1;
        const heading =
          previous === null
            ? target
            : previous +
              Math.atan2(Math.sin(target - previous), Math.cos(target - previous)) * share;
        cameraHeading.current = heading;

        context.save();
        context.beginPath();
        context.arc(center.x, center.y, mapRadius, 0, Math.PI * 2);
        context.clip();
        context.fillStyle = colors.ground;
        context.fillRect(center.x - mapRadius, center.y - mapRadius, mapRadius * 2, mapRadius * 2);
        context.translate(center.x, center.y);
        // The car's way is up, as the game turns its map.
        context.rotate(-heading - Math.PI / 2);
        context.scale(unitsPerMeter, unitsPerMeter);
        context.translate(-here.x, -here.y);
        if (frame && outlinePicture && fillPicture) {
          context.drawImage(outlinePicture, frame.x, frame.y, frame.width, frame.height);
          context.drawImage(fillPicture, frame.x, frame.y, frame.width, frame.height);
        }
        context.lineJoin = 'round';
        context.lineCap = 'round';
        const stroke = (path: Path2D, color: string, unitsWide: number) => {
          context.strokeStyle = color;
          context.lineWidth = unitsWide / unitsPerMeter;
          context.stroke(path);
        };
        for (const path of pitPaths) stroke(path, colors.outline, pitOutline);
        stroke(route.path, colors.outline, routeOutline);
        for (const path of pitPaths) stroke(path, colors.road, pitFill);
        stroke(route.path, colors.route, routeFill);

        // Marks and icons keep their size in the game's units.
        const upright = (x: number, y: number, turn: number, draw: () => void) => {
          context.save();
          context.translate(x, y);
          context.rotate(turn);
          context.scale(1 / unitsPerMeter, 1 / unitsPerMeter);
          draw();
          context.restore();
        };
        const start = pointAt(route, 0);
        if (showStartLine && start)
          upright(start.x, start.y, heading + Math.PI / 2, () => {
            drawStartLine(context);
          });
        const icon = commonTexture('minimap_icon_car');
        const template = hudObjects.carIcon;
        const [iconWidth = 14, iconHeight = 16] = template.size;
        const drawCar = (driver: Driver, color: readonly [number, number, number, number]) => {
          const at = driver.carIdx === car.carIdx ? progress : progressOf(driver);
          const point = driver.carIdx === car.carIdx ? here : pointAt(route, at);
          if (!point || !icon) return;
          upright(point.x, point.y, headingAt(route, at) + Math.PI / 2, () => {
            context.drawImage(
              tint(icon, color),
              -iconWidth / 2,
              -iconHeight / 2,
              iconWidth,
              iconHeight,
            );
          });
        };
        const green = template.color;
        if (showOpponents)
          for (const driver of cars)
            if (driver.carIdx !== car.carIdx && driver.trackSurface !== 'notInWorld')
              drawCar(driver, [green[0] ?? 194, green[1] ?? 242, green[2] ?? 66, 255]);
        drawCar(car, playerColor);
        context.restore();
      }
    }
    drawFeng(context, hudObjects, ['ring'], {
      texture: commonTexture,
      running: () => null,
      text: () => null,
    });
    return ready && moving.current;
  });

  return (
    <div className="nfsmwMinimap">
      <canvas ref={canvas} style={{ width, height }} />
    </div>
  );
}
