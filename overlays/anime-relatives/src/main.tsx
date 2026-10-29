// Anime Relatives: the relative board with overtake explosions and a mascot.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createOverlay } from '@racelink/overlay';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './anime.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['session', 'drivers', 'weather'],
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
