import { useEffect, useRef } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { bool, str } from '../r-common/rSettings';
import { useViewportSize } from '../r-common/useFitFont';
import { drawSpeedometer, hudPalette, stage, type SpeedometerState } from './speedometer';
import { loadTextures, texturesReady, type Rgba } from './textures';

const topics: readonly TelemetryTopic[] = ['connection', 'car', 'vehicle', 'session'];

const kphToMph = 0.621371;
const kpaToPsi = 0.145038;
/** Above this a game reports the absolute pressure in the manifold. */
const absoluteBoostKpa = 80;
const atmosphereKpa = 101.325;

/** `#rrggbb` (or `#rrggbbaa`) as a colour; the fallback when it is not one. */
const rgba = (hex: string, fallback: Rgba): Rgba => {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim());
  if (!match?.[1]) return fallback;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
};

/** NFSMW-Speedometer: the tachometer of the game's HUD, filling its window. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const { car, vehicle, session } = overlay.telemetry;
  const viewport = useViewportSize();
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef<SpeedometerState | null>(null);
  const dirty = useRef(true);

  const units = str(values, 'units', 'auto');
  const metric = units === 'auto' ? session.displayUnits !== 'imperial' : units === 'kmh';
  const fuelShare =
    car.fuelCapacityLiters && car.fuelCapacityLiters > 0
      ? car.fuelLiters / car.fuelCapacityLiters
      : 0;
  const battery = vehicle.battery.chargeFraction ?? 0;
  const bar = (source: string) =>
    source === 'fuel' ? fuelShare : source === 'battery' ? battery : 0;
  const nitrousSource = str(values, 'nitrousSource', 'fuel');
  const boostKpa = vehicle.engine.turboBoostKpa;
  const boostPsi =
    bool(values, 'showTurbo', true) && boostKpa !== null
      ? (boostKpa > absoluteBoostKpa ? boostKpa - atmosphereKpa : boostKpa) * kpaToPsi
      : null;
  // A colour of the game's palette (1-10), or one of one's own.
  const colorOf = (
    paletteKey: string,
    paletteDefault: string,
    colorKey: string,
    colorDefault: string,
  ) => {
    const choice = str(values, paletteKey, paletteDefault);
    const fallback = hudPalette[Number(paletteDefault) - 1] ?? [253, 253, 253, 255];
    if (choice === 'custom') return rgba(str(values, colorKey, colorDefault), fallback);
    return hudPalette[Number(choice) - 1] ?? fallback;
  };
  const maxRpm = car.maxRpm && car.maxRpm > 0 ? car.maxRpm : 8000;
  const shiftRpm = car.shiftLights?.shiftRpm ?? maxRpm * 0.95;
  const state: SpeedometerState = {
    style: Number(str(values, 'hudStyle', '0')) || 0,
    needleColor: colorOf('needlePalette', '3', 'needleColor', '#FDC172'),
    letteringColor: colorOf('letteringPalette', '1', 'letteringColor', '#FDFDFD'),
    faceColor: colorOf('gaugeFacePalette', '3', 'gaugeFaceColor', '#FDC172'),
    rpm: car.rpm,
    maxRpm,
    redlineRpm: car.shiftLights?.shiftRpm ?? maxRpm,
    shiftUp: car.rpm >= shiftRpm,
    speed: metric ? car.speedKph : car.speedKph * kphToMph,
    metric,
    gear: car.gear,
    boostPsi,
    nitrous: bar(nitrousSource),
    nitrousBurning: nitrousSource === 'battery' && vehicle.battery.isDeploying === true,
    breaker: bar(str(values, 'breakerSource', 'battery')),
  };

  useEffect(() => {
    latest.current = state;
    dirty.current = true;
  });

  const scale = Math.min(viewport.width / stage.width, viewport.height / stage.height);
  const width = Math.max(1, Math.floor(stage.width * scale));
  const height = Math.max(1, Math.floor(stage.height * scale));

  useEffect(() => {
    dirty.current = true;
  }, [width, height]);

  useEffect(() => {
    const stopLoading = loadTextures(() => {
      dirty.current = true;
    });
    let frame = 0;
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const element = canvas.current;
      const current = latest.current;
      if (!element || !current || !texturesReady()) return;
      // Redraw on new data, or every frame while the nitrous icon pulses.
      if (!dirty.current && !current.nitrousBurning) return;
      dirty.current = false;
      const ratio = window.devicePixelRatio || 1;
      const cssWidth = element.clientWidth;
      const cssHeight = element.clientHeight;
      const pixelWidth = Math.max(1, Math.round(cssWidth * ratio));
      const pixelHeight = Math.max(1, Math.round(cssHeight * ratio));
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth;
        element.height = pixelHeight;
      }
      const context = element.getContext('2d');
      if (!context) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, pixelWidth, pixelHeight);
      const zoom = (cssWidth / stage.width) * ratio;
      context.setTransform(zoom, 0, 0, zoom, -stage.x * zoom, -stage.y * zoom);
      context.imageSmoothingQuality = 'high';
      drawSpeedometer(context, current, now);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      stopLoading();
    };
  }, []);

  return (
    <div className="nfsmwSpeedometer">
      <canvas ref={canvas} style={{ width, height }} />
    </div>
  );
}
