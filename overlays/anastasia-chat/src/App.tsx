import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import { readableColor, splitList } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/format.ts';
import { useOverlay } from '../../../racelink/src/renderer/widgets/overlays/anastasia-common/useOverlay';
import {
  ChatClock,
  hasHighlight,
  isValidChannel,
  normalizeChannel,
  visibleChat,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common';
import type { Settings } from './racelink-settings';

const renderHz = 8;

/** The channel the demo chat talks on. */
const demoChannel = 'racelink';

type ChatMessage = ReturnType<typeof visibleChat>[number];

const badgeTitles: Readonly<Record<string, string>> = {
  broadcaster: 'Streamer',
  moderator: 'Moderator',
  vip: 'VIP',
  subscriber: 'Subscriber',
};

function BadgeIcon({ badge }: Readonly<{ badge: string }>) {
  return (
    <svg className={`ch-badge ${badge}`} viewBox="0 0 16 16" aria-label={badgeTitles[badge]}>
      <title>{badgeTitles[badge]}</title>
      {badge === 'moderator' && (
        <>
          <rect width="16" height="16" rx="3" />
          <path d="M4 12 11 5M9 4h3v3M4.5 8.5l3 3" />
        </>
      )}
      {badge === 'broadcaster' && (
        <>
          <rect width="16" height="16" rx="3" />
          <circle cx="8" cy="8" r="3" />
        </>
      )}
      {badge === 'vip' && (
        <>
          <rect width="16" height="16" rx="3" />
          <path d="M8 3.5 12 8 8 12.5 4 8z" />
        </>
      )}
      {badge === 'subscriber' && (
        <>
          <rect width="16" height="16" rx="3" />
          <path d="M8 3.5l1.4 3 3.2.4-2.4 2.2.7 3.2L8 10.7 5.1 12.3l.7-3.2L3.4 6.9l3.2-.4z" />
        </>
      )}
    </svg>
  );
}

function TwitchMark() {
  return (
    <svg className="ch-twitch" viewBox="0 0 16 16" aria-label="Twitch">
      <title>Twitch</title>
      <rect width="16" height="16" rx="3" />
      <path d="M4 3h9v6.2L10.6 11.6H8.6L7 13.2v-1.6H4zM6 4.4v5.4h1.6V8.8M10 4.4v3.2" />
    </svg>
  );
}

function Message({
  message,
  settings,
  highlighted,
}: Readonly<{ message: ChatMessage; settings: Settings; highlighted: boolean }>) {
  const color = readableColor(message.color);
  const badges = settings.showBadges
    ? Object.keys(badgeTitles).filter((badge) => message.badges.includes(badge))
    : [];
  return (
    <li className={`ch-message ${highlighted ? 'hl' : ''}`}>
      {settings.showPlatform && <TwitchMark />}
      {badges.map((badge) => (
        <BadgeIcon key={badge} badge={badge} />
      ))}
      <b className="ch-name" style={{ color }}>
        {message.displayName}
      </b>
      <span className="ch-text" style={message.isAction ? { color } : undefined}>
        {message.fragments.map((fragment, index) =>
          fragment.emoteUrl !== null && settings.showEmotes ? (
            <img
              // Fragments never reorder within a message.
              key={`${String(index)}:${fragment.text}`}
              className="ch-emote"
              src={fragment.emoteUrl}
              alt={fragment.text}
              title={fragment.text}
            />
          ) : (
            <span key={`${String(index)}:${fragment.text}`}>{fragment.text}</span>
          ),
        )}
      </span>
    </li>
  );
}

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings, status } = useOverlay(overlay, renderHz);
  const chat = telemetry.stream.chat;
  const clock = useRef(new ChatClock());
  const [now, setNow] = useState(() => performance.now());
  // A message fades by when it arrived here: tick once a second.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(performance.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const demo = status === 'demo';
  const channel = demo ? demoChannel : normalizeChannel(settings.channel);
  const arrivals = clock.current.observe(chat.messages, performance.now());
  const hidden = splitList(settings.hiddenUsers);
  const words = splitList(settings.highlight);
  const shown = visibleChat(
    chat.messages,
    arrivals,
    {
      channel,
      maxMessages: settings.maxMessages,
      hideAfterSeconds: settings.hideAfter,
      hiddenUsers: hidden,
      hideCommands: settings.hideCommands,
    },
    Math.max(now, performance.now()),
  );

  const valid = isValidChannel(channel);
  const read = chat.channels.includes(channel);
  const hint = !valid
    ? 'Set the Twitch channel in the settings.'
    : !demo && shown.length === 0 && !read
      ? `Channel: ${channel}`
      : !demo && shown.length === 0 && !chat.connected
        ? 'Connecting to Twitch…'
        : null;

  const style = {
    '--an-size': `${String(settings.fontSize)}px`,
    '--an-opacity': String(settings.opacity),
    '--an-radius': `${String(settings.radius)}px`,
  } as CSSProperties;

  return (
    <div className="an ch-root" data-theme={settings.theme} style={style}>
      <div className="an-panel ch-panel" data-accent={settings.accentLine ? 'on' : 'off'}>
        {settings.showHeader && (
          <div className="ch-header">
            <TwitchMark />
            <b>{settings.title}</b>
            {valid && <span className="ch-channel">{channel}</span>}
          </div>
        )}
        <ul className="ch-list">
          {shown.map((message) => (
            <Message
              key={message.id}
              message={message}
              settings={settings}
              highlighted={words.length > 0 && hasHighlight(message.fragments.map((part) => part.text).join(''), words)}
            />
          ))}
        </ul>
        {hint !== null && <p className="ch-hint">{hint}</p>}
      </div>
    </div>
  );
}
