const { test, expect } = require('@playwright/test');
const { seed, startDay } = require('./helpers');

// Deze tests laten de spellus zelf rekenen (step() in één keer, zonder tijd), zodat ze niet afhangen van de snelheid van de computer.
async function simulate(page, fn) { return page.evaluate(fn); }

test('lopen en springen met het toetsenbord', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const x0 = await page.evaluate(() => P.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(() => P.x)).toBeGreaterThan(x0 + 30);
  await page.keyboard.down('Space');
  await expect.poll(() => page.evaluate(() => P.vy < 0 || !P.onGround)).toBe(true);
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(() => P.onGround)).toBe(true);
});

test('het poppetje springt hoog en ver genoeg voor de levels (minstens 3 tegels hoog en 4 breed)', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    P.x = 2 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true;
    held.right = true; held.jump = true;
    for (let i = 0; i < 30; i++) step();          // aanloop
    const startX = P.x, feet = P.y + P.h; edges.push('jump');
    let top = feet, landX = null;
    for (let i = 0; i < 120; i++) { step(); top = Math.min(top, P.y + P.h); if (i > 5 && P.onGround) { landX = P.x; break; } }
    held.right = held.jump = false;
    return { up: feet - top, far: landX - startX };
  });
  expect(r.up).toBeGreaterThanOrEqual(3 * 32 + 8);
  expect(r.far).toBeGreaterThanOrEqual(4 * 32);
});

test('op een platform springen en blijven staan', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  // Dag 1 heeft een plank op rij 9 van kolom 10 tot en met 13.
  const r = await simulate(page, () => {
    P.x = 8 * TS; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true;
    L.enemies = [];
    held.right = true; held.jump = true; edges.push('jump');
    for (let i = 0; i < 26; i++) step();
    held.right = false;
    for (let i = 0; i < 60; i++) step();
    held.jump = false;
    return { feet: P.y + P.h, onGround: P.onGround };
  });
  expect(r).toEqual({ feet: 9 * 32, onGround: true });
});

test('op een wild zwijn springen haalt het weg; ertegenaan lopen kost een hartje', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    const e = L.enemies[0]; e.vx = 0;
    P.x = e.x + 4; P.y = e.y - P.h - 20; P.vx = 0; P.vy = 4; P.inv = 0;
    for (let i = 0; i < 10; i++) step();
    const stomped = e.dead > 0, hearts1 = P.hearts;
    const e2 = L.enemies.find(x => !x.dead); e2.vx = 0;
    P.x = e2.x - 10; P.y = e2.y + e2.h - P.h; P.vy = 0; P.inv = 0;
    step();
    return { stomped, hearts1, hearts2: P.hearts };
  });
  expect(r).toEqual({ stomped: true, hearts1: 3, hearts2: 2 });
});

test('in een kuil vallen kost een hartje en zet je terug bij de laatste vlag', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    P.x = 26 * TS; P.y = 12 * TS; P.vy = 0; P.inv = 0;
    for (let i = 0; i < 80; i++) step();
    return { hearts: P.hearts, x: P.x };
  });
  expect(r.hearts).toBe(2);
  expect(r.x).toBeLessThan(5 * 32);
});

test('vloeiend tekenen tussen twee stappen verandert niets aan de echte plek van het poppetje', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    snapshot(); P.x += 4; cam += 2;
    const x = P.x, c = cam;
    renderSmooth(.5);
    return { same: P.x === x && cam === c };
  });
  expect(r.same).toBe(true);
});

test('een tikje telt precies zo lang als hij duurde, ook als het spel hem pas later verwerkt', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const steps = await page.evaluate(() => {
    // 50 ms rechts, maar het spel komt er pas 300 ms later aan toe (een drukke tv)
    holdQ.length = 0; held.right = false;
    queueHold(held, 'right', true, 1000); queueHold(held, 'right', false, 1050);
    let n = 0;
    for (let i = 0; i < 30; i++) { applyHolds(1300 + i * 1000 / 60); if (held.right) n++; }
    return n;
  });
  expect(steps).toBe(3); // 50 ms = 3 stappen van 1/60 s, niet meer
});

test('a key release stamped in the future (another clock) never blocks walking', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await page.evaluate(() => {
    holdQ.length = 0; held.left = held.right = false;
    const now = 1000;
    // a tap on ← whose release carries a time 4 seconds ahead (some Android/TV WebViews use another clock)
    queueHold(held, 'left', true, now); queueHold(held, 'left', false, now + 4000);
    // then → is pressed: it must count right away, not after the ← release
    queueHold(held, 'right', true, now + 20);
    const steps = [];
    for (let i = 0; i < 12; i++) { applyHolds(now + 20 + i * 1000 / 60); steps.push(held.right); }
    return { rightAt: steps.indexOf(true) };
  });
  expect(r.rightAt).toBe(0);
});

test('a release never waits more than a second, even with a wrong timestamp', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  await page.evaluate(() => { holdQ.length = 0; held.left = false; const t = simT; queueHold(held, 'left', true, t); queueHold(held, 'left', false, t + 60000); });
  await expect.poll(() => page.evaluate(() => held.left), { timeout: 3000 }).toBe(false);
});

test('a timestamp from the future is clamped to now', async ({ page }) => {
  await seed(page);
  const ok = await page.evaluate(() => { const now = performance.now(); return eventTime({ timeStamp: now + 3000 }) <= performance.now() + 1; });
  expect(ok).toBe(true);
});

test('een heel kort tikje telt toch voor één stap', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const steps = await page.evaluate(() => {
    holdQ.length = 0; held.right = false;
    queueHold(held, 'right', true, 1000); queueHold(held, 'right', false, 1003);
    let n = 0;
    for (let i = 0; i < 10; i++) { applyHolds(1010 + i * 1000 / 60); if (held.right) n++; }
    return n;
  });
  expect(steps).toBe(1);
});

