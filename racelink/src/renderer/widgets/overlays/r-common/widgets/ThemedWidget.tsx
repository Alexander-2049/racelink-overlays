import { memo, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../driver/cx';
import { widgetStyle, type WidgetIconType, type WidgetThemeSettings } from './themes';

type TitleProps = Readonly<{
  show: WidgetIconType | false;
  icon: ReactNode;
  text: ReactNode;
}>;

type Props = Readonly<{
  themeSettings: WidgetThemeSettings;
  title: TitleProps;
  widgetSizeCategory?: 'small' | 'large';
  classNames?: string;
  customStyles?: CSSProperties;
  children: ReactNode;
}>;

/** One widget cell of the top and bottom bars: a title (icon or text) and a value. */
export const ThemedWidget = memo(function ThemedWidget({
  themeSettings,
  title,
  widgetSizeCategory,
  classNames,
  customStyles,
  children,
}: Props) {
  const style = { ...widgetStyle(themeSettings), ...customStyles };
  const showTitle = title.show !== false && title.show !== 'NONE';
  const titleContent =
    title.show === 'ICON' ? title.icon : title.show === 'TEXT' ? title.text : null;
  return (
    <div
      className={cx('themedWidget', classNames, {
        scrollingTextEnabled: themeSettings.scrollTextEnabled,
        transparentMode: themeSettings.theme === 'transparent',
        [`${themeSettings.theme}Theme`]: true,
        smallWidget: widgetSizeCategory === 'small',
        largeWidget: widgetSizeCategory === 'large',
        fixedWidth: themeSettings.fixedWidth,
      })}
      style={style}
    >
      {showTitle && <div className="title">{titleContent}</div>}
      <div className="value">
        {themeSettings.scrollTextEnabled ? (
          <span className="OuterScrollingText">
            <span className="innerValue">{children}</span>
          </span>
        ) : (
          <span className="innerValue">{children}</span>
        )}
      </div>
    </div>
  );
});
