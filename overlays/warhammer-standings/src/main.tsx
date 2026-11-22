// Warhammer Standings: the standings as on the Warhammer Racing stream.
import { createOverlay } from '@racelink/overlay';
import { mountOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './standings.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['session', 'drivers', 'weather'],
  demoGame: 'iracing',
});

mountOverlay(overlay, App);