// Zoek een vlak stuk grond zonder iemand of iets in de buurt (anders leest ↓ een bordje voor). Neerzetten en glijden
// gebeurt daarna in één page.evaluate, anders remt het poppetje tussendoor al af (de spellus draait gewoon door).
async function freeSpot(page) {
  return page.evaluate(() => {
    const far = x => [...L.npcs, ...L.signs, ...(L.lantern ? [L.lantern] : []), ...(L.pad ? [L.pad] : [])].every(o => Math.abs(o.x - x) > 120);
    for (let tx = 6; tx < L.w - 10; tx++)
      if (L.grid[12][tx] === '#' && L.grid[12][tx + 1] === '#' && L.grid[12][tx + 2] === '#' && L.grid[11][tx] === ' ' && L.grid[11][tx + 1] === ' ' && far(tx * 32)) return tx;
    return -1;
  });
}
const PLACE = tx => { P.x = tx * 32 + 5; P.y = 12 * 32 - P.h; P.vy = 0; P.onGround = true; P.vx = 4; P.slide = 0; L.enemies.length = 0; state = 'play'; dialog = null; };

test('lopen + ↓: op je buik glijden, in de sneeuw verder dan in het bos', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const far = {};
  for (const [day, name] of [[0, 'bos'], [4, 'sneeuw']]) {
    await page.evaluate(() => toTitle());
    await startDay(page, day);
    const tx = await freeSpot(page);
    far[name] = await page.evaluate(([spot, place]) => {
      eval(place)(spot); const x0 = P.x;
      edges.push('act'); step();
      const started = P.slide > 0 && Math.abs(P.vx) > 4.4;
      for (let i = 0; i < 120 && P.slide; i++) step();
      return started ? P.x - x0 : -1;
    }, [tx, PLACE.toString()]);
  }
  expect(far.bos).toBeGreaterThan(64);
  expect(far.sneeuw).toBeGreaterThan(far.bos);
});

test('glijdend gaan beesten omver, maar stekels doen nog steeds pijn', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const tx = await freeSpot(page);
  const r = await page.evaluate(([spot, place]) => {
    eval(place)(spot);
    edges.push('act'); step();
    const e = { kind: 'zwijn', x: P.x + 10, y: P.y + P.h - 22, w: 30, h: 22, vx: -1, dead: 0 };
    L.enemies.push(e); step();
    const beest = { dead: e.dead > 0, hearts: P.hearts };
    // nu een stekel onder het poppetje
    const tx = Math.floor((P.x + P.w / 2) / 32), ty = Math.floor((P.y + P.h - 2) / 32);
    L.grid[ty][tx] = '^'; P.y = ty * 32 + 32 - P.h; P.inv = 0;
    step();
    return { ...beest, naStekel: P.hearts };
  }, [tx, PLACE.toString()]);
  expect(r.dead).toBe(true);
  expect(r.hearts).toBe(3);
  expect(r.naStekel).toBe(2);
});

test('rustig optrekken: een tikje zet een klein stapje, vasthouden loopt steeds sneller tot de volle snelheid', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    const begin = () => { held.left = held.right = held.jump = false; P.x = 3 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true; P.run = 0; P.runDir = 0; L.enemies.length = 0; state = 'play'; dialog = null; };
    const walk = (n, dir = 'right') => { held[dir] = true; for (let i = 0; i < n; i++) step(); held[dir] = false; for (let i = 0; i < 40; i++) step(); };
    begin(); let x0 = P.x; walk(1); const tik = P.x - x0;
    begin(); x0 = P.x; walk(6); const kort = P.x - x0;
    begin(); held.right = true; const v = []; for (let i = 0; i < 30; i++) { step(); v.push(P.vx); } held.right = false;
    // omdraaien op volle snelheid: binnen een paar stappen loop je de andere kant op
    held.left = true; let turn = 0; while (P.vx > 0 && turn < 20) { step(); turn++; } held.left = false;
    return { tik, kort, v3: v[2], v10: v[9], v20: v[19], turn };
  });
  expect(r.tik).toBeGreaterThan(0);
  expect(r.tik).toBeLessThan(3);        // één tikje: een paar pixels
  expect(r.kort).toBeLessThan(16);      // een tikje van 0,1 s: minder dan een halve tegel
  expect(r.v3).toBeLessThan(r.v10);     // steeds sneller...
  expect(r.v20).toBeCloseTo(4.4, 1);    // ...tot de volle snelheid, na ongeveer een kwart seconde
  expect(r.turn).toBeLessThanOrEqual(5);
});

test('rennen met Shift (of L1/R1 op een controller): sneller dan lopen, loslaten zakt soepel terug', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    held.left = held.right = held.jump = held.run = false;
    P.x = 3 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true; P.run = 0; P.runDir = 0; L.enemies.length = 0; state = 'play'; dialog = null;
    held.right = true;
    for (let i = 0; i < 30; i++) step();
    const loop = P.vx;
    held.run = true; for (let i = 0; i < 20; i++) step();
    const ren = P.vx;
    held.run = false; step();
    const net = P.vx;
    for (let i = 0; i < 30; i++) step();
    const terug = P.vx;
    held.right = false;
    return { loop, ren, net, terug };
  });
  expect(r.loop).toBeCloseTo(4.4, 1);
  expect(r.ren).toBeGreaterThan(6);
  expect(r.net).toBeGreaterThan(5);        // geen ruk terug...
  expect(r.terug).toBeCloseTo(4.4, 1);     // ...maar soepel naar loopsnelheid
});

test('dubbeltikken en vasthouden is ook rennen (voor afstandsbediening en touchscreen)', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const r = await simulate(page, () => {
    const begin = () => { held.left = held.right = held.jump = held.run = false; P.x = 3 * TS + 5; P.y = 12 * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true; P.run = 0; P.runDir = 0; P.dash = false; P.lastAx = 0; P.relTime = -99; L.enemies.length = 0; state = 'play'; dialog = null; };
    begin(); held.right = true; for (let i = 0; i < 40; i++) step(); const gewoon = P.vx;
    begin(); held.right = true; for (let i = 0; i < 4; i++) step(); held.right = false; for (let i = 0; i < 6; i++) step();
    held.right = true; for (let i = 0; i < 40; i++) step(); const dubbel = P.vx;
    begin(); held.right = true; for (let i = 0; i < 4; i++) step(); held.right = false; for (let i = 0; i < 40; i++) step();
    held.right = true; for (let i = 0; i < 40; i++) step(); const telaat = P.vx;
    held.right = false;
    return { gewoon, dubbel, telaat };
  });
  expect(r.gewoon).toBeCloseTo(4.4, 1);
  expect(r.dubbel).toBeGreaterThan(6);
  expect(r.telaat).toBeCloseTo(4.4, 1);   // twee losse tikken met een pauze: gewoon lopen
});

