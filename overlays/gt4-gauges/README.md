# GT4 Gauges

Twin speedometer and tachometer in the style of a classic console racing game,
adapted from [gt4-gauges](https://github.com/Alexander-2049/gt4-gauges) to the
Racelink overlay SDK (`@racelink/overlay`). Its code is in `src/` (not in the
shared `racelink/` folder).

| Element | Data |
| --- | --- |
| Speedometer, centre speed | `car.speedKph`, unit from `session.displayUnits` ("As in the game", km/h when the game has none) |
| Tachometer | `car.rpm`; scale to `car.maxRpm` (else `car.shiftLights.blinkRpm`), red zone from `car.shiftLights.shiftRpm` |
| Gear, shift flash | `car.gear` (R, N, 1…); the box lights at `shiftRpm` and blinks past `blinkRpm` |
| PIT | `car.pitLimiterActive` replaces the speed unit |
| Pedal arcs | `car.throttle`, `car.brake` |
| Fuel arc | `car.fuelLiters` / `car.fuelCapacityLiters` (else `fuel.capacityLiters`); hidden without a capacity |
| G bar | `car.accelerationG.lateral`, scale from the settings |
| Odometer | "Distance the car has driven": `car.odometerMeters`, what the player drove in this car across sessions (a recording shows its own; before Racelink counted it, the trip below); "Since the overlay opened": the speed integrated over `overlay.sampledAt.car` |

Changes from the original: data and settings through the SDK instead of its own
WebSocket/msgpack client, demo from the SDK (`?demo=<game>`), every game, real
rev limit and shift points instead of a fixed 240 km/h / 8000 rpm, automatic
speed scale, shift flash, pit limiter, G scale and direction, red zone colour,
the font bundled and loaded before the first frame, unique SVG clip ids, the
developer tuning panel removed.

```bash
npm run dev        # http://localhost:5173/?demo=iracing
npm run build      # dist/
```

Font: Michroma, SIL Open Font License 1.1 (`src/fonts/Michroma-OFL.txt`).
