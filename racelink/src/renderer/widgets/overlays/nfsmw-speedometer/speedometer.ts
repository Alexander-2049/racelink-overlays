import { screenBoxes, texture, tint, type Rgba } from './textures';

/**
 * The speedometer is laid out as the game lays out its HUD: in units of a
 * 480-unit-high screen, from its centre. Drawing works in pixels of a
 * 1920x1080 screen; only the corner with the speedometer is shown.
 */
const unit = 1080 / 480;
const px = (x: number) => 960 + x * unit;
const py = (y: number) => 540 + y * unit;

/** The part of the 1920x1080 screen the overlay shows. */
export const stage = { x: 1540, y: 668, width: 372, height: 374 } as const;

/** The game's ten HUD colours. */
export const hudPalette: readonly Rgba[] = [
  [253, 253, 253, 255],
  [112, 112, 112, 255],
  [253, 193, 114, 255],
  [247, 86, 48, 255],
  [235, 161, 193, 255],
  [110, 209, 249, 255],
  [188, 238, 66, 255],
  [0, 215, 201, 255],
  [12, 120, 234, 255],
  [171, 163, 249, 255],
];

/** Gauge styles: the artwork of the face, the needles and the lettering. */
export const hudStyleCount = 11;

export interface SpeedometerState {
  readonly style: number;
  readonly needleColor: Rgba;
  readonly letteringColor: Rgba;
  readonly faceColor: Rgba;
  readonly rpm: number;
  /** The engine's rev limit; it picks the scale (7000 to 10000). */
  readonly maxRpm: number;
  /** Where the red zone starts; null without one. */
  readonly redlineRpm: number | null;
  readonly shiftUp: boolean;
  readonly speed: number;
  readonly metric: boolean;
  /** -1 reverse, 0 neutral, 1-9 forward. */
  readonly gear: number;
  /** Turbo pressure in psi above the air around; null hides the turbo gauge. */
  readonly boostPsi: number | null;
  /** The left bar (nitrous in the game), 0-1. */
  readonly nitrous: number;
  /** Nitrous is being used: its icon pulses. */
  readonly nitrousBurning: boolean;
  /** The right bar (speedbreaker in the game), 0-1. */
  readonly breaker: number;
}

const white: Rgba = [255, 255, 255, 255];
const dim: Rgba = [255, 255, 255, 60];
const black = (alpha: number): Rgba => [0, 0, 0, alpha];
const nitrousGreen: Rgba = [194, 242, 66, 255];
const breakerOrange: Rgba = [251, 192, 114, 251];
const backing: Rgba = [252, 252, 252, 59];
const redlineRed: Rgba = [165, 11, 25, 255];
const breakerBar: Rgba = [255, 195, 115, 255];

/** The scale of the tachometer for a rev limit. */
export const scaleRpm = (maxRpm: number): number =>
  maxRpm < 7000 ? 7000 : maxRpm < 8000 ? 8000 : maxRpm < 9000 ? 9000 : 10000;

/** The needle angle in degrees, clockwise from pointing down. */
const rpmAngle = (rpm: number, maxRpm: number) =>
  Math.max(0, Math.min(1, rpm / scaleRpm(maxRpm))) * 228 + 66;

const radians = (degrees: number) => (degrees * Math.PI) / 180;
const twoDigits = (value: number) => String(value).padStart(2, '0');

/** One textured quad of the HUD, centred on a point, in game units. */
const quad = (
  context: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Rgba,
  rotation = 0,
) => {
  const image = texture(name);
  if (!image) return;
  context.save();
  context.translate(px(x), py(y));
  if (rotation !== 0) context.rotate(radians(rotation));
  context.globalAlpha = color[3] / 255;
  context.drawImage(
    tint(image, color),
    (-width * unit) / 2,
    (-height * unit) / 2,
    width * unit,
    height * unit,
  );
  context.restore();
};

/** A full-screen texture of the game, drawn where it was cropped from. */
const screenQuad = (context: CanvasRenderingContext2D, name: string, color: Rgba, shiftX = 0) => {
  const image = texture(`text_${name}`);
  const box = screenBoxes[name];
  if (!image || !box) return;
  context.save();
  context.globalAlpha = color[3] / 255;
  context.drawImage(tint(image, color), box.x + shiftX, box.y, box.w, box.h);
  context.restore();
};

/**
 * A part of a ring: the ring texture shown inside a fan from the centre. The
 * angle runs from pointing down towards the right; `share` is of a full turn.
 */
const arc = (
  context: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  start: number,
  share: number,
  color: Rgba,
) => {
  const image = texture(name);
  if (!image || share <= 0) return;
  const cx = px(x);
  const cy = py(y);
  const rx = (width * unit) / 2;
  const ry = (height * unit) / 2;
  const segments = 32;
  context.save();
  context.beginPath();
  context.moveTo(cx, cy);
  for (let step = 0; step <= segments; step += 1) {
    const angle = start + (step / segments) * share * 2 * Math.PI;
    context.lineTo(cx + Math.sin(angle) * rx, cy + Math.cos(angle) * ry);
  }
  context.closePath();
  context.clip();
  context.globalAlpha = color[3] / 255;
  context.drawImage(tint(image, color), cx - rx, cy - ry, 2 * rx, 2 * ry);
  context.restore();
};

