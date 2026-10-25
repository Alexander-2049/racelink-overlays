import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from './cx';
import { toFixedDown } from './format';
import {
  AnimatedSoundWave,
  JokerLapIcon,
  PushToPassIcon,
  TireIcon,
  VirtualEnergyBattery,
} from './icons';
import type { RNationality, RPushToPass, RTireStint } from './model';
import { brandShadowColor } from './carBrands';

/** `<span class="TabularNumber">`: digits of equal width. */
export function TabularNumber({
  legacy,
  children,
}: Readonly<{ legacy?: boolean; children: ReactNode }>) {
  return <span className={cx('TabularNumber', { legacy })}>{children}</span>;
}

type PositionProps = Readonly<{
  visible: boolean;
  position: number;
  theme?: 'simple' | 'modern';
  variation?: 'largeSize' | 'fullHeight';
  carOnPitRoad?: boolean;
  carIsLapped?: boolean;
  carIsLapping?: boolean;
  carIsReference?: boolean;
  carIsDNF?: boolean;
  inactive?: boolean;
  isRadioOn?: boolean;
}>;

function PositionShape() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="34" viewBox="0 0 46 34" fill="none">
      <path opacity="0.6" d="M 39 34 H 0 V 0 H 46 L 39 34 Z" fill="black" />
      <path className="driverPositionBg" d="M 37 34 H 0 V 0 H 44 L 37 34 Z" fill="#202024" />
      <path
        d="M 37 34 H 0 V 0 H 44 L 37 34 Z"
        fill="url(#paint0_linear_3362_809)"
        opacity="0.6"
        className="svgcarposbgcolor"
      />
      <path
        d="M 37 35 H 35 L 42 1 H 44 L 37 35 Z"
        fill="url(#paint1_linear_3362_809)"
        opacity="0.1"
        className="svgcarposbgcolor"
      />
      <defs>
        <linearGradient
          id="paint0_linear_3362_809"
          x1="28"
          y1="5"
          x2="39"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0" />
          <stop offset="1" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3362_809"
          x1="42"
          y1="1"
          x2="42"
          y2="35"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const DriverPosition = memo(function DriverPosition(props: PositionProps) {
  if (!props.visible) return null;
  const modern = props.theme === 'modern';
  const classic = props.theme === undefined || props.theme === 'simple';
  return (
    <div
      className={cx('overlayBadge positionNumber', {
        largeSize: props.variation === 'largeSize',
        fullHeight: props.variation === 'fullHeight',
        carOnPitRoad: props.carOnPitRoad,
        carIsLapped: props.carIsLapped,
        carIsLapping: props.carIsLapping,
        carIsReference: props.carIsReference,
        carIsDNF: props.carIsDNF,
        inactive: props.inactive,
        themeModern: modern,
        themeClassic: classic,
      })}
    >
      {modern && <PositionShape />}
      {props.isRadioOn !== true && (
        <span className="simpleNumber">{props.position > 0 ? props.position : '-'}</span>
      )}
      {props.isRadioOn === true && (
        <span>
          <AnimatedSoundWave className="soundWaveIcon" />
        </span>
      )}
    </div>
  );
});

type CarClassProps = Readonly<{
  visible: boolean;
  carClassColor: string;
  inactive?: boolean;
  carIsReference?: boolean;
  theme?: 'leaned' | 'simple';
  variation?: 'largeSize' | 'fullHeight';
  children?: ReactNode;
}>;

