// Imports the R- and NFSMW- overlays of Racelink as standalone overlay
// projects (one `npm create @racelink/overlay` project each, in overlays/).
//
//   cd ../Racelink-Tauri && npx tsx ../Racelink-Overlays/scripts/import-from-app.mjs
//
// The overlays' code is copied into racelink/ at the same relative paths it
// has in the app, so its imports stay as they are; only the files reachable
// from each overlay are copied. The app's overlay runtime is replaced by the
// shims in shims/, built on the public SDK (@racelink/overlay). Each
// project's manifest comes from the app's built-in catalog: the same id,
// name, category, size, games and settings, so layouts and settings carry over.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const app = process.cwd();
if (!fs.existsSync(path.join(app, 'src/shared/contracts/overlayCatalog.ts')))
  throw new Error('Run this from the Racelink-Tauri folder.');

const load = (relative) => import(pathToFileURL(path.join(app, relative)).href);
const { overlayCatalog } = await load('src/shared/contracts/overlayCatalog.ts');
const { gameIds, supportsOverlay } = await load('src/shared/contracts/games.ts');

const overlaysDir = 'src/renderer/widgets/overlays';
const kinds = Object.keys(overlayCatalog).filter((kind) => /^(r-|nfsmw-)/.test(kind));

// Entry files of each overlay, as the app loads them (widgets/overlays/index.ts).
const registry = fs.readFileSync(path.join(app, overlaysDir, 'index.ts'), 'utf8');
const entryOf = (kind) => {
  const line = new RegExp(`'?${kind}'?: \\(\\) =>\\s*load\\(import\\('\\./([^']+)'\\), import\\('\\./([^'?]+)\\?inline'\\)\\)`).exec(registry);
  if (!line) throw new Error(`No entry for ${kind} in ${overlaysDir}/index.ts`);
  return { app: resolve(`${overlaysDir}/index.ts`, `./${line[1]}`), css: `${overlaysDir}/${line[2]}` };
};

// Files the shims replace; their imports are not followed.
const shims = new Map([
  [`${overlaysDir}/model/useRacingOverlay.ts`, 'shims/useRacingOverlay.ts'],
  ['src/renderer/shared/api/racelink-runtime/index.ts', 'shims/racelink-runtime.ts'],
]);

const codeExtensions = ['.ts', '.tsx', '.js', '.mjs'];
const resolve = (from, specifier) => {
  const clean = specifier.split('?')[0];
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(from), clean));
  const candidates = [
    base,
    ...codeExtensions.map((extension) => base + extension),
    base.replace(/\.js$/, '.ts'),
    base.replace(/\.js$/, '.tsx'),
    ...codeExtensions.map((extension) => `${base}/index${extension}`),
  ];
  return candidates.find((candidate) => {
    const full = path.join(app, candidate);
    return fs.existsSync(full) && fs.statSync(full).isFile();
  });
};

