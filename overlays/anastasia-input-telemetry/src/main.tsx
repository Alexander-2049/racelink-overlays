// Anastasia Input Telemetry: throttle and brake as lines that run across the screen.
import App from './App';
import { defaultSettings, type Settings } from './racelink-settings';
import { startOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/start';
import '../../../racelink/src/renderer/widgets/overlays/anastasia-common/anastasia.css';
import './trace.css';

startOverlay<Settings>({
  defaults: defaultSettings,
  topics: ['car'],
  App,
});
