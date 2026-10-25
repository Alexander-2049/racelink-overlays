type ClassValue = string | false | null | undefined | Readonly<Record<string, unknown>>;

/** Joins class names; object keys are included when their value is truthy. */
export const cx = (...values: readonly ClassValue[]): string => {
  const classes: string[] = [];
  for (const value of values) {
    if (typeof value === 'string' && value !== '') classes.push(value);
    else if (typeof value === 'object' && value !== null) {
      for (const [name, on] of Object.entries(value)) if (on) classes.push(name);
    }
  }
  return classes.join(' ');
};
