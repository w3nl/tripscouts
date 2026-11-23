"use strict";
// Optional background sounds that fit the place, like in the escape rooms: wind in the snow, birds in the summer forest,
// waves at the coast, the river, a crackling fire indoors, drips in the cave, bells in town, cicadas in the south.
// All made with Web Audio (no sound files): a steady bed of filtered noise that swells slowly, plus little sounds now and
// then. Off by default; the Ambience button in settings (#ambBtn) turns it on, saved per device in
// localStorage['cabin-week-ambience']. It plays in a level (also during the intro, the code lock and the card) and stops
// on the title screen, the map and the hero creator (ambFollow() from setScreen()). Loaded after voice.js.
const AMB_KEY = "cabin-week-ambience";
let ambOn = (() => { try { return localStorage.getItem(AMB_KEY) === "1"; } catch (e) { return false; } })();
let AMB = null; // { kind, master, beds: [], timer }

/** Which sounds fit this level: the place (theme, scene) and what is in it (water, river, darkness, weather). */
function ambKind(d) {
  if (!d) return null;
  const k = { beds: [], events: [] };
  const sc = d.scene || "", th = d.theme, summer = !!d.summer, night = !!d.dark;
  if (th === "huis") { k.beds.push("room"); k.events.push("crackle", "crackle", "clock"); return k; }
  if (th === "grot") { k.beds.push("cave"); k.events.push("drip", "drip", "drip"); return k; }
  if (d.river) k.beds.push("river");
  if (th === "kust" || d.water || d.swim || d.movers === "boat" || d.movers === "floe" || /adriatic|laguna|duinen|venezia|burano|fjord/.test(sc)) k.beds.push("waves");
  if (summer) {
    k.beds.push("breeze");
    if (th === "straat") k.events.push("bells", "coo", "bike");
    else if (night) k.events.push("cricket", "cricket", "owl");
    else k.events.push("bird", "bird", "bird");
    if (/ardeche|adriatic|verona/.test(sc) || (th === "kust" && !/laguna|duinen/.test(sc))) k.beds.push("cicadas");
    if (k.beds.includes("waves")) k.events.push("gull");
    if (/dolomiti|highlands/.test(sc)) k.events.push("cowbell");
    if (d.weather) k.beds.push("shower");
  } else {
    k.beds.push(th === "stad" ? "breeze" : "wind");
    if (th === "stad") k.events.push("bells", "bells", "chatter");
    if (d.enemy === "duif") k.events.push("coo"); // city pigeons (Amsterdam)
    else if (sc === "pole" || sc === "fjord") k.events.push("ice", "crow");
    else if (sc === "alps") k.events.push("cowbell", "crow");
    else k.events.push(night ? "owl" : "crow", "owl");
    if (d.wind) k.beds.push("wind");
  }
  if (d.quiet) k.events = ["bells"]; // the quiet day: only far-off bells, no chatter
  return k;
}

function ambAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); return actx; } catch (e) { return null; } }

