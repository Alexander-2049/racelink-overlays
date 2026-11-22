import { StrictMode, type CSSProperties, type ComponentType, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { RacelinkOverlay } from '@racelink/overlay';
import './fonts.css';
import './theme.css';

export type ThemeId = 'ember' | 'graphite' | 'tide' | 'clear';

/** The themed box every Warhammer overlay draws in. */
export function Root({
  theme,
  opacity,
  fontSize,
  className,
  children,
}: Readonly<{
  theme: ThemeId;
  opacity: number;
  fontSize: number;
  className?: string;
  children: ReactNode;
}>) {
  const style = {
    '--wh-opacity': String(opacity),
    '--wh-font': `${String(fontSize)}px`,
  } as CSSProperties;
  return (
    <div className={className === undefined ? 'wh-root' : `wh-root ${className}`} data-theme={theme} style={style}>
      {children}
    </div>
  );
}

/** Draws the overlay once Racelink has sent its settings: nothing before, so it never flashes its defaults. */
export const mountOverlay = <S extends object>(
  overlay: RacelinkOverlay<S>,
  App: ComponentType<Readonly<{ overlay: RacelinkOverlay<S> }>>,
): void => {
  const start = (): void => {
    const root = document.querySelector('#root');
    if (!root) throw new Error('Missing #root element.');
    createRoot(root).render(
      <StrictMode>
        <App overlay={overlay} />
      </StrictMode>,
    );
  };
  if (overlay.ready) start();
  else overlay.on('ready', start);
};
