// Warhammer Blind Spot: bars at the screen edges that light when a car is alongside.
import { createOverlay } from '@racelink/overlay';
import { mountOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './blind.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['car', 'drivers', 'session', 'radar'],
  demoGame: 'iracing',
});

mountOverlay(overlay, App);
