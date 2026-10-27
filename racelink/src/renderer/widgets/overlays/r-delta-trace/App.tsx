import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { demoHistory } from '../../../shared/api/racelink-runtime';
import { deltaTraceTargets } from '../../../../shared/contracts/rCatalog/delta-trace';
import type { TelemetryTopic, TelemetryTopics } from '../../../../shared/overlay-api/telemetry';
import { useMapTrack } from '../model/useMapTrack';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { hexToRgba } from '../r-common/driver/format';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, rFontFace, str } from '../r-common/rSettings';
import { useViewportSize } from '../r-common/useFitFont';
import { buildWidgetData } from '../r-common/widgets/data';
import { barHasWidgets } from '../r-common/widgets/bars';
import { WidgetBar } from '../r-common/widgets/WidgetBar';
import { DeltaTraceCanvas, type DeltaTraceFrame } from './DeltaTraceCanvas';
import {
  buildSections,
  deltaOfSamples,
  sectionLabel,
  type Marker,
  type Section,
  type SectionLabel,
  type SectionMode,
  type TracePoint,
} from './trace';
import { LapTimeIcon, TargetIcon } from './icons';
import { deltaGradient, mapPointsOf, type ColorSegment, type MapPoint } from './mapGeometry';
import { WeakSpotMap } from './WeakSpotMap';

const topics: readonly TelemetryTopic[] = [
  'connection',
  'car',
  'controls',
  'session',
  'timing',
  'delta',
  'track',
  'weather',
  'fuel',
  'drivers',
];

/** The trace is 160 px tall at a 14 px font. */
const designHeight = 170;
/** A lap must have been followed this far to become the ghost. */
const ghostCoverage = 0.95;

type Target = (typeof deltaTraceTargets)[number];
type SessionTurn = TelemetryTopics['session']['turns'][number];

const targetLabels: Readonly<Record<Target, string>> = {
  personalBestLap: 'Personal best',
  personalSessionBestLap: 'Session best',
  personalLastLap: 'Last lap',
};

const lapTimeText = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) return '--:--.---';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  const whole = Math.floor(rest);
  return `${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}.${String(Math.floor((rest - whole) * 1000)).padStart(3, '0')}`;
};