const drawRedline = (context: CanvasRenderingContext2D, state: SpeedometerState) => {
  if (state.redlineRpm === null) return;
  // The red zone starts on a whole thousand.
  const redline = state.redlineRpm - (state.redlineRpm % 1000);
  if (redline <= 0 || redline >= state.maxRpm) return;
  const maxAngle = radians(rpmAngle(scaleRpm(state.maxRpm), state.maxRpm));
  const redAngle = radians(rpmAngle(redline, state.maxRpm));
  arc(
    context,
    'redline_color',
    342,
    139,
    128,
    128,
    -maxAngle,
    Math.abs(maxAngle - redAngle) / (2 * Math.PI),
    redlineRed,
  );
};

const gearTexture = (gear: number) =>
  gear < 0 ? 'gear_r' : gear === 0 ? 'gear_n' : `gear_${String(Math.min(9, gear))}`;

/** Units, the dim "888", the gear and the speed. */
const drawText = (context: CanvasRenderingContext2D, state: SpeedometerState) => {
  screenQuad(context, state.metric ? 'kmh' : 'mph', white);
  screenQuad(context, 'numbersbg', black(80));
  screenQuad(context, gearTexture(state.gear), black(230));
  const speed = Math.max(0, Math.min(999, Math.floor(state.speed)));
  const digit = (value: number) => `speed_${String(value)}00`;
  if (speed >= 100) screenQuad(context, digit(Math.floor(speed / 100) % 10), black(230));
  if (speed >= 10) screenQuad(context, digit(Math.floor(speed / 10) % 10), black(230), 38);
  // The last digit always shows.
  screenQuad(context, digit(speed % 10), black(230), 76);
};

/** The colour and size of the nitrous icon; it pulses while nitrous burns. */
const nitrousLook = (state: SpeedometerState, now: number): { color: Rgba; size: number } => {
  if (state.nitrous <= 0) return { color: dim, size: 30 };
  if (!state.nitrousBurning) return { color: nitrousGreen, size: 30 };
  // 0.18 s from green to white and growing, 0.18 s back.
  const phase = (now / 1000) % 0.36;
  const toWhite = phase <= 0.18 ? phase / 0.18 : 1 - (phase - 0.18) / 0.18;
  const mix = (green: number) => Math.round(green + (255 - green) * toWhite);
  return {
    color: [mix(nitrousGreen[0]), mix(nitrousGreen[1]), mix(nitrousGreen[2]), 255],
    size: 30 + 6 * toWhite,
  };
};

/** Draws the whole speedometer in 1920x1080 screen pixels. */
export const drawSpeedometer = (
  context: CanvasRenderingContext2D,
  state: SpeedometerState,
  now: number,
): void => {
  const style = twoDigits(Math.max(0, Math.min(hudStyleCount - 1, state.style)));
  const nitrous = nitrousLook(state, now);
  const breakerLit = state.breaker > 0 ? breakerOrange : dim;

  quad(context, `tach_fill_${style}`, 341, 141, 140, 140, state.faceColor);
  quad(context, 'meter_backing2', 340, 140, 152, 150, backing, -40);
  quad(context, 'meter_backing2', 341.5, 141.5, 152, 150, backing, 140);
  quad(context, 'n20_icon', 275.5, 205.5, nitrous.size, nitrous.size, nitrous.color);
  quad(context, 'persuit_icon', 407, 75, 28, 29, breakerLit);
  quad(context, 'shift_up_icon', 396, 86, 9, 9, breakerLit, 225);
  // The red zone lies under the scale.
  drawRedline(context, state);
  quad(
    context,
    `${String(scaleRpm(state.maxRpm))}_lines_${style}`,
    341,
    139,
    133,
    128,
    state.letteringColor,
  );
  if (state.boostPsi !== null)
    quad(context, `turbo_lines_${style}`, 341, 190, 128, 32, state.letteringColor);
  quad(context, 'shift_up_icon', 335, 120, 12, 12, state.shiftUp ? white : black(127));
  // The digits lie under the needles.
  drawText(context, state);
  if (state.boostPsi !== null) {
    const psi = Math.max(-25, Math.min(25, state.boostPsi));
    quad(
      context,
      `turbo_needle_${style}`,
      340,
      141,
      32,
      136,
      state.needleColor,
      -((psi + 20) * 0.025 * 90 - 45),
    );
  }
  quad(
    context,
    `tach_needle_${style}`,
    341,
    140,
    32,
    128,
    state.needleColor,
    rpmAngle(state.rpm, state.maxRpm),
  );
  quad(context, 'shift_up_icon', 286, 195, 9, 9, nitrous.color, 45);
  arc(
    context,
    'meter_backing2_rotate2',
    341.5,
    141.5,
    152,
    150,
    radians(270 + 44),
    Math.max(0, Math.min(1, state.nitrous)) * 0.477,
    nitrousGreen,
  );
  arc(
    context,
    'meter_backing2_rotate2',
    340,
    140,
    152,
    150,
    radians(270 + 180 + 44),
    Math.max(0, Math.min(1, state.breaker)) * 0.477,
    breakerBar,
  );
};
