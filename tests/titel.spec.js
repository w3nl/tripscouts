// The title screen and the languages. TripScouts has no calendar: days unlock as you play.
const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
const { KEY, seed } = require('./helpers');

test('a new player: 8 days to play, and day 1 is the next one', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#cdNum')).toHaveText('8');
  await expect(page.locator('#special')).toBeHidden();
  await expect(page.locator('#ticker')).toBeVisible();
  await expect(page.locator('#week li.today .dd')).toHaveText('1');
  await expect(page.locator('#levels button.today')).toHaveCount(1);
  await expect(page.locator('#levels button').first()).toHaveClass(/today/);
});

test('progress: the title shows how many days are done and which day is next', async ({ page }) => {
  await seed(page, { unlocked: 4 });
  await page.evaluate(KEY => { const s = JSON.parse(localStorage.getItem(KEY)); s.best = { 0: 3, 1: 5, 2: 2 }; localStorage.setItem(KEY, JSON.stringify(s)); }, KEY);
  await page.reload();
  await expect(page.locator('#cdNum')).toHaveText('3/8');
  await expect(page.locator('#week li.past')).toHaveCount(3);
  await expect(page.locator('#week li.today .dd')).toHaveText('4');
  await expect(page.locator('#levels button').nth(3)).toHaveClass(/today/);
});

test('the whole week done', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await page.evaluate(KEY => { const s = JSON.parse(localStorage.getItem(KEY)); s.best = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 }; localStorage.setItem(KEY, JSON.stringify(s)); }, KEY);
  await page.reload();
  await expect(page.locator('.count')).toContainText('🏆');
  await expect(page.locator('#cdWord')).toHaveText('Trip scouted!');
});

test('the name is TripScouts, and the title tells the story: you scout the trips for the families', async ({ page }) => {
  await seed(page);
  await expect(page).toHaveTitle('TripScouts');
  await expect(page.locator('#title h1')).toHaveText('TripScouts');
  await expect(page.locator('#title .tagline')).toHaveText('Two families, ten trips. You scout where they go!');
  await expect(page.locator('#cdWord')).toHaveText('winter days to scout');
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect([manifest.name, manifest.short_name]).toEqual(['TripScouts', 'TripScouts']);
  // every trip has a scout's verdict, in both languages
  expect(await page.evaluate(() => REGIONS.filter(r => !r.verdict || !r.verdict.startsWith('⭐')).map(r => r.id))).toEqual([]);
  await seed(page, { lang: 'nl' });
  await expect(page.locator('#title .tagline')).toHaveText('Twee gezinnen, tien reizen. Jij verkent waar ze heen gaan!');
  await expect(page.locator('#cdWord')).toHaveText('winterdagen om te verkennen');
});

test('English by default; Dutch with ?lang=nl and with the language button, and the choice is remembered', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await expect(page.locator('#title h2').first()).toContainText('Choose your hero');
  await expect(page.locator('#levels .n').first()).toContainText('Day 1');
  await page.locator('#settingsOpen').click();
  await page.locator('button[data-lang="nl"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await expect(page.locator('#title h2').first()).toContainText('Kies je held');
  await expect(page.locator('#levels .n').first()).toContainText('Dag 1');
  await expect(page.locator('button[data-lang="nl"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await page.goto('/?lang=en');
  await expect(page.locator('#title h2').first()).toContainText('Choose your hero');
});

test.describe('Dutch browser language', () => {
  test.use({ locale: 'nl-BE' });

  test('starts in Dutch until a language is chosen, and link choices still take precedence', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await expect(page.locator('#title h2').first()).toContainText('Kies je held');
    expect(await page.evaluate(() => localStorage.getItem('cabin-week-lang'))).toBeNull();
    await page.locator('#settingsOpen').click();
    await page.locator('button[data-lang="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await page.goto('/?lang=nl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  });

  test('detects Dutch even when local storage is unavailable', async ({ page }) => {
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
    await expect(page.locator('#title h2').first()).toContainText('Kies je held');
  });
});

test.describe('other browser languages', () => {
  test.use({ locale: 'fr-FR' });

  test('fall back to English', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    expect(await page.evaluate(() => localStorage.getItem('cabin-week-lang'))).toBeNull();
  });
});

test('an automatic language follows a change in the browser language until the player chooses', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'language', { get: () => sessionStorage.getItem('test-browser-language') || 'nl-NL' });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await page.evaluate(() => sessionStorage.setItem('test-browser-language', 'en-GB'));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  await page.locator('#settingsOpen').click();
  await page.locator('button[data-lang="nl"]').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nl');
});

