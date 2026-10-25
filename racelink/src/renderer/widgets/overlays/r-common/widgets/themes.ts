import { hexToRgba } from '../driver/format';

/** Look of a widget slot. */
export type WidgetTheme =
  'default' | 'hex' | 'glass' | 'carbon' | 'slider' | 'lcd' | 'transparent' | 'stripe';
export type WidgetIconType = 'ICON' | 'TEXT' | 'NONE';

type ThemeColors = Readonly<{
  icon: string;
  value: string;
  valueDarkMode: string;
  background: string;
  stripeColor?: string;
}>;

type ThemeDefaults = Readonly<{ opacity: number; colors: ThemeColors }>;

const valueDark = '#fffffff0';

/** Per-theme defaults for icon, value and background colors. */
export const widgetThemeDefaults: Readonly<Record<WidgetTheme, ThemeDefaults>> = {
  default: {
    opacity: 0.8,
    colors: { icon: '#777777', value: '#ffffff', valueDarkMode: valueDark, background: '#000000' },
  },
  carbon: {
    opacity: 0.8,
    colors: { icon: '#ffffff', value: '#ffffff', valueDarkMode: valueDark, background: '#000000' },
  },
  glass: {
    opacity: 0.25,
    colors: { icon: '#ffffff', value: '#ffffff', valueDarkMode: valueDark, background: '#000000' },
  },
  hex: {
    opacity: 0.8,
    colors: { icon: '#000000', value: '#ffffff', valueDarkMode: valueDark, background: '#000000' },
  },
  slider: {
    opacity: 1,
    colors: { icon: '#000000', value: '#ffffff', valueDarkMode: valueDark, background: '#202024' },
  },
  lcd: {
    opacity: 1,
    colors: {
      icon: '#ffffff',
      value: '#ffffff',
      valueDarkMode: valueDark,
      background: '#000000',
      stripeColor: '#333333',
    },
  },
  transparent: {
    opacity: 0.8,
    colors: {
      icon: '#777777',
      value: '#ffffff',
      valueDarkMode: valueDark,
      background: 'transparent',
    },
  },
  stripe: {
    opacity: 0.8,
    colors: { icon: '#777777', value: '#ffffff', valueDarkMode: valueDark, background: '#000000' },
  },
};

export type SliderThemeSettings = Readonly<{
  FrameColorEnabled: boolean;
  FrameColor: string;
  IconBgColor: string;
  IconBgColorEnabled: boolean;
}>;
export type StripeThemeSettings = Readonly<{
  SideStripeColor: string;
  IconBgColor: string;
  StripeWidth: 'small' | 'medium' | 'large';
  IconBgColorEnabled: boolean;
}>;
export type HexThemeSettings = Readonly<{ IconBgColor: string; IconBgColorEnabled: boolean }>;

export const sliderThemeDefaults: SliderThemeSettings = {
  FrameColorEnabled: false,
  FrameColor: '#475569',
  IconBgColor: '#ffffff',
  IconBgColorEnabled: false,
};
export const stripeThemeDefaults: StripeThemeSettings = {
  SideStripeColor: '#06B6D4',
  IconBgColor: '#ffffff',
  StripeWidth: 'medium',
  IconBgColorEnabled: false,
};
export const hexThemeDefaults: HexThemeSettings = {
  IconBgColor: '#84cc16',
  IconBgColorEnabled: false,
};

/** What a widget slot's settings resolve to. */
export type WidgetThemeSettings = Readonly<{
  theme: WidgetTheme;
  opacity?: number;
  colors: Readonly<{ background?: string; icon?: string; value?: string; stripeColor?: string }>;
  scrollTextEnabled: boolean;
  scrollTextSpeed: number;
  fixedWidth: boolean;
  width: number;
  fontSize?: number;
  slider?: Partial<SliderThemeSettings>;
  stripe?: Partial<StripeThemeSettings>;
  hex?: Partial<HexThemeSettings>;
}>;

