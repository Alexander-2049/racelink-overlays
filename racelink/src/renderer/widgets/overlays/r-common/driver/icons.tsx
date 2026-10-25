import { memo, useEffect, useState } from 'react';

/** Bars of the animated sound wave: [y, height] in percent for each of the seven columns. */
const waveFrames: readonly (readonly (readonly [number, number])[])[] = [
  [
    [24, 48],
    [12, 72],
    [24, 48],
    [36, 24],
    [44, 8],
    [44, 8],
    [36, 24],
  ],
  [
    [44, 8],
    [36, 24],
    [24, 48],
    [12, 72],
    [24, 48],
    [36, 24],
    [44, 8],
  ],
  [
    [36, 24],
    [44, 8],
    [44, 8],
    [36, 24],
    [24, 48],
    [12, 72],
    [24, 48],
  ],
];
const waveColumns = [8, 20, 32, 44, 56, 68, 80];

type SoundWaveProps = Readonly<{ className?: string; color?: string }>;

/** The "driver is talking" icon. */
export function AnimatedSoundWave({ className, color = 'white' }: SoundWaveProps) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStep((current) => (current >= 8 ? 0 : current + 1));
    }, 300);
    return () => {
      window.clearTimeout(timer);
    };
  }, [step]);
  const frame = waveFrames[step % waveFrames.length] ?? waveFrames[0] ?? [];
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className={`animatedSoundWave ${className ?? ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {frame.map(([y, height], index) => (
        <rect
          key={waveColumns[index]}
          x={`${String(waveColumns[index])}%`}
          y={`${String(y)}%`}
          width="8%"
          height={`${String(height)}%`}
          fill={color}
        />
      ))}
    </svg>
  );
}

export const BlackFlagIcon = memo(function BlackFlagIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="23" height="23" fill="#ffffff" opacity="0.8" />
      <rect x="1" y="1" width="21" height="21" fill="#121215" />
    </svg>
  );
});

export const BlackAndWhiteFlagIcon = memo(function BlackAndWhiteFlagIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="23" height="23" fill="#121215" />
      <path d="M23 23L0 23L23 0L23 23Z" fill="white" />
    </svg>
  );
});

export const RepairFlagIcon = memo(function RepairFlagIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="23" height="23" fill="#121215" />
      <circle cx="11.5" cy="11.5" r="6.3" fill="#F97316" />
    </svg>
  );
});

export const PittingFlagIcon = memo(function PittingFlagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <rect width="20" height="20" fill="white" />
      <text x="10" y="14" fontWeight="normal" fontSize="10" textAnchor="middle" fill="black">
        PIT
      </text>
    </svg>
  );
});

export const CheckeredFlagIcon = memo(function CheckeredFlagIcon() {
  const cells: readonly (readonly [number, number])[] = [
    [0, 0],
    [0, 14.6087],
    [7.30435, 7.30435],
    [7.30435, 21.913],
    [14.6087, 0],
    [14.6087, 14.6087],
    [21.913, 7.30435],
    [21.913, 21.913],
  ];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 28 28" fill="none">
      <g clipPath="url(#rl_checkered_clip)">
        <rect x="-4.05859" y="-0.601074" width="36.1176" height="29.2026" fill="#121215" />
        {cells.map(([x, y]) => (
          <rect
            key={`${String(x)}-${String(y)}`}
            x={x}
            y={y}
            width="7.30435"
            height="7.30435"
            fill="#EEEEEE"
          />
        ))}
      </g>
      <defs>
        <clipPath id="rl_checkered_clip">
          <rect width="28" height="28" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
});

const stopwatchHand =
  'M11.9412 12.3611L14.3548 12.53C14.4526 12.5368 14.5285 12.6202 14.5287 12.7207C14.5287 12.8212 14.4527 12.9046 14.3549 12.9115L11.989 13.0769C11.989 13.0769 12.0187 13.5116 12.0187 13.5231C12.0187 13.6545 11.9141 13.761 11.7862 13.761H11.1518C11.0875 13.761 11.0261 13.7336 10.9823 13.6855C10.9385 13.6374 10.9161 13.5728 10.9204 13.507L10.9442 13.1502L10.6147 13.1732C10.6104 13.1735 10.6062 13.1736 10.6021 13.1736C10.555 13.1736 10.5094 13.1553 10.4748 13.1221C10.4371 13.086 10.4157 13.0354 10.4157 12.9824V12.4591C10.4157 12.4061 10.4371 12.3555 10.4748 12.3193C10.5125 12.2831 10.5632 12.2647 10.6147 12.2683L11.001 12.2953L11.2376 8.73476C11.246 8.61001 11.347 8.51315 11.4689 8.51315C11.5909 8.51315 11.692 8.61001 11.7003 8.73476L11.9412 12.3611Z';
const stopwatchRing =
  'M5.56622 6.79663L6.54551 7.78119C5.6314 8.75424 5.02079 9.97516 4.78908 11.2932C4.55737 12.6112 4.71471 13.9686 5.24167 15.1977C5.76863 16.4268 6.64213 17.4739 7.7543 18.2095C8.86647 18.9451 10.1686 19.3372 11.4999 19.3372C12.8312 19.3372 14.1333 18.9451 15.2455 18.2095C16.3576 17.4739 17.2311 16.4268 17.7581 15.1977C18.285 13.9686 18.4424 12.6112 18.2107 11.2932C17.979 9.97516 17.3683 8.75424 16.4542 7.78119L17.4335 6.79663L16.4699 5.82749L15.4223 6.88073C14.4653 6.19887 13.3485 5.77862 12.1814 5.66117V5.03338H13.5443V3.66309H9.45543V5.03338H10.8184V5.66117C9.65125 5.77862 8.53446 6.19887 7.57744 6.88073L6.52983 5.82749L5.56622 6.79663ZM11.0493 17.9404L11.1213 17.6449H11.8785L11.9506 17.9408C12.8699 17.8642 13.7576 17.5539 14.5288 17.0358C14.7171 16.9093 14.8968 16.7715 15.0669 16.6236L14.8612 16.2719L15.3967 15.7227L15.7345 15.9306C16.0637 15.5225 16.3345 15.0667 16.5367 14.576C16.7674 14.016 16.9029 13.4246 16.9407 12.8262L16.0431 12.5959V11.8192L16.8819 11.604C16.8714 11.5389 16.8598 11.4739 16.847 11.4091C16.6722 10.5258 16.2843 9.7022 15.7208 9.00923L15.2478 9.30039L14.7123 8.75113L14.9935 8.27047C14.2954 7.68464 13.4604 7.2819 12.5635 7.10253C12.3788 7.06559 12.1929 7.03842 12.0066 7.02094L11.8785 7.54692H11.1213L10.9931 7.02094C10.4529 7.07165 9.92026 7.20342 9.41354 7.41444C9.02853 7.57477 8.66514 7.77808 8.32958 8.01923L8.56288 8.41812L8.02746 8.96738L7.5661 8.68341C7.34587 8.91416 7.14516 9.16487 6.96683 9.43321C6.53031 10.09 6.24209 10.8309 6.11783 11.6041L6.95663 11.8192V12.5959L6.05937 12.826C6.1372 14.0378 6.61295 15.1899 7.4117 16.1009L7.75186 15.8915L8.28729 16.4407L8.10037 16.7603C8.94429 17.4378 9.97076 17.8493 11.0493 17.9404Z';

/** The glyph of the "slowdown" and "fastest" flags: a stopwatch. */
function Stopwatch({ fill }: Readonly<{ fill: string }>) {
  return (
    <>
      <path d={stopwatchHand} fill={fill} />
      <path fillRule="evenodd" clipRule="evenodd" d={stopwatchRing} fill={fill} />
    </>
  );
}

export const SlowdownFlagIcon = memo(function SlowdownFlagIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="23" height="23" fill="#121215" />
      <Stopwatch fill="#ff4747" />
    </svg>
  );
});

export const FastestFlagIcon = memo(function FastestFlagIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="23" height="23" fill="#8820F2" />
      <Stopwatch fill="white" />
    </svg>
  );
});

export const JokerLapIcon = memo(function JokerLapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M1.86621 19.1548C2.83042 20.4136 4.38388 21.0899 6.20517 21.0899C9.3478 21.0899 11.0262 19.399 11.0262 15.9797V14.0399L7.40689 10.9443L7.5265 16.2052C7.5265 17.4639 6.97297 18.1215 5.95519 18.1215C5.15168 18.1215 4.4553 17.6518 3.79464 16.75L1.86621 19.1548ZM6.95514 9.91247H7.5265H11.0262V7.03798H3.2054V9.91247H6.95514Z"
        fill="white"
      />
      <path
        d="M19.3225 5.68848L21.1505 11.749L27.0662 11.749L22.2803 15.4946L24.1084 21.5551L19.3225 17.8095L14.5366 21.5551L16.3646 15.4946L11.5787 11.749L17.4944 11.749L19.3225 5.68848Z"
        fill="white"
      />
    </svg>
  );
});

export const PushToPassIcon = memo(function PushToPassIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M11.5 2.5H5.1L3.5 8.5H6.16667L5.1 13L11.5 6H9.36667L11.5 2.5Z" fill="#ffffff" />
    </svg>
  );
});

type BatteryProps = Readonly<{
  colored: boolean;
  version: '0' | '25' | '50' | '75' | '100' | null;
}>;

const batteryColors: Readonly<Record<string, string>> = {
  '25': '#FE171F',
  '50': '#FBBF24',
  '75': '#84CC16',
  '100': '#2FF436',
};
const barX = [5, 13, 21, 29];

export const VirtualEnergyBattery = memo(function VirtualEnergyBattery({
  colored,
  version,
}: BatteryProps) {
  const bars = version === null ? 0 : Math.round(Number(version) / 25);
  const fill = colored && version !== null ? (batteryColors[version] ?? 'white') : 'white';
  return (
    <svg width="43" height="20" viewBox="0 0 43 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect opacity="0.25" x="1.5" y="2" width="36" height="16" rx="1.5" fill="black" />
      <rect
        x="0.75"
        y="1.25"
        width="37.5"
        height="17.5"
        rx="2.25"
        stroke="white"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M39 6.5H41C42.1046 6.5 43 7.39543 43 8.5V11.5C43 12.6046 42.1046 13.5 41 13.5H39V6.5Z"
        fill="white"
        fillOpacity="0.3"
      />
      {barX.slice(0, bars).map((x) => (
        <rect key={x} x={x} y="4.5" width="5" height="11" rx="1" fill={fill} />
      ))}
      {version === null && (
        <path
          transform="translate(13, 3.2)"
          d="M10.5697 3.94L7.73166 6.8L10.5697 9.66L9.38166 10.936L6.49966 8.032L3.61766 10.936L2.45166 9.66L5.28966 6.8L2.45166 3.94L3.61766 2.664L6.49966 5.568L9.38166 2.664L10.5697 3.94Z"
          fill="white"
          fillOpacity="0.4"
        />
      )}
    </svg>
  );
});

type TireIconProps = Readonly<{ isEmpty: boolean; color: string }>;

/** A tyre: an outlined disc, with the compound color as its ring. */
export const TireIcon = memo(function TireIcon({ isEmpty, color }: TireIconProps) {
  if (isEmpty) {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8.5" cy="8.5" r="8.5" fill="#171717" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.5821 12.5528L12.8007 11.9288C13.5517 10.9883 14 9.79788 14 8.5C14 7.20212 13.5517 6.01169 12.8007 5.07119L13.5821 4.4472C14.4695 5.55851 15 6.9673 15 8.5C15 10.0327 14.4695 11.4415 13.5821 12.5528ZM12.5528 3.41787L11.9288 4.19931C10.9883 3.44831 9.79788 3 8.5 3C7.20212 3 6.01169 3.44831 5.07119 4.19931L4.4472 3.41787C5.55851 2.53049 6.9673 2 8.5 2C10.0327 2 11.4415 2.53049 12.5528 3.41787ZM3.41787 4.4472C2.53049 5.55851 2 6.9673 2 8.5C2 10.0327 2.53049 11.4415 3.41787 12.5528L4.19931 11.9288C3.44831 10.9883 3 9.79788 3 8.5C3 7.20212 3.44831 6.01169 4.19931 5.07119L3.41787 4.4472ZM4.4472 13.5821L5.07119 12.8007C6.01169 13.5517 7.20212 14 8.5 14C9.79788 14 10.9883 13.5517 11.9288 12.8007L12.5528 13.5821C11.4415 14.4695 10.0327 15 8.5 15C6.9673 15 5.55851 14.4695 4.4472 13.5821Z"
          fill={color}
        />
      </svg>
    );
  }
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8.5" cy="8.5" r="8.5" fill="#171717" />
      <circle cx="8.5" cy="8.5" r="6" fill="#212121" stroke={color} />
      <path d="M2 4H15L16 8.5L15 13H2L1 8.5L2 4Z" fill="#171717" />
    </svg>
  );
});
