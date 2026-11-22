// Anastasia Standings: the standings board of her stream.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './standings.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['session', 'drivers', 'weather'],
  App,
});