/** CSS variables of a themed widget. */
export const widgetStyle = (settings: WidgetThemeSettings): Record<string, string | number> => {
  const defaults = widgetThemeDefaults[settings.theme];
  const opacity = settings.opacity ?? defaults.opacity;
  const background = settings.colors.background ?? defaults.colors.background;
  const valueColor = settings.colors.value ?? defaults.colors.value;
  const valueDark = settings.colors.value ?? defaults.colors.valueDarkMode;
  const iconColor = settings.colors.icon ?? defaults.colors.icon;
  const stripe = settings.colors.stripeColor ?? defaults.colors.stripeColor ?? '#181818';
  const stripeAlpha =
    settings.theme === 'glass'
      ? +(0.2 * opacity).toFixed(1)
      : settings.theme === 'carbon'
        ? +(0.3 * opacity).toFixed(1)
        : +(0.8 * opacity).toFixed(1);
  const style: Record<string, string | number> = {
    '--bgOpacityValue': opacity,
    '--themedWidgetBg': hexToRgba(background, opacity),
    '--stripeColor': hexToRgba(stripe, stripeAlpha),
    '--titleBgColor': iconColor,
    '--valueColor': valueColor,
    '--valueDarkModeColor': valueDark,
  };
  if (settings.scrollTextEnabled)
    style['--scrollTextSpeed'] = `${String(settings.scrollTextSpeed)}s`;
  if (settings.fixedWidth) style['--fixedWidthSize'] = `${String(settings.width)}px`;
  if (settings.fontSize !== undefined && settings.fontSize !== 14)
    style['--fixedFontSize'] = `${String(settings.fontSize)}px`;
  switch (settings.theme) {
    case 'slider': {
      const slider = { ...sliderThemeDefaults, ...settings.slider };
      style['--sliderIconBgColor'] = slider.IconBgColorEnabled
        ? slider.IconBgColor
        : sliderThemeDefaults.IconBgColor;
      style['--sliderFrameColor'] = slider.FrameColorEnabled
        ? slider.FrameColor
        : sliderThemeDefaults.FrameColor;
      break;
    }
    case 'hex': {
      const hex = { ...hexThemeDefaults, ...settings.hex };
      style['--sliderIconBgColor'] = hex.IconBgColorEnabled
        ? hex.IconBgColor
        : hexThemeDefaults.IconBgColor;
      style['--reflectionColor'] = hexToRgba('#ffffff', 0.3 * opacity);
      break;
    }
    case 'lcd': {
      const isDefaultBackground = background === widgetThemeDefaults.lcd.colors.background;
      style['--bottomShadowColor'] = isDefaultBackground
        ? hexToRgba('#ffffff', 0.15 * opacity)
        : hexToRgba(background, 0.15 * opacity);
      style['--themedWidgetBg2'] = hexToRgba('#000000', opacity);
      style['--themedWidgetBg3'] = hexToRgba(background, 0.2 * opacity);
      break;
    }
    case 'glass':
      style['--glassBorderOpacity'] = 0.6 * opacity;
      break;
    case 'carbon':
      style['--carbonBorderOpacity'] = 0.18 * opacity;
      style['--carbonOutlineColor'] = hexToRgba('#000000', opacity);
      break;
    case 'stripe': {
      const stripeSettings = { ...stripeThemeDefaults, ...settings.stripe };
      style['--stripeBorder'] = hexToRgba('#ffffff', Math.min(0.18, opacity));
      style['--stripeColor'] = stripeSettings.SideStripeColor;
      style['--stripeSize'] =
        stripeSettings.StripeWidth === 'medium'
          ? `${String(5 / 14)}em`
          : stripeSettings.StripeWidth === 'large'
            ? '0.5em'
            : `${String(3 / 14)}em`;
      break;
    }
    default:
      break;
  }
  return style;
};
