// Anastasia Fuel Calculator: the fuel board of her stream.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './fuel.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['fuel', 'session', 'car'],
  App,
});
