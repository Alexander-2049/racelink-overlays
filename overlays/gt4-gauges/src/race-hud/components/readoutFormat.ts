export const formatGear = (gear: number) => {
  const roundedGear = Math.round(gear);
  if (roundedGear < 0) return "R";
  if (roundedGear === 0) return "N";
  return String(roundedGear);
};

export const formatSpeed = (speed: number) =>
  String(Math.max(0, Math.round(speed)));
