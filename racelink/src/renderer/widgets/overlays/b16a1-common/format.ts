// Text the b16a1 overlays show: times, gaps, ratings. Pure.

const finite = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** `1:47.131`; empty when there is no time. */
export const lapTime = (seconds: number | null | undefined): string => {
  if (!finite(seconds) || seconds <= 0) return '';
  const whole = Math.floor(seconds);
  const millis = Math.min(999, Math.round((seconds - whole) * 1000));
  const minutes = Math.floor(whole / 60);
  const rest = String(whole % 60).padStart(2, '0');
  return `${String(minutes)}:${rest}.${String(millis).padStart(3, '0')}`;
};

/** A gap in seconds with three decimals, two from a hundred seconds. */
export const gapSeconds = (seconds: number, digits = 3): string =>
  seconds >= 100 ? seconds.toFixed(Math.min(digits, 2)) : seconds.toFixed(digits);

/** Rating as the table shows it: `6204`, or `6.2k` when compact. */
export const ratingText = (rating: number, compact: boolean): string =>
  compact && rating >= 1000 ? `${(rating / 1000).toFixed(1)}k` : String(Math.round(rating));

/** `10:53`, or `1:05:09` from an hour. Empty when unknown or absurd (an unlimited session). */
export const clockTime = (seconds: number | null | undefined): string => {
  if (!finite(seconds) || seconds < 0 || seconds > 7 * 24 * 3600) return '';
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const rest = String(whole % 60).padStart(2, '0');
  return hours > 0
    ? `${String(hours)}:${String(minutes).padStart(2, '0')}:${rest}`
    : `${String(minutes)}:${rest}`;
};

/** A session length: `45m`, `1h30m`, `2h`. */
export const durationShort = (seconds: number | null | undefined): string => {
  if (!finite(seconds) || seconds <= 0 || seconds > 7 * 24 * 3600) return '';
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${String(minutes)}m`;
  return rest === 0 ? `${String(hours)}h` : `${String(hours)}h${String(rest)}m`;
};

/** Time of day, `20:35`, from seconds since midnight. */
export const timeOfDay = (seconds: number | null | undefined, hour12 = false): string => {
  if (!finite(seconds) || seconds < 0) return '';
  const total = Math.floor(seconds) % 86400;
  const hours = Math.floor(total / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  if (!hour12) return `${String(hours).padStart(2, '0')}:${minutes}`;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${String(hours % 12 === 0 ? 12 : hours % 12)}:${minutes} ${suffix}`;
};

/** A lap-time difference in the history cells: `0.4`, `7.5`, `36` from ten seconds. */
export const deltaText = (seconds: number): string => {
  const abs = Math.abs(seconds);
  return abs >= 10 ? String(Math.round(abs)) : abs.toFixed(1);
};

/** Temperature with its unit; `18.8°C` or `65.8°F`. Empty when unknown. */
export const temperatureText = (celsius: number | null | undefined, fahrenheit: boolean): string => {
  if (!finite(celsius)) return '';
  return fahrenheit ? `${(celsius * 1.8 + 32).toFixed(1)}°F` : `${celsius.toFixed(1)}°C`;
};

/** Percent of a 0..1 ratio with one decimal: `84.3%`. */
export const percentText = (fraction: number | null | undefined): string =>
  finite(fraction) ? `${(Math.min(1, Math.max(0, fraction)) * 100).toFixed(1)}%` : '';

export type NameFormat = 'full' | 'initial' | 'last' | 'short';

/** A driver's name in the chosen shape. Falls back to the full name when it cannot be split. */
export const driverName = (
  driver: Readonly<{ name: string; firstName: string; lastName: string }>,
  format: NameFormat,
): string => {
  const first = driver.firstName.trim();
  const last = driver.lastName.trim();
  if (format === 'full' || last === '') return driver.name;
  switch (format) {
    case 'initial':
      return first === '' ? last : `${first.charAt(0)}. ${last}`;
    case 'last':
      return last;
    case 'short':
      return first === '' ? last : `${last} ${first.charAt(0)}.`;
  }
};

/** One letter for the session type in a header: P, Q, R, W, T (test), H (hot lap). */
export const sessionLetter = (type: string): string => {
  switch (type) {
    case 'practice':
      return 'P';
    case 'qualify':
      return 'Q';
    case 'race':
      return 'R';
    case 'warmup':
      return 'W';
    case 'testing':
      return 'T';
    case 'hotlap':
      return 'H';
    default:
      return '';
  }
};
