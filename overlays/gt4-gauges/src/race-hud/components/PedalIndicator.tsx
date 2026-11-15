export type PedalIndicatorProps = {
  x: number;
  y: number;
  scale: number;
  value: number;
  color: string;
  mirrored?: boolean;
  idPrefix: string;
};

const FILL_WIDTH = 46;
const FILL_HEIGHT = 134;
const BACKDROP_WIDTH = 59;
const MARK_OFFSET_Y = -5;

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const PedalIndicator = ({
  x,
  y,
  scale,
  value,
  color,
  mirrored = false,
  idPrefix,
}: PedalIndicatorProps) => {
  const percent = clampPercent(value);
  const fillY = FILL_HEIGHT * (1 - percent / 100);
  const transform = mirrored
    ? `translate(${x + BACKDROP_WIDTH * scale}, ${y}) scale(${-scale}, ${scale})`
    : `translate(${x}, ${y}) scale(${scale})`;

  return (
    <g transform={transform}>
      <defs>
        <clipPath id={`${idPrefix}-pedal-fill-clip`}>
          <rect
            x="0"
            y={fillY}
            width={FILL_WIDTH}
            height={FILL_HEIGHT - fillY}
          />
        </clipPath>
      </defs>

      <path
        fill="#0000007c"
        d="M0 99.939c0 11.454 1.091 22.654 3.175 33.5h11.728a165.723 165.723 0 0 1-3.403-33.5C11.5 62.371 24.055 27.736 45.199 0H31C11.446 28.414 0 62.84 0 99.939Z"
      />
      <g transform={`translate(-10 ${MARK_OFFSET_Y})`}>
        <path
          fill="#00000074"
          fillOpacity="0.4"
          d="m0 139.5 3 4.5h23.5l-1.5-4.5H0ZM58.5 0l-3 4.5H32L35.5 0h23ZM25.656 67.25l-1.104 4.5h-21l1-4.5h21.104Z"
        />
      </g>
      <path
        fill={color}
        clipPath={`url(#${idPrefix}-pedal-fill-clip)`}
        d="M0 99.939c0 11.454 1.091 22.654 3.175 33.5h11.728a165.723 165.723 0 0 1-3.403-33.5C11.5 62.371 24.055 27.736 45.199 0H31C11.446 28.414 0 62.84 0 99.939Z"
      />
    </g>
  );
};

export default PedalIndicator;
