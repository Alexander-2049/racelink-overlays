// Starts an overlay of the set: waits for the settings, then draws the app.
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { createOverlay, type RacelinkOverlay, type TelemetryTopic } from '@racelink/overlay';

export const startOverlay = <S extends object>(
  options: Readonly<{
    defaults: S;
    topics: readonly TelemetryTopic[];
    App: ComponentType<{ overlay: RacelinkOverlay<S> }>;
  }>,
): void => {
  const overlay = createOverlay<S>({ defaults: options.defaults, topics: [...options.topics] });
  const { App } = options;
  // Nothing is drawn before the instance's settings are known.
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
