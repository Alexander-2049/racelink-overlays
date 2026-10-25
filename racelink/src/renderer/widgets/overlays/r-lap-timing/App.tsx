import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  lapTimingBlockCount,
  lapTimingEntityTypes,
  lapTimingReferenceTypes,
  lapTimingThemes,
  type LapTimingEntityType,
} from '../../../../shared/contracts/rCatalog/lap-timing';
import type { LapReferenceTelemetry } from '../../../../shared/overlay-api/fields/delta';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { cx } from '../r-common/driver/cx';
import { hexToRgba } from '../r-common/driver/format';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { useFitFont } from '../r-common/useFitFont';

const topics: readonly TelemetryTopic[] = ['connection', 'timing', 'delta'];

/** How long a finished lap stays on a block that shows it. */
const finishedLapMs = 5000;

type Theme = (typeof lapTimingThemes)[number];
type Reference = (typeof lapTimingReferenceTypes)[number];

const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  allowed.find((candidate) => candidate === value) ?? fallback;

/** Fixed decimals that round toward minus infinity. */
const toFixedDown = (value: number, places: number): string => {
  const scale = 10 ** places;
  return (Math.floor(value * scale) / scale).toFixed(places);
};

const lapTimeText = (seconds: number): string => {
  const total = Math.max(0, seconds);
  const minutes = Math.floor(total / 60);
  const rest = total - minutes * 60;
  const whole = Math.floor(rest);
  const millis = Math.floor((rest - whole) * 1000);
  return `${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
};

const deltaText = (delta: number): string =>
  Math.abs(delta) < 10
    ? toFixedDown(delta, 2)
    : Math.abs(delta) < 99
      ? toFixedDown(delta, 1)
      : delta < 0
        ? '-99.9'
        : '99.9';

const labels: Readonly<Record<LapTimingEntityType, string>> = {
  NONE: 'N/A',
  CURRENT: 'Current',
  PREDICTED: 'Predicted',
  personalBestLap: 'Personal Best',
  personalSessionBestLap: 'P.Session Best',
  personalLastLap: 'Personal Last',
};

function LapTimingDelta({ delta }: Readonly<{ delta: number | null }>) {
  return (
    <div className="LapTimingDelta">
      <span
        className={cx('DeltaBarDeltaValue', {
          negative: delta !== null && delta <= 0,
          positive: delta !== null && delta > 0,
          noValue: delta === null,
        })}
      >
        {delta === null ? '-.--' : `${delta > 0 ? '+' : ''}${deltaText(delta)}`}
      </span>
      <span className="DeltaBarDeltaLabel">delta</span>
    </div>
  );
}

function LapTimingLapTime({
  lapTime,
  label,
  color,
}: Readonly<{ lapTime: number | null; label: string; color: 'green' | 'red' | null }>) {
  const known = lapTime !== null && lapTime >= 0;
  return (
    <div className="LapTimingLapTime">
      <span
        className={cx('DeltaBarLapTimeValue', {
          negative: color === 'green',
          positive: color === 'red',
          noValue: !known,
        })}
      >
        {known ? lapTimeText(lapTime) : '--:--.---'}
      </span>
      <span className="DeltaBarLapTimeLabel">{label}</span>
    </div>
  );
}

const variationOf: Readonly<Record<Theme, number>> = {
  CLEAN: 1,
  ARROW: 2,
  GLOW: 3,
  BUBBLES: 4,
  POPUP: 5,
  DIAL: 6,
};

type Block = Readonly<{
  type: LapTimingEntityType;
  lapTime: number | null;
  delta: number | null;
  label: string;
  color: 'green' | 'red' | null;
  isReference: boolean;
  isGreen: boolean;
  isPurple: boolean;
  showDelta: boolean;
}>;

function LapTimingBlock({
  block,
  theme,
  striped,
  opacity,
  flashKey,
}: Readonly<{ block: Block; theme: Theme; striped: boolean; opacity: number; flashKey: number }>) {
  const variation = variationOf[theme];
  const markers: Readonly<Record<number, readonly string[]>> = {
    4: ['DeltaBarLapTimeRefLeft', 'DeltaBarLapTimeRefRight'],
    6: ['DeltaBarLapTimeRefTop', 'DeltaBarLapTimeRefBottom'],
  };
  const [first, second] = markers[variation] ?? [];
  const content: ReactNode = (
    <div className={`LapTimingComponentVariation${String(variation)}`}>
      {block.isReference && <div className={cx('DeltaBarLapTimeRef', first)} />}
      {block.showDelta && <LapTimingDelta delta={block.delta} />}
      <LapTimingLapTime lapTime={block.lapTime} label={block.label} color={block.color} />
      {block.isReference && second !== undefined && (
        <div className={cx('DeltaBarLapTimeRef', second)} />
      )}
    </div>
  );
  const style = {
    '--backgroundColor': hexToRgba(striped ? '#222222' : '#000000', opacity),
    '--stripeColor': hexToRgba('#000000', opacity),
  } as CSSProperties;
  return (
    <div className="LapTimingComponentOuter" key={flashKey}>
      <div
        className={cx('LapTimingComponent', {
          enabledAnim: block.lapTime !== null && block.type !== 'PREDICTED',
          backgroundIsStriped: striped,
          backgroundIsSimple: !striped,
          roundedBorders: theme === 'BUBBLES',
          smallRoundedBorders: theme === 'POPUP',
          noBorders: theme === 'DIAL',
          isGreen: block.isGreen,
          isPurple: block.isPurple,
        })}
        style={style}
      >
        {content}
      </div>
    </div>
  );
}

const sameLap = (a: number | null, b: number | null | undefined): boolean =>
  a !== null && b !== null && b !== undefined && Math.abs(a - b) < 0.0005;

/** Lap Timing: blocks of lap times (current, predicted, best, last) with deltas. */
export default function App() {
  const overlay = useRacingOverlay(topics, 20);
  const { values } = overlay.settings;
  const lap = overlay.telemetry.delta?.lap ?? null;
  const timing = overlay.telemetry.timing.lap;
  const theme = pick(str(values, 'theme', 'CLEAN'), lapTimingThemes, 'CLEAN');
  const layout = str(values, 'layoutFormat', 'row') === 'column' ? 'column' : 'row';
  const reference: Reference = pick(
    str(values, 'referenceType', 'personalBestLap'),
    lapTimingReferenceTypes,
    'personalBestLap',
  );
  const entities = Array.from({ length: lapTimingBlockCount }, (_, index) => {
    const key = (field: string) => `entities.${String(index)}.${field}`;
    return {
      type: pick(
        str(values, key('type'), index === 0 ? 'personalSessionBestLap' : 'NONE'),
        lapTimingEntityTypes,
        'NONE',
      ),
      showDelta: bool(values, key('showDelta'), false),
      showLastLapAfterFinish: bool(values, key('showLastLapAfterFinish'), false),
    };
  }).filter((entity) => entity.type !== 'NONE');
  const [fontSize, fit] = useFitFont('height', `${layout}:${String(entities.length)}:${theme}`);
  const general = { ...readGeneral(values), fontSize, showTitle: false };
  const opacity = num(values, 'Opacity', 1);

  // A finished lap flashes the blocks and shows on blocks that ask for it.
  const lapNumber = lap?.lapNumber ?? null;
  const [finished, setFinished] = useState<{ lap: number; at: number; key: number } | null>(null);
  const previousLap = useRef(lapNumber);
  useEffect(() => {
    if (previousLap.current !== null && lapNumber !== null && lapNumber > previousLap.current) {
      setFinished((current) => ({
        lap: lapNumber,
        at: performance.now(),
        key: (current?.key ?? 0) + 1,
      }));
    }
    previousLap.current = lapNumber;
  }, [lapNumber]);
  const [, tick] = useState(0);
  const showingFinished = finished !== null && performance.now() - finished.at < finishedLapMs;
  useEffect(() => {
    if (!showingFinished) return;
    const timer = window.setTimeout(() => {
      tick((value) => value + 1);
    }, finishedLapMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [showingFinished, finished]);

  const refs: Readonly<Record<Reference, LapReferenceTelemetry | null>> = {
    personalBestLap: lap?.personalBest ?? null,
    personalSessionBestLap: lap?.sessionBest ?? null,
    personalLastLap: lap?.lastLap ?? null,
  };
  const target = refs[reference];
  const lastLap = timing.lastSeconds;
  const lastIsPersonalBest = sameLap(lastLap, lap?.personalBest?.lapSeconds);
  const lastIsSessionBest = sameLap(lastLap, lap?.sessionBest?.lapSeconds);

  const blocks: Block[] = entities.map((entity) => {
    const flashGreen = showingFinished && lastIsPersonalBest;
    const flashPurple = showingFinished && lastIsSessionBest && !lastIsPersonalBest;
    if (entity.showLastLapAfterFinish && showingFinished) {
      return {
        type: entity.type,
        lapTime: lastLap,
        delta: target !== null && lastLap !== null ? lastLap - target.lapSeconds : null,
        label: 'Last',
        color: null,
        isReference: false,
        isGreen: flashGreen,
        isPurple: flashPurple,
        showDelta: entity.showDelta,
      };
    }
    const base = {
      type: entity.type,
      label: labels[entity.type],
      color: null,
      isGreen: false,
      isPurple: false,
      showDelta: entity.showDelta,
    } as const;
    switch (entity.type) {
      case 'CURRENT':
        return {
          ...base,
          lapTime: lap?.currentSeconds ?? timing.currentSeconds,
          delta: target?.deltaSeconds ?? null,
          isReference: false,
        };
      case 'PREDICTED':
        return {
          ...base,
          lapTime: target?.predictedSeconds ?? null,
          delta: target?.deltaSeconds ?? null,
          isReference: false,
        };
      default: {
        const own = refs[entity.type as Reference];
        return {
          ...base,
          lapTime: own?.lapSeconds ?? null,
          delta: own?.deltaSeconds ?? null,
          isReference: entity.type === reference,
          isGreen: entity.type === 'personalBestLap' && flashGreen,
          isPurple: entity.type === 'personalSessionBestLap' && flashPurple,
        };
      }
    }
  });

  return (
    <div ref={fit} className="rFit">
      <RContainer
        general={general}
        title="Lap Timing"
        className="LapTimingOverlay"
        disableTitle
        disableBackgroundColor
      >
        <div className={`LapTimingEntities layoutFormat_${layout}`}>
          {blocks.map((block, index) => (
            <LapTimingBlock
              key={`${block.type}-${String(block.showDelta)}-${String(index)}`}
              block={block}
              theme={theme}
              striped={bool(values, 'backgroundIsStriped', true)}
              opacity={opacity}
              flashKey={finished?.key ?? 0}
            />
          ))}
        </div>
      </RContainer>
    </div>
  );
}
