// Regions: the map of Europe, choosing a region, and separate progress per region.
const { test, expect } = require('@playwright/test');
const { KEY, seed, startDay, playDay, skip } = require('./helpers');

test('the map shows the regions; choosing one switches the days, and the choice is remembered', async ({ page }) => {
  await seed(page);
  await expect(page.locator('#regionName')).toHaveText('Ardennes');
  await expect(page.locator('#levels .t').first()).toHaveText('Arrival in Pinebrook');
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapWrap')).toBeVisible();
  await expect(page.locator('#mapBox .pin')).toHaveCount(10);
  await expect(page.locator('#mapBox .pin.here')).toHaveAttribute('data-region', 'ardennes');
  await expect(page.locator('#mapSoon')).toContainText('Iceland');
  await expect(page.locator('#mapSoon')).toContainText('Greece');
  await expect(page.locator('#mapSoon')).not.toContainText('Scotland'); // Scotland is playable now
  await expect(page.locator('#mapSoon')).not.toContainText('Ardèche'); // and the Ardèche too
  await expect(page.locator('#mapSoon')).not.toContainText('Veneto'); // and the Veneto
  await expect(page.locator('#mapSoon')).toContainText('Iceland');
  await expect(page.locator('#mapSoon')).not.toContainText('Småland'); // Småland is playable now
  await expect(page.locator('#mapBox .soon-dot')).toHaveCount(4);
  await page.locator('#mapBox .pin[data-region="tirol"]').click();
  await expect(page.locator('#title')).toBeVisible();
  await expect(page.locator('#regionName')).toHaveText('Tirol');
  await expect(page.locator('#eyebrow')).toContainText('Tirol');
  await expect(page.locator('#levels .t').first()).toHaveText('Arrival in Lindenalm');
  await expect(page.locator('#week li').nth(2)).toContainText('Cable car');
  await page.reload();
  await expect(page.locator('#regionName')).toHaveText('Tirol');
  await page.locator('#regionBtn').click();
  await page.locator('#mapBox .pin[data-region="scotland"]').click();
  await expect(page.locator('#regionName')).toHaveText('Scotland');
  await expect(page.locator('#levels .t').first()).toHaveText('Arrival in Glen Rowan');
  await page.reload();
  await expect(page.locator('#regionName')).toHaveText('Scotland');
  expect(await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)).region, KEY)).toBe('scotland');
});

test('every region starts at day 1: you do not have to finish the Ardennes first', async ({ page }) => {
  await seed(page);
  for (const id of ['pole', 'tirol', 'norway', 'scotland', 'ardeche', 'veneto']) {
    await page.evaluate(id => { setRegion(id, true); toTitle(); }, id);
    await expect(page.locator('#levels button').first()).toBeEnabled();
    await expect(page.locator('#levels button').nth(1)).toBeDisabled();
  }
});

test('progress is kept per region, and an old save still counts for the Ardennes', async ({ page }) => {
  await seed(page, { unlocked: 3 });
  await page.evaluate(() => { setRegion('norway', true); toTitle(); });
  await expect(page.locator('#levels button').nth(1)).toBeDisabled();
  await startDay(page, 0);
  await playDay(page);
  await expect(page.locator('#card')).toContainText('Next day: Tuesday');
  await page.reload();
  await expect(page.locator('#levels button').nth(1)).toBeEnabled();
  await expect(page.locator('#cdNum')).toHaveText('1/8');
  const s = await page.evaluate(KEY => JSON.parse(localStorage.getItem(KEY)), KEY);
  expect(s.unlocked).toBe(3);
  expect(s.regions.norway.unlocked).toBe(2);
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapBox .pin[data-region="norway"] small')).toHaveText('1/8');
  await page.locator('#mapBox .pin[data-region="ardennes"]').click();
  await expect(page.locator('#levels button').nth(2)).toBeEnabled();
  await expect(page.locator('#levels button').nth(3)).toBeDisabled();
});

test('the map works with the keyboard and the remote: arrows, Enter, and Escape goes back', async ({ page }) => {
  await seed(page);
  await page.locator('#regionBtn').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mapWrap')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title')).toBeVisible();
  await page.locator('#regionBtn').click();
  await page.locator('#mapBox .pin.here').focus();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#mapBox .pin[data-region="norway"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#regionName')).toHaveText('Norway');
});

