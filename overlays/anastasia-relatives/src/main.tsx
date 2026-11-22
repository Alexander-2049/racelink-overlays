// Anastasia Relatives: the cars round you, as on her stream.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './relatives.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['session', 'drivers', 'weather'],
  App,
});
