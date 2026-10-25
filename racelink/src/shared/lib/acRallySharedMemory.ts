/**
 * Assetto Corsa Rally shared memory: `Local\acpmf_physics`, `Local\acpmf_graphics`
 * and `Local\acpmf_static`. AC Rally has no published spec; it writes Kunos's
 * ACC page layout. Field order, types and comments follow Race Element's
 * `AcRallySharedMemory.cs` (RiddleTime/Race-Element, dev @ 55121bb), which is a
 * copy of the ACC shared memory document. The native reader only copies the
 * pages; this table is the one definition of the struct, for the telemetry
 * worker and for the `session.ext.acRally.raw` contract.
 *
 * C layout with `#pragma pack(4)`: 4-byte fields align to 4, wchar_t strings to 2.
 */

export type Vec3 = Readonly<{ x: number; y: number; z: number }>;

export type FieldSpec =
  | Readonly<{ kind: 'i32' | 'f32' | 'bool32'; doc: string }>
  | Readonly<{ kind: 'i32' | 'f32'; count: number; doc: string }>
  | Readonly<{ kind: 'vec3'; count: number; doc: string }>
  | Readonly<{ kind: 'wstr'; length: number; doc: string }>;

const i32 = (doc: string) => ({ kind: 'i32', doc }) as const;
const f32 = (doc: string) => ({ kind: 'f32', doc }) as const;
const bool32 = (doc: string) => ({ kind: 'bool32', doc }) as const;
const i32s = (count: number, doc: string) => ({ kind: 'i32', count, doc }) as const;
const f32s = (count: number, doc: string) => ({ kind: 'f32', count, doc }) as const;
const vec3s = (count: number, doc: string) => ({ kind: 'vec3', count, doc }) as const;
const wstr = (length: number, doc: string) => ({ kind: 'wstr', length, doc }) as const;

type FieldValue<S> = S extends { kind: 'wstr' }
  ? string
  : S extends { kind: 'vec3' }
    ? readonly Vec3[]
    : S extends { count: number }
      ? readonly number[]
      : S extends { kind: 'bool32' }
        ? boolean
        : number;
export type PageLayout = Readonly<Record<string, FieldSpec>>;
export type PageValues<L extends PageLayout> = { readonly [K in keyof L]: FieldValue<L[K]> };

