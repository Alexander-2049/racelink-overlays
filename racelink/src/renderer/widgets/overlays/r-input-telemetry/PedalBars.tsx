import type { CSSProperties } from 'react';
import { cx } from '../r-common/driver/cx';

export type PedalSettings = Readonly<{
  minimal: boolean;
  indicator: 'none' | 'caps';
  showValues: boolean;
  showClutch: boolean;
  showBrake: boolean;
  showThrottle: boolean;
  showAbsInBar: boolean;
  throttleColor: string;
  brakeColor: string;
  absColor: string;
  clutchColor: string;
}>;

type Inputs = Readonly<{ throttle: number; brake: number; clutch: number; abs: boolean }>;

type IndicatorProps = Readonly<{ pct: number; color: string; variant: PedalSettings['indicator'] }>;

/** The caps at the ends of a pedal bar that light up at zero and at full travel. */
function PedalIndicator({ pct, color, variant }: IndicatorProps) {
  if (variant === 'none') return null;
  return (
    <div
      className="pedalInputIndicator styleCaps"
      style={{ ['--pedalIndicatorColor' as string]: color }}
    >
      <div className={cx('pedalIndicatorSlot', 'slotTop', { on: pct >= 100 })} />
      <div className={cx('pedalIndicatorSlot', 'slotBottom', { on: pct > 0 })} />
    </div>
  );
}

type BarProps = Readonly<{
  pct: number;
  type: 'clutch' | 'brake' | 'throttle';
  color: string;
  showValue: boolean;
  absOn?: boolean;
  absColor?: string;
  indicator: PedalSettings['indicator'];
}>;

function ClassicBar({ pct, type, color, showValue, absOn, absColor, indicator }: BarProps) {
  const zero = pct === 0;
  const full = pct === 100;
  const fill = absOn === true && absColor !== undefined ? absColor : color;
  return (
    <div className="rectangleInputMainContainer">
      {showValue && (
        <div
          className={cx('rectangleInputValue', {
            zeroInputValue: zero,
            hundredInputValue: full,
            absOn,
          })}
        >
          <span style={absOn === true && absColor !== undefined ? { color: absColor } : undefined}>
            {pct.toFixed(0)}
          </span>
        </div>
      )}
      <div className="rectangleInputContainer">
        <div
          className={cx(`rectangleInput ${type}`, { absOn })}
          style={{ clipPath: `inset(${String(100 - pct)}% 0 0 0)`, backgroundColor: fill }}
        />
        <PedalIndicator pct={pct} color={fill} variant={indicator} />
      </div>
    </div>
  );
}

function MinimalBar({ pct, color, absOn, absColor, indicator }: BarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  const fill = absOn === true && absColor !== undefined ? absColor : color;
  return (
    <div className="minimalPedalBar">
      <div
        className="minimalPedalBarFill"
        style={{ height: `${String(clamped)}%`, background: fill }}
      />
      <div className="pedalInputIndicatorCont">
        <PedalIndicator pct={pct} color={fill} variant={indicator} />
      </div>
    </div>
  );
}

type Props = Readonly<{ inputs: Inputs; settings: PedalSettings; lumina: boolean }>;

/** The clutch, brake and throttle bars. */
export function PedalBars({ inputs, settings, lumina }: Props) {
  const Bar = settings.minimal ? MinimalBar : ClassicBar;
  const abs = settings.showAbsInBar && inputs.abs;
  return (
    <div
      className={cx('pedalBars', {
        themeLumina: lumina,
        themeClassic: !lumina,
        styleMinimal: settings.minimal,
      })}
    >
      <div className={settings.minimal ? 'minimalPedalBars' : 'TelemetryInputBars'}>
        {settings.showClutch && (
          <Bar
            pct={inputs.clutch * 100}
            type="clutch"
            color={settings.clutchColor}
            showValue={settings.showValues}
            indicator={settings.indicator}
          />
        )}
        {settings.showBrake && (
          <Bar
            pct={inputs.brake * 100}
            type="brake"
            color={settings.brakeColor}
            showValue={settings.showValues}
            absOn={abs}
            absColor={settings.absColor}
            indicator={settings.indicator}
          />
        )}
        {settings.showThrottle && (
          <Bar
            pct={inputs.throttle * 100}
            type="throttle"
            color={settings.throttleColor}
            showValue={settings.showValues}
            indicator={settings.indicator}
          />
        )}
      </div>
    </div>
  );
}
