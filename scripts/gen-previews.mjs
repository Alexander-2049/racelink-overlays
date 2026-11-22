// Renders the Workshop preview of every overlay: overlays/<id>/preview/preview.png.
//
//   npm run build && npm run previews            all overlays
//   npm run previews -- r-standings dash         only these
//
// Each built overlay (overlays/<id>/dist) runs with the SDK's demo data
// (?demo=<first game of its manifest>) at its default size in headless Edge or
// Chrome; the drawn part is centred on a square dark plate, 1024 px, as the
// Workshop wants it. Racelink's own Overlay API is blocked, so a running
// Racelink does not take over. Build again afterwards: the build copies
// preview/ into dist/.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const overlaysDir = path.join(repo, 'overlays');
const wanted = process.argv.slice(2);
const ids = fs
  .readdirSync(overlaysDir)
  .filter((id) => fs.existsSync(path.join(overlaysDir, id, 'dist', 'racelink.overlay.json')))
  .filter((id) => wanted.length === 0 || wanted.includes(id));
if (ids.length === 0) {
  console.error('Nothing built: run npm run build first.');
  process.exit(1);
}

/** Side of the square image and the share of it the overlay may take. */
const side = 1024;
const fill = 0.86;
const plate = '#1a1e23';
const settleMs = Number(process.env.RACELINK_PREVIEW_SETTLE_MS ?? 3000);
const debugPort = 9351;

const browserPath = [
  process.env.RACELINK_PREVIEW_BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]
  .filter(Boolean)
  .find((candidate) => fs.existsSync(candidate));
if (!browserPath) {
  console.error('No Edge or Chrome found; set RACELINK_PREVIEW_BROWSER.');
  process.exit(1);
}

// Serves overlays/<id>/dist at /<id>/.
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' };
const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const [, id, ...rest] = decodeURIComponent(url.pathname).split('/');
  const dist = path.join(overlaysDir, id ?? '', 'dist');
  const file = path.resolve(dist, rest.join('/') || 'index.html');
  if (!file.startsWith(dist) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const profile = path.join(repo, '.tmp', 'preview-browser');
fs.mkdirSync(profile, { recursive: true });
const browser = spawn(browserPath, [
  '--headless=new',
  `--remote-debugging-port=${String(debugPort)}`,
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--hide-scrollbars',
  'about:blank',
]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let version = null;
for (let attempt = 0; attempt < 50 && !version; attempt += 1) {
  await sleep(200);
  version = await fetch(`http://127.0.0.1:${String(debugPort)}/json/version`)
    .then((response) => response.json())
    .catch(() => null);
}
if (!version) throw new Error('The browser did not open its debugging port.');

const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const events = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(String(event.data));
  if (message.id !== undefined) {
    pending.get(message.id)?.(message);
    pending.delete(message.id);
  } else events.push(message);
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    nextId += 1;
    pending.set(nextId, (message) =>
      message.error ? reject(new Error(`${method}: ${message.error.message}`)) : resolve(message.result),
    );
    socket.send(JSON.stringify({ id: nextId, method, params, sessionId }));
  });

/** Runs in the page: crops the PNG to its drawn part and centres it on a square plate. */
const compose = async (pngBase64, size, share, background, limitWidth, limitHeight) => {
  const image = new Image();
  image.src = `data:image/png;base64,${pngBase64}`;
  await image.decode();
  const source = document.createElement('canvas');
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;
  const context = source.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const width = Math.min(source.width, limitWidth);
  const height = Math.min(source.height, limitHeight);
  const { data } = context.getImageData(0, 0, width, height);
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1)
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
  if (right < 0) return null;
  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;
  const scale = Math.min((size * share) / cropWidth, (size * share) / cropHeight);
  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;
  const target = out.getContext('2d');
  target.fillStyle = background;
  target.fillRect(0, 0, size, size);
  target.imageSmoothingQuality = 'high';
  const drawWidth = cropWidth * scale;
  const drawHeight = cropHeight * scale;
  target.drawImage(source, left, top, cropWidth, cropHeight, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
  return out.toDataURL('image/png').split(',')[1];
};

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Network.enable', {}, sessionId);
  await send('Network.setBlockedURLs', { urls: ['ws://127.0.0.1:32123/*', 'http://127.0.0.1:32123/*', 'ws://localhost:32123/*'] }, sessionId);
  // Blocked URLs do not stop a WebSocket: without one the SDK makes its demo in the page.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.WebSocket = class { constructor() { throw new Error("offline"); } };' }, sessionId);
  for (const id of ids) {
    const manifest = JSON.parse(fs.readFileSync(path.join(overlaysDir, id, 'dist', 'racelink.overlay.json'), 'utf8'));
    const [width, height] = manifest.size.default;
    const game = manifest.games?.[0] ?? 'iracing';
    // Enough pixels for a sharp 1024 px image.
    const deviceScaleFactor = Math.min(4, Math.max(1, (side * fill) / Math.max(width, height)));
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile: false }, sessionId);
    await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } }, sessionId);
    await send('Page.navigate', { url: `http://127.0.0.1:${String(port)}/${id}/index.html?demo=${game}` }, sessionId);
    await sleep(settleMs);
    let image = null;
    for (let attempt = 0; attempt < 8 && image === null; attempt += 1) {
      if (attempt > 0) await sleep(1000);
      const { data: png } = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
      const { result } = await send(
        'Runtime.evaluate',
        {
          expression: `(${compose.toString()})(${JSON.stringify(png)}, ${String(side)}, ${String(fill)}, ${JSON.stringify(plate)}, ${String(Math.floor(width * deviceScaleFactor))}, ${String(Math.floor(height * deviceScaleFactor))})`,
          awaitPromise: true,
          returnByValue: true,
        },
        sessionId,
      );
      image = typeof result.value === 'string' ? result.value : null;
    }
    if (image === null) {
      console.warn(`${id}: drew nothing with demo data (${game})`);
      continue;
    }
    const target = path.join(overlaysDir, id, 'preview', 'preview.png');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(image, 'base64'));
    console.log(`${id}: ${game}, ${String(Math.round(fs.statSync(target).size / 1024))} KB`);
  }
} finally {
  socket.close();
  browser.kill();
  server.close();
}
