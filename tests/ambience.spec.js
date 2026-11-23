// Optional background sounds that fit the place (js/ambience.js): wind, birds, waves, a fire, drips, bells, cicadas.
const { test, expect } = require('@playwright/test');
const { seed, startDay } = require('./helpers');

test('every day of every region has background sounds that fit, and every sound exists', async ({ page }) => {
  await seed(page);
  const out = await page.evaluate(() => {
    const bad = [], kinds = {};
    for (const r of REGIONS) {
      setRegion(r.id);
      LEVELS.forEach((d, i) => {
        const k = ambKind(d);
        if (!k || !k.beds.length) bad.push(`${r.id} ${i + 1}: no sound`);
        for (const b of k.beds) if (!(b in AMB_BEDS)) bad.push(`${r.id} ${i + 1}: bed ${b}`);
        for (const e of k.events) if (!AMB_EVENTS[e]) bad.push(`${r.id} ${i + 1}: event ${e}`);
        kinds[`${r.id} ${i + 1}`] = k;
      });
    }
    setRegion('ardennes');
    return { bad, kinds };
  });
  expect(out.bad).toEqual([]);
  const k = out.kinds;
  expect(k['ardennes 4'].beds).toEqual(['room']);                 // Paul's birthday, indoors: a fire
  expect(k['ardennes 4'].events).toContain('crackle');
  expect(k['ardennes 3'].events).toEqual(['bells']);             // the quiet day: only far-off bells
  expect(k['ardennes 5'].beds).toContain('wind');                // Christmas Day in the snow
  expect(k['ardeche 4'].beds).toEqual(['cave']);                 // the Chauvet Cave: drips
  expect(k['ardeche 2'].beds).toContain('river');                // the canoe ride
  expect(k['ardeche 1'].beds).toContain('cicadas');
  expect(k['dalmatia 1'].beds).toContain('waves');
  expect(k['smaland 3'].events).toContain('bird');
  expect(k['scotland 1'].beds).toContain('shower');              // changeable weather: rain in the showers
});

test('off by default; the button turns it on and it plays in a level, not in the menu', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#ambBtn')).toHaveText('🌲 Ambience off');
  await startDay(page, 0);
  expect(await page.evaluate(() => AMB)).toBeNull();

  await page.locator('#hud button', { hasText: 'Menu' }).click();
  await page.locator('#settingsOpen').click();
  await page.locator('#ambBtn').click();
  await expect(page.locator('#ambBtn')).toHaveText('🌲 Ambience on');
  await expect(page.locator('#ambBtn')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('cabin-week-ambience'))).toBe('1');

  await page.locator('#settingsBack').click();
  await startDay(page, 0);
  await expect.poll(() => page.evaluate(() => AMB && AMB.k.beds.join())).toBe('wind');
  // every little sound plays without errors
  expect(await page.evaluate(() => { for (const e in AMB_EVENTS) AMB_EVENTS[e](); return true; })).toBe(true);
  await page.locator('#hud button', { hasText: 'Menu' }).click();
  await expect.poll(() => page.evaluate(() => AMB)).toBeNull();

  // remembered, and in Dutch
  await seed(page, { lang: 'nl' });
  await page.evaluate(() => localStorage.setItem('cabin-week-ambience', '1'));
  await page.reload();
  await expect(page.locator('#ambBtn')).toHaveText('🌲 Sfeergeluid aan');
});

test('after a level, settings, help and progress stay quiet but level screens keep their ambience', async ({ page }) => {
  await seed(page);
  await page.locator('#settingsOpen').click();
  await page.locator('#ambBtn').click();
  await page.locator('#settingsBack').click();
  await page.locator('#levels button').first().click();
  await expect.poll(() => page.evaluate(() => AMB && AMB.k.beds.join())).toBe('wind');
  await page.locator('#card .btn').first().click();
  await expect.poll(() => page.evaluate(() => AMB && AMB.k.beds.join())).toBe('wind');
  await page.evaluate(() => openPad());
  await expect.poll(() => page.evaluate(() => AMB && AMB.k.beds.join())).toBe('wind');
  await page.evaluate(() => setScreen('card'));
  await expect.poll(() => page.evaluate(() => AMB && AMB.k.beds.join())).toBe('wind');
  await page.evaluate(() => setScreen('play'));
  await page.locator('#hMenu').click();
  await expect.poll(() => page.evaluate(() => AMB)).toBeNull();

  await page.locator('#settingsOpen').click();
  expect(await page.evaluate(() => AMB)).toBeNull();
  await page.locator('#settingsBack').click();
  await page.locator('#helpOpen').click();
  expect(await page.evaluate(() => AMB)).toBeNull();
  await page.locator('#helpBack').click();
  await page.locator('#regionBtn').click();
  await page.locator('#mapSave').click();
  expect(await page.evaluate(() => AMB)).toBeNull();
});
