const { test, expect } = require('@playwright/test');
const { seed, startDay, put } = require('./helpers');

test('een foute code geeft een grapje, na drie keer een tip, de goede code opent de deur', async ({ page }) => {
  await seed(page);
  await startDay(page, 0);
  const pad = await page.evaluate(() => L.pad);
  await put(page, pad.x + 5, pad.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#padTitle')).toHaveText('Key safe of the cabin');
  await page.keyboard.type('1234');
  await expect(page.locator('#padFb')).toContainText('Wrong');
  await expect(page.locator('#digits span').first()).toHaveText('', { timeout: 3000 });
  await page.keyboard.type('1111');
  // wait until the lock has emptied itself again (on a busy machine that can take a moment)
  await expect.poll(() => page.evaluate(() => L.codeTries)).toBe(2);
  await expect(page.locator('#digits span').first()).toHaveText('', { timeout: 3000 });
  await page.keyboard.type('2222');
  await expect(page.locator('#padFb')).toContainText('Tip: the code starts with 49');
  await page.waitForTimeout(700);
  // Met de knoppen op het scherm
  for (const d of '4944') await page.locator('#keys button', { hasText: new RegExp(`^${d}$`) }).click();
  await expect(page.locator('#padWrap')).toBeHidden();
  expect(await page.evaluate(() => L.codeOpen)).toBe(true);
  await expect(page.locator('#hCode')).toHaveText('🔓 code');
});

for (const [lang, seasons, parking, bedrooms] of [
  ['en', 'spring, summer, autumn and winter', '2 spaces have a car and 2 are empty', '2 bedrooms on the first floor and 2 on the second'],
  ['nl', 'lente, zomer, herfst en winter', '2 auto’s en zijn 2 plekken leeg', '2 slaapkamers op de eerste verdieping en 2 op de tweede']
]) test(`aankomst: de aanwijzingen voor het slot leren optellen en de seizoenen (${lang})`, async ({ page }) => {
  await seed(page, { lang });
  const clues = await page.evaluate(() => ({
    answer: LEVELS[0].code.answer,
    riddle: LEVELS[0].code.riddle,
    signs: LEVELS[0].ents.filter(e => e[0] === 'sign').flatMap(e => e[3]).join(' ').replace(/'/g, '’')
  }));
  expect(clues.answer).toBe('4944');
  expect(clues.riddle).toContain(lang === 'nl' ? 'seizoenen' : 'seasons');
  expect(clues.signs).toContain(seasons);
  expect(clues.signs).toContain(parking);
  expect(clues.signs).toContain(bedrooms);
});

for (const [lang, decades, floors] of [
  ['en', 'four decades old. A decade is ten years', 'level 1 and level 2'],
  ['nl', 'vier decennia oud. Een decennium is tien jaar', 'niveau 1 en niveau 2']
]) test(`verjaardag: de aanwijzingen leggen decennia en verdiepingen uit (${lang})`, async ({ page }) => {
  await seed(page, { lang, unlocked: 8 });
  const info = await page.evaluate(() => ({
    answer: LEVELS[3].code.answer,
    signs: LEVELS[3].ents.filter(e => e[0] === 'sign').flatMap(e => e[3]).join(' ')
  }));
  expect(info.answer).toBe('4022');
  expect(info.signs).toContain(decades);
  expect(info.signs).toContain(floors);
});

for (const [lang, people, sauna] of [
  ['en', '9 people. Each of the 2 families has 2 grown-ups', '2 benches, each with room for 2 people'],
  ['nl', '9 mensen. Elk van de 2 gezinnen heeft 2 volwassenen', '2 banken met elk plek voor 2 mensen']
]) test(`kerstdag: de aanwijzingen leggen de sommen uit (${lang})`, async ({ page }) => {
  await seed(page, { lang, unlocked: 8 });
  const info = await page.evaluate(() => ({
    answer: LEVELS[4].code.answer,
    signs: LEVELS[4].ents.filter(e => e[0] === 'sign').flatMap(e => e[3]).join(' ')
  }));
  expect(info.answer).toBe('5474');
  expect(info.signs).toContain(people);
  expect(info.signs).toContain(sauna);
});

for (const lang of ['en', 'nl']) for (const [day, answer, symbols] of [
  [1, '3817', ['🍄', '🌲', '🦔', '🍂']],
  [2, '6382', ['⭐', '🔔', '🎠', '🥨']],
  [5, '6254', ['🦌', '🐗', '🦉', '🦊']],
  [6, '7924', ['🌙', '👨‍👩‍👧', '🛏️', '🧖']],
  [7, '2128', ['🚗', '🧳', '🎄', '🏠']]
]) test(`dag ${day + 1}: elk symbool heeft een vraag in plaats van een antwoord (${lang})`, async ({ page }) => {
  await seed(page, { lang, unlocked: 8 });
  const info = await page.evaluate(day => {
    const d = LEVELS[day], signs = d.ents.filter(e => e[0] === 'sign').map(e => e[3][0]);
    return { answer: d.code.answer, riddle: d.code.riddle, questions: d.code.questions, signs };
  }, day);
  expect(info.answer).toBe(answer);
  expect(info.riddle).toContain(lang === 'nl' ? 'vragen' : 'questions');
  for (const [i, symbol] of symbols.entries()) {
    expect(info.signs).toContain(`${symbol}: ${info.questions[i]}`);
    expect(info.signs.some(s => s.includes(`${symbol} = `))).toBe(false);
  }
});

for (const lang of ['en', 'nl']) test(`noordpool: de klimaat- en natuurvragen geven de slotcijfers (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'pole' });
  const info = await page.evaluate(() => ({
    answer: LEVELS[0].code.answer,
    questions: LEVELS[0].code.questions,
    signs: LEVELS[0].ents.filter(e => e[0] === 'sign').map(e => e[3][0])
  }));
  expect(info.answer).toBe('5180');
  for (const [i, symbol] of ['❄️', '🦌', '🎅', '⭐'].entries())
    expect(info.signs).toContain(`${symbol}: ${info.questions[i]}`);
});

for (const lang of ['en', 'nl']) test(`tirol: vragen over kaart, tijd en dieren geven de slotcijfers (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'tirol' });
  const info = await page.evaluate(() => ({
    answer: LEVELS[0].code.answer, questions: LEVELS[0].code.questions,
    signs: LEVELS[0].ents.filter(e => e[0] === 'sign').map(e => e[3][0])
  }));
  expect(info.answer).toBe('4718');
  for (const [i, symbol] of ['🏔️', '🔑', '🐐', '⛪'].entries())
    expect(info.signs).toContain(`${symbol}: ${info.questions[i]}`);
});

