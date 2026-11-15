import type { ShiftState } from "../model";
import type { SpeedUnit } from "../utils/speedUnits";
import { formatGear, formatSpeed } from "./readoutFormat";
import { useGearFlashAnimation } from "./useGearFlashAnimation";

export type CenterReadoutProps = {
  gear: number;
  speed: number;
  speedUnit: SpeedUnit;
  shiftState: ShiftState;
  pitLimiter: boolean;
  showGear?: boolean;
  showSpeed?: boolean;
};

const SPEED_READOUT_CENTER_X = 716;
const SPEED_READOUT_SINGLE_DIGIT_X = 690;
const SPEED_READOUT_DIGIT_STEP = 37;
const UNIT_LABELS: Record<SpeedUnit, string> = { kph: "km/h", mph: "mph" };

const getSpeedTextX = (speedText: string) => {
  const digitCount = Math.max(1, speedText.replace(/\D/g, "").length);
  return (
    SPEED_READOUT_SINGLE_DIGIT_X - (digitCount - 1) * SPEED_READOUT_DIGIT_STEP
  );
};

const CenterReadout = ({
  gear,
  speed,
  speedUnit,
  shiftState,
  pitLimiter,
  showGear = true,
  showSpeed = true,
}: CenterReadoutProps) => {
  const gearAnimation = useGearFlashAnimation(formatGear(gear));
  const speedText = formatSpeed(speed);

  return (
    <g className="center-readout">
      {showGear ? (
        <g className={`center-readout__gear-group center-readout__gear-group--${shiftState}`}>
          <rect
            className="center-readout__gear-box"
            x="674"
            y="75"
            width="84"
            height="100"
            rx="6"
            ry="6"
          />
          <text
            x="716"
            y="155"
            className="center-readout__gear"
            fill={gearAnimation.color}
            opacity={gearAnimation.opacity}
            style={{ transition: gearAnimation.transition }}
          >
            {gearAnimation.gearText}
          </text>
        </g>
      ) : null}

      {showSpeed ? (
        <>
          <text
            x={getSpeedTextX(speedText)}
            y="240"
            className="center-readout__speed"
          >
            {speedText}
          </text>
          <text
            x={SPEED_READOUT_CENTER_X}
            y="284"
            className={
              pitLimiter
                ? "center-readout__unit center-readout__unit--pit"
                : "center-readout__unit"
            }
          >
            {pitLimiter ? "PIT" : UNIT_LABELS[speedUnit]}
          </text>
        </>
      ) : null}
    </g>
  );
};

export default CenterReadout;
