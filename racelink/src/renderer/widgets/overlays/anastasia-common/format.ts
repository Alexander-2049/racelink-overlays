// Text and colour helpers of the Anastasia Striking overlays. Pure.

const finite = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

const pad = (value: number, width = 2): string => String(value).padStart(width, '0');

/** A lap time as `m:ss.d` (`decimals` 0..3); a dash when unknown. */
export const formatLapTime = (seconds: number | null, decimals = 1): string => {
  if (!finite(seconds) || seconds <= 0) return '-:--.-';
  const places = Math.min(3, Math.max(0, Math.round(decimals)));
  const scale = 10 ** places;
  const rounded = Math.round(seconds * scale) / scale;
  const minutes = Math.floor(rounded / 60);
  const rest = (rounded - minutes * 60).toFixed(places);
  const text = places === 0 ? pad(Number(rest)) : rest.padStart(places + 3, '0');
  return `${String(minutes)}:${text}`;
};

/**
 * A gap or interval in seconds: `s.d` below a minute, `m:ss.d` above, as a
 * stream board shows it. Unsigned; the sign is the column's business.
 */
export const formatGapTime = (seconds: number | null, decimals = 1): string => {
  if (!finite(seconds)) return '';
  const places = Math.min(3, Math.max(0, Math.round(decimals)));
  const value = Math.abs(seconds);
  if (value < 60) return value.toFixed(places);
  const minutes = Math.floor(value / 60);
  const rest = (value - minutes * 60).toFixed(places);
  return `${String(minutes)}:${rest.padStart(places === 0 ? 2 : places + 3, '0')}`;
};

/** Time spent in the pit lane: `s.d` below a minute, `m:ss` above. */
export const formatPitTime = (seconds: number | null): string => {
  if (!finite(seconds) || seconds < 0) return '';
  if (seconds < 60) return seconds.toFixed(1);
  const whole = Math.round(seconds);
  return `${String(Math.floor(whole / 60))}:${pad(whole % 60)}`;
};

/** `h:mm:ss` from 1 h, `m:ss` below; a dash for nothing. */
export const formatClock = (seconds: number | null): string => {
  if (!finite(seconds) || seconds < 0) return '--:--';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0 ? `${String(hours)}:${pad(minutes)}:${pad(secs)}` : `${String(minutes)}:${pad(secs)}`;
};

/** A session length: `4h`, `45m` when round, else a clock. */
export const formatTotalTime = (seconds: number | null): string => {
  if (!finite(seconds) || seconds <= 0) return '';
  if (seconds > 48 * 3600) return '∞';
  const total = Math.round(seconds);
  if (total % 3600 === 0) return `${String(total / 3600)}h`;
  if (total % 60 === 0 && total < 3600) return `${String(total / 60)}m`;
  return formatClock(total);
};

/** An iRating as `4.8k` from 1000, whole below. */
export const formatRating = (rating: number | null): string => {
  if (!finite(rating)) return '';
  return rating >= 1000 ? `${(rating / 1000).toFixed(1)}k` : String(Math.round(rating));
};

/** The strength of field like a rating: `3.3k`. */
export const formatSof = (sof: number | null): string => formatRating(sof);

/** A licence as `A4.4`: its class and the safety rating. */
export const formatLicence = (className: string, safetyRating: number | null): string => {
  if (className === '') return '';
  return `${className}${finite(safetyRating) ? safetyRating.toFixed(1) : ''}`;
};

/** The one-letter session type of a board header. */
export const sessionLetter = (type: string): string => {
  switch (type) {
    case 'race':
      return 'R';
    case 'qualify':
      return 'Q';
    case 'practice':
      return 'P';
    case 'warmup':
      return 'W';
    case 'hotlap':
      return 'TA';
    case 'testing':
      return 'T';
    default:
      return '';
  }
};

/** A temperature in the unit asked for, rounded. */
export const formatTemperature = (celsius: number | null, imperial: boolean): string => {
  if (!finite(celsius)) return '';
  return imperial ? `${String(Math.round(celsius * 1.8 + 32))}°F` : `${String(Math.round(celsius))}°C`;
};

/** A speed in km/h converted for the unit asked for, rounded. */
export const formatSpeed = (kph: number | null, imperial: boolean): string => {
  if (!finite(kph)) return '';
  return String(Math.round(imperial ? kph * 0.621371 : kph));
};

/** The selected gear as a driver reads it. */
export const formatGear = (gear: number | null): string => {
  if (gear === null) return '';
  if (gear < 0) return 'R';
  if (gear === 0) return 'N';
  return String(gear);
};

/** A signed lap-time difference: its size to `decimals`, no sign. */
export const formatDelta = (seconds: number | null, decimals = 1): string =>
  finite(seconds) ? Math.abs(seconds).toFixed(decimals) : '';

const parseHex = (color: string): [number, number, number] | null => {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(color.trim());
  if (match === null) return null;
  return [parseInt(match[1] ?? '0', 16), parseInt(match[2] ?? '0', 16), parseInt(match[3] ?? '0', 16)];
};

/** Black or white, whichever reads on `background` (`#rrggbb`). */
export const textOn = (background: string): string => {
  const rgb = parseHex(background);
  if (rgb === null) return '#ffffff';
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 > 150 ? '#111111' : '#ffffff';
};

/**
 * A chat name colour that reads on a dark panel: dark colours are lightened
 * towards white until they have enough lightness, bright ones stay as they are.
 * An unset or unreadable colour gives `fallback`.
 */
export const readableColor = (color: string | null, fallback = '#d8d0e8', minLuma = 0.42): string => {
  if (color === null) return fallback;
  const rgb = parseHex(color);
  if (rgb === null) return fallback;
  const luma = (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 255;
  if (luma >= minLuma) return `#${rgb.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
  // Mix with white: luma of the result is luma + (1 - luma) * t.
  const t = Math.min(1, (minLuma - luma) / (1 - luma));
  const mixed = rgb.map((part) => Math.round(part + (255 - part) * t));
  return `#${mixed.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
};
