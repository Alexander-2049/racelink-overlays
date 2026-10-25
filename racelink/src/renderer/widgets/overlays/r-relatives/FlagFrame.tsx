import { memo, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { rFlagAliases, rFlagEntries } from '../../../../shared/contracts/rCatalog/flags';
import { cx } from '../r-common/driver/cx';
import { checkerImage } from './checkerImage';

export type FlagFramePosition = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';

type FlagPalette = Readonly<{ bg: string; stripe: string; color?: string }>;

const dark: FlagPalette = { bg: '#23251E', stripe: '#000000', color: '#ffffff' };
const grey: FlagPalette = { bg: '#D9D9D9', stripe: '#848489' };
const green: FlagPalette = { bg: '#2FF436', stripe: '#16A34A' };
const amber: FlagPalette = { bg: '#FBBF24', stripe: '#F59E0B' };

/** Frame colors per `session.flagDetail`. */
const palettes: Readonly<Record<string, FlagPalette>> = {
  black: dark,
  disqualify: dark,
  furled: dark,
  repair: dark,
  checkered: { bg: '#ffffff', stripe: '#000000', color: '#000000' },
  blue: { bg: '#2563EB', stripe: '#1E40AF' },
  startHidden: grey,
  startReady: grey,
  startSet: grey,
  startGo: grey,
  white: grey,
  tenToGo: green,
  oneLapToGreen: green,
  fiveToGo: green,
  green,
  greenHeld: green,
  red: { bg: '#FE171F', stripe: '#991B1B' },
  randomWaving: amber,
  debris: { bg: '#FBBF24', stripe: '#a10000' },
  crossed: amber,
  caution: amber,
  yellow: amber,
  cautionWaving: amber,
  yellowWaving: amber,
};

/** Flags that never open the frame. */
const hidden = new Set(['startHidden', 'startSet', 'startReady', 'startGo', 'oneLapToGreen']);

const stripeTrapezoid = 'M12.881 0H20.5L8.11905 12H0.5L12.881 0Z';

function Stripes({
  color,
  isCheckered,
  opposite,
}: Readonly<{ color: string; isCheckered: boolean; opposite?: boolean }>) {
  return (
    <div
      className={cx('flagFeatureContainerContStripes', { opposite, checkeredFlag: isCheckered })}
    >
      {isCheckered ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="111"
          height="12"
          viewBox="0 0 111 12"
          fill="none"
        >
          <path
            d="M12.8809 0L110.381 9.34601e-05L98.0001 12.0001L0.499907 12L12.8809 0Z"
            fill="url(#rl_flag_checker)"
          />
          <defs>
            <pattern
              id="rl_flag_checker"
              patternContentUnits="objectBoundingBox"
              width="0.22133"
              height="2.02665"
            >
              <use xlinkHref="#rl_flag_checker_image" transform="scale(0.00345829 0.0316664)" />
            </pattern>
            <image id="rl_flag_checker_image" width="64" height="64" xlinkHref={checkerImage} />
          </defs>
        </svg>
      ) : (
        Array.from({ length: 8 }, (_, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="12"
            viewBox="0 0 21 12"
            fill="none"
          >
            <path d={stripeTrapezoid} fill={color} />
          </svg>
        ))
      )}
    </div>
  );
}

const textOf = (flag: string): string => {
  const entry = rFlagEntries.find((candidate) => candidate.id === (rFlagAliases[flag] ?? flag));
  return entry?.text ?? 'N/A';
};

function FrameHeader({ flag }: Readonly<{ flag: string }>) {
  const palette = palettes[flag];
  const stripe = palette?.stripe ?? '#848489';
  return (
    <div className="flagFeatureContainerContInner">
      <Stripes color={stripe} isCheckered={flag === 'checkered'} />
      <span className="flagFeatureContainerContText">{textOf(flag)}</span>
      <Stripes color={stripe} isCheckered={flag === 'checkered'} opposite />
    </div>
  );
}

type FrameProps = Readonly<{
  isEnabled: boolean;
  position: FlagFramePosition;
  flag: string | null;
  rounded: boolean;
  children: ReactNode;
}>;

/** Holds the last flag for the length of the hide animation. */
const useLeavingFlag = (flag: string | null) => {
  const [held, setHeld] = useState<{ flag: string; leaving: boolean } | null>(null);
  if (flag !== null && (held === null || held.flag !== flag || held.leaving))
    setHeld({ flag, leaving: false });
  else if (flag === null && held !== null && !held.leaving) setHeld({ ...held, leaving: true });
  const leaving = held?.leaving === true;
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      setHeld(null);
    }, 500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [leaving]);
  return held;
};

/** The colored frame the Relative overlay draws around itself for the current flag. */
export const FlagFrame = memo(function FlagFrame({
  isEnabled,
  position,
  flag,
  rounded,
  children,
}: FrameProps) {
  const held = useLeavingFlag(isEnabled ? flag : null);
  if (!isEnabled) return <>{children}</>;
  const shown = held !== null && !hidden.has(held.flag) ? held : null;
  const palette = shown !== null ? palettes[shown.flag] : undefined;
  const style =
    shown !== null && palette !== undefined
      ? ({
          '--flagBgColor': palette.bg,
          '--flagTextColor': palette.color ?? '#000000',
        } as CSSProperties)
      : undefined;
  const top = position === 'TOP';
  const bottom = position === 'BOTTOM';
  const left = position === 'LEFT';
  const right = position === 'RIGHT';
  const leaving = shown?.leaving === true;
  if (rounded) {
    return (
      <div
        className={cx('FlagFrameRoundedV2', {
          topPosition: top,
          bottomPosition: bottom,
          leftPosition: left,
          rightPosition: right,
          flagHideAnimation: leaving,
          showFlag: shown !== null,
        })}
        style={style}
      >
        {(top || left) && (
          <div className="flagFrameHeaderCont">
            {shown !== null && (
              <div
                className={cx('flagFrameHeader', {
                  topPosition: top,
                  bottomPosition: bottom,
                  leftPosition: left,
                  rightPosition: right,
                  dissapearing: leaving,
                })}
              >
                <FrameHeader flag={shown.flag} />
              </div>
            )}
          </div>
        )}
        <div className="flagborders">
          <div className="flagborder num1" />
          <div className="flagborder num2" />
          <div className="flagborder num3" />
          <div className="flagborder num5" />
          {children}
        </div>
        {(bottom || right) && (
          <div className="flagFrameHeaderCont">
            {shown !== null && (
              <div
                className={cx('flagFrameHeader', {
                  topPosition: top,
                  bottomPosition: bottom,
                  leftPosition: left,
                  rightPosition: right,
                  dissapearing: leaving,
                })}
              >
                <FrameHeader flag={shown.flag} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className={cx('flagFeatureContainer', {
        topPosition: top,
        bottomPosition: bottom,
        leftPosition: left,
        rightPosition: right,
        flagHideAnimation: leaving,
      })}
      style={style}
    >
      {shown !== null && (
        <div className="flagFeatureContainerCont">
          <FrameHeader flag={shown.flag} />
        </div>
      )}
      {children}
    </div>
  );
});
