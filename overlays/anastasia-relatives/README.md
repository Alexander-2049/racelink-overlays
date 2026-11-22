# Anastasia Relatives

Part of the overlays for twitch.tv/anastasia_striking (violet and magenta on near-black; three calmer themes: neutral dark, midnight blue, soft rose). Nothing flashes.

The cars round you: ahead above, you in gold, behind below; position, number, name, laps since the pit stop or PIT, licence, iRating, time to you; a header with track and air temperature, strength of field, incidents and a clock. Cars a lap ahead are red, a lap behind blue.

Time to you is `gaps.relativeSeconds`; where a game does not give it the cell stays empty.

Code: `src/` and `racelink/src/renderer/widgets/overlays/anastasia-common/` (shared). Build with `npm run build`; try it with `?demo=iracing`.
