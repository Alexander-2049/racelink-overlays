/** Gap in seconds as the board shows it: one decimal, signed, ahead negative. */
export const formatGap = (gap: number | null): string => {
  if (gap === null || !Number.isFinite(gap)) return '--';
  const text = Math.abs(gap) >= 100 ? Math.abs(gap).toFixed(0) : Math.abs(gap).toFixed(1);
  if (text === '0.0') return text;
  return gap < 0 ? `-${text}` : `+${text}`;
};

export const formatLap = (seconds: number | null): string => {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return '-:--.---';
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${String(minutes)}:${rest}`;
};

export const formatRating = (rating: number | null): string =>
  rating === null ? '' : rating >= 1000 ? `${(rating / 1000).toFixed(1)}k` : String(rating);

export const formatClock = (seconds: number | null): string => {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return '--:--';
  if (seconds > 48 * 3600) return '∞';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(hours > 0 ? 2 : 1, '0');
  const secs = String(total % 60).padStart(2, '0');
  return hours > 0 ? `${String(hours)}:${minutes}:${secs}` : `${minutes}:${secs}`;
};

/** Black or white, whichever reads on `background` (#rrggbb). */
export const textOn = (background: string): string => {
  const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(background);
  if (match === null) return '#ffffff';
  const [r, g, b] = match.slice(1, 4).map((part) => parseInt(part, 16));
  return (r ?? 0) * 0.299 + (g ?? 0) * 0.587 + (b ?? 0) * 0.114 > 150 ? '#111111' : '#ffffff';
};
