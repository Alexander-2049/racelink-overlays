# Warhammer Weather

A Racelink overlay in the Warhammer Racing set: four themes (Ember in the colours of the streamer's flaming W, Graphite, Tide, Clear), calm colours, nothing flashes.

Track wetness (with a seven step scale), precipitation (smoothed, with a rising or falling trend) and wind (arrow and speed, up is north or the car's nose) in one card. Each block can be switched off or moved in the settings; the blocks can sit one under the other or side by side.

Wind relative to the car uses the car's heading (`car.headingRad`) in the same world frame as the wind direction.

```bash
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
```

Shared look, fonts, icons and formatting: `racelink/src/renderer/widgets/overlays/warhammer-common/`.