test('on a plank, ↓ drops you through it; on the ground ↓ does nothing of the sort', async ({ page }) => {
  await seed(page, { region: 'pole', unlocked: 8 });
  await startDay(page, 2);
  const plank = await page.evaluate(() => {
    window.hurt = () => {}; L.enemies.length = 0;
    // a plank with empty space below and nothing to talk to nearby
    const far = x => [...L.npcs, ...L.signs, ...L.clues].every(o => Math.abs(o.x - x) > 90);
    for (let y = 3; y < 11; y++) for (let x = 4; x < L.w - 4; x++)
      if (L.grid[y][x] === '=' && L.grid[y][x + 1] === '=' && L.grid[y + 1][x] === ' ' && L.grid[y + 1][x + 1] === ' ' && L.grid[y][x - 1] !== '|' && far(x * 32)) return { x, y };
  });
  await page.evaluate(p => { P.x = p.x * 32 + 5; P.y = p.y * 32 - P.h; P.vx = P.vy = 0; dialog = null; }, plank);
  await expect.poll(() => page.evaluate(() => P.onGround)).toBe(true);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(p => P.y + P.h > p.y * 32 + 40, plank)).toBe(true);
});

test('a ladder: hold ↑ to climb up onto the loft, hold ↓ to climb back down', async ({ page }) => {
  await seed(page, { region: 'pole', unlocked: 8 });
  await startDay(page, 2);
  const lad = await page.evaluate(() => {
    window.hurt = () => {}; L.enemies.length = 0;
    for (let x = 0; x < L.w; x++) for (let y = 0; y < 12; y++) if (L.grid[y][x] === '|' && L.grid[y - 1][x] === '=') {
      let b = y; while (L.grid[b + 1][x] === '|') b++;
      return { x, top: y - 1, bottom: b };
    }
  });
  expect(lad).toBeTruthy();
  await page.evaluate(l => { P.x = l.x * 32 + 5; P.y = (l.bottom + 1) * 32 - P.h; P.vx = P.vy = 0; dialog = null; }, lad);
  await page.keyboard.down('ArrowUp');
  await expect.poll(() => page.evaluate(l => Math.round(P.y + P.h) <= l.top * 32 + 1, lad), { timeout: 5000 }).toBe(true);
  await page.keyboard.up('ArrowUp');
  // standing on the loft now
  await expect.poll(() => page.evaluate(l => P.onGround && Math.abs(P.y + P.h - l.top * 32) < 1, lad)).toBe(true);
  await page.keyboard.down('ArrowDown');
  await expect.poll(() => page.evaluate(l => P.y + P.h >= (l.bottom + 1) * 32 - 1, lad), { timeout: 5000 }).toBe(true);
  await page.keyboard.up('ArrowDown');
});

/* ---------- Rides: skis, a sledge, skates, a bike and a kicksled ---------- */
const RIDES = [['tirol', 1, 'ski'], ['tirol', 4, 'sled'], ['netherlands', 4, 'skates'], ['netherlands', 5, 'bike'], ['norway', 1, 'kicksled']];
for (const [region, day, kind] of RIDES) {
  test(`een stuk ${kind} in ${region} dag ${day + 1}: je loopt daar niet, je rijdt`, async ({ page }) => {
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await seed(page, { region, unlocked: 8 });
    await startDay(page, day);
    const r = await page.evaluate(() => L.d.ride);
    expect(r.kind).toBe(kind);
    expect(r.x1 - r.x0).toBeGreaterThan(65);
    // a sign at the start says how it works
    expect(await page.evaluate(r => L.signs.some(s => s.x / TS < r.x0 && s.x / TS >= r.x0 - 10), r)).toBe(true);
    // put the player at the start of the ride (no animals around)
    await page.evaluate(r => { L.enemies = []; P.x = (r.x0 + 1) * TS; P.y = 0; P.vx = 0; }, r);
    await page.waitForFunction(() => P.onGround && P.ride);
    // → speeds you up past walking speed (4.4)
    await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => P.vx > 5, null, { timeout: 4000 });
    await page.keyboard.up('ArrowRight');
    // let go: skis and a sledge keep going downhill, skates glide on, a bike rolls out
    await page.evaluate(r => { P.x = (r.x0 + 1) * TS; P.vx = 0; P.bonk = undefined; }, r);
    await page.waitForTimeout(150);
    const x0 = await page.evaluate(() => P.x);
    await page.waitForTimeout(600);
    const moved = await page.evaluate(x0 => P.x - x0, x0);
    if (kind === 'ski' || kind === 'sled') expect(moved).toBeGreaterThan(60);
    else expect(moved).toBeLessThan(5);
    // after the ride you walk again
    await page.evaluate(r => { P.x = (r.x1 + 3) * TS; P.y = 0; P.vx = 0; }, r);
    await page.waitForFunction(() => P.onGround);
    expect(await page.evaluate(() => P.ride)).toBeNull();
    expect(errors).toEqual([]);
  });
}

test('ritten: kleine hindernissen stoppen je, hoge rotsen sturen je terug, maar je kunt eroverheen springen', async ({ page }) => {
  for (const [region, day] of RIDES) {
    await seed(page, { region, unlocked: 8 });
    await startDay(page, day);
    const result = await page.evaluate(() => {
      L.enemies = [];
      const r = L.d.ride, small = L.d.blocks.find(([x]) => x >= r.x0 && x <= r.x1);
      const rock = L.d.rocks.find(([x]) => x >= r.x0 && x <= r.x1);
      const place = (x, row) => {
        P.x = (x - 2) * TS; P.y = row * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true;
        P.inv = 0; held.right = true;
      };
      const hearts = P.hearts;
      place(small[0], small[1] + 1);
      for (let i = 0; i < 80; i++) step();
      const stopped = P.x + P.w <= small[0] * TS + .01 && P.hearts === hearts;
      place(rock[0], rock[1] + 2);
      for (let i = 0; i < 80 && P.hearts === hearts; i++) step();
      const crashed = P.x === L.respawn.x && P.hearts === hearts - 1;
      place(rock[0], rock[1] + 2);
      P.vx = 5; edges.push('jump'); held.jump = true;
      for (let i = 0; i < 22; i++) step();
      held.jump = false;
      for (let i = 0; i < 12; i++) step();
      held.right = false;
      return { stopped, crashed, jumped: P.x > (rock[0] + 1) * TS && P.hearts === hearts - 1 };
    });
    expect(result, `${region} day ${day + 1}`).toEqual({ stopped: true, crashed: true, jumped: true });
  }
});

