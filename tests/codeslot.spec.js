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

for (const lang of ['en', 'nl']) for (const [day, answer, symbols] of [
  [1, '3817', ['🍄', '🌲', '🦔', '🍂']],
  [2, '6382', ['⭐', '🔔', '🎠', '🥨']]
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
