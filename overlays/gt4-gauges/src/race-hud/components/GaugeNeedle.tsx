import { useEffect, useRef } from "react";

type GaugeNeedleProps = {
  centerX: number;
  centerY: number;
  length: number;
  width: number;
  angle: number;
  idPrefix: string;
};

const RESPONSE_SECONDS = 0.035;
const STOP_EPSILON = 0.01;

const GaugeNeedle = ({
  centerX,
  centerY,
  length,
  width,
  angle,
  idPrefix,
}: GaugeNeedleProps) => {
  const groupRef = useRef<SVGGElement | null>(null);
  const currentAngleRef = useRef(angle);
  const targetAngleRef = useRef(angle);
  const centerRef = useRef({ centerX, centerY });
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const tailLength = length * 0.25;
  const halfWidth = width / 2;
  const halfTipWidth = width / 4;

  useEffect(() => {
    centerRef.current = { centerX, centerY };
    targetAngleRef.current = angle;

    if (frameRef.current !== null) return;

    const animate = (now: number) => {
      const lastTime = lastTimeRef.current ?? now;
      lastTimeRef.current = now;
      const deltaSeconds = Math.min((now - lastTime) / 1000, 1 / 30);
      const angleDelta = targetAngleRef.current - currentAngleRef.current;
      const follow = 1 - Math.exp(-deltaSeconds / RESPONSE_SECONDS);
      currentAngleRef.current += angleDelta * follow;

      const remaining = targetAngleRef.current - currentAngleRef.current;
      if (Math.abs(remaining) < STOP_EPSILON) {
        currentAngleRef.current = targetAngleRef.current;
        lastTimeRef.current = null;
        frameRef.current = null;
      } else {
        frameRef.current = window.requestAnimationFrame(animate);
      }

      const center = centerRef.current;
      groupRef.current?.setAttribute(
        "transform",
        `translate(${center.centerX}, ${center.centerY}) rotate(${currentAngleRef.current})`,
      );
    };

    frameRef.current = window.requestAnimationFrame(animate);
  }, [angle, centerX, centerY]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, []);

  return (
    <g ref={groupRef} transform={`translate(${centerX}, ${centerY}) rotate(${angle})`}>
      <path
        fill={`url(#${idPrefix}-needle-gradient)`}
        d={[
          "M",
          -halfTipWidth,
          -length,
          "L",
          halfTipWidth,
          -length,
          "L",
          halfWidth,
          tailLength,
          "L",
          -halfWidth,
          tailLength,
          "Z",
        ].join(" ")}
      />
    </g>
  );
};

export default GaugeNeedle;
