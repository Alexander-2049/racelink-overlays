import {
  parsePublishedDriverTags,
  type PublishedDriverTag,
} from '../../../../shared/contracts/driverTags';

/** Tags arrive sorted by priority, so the first one decides the driver's color. */
export const primaryDriverTagColor = (tags: readonly PublishedDriverTag[]): string | null =>
  tags[0]?.color ?? null;

export const readDriverTags = parsePublishedDriverTags;
