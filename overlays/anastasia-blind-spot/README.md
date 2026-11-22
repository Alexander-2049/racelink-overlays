# Anastasia Blind Spot

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

A bar on each edge of the overlay that lights up when a car is alongside; one car is a segment that follows it along the bar, two cars fill it. Stretch the overlay across the screen.

iRacing says only that a car is on a side, not which one: the nearest car by distance is drawn on that side (with cars on both sides the nearest goes left, the next right). Le Mans Ultimate uses the radar, which gives each side exactly.

Code: `src/` and `racelink/src/renderer/widgets/overlays/anastasia-common/` (shared). Build with `npm run build`; try it with `?demo=iracing`.
