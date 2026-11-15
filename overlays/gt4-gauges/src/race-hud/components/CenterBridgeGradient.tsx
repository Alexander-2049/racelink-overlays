import type { GaugeLayout, PedalLayout } from "../config/hudConfig";

type CenterBridgeGradientProps = {
  idPrefix: string;
  gaugeLayout: GaugeLayout;
  pedalLayout: PedalLayout;
};

const PEDAL_LOCAL_HEIGHT = 134;
const PEDAL_VERTICAL_PADDING = 10;

const getCircleXAtY = (
  centerX: number,
  centerY: number,
  radius: number,
  y: number,
  side: "left" | "right",
) => {
  const dy = y - centerY;
  const dx = Math.sqrt(Math.max(0, radius * radius - dy * dy));

  return side === "left" ? centerX - dx : centerX + dx;
};

const createBridgePath = (
  {
    speedCenterX,
    speedCenterY,
    speedSize,
    tachCenterX,
    tachCenterY,
    tachSize,
  }: GaugeLayout,
  { gasOffsetY, brakeOffsetY, scale }: PedalLayout,
) => {
  const speedRadius = speedSize / 2;
  const tachRadius = tachSize / 2;
  const speedPedalScale = scale * speedSize;
  const tachPedalScale = scale * tachSize;
  const brakeTopY = speedCenterY + brakeOffsetY * speedSize;
  const brakeBottomY = brakeTopY + PEDAL_LOCAL_HEIGHT * speedPedalScale;
  const throttleTopY = tachCenterY + gasOffsetY * tachSize;
  const throttleBottomY = throttleTopY + PEDAL_LOCAL_HEIGHT * tachPedalScale;
  const topY = Math.min(brakeTopY, throttleTopY) - PEDAL_VERTICAL_PADDING;
  const bottomY = Math.max(brakeBottomY, throttleBottomY) + PEDAL_VERTICAL_PADDING;

  const speedTopX = getCircleXAtY(
    speedCenterX,
    speedCenterY,
    speedRadius,
    topY,
    "right",
  );
  const speedBottomX = getCircleXAtY(
    speedCenterX,
    speedCenterY,
    speedRadius,
    bottomY,
    "right",
  );
  const tachTopX = getCircleXAtY(
    tachCenterX,
    tachCenterY,
    tachRadius,
    topY,
    "left",
  );
  const tachBottomX = getCircleXAtY(
    tachCenterX,
    tachCenterY,
    tachRadius,
    bottomY,
    "left",
  );

  return [
    "M",
    speedTopX,
    topY,
    "L",
    tachTopX,
    topY,
    "A",
    tachRadius,
    tachRadius,
    0,
    0,
    0,
    tachBottomX,
    bottomY,
    "L",
    speedBottomX,
    bottomY,
    "A",
    speedRadius,
    speedRadius,
    0,
    0,
    0,
    speedTopX,
    topY,
    "Z",
  ].join(" ");
};

const CenterBridgeGradient = ({
  idPrefix,
  gaugeLayout,
  pedalLayout,
}: CenterBridgeGradientProps) => (
  <path
    className="center-bridge-gradient"
    fill={`url(#${idPrefix}-center-fill-gradient)`}
    d={createBridgePath(gaugeLayout, pedalLayout)}
  />
);

export default CenterBridgeGradient;
