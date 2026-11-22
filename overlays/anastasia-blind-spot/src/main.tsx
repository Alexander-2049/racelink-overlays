// Anastasia Blind Spot: a bar on each side that lights up for a car alongside.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './blindspot.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['car', 'session', 'drivers', 'radar'],
  App,
});