const signed = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(2)}s`;
const tone = (value: number | null): 'muted' | 'red' | 'green' =>
  value === null ? 'muted' : value > 0 ? 'red' : value < 0 ? 'green' : 'muted';

function DeltaBadge({
  value,
  color,
  slot,
  size,
}: Readonly<{
  value: string | null;
  color: string;
  slot: 'left' | 'right';
  size: 'large' | 'small';
}>) {
  const shown = value === null ? 'muted' : color;
  return (
    <span
      className={cx(
        'DeltaBadge',
        `deltaBadge${shown.charAt(0).toUpperCase()}${shown.slice(1)}`,
        `deltaBadge${size.charAt(0).toUpperCase()}${size.slice(1)}`,
        { deltaBadgeRight: slot === 'right' },
      )}
    >
      <span>{value ?? '±-.---'}</span>
    </span>
  );
}

type WeakSection = SectionLabel &
  Readonly<{
    startPct: number;
    endPct: number;
    delta: number;
    live: number | null;
  }>;

const sectionModes: readonly SectionMode[] = ['TURN_AND_STRAIGHT', 'TURNS_ONLY', 'PER_SEGMENT'];

/** How the map of the weak spot is drawn; `null` hides it. */
type MapStyle = Readonly<{
  points: readonly MapPoint[] | null;
  width: number;
  height: number;
  /** Arc colours of each weak section when coloured by delta. */
  gradients: readonly (readonly ColorSegment[] | null)[];
  highlightColor: string;
  highlightWidth: number;
  baseColor: string;
  baseWidth: number;
}>;

function SectionMap({
  map,
  section,
  index,
}: Readonly<{ map: MapStyle; section: WeakSection | undefined; index: number }>) {
  return (
    <WeakSpotMap
      points={map.points}
      section={section ?? null}
      width={map.width}
      height={map.height}
      colorSegments={map.gradients[index] ?? null}
      highlightColor={map.highlightColor}
      highlightWidth={map.highlightWidth}
      baseColor={map.baseColor}
      baseWidth={map.baseWidth}
    />
  );
}

function WeakSpotHeader({
  lapTime,
  showLapTime,
}: Readonly<{ lapTime: number | null; showLapTime: boolean }>) {
  return (
    <div className="WeakSpotHeader">
      <span className="weakSpotHeaderSegment weakSpotHeaderSegmentDark">
        <span className="weakSpotHeaderStrong">LAST</span>
      </span>
      {showLapTime && (
        <span className="weakSpotHeaderSegment weakSpotHeaderSegmentGray">
          <div className="weakSpotHeaderLapTime">
            <LapTimeIcon className="weakSpotHeaderIcon" />
            <span className="simpleNumber">{lapTimeText(lapTime)}</span>
          </div>
        </span>
      )}
    </div>
  );
}

function CurrentSection({
  section,
  showLive,
}: Readonly<{ section: WeakSection | undefined; showLive: boolean }>) {
  return (
    <div className="CurrentSectionView">
      <div className="currentSectionViewNumberBlock">
        {section === undefined || section.number !== null ? (
          <>
            <span className="currentSectionViewLabel" title={section?.name ?? undefined}>
              {section?.name ?? (section?.kind === 'turn' ? 'TURN' : 'SECTOR')}
            </span>
            <span className="currentSectionViewNumber">{section?.number ?? '--'}</span>
          </>
        ) : (
          <span className="currentSectionViewFullLabel">{section.label}</span>
        )}
      </div>
      <div className="currentSectionViewBadges">
        <DeltaBadge
          value={section ? signed(section.delta) : null}
          color={tone(section?.delta ?? null)}
          slot="left"
          size="large"
        />
        {showLive && (
          <DeltaBadge
            value={section?.live === null || section === undefined ? null : signed(section.live)}
            color={tone(section?.live ?? null)}
            slot="right"
            size="large"
          />
        )}
      </div>
    </div>
  );
}

function WeakSpotPanel({
  sections,
  showLive,
  lapTime,
  showLapTime,
  background,
  map,
  perSectionMaps,
}: Readonly<{
  sections: readonly WeakSection[];
  showLive: boolean;
  lapTime: number | null;
  showLapTime: boolean;
  background: string;
  map: MapStyle | null;
  perSectionMaps: boolean;
}>) {
  const first = sections[0];
  const style = { '--weakSpotPanelBackground': background } as CSSProperties;
  if (map && perSectionMaps && sections.length > 1)
    return (
      <div className="WeakSpotPanel weakSpotPanelPerSection" style={style}>
        {sections.map((section, index) => (
          <div
            className="weakSpotSectionModule"
            key={`${String(section.startPct)}-${String(section.endPct)}`}
          >
            <div className="weakSpotSectionModuleInfo">
              {index === 0 && <WeakSpotHeader lapTime={lapTime} showLapTime={showLapTime} />}
              <CurrentSection section={section} showLive={showLive} />
            </div>
            <div
              className="weakSpotSectionModuleMap"
              style={{ width: map.width, minHeight: map.height }}
            >
              <SectionMap map={map} section={section} index={index} />
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div className="WeakSpotPanel" style={style}>
      <div className="weakSpotPanelLeft">
        <WeakSpotHeader lapTime={lapTime} showLapTime={showLapTime} />
        {sections.length > 1 ? (
          <div className="SectionListView">
            {sections.map((section) => (
              <div className="SectionRow" key={section.startPct}>
                <span className="sectionRowNum" title={section.name ?? undefined}>
                  {section.number ?? section.label}
                </span>
                <span className="sectionRowBadges">
                  <DeltaBadge
                    value={signed(section.delta)}
                    color={tone(section.delta)}
                    slot="left"
                    size="small"
                  />
                  {showLive && (
                    <DeltaBadge
                      value={section.live === null ? null : signed(section.live)}
                      color={tone(section.live)}
                      slot="right"
                      size="small"
                    />
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <CurrentSection section={first} showLive={showLive} />
        )}
      </div>
      {map && (
        <div className="weakSpotPanelRight" style={{ width: map.width, minHeight: map.height }}>
          <SectionMap map={map} section={first} index={0} />
        </div>
      )}
    </div>
  );
}

type DeltaLap = NonNullable<NonNullable<TelemetryTopics['delta']>['lap']>;

/** The lap the delta is measured against, as the target setting picks it. */
const referenceOf = (lap: DeltaLap | null, target: Target) =>
  lap === null
    ? null
    : target === 'personalBestLap'
      ? lap.personalBest
      : target === 'personalSessionBestLap'
        ? lap.sessionBest
        : lap.lastLap;

/** Demo history that fills the trace on start: two demo laps, sampled 8 times a second. */
const demoHistorySeconds = 21;
const demoHistoryHz = 8;

/** Delta Trace: the live delta along the lap against a target lap, with the last lap as a ghost. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const viewport = useViewportSize();
  const fontSize = Math.min(30, Math.max(8, (14 * viewport.height) / designHeight));
  const general = { ...readGeneral(values), fontSize, showTitle: false };
  const lap = overlay.telemetry.delta?.lap ?? null;
  const target: Target =
    deltaTraceTargets.find((entry) => entry === str(values, 'targetMode', 'personalBestLap')) ??
    'personalBestLap';
  const reference = referenceOf(lap, target);
  const resetDelayMs = num(values, 'lapResetDelaySeconds', 3) * 1000;
  const ghostOn = str(values, 'ghostMode', 'PERSONAL_LAST') === 'PERSONAL_LAST';

  // The trace is built here from the live delta.
  const frame = useRef<DeltaTraceFrame>({
    samples: [],
    ghost: [],
    latest: null,
    previous: null,
    lapDistPct: null,
  });
  const live = useRef<{ lap: number | null; samples: TracePoint[] }>({ lap: null, samples: [] });
  const shownUntil = useRef(0);
  const [ghost, setGhost] = useState<{ samples: readonly TracePoint[]; lapTime: number | null }>({
    samples: [],
    lapTime: null,
  });
  const lastLapSeconds = overlay.telemetry.timing.lap.lastSeconds;
  const lapNumber = lap?.lapNumber ?? null;
  const pct = lap?.lapDistanceFraction ?? null;
  const delta = reference?.deltaSeconds ?? null;

  useEffect(() => {
    live.current = { lap: null, samples: [] };
    frame.current = { samples: [], ghost: [], latest: null, previous: null, lapDistPct: null };
    setGhost({ samples: [], lapTime: null });
  }, [target]);

  // In demo mode the trace opens with the lap so far and the last lap as its ghost.
  const demoMode = overlay.demoMode;
  useEffect(() => {
    if (!demoMode) return;
    let lapSoFar: { lap: number | null; samples: TracePoint[] } = { lap: null, samples: [] };
    let lastLap: TracePoint[] = [];
    for (const { data } of demoHistory('delta', demoHistorySeconds, demoHistoryHz)) {
      const past = data?.lap ?? null;
      const pastDelta = referenceOf(past, target)?.deltaSeconds ?? null;
      if (past === null) continue;
      if (past.lapNumber !== lapSoFar.lap) {
        if (lapSoFar.samples.length > 1) lastLap = lapSoFar.samples;
        lapSoFar = { lap: past.lapNumber, samples: [] };
      }
      const point = past.lapDistanceFraction;
      const previousPoint = lapSoFar.samples[lapSoFar.samples.length - 1];
      if (point !== null && pastDelta !== null && (!previousPoint || point > previousPoint.p))
        lapSoFar.samples.push({ p: point, d: pastDelta });
    }
    live.current = lapSoFar;
    if (lastLap.length > 1) setGhost({ samples: lastLap, lapTime: null });
  }, [demoMode, target]);

  useEffect(() => {
    const now = performance.now();
    const state = live.current;
    if (lapNumber !== state.lap) {
      const finished = state.samples;
      const covered =
        finished.length > 1 && (finished[finished.length - 1]?.p ?? 0) >= ghostCoverage;
      if (state.lap !== null && covered) {
        setGhost({ samples: finished, lapTime: lastLapSeconds });
        if (resetDelayMs > 0) shownUntil.current = now + resetDelayMs;
      }
      live.current = { lap: lapNumber, samples: [] };
    }
    const current = live.current;
    if (pct !== null && delta !== null) {
      const last = current.samples[current.samples.length - 1];
      if (last === undefined || pct > last.p) current.samples.push({ p: pct, d: delta });
    }
    const showingFinished = now < shownUntil.current;
    const previous = frame.current.latest;
    frame.current = {
      samples: showingFinished ? frame.current.samples : current.samples,
      ghost: frame.current.ghost,
      latest: pct !== null && delta !== null ? { pct, delta, ts: now } : null,
      previous: previous !== null && previous.pct !== pct ? previous : frame.current.previous,
      lapDistPct: pct,
    };
  }, [lapNumber, pct, delta, lastLapSeconds, resetDelayMs]);

  useEffect(() => {
    frame.current.ghost = ghostOn ? ghost.samples : [];
  }, [ghost, ghostOn]);

  // The lists change identity with every message; their values change with the track.
  const sectorKey = (lap?.sectorStartFractions ?? []).join(',');
  const sectors: readonly Marker[] = useMemo(() => {
    const starts = sectorKey === '' ? [] : sectorKey.split(',').map(Number);
    return starts.map((start, index) => {
      const end = starts[index + 1] ?? 1;
      return { number: index + 1, name: null, start, end, position: (start + end) / 2 };
    });
  }, [sectorKey]);
  const turnsKey = JSON.stringify(overlay.telemetry.session.turns);
  const turns: readonly Marker[] = useMemo(
    () =>
      (JSON.parse(turnsKey) as SessionTurn[]).map((turn) => ({
        number: turn.number,
        name: turn.name,
        start: turn.startLapFraction,
        end: turn.endLapFraction,
        position: turn.labelLapFraction,
      })),
    [turnsKey],
  );

  // Section deltas follow the turns; sectors stand in when the turns are not known.
  const modeSetting = str(values, 'sectionDeltaMode', 'TURN_AND_STRAIGHT');
  const bySectors = turns.length === 0 || (modeSetting === 'SECTORS' && sectors.length > 0);
  const sectionMarkers = bySectors ? sectors : turns;
  const sectionMode: SectionMode = bySectors
    ? 'TURNS_ONLY'
    : (sectionModes.find((mode) => mode === modeSetting) ?? 'TURN_AND_STRAIGHT');
  const sections: readonly Section[] = useMemo(
    () => buildSections(sectionMarkers, sectionMode),
    [sectionMarkers, sectionMode],
  );

  // The weak spot: the sections where the last lap lost most against the target.
  const showWeakSpot = bool(values, 'showWeakSpot', true);
  const weakCount = Math.max(1, Math.min(5, Math.round(num(values, 'weakSpotSectionCount', 1))));
  const showLive = bool(values, 'showLiveWeakSpotDelta', true);
  const weakSections: readonly WeakSection[] = useMemo(() => {
    if (!showWeakSpot || ghost.samples.length < 2 || sections.length === 0) return [];
    const ghostAt = deltaOfSamples(ghost.samples);
    const liveAt = deltaOfSamples(live.current.samples);
    return sections
      .map((section) => {
        const start = ghostAt(section.startPct);
        const end = ghostAt(section.endPct);
        let liveDelta: number | null = null;
        if (pct !== null && pct >= section.startPct) {
          const from = liveAt(section.startPct);
          const to = liveAt(Math.min(pct, section.endPct));
          liveDelta = Number.isFinite(from) && Number.isFinite(to) ? to - from : null;
        }
        return {
          ...sectionLabel(section.startPct, sectionMarkers, bySectors),
          startPct: section.startPct,
          endPct: section.endPct,
          delta: end - start,
          live: liveDelta,
        };
      })
      .filter((section) => Number.isFinite(section.delta))
      .sort((a, b) => b.delta - a.delta)
      .slice(0, weakCount)
      .sort((a, b) => a.startPct - b.startPct);
  }, [showWeakSpot, ghost, sections, sectionMarkers, bySectors, weakCount, pct]);
  // The map of the weak spot, from the track's geometry.
  const track = useMapTrack(overlay.telemetry.track, overlay.demoMode);
  const mapPoints = useMemo(() => mapPointsOf(track), [track]);
  const gradientOn = str(values, 'weakSpotHighlightStyle', 'SOLID') === 'DELTA_GRADIENT';
  const gradients = useMemo(() => {
    if (!gradientOn) return [];
    const ghostAt = deltaOfSamples(ghost.samples);
    return weakSections.map((section) => deltaGradient(ghostAt, section));
  }, [gradientOn, ghost, weakSections]);
  const textScale = Math.max(0.7, Math.min(2.5, fontSize / 14));
  const map: MapStyle | null = bool(values, 'showWeakSpotMiniMap', true)
    ? {
        points: mapPoints,
        width: Math.round(110 * textScale),
        height: Math.round(82 * textScale),
        gradients,
        highlightColor: str(values, 'weakSpotHighlightColor', '#FE171F'),
        highlightWidth: num(values, 'weakSpotHighlightLineWidth', 25),
        baseColor: str(values, 'weakSpotBaseTrackColor', '#D9D9E1'),
        baseWidth: num(values, 'weakSpotBaseTrackLineWidth', 25),
      }
    : null;
  const worst = weakSections.reduce<WeakSection | null>(
    (best, section) => (best === null || section.delta > best.delta ? section : best),
    null,
  );
  const highlightedRange: Section | null =
    bool(values, 'highlightWeakSpotInSectionBar', true) && worst !== null
      ? { startPct: worst.startPct, endPct: worst.endPct }
      : null;

  const lumina = str(values, 'Theme', 'LUMINA') !== 'CLASSIC';
  const opacity = general.opacity;
  const topEmpty = !barHasWidgets(values, 'Top');
  const bottomEmpty = !barHasWidgets(values, 'Bottom');
  const bothEmpty = topEmpty && bottomEmpty;
  const baseColor = lumina ? '#0A0A0B' : '#000000';
  const panelOpacity = bothEmpty ? opacity : 0.75 * opacity;
  const histogramColor = str(values, 'histogramBackgroundColor', '#000000');
  const histogramBackground = bothEmpty
    ? hexToRgba(histogramColor, panelOpacity)
    : `linear-gradient(to bottom, ${hexToRgba(histogramColor, panelOpacity)}, ${hexToRgba(histogramColor, 0.6 * Math.min(1, panelOpacity))})`;
  const slate = hexToRgba('#334155', 0.4);
  const weakBackground = bothEmpty
    ? `linear-gradient(${slate}, ${slate}), ${hexToRgba(baseColor, panelOpacity)}`
    : `linear-gradient(${slate}, ${slate}), linear-gradient(to bottom, ${hexToRgba(baseColor, panelOpacity)}, ${hexToRgba(baseColor, 0.5 * Math.min(0.8, panelOpacity))})`;
  const position = str(values, 'weakSpotPanelPosition', 'RIGHT');
  const before = position === 'LEFT' || position === 'TOP';
  const showCanvas = !showWeakSpot || bool(values, 'showHistogramCanvas', true);
  const liveDelta = delta === null ? null : Math.round(delta * 100) / 100;
  const deltaBadge =
    liveDelta === null || liveDelta === 0
      ? { text: '±0.00', sign: 'zero' }
      : {
          text: `${liveDelta > 0 ? '+' : '-'}${Math.abs(liveDelta) < 10 ? Math.abs(liveDelta).toFixed(2) : Math.abs(liveDelta) < 100 ? Math.abs(liveDelta).toFixed(1) : Math.abs(liveDelta).toFixed(0)}`,
          sign: liveDelta > 0 ? 'positive' : 'negative',
        };
  const widgetData = buildWidgetData(overlay);

  const settings = {
    minSpread: num(values, 'histogramMinSpread', 1),
    maxSpread: num(values, 'histogramMaxSpread', 10),
    areaFill: bool(values, 'histogramAreaFill', true),
    lineWidth: num(values, 'histogramLineWidth', 1),
    colorPositive: str(values, 'histogramLineColorPositive', '#D40000'),
    colorNegative: str(values, 'histogramLineColorNegative', '#09B61A'),
    zeroAxisStyle: str(values, 'histogramZeroAxisStyle', 'SOLID'),
    zeroAxisColor: hexToRgba(
      str(values, 'histogramZeroAxisColor', '#ffffff28').slice(0, 7),
      parseInt(str(values, 'histogramZeroAxisColor', '#ffffff28').slice(7, 9) || 'ff', 16) / 255,
    ),
    turns,
    showTurnMarkers: bool(values, 'showTurnMarkers', true),
    showTurnLimits: bool(values, 'showTurnLimits', true),
    turnMarkerStyle: str(values, 'turnMarkerStyle', 'MIDDLE'),
    turnLineStyle: str(values, 'turnLineStyle', 'REGIONS'),
    turnNumberStyle: str(values, 'turnNumberStyle', 'PLAIN'),
    turnNumberColor: str(values, 'turnNumberColor', '#bdbdbd'),
    turnColor: str(values, 'turnColor', '#ffffff'),
    sectors,
    sections,
    // Without turns the sectors mark the lap in their place.
    showSectorMarkers:
      bool(values, 'showSectorMarkers', false) ||
      (turns.length === 0 && bool(values, 'showTurnLimits', true)),
    showSectorNumbers:
      bool(values, 'showSectorNumbers', false) ||
      (turns.length === 0 && bool(values, 'showTurnMarkers', true)),
    sectorColor: str(values, 'sectorColor', '#ffffff'),
    sectorNumberColor: str(values, 'sectorNumberColor', '#bdbdbd'),
    showSectionDeltas: bool(values, 'showSectionDeltas', true),
    sectionBarTheme: str(values, 'sectionBarTheme', 'SIMPLE'),
    showSectionDeltaNumbers: bool(values, 'showSectionDeltaNumbers', true),
    sectionDeltaDecimals: num(values, 'sectionDeltaDecimals', 1),
    showSectionDeltaSigns: bool(values, 'showSectionDeltaSigns', false),
    showPositionCursor: bool(values, 'showPositionCursor', true),
    cursorStyle: str(values, 'cursorStyle', 'LINE'),
    cursorColor: str(values, 'positionCursorColor', '#ffffff'),
    ghostColor: str(values, 'ghostColor', '#ffffff'),
    ghostLineStyle: str(values, 'ghostLineStyle', 'DASHED'),
    showGhostLine: bool(values, 'showGhostLine', true),
    ghostLineOpacity: num(values, 'ghostLineOpacity', 0.35),
    showGhostAreaFill: bool(values, 'showGhostAreaFill', true),
    showGhostSectionDeltas: ghostOn && bool(values, 'showGhostSectionDeltas', false),
    highlightedRange,
    highlightColor: str(values, 'weakSpotHighlightColor', '#FE171F'),
    textScale,
    fontFamily: rFontFace(general.fontFamily, general.fontWeight),
  };

  const histogram = showCanvas ? (
    <div className="histogramMain" style={{ background: histogramBackground }}>
      <DeltaTraceCanvas frame={frame} settings={settings} />
      {bool(values, 'showDeltaValue', true) && (
        <span className={`deltaValueBadge delta_${deltaBadge.sign}`}>{deltaBadge.text}</span>
      )}
      {(bool(values, 'showModeIndicator', true) || bool(values, 'showReferenceLapTime', true)) && (
        <div className="modeMeta">
          <TargetIcon className="referenceLapTimeIcon" />
          {bool(values, 'showModeIndicator', true) && (
            <span className="modeBadge">{targetLabels[target]}</span>
          )}
          {bool(values, 'showReferenceLapTime', true) && (
            <span className="SimpleLapTime">{lapTimeText(reference?.lapSeconds ?? null)}</span>
          )}
        </div>
      )}
    </div>
  ) : null;
  const panel = showWeakSpot ? (
    <WeakSpotPanel
      sections={weakSections}
      showLive={showLive}
      lapTime={ghost.lapTime}
      showLapTime={bool(values, 'showWeakSpotLapTime', true)}
      background={weakBackground}
      map={map}
      perSectionMaps={bool(values, 'showPerSectionWeakSpotMap', false)}
    />
  ) : null;
  const sideBySide = showWeakSpot && (position === 'LEFT' || position === 'RIGHT');
  const content = (
    <>
      {before && panel}
      {histogram}
      {!before && panel}
    </>
  );

  return (
    <RContainer
      general={general}
      title="Delta Trace"
      className={cx('DeltaTraceOverlay', {
        themeLumina: lumina,
        themeClassic: !lumina,
        topAndBottomEmpty: bothEmpty,
      })}
      disableTitle
      disableBackgroundColor
      style={{ width: '100%', height: '100%', '--bgOpacity': String(opacity) } as CSSProperties}
    >
      <div
        className="DeltaTraceContainer"
        style={{ backgroundColor: hexToRgba(baseColor, opacity) }}
      >
        {!topEmpty && (
          <WidgetBar
            bar="Top"
            values={values}
            data={widgetData}
            className="DeltaTraceWidgetsRow topInfoBar"
          />
        )}
        <div
          className={cx('histogramBlock', {
            weakSpotTop: position === 'TOP',
            weakSpotBottom: position === 'BOTTOM',
            weakSpotLeft: position === 'LEFT',
            weakSpotRight: position === 'RIGHT',
            weakSpotAlignLeft: true,
          })}
        >
          {sideBySide ? <div className="histogramMainWithPanel">{content}</div> : content}
        </div>
        {!bottomEmpty && (
          <WidgetBar
            bar="Bottom"
            values={values}
            data={widgetData}
            className="DeltaTraceWidgetsRow bottomInfoBar"
          />
        )}
      </div>
    </RContainer>
  );
}