test('vallen bij de ritten: even blijven zitten, dan een hartje eraf en terug naar de vlag', async ({ page }) => {
  for (const [region, day, kind] of [...RIDES, ['ardennes', 1, 'railbike']]) {
    await seed(page, { region, unlocked: 8 });
    await startDay(page, day);
    const result = await simulate(page, () => {
      const r = L.d.ride, rail = r.kind === 'railbike';
      const obstacle = rail ? r.hazards.find(h => h.kind === 'branch') : L.d.rocks.find(([x]) => x >= r.x0 && x <= r.x1);
      const col = rail ? obstacle.x : obstacle[0], row = rail ? r.row : obstacle[1] + 2;
      L.enemies = []; P.x = (col - 2) * TS; P.y = row * TS - P.h; P.vx = 5; P.vy = 0;
      P.railActive = false; P.inv = 0; P.hearts = 3; P.onGround = true; held.right = true;
      for (let i = 0; i < 80 && !P.rideCrash; i++) step();
      const crash = P.rideCrash && { kind: P.rideCrash.kind, time: P.rideCrash.time, hearts: P.hearts };
      let drawn = false, fallen = false;
      const bike = drawBike, railbike = drawRailbike, sled = drawSled, kicksled = drawKicksled, skis = drawSkis, skates = drawSkates, person = drawFallenRider;
      try {
        drawBike = (...a) => { drawn = a[5] === true; bike(...a); };
        drawRailbike = (...a) => { drawn = a[5] === true; railbike(...a); };
        drawSled = (...a) => { drawn = a[5] === true; sled(...a); };
        drawKicksled = (...a) => { drawn = true; kicksled(...a); };
        drawSkis = (...a) => { drawn = true; skis(...a); };
        drawSkates = (...a) => { drawn = true; skates(...a); };
        drawFallenRider = (...a) => { fallen = true; person(...a); };
        render();
      } finally { drawBike = bike; drawRailbike = railbike; drawSled = sled; drawKicksled = kicksled; drawSkis = skis; drawSkates = skates; drawFallenRider = person; }
      const x = P.x, y = P.y; edges.push('jump'); held.jump = true;
      for (let i = 0; i < 10; i++) step();
      const stayed = P.x === x && P.y === y && P.hearts === 3 && !!P.rideCrash;
      for (let i = 0; i < 50 && P.rideCrash; i++) step();
      held.right = held.jump = false;
      return { crash, drawn, fallen, stayed, back: !P.rideCrash && P.hearts === 2 && P.x === L.respawn.x && P.y === L.respawn.y };
    });
    expect(result, kind).toEqual({ crash: { kind, time: 45, hearts: 3 }, drawn: true, fallen: true, stayed: true, back: true });
  }
});

test('vallen bij de ritten: bij het laatste hartje verschijnt de rustpauze na de val', async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8 });
  await startDay(page, 5);
  const result = await simulate(page, () => {
    const r = L.d.ride, rock = L.d.rocks.find(([x]) => x >= r.x0 && x <= r.x1);
    L.enemies = []; P.x = (rock[0] - 2) * TS; P.y = (rock[1] + 2) * TS - P.h;
    P.vx = 5; P.vy = 0; P.inv = 0; P.hearts = 1; P.onGround = true; held.right = true;
    for (let i = 0; i < 80 && !P.rideCrash; i++) step();
    const before = P.hearts === 1 && !!P.rideCrash && !dialog;
    for (let i = 0; i < 45; i++) step();
    held.right = false;
    return { before, after: P.hearts === 3 && !P.rideCrash && !!dialog && P.x === L.respawn.x };
  });
  expect(result).toEqual({ before: true, after: true });
});

test('hondenslee: de husky’s trekken de slee, stoppen voor een sneeuwhoop en springen er samen over', async ({ page }) => {
  await seed(page, { region: 'norway', unlocked: 8 });
  await startDay(page, 2);
  const result = await simulate(page, () => {
    const r = L.d.ride, banks = L.d.blocks.filter(([x]) => x >= r.x0 && x <= r.x1);
    const row = banks[0][1] + 1, obstacle = banks[0][0];
    L.enemies = []; P.x = (obstacle - 6) * TS; P.y = row * TS - P.h;
    P.vx = P.vy = 0; P.inv = 0; P.onGround = true; P.hearts = 3; held.right = true;
    for (let i = 0; i < 120 && P.x + P.w / 2 + HUSKY_LEAD < obstacle * TS - .5; i++) step();
    const stopped = P.x + P.w / 2 + HUSKY_LEAD <= obstacle * TS + .01 && P.hearts === 3 && Math.abs(P.vx) < .1;
    const before = P.x; held.jump = true; edges.push('jump');
    let high = 0;
    for (let i = 0; i < 80 && P.x < (obstacle + 1) * TS; i++) { step(); high = Math.max(high, row * TS - (P.y + P.h)); }
    held.right = held.jump = false;
    let drawn = false; const draw = drawHuskySled;
    try { drawHuskySled = (...args) => { drawn = true; draw(...args); }; render(); }
    finally { drawHuskySled = draw; }
    return { kind: r.kind, length: r.x1 - r.x0 + 1, banks: banks.length, stopped,
      passed: P.x > before && P.x >= (obstacle + 1) * TS, high, hearts: P.hearts, drawn,
      flag: L.checks.some(c => c.x / TS < r.x0) };
  });
  expect(result.kind).toBe('husky');
  expect(result.length).toBe(120);
  expect(result.banks).toBeGreaterThanOrEqual(5);
  expect(result).toMatchObject({ stopped: true, passed: true, hearts: 3, drawn: true, flag: true });
  expect(result.high).toBeGreaterThan(32);
});

