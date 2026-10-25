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
  },
  'The track the computer plays now, from the system media controls.',
);

/** Data of the computer Racelink runs on; the same in every game. Published at ~4 Hz. */
export const systemNode = obj(
  {
    media: nullable(mediaNode),
  },
  {
    description:
      'The computer Racelink runs on, the same in every game. `media` is null when nothing plays or sharing it is turned off.',
    games: everyGame,
    since: '2.5',
  },
);

export type SystemTelemetry = Infer<typeof systemNode>;
export type MediaTelemetry = NonNullable<SystemTelemetry['media']>;
