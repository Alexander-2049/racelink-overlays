# Warhammer Blind Spot

A Racelink overlay in the Warhammer Racing set: four themes (Ember in the colours of the streamer's flaming W, Graphite, Tide, Clear), calm colours, nothing flashes.

Bars at the left and right edge of the overlay that light while a car is alongside; a line in the bar follows the car from behind (bottom) to ahead (top) within the configured distances, and two cars on one side fill the bar. Stretch the overlay across the view.

Uses `car.spotter` (iRacing, Le Mans Ultimate) and, where the game has no spotter, the radar cars.

```bash
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
```

Shared look, fonts, icons and formatting: `racelink/src/renderer/widgets/overlays/warhammer-common/`.