test('the new regions have their own scenery, enemies and checkpoint flags', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const info = await page.evaluate(() => REGIONS.map(r => ({ id: r.id, n: r.levels.length, scenes: [...new Set(r.levels.map(l => l.scene || l.theme))], enemies: [...new Set(r.levels.filter(l => l.enemies !== false).map(l => l.enemy))] })));
  expect(info.map(r => r.n)).toEqual([8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
  expect(info.find(r => r.id === 'pole').scenes).toContain('pole');
  expect(info.find(r => r.id === 'tirol').enemies).toContain('geit');
  expect(info.find(r => r.id === 'norway').enemies).toContain('troll');
  expect(info.find(r => r.id === 'pole').enemies).toEqual(expect.arrayContaining(['poolvos', 'lemming']));
  expect(info.find(r => r.id === 'scotland').scenes).toContain('highlands');
  expect(info.find(r => r.id === 'scotland').enemies).toContain('geit');
  expect(await page.evaluate(() => REGIONS.find(r => r.id === 'scotland').levels.every(l => l.summer && l.weather && l.scene === 'highlands'))).toBe(true);
  const codes = await page.evaluate(() => REGIONS.flatMap(r => r.levels.map(l => l.code && l.code.answer)));
  expect(info.find(r => r.id === 'ardeche').scenes).toEqual(expect.arrayContaining(['ardeche', 'grotte']));
  expect(info.find(r => r.id === 'ardeche').enemies).toEqual(expect.arrayContaining(['wesp', 'zwijn']));
  expect(info.find(r => r.id === 'veneto').scenes).toEqual(expect.arrayContaining(['laguna', 'venezia', 'burano', 'verona', 'dolomiti']));
  expect(info.find(r => r.id === 'veneto').enemies).toEqual(expect.arrayContaining(['duif', 'meeuw', 'marmot']));
  expect(new Set(codes).size).toBe(80);
  expect(info.find(r => r.id === 'netherlands').enemies).toEqual(expect.arrayContaining(['gans', 'duif', 'meeuw', 'zwijn']));
});

test('Dutch: the map and the region names are translated', async ({ page }) => {
  await seed(page, { lang: 'nl' });
  await page.locator('#regionBtn').click();
  await expect(page.locator('#mapWrap h2')).toHaveText('Waar gaan we heen?');
  await expect(page.locator('#mapBox .pin[data-region="norway"] b')).toHaveText('Noorwegen');
  await expect(page.locator('#mapBox .pin[data-region="scotland"] b')).toHaveText('Schotland');
  await expect(page.locator('#mapBox .pin[data-region="ardeche"] b')).toHaveText('Ardèche');
  await page.locator('#mapBox .pin[data-region="pole"]').click();
  await expect(page.locator('#levels .t').first()).toHaveText('Landen op de Noordpool');
});

for (const [w, h, what] of [[960, 540, 'tv'], [740, 360, 'phone turned'], [412, 839, 'phone upright']]) {
  test(`the map fits without scrolling (${what})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await seed(page, { lang: 'nl' });
    await page.locator('#regionBtn').click();
    expect(await page.evaluate(() => document.getElementById('mapWrap').scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const id of ['ardennes', 'pole', 'tirol', 'norway', 'netherlands', 'dalmatia', 'smaland', 'scotland', 'ardeche', 'veneto']) await expect(page.locator(`#mapBox .pin[data-region="${id}"]`)).toBeInViewport({ ratio: .99 });
    await expect(page.locator('#mapClose')).toBeInViewport({ ratio: .99 });
  });
}

test('every region plays differently: hills, movers, ice, water and darkness where they belong', async ({ page }) => {
  await seed(page);
  const f = await page.evaluate(() => Object.fromEntries(REGIONS.map(r => [r.id, {
    hills: r.levels.filter(l => l.hills && new Set(l.ground.map(g => g[2])).size > 1).length,
    movers: r.levels.filter(l => l.ents.some(e => e[0] === 'mover')).length,
    ice: r.levels.filter(l => l.ice).length, dark: r.levels.filter(l => l.dark).length,
    water: r.levels.filter(l => l.water).length, interior: r.levels.filter(l => l.interior).length, wind: r.levels.filter(l => l.wind).length }])));
  // the Ardennes stay as they were: flat ground, nothing that moves, no ice or darkness
  expect(f.ardennes).toEqual({ hills: 0, movers: 0, ice: 0, dark: 0, water: 0, interior: 0, wind: 0 });
  expect(f.pole.ice).toBeGreaterThanOrEqual(5); expect(f.pole.movers).toBeGreaterThanOrEqual(2); expect(f.pole.dark).toBe(1); expect(f.pole.interior).toBe(2);
  expect(f.tirol.hills).toBeGreaterThanOrEqual(4); expect(f.tirol.movers).toBeGreaterThanOrEqual(2); expect(f.tirol.interior).toBe(2);
  expect(f.netherlands.wind).toBeGreaterThanOrEqual(3); expect(f.netherlands.ice).toBe(1); expect(f.netherlands.movers).toBe(2); expect(f.netherlands.dark).toBe(1);
  expect(f.norway.movers).toBeGreaterThanOrEqual(2); expect(f.norway.dark).toBe(1); expect(f.norway.water).toBeGreaterThanOrEqual(6);
  expect(f.scotland.water).toBeGreaterThanOrEqual(2); expect(f.scotland.movers).toBeGreaterThanOrEqual(2);
  expect(f.ardeche.water).toBeGreaterThanOrEqual(3); expect(f.ardeche.movers).toBeGreaterThanOrEqual(1); expect(f.ardeche.hills).toBeGreaterThanOrEqual(3); expect(f.ardeche.dark).toBe(1);
});