/** Files a `import.meta.glob` pattern names: `dir/*.ext` patterns only. */
const globbed = (from, pattern) => {
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(from), pattern));
  const dir = path.posix.dirname(target);
  const match = new RegExp(`^${path.posix.basename(target).replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
  const full = path.join(app, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((name) => match.test(name)).map((name) => `${dir}/${name}`);
};

/** Every file reachable from `start` (relative to the app). */
const closure = (start) => {
  const seen = new Set();
  const pending = [start];
  while (pending.length > 0) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (shims.has(file)) continue;
    const extension = path.extname(file);
    if (!['.ts', '.tsx', '.css', '.js', '.mjs'].includes(extension)) continue;
    const text = fs.readFileSync(path.join(app, file), 'utf8');
    const specifiers = [];
    if (extension === '.css') {
      for (const match of text.matchAll(/@import\s+['"]([^'"]+)['"]/g)) specifiers.push(match[1]);
      for (const match of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g))
        if (!/^(data:|https?:|#)/.test(match[1])) specifiers.push(match[1]);
    } else {
      for (const match of text.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g))
        specifiers.push(match[1]);
      for (const match of text.matchAll(/import\.meta\.glob(?:<[^>]*>)?\(\s*(\[[^\]]*\]|'[^']*')/g))
        for (const pattern of match[1].matchAll(/'([^']+)'/g))
          for (const hit of globbed(file, pattern[1])) pending.push(hit);
    }
    for (const specifier of specifiers) {
      if (!specifier.startsWith('.')) continue;
      const resolved = resolve(file, specifier);
      if (resolved) pending.push(resolved);
      else console.warn(`  unresolved ${specifier} in ${file}`);
    }
  }
  return seen;
};

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};

// Games an overlay works in, as Racelink decides it.
const gamesOf = (kind) => gameIds.filter((game) => supportsOverlay(game, kind));

const mirrored = new Set();
for (const kind of kinds) {
  const definition = overlayCatalog[kind];
  const entry = entryOf(kind);
  const files = new Set([...closure(entry.app), ...closure(entry.css)]);
  for (const file of files) {
    const target = path.join(repo, 'racelink', file);
    const shim = shims.get(file);
    copy(shim ? path.join(repo, shim) : path.join(app, file), target);
    mirrored.add(file);
  }

  const project = path.join(repo, 'overlays', kind);
  if (!fs.existsSync(path.join(project, 'package.json')))
    throw new Error(`Create the project first: npm create @racelink/overlay@latest ${kind} -- --template react-ts`);
  const { width, height } = definition.defaultBounds;
  const round = (value) => Math.max(1, Math.round(value));
  const manifestPath = path.join(project, 'racelink.overlay.json');
  const previous = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifest = {
    $schema: previous.$schema,
    apiVersion: 2,
    id: kind,
    version: previous.version ?? '1.0.0',
    name: definition.name,
    category: definition.category,
    description: `${definition.name}, the Racelink overlay, as a standalone overlay.`,
    entry: 'index.html',
    games: gamesOf(kind),
    size: {
      default: [round(width), round(height)],
      min: [round(Math.min(width, 60)), round(Math.min(height, 30))],
      max: [round(Math.max(width * 4, 400)), round(Math.max(height * 4, 300))],
    },
    settings: definition.settings,
    ...(previous.workshop ? { workshop: previous.workshop } : {}),
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const toProject = (file) => path.posix.relative(`overlays/${kind}/src`, `racelink/${file}`);
  fs.writeFileSync(
    path.join(project, 'src/main.tsx'),
    `// ${definition.name}: the overlay's code lives in racelink/ (shared with the other overlays).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initOverlay } from '${toProject('src/renderer/widgets/overlays/model/useRacingOverlay')}';
import { defaultSettings } from './racelink-settings';
import App from '${toProject(entry.app.replace(/\.tsx?$/, ''))}';
import '${toProject(entry.css)}';
import './frame.css';

// Item visibility the overlay reads under its own names (the app's catalog \`orderVisibility\`).
// Nothing is drawn before the instance's settings are known.
void initOverlay(defaultSettings, ${JSON.stringify(definition.orderVisibility ?? {})}).then(() => {
  const root = document.querySelector('#root');
  if (!root) throw new Error('Missing #root element.');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
`,
  );
  fs.copyFileSync(path.join(repo, 'shims/frame.css'), path.join(project, 'src/frame.css'));
  for (const unused of ['App.tsx', 'useOverlay.ts', 'style.css'])
    fs.rmSync(path.join(project, 'src', unused), { force: true });

  const packagePath = path.join(project, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  // The shared sources type-check from the root (npm run typecheck); a project builds with Vite.
  pkg.scripts.build = 'vite build';
  pkg.dependencies['lucide-react'] = '^1.55.0';
  // The SDK of the Racelink sources until its next npm release (README.md).
  pkg.dependencies['@racelink/overlay'] = 'file:../../../Racelink-Tauri/packages/overlay';
  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`${kind}: ${String(files.size)} files, ${gamesOf(kind).join(', ')}`);
}
console.log(`racelink/: ${String(mirrored.size)} files`);