/** Updated every physics step; all about the player's car. */
export const physicsLayout = {
  packetId: i32('Current step index.'),
  gas: f32('Gas pedal input (0 to 1).'),
  brake: f32('Brake pedal input (0 to 1).'),
  fuel: f32('Fuel remaining (ACC documents kg; liters in practice).'),
  gear: i32('Current gear: 0 reverse, 1 neutral, 2 first.'),
  rpms: i32('Engine revolutions per minute.'),
  steerAngle: f32('Steering input (-1 to 1).'),
  speedKmh: f32('Car speed in km/h.'),
  velocity: f32s(3, 'Velocity vector in global coordinates.'),
  accG: f32s(
    3,
    'Acceleration vector in local coordinates, g: x lateral, y vertical, z longitudinal.',
  ),
  wheelSlip: f32s(4, 'Tyre slip [FL, FR, RL, RR].'),
  wheelLoad: f32s(4, 'Wheel load [FL, FR, RL, RR]; not used in ACC.'),
  wheelPressure: f32s(4, 'Tyre pressure in psi [FL, FR, RL, RR].'),
  wheelAngularSpeed: f32s(4, 'Wheel angular speed in rad/s [FL, FR, RL, RR].'),
  tyreWear: f32s(4, 'Tyre wear [FL, FR, RL, RR]; not used in ACC.'),
  tyreDirtyLevel: f32s(4, 'Dirt on the tyre surface [FL, FR, RL, RR]; not used in ACC.'),
  tyreCoreTemperature: f32s(4, 'Tyre rubber core temperature in °C [FL, FR, RL, RR].'),
  camberRad: f32s(4, 'Wheel camber in radians [FL, FR, RL, RR]; not used in ACC.'),
  suspensionTravel: f32s(4, 'Suspension travel in meters [FL, FR, RL, RR].'),
  drs: f32('DRS on; not used in ACC.'),
  tc: f32('Traction control in action.'),
  heading: f32('Car yaw orientation in radians.'),
  pitch: f32('Car pitch orientation in radians.'),
  roll: f32('Car roll orientation in radians.'),
  cgHeight: f32('Centre of gravity height; not used in ACC.'),
  carDamage: f32s(5, 'Car damage: front, rear, left, right, centre.'),
  numberOfTyresOut: i32('Tyres out of track; not used in ACC.'),
  pitLimiterOn: bool32('Pit limiter is on.'),
  abs: f32('ABS in action.'),
  kersCharge: f32('Not used in ACC.'),
  kersInput: f32('Not used in ACC.'),
  autoShifterOn: bool32('Automatic transmission on.'),
  rideHeight: f32s(2, 'Ride height: front, rear; not used in ACC.'),
  turboBoost: f32('Turbo boost.'),
  ballast: f32('Ballast in kg; not used in ACC.'),
  airDensity: f32('Air density.'),
  airTemp: f32('Air temperature in °C.'),
  roadTemp: f32('Road temperature in °C.'),
  localAngularVelocity: f32s(3, 'Angular velocity vector in local coordinates.'),
  finalFF: f32('Force feedback signal.'),
  performanceMeter: f32('Not used in ACC.'),
  engineBrake: i32('Not used in ACC.'),
  ersRecoveryLevel: i32('Not used in ACC.'),
  ersPowerLevel: i32('Not used in ACC.'),
  ersHeatCharging: i32('Not used in ACC.'),
  ersIsCharging: i32('Not used in ACC.'),
  kersCurrentKJ: f32('Not used in ACC.'),
  drsAvailable: bool32('Not used in ACC.'),
  drsEnabled: bool32('Not used in ACC.'),
  brakeTemperature: f32s(4, 'Brake disc temperature in °C [FL, FR, RL, RR].'),
  clutch: f32('Clutch engagement (1 released pedal, 0 pressed).'),
  tyreTempI: f32s(4, 'Inner tyre temperature [FL, FR, RL, RR]; not shown in ACC.'),
  tyreTempM: f32s(4, 'Middle tyre temperature [FL, FR, RL, RR]; not shown in ACC.'),
  tyreTempO: f32s(4, 'Outer tyre temperature [FL, FR, RL, RR]; not shown in ACC.'),
  isAiControlled: bool32('Car is controlled by the AI.'),
  tyreContactPoint: vec3s(4, 'Tyre contact point in global coordinates [FL, FR, RL, RR].'),
  tyreContactNormal: vec3s(4, 'Tyre contact normal [FL, FR, RL, RR].'),
  tyreContactHeading: vec3s(4, 'Tyre contact heading [FL, FR, RL, RR].'),
  brakeBias: f32('Front brake bias (0 to 1).'),
  localVelocity: f32s(3, 'Velocity vector in local coordinates.'),
  p2pActivations: i32('Not used in ACC.'),
  p2pStatus: i32('Not used in ACC.'),
  currentMaxRpm: i32('Maximum engine rpm.'),
  mz: f32s(4, 'Self-aligning torque [FL, FR, RL, RR]; not shown in ACC.'),
  fx: f32s(4, 'Longitudinal tyre force [FL, FR, RL, RR]; not shown in ACC.'),
  fy: f32s(4, 'Lateral tyre force [FL, FR, RL, RR]; not shown in ACC.'),
  slipRatio: f32s(4, 'Tyre slip ratio [FL, FR, RL, RR].'),
  slipAngle: f32s(4, 'Tyre slip angle in radians [FL, FR, RL, RR].'),
  tcinAction: i32('TC in action.'),
  absInAction: i32('ABS in action.'),
  suspensionDamage: f32s(4, 'Suspension damage [FL, FR, RL, RR].'),
  tyreTemp: f32s(4, 'Tyre core temperature [FL, FR, RL, RR].'),
  waterTemp: f32('Water temperature in °C.'),
  brakePressure: f32s(4, 'Brake pressure [FL, FR, RL, RR].'),
  frontBrakeCompound: i32('Front brake pad compound.'),
  rearBrakeCompound: i32('Rear brake pad compound.'),
  padLife: f32s(4, 'Brake pad life [FL, FR, RL, RR].'),
  discLife: f32s(4, 'Brake disc life [FL, FR, RL, RR].'),
  ignitionOn: bool32('Ignition switch is on.'),
  starterEngineOn: bool32('Starter switch is on.'),
  isEngineRunning: bool32('Engine is running.'),
  kerbVibration: f32('Kerb vibration sent to FFB.'),
  slipVibrations: f32('Slip vibration sent to FFB.'),
  gVibrations: f32('G vibration sent to FFB.'),
  absVibrations: f32('ABS vibration sent to FFB.'),
} as const satisfies PageLayout;

