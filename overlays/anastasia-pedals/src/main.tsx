// Anastasia Pedals: gear, speed, slowest and fastest speed, pedal bars and the wheel.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './pedals.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['car', 'session'],
  App,
});
