"use strict";
// Poppetjes, vijanden en voorwerpen.
/* ---------- Poppetje ---------- */
const RAIL_DUCK_ANGLE = 1.1;
function drawPerson(c, cx, by, s, face, phase, air, hat, opts = {}) {
  const t = opts.t || 0, moving = !!opts.moving, kid = !!c.kid, sz = c.size || 1;
  const skin = c.skin || "#f4caa6", skinD = c.skin ? shade(c.skin, -.14) : "#d9a07c", shoe = c.shoes || "#3a2a22";
  // Indoors Paul wears his green Christmas jumper with a Saab 900 on it.
  const sweater = opts.indoor && c.sweater;
  // Summer (Dalmatia): a light T-shirt instead of a coat, shorts, and no hat or scarf.
  const summer = !!opts.summer && !sweater;
  // In summer a dress is the whole outfit: the top is the colour of the dress.
  const coat = sweater ? c.sweater : summer ? (c.dress || shade(c.coatCol, .3)) : c.coatCol, coatD = shade(coat, -.3), coatL = shade(coat, .25);
  const pants = c.pants, pantsD = shade(pants, -.28);
  const hairC = c.hairCol, hairL = shade(hairC, .3), hairD = shade(hairC, -.35);
  const bob = (!moving && !air) ? Math.sin(t / 280) * .5 : 0;
  const sw = air ? .5 : moving ? Math.sin(phase) * .7 : 0;
  // Kinderen hebben een iets grotere kop en een korter lijf.
  const hr = kid ? 9.4 : 8.6, hip = kid ? -12 : -13, top = (kid ? -26 : -28) + bob, hy = top - hr + .6;
  const longCoat = c.coat === "long" && !opts.indoor && !opts.summer;
  // When sliding or ducking the body turns; keep the head facing forwards.
  const tilt = opts.slide ? -1.3 : opts.duck ? -RAIL_DUCK_ANGLE : 0;
  const tiltOn = () => { if (tilt) { g.save(); g.translate(0, top); g.rotate(tilt); g.translate(0, -top); } };
  const tiltOff = () => { if (tilt) g.restore(); };
  g.save(); g.translate(cx, by); g.scale(face * s * sz, s * sz);
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.5; g.strokeStyle = OUT;

  // rugzak en haar achter het lijf
  if (c.backpack && !sweater) { blob(c.backpack, () => rp(-12.5, top + 1, 7, 15, 2.5)); g.fillStyle = shade(c.backpack, .2); g.fillRect(-11.5, top + 9, 5, 2); }
  tiltOn();
  if (c.hair === "long") blob(hairC, () => rp(-hr - 1.5, hy - 3, hr + 4, top - hy + 13, 5));
  if (c.hair === "flowing") {
    // lang, golvend haar tot halverwege de rug
    // Bij het lopen waait het haar naar achteren en zwaait het mee op de stappen; bij een sprong waait het op.
    const len = top - hy + 19;
    // Bij buikglijden waait het haar naar achteren, net als bij een sprong.
    const blown = air || opts.slide;
    const trail = blown ? -7 : moving ? -5 : 0;
    const swing = moving ? Math.sin(phase) * 3.5 : Math.sin(t / 400) * .6;
    const lift = blown ? -7 : moving ? -1.5 - Math.abs(Math.sin(phase)) * 2 : 0;
    const tipX = -5 + trail + swing, tipY = hy + len + lift, midX = -hr - 5 + trail * .6 + swing * .5;
    blob(hairC, () => { g.moveTo(-1, hy - hr); g.quadraticCurveTo(-hr - 6 + trail * .3, hy - 1, midX, hy + len * .55 + lift * .4); g.quadraticCurveTo(midX + 1, tipY + 1, tipX, tipY); g.quadraticCurveTo(0, tipY - 3, 1, hy + len * .5); g.lineTo(3, hy); g.closePath(); });
    g.strokeStyle = shade(hairC, -.2); g.lineWidth = .9; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-3 - i * 2, hy + 2); g.quadraticCurveTo(midX + 6 - i, hy + len * .5 + lift * .4, tipX - i * 1.5, tipY - 2); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  if (c.hair === "bob" || c.hair === "curly") {
    blob(hairC, () => rp(-hr - 2, hy - hr - .5, hr * 2 + 2.5, hr * 2 + 4, hr));
    if (c.hair === "curly") { g.fillStyle = hairC; for (let i = 0; i < 6; i++) { const a = Math.PI * (.55 + i * .17); g.beginPath(); g.arc(-1 + Math.cos(a) * (hr + 1.5), hy + 1 + Math.sin(a) * (hr + 1.5), 2.6, 0, 7); g.fill(); g.stroke(); } }
  }
  if (c.hair === "ponytail") {
    g.save(); g.translate(-hr + .5, hy - 1); g.rotate(.5 + Math.sin(t / 160) * (moving ? .25 : .08));
    blob(hairC, () => g.ellipse(-1, 8, 3.2, 8.5, 0, 0, 7)); g.restore();
  }
  tiltOff();

  // benen
  const leg = (x, a, col) => {
    g.save(); g.translate(x, hip); g.rotate(a);
    // bareSummer (your own hero in a skirt or dress): bare legs in summer, tights otherwise; shorts: bare legs all year
    if (summer && c.bareSummer) blob(skinD, () => g.rect(-2.4, 0, 4.8, -hip - 2));
    else if (summer || c.shorts) { blob(skinD, () => g.rect(-2.4, 0, 4.8, -hip - 2)); blob(col, () => g.rect(-2.9, 0, 5.8, (-hip - 2) * .45)); }
    else blob(col, () => g.rect(-2.7, 0, 5.4, -hip - 2));
    blob(shoe, () => rp(-3.2, -hip - 3.6, 8.2, 4.2, 1.6));
    if (c.laces) c.laces.forEach((lc, i) => { g.fillStyle = lc; g.fillRect(-1.5 + i * 2, -hip - 3, 1.4, 1.4); });
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(-2, -hip - 3, 4, 1);
    g.restore();
  };
  const handleArm = (x, col, handCol) => {
    const hx = opts.handle.x, hy = opts.handle.y, sy = top + 2;
    const ex = (x + hx) / 2 - 1, ey = (sy + hy) / 2 + 3;
    const path = () => { g.beginPath(); g.moveTo(x, sy); g.lineTo(ex, ey); g.lineTo(hx, hy); g.stroke(); };
    g.strokeStyle = OUT; g.lineWidth = 7; path();
    g.strokeStyle = summer ? handCol : col; g.lineWidth = 5; path();
    if (summer) {
      g.strokeStyle = col; g.beginPath(); g.moveTo(x, sy); g.lineTo((x + ex) / 2, (sy + ey) / 2); g.stroke();
    }
    g.strokeStyle = OUT; g.lineWidth = 1.5; blob(handCol, () => g.arc(hx, hy, 2.3, 0, 7));
  };
  if (!opts.hideLegs) leg(-3, sw, pantsD);
  // achterste arm
  if (opts.handle) handleArm(-3, coatD, skinD);
  else {
    g.save(); g.translate(-3, top + 2); g.rotate(opts.slide ? Math.PI - .3 : air ? 2.3 : sw * .8);
    if (summer) { blob(skinD, () => rp(-2, 0, 4, 11, 2)); blob(coatD, () => rp(-2.5, 0, 5, 4.5, 2)); } else blob(coatD, () => rp(-2.3, 0, 4.6, 11, 2));
    blob(skinD, () => g.arc(0, 11.6, 2.3, 0, 7)); g.restore();
  }
  if (!opts.hideLegs) leg(3, -sw, pants);

  // rokje over de maillot
  if (c.skirt) {
    blob(c.skirt, () => { g.moveTo(-7.5, hip - 2); g.lineTo(7.5, hip - 2); g.lineTo(9.5, hip + 4.5); g.lineTo(-9.5, hip + 4.5); g.closePath(); });
    g.strokeStyle = shade(c.skirt, -.3); g.lineWidth = .9; [-4, 0, 4].forEach(px => { g.beginPath(); g.moveTo(px, hip - 1); g.lineTo(px * 1.25, hip + 4); g.stroke(); }); g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  // jurk: langer en wijder dan het rokje, tot over de knie
  if (c.dress) {
    blob(c.dress, () => { g.moveTo(-8, hip - 3); g.lineTo(8, hip - 3); g.lineTo(10.5, hip + 8.5); g.quadraticCurveTo(0, hip + 10, -10.5, hip + 8.5); g.closePath(); });
    g.strokeStyle = shade(c.dress, -.3); g.lineWidth = .9; [-4.5, 0, 4.5].forEach(px => { g.beginPath(); g.moveTo(px, hip); g.lineTo(px * 1.3, hip + 8); g.stroke(); }); g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  // jas
  const bodyH = longCoat ? (hip + 8) - top : hip + 2 - top;
  const bodyPath = () => { if (longCoat) { g.moveTo(-8, top + 3); g.quadraticCurveTo(-8, top, -5, top); g.lineTo(5, top); g.quadraticCurveTo(8, top, 8, top + 3); g.lineTo(9.5, top + bodyH); g.lineTo(-9.5, top + bodyH); g.closePath(); } else rp(c.coat === "puffer" ? -8.8 : -8, top, c.coat === "puffer" ? 17.6 : 16, bodyH, c.coat === "puffer" ? 5.5 : 4); };
  g.save(); g.beginPath(); bodyPath(); g.fillStyle = coat; g.fill(); g.clip();
  g.fillStyle = coatD; g.fillRect(-10, top, 4.5, bodyH + 2);
  g.fillStyle = coatL; g.fillRect(2, top + 2, 3, 9);
  if (sweater) {
    // kerstpatroon: een witte rand met sneeuwvlokjes en een kleine auto
    g.fillStyle = "#f4f8ff"; for (let x = -9; x < 10; x += 3) { g.fillRect(x, top + 2, 1.4, 1.4); g.fillRect(x + 1.5, top + 3.5, 1.4, 1.4); }
    g.fillRect(-6, top + 9, 9, 2.4); g.fillRect(-4, top + 7.6, 5, 1.6); g.beginPath(); g.arc(-4, top + 11.8, 1.2, 0, 7); g.arc(2, top + 11.8, 1.2, 0, 7); g.fill();
    g.fillStyle = "#2a9a4a"; g.fillRect(-3, top + 5.8, 3, 1.8);
  }
  if (c.coat === "puffer" && !opts.indoor && !summer) { g.strokeStyle = coatD; g.lineWidth = 1; for (let y = top + 4.5; y < top + bodyH; y += 4.2) { g.beginPath(); g.moveTo(-10, y); g.lineTo(10, y); g.stroke(); } }
  g.strokeStyle = coatD; g.lineWidth = 1; g.beginPath(); g.moveTo(4, top + 1); g.lineTo(4, top + bodyH); g.stroke();
  if (c.coat !== "puffer" && !sweater) { g.fillStyle = coatD; g.fillRect(-4, top + bodyH - (longCoat ? 12 : 6), 5, 1.2); }
  g.restore();
  g.lineWidth = 1.5; g.strokeStyle = OUT; g.beginPath(); bodyPath(); g.stroke();

  // sjaal: eigen sjaal, of een rode in de sneeuw
  // noScarf: your own hero chose no scarf, so no red one in the snow either
  const scarf = summer ? null : c.scarf || (opts.scarf && !c.noScarf ? ["#d33a3a", "#ffffff"] : null);
  if (scarf) {
    const band = () => rp(-8.8, top - 2.5, 17.6, 5.5, 2.5);
    g.save(); g.beginPath(); band(); g.clip(); scarf.forEach((col, i) => { g.fillStyle = col; g.fillRect(-9 + i * 18 / scarf.length, top - 3, 18 / scarf.length + .5, 6); }); g.restore();
    g.beginPath(); band(); g.stroke();
    g.save(); g.translate(5, top + 1.5); g.rotate(-.12 + Math.sin(t / 150) * .08 * (moving ? 2 : 1));
    g.beginPath(); rp(-2.2, 0, 4.6, kid ? 9 : 12, 1.5); g.save(); g.clip(); scarf.forEach((col, i) => { g.fillStyle = col; g.fillRect(-3, i * 3, 6, 3); }); for (let i = scarf.length; i < 5; i++) { g.fillStyle = scarf[i % scarf.length]; g.fillRect(-3, i * 3, 6, 3); } g.restore(); g.stroke();
    g.restore();
  } else { g.fillStyle = skin; g.beginPath(); g.moveTo(-1, top); g.lineTo(5, top); g.lineTo(2, top + 4); g.fill(); }

  // nek en hoofd
  g.fillStyle = skinD; g.fillRect(-2, top - 2, 4, 3);
  tiltOn();
  blob(skin, () => g.arc(0, hy, hr, 0, 7));
  g.fillStyle = skinD; g.beginPath(); g.ellipse(-3.2, hy + 1, 1.6, 2.2, 0, 0, 7); g.fill();
  g.strokeStyle = "#b9805e"; g.lineWidth = .8; g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.5;

  // haar voor
  if (c.hair === "bald") {
    g.strokeStyle = hairC; g.globalAlpha = .55; g.lineWidth = 2; g.beginPath(); g.arc(0, hy, hr - 1, Math.PI * .75, Math.PI * 1.1); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(1, hy - hr + 2.5, 3, 1.4, -.2, 0, 7); g.fill();
  } else if (c.hair === "short") {
    blob(hairC, () => { g.moveTo(-hr - .4, hy + 3); g.arc(0, hy - 1, hr + .4, Math.PI * .98, Math.PI * 2.02); g.lineTo(hr - .2, hy - 2); g.quadraticCurveTo(4, hy - 4.5, 1, hy - 3.8); g.lineTo(-4, hy - 1); g.lineTo(-5, hy + 4); g.closePath(); });
  } else {
    // lang, bob, krullen, paardenstaart: haar over de bovenkant met een lok over het voorhoofd
    blob(hairC, () => { g.moveTo(-hr - .8, hy + 4); g.arc(0, hy - .5, hr + .8, Math.PI * .95, Math.PI * 2.05); g.lineTo(hr + .2, hy + 1); g.quadraticCurveTo(5, hy - 3.5, 1, hy - 4); g.quadraticCurveTo(-3, hy - 2, -4, hy + 5); g.closePath(); });
  }
  if (c.hair !== "bald") { g.strokeStyle = hairL; g.lineWidth = 1.4; g.beginPath(); g.arc(-1, hy - 2, hr - 2.6, Math.PI * 1.15, Math.PI * 1.55); g.stroke(); }
  if (c.bun) {
    // een knotje boven op het hoofd, met een clipje
    g.strokeStyle = OUT; g.lineWidth = 1.3;
    blob(hairC, () => g.arc(-1.5, hy - hr - 1.2, 3.8, 0, 7));
    g.strokeStyle = shade(hairC, -.2); g.lineWidth = .9; g.beginPath(); g.arc(-1.5, hy - hr - 1.5, 2.2, .5, 4.5); g.stroke();
    g.fillStyle = c.bun; g.strokeStyle = OUT; g.lineWidth = 1; g.beginPath(); rp(1, hy - hr - 2.5, 3.2, 2.2, 1); g.fill(); g.stroke();
    g.fillStyle = "#fff"; g.fillRect(-3, hy - hr - 4, 1, 1); g.fillRect(.5, hy - hr - 5, 1, 1);
    g.strokeStyle = OUT; g.lineWidth = 1.5;
  }
  if (c.bow) { g.fillStyle = c.bow; g.strokeStyle = OUT; g.lineWidth = 1.2; [-1, 1].forEach(d => { g.beginPath(); g.moveTo(-hr + 1, hy - 2); g.lineTo(-hr + 1 + d * 4, hy - 5); g.lineTo(-hr + 1 + d * 4, hy + 1); g.closePath(); g.fill(); g.stroke(); }); }
  g.strokeStyle = OUT; g.lineWidth = 1.5;

  // gezicht
  const blink = (t % 3800) < 110;
  if (blink) { g.beginPath(); g.moveTo(2.4, hy - .5); g.lineTo(5.6, hy - .5); g.stroke(); }
  else {
    const ew = c.cute ? 2.5 : 2.1, eh = c.cute ? 3 : 2.6, pr = c.cute ? 1.7 : 1.3;
    g.lineWidth = .9; blob("#fff", () => g.ellipse(4, hy - .6, ew, eh, 0, 0, 7));
    g.fillStyle = "#3b5a7a"; g.beginPath(); g.arc(4.7, hy - .2, pr, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.fillRect(4.9, hy - 1.5, 1, 1); if (c.cute) g.fillRect(4, hy + .4, .6, .6);
    if (c.cute) { g.strokeStyle = OUT; g.lineWidth = .9; g.beginPath(); g.moveTo(5.6, hy - 3.2); g.lineTo(7, hy - 4.2); g.moveTo(6.2, hy - 2.4); g.lineTo(7.6, hy - 3); g.stroke(); }
  }
  g.strokeStyle = c.hair === "bald" ? shade(hairC, -.2) : hairD; g.lineWidth = 1.2; g.beginPath(); g.moveTo(2, hy - 4.2); g.lineTo(6, hy - 4.6); g.stroke();
  g.fillStyle = skinD; g.beginPath(); g.arc(hr - .3, hy + 1.6, 1.5, 0, 7); g.fill();
  g.fillStyle = c.cute ? "rgba(255,110,130,.5)" : "rgba(255,110,110,.35)"; g.beginPath(); g.arc(4.6, hy + 2.8, c.cute ? 2.1 : 1.8, 0, 7); g.fill();
  g.strokeStyle = "#8a3a2a"; g.lineWidth = 1; g.beginPath(); g.arc(4.6, hy + 3.5, 1.9, .2, Math.PI - .4); g.stroke();
  if (c.stubble) { g.fillStyle = "rgba(110,80,50,.45)"; for (let i = 0; i < 9; i++) g.fillRect(-.5 + (i % 5) * 1.6, hy + 4.2 + Math.floor(i / 5) * 1.4, .9, .9); }
  if (c.glasses === "round") {
    g.strokeStyle = "#7a5a3a"; g.lineWidth = .8; g.beginPath(); g.arc(4.2, hy - .5, 2.8, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(1.3, hy - 1); g.lineTo(-2.2, hy - .5); g.moveTo(7.1, hy - .9); g.lineTo(hr, hy - .6); g.stroke();
  } else if (c.glasses === "thick") {
    g.strokeStyle = "#151515"; g.lineWidth = 1.7; g.beginPath(); rp(1, hy - 3, 6.6, 5, 1.4); g.stroke();
    g.beginPath(); g.moveTo(1, hy - 1.5); g.lineTo(-2.2, hy - 1); g.stroke();
  }
  g.strokeStyle = OUT; g.lineWidth = 1.5;

  tiltOff();

  // voorste arm
  if (opts.handle) handleArm(3, coat, skin);
  else {
    g.save(); g.translate(3, top + 2); g.rotate(opts.slide ? Math.PI + .15 : air ? -2.5 : -sw * .8);
    if (summer) { blob(skin, () => rp(-2, 0, 4, 11, 2)); blob(coat, () => rp(-2.5, 0, 5, 4.5, 2)); } else blob(coat, () => rp(-2.3, 0, 4.6, 11, 2));
    blob(skin, () => g.arc(0, 11.6, 2.3, 0, 7)); g.restore();
  }
  if (c.backpack && !sweater) { g.strokeStyle = shade(c.backpack, -.2); g.lineWidth = 1.8; g.beginPath(); g.moveTo(-2, top + .5); g.lineTo(-3, top + 11); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.5; }

  // haarband, muts en hoedjes
  tiltOn();
  if (c.headband && !hat) { g.strokeStyle = c.headband; g.lineWidth = 3; g.beginPath(); g.arc(0, hy - .5, hr - .2, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.5; }
  // beanieCold: de muts alleen buiten in de kou (sneeuw en kerstmarkt: daar krijgt iedereen een sjaal), niet binnen of op het portretje.
  const beanie = c.beanie && !opts.summer && !(c.beanieCold && (opts.indoor || !opts.scarf));
  const ownHat = !hat && beanie ? "beanie" : hat;
  if (ownHat === "xmas") {
    blob("#d8323a", () => { g.moveTo(-9, hy - 6); g.quadraticCurveTo(-2, hy - 22, -12, hy - 17); g.lineTo(8, hy - 6); g.closePath(); });
    blob("#fff", () => rp(-10, hy - 8.5, 19.5, 4.5, 2)); blob("#fff", () => g.arc(-12, hy - 17, 3, 0, 7));
  } else if (ownHat === "party") {
    blob("#ffd25e", () => { g.moveTo(-6, hy - 6); g.lineTo(6, hy - 6); g.lineTo(0, hy - 21); g.closePath(); });
    g.fillStyle = "#3aa0ff"; g.fillRect(-3, hy - 12, 6, 2);
    blob("#ff5a7a", () => g.arc(0, hy - 21, 2.6, 0, 7));
  } else if (ownHat === "beanie") {
    blob(c.beanie, () => { g.arc(0, hy - 1.5, hr + .6, Math.PI, 0); g.closePath(); });
    g.strokeStyle = shade(c.beanie, -.25); g.lineWidth = 1; for (let x = -hr + 2; x < hr; x += 2.6) { g.beginPath(); g.moveTo(x, hy - 2); g.lineTo(x, hy - hr + 1); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 1.5;
    blob(shade(c.beanie, .15), () => rp(-hr - .8, hy - 3.5, hr * 2 + 1.6, 3.8, 1.6));
  }
  tiltOff();
  g.restore();
}
function shadowAt(x, y, w) { g.fillStyle = "rgba(0,0,0,.22)"; g.beginPath(); g.ellipse(x, y, w, 3, 0, 0, 7); g.fill(); }

/* ---------- Vijanden ---------- */
/** A leg that swings from the hip while an animal walks. ph is the step phase (from the distance walked, so the legs stop
 *  when the animal stops), amp the swing angle. The foot lifts a little while it swings forward. */
function walkLeg(hx, hy, len, w, ph, amp, col, hoof) {
  const lift = Math.max(0, Math.cos(ph)) * len * .2;
  g.save(); g.translate(hx, hy); g.rotate(Math.sin(ph) * amp);
  blob(col, () => rp(-w / 2, -1, w, len + 1 - lift, w / 2));
  if (hoof) { g.fillStyle = hoof; g.fillRect(-w / 2, len - lift - 2, w, 2); }
  g.restore();
}
/** Four legs in a trot: the diagonal pairs move together. Far legs (darker) and near legs. */
function trotLegs(ph, legs, amp, far, near, hoof) {
  legs.forEach(([x, y, len, w], i) => walkLeg(x, y, len, w, ph + (i === 0 || i === 3 ? 0 : Math.PI), amp, i % 2 ? near : far, hoof));
}
/** The body goes up and down a little with every step. */
const stepBob = ph => -Math.abs(Math.sin(ph)) * 1.2;
function drawEnemy(e, t) {
  const f = e.vx > 0 ? 1 : -1;
  shadowAt(e.x + e.w / 2, e.y + e.h, 14);
  g.save(); g.translate(e.x + e.w / 2, e.y + e.h); g.scale(f, 1);
  if (e.dead) g.scale(1.1, .35);
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.6; g.strokeStyle = OUT;
  if (e.kind === "zwijn") {
    const ph = e.x * .3; // op de afgelegde weg, zodat de pootjes vloeiend meelopen
    // staart
    g.strokeStyle = "#3a2618"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-15, -15); g.bezierCurveTo(-22, -20, -20, -10, -17, -13); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    // poten
    trotLegs(ph, [[-10, -9, 9, 4], [-4, -9, 9, 4], [5, -9, 9, 4], [10, -9, 9, 4]], .5, "#3c2a1d", "#4a3424", "#1c1410");
    g.translate(0, stepBob(ph));
    // lijf
    g.save(); g.beginPath(); g.ellipse(0, -14, 16, 10, 0, 0, 7); g.fillStyle = "#5e432f"; g.fill(); g.clip();
    g.fillStyle = "#4a3324"; g.fillRect(-16, -12, 32, 10); g.fillStyle = "#77563d"; g.beginPath(); g.ellipse(2, -19, 10, 3, 0, 0, 7); g.fill();
    g.restore(); g.beginPath(); g.ellipse(0, -14, 16, 10, 0, 0, 7); g.stroke();
    // manen
    g.fillStyle = "#2e2016"; for (let i = -12; i <= 8; i += 3.5) { g.beginPath(); g.moveTo(i, -22); g.lineTo(i + 1.8, -28 - (i % 2 ? 1 : 0)); g.lineTo(i + 3.5, -22); g.fill(); }
    // kop
    blob("#6a4c35", () => g.ellipse(14, -13, 8, 7, -.2, 0, 7));
    blob("#5a3f2c", () => { g.moveTo(9, -18); g.lineTo(11, -25); g.lineTo(14, -18); g.closePath(); });
    blob("#d9a48f", () => g.ellipse(21, -11, 3.5, 4, 0, 0, 7));
    g.fillStyle = "#6a3a30"; g.fillRect(20.5, -13, 1.2, 1.6); g.fillRect(20.5, -10, 1.2, 1.6);
    blob("#fff6e0", () => { g.moveTo(17, -8); g.quadraticCurveTo(21, -10, 20, -16); g.lineTo(18.5, -9.5); g.closePath(); }, false);
    g.lineWidth = 1; g.beginPath(); g.moveTo(17, -8); g.quadraticCurveTo(21, -10, 20, -16); g.stroke();
    blob("#fff", () => g.arc(15.5, -16, 2, 0, 7));
    g.fillStyle = "#b31d1d"; g.beginPath(); g.arc(16.2, -15.8, 1.1, 0, 7); g.fill();
    g.lineWidth = 1.6; g.beginPath(); g.moveTo(13, -19.5); g.lineTo(18, -18); g.stroke();
  } else if (e.kind === "robot") {
    // stofsporen
    blob("#2b2f38", () => g.ellipse(0, -6, 15.5, 6.5, 0, 0, 7));
    g.save(); g.beginPath(); g.ellipse(0, -10, 15, 7, 0, 0, 7); g.fillStyle = "#9aa4b4"; g.fill(); g.clip();
    g.fillStyle = "#c4ccd8"; g.beginPath(); g.ellipse(-3, -13, 11, 4, 0, 0, 7); g.fill();
    g.fillStyle = "#6f7889"; g.fillRect(-15, -6, 30, 3); g.restore();
    g.beginPath(); g.ellipse(0, -10, 15, 7, 0, 0, 7); g.stroke();
    blob("#1c2230", () => rp(-6, -14.5, 13, 5, 2));
    const on = Math.floor(t / 300) % 2;
    g.fillStyle = on ? "#3df0ff" : "#ff5a5a"; g.fillRect(-3.5, -13.2, 2.5, 2); g.fillRect(2, -13.2, 2.5, 2);
    g.strokeStyle = "#e1e6ee"; g.lineWidth = 1.4; const sp = t / 50;
    for (let i = 0; i < 3; i++) { const a = sp + i * 2.1; g.beginPath(); g.moveTo(13, -2); g.lineTo(13 + Math.cos(a) * 7, -2 + Math.sin(a) * 2.5); g.stroke(); }
    g.fillStyle = "rgba(160,150,140,.35)"; for (let i = 0; i < 3; i++) g.fillRect(-18 - i * 4 - (t / 40 % 4), -3 - i, 2, 2);
  } else if (e.kind === "pinguin") {
    // a penguin that took a wrong turn: it waddles
    const wob = Math.sin(e.x * .25) * .12; g.rotate(wob);
    blob("#ff9a2a", () => { g.ellipse(-5, -1.5, 5, 2, 0, 0, 7); });
    blob("#ff9a2a", () => { g.ellipse(5, -1.5, 5, 2, 0, 0, 7); });
    blob("#1f2433", () => g.ellipse(0, -14, 10, 13, 0, 0, 7));
    g.fillStyle = "#f6f8fc"; g.beginPath(); g.ellipse(3, -12, 6.5, 10, 0, 0, 7); g.fill();
    blob("#1f2433", () => g.ellipse(-8, -14, 3, 8, .3, 0, 7));
    blob("#1f2433", () => g.arc(2, -27, 7, 0, 7));
    g.fillStyle = "#f6f8fc"; g.beginPath(); g.arc(4.5, -27, 4, 0, 7); g.fill();
    g.fillStyle = "#1d1d26"; g.fillRect(5, -29, 2, 2.4);
    blob("#ff9a2a", () => { g.moveTo(8, -27.5); g.lineTo(14, -26); g.lineTo(8, -24.5); g.closePath(); });
    // a little red scarf: it's cold, even for a penguin
    blob("#d8232a", () => rp(-5, -22, 13, 3.5, 1.5));
  } else if (e.kind === "geit") {
    // an Alpine mountain goat with curved horns and a beard
    const ph = e.x * .3;
    trotLegs(ph, [[-10, -10, 10, 3.6], [-5, -10, 10, 3.6], [6, -10, 10, 3.6], [11, -10, 10, 3.6]], .55, "#cfc7b8", "#e2dccd", "#3a3026");
    g.translate(0, stepBob(ph));
    blob("#ece6d8", () => g.ellipse(0, -14, 15, 8.5, 0, 0, 7));
    g.fillStyle = "#d8d0bf"; g.beginPath(); g.ellipse(-2, -10, 12, 3, 0, 0, 7); g.fill();
    blob("#ece6d8", () => { g.moveTo(-15, -17); g.lineTo(-19, -21); g.lineTo(-14, -14); g.closePath(); });
    blob("#ece6d8", () => g.ellipse(15, -20, 6.5, 6, -.3, 0, 7));
    blob("#ece6d8", () => g.ellipse(20, -16, 4, 3.5, 0, 0, 7));
    g.fillStyle = "#e6dfcf"; g.beginPath(); g.moveTo(17, -13); g.lineTo(19, -6); g.lineTo(21, -13); g.fill(); g.stroke();
    g.strokeStyle = "#8a7a5a"; g.lineWidth = 2.6; g.beginPath(); g.moveTo(13, -25); g.quadraticCurveTo(8, -36, 2, -28); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    g.fillStyle = "#1d1d26"; g.fillRect(16.5, -22, 2, 2);
    g.fillStyle = "#d8a050"; g.beginPath(); g.arc(9, -10, 2.5, 0, 7); g.fill(); g.stroke();
  } else if (e.kind === "gans") {
    // a cross Dutch goose: grey-brown, long neck, orange beak, and it means business
    const st = Math.sin(e.x * .3) * 2.5;
    g.strokeStyle = "#e8822a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-3, -9); g.lineTo(-3 + st * 1.2, 0); g.moveTo(3, -9); g.lineTo(3 - st * 1.2, 0); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    blob("#e8822a", () => g.ellipse(-2 + st * 1.2, 0, 4, 1.6, 0, 0, 7)); blob("#e8822a", () => g.ellipse(4 - st * 1.2, 0, 4, 1.6, 0, 0, 7));
    blob("#8f8a80", () => g.ellipse(-2, -13, 13, 8, -.1, 0, 7));
    g.fillStyle = "#6f6a60"; g.beginPath(); g.ellipse(-5, -15, 8, 4, -.2, 0, 7); g.fill();
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(0, -8, 9, 3.5, 0, 0, 7); g.fill();
    blob("#4a463f", () => { g.moveTo(6, -16); g.quadraticCurveTo(13, -22, 10, -30); g.lineTo(14, -31); g.quadraticCurveTo(18, -20, 10, -13); g.closePath(); });
    blob("#4a463f", () => g.ellipse(12, -31, 4.5, 4, 0, 0, 7));
    g.fillStyle = "#f4f1ea"; g.fillRect(10, -30, 3, 2);
    blob("#e8822a", () => { g.moveTo(15, -32); g.lineTo(21, -30.5); g.lineTo(15, -29); g.closePath(); });
    g.fillStyle = "#1d1d26"; g.fillRect(12.5, -33, 1.8, 1.8);
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(10.5, -35); g.lineTo(14.5, -34); g.stroke(); g.lineWidth = 1.6;
  } else if (e.kind === "meeuw") {
    // a seagull on the beach, looking for your chips
    const st = Math.sin(e.x * .35) * 2;
    g.strokeStyle = "#e8a53a"; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-2, -8); g.lineTo(-2 + st * 1.3, 0); g.moveTo(3, -8); g.lineTo(3 - st * 1.3, 0); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    blob("#f6f8fc", () => g.ellipse(0, -13, 11, 7, -.15, 0, 7));
    blob("#9aa6b4", () => { g.moveTo(-12, -16); g.quadraticCurveTo(-2, -22, 7, -15); g.lineTo(-4, -11); g.closePath(); });
    g.fillStyle = "#1d1d26"; g.beginPath(); g.moveTo(-12, -16); g.lineTo(-18, -15); g.lineTo(-11, -13); g.fill();
    blob("#f6f8fc", () => g.arc(8, -21, 5.5, 0, 7));
    blob("#f2c230", () => { g.moveTo(12, -21.5); g.lineTo(19, -20); g.lineTo(12, -18.5); g.closePath(); });
    g.fillStyle = "#d8232a"; g.fillRect(16, -20.3, 1.5, 1.2);
    g.fillStyle = "#1d1d26"; g.fillRect(9, -23, 1.8, 1.8);
  } else if (e.kind === "krab") {
    // a little red crab that scuttles along the rocks (sideways, of course)
    const st = Math.sin(e.x * .5) * 1.5;
    g.strokeStyle = "#a8281e"; g.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-6, -6); g.lineTo(-11 - i * 2, -2 + i * 1.5 + (i % 2 ? st : -st)); g.lineTo(-12 - i * 2, 0); g.moveTo(6, -6); g.lineTo(11 + i * 2, -2 + i * 1.5 + (i % 2 ? -st : st)); g.lineTo(12 + i * 2, 0); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    blob("#d8402e", () => g.ellipse(0, -8, 11, 6.5, 0, 0, 7));
    g.fillStyle = "#f07a5a"; g.beginPath(); g.ellipse(-2, -10, 6, 2.5, 0, 0, 7); g.fill();
    [[-1, -1], [1, 1]].forEach(([s, d]) => { blob("#d8402e", () => { g.arc(s * 13, -14 + d * st * .3, 4.5, 0, 7); }); g.fillStyle = "#1d1d26"; g.beginPath(); g.moveTo(s * 13, -14); g.lineTo(s * 17.5, -16); g.lineTo(s * 17.5, -12); g.fill(); });
    g.strokeStyle = "#a8281e"; g.beginPath(); g.moveTo(-3, -13); g.lineTo(-3, -18); g.moveTo(3, -13); g.lineTo(3, -18); g.stroke(); g.strokeStyle = OUT;
    blob("#fff", () => g.arc(-3, -19, 2, 0, 7)); blob("#fff", () => g.arc(3, -19, 2, 0, 7));
    g.fillStyle = "#1d1d26"; g.fillRect(-3, -19.5, 1.2, 1.2); g.fillRect(3, -19.5, 1.2, 1.2);
  } else if (e.kind === "alg") {
    // a big, friendly moose: you can't knock it over, but its back is a fine springboard
    const ph = e.x * .16;
    // long legs, a slow stately walk; the body sways a little
    trotLegs(ph, [[-18, -24, 24, 5], [-10, -24, 24, 5], [10, -24, 24, 5], [18, -24, 24, 5]], .42, "#2a1e14", "#3a2a1e", "#1a120c");
    g.translate(0, stepBob(ph) * 1.5);
    blob("#5a4030", () => rp(-26, -46, 46, 26, 12));
    g.fillStyle = "#6a4c38"; g.beginPath(); g.ellipse(-6, -42, 18, 4, 0, 0, 7); g.fill();
    blob("#4a3426", () => { g.moveTo(14, -44); g.lineTo(24, -52); g.lineTo(36, -42); g.lineTo(34, -32); g.lineTo(22, -34); g.closePath(); });
    blob("#3a2a1e", () => g.ellipse(36, -36, 5, 4, 0, 0, 7));
    blob("#c8a878", () => { g.moveTo(20, -52); g.lineTo(12, -66); g.lineTo(18, -61); g.lineTo(19, -70); g.lineTo(24, -61); g.lineTo(30, -68); g.lineTo(28, -53); g.closePath(); });
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(28, -44, 1.6, 0, 7); g.fill();
    blob("#4a3426", () => g.ellipse(28, -28, 3, 5, 0, 0, 7));
  } else if (e.kind === "mygga") {
    // a Swedish summer mosquito: it hums along low over the grass
    const hov = Math.sin(e.x * .15) * 3, wing = Math.abs(Math.sin(t / 25));
    g.translate(0, -8 + hov);
    g.strokeStyle = "#3a3a40"; g.lineWidth = 1.2; [-6, 0, 6].forEach(x => { g.beginPath(); g.moveTo(x, -8); g.lineTo(x - 3, -1); g.stroke(); });
    g.fillStyle = "rgba(220,240,255,.75)"; g.beginPath(); g.ellipse(-3, -15 - wing * 3, 7, 3 + wing * 2, -.4, 0, 7); g.ellipse(4, -15 - wing * 3, 7, 3 + wing * 2, .4, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.4;
    blob("#5a5a62", () => g.ellipse(-4, -10, 8, 3.5, -.15, 0, 7));
    blob("#3a3a40", () => g.arc(6, -11, 3.5, 0, 7));
    g.strokeStyle = "#3a3a40"; g.beginPath(); g.moveTo(9, -10); g.lineTo(16, -7); g.stroke(); g.strokeStyle = OUT;
    g.fillStyle = "#ff5a5a"; g.beginPath(); g.arc(7, -12, 1.2, 0, 7); g.fill();
  } else if (e.kind === "wesp") {
    // a wasp after your lemonade and nougat: yellow and black, buzzing along at knee height
    const hov = Math.sin(e.x * .18) * 3, wing = Math.abs(Math.sin(t / 22));
    g.translate(0, -10 + hov);
    g.fillStyle = "rgba(230,245,255,.75)"; g.beginPath(); g.ellipse(-2, -16 - wing * 3, 6, 3 + wing * 2, -.5, 0, 7); g.ellipse(4, -16 - wing * 3, 6, 3 + wing * 2, .4, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.4;
    blob("#f2c42a", () => g.ellipse(-5, -9, 8, 4.5, -.2, 0, 7));
    g.fillStyle = "#1d1d26"; [-9, -5, -1].forEach(x => g.fillRect(x, -13, 2, 8));
    g.beginPath(); g.moveTo(-13, -8); g.lineTo(-17, -6); g.lineTo(-12, -6); g.fill();
    blob("#2a2a2e", () => g.arc(5, -11, 3.5, 0, 7));
    blob("#f2c42a", () => g.arc(9, -11, 3, 0, 7));
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(10, -12, 1.1, 0, 7); g.fill();
    g.strokeStyle = "#2a2a2e"; g.lineWidth = 1; g.beginPath(); g.moveTo(10, -14); g.lineTo(13, -18); g.stroke(); g.strokeStyle = OUT;
  } else if (e.kind === "duif") {
    // a city pigeon: grey, a shiny green-purple neck, and a head that bobs as it walks
    const ph = e.x * .5, bob = Math.sin(ph * 2) * 2;
    [[-3, 0], [3, Math.PI]].forEach(([x, o]) => walkLeg(x, -6, 6, 2.5, ph + o, .6, "#d8707e"));
    blob("#8a8e9a", () => g.ellipse(-2, -12, 11, 7, -.1, 0, 7));
    blob("#6a6e7a", () => { g.moveTo(-14, -12); g.lineTo(-20, -9); g.lineTo(-12, -8); g.closePath(); });
    g.fillStyle = "#5a8a7a"; g.beginPath(); g.ellipse(7, -16, 4.5, 4, 0, 0, 7); g.fill(); g.fillStyle = "rgba(150,90,170,.6)"; g.beginPath(); g.ellipse(7, -14, 3.5, 2.5, 0, 0, 7); g.fill();
    blob("#8a8e9a", () => g.arc(10 + bob, -21, 4.5, 0, 7));
    g.fillStyle = "#e88a3a"; g.beginPath(); g.arc(11.5 + bob, -22, 1.2, 0, 7); g.fill();
    g.fillStyle = "#5a5a5a"; g.beginPath(); g.moveTo(14 + bob, -21); g.lineTo(18 + bob, -20); g.lineTo(14 + bob, -19); g.fill();
    g.fillStyle = "#c8a0a8"; g.fillRect(-6, -12, 7, 1.5); g.fillRect(-6, -9, 7, 1.5);
  } else if (e.kind === "bever") {
    // a beaver from the lake, with a flat tail and big orange teeth
    const ph = e.x * .4;
    blob("#4a3a2e", () => { g.ellipse(-16, -4, 8, 3, .2, 0, 7); });
    g.strokeStyle = "#3a2a1e"; g.lineWidth = .8; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-22 + i * 4, -6); g.lineTo(-20 + i * 4, -2); g.stroke(); } g.strokeStyle = OUT; g.lineWidth = 1.6;
    [[-5, 0], [5, Math.PI]].forEach(([x, o]) => walkLeg(x, -7, 7, 4, ph + o, .6, "#3a2a1e"));
    g.translate(0, stepBob(ph));
    blob("#7a5636", () => g.ellipse(-2, -12, 12, 8, 0, 0, 7));
    blob("#8a6644", () => g.ellipse(10, -15, 7, 6, 0, 0, 7));
    blob("#5a4030", () => g.arc(7, -20, 2, 0, 7));
    g.fillStyle = "#f2a03a"; g.fillRect(14, -12, 3, 4); g.strokeRect(14, -12, 3, 4);
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(17, -16, 1.4, 0, 7); g.fill(); g.beginPath(); g.arc(12, -18, 1.2, 0, 7); g.fill();
  } else if (e.kind === "poolvos") {
    // an arctic fox: white, with a big bushy tail, after your sweets
    const ph = e.x * .38;
    blob("#f4f8fb", () => { g.moveTo(-10, -12); g.quadraticCurveTo(-26, -20, -22, -8); g.quadraticCurveTo(-18, -4, -10, -9); g.closePath(); });
    trotLegs(ph, [[-7, -9, 9, 3.4], [-2, -9, 9, 3.4], [5, -9, 9, 3.4], [9, -9, 9, 3.4]], .6, "#cfd8e0", "#dfe7ee");
    g.translate(0, stepBob(ph));
    blob("#f4f8fb", () => g.ellipse(0, -12, 12, 6.5, 0, 0, 7));
    blob("#f4f8fb", () => g.ellipse(12, -16, 6.5, 5.5, 0, 0, 7));
    blob("#f4f8fb", () => { g.moveTo(17, -15); g.lineTo(23, -13); g.lineTo(17, -11); g.closePath(); });
    blob("#f4f8fb", () => { g.moveTo(8, -20); g.lineTo(9, -26); g.lineTo(12, -21); g.closePath(); });
    blob("#f4f8fb", () => { g.moveTo(13, -21); g.lineTo(15, -26); g.lineTo(16, -20); g.closePath(); });
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(23, -13, 1.4, 0, 7); g.fill(); g.beginPath(); g.arc(14, -17.5, 1.3, 0, 7); g.fill();
  } else if (e.kind === "lemming") {
    // a lemming: a small round rodent in a hurry
    const ph = e.x * .7, b = Math.abs(Math.sin(ph)) * 1.5;
    [[-4, 0], [4, Math.PI]].forEach(([x, o]) => walkLeg(x, -5, 5, 3, ph + o, .7, "#3a2a1e"));
    g.translate(0, -b);
    blob("#c8884a", () => g.ellipse(0, -8, 10, 7, 0, 0, 7));
    g.fillStyle = "#2a1e16"; g.beginPath(); g.ellipse(-3, -12, 6, 3, 0, 0, 7); g.fill();
    g.fillStyle = "#e8c8a0"; g.beginPath(); g.ellipse(4, -5, 5, 3, 0, 0, 7); g.fill();
    blob("#c8884a", () => g.arc(5, -14, 2.5, 0, 7));
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(7, -10, 1.3, 0, 7); g.fill(); g.fillStyle = "#e88a8a"; g.beginPath(); g.arc(10.5, -8, 1.2, 0, 7); g.fill();
  } else if (e.kind === "marmot") {
    // a marmot from the Alps that slipped into the hut: chubby, brown, with big front teeth
    const ph = e.x * .42;
    blob("#6a4a2e", () => g.ellipse(-14, -7, 6, 3.5, -.5, 0, 7));
    trotLegs(ph, [[-8, -7, 7, 4], [-3, -7, 7, 4], [5, -7, 7, 4], [9, -7, 7, 4]], .55, "#3a2616", "#4a321e");
    g.translate(0, stepBob(ph));
    blob("#9a6a3e", () => g.ellipse(-1, -12, 13, 9, 0, 0, 7));
    g.fillStyle = "#b8895a"; g.beginPath(); g.ellipse(2, -9, 8, 5, 0, 0, 7); g.fill();
    blob("#9a6a3e", () => g.ellipse(11, -15, 7, 6.5, 0, 0, 7));
    blob("#7a5230", () => g.arc(8, -21, 2.5, 0, 7));
    blob("#e8d4b8", () => g.ellipse(15.5, -13, 3.5, 3, 0, 0, 7));
    g.fillStyle = "#2a1c12"; g.beginPath(); g.arc(17.5, -14.5, 1.3, 0, 7); g.fill();
    g.fillStyle = "#fff6e0"; g.fillRect(15, -10.5, 2.2, 3); g.strokeRect(15, -10.5, 2.2, 3);
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(12.5, -17, 1.4, 0, 7); g.fill();
  } else if (e.kind === "speelgoed") {
    // a wind-up tin toy robot that escaped from the workshop: it marches, and the key on its back turns
    const st = Math.sin(e.x * .45) * 2.5;
    // stiff little legs that march: one lifts, then the other
    walkLeg(-4, -7, 7, 4, e.x * .45, .35, "#5a6070"); walkLeg(4, -7, 7, 4, e.x * .45 + Math.PI, .35, "#5a6070");
    g.translate(0, -Math.abs(st) * .4);
    blob("#d8423a", () => rp(-8, -19, 16, 13, 2));
    g.fillStyle = "#ffd25e"; g.fillRect(-5, -16, 3, 3); g.fillRect(-1, -16, 3, 3); g.fillRect(3, -16, 3, 3);
    blob("#c9ced8", () => rp(-6, -29, 13, 10, 2));
    g.fillStyle = "#1d1d26"; g.fillRect(-2, -26, 2, 3); g.fillRect(3, -26, 2, 3);
    g.fillStyle = "#3a3f4a"; g.fillRect(-1, -24.5 + 2, 6, 1.4);
    g.strokeStyle = "#5a6070"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -29); g.lineTo(0, -33); g.stroke(); g.strokeStyle = OUT;
    blob("#ff5a5a", () => g.arc(0, -34, 2, 0, 7));
    const k = Math.sin(t / 120);
    g.fillStyle = "#c9a34a"; g.fillRect(-12, -14, 4, 2); g.beginPath(); g.ellipse(-13, -13, 2, 4 * Math.abs(k) + .8, 0, 0, 7); g.fill(); g.stroke();
  } else if (e.kind === "pakje") {
    // a parcel on little legs that ran away from the sorting belt
    const st = Math.sin(e.x * .5) * 2;
    g.strokeStyle = "#3a2a1a"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-5, -5); g.lineTo(-6 + st, 0); g.moveTo(5, -5); g.lineTo(6 - st, 0); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.6;
    blob("#c8955a", () => rp(-12, -24, 24, 19, 2));
    g.fillStyle = "#a8743e"; g.fillRect(-12, -24, 24, 4);
    g.fillStyle = "#d8423a"; g.fillRect(-2, -24, 4, 19); g.fillRect(-12, -16, 24, 3);
    g.fillStyle = "#fff4e6"; g.fillRect(4, -13, 7, 5); g.fillStyle = "#5a6070"; g.fillRect(5, -12, 5, 1); g.fillRect(5, -10, 3, 1);
    blob("#fff", () => g.arc(-6, -19, 2.3, 0, 7)); blob("#fff", () => g.arc(7, -19, 2.3, 0, 7));
    g.fillStyle = "#1d1d26"; g.fillRect(-5.5, -19.5, 1.3, 1.3); g.fillRect(7.5, -19.5, 1.3, 1.3);
  } else if (e.kind === "troll") {
    // a small, grumpy forest troll with a big nose, a mossy tuft and a tail
    const st = Math.sin(e.x * .3) * 2.5;
    g.strokeStyle = "#5a4a3a"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-10, -8); g.quadraticCurveTo(-20, -6, -19, -15); g.stroke();
    g.fillStyle = "#3a2e22"; g.beginPath(); g.arc(-19, -16, 2.5, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    walkLeg(-4, -7, 7, 4.5, e.x * .3, .6, "#6d7a52"); walkLeg(4, -7, 7, 4.5, e.x * .3 + Math.PI, .6, "#6d7a52");
    g.translate(0, -Math.abs(Math.sin(e.x * .3)) * 1.2);
    blob("#7d8a5e", () => g.ellipse(0, -15, 11, 11, 0, 0, 7));
    blob("#8a6a46", () => rp(-11, -12, 22, 8, 3));
    blob("#7d8a5e", () => g.ellipse(9, -17, 6, 4.5, .2, 0, 7));
    g.fillStyle = "#1d1d26"; g.fillRect(3, -20, 2, 2); g.fillRect(-2, -20, 2, 2);
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(-3, -22.5); g.lineTo(1, -21.5); g.moveTo(2, -21.5); g.lineTo(6, -22.5); g.stroke(); g.lineWidth = 1.6;
    blob("#4f6a3a", () => { g.moveTo(-6, -25); g.lineTo(-2, -32); g.lineTo(0, -26); g.lineTo(4, -31); g.lineTo(5, -25); g.closePath(); });
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.ellipse(0, -26, 6, 1.8, 0, 0, 7); g.fill();
  } else {
    g.strokeStyle = "#4a6a95";
    const wob = Math.sin(e.x * .12) * .08; // waggelen met de afgelegde weg (niet t + e.x: dat springt elke stap)
    g.rotate(wob);
    blob("#f6f9ff", () => g.arc(0, -10, 10.5, 0, 7));
    g.fillStyle = "#cbdaf0"; g.beginPath(); g.arc(-3, -7, 7, 0, 7); g.fill();
    g.fillStyle = "#f6f9ff"; g.beginPath(); g.arc(1.5, -11.5, 8, 0, 7); g.fill();
    blob("#f6f9ff", () => g.arc(0, -25, 7.5, 0, 7));
    g.strokeStyle = "#6b4426"; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-8, -14); g.lineTo(-17, -20 + Math.sin(t / 100) * 3); g.moveTo(-14, -18); g.lineTo(-16, -23); g.stroke();
    g.beginPath(); g.moveTo(8, -14); g.lineTo(16, -19 - Math.sin(t / 100) * 3); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.4;
    blob("#c43a3a", () => rp(-7, -19.5, 14, 3.5, 1.5));
    blob("#c43a3a", () => rp(-6, -18, 3.5, 8, 1));
    blob("#222", () => g.rect(-6.5, -33, 13, 2.5)); blob("#222", () => g.rect(-4.5, -41, 9, 8));
    g.fillStyle = "#b8322e"; g.fillRect(-4.5, -35.5, 9, 1.8);
    blob("#ff8a2a", () => { g.moveTo(5, -26); g.lineTo(13, -24.5); g.lineTo(5, -23); g.closePath(); });
    g.fillStyle = "#1d1d26"; g.fillRect(1.5, -29, 2, 2); g.fillRect(5, -29, 2, 2);
    [[0, -14], [0, -9], [0, -4]].forEach(([x, y]) => { g.beginPath(); g.arc(x + 2, y, 1.3, 0, 7); g.fill(); });
  }
  g.restore();
}

