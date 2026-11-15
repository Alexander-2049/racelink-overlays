import type { GaugeColors, GaugeGradientStop } from "./config/gaugeTheme";

type OverlayGradientDefsProps = {
  idPrefix: string;
  colors: GaugeColors;
};

type GradientStopsProps = {
  stops: GaugeGradientStop[];
};

const GradientStops = ({ stops }: GradientStopsProps) => (
  <>
    {stops.map(({ offset, color, opacity }, index) => (
      <stop
        key={`${offset ?? "start"}-${index}`}
        offset={offset}
        stopColor={color}
        stopOpacity={opacity}
      />
    ))}
  </>
);

const OverlayGradientDefs = ({
  idPrefix,
  colors,
}: OverlayGradientDefsProps) => {
  return (
    <defs>
      <linearGradient
        id={`${idPrefix}-speed-rim-gradient`}
        x1="151.5"
        x2="151.5"
        y1="-0.5"
        y2="302.5"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.rimGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-speed-fill-gradient`}
        x1="151.5"
        x2="151.5"
        y1="0"
        y2="302.5"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.fillGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-tach-rim-gradient`}
        x1="151.5"
        x2="151.5"
        y1="-0.5"
        y2="302.5"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.rimGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-tach-fill-gradient`}
        x1="151.5"
        x2="151.5"
        y1="0"
        y2="302.5"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.fillGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-center-fill-gradient`}
        x1="0"
        x2="0"
        y1="1.3"
        y2="0.3"
      >
        <GradientStops stops={colors.centerFillGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-speed-needle-gradient`}
        x1="5"
        x2="0"
        y1="89.25"
        y2="89.25"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.needleGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-tach-needle-gradient`}
        x1="5"
        x2="0"
        y1="89.25"
        y2="89.25"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.needleGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-speed-redline-gradient`}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        <GradientStops stops={colors.redlineGradient} />
      </linearGradient>

      <linearGradient
        id={`${idPrefix}-tach-redline-gradient`}
        x1="151.5"
        y1="0"
        x2="151.5"
        y2="239"
        gradientUnits="userSpaceOnUse"
      >
        <GradientStops stops={colors.redlineGradient} />
      </linearGradient>
    </defs>
  );
};

export default OverlayGradientDefs;
