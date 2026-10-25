import { bool, int, list, nullable, num, obj, str, type Infer } from '../schema.js';
import { everyGame } from './common.js';

const fragmentNode = obj(
  {
    text: str('The text of this part; the emote name for an emote.'),
    emoteUrl: nullable(
      str('Image of a Twitch emote (`https://static-cdn.jtvnw.net/…`); null for text.'),
    ),
  },
  'One part of a message: text, or a Twitch emote.',
);

const chatMessageNode = obj(
  {
    id: str('Unique id of the message.'),
    channel: str('Twitch channel the message was sent to: lowercase, without `#`.'),
    user: str('Login name of the sender, lowercase.'),
    displayName: str('Name of the sender as Twitch shows it.'),
    color: nullable(
      str({ description: "Colour of the sender's name; null when unset.", unit: 'color' }),
    ),
    badges: list(
      str('A badge: `broadcaster`, `moderator`, `vip`, `subscriber`, `partner`, …'),
      'Badges of the sender in this channel.',
    ),
    fragments: list(fragmentNode, 'The message as text and emotes, in order.'),
    isAction: bool('Sent with `/me`: shown in the colour of the name.'),
    sentAt: num({ description: 'When Twitch received the message.', unit: 'unix-ms' }),
  },
  'A chat message.',
);

/** Stream data of the streamer; the same in every game. Published at ~4 Hz. */
export const streamNode = obj(
  {
    chat: obj(
      {
        channels: list(
          str('A Twitch channel, lowercase.'),
          'Twitch channels whose chat Racelink reads: those named by chat overlays.',
        ),
        connected: bool('Racelink is connected to the Twitch chat.'),
        rooms: list(
          obj(
            {
              channel: str('The Twitch channel, lowercase.'),
              slowSeconds: int({
                description: 'Slow mode: seconds between two messages of a viewer; 0 when off.',
                unit: 'seconds',
              }),
              followersOnlyMinutes: nullable(
                int({
                  description:
                    'Followers-only mode: minutes a viewer must have followed (0: any follower); null when off.',
                  unit: 'count',
                }),
              ),
              subscribersOnly: bool('Only subscribers can write.'),
              emoteOnly: bool('Only emotes can be written.'),
            },
            'The chat modes of a channel.',
          ),
          'The chat modes of each channel read.',
        ),
        messages: list(
          chatMessageNode,
          'The latest chat messages of every channel, oldest first; at most 50.',
        ),
      },
      'Twitch chat, read anonymously: Racelink can read but not write.',
    ),
  },
  {
    description:
      'The stream around the race, the same in every game: Twitch chat of the channels chat overlays name.',
    games: everyGame,
    since: '2.6',
  },
);

export type StreamTelemetry = Infer<typeof streamNode>;
export type ChatMessage = StreamTelemetry['chat']['messages'][number];
