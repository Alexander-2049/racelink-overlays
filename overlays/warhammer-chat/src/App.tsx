import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { RacelinkOverlay } from '@racelink/overlay';
import {
  ChatClock,
  hasHighlight,
  messageText,
  normalizeChannel,
  visibleChat,
} from '../../../racelink/src/renderer/widgets/overlays/streamer-common/index.ts';
import { safeColor } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/format.ts';
import { IconBadge } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Icons';
import { Root } from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/Root';
import {
  useNow,
  useOverlay,
} from '../../../racelink/src/renderer/widgets/overlays/warhammer-common/useOverlay';
import type { Settings } from './racelink-settings';

const renderHz = 4;

/** The channel the demo chat talks on. */
const demoChannel = 'racelink';

/** Badges drawn, in this order; any other badge is left out. */
const badgeKinds = ['broadcaster', 'moderator', 'vip', 'founder', 'subscriber'] as const;

const words = (value: string): string[] =>
  value
    .split(/[,\s]+/)
    .map((word) => word.trim())
    .filter((word) => word !== '');

export default function App({ overlay }: Readonly<{ overlay: RacelinkOverlay<Settings> }>) {
  const { telemetry, settings, status, editMode } = useOverlay(overlay, renderHz);
  const now = useNow(1000);
  const clock = useRef(new ChatClock());
  const list = useRef<HTMLOListElement>(null);

  const { chat } = telemetry.stream;
  const channel = status === 'demo' ? demoChannel : normalizeChannel(settings.channel);
  const arrivals = clock.current.observe(chat.messages, performance.now());
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
    performance.now(),
  );
  const highlight = words(settings.highlightWords);
  const atTop = settings.align === 'top';
  const ordered = atTop ? [...shown].reverse() : shown;

  // Only whole messages: one the window would cut is hidden, never shown in part.
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const fit = (): void => {
      const box = element.getBoundingClientRect();
      for (const item of element.children) {
        if (!(item instanceof HTMLElement)) continue;
        const rect = item.getBoundingClientRect();
        const whole = rect.top >= box.top - 0.5 && rect.bottom <= box.bottom + 0.5;
        item.style.visibility = whole ? '' : 'hidden';
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  });
  void now;

  const unread = status !== 'demo' && channel !== '' && !chat.channels.includes(channel);
  const hint =
    channel === ''
      ? 'Set the Twitch channel in the settings.'
      : unread
        ? `Racelink reads ${channel}'s chat only while a built-in Twitch Chat overlay with this channel is in a layout.`
        : null;

  if (ordered.length === 0 && !(editMode && hint !== null)) return null;

  return (
    <Root theme={settings.theme} opacity={settings.opacity} fontSize={settings.fontSize} className="wh-chat">
      <ol
        ref={list}
        className={atTop ? 'wh-messages wh-messages--top' : 'wh-messages'}
        aria-live="polite"
      >
        {ordered.length === 0 && hint !== null && <li className="wh-message wh-dim">{hint}</li>}
        {ordered.map((message) => {
          const color = safeColor(message.color, '');
          const style = color === '' ? undefined : ({ '--wh-name': color } as CSSProperties);
          const lit = highlight.length > 0 && hasHighlight(messageText(message), highlight);
          return (
            <li
              key={message.id}
              className={[
                'wh-message',
                lit ? 'wh-message--lit' : '',
                message.isAction ? 'wh-message--action' : '',
                settings.boldText ? 'wh-message--bold' : '',
              ].join(' ')}
              style={style}
            >
              {settings.showBadges &&
                badgeKinds
                  .filter((kind) => message.badges.includes(kind))
                  .map((kind) => (
                    <span key={kind} className={`wh-badge wh-badge--${kind}`} title={kind}>
                      <IconBadge kind={kind} />
                    </span>
                  ))}
              <b className="wh-user">{message.displayName}</b>{' '}
              <span className="wh-text">
                {message.fragments.map((fragment, index) =>
                  fragment.emoteUrl !== null && settings.showEmotes ? (
                    <img
                      key={`${String(index)}:${fragment.text}`}
                      className="wh-emote"
                      src={fragment.emoteUrl}
                      alt={fragment.text}
                    />
                  ) : (
                    <span key={`${String(index)}:${fragment.text}`}>{fragment.text}</span>
                  ),
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </Root>
  );
}
