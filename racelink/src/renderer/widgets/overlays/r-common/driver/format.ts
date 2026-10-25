/** Formatting helpers of the R- driver rows. */

const pad = (value: number, length = 2): string => String(value).padStart(length, '0');

/** `mm:ss.SSS` (or `ss.SSS` when the minute is dropped) with 0 to 3 decimals. */
export const toMMSSMS = (seconds: number, decimals: number | null, dropMinute: boolean): string => {
  const total = Math.floor(Math.abs(seconds) * 1000);
  const minutes = Math.floor(total / 60000) % 60;
  const wholeSeconds = Math.floor(total / 1000) % 60;
  const millis = total % 1000;
  const places = decimals === null ? 3 : Math.min(3, Math.max(0, decimals));
  const fraction = places === 0 ? '' : `.${pad(Math.floor(millis / 10 ** (3 - places)), places)}`;
  return dropMinute
    ? `${pad(wholeSeconds)}${fraction}`
    : `${pad(minutes)}:${pad(wholeSeconds)}${fraction}`;
};

/** The placeholder shown while a lap time is unknown. */
export const lapTimePlaceholder = (decimals: number | null, dropMinute: boolean): string => {
  const places = decimals === null ? 3 : Math.min(3, Math.max(0, decimals));
  const fraction = places === 0 ? '' : `.${'-'.repeat(places)}`;
  return `${dropMinute ? '--' : '--:--'}${fraction}`;
};

/** `mm:ss` for a duration, with a leading minus for negative values. */
export const toMMSS = (seconds: number): string => {
  const total = Math.floor(Math.abs(seconds));
  const sign = seconds > 0 ? '' : '-';
  return `${sign}${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
};

/** Seconds as a plain number below a minute, `mm:ss` from a minute on. */
export const convertSecToReadable = (formatted: string): string =>
  Math.abs(Number(formatted)) >= 60 ? toMMSS(Number(formatted)) : formatted;

export const toHHMMSS = (seconds: number): string => {
  const total = Math.floor(Math.abs(seconds));
  return `${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
};

export const toHHMM = (seconds: number): string => {
  const total = Math.floor(Math.abs(seconds));
  const hours = seconds >= 86400 ? Math.floor(total / 3600) : Math.floor(total / 3600) % 24;
  return `${seconds >= 86400 ? String(hours) : pad(hours)}:${pad(Math.floor(total / 60) % 60)}`;
};

/** Truncates, never rounds up. */
export const toFixedDown = (value: number, places: number): string => {
  const scale = 10 ** places;
  return (Math.floor(value * scale) / scale).toFixed(places);
};

export const shortNumber = (value: number): string =>
  value < 1000 ? String(value) : `${(value / 1000).toFixed(1)}k`;

const channel = (value: string, start: number): number =>
  Number.parseInt(value.slice(start, start + 2), 16);

/** `#rgb` / `#rrggbb` to an `rgba()` string; transparent for anything else. */
export const hexToRgba = (hex: string, alpha: number): string => {
  if (!/^#([0-9a-f]{3}){1,2}$/i.test(hex)) return 'rgba(0,0,0,0)';
  const digits = hex.slice(1);
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((char) => char + char)
          .join('')
      : digits;
  return `rgba(${String(channel(full, 0))},${String(channel(full, 2))},${String(channel(full, 4))},${String(alpha)})`;
};

/** The class color as the driver rows draw it (white classes read as gray). */
export const classColor = (hex: string, alpha = 1): string =>
  hexToRgba(hex.toLowerCase() === '#ffffff' ? '#4F4F4F' : hex, alpha);

export const adjustColorShade = (hex: string, amount: number): string =>
  `#${hex.replace(/^#/, '').replace(/../g, (pair) =>
    Math.min(255, Math.max(0, Number.parseInt(pair, 16) + amount))
      .toString(16)
      .padStart(2, '0')
      .slice(-2),
  )}`;