export const DriverCarClass = memo(function DriverCarClass(props: CarClassProps) {
  if (!props.visible) return null;
  if (props.theme === 'leaned') {
    return (
      <div
        className={cx('overlayBadge driverCarClass themeLeaned', {
          largeSize: props.variation === 'largeSize',
          fullHeight: props.variation === 'fullHeight',
          inactive: props.inactive,
          carIsReference: props.carIsReference === true,
        })}
        style={{ ['--carClassColor' as string]: props.carClassColor }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="6"
          height="13"
          viewBox="0 0 6 13"
          fill="none"
        >
          <path d="M2 0.5H5L3 11.5H0L2 0.5Z" fill="#ffffff" />
        </svg>
        {props.children}
      </div>
    );
  }
  return (
    <div
      className={cx('overlayBadge driverCarClass themeSimple', {
        largeSize: props.variation === 'largeSize',
        fullHeight: props.variation === 'fullHeight',
        inactive: props.inactive,
      })}
      style={{ background: props.carClassColor }}
    />
  );
});

type NumberProps = Readonly<{
  showDriverNumber: boolean;
  driverNumber: string;
  driverNumberMaxLetters?: number;
  carClassColor: string;
  isCarClassEnabled: boolean;
  carOnPitRoad?: boolean;
  carIsLapped?: boolean;
  carIsLapping?: boolean;
  carIsDNF?: boolean;
  inactive?: boolean;
  isRadioOn?: boolean;
  disableHashmark?: boolean;
  theme?: 'simple' | 'modern';
}>;

export const DriverNumber = memo(function DriverNumber(props: NumberProps) {
  if (!props.showDriverNumber) return null;
  const classic = props.theme === undefined || props.theme === 'simple';
  const modern = props.theme === 'modern';
  return (
    <div
      className={cx(
        'overlayBadge driverNumber',
        props.driverNumberMaxLetters !== undefined &&
          `driverNumberLetters_${String(props.driverNumberMaxLetters)}`,
        {
          white: props.carClassColor === '#ffffff',
          carOnPitRoad: props.carOnPitRoad,
          carIsLapped: props.carIsLapped,
          carIsLapping: props.carIsLapping,
          carIsDNF: props.carIsDNF,
          inactive: props.inactive,
          carClassEnabled: props.isCarClassEnabled,
          themeModern: modern,
          themeClassic: classic,
          hashMarkDisabled: props.disableHashmark,
        },
      )}
    >
      {props.isRadioOn !== true && (
        <span className="simpleNumber">
          {props.disableHashmark !== true && '#'}
          {props.driverNumber}
        </span>
      )}
      {props.isRadioOn === true && <AnimatedSoundWave className="soundWaveIcon" />}
      {classic && (
        <div
          className="background"
          style={{
            background: props.isCarClassEnabled ? hexAlpha(props.carClassColor) : undefined,
          }}
        />
      )}
    </div>
  );
});

/** The class color as the classic number tag draws it. */
const hexAlpha = (hex: string): string => {
  const base = hex.toLowerCase() === '#ffffff' ? '#4F4F4F' : hex;
  const digits = base.replace('#', '');
  const full = digits.length === 3 ? digits.replace(/./g, (c) => c + c) : digits;
  const value = Number.parseInt(full, 16);
  if (!Number.isFinite(value)) return 'rgba(0,0,0,0)';
  return `rgba(${String((value >> 16) & 255)},${String((value >> 8) & 255)},${String(value & 255)},1)`;
};

type CarBrandProps = Readonly<{
  carBrand: string | null;
  isColored: boolean;
  highlight: boolean;
  margin?: string;
  size?: number;
  coloredShadowDirection?: 'leftToRight' | 'rightToLeft';
  disableColoredShadow?: boolean;
}>;

export const CarBrand = memo(function CarBrand(props: CarBrandProps) {
  const brand = props.carBrand;
  if (brand === null) return null;
  const { from, to } = brandShadowColor(brand, props.disableColoredShadow === true);
  const style: CSSProperties = props.highlight
    ? ({
        '--shadowColorFrom': from,
        '--shadowColorTo': to,
        '--linearGradientRadius':
          props.coloredShadowDirection === 'leftToRight' ? '120deg' : '300deg',
      } as CSSProperties)
    : {};
  return (
    <div
      className={cx(
        'overlayBadge carBrandDefinitions carBrand',
        `size${String(props.size ?? 20)}`,
        props.margin !== undefined && `margin_${props.margin}`,
        props.coloredShadowDirection,
        brand,
        {
          colored: props.isColored,
          white: !props.isColored,
          highlight: props.highlight,
          notavailable: brand === 'n_a',
        },
      )}
      title={brand.toUpperCase()}
      style={style}
    />
  );
});

type NationalityTextProps = Readonly<{
  visible: boolean;
  driverNationality: RNationality | null;
  size?: string;
  carOnPitRoad?: boolean;
  carIsLapped?: boolean;
  carIsLapping?: boolean;
  carIsReference?: boolean;
  inactive?: boolean;
}>;

export const DriverNationality = memo(function DriverNationality(props: NationalityTextProps) {
  if (!props.visible) return null;
  return (
    <div
      className={cx('overlayBadge driverNationality', {
        carOnPitRoad: props.carOnPitRoad,
        carIsLapped: props.carIsLapped,
        carIsLapping: props.carIsLapping,
        carIsReference: props.carIsReference,
        inactive: props.inactive,
        mode3letter: props.driverNationality?.threeLetters === true,
        variationSmall: props.size === '16',
        variationNormal: props.size === '19',
        variationLegacy: props.size === 'legacy',
      })}
    >
      <span>{props.driverNationality?.name ?? props.driverNationality?.shortName ?? 'N/A'}</span>
    </div>
  );
});

// Vite bundles every flag and maps its source path to the built URL.
const flagUrls = import.meta.glob<string>('../../../../assets/flags/4x3/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const flagUrlFor = (countryCode: string | undefined): string | null =>
  countryCode === undefined
    ? null
    : (flagUrls[`../../../../assets/flags/4x3/${countryCode.toLowerCase()}.svg`] ?? null);

type NationalityFlagProps = Readonly<{
  visible: boolean;
  nationalityCountryCode?: string;
  inactive?: boolean;
  marginLeft?: boolean;
}>;

export const DriverNationalityFlag = memo(function DriverNationalityFlag(
  props: NationalityFlagProps,
) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!props.visible) return null;
  const url = flagUrlFor(props.nationalityCountryCode);
  return (
    <div
      className={cx('overlayBadge driverNationalityFlag', {
        inactive: props.inactive,
        marginLeft: props.marginLeft,
      })}
    >
      {url !== null && url !== failed && (
        <img
          src={url}
          alt=""
          onError={() => {
            setFailed(url);
          }}
        />
      )}
    </div>
  );
});

