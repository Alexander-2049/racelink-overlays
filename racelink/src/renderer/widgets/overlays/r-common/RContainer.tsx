import type { CSSProperties, ReactNode } from 'react';
import { cx } from './driver/cx';
import { rFontFace, type RGeneral } from './rSettings';

type Props = Readonly<{
  general: RGeneral;
  title: string;
  titlePlacement?: 'left' | 'top' | 'topNoText';
  /** The overlay paints its own background instead of the translucent one. */
  disableBackgroundColor?: boolean;
  /** Never draw the title bar, whatever the setting says. */
  disableTitle?: boolean;
  disableAnimation?: boolean;
  darkMode?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}>;

export function RContainer({
  general,
  title,
  titlePlacement = 'left',
  disableBackgroundColor = false,
  disableTitle = false,
  disableAnimation = false,
  darkMode = false,
  className,
  style,
  children,
}: Props) {
  const classes = cx(
    'overlay overlayContainer',
    className,
    general.fontFamily,
    general.opacity > 0 ? 'Opacity_1' : 'Opacity_0',
    'hAlignment_LEFT vAlignment_TOP',
    `titlePlacement_${titlePlacement}`,
    {
      showTitle: general.showTitle && !disableTitle,
      disabledBgColor: disableBackgroundColor,
      disableAnim: disableAnimation,
      darkMode,
      disableDrag: true,
    },
  );
  const containerStyle: CSSProperties = {
    backgroundColor: disableBackgroundColor ? '' : `rgba(0, 0, 0, ${String(general.opacity)})`,
    fontFamily: rFontFace(general.fontFamily, general.fontWeight),
    fontSize: `${String(general.fontSize)}px`,
    borderColor: general.titleColor,
    overflow: 'hidden',
    ...style,
  };
  return (
    <div
      className={classes}
      style={containerStyle}
      data-theme={darkMode ? 'theme-dark' : 'theme-light'}
    >
      {general.showTitle && !disableTitle && (
        <div
          className="overlay_title"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${String(disableBackgroundColor ? general.opacity : 0)})`,
          }}
        >
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}