test('hondenslee: de hele tocht is met de sneeuwhoopjes te rijden', async ({ page }) => {
  await seed(page, { region: 'norway', unlocked: 8 });
  await startDay(page, 2);
  const result = await simulate(page, () => {
    const r = L.d.ride, banks = L.d.blocks.filter(([x]) => x >= r.x0 && x <= r.x1);
    L.enemies = []; P.x = (r.x0 + 1) * TS; P.y = (banks[0][1] + 1) * TS - P.h;
    P.vx = P.vy = 0; P.onGround = true; P.hearts = 3; held.right = true;
    let jumped = -1;
    for (let i = 0; i < 1600 && P.hearts === 3 && P.x < (r.x1 + 1) * TS; i++) {
      const bank = banks.find(([x]) => (x + 1) * TS > P.x + P.w / 2 + HUSKY_LEAD);
      if (bank && bank[0] * TS - (P.x + P.w / 2 + HUSKY_LEAD) < 70 && jumped !== bank[0] && P.onGround) {
        edges.push('jump'); jumped = bank[0]; held.jump = true;
      }
      if (P.onGround && (!bank || jumped !== bank[0])) held.jump = false;
      step();
    }
    held.right = held.jump = false;
    return { hearts: P.hearts, finished: P.x >= (r.x1 + 1) * TS };
  });
  expect(result).toEqual({ hearts: 3, finished: true });
});

test('hondenslee: ook achteruit kun je langs een sneeuwhoop', async ({ page }) => {
  await seed(page, { region: 'norway', unlocked: 8 });
  await startDay(page, 2);
  const result = await simulate(page, () => {
    const r = L.d.ride, bank = L.d.blocks.filter(([x]) => x >= r.x0 && x <= r.x1).at(-1);
    L.enemies = []; P.x = (bank[0] + 7) * TS; P.y = (bank[1] + 1) * TS - P.h;
    P.vx = 0; P.vy = 0; P.face = -1; P.onGround = true; P.hearts = 3; held.left = true;
    for (let i = 0; i < 160; i++) step();
    const stopped = P.x + P.w / 2 - HUSKY_LEAD >= (bank[0] + 1) * TS - .01 && Math.abs(P.vx) < .1;
    held.jump = true; edges.push('jump');
    for (let i = 0; i < 140 && P.x + P.w > bank[0] * TS; i++) step();
    held.left = held.jump = false;
    return { stopped, passed: P.x + P.w <= bank[0] * TS, hearts: P.hearts };
  });
  expect(result).toEqual({ stopped: true, passed: true, hearts: 3 });
});

test('glijden op schaatsen: loslaten en je glijdt nog een heel eind door', async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8 });
  await startDay(page, 4);
  await page.evaluate(() => { const r = L.d.ride; L.enemies = []; P.x = (r.x0 + 1) * TS; P.y = 0; });
  await page.waitForFunction(() => P.onGround);
  const moved = await page.evaluate(() => {
    P.vx = 6;
    const x0 = P.x;
    for (let i = 0; i < 24; i++) step();
    return P.x - x0;
  });
  expect(moved).toBeGreaterThan(100);
});

test('spoorfiets: de fiets blijft op de rails, springen en bukken vermijden verschillende hindernissen', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const result = await simulate(page, () => {
    const r = L.d.ride, ribbon = r.hazards.find(h => h.kind === 'ribbon'), branch = r.hazards.find(h => h.kind === 'branch');
    const flag = L.checks.find(c => c.x / TS < r.x0);
    L.enemies = [];
    L.respawn = { x: flag.x + 5, y: flag.y + TS - P.h };
    const run = (h, action) => {
      P.x = (h.x - 3) * TS; P.y = r.row * TS - P.h; P.vx = 5; P.vy = 0; P.onGround = true;
      P.railActive = false; P.railJump = P.railV = 0; P.inv = 0; P.hearts = 3;
      held.right = true; held.down = action === 'duck'; held.jump = action === 'jump';
      if (held.jump) edges.push('jump');
      let highest = 0, onTrack = true;
      for (let i = 0; i < 80 && P.hearts === 3 && P.x < (h.x + 1) * TS; i++) {
        step(); highest = Math.max(highest, P.railJump || 0);
        onTrack = onTrack && P.y + P.h === r.row * TS;
      }
      held.right = held.down = held.jump = false;
      return { passed: P.x >= (h.x + 1) * TS, crashed: P.hearts === 2 && P.x === L.respawn.x, highest, onTrack };
    };
    return { kind: r.kind, flag: !!flag, ribbonMiss: run(ribbon, 'none'), ribbonJump: run(ribbon, 'jump'),
      ribbonDuck: run(ribbon, 'duck'), branchMiss: run(branch, 'none'), branchDuck: run(branch, 'duck'), branchJump: run(branch, 'jump') };
  });
  expect(result.kind).toBe('railbike');
  expect(result.flag).toBe(true);
  for (const k of ['ribbonMiss', 'ribbonDuck', 'branchMiss']) expect(result[k].crashed, k).toBe(true);
  for (const k of ['ribbonJump', 'branchDuck', 'branchJump']) expect(result[k]).toMatchObject({ passed: true, onTrack: true });
  expect(result.ribbonJump.highest).toBeGreaterThan(22);
});

test('spoorfiets: gevarieerde takhoogtes passen bij de zichtbare lengte en houding', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const result = await simulate(page, () => {
    const r = L.d.ride, low = r.hazards.find(h => h.kind === 'branch' && h.clearance === 55),
      high = r.hazards.find(h => h.kind === 'branch' && h.clearance === 58);
    L.enemies = [];
    const hit = (char, h, duck = false, jump = 0) => {
      save.char = char; const ch = heroChar(); P.h = Math.round(40 * ch.size);
      P.x = h.x * TS + 5; P.y = r.row * TS - P.h; P.vx = P.vy = 0; P.onGround = true;
      P.ride = 'railbike'; P.railActive = true; P.railJump = jump; P.railV = 0; P.rideCrash = null; P.inv = 0; P.hearts = 3;
      held.left = held.right = held.jump = false; held.down = duck;
      step();
      return !!P.rideCrash;
    };
    const gaps = r.hazards.slice(1).map((h, i) => h.x - r.hazards[i].x);
    save.hero = { ...HERO_DEFAULT, size: 'adult', extra: 'bun', beanie: null };
    return {
      length: r.x1 - r.x0 + 1, gaps, kinds: r.hazards.map(h => h.kind),
      adult: [hit(0, high), hit(0, low), hit(0, high, true), hit(0, low, true), hit(4, low, true), hit('me', low, true)],
      child: [hit(3, high), hit(3, low), hit(3, low, true), hit(8, low)],
      jumping: [hit(0, low, false, 25), hit(0, low, false, 80)]
    };
  });
  expect(result.length).toBeGreaterThan(70);
  expect(new Set(result.gaps).size).toBeGreaterThanOrEqual(3);
  expect(result.kinds.some((kind, i) => i > 0 && kind === result.kinds[i - 1])).toBe(true);
  expect(result.adult).toEqual([true, true, false, false, false, false]);
  expect(result.child).toEqual([false, false, false, false]);
  expect(result.jumping).toEqual([true, false]);
});