export const DriverGear = memo(function DriverGear(
  props: Readonly<{ isEnabled: boolean; gear: number | null; legacy?: boolean }>,
) {
  if (!props.isEnabled) return null;
  const gear = props.gear;
  const text = gear === null ? '-' : gear === 0 ? 'N' : gear < 0 ? 'R' : String(gear);
  return (
    <div
      className={cx('overlayBadge driverGear', {
        neutral: gear === 0,
        reverse: gear === -1,
        legacy: props.legacy,
      })}
    >
      <span>{text}</span>
    </div>
  );
});

type OfftracksProps = Readonly<{
  visible: boolean;
  count: number;
  driverIdx: number;
  inactive?: boolean;
  disableAnim?: boolean;
  alignText?: string;
  legacy?: boolean;
}>;

export const DriverOfftracks = memo(function DriverOfftracks(props: OfftracksProps) {
  const [animate, setAnimate] = useState(false);
  const previous = useRef({ count: props.count, driverIdx: props.driverIdx });
  useEffect(() => {
    const before = previous.current;
    previous.current = { count: props.count, driverIdx: props.driverIdx };
    if (props.disableAnim === true) return;
    if (before.count !== props.count && before.driverIdx === props.driverIdx) {
      setAnimate(true);
      const timer = window.setTimeout(() => {
        setAnimate(false);
      }, 2000);
      return () => {
        window.clearTimeout(timer);
      };
    }
    setAnimate(false);
  }, [props.count, props.driverIdx, props.disableAnim]);
  if (!props.visible) return null;
  return (
    <div
      className={cx(`overlayBadge DriverOfftracks align_${props.alignText ?? 'left'}`, {
        inactive: props.inactive,
        allowAnim: animate,
        disableAnim: !animate,
        legacy: props.legacy,
      })}
    >
      <span className="simpleNumber">{props.count > 0 ? props.count : '-'}</span>
    </div>
  );
});

