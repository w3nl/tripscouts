const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs'), path = require('path'), os = require('os');
const root = path.join(__dirname, '..');

test.describe('een oudere offline pagina met nieuwe scripts', () => {
  test.use({ serviceWorkers: 'block', userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/133.0.0.0 Mobile' });

  test('blijft speelbaar en biedt herladen aan', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/index.html', async route => {
      const response = await route.fetch();
      let html = await response.text();
      const start = html.indexOf('  <div class="overlay" id="settingsWrap"');
      const end = html.indexOf('  <!-- Install as an app', start);
      expect(start).toBeGreaterThan(-1);
      expect(end).toBeGreaterThan(start);
      html = html.slice(0, start) + html.slice(end);
      html = html.replace(/<div class="title-actions">[\s\S]*?<\/div>/, `<span class="version">
        <button type="button" class="lang" data-lang="en">English</button>
        <button type="button" class="lang" data-lang="nl">Nederlands</button>
        <button type="button" class="lang voice" id="voiceBtn" hidden>Voices</button>
        <button type="button" class="lang voice" id="ambBtn">Ambience</button>
      </span>`);
      await route.fulfill({ response, body: html });
    });
    await page.goto('/index.html');
    await expect(page.locator('html')).toHaveClass(/ready/);
    await expect(page.locator('#update-bar')).toBeVisible();
    await expect(page.locator('#installBar')).toBeVisible();
    await page.locator('#installClose').click();
    await expect(page.locator('#ambBtn')).toBeVisible();
    await page.locator('#ambBtn').click();
    await expect(page.locator('#ambBtn')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#levels button').first().click();
    await page.locator('#card .btn').first().click();
    await expect(page.locator('#hud')).toBeVisible();
    await page.locator('#hMenu').click();
    await page.locator('#regionBtn').click();
    await expect(page.locator('#mapWrap')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test('het spel is een installeerbare app die offline werkt', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors.filter(e => e.errorId !== 'in-incognito')).toEqual([]);
  const { errors } = await cdp.send('Page.getAppManifest');
  expect(errors).toEqual([]);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await expect(page.locator('#hud')).toBeVisible();
  await context.setOffline(false);
});

test('het spel en de privacypagina halen niets op bij andere servers, en gebruiken de eigen lettertypen', async ({ page }) => {
  const outside = [];
  page.on('request', r => { if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== 'http://127.0.0.1:4180') outside.push(r.url()); });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  const fonts = await page.evaluate(async () => {
    await Promise.all(['600 20px Fredoka', '700 20px Nunito', '700 20px "Fredoka"'].map(f => document.fonts.load(f, 'Šibenik Ardèche')));
    return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')).sort();
  });
  expect(fonts).toEqual(expect.arrayContaining(['Fredoka', 'Nunito']));
  await page.goto('/privacy.html');
  await expect(page.locator('h1').first()).toHaveText('Privacy');
  expect(outside).toEqual([]);
});

test('de privacypagina overschrijft de offline kopie van het spel niet', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await page.goto('/privacy.html');
  await expect(page.locator('h1').first()).toHaveText('Privacy');
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.goto('/privacy.html');
  await expect(page.locator('h1').first()).toHaveText('Privacy');
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await expect(page.locator('#title')).toBeVisible();
  await context.setOffline(false);
});

test('de pagina /android/ overschrijft de offline kopie van het spel ook niet', async ({ page, context }) => {
  await page.route('https://api.github.com/**', route => route.fulfill({ status: 503, body: '' }));
  await page.route('https://github.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Releases</h1>' }));
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await page.goto('/android/');
  await page.waitForURL('https://github.com/w3nl/tripscouts/releases');
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await expect(page.locator('#title')).toBeVisible();
  await context.setOffline(false);
});

test('tripscouts.online/android: door naar de .apk van de nieuwste Android-release, anders naar de lijst', async ({ page }) => {
  const apk = 'https://github.com/w3nl/tripscouts/releases/download/android-v1.250/cabin-week.apk';
  await page.route('https://api.github.com/repos/w3nl/tripscouts/releases*', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([
    { tag_name: 'linux-v1.100.0', draft: false, prerelease: false, assets: [{ name: 'tripscouts.snap', browser_download_url: 'https://x/snap' }] },
    { tag_name: 'android-v1.251', draft: true, prerelease: false, assets: [{ name: 'cabin-week.apk', browser_download_url: 'https://x/draft.apk' }] },
    { tag_name: 'android-v1.250', draft: false, prerelease: false, assets: [{ name: 'cabin-week.apk', browser_download_url: apk }] },
    { tag_name: 'android-v1.249', draft: false, prerelease: false, assets: [{ name: 'cabin-week.apk', browser_download_url: 'https://x/old.apk' }] },
  ]) }));
  let asked = null;
  await page.route('https://github.com/**', route => { asked = route.request().url(); route.fulfill({ status: 200, contentType: 'text/plain', body: 'apk' }); });
  await page.goto('/android/');
  await expect.poll(() => asked).toBe(apk);                  // de nieuwste gepubliceerde, niet het concept of de snap
  // GitHub niet bereikbaar (of te vaak gevraagd): de lijst met releases
  await page.unroute('https://api.github.com/repos/w3nl/tripscouts/releases*');
  await page.route('https://api.github.com/**', route => route.fulfill({ status: 403, body: '' }));
  asked = null;
  await page.goto('/android/');
  await expect.poll(() => asked).toBe('https://github.com/w3nl/tripscouts/releases');
});

