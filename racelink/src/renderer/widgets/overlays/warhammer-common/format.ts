// Text for the Warhammer overlays: lap times, gaps, durations, names, ratings.
// Pure; every function takes a missing value (null, NaN) and gives a dash or nothing.

const pad2 = (value: number): string => String(value).padStart(2, '0');

const isNumber = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && Number.isFinite(value);

/** Truncates toward zero to `places`, so 59.96 is "59.9", never "60.0". */
const truncate = (value: number, places: number): string => {
  const scale = 10 ** places;
  return (Math.floor(Math.abs(value) * scale + 1e-9) / scale).toFixed(places);
};

/** A time in seconds as `m:ss.d` from a minute on and `s.d` below it. */
export const formatSeconds = (seconds: number | null | undefined, decimals = 1): string => {
  if (!isNumber(seconds) || seconds < 0) return '-';
  const places = Math.min(3, Math.max(0, Math.round(decimals)));
  const whole = Math.floor(seconds);
  if (whole < 60) return truncate(seconds, places);
  const minutes = Math.floor(whole / 60);
  const rest = truncate(seconds - minutes * 60, places);
  return `${String(minutes)}:${rest.padStart(places === 0 ? 2 : places + 3, '0')}`;
};

/** A lap time: `2:02.2`; `--:--.-` while unknown. */
export const formatLapTime = (seconds: number | null | undefined, decimals = 1): string =>
  isNumber(seconds) && seconds > 0
    ? formatSeconds(seconds, decimals)
    : `--:--${decimals > 0 ? `.${'-'.repeat(Math.min(3, decimals))}` : ''}`;

/** The time of a pit visit: `42.6` below a minute, `1:03` from it. */
export const formatPitTime = (seconds: number | null | undefined): string => {
  if (!isNumber(seconds) || seconds < 0) return '';
  if (seconds < 60) return truncate(seconds, 1);
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60))}:${pad2(total % 60)}`;
};

/** A countdown or clock: `9:01`, and `1:05:09` from an hour on. */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (!isNumber(seconds) || seconds < 0) return '-';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours > 0
    ? `${String(hours)}:${pad2(minutes)}:${pad2(total % 60)}`
    : `${String(minutes)}:${pad2(total % 60)}`;
};

/** The length of a session: `4h`, `45m`, `1h30m`; a part of a minute is left out. */
export const formatTotalDuration = (seconds: number | null | undefined): string => {
  if (!isNumber(seconds) || seconds <= 0) return '';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${String(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${String(hours)}h` : `${String(hours)}h${pad2(rest)}m`;
};

/** A gap in seconds: `23.9`, `1:42.1` from a minute on. */
export const formatGap = (seconds: number | null | undefined, decimals = 1): string =>
  isNumber(seconds) ? formatSeconds(Math.abs(seconds), decimals) : '';

/** A time to a car, sign optional: `+3.2` ahead of you is `-3.2`. */
export const formatRelative = (
  seconds: number | null | undefined,
  decimals: number,
  signed: boolean,
): string => {
  if (!isNumber(seconds)) return '';
  const text = formatSeconds(Math.abs(seconds), decimals);
  if (!signed || text.replace(/[0:.]/g, '') === '') return text;
  return seconds < 0 ? `-${text}` : `+${text}`;
};

export type NameFormat = 'initialLast' | 'firstLast' | 'last' | 'lastInitial' | 'firstInitial';

const initial = (word: string): string => {
  const first = [...word.trim()][0];
  return first === undefined ? '' : `${first.toUpperCase()}.`;
};

/**
 * The driver's name in the chosen shape. A game that reports one name only
 * (an empty last name) shows it whole in every shape.
 */