/** Updated every graphics step; the player's car except for car coordinates and ids. */
export const graphicsLayout = {
  packetId: i32('Current step index.'),
  status: i32('AcStatus: 0 off, 1 replay, 2 live, 3 pause.'),
  sessionType: i32('AcSessionType.'),
  currentTime: wstr(15, 'Current lap time text.'),
  lastTime: wstr(15, 'Last lap time text.'),
  bestTime: wstr(15, 'Best lap time text.'),
  split: wstr(15, 'Last split time text.'),
  completedLaps: i32('Completed laps.'),
  position: i32('Current player position.'),
  iCurrentTime: i32('Current lap time in ms.'),
  iLastTime: i32('Last lap time in ms.'),
  iBestTime: i32('Best lap time in ms.'),
  sessionTimeLeft: f32('Session time left in ms.'),
  distanceTraveled: f32('Distance travelled in the current stint, meters.'),
  isInPit: bool32('Car is in the pit box.'),
  currentSectorIndex: i32('Current track sector.'),
  lastSectorTime: i32('Last sector time in ms.'),
  numberOfLaps: i32('Number of laps in the session.'),
  tyreCompound: wstr(33, 'Tyre compound.'),
  replayTimeMultiplier: f32('Not used in ACC.'),
  normalizedCarPosition: f32('Car position on the track spline (0 to 1).'),
  activeCars: i32('Number of cars on track.'),
  carCoordinates: vec3s(60, 'Coordinates of cars on track.'),
  carId: i32s(60, 'Car ids of cars on track.'),
  playerCarId: i32('Player car id.'),
  penaltyTime: f32('Penalty time to wait.'),
  flag: i32('AcFlagType.'),
  penalty: i32('PenaltyShortcut.'),
  idealLineOn: bool32('Ideal line on.'),
  isInPitLane: bool32('Car is in the pit lane.'),
  surfaceGrip: f32('Ideal line friction coefficient.'),
  mandatoryPitDone: bool32('Mandatory pit is completed.'),
  windSpeed: f32('Wind speed in m/s.'),
  windDirection: f32('Wind direction in radians.'),
  isSetupMenuVisible: bool32('The setup menu is open.'),
  mainDisplayIndex: i32('Current car main display index.'),
  secondaryDisplayIndex: i32('Current car secondary display index.'),
  tc: i32('Traction control level.'),
  tcCut: i32('Traction control cut level.'),
  engineMap: i32('Current engine map.'),
  abs: i32('ABS level.'),
  fuelXLap: f32('Average fuel used per lap in liters.'),
  rainLights: bool32('Rain lights on.'),
  flashingLights: bool32('Flashing lights on.'),
  lightsStage: i32('Current lights stage.'),
  exhaustTemperature: f32('Exhaust temperature.'),
  wiperLv: i32('Current wiper stage.'),
  driverStintTotalTimeLeft: i32('Time the driver may still drive in the race, ms.'),
  driverStintTimeLeft: i32('Time the driver may still drive in this stint, ms.'),
  rainTyres: bool32('Rain tyres are fitted.'),
  sessionIndex: i32('Session index.'),
  usedFuel: f32('Fuel used since the last refuel.'),
  deltaLapTime: wstr(15, 'Delta time text.'),
  iDeltaLapTime: i32('Delta time in ms.'),
  estimatedLapTime: wstr(15, 'Estimated lap time text.'),
  iEstimatedLapTime: i32('Estimated lap time in ms.'),
  isDeltaPositive: bool32('Delta is positive.'),
  iSplit: i32('Last split time in ms.'),
  isValidLap: bool32('Lap is valid for timing.'),
  fuelEstimatedLaps: f32('Laps possible with the current fuel.'),
  trackStatus: wstr(33, 'Track status text.'),
  missingMandatoryPits: i32('Mandatory pit stops still to do.'),
  clock: f32('Time of day in seconds.'),
  directionLightsLeft: bool32('Left blinker on.'),
  directionLightsRight: bool32('Right blinker on.'),
  globalYellow: bool32('Yellow flag is out.'),
  globalYellow1: bool32('Yellow flag in sector 1.'),
  globalYellow2: bool32('Yellow flag in sector 2.'),
  globalYellow3: bool32('Yellow flag in sector 3.'),
  globalWhite: bool32('White flag is out.'),
  globalGreen: bool32('Green flag is out.'),
  globalChequered: bool32('Chequered flag is out.'),
  globalRed: bool32('Red flag is out.'),
  mfdTyreSet: i32('Tyre set on the MFD.'),
  mfdFuelToAdd: f32('Fuel to add on the MFD.'),
  mfdTyrePressureLF: f32('Left front tyre pressure on the MFD.'),
  mfdTyrePressureRF: f32('Right front tyre pressure on the MFD.'),
  mfdTyrePressureLR: f32('Left rear tyre pressure on the MFD.'),
  mfdTyrePressureRR: f32('Right rear tyre pressure on the MFD.'),
  trackGripStatus: i32('AcTrackGripStatus.'),
  rainIntensity: i32('AcRainIntensity now.'),
  rainIntensityIn10min: i32('AcRainIntensity in 10 minutes.'),
  rainIntensityIn30min: i32('AcRainIntensity in 30 minutes.'),
  currentTyreSet: i32('Tyre set in use.'),
  strategyTyreSet: i32('Next tyre set per strategy.'),
  gapAhead: i32('Gap to the car ahead in ms.'),
  gapBehind: i32('Gap to the car behind in ms.'),
} as const satisfies PageLayout;