test('Chrome biedt de Chrome Web Store-extensie aan', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' }));
  await page.goto('/');
  await page.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => {}; e.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(e); });
  await expect(page.locator('#installBar')).toBeVisible();
  await expect(page.locator('#installChrome')).toBeVisible();
  await expect(page.locator('#installChrome')).toHaveAttribute('href', 'https://chromewebstore.google.com/detail/tripscouts/pcpdooenjphohflgmclkpachhfonjokc');
  await expect(page.locator('#installText')).toContainText('install the web app');
});

test('een Chromebook toont de Chrome Web Store-optie zonder installatieprompt', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (X11; CrOS x86_64 14526.64.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' }));
  await page.goto('/');
  await expect(page.locator('#installBar')).toBeVisible();
  await expect(page.locator('#installChrome')).toBeVisible();
  await expect(page.locator('#installBtn')).toBeHidden();
  await expect(page.locator('#installText')).toContainText("Chrome's menu");
});

for (const [platform, userAgent, language] of [
  ['Android', 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/133.0.0.0 Mobile Safari/537.36', 'nl'],
  ['iPhone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1', 'en']
]) test(`${platform}: installatiemelding opnieuw openen na Niet nu`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(ua => Object.defineProperty(navigator, 'userAgent', { get: () => ua }), userAgent);
  await page.goto('/?lang=' + language);
  await expect(page.locator('#installBar')).toBeVisible();
  await page.locator('#installClose').click();
  const until = await page.evaluate(() => localStorage.getItem('cabin-week-install-later'));
  await expect(page.locator('#installBar')).toBeHidden();
  await page.reload();
  await expect(page.locator('#installBar')).toBeHidden();
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#installAgain')).toBeVisible();
  await page.locator('#installAgain').click();
  await expect(page.locator('#installBar')).toBeVisible();
  expect(await page.evaluate(() => gpFocusables().map(el => el.id))).toContain('installClose');
  expect(await page.evaluate(() => localStorage.getItem('cabin-week-install-later'))).toBe(until);
  if (platform === 'Android') {
    await expect(page.locator('#installPlay')).toBeVisible();
    await expect(page.locator('#installText')).toContainText('browsermenu');
  } else {
    await expect(page.locator('#installText')).toContainText('Add to Home Screen');
    await expect(page.locator('#installPlay')).toBeHidden();
  }
  await page.locator('#installClose').click();
  await expect(page.locator('#installAgain')).toBeVisible();
});

test('Android: opnieuw openen bewaart de web-app-prompt en biedt na afwijzen een alternatief', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (Linux; Android 13) Chrome/133.0.0.0 Mobile' }));
  await page.goto('/');
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt');
    e.prompt = () => { window.promptCalled = true; };
    e.userChoice = Promise.resolve({ outcome: 'dismissed' });
    dispatchEvent(e);
  });
  await page.locator('#installClose').click();
  await page.locator('#settingsOpen').click();
  await page.locator('#installAgain').click();
  await expect(page.locator('#installBtn')).toBeVisible();
  await page.locator('#installBtn').click();
  await expect(page.locator('#installBar')).toBeHidden();
  expect(await page.evaluate(() => window.promptCalled)).toBe(true);
  await page.locator('#installAgain').click();
  await expect(page.locator('#installPlay')).toBeVisible();
  await expect(page.locator('#installBtn')).toBeHidden();
  await expect(page.locator('#installText')).toContainText('browser menu');
});

test('Android: de installatiekeuze kan ook na Google Play opnieuw open', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (Linux; Android 13) Chrome/133.0.0.0 Mobile' }));
  await page.goto('/');
  await page.evaluate(() => document.querySelector('#installPlay').addEventListener('click', e => e.preventDefault()));
  await page.locator('#installPlay').click();
  await expect(page.locator('#installBar')).toBeHidden();
  await page.locator('#settingsOpen').click();
  await page.locator('#installAgain').click();
  await expect(page.locator('#installPlay')).toBeVisible();
});

test('de heropenknop verschijnt niet op desktop of in een geïnstalleerde app', async ({ page }) => {
  await page.goto('/');
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#installAgain')).toBeHidden();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (Linux; Android 13) Chrome/133.0.0.0 Mobile' });
    const original = window.matchMedia;
    window.matchMedia = query => query === '(display-mode: standalone)' ? { matches: true } : original.call(window, query);
  });
  await page.reload();
  await expect(page.locator('#installBar')).toBeHidden();
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#installAgain')).toBeHidden();
});

