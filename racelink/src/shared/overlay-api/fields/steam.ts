import { list, nullable, num, obj, oneOf, str, type Infer } from '../schema.js';
import { everyGame } from './common.js';

export const steamChatAccessValues = ['granted', 'denied', 'unavailable'] as const;
export type SteamChatAccess = (typeof steamChatAccessValues)[number];

/** At most this many messages are kept, oldest dropped first. */
export const steamChatMessageLimit = 20;

const steamMessageNode = obj(
  {
    id: str('Unique id of the message, the same in every frame.'),
    steamId: str('SteamID64 of the friend who wrote, as a decimal string.'),
    name: str('Name of the friend as Steam shows it.'),
    avatarUrl: nullable(
      str(
        'Avatar of the friend (64×64): a URL for `<img>`, served by Racelink; null while Steam has not loaded it.',
      ),
    ),
    text: str('Text of the message, without control characters; at most 1000 characters.'),
    receivedAt: num({ description: 'When Racelink received the message.', unit: 'unix-ms' }),
  },
  'An incoming Steam message from a friend.',
);

/** Steam data of the user; the same in every game. Published at ~4 Hz. */
export const steamNode = obj(
  {
    chat: obj(
      {
        access: oneOf(
          steamChatAccessValues,
          '`granted`: messages arrive. `denied`: the user has not allowed this overlay to read Steam messages. `unavailable`: Steam is not running or Racelink cannot read messages now.',
        ),
        messages: list(
          steamMessageNode,
          `Incoming messages from friends since the overlay was allowed and Steam was running, oldest first; at most ${String(steamChatMessageLimit)}. Racelink keeps them in memory only. Empty unless \`access\` is \`granted\`.`,
        ),
      },
      'Private messages friends write to the user in Steam. Only private messages from friends: no group chats.',
    ),
  },
  {
    description:
      'Steam around the race, the same in every game. A community overlay gets the messages only after the user allows it (`permissions.steamMessages` in the manifest).',
    games: everyGame,
    since: '2.11',
  },
);

export type SteamTelemetry = Infer<typeof steamNode>;
export type SteamChatMessage = SteamTelemetry['chat']['messages'][number];