test('boats and ice floes float on the water, also where the ground is high (only a gondola rides in the air)', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const high = await page.evaluate(() => {
    const out = [];
    for (const r of REGIONS) { setRegion(r.id, false); LEVELS.forEach((l, i) => { if (!l.movers || l.movers === 'gondola') return; startLevel(i);
      for (const m of L.movers) if (m.y !== 12 * TS) out.push(`${r.id} day ${i + 1}: ${l.movers} at row ${m.y / TS}`); }); }
    return out;
  });
  expect(high).toEqual([]);
});

test('a mover carries you across a gap that is too wide to jump', async ({ page }) => {
  await seed(page, { region: 'tirol', unlocked: 8 });
  await startDay(page, 2);
  await page.locator('#card .btn').first().isVisible().then(v => v && page.locator('#card .btn').first().click());
  for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
  const m = await page.evaluate(() => { window.hurt = () => {}; const m = L.movers[0]; m.x = m.x0; m.dir = 1; m.wait = 30; P.x = m.x + 10; P.y = m.y - P.h; P.vx = P.vy = 0; return { x0: m.x0, x1: m.x1 }; });
  await expect.poll(() => page.evaluate(() => P.x), { timeout: 15000 }).toBeGreaterThan(m.x1 - 20);
  expect(await page.evaluate(() => ({ ground: P.onGround, riding: !!P.mover, hearts: P.hearts }))).toEqual({ ground: true, riding: true, hearts: 3 });
});

test('on ice you keep sliding when you let go', async ({ page }) => {
  const slide = async region => {
    await seed(page, { region, unlocked: 8 });
    await startDay(page, 0);
    for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
    return page.evaluate(() => { window.hurt = () => {}; L.enemies.length = 0; P.x = 3 * 32; P.y = 12 * 32 - P.h; P.vx = 4.4; P.vy = 0; P.onGround = true;
      const x0 = P.x; held.left = held.right = false; for (let i = 0; i < 30; i++) step(); return P.x - x0; });
  };
  const ardennes = await slide('ardennes'), pole = await slide('pole');
  expect(pole).toBeGreaterThan(ardennes * 2);
});

test('in the dark troll forest you see more for every torch you light', async ({ page }) => {
  await seed(page, { region: 'norway', unlocked: 8 });
  await startDay(page, 5);
  const r = await page.evaluate(() => { const a = darkRadius(); L.switches.forEach(s => s.on = true); return [a, darkRadius()]; });
  expect(r[1]).toBeGreaterThan(r[0] + 100);
});

test('every region mixes its gates and locks, and keeps its own animals', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const info = await page.evaluate(() => REGIONS.map(r => ({ id: r.id,
    gates: r.levels.map(l => l.task ? l.task.kind : l.quest ? 'quest' : 'none'),
    locks: r.levels.map(l => l.code ? l.code.kind || 'symbols' : 'none'),
    enemies: r.levels.filter(l => l.enemies !== false).map(l => l.enemy),
    garland: r.levels.some(l => (l.deco || []).some(d => d[0] === 'garland') && !l.birthday) })));
  for (const r of info) {
    if (r.id === 'ardennes') { expect(new Set(r.locks)).toEqual(new Set(['symbols'])); continue; }
    const count = (list, k) => list.filter(x => x === k).length;
    // at least six kinds of lock and four kinds of gate, nothing more than twice, at most two "bring something"
    expect(new Set(r.locks).size).toBeGreaterThanOrEqual(6);
    for (const k of new Set(r.locks)) expect(count(r.locks, k)).toBeLessThanOrEqual(2);
    expect(new Set(r.gates).size).toBeGreaterThanOrEqual(4);
    expect(count(r.gates, 'quest')).toBeLessThanOrEqual(2);
    // the robot vacuum and Lego belong to the Ardennes cabin
    expect(r.enemies).not.toContain('robot');
  }
  // penguins live at the South Pole: only one lost penguin, on the first day
  const pole = info.find(r => r.id === 'pole');
  expect(pole.enemies.filter(e => e === 'pinguin')).toHaveLength(1);
  expect(pole.enemies[0]).toBe('pinguin');
});

