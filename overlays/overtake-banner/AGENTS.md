# Racelink overlay — notes for coding assistants

This is a Racelink overlay: a web page shown on top of a racing game. Read
`node_modules/@racelink/overlay/docs/README.md` and the field reference in
`node_modules/@racelink/overlay/docs/reference/fields.md` before changing data access.

Rules:

- Get data only from `createOverlay` in `@racelink/overlay`. Do not open your own
  WebSocket or fetch remote URLs; the overlay runs under a strict CSP.
- Telemetry is typed and normalized across games: speeds in km/h, pedals 0..1,
  temperatures in °C, distances in metres, times in seconds, angles in radians.
- A value the running game does not provide is `null` (or an empty array). Handle
  `null`; never assume a field exists for every game. `overlay.supports(path)`
  tells whether the current game provides a field.
- Game-specific data lives under `ext.<game>`, for example
  `drivers[i].ext.iracing?.iRating`.
- Settings are declared in `racelink.overlay.json` and typed in
  `src/racelink-settings.ts` (generated — do not edit). `overlay.settings` is always
  complete and valid.
- Reading `telemetry.<topic>` subscribes to that topic automatically; read only what
  the overlay shows.
- The overlay is resized freely: use relative CSS units and container queries.
- Keep the page background transparent and do not set `color-scheme`; it would
  give the overlay an opaque white or black box.
- `category` in `racelink.overlay.json` sets the group in "Add overlay" (race, timing,
  driving, awareness, strategy, tyres, chassis, weather, other).
- Keep `version` in `racelink.overlay.json` as semver and raise it before publishing
  an update. Never change `id` after publishing.

Check work with `npm run build` and `npm run validate`.
