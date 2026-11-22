# Warhammer Fuel Calculator

A Racelink overlay in the Warhammer Racing set: four themes (Ember in the colours of the streamer's flaming W, Graphite, Tide, Clear), calm colours, nothing flashes.

Fuel as on the Warhammer Racing stream. Rows for the average of the last clean laps, the last qualifying lap, the last lap and (optionally) a figure you type, each with fuel per lap, laps the tank lasts, fuel to add (with a half unit cushion from one unit up) and fuel left at the flag. The PIT badge lights in the pit lane.

Code: `src/App.tsx`; the arithmetic is in `racelink/src/renderer/widgets/overlays/streamer-common/fuelPanel.ts` (tested). The pit stall fuel order is not in the Overlay API, so "fuel at the end" does not count it.

```bash
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
```

Shared look, fonts, icons and formatting: `racelink/src/renderer/widgets/overlays/warhammer-common/`.
