export type FuelIndicatorProps = {
  x: number;
  y: number;
  scale: number;
  value: number;
  color?: string;
  idPrefix: string;
};

const OFF_COLOR = "#000000";
const OFF_OPACITY = 0.6;
const ON_OPACITY = 1;
const LOW_FUEL_COLOR = "#D71920";
const LOW_FUEL_THRESHOLD = 20;
const SEGMENT_COUNT = 10;
const MARK_OFFSET_Y = -5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const clampPercent = (value: number) => clamp(value, 0, 100);

const SEGMENT_PATHS = [
  "M45.199 0H31a176.626 176.626 0 0 0-6.1 9.5h13.571A165.468 165.468 0 0 1 45.2 0Z",
  "M17.85 22.5h12.914c1.629-3.059 3.35-6.06 5.162-9H22.58a176.026 176.026 0 0 0-4.728 9Z",
  "M12.133 35.5h12.424a164.196 164.196 0 0 1 4.147-9H15.957a175.335 175.335 0 0 0-3.824 9Z",
  "M7.613 48.5h12.063a163.75 163.75 0 0 1 3.244-9h-12.3a175.15 175.15 0 0 0-3.007 9Z",
  "M16.001 61.5H4.198c.673-3.03 1.424-6.03 2.25-9h11.973a163.792 163.792 0 0 0-2.42 9Z",
  "M.85 82.5h11.56c.354-3.365.809-6.699 1.361-10H2.121c-.517 3.304-.94 6.638-1.27 10Z",
  "M.055 95.5h11.504c.08-3.02.24-6.022.48-9H.504a178.57 178.57 0 0 0-.45 9Z",
  "M0 99.939c0 2.87.069 5.724.204 8.561h11.514a167.614 167.614 0 0 1-.217-9H0v.439Z",
  "M12.896 121.5H1.304a177.274 177.274 0 0 1-.864-9h11.531c.228 3.023.537 6.024.925 9Z",
  "M14.903 133.439H3.175a177.09 177.09 0 0 1-1.338-7.939h11.63c.416 2.668.895 5.315 1.436 7.939Z",
];

const SEGMENT_BOUNDS = [
  { y: 0, height: 9.5 },
  { y: 13.5, height: 9 },
  { y: 26.5, height: 9 },
  { y: 39.5, height: 9 },
  { y: 52.5, height: 9 },
  { y: 72.5, height: 10 },
  { y: 86.5, height: 9 },
  { y: 99.5, height: 9 },
  { y: 112.5, height: 9 },
  { y: 125.5, height: 7.939 },
];

const FUEL_ICON_PATH =
  "m0 1 1-1h9.5l1 1v1H15l1 1v6h4l1 1v13l-1 1h-5l-1-1V11l-.5-.5H12l-.5.5v12l-1 1H1l-1-1V1Zm2.5 8h7V2h-7v7Zm9.5-.5-.5-.5V4.5L12 4h1.5l.5.5V8l-.5.5H12ZM17 22l-1-1v-9l1-1h1l1 1v9l-1 1h-1Z";

const getFuelSegmentFill = (value: number, index: number) => {
  const percent = clampPercent(value);
  const percentBelowSegment = (SEGMENT_COUNT - 1 - index) * 10;

  return clamp((percent - percentBelowSegment) / 10, 0, 1);
};

const FuelIndicator = ({
  x,
  y,
  scale,
  value,
  color = "#91B7E4",
  idPrefix,
}: FuelIndicatorProps) => {
  const percent = clampPercent(value);
  const fillColor = percent < LOW_FUEL_THRESHOLD ? LOW_FUEL_COLOR : color;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        {SEGMENT_BOUNDS.map(({ y: segmentY, height }, index) => {
          const fill = getFuelSegmentFill(percent, index);
          const clipHeight = height * fill;

          return (
            <clipPath key={index} id={`${idPrefix}-segment-${index}`}>
              <rect
                x="-1"
                y={segmentY + height - clipHeight}
                width="50"
                height={clipHeight}
              />
            </clipPath>
          );
        })}
      </defs>

      {SEGMENT_PATHS.map((path, index) => (
        <g key={path}>
          <path
            className="fuel-indicator__segment"
            fill={OFF_COLOR}
            fillOpacity={OFF_OPACITY}
            d={path}
          />
          <path
            className="fuel-indicator__segment"
            fill={fillColor}
            fillOpacity={ON_OPACITY}
            clipPath={`url(#${idPrefix}-segment-${index})`}
            d={path}
          />
        </g>
      ))}
      <g transform={`translate(-10 ${MARK_OFFSET_Y})`}>
        <path
          className="fuel-indicator__mark"
          d="m0 139.5 3 4.5h23.5l-1.5-4.5H0ZM58.5 0l-3 4.5H32L35.5 0h23ZM25.656 67.25l-1.104 4.5h-21l1-4.5h21.104Z"
        />
      </g>
      <path
        className="fuel-indicator__icon"
        fillRule="evenodd"
        clipRule="evenodd"
        transform="translate(-35 52)"
        d={FUEL_ICON_PATH}
      />
      <text className="fuel-indicator__label" x="2" y="3.5">
        F
      </text>
      <text className="fuel-indicator__label" x="-29" y="134">
        E
      </text>
    </g>
  );
};

export default FuelIndicator;