test('the bell opens the gate for a few seconds; too slow and it closes again', async ({ page }) => {
  await seed(page, { region: 'tirol', unlocked: 8 });
  await startDay(page, 1);
  await skip(page);
  const b = await page.evaluate(() => { window.hurt = () => {}; return L.bell; });
  await page.evaluate(b => { P.x = b.x + 5; P.y = b.y + 32 - P.h; }, b);
  await page.keyboard.press('e');
  await expect.poll(() => page.evaluate(() => L.gateOpen)).toBe(true);
  await expect(page.locator('#hQuest')).toContainText('s');
  await expect.poll(() => page.evaluate(() => L.gateOpen), { timeout: 12000 }).toBe(false);
  expect(await page.evaluate(() => L.questDone)).toBe(false);
});

test('a lost animal follows you back to the gate', async ({ page }) => {
  await seed(page, { region: 'pole', unlocked: 8 });
  await startDay(page, 1);
  await skip(page);
  const a = await page.evaluate(() => { window.hurt = () => {}; return { x: L.animal.x, y: L.animal.y }; });
  await page.evaluate(a => { P.x = a.x + 5; P.y = a.y + 32 - P.h; }, a);
  await page.keyboard.press('e');
  await expect(page.locator('#hQuest')).toContainText('follows you');
  // walk right for a while: the calf comes along
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowRight');
  const d = await page.evaluate(() => Math.abs(L.animal.x - P.x));
  expect(d).toBeLessThan(170); // about half a second behind you
});

test('a melody lock: play the notes with the keys 1 to 5', async ({ page }) => {
  await seed(page, { region: 'dalmatia', unlocked: 8 });
  await startDay(page, 5);
  await skip(page);
  const pad = await page.evaluate(() => { window.hurt = () => {}; return L.pad; });
  await page.evaluate(p => { P.x = p.x + 5; P.y = p.y + 32 - P.h; }, pad);
  await page.keyboard.press('e');
  await expect(page.locator('#padWrap')).toBeVisible();
  await expect(page.locator('#keys button.tok')).toHaveCount(5);
  await page.keyboard.type('3521');
  await expect(page.locator('#padWrap')).toBeHidden();
  expect(await page.evaluate(() => L.codeOpen)).toBe(true);
});

test('the Netherlands: the wind pushes you, sometimes against you and sometimes from behind', async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8 });
  await startDay(page, 1);
  const w = await page.evaluate(() => { const out = []; for (let t = 0; t < 900; t += 30) { L.time = t; out.push(windNow()); } return { min: Math.min(...out), max: Math.max(...out) }; });
  expect(w.min).toBeLessThan(-.3);
  expect(w.max).toBeGreaterThan(.1);
});

test('Dalmatia is summer: no snow, summer clothes, and in the warm sea you swim instead of falling', async ({ page }) => {
  await seed(page, { region: 'dalmatia', unlocked: 8 });
  const d = await page.evaluate(() => REGIONS.find(r => r.id === 'dalmatia').levels.map(l => ({ theme: l.theme, summer: l.summer, scene: l.scene })));
  expect(d.every(l => l.theme === 'kust' && l.summer)).toBe(true);
  expect(new Set(d.map(l => l.scene))).toEqual(new Set(['adriatic', 'falls', 'oldtown']));
  await startDay(page, 0);
  for (let n = 0; n < 12 && await page.locator('#dialog').isVisible(); n++) { await page.keyboard.press('Space'); await page.waitForTimeout(40); }
  const r = await page.evaluate(() => {
    window.hurt = () => {}; L.enemies.length = 0;
    const col = L.grid[ROWS - 1].findIndex((c, x) => x > 5 && c !== '#');
    P.x = col * 32 + 4; P.y = 8 * 32; P.vy = 0; P.vx = 0;
    for (let i = 0; i < 90; i++) step();
    const swimming = P.swim, hearts = P.hearts;
    edges.push('jump'); step(); const up = P.vy < 0;
    return { swimming, hearts, up };
  });
  expect(r).toEqual({ swimming: true, hearts: 3, up: true });
});

