"use strict";
// Spelstatus, levels opbouwen, invoer, gesprekken en de spellogica (botsen, springen, oppakken).
/* =====================================================================
   SPELSTATUS
   ===================================================================== */
let state = "title";      // title | intro | play | card | pad
let L = null, P = null, cam = 0, frame = 0;
let particles = [], popups = [], flakes = [];
let dialog = null, padState = null;

/** The water surface in pits (drawn by drawWater): where you float when you swim. */
const SWIM_Y = 12 * 32 + 14;
function buildLevel(idx) {
  const d = LEVELS[idx], w = d.w;
  const grid = Array.from({ length: ROWS }, () => Array(w).fill(" "));
  for (const [a, b, top] of d.ground) for (let x = a; x <= b; x++) for (let y = top; y < ROWS; y++) grid[y][x] = "#";
  for (const [x, y, n] of d.plats) for (let i = 0; i < n; i++) grid[y][x + i] = "=";
  for (const [x, y, h] of d.blocks) for (let i = 0; i < h; i++) grid[y + i][x] = "S";
  for (const [x, y, n] of d.spikes) for (let i = 0; i < n; i++) grid[y][x + i] = "^";
  for (const [x, y, h] of d.rocks || []) for (let i = 0; i < h; i++) grid[y + i][x] = "R";
  if (d.gate) for (let y = d.gate[1]; y <= d.gate[2]; y++) grid[y][d.gate[0]] = "G";
  if (d.code) for (let y = d.code.y1; y <= d.code.y2; y++) grid[y][d.code.x] = "H";
  // ladders: "|" cells from just below a plank down to the ground; you climb them with ↑ and ↓
  for (const [x, y0, y1] of d.ladderCols || []) for (let y = y0; y <= y1; y++) if (grid[y][x] === " ") grid[y][x] = "|";

  const others = CHARS.filter((_, i) => i !== save.char);
  let npcN = 0;
  const lv = { idx, d, w, grid, items: [], enemies: [], movers: [], npcs: [], signs: [], checks: [], exit: null, lantern: null,
    switches: [], clues: [], bell: null, animal: null, timer: 0,
    keys: 0, coins: 0, coinTotal: 0, hasQuest: false, questDone: !d.gate, gateOpen: !d.gate, codeOpen: !d.code,
    gateFade: d.gate ? 1 : 0, codeFade: d.code ? 1 : 0, need: d.keysNeeded ?? 3, respawn: null, time: 0, codeTries: 0 };
  for (const [type, x, y, extra] of d.ents) {
    const px = x * TS, py = y * TS;
    if (type === "coin" || type === "key" || type === "heart" || type === "quest") {
      lv.items.push({ type, x: px, y: py, w: TS, h: TS, taken: false });
      if (type === "coin") lv.coinTotal++;
    } else if (type === "enemy") lv.enemies.push({ kind: d.enemy, x: px, y: py + TS - 22, w: 30, h: 22, vx: { robot: -1.4, geit: -1.3, pinguin: -.8, gans: -1.2, meeuw: -1.5, krab: -1.3, marmot: -1.2, speelgoed: -.9, pakje: -1.1, poolvos: -1.5, lemming: -1.7, mygga: -1.3, wesp: -1.5, duif: -1.1, bever: -1 }[d.enemy] || -1, dead: 0 });
    else if (type === "npc") lv.npcs.push({ x: px + 5, y: py, who: others[(idx * 3 + npcN++) % others.length], ...extra, talked: false });
    else if (type === "sign") lv.signs.push({ x: px, y: py, lines: extra });
    else if (type === "check") lv.checks.push({ x: px, y: py, on: false });
    else if (type === "exit") lv.exit = { x: px, y: py - TS, w: TS, h: TS * 2 };
    else if (type === "lantern") lv.lantern = { x: px, y: py, lit: false };
    // A moose (Småland): too big to knock over, but you can bounce high off its back
    else if (type === "moose") lv.enemies.push({ kind: "alg", x: px, y: py + TS - 50, w: 56, h: 50, vx: -.5, dead: 0 });
    // The gate halfway: levers or lamps to switch on, a bell that opens the gate for a moment, or an animal that follows you.
    else if (type === "switch") lv.switches.push({ x: px, y: py, i: extra.i, on: false });
    else if (type === "bell") lv.bell = { x: px, y: py, swing: 0 };
    else if (type === "animal") lv.animal = { x: px, y: py, sx: px, sy: py, face: 1, follow: false, home: false, trail: [] };
    // Clues for the lock: numbered bells, coloured lamps, signposts with an arrow, or carved letters.
    else if (type === "clue") lv.clues.push({ x: px, y: py, ...extra, heard: false, ring: 0 });
    // Something that carries you across a wide gap: an ice floe, a gondola or a boat. It goes back and forth, and waits a bit at each end.
    // A gondola can go up or down the mountain (rise: rows, negative is up): then it rides on a slanted cable.
    else if (type === "mover") lv.movers.push({ x: px, y: py, w: extra.n * TS, x0: px, x1: px + extra.range * TS, y0: py, y1: py + (extra.rise || 0) * TS,
      dir: 1, wait: 40, speed: d.moverSpeed || 1.1, dx: 0, dy: 0 });
  }
  lv.pad = d.code ? { x: d.code.pad * TS, y: d.code.y2 * TS } : null;
  return lv;
}

function cell(tx, ty) { if (ty < 0 || ty >= ROWS || tx < 0 || tx >= L.w) return " "; return L.grid[ty][tx]; }
function isSolid(tx, ty) {
  if (tx < 0 || tx >= L.w) return true;
  if (ty < 0 || ty >= ROWS) return false;
  const c = L.grid[ty][tx];
  return c === "#" || c === "S" || c === "R" || (c === "G" && !L.gateOpen) || (c === "H" && !L.codeOpen);
}
/** A ride (genLevel(): `ride`): on skis, a sledge, skates, a bike, a kicksled or a husky sledge you don't walk. Per kind: the top speed with →,
    how fast you can go back with ←, how fast it rolls by itself without a key (downhill), how quickly you speed up,
    and how quickly you slow down. Skates glide a long way; a bike stops sooner; skis and a sledge keep going downhill. */
