import type { ReactNode } from 'react';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { RContainer } from '../r-common/RContainer';
import { bool, num, readGeneral, str } from '../r-common/rSettings';
import { useViewportSize } from '../r-common/useFitFont';

const topics: readonly TelemetryTopic[] = ['connection', 'session'];

type Layer = Readonly<{ a: string | null; b: string }>;

/** The two layers a flag is drawn from; `a` is the static one, `b` blinks. */
const layersOf = (flag: string | null): Layer | null => {
  switch (flag) {
    case 'black':
    case 'disqualify':
      return { a: 'BaseFlag', b: 'BlackFlag' };
    case 'blue':
      return { a: 'BaseFlag', b: 'BlueFlag' };
    case 'checkered':
      return { a: 'CheckeredFlagA', b: 'CheckeredFlagB' };
    case 'green':
    case 'greenHeld':
    case 'startGo':
      return { a: 'BaseFlag', b: 'GreenFlag' };
    case 'red':
      return { a: 'BaseFlag', b: 'RedFlag' };
    case 'debris':
      return { a: 'DebrisFlagA', b: 'DebrisFlagB' };
    case 'yellow':
    case 'yellowWaving':
    case 'randomWaving':
    case 'crossed':
      return { a: 'YellowFlagA', b: 'YellowFlagB' };
    case 'caution':
    case 'cautionWaving':
      return { a: 'SafetyCarFlagA', b: 'SafetyCarFlagB' };
    case 'repair':
      return { a: 'BaseFlag', b: 'MeatballFlag' };
    case 'white':
      return { a: 'BaseFlag', b: 'WhiteFlag' };
    default:
      return null;
  }
};

function Flag({ flag, reversed }: Readonly<{ flag: string | null; reversed?: boolean }>) {
  const layers = layersOf(flag);
  if (layers === null) return <div className="BaseFlag" />;
  return (
    <div className="flagMixer">
      <div className={layers.a ?? 'BaseFlag'} />
      <div className={`${layers.b}${reversed === true ? ' reversed' : ''}`} />
    </div>
  );
}

const typeClasses: Readonly<Record<string, string>> = {
  big: 'flagtype_big',
  small: 'flagtype_small',
  doublestrip: 'flagtype_doublestrip',
};

/** Sizes of the flag types in em (index.css): a square, or one of two strips. */
const bigSide = 10.7142857143;
const smallSide = 6.2857142857;
const stripWidth = 2.8571428571;
const stripHeight = 10.4285714286;

/** The font size at which the flag of a type fills a window of this size. */
const flagFontSize = (type: string, gap: number, width: number, height: number): number => {
  if (type === 'doublestrip')
    return Math.max(1, Math.min((width - gap) / (stripWidth * 2), height / stripHeight));
  const side = type === 'small' ? smallSide : bigSide;
  return Math.max(1, Math.min(width, height) / side);
};

/** Digiflag: a large digital flag, as one flag or two strips. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const type = str(values, 'Type', 'big');
  const stripDistance = num(values, 'DoubleStripDistance', 200);
  // The flag fills its window: every part is sized in em, so the font size
  // that makes the flag (or the two strips with their gap) fit is worked out.
  const viewport = useViewportSize();
  const fontSize = flagFontSize(type, stripDistance, viewport.width, viewport.height);
  const general = { ...readGeneral(values), fontSize };
  const flag =
    overlay.demoMode || overlay.editMode
      ? str(values, 'ShowFlagInPreview', 'green')
      : overlay.telemetry.session.flagDetail;
  const idle = flag === null;
  if (bool(values, 'HideWhenNoFlag', false) && idle) return null;
  const strips: ReactNode = type === 'doublestrip' && <Flag flag={flag} reversed />;
  return (
    <div className="digiflagFit">
      <RContainer
        general={general}
        title="Digiflag"
        titlePlacement="top"
        disableBackgroundColor
        className={`DigiFlagOverlay ${typeClasses[type] ?? 'flagtype_big'}`}
        style={{
          overflow: 'visible',
          ['--digiFlagStripDistance' as string]: `${String(stripDistance)}px`,
        }}
      >
        <div className="digiflaginner">
          <Flag flag={flag} />
          {strips}
        </div>
      </RContainer>
    </div>
  );
}
