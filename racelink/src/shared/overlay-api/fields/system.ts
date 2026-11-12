import { nullable, num, obj, oneOf, str, type Infer } from '../schema.js';
import { everyGame } from './common.js';

export const mediaStatusValues = ['playing', 'paused', 'stopped'] as const;
export type MediaStatus = (typeof mediaStatusValues)[number];

const mediaNode = obj(
  {
    status: oneOf(mediaStatusValues, 'Whether the player plays, is paused or stopped.'),
    title: str('Title of the track.'),
    artist: nullable(str('Artist of the track; null when the player does not say.')),
    album: nullable(str('Album of the track; null when the player does not say.')),
    albumArtist: nullable(str('Artist of the album; null when the player does not say.')),
    durationSeconds: nullable(num({ description: 'Length of the track.', unit: 'seconds' })),
    positionSeconds: nullable(
      num({ description: 'How far the track has played.', unit: 'seconds' }),
    ),
    sourceApp: nullable(str('The application that plays, as the system names it.')),
    trackKey: str('Changes when another track starts; the same while one track plays.'),
    artworkUrl: nullable(
      str({
        description:
          'Picture of the track (album art) as the player shows it: a URL for `<img>`, served by Racelink with open CORS, so a canvas may read its colours. Changes with the picture; null when the player gives none.',
        since: '2.7',
      }),
    ),
  },
  'The track the computer plays now, from the system media controls. A session that plays wins over the one the system shows; the track that played last stays while the player shows something that does not play (another browser tab on pause while the next track loads), playing for 3 s, then paused, until another track plays.',
);

/** Data of the computer Racelink runs on; the same in every game. Published at ~4 Hz. */
export const systemNode = obj(
  {
    media: nullable(mediaNode),
  },
  {
    description:
      'The computer Racelink runs on, the same in every game. `media` is null when nothing plays, sharing it is turned off, or the user has not allowed a community overlay to see it (`permissions.media` in the manifest; Overlay API 2.13, `permissions.system` in 2.11 and 2.12). Every field of this topic comes with a permission of its own.',
    games: everyGame,
    since: '2.5',
  },
);

export type SystemTelemetry = Infer<typeof systemNode>;
export type MediaTelemetry = NonNullable<SystemTelemetry['media']>;