for (const lang of ['en', 'nl']) for (const [region, day, answer] of [
  ['pole', 1, '1355'], ['tirol', 3, '5315']
]) test(`${region} dag ${day + 1}: bellenvragen geven de tonen zonder ze voor te spelen (${lang})`, async ({ page }) => {
  await seed(page, { lang, region, unlocked: 8 });
  await startDay(page, day);
  const info = await page.evaluate(() => {
    const c = L.clues[0];
    P.x = c.x + 5; P.y = c.y + 32 - P.h; P.vx = P.vy = 0;
    step();
    return { x: c.x, y: c.y, heard: c.heard, ring: c.ring, question: c.question[0], answer: L.d.code.answer };
  });
  expect(info.answer).toBe(answer);
  expect(info.heard).toBe(false);
  expect(info.ring).toBe(0);
  await put(page, info.x + 5, info.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText(info.question);
});

for (const lang of ['en', 'nl']) for (const [region, day, answer, count] of [
  ['pole', 2, lang === 'nl' ? 'ELFEN' : 'ELVES', 5], ['tirol', 6, 'FONDUE', 6]
]) test(`${region} dag ${day + 1}: vragen op de blokken geven de letters (${lang})`, async ({ page }) => {
  await seed(page, { lang, region, unlocked: 8 });
  await startDay(page, day);
  const info = await page.evaluate(() => {
    const c = L.clues[0], draw = g.fillText, text = [];
    try { g.fillText = (...args) => { text.push(args[0]); return draw.apply(g, args); }; drawClue(c); }
    finally { g.fillText = draw; }
    return { x: c.x, y: c.y, question: c.question[0], text, answer: L.d.code.answer, count: L.clues.filter(x => x.question).length };
  });
  expect(info.answer).toBe(answer);
  expect(info.count).toBe(count);
  expect(info.text).toContain('?');
  expect(info.text).not.toContain('E');
  await put(page, info.x + 5, info.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText(info.question);
});

for (const [lang, insulated, question] of [
  ['en', 'Snow holds pockets of air', '4: trapped air'],
  ['nl', 'Sneeuw houdt lucht vast', '4: vastgehouden lucht']
]) test(`iglo: een natuurvraag zit tussen de telvragen (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'pole', unlocked: 8 });
  const info = await page.evaluate(() => {
    const d = LEVELS[3];
    return { answer: d.code.answer, riddle: d.code.riddle, npcs: d.ents.filter(e => e[0] === 'npc' && e[3].lines).flatMap(e => e[3].lines).join(' '),
      igloos: d.deco.filter(d => d[0] === 'igloo').length, canes: d.deco.filter(d => d[0] === 'candycane').length };
  });
  expect(info.answer).toBe('342');
  expect(info.riddle).toContain(question);
  expect(info.npcs).toContain(insulated);
  expect([info.igloos, info.canes]).toEqual([3, 2]);
});

for (const lang of ['en', 'nl']) for (const [region, day, answer] of [
  ['pole', 4, 'RGBY'], ['tirol', 7, 'RWRG']
]) test(`${region} dag ${day + 1}: lampvragen bepalen de kleuren zonder ze te verraden (${lang})`, async ({ page }) => {
  await seed(page, { lang, region, unlocked: 8 });
  await startDay(page, day);
  const info = await page.evaluate(() => {
    const c = L.clues[0], draw = g.fill, colours = [];
    try { g.fill = (...args) => { colours.push(g.fillStyle); return draw.apply(g, args); }; drawClue(c); }
    finally { g.fill = draw; }
    return { x: c.x, y: c.y, question: c.question[0], colours, answer: L.d.code.answer, count: L.clues.filter(x => x.question).length };
  });
  expect(info.answer).toBe(answer);
  expect(info.count).toBe(4);
  expect(info.colours).toContain('#d0c5ad');
  expect(info.colours).not.toContain('#e8423a');
  await put(page, info.x + 5, info.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText(info.question);
});

for (const lang of ['en', 'nl']) for (const [region, day, answer] of [
  ['pole', 5, '↑→→↓'], ['tirol', 1, '→↓→↓'], ['tirol', 4, '↓←↓→']
]) test(`${region} dag ${day + 1}: vragen bepalen de pijlen (${lang})`, async ({ page }) => {
  await seed(page, { lang, region, unlocked: 8 });
  await startDay(page, day);
  const info = await page.evaluate(() => {
    const c = L.clues[0], draw = g.fillText, text = [];
    try { g.fillText = (...args) => { text.push(args[0]); return draw.apply(g, args); }; drawClue(c); }
    finally { g.fillText = draw; }
    return { x: c.x, y: c.y, question: c.question[0], text, answer: L.d.code.answer, count: L.clues.filter(x => x.question).length };
  });
  expect(info.answer).toBe(answer);
  expect(info.count).toBe(4);
  expect(info.text).toContain('?');
  await put(page, info.x + 5, info.y + 32);
  await page.keyboard.press('e');
  await expect(page.locator('#dialog')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText(info.question);
});

for (const [lang, starting, explanation] of [
  ['en', 'eleven in the evening and leaves 45 minutes later', 'add 12 to the hour'],
  ['nl', "elf uur 's avonds klaar en vertrekt 45 minuten later", 'Tel bij een avondtijd 12 op']
]) test(`kerstavond: de vertrektijd berekenen op een 24-uursklok (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'pole', unlocked: 8 });
  const info = await page.evaluate(() => ({
    answer: LEVELS[6].code.answer,
    signs: LEVELS[6].ents.filter(e => e[0] === 'sign').flatMap(e => e[3]).join(' ')
  }));
  expect(info.answer).toBe('2345');
  expect(info.signs).toContain(starting);
  expect(info.signs).toContain(explanation);
});

