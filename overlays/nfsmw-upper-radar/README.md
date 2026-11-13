# NFSMW-Upper Radar

The radar detector under the mirror from NFS:MW 2005, as a Racelink overlay:
it warns of trouble on the track ahead (`session.hazardAhead`: a car stopped,
crawling, going backwards or stranded off the track, within 1000 m).

## What it shows

- **Pulses, as in the game.** Every pulse the bar goes dark for a frame and
  fills again from the dome outwards in 100 ms, then stays full. It pulses
  from the moment the trouble shows; the distance sets only how often: every
  130 ms at the trouble, 600 ms at the near edge (`nearMeters`, 250 m), 1.4 s
  at the far edge (`farMeters`, 600 m), 2.4 s at the edge of the range
  (1000 m).
- **The arrow** in the dome points to the trouble (`bearingDegrees`: iRacing
  and Le Mans Ultimate; elsewhere the arrow points ahead). `showArrow` turns
  it off.
- **Both sides burn the same.** With `highlightSide` (off by default) the
  lights on the side of the trouble burn brighter (`direction`: iRacing and
  Le Mans Ultimate).
- **Only trouble in front.** Trouble further along the lap that lies behind
  the car (more than 90° from straight ahead) is left out.

## Sound

The game's own radar beep (`FX_Radar`) plays at the start of every pulse.

| Setting       | Default | What it does                                                          |
| ------------- | ------- | --------------------------------------------------------------------- |
| `sound`       | on      | The beep                                                              |
| `soundInDemo` | off     | The beep in demo mode too                                             |
| `volume`      | 70 %    | Loudness of the beep (Racelink has no volume of its own for overlays) |

Where it may sound is the SDK's `overlay.soundAllowed`: over the game, on a
stream page (OBS) and in a browser (`npm run dev`, `?demo=iracing`), but never
inside Racelink's window (previews, "Add overlay", Studio, the clip player) nor
while the layout is edited.

## Develop

```bash
npm install
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
npm run validate  # runs the same checks Racelink runs before publishing
```

The code is in `racelink/src/renderer/widgets/overlays/nfsmw-upper-radar/` at
the repository root: `radar.ts` (the pulses, tested by `npm test`), `layout.ts`
(the game's layout), `sound.ts`, `App.tsx`.

Docs: `node_modules/@racelink/overlay/docs/README.md`.
