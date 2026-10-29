# Anime Relatives

The relative board (the cars around you on track, with gaps) in anime style:
overtakes explode, the board shakes, close battles burn, and a mascot girl
reacts to your race.

```bash
npm install
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
npm run validate  # runs the same checks Racelink runs before publishing
```

Open `http://localhost:5173/?demo=iracing`: in demo mode the board plays its
effects in turn (overtake, overtaken, battle, best lap) every few seconds.

## What happens when

| Moment | Detected by | Board | Mascot |
| --- | --- | --- | --- |
| You overtake a car | the car changes from ahead to behind you within 40 m of you, out of the pits | starburst, sparks and sound effect at its row, shake, flash | delighted, laughs and hops |
| A car overtakes you | the car changes from behind to ahead of you | blue-violet explosion, hard shake, red flash | shocked (gloom, sweat), then sad or annoyed |
| Lapped traffic | the same, a lap apart | a smaller bang | stays calm |
| Close battle | a car on your lap within *Battle gap* for 2 s | the row burns; "ゴゴゴ" rises (once in 25 s per car) | shouts and cheers |
| Your best lap | your best lap time drops | gold starburst, "BEST LAP!" | dances |
| Chequered flag | your car gets the chequered flag in a race | confetti, "FINISH!" | dances until the session ends |

A car beside you (within 3 m) keeps the side it was on, and the same car makes
no new overtake for 3.5 s, so cars side by side do not flicker. *Only in races*
turns the effects off in practice and qualifying.

The mascot is one of five girls, or *My own* (hair, colour, outfit, glasses,
flower, choker). She stands beside the board (*Always*) or pops up from the corner only
for a moment (*Only when something happens*). She never takes more than 40 %
of the window's width; a narrow board hides the extra columns first.

## Code

- `src/App.tsx` — the board, its effects and the mascot's reactions.
- `src/events.ts` — overtakes, battles, best laps and the finish from telemetry.
- `src/relative.ts` — the rows around the reference car.
- `src/Fx.tsx`, `src/Petals.tsx` — explosions, confetti, menacing letters, petals.
- `src/mascot/` — the mascot: her layers, the ready-made girls (`looks.ts`), faces per mood (`Mascot.tsx`).
- `src/assets/girl/` — the layers of the sprite, exported from the PSD on one crop: hair behind and in front (5 styles × 5 colours), body, 7 outfits, 9 faces, glasses, flower, choker.
- `src/phrases.ts` — what the board and the mascot say. Japanese glyphs come
  from a font subset: after changing a Japanese phrase run
  `python scripts/subset-font.py <DelaGothicOne-Regular.ttf>`.

## Artwork and fonts

| Asset | Author | Licence |
| --- | --- | --- |
| Mascot (`src/assets/girl/`) | sutemo, [Female Character Sprite for Visual Novel](https://sutemo.itch.io/female-character) | free for personal and commercial projects, no credit required; not to be resold on its own |
| Bangers (`src/fonts/bangers.woff2`) | The Bangers Project Authors | SIL OFL 1.1 |
| Dela Gothic One, subset (`src/fonts/dela-gothic-one-subset.woff2`) | The Dela Gothic Project Authors | SIL OFL 1.1 |

The layers are the PSD's own, unchanged: Hana, Yuki, Rin, Mio and Akane are
combinations of them, and *My own* lets the user combine them.
