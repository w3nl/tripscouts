// Optional voices (js/voice.js): the conversations are read aloud with speechSynthesis when the Voices button is on.
// The test browser has no real voices, so speechSynthesis is replaced by a recorder.
const { test, expect } = require('@playwright/test');
const { seed, startDay, put, skip } = require('./helpers');

const recorder = () => {
  window.__spoken = []; window.__cancels = 0;
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    speak: u => window.__spoken.push({ text: u.text, lang: u.lang, pitch: u.pitch, rate: u.rate }),
    cancel: () => { window.__cancels++; },
    getVoices: () => []
  } });
};
const spoken = page => page.evaluate(() => window.__spoken);
// talk to someone in the level: stand next to them and press E
const talkTo = async (page, name) => {
  const n = await page.evaluate(nm => { const n = L.npcs.find(n => n.who.name === nm) || L.npcs[0]; return { x: n.x, y: n.y, name: n.who.name }; }, name);
  await put(page, n.x + 4, n.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible();
  return n.name;
};

test('voices are off by default; when on, every line is read aloud, each person in their own voice', async ({ page }) => {
  await page.addInitScript(recorder);
  await seed(page);
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#voiceBtn')).toBeVisible();
  await expect(page.locator('#voiceBtn')).toHaveText('🔈 Voices off');
  await page.locator('#settingsBack').click();

  // off: talking says nothing out loud
  await startDay(page, 0);
  await talkTo(page);
  await skip(page);
  expect(await spoken(page)).toEqual([]);

  // on (on the title screen): a short line to hear it works, in British English
  await page.locator('#hud button', { hasText: 'Menu' }).click();
  await page.locator('#settingsOpen').click();
  await page.locator('#voiceBtn').click();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Voices on');
  await expect(page.locator('#voiceBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await spoken(page)).length).toBe(1);
  expect((await spoken(page))[0]).toMatchObject({ text: 'Voices on. Let\'s go scouting!', lang: 'en-GB' });

  // in a level: each line of a conversation is spoken; the next line when you go on
  await page.locator('#settingsBack').click();
  await startDay(page, 0);
  const who = await talkTo(page);
  const lines = await page.evaluate(() => dialog.lines);
  await expect.poll(async () => (await spoken(page)).at(-1).text).toBe(lines[0].replace(/\s+/g, ' ').trim());
  if (lines.length > 1) {
    await page.keyboard.press('Space');
    await expect.poll(async () => (await spoken(page)).at(-1).text).toBe(lines[1].replace(/\s+/g, ' ').trim());
  }
  // a kid sounds higher than a grown-up; signs are the narrator
  const pitch = await page.evaluate(nm => voiceStyle(nm).pitch, who);
  expect((await spoken(page)).at(-1).pitch).toBeCloseTo(pitch);
  expect(await page.evaluate(() => [voiceStyle('Lily').pitch > voiceStyle('Paul').pitch, voiceStyle('Sign').pitch])).toEqual([true, 1]);
  // closing the conversation stops the speech
  const cancels = await page.evaluate(() => window.__cancels);
  await skip(page);
  expect(await page.evaluate(() => window.__cancels)).toBeGreaterThan(cancels);
});

test('emoji and arrows are not read aloud; a line of only emoji stays silent', async ({ page }) => {
  await page.addInitScript(recorder);
  await page.addInitScript(() => localStorage.setItem('cabin-week-voice', '1'));
  await seed(page);
  await page.evaluate(() => { localStorage.setItem('cabin-week-voice', '1'); });
  await page.reload();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Voices on');
  const out = await page.evaluate(() => {
    window.__spoken.length = 0;
    speakLine('Sign', 'Signpost 2 points ↑. 🕯️ You light a candle.');
    speakLine('Sign', '🎄🎁');
    return window.__spoken.map(s => s.text);
  });
  expect(out).toEqual(['Signpost 2 points . You light a candle.']);
});

test('Dutch: the voices speak Dutch, and the button is translated', async ({ page }) => {
  await page.addInitScript(recorder);
  await seed(page, { lang: 'nl' });
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#voiceBtn')).toHaveText('🔈 Stemmen uit');
  await page.locator('#voiceBtn').click();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Stemmen aan');
  await expect.poll(async () => (await spoken(page)).length).toBe(1);
  expect((await spoken(page))[0]).toMatchObject({ text: 'Stemmen aan. Op verkenning!', lang: 'nl-NL' });
  // remembered after a reload
  await page.reload();
  await expect(page.locator('#voiceBtn')).toHaveText('🔊 Stemmen aan');
});

test('where the browser cannot speak (like an Android WebView), there is no Voices button', async ({ page }) => {
  await page.addInitScript(() => { delete window.speechSynthesis; delete window.SpeechSynthesisUtterance; });
  await seed(page);
  await page.locator('#settingsOpen').click();
  await expect(page.locator('#voiceBtn')).toBeHidden();
  await page.locator('#settingsBack').click();
  // and talking still works, silently
  await startDay(page, 0);
  await talkTo(page);
  await skip(page);
});

test('a girl sounds like a girl, a man like a man: the right kind of device voice, and the pitch for their age', async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = [];
    const V = (name, lang) => ({ name, lang, voiceURI: name, default: false, localService: true });
    const voices = [V('Google UK English Female', 'en-GB'), V('Google UK English Male', 'en-GB'), V('Microsoft Sonia', 'en-GB'), V('Microsoft Ryan', 'en-GB'), V('Xander', 'nl-NL')];
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speak: u => window.__spoken.push({ voice: u.voice && u.voice.name, pitch: u.pitch }), cancel: () => {}, getVoices: () => voices } });
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } }; // so a pretend voice can be set
    localStorage.setItem('cabin-week-voice', '1');
  });
  await seed(page);
  const out = await page.evaluate(() => ['Lily', 'Tom', 'Sophie', 'Finn', 'Laura', 'Rob'].map(n => { __spoken.length = 0; speakLine(n, 'Hello!'); return { n, ...__spoken[0] }; }));
  const by = Object.fromEntries(out.map(o => [o.n, o]));
  for (const n of ['Lily', 'Sophie', 'Laura']) expect(by[n].voice).toMatch(/Female|Sonia/);
  for (const n of ['Tom', 'Finn', 'Rob']) expect(by[n].voice).toMatch(/Male|Ryan/);
  // kids higher than teens, teens higher than grown-ups
  expect(by.Lily.pitch).toBeGreaterThan(by.Sophie.pitch); expect(by.Sophie.pitch).toBeGreaterThan(by.Laura.pitch);
  expect(by.Tom.pitch).toBeGreaterThan(by.Finn.pitch); expect(by.Finn.pitch).toBeGreaterThan(by.Rob.pitch);
  // your own hero chooses a voice in the creator
  expect(await page.evaluate(() => { save.hero = { name: 'Noor', size: 'kid', voice: 'f' }; return voiceStyle('Noor'); })).toMatchObject({ kind: 'f', age: 'kid' });
  expect(await page.evaluate(() => { save.hero = { name: 'Bas', size: 'adult', voice: 'm' }; return voiceStyle('Bas'); })).toMatchObject({ kind: 'm', age: 'adult' });
  // a device with only female voices: a man still sounds low
  expect(await page.evaluate(() => { const v = speechSynthesis.getVoices(); v.splice(1, 1); v.splice(2, 1); __spoken.length = 0; speakLine('Rob', 'Hello!'); return __spoken[0].pitch; })).toBeLessThan(.7);
});