/* ---------- the steady beds: looping noise through a filter, swelling slowly ---------- */
const AMB_BEDS = {
  //       filter      freq  q    volume swell(Hz) swell depth
  wind:    ["bandpass", 420, .8,  .10, .07, .7],
  breeze:  ["bandpass", 900, .5,  .035, .05, .6],
  waves:   ["lowpass",  520, .7,  .12, .11, .85],
  river:   ["bandpass", 1100, .6, .07, .3, .15],
  room:    ["lowpass",  180, .7,  .05, .02, .2],
  cave:    ["lowpass",  110, 1,   .09, .03, .4],
  shower:  ["highpass", 2400, .5, .05, .04, .3],
  cicadas: null
};
function ambNoiseBuffer(a) {
  if (!NOISE || NOISE.sampleRate !== a.sampleRate) { NOISE = a.createBuffer(1, a.sampleRate, a.sampleRate); const ch = NOISE.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  return NOISE;
}
function ambBed(a, name, out) {
  const t = a.currentTime, nodes = [];
  if (name === "cicadas") {
    // a high buzz that pulses: a sawtooth whose volume is shaken quickly
    const o = a.createOscillator(), am = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(), v = a.createGain(), hp = a.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.value = 4400; hp.type = "highpass"; hp.frequency.value = 3500;
    lfo.frequency.value = 38; lg.gain.value = .5; am.gain.value = .5; v.gain.value = .008;
    lfo.connect(lg).connect(am.gain); o.connect(hp).connect(am).connect(v).connect(out);
    o.start(t); lfo.start(t); nodes.push(o, lfo);
    return nodes;
  }
  const [type, f, q, vol, swell, depth] = AMB_BEDS[name];
  const s = a.createBufferSource(), bq = a.createBiquadFilter(), gn = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
  s.buffer = ambNoiseBuffer(a); s.loop = true; bq.type = type; bq.frequency.value = f; bq.Q.value = q;
  gn.gain.value = vol * (1 - depth / 2); lfo.frequency.value = swell; lg.gain.value = vol * depth / 2;
  lfo.connect(lg).connect(gn.gain); s.connect(bq).connect(gn).connect(out);
  // waves and wind also move their filter a little, so they whoosh
  if (name === "waves" || name === "wind") { const fg = a.createGain(); fg.gain.value = f * .5; lfo.connect(fg).connect(bq.frequency); }
  s.start(t, Math.random()); lfo.start(t); nodes.push(s, lfo);
  if (name === "shower") nodes.shower = gn; // turned up and down with the Scottish weather
  return nodes;
}

/* ---------- the little sounds now and then ---------- */
function ambNote(f, f2, d, type, vol, delay = 0, vib = 0, depth = 0) {
  const a = AMB && ambAudio(); if (!a) return;
  const t0 = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0); if (f2 !== f) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  if (vib) { const l = a.createOscillator(), lg = a.createGain(); l.frequency.value = vib; lg.gain.value = depth; l.connect(lg).connect(o.frequency); l.start(t0); l.stop(t0 + d + .02); }
  gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(.03, d / 4)); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  o.connect(gn).connect(AMB.master); o.start(t0); o.stop(t0 + d + .02);
}
function ambBurst(d, vol, freq, delay = 0, q = 1) {
  const a = AMB && ambAudio(); if (!a) return;
  const t0 = a.currentTime + delay, s = a.createBufferSource(), bq = a.createBiquadFilter(), gn = a.createGain();
  s.buffer = ambNoiseBuffer(a); bq.type = "bandpass"; bq.frequency.value = freq; bq.Q.value = q;
  gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  s.connect(bq).connect(gn).connect(AMB.master); s.start(t0, Math.random() * .5); s.stop(t0 + d + .02);
}
const ambR = (a, b) => a + Math.random() * (b - a);
const AMB_EVENTS = {
  bird: () => { const n = 2 + Math.floor(ambR(0, 4)), f = ambR(2600, 4200); for (let i = 0; i < n; i++) ambNote(f * ambR(.9, 1.15), f * ambR(1.1, 1.5), ambR(.05, .1), "sine", .02, i * ambR(.09, .14)); },
  crow: () => [0, .35].forEach(t => { ambNote(520, 430, .22, "sawtooth", .012, t, 30, 25); ambBurst(.2, .012, 900, t, 2); }),
  owl: () => { ambNote(420, 380, .35, "sine", .03); ambNote(440, 380, .6, "sine", .03, .55, 4, 6); },
  cricket: () => { for (let i = 0; i < 3; i++) ambNote(4300, 4300, .05, "sine", .01, i * .08); },
  gull: () => [0, .25].forEach((t, i) => ambNote(1400 - i * 80, 900, .22, "triangle", .012, t, 9, 25)),
  coo: () => { ambNote(400, 340, .25, "sine", .02, 0, 12, 12); ambNote(380, 320, .4, "sine", .02, .3, 12, 12); },
  bike: () => [0, .14].forEach(t => { ambNote(2200, 2200, .35, "sine", .012, t); ambNote(3100, 3100, .3, "sine", .008, t); }),
  bells: () => { const base = [392, 330, 294, 262][Math.floor(ambR(0, 4))]; for (let i = 0; i < 3; i++) { const f = base * [1, .84, .75][i]; ambNote(f, f, 2.6, "sine", .02, i * .9); ambNote(f * 2.4, f * 2.4, 1.2, "sine", .006, i * .9); } },
  cowbell: () => [0, .3, .45].forEach(t => { ambNote(820, 800, .4, "square", .004, t); ambNote(545, 540, .5, "triangle", .01, t); }),
  chatter: () => { for (let i = 0; i < 5; i++) ambNote(ambR(160, 320), ambR(140, 300), ambR(.12, .25), "sawtooth", .003, i * ambR(.12, .2)); ambBurst(.8, .008, 600, 0, .5); },
  ice: () => { ambBurst(.08, .03, 2400, 0, 3); ambNote(180, 60, .4, "sine", .02, .02); },
  crackle: () => { for (let i = 0, n = 2 + Math.floor(ambR(0, 5)); i < n; i++) ambBurst(.02, .03, ambR(1800, 4500), i * ambR(.04, .15), 4); },
  clock: () => { for (let i = 0; i < 4; i++) ambBurst(.015, .02, i % 2 ? 3200 : 2600, i * .5, 8); },
  drip: () => { const f = ambR(900, 1600), d = ambR(0, .2); ambNote(f, f * 1.8, .07, "sine", .03, d); ambNote(f, f * 1.8, .07, "sine", .009, d + .23); ambNote(f, f * 1.8, .07, "sine", .004, d + .46); }
};

