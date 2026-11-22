"use strict";
// Spelen met een controller (Gamepad API, standaardindeling): PlayStation, Stadia, Xbox en andere.
// Browsers laten een controller pas zien na de eerste druk op een knop.
// Spelen: stick of pijltjes lopen, ✕/A springen, □/X of ○/B praten, Start menu.
// Menu's: stick of pijltjes kiezen, ✕/A drukken, ○/B terug.

const GP = { on: false, prev: [], navDir: null, navTime: 0, navRepeat: false };
// Waarmee is het laatst gespeeld? Met toetsenbord, afstandsbediening of controller staat de focus in menu's meteen op een knop.
let lastInput = isTouch ? "pointer" : "key";
addEventListener("pointerdown", () => { lastInput = "pointer"; }, true);
addEventListener("keydown", () => { lastInput = "key"; }, true);
/** Zet de focus op de standaardknop van het menu dat nu open is (niet bij muis of vinger). */
function menuAutoFocus() {
  if (state === "play" || lastInput === "pointer") return;
  requestAnimationFrame(() => { if (state !== "play" && !gpCurrent()) gpFocus(gpDefault(gpFocusables())); });
}
const padHeld = { left: false, right: false, jump: false, run: false, down: false };
const BTN = { A: 0, B: 1, X: 2, Y: 3, L1: 4, R1: 5, L2: 6, R2: 7, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

function getPads(consume = false) {
  // In de Google TV-app geeft de app de controller zelf door (window.__nativePad), omdat de WebView dat niet altijd doet.
  // De app telt ook hoe vaak elke knop is ingedrukt (n.presses): zo telt een snelle tik ook als drukken én loslaten
  // tussen twee beelden in vallen.
  const n = window.__nativePad;
  if (n) {
    const seen = GP.presses || [], cnt = n.presses || [];
    if (consume) GP.presses = cnt.slice(); // alleen pollGamepads() telt de tikken af
    return [{ id: "Google TV controller", index: 0, connected: true, mapping: "standard", axes: n.axes || [0, 0],
      buttons: (n.buttons || []).map((v, i) => { const on = !!v || (cnt[i] || 0) !== (seen[i] || 0); return { pressed: on, value: on ? 1 : 0 }; }) }];
  }
  try { return [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(p => p && p.connected); } catch (e) { return []; }
}
/** Een leesbare naam voor de controller, op basis van wat de browser doorgeeft. */
function gpName(id = "") {
  if (/054c|playstation|dualshock|dualsense|wireless controller/i.test(id)) return T("PlayStation controller", "PlayStation-controller");
  if (/stadia|18d1/i.test(id)) return T("Stadia controller", "Stadia-controller");
  if (/xbox|045e|xinput/i.test(id)) return T("Xbox controller", "Xbox-controller");
  return "Controller";
}
/** Zet de melding op het titelscherm en verberg de aanraakknoppen zolang er een controller is. */
function gpStatus() {
  const pads = getPads(), el = $("gpStatus");
  GP.on = pads.length > 0;
  document.documentElement.classList.toggle("gp-on", GP.on);
  if (el) { el.hidden = !GP.on; if (GP.on) el.textContent = T(`🎮 ${gpName(pads[0].id)} connected. ✕/A jump or choose · □/X or ○/B talk · Start menu`, `🎮 ${gpName(pads[0].id)} verbonden. ✕/A springen of kiezen · □/X of ○/B praten · Start menu`); }
  $("touch").hidden = !(isTouch && !GP.on && state === "play");
}
addEventListener("gamepadconnected", () => { gpStatus(); lastInput = "pad"; menuAutoFocus(); });
addEventListener("gamepaddisconnected", gpStatus);

/* ---------- Menu's met de controller ---------- */
function gpRoot() { return state === "title" ? $("title") : state === "map" ? $("mapWrap") : state === "hero" ? $("heroWrap") : state === "save" ? $("saveWrap") : state === "pad" ? $("padWrap") : $("cardWrap"); }
function gpFocusables() {
  const list = [...gpRoot().querySelectorAll("button")];
  if (state === "title") list.push(...$("installBar").querySelectorAll("button, a[href]"));
  return list.filter(b => !b.disabled && b.offsetParent !== null);
}
function gpCurrent() { const list = gpFocusables(); return list.includes(document.activeElement) ? document.activeElement : null; }
function gpFocus(el) { if (!el) return; el.focus({ preventScroll: true }); el.scrollIntoView({ block: "nearest", inline: "nearest" }); }
/** Waar de focus begint: de laatst vrijgespeelde dag, de eerste knop op een kaart, of de 1 op het codeslot. */
function gpDefault(list) {
  if (state === "title") { const days = list.filter(b => b.closest("#levels")); return days[days.length - 1] || list[0]; }
  if (state === "map") return list.find(b => b.classList.contains("here")) || list[0];
  if (state === "hero") return heroKeysOpen() ? $("heroKeys").querySelector("button") : $("heroDone");
  return list[0];
}
/** Ga naar de dichtstbijzijnde knop in een richting. */
function gpMove(dir) {
  // the hero creator is a grid of rows, with its own navigation (heroMove() in hero.js)
  if (state === "hero" && heroMove(dir)) return;
  const list = gpFocusables(); if (!list.length) return;
  const cur = gpCurrent(); if (!cur) return gpFocus(gpDefault(list));
  const nearest = items => {
    const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const q = el.getBoundingClientRect(), x = q.left + q.width / 2 - cx, y = q.top + q.height / 2 - cy;
      const main = dir === "left" ? -x : dir === "right" ? x : dir === "up" ? -y : y;
      const side = dir === "left" || dir === "right" ? Math.abs(y) : Math.abs(x);
      if (main <= 4) continue;
      const score = main + side * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    return best;
  };
  const bar = cur.closest("#installBar");
  const best = (bar && nearest(list.filter(el => el.closest("#installBar")))) || nearest(list);
  if (best) gpFocus(best);
}
/** Druk op de knop met focus; blijft de focus daarna hangen, zet hem terug op dezelfde plek. */
function gpPress(fromPad = false) {
  // ✕/A on the name field: the letters on screen, to type a name without a keyboard
  if (state === "hero" && document.activeElement === $("heroName")) { openHeroKeys(); return; }
  const list = gpFocusables(), cur = gpCurrent();
  if (!cur) return gpFocus(gpDefault(list));
  if (fromPad && cur.matches("#installBar a[href]")) { location.assign(cur.href); return; }
  const idx = list.indexOf(cur), before = state;
  cur.click();
  requestAnimationFrame(() => {
    if (state === "play" || gpCurrent()) return;
    const now = gpFocusables(); if (!now.length) return;
    gpFocus(state === before ? now[Math.min(idx, now.length - 1)] : gpDefault(now));
  });
}
function gpBack() {
  if (state === "hero" && heroKeysOpen()) closeHeroKeys(); // Back closes the letters first
  else if (state === "pad") setScreen("play");
  else if (state === "intro" || state === "card" || state === "map" || state === "hero") toTitle();
  else if (state === "save") saveBack();
}

/* ---------- Toetsenbord en tv-afstandsbediening in menu's ---------- */
const NAV_KEYS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
/** Pijltjes kiezen de dichtstbijzijnde knop, Enter/OK of spatie drukt erop. Geeft true terug als de toets gebruikt is. */
function menuKey(e) {
  const dir = NAV_KEYS[e.key];
  if (dir) { e.preventDefault(); gpMove(dir); return true; }
  if (e.key === "Enter" || e.key === " ") {
    if (state === "pad" && !gpCurrent()) return false;   // een getypte code met Enter versturen
    e.preventDefault(); gpPress(); return true;
  }
  return false;
}
/** De terug-knop (tv-app en afstandsbediening): een stap terug. Op het titelscherm false, dan sluit de app. */
window.tvBack = () => {
  if (state === "title") return false;
  if (state === "play") { if (dialog) { advanceDialog(); return true; } toTitle(); return true; }
  gpBack(); return true;
};

/* ---------- Trillen (als de controller het kan) ---------- */
function gpRumble(ms = 160, strong = .6) {
  for (const p of getPads()) {
    try { if (p.vibrationActuator && p.vibrationActuator.playEffect) p.vibrationActuator.playEffect("dual-rumble", { duration: ms, strongMagnitude: strong, weakMagnitude: strong * .6 }); } catch (e) {}
  }
}

/* ---------- Elke frame: de controllers uitlezen ---------- */
function pollGamepads() {
  padHeld.left = padHeld.right = padHeld.jump = padHeld.run = padHeld.down = false;
  const pads = getPads(true);
  if ((pads.length > 0) !== GP.on) gpStatus();
  if (!pads.length) return;
  let dir = null;
  pads.forEach((p, i) => {
    const now = p.buttons.map(b => !!b && (b.pressed || b.value > .5));
    const prev = GP.prev[i] || [];
    const b = k => !!now[k], down = k => !!now[k] && !prev[k];
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    const L = b(BTN.LEFT) || ax < -.4, R = b(BTN.RIGHT) || ax > .4, U = b(BTN.UP) || ay < -.6, D = b(BTN.DOWN) || ay > .6;
    if (now.some(Boolean) || Math.abs(ax) > .4 || Math.abs(ay) > .6) lastInput = "pad";
    if (state === "play") {
      // In de Google TV-app komt links/rechts met het precieze moment binnen via __tvDir (tvHeld).
      if (!(GP.tvDir && p.id === "Google TV controller")) { padHeld.left = padHeld.left || L; padHeld.right = padHeld.right || R; }
      padHeld.jump = padHeld.jump || b(BTN.A) || b(BTN.UP);
      padHeld.run = padHeld.run || b(BTN.L1) || b(BTN.R1) || b(BTN.L2) || b(BTN.R2);
      padHeld.down = padHeld.down || D; // down on a ladder
      if (down(BTN.A) || down(BTN.UP)) edges.push("jump");
      if (down(BTN.X) || down(BTN.B) || down(BTN.Y) || down(BTN.DOWN)) edges.push("act");
      if (down(BTN.START)) toTitle();
    } else {
      if (L) dir = "left"; else if (R) dir = "right"; else if (U) dir = "up"; else if (D) dir = "down";
      if (down(BTN.A)) gpPress(true);
      else if (down(BTN.B)) gpBack();
      else if (down(BTN.START) && state === "intro") gpPress(true);
    }
    GP.prev[i] = now;
  });
  // In menu's: één stap per druk, en bij vasthouden na een korte pauze herhalen.
  const t = performance.now();
  if (!dir) { GP.navDir = null; return; }
  if (dir !== GP.navDir) { GP.navDir = dir; GP.navTime = t; GP.navRepeat = false; gpMove(dir); }
  else if (t - GP.navTime > (GP.navRepeat ? 140 : 380)) { GP.navTime = t; GP.navRepeat = true; gpMove(dir); }
}

/* De Google TV-app meldt elke verandering van links/rechts (stick, pijltjes) meteen, met hoe lang geleden het gebeurde
   (age, in ms). Zo telt een tikje precies zo lang als hij duurde, ook als het bericht wat later binnenkomt. */
let tvDirNow = 0;
window.__tvDir = (dir, age) => {
  GP.tvDir = true;
  const t = performance.now() - Math.max(0, Math.min(1000, +age || 0));
  dir = Math.sign(+dir || 0);
  if (dir === tvDirNow) return;
  if (tvDirNow) queueHold(tvHeld, tvDirNow < 0 ? "left" : "right", false, t);
  if (dir) queueHold(tvHeld, dir < 0 ? "left" : "right", true, t);
  tvDirNow = dir;
};