for (const [lang, starting, explanation] of [
  ['en', '45 minutes after a quarter to seven', 'add 12 to the hour'],
  ['nl', "45 minuten na kwart voor zeven", '12 op bij het uur']
]) test(`berghut: kwartieren en de 24-uursklok (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'tirol', unlocked: 8 });
  const info = await page.evaluate(() => ({
    answer: LEVELS[5].code.answer,
    signs: LEVELS[5].ents.filter(e => e[0] === 'sign').flatMap(e => e[3]).join(' ')
  }));
  expect(info.answer).toBe('1930');
  expect(info.signs).toContain(starting);
  expect(info.signs).toContain(explanation);
  await startDay(page, 5);
  for (const text of [starting, explanation]) {
    const sign = await page.evaluate(text => {
      const s = L.signs.find(s => s.lines.some(line => line.includes(text)));
      return { x: s.x, y: s.y, line: s.lines.find(line => line.includes(text)) };
    }, text);
    await put(page, sign.x + 5, sign.y + 32);
    await page.keyboard.press('e');
    await expect(page.locator('#dialog')).toContainText(sign.line);
    await page.evaluate(() => { while (dialog) advanceDialog(); });
  }
});

for (const [lang, location, question] of [
  ['en', "Antarctica's coast", '5: penguins'],
  ['nl', 'kust van Antarctica', '5: pinguïns']
]) test(`noordpool naar huis: telvragen en leefgebieden (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'pole', unlocked: 8 });
  const info = await page.evaluate(() => {
    const d = LEVELS[7];
    return { answer: d.code.answer, riddle: d.code.riddle, npcs: d.ents.filter(e => e[0] === 'npc' && e[3].lines).flatMap(e => e[3].lines).join(' '),
      reindeer: d.deco.filter(d => d[0] === 'deer').length, presents: d.deco.filter(d => d[0] === 'presents').length };
  });
  expect(info.answer).toBe('253');
  expect(info.riddle).toContain(question);
  expect(info.npcs).toContain(location);
  expect([info.reindeer, info.presents]).toEqual([2, 3]);
});

