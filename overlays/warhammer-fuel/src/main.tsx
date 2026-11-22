// Warhammer Fuel Calculator: fuel and the laps it lasts, as on the Warhammer Racing stream.
import { createOverlay } from '@racelink/overlay';
import { mountOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './fuel.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['fuel', 'session', 'car'],
  demoGame: 'iracing',
});

mountOverlay(overlay, App);
