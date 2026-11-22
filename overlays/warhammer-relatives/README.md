# Warhammer Relatives

A Racelink overlay in the Warhammer Racing set: four themes (Ember in the colours of the streamer's flaming W, Graphite, Tide, Clear), calm colours, nothing flashes.

The cars round the car you watch, as on the Warhammer Racing stream: position, number, name, last pit lap, safety rating and iRating, and the time to you. A car a lap ahead is red, a car a lap behind is blue, you are amber. The strip shows coolant and oil temperature, humidity, track temperature, strength of field, incidents and the clock; the footer shows the lap and the session clock.

Code: `src/App.tsx`; the cars and their order come from `streamer-common/relativesModel.ts`.

```bash
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
```

Shared look, fonts, icons and formatting: `racelink/src/renderer/widgets/overlays/warhammer-common/`.
