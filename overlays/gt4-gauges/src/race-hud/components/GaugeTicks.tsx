import MajorTick from "./MajorTick";
import MinorTicks from "./MinorTicks";
import type { GaugeTickGeometryProps } from "./GaugeDial.types";

type GaugeTicksProps = GaugeTickGeometryProps & {
  majorValues: number[];
  minorStepsPerMajor: number;
  angleForValue: (value: number) => number;
  labelFormatter: (value: number) => string;
};

const GaugeTicks = ({
  majorValues,
  minorStepsPerMajor,
  angleForValue,
  labelFormatter,
  ...geometryProps
}: GaugeTicksProps) => (
  <>
    {majorValues.map((majorValue, index) => (
      <g key={majorValue}>
        <MajorTick
          {...geometryProps}
          angle={angleForValue(majorValue)}
          label={labelFormatter(majorValue)}
        />
        {index < majorValues.length - 1 ? (
          <MinorTicks
            {...geometryProps}
            fromValue={majorValue}
            toValue={majorValues[index + 1]}
            steps={minorStepsPerMajor}
            angleForValue={angleForValue}
          />
        ) : null}
      </g>
    ))}
  </>
);

export default GaugeTicks;
