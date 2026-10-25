# NFSMW-Leaderboard

A Racelink overlay.

```bash
npm install
npm run dev       # live preview; the project appears in Racelink Studio
npm run build     # builds and checks the package in dist/
npm run validate  # runs the same checks Racelink runs before publishing
```

- `racelink.overlay.json` — name, version, games, size and the settings schema.
  Editing it regenerates `src/racelink-settings.ts`.
- `src/App.tsx` — the overlay; `src/useOverlay.ts` wraps `createOverlay` for React.
- `preview/preview.png` — the Workshop image; capture it in Racelink Studio.

While `npm run dev` runs, the project is listed in Racelink Studio. Build it, then
check it, capture a preview and publish there.
The first publish writes `workshop.publishedFileId` into the manifest; later
publishes update the same Workshop item.

Docs: `node_modules/@racelink/overlay/docs/README.md`.