/** Set when the session starts and unchanged until it closes. */
export const staticLayout = {
  smVersion: wstr(15, 'Shared memory version.'),
  acVersion: wstr(15, 'Game version.'),
  numberOfSessions: i32('Number of sessions.'),
  numCars: i32('Number of cars.'),
  carModel: wstr(33, 'Player car model.'),
  track: wstr(33, 'Track name.'),
  playerName: wstr(33, 'Player name.'),
  playerSurname: wstr(33, 'Player surname.'),
  playerNick: wstr(33, 'Player nickname.'),
  sectorCount: i32('Number of sectors.'),
  maxTorque: f32('Not shown in ACC.'),
  maxPower: f32('Not shown in ACC.'),
  maxRpm: i32('Maximum rpm.'),
  maxFuel: f32('Fuel tank capacity in liters.'),
  suspensionMaxTravel: f32s(4, 'Maximum suspension travel [FL, FR, RL, RR]; not shown in ACC.'),
  tyreRadius: f32s(4, 'Tyre radius [FL, FR, RL, RR]; not shown in ACC.'),
  maxTurboBoost: f32('Maximum turbo boost.'),
  deprecated1: f32('Air temperature; not used.'),
  deprecated2: f32('Road temperature; not used.'),
  penaltiesEnabled: bool32('Penalties are enabled.'),
  aidFuelRate: f32('Fuel consumption rate.'),
  aidTireRate: f32('Tyre wear rate.'),
  aidMechanicalDamage: f32('Mechanical damage rate.'),
  aidAllowTyreBlankets: bool32('Tyre blankets are allowed.'),
  aidStability: f32('Stability control used.'),
  aidAutoClutch: bool32('Auto clutch used.'),
  aidAutoBlip: bool32('Auto blip used.'),
  hasDRS: bool32('Not used in ACC.'),
  hasERS: bool32('Not used in ACC.'),
  hasKERS: bool32('Not used in ACC.'),
  kersMaxJ: f32('Not used in ACC.'),
  engineBrakeSettingsCount: i32('Not used in ACC.'),
  ersPowerControllerCount: i32('Not used in ACC.'),
  trackSplineLength: f32('Track spline length in meters; not used in ACC.'),
  trackConfiguration: wstr(33, 'Track layout; not used in ACC.'),
  ersMaxJ: f32('Not used in ACC.'),
  isTimedRace: bool32('Not used in ACC.'),
  hasExtraLap: bool32('Not used in ACC.'),
  carSkin: wstr(33, 'Car skin; not used in ACC.'),
  reversedGridPositions: i32('Not used in ACC.'),
  pitWindowStart: i32('Pit window opening time.'),
  pitWindowEnd: i32('Pit window closing time.'),
  isOnline: bool32('Multiplayer session.'),
  dryTyresName: wstr(33, 'Dry tyre name.'),
  wetTyresName: wstr(33, 'Wet tyre name.'),
} as const satisfies PageLayout;

export type AcRallyPhysics = PageValues<typeof physicsLayout>;
export type AcRallyGraphics = PageValues<typeof graphicsLayout>;
export type AcRallyStatic = PageValues<typeof staticLayout>;
export type AcRallyFrame = Readonly<{
  physics: AcRallyPhysics;
  graphics: AcRallyGraphics;
  static: AcRallyStatic;
}>;

const byteSize = (spec: FieldSpec): number => {
  if (spec.kind === 'wstr') return spec.length * 2;
  if (spec.kind === 'vec3') return spec.count * 12;
  return 'count' in spec ? spec.count * 4 : 4;
};
const alignment = (spec: FieldSpec): number => (spec.kind === 'wstr' ? 2 : 4);
const alignTo = (offset: number, to: number) => Math.ceil(offset / to) * to;

