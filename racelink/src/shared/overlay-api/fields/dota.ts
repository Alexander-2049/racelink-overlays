import { bool, int, list, nullable, num, obj, oneOf, str, type Infer } from '../schema.js';
import { dota } from './common.js';

export const dotaTeamValues = ['radiant', 'dire'] as const;

/** Keys Racelink reports as held: the ones people hold to see something, nothing typed. */
export const dotaHoldKeyValues = [
  'alt',
  'ctrl',
  'shift',
  'space',
  'tab',
  'capslock',
  'mouse3',
  'mouse4',
  'mouse5',
] as const;
export type DotaHoldKey = (typeof dotaHoldKeyValues)[number];

/** The stage of a match, from the game's `DOTA_GAMERULES_STATE_*`. */
export const dotaGameStateValues = [
  'loading',
  'heroSelection',
  'strategy',
  'showcase',
  'preGame',
  'inProgress',
  'postGame',
  'disconnected',
  'other',
] as const;

const playerNode = obj(
  {
    name: str('Name of the local player.'),
    team: nullable(oneOf(dotaTeamValues, 'Team of the local player; null while spectating.')),
    kills: int({ description: 'Kills.', unit: 'count' }),
    deaths: int({ description: 'Deaths.', unit: 'count' }),
    assists: int({ description: 'Assists.', unit: 'count' }),
    lastHits: int({ description: 'Last hits.', unit: 'count' }),
    denies: int({ description: 'Denies.', unit: 'count' }),
    gold: int({ description: 'Gold.', unit: 'count' }),
    goldPerMinute: int({ description: 'Gold per minute.', unit: 'count' }),
    experiencePerMinute: int({ description: 'Experience per minute.', unit: 'count' }),
  },
  'The local player.',
);

const heroNode = obj(
  {
    name: str('Internal name of the hero, for example `npc_dota_hero_invoker`.'),
    id: int('Hero id.'),
    level: int({ description: 'Hero level.', unit: 'count' }),
    alive: bool('The hero is alive.'),
    respawnSeconds: num({
      description: 'Time until the hero respawns; 0 when alive.',
      unit: 'seconds',
    }),
    health: int('Health.'),
    maxHealth: int('Maximum health.'),
    mana: int('Mana.'),
    maxMana: int('Maximum mana.'),
    aghanimsScepter: bool("The hero has Aghanim's Scepter (item or blessing)."),
    aghanimsShard: bool("The hero has Aghanim's Shard."),
    talents: list(
      bool('The talent is learned.'),
      'The eight talents, from the level-10 pair to the level-25 pair, left before right.',
    ),
    silenced: bool('The hero is silenced.'),
    stunned: bool('The hero is stunned.'),
    hexed: bool('The hero is hexed.'),
    muted: bool('The hero is muted (cannot use items).'),
    disarmed: bool('The hero is disarmed.'),
  },
  'The hero of the local player.',
);

const abilityNode = obj(
  {
    slot: int('Position on the ability bar, from 0.'),
    name: str('Internal name, for example `invoker_sun_strike`.'),
    level: int({ description: 'Ability level; 0 when not learned.', unit: 'count' }),
    canCast: bool('The ability can be used now.'),
    passive: bool('The ability is passive.'),
    active: bool('The ability is not disabled.'),
    ultimate: bool('The ability is the ultimate.'),
    cooldownSeconds: num({ description: 'Cooldown left as the game reports it.', unit: 'seconds' }),
  },
  'An ability on the bar.',
);

const itemNode = obj(
  {
    slot: str('Slot as the game names it: `slot0`…`slot8`, `stash0`…, `teleport0`, `neutral0`.'),
    name: str('Internal name, for example `item_octarine_core`.'),
    charges: nullable(int({ description: 'Charges; null when the item has none.', unit: 'count' })),
    canCast: nullable(bool('The item can be used now; null for items without an active.')),
    cooldownSeconds: nullable(
      num({ description: 'Cooldown left as the game reports it.', unit: 'seconds' }),
    ),
  },
  'An item of the hero.',
);

const invokerSpellNode = obj(
  {
    name: str('Internal name, for example `invoker_chaos_meteor`.'),
    cooldownSeconds: num({
      description:
        'Cooldown left, 0 when ready. Counted from the moment the spell was cast, also while it is not invoked, and frozen while the game is paused.',
      unit: 'seconds',
    }),
    cooldownTotalSeconds: num({
      description:
        'Full length of the running cooldown, or of the next one when the spell is ready (talents and cooldown reduction included).',
      unit: 'seconds',
    }),
    manaCost: int({ description: 'Mana the spell costs.', unit: 'count' }),
    slot: nullable(
      int('Invoked slot: 0 is the first (D), 1 the second (F); null when not invoked.'),
    ),
    castCount: int({ description: 'Times the spell was cast in this match.', unit: 'count' }),
  },
  'One of the ten spells Invoker can invoke.',
);

const invokerNode = obj(
  {
    cooldownReductionFraction: num({
      description: 'Cooldown reduction from items, 0..1 (0.25 with Octarine Core).',
      unit: 'ratio',
      range: [0, 1],
    }),
    invokeCooldownSeconds: num({ description: 'Cooldown left of Invoke itself.', unit: 'seconds' }),
    spells: list(invokerSpellNode, 'The ten spells, in the order Quas, Wex and Exort combine.'),
  },
  'Calculated cooldowns of the invoked spells; null for other heroes.',
);

/**
 * Dota 2 as its Game State Integration reports it on this computer: nothing
 * comes from outside services. Published at ~20 Hz.
 */
export const dotaNode = nullable(
  obj(
    {
      clockSeconds: num({
        description: 'Game clock: negative before the horn. Whole seconds, as the game sends it.',
        unit: 'seconds',
      }),
      gameTimeSeconds: num({ description: 'Time since the match loaded.', unit: 'seconds' }),
      paused: bool('The game is paused.'),
      state: oneOf(dotaGameStateValues, 'Stage of the match.'),
      matchId: nullable(str('Match id; null outside a match.')),
      daytime: bool('It is day in the game.'),
      radiantScore: int({ description: 'Kills of the Radiant.', unit: 'count' }),
      direScore: int({ description: 'Kills of the Dire.', unit: 'count' }),
      player: nullable(playerNode),
      hero: nullable(heroNode),
      abilities: list(abilityNode, 'Abilities on the bar of the hero.'),
      items: list(itemNode, 'Items of the hero: inventory, backpack, stash, teleport and neutral.'),
      heldKeys: list(
        oneOf(dotaHoldKeyValues, 'A held key.'),
        'Keys held now, read by Racelink (not the game) and only while Dota is the program in front; empty on Linux.',
      ),
      invoker: nullable(invokerNode),
    },
    {
      description:
        'Dota 2, from its Game State Integration on this computer; null in other games and outside a match.',
      games: dota,
      since: '2.5',
    },
  ),
);

export type DotaTelemetry = Infer<typeof dotaNode>;
export type DotaInvokerSpell = NonNullable<NonNullable<DotaTelemetry>['invoker']>['spells'][number];
