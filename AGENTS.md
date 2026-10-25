# Racelink Overlays — rules

- Each `overlays/<id>/` is an independent Racelink overlay project; its manifest
  (`racelink.overlay.json`) is the contract with Racelink and community layouts:
  never change an `id` or a setting `key`.
- Overlay code lives in `racelink/` at the app's paths; the app runtime is
  replaced by `shims/` (copied there by `scripts/import-from-app.mjs`). Edit shims
  in `shims/`.
- Read data only through the SDK (`@racelink/overlay`): no Racelink internals.
- Before finishing: `npm run build` (all overlays build) and check the changed
  overlay with `?demo=<game>` and in Racelink.
- Temporary files and screenshots go to `.tmp/` (ignored).
