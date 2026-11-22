# Anastasia Standings

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

The standings as on her stream: header line, then the top of the class and a window round the car you watch; position, places gained, number, name, car brand, licence, iRating, gap, interval, last lap, pit stop, time against you on the last laps. Columns and their order are settings (more: country, class stripe, iRating change, best lap).

The shown order is the one of her stream. Left out: the tyre column (the compound index has no stable meaning across cars in the Overlay API) and the joker lap.

Code: `src/` and `racelink/src/renderer/widgets/overlays/anastasia-common/` (shared). Build with `npm run build`; try it with `?demo=iracing`.
