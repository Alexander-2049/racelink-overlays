// Warhammer Twitch Chat: the chat Racelink reads (topic `stream`), drawn in the Warhammer style.
import { createOverlay } from '@racelink/overlay';
import { mountOverlay } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import './frame.css';
import './chat.css';

const overlay = createOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['stream'],
  demoGame: 'iracing',
});

mountOverlay(overlay, App);
