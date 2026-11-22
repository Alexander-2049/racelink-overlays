// Small line icons of the b16a1 overlays (drawn here; they follow the text colour).
import type { ReactNode } from 'react';

function Icon({ children, solid = false }: Readonly<{ children: ReactNode; solid?: boolean }>) {
  return (
    <svg className={solid ? 'b-icon b-icon--solid' : 'b-icon'} viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export const AirIcon = () => (
  <Icon>
    <path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" />
  </Icon>
);
export const TrackIcon = () => (
  <Icon>
    <path d="M4 20 9 4M20 20 15 4M12 6v3M12 12v3M12 18v2" />
  </Icon>
);
export const DropIcon = () => (
  <Icon>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
  </Icon>
);
export const CarsIcon = () => (
  <Icon>
    <path d="M3 15v-3l2-5h14l2 5v3M3 15h18M3 15v3h3v-3M18 15v3h3v-3M7 12h10" />
  </Icon>
);
export const FuelIcon = () => (
  <Icon>
    <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M4 21h12M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3M8 7h4" />
  </Icon>
);
export const ClockIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);
export const IncidentIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const ChevronUp = () => (
  <Icon>
    <path d="m6 15 6-6 6 6" />
  </Icon>
);
export const ChevronDown = () => (
  <Icon>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const TyreDry = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
  </Icon>
);
export const TyreWet = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7s3.5 3.7 3.5 6.2a3.5 3.5 0 0 1-7 0C8.5 10.7 12 7 12 7Z" />
  </Icon>
);
export const InfinityIcon = () => (
  <Icon>
    <path d="M7 8a4 4 0 1 0 0 8c4 0 6-8 10-8a4 4 0 1 1 0 8c-4 0-6-8-10-8Z" />
  </Icon>
);