/* ---------- Voorwerpen ---------- */
function drawItem(kind, cx, cy, t) {
  g.save();
  const gl = g.createRadialGradient(cx, cy, 2, cx, cy, 19);
  gl.addColorStop(0, "rgba(255,240,170,.55)"); gl.addColorStop(1, "rgba(255,240,170,0)");
  g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, 19, 0, 7); g.fill();
  g.lineJoin = "round"; g.lineCap = "round"; g.lineWidth = 1.6; g.strokeStyle = OUT;
  if (kind === "key") {
    g.save(); g.translate(cx, cy); g.rotate(-.35);
    blob("#ffcf3f", () => { g.arc(-6, 0, 6, 0, 7); g.moveTo(-3.5, 0); g.arc(-6, 0, 2.5, 0, 7, true); });
    blob("#ffcf3f", () => { g.rect(-1, -2, 14, 4); g.rect(8, 1, 2.8, 5); g.rect(11.5, 1, 2.6, 3.5); });
    g.fillStyle = "#fff6c0"; g.fillRect(0, -1.4, 10, 1.2); g.beginPath(); g.arc(-8, -2.5, 1.2, 0, 7); g.fill();
    g.restore();
  } else if (kind === "charger") {
    g.strokeStyle = "#f2f2f2"; g.lineWidth = 2.2; g.beginPath(); g.moveTo(cx, cy + 6); g.bezierCurveTo(cx, cy + 15, cx + 13, cy + 11, cx + 11, cy + 2); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 1.6;
    blob("#9aa3ad", () => { g.rect(cx - 4.5, cy - 14, 2.6, 6); g.rect(cx + 1.9, cy - 14, 2.6, 6); });
    blob("#f7f7f7", () => rp(cx - 7.5, cy - 8.5, 15, 15, 3));
    g.fillStyle = "#d9dde2"; g.fillRect(cx - 7, cy + 2, 14, 4);
    g.fillStyle = "#38d07a"; g.fillRect(cx - 2, cy - 4, 4, 4); g.fillStyle = "#1e1622"; g.font = "700 6px sans-serif"; g.textAlign = "center"; g.fillText("⚡", cx, cy + 4);
  } else if (kind === "bauble") {
    blob("#ffd25e", () => rp(cx - 3.5, cy - 10, 7, 4.5, 1));
    g.strokeStyle = "#ffd25e"; g.lineWidth = 1.4; g.beginPath(); g.arc(cx, cy - 12, 2, 0, 7); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.6;
    const gr = g.createRadialGradient(cx - 3, cy - 1, 1, cx, cy + 2, 10); gr.addColorStop(0, "#ff9a9a"); gr.addColorStop(.6, "#d4202e"); gr.addColorStop(1, "#8a0f1a");
    blob(gr, () => g.arc(cx, cy + 2, 9, 0, 7));
    g.strokeStyle = "rgba(255,230,140,.9)"; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy + 2, 6, .3, 2.8); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(cx - 3.5, cy - 1.5, 2, 3, -.6, 0, 7); g.fill();
  } else if (kind === "coffee" || kind === "tea") {
    const tea = kind === "tea";
    blob("#e9edf2", () => g.ellipse(cx, cy + 8, 13, 3.5, 0, 0, 7));
    blob("#ffffff", () => { g.moveTo(cx - 9, cy - 4); g.lineTo(cx + 7, cy - 4); g.lineTo(cx + 5, cy + 7); g.lineTo(cx - 7, cy + 7); g.closePath(); });
    g.lineWidth = 1.8; g.beginPath(); g.arc(cx + 8, cy + 1, 3.5, -1.3, 1.3); g.stroke(); g.lineWidth = 1.6;
    g.fillStyle = tea ? "#b8742a" : "#6b3a1c"; g.beginPath(); g.ellipse(cx - 1, cy - 3.5, 7.5, 1.6, 0, 0, 7); g.fill();
    if (tea) { g.strokeStyle = "#e8e2d0"; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 2, cy - 4); g.quadraticCurveTo(cx + 9, cy - 8, cx + 10, cy - 1); g.stroke(); g.fillStyle = "#f2d14a"; g.fillRect(cx + 8, cy - 1, 5, 6); g.strokeStyle = OUT; g.lineWidth = 1; g.strokeRect(cx + 8, cy - 1, 5, 6); g.lineWidth = 1.6; }
    g.fillStyle = "#c0392b"; g.fillRect(cx - 6, cy + 1, 10, 2.2);
    g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 1.4;
    for (let i = 0; i < 2; i++) { g.beginPath(); const x = cx - 3 + i * 4; g.moveTo(x, cy - 7); g.bezierCurveTo(x - 3, cy - 10 - Math.sin(t / 150 + i) * 2, x + 3, cy - 13, x, cy - 17); g.stroke(); }
  } else if (kind === "towel") {
    blob("#5fb6e0", () => rp(cx - 12, cy - 9, 24, 17, 3));
    g.fillStyle = "#fff"; g.fillRect(cx - 11, cy - 4, 22, 2.5); g.fillRect(cx - 11, cy + 2, 22, 2);
    g.fillStyle = "#86cdee"; g.fillRect(cx - 11, cy - 8, 22, 2);
    blob("#4aa2cc", () => rp(cx - 12, cy + 4, 24, 5, 2));
  } else if (kind === "wood") {
    [[-6, 4], [6, 4], [0, -4]].forEach(([dx, dy]) => {
      blob("#7a4a26", () => rp(cx + dx - 10, cy + dy - 4.5, 19, 9, 4));
      g.fillStyle = "#5e381b"; g.fillRect(cx + dx - 7, cy + dy - 1, 10, 1.2);
      blob("#e0b077", () => g.ellipse(cx + dx + 8, cy + dy, 3.4, 4.5, 0, 0, 7));
      g.strokeStyle = "#a8763f"; g.lineWidth = 1; g.beginPath(); g.ellipse(cx + dx + 8, cy + dy, 1.6, 2.4, 0, 0, 7); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 1.6;
    });
  } else emoji(kind, cx, cy, 22);
  sparkle(cx + 11, cy - 11, 3 + Math.sin(t / 120) * 1.5, t / 400);
  g.restore();
}
