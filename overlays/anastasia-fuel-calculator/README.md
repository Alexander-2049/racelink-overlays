# Anastasia Fuel Calculator

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

The layout and content of the fuel calculator seen on her stream (fuel level, laps in the race, a PIT badge, then Average / Qualify / Last rows with Laps Remain, Refuel and Fuel at End), in the colours of her set. The text colours follow the theme; "My colours" in the settings changes the main, accent (enough fuel, PIT) and negative ones. A row for your own figure, units, the cushion and the meaning of "Fuel at End" are settings.

It only shows. The fuel ordered in the pit box is not in the Overlay API, so "Fuel at End" does not count it. Version 2 replaced the first guess at this board: the old settings (title, rows list, source, margin, unit, warnColors, customPerLap) are gone; `myPerLap` and `units` replace `customPerLap` and `unit`.

Code: `src/`, the arithmetic in `racelink/src/renderer/widgets/overlays/streamer-common/fuelPanel.ts` (shared with Warhammer Fuel) and the look in `racelink/src/renderer/widgets/overlays/anastasia-common/`. Build with `npm run build`; try it with `?demo=iracing`.