test('Scotland is summer too: no snowy city, thistles instead of icicles, and every decoration is drawn', async ({ page }) => {
  await seed(page, { unlocked: 8, region: 'scotland' });
  const r = await page.evaluate(() => {
    // the summer cities use their own theme, never the snowy Christmas-market city
    const themes = LEVELS.map(l => l.theme);
    // every decoration kind used in Scotland has its own drawing (an unknown kind draws nothing)
    const src = drawDeco.toString();
    const missing = [...new Set(LEVELS.flatMap(l => l.deco.map(d => d[0])))].filter(k => !src.includes(`kind === "${k}"`));
    return { themes, missing, weather: LEVELS.every(l => l.weather) };
  });
  expect(r.themes).not.toContain('stad');
  expect(r.themes).toContain('straat');
  expect(r.missing).toEqual([]);
  expect(r.weather).toBe(true);
});

test('the Ardèche: summer, no snow anywhere, a dark painted cave, and every decoration is drawn', async ({ page }) => {
  await seed(page, { unlocked: 8, region: 'ardeche' });
  const r = await page.evaluate(() => {
    const src = drawDeco.toString();
    const missing = [...new Set(LEVELS.flatMap(l => l.deco.map(d => d[0])))].filter(k => !src.includes(`kind === "${k}"`));
    const cave = LEVELS.find(l => l.scene === 'grotte');
    return { summer: LEVELS.every(l => l.summer), themes: [...new Set(LEVELS.map(l => l.theme))], missing,
      cave: cave && { theme: cave.theme, dark: !!cave.dark, enemies: cave.enemies, lights: cave.task && cave.task.kind } };
  });
  expect(r.summer).toBe(true);
  // never the snowy themes in summer
  expect(r.themes).not.toContain('stad'); expect(r.themes).not.toContain('sneeuw');
  expect(r.missing).toEqual([]);
  // the Chauvet Cave: its own rock tiles, dark until you light the lamps, no animals to fight
  expect(r.cave).toEqual({ theme: 'grot', dark: true, enemies: false, lights: 'lights' });
});

test('the Ardèche, day 2: in the canoe the river carries you, a rock capsizes you unless you jump, and down the waterfalls you go', async ({ page }) => {
  await seed(page, { unlocked: 8, region: 'ardeche' });
  await startDay(page, 1);
  await skip(page);
  const r = await page.evaluate(() => {
    // the real hurt(): the capsize has to cost a heart for real
    L.enemies.length = 0; const hearts0 = P.hearts;
    const rv = L.d.river, at = c => rv.surf[c - rv.x0];
    const float = c => { P.x = c * TS + 4; P.y = at(c) * TS + 14 - P.h * .45; P.vx = 0; P.vy = 0; for (let i = 0; i < 3; i++) step(); };
    // 1. the river carries you along, without touching a key
    const free = rv.x0 + 2; float(free);
    const x0 = P.x, canoe = P.canoe, swim = P.swim; for (let i = 0; i < 30; i++) step();
    const carried = P.x - x0;
    // 2. drifting into a rock capsizes you: upside down for a moment, then a heart less and back to the last flag
    const rock = L.d.rocks.find(k => k[2] === 2); float(rock[0] - 3);
    for (let i = 0; i < 120 && !P.capsize; i++) step();
    const capsized = P.capsize > 0 && P.x + P.w <= rock[0] * TS + .5 && P.hearts === hearts0;   // upside down, the heart goes at the end
    for (let i = 0; i < 60; i++) step();
    const back = !P.capsize && P.hearts === hearts0 - 1 && P.x === L.respawn.x && P.x < rv.x0 * TS;
    // a jump (held) takes you over it: paddle on (→), and back into the water on the other side
    float(rock[0] - 3); edges.push('jump'); held.jump = true; held.right = true; for (let i = 0; i < 18; i++) step(); held.jump = false; for (let i = 0; i < 30; i++) step(); held.right = false; for (let i = 0; i < 30; i++) step();
    const over = P.x > (rock[0] + 1) * TS && P.swim && P.hearts === hearts0 - 1;   // no second heart for jumping over it
    // 3. down a waterfall: you land on the lower water, and can't paddle back up
    const fall = rv.surf.findIndex((v, i) => i && v > rv.surf[i - 1]) + rv.x0;
    float(fall - 2); for (let i = 0; i < 80 && P.x < (fall + 1) * TS; i++) step(); for (let i = 0; i < 20; i++) step();
    const down = P.swim && Math.abs(P.y + P.h * .45 - (at(fall) * TS + 14)) < 4;
    held.left = true; for (let i = 0; i < 120; i++) step(); held.left = false;
    const notUp = Math.floor((P.x + P.w / 2) / TS) >= fall;
    return { canoe, swim, carried: carried > 20, capsized, back, over, down, notUp, hearts: [hearts0, P.hearts] };
  });
  expect(r).toEqual({ canoe: true, swim: true, carried: true, capsized: true, back: true, over: true, down: true, notUp: true, hearts: [3, 2] });
  // the canoe stretch makes the level longer (90 tiles of river), with the same 8 rocks as the old 60-tile river,
  // and the other days have no river
  expect(await page.evaluate(() => [L.w, L.d.river.x1 - L.d.river.x0 + 1, L.d.rocks.length, LEVELS.filter(l => l.river).length])).toEqual([315, 90, 8, 1]);
});

