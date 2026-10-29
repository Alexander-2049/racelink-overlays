import type { Settings } from '../racelink-settings';

/**
 * The mascot is the layered visual novel sprite by Sutemo
 * (sutemo.itch.io/female-character): every layer was exported on one crop,
 * so they stack in place. Back to front: hair behind, body, outfit, hair in
 * front, face, accessories.
 */
const layers = import.meta.glob<string>('../assets/girl/**/*.webp', {
  eager: true,
  import: 'default',
});

const url = (path: string): string => layers[`../assets/girl/${path}.webp`] ?? '';

export type Face =
  | 'smile'
  | 'smile2'
  | 'delighted'
  | 'laugh'
  | 'shocked'
  | 'sad'
  | 'annoyed'
  | 'angry'
  | 'smug';

export const faces: readonly Face[] = [
  'smile',
  'smile2',
  'delighted',
  'laugh',
  'shocked',
  'sad',
  'annoyed',
  'angry',
  'smug',
];

export const faceUrl = (face: Face): string => url(`face/${face}`);

type Hair = Settings['mascotHair'];
type HairColor = Settings['mascotHairColor'];
type Outfit = Settings['mascotOutfit'];
type Glasses = Settings['mascotGlasses'];

export type Look = Readonly<{
  hair: Hair;
  hairColor: HairColor;
  outfit: Outfit;
  glasses: Glasses;
  flower: boolean;
  choker: boolean;
}>;

/** The ready-made girls of the "Who" list. */
const presets: Readonly<Record<Exclude<Settings['mascot'], 'CUSTOM'>, Look>> = {
  HANA: { hair: 'TWIN', hairColor: 'PINK', outfit: 'HOODIE', glasses: 'NONE', flower: true, choker: false },
  YUKI: { hair: 'BOB', hairColor: 'SILVER', outfit: 'WINTER', glasses: 'NONE', flower: false, choker: true },
  RIN: { hair: 'HIME', hairColor: 'DARK', outfit: 'SEIFUKU1', glasses: 'NONE', flower: false, choker: false },
  MIO: { hair: 'LONG', hairColor: 'BLONDE', outfit: 'PE', glasses: 'RED', flower: false, choker: false },
  AKANE: { hair: 'SHORT', hairColor: 'BROWN', outfit: 'DRESS', glasses: 'NONE', flower: false, choker: false },
};

export const lookOf = (settings: Settings): Look =>
  settings.mascot === 'CUSTOM'
    ? {
        hair: settings.mascotHair,
        hairColor: settings.mascotHairColor,
        outfit: settings.mascotOutfit,
        glasses: settings.mascotGlasses,
        flower: settings.mascotFlower,
        choker: settings.mascotChoker,
      }
    : presets[settings.mascot];

/** Hair styles share layers: hime cut has the long hair behind, short hair the twin tails' fringe. */
const hairBack: Readonly<Record<Hair, string>> = {
  TWIN: 'twin',
  SHORT: 'short',
  BOB: 'bob',
  LONG: 'long',
  HIME: 'long',
};
const hairFront: Readonly<Record<Hair, string>> = {
  TWIN: 'twin',
  SHORT: 'twin',
  BOB: 'bob',
  LONG: 'long',
  HIME: 'hime',
};
const glassesLayer: Readonly<Record<Exclude<Glasses, 'NONE'>, string>> = {
  RED: 'glasses-red',
  BLACK: 'glasses-black',
  ROUND: 'glasses-round',
};

/** The layers under the face and over it. */
export const layersOf = (look: Look): Readonly<{ below: string[]; above: string[]; body: string }> => {
  const color = look.hairColor.toLowerCase();
  const above: string[] = [];
  if (look.glasses !== 'NONE') above.push(url(`accessory/${glassesLayer[look.glasses]}`));
  if (look.flower) above.push(url('accessory/flower'));
  if (look.choker) above.push(url('accessory/choker'));
  return {
    below: [
      url(`hair-back/${hairBack[look.hair]}-${color}`),
      url('body'),
      url(`outfit/${look.outfit.toLowerCase()}`),
      url(`hair-front/${hairFront[look.hair]}-${color}`),
    ],
    above,
    body: url('body'),
  };
};

/** Width / height of the sprite. */
export const girlAspect = 482 / 560;
