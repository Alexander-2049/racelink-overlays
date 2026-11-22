// Warhammer Weather: track wetness, precipitation and wind in one card.
import { createOverlay } from '@racelink/overlay';
import { mountOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './weather.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['weather', 'session', 'car'],
  demoGame: 'iracing',
});

mountOverlay(overlay, App);