test('the Veneto: in Venice you hop from island to island on the vaporetto, and flamingos stand in the lagoon', async ({ page }) => {
  await seed(page, { unlocked: 8, region: 'veneto' });
  const r = await page.evaluate(() => {
    const src = drawDeco.toString();
    const missing = [...new Set(LEVELS.flatMap(l => l.deco.map(d => d[0])))].filter(k => !src.includes(`kind === "${k}"`));
    // the island days: several boat crossings, and the boats are water buses
    const islands = LEVELS.filter(l => l.islands).map(l => ({ crossings: l.ents.filter(e => e[0] === 'mover').length, look: l.boatLook, swim: !!l.swim }));
    return { summer: LEVELS.every(l => l.summer), themes: [...new Set(LEVELS.map(l => l.theme))], missing, islands,
      flamingos: LEVELS.filter(l => l.deco.some(d => d[0] === 'flamingo')).length, gondola: LEVELS.some(l => l.movers === 'gondola' && l.scene === 'dolomiti') };
  });
  expect(r.summer).toBe(true);
  expect(r.themes).not.toContain('stad'); expect(r.themes).not.toContain('sneeuw');
  expect(r.missing).toEqual([]);
  // Venice and Murano/Burano with the vaporetto, and the lagoon by boat: at least two crossings each; no swimming in the canals
  expect(r.islands.length).toBe(3);
  for (const i of r.islands) { expect(i.crossings).toBeGreaterThanOrEqual(2); expect(i.swim).toBe(false); }
  expect(r.islands.filter(i => i.look === 'vaporetto').length).toBe(2);
  expect(r.flamingos).toBeGreaterThanOrEqual(3);
  // the cable car up into the Dolomites
  expect(r.gondola).toBe(true);
});

test('a summer region says "summer days" on the title screen', async ({ page }) => {
  await seed(page, { region: 'dalmatia' });
  await expect(page.locator('#cdWord')).toHaveText('summer days to scout');
  await seed(page, { region: 'scotland' });
  await expect(page.locator('#cdWord')).toHaveText('summer days to scout');
  await seed(page, { region: 'ardeche' });
  await expect(page.locator('#cdWord')).toHaveText('summer days to scout');
  await seed(page, { region: 'veneto' });
  await expect(page.locator('#cdWord')).toHaveText('summer days to scout');
  await seed(page);
  await expect(page.locator('#cdWord')).toHaveText('winter days to scout');
});

test('Tirol: the cable car goes up the mountain on a slanted cable, and takes you along', async ({ page }) => {
  await seed(page, { unlocked: 8, region: 'tirol' });
  await startDay(page, 2);
  await skip(page);
  const m0 = await page.evaluate(() => { const m = L.movers[0]; return { y0: m.y0, y1: m.y1 }; });
  expect(m0.y1).toBeLessThan(m0.y0); // the first gondola goes up
  // Stand in the gondola while it waits at the bottom station, and ride along to the top.
  await page.evaluate(() => {
    window.hurt = () => {}; L.enemies.length = 0;
    const m = L.movers[0]; m.x = m.x0; m.y = m.y0; m.dir = 1; m.wait = 30;
    P.x = m.x + m.w / 2 - P.w / 2; P.y = m.y - P.h; P.vx = P.vy = 0;
  });
  await page.waitForFunction(() => L.movers[0].x === L.movers[0].x1, null, { timeout: 15000 });
  const end = await page.evaluate(() => ({ feet: P.y + P.h, top: L.movers[0].y1, on: P.mover === L.movers[0] }));
  expect(end.on).toBe(true);
  expect(Math.abs(end.feet - end.top)).toBeLessThan(2);
});

