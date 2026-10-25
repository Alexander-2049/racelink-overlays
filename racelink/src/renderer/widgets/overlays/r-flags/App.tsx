import { useEffect, useState } from 'react';
import {
  rFlagAliases,
  rFlagEntries,
  type RFlagEntry,
} from '../../../../shared/contracts/rCatalog/flags';
import type { TelemetryTopic } from '../../../../shared/overlay-api/telemetry';
import { useRacingOverlay } from '../model/useRacingOverlay';
import { bool, num, rFontFace, str } from '../r-common/rSettings';

const topics: readonly TelemetryTopic[] = ['connection', 'session'];
const hideDelayMs = 500;

type Shown = Readonly<{
  entry: RFlagEntry;
  header: string;
  text: string;
  leaving: boolean;
}>;

const entryOf = (id: string | null): RFlagEntry | null => {
  if (id === null) return null;
  const target = rFlagAliases[id] ?? id;
  return rFlagEntries.find((entry) => entry.id === target) ?? null;
};

/** `session.flagDetail` states start lights show with the lights icon. */
const lights = (id: string): 'fa-lights-green' | 'fa-lights-empty' | 'fa-flag-black' => {
  if (id === 'startGo') return 'fa-lights-green';
  if (id === 'startSet' || id === 'startReady' || id === 'startHidden') return 'fa-lights-empty';
  return 'fa-flag-black';
};

/** Flags overlay: the current flag with a header and a message. */
export default function App() {
  const overlay = useRacingOverlay(topics);
  const { values } = overlay.settings;
  const preview = overlay.demoMode || overlay.editMode;
  const flagId = preview
    ? str(values, 'ShowFlagInPreview', 'green')
    : overlay.telemetry.session.flagDetail;
  const entry = entryOf(flagId);
  const active =
    entry !== null && bool(values, `Flags.${entry.type}.enabled`, entry.enabled) ? entry : null;
  const [shown, setShown] = useState<Shown | null>(null);

  // Keep the last flag on screen while its hide animation plays.
  if (active !== null) {
    const header = str(values, `Flags.${active.type}.headerText`, active.header);
    const text = str(values, `Flags.${active.type}.flagText`, active.text);
    if (
      shown === null ||
      shown.leaving ||
      shown.entry.id !== active.id ||
      shown.header !== header ||
      shown.text !== text
    ) {
      setShown({ entry: active, header, text, leaving: false });
    }
  } else if (shown !== null && !shown.leaving) {
    setShown({ ...shown, leaving: true });
  }
  const leaving = shown?.leaving === true;
  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      setShown(null);
    }, hideDelayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [leaving]);

  const opacity = num(values, 'Opacity', 0.8);
  const classes = [
    'FlagsOverlay overlay hAlignment_LEFT',
    shown !== null && !shown.leaving ? 'show showAnimation' : shown ? '' : 'hide',
    opacity > 0 ? 'Opacity_1' : 'Opacity_0',
    shown?.leaving ? 'hideAnimation' : '',
    bool(values, 'EnableAnimation', true) ? 'animationEnabled' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={classes}
      style={{
        backgroundColor: `rgba(35, 35, 35, ${String(opacity)})`,
        fontSize: `${String(num(values, 'FontSize', 14))}px`,
        fontFamily: rFontFace(
          str(values, 'FontFamily', 'Montserrat'),
          str(values, 'FontWeight', 'Semibold'),
        ),
        overflow: 'hidden',
      }}
    >
      {shown !== null && bool(values, 'ShowTitle', true) && (
        <div className={`flags ${shown.entry.type} header`}>
          <span className="headerText">{shown.header}</span>
        </div>
      )}
      {shown !== null && (
        <div className={`flags ${shown.entry.type} footer`}>
          <i className={`fa ${lights(shown.entry.id)}`} /> <span>{shown.text}</span>
        </div>
      )}
    </div>
  );
}