test('spoorfiets: over een losse tak kun je springen, onder een bladergordijn moet je door', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const result = await simulate(page, () => {
    const r = L.d.ride, open = r.hazards.find(h => h.kind === 'branch' && !h.canopy),
      canopy = r.hazards.find(h => h.kind === 'branch' && h.canopy);
    L.enemies = [];
    const run = (char, h, face, action) => {
      save.char = char; const ch = heroChar(); P.h = Math.round(40 * ch.size);
      P.x = face > 0 ? h.x * TS - P.w - 40 : (h.x + 1) * TS + 30; P.y = r.row * TS - P.h;
      P.vx = face > 0 ? 5 : -3; P.vy = 0; P.onGround = true; P.face = face; P.railActive = false;
      P.railJump = P.railV = 0; P.inv = 0; P.hearts = 3;
      held.right = face > 0; held.left = face < 0; held.down = action === 'duck'; held.jump = action === 'jump';
      if (held.jump) edges.push('jump');
      let highest = 0;
      const passed = () => face > 0 ? P.x >= (h.x + 1) * TS : P.x + P.w <= h.x * TS;
      for (let i = 0; i < 80 && P.hearts === 3 && !passed(); i++) { step(); highest = Math.max(highest, P.railJump || 0); }
      held.right = held.left = held.down = held.jump = false;
      return { passed: passed() && P.hearts === 3, hit: P.hearts === 2, highest };
    };
    const cases = [];
    for (const char of [0, 3]) for (const face of [-1, 1]) {
      cases.push({ char, face, openJump: run(char, open, face, 'jump'), canopyJump: run(char, canopy, face, 'jump'), canopyDuck: run(char, canopy, face, 'duck') });
    }
    return cases;
  });
  for (const c of result) {
    expect(c.openJump.passed, JSON.stringify(c)).toBe(true);
    expect(c.canopyJump.hit).toBe(true);
    expect(c.canopyJump.highest).toBeGreaterThan(22);
    expect(c.canopyDuck.passed).toBe(true);
  }
});

test('spoorfiets: toetsenbord en aanraakknop laten je bukken, springen beweegt alleen de berijder', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  await page.evaluate(() => {
    const r = L.d.ride; L.enemies = []; P.x = (r.x0 + 2) * TS; P.y = r.row * TS - P.h; P.vx = 0;
  });
  await page.waitForFunction(() => P.railActive);
  await page.keyboard.down('ArrowDown');
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(true);
  await page.keyboard.up('ArrowDown');
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(false);
  await page.evaluate(() => document.getElementById('tA').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 })));
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(true);
  await page.evaluate(() => document.getElementById('tA').dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 })));
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(false);
  await page.keyboard.down('Space');
  await expect.poll(() => page.evaluate(() => P.railJump)).toBeGreaterThan(22);
  expect(await page.evaluate(() => P.y + P.h === L.d.ride.row * TS)).toBe(true);
  await page.keyboard.up('Space');
  await expect.poll(() => page.evaluate(() => P.railJump)).toBe(0);
});

test('spoorfiets: ook bij opstappen en afstappen tijdens een sprong blijft de fiets op de rails', async ({ page }) => {
  await seed(page, { unlocked: 8, char: 3 });
  await startDay(page, 1);
  const result = await simulate(page, () => {
    const r = L.d.ride; L.enemies = [];
    P.x = (r.x0 - 1) * TS; P.y = r.row * TS - P.h - 28; P.vx = 4; P.vy = -2; P.onGround = false;
    held.right = true;
    for (let i = 0; i < 15 && !P.railActive; i++) step();
    const entered = P.railActive && P.y + P.h === r.row * TS && P.railJump > 0;
    snapshot(); before.y -= 20;
    const draw = drawRailbike; let drawnY;
    try { drawRailbike = (x, y, ...args) => { drawnY = y; draw(x, y, ...args); }; renderSmooth(.5); }
    finally { drawRailbike = draw; }
    const drawnOnRail = drawnY === r.row * TS && P.y + P.h === r.row * TS;
    P.x = (r.x1 + 1) * TS - P.w / 2 - 4; P.railJump = 30; P.railV = -2; P.vx = 5;
    for (let i = 0; i < 10 && P.railActive; i++) step();
    held.right = false;
    return { entered, drawnOnRail, left: !P.railActive && P.y + P.h < r.row * TS };
  });
  expect(result).toEqual({ entered: true, drawnOnRail: true, left: true });
});

test('spoorfiets: ook bukkend blijven lijf en benen in verhouding voor een kind en een volwassene', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const poses = await page.evaluate(() => {
    const r = L.d.ride, person = drawPerson, legs = drawBikeLegs;
    L.npcs = []; L.enemies = []; P.x = (r.x0 + 2) * TS; P.ride = 'railbike'; P.railActive = true; P.railDuck = true; P.railJump = 0;
    const out = [];
    try {
      for (const char of [0, 3, 8]) for (const face of [-1, 1]) {
        save.char = char; const ch = heroChar(), k = ch.size || 1, feet = r.row * TS;
        P.h = Math.round(40 * k); P.y = feet - P.h; P.face = face; P.onGround = true;
        let body, leg;
        drawPerson = (...args) => { const m = g.getTransform(); body = { by: args[2], duck: args[8].duck, xScale: Math.hypot(m.a, m.b), yScale: Math.hypot(m.c, m.d), dot: m.a * m.c + m.b * m.d }; person(...args); };
        drawBikeLegs = (...args) => { const m = g.getTransform(); leg = { xScale: Math.hypot(m.a, m.b), yScale: Math.hypot(m.c, m.d), size: args[3] }; legs(...args); };
        render();
        out.push({ body, leg, hip: body.by - (ch.kid ? 12 : 13) * k, seat: feet - 26 * k, legScale: scale * k });
      }
    } finally { drawPerson = person; drawBikeLegs = legs; }
    return out;
  });
  for (const p of poses) {
    expect(p.body.duck).toBe(true);
    expect(p.body.xScale).toBeCloseTo(p.body.yScale, 5);
    expect(p.body.dot).toBeCloseTo(0, 5);
    expect(p.hip).toBeCloseTo(p.seat, 8);
    expect(p.leg.xScale).toBeCloseTo(p.legScale, 5);
    expect(p.leg.yScale).toBeCloseTo(p.legScale, 5);
    expect(p.leg.size).toBe(1);
  }
});

