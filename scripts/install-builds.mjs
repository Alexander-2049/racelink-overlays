// Copies every built overlay (overlays/*/dist) into a Racelink custom overlays
// folder, replacing older copies; Racelink lists them without a restart.
//
//   npm run install-overlays                 into %APPDATA%/Racelink/overlays (Linux: ~/.local/share/Racelink/overlays)
//   npm run install-overlays -- <folder>     into another folder (a test profile)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultFolder =
  process.platform === 'win32'
    ? path.join(process.env.APPDATA ?? os.homedir(), 'Racelink', 'overlays')
    : path.join(process.env.XDG_DATA_HOME ?? path.join(os.homedir(), '.local/share'), 'Racelink', 'overlays');
const target = path.resolve(process.argv[2] ?? defaultFolder);
fs.mkdirSync(target, { recursive: true });

let installed = 0;
for (const name of fs.readdirSync(path.join(repo, 'overlays'))) {
  const dist = path.join(repo, 'overlays', name, 'dist');
  const manifest = path.join(dist, 'racelink.overlay.json');
  if (!fs.existsSync(manifest)) {
    console.warn(`${name}: not built (npm run build)`);
    continue;
  }
  const { id } = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const folder = path.join(target, id);
  fs.rmSync(folder, { recursive: true, force: true });
  fs.cpSync(dist, folder, { recursive: true });
  installed += 1;
}
console.log(`Installed ${String(installed)} overlays into ${target}`);
