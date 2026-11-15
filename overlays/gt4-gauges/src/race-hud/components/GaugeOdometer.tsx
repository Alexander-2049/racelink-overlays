import type { GaugeColors } from "../config/gaugeTheme";

type GaugeOdometerProps = {
  centerX: number;
  centerY: number;
  size: number;
  value: number;
  colors: GaugeColors;
  fontScale: number;
};

/** Six digits with tenths, like a trip meter: 00012.4 */
const formatOdometerValue = (value: number) => {
  const tenths = Math.floor(Math.max(0, value) * 10) % 1_000_000;
  return `${String(Math.floor(tenths / 10)).padStart(5, "0")}.${String(tenths % 10)}`;
};

const GaugeOdometer = ({
  centerX,
  centerY,
  size,
  value,
  colors,
  fontScale,
}: GaugeOdometerProps) => (
  <text
    x={centerX}
    y={centerY + size * 0.035}
    fill={colors.odometerFill}
    stroke={colors.odometerStroke}
    className="gauge-odometer"
    style={{
      fontSize: `calc(var(--gauge-odometer-font-size, 20px) * ${fontScale})`,
      strokeWidth: `calc(var(--gauge-odometer-stroke-width, 1.5px) * ${fontScale})`,
    }}
  >
    {formatOdometerValue(value)}
  </text>
);

export default GaugeOdometer;
