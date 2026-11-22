// Warhammer Relatives: the cars round you as on the Warhammer Racing stream.
import { createOverlay } from '@racelink/overlay';
import { mountOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './relatives.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['session', 'drivers', 'weather', 'car', 'vehicle'],
  demoGame: 'iracing',
});

mountOverlay(overlay, App);
