# Racelink Overlays — rules

- Each `overlays/<id>/` is an independent Racelink overlay project; its manifest
  (`racelink.overlay.json`) is the contract with Racelink and community layouts:
  never change an `id` or a setting `key`.
- Overlay code lives in `racelink/` at the paths it had in the Racelink app, so
  its imports stay as they were. This repository is its only home: the app no
  longer contains these overlays. `racelink/src/renderer/widgets/overlays/model/useRacingOverlay.ts`
  and `racelink/src/renderer/shared/api/racelink-runtime/index.ts` are the app's
  overlay runtime rebuilt on the public SDK.
- Read data only through the SDK (`@racelink/overlay`): no Racelink internals.
- Before finishing: `npm run build` (all overlays build) and check the changed
  overlay with `?demo=<game>` and in Racelink.
- Temporary files and screenshots go to `.tmp/` (ignored).
