// Anastasia Chat: the Twitch chat as a stream panel.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './chat.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['stream'],
  App,
});