const RIDE_FEEL = {
  ski: { top: 7, back: 1.6, coast: 4.2, acc: .12, brake: .22 },
  sled: { top: 7.4, back: 1.3, coast: 5.2, acc: .14, brake: .18 },
  skates: { top: 6.6, back: 4, coast: 0, acc: .14, brake: .02 },
  bike: { top: 6.8, back: 2.2, coast: 0, acc: .3, brake: .08 },
  kicksled: { top: 6.6, back: 2.5, coast: 0, acc: .2, brake: .035 },
  husky: { top: 6.2, back: 6.2, coast: 0, acc: .25, brake: .16 },
  railbike: { top: 5.4, back: 3, coast: 0, acc: .25, brake: .1 }
};
const HUSKY_LEAD = 100;
function rideAt(col) { const r = L.d.ride; return r && col >= r.x0 && col <= r.x1 ? r.kind : null; }
/** The rider's bounds on either bike, including the lean and the height of a jump. */
function bikeRiderBounds(ch, rail) {
  const k = ch.size || 1, kid = !!ch.kid, top = kid ? -26 : -28, hip = kid ? -12 : -13, hr = kid ? 9.4 : 8.6;
  const head = 2 * hr - .6 + (L.d.theme === "sneeuw" ? 13.5 : ch.bun ? 5 : ch.beanie && !ch.beanieCold ? 2 : 1.5);
  const feet = rail ? L.d.ride.row * TS : P.y + P.h, jump = rail ? P.railJump || 0 : 0;
  if (jump) return { left: P.x, right: P.x + P.w, top: feet - (26 - top + head) * k - jump, bottom: feet - 26 * k - jump };
  const lean = P.railDuck ? Math.cos(RAIL_DUCK_ANGLE) : 1;
  const headX = P.x + P.w / 2 - (top - hip) * k * (P.railDuck ? Math.sin(RAIL_DUCK_ANGLE) * P.face : 0);
  const seat = feet - 26 * (rail ? k : 1);
  return { left: Math.min(P.x, headX - hr * k), right: Math.max(P.x + P.w, headX + hr * k),
    top: seat + ((top - hip) * lean - head) * k, bottom: seat + 8 * k };
}
function railRiderBounds(ch) { return bikeRiderBounds(ch, true); }
/** The river you canoe down (the Ardèche): is this column part of it, and where is the water there? */
function inRiver(col) { const r = L.d.river; return !!r && col >= r.x0 && col <= r.x1; }
function waterTop(col) { return inRiver(col) ? L.d.river.surf[col - L.d.river.x0] * TS + 14 : SWIM_Y; }
/** How fast the river carries you along here: faster in the rapids below the waterfalls. */
function riverCurrent(col) { return L.d.river.rapids.some(([a, b]) => col >= a && col <= b) ? 2.3 : 1.1; }

function startLevel(idx) {
  L = buildLevel(idx);
  const ch = heroChar();
  P = { x: 2 * TS + 5, y: 0, w: 22, h: Math.round(40 * ch.size), vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, buffer: 0, inv: 0, hearts: 3, anim: 0, slide: 0, run: 0, runDir: 0, dash: false, lastAx: 0, relDir: 0, relTime: -99, climb: false, drop: 0 };
  P.y = 12 * TS - P.h;
  L.respawn = { x: P.x, y: P.y };
  cam = 0; particles = []; popups = []; dialog = null; hideDialog();
  updateHud(); showIntro();
}

/* =====================================================================
   INVOER
   ===================================================================== */
const held = { left: false, right: false, jump: false, run: false, down: false };
// Lopen met de controller in de Google TV-app (zie __tvDir in gamepad.js).
const tvHeld = { left: false, right: false };
const edges = [];

/* Precieze tikjes. Het spel rekent in stappen van 1/60 s, maar kijkt pas aan het begin van een beeld naar de knoppen.
   Is een toestel even druk (een tv), of komt het loslaten wat later binnen (Bluetooth), dan leek een tikje langer en
   liep het poppetje te ver. Daarom onthouden we wanneer een knop echt werd ingedrukt en losgelaten, en laten we het
   poppetje precies zo lang lopen: indrukken telt meteen bij de volgende stap, loslaten even veel later als je drukte. */
const holdQ = [], holdShift = {};
/** The moment of a key event. Some devices (Android/TV WebViews) stamp events with another clock: a time that is far off,
 *  or in the future, would make a release wait for seconds. Then we use "now". */
function eventTime(e) { const now = performance.now(), t = e && e.timeStamp; return t > 0 && Math.abs(now - t) < 1000 ? Math.min(t, now) : now; }
function queueHold(o, a, down, t) { holdQ.push({ o, a, down, t, at: performance.now() }); }
/** De speltijd sprong d ms vooruit: knoppen die nu ingedrukt zijn, laten even veel later los. */
function shiftHolds(d) { if (d > 0) for (const k in holdShift) holdShift[k] += d; }
/** Verwerk de knoppen tot en met speltijd t (aangeroepen vóór elke stap, vanuit de spellus). */
// A release that still has to wait only holds up later events of the same key: another key (← after →) counts at once.
// And a release never waits more than a second of real time.
function applyHolds(t) {
  const wait = new Set(), keep = [], now = performance.now();
  for (const h of holdQ) {
    const k = (h.o === held ? "k" : "t") + h.a;
    if (wait.has(k)) { keep.push(h); continue; }
    if (h.down) { h.o[h.a] = true; holdShift[k] = Math.min(1000, Math.max(0, t - h.t)); continue; }
    if (state === "play" && h.t + (holdShift[k] || 0) > t && now - h.at < 1000) { wait.add(k); keep.push(h); continue; }
    h.o[h.a] = false;
  }
  holdQ.length = 0; holdQ.push(...keep);
}
const KEYMAP = { ShiftLeft: "run", ShiftRight: "run", ControlLeft: "run", ControlRight: "run", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", ArrowUp: "jump", KeyW: "jump", Space: "jump", KeyE: "act", ArrowDown: "act", KeyS: "act", Enter: "act" };
addEventListener("keydown", e => {
  // Terug-knop van een tv-afstandsbediening in de browser
  if (e.key === "GoBack" || e.key === "BrowserBack") { if (tvBack()) e.preventDefault(); return; }
  // In menu's: pijltjes kiezen een knop, Enter/OK drukt (gamepad.js). Zo werkt ook een tv-afstandsbediening.
  if (state !== "play" && menuKey(e)) return;
  if (state === "pad") { padKey(e); return; }
  if (e.code === "Escape" && state === "hero" && heroKeysOpen()) { closeHeroKeys(); return; }
  if (e.code === "Escape") { if (state === "save") saveBack(); else if (state === "play" || state === "intro" || state === "map" || state === "hero") toTitle(); return; }
  const a = KEYMAP[e.code];
  if (!a) return;
  if (state === "play") e.preventDefault();
  if (a in held && !e.repeat) queueHold(held, a, true, eventTime(e));
  // ↓ also counts as held: to climb down a ladder
  if ((e.code === "ArrowDown" || e.code === "KeyS") && !e.repeat) queueHold(held, "down", true, eventTime(e));
  if (!e.repeat && (a === "jump" || a === "act")) edges.push(a);
});
addEventListener("keyup", e => {
  const a = KEYMAP[e.code]; if (a in held) queueHold(held, a, false, eventTime(e));
  if (e.code === "ArrowDown" || e.code === "KeyS") queueHold(held, "down", false, eventTime(e));
});
function bindTouch(id, a) {
  const b = $(id);
  // the 💬 button is also "down" while you hold it (to climb down a ladder)
  b.addEventListener("pointerdown", e => { e.preventDefault(); if (a in held) held[a] = true; if (a === "act") held.down = true; if (a === "jump" || a === "act") edges.push(a); try { b.setPointerCapture(e.pointerId); } catch (x) {} });
  const up = () => { if (a in held) held[a] = false; if (a === "act") held.down = false; };
  b.addEventListener("pointerup", up); b.addEventListener("pointercancel", up); b.addEventListener("lostpointercapture", up);
}
bindTouch("tL", "left"); bindTouch("tR", "right"); bindTouch("tJ", "jump"); bindTouch("tA", "act");
$("dialog").addEventListener("pointerdown", () => edges.push("act"));
const isTouch = matchMedia("(pointer: coarse)").matches;

/* =====================================================================
   DIALOOG
   ===================================================================== */
function say(name, lines, cb, calm) {
  if (typeof lines === "string") lines = [lines]; // one text is one balloon, never one letter at a time
  dialog = { name, lines, i: 0, cb, calm };
  $("dialog").classList.toggle("calm", !!calm);
  $("dName").textContent = name; $("dText").textContent = lines[0];
  $("dialog").hidden = false;
  if (typeof speakLine === "function") speakLine(name, lines[0], calm); // optional voices (voice.js)
}
function advanceDialog() {
  dialog.i++;
  if (dialog.i >= dialog.lines.length) { const cb = dialog.cb; dialog = null; hideDialog(); if (cb) cb(); }
  else { $("dText").textContent = dialog.lines[dialog.i]; if (typeof speakLine === "function") speakLine(dialog.name, dialog.lines[dialog.i], dialog.calm); }
}
function hideDialog(soft) { $("dialog").hidden = true; if (typeof stopSpeaking === "function") stopSpeaking(soft); }
/** Walking away ends a conversation, like in real life: the balloon closes, whatever it was about still happens (a gate
    that opens, an animal that comes along), and the voice trails off at the next word instead of stopping hard.
    Only a new press of ← or →: if you were still holding one when the conversation opened, let go first (walkArmed). */
function walkAway() {
  const dir = held.left || held.right || padHeld.left || padHeld.right || tvHeld.left || tvHeld.right;
  if (!dir) { dialog.walkArmed = true; return false; }
  if (!dialog.walkArmed) return false;
  const cb = dialog.cb; dialog = null; hideDialog(true); if (cb) cb();
  return true;
}

/* =====================================================================
   SPELLOGICA
   ===================================================================== */
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function pop(x, y, text, color = "#fff") { popups.push({ x, y, text, color, life: 70 }); }
function burst(x, y, color, n = 12) {
  for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - .5) * 5, vy: Math.random() * -5 - 1, life: 40 + Math.random() * 20, c: color, s: 2 + Math.random() * 3 });
}

