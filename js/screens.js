"use strict";
// Top bar, screens (intro, completed, finale), code lock, confetti and the title screen.
/* =====================================================================
   HUD & SCHERMEN
   ===================================================================== */
function updateHud() {
  if (!L) return;
  const d = L.d;
  $("hLvl").textContent = `${d.day} · ${d.name}`;
  $("hKeys").hidden = !L.need; $("hQuest").hidden = !d.gate; $("hCode").hidden = !d.code; $("hCoins").hidden = !L.coinTotal;
  $("hKeys").textContent = `${d.keyHud} ${L.keys}/${L.need}`;
  $("hKeys").classList.toggle("done", L.keys >= L.need);
  $("hQuest").textContent = questLabel();
  $("hQuest").classList.toggle("done", L.questDone);
  $("hCode").textContent = L.codeOpen ? "🔓 code" : "🔒 code";
  $("hCode").classList.toggle("done", L.codeOpen);
  $("hCoins").textContent = `${d.coinHud || d.coin} ${L.coins}/${L.coinTotal}`;
  $("hHearts").textContent = "❤️".repeat(Math.max(0, P.hearts)) + "🤍".repeat(Math.max(0, 3 - P.hearts));
  $("hNights").textContent = nightsLabel(L.idx);
}
/** The task halfway in the top bar: what to do, or how far you are. */
function questLabel() {
  const d = L.d, t = d.task, done = T("done", "klaar");
  if (!t) return `${d.questHud} ${L.questDone ? done : L.hasQuest ? T("bring back", "breng terug") : T("find", "zoeken")}`;
  if (L.questDone) return `${t.hud} ${done}`;
  if (t.kind === "timer") return `${t.hud} ${L.timer > 0 ? Math.ceil(L.timer / 60) + "s" : T("ring", "luiden")}`;
  if (t.kind === "follow") return `${t.hud} ${L.animal && L.animal.follow ? T("follows you", "loopt mee") : T("find", "zoeken")}`;
  return `${t.hud} ${L.switches.filter(s => s.on).length}/${L.switches.length}`;
}
// A v91 offline page can load newer scripts when the connection returns between requests.
const legacyMenu = ["settingsWrap", "helpWrap", "settingsOpen", "helpOpen", "settingsBack", "helpBack", "installAgain"].every(id => !$(id));
function setScreen(s) {
  state = s;
  $("title").hidden = s !== "title";
  if (!legacyMenu) {
    $("settingsWrap").hidden = s !== "settings";
    $("helpWrap").hidden = s !== "help";
  }
  $("mapWrap").hidden = s !== "map";
  $("heroWrap").hidden = s !== "hero";
  $("saveWrap").hidden = s !== "save";
  $("cardWrap").hidden = !(s === "intro" || s === "card");
  $("padWrap").hidden = s !== "pad";
  $("hud").hidden = !(s === "play" || s === "pad");
  // met een controller zijn de aanraakknoppen niet nodig
  $("touch").hidden = !(isTouch && s === "play" && !GP.on);
  if (s !== "play") { held.left = held.right = held.jump = false; }
  else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  menuAutoFocus();
  if (typeof ambFollow === "function") ambFollow(s);
  if (typeof updateHints === "function") updateHints();
}
function card(html, buttons) {
  const c = $("card"); c.innerHTML = html;
  const row = document.createElement("div"); row.className = "cta";
  buttons.forEach(([label, fn, ghost]) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn" + (ghost ? " ghost" : ""); b.textContent = label; b.onclick = fn; row.appendChild(b); });
  c.appendChild(row);
  setTimeout(() => row.querySelector("button")?.focus(), 30);
}

function showIntro() {
  const d = L.d;
  setScreen("intro");
  const head = `<div class="eyebrow">🧭 ${T("Scouting", "Op verkenning")}: ${REGION.name} · ${d.day} · ${L.idx + 1}/${LEVELS.length}</div><h2 style="font-size:30px;margin-top:6px">${d.name}</h2><p>${d.sub}</p>`;
  card(head + `<ul class="missions">
      <li>${d.keyHud} ${T(`Find <b>3 ${d.keyName}</b>. Without them you can't get to the exit.`, `Vind <b>3 ${d.keyName}</b>. Zonder kom je niet bij de uitgang.`)}</li>
      <li>${d.questHud} ${T(`Task: someone needs a <b>${d.questName}</b>. Talk to the people with a <b>!</b> above their head.`, `Opdracht: iemand zoekt een <b>${d.questName}</b>. Praat met de mensen met een <b>!</b> boven hun hoofd.`)}</li>
      <li>🔒 ${T("Crack the <b>code lock</b>. Read the signs along the way carefully.", "Kraak het <b>codeslot</b>. Lees de bordjes onderweg goed.")}</li>
      <li>${d.coinHud || d.coin} ${T(`Bonus: collect ${d.coinName}. 🍫 Chocolate gives you a heart back.`, `Bonus: verzamel ${d.coinName}. 🍫 Chocolade geeft een hartje terug.`)}</li>
    </ul>`, [[T("Play", "Spelen"), () => { setScreen("play"); updateHud(); }], [T("Back to menu", "Terug naar menu"), toTitle, true]]);
}

function completeLevel() {
  const idx = L.idx, secs = Math.round(L.time / 60), d = L.d, last = idx === LEVELS.length - 1;
  const pr = prog();
  pr.unlocked = Math.max(pr.unlocked || 1, Math.min(LEVELS.length, idx + 2));
  pr.best[idx] = Math.max(pr.best[idx] || 0, L.coins); persist();
  setScreen("card");
  const next = last ? [] : [[`${T("Next day", "Volgende dag")}: ${DAY_NAMES[idx + 1]}`, () => startLevel(idx + 1)]];
  SFX.win(); confetti(d.quiet ? 0 : 160);
  const stars = P.hearts >= 3 ? "★★★" : P.hearts >= 2 ? "★★" : "★";
  const stats = `<div class="stats"><div><b>${L.coins}/${L.coinTotal}</b><span>${d.coinName}</span></div><div><b>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</b><span>${T("time", "tijd")}</span></div><div><b>${stars}</b><span>${T("hearts left", "hartjes over")}</span></div></div>`;
  if (!last) {
    const msg = d.doneMsg || T("The baubles are hanging, the fire is burning and the biscuits are gone. Merry Christmas!", "De kerstballen hangen, het vuur brandt en de koekjes zijn op. Fijne kerst!");
    card(`<div class="eyebrow">${d.day} · ${T("done", "gehaald")}</div><h2 style="font-size:30px;margin-top:6px">${d.quiet ? d.name : T("You made it! 🎉", "Overleefd! 🎉")}</h2><p>${msg}</p>${stats}${d.quiet ? "" : `<p style="color:var(--muted)">${JOKES[Math.floor(Math.random() * JOKES.length)]}</p>`}`,
      [...next, ["Menu", toTitle, true]]);
  } else {
    const scouted = REGIONS.filter(r => regionDone(r.id) >= r.levels.length).length;
    card(`<div class="eyebrow">${T(`Trip scouted · all ${LEVELS.length} days`, `Reis verkend · alle ${LEVELS.length} dagen`)}</div><h2 style="font-size:34px;margin-top:6px">${REGION.finale[0]}</h2>
      <p>${REGION.finale[1]}</p>
      <p class="verdict"><b>${T("Scout's verdict", "Oordeel van de verkenner")}:</b> ${REGION.verdict}</p>
      <p>${scouted >= REGIONS.length
        ? T("Every trip scouted! The Hills and the Woods have a lot to choose from now. Maybe just go everywhere?", "Alle reizen verkend! De Hills en de Woods hebben nu genoeg te kiezen. Misschien gewoon overal heen?")
        : T(`${scouted} of ${REGIONS.length} trips scouted. The Hills and the Woods still can't decide: where shall we look next?`, `${scouted} van de ${REGIONS.length} reizen verkend. De Hills en de Woods kunnen nog steeds niet kiezen: waar kijken we nu?`)}</p>${stats}`,
      [[T("Scout another trip", "Nog een reis verkennen"), openMap], [T("Start again", "Opnieuw beginnen"), () => startLevel(0), true], ["Menu", toTitle, true]]);
  }
}

function toTitle() { hideDialog(); dialog = null; setScreen("title"); buildTitle(); menuAutoFocus(); }
if (!legacyMenu) {
  $("settingsOpen").onclick = () => setScreen("settings");
  $("helpOpen").onclick = () => setScreen("help");
  $("settingsBack").onclick = toTitle;
  $("helpBack").onclick = toTitle;
}

/* ---------- Code lock ---------- */
// One lock for every kind: digits, notes (a melody), colours, arrows or letters. The answer is a string of key values.
function openPad() {
  const c = L.d.code, kind = c.kind || "symbols", keys = c.keys || lockKeys(c), n = [...c.answer].length;
  padState = { val: [], kind, keys, n };
  $("padTitle").textContent = c.title; $("padRiddle").textContent = c.riddle;
  $("padFb").textContent = L.codeTries >= 3 ? hintFor() : "";
  const dg = $("digits"); dg.innerHTML = ""; dg.className = "digits" + (kind === "clock" ? " clock" : "") + (n > 4 ? " long" : "");
  for (let i = 0; i < n; i++) dg.appendChild(document.createElement("span"));
  const kb = $("keys"); kb.innerHTML = ""; kb.className = "keys k-" + kind;
  const add = (k, label, cls, col) => {
    const b = document.createElement("button"); b.type = "button"; b.innerHTML = label; if (cls) b.className = cls;
    if (col) b.style.setProperty("--key", col);
    if (k.length === 1 && kind !== "symbols" && kind !== "count" && kind !== "clock") b.setAttribute("aria-label", keyName(k));
    b.onclick = () => padPress(k); kb.appendChild(b);
  };
  if (kind === "symbols" || kind === "count" || kind === "clock") ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"].forEach(k => add(k, k, k === "OK" ? "ok" : ""));
  else { keys.forEach(k => add(k.v, keyLabel(k), "tok", k.col)); add("⌫", "⌫"); add("OK", "OK", "ok"); }
  drawDigits(); setScreen("pad");
}
function keyOf(v) { return padState.keys.find(k => k.v === v) || { v, name: v }; }
function keyName(v) { return keyOf(v).name; }
/** What a key or a filled-in slot shows: a coloured dot, a coloured bell with its note, an arrow or a letter. */
function keyLabel(k) {
  if (padState.kind === "colours") return `<i class="dot" style="background:${k.col}"></i>`;
  if (padState.kind === "melody") return `<i class="dot" style="background:${k.col}"></i><small>${k.name}</small>`;
  return k.v;
}
function hintFor() {
  const a = [...L.d.code.answer].slice(0, L.codeTries >= 5 ? 3 : 2), digits = !padState || ["symbols", "count", "clock"].includes(padState.kind);
  const s = digits ? a.join("") : a.map(keyName).join(", ");
  return T(`Tip: the code starts with ${s}...`, `Tip: de code begint met ${s}...`);
}
function drawDigits(bad) {
  const sp = $("digits").children;
  for (let i = 0; i < sp.length; i++) { const v = padState.val[i]; sp[i].innerHTML = v == null ? "" : padState.kind === "symbols" || padState.kind === "count" || padState.kind === "clock" ? v : keyLabel(keyOf(v)); }
  $("digits").classList.toggle("bad", !!bad);
}
function padPress(k) {
  if (k === "⌫") padState.val.pop();
  else if (k === "OK") return padCheck();
  else if (padState.val.length < padState.n) {
    padState.val.push(k);
    const key = keyOf(k);
    if (key.f) tone(key.f, .3, "sine", .07); else tone(500 + ("0123456789".indexOf(k) + 1) * 40, .05, "square", .03);
  }
  drawDigits();
  if (padState.val.length === padState.n) setTimeout(padCheck, 150);
}
function padCheck() {
  if (padState.val.length < padState.n) { $("padFb").textContent = T(`The code has ${padState.n} parts.`, `De code heeft ${padState.n} delen.`); return; }
  if (padState.val.join("") === L.d.code.answer) {
    L.codeOpen = true; SFX.open(); $("padFb").textContent = T("Click! Open!", "Klik! Open!");
    setTimeout(() => { setScreen("play"); pop(L.d.code.x * TS + 16, 8 * TS, T("Code cracked!", "Code gekraakt!"), "#8dffb5"); updateHud(); }, 600);
  } else {
    L.codeTries++; SFX.bad(); drawDigits(true);
    const wrong = T(["Bleep. Wrong. The lock is laughing at you.", "No. Try again, and read the signs.", "Still wrong. Ask someone who's paying attention."],
      ["Bliep. Fout. Het slot lacht je uit.", "Nee. Probeer het nog eens, en lees de bordjes.", "Nog steeds fout. Vraag het aan iemand die oplet."]);
    $("padFb").textContent = L.codeTries >= 3 ? hintFor() : wrong[(L.codeTries - 1) % 3];
    setTimeout(() => { padState.val = []; drawDigits(); }, 500);
  }
}
function padKey(e) {
  const typed = e.key.length === 1 ? e.key.toUpperCase() : "";
  if (["symbols", "count", "clock"].includes(padState.kind) ? e.key >= "0" && e.key <= "9" : padState.keys.some(k => k.v === typed)) padPress(typed);
  else if (e.key === "Backspace") padPress("⌫");
  else if (e.key === "Enter") padPress("OK");
  else if (e.key === "Escape") setScreen("play");
}
$("padClose").onclick = () => setScreen("play");

/* ---------- Confetti (on the canvas) ---------- */
let confettiBits = [];
function confetti(n) { for (let i = 0; i < n; i++) confettiBits.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 300, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6, c: ["#ffd25e", "#ff9b45", "#59c28a", "#5aa8ff", "#ff7aa8"][i % 5] }); }
function drawConfetti() {
  if (!confettiBits.length) return;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (const p of confettiBits) { p.x += p.vx; p.y += p.vy; p.r += .1; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-4, -6, 8, 12); g.restore(); }
  confettiBits = confettiBits.filter(p => p.y < innerHeight + 20);
}

/* ---------- Title screen ---------- */
function portrait(c, i) {
  const cvs = document.createElement("canvas"); cvs.width = 108; cvs.height = 128;
  const ctx = cvs.getContext("2d"); const keep = g;
  g = ctx; g.scale(2, 2); drawPerson(c, 27, 61, 1.12, 1, 0, false, null); g = keep;
  return cvs;
}
function buildTitle() {
  // No dates and no countdown: the title shows how far you are in the week.
  const pr = prog();
  const done = LEVELS.filter((_, i) => pr.best[i] != null).length;
  const next = Math.min(LEVELS.length - 1, LEVELS.findIndex((_, i) => pr.best[i] == null && i + 1 <= pr.unlocked));
  $("eyebrow").textContent = `${T("The Hills × the Woods", "De Hills × de Woods")} · ${REGION.name}`;
  $("regionName").textContent = REGION.name;
  if (done === 0) {
    $("cdNum").textContent = LEVELS.length;
    $("cdWord").textContent = REGION.summer ? T("summer days to scout", "zomerdagen om te verkennen") : T("winter days to scout", "winterdagen om te verkennen");
    $("cdSub").textContent = REGION.blurb;
  } else if (done < LEVELS.length) {
    $("cdNum").textContent = `${done}/${LEVELS.length}`;
    $("cdWord").textContent = T("days scouted", "dagen verkend");
    $("cdSub").textContent = next >= 0 ? `${T("Next", "Volgende")}: ${LEVELS[next].name}` : "";
  } else {
    $("cdNum").textContent = "🏆"; $("cdWord").textContent = T("Trip scouted!", "Reis verkend!"); $("cdSub").textContent = T("Where to next? Open the map 🗺️", "Waar nu heen? Open de kaart 🗺️");
  }
  $("special").hidden = true;
  const wkEl = $("week"); wkEl.innerHTML = "";
  WEEK.forEach((w, i) => {
    const li = document.createElement("li");
    li.className = (i === next && done < LEVELS.length ? "today " : pr.best[i] != null ? "past " : "") + (LEVELS[i].quiet ? "quiet" : "");
    li.innerHTML = `<div class="wd">${w.wd}</div><div class="dd">${i + 1}</div><div class="ic">${w.ic}</div><div class="lb"></div>`;
    li.querySelector(".lb").textContent = w.lb;
    wkEl.appendChild(li);
  });
  const chEl = $("chars"); chEl.innerHTML = "";
  CHARS.forEach((c, i) => {
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(i === save.char));
    b.appendChild(portrait(c, i));
    b.insertAdjacentHTML("beforeend", `<span class="nm"></span><span class="fm"></span>`);
    b.querySelector(".nm").textContent = c.name; b.querySelector(".fm").textContent = c.fam;
    b.onclick = () => { save.char = i; persist(); buildTitle(); tone(660, .06, "triangle", .05); };
    chEl.appendChild(b);
  });
  // Your own hero: the tenth tile. Not made yet: "+ Create". Made: choose it, and press it again to change it.
  const own = document.createElement("button"); own.type = "button"; own.id = "ownHero"; own.className = "own";
  if (save.hero) {
    const me = makeHero(save.hero), on = save.char === "me";
    own.setAttribute("aria-pressed", String(on));
    own.appendChild(portrait(me));
    own.insertAdjacentHTML("beforeend", `<span class="nm"></span><span class="fm"></span>`);
    own.querySelector(".nm").textContent = me.name; own.querySelector(".fm").textContent = on ? T("✏️ change", "✏️ aanpassen") : me.fam;
    own.onclick = () => { if (save.char === "me") return openHero(); save.char = "me"; persist(); buildTitle(); tone(660, .06, "triangle", .05); };
  } else {
    own.setAttribute("aria-pressed", "false");
    own.innerHTML = `<span class="plus">+</span><span class="nm"></span><span class="fm"></span>`;
    own.querySelector(".nm").textContent = T("Your hero", "Jouw held"); own.querySelector(".fm").textContent = T("create", "maken");
    own.onclick = openHero;
  }
  chEl.appendChild(own);
  const lvEl = $("levels"); lvEl.innerHTML = "";
  LEVELS.forEach((d, i) => {
    const b = document.createElement("button"); b.type = "button"; b.disabled = i + 1 > pr.unlocked;
    const isNext = i === next && done < LEVELS.length;
    if (isNext) b.classList.add("today");
    b.innerHTML = `<div class="n">${d.day}${b.disabled ? " · 🔒" : pr.best[i] != null ? " · ✓" : ""}</div><div class="t"></div><div class="s"></div>`;
    b.querySelector(".t").textContent = d.name; b.querySelector(".s").textContent = d.sub;
    b.onclick = () => startLevel(i);
    lvEl.appendChild(b);
  });
}
/* ---------- The map of Europe: choose a region ---------- */
// Coastlines in longitude/latitude, simplified by hand. Projected flat: x = (lon + 25) * cos(52°), y = 72 - lat.
const MAP_W = 431, MAP_H = 380;
const mapXY = (lon, lat) => [((lon + 25) * .616 * 10), ((72 - lat) * 10)];
const COASTS = [
  // mainland Europe, clockwise from Gibraltar
  [[-5.6, 36], [-2, 36.7], [.2, 38.7], [-.3, 39.5], [.9, 40.8], [3.2, 42], [3.1, 43], [4.8, 43.4], [6.5, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9],
  [10.5, 42.9], [12.2, 41.7], [14.2, 40.8], [15.6, 40], [15.7, 38.2], [16.6, 38.4], [17.1, 39], [16.5, 39.7], [17, 40.5], [18.5, 40.1], [18, 40.6],
  [16.1, 41.4], [15, 42], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.6], [13.6, 45.1], [14.4, 45.3], [15.2, 44.3], [16.4, 43.5], [18.1, 42.6],
  [19.4, 41.9], [19.4, 40.4], [20, 39.7], [21.1, 38.3], [21.6, 36.9], [22.9, 36.4], [23.2, 38], [22.9, 39.4], [24, 40.7], [26, 40.9], [26.2, 41.7],
  [28, 41.6], [29, 41.2], [28, 42], [27.9, 43.2], [28.6, 44.3], [29.6, 45.2], [30.7, 46.5], [31.5, 46.6], [33.5, 46], [33.6, 44.5], [36.5, 45.3],
  [35, 46.2], [38, 47.1], [39.3, 47.2], [40, 46.5], [45, 45.5], [45, 66.6], [43, 66.3], [40.2, 64.6], [37.5, 64], [35, 64.4], [34.7, 65.8], [36, 66.2],
  [41, 66.9], [41.3, 67.5], [40, 68.2], [38, 68.8], [33, 69.3], [31, 69.8], [28.5, 70.9], [25.8, 71.1], [23.5, 70.6], [20, 70.1], [17.5, 69.5],
  [15.5, 68.4], [14.5, 67.5], [12.5, 66], [11.5, 64.6], [10, 63.6], [8, 63], [6, 62.4], [5, 61.5], [5, 60], [5.5, 59], [6.5, 58.1], [8, 58.1],
  [9.5, 59], [10.7, 59.9], [11.2, 59.1], [11.6, 58.3], [12.3, 57], [12.8, 56.2], [13.2, 55.4], [14.2, 55.4], [14.5, 56.1], [16, 56.2], [16.5, 57],
  [16.7, 58], [18, 59], [18.8, 59.8], [17.3, 60.6], [17.4, 61.7], [18.5, 62.8], [20.3, 63.8], [21.6, 64.8], [22.5, 65.7], [24.5, 65.8], [25.4, 65],
  [24.5, 64.3], [22.5, 63.4], [21.4, 62.5], [21.5, 61], [21.4, 60.6], [22.9, 59.9], [25, 60.3], [27, 60.5], [28.7, 60.6], [30, 60], [28, 59.5],
  [26, 59.5], [24, 59.4], [23.5, 59], [23.4, 58.2], [24.4, 58.3], [24.2, 57.2], [23, 57], [21.6, 57.5], [21, 56.5], [21.2, 55.6], [20.5, 54.9],
  [19.5, 54.4], [18.6, 54.4], [17, 54.7], [14.4, 53.9], [12.5, 54.4], [11, 54], [10, 54.8], [10.5, 56.5], [10.6, 57.7], [9.5, 57.1], [8.6, 57.1],
  [8.1, 56.5], [8.2, 55.5], [8.6, 54.9], [8.9, 53.9], [7, 53.5], [5.5, 53.4], [4.7, 52.9], [4.2, 52], [3.4, 51.4], [2.5, 51.1], [1.6, 50.9],
  [1.6, 50.2], [.2, 49.7], [-1.3, 49.6], [-1.9, 49.7], [-1.5, 48.7], [-3, 48.8], [-4.7, 48.4], [-4.3, 47.8], [-2.5, 47.3], [-1.2, 46.1], [-1.2, 44.5],
  [-1.8, 43.4], [-3.8, 43.5], [-6, 43.6], [-8, 43.7], [-9.3, 43], [-8.9, 42], [-8.7, 41], [-9.5, 38.8], [-8.8, 37.9], [-9, 37], [-7.4, 37.2], [-6.3, 36.6]],
  // Great Britain, Ireland, Iceland, Sicily, Sardinia, Corsica, Zealand
  [[-5.7, 50.1], [-3.5, 50.3], [-1, 50.8], [1.4, 51.2], [1.7, 52.6], [.3, 53.1], [-.1, 54], [-1.5, 55], [-2, 55.9], [-3, 56.2], [-1.8, 57.5], [-3.4, 58.6],
    [-5, 58.6], [-6.2, 57.5], [-5.6, 56.3], [-4.9, 54.8], [-3.4, 54.9], [-3, 53.4], [-4.6, 53.3], [-4.2, 52.3], [-5.3, 51.8], [-4, 51.6], [-3, 51.4], [-4.2, 51.2]],
  [[-6, 52.2], [-6.2, 53.4], [-6, 54.6], [-7.3, 55.3], [-8.5, 54.4], [-10, 53.5], [-9.6, 52.2], [-10.4, 51.6], [-8, 51.6]],
  [[-22.5, 63.9], [-21, 63.8], [-18.5, 63.4], [-15, 64.2], [-13.6, 65.1], [-14.6, 66.3], [-16.4, 66.5], [-19, 66.1], [-22.4, 66.4], [-24, 65.5], [-22, 64.7], [-23.8, 64.8]],
  [[12.4, 38], [15.6, 38.3], [15.1, 36.7]], [[8.4, 41], [9.8, 41], [9.6, 39.1], [8.4, 39]], [[8.6, 42.9], [9.4, 43], [9.5, 41.4], [8.7, 41.6]],
  [[11.1, 55.9], [12.6, 56], [12.4, 55.2], [11.2, 55.2]]
];
function buildMapSvg() {
  const pts = sh => sh.map(([lo, la]) => mapXY(lo, la).map(v => v.toFixed(1)).join(",")).join(" ");
  const land = COASTS.map(sh => `<polygon points="${pts(sh)}"/>`).join("");
  const soon = SOON.map(p => { const [x, y] = mapXY(p.lon, p.lat); return `<circle class="soon-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"><title>${p.name}</title></circle>`; }).join("");
  return `<svg viewBox="0 0 ${MAP_W} ${MAP_H}" role="img" aria-label="${T("Map of Europe", "Kaart van Europa")}"><rect class="sea" width="${MAP_W}" height="${MAP_H}" rx="14"/><g class="land">${land}</g>${soon}</svg>`;
}
function buildMap() {
  const box = $("mapBox");
  box.innerHTML = buildMapSvg();
  REGIONS.forEach(r => {
    const [x, y] = mapXY(r.lon, r.lat), done = regionDone(r.id), total = r.levels.length;
    const b = document.createElement("button"); b.type = "button"; b.className = "pin" + (r.id === REGION.id ? " here" : "") + (r.labelLeft ? " left" : "");
    b.style.left = (x / MAP_W * 100).toFixed(2) + "%"; b.style.top = (y / MAP_H * 100).toFixed(2) + "%";
    // labelDy: nudge a label up (−) or down (+), as a share of its height, where places are close together (Tirol, Veneto, Dalmatia)
    if (r.labelDy) b.style.transform = `translate(${r.labelLeft ? "calc(-100% + 14px)" : "-14px"}, ${(-50 + r.labelDy * 100).toFixed(0)}%)`;
    b.dataset.region = r.id;
    b.innerHTML = `<span class="dot">${r.icon}</span><span class="lbl"><b></b><small></small></span>`;
    b.querySelector("b").textContent = (r.offMap ? "↑ " : "") + r.name;
    b.querySelector("small").textContent = done >= total ? T("✓ all done", "✓ alles gehaald") : done ? `${done}/${total}` : T(`${total} days`, `${total} dagen`);
    b.setAttribute("aria-label", `${r.name}: ${r.blurb}`);
    b.onclick = () => { setRegion(r.id, true); tone(660, .06, "triangle", .05); toTitle(); };
    b.onfocus = b.onmouseenter = () => mapInfo(r);
    box.appendChild(b);
  });
  mapInfo(REGION);
  $("mapSoon").textContent = T(`Coming later: ${SOON.map(p => p.name).join(", ")}.`, `Later erbij: ${SOON.map(p => p.name).join(", ")}.`);
}
/** The text next to the map: the region that has focus (or the one you are in). */
function mapInfo(r) { $("mapInfo").innerHTML = `<b>${r.icon} ${r.name}</b><br>${r.blurb}`; }
function openMap() { hideDialog(); dialog = null; buildMap(); setScreen("map"); }
$("regionBtn").onclick = openMap;
$("mapClose").onclick = toTitle;

let jokeOrder = [];
function nextJoke() {
  if (!jokeOrder.length) jokeOrder = JOKES.map((_, i) => i).sort(() => Math.random() - .5);
  $("ticker").textContent = JOKES[jokeOrder.pop()];
}
$("ticker").onclick = nextJoke;
setInterval(() => { if (state === "title") nextJoke(); }, 9000);

$("hMenu").onclick = toTitle;
$("hSound").onclick = () => { muted = !muted; $("hSound").textContent = muted ? "🔇" : "🔊"; };
