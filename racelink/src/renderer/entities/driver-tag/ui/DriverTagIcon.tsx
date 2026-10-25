import {
  Droplet,
  Flame,
  Heart,
  ShieldCheck,
  Star,
  TriangleAlert,
  Video,
  type LucideIcon,
} from 'lucide-react';

import type { DriverTagKey, PublishedDriverTag } from '../../../../shared/contracts/driverTags';

const icons: Readonly<Record<DriverTagKey, LucideIcon>> = {
  dangerous: TriangleAlert,
  dirty: Droplet,
  aggressive: Flame,
  friend: Heart,
  pro: Star,
  streamer: Video,
  clean: ShieldCheck,
};

// Filled glyph with a dark outline, matching the Arcade Map hazard marker.
const outline = '#0f172a';

type DriverTagIconProps = Readonly<{ tag: PublishedDriverTag; size?: number }>;

export function DriverTagIcon({ tag, size = 15 }: DriverTagIconProps) {
  const Icon = icons[tag.key];
  return (
    <Icon
      size={size}
      fill={tag.color}
      stroke={outline}
      strokeWidth={2}
      className="shrink-0"
      aria-hidden="true"
    />
  );
}

type DriverTagIconsProps = Readonly<{ tags: readonly PublishedDriverTag[]; size?: number }>;

/** All of a driver's tags, in priority order, with the names as an accessible label. */
export function DriverTagIcons({ tags, size }: DriverTagIconsProps) {
  if (tags.length === 0) return null;
  const label = tags.map((tag) => tag.name).join(', ');
  return (
    <span
      className="inline-flex shrink-0 items-center gap-0.5"
      role="img"
      aria-label={label}
      title={label}
    >
      {tags.map((tag, index) => (
        <DriverTagIcon key={`${tag.key}:${tag.name}:${String(index)}`} tag={tag} size={size} />
      ))}
    </span>
  );
}
