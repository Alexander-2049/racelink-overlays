// Small line icons of the Warhammer overlays: one stroke weight, currentColor.
import type { ReactNode } from 'react';

const Svg = ({ children }: Readonly<{ children: ReactNode }>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconAirTemp = () => (
  <Svg>
    <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z" />
    <path d="M12 9v7" />
  </Svg>
);

export const IconTrackTemp = () => (
  <Svg>
    <path d="M8 3 5 21" />
    <path d="M16 3l3 18" />
    <path d="M12 5v3M12 11v3M12 17v3" />
  </Svg>
);

export const IconDrop = () => (
  <Svg>
    <path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3Z" />
  </Svg>
);

export const IconDrivers = () => (
  <Svg>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.5a5.5 5.5 0 0 1 2.5 5.5" />
  </Svg>
);

export const IconWater = () => (
  <Svg>
    <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z" />
    <path d="M16.5 6.5h3M16.5 10h3" />
  </Svg>
);

export const IconOil = () => (
  <Svg>
    <path d="M4 10h11l3 3v4H4Z" />
    <path d="M7 10V7h5M18 13l2.5 3.5a1.5 1.5 0 1 1-2.5 0" />
  </Svg>
);

export const IconIncidents = () => (
  <Svg>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconClock = () => (
  <Svg>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const IconSun = () => (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
  </Svg>
);

export const IconCloud = () => (
  <Svg>
    <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5a3.75 3.75 0 0 1-.5 7.5Z" />
  </Svg>
);

export const IconDrizzle = () => (
  <Svg>
    <path d="M7 15a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 7.5a3.75 3.75 0 0 1-.5 7.5Z" />
    <path d="M9 19v1.5M13 18v2.5M17 19v1.5" />
  </Svg>
);

export const IconRain = () => (
  <Svg>
    <path d="M7 14a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 6.5a3.75 3.75 0 0 1-.5 7.5Z" />
    <path d="M8 17.5 7 20M12 17.5 11 20M16 17.5 15 20" />
  </Svg>
);

export const IconStorm = () => (
  <Svg>
    <path d="M7 13a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 5.5a3.75 3.75 0 0 1-.5 7.5Z" />
    <path d="m12.5 12-2 4h3l-2 4.5" />
  </Svg>
);

export const IconTrendUp = () => (
  <Svg>
    <path d="m5 15 7-7 7 7" />
  </Svg>
);

export const IconTrendDown = () => (
  <Svg>
    <path d="m5 9 7 7 7-7" />
  </Svg>
);

/** Chat badges: small solid glyphs. */
export const IconBadge = ({ kind }: Readonly<{ kind: string }>) => {
  switch (kind) {
    case 'broadcaster':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1.5" y="3" width="13" height="10" rx="2" fill="currentColor" opacity="0.28" />
          <circle cx="8" cy="8" r="2.6" fill="currentColor" />
        </svg>
      );
    case 'moderator':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3 13 9.4 6.6M10 2.5l3.5 3.5-2 2L8 4.5ZM2.5 13.5l2-.5-1.5-1.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      );
    case 'vip':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2 13 7l-5 7-5-7Z" fill="currentColor" />
        </svg>
      );
    case 'subscriber':
    case 'founder':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="m8 1.8 1.9 4 4.3.5-3.2 3 .9 4.3L8 11.4 4.1 13.6 5 9.3l-3.2-3 4.3-.5Z"
            fill="currentColor"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="4.5" fill="currentColor" />
        </svg>
      );
  }
};
