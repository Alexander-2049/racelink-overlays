// GT4 Gauges: twin speedometer and tachometer.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createOverlay } from '@racelink/overlay';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['car'],
});

/** The dial font, so the first frame already has it (never longer than a second). */
const fontReady = (): Promise<unknown> =>
  Promise.race([
    document.fonts.load('20px Michroma', '0123456789'),
    new Promise((resolve) => window.setTimeout(resolve, 1000)),
  ]).catch(() => undefined);

// Nothing is drawn before the instance's settings are known.
const settingsReady = new Promise<void>((resolve) => {
  if (overlay.ready) resolve();
  else overlay.on('ready', () => resolve());
});

void Promise.all([settingsReady, fontReady()]).then(() => {
  const root = document.querySelector('#root');
  if (!root) throw new Error('Missing #root element.');
  createRoot(root).render(
    <StrictMode>
      <App overlay={overlay} />
    </StrictMode>,
  );
});