/* ---------- start, stop, and following the screens ---------- */
function ambStop() {
  if (!AMB) return;
  const a = actx, m = AMB.master, beds = AMB.beds;
  clearInterval(AMB.timer); AMB = null;
  try { m.gain.setTargetAtTime(.0001, a.currentTime, .4); setTimeout(() => { beds.forEach(n => { try { n.stop(); } catch (e) {} }); try { m.disconnect(); } catch (e) {} }, 1600); } catch (e) {}
}
function ambStart(d) {
  const k = ambKind(d), key = d && JSON.stringify(k) + d.name;
  if (AMB && AMB.key === key) return;
  ambStop();
  if (!k || !ambOn || muted) return;
  const a = ambAudio(); if (!a) return;
  try {
    const master = a.createGain(); master.gain.setValueAtTime(.0001, a.currentTime); master.gain.setTargetAtTime(.7, a.currentTime, .8); master.connect(a.destination);
    AMB = { key, k, master, beds: [], shower: null, wait: ambR(2, 5) };
    for (const b of new Set(k.beds)) { const n = ambBed(a, b, master); AMB.beds.push(...n); if (n.shower) AMB.shower = n.shower; }
    // every quarter of a second: perhaps a little sound, and the shower follows the weather
    AMB.timer = setInterval(ambTick, 250);
  } catch (e) { AMB = null; }
}
function ambTick() {
  if (!AMB) return;
  if (AMB.shower && typeof weatherPhase === "function" && L && L.d && L.d.weather) {
    try { AMB.shower.gain.setTargetAtTime(weatherPhase() === 2 ? .06 : .0001, actx.currentTime, .8); } catch (e) {}
  }
  if ((AMB.wait -= .25) > 0 || !AMB.k.events.length || document.hidden) return;
  AMB.wait = ambR(3, 9);
  const ev = AMB.k.events[Math.floor(Math.random() * AMB.k.events.length)];
  try { AMB_EVENTS[ev](); } catch (e) {}
}
/** Called by setScreen(): play in a level, quiet in the menus. */
function ambFollow(s) {
  if (s === "title" || s === "map" || s === "hero" || !L) ambStop();
  else ambStart(L.d);
}
addEventListener("visibilitychange", () => { if (document.hidden) ambStop(); else if (typeof state !== "undefined") ambFollow(state); });

/* ---------- the Ambience button (title screen) ---------- */
function showAmb() {
  const b = $("ambBtn");
  b.textContent = ambOn ? T("🌲 Ambience on", "🌲 Sfeergeluid aan") : T("🌲 Ambience off", "🌲 Sfeergeluid uit");
  b.setAttribute("aria-pressed", String(ambOn));
  b.title = T("Background sounds that fit the place: wind, birds, waves, a crackling fire.", "Achtergrondgeluiden die bij de plek passen: wind, vogels, golven, een knapperend vuur.");
}
$("ambBtn").onclick = () => {
  ambOn = !ambOn;
  try { localStorage.setItem(AMB_KEY, ambOn ? "1" : "0"); } catch (e) {}
  showAmb(); tone(700, .04, "triangle", .04);
  // a little taste of it on the title screen
  if (ambOn) { const a = ambAudio(); if (a) { AMB = AMB || { key: "taste", k: { events: [] }, master: a.createGain(), beds: [], wait: 9 }; AMB.master.gain.value = .7; AMB.master.connect(a.destination); AMB_EVENTS.bird(); setTimeout(() => { if (AMB && AMB.key === "taste") ambStop(); }, 1500); } }
  else ambStop();
};
showAmb();
