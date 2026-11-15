import { useEffect, useRef } from "react";

type GForceIndicatorProps = {
  value: number;
  maxGForce?: number;
};

const RESPONSE_SECONDS = 0.035;
const STOP_EPSILON = 0.05;
const TRACK_X = 361.22;
const TRACK_Y = 352;
const TRACK_WIDTH = 709.56;
const TRACK_HEIGHT = 27;
const CENTER_X = TRACK_X + TRACK_WIDTH / 2;
const BALL_RADIUS = 8;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const resolveBallX = (value: number, maxGForce: number) => {
  const safeMaxGForce = maxGForce > 0 ? maxGForce : 2;
  const normalized = clamp(value / safeMaxGForce, -1, 1);

  return CENTER_X + normalized * (TRACK_WIDTH / 2 - BALL_RADIUS);
};

const formatG = (value: number) => String(Number(value.toFixed(2)));

const GForceIndicator = ({ value, maxGForce = 2 }: GForceIndicatorProps) => {
  const outerLabel = formatG(maxGForce);
  const innerLabel = formatG(maxGForce / 2);
  const initialX = resolveBallX(value, maxGForce);
  const ballRef = useRef<SVGCircleElement | null>(null);
  const currentXRef = useRef(initialX);
  const targetXRef = useRef(initialX);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    targetXRef.current = resolveBallX(value, maxGForce);

    if (frameRef.current !== null) return;

    const animate = (now: number) => {
      const lastTime = lastTimeRef.current ?? now;
      lastTimeRef.current = now;
      const deltaSeconds = Math.min((now - lastTime) / 1000, 1 / 30);
      const xDelta = targetXRef.current - currentXRef.current;
      const follow = 1 - Math.exp(-deltaSeconds / RESPONSE_SECONDS);
      currentXRef.current += xDelta * follow;

      const remaining = targetXRef.current - currentXRef.current;
      if (Math.abs(remaining) < STOP_EPSILON) {
        currentXRef.current = targetXRef.current;
        lastTimeRef.current = null;
        frameRef.current = null;
      } else {
        frameRef.current = window.requestAnimationFrame(animate);
      }

      ballRef.current?.setAttribute("cx", String(currentXRef.current));
    };

    frameRef.current = window.requestAnimationFrame(animate);
  }, [value, maxGForce]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, []);

  return (
    <g className="g-force-indicator">
      <rect
        className="g-force-indicator__track"
        x={TRACK_X}
        y={TRACK_Y}
        width={TRACK_WIDTH}
        height={TRACK_HEIGHT}
      />
      <line
        className="g-force-indicator__divider"
        x1={TRACK_X}
        y1={TRACK_Y - 2}
        x2={TRACK_X}
        y2={TRACK_Y + TRACK_HEIGHT + 3}
      />
      <line
        className="g-force-indicator__divider"
        x1={CENTER_X}
        y1={TRACK_Y - 2}
        x2={CENTER_X}
        y2={TRACK_Y + TRACK_HEIGHT + 3}
      />
      <line
        className="g-force-indicator__divider"
        x1={TRACK_X + TRACK_WIDTH}
        y1={TRACK_Y - 2}
        x2={TRACK_X + TRACK_WIDTH}
        y2={TRACK_Y + TRACK_HEIGHT + 3}
      />
      <circle
        ref={ballRef}
        className="g-force-indicator__ball"
        cx={initialX}
        cy={TRACK_Y + TRACK_HEIGHT / 2}
        r={BALL_RADIUS}
      />
      <text className="g-force-indicator__label" x={TRACK_X} y={TRACK_Y + 55}>
        {outerLabel}
      </text>
      <text
        className="g-force-indicator__label"
        x={TRACK_X + TRACK_WIDTH * 0.25}
        y={TRACK_Y + 55}
      >
        {innerLabel}
      </text>
      <text className="g-force-indicator__label" x={CENTER_X} y={TRACK_Y + 55}>
        G
      </text>
      <text
        className="g-force-indicator__label"
        x={TRACK_X + TRACK_WIDTH * 0.75}
        y={TRACK_Y + 55}
      >
        {innerLabel}
      </text>
      <text
        className="g-force-indicator__label"
        x={TRACK_X + TRACK_WIDTH}
        y={TRACK_Y + 55}
      >
        {outerLabel}
      </text>
    </g>
  );
};

export default GForceIndicator;