test('every text balloon is a list of sentences, never one letter at a time', async ({ page }) => {
  for (const lang of ['en', 'nl']) {
    await seed(page, { unlocked: 8, lang });
    const bad = await page.evaluate(() => {
      const out = [], chk = (w, v) => { if (v != null && !(Array.isArray(v) && v.every(x => typeof x === 'string' && x.length > 1))) out.push(w); };
      REGIONS.forEach(r => r.levels.forEach((l, i) => {
        const w = `${r.id} ${i + 1}`;
        chk(w + ' intro', l.intro);
        (l.ents || []).forEach(e => {
          if (e[0] === 'sign') chk(w + ' sign', e[3]);
          if (e[0] === 'npc' && e[3]) { chk(w + ' npc', e[3].lines); for (const t of [e[3].quest, e[3].task]) if (t) ['need', 'done', 'after'].forEach(k => chk(`${w} ${k}`, t[k])); }
        });
      }));
      return out;
    });
    expect(bad).toEqual([]);
  }
});

test('never two checkpoint flags next to each other', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const close = await page.evaluate(() => REGIONS.flatMap(r => r.levels.map((l, i) => {
    const xs = l.ents.filter(e => e[0] === 'check').map(e => e[1]).sort((a, b) => a - b);
    return xs.some((x, j) => j && x - xs[j - 1] < 10) ? `${r.id} ${i + 1}: ${xs.join(',')}` : null;
  })).filter(Boolean));
  expect(close).toEqual([]);
});


test('decorations stand on flat ground: no house, stall or car hangs over a cliff or a pit', async ({ page }) => {
  await seed(page);
  const bad = await page.evaluate(() => {
    const out = [];
    for (const r of REGIONS) {
      setRegion(r.id);
      LEVELS.forEach((d, i) => {
        if (!d.seed) return; // the levels built by hand
        const top = c => { for (let y = 0; y < 15; y++) if (d.ground.some(([a, b, t]) => c >= a && c <= b && t === y)) return y; return 99; };
        for (const [k, c] of d.deco) {
          if (BG_ANIMALS.has(k)) continue;
          const [l, rr] = DECO_FOOT[k] || [0, 0], t = top(c);
          for (let x = c + l; x <= c + rr; x++) if (top(x) !== t) { out.push(`${r.id} ${i + 1}: ${k} at ${c}`); break; }
        }
      });
    }
    setRegion('ardennes');
    return out;
  });
  expect(bad).toEqual([]);
});

test('the bell: far enough from the gate that you have to hurry, but you make it walking', async ({ page }) => {
  await seed(page);
  const res = await page.evaluate(() => {
  const out = [];
  for (const r of REGIONS) { setRegion(r.id); LEVELS.forEach((d, i) => { if (!(d.task && d.task.kind === 'timer')) return;
   for (const run of [false]) {
    save.char = 0; startLevel(i); setScreen('play'); dialog = null; window.hurt = () => {}; L.enemies.length = 0;
    P.x = L.bell.x + 4; P.y = L.bell.y + 32 - P.h; P.vx = 0; P.vy = 0;
    for (let k = 0; k < 5; k++) step();
    edges.push('act'); step(); if (dialog) hideDialog();
    const gx = L.d.gate[0] * TS; let t = 0, ok = false, stuck = 0, lastX = P.x;
    for (; t < 1200; t++) {
      // jump when something is in the way, or there is a gap or spikes ahead
      const fx = Math.floor((P.x + P.w + 14) / TS), fy = Math.floor((P.y + P.h - 2) / TS), feet = Math.floor((P.y + P.h + 2) / TS);
      const block = isSolid(fx, fy) || isSolid(fx, fy - 1), gap = !isSolid(fx, feet) && cell(fx, feet) !== '=', spike = cell(fx, fy) === '^' || cell(fx + 1, fy) === '^';
      held.right = true; held.run = run; held.jump = false;
      if ((block || gap || spike || stuck > 10) && P.onGround) { edges.push('jump'); held.jump = true; }
      else if (!P.onGround && P.vy < 0) held.jump = true;
      step();
      if (Math.abs(P.x - lastX) < .5) stuck++; else stuck = 0; lastX = P.x;
      if (P.x > gx + TS) { ok = true; break; }
      if (!L.gateOpen) break;
    }
    held.right = held.run = held.jump = false;
    out.push([r.id, i + 1, run ? 'run' : 'walk', d.task.secs, Math.round((gx - L.bell.x) / TS) + ' tiles', ok ? (t / 60).toFixed(1) + 's' : 'FAIL at ' + Math.round(P.x / TS)]);
   } }); }
    setRegion('ardennes');
    return out;
  });
  for (const [region, day, , secs, , got] of res) {
    expect(got, `${region} day ${day}`).toMatch(/s$/);
    const t = parseFloat(got);
    // walking takes most of the time (it used to take only about a third), but it fits
    expect(t, `${region} day ${day}`).toBeGreaterThan(secs * .6);
    expect(t, `${region} day ${day}`).toBeLessThan(secs - .5);
  }
  expect(res.length).toBeGreaterThan(5);
});