test('trip choice is explicit and settings and help return to the title with Escape or TV Back', async ({ page }) => {
  await seed(page, { lang: 'nl' });
  await expect(page.locator('#regionBtn')).toContainText('Andere reis');
  await expect(page.locator('#regionBtn')).toContainText('Ardennen');
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapWrap')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#settingsOpen').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#settingsWrap')).toBeVisible();
  await expect(page.locator('button[data-lang="en"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title')).toBeVisible();
  await page.locator('#helpOpen').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#helpWrap')).toContainText('Met een controller');
  expect(await page.evaluate(() => window.tvBack())).toBe(true);
  await expect(page.locator('#title')).toBeVisible();
});

test('all title actions can be reached with directional menu navigation', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const reached = await page.evaluate(() => {
    const buttons = gpFocusables(), start = document.activeElement;
    const seen = new Set([start]), queue = [start];
    while (queue.length) {
      const current = queue.shift();
      for (const dir of ['up', 'down', 'left', 'right']) {
        current.focus();
        gpMove(dir);
        const next = document.activeElement;
        if (buttons.includes(next) && !seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    return [...seen].map(button => button.id);
  });
  expect(reached).toEqual(expect.arrayContaining(['regionBtn', 'settingsOpen', 'helpOpen']));
});

// The original game was made for one family. This list holds the first 16 hex digits of the SHA-256 of words
// (lower case) that must never appear: the real surnames, first names and village, and a name from a special day.
// (The Ardennes is fine: it is one of the regions on the map.)
// Hashed, so the test itself does not contain the personal information.
const BANNED = new Set([
  '07c28eb9f259fc93',
  '1c4fe3992988ec78',
  '37742e00d990d888',
  '4ebfd3d661633441',
  '546f6aa3973a2344',
  '5a0521604876bda8',
  '68fc8a764bb9de4d',
  '75e80035bd7ece43',
  '8cc2d053ad847fc1',
  '90b8de4051f02b7a',
  'a5969856c8a57fd0',
  'c96623c777c68917',
  'e8fb803a42bff958'
]);

test('no real places, dates or people from the original game', async ({ page }) => {
  for (const lang of ['en', 'nl']) {
    await seed(page, { unlocked: 8, lang });
    const text = await page.evaluate(() => document.body.innerText + JSON.stringify(LEVELS) + JSON.stringify(JOKES) + JSON.stringify(CHARS));
    const words = new Set(text.toLowerCase().match(/[\p{L}]+/gu));
    const found = [...words].filter(w => BANNED.has(crypto.createHash('sha256').update(w).digest('hex').slice(0, 16)));
    expect(found).toEqual([]);
    expect(text).not.toContain('2026');
  }
});

test("day 4 is Paul's birthday: he wears a party hat", async ({ page }) => {
  await seed(page, { unlocked: 8 });
  expect(await page.evaluate(() => LEVELS[3].birthday)).toBe('Paul');
});

test('the menu links to the source code, the licence and the privacy policy, like the escape rooms', async ({ page }) => {
  await seed(page);
  const src = page.locator('#credits a', { hasText: 'Source code' }), lic = page.locator('#credits a', { hasText: 'Licence (GPL-3.0)' });
  await expect(src).toHaveAttribute('href', 'https://github.com/w3nl/tripscouts');
  await expect(lic).toHaveAttribute('href', 'https://github.com/w3nl/tripscouts/blob/main/LICENSE');
  await expect(src).toBeVisible();
  const privacy = page.locator('.version a[href="privacy.html"]');
  await expect(privacy).toHaveText('Privacy policy');
  await expect(privacy).toBeVisible();
  await expect(privacy).not.toHaveAttribute('target', /.+/);   // the same window, so it also works in the Android and Linux apps
  await seed(page, { lang: 'nl' });
  await expect(page.locator('#credits')).toContainText('Broncode');
  await expect(page.locator('#credits')).toContainText('Licentie (GPL-3.0)');
  await expect(privacy).toHaveText('Privacybeleid');
  await privacy.click();
  await expect(page).toHaveURL(/\/privacy\.html$/);
  await expect(page.locator('h1').first()).toHaveText('Privacy');
  await page.getByRole('link', { name: 'To the game' }).click();
  await expect(page.locator('html')).toHaveClass(/ready/);
});