export const formatName = (
  driver: Readonly<{ name: string; firstName: string; lastName: string }>,
  format: NameFormat,
): string => {
  const first = driver.firstName.trim();
  const last = driver.lastName.trim();
  if (last === '') return driver.name.trim() === '' ? '?' : driver.name.trim();
  switch (format) {
    case 'firstLast':
      return `${first} ${last}`.trim();
    case 'last':
      return last;
    case 'lastInitial':
      return first === '' ? last : `${last} ${initial(first)}`;
    case 'firstInitial':
      return `${first} ${initial(last)}`.trim();
    case 'initialLast':
      return first === '' ? last : `${initial(first)} ${last}`;
  }
};

/** iRating: `4.8k` (format `k`) or `4812` (format `full`); no rating gives nothing. */
export const formatIRating = (
  rating: number | null | undefined,
  format: 'k' | 'full' = 'k',
): string => {
  if (!isNumber(rating) || rating <= 0) return '';
  if (format === 'full' || rating < 1000) return String(Math.round(rating));
  return `${(Math.floor(rating / 100) / 10).toFixed(1)}k`;
};

/** Strength of field: `3.3k`. */
export const formatSof = (sof: number | null | undefined): string =>
  formatIRating(sof, 'k');

/** The licence pill: `A4.4` (class and rating), `4.4` or `A`. Safety rating is truncated, not rounded up. */
export const formatLicence = (
  license: Readonly<{ className: string; safetyRating: number | null }> | null | undefined,
  format: 'classRating' | 'rating' | 'class' = 'classRating',
): string => {
  if (license === null || license === undefined) return '';
  const letter = license.className.trim().slice(0, 1).toUpperCase();
  const rating = isNumber(license.safetyRating) ? truncate(license.safetyRating, 1) : '';
  if (format === 'class') return letter;
  if (format === 'rating') return rating;
  return `${letter}${rating}`;
};

export type TemperatureUnit = 'celsius' | 'fahrenheit';

/** `19°C` or `66°F`; the data is always in degrees Celsius. */
export const formatTemperature = (celsius: number | null | undefined, unit: TemperatureUnit): string => {
  if (!isNumber(celsius)) return '';
  return unit === 'fahrenheit'
    ? `${String(Math.round(celsius * 1.8 + 32))}°F`
    : `${String(Math.round(celsius))}°C`;
};

/** `65%` from a 0..1 fraction. */
export const formatPercent = (fraction: number | null | undefined, decimals = 0): string =>
  isNumber(fraction) ? `${(fraction * 100).toFixed(decimals)}%` : '';

/** `HH:MM` (24 h) or `h:MM AM`. */
export const formatClockTime = (date: Date, hour12: boolean): string => {
  const hours = date.getHours();
  const minutes = pad2(date.getMinutes());
  if (!hour12) return `${pad2(hours)}:${minutes}`;
  return `${String(hours % 12 === 0 ? 12 : hours % 12)}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
};

/** Seconds since midnight (the game's time of day) as `HH:MM` or `h:MM AM`. */
export const formatTimeOfDay = (seconds: number | null | undefined, hour12: boolean): string => {
  if (!isNumber(seconds)) return '';
  const date = new Date(0);
  const day = ((Math.floor(seconds) % 86400) + 86400) % 86400;
  date.setHours(Math.floor(day / 3600), Math.floor((day % 3600) / 60), 0, 0);
  return formatClockTime(date, hour12);
};

/** Black or white, whichever reads on `background` (`#rrggbb`). */
export const textOn = (background: string): string => {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(background);
  if (match === null) return '#ffffff';
  const [r, g, b] = match.slice(1, 4).map((part) => Number.parseInt(part, 16));
  return (r ?? 0) * 0.299 + (g ?? 0) * 0.587 + (b ?? 0) * 0.114 > 150 ? '#111111' : '#ffffff';
};

/** A colour the overlay may put in a style: `#rgb`, `#rrggbb` or `#rrggbbaa`; otherwise the fallback. */
export const safeColor = (value: string | null | undefined, fallback: string): string =>
  typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    ? value
    : fallback;
