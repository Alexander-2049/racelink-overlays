// b16a1 Wind: wind direction and strength.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createOverlay } from '@racelink/overlay';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import '../../../racelink/src/renderer/widgets/overlays/b16a1-common/base.css';
import './frame.css';
import './wind.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['weather', 'car'],
});

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