export const LapNumber = memo(function LapNumber(
  props: Readonly<{
    visible: boolean;
    lapNumber: number | null;
    columnDigits?: number;
    legacy?: boolean;
  }>,
) {
  if (!props.visible) return null;
  const digits = Math.min(
    4,
    props.columnDigits ?? Math.max(2, String(props.lapNumber ?? 0).length),
  );
  return (
    <div
      className={cx('overlayBadge LapNumber', `lapDigits${String(digits)}`, {
        legacy: props.legacy,
      })}
    >
      <TabularNumber>L{props.lapNumber ?? '-'}</TabularNumber>
    </div>
  );
});

export const JokerLap = memo(function JokerLap(
  props: Readonly<{ visible: boolean; isCompleted: boolean; isColumn?: boolean }>,
) {
  if (!props.visible) return null;
  return (
    <div
      className={cx('overlayBadge jokerLap', {
        isColumn: props.isColumn,
        empty: !props.isCompleted,
      })}
    >
      <JokerLapIcon />
    </div>
  );
});

type PushToPassProps = Readonly<{
  visible: boolean;
  value: RPushToPass | null;
  size?: string;
  hideIcon?: boolean;
}>;

const cooldownMax = 100;

export const PushToPass = memo(function PushToPass(props: PushToPassProps) {
  if (!props.visible) return null;
  const value = props.value;
  const text = value === null || value.count === null ? '-' : toFixedDown(Math.abs(value.count), 0);
  return (
    <div
      className={cx('overlayBadge pushToPass', {
        stateActive: value?.state === 'active',
        stateAvailable: value?.state === 'available',
        stateCooldown: value?.state === 'cooldown',
        stateEmpty: value?.state === 'empty',
        stateNa: value?.state === 'na',
        typeCooldownSeconds: value?.type === 'countdownSeconds',
        lessThan20: (value?.count ?? 0) < 20,
        variationNormal: props.size === '21',
        variationSmall: props.size === undefined || props.size === '19',
      })}
    >
      {props.hideIcon !== true && value?.state !== 'cooldown' && <PushToPassIcon />}
      {value?.state === 'cooldown' && (
        <svg viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <circle
            r="16"
            cx="50%"
            cy="50%"
            stroke="#ffffff"
            strokeWidth="30"
            strokeLinecap="butt"
            strokeDashoffset={100 - ((value.cooldown ?? 0) / cooldownMax) * 100}
            fill="transparent"
            strokeDasharray="100"
          />
        </svg>
      )}
      {value?.state !== 'empty' && <span className="simpleText">{text}</span>}
      {value?.state === 'empty' && <span className="simpleText">0</span>}
    </div>
  );
});

type StintProps = Readonly<{
  type: 'current' | 'completed';
  lapsCompleted?: number;
  stintNumber?: number;
  color: string;
  size?: string;
}>;

export const PitStint = memo(function PitStint(props: StintProps) {
  return (
    <div
      className={cx('overlayBadge pitStintBadge', {
        variationNormal: props.size === '19',
        variationSmall: props.size === undefined || props.size === '16',
      })}
      style={{ ['--stintColor' as string]: props.color }}
    >
      <div
        className={cx('badgeContainer', {
          pitCurrentStintContainer: props.type === 'current',
          pitCompletedStintContainer: props.type === 'completed',
        })}
      >
        <div className="pitStint">
          {props.type === 'current' && <span className="stintText">CS</span>}
          {props.type === 'completed' && (
            <span className="stintText">S{props.stintNumber ?? 1}</span>
          )}
          <span className="stintLength">
            {props.lapsCompleted !== undefined && props.lapsCompleted >= 0
              ? `${String(props.lapsCompleted)}L`
              : '-'}
          </span>
        </div>
      </div>
    </div>
  );
});

