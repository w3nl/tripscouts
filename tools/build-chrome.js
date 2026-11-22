// Makes the Chrome extension for the Chrome Web Store: the game files with a Manifest V3 extension around them, as
// dist/tripscouts-chrome.zip (and unpacked in dist/chrome/, for "Load unpacked" in chrome://extensions). Run: npm run build:chrome
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..'), dist = path.join(root, 'dist'), out = path.join(dist, 'chrome');
const gameVersion = +fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8').match(/const GAME_VERSION = (\d+);/)[1];
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));

fs.rmSync(out, { recursive: true, force: true });
// No sw.js: a service worker only runs on http(s), and the extension has the game inside it already (offline).
for (const f of ['index.html', 'privacy.html', 'manifest.webmanifest', 'css', 'js', 'icons'])
  fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
fs.cpSync(path.join(root, 'chrome'), out, { recursive: true });

const icons = Object.fromEntries([16, 32, 48, 128].map(s => [s, `chrome-icons/icon-${s}.png`]));
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({
  manifest_version: 3,
  name: 'TripScouts',
  short_name: 'TripScouts',
  // the same version as the Linux app: GAME_VERSION 34 becomes 1.34.0, so every new game version is a newer upload
  version: `1.${gameVersion}.0`,
  description: manifest.description.length <= 132 ? manifest.description : 'Two families, ten trips across Europe: a platform game with one level a day, keys, tasks and code locks.',
  homepage_url: 'https://tripscouts.online/',
  icons,
  action: { default_title: 'Play TripScouts', default_icon: icons },
  background: { service_worker: 'background.js' },
}, null, 2) + '\n');

fs.mkdirSync(dist, { recursive: true });
const zip = path.join(dist, 'tripscouts-chrome.zip');
fs.writeFileSync(zip, makeZip(out));
console.log(`Chrome extension ${'1.' + gameVersion + '.0'}: ${path.relative(root, zip)} (unpacked in ${path.relative(root, out)}/)`);

/** A plain ZIP (deflate) of every file in dir, with the files at the root of the archive, as the Web Store wants. */
function makeZip(dir) {
  const files = [], walk = d => fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .forEach(e => e.isDirectory() ? walk(path.join(d, e.name)) : files.push(path.join(d, e.name)));
  walk(dir);
  const parts = [], central = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(path.relative(dir, file).split(path.sep).join('/'));
    const data = fs.readFileSync(file), packed = zlib.deflateRawSync(data, { level: 9 }), crc = zlib.crc32(data);
    const head = (sig, extra) => {
      const b = Buffer.alloc(extra ? 46 : 30);
      let o = 0; const u32 = v => { b.writeUInt32LE(v, o); o += 4; }, u16 = v => { b.writeUInt16LE(v, o); o += 2; };
      u32(sig); if (extra) u16(20); u16(20); u16(0x0800); u16(8); u16(0); u16(0x21);   // version, UTF-8 names, deflate, 1980-01-01
      u32(crc); u32(packed.length); u32(data.length); u16(name.length); u16(0);
      if (extra) { u16(0); u16(0); u16(0); u32(0); u32(offset); }
      return b;
    };
    central.push(head(0x02014b50, true), name);
    parts.push(head(0x04034b50, false), name, packed);
    offset += 30 + name.length + packed.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}
