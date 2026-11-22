# Warhammer Standings

A Racelink overlay in the Warhammer Racing set: four themes (Ember in the colours of the streamer's flaming W, Graphite, Tide, Clear), calm colours, nothing flashes.

The standings as on the Warhammer Racing stream (twitch.tv/warhammerracing): a strip with the session clock, laps, temperatures, humidity, strength of field and the number of drivers; the top of the class and a window round the car you watch; places gained, make, safety rating and iRating pills, gap, interval, last lap, the lap and time of the last pit stop, and the last laps against you (green: you were faster, red: the car was; the infinity sign marks your own row).

Code: `src/App.tsx`; the row window and gaps come from `racelink/src/renderer/widgets/overlays/streamer-common/`.

```bash
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
```

Shared look, fonts, icons and formatting: `racelink/src/renderer/widgets/overlays/warhammer-common/`.
