import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../r-common/driver/cx';
import { hexToRgba } from '../r-common/driver/format';
import type { RTheme } from '../r-common/driver/model';

type Props = Readonly<{
  theme: RTheme;
  opacity: number;
  direction?: 'row' | 'col';
  cutLeft?: boolean;
  cutRight?: boolean;
  fullHeight?: boolean;
  paddingTop?: '3' | '4';
  style?: CSSProperties;
  children: ReactNode;
}>;

/** The translucent panel the Standings parts sit on, in the Classic or Lumina look. */
export function StandingsContainer({
  theme,
  opacity,
  direction,
  cutLeft,
  cutRight,
  fullHeight,
  paddingTop,
  style,
  children,
}: Props) {
  const lumina = theme === 'LUMINA';
  const base = lumina ? 'LuminaContainer' : 'ClassicContainer';
  const kind = lumina ? 'lumina' : 'classic';
  const background = useMemo(
    () => ({ backgroundColor: hexToRgba(lumina ? '#0A0A0B' : '#000000', opacity), ...style }),
    [lumina, opacity, style],
  );
  return (
    <div
      className={cx(base, {
        [`${kind}Row`]: direction === 'row',
        [`${kind}Col`]: direction === 'col',
        cutLeft,
        cutRight,
        opacity0: opacity === 0,
        fullHeight,
        paddingTop3: paddingTop === '3',
        paddingTop4: paddingTop === '4',
      })}
      style={background}
    >
      {children}
    </div>
  );
}
