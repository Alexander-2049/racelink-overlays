type GaugeShellProps = {
  centerX: number;
  centerY: number;
  size: number;
  idPrefix: string;
};

const GaugeShell = ({ centerX, centerY, size, idPrefix }: GaugeShellProps) => {
  const scale = size / 303;

  return (
    <g transform={`translate(${centerX}, ${centerY})`}>
      <g
        transform={`translate(${-151.5 * scale}, ${
          -151.5 * scale
        }) scale(${scale})`}
      >
        <path
          fill={`url(#${idPrefix}-rim-gradient)`}
          d="M302.987 153c.009-.666.013-1.332.013-2C303 67.329 235.171 0 151.5 0S0 67.329 0 151c0 .668.004 1.334.013 2C1.083 70.25 68.497 3.5 151.5 3.5S301.916 70.25 302.987 153Z"
        />

        <path
          fill={`url(#${idPrefix}-fill-gradient)`}
          d="M151.5 3.5C68.497 3.5 1.084 70.25.013 153c1.07 82.749 68.484 149.5 151.487 149.5S301.916 235.749 302.987 153C301.916 70.25 234.503 3.5 151.5 3.5Z"
        />
      </g>
    </g>
  );
};

export default GaugeShell;