function hurt(msg) {
  if (P.inv > 0) return;
  P.hearts--; P.inv = 90; P.vy = -7; P.vx = -P.face * 4; P.slide = 0; SFX.hurt(); gpRumble();
  pop(P.x + P.w / 2, P.y - 10, msg, "#ff8a8a");
  if (P.hearts <= 0) {
    P.hearts = 3; respawn();
    say(T("Oops", "Oeps"), T(["Time for a breather on the sofa with a mug of hot chocolate...", "Ready? You carry on from the last flag."],
      ["Even uitpuffen op de bank met een kop warme chocolademelk...", "Klaar? Je gaat verder bij de laatste vlag."]));
  }
  updateHud();
}
function respawn() { P.x = L.respawn.x; P.y = L.respawn.y; P.vx = P.vy = 0; P.inv = 60; P.slide = 0; P.climb = false; P.drop = 0; P.capsize = 0; P.rideCrash = null; P.railJump = P.railV = 0; P.railDuck = P.railActive = false; }
/** A ride crash pauses at the obstacle before costing a heart and returning to the flag. */
function crashRide() {
  P.rideCrash = { kind: P.ride, time: 45, feet: P.y + P.h };
  P.vx = P.vy = 0; P.slide = 0; P.inv = 0;
  pop(P.x + P.w / 2, P.y - 10, T("Crash!", "Boem!"), "#ff8a8a"); SFX.hurt(); gpRumble();
}
/** The canoe hits a rock and turns upside down: a big splash, and step() sends you back to the last flag. */
function capsize() {
  if (P.capsize) return;
  const cx = P.x + P.w / 2, wt = waterTop(Math.floor(cx / TS));
  P.capsize = 45; P.vx = P.vy = 0; P.slide = 0;
  P.y = wt - P.h * .45; P.swim = true; P.onGround = true;
  pop(cx, P.y - 8, T("Capsized!", "Omgeslagen!"), "#fff"); SFX.hurt(); gpRumble();
  for (let i = 0; i < 16; i++) particles.push({ x: cx + (Math.random() - .5) * 50, y: wt, vx: (Math.random() - .5) * 4, vy: -2 - Math.random() * 3, life: 28, c: "#e8fbff", s: 3 });
}

function nearest(list, range = 44) {
  const pc = P.x + P.w / 2;
  return list.find(o => Math.abs(o.x + 16 - pc) < range && Math.abs(o.y + TS - (P.y + P.h)) < 40);
}

