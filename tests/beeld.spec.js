// Graphics: the setting (auto, sharp, smooth), auto going down a step on a slow device, and the cheap background.
const { test, expect } = require('@playwright/test');
const { seed, startDay } = require('./helpers');

test.use({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });

test('beeld: automatisch, scherp en soepel; de keuze blijft bewaard', async ({ page }) => {
  await seed(page, { lang: 'nl' });
  await page.locator('#settingsOpen').click();
  const btn = page.locator('#gfxBtn');
  await expect(btn).toHaveText('🖼️ Beeld: automatisch');
  const size = () => page.evaluate(() => [cv.width, cv.height, document.documentElement.classList.contains('lowres')]);
  expect(await size()).toEqual([1920, 1080, false]);       // automatisch begint scherp
  await btn.click();
  await expect(btn).toHaveText('🖼️ Beeld: scherp');
  expect(await size()).toEqual([1920, 1080, false]);
  await btn.click();
  await expect(btn).toHaveText('🖼️ Beeld: soepel');
  expect(await size()).toEqual([960, 540, true]);          // vier keer minder pixels, zacht opgeschaald
  expect(await page.evaluate(() => localStorage.getItem('cabin-week-graphics'))).toBe('smooth');
  await page.reload();
  expect(await size()).toEqual([960, 540, true]);
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#gfxBtn')).toHaveText('🖼️ Beeld: soepel');
  await page.locator('#gfxBtn').click();                   // terug naar automatisch
  await expect(page.locator('#gfxBtn')).toHaveText('🖼️ Beeld: automatisch');
  expect(await size()).toEqual([1920, 1080, false]);
});

test('beeld automatisch: komen de beelden te laat tijdens het spelen, dan een stap minder scherp (en onthouden)', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const result = await page.evaluate(() => {
    window.__gfxWatch = true;                               // tests zetten dit kijken normaal uit
    const before = renderRatio;
    for (let i = 0; i < 600; i++) watchFrames(16.7);        // 10 seconden op tijd: niets verandert
    const steady = renderRatio;
    gfxWatch.t = gfxWatch.late = 0;
    for (let i = 0; i < 120; i++) watchFrames(34);          // 4 seconden alles te laat: één stap (daarna eerst 2 seconden niet kijken)
    return { before, steady, after: renderRatio, saved: localStorage.getItem('cabin-week-graphics-auto'), h: cv.height };
  });
  expect(result).toEqual({ before: 2, steady: 2, after: 1.5, saved: '1.5', h: 810 });
  // in het menu wordt niet gekeken
  const menu = await page.evaluate(() => { toTitle(); for (let i = 0; i < 600; i++) watchFrames(50); return renderRatio; });
  expect(menu).toBe(1.5);
});

test('de achtergrond: lucht en vignet één keer klaargezet, lagen op schermschaal en niet te veel tegelijk', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  for (const region of ['ardennes', 'pole', 'tirol', 'norway', 'netherlands', 'dalmatia', 'veneto']) {
    await seed(page, { region, unlocked: 8 });
    await startDay(page, 0);
    const r = await page.evaluate(() => {
      for (let i = 0; i < 3; i++) render();
      const big = BIG_LAYERS.filter(c => c._big);
      return { cached: SCREEN_CACHE.size, big: big.length, scaled: big.every(c => c._bigK === scale && c._big.width === Math.ceil(LW * scale) + 2) };
    });
    expect(r.cached, region).toBeGreaterThanOrEqual(2);     // de lucht en de vignet
    expect(r.cached, region).toBeLessThanOrEqual(3);
    expect(r.big, region).toBeGreaterThanOrEqual(3);
    expect(r.big, region).toBeLessThanOrEqual(8);
    expect(r.scaled, region).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('na een andere resolutie blijven de lagen klaarstaan (niet elk beeld opnieuw gemaakt)', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    const steps = [];
    for (const ratio of [1.5, 1, .75]) {
      gfxAuto = ratio; resize();
      render(); render();
      const before = BIG_LAYERS.map(c => c._big);
      for (let i = 0; i < 5; i++) render();
      steps.push({ ratio: renderRatio, same: BIG_LAYERS.every((c, i) => c._big && c._big === before[i]), unique: new Set(BIG_LAYERS).size === BIG_LAYERS.length });
    }
    return steps;
  });
  expect(r).toEqual([{ ratio: 1.5, same: true, unique: true }, { ratio: 1, same: true, unique: true }, { ratio: .75, same: true, unique: true }]);
});

test('beeld automatisch: ook bij 10 beelden per seconde of minder een stap omlaag, maar niet na een pauze of een nieuwe grootte', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    window.__gfxWatch = true;
    for (let i = 0; i < 30; i++) watchFrames(16.7);        // de eerste 2 seconden telt niets: eerst wachten
    gfxWatch.skip = 0; gfxWatch.t = gfxWatch.late = 0;
    for (let i = 0; i < 12; i++) watchFrames(5000);        // de pagina wachtte (ander tabblad): telt niet
    const afterPause = renderRatio;
    for (let i = 0; i < 25; i++) watchFrames(150);         // ruim 3 seconden op 6 beelden per seconde
    const slow = renderRatio;
    // na een nieuwe grootte (ook zelf het venster groter maken) begint het kijken opnieuw, met eerst 2 seconden wachten
    gfxWatch.skip = 0; gfxWatch.t = 2900; gfxWatch.late = 2900;
    resize();
    for (let i = 0; i < 10; i++) watchFrames(30);
    return { afterPause, slow, afterResize: renderRatio, waiting: gfxWatch.skip > 0 && gfxWatch.t === 0 };
  });
  expect(r).toEqual({ afterPause: 2, slow: 1.5, afterResize: 1.5, waiting: true });
});

test('het noorderlicht beweegt ook als er per beeld twee stappen voorbijgaan (30 beelden per seconde)', async ({ page }) => {
  await seed(page, { region: 'norway', unlocked: 8 });
  await startDay(page, 0);
  const drawn = await page.evaluate(() => {
    const seen = new Set();
    frame = 1001;                                           // oneven, en dan steeds twee stappen verder
    for (let i = 0; i < 6; i++) { render(); seen.add(AURORA_CV._f); frame += 2; }
    return seen.size;
  });
  expect(drawn).toBeGreaterThanOrEqual(5);
});