test('de installatiemelding werkt met pijltjes en Enter', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (X11; CrOS x86_64 14526.64.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' }));
  await page.goto('/');
  await expect(page.locator('#installChrome')).toBeVisible();
  expect(await page.evaluate(() => gpFocusables().map(el => el.id))).toEqual(expect.arrayContaining(['installChrome', 'installClose']));
  const focusables = await page.evaluate(() => gpFocusables().map(el => el.id));
  expect(focusables).not.toContain('installBtn');
  expect(focusables).not.toContain('installPlay');
  await page.evaluate(() => {
    window.__storeClicks = 0;
    document.querySelector('#installChrome').addEventListener('click', e => { e.preventDefault(); window.__storeClicks++; });
  });
  await page.locator('#installClose').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#installChrome')).toBeFocused();
  await page.keyboard.press('Enter');
  expect(await page.evaluate(() => window.__storeClicks)).toBe(1);
  await page.locator('#installClose').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#installBar')).toBeHidden();
  expect(await page.evaluate(() => gpFocusables().some(el => el.closest('#installBar')))).toBe(false);
});

test('een Chromebook biedt de geïnstalleerde Chrome-extensie niet opnieuw aan', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tripscouts-extension-'));
  let context;
  try {
    const extension = path.join(tmp, 'extension');
    fs.mkdirSync(extension);
    for (const f of ['index.html', 'manifest.webmanifest', 'css', 'js', 'icons', 'fonts'])
      fs.cpSync(path.join(root, f), path.join(extension, f), { recursive: true });
    fs.copyFileSync(path.join(root, 'chrome', 'background.js'), path.join(extension, 'background.js'));
    fs.writeFileSync(path.join(extension, 'manifest.json'), JSON.stringify({
      manifest_version: 3, name: 'TripScouts', version: '1.0.0', action: {}, background: { service_worker: 'background.js' }
    }));
    context = await chromium.launchPersistentContext(path.join(tmp, 'profile'), {
      headless: true,
      channel: 'chromium',
      executablePath: process.env.PW_CHROMIUM || undefined,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14526.64.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await page.goto(new URL('/index.html', worker.url()).href);
    await expect(page.locator('html')).toHaveClass(/ready/);
    await expect(page.locator('#installBar')).toBeHidden();
  } finally {
    if (context) await context.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('elk bestand in de offline-lijst bestaat, en elk spelbestand staat erin', async () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const core = [...sw.match(/const CORE = \[([\s\S]*?)\];/)[1].matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
  for (const f of core) expect(fs.existsSync(path.join(root, f)), f).toBe(true);
  for (const dir of ['js', 'css', 'icons', 'fonts'])
    for (const f of fs.readdirSync(path.join(root, dir)).filter(f => dir !== 'fonts' || f.endsWith('.woff2'))) expect(core, `${dir}/${f} staat niet in sw.js`).toContain(`${dir}/${f}`);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const f of fs.readdirSync(path.join(root, 'js'))) expect(html, `js/${f} wordt niet geladen in index.html`).toContain(`js/${f}`);
});

test('het titelscherm toont de versie, en een nieuwere versie biedt herladen aan', async ({ page }) => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const cacheVersion = +sw.match(/const CACHE = 'cabinweek-v(\d+)'/)[1];
  await page.goto('/');
  await expect(page.locator('#version')).toHaveText('v' + cacheVersion);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await expect(page.locator('#update-bar')).toBeHidden();
  await page.evaluate(v => swVersion('cabinweek-v' + (v + 1)), cacheVersion);
  await expect(page.locator('#update-bar')).toBeVisible();
});

test('de service worker wist alleen zijn eigen oude caches', async () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  expect(sw).toContain("k.startsWith('cabinweek-')");
});

test('de privacypagina (voor Google Play) bestaat, staat op de site en zegt dat er niets verzameld wordt', async ({ page }) => {
  const build = fs.readFileSync(path.join(root, 'tools', 'build-site.js'), 'utf8');
  expect(build).toContain("'privacy.html'");
  await page.goto('/privacy.html');
  await expect(page.locator('h1').first()).toHaveText('Privacy');
  await expect(page.locator('main')).toContainText('collects no personal data');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});

test('iPhone en iPad: op het beginscherm op volledig scherm, geen tekstvergroting bij draaien', async ({ page }) => {
  await page.goto('/');
  for (const name of ['apple-mobile-web-app-capable', 'apple-mobile-web-app-title', 'apple-mobile-web-app-status-bar-style'])
    await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  const adjust = await page.evaluate(() => getComputedStyle(document.documentElement).webkitTextSizeAdjust || getComputedStyle(document.documentElement).textSizeAdjust);
  expect(adjust).toBe('100%');
});
