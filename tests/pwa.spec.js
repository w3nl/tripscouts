const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs'), path = require('path'), os = require('os');
const root = path.join(__dirname, '..');

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
