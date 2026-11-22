// node --experimental-strip-types --test (npm test at the repository root)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  anonymousJoinCommands,
  ChatClock,
  chatMessageOf,
  defaultChatOptions,
  hasHighlight,
  isValidChannel,
  normalizeChannel,
  parseIrcLine,
  visibleChat,
} from './chatModel.ts';

const message = (id: string, user: string, text: string, channel = 'racelink') => ({
  id,
  channel,
  user,
  displayName: user,
  color: null,
  badges: [],
  fragments: [{ text, emoteUrl: null }],
  isAction: false,
  sentAt: 0,
});

test('channel names', () => {
  assert.equal(normalizeChannel('  #RaceLink '), 'racelink');
  assert.equal(isValidChannel('racelink'), true);
  assert.equal(isValidChannel('a b'), false);
  assert.equal(isValidChannel('abc'), false);
});

test('an IRC line with tags, prefix, command and trailing text', () => {
  const line = parseIrcLine(
    '@badges=moderator/1,subscriber/12;color=#1E90FF;display-name=Some\\sOne;emotes=25:0-4,6-10;id=abc;tmi-sent-ts=1700000000000 :someone!someone@someone.tmi.twitch.tv PRIVMSG #racelink :Kappa Kappa hi\r\n',
  );
  assert.ok(line);
  assert.equal(line.command, 'PRIVMSG');
  assert.equal(line.tags['display-name'], 'Some One');
  assert.deepEqual(line.params, ['#racelink']);
  assert.equal(line.trailing, 'Kappa Kappa hi');
  const chat = chatMessageOf(line, 5);
  assert.ok(chat);
  assert.equal(chat.user, 'someone');
  assert.equal(chat.channel, 'racelink');
  assert.deepEqual(chat.badges, ['moderator', 'subscriber']);
  assert.equal(chat.color, '#1E90FF');
  assert.deepEqual(chat.emotes, [
    { id: '25', start: 0, end: 4 },
    { id: '25', start: 6, end: 10 },
  ]);
  assert.equal(chat.sentAt, 1700000000000);
});

test('PING, an action, and lines that are not messages', () => {
  const ping = parseIrcLine('PING :tmi.twitch.tv');
  assert.equal(ping?.command, 'PING');
  assert.equal(ping?.trailing, 'tmi.twitch.tv');
  assert.equal(chatMessageOf(ping ?? { tags: {}, prefix: '', command: '', params: [], trailing: '' }, 0), null);
  const action = parseIrcLine(':a!a@a.tmi.twitch.tv PRIVMSG #racelink :\u0001ACTION waves\u0001');
  const parsed = action ? chatMessageOf(action, 0) : null;
  assert.equal(parsed?.isAction, true);
  assert.equal(parsed?.text, 'waves');
  assert.equal(parseIrcLine(''), null);
  assert.equal(parseIrcLine('@only=tags'), null);
});

test('hostile input is bounded and cleaned', () => {
  const long = 'x'.repeat(2000);
  const line = parseIrcLine(`@color=red;emotes=1:5-2/x:y/9:1-3 :n!n@n PRIVMSG #racelink :${long}`);
  const chat = line ? chatMessageOf(line, 0) : null;
  assert.equal(chat?.text.length, 500);
  assert.equal(chat?.color, null);
  assert.deepEqual(chat?.emotes, [{ id: '9', start: 1, end: 3 }]);
  assert.equal(parseIrcLine('x'.repeat(9000)), null);
  const bad = parseIrcLine(':n!n@n PRIVMSG #bad channel! :hi');
  assert.equal(bad ? chatMessageOf(bad, 0) : 'none', null);
});

test('anonymous join sends no account', () => {
  const commands = anonymousJoinCommands('#RaceLink', 'justinfan4242');
  assert.ok(commands.includes('NICK justinfan4242'));
  assert.ok(commands.includes('JOIN #racelink'));
  assert.ok(commands.every((command) => !/oauth/i.test(command)));
});

test('visible chat: channel, hidden users, commands, fade and count', () => {
  const clock = new ChatClock();
  const messages = [
    message('1', 'a', 'first'),
    message('2', 'nightbot', 'buy followers'),
    message('3', 'b', '!lurk'),
    message('4', 'c', 'other channel', 'else'),
    message('5', 'd', 'late'),
  ];
  const arrivals = clock.observe(messages.slice(0, 4), 1000);
  const withLate = clock.observe(messages, 9000);
  assert.equal(withLate, arrivals);
  const options = {
    ...defaultChatOptions,
    channel: '#RaceLink',
    hiddenUsers: ['NightBot'],
    hideCommands: true,
    hideAfterSeconds: 5,
  };
  assert.deepEqual(
    visibleChat(messages, withLate, options, 9000).map((m) => m.id),
    ['5'],
  );
  assert.deepEqual(
    visibleChat(messages, withLate, { ...options, hideAfterSeconds: 0 }, 9000).map((m) => m.id),
    ['1', '5'],
  );
  assert.deepEqual(
    visibleChat(messages, withLate, { ...options, hideAfterSeconds: 0, maxMessages: 1 }, 9000).map(
      (m) => m.id,
    ),
    ['5'],
  );
  assert.deepEqual(visibleChat(messages, withLate, { ...options, channel: '' }, 9000), []);
});

test('the clock forgets gone messages and counts a window', () => {
  const clock = new ChatClock();
  clock.observe([{ id: 'a' }, { id: 'b' }], 0);
  clock.observe([{ id: 'b' }, { id: 'c' }], 50_000);
  assert.equal(clock.countSince(59_000, 60_000), 2);
  assert.equal(clock.countSince(100_000, 60_000), 1);
});

test('highlight words match whole words only', () => {
  assert.equal(hasHighlight('Great PIT stop!', ['pit']), true);
  assert.equal(hasHighlight('spitting', ['pit']), false);
  assert.equal(hasHighlight('hello', []), false);
  assert.equal(hasHighlight('hello', ['  ']), false);
});
