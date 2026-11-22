// The tables Racelink's asset index holds about iRacing, read defensively. Pure.

export type AssetTables = Readonly<{
  /** iRacing car id to brand. */
  brands: Readonly<Record<string, string>>;
  /** iRacing flair id to ISO country code. */
  flairs: Readonly<Record<string, string>>;
}>;

export const emptyTables: AssetTables = { brands: {}, flairs: {} };

const table = (value: unknown): Readonly<Record<string, string>> => {
  if (typeof value !== 'object' || value === null) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) if (typeof entry === 'string') out[key] = entry;
  return out;
};

/** The two tables out of the asset index; empty ones when it has none. */
export const tablesOf = (index: unknown): AssetTables => {
  if (typeof index !== 'object' || index === null) return emptyTables;
  const section = (name: string, field: string): unknown => {
    const entry = (index as Record<string, unknown>)[name];
    return typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>)[field] : null;
  };
  return {
    brands: table(section('carLogos', 'iracingCars')),
    flairs: table(section('flags', 'iracingFlairs')),
  };
};

