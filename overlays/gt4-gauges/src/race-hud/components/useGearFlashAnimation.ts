import { useEffect, useRef, useState } from "react";

export type GearFlashAnimation = {
  gearText: string;
  color: string;
  opacity: number;
  transition: string;
};

const BASE_GEAR_COLOR = "var(--gear-color, #000000)";

const createAnimationState = (
  gearText: string,
  color: string,
  opacity: number,
  transition = "none",
): GearFlashAnimation => ({ gearText, color, opacity, transition });

export const useGearFlashAnimation = (gearText: string) => {
  const displayedGearRef = useRef(gearText);
  const animationIdRef = useRef(0);
  const timeoutRefs = useRef<number[]>([]);
  const frameRefs = useRef<number[]>([]);
  const [animation, setAnimation] = useState(() =>
    createAnimationState(gearText, BASE_GEAR_COLOR, 1),
  );

  useEffect(() => {
    if (gearText === displayedGearRef.current) return;
    displayedGearRef.current = gearText;
    animationIdRef.current += 1;
    const animationId = animationIdRef.current;

    clearScheduledAnimation(timeoutRefs.current, frameRefs.current);
    timeoutRefs.current = [];
    frameRefs.current = [];
    setAnimation(createAnimationState(gearText, "#FFFFFF", 1));

    const fadeOutFrame = window.requestAnimationFrame(() => {
      if (animationIdRef.current !== animationId) return;
      setAnimation(createAnimationState(gearText, "#FFFFFF", 0, "opacity 0.05s linear"));
    });
    frameRefs.current.push(fadeOutFrame);

    const swapTimeout = window.setTimeout(() => {
      if (animationIdRef.current !== animationId) return;
      setAnimation(createAnimationState(gearText, BASE_GEAR_COLOR, 0));
      const fadeInFrame = window.requestAnimationFrame(() => {
        if (animationIdRef.current !== animationId) return;
        setAnimation(createAnimationState(gearText, BASE_GEAR_COLOR, 1, "opacity 0.05s linear"));
      });
      frameRefs.current.push(fadeInFrame);
    }, 50);
    timeoutRefs.current.push(swapTimeout);

    return () => {
      clearScheduledAnimation(timeoutRefs.current, frameRefs.current);
      timeoutRefs.current = [];
      frameRefs.current = [];
    };
  }, [gearText]);

  return animation;
};

const clearScheduledAnimation = (timeouts: number[], frames: number[]) => {
  for (const timeoutId of timeouts) window.clearTimeout(timeoutId);
  for (const frameId of frames) window.cancelAnimationFrame(frameId);
};