test('after ringing the bell, a countdown on screen shows how much time is left', async ({ page }) => {
  await seed(page, { region: 'ardeche', unlocked: 8 });
  await startDay(page, 4);
  const r = await page.evaluate(() => {
    const calls = [], real = drawGateTimer; window.drawGateTimer = () => { calls.push(L.timer); real(); };
    L.enemies.length = 0; P.x = L.bell.x + 4; P.y = L.bell.y + 32 - P.h;
    for (let k = 0; k < 3; k++) step();
    const before = calls.length; render();
    edges.push('act'); step(); if (dialog) hideDialog();
    for (let k = 0; k < 30; k++) step(); render();
    const during = calls.at(-1);
    L.timer = 0; render();
    window.drawGateTimer = real;
    return { before, drawn: calls.length, during, secs: L.d.task.secs };
  });
  expect(r.before).toBe(0);
  expect(r.drawn).toBe(1);                       // drawn while the gate is open, not before or after
  expect(r.during).toBeGreaterThan(r.secs * 60 - 40);
});

test('in the dark, a lamp you light keeps its surroundings lit, also when you walk on', async ({ page }) => {
  await seed(page, { region: 'ardeche', unlocked: 8 });
  await startDay(page, 3);
  const r = await page.evaluate(() => {
    const s = L.switches[0], cx = s.x - 300; // look around the lamp
    const before = darkLights(cx).length;
    s.on = true;
    const after = darkLights(cx);
    // walk away from it (still on screen): its light stays where the lamp is
    P.x = s.x + 8 * TS;
    const away = darkLights(cx).find(l => Math.abs(l[0] - (s.x + 16 - cx)) < 1);
    render();
    return { before, after: after.length, away: !!away, radius: away && away[2] > 3 * TS };
  });
  expect(r).toEqual({ before: 1, after: 2, away: true, radius: true });
});

test('scenery animals stand in the background, on a layer of the landscape, never on the path', async ({ page }) => {
  await seed(page, { region: 'pole', unlocked: 8 });
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    const bear = L.d.deco.find(d => d[0] === 'polarbear');
    // in the world pass (on the path) it draws nothing; in the background pass it does
    const empty = far => { const c = document.createElement('canvas'); c.width = 400; c.height = 300; const x = c.getContext('2d');
      withCtx(x, () => { g.setTransform(1, 0, 0, 1, 0, 0); g.translate(-bear[1] * TS + 100, -groundTop(bear[1]) * TS + 200); drawDeco('polarbear', bear[1], 'sneeuw', far); });
      return !x.getImageData(0, 0, 400, 300).data.some((v, i) => i % 4 === 3 && v > 0); };
    // it moves exactly like the layer it stands on (the village layer at the North Pole moves at .3 of the camera)
    const which = bgAnimalLayer(), layer = getSceneLayers('pole')[which];
    const moved = bgAnimalAt(bear[1], 1000, layer, which)[0] - bgAnimalAt(bear[1], 1100, layer, which)[0];
    return { onPath: empty(false), inBackground: !empty(true), which, moved: Math.round(moved) };
  });
  expect(r).toEqual({ onPath: true, inBackground: true, which: 'mid', moved: 30 });
  // every scenery animal in every region: where the path is at its normal height, and its feet clearly above the path
  const bad = await page.evaluate(() => {
    const out = [];
    for (const reg of REGIONS) {
      setRegion(reg.id);
      LEVELS.forEach((d, i) => d.deco.forEach(([k, x]) => {
        if (!BG_ANIMALS.has(k) || !d.seed) return;
        const top = d.ground.filter(([a, b]) => x >= a && x <= b).reduce((m, [, , t]) => Math.min(m, t), 99);
        if (top !== 12) out.push(`${reg.id} ${i + 1}: ${k} at ${x} on row ${top}`);
      }));
    }
    setRegion('pole');
    return out;
  });
  expect(bad).toEqual([]);
});