test('elke dag met een codeslot heeft bordjes met de cijfers of een raadsel', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const r = await page.evaluate(() => LEVELS.map(d => {
    if (!d.code) return null;
    const signs = d.ents.filter(e => e[0] === 'sign').map(e => e[3].join(' '));
    const syms = d.code.riddle.match(/Vier symbolen: (.*)\. /);
    return { answer: d.code.answer, digits: d.code.answer.length, clues: syms ? syms[1].split('  ').filter(s => signs.some(t => t.includes(s + (d.code.questions ? ': ' : ' = ')))).length : 4 };
  }).filter(Boolean));
  for (const c of r) { expect(c.digits).toBe(4); expect(c.clues).toBe(4); }
});

test('every lock in every region can be solved from what is in the level', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const bad = await page.evaluate(() => REGIONS.flatMap(r => r.levels.map((d, i) => {
    if (!d.code || !d.seed) return null; // the hand-built Ardennes days have riddles (checked above)
    const c = d.code, kind = c.kind || 'symbols', ans = [...c.answer], where = `${r.id} ${i + 1} (${kind})`;
    const keys = c.keys || lockKeys(c);
    if (!ans.every(v => keys.some(k => k.v === v))) return `${where}: a part of the answer has no key`;
    if (kind === 'symbols') {
      const signs = d.ents.filter(e => e[0] === 'sign').map(e => e[3][0]);
      return c.questions ? (c.questions.length === 4 && c.questions.every(q => signs.some(s => s.endsWith(q))) ? null : `${where}: questions`)
        : (signs.filter(s => / = \d/.test(s)).length >= 4 ? null : `${where}: signs`);
    }
    if (kind === 'count') { const deco = d.deco.map(x => x[0]); return c.count.every(([k], j) => deco.filter(x => x === k).length === +ans[j]) ? null : `${where}: wrong numbers of things`; }
    if (kind === 'clock') return ans.length === 4 && d.ents.some(e => e[0] === 'sign') ? null : `${where}: no clock clues`;
    const clues = d.ents.filter(e => e[0] === 'clue').sort((a, b) => a[3].i - b[3].i).map(e => e[3].v);
    return clues.join('') === c.answer ? null : `${where}: clues ${clues.join('')} for ${c.answer}`;
  })).filter(Boolean));
  expect(bad).toEqual([]);
});

test('question clues have room away from other interactions', async ({ page }) => {
  await seed(page, { unlocked: 8 });
  const overlaps = await page.evaluate(() => REGIONS.flatMap(region => region.levels.flatMap((level, day) =>
    level.ents.filter(e => e[0] === 'clue' && e[3].question).flatMap(clue =>
      level.ents.filter(e => e !== clue && ['npc', 'sign', 'switch', 'bell', 'animal', 'clue'].includes(e[0]) && Math.abs(e[1] - clue[1]) < 3)
        .map(e => `${region.id} ${day + 1}: clue ${clue[3].i + 1} near ${e[0]}`)
    )
  )));
  expect(overlaps).toEqual([]);
});

for (const [lang, question, explanation] of [
  ['en', '2: 1,000', 'A kilometre is 1,000 metres'],
  ['nl', '2: 1000', 'Een kilometer is 1000 meter']
]) test(`tirol kabelbaan: eenheden tussen de telvragen (${lang})`, async ({ page }) => {
  await seed(page, { lang, region: 'tirol', unlocked: 8 });
  const info = await page.evaluate(() => {
    const d = LEVELS[2];
    return { answer: d.code.answer, riddle: d.code.riddle, npcs: d.ents.filter(e => e[0] === 'npc' && e[3].lines).flatMap(e => e[3].lines).join(' '),
      chalets: d.deco.filter(d => d[0] === 'chalet').length, chamois: d.deco.filter(d => d[0] === 'deer').length };
  });
  expect(info.answer).toBe('324');
  expect(info.riddle).toContain(question);
  expect(info.npcs).toContain(explanation);
  expect([info.chalets, info.chamois]).toEqual([3, 4]);
});
