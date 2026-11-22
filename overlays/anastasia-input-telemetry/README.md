# Anastasia Input Telemetry

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

Throttle (green) and brake (red) as lines across the screen over a faint grid; optionally clutch, steering, a fill and the value at the line.

The Overlay API has the pedals after the game's processing only; there are no raw pedal values.

Code: `src/` and `racelink/src/renderer/widgets/overlays/anastasia-common/` (shared). Build with `npm run build`; try it with `?demo=iracing`.
