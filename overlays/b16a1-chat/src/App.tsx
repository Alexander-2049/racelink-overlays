import type { RacelinkOverlay } from '@racelink/overlay';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { ChatMessage } from '../../../racelink/src/shared/overlay-api/fields/stream';
import { themeVars } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/themes.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/b16a1-common/useOverlay';
import {
  ChatClock,
  hasHighlight,
  messageText,
  normalizeChannel,
  visibleChat,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import type { Settings } from './racelink-settings';

type Overlay = RacelinkOverlay<Settings>;

const words = (list: string): string[] =>
  list
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word !== '');

/** Badge tiles drawn here: a letter-less glyph on the badge's colour. */
const badgeGlyphs: Readonly<Record<string, Readonly<{ color: string; path: string }>>> = {
  broadcaster: { color: '#c93a3a', path: 'M3 7h11v10H3zM14 10l6-3v10l-6-3z' },
  moderator: { color: '#3f9b4a', path: 'M5 19 15 9M13 5l6 6-3 3-6-6zM4 20l3-3' },
  vip: { color: '#b4468f', path: 'M12 4l7 8-7 8-7-8z' },
  subscriber: { color: '#7a52c9', path: 'M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6L7.1 19.2 8 13.7 4 9.8 9.5 9z' },
  partner: { color: '#7a52c9', path: 'M5 12l5 5 9-10' },
  premium: { color: '#3d8fd1', path: 'M4 9l4 3 4-6 4 6 4-3-2 9H6z' },
};

function Badge({ name }: Readonly<{ name: string }>) {
  const glyph = badgeGlyphs[name];
  if (!glyph) return null;
  return (
    <span className="ch-badge" style={{ background: glyph.color }} title={name}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={glyph.path} />
      </svg>
    </span>
  );
}

function Message({
  message,
  settings,
  highlighted,
}: Readonly<{ message: ChatMessage; settings: Settings; highlighted: boolean }>) {
  const nameStyle: CSSProperties | undefined = message.color ? { color: message.color } : undefined;
  return (
    <li className={`ch-message${highlighted ? ' is-highlight' : ''}${message.isAction ? ' is-action' : ''}`}>
      {settings.showBadges && message.badges.map((badge) => <Badge key={badge} name={badge} />)}
      <b className="ch-name" style={nameStyle}>
        {message.displayName}
      </b>{' '}
      <span className="ch-text" style={message.isAction ? nameStyle : undefined}>
        {message.fragments.map((fragment, at) =>
          fragment.emoteUrl && settings.showEmotes ? (
            // Fragments never reorder within a message.
            <img key={at} className="ch-emote" src={fragment.emoteUrl} alt={fragment.text} title={fragment.text} />
          ) : (
            <span key={at}>{fragment.text}</span>
          ),
        )}
      </span>
    </li>
  );
}

export default function App({ overlay }: Readonly<{ overlay: Overlay }>) {
  const { telemetry, settings, editMode, status } = useOverlay(overlay, 4);
  const chat = telemetry.stream.chat;
  const clock = useRef(new ChatClock());
  // A message fades by when it arrived here, so the clock ticks every second.
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(performance.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // The demo chat talks on its own channel, whatever channel is set.
  const channel = status === 'demo' ? 'racelink' : normalizeChannel(settings.channel);
  const arrivals = clock.current.observe(chat.messages, now);
  const shown = visibleChat(
    chat.messages,
    arrivals,
    {
      channel,
      maxMessages: settings.maxMessages,
      hideAfterSeconds: settings.hideAfterSeconds,
      hiddenUsers: words(settings.hiddenUsers),
      hideCommands: settings.hideCommands,
    },
    now,
  );
  const ordered = settings.messagesAt === 'top' ? [...shown].reverse() : shown;
  const highlight = words(settings.highlightWords);

  // Only whole messages: one the window would cut is hidden, never shown in part.
  const list = useRef<HTMLOListElement>(null);
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const fit = (): void => {
      const box = element.getBoundingClientRect();
      for (const item of element.children) {
        if (!(item instanceof HTMLElement)) continue;
        const rect = item.getBoundingClientRect();
        item.style.visibility = rect.top >= box.top - 0.5 && rect.bottom <= box.bottom + 0.5 ? '' : 'hidden';
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  });

  const named = chat.channels.includes(channel);
  const hint =
    channel === ''
      ? 'Set the Twitch channel in the overlay settings.'
      : !named
        ? `Racelink does not read #${channel} yet: add the built-in Twitch Chat overlay with this channel to a layout.`
        : !chat.connected
          ? 'Connecting to Twitch chat...'
          : '';

  const style = { ...themeVars(settings.theme, settings.opacity), '--ch-size': `${String(settings.fontSize)}px` } as CSSProperties;
  return (
    <div className={`b-root ch-root b-panel${settings.messagesAt === 'top' ? ' at-top' : ''}`} style={style}>
      <ol ref={list} className="ch-list">
        {ordered.map((message) => (
          <Message
            key={message.id}
            message={message}
            settings={settings}
            highlighted={highlight.length > 0 && hasHighlight(messageText(message), highlight)}
          />
        ))}
      </ol>
      {editMode && hint !== '' && ordered.length === 0 && <div className="b-hint">{hint}</div>}
    </div>
  );
}