export type FieldOffsets<L extends PageLayout> = Readonly<{
  offsets: { readonly [K in keyof L]: number };
  size: number;
}>;

/** Byte offset of every field and the page size, with Pack=4 alignment. */
export const computeOffsets = <L extends PageLayout>(layout: L): FieldOffsets<L> => {
  const offsets: Record<string, number> = {};
  let offset = 0;
  for (const [name, spec] of Object.entries(layout)) {
    offset = alignTo(offset, alignment(spec));
    offsets[name] = offset;
    offset += byteSize(spec);
  }
  return { offsets: offsets as { readonly [K in keyof L]: number }, size: alignTo(offset, 4) };
};

export const physicsOffsets = computeOffsets(physicsLayout);
export const graphicsOffsets = computeOffsets(graphicsLayout);
export const staticOffsets = computeOffsets(staticLayout);

const finite = (value: number) => (Number.isFinite(value) ? value : 0);
const utf16 = new TextDecoder('utf-16le');

const readField = (view: DataView, offset: number, spec: FieldSpec): unknown => {
  // Fields past the end of a shorter page read as zero.
  const f32At = (at: number) => (at + 4 <= view.byteLength ? finite(view.getFloat32(at, true)) : 0);
  const i32At = (at: number) => (at + 4 <= view.byteLength ? view.getInt32(at, true) : 0);
  switch (spec.kind) {
    case 'wstr': {
      const end = Math.min(view.byteLength, offset + spec.length * 2);
      if (end <= offset) return '';
      const units = new Uint16Array(
        view.buffer.slice(view.byteOffset + offset, view.byteOffset + end - ((end - offset) % 2)),
      );
      const terminator = units.indexOf(0);
      return utf16.decode(terminator === -1 ? units : units.subarray(0, terminator));
    }
    case 'vec3':
      return Array.from({ length: spec.count }, (_, index) => {
        const at = offset + index * 12;
        return { x: f32At(at), y: f32At(at + 4), z: f32At(at + 8) };
      });
    case 'bool32':
      return i32At(offset) !== 0;
    case 'i32':
      return 'count' in spec
        ? Array.from({ length: spec.count }, (_, index) => i32At(offset + index * 4))
        : i32At(offset);
    case 'f32':
      return 'count' in spec
        ? Array.from({ length: spec.count }, (_, index) => f32At(offset + index * 4))
        : f32At(offset);
  }
};

export const decodePage = <L extends PageLayout>(
  layout: L,
  layoutOffsets: FieldOffsets<L>,
  buffer: ArrayBuffer,
): PageValues<L> => {
  const view = new DataView(buffer);
  const result: Record<string, unknown> = {};
  for (const [name, spec] of Object.entries(layout))
    result[name] = readField(view, layoutOffsets.offsets[name], spec);
  return result as PageValues<L>;
};

const isPages = (
  value: unknown,
): value is Readonly<{ physics: ArrayBuffer; graphics: ArrayBuffer; static: ArrayBuffer }> =>
  typeof value === 'object' &&
  value !== null &&
  'physics' in value &&
  value.physics instanceof ArrayBuffer &&
  'graphics' in value &&
  value.graphics instanceof ArrayBuffer &&
  'static' in value &&
  value.static instanceof ArrayBuffer;

/**
 * Decodes the native reader's page copies. Keeps the reader's null (memory not
 * available) and undefined (no new frame); anything else that is not three
 * page buffers is treated as no new frame.
 */
export const decodeAcRallyPages = (pages: unknown): AcRallyFrame | null | undefined => {
  if (pages === null) return null;
  if (!isPages(pages)) return undefined;
  return {
    physics: decodePage(physicsLayout, physicsOffsets, pages.physics),
    graphics: decodePage(graphicsLayout, graphicsOffsets, pages.graphics),
    static: decodePage(staticLayout, staticOffsets, pages.static),
  };
};

/** A frame with every field zero, false, or empty, as a missing page decodes. */
export const emptyAcRallyFrame = (): AcRallyFrame => ({
  physics: decodePage(physicsLayout, physicsOffsets, new ArrayBuffer(0)),
  graphics: decodePage(graphicsLayout, graphicsOffsets, new ArrayBuffer(0)),
  static: decodePage(staticLayout, staticOffsets, new ArrayBuffer(0)),
});
