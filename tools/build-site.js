// Zet de bestanden van het spel in _site/ voor GitHub Pages (zonder tests, tools en node_modules).
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..'), out = path.join(root, '_site');
fs.rmSync(out, { recursive: true, force: true });
for (const f of ['index.html', 'privacy.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons', 'fonts'])
  fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('Site staat in _site/');
