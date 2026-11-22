# Anastasia Pedals

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

Gear and speed, the fastest and the slowest speed (last straight and last corner, or the last lap), clutch, brake and throttle bars and the steering wheel.

Fastest and slowest speed: by default the zigzag of the speed (a peak counts once the speed fell by 15 km/h, a trough once it rose by 15 km/h), so the figures are those of the last straight and the last corner; `Last completed lap` is the other choice. The pedals are after the game's processing (no raw values).

Code: `src/` and `racelink/src/renderer/widgets/overlays/anastasia-common/` (shared). Build with `npm run build`; try it with `?demo=iracing`.