test('animals make sounds: every enemy and every lost animal has one, and an animal near you calls now and then', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const missing = await page.evaluate(() => {
    const kinds = new Set();
    for (const id of REGIONS.map(r => r.id)) { setRegion(id); for (const d of LEVELS) { if (d.enemy) kinds.add(d.enemy); if (d.task && d.task.animal) kinds.add(d.task.animal); if (d.moose) kinds.add('alg'); } }
    setRegion('ardennes');
    return [...kinds].filter(k => !ANIMAL_SFX[k]);
  });
  expect(missing).toEqual([]);
  // every sound plays without errors
  expect(await page.evaluate(() => { for (const k in ANIMAL_SFX) animalSound(k, 1); return true; })).toBe(true);
  // in a level: the boars call when you are near
  await startDay(page, 1);
  const heard = await page.evaluate(() => {
    const got = []; const real = animalSound; window.animalSound = (k, l) => got.push(k);
    const e = L.enemies[0]; P.x = e.x - 3 * TS; e.call = 1; L.calls = undefined;
    animalCall(e); window.animalSound = real; return got;
  });
  expect(heard).toEqual(['zwijn']);
});

test('an animal close by comes walking towards you and calls; knocked over, it makes its sound', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const r = await page.evaluate(() => {
    const got = [], real = animalSound; window.animalSound = k => got.push(k);
    window.hurt = () => {};
    const e = L.enemies[0];
    // stand 4 tiles to the left of it, on its ground, while it walks away from you
    P.x = e.x - 4 * TS; P.y = e.y + e.h - P.h; P.vx = P.vy = 0; P.inv = 0; e.vx = Math.abs(e.vx);
    const x0 = e.x; L.calls = undefined;
    for (let i = 0; i < 20; i++) step();
    const towards = e.vx < 0 && e.x < x0, called = got.includes(e.kind);
    // far away: it wanders on at its own pace
    P.x = e.x + 20 * TS; step();
    const calm = !e.chase;
    window.animalSound = real;
    return { towards, called, calm, kind: e.kind, spd: Math.abs(e.vx) === e.spd };
  });
  expect(r).toMatchObject({ towards: true, called: true, calm: true, spd: true });
  // knocked over: its own sound comes right after the stomp
  const after = await page.evaluate(k => new Promise(res => {
    const got = [], real = animalSound; window.animalSound = kk => got.push(kk);
    animalDefeat(k); setTimeout(() => { window.animalSound = real; res(got); }, 300);
  }), r.kind);
  expect(after).toEqual([r.kind]);
});

test('walking away ends a conversation: the balloon closes, the gate still opens, and the voice trails off', async ({ page }) => {
  await page.addInitScript(recorder);
  await page.addInitScript(() => localStorage.setItem('cabin-week-voice', '1'));
  await seed(page);
  await page.evaluate(() => localStorage.setItem('cabin-week-voice', '1'));
  await page.reload();
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    let done = false;
    // you were still walking when the conversation opened: that does not close it
    held.right = true;
    say('Paul', ['First line.', 'Second line.', 'Third line.'], () => { done = true; });
    for (let i = 0; i < 5; i++) step();
    const stillOpen = !!dialog;
    // let go, then walk: the balloon closes and what it was about still happens
    held.right = false; step();
    const cancels = window.__cancels;
    held.right = true; step();
    const closed = !dialog && $('dialog').hidden, x0 = P.x;
    for (let i = 0; i < 20; i++) step();
    held.right = false;
    return { stillOpen, closed, done, walked: P.x > x0, softly: window.__cancels === cancels };
  });
  // the voice is not cut off at once: it stops at the next word, or after about a second
  expect(r).toEqual({ stillOpen: true, closed: true, done: true, walked: true, softly: true });
  await expect.poll(() => page.evaluate(() => window.__cancels)).toBeGreaterThan(0);
});