test('fiets en spoorfiets: handen blijven op het stuur, ook bukkend en in beide richtingen', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const poses = await page.evaluate(() => {
    const person = drawPerson, bike = drawBike, railbike = drawRailbike, out = [];
    let bikeTransform;
    try {
      drawBike = (...args) => { bikeTransform = g.getTransform(); bike(...args); };
      drawRailbike = (...args) => { bikeTransform = g.getTransform(); railbike(...args); };
      drawPerson = (...args) => {
        const handle = args[8].handle;
        if (!handle) { out.push({ kind: P.ride, jump: P.railJump, hasHandle: false }); }
        else {
          const ch = args[0], k = ch.size || 1, grip = P.ride === 'railbike' ? RAILBIKE_GRIP : BIKE_GRIP;
          const scale = P.ride === 'railbike' ? k : 1, rx = P.x + P.w / 2;
          const feet = P.ride === 'railbike' ? L.d.ride.row * TS : P.y + P.h;
          const actual = g.getTransform().transformPoint(new DOMPoint(args[1] + P.face * k * handle.x, args[2] + k * handle.y));
          const expected = bikeTransform.transformPoint(new DOMPoint(rx + P.face * scale * grip[0], feet + scale * grip[1]));
          out.push({ kind: P.ride, jump: P.railJump, hasHandle: true, distance: Math.hypot(actual.x - expected.x, actual.y - expected.y) });
        }
        person(...args);
      };
      for (const [region, day, kind] of [['ardennes', 1, 'railbike'], ['netherlands', 5, 'bike']]) {
        setRegion(region, false); startLevel(day); setScreen('play');
        const r = L.d.ride; L.npcs = []; L.enemies = [];
        P.x = (r.x0 + 2) * TS; P.ride = kind; P.railActive = kind === 'railbike'; P.inv = P.slide = 0; P.onGround = true;
        for (const char of [0, 3, 8]) for (const face of [-1, 1]) for (const pose of (kind === 'railbike' ? ['sit', 'duck', 'jump'] : ['sit', 'duck'])) {
          save.char = char; P.h = Math.round(40 * heroChar().size); P.y = r.row * TS - P.h; P.face = face;
          P.railDuck = pose === 'duck'; P.railJump = pose === 'jump' ? 28 : 0;
          render();
        }
      }
    } finally { drawPerson = person; drawBike = bike; drawRailbike = railbike; }
    return out;
  });
  expect(poses).toHaveLength(30);
  for (const p of poses) {
    expect(p.hasHandle, `${p.kind}, jump ${p.jump}`).toBe(!p.jump);
    if (p.hasHandle) expect(p.distance).toBeLessThan(0.001);
  }
});

test('Hoge Veluwe: langere afwisselende fietsrit met ruimte tussen hindernissen en takken om onderdoor te bukken', async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8 });
  await startDay(page, 5);
  const result = await simulate(page, () => {
    const r = L.d.ride, branches = r.hazards.filter(h => h.kind === 'branch');
    const obstacles = [
      ...branches.map(h => ({ x: h.x, kind: 'branch' })),
      ...L.d.blocks.filter(([x]) => x >= r.x0 && x <= r.x1).map(([x]) => ({ x, kind: 'block' })),
      ...L.d.rocks.filter(([x]) => x >= r.x0 && x <= r.x1).map(([x]) => ({ x, kind: 'rock' }))
    ].sort((a, b) => a.x - b.x);
    L.enemies = [];
    const hit = (char, duck) => {
      save.char = char; P.h = Math.round(40 * heroChar().size);
      P.x = (branches[0].x - 3) * TS; P.y = r.row * TS - P.h; P.vx = 5; P.vy = 0;
      P.ride = 'bike'; P.railActive = false; P.onGround = true; P.inv = 0; P.hearts = 3;
      held.right = true; held.down = duck;
      for (let i = 0; i < 80 && P.hearts === 3 && P.x < (branches[0].x + 1) * TS; i++) step();
      held.right = held.down = false;
      return { hearts: P.hearts, passed: P.x >= (branches[0].x + 1) * TS };
    };
    return { length: r.x1 - r.x0 + 1, obstacles, flag: L.checks.some(c => c.x / TS < r.x0),
      adult: hit(0, false), duck: hit(0, true), child: hit(3, false) };
  });
  expect(result.length).toBeGreaterThanOrEqual(140);
  expect(result.flag).toBe(true);
  expect(new Set(result.obstacles.map(h => h.kind))).toEqual(new Set(['branch', 'block', 'rock']));
  const gaps = result.obstacles.slice(1).map((h, i) => h.x - result.obstacles[i].x);
  expect(Math.min(...gaps)).toBeGreaterThanOrEqual(12);
  expect(new Set(gaps).size).toBeGreaterThanOrEqual(3);
  expect(result.adult.hearts).toBe(2);
  expect(result.duck).toEqual({ hearts: 3, passed: true });
  expect(result.child).toEqual({ hearts: 3, passed: true });
});

test('Hoge Veluwe: bukken met het toetsenbord en de aanraakknop', async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8 });
  await startDay(page, 5);
  await page.evaluate(() => {
    const r = L.d.ride; L.enemies = []; P.x = (r.x0 + 2) * TS; P.y = r.row * TS - P.h; P.vx = 0;
  });
  await page.waitForFunction(() => P.ride === 'bike' && P.onGround);
  await page.keyboard.down('ArrowDown');
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(true);
  await page.keyboard.up('ArrowDown');
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(false);
  await page.evaluate(() => document.getElementById('tA').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 })));
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(true);
  await page.evaluate(() => document.getElementById('tA').dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 })));
  await expect.poll(() => page.evaluate(() => P.railDuck)).toBe(false);
});

