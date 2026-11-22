const { test, expect } = require('@playwright/test');
const { seed } = require('./helpers');

const noSideScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('rechtop: het titelscherm past en je kunt met de knoppen op het scherm spelen', async ({ page }) => {
  await seed(page);
  expect(await noSideScroll(page)).toBe(true);
  await page.locator('#levels button').first().tap();
  await page.locator('#card .btn').first().tap();
  await expect(page.locator('#touch')).toBeVisible();
  const x0 = await page.evaluate(() => P.x);
  const right = await page.locator('#tR').boundingBox();
  await page.touchscreen.tap(right.x + right.width / 2, right.y + right.height / 2);
  await page.locator('#tR').dispatchEvent('pointerdown', { pointerId: 1 });
  await page.waitForTimeout(400);
  await page.locator('#tR').dispatchEvent('pointerup', { pointerId: 1 });
  expect(await page.evaluate(() => P.x)).toBeGreaterThan(x0 + 20);
  await page.locator('#tJ').dispatchEvent('pointerdown', { pointerId: 2 });
  await expect.poll(() => page.evaluate(() => P.vy < 0 || !P.onGround)).toBe(true);
  await page.locator('#tJ').dispatchEvent('pointerup', { pointerId: 2 });
  expect(await noSideScroll(page)).toBe(true);
});

test('in de breedte: de bovenbalk en de knoppen passen', async ({ page }) => {
  await page.setViewportSize({ width: 915, height: 412 });
  await seed(page);
  await page.locator('#levels button').first().tap();
  await page.locator('#card .btn').first().tap();
  const hud = await page.locator('#hud').boundingBox();
  expect(hud.height).toBeLessThan(100);
  expect(await noSideScroll(page)).toBe(true);
  await expect(page.locator('#tJ')).toBeInViewport();
});

test('het codeslot past op een telefoon', async ({ page }) => {
  await seed(page);
  await page.locator('#levels button').first().tap();
  await page.locator('#card .btn').first().tap();
  await page.evaluate(() => openPad());
  const fits = await page.locator('#padWrap .pad').evaluate(e => e.getBoundingClientRect().right <= window.innerWidth + 1);
  expect(fits).toBe(true);
  await expect(page.locator('#keys button.ok')).toBeInViewport();
});

for (const [w, h, wat] of [[960, 540, 'tv'], [1366, 768, 'laptop'], [740, 360, 'telefoon in de breedte']]) {
  test(`het menu past in de breedte zonder scrollen (${wat})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await seed(page, { unlocked: 8, lang: 'nl' }); // Dutch: the longest texts
    const r = await page.evaluate(() => ({
      wide: document.documentElement.classList.contains('wide'),
      scroll: document.getElementById('title').scrollHeight > document.getElementById('title').clientHeight + 1 || document.documentElement.scrollWidth > innerWidth,
    }));
    expect(r.wide).toBe(true);
    expect(r.scroll).toBe(false);
    for (const sel of ['#chars button', '#levels button']) {
      const n = await page.locator(sel).count();
      for (let i = 0; i < n; i++) await expect(page.locator(sel).nth(i)).toBeInViewport({ ratio: .99 });
    }
    await expect(page.locator('#title .help')).toBeInViewport({ ratio: .99 });
    await page.locator('#levels button').first().click();
    await expect(page.locator('#card .btn').first()).toBeInViewport({ ratio: .99 });
    await expect(page.locator('#card h2')).toBeInViewport({ ratio: .99 });
  });
}

test('meldingen: installeren als app (Android: web-app of Google Play) en het scherm draaien', async ({ page }) => {
  await seed(page);
  // Rechtop op een Android-telefoon: de draaimelding, en meteen de keuze voor de Android-app uit Google Play
  await expect(page.locator('#rotateHint')).toBeVisible();
  await expect(page.locator('#installBar')).toBeVisible();
  await expect(page.locator('#installPlay')).toBeVisible();
  await expect(page.locator('#installPlay')).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek');
  await expect(page.locator('#installChrome')).toBeHidden();
  await expect(page.locator('#installBtn')).toBeHidden();
  // Chrome biedt installeren aan: de knop voor de web-app komt erbij en opent de vraag van Chrome
  await page.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__gevraagd = true; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); dispatchEvent(e); });
  await expect(page.locator('#installBtn')).toBeVisible();
  await expect(page.locator('#installBtn')).toHaveText('Web app');
  await page.locator('#installBtn').tap();
  expect(await page.evaluate(() => window.__gevraagd)).toBe(true);
  // Draaien naar de breedte: de draaimelding gaat weg
  await page.setViewportSize({ width: 915, height: 412 });
  await expect(page.locator('#rotateHint')).toBeHidden();
});
