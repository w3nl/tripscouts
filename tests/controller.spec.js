const { test, expect } = require('@playwright/test');
const { seed, skip } = require('./helpers');

// Een nagebootste PlayStation-controller (standaardindeling): de test zet knoppen en de stick, het spel leest ze elke frame.
async function fakePad(page) {
  await page.addInitScript(() => {
    window.__pad = { buttons: new Array(17).fill(0), axes: [0, 0, 0, 0] };
    window.__rumble = 0;
    navigator.getGamepads = () => [{
      id: 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)', index: 0, connected: true, mapping: 'standard',
      axes: window.__pad.axes.slice(),
      buttons: window.__pad.buttons.map(v => ({ pressed: v > .5, value: v })),
      vibrationActuator: { playEffect() { window.__rumble++; return Promise.resolve('complete'); } }
    }];
  });
}
const BTN = { A: 0, B: 1, X: 2, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
async function press(page, b, ms = 90) {
  await page.evaluate(b => { window.__pad.buttons[b] = 1; }, b);
  await page.waitForTimeout(ms);
  await page.evaluate(b => { window.__pad.buttons[b] = 0; }, b);
  await page.waitForTimeout(60);
}

test('de controller wordt herkend, en met ✕ kies je een dag en begin je', async ({ page }) => {
  await fakePad(page);
  await seed(page);
  await expect(page.locator('#gpStatus')).toContainText('PlayStation controller connected');
  // de focus staat meteen op de laatst vrijgespeelde dag
  await expect(page.locator('#levels button').first()).toBeFocused();
  await press(page, BTN.A);                          // kies de dag
  await expect(page.locator('#cardWrap')).toBeVisible();
  await press(page, BTN.A);                          // "Spelen"
  await expect(page.locator('#hud')).toBeVisible();
  await expect(page.locator('#touch')).toBeHidden();
});

test('met de pijltjes kies je een ander personage', async ({ page }) => {
  await fakePad(page);
  await seed(page, { char: 0 });
  await expect(page.locator('#levels button').first()).toBeFocused();
  for (let i = 0; i < 3 && !(await page.evaluate(() => !!document.activeElement.closest('#chars'))); i++) await press(page, BTN.UP);
  expect(await page.evaluate(() => !!document.activeElement.closest('#chars'))).toBe(true);
  // omhoog komt uit bij het personage dat erboven staat; helemaal naar links is Paul
  for (let i = 0; i < 4; i++) await press(page, BTN.LEFT);
  await expect(page.locator('#chars button').first()).toBeFocused();
  await press(page, BTN.RIGHT);
  await press(page, BTN.RIGHT);
  await press(page, BTN.A);
  await expect(page.locator('#chars button').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#chars button').nth(2)).toBeFocused();   // de focus blijft op dezelfde plek
});

for (const [name, ua, id, url] of [
  ['Chrome Web Store', 'Mozilla/5.0 (X11; CrOS x86_64 14526.64.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', 'installChrome', 'https://chromewebstore.google.com/detail/tripscouts/pcpdooenjphohflgmclkpachhfonjokc'],
  ['Google Play', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36', 'installPlay', 'https://play.google.com/store/apps/details?id=nl.w3nl.cabinweek'],
]) {
  test(`met de controller kies en open je ${name}`, async ({ page }) => {
    await fakePad(page);
    await page.addInitScript(ua => Object.defineProperty(navigator, 'userAgent', { get: () => ua }), ua);
    await page.route('**/*', route => route.request().url() === url
      ? route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Store link opened</title>' })
      : route.continue());
    await seed(page);
    const link = page.locator('#' + id);
    await expect(link).toBeVisible();
    await page.mouse.click(1, 1);
    await page.locator('#installClose').focus();
    await press(page, BTN.LEFT);
    await expect(link).toBeFocused();
    await expect(link).toHaveCSS('outline-width', '4px');
    await page.evaluate(() => { window.__pad.buttons[0] = 1; });
    await expect(page).toHaveURL(url);
  });
}

test('with a controller, web-app installation falls back to Chrome menu instructions', async ({ page }) => {
  await fakePad(page);
  await page.addInitScript(() => Object.defineProperty(navigator, 'userAgent', { get: () => 'Mozilla/5.0 (X11; CrOS x86_64 14526.64.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36' }));
  await seed(page);
  await page.evaluate(() => {
    window.__gevraagd = false;
    const e = new Event('beforeinstallprompt', { cancelable: true });
    e.prompt = () => { window.__gevraagd = true; };
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    dispatchEvent(e);
  });
  const install = page.locator('#installBtn');
  await expect(install).toBeVisible();
  await page.mouse.click(1, 1);
  await page.locator('#installClose').focus();
  await press(page, BTN.LEFT);
  await press(page, BTN.LEFT);
  await expect(install).toBeFocused();
  await press(page, BTN.A);
  await expect(page.locator('#installText')).toContainText('open Chrome');
  expect(await page.evaluate(() => window.__gevraagd)).toBe(false);
});

test('lopen met de stick, springen met ✕, praten met □, verder met ✕, en Start voor het menu', async ({ page }) => {
  await fakePad(page);
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  const x0 = await page.evaluate(() => P.x);
  await page.evaluate(() => { window.__pad.axes[0] = 1; });
  await page.waitForTimeout(400);
  await page.evaluate(() => { window.__pad.axes[0] = 0; });
  expect(await page.evaluate(() => P.x)).toBeGreaterThan(x0 + 30);
  await page.evaluate(() => { window.__pad.buttons[0] = 1; });
  await expect.poll(() => page.evaluate(() => P.vy < 0 || !P.onGround)).toBe(true);
  await page.evaluate(() => { window.__pad.buttons[0] = 0; });
  await expect.poll(() => page.evaluate(() => P.onGround)).toBe(true);
  // naar het eerste bordje en lezen
  await page.evaluate(() => { const s = L.signs[0]; P.x = s.x + 5; P.y = s.y + 32 - P.h; });
  await page.waitForTimeout(100);
  await press(page, BTN.X);
  await expect(page.locator('#dialog')).toBeVisible();
  for (let i = 0; i < 4 && await page.locator('#dialog').isVisible(); i++) await press(page, BTN.A);
  await expect(page.locator('#dialog')).toBeHidden();
  await press(page, BTN.START);
  await expect(page.locator('#title')).toBeVisible();
  // terug in het menu staat de focus meteen weer op een dag, zodat je met de controller verder kunt
  await expect(page.locator('#levels button').first()).toBeFocused();
});

test('het codeslot met de controller: kiezen, typen en met ○ sluiten', async ({ page }) => {
  await fakePad(page);
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await page.evaluate(() => openPad());
  await expect(page.locator('#padWrap')).toBeVisible();
  // hierboven is met de muis geklikt, dus nog geen focus: de eerste druk op ✕ zet hem op de 1
  await press(page, BTN.A);
  await expect(page.locator('#keys button').first()).toBeFocused();
  await press(page, BTN.RIGHT);                      // naar de 2
  await press(page, BTN.A);
  await expect(page.locator('#digits span').first()).toHaveText('2');
  await press(page, BTN.B);
  await expect(page.locator('#padWrap')).toBeHidden();
  await expect(page.locator('#hud')).toBeVisible();
});

test('de controller trilt even als je geraakt wordt', async ({ page }) => {
  await fakePad(page);
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await page.evaluate(() => { P.inv = 0; hurt('Au!'); });
  expect(await page.evaluate(() => window.__rumble)).toBeGreaterThan(0);
});

test('zonder controller verandert er niets', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#gpStatus')).toBeHidden();
  expect(await page.evaluate(() => GP.on)).toBe(false);
});

/* ---------- Tv-afstandsbediening en de Google TV-app ---------- */

test('afstandsbediening: met de pijltjes en OK (Enter) kies je een dag en begin je', async ({ page }) => {
  await seed(page);
  // de focus staat meteen op de laatst vrijgespeelde dag (geen muis gebruikt)
  await expect(page.locator('#levels button').first()).toBeFocused();
  await page.keyboard.press('ArrowUp');                      // naar de personages en terug
  expect(await page.evaluate(() => !!document.activeElement.closest('#chars'))).toBe(true);
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#levels button').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#cardWrap')).toBeVisible();
  await page.keyboard.press('Enter');                        // "Spelen" heeft de focus
  await expect(page.locator('#hud')).toBeVisible();
  // in het spel blijven de pijltjes gewoon lopen
  const x0 = await page.evaluate(() => P.x);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(() => P.x)).toBeGreaterThan(x0 + 20);
});

test('afstandsbediening: het codeslot met pijltjes en OK, en een getypte code met Enter', async ({ page }) => {
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await page.evaluate(() => openPad());
  await page.keyboard.type('4944');                          // typen en versturen werkt zoals altijd
  await expect(page.locator('#padWrap')).toBeHidden();
  await page.evaluate(() => { L.codeOpen = false; openPad(); });
  await page.keyboard.press('ArrowRight');                   // van de 1 naar de 2
  await page.keyboard.press('Enter');
  await expect(page.locator('#digits span').first()).toHaveText('2');
});

test('de terug-knop: een stap terug, en op het titelscherm mag de app sluiten', async ({ page }) => {
  await seed(page);
  expect(await page.evaluate(() => tvBack())).toBe(false);                    // titelscherm: app sluit
  await page.locator('#levels button').first().click();
  expect(await page.evaluate(() => tvBack())).toBe(true);                     // introkaart: terug naar het menu
  await expect(page.locator('#title')).toBeVisible();
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await page.evaluate(() => openPad());
  expect(await page.evaluate(() => tvBack())).toBe(true);                     // codeslot dicht
  await expect(page.locator('#padWrap')).toBeHidden();
  expect(await page.evaluate(() => tvBack())).toBe(true);                     // spel: terug naar het menu
  await expect(page.locator('#title')).toBeVisible();
});

test('in de Google TV-app: de controller die de app doorgeeft werkt', async ({ page }) => {
  await page.addInitScript(() => { window.__nativePad = { buttons: new Array(17).fill(0), axes: [0, 0, 0, 0] }; });
  await seed(page);
  await expect(page.locator('#gpStatus')).toContainText('connected');
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  const x0 = await page.evaluate(() => P.x);
  await page.evaluate(() => { window.__nativePad = { buttons: new Array(17).fill(0), axes: [1, 0, 0, 0] }; });
  await page.waitForTimeout(400);
  await page.evaluate(() => { window.__nativePad = { buttons: new Array(17).fill(0), axes: [0, 0, 0, 0] }; });
  expect(await page.evaluate(() => P.x)).toBeGreaterThan(x0 + 30);
});

test('in de Google TV-app: een snelle tik op ✕ telt, ook als drukken en loslaten tussen twee beelden vallen', async ({ page }) => {
  const pad = (presses) => ({ buttons: new Array(17).fill(0), presses, axes: [0, 0, 0, 0] });
  await page.addInitScript(() => { window.__nativePad = { buttons: new Array(17).fill(0), presses: new Array(17).fill(0), axes: [0, 0, 0, 0] }; });
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await skip(page);
  await expect.poll(() => page.evaluate(() => P.onGround)).toBe(true);
  // De knop is al weer los (buttons 0), maar de teller voor ✕ (knop 0) is opgehoogd: dat is een tik.
  const p = new Array(17).fill(0); p[0] = 1;
  await page.evaluate(np => { window.__nativePad = np; }, pad(p));
  await expect.poll(() => page.evaluate(() => P.vy < 0 || !P.onGround)).toBe(true);
});

test('in de Google TV-app: een tikje naar rechts laat het poppetje maar een klein stukje lopen', async ({ page }) => {
  await page.addInitScript(() => { window.__nativePad = { buttons: new Array(17).fill(0), presses: new Array(17).fill(0), axes: [0, 0, 0, 0] }; });
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await skip(page);
  await expect.poll(() => page.evaluate(() => P.onGround)).toBe(true);
  const x0 = await page.evaluate(() => P.x);
  // Een tikje van 80 ms naar rechts, terwijl de pagina 400 ms druk is (een trage tv): het spel ziet het indrukken én
  // loslaten pas daarna, maar weet van de app hoe lang het tikje duurde.
  await page.evaluate(() => {
    window.__tvDir(1, 0);
    const t0 = performance.now(); while (performance.now() - t0 < 400) { /* druk */ }
    window.__tvDir(0, 320);
  });
  await page.waitForTimeout(600);
  const dx = await page.evaluate(x0 => P.x - x0, x0);
  expect(dx).toBeGreaterThan(2);
  expect(dx).toBeLessThan(40); // ongeveer één tegel, niet de 400 ms die het bericht onderweg was
});

test('rennen met R1 op de controller', async ({ page }) => {
  await page.addInitScript(() => {
    window.__pad = { id: 'Wireless Controller (STANDARD GAMEPAD Vendor: 054c)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    navigator.getGamepads = () => [window.__pad];
  });
  await seed(page);
  await page.locator('#levels button').first().click();
  await page.locator('#card .btn').first().click();
  await skip(page);
  await page.evaluate(() => { window.__pad.buttons[5] = { pressed: true, value: 1 }; window.__pad.axes = [1, 0, 0, 0]; });
  await expect.poll(() => page.evaluate(() => P.vx), { timeout: 3000 }).toBeGreaterThan(5.5);
  await page.evaluate(() => { window.__pad.buttons[5] = { pressed: false, value: 0 }; window.__pad.axes = [0, 0, 0, 0]; });
});

// Your own hero with only a controller: every row can be changed, and the name is typed with letters on screen.
test('with a controller you make your own hero: every row, and a name with the letters on screen', async ({ page }) => {
  await fakePad(page);
  await seed(page);
  await page.evaluate(() => $('ownHero').focus());
  await press(page, BTN.A);
  await expect(page.locator('#heroWrap')).toBeVisible();
  await expect(page.locator('#heroDone')).toBeFocused();
  // the name: ↑ to the field, ✕ shows the letters; spell "Sam", ○ closes them and keeps the name
  await press(page, BTN.UP);
  await expect(page.locator('#heroName')).toBeFocused();
  await press(page, BTN.A);
  await expect(page.locator('#heroKeys')).toBeVisible();
  await expect(page.locator('#heroRows')).toBeHidden();
  await expect(page.locator('#heroKeys .key').first()).toBeFocused();   // A
  const keyAt = async ch => page.evaluate(ch => [...document.querySelectorAll('#heroKeys .key')].indexOf(document.activeElement) === [...document.querySelectorAll('#heroKeys .key')].findIndex(k => k.textContent === ch), ch);
  // S: three rows down from A is V, so go down twice (O) and right four times (S)
  await press(page, BTN.DOWN); await press(page, BTN.DOWN);
  for (let i = 0; i < 4; i++) await press(page, BTN.RIGHT);
  expect(await keyAt('S')).toBe(true);
  await press(page, BTN.A);
  // A: back up to the top left
  await press(page, BTN.UP); await press(page, BTN.UP);
  for (let i = 0; i < 4; i++) await press(page, BTN.LEFT);
  expect(await keyAt('A')).toBe(true);
  await press(page, BTN.A);
  // M: second row, sixth letter
  await press(page, BTN.DOWN);
  for (let i = 0; i < 5; i++) await press(page, BTN.RIGHT);
  expect(await keyAt('M')).toBe(true);
  await press(page, BTN.A);
  await expect(page.locator('#heroName')).toHaveValue('Sam');
  await press(page, BTN.B);
  await expect(page.locator('#heroKeys')).toBeHidden();
  await expect(page.locator('#heroWrap')).toBeVisible();
  await expect(page.locator('#heroDone')).toBeFocused();
  // the rows: → past Surprise me and Back into the rows, then go to "Glasses" and choose the last option
  for (let i = 0; i < 4 && !await page.evaluate(() => document.activeElement.dataset.key); i++) await press(page, BTN.RIGHT);
  for (let i = 0; i < 15 && await page.evaluate(() => document.activeElement.dataset.key) !== 'glasses'; i++)
    await press(page, await page.evaluate(() => HERO_ROWS.findIndex(r => r[0] === document.activeElement.dataset.key) < HERO_ROWS.findIndex(r => r[0] === 'glasses')) ? BTN.DOWN : BTN.UP);
  for (let i = 0; i < 3; i++) await press(page, BTN.RIGHT);
  await press(page, BTN.A);
  expect(await page.evaluate(() => heroDraft.glasses)).toBe('thick');
  // ← along the row and to Done, ✕ saves
  for (let i = 0; i < 6 && !await page.evaluate(() => document.activeElement === $('heroDone')); i++) await press(page, BTN.LEFT);
  await press(page, BTN.A);
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('#ownHero .nm')).toHaveText('Sam');
  expect(await page.evaluate(() => [save.hero.name, save.hero.glasses])).toEqual(['Sam', 'thick']);
});