function interact() {
  const npc = nearest(L.npcs);
  if (npc) {
    const nm = npc.who.name;
    npc.talked = true;
    if (npc.task) return taskTalk(npc);
    if (!npc.quest) return say(nm, npc.lines);
    if (L.questDone) return say(nm, npc.quest.after);
    if (!L.hasQuest) return say(nm, npc.quest.need);
    return say(nm, npc.quest.done, () => { L.questDone = true; L.gateOpen = true; SFX.open(); pop(L.d.gate[0] * TS + 16, 8 * TS, T("Open!", "Open!"), "#8dffb5"); updateHud(); });
  }
  const sw = nearest(L.switches);
  if (sw && !sw.on) return switchOn(sw);
  if (L.bell && nearest([L.bell])) return ringBell();
  if (L.animal && !L.animal.follow && nearest([L.animal], 48)) {
    L.animal.follow = true; L.animal.trail = []; L.animal.call = 400; animalSound(L.d.task.animal);
    pop(L.animal.x + 16, L.animal.y - 10, T(`The ${L.d.task.name} follows you!`, `${cap(L.d.task.name)} loopt met je mee!`), "#9fe8ff"); updateHud(); return;
  }
  const sign = nearest(L.signs);
  if (sign) return say(T("Sign", "Bordje"), sign.lines);
  const clue = nearest(L.clues);
  if (clue) return clueTalk(clue);
  if (L.lantern && Math.abs(L.lantern.x + 16 - (P.x + P.w / 2)) < 44) {
    L.lantern.lit = true;
    return say(T("In the church", "In de kerk"), T(["Inside it's quiet and warm. Outside you can softly hear the Christmas market.", "You light a candle. 🕯️"],
      ["Binnen is het stil en warm. Buiten klinkt zachtjes de kerstmarkt.", "Je steekt een kaarsje aan. 🕯️"]), null, true);
  }
  if (L.pad && !L.codeOpen && Math.abs(L.pad.x + 16 - (P.x + P.w / 2)) < 50) return openPad();
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
/** An animal that sees you close by (about 6 tiles, on about the same height) comes walking towards you, a bit faster
    than it wanders, and calls once when it spots you. Further away it wanders again. Not the moose: it is friendly. */
function animalChase(e) {
  if (e.kind === "alg") return;
  if (e.spd === undefined) e.spd = Math.abs(e.vx) || 1;
  const dx = P.x + P.w / 2 - (e.x + e.w / 2), dy = P.y + P.h - (e.y + e.h);
  const near = Math.abs(dx) < 6 * TS && Math.abs(dy) < 1.5 * TS && P.inv <= 0;
  if (near) {
    // it spotted you: one call (not again for a few seconds, and never two animals at once)
    if (!e.chase && L.time - (e.spotted ?? -999) > 300 && L.time - (L.calls ?? -999) > 60) { e.spotted = L.calls = L.time; animalSound(e.kind, .8); e.call = 240 + Math.floor(Math.random() * 300); }
    e.chase = true; e.vx = (Math.sign(dx) || 1) * e.spd * 1.4;
  } else if (e.chase) { e.chase = false; e.vx = Math.sign(e.vx || 1) * e.spd; } // out of sight: back to wandering
}
/** Now and then an animal near you makes its sound: louder close by, never two at once (L.calls), and not while
    you are talking to someone (step() does not run then). */
function animalCall(e, kind = e.kind) {
  const dx = Math.abs(e.x - P.x);
  if (dx > 9 * TS) return;
  if (e.call === undefined) e.call = 90 + Math.floor(Math.random() * 300);
  if (--e.call > 0) return;
  e.call = 240 + Math.floor(Math.random() * 300);
  if (L.time - (L.calls || -999) < 100) return;
  L.calls = L.time; animalSound(kind, .75 - dx / (9 * TS) * .6);
}
function gateNpc() { return L.npcs.find(n => n.task || n.quest); }
function openGate(lines) {
  L.questDone = true; L.gateOpen = true; L.timer = 0; SFX.open();
  pop(L.d.gate[0] * TS + 16, 8 * TS, T("Open!", "Open!"), "#8dffb5"); updateHud();
  if (lines) say(gateNpc().who.name, lines);
}
/** Talking to the person at the gate when the task is not "bring something". */
function taskTalk(npc) {
  const t = L.d.task, nm = npc.who.name;
  if (L.questDone) return say(nm, t.after);
  if (t.kind === "follow" && L.animal && L.animal.follow && Math.abs(L.animal.x - npc.x) < 5 * TS) {
    L.animal.home = true; L.animal.follow = false; animalSound(L.d.task.animal);
    return say(nm, t.done, () => openGate());
  }
  return say(nm, t.need);
}
/** Pull a lever or light a lamp; when all are on, the gate opens. */
function switchOn(sw) {
  sw.on = true; SFX.key(); burst(sw.x + 16, sw.y, L.d.task.kind === "lights" ? "#ffd25e" : "#c9ced8", 12);
  const n = L.switches.filter(s => s.on).length;
  pop(sw.x + 16, sw.y - 20, `${L.d.task.hud} ${n}/${L.switches.length}`, "#fff3a0"); updateHud();
  if (n === L.switches.length) openGate(L.d.task.done);
}
/** The bell: the gate opens for a few seconds. Run! */
function ringBell() {
  if (L.questDone) return;
  L.bell.swing = 60; L.gateOpen = true; L.timer = Math.round((L.d.task.secs || 5) * 60);
  tone(988, .35, "sine", .06); tone(1318, .5, "sine", .04);
  pop(L.bell.x + 16, L.bell.y - 30, T("Run!", "Rennen!"), "#ffd25e"); updateHud();
}
/** A clue for the lock: what it says, and for a bell its note. */
function clueTalk(c) {
  c.heard = true;
  const nr = T(`${c.i + 1} of ${c.n}`, `${c.i + 1} van ${c.n}`);
  if (c.question) {
    const name = c.kind === "melody" ? T("Bell", "Belletje") : c.kind === "colours" ? T("Lamp", "Lamp") : c.kind === "arrows" ? T("Signpost", "Wegwijzer") : T("Letter", "Letter");
    return say(name, [`${nr}: ${c.question[0]}`, c.question[1]]);
  }
  if (c.kind === "melody") { const nt = NOTES[+c.v - 1]; ringClue(c); return say(T("Bell", "Belletje"), [T(`Bell ${nr} plays a note: ${nt[1]}.`, `Belletje ${nr} speelt een toon: ${nt[1]}.`)]); }
  if (c.kind === "colours") return say(T("Lamp", "Lamp"), [T(`Lamp ${nr} shines ${COLOURS[c.v][1]}.`, `Lamp ${nr} brandt ${COLOURS[c.v][1]}.`)]);
  if (c.kind === "arrows") return say(T("Signpost", "Wegwijzer"), [T(`Signpost ${nr} points ${ARROWS[c.v]}.`, `Wegwijzer ${nr} wijst ${ARROWS[c.v]}.`)]);
  return say(T("Letter", "Letter"), [T(`Letter ${nr}: ${c.v}`, `Letter ${nr}: ${c.v}`)]);
}
function ringClue(c) { const nt = NOTES[+c.v - 1]; c.ring = 50; tone(nt[2], .45, "sine", .07); tone(nt[2] * 2, .3, "sine", .02); }
/** Standing on a plank ("="), not on the ground: then ↓ can drop you through it. */
function onPlank() {
  const ty = Math.floor((P.y + P.h + 1) / TS), x0 = Math.floor(P.x / TS), x1 = Math.floor((P.x + P.w - .01) / TS);
  let plank = false;
  for (let tx = x0; tx <= x1; tx++) { const c = cell(tx, ty); if (c === "=") plank = true; else if (isSolid(tx, ty)) return false; }
  return plank;
}
/** The wind right now: slow gusts, mostly against you (it's the Netherlands), sometimes from behind. */
function windNow() { return L.d.wind * (Math.sin(L.time / 140) * .9 - .25 + Math.sin(L.time / 37) * .25); }
function step() {
  frame++;
  // flakes (title + snow level)
  for (const f of flakes) { f.y += f.vy; f.x += Math.sin(frame / 60 + f.p) * .3; if (f.y > VIEW_H) { f.y = -4; f.x = Math.random() * viewW; } }
  for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += .2; p.life--; }
  particles = particles.filter(p => p.life > 0);
  for (const p of popups) { p.y -= .6; p.life--; }
  popups = popups.filter(p => p.life > 0);
  if (state !== "play") { edges.length = 0; return; }

  if (dialog && !walkAway()) { while (edges.length) { const e = edges.shift(); if (e === "act" || e === "jump") { advanceDialog(); break; } } edges.length = 0; return; }

  L.time++;
  if (P.rideCrash) {
    edges.length = 0;
    if (--P.rideCrash.time <= 0) { P.inv = 0; hurt(T("Crash!", "Boem!")); respawn(); }
    return;
  }
  // Capsized in the canoe (the Ardèche): upside down in the water for a moment, then, like after a fall into a pit,
  // a heart less and back to the last flag.
  if (P.capsize) {
    edges.length = 0;
    if (--P.capsize <= 0) { P.inv = 0; hurt(T("Splash!", "Plons!")); respawn(); }
    return;
  }
  let wantJump = false, wantAct = false;
  while (edges.length) { const e = edges.shift(); if (e === "jump") wantJump = true; if (e === "act") wantAct = true; }
  P.ride = rideAt(Math.floor((P.x + P.w / 2) / TS));
  const railbike = P.ride === "railbike";
  if (railbike && !P.railActive) {
    P.railJump = Math.max(0, L.d.ride.row * TS - (P.y + P.h));
    P.railV = P.railJump ? -P.vy : 0;
    P.y = L.d.ride.row * TS - P.h; P.vy = 0; P.onGround = true; P.railActive = true;
  } else if (!railbike && P.railActive) {
    P.y -= P.railJump; P.vy = -P.railV; if (P.railJump) P.onGround = false;
    P.railJump = P.railV = 0; P.railDuck = P.railActive = false;
  }
  if (wantAct && !railbike && !(P.ride === "bike" && (held.down || padHeld.down))) {
    interact();
    if (dialog || state !== "play") return;
    // Niets om mee te praten of te gebruiken, en je loopt? Dan ga je op je buik glijden (↓, E, □/○ of 💬).
    if (P.onGround && !P.slide && !P.ride && Math.abs(P.vx) > 2) {
      P.face = Math.sign(P.vx); P.vx = P.face * Math.max(6.5, Math.abs(P.vx) + .8); P.slide = L.d.theme === "sneeuw" ? 60 : 50; SFX.slide();
    } else if (P.onGround && !P.slide && onPlank()) {
      // standing still on a plank (not on the ground): ↓ drops you through it
      P.drop = 14; P.y += 2; P.onGround = false; P.mover = null;
    }
  }

  // horizontal
  // toetsenbord, aanraakknoppen en controller (padHeld in gamepad.js) tellen allemaal mee
  const goRight = held.right || padHeld.right || tvHeld.right, goLeft = held.left || padHeld.left || tvHeld.left, jumpHeld = held.jump || padHeld.jump;
  // Rennen: Shift of Ctrl, of L1/R1/L2/R2 op een controller. Sneller dan lopen; loslaten zakt soepel terug.
  const ax = (goRight ? 1 : 0) - (goLeft ? 1 : 0);
  // Dubbeltikken en vasthouden is ook rennen: werkt op elk apparaat zonder extra knop (afstandsbediening, touchscreen,
  // controller, toetsenbord). Een richting die binnen 0,25 s na loslaten opnieuw wordt ingedrukt, rent zolang je vasthoudt.
  if (ax !== P.lastAx) {
    if (ax && ax === P.relDir && L.time - P.relTime <= 15) P.dash = true;
    else P.dash = false;
    if (!ax && P.lastAx) { P.relDir = P.lastAx; P.relTime = L.time; }
    P.lastAx = ax;
  }
  const running = held.run || padHeld.run || P.dash, top = running ? 6.2 : 4.4;
  // Buikglijden: even sneller dan lopen, en langzaam uitglijden (in de sneeuw het verst). Springen stopt het glijden;
  // daarna geldt weer de gewone snelheid, dus je springt niet verder dan normaal.
  if (P.slide && wantJump) P.slide = 0;
  // On a ride you move the way that thing moves (RIDE_FEEL).
  if (P.ride) {
    const r = RIDE_FEEL[P.ride], want = ax > 0 ? r.top : ax < 0 ? -r.back : r.coast, d = want - P.vx;
    if (P.onGround) P.vx += Math.sign(d) * Math.min(Math.abs(d), d * (P.vx || d) > 0 ? r.acc : r.brake);
    else if (ax) P.vx = Math.max(-r.back, Math.min(r.top, P.vx + ax * .2));
    if (ax) P.face = ax;
    P.slide = 0; P.run = 0;
  } else if (P.slide) {
    P.vx *= !P.onGround ? .99 : L.d.theme === "sneeuw" ? .985 : .97;
    P.slide--;
    if (Math.abs(P.vx) < 1.2) P.slide = 0;
    if (P.onGround && L.time % 3 === 0) {
      const c = { sneeuw: "#ffffff", bos: "#b08a5a", stad: "#d8d0c8", huis: "#e8dcc8", kust: "#e6d9b8" }[L.d.theme] || "#ffffff";
      particles.push({ x: P.x + P.w / 2 - P.face * 18, y: P.y + P.h - 2, vx: -P.face * (1 + Math.random() * 1.5), vy: -1 - Math.random() * 2, life: 22, c, s: 2 + Math.random() * 2.5 });
    }
  } else {
    // Rustig optrekken: op de grond begint het poppetje langzaam en loopt het steeds sneller (na ongeveer een kwart
    // seconde de volle snelheid). Zo zet een tikje maar een klein stapje, om precies bij een randje te komen.
    // Omdraaien remt meteen flink af; in de lucht stuur je zoals altijd, zodat springen hetzelfde blijft.
    if (ax !== P.runDir) { P.run = 0; P.runDir = ax; }
    if (ax) {
      // versnellen tot de topsnelheid (lopen 4,4, rennen 6,2), nooit eroverheen
      // On ice (North Pole, the toboggan run, the kicksled) you get going slowly and turning takes a while.
      const ice = L.d.ice && P.onGround, v = P.vx * ax, up = !P.onGround ? .45 : v < 0 ? (ice ? .25 : 1.1) : Math.min(ice ? .3 : .7, (ice ? .06 : .12) + P.run * .03);
      if (P.onGround && v >= 0) P.run++;
      if (v < top) P.vx = ax * Math.min(top, v + up);
      P.face = ax;
    }
    else P.vx *= P.onGround ? (L.d.ice ? .965 : .74) : .93;
    // Boven de topsnelheid (rennen losgelaten, of na glijden): op de grond soepel terug, in de lucht meteen,
    // zodat je zonder rennen nooit verder springt dan normaal.
    if (Math.abs(P.vx) > top) P.vx = Math.sign(P.vx) * (P.onGround ? Math.max(top, Math.abs(P.vx) * .94) : top);
  }
  if (Math.abs(P.vx) < .05) P.vx = 0;

  // Ladders: hold ↑ to climb up, ↓ to climb down. At the top you step onto the plank; from the plank ↓ takes you down.
  const goDown = held.down || padHeld.down, lc = Math.floor((P.x + P.w / 2) / TS);
  if (railbike) {
    P.railDuck = goDown && !(P.railJump > 0);
    if (wantJump && !P.railDuck && !(P.railJump > 0)) { P.railV = 7.5; SFX.jump(); }
    wantJump = false;
    if (P.railV || P.railJump) {
      P.railJump = Math.max(0, (P.railJump || 0) + P.railV);
      P.railV -= jumpHeld || P.railV < 0 ? .4 : .8;
      if (!P.railJump) P.railV = 0;
    }
  } else P.railDuck = P.ride === "bike" && goDown && P.onGround && !wantJump;
  const ladderCell = ty => cell(lc, ty) === "|" || (cell(lc, ty) === "=" && cell(lc, ty + 1) === "|");
  const feetRow = Math.floor((P.y + P.h - 1) / TS);
  let onLadder = false; for (let ty = Math.floor(P.y / TS); ty <= feetRow; ty++) if (ladderCell(ty)) onLadder = true;
  const ladderBelow = P.onGround && cell(lc, feetRow + 1) === "=" && cell(lc, feetRow + 2) === "|";
  if (!P.climb && ((onLadder && (jumpHeld || goDown)) || (ladderBelow && goDown))) { P.climb = true; P.slide = 0; P.x = lc * TS + (TS - P.w) / 2; }
  if (P.climb && ((!onLadder && !ladderBelow) || (P.onGround && !jumpHeld && !goDown && !ladderBelow))) P.climb = false;
  if (P.climb) {
    P.vy = jumpHeld ? -2.6 : goDown ? 2.6 : 0; P.vx = ax * 1.4; P.buffer = 0; P.coyote = 0;
    if (P.vy) P.anim += .25;
  }
  if (P.drop > 0) P.drop--;
  // jump
  if (wantJump && !P.climb) P.buffer = 8;
  P.coyote = P.onGround ? 7 : P.coyote - 1;
  if (P.buffer > 0 && P.coyote > 0) { P.vy = -11.6; P.buffer = 0; P.coyote = 0; P.onGround = false; SFX.jump(); }
  P.buffer--;
  if (!P.climb) { P.vy += (P.vy < 0 && !jumpHeld) ? 1.1 : .55; P.vy = Math.min(P.vy, 12); }

  // movers (ice floes, gondolas, boats): move, and take along whoever stands on them
  for (const m of L.movers) {
    if (m.wait > 0) { m.wait--; m.dx = m.dy = 0; continue; }
    const nx = Math.max(m.x0, Math.min(m.x1, m.x + m.dir * m.speed)), ny = m.y0 + (m.y1 - m.y0) * (nx - m.x0) / (m.x1 - m.x0);
    m.dx = nx - m.x; m.dy = ny - m.y; m.x = nx; m.y = ny;
    if (m.x === m.x0 || m.x === m.x1) { m.dir = -m.dir; m.wait = 50; }
  }
  if (P.mover && P.onGround) { P.x += P.mover.dx; P.y += P.mover.dy; }
  // Wind (the Netherlands): gusts that push you, now this way, then the other way. Less in the air than on the ground.
  if (L.d.wind) P.x += windNow() * (P.onGround ? 1 : .6);

  // The river (the Ardèche): in the canoe, the current carries you along, also while you jump. Standing on a rock it doesn't.
  const pcol = Math.floor((P.x + P.w / 2) / TS);
  P.canoe = inRiver(pcol);
  const drift = P.canoe && (P.swim || !P.onGround) ? riverCurrent(pcol) : 0;
  // move X
  const prevX = P.x, dxMove = P.vx + drift;
  P.x += dxMove;
  {
    const y0 = Math.floor(P.y / TS), y1 = Math.floor((P.y + P.h - .01) / TS);
    let hit = null;
    if (dxMove > 0) { const tx = Math.floor((P.x + P.w - .01) / TS); for (let ty = y0; ty <= y1; ty++) if (isSolid(tx, ty)) { P.x = tx * TS - P.w; P.vx = 0; hit = cell(tx, ty); break; } }
    else if (dxMove < 0) { const tx = Math.floor(P.x / TS); for (let ty = y0; ty <= y1; ty++) if (isSolid(tx, ty)) { P.x = (tx + 1) * TS; P.vx = 0; hit = cell(tx, ty); break; } }
    if (!hit && P.ride === "husky" && dxMove * P.face > 0) {
      const tx = Math.floor((P.x + P.w / 2 + P.face * (HUSKY_LEAD - .01)) / TS);
      const dogTop = Math.floor((P.y + P.h - 18) / TS), dogBottom = Math.floor((P.y + P.h - .01) / TS);
      for (let ty = dogTop; ty <= dogBottom; ty++) if (cell(tx, ty) === "S") {
        P.x = (P.face > 0 ? tx * TS - HUSKY_LEAD : (tx + 1) * TS + HUSKY_LEAD) - P.w / 2;
        P.vx = 0; hit = "S"; break;
      }
    }
    // bumping into a block on a ride: oops, no harm done
    if (hit === "S" && P.ride && L.time - (P.bonk || -99) > 45) { P.bonk = L.time; pop(P.x + P.w / 2, P.y - 8, T("Oops!", "Oeps!"), "#fff"); tone(160, .12, "triangle", .05); }
    if (hit === "R" && P.ride) {
      if (["bike", "ski", "skates", "sled", "kicksled"].includes(P.ride)) crashRide();
      else { P.inv = 0; hurt(T("Crash!", "Boem!")); respawn(); }
      return;
    }
    // bumping into a rock in the canoe: you capsize, and start again from the last flag
    if (hit === "R" && P.canoe) capsize();
    // You can't paddle up a waterfall: the water upstream is higher than you.
    if (P.canoe && P.swim && dxMove < 0) { const nc = Math.floor((P.x + P.w / 2) / TS); if (inRiver(nc) && waterTop(nc) < waterTop(pcol) - 8) P.x = prevX; }
  }
  const rider = railbike ? railRiderBounds(heroChar()) : P.ride === "bike" ? bikeRiderBounds(heroChar(), false) : null;
  if (rider && L.d.ride.hazards.some(h =>
    (h.kind === "branch"
      ? rider.right > h.x * TS && rider.left < (h.x + 1) * TS && rider.top < L.d.ride.row * TS - h.clearance && rider.bottom > L.d.ride.row * TS - (h.canopy ? RAIL_CANOPY_HEIGHT : h.clearance + 6)
      : P.x + P.w > h.x * TS && P.x < (h.x + 1) * TS && !(P.railJump >= 22)))) {
    crashRide(); return;
  }
  // move Y
  const prevBottom = P.y + P.h;
  P.y += P.vy; P.onGround = false;
  {
    const x0 = Math.floor(P.x / TS), x1 = Math.floor((P.x + P.w - .01) / TS);
    if (P.vy > 0) {
      const ty = Math.floor((P.y + P.h - .01) / TS);
      for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty) || (cell(tx, ty) === "=" && prevBottom <= ty * TS + .5 && !P.drop && !P.climb)) { P.y = ty * TS - P.h; P.vy = 0; P.onGround = true; break; }
    } else if (P.vy < 0) {
      const ty = Math.floor(P.y / TS);
      for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty)) { P.y = (ty + 1) * TS; P.vy = 0; break; }
    }
  }
  // standing on a mover (only from above, like a plank)
  P.mover = null;
  if (P.vy >= 0) for (const m of L.movers) {
    if (P.x + P.w > m.x + 2 && P.x < m.x + m.w - 2 && prevBottom <= m.y + 1 && P.y + P.h >= m.y) { P.y = m.y - P.h; P.vy = 0; P.onGround = true; P.mover = m; break; }
  }
  // Swimming (Dalmatia): the sea is warm, so you float in the water instead of falling. You can jump out again.
  // (while you float, the gentle bobbing must not count as leaving the water, or a jump out could fail: swimPrev)
  P.swimPrev = P.swim; P.swim = false;
  if (L.d.swim && !P.onGround) {
    const col = Math.floor((P.x + P.w / 2) / TS), surf = waterTop(col);
    // in the river you only land on the water from above (going down a waterfall); everywhere else as before
    if (col >= 0 && col < L.w && L.grid[ROWS - 1][col] !== "#" && P.y + P.h > surf + P.h * .55 - (P.swimPrev ? 4 : 0) && (!inRiver(col) || prevBottom <= surf + P.h * .55 + 14)) {
      P.y = surf - P.h * .45 + Math.sin(L.time / 12) * 1.2; P.vy = 0; P.onGround = true; P.swim = true; P.mover = null;
      P.vx = Math.max(-2.6, Math.min(2.6, P.vx));
      if (L.time % 10 === 0) particles.push({ x: P.x + P.w / 2 + (Math.random() - .5) * 20, y: surf + 4, vx: 0, vy: -.6, life: 18, c: "#e8fbff", s: 2.5 });
      // a splash when the canoe lands on the water (off a rock, or down a waterfall)
      if (inRiver(col) && prevBottom < surf + P.h * .55 - 6) for (let i = 0; i < 8; i++) particles.push({ x: P.x + P.w / 2 + (Math.random() - .5) * 40, y: surf, vx: (Math.random() - .5) * 3, vy: -1.5 - Math.random() * 2, life: 22, c: "#e8fbff", s: 3 });
    }
  }
  if (P.inv > 0) P.inv--;
  P.anim += Math.abs(P.vx) * .09;

  // pits
  if (P.y > VIEW_H + 60) { P.inv = 0; hurt(T("Splash!", "Plons!")); respawn(); }

  // spikes
  {
    const x0 = Math.floor((P.x + 3) / TS), x1 = Math.floor((P.x + P.w - 3) / TS), ty = Math.floor((P.y + P.h - 2) / TS);
    for (let tx = x0; tx <= x1; tx++) if (cell(tx, ty) === "^" && (P.y + P.h) > ty * TS + 16) { hurt(L.d.spikeMsg); break; }
  }

  // items
  const collector = railbike ? { x: rider.left, y: rider.top, w: rider.right - rider.left, h: rider.bottom - rider.top } : P;
  for (const it of L.items) {
    if (it.taken || !overlap(collector, { x: it.x + 6, y: it.y + 6, w: 20, h: 20 })) continue;
    it.taken = true;
    const cx = it.x + 16, cy = it.y + 16;
    if (it.type === "coin") { L.coins++; SFX.coin(); burst(cx, cy, "#ffd25e", 6); if (L.coins % 10 === 0) pop(cx, cy - 10, `${L.coins} ${L.d.coinName}!`, "#ffd25e"); }
    else if (it.type === "heart") { P.hearts = Math.min(3, P.hearts + 1); SFX.coin(); pop(cx, cy - 10, T("Chocolate! +1 ❤️", "Chocolade! +1 ❤️"), "#ffb0b0"); }
    else if (it.type === "key") { L.keys++; SFX.key(); burst(cx, cy, "#fff3a0", 20); pop(cx, cy - 12, `${L.d.keyName} ${L.keys}/3`, "#fff3a0"); }
    else if (it.type === "quest") { L.hasQuest = true; SFX.key(); burst(cx, cy, "#9fe8ff", 20); pop(cx, cy - 12, T(`Found the ${L.d.questName}!`, `${L.d.questName} gevonden!`), "#9fe8ff"); }
    updateHud();
  }

  // checkpoints
  for (const c of L.checks) if (!c.on && Math.abs(c.x + 16 - (P.x + P.w / 2)) < 20) {
    L.checks.forEach(o => o.on = false); c.on = true; L.respawn = { x: c.x + 5, y: c.y + TS - P.h }; tone(660, .1, "triangle", .05); pop(c.x + 16, c.y - 20, T("Saved", "Opgeslagen"), "#8dffb5");
  }

  // enemies
  const rail = L.d.ride && L.d.ride.kind === "railbike" ? L.d.ride : null;
  for (const e of L.enemies) {
    if (e.dead) { e.dead++; continue; }
    animalCall(e);
    animalChase(e);
    const nx = e.x + e.vx, front = e.vx > 0 ? nx + e.w : nx;
    const ftx = Math.floor(front / TS), fty = Math.floor((e.y + e.h - 1) / TS);
    const below = cell(ftx, fty + 1);
    const railGrate = rail && nx < (rail.x1 + 2) * TS && nx + e.w > (rail.x0 - 1) * TS;
    // at a wall or an edge it turns around; an animal coming for you waits there instead (it won't jump after you)
    if (railGrate || isSolid(ftx, fty) || !(isSolid(ftx, fty + 1) || below === "=")) { if (!e.chase) e.vx = -e.vx; } else e.x = nx;
    if (overlap(P, e) && e.kind === "alg") {
      // the moose: land on its back and you fly up high; bump into it and it gently pushes you away
      if (P.vy > 0 && prevBottom <= e.y + 16) { P.y = e.y - P.h; P.vy = -15.5; P.slide = 0; tone(220, .18, "triangle", .06); tone(330, .2, "triangle", .04); animalSound("alg", .6); pop(e.x + e.w / 2, e.y - 14, T("Boing!", "Boing!"), "#fff"); }
      else { const left = P.x + P.w / 2 < e.x + e.w / 2; P.vx = left ? -5 : 5; P.x = left ? Math.min(P.x, e.x - P.w) : Math.max(P.x, e.x + e.w); P.slide = 0;
        if (!e.said || L.time - e.said > 120) { e.said = L.time; animalSound("alg"); pop(e.x + e.w / 2, e.y - 14, T("Mmmooh?", "Mmmoeh?"), "#fff"); } }
      continue;
    }
    if (overlap(P, e)) {
      // Glijdend gaan beesten omver (je raakt zelf niets kwijt); stekels en ravijnen blijven gevaarlijk.
      if (P.slide) {
        e.dead = 1; SFX.stomp(); animalDefeat(e.kind); burst(e.x + 15, e.y + 10, "#ffffff", 14);
        pop(e.x + 15, e.y - 10, { zwijn: T("Pfff!", "Pfff!"), robot: "Bzzt...", sneeuwpop: T("Poof!", "Plof!"), pinguin: T("Wrong pole!", "Verkeerde pool!"), geit: T("Meh!", "Mèèh!"), troll: T("Hmpf!", "Hmpf!"), gans: T("Honk!", "Gak!"), meeuw: T("My chips!", "Mijn patat!"), krab: T("Click clack!", "Knip knap!"), marmot: T("Eeek!", "Piep!"), speelgoed: T("Clank!", "Klonk!"), pakje: T("Return to sender!", "Retour afzender!"), poolvos: T("Yip!", "Kef!"), lemming: T("Squeak!", "Piep!"), mygga: T("Bzz... splat!", "Bzz... pats!"), wesp: T("Bzz... pop!", "Bzz... plop!"), duif: T("Coo... flap!", "Roekoe... fladder!"), bever: T("Slap!", "Klets!") }[e.kind], "#fff");
      } else if (P.vy > 0 && prevBottom <= e.y + 12) {
        e.dead = 1; P.vy = jumpHeld ? -11 : -8; SFX.stomp(); animalDefeat(e.kind); burst(e.x + 15, e.y + 10, "#ffffff", 14);
        pop(e.x + 15, e.y - 10, { zwijn: T("Pfff!", "Pfff!"), robot: "Bzzt...", sneeuwpop: T("Poof!", "Plof!"), pinguin: T("Wrong pole!", "Verkeerde pool!"), geit: T("Meh!", "Mèèh!"), troll: T("Hmpf!", "Hmpf!"), gans: T("Honk!", "Gak!"), meeuw: T("My chips!", "Mijn patat!"), krab: T("Click clack!", "Knip knap!"), marmot: T("Eeek!", "Piep!"), speelgoed: T("Clank!", "Klonk!"), pakje: T("Return to sender!", "Retour afzender!"), poolvos: T("Yip!", "Kef!"), lemming: T("Squeak!", "Piep!"), mygga: T("Bzz... splat!", "Bzz... pats!"), wesp: T("Bzz... pop!", "Bzz... plop!"), duif: T("Coo... flap!", "Roekoe... fladder!"), bever: T("Slap!", "Klets!") }[e.kind], "#fff");
      } else animalSound(e.kind), hurt({ zwijn: "Oink!", robot: T("Bleep!", "Bliep!"), sneeuwpop: "Brrr!", pinguin: T("Squawk!", "Kwaak!"), geit: T("Baa!", "Bèèh!"), troll: T("Grr!", "Grr!"), gans: T("Hiss!", "Sssss!"), meeuw: T("Squawk!", "Krijs!"), krab: T("Pinch!", "Knijp!"), marmot: T("Whistle!", "Fluit!"), speelgoed: T("Tick tick!", "Tik tik!"), pakje: T("Bump!", "Bonk!"), poolvos: T("Snap!", "Hap!"), lemming: T("Nibble!", "Knabbel!"), mygga: T("Itchy!", "Jeuk!"), wesp: T("Sting!", "Steek!"), duif: T("Peck!", "Pik!"), bever: T("Gnaw!", "Knaag!") }[e.kind]);
    }
  }
  L.enemies = L.enemies.filter(e => e.dead < 30);

  // The bell's gate closes again when time is up, unless you are through (or standing in the gateway).
  if (L.timer > 0) {
    const gx = L.d.gate[0] * TS;
    if (P.x > gx + TS) { L.questDone = true; L.timer = 0; SFX.open(); pop(gx + 16, 8 * TS, T("Made it!", "Gehaald!"), "#8dffb5"); }
    else if (--L.timer <= 0) { if (P.x + P.w > gx && P.x < gx + TS) L.timer = 1; else { L.gateOpen = false; L.gateFade = 1; SFX.bad(); } }
    if (L.timer % 60 === 0) { tone(L.timer ? 700 : 300, .05, "square", .03); updateHud(); }
    else if (L.timer < 120 && L.timer % 30 === 0) tone(880, .04, "square", .025); // the last two seconds tick faster
  }
  // A melody bell rings when you walk past it for the first time.
  for (const c of L.clues) { if (c.ring > 0) c.ring--; if (c.kind === "melody" && !c.question && !c.heard && Math.abs(c.x + 16 - (P.x + P.w / 2)) < 20) { c.heard = true; ringClue(c); } }
  if (L.bell && L.bell.swing > 0) L.bell.swing--;
  // The animal follows your footsteps, a little behind you, never on top of you (then you couldn't see it).
  // After a big jump (a respawn) it comes along at once.
  if (L.animal && L.animal.follow) {
    const a = L.animal, tr = a.trail, last = tr[tr.length - 1];
    if (last && Math.abs(last.x - P.x) + Math.abs(last.y - (P.y + P.h)) > 60) { tr.length = 0; a.x = P.x - P.face * 34; a.y = P.y + P.h - TS; }
    tr.push({ x: P.x, y: P.y + P.h, face: P.face });
    if (tr.length > 40) tr.shift();
    animalCall(a, L.d.task.animal);
    // the newest footstep that is far enough behind you; if you stand still, it stays where it is
    for (let i = tr.length - 1; i >= 0; i--) if (Math.abs(tr[i].x - P.x) >= 30) { const s = tr[i]; a.face = Math.sign(P.x - s.x) || s.face; a.x += (s.x - a.x) * .35; a.y = s.y - TS; break; }
  } else if (L.animal && L.animal.home) { const n = gateNpc(); L.animal.x += (n.x - 26 - L.animal.x) * .1; L.animal.y = n.y; L.animal.face = 1; }
  // gate fades
  if (L.gateOpen) L.gateFade = Math.max(0, L.gateFade - .04);
  if (L.codeOpen) L.codeFade = Math.max(0, L.codeFade - .04);

  // exit
  if (L.exit && overlap(P, L.exit)) {
    if (L.keys >= L.need) return completeLevel();
    if (!L.exitNag || L.time - L.exitNag > 180) { L.exitNag = L.time; pop(L.exit.x + 16, L.exit.y - 10, T(`${L.need - L.keys} more ${L.d.keyName} needed`, `Nog ${L.need - L.keys} ${L.d.keyName} nodig`), "#ffd25e"); }
  }

  // camera
  const target = P.x + P.w / 2 - viewW * .42;
  const maxCam = Math.max(0, L.w * TS - viewW);
  cam += (Math.max(0, Math.min(maxCam, target)) - cam) * .15;
  if (L.w * TS < viewW) cam = -(viewW - L.w * TS) / 2;
}