for (const char of [0, 3]) test(`Hoge Veluwe: de hele fietsrit is te rijden met springen en bukken (personage ${char})`, async ({ page }) => {
  await seed(page, { region: 'netherlands', unlocked: 8, char });
  await startDay(page, 5);
  const result = await simulate(page, () => {
    const r = L.d.ride, obstacles = [
      ...r.hazards,
      ...L.d.blocks.filter(([x]) => x >= r.x0 && x <= r.x1).map(([x]) => ({ x, kind: 'block' })),
      ...L.d.rocks.filter(([x]) => x >= r.x0 && x <= r.x1).map(([x]) => ({ x, kind: 'rock' }))
    ].sort((a, b) => a.x - b.x);
    L.enemies = []; P.x = (r.x0 + 1) * TS; P.y = r.row * TS - P.h;
    P.vx = P.vy = 0; P.onGround = true; P.hearts = 3; held.right = true;
    let jumped = -1;
    for (let i = 0; i < 1600 && P.hearts === 3 && P.x < (r.x1 + 1) * TS; i++) {
      const next = obstacles.find(h => (h.x + 1) * TS > P.x);
      const distance = next ? next.x * TS - (P.x + P.w) : Infinity;
      held.down = !!next && next.kind === 'branch' && distance < 95;
      if (next && next.kind !== 'branch' && distance < 85 && jumped !== next.x && P.onGround) {
        edges.push('jump'); jumped = next.x;
      }
      held.jump = !!next && next.kind !== 'branch' && jumped === next.x && !P.onGround;
      step();
    }
    held.right = held.down = held.jump = false;
    return { hearts: P.hearts, finished: P.x >= (r.x1 + 1) * TS };
  });
  expect(result).toEqual({ hearts: 3, finished: true });
});

test('spoorfiets: de gewone schoenen verschijnen alleen tijdens het springen', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const poses = await page.evaluate(() => {
    const r = L.d.ride, ambient = drawAmbient;
    L.npcs = []; L.enemies = []; P.x = (r.x0 + 2) * TS; P.ride = 'railbike'; P.railActive = true;
    P.inv = 0; P.slide = 0; P.onGround = true; cam = P.x - 250;
    const out = [];
    drawAmbient = () => {};
    try {
      for (const char of [0, 3]) for (const face of [-1, 1]) {
        save.char = char; const ch = heroChar(), shoes = ch.shoes;
        P.h = Math.round(40 * ch.size); P.y = r.row * TS - P.h; P.face = face;
        try {
          for (const pose of ['sit', 'duck', 'jump']) {
            P.railDuck = pose === 'duck'; P.railJump = pose === 'jump' ? 28 : 0;
            ch.shoes = '#ff0022'; render(); const a = g.getImageData(0, 0, cv.width, cv.height).data;
            ch.shoes = '#0077ff'; render(); const b = g.getImageData(0, 0, cv.width, cv.height).data;
            out.push({ pose, changed: a.some((value, i) => value !== b[i]) });
          }
        } finally { if (shoes === undefined) delete ch.shoes; else ch.shoes = shoes; }
      }
    } finally { drawAmbient = ambient; }
    return out;
  });
  for (const p of poses) expect(p.changed, p.pose).toBe(p.pose === 'jump');
});

test('spoorfiets: wildroosters houden dieren aan beide kanten van het spoor', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  await startDay(page, 1);
  const result = await simulate(page, () => {
    const r = L.d.ride, left = (r.x0 - 1) * TS, right = (r.x1 + 2) * TS;
    const initiallyClear = L.enemies.every(e => e.x + e.w <= left || e.x >= right);
    const checks = [];
    for (const side of [-1, 1]) for (const chasing of [false, true]) {
      const e = { kind: 'zwijn', x: side < 0 ? left - 30 : right, y: r.row * TS - 22, w: 30, h: 22, vx: -side, dead: 0 };
      L.enemies = [e];
      P.x = (chasing ? (side < 0 ? r.x0 : r.x1 + 1) * TS - P.w / 2 + (side < 0 ? 1 : -1)
        : (side < 0 ? r.x1 - 2 : r.x0 + 2) * TS);
      P.y = r.row * TS - P.h; P.vx = P.vy = 0; P.onGround = true; P.inv = 0; P.hearts = 3;
      P.railActive = false; P.railJump = P.railV = 0;
      held.left = held.right = held.down = held.jump = false;
      for (let i = 0; i < (chasing ? 120 : 1); i++) step();
      checks.push({ outside: side < 0 ? e.x + e.w <= left : e.x >= right, chasing: !!e.chase, turned: Math.sign(e.vx) === side, hearts: P.hearts });
    }
    return { initiallyClear, checks };
  });
  expect(result.initiallyClear).toBe(true);
  for (const [i, check] of result.checks.entries()) {
    expect(check).toMatchObject({ outside: true, chasing: i % 2 === 1, hearts: 3 });
    if (i % 2 === 0) expect(check.turned).toBe(true);
  }
});

for (const char of [0, 3, 8]) test(`spoorfiets: het hele spoor is te rijden met springen en bukken (personage ${char})`, async ({ page }) => {
  await seed(page, { unlocked: 8, char });
  await startDay(page, 1);
  const result = await simulate(page, () => {
    const r = L.d.ride;
    P.x = (r.x0 - 3) * TS; P.y = r.row * TS - P.h; P.vx = 0; P.vy = 0; P.onGround = true;
    held.right = true;
    let jumped = -1;
    for (let i = 0; i < 900 && P.hearts === 3 && P.x + P.w / 2 < (r.x1 + 1) * TS; i++) {
      const next = r.hazards.find(h => (h.x + 1) * TS > P.x);
      const distance = next ? next.x * TS - (P.x + P.w) : Infinity;
      held.down = !!next && next.kind === 'branch' && distance < 75;
      if (next && next.kind === 'ribbon' && distance < 75 && jumped !== next.x) {
        jumped = next.x; held.jump = true; edges.push('jump');
      }
      if (!next || next.kind !== 'ribbon') held.jump = false;
      step();
    }
    held.right = held.down = held.jump = false;
    return { finished: P.x + P.w / 2 >= (r.x1 + 1) * TS, hearts: P.hearts, coins: L.coins, flag: L.respawn.x > 2 * TS };
  });
  expect(result).toMatchObject({ finished: true, hearts: 3, flag: true });
  expect(result.coins).toBeGreaterThan(0);
});
