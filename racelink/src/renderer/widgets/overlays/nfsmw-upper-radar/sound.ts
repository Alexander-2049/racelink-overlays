// The game's radar beep (FX_Radar), played through Web Audio so beeps can overlap
// and follow the volume at once.
import beepUrl from './sound/radar_beep.wav?url';

let context: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;

const audio = (): AudioContext | null => {
  if (context) return context;
  try {
    context = new AudioContext();
  } catch {
    return null;
  }
  return context;
};

/** Loads the beep once; later calls reuse it. */
export const loadBeep = (): Promise<void> => {
  const current = audio();
  if (!current) return Promise.resolve();
  loading ??= fetch(beepUrl)
    .then((response) => response.arrayBuffer())
    .then((data) => current.decodeAudioData(data))
    .then((decoded) => {
      buffer = decoded;
    })
    .catch(() => {
      // Without the beep the radar still blinks.
      loading = null;
    });
  return loading;
};

/** Plays one beep at `volume` (0 to 1). */
export const playBeep = (volume: number): void => {
  const current = audio();
  if (!current || !buffer || !(volume > 0)) {
    void loadBeep();
    return;
  }
  // An overlay window gets no click: resume the context as soon as it is allowed.
  if (current.state === 'suspended') void current.resume().catch(() => undefined);
  const source = current.createBufferSource();
  source.buffer = buffer;
  const gain = current.createGain();
  gain.gain.value = Math.min(1, Math.max(0, volume));
  source.connect(gain).connect(current.destination);
  source.start();
};

