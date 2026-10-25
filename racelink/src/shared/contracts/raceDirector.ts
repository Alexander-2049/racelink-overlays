export type RaceDirectorDriver = Readonly<{
  carIdx: number;
  /** One-based iRacing running position used by CamSwitchPos. */
  cameraPosition: number;
  position: number;
  classPosition: number;
  name: string;
  carNumber: string;
  className: string;
  classColor: string;
  lap: number;
  lapDistance: number;
}>;

export type RaceDirectorCamera = Readonly<{
  groupNumber: number;
  cameraNumber: number;
  name: string;
}>;

export type RaceDirectorReplay = Readonly<{
  frame: number;
  frameEnd: number;
  playing: boolean;
  /** iRacing's authoritative replay-mode flag, including paused playback. */
  isActive: boolean;
  speed: number;
  sessionNumber: number;
  sessionTimeSeconds: number;
  currentLap: number | null;
  laps: readonly number[];
}>;

export type RaceDirectorCommand =
  | Readonly<{ type: 'select-driver'; carIdx: number }>
  | Readonly<{ type: 'select-camera'; carIdx: number; groupNumber: number; cameraNumber: number }>
  | Readonly<{ type: 'select-relative-driver'; direction: 'ahead' | 'behind' }>
  | Readonly<{ type: 'play-replay' }>
  | Readonly<{ type: 'pause-replay' }>
  | Readonly<{
      type: 'search-replay';
      target: 'previous-session' | 'next-session' | 'previous-lap' | 'next-lap';
    }>
  | Readonly<{ type: 'set-sim-ui-visible'; visible: boolean }>;

export type RaceDirectorState = Readonly<{
  available: boolean;
  reason: string | null;
  drivers: readonly RaceDirectorDriver[];
  cameras: readonly RaceDirectorCamera[];
  selectedCarIdx: number | null;
  selectedCamera: Readonly<{ groupNumber: number; cameraNumber: number }> | null;
  replay: RaceDirectorReplay | null;
  cameraControlAvailable: boolean;
  simUiVisible: boolean | null;
  /** iRacing camera-state bit field. Kept here so main can preserve unrelated flags. */
  cameraState: number | null;
}>;

export type RaceDirectorCommandResult =
  Readonly<{ ok: true }> | Readonly<{ ok: false; reason: string }>;

export type RaceDirectorApi = Readonly<{
  execute: (command: RaceDirectorCommand) => Promise<RaceDirectorCommandResult>;
}>;

export const raceDirectorChannels = {
  execute: 'race-director:execute',
} as const;

const isFiniteInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value);

/** Validates the small command vocabulary exposed to the renderer. */
export const isRaceDirectorCommand = (value: unknown): value is RaceDirectorCommand => {
  if (typeof value !== 'object' || value === null || !('type' in value)) return false;
  switch (value.type) {
    case 'select-driver':
      return 'carIdx' in value && isFiniteInteger(value.carIdx);
    case 'select-camera':
      return (
        'carIdx' in value &&
        'groupNumber' in value &&
        'cameraNumber' in value &&
        isFiniteInteger(value.carIdx) &&
        isFiniteInteger(value.groupNumber) &&
        isFiniteInteger(value.cameraNumber)
      );
    case 'select-relative-driver':
      return 'direction' in value && (value.direction === 'ahead' || value.direction === 'behind');
    case 'play-replay':
    case 'pause-replay':
      return true;
    case 'search-replay':
      return (
        'target' in value &&
        (value.target === 'previous-session' ||
          value.target === 'next-session' ||
          value.target === 'previous-lap' ||
          value.target === 'next-lap')
      );
    case 'set-sim-ui-visible':
      return 'visible' in value && typeof value.visible === 'boolean';
    default:
      return false;
  }
};

export const unavailableRaceDirectorState = (reason: string): RaceDirectorState => ({
  available: false,
  reason,
  drivers: [],
  cameras: [],
  selectedCarIdx: null,
  selectedCamera: null,
  replay: null,
  cameraControlAvailable: false,
  simUiVisible: null,
  cameraState: null,
});
