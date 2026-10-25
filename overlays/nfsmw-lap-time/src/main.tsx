// NFSMW-Lap Time: the overlay's code lives in racelink/ (shared with the other overlays).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initOverlay } from '../../../racelink/src/renderer/widgets/overlays/model/useRacingOverlay';
import { defaultSettings } from './racelink-settings';
import App from '../../../racelink/src/renderer/widgets/overlays/nfsmw-lap-time/App';
import '../../../racelink/src/renderer/widgets/overlays/nfsmw-lap-time/index.css';
import './frame.css';

// Item visibility the overlay reads under its own names (the app's catalog `orderVisibility`).
// Nothing is drawn before the instance's settings are known.
void initOverlay(defaultSettings, {}).then(() => {
  const root = document.querySelector('#root');
  if (!root) throw new Error('Missing #root element.');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
