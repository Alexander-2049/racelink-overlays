export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
};

export const mapValueToAngle = (
  value: number,
  minValue: number,
  maxValue: number,
  startAngle: number,
  endAngle: number,
  shouldClamp = true,
) => {
  const safeRange = Math.max(1, maxValue - minValue);
  const rawT = (value - minValue) / safeRange;
  const t = shouldClamp ? clamp(rawT, 0, 1) : rawT;

  return startAngle + (endAngle - startAngle) * t;
};

export const getNiceStep = (maxValue: number, desiredMarks = 8) => {
  const rough = maxValue / desiredMarks;

  const niceSteps = [
    5, 10, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 500, 1000,
  ];

  for (const step of niceSteps) {
    if (step >= rough) return step;
  }

  return rough;
};

export const roundUpToStep = (value: number, step: number, startValue = 0) => {
  if (step <= 0) return value;

  const stepsFromStart = Math.ceil((value - startValue) / step);
  return startValue + Math.max(0, stepsFromStart) * step;
};

export const buildMajorValues = (
  maxValue: number,
  step: number,
  startValue = 0,
) => {
  const scaleMaxValue = roundUpToStep(maxValue, step, startValue);
  const values: number[] = [];

  for (let value = startValue; value <= scaleMaxValue; value += step) {
    values.push(value);
  }

  return values;
};
