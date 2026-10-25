# Racelink Overlays

The R- and NFSMW- overlays of Racelink, each a standalone Racelink overlay
project made with `npm create @racelink/overlay@latest` (React + TypeScript).
They install like any community overlay: from the Steam Workshop, a zip
archive or a folder dropped on Racelink, or the custom overlays folder.

```text
overlays/<id>/        one project per overlay: manifest, entry, build output in dist/
racelink/             the overlays' code, shared by the projects, at the paths it has
                      in the Racelink app (src/renderer/widgets/overlays/…), so it
                      imports as it does there
shims/                the app's overlay runtime on the public SDK (@racelink/overlay):
                      useRacingOverlay, demoHistory, the page frame
scripts/              import-from-app.mjs, install-builds.mjs
```

| Overlay | id |
| --- | --- |
| R-Standings, R-Relatives, R-Flags, R-Digiflag, R-Input Telemetry | `r-standings`, `r-relatives`, `r-flags`, `r-digiflag`, `r-input-telemetry` |
| R-Boost Box, R-Lap Timing, R-LapTime Graph, R-Pitbox Helper | `r-boost-box`, `r-lap-timing`, `r-laptime-graph`, `r-pitbox-helper` |
| R-Fuel Calculator, R-G-Force Meter, R-Delta Trace | `r-fuel-calculator`, `r-g-force-meter`, `r-delta-trace` |
| NFSMW-Speedometer, NFSMW-EA Trax, NFSMW-Minimap, NFSMW-Leaderboard, NFSMW-Lap Time | `nfsmw-speedometer`, `nfsmw-ea-trax`, `nfsmw-minimap`, `nfsmw-leaderboard`, `nfsmw-lap-time` |

## Work on an overlay

```bash
npm install                       # once, at the root (npm workspaces)
cd overlays/r-standings
npm run dev                       # live in Racelink (Studio, "Add overlay") and in a browser
```

Open `http://localhost:5173/?demo=iracing` for demo data of a game without
Racelink. The code to change is in `racelink/src/renderer/widgets/overlays/<id>/`
and the shared folders next to it (`r-common/`, `nfsmw-common/`).

## Build and install

```bash
npm run build                     # every overlay → overlays/<id>/dist/
npm run install-overlays          # into %APPDATA%/Racelink/overlays (Racelink sees them at once)
npm run install-overlays -- <dir> # into another custom overlays folder
```

Publish an overlay to the Steam Workshop from Racelink Studio (add its
project folder there).

## The SDK

The projects use the SDK from the Racelink sources
(`file:../../../Racelink-Tauri/packages/overlay`): the npm release
`@racelink/overlay@2.3.0` predates the `ready` event, `demoHistory` and
`?demo=<game>` the overlays need. After the next SDK release on npm, set the
dependency of each project back to `^<version>`.

## Importing again

`scripts/import-from-app.mjs` copies the overlays from the Racelink app and
writes each manifest from the app's catalog (id, name, category, size, games,
settings, so layouts and settings carry over):

```bash
cd ../Racelink-Tauri && npx tsx ../Racelink-Overlays/scripts/import-from-app.mjs
```

It overwrites `racelink/`, the manifests and `src/main.tsx` of each project.
Once the overlays are maintained here, edit them here instead.
