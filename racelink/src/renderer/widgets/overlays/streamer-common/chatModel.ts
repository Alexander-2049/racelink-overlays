// Twitch chat for an overlay. Racelink reads the chat itself (anonymously, no
// keys) and publishes it as the `stream` topic, so an overlay only filters and
// times what it gets: `visibleChat`. `parseIrcLine` is for an overlay that
// talks to the chat server itself: it reads one IRC line with its tags.
// Everything from the chat is untrusted text.
import type { ChatMessage } from '../../../../shared/overlay-api/fields/stream';

export type ChatOptions = Readonly<{
  /** The channel: any case, with or without `#`. */
  channel: string;
  /** Messages shown at most. */
  maxMessages: number;
  /** Hide a message this many seconds after it arrived here; 0 keeps them. */
  hideAfterSeconds: number;
  /** Logins whose messages are left out (bots). */
  hiddenUsers: readonly string[];
  /** Hide commands: messages starting with `!`. */
  hideCommands: boolean;
}>;

export const defaultChatOptions: ChatOptions = {
  channel: '',
  maxMessages: 50,
  hideAfterSeconds: 0,
  hiddenUsers: [],
  hideCommands: false,
};

/** The channel a setting names: lowercase, without `#` or spaces. */
export const normalizeChannel = (value: string): string =>
  value.trim().replace(/^#/, '').toLowerCase();

/** Twitch logins are 4-25 letters, digits and underscores. */
export const isValidChannel = (value: string): boolean => /^[a-z0-9_]{4,25}$/.test(value);

/** The plain text of a message. */
export const messageText = (message: Pick<ChatMessage, 'fragments'>): string =>
  message.fragments.map((fragment) => fragment.text).join('');

/**
 * When each message first arrived here: a message fades by this clock, not by
 * the time Twitch stamped it (demo and recorded messages carry other times).
 */
export class ChatClock {
  private readonly seen = new Map<string, number>();

  /** Records new messages, forgets gone ones, returns the arrival times. */
  observe(messages: readonly Pick<ChatMessage, 'id'>[], nowMs: number): ReadonlyMap<string, number> {
    const present = new Set<string>();
    for (const message of messages) {
      present.add(message.id);
      if (!this.seen.has(message.id)) this.seen.set(message.id, nowMs);
    }
    for (const id of [...this.seen.keys()]) if (!present.has(id)) this.seen.delete(id);
    return this.seen;
  }

  /** Messages that arrived in the last `windowMs`. */
  countSince(nowMs: number, windowMs: number): number {
    let count = 0;
    for (const at of this.seen.values()) if (nowMs - at < windowMs) count += 1;
    return count;
  }
}

/**
 * The messages to draw, oldest first: this channel's, without hidden users,
 * not yet faded, the last `maxMessages`.
 */
export const visibleChat = (
  messages: readonly ChatMessage[],
  arrivals: ReadonlyMap<string, number>,
  options: ChatOptions,
  nowMs: number,
): ChatMessage[] => {
  const channel = normalizeChannel(options.channel);
  if (channel === '') return [];
  const hidden = new Set(options.hiddenUsers.map((user) => user.trim().toLowerCase()));
  const hideAfterMs = Math.max(0, options.hideAfterSeconds) * 1000;
  return messages
    .filter((message) => {
      if (message.channel !== channel) return false;
      if (hidden.has(message.user)) return false;
      if (options.hideCommands && messageText(message).trimStart().startsWith('!')) return false;
      const arrived = arrivals.get(message.id) ?? nowMs;
      return hideAfterMs === 0 || nowMs - arrived < hideAfterMs;
    })
    .slice(-Math.max(1, Math.floor(options.maxMessages)));
};

/** Does the text contain one of the words (whole words, any case)? */
export const hasHighlight = (text: string, words: readonly string[]): boolean => {
  const lower = text.toLowerCase();
  return words.some((word) => {
    const needle = word.trim().toLowerCase();
    if (needle === '') return false;
    let from = 0;
    for (;;) {
      const at = lower.indexOf(needle, from);
      if (at === -1) return false;
      const before = lower.charAt(at - 1);
      const after = lower.charAt(at + needle.length);
      if (!/[\p{L}\p{N}_]/u.test(before) && !/[\p{L}\p{N}_]/u.test(after)) return true;
      from = at + 1;
    }
  });
};

export type IrcLine = Readonly<{
  tags: Readonly<Record<string, string>>;
  /** `nick!nick@nick.tmi.twitch.tv` or the server name; empty when absent. */
  prefix: string;
  command: string;
  params: readonly string[];
  /** The text after the last ` :`. */
  trailing: string;
}>;

const unescapeTag = (value: string): string =>
  value.replace(/\\(.)/g, (_, char: string) =>
    char === 's' ? ' ' : char === 'n' ? '\n' : char === 'r' ? '\r' : char === ':' ? ';' : char,
  );

/** One IRCv3 line (tags, prefix, command, parameters); null for an empty or broken line. */
export const parseIrcLine = (raw: string): IrcLine | null => {
  let rest = raw.replace(/[\r\n]+$/, '');
  if (rest === '' || rest.length > 8192) return null;
  const tags: Record<string, string> = {};
  if (rest.startsWith('@')) {
    const end = rest.indexOf(' ');
    if (end === -1) return null;
    for (const pair of rest.slice(1, end).split(';')) {
      const eq = pair.indexOf('=');
      const key = eq === -1 ? pair : pair.slice(0, eq);
      if (key !== '') tags[key] = eq === -1 ? '' : unescapeTag(pair.slice(eq + 1));
    }
    rest = rest.slice(end + 1).trimStart();
  }
  let prefix = '';
  if (rest.startsWith(':')) {
    const end = rest.indexOf(' ');
    if (end === -1) return null;
    prefix = rest.slice(1, end);
    rest = rest.slice(end + 1).trimStart();
  }
  let trailing = '';
  const trailingAt = rest.indexOf(' :');
  if (trailingAt !== -1) {
    trailing = rest.slice(trailingAt + 2);
    rest = rest.slice(0, trailingAt);
  }
  const parts = rest.split(' ').filter((part) => part !== '');
  const command = parts.shift();
  if (command === undefined) return null;
  return { tags, prefix, command, params: parts, trailing };
};

export type ParsedChatMessage = Readonly<{
  id: string;
  channel: string;
  user: string;
  displayName: string;
  color: string | null;
  badges: readonly string[];
  text: string;
  isAction: boolean;
  /** Emote id with its character ranges in `text`. */
  emotes: readonly Readonly<{ id: string; start: number; end: number }>[];
  sentAt: number;
}>;

const maxTextChars = 500;

/** A chat message from a `PRIVMSG` line; null for any other line. */
export const chatMessageOf = (line: IrcLine, nowMs: number): ParsedChatMessage | null => {
  if (line.command !== 'PRIVMSG') return null;
  const channel = normalizeChannel(line.params[0] ?? '');
  const nick = line.prefix.split('!')[0] ?? '';
  if (!isValidChannel(channel) || nick === '') return null;
  let text = line.trailing;
  const isAction = text.startsWith('\u0001ACTION ') && text.endsWith('\u0001');
  if (isAction) text = text.slice(8, -1);
  text = text.slice(0, maxTextChars);
  const color = line.tags.color ?? '';
  const emotes: { id: string; start: number; end: number }[] = [];
  for (const entry of (line.tags.emotes ?? '').split('/')) {
    const [id, ranges] = entry.split(':');
    if (id === undefined || id === '' || ranges === undefined) continue;
    for (const range of ranges.split(',')) {
      const [from, to] = range.split('-').map(Number);
      if (from !== undefined && to !== undefined && Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to >= from)
        emotes.push({ id, start: from, end: to });
    }
  }
  const sent = Number(line.tags['tmi-sent-ts']);
  return {
    id: line.tags.id ?? `${nick}-${String(nowMs)}`,
    channel,
    user: nick.toLowerCase(),
    displayName: (line.tags['display-name'] ?? nick).slice(0, 40),
    color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : null,
    badges: (line.tags.badges ?? '')
      .split(',')
      .map((badge) => badge.split('/')[0] ?? '')
      .filter((badge) => badge !== ''),
    text,
    isAction,
    emotes: emotes.sort((a, b) => a.start - b.start),
    sentAt: Number.isFinite(sent) && sent > 0 ? sent : nowMs,
  };
};

/**
 * What a direct chat client sends to join anonymously: no account, it can only
 * read. `nick` must be `justinfan` plus digits.
 */
export const anonymousJoinCommands = (channel: string, nick = 'justinfan12345'): string[] => [
  'CAP REQ :twitch.tv/tags twitch.tv/commands',
  'PASS SCHMOOPIIE',
  `NICK ${nick}`,
  `JOIN #${normalizeChannel(channel)}`,
];
