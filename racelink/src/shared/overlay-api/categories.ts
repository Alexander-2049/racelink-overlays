/**
 * Categories group overlays in "Add overlay" and on the Workshop. The order
 * here is the order of the groups. Ids and Workshop tags are a stable public
 * contract: `racelink.overlay.json` declares an id in `category`, and every
 * published item carries the category's `workshopTag`, which the Steamworks
 * Workshop tag settings list as the values of the "Category" filter.
 */
export const overlayCategories = [
  {
    id: 'race',
    name: 'Race',
    workshopTag: 'Race',
    description: 'Standings, relatives, positions, session state and flags.',
  },
  {
    id: 'timing',
    name: 'Timing',
    workshopTag: 'Timing',
    description: 'Lap and sector times, deltas, stints and clocks.',
  },
  {
    id: 'driving',
    name: 'Driving',
    workshopTag: 'Driving',
    description: 'Inputs and cockpit instruments: pedals, gear, speed, RPM, steering, aids.',
  },
  {
    id: 'awareness',
    name: 'Awareness',
    workshopTag: 'Awareness',
    description: 'What is around the car: radar, blind spots, traffic and track maps.',
  },
  {
    id: 'strategy',
    name: 'Strategy',
    workshopTag: 'Strategy',
    description: 'Fuel, energy, batteries and pit stops.',
  },
  {
    id: 'tyres',
    name: 'Tyres and brakes',
    workshopTag: 'Tyres and brakes',
    description: 'Tyre temperatures, pressures and wear, brakes, grip and slip.',
  },
  {
    id: 'chassis',
    name: 'Chassis and engine',
    workshopTag: 'Chassis and engine',
    description: 'Suspension, aero, engine, differential and damage.',
  },
  {
    id: 'weather',
    name: 'Weather',
    workshopTag: 'Weather',
    description: 'Weather, forecast and wind.',
  },
  {
    id: 'other',
    name: 'Other',
    workshopTag: 'Other',
    description: 'Anything that fits no other category.',
  },
] as const;

export type OverlayCategory = (typeof overlayCategories)[number]['id'];

export const overlayCategoryIds: readonly OverlayCategory[] = overlayCategories.map(
  (category) => category.id,
);

/** The category of an overlay that declares none, or one this Racelink does not know. */
export const defaultOverlayCategory: OverlayCategory = 'other';

export const isOverlayCategory = (value: unknown): value is OverlayCategory =>
  typeof value === 'string' && overlayCategoryIds.includes(value as OverlayCategory);

export const overlayCategoryName = (category: OverlayCategory): string =>
  overlayCategories.find((item) => item.id === category)?.name ?? category;

export type CategoryGroup<T> = Readonly<{ category: OverlayCategory; items: readonly T[] }>;

/**
 * Groups items by category in the order of `overlayCategories`, keeping the
 * order of items within a group and leaving out empty groups.
 */
export const groupByCategory = <T>(
  items: readonly T[],
  categoryOf: (item: T) => OverlayCategory,
): readonly CategoryGroup<T>[] =>
  overlayCategoryIds
    .map((category) => ({ category, items: items.filter((item) => categoryOf(item) === category) }))
    .filter((group) => group.items.length > 0);

export const overlayCategoryWorkshopTag = (category: OverlayCategory): string =>
  overlayCategories.find((item) => item.id === category)?.workshopTag ?? 'Other';

/** The category a Workshop item declares through its tags, if any. */
export const categoryFromWorkshopTags = (tags: readonly string[]): OverlayCategory | null => {
  const normalized = new Set(tags.map((tag) => tag.trim().toLowerCase()));
  return (
    overlayCategories.find((category) => normalized.has(category.workshopTag.toLowerCase()))?.id ??
    null
  );
};

/** True for the tag of any category; an item must carry only its own one. */
export const isCategoryWorkshopTag = (tag: string): boolean =>
  overlayCategories.some(
    (category) => category.workshopTag.toLowerCase() === tag.trim().toLowerCase(),
  );