/** Tire compound ring colors by compound id. */
const compoundColors: Readonly<Record<number, string>> = {
  2: '#ffffff',
  1: '#D8AF0F',
  0: '#B70500',
  7: '#ffffff',
  6: '#D8AF0F',
  5: '#B70500',
  4: '#0267ff',
  3: '#03a500',
  13: '#4F4F4F',
  14: '#B70500',
};
const unknownCompound = '#4F4F4F';

type TireCompoundsProps = Readonly<{
  visible: boolean;
  tireCompoundsHistory: readonly RTireStint[];
  tireCount?: number;
  showLaps: boolean;
  size?: string;
  legacy?: boolean;
}>;

export const TireCompounds = memo(function TireCompounds(props: TireCompoundsProps) {
  if (!props.visible) return null;
  const count = props.tireCount ?? 1;
  const shown = props.tireCompoundsHistory.slice(
    Math.max(0, props.tireCompoundsHistory.length - count),
  );
  return (
    <div
      className={cx('overlayBadge TireCompounds', {
        variation21: props.size === undefined || props.size === '21',
        variation24: props.size === '24',
        showLapsCompleted: props.showLaps,
        showMultiple: count > 1,
        legacy: props.legacy,
      })}
      style={count > 1 ? { ['--tireCount' as string]: count } : undefined}
    >
      {shown.map((stint, index) => (
        <div
          key={`${String(index)}-${String(stint.compound)}-${String(stint.laps)}`}
          className="tireCompoundsContainer"
        >
          <div className="simpleNumber">
            <TireIcon
              isEmpty={!props.showLaps}
              color={compoundColors[stint.compound] ?? unknownCompound}
            />
          </div>
          {props.showLaps && (
            <div className="tireCompountLaps">{stint.laps >= 0 ? stint.laps : 0}</div>
          )}
        </div>
      ))}
    </div>
  );
});

type VirtualEnergyProps = Readonly<{
  visible: boolean;
  value: number | null;
  hideBattery?: boolean;
  hidePctNumber?: boolean;
  hidePctSign?: boolean;
  whiteOnly?: boolean;
  batterySize?: string;
  legacy?: boolean;
}>;

const batteryVersion = (value: number): '0' | '25' | '50' | '75' | '100' | null => {
  if (value > 0.75) return '100';
  if (value > 0.5) return '75';
  if (value > 0.25) return '50';
  if (value > 0) return '25';
  if (value === 0) return '0';
  return null;
};

export const VirtualEnergy = memo(function VirtualEnergy(props: VirtualEnergyProps) {
  if (!props.visible) return null;
  const known = props.value !== null && props.value > -1;
  const value = known ? Number(Number(props.value).toFixed(2)) : -1;
  const text = known ? `${(100 * value).toFixed(0)}${props.hidePctSign === true ? '' : '%'}` : '-';
  const size = props.batterySize ?? 'M';
  return (
    <div
      className={cx('overlayBadge virtualEnergy', {
        hidePctSign: props.hidePctSign,
        batterySizeXS: size === 'XS',
        batterySizeS: size === 'S',
        batterySizeM: size === 'M',
        batterySizeL: size === 'L',
        batterySizeXL: size === 'XL',
        legacy: props.legacy,
      })}
    >
      {props.hideBattery !== true && (
        <VirtualEnergyBattery colored={props.whiteOnly !== true} version={batteryVersion(value)} />
      )}
      {props.hidePctNumber !== true && (
        <div className="nrgnumber">
          <span className="simpleNumber">{text}</span>
        </div>
      )}
    </div>
  );
});
