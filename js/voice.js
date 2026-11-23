"use strict";
// Optional voices, like in the escape rooms: every dialogue line is read aloud with the browser's own speech
// (Web Speech API: speechSynthesis and SpeechSynthesisUtterance). Off by default; the Voices button in settings
// turns it on, saved per device in localStorage['cabin-week-voice']. say() and advanceDialog() in game.js call
// speakLine(); hideDialog() stops it. The button stays hidden where the browser cannot speak (often in an Android
// WebView, so in the Android app). Loaded after hero.js.
const VOICE_KEY = "cabin-week-voice";
const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let voiceOn = (() => { try { return localStorage.getItem(VOICE_KEY) === "1"; } catch (e) { return false; } })();

/* How someone sounds: like who they are. A young girl sounds like a young girl, a grown man like a grown man. Each of the
   nine (and your own hero) has a voice (f or m, in CHARS) and an age group (kid, teen, grown-up). We pick a female or a
   male voice of the device where it has one (browsers don't say which is which, so voiceGender() guesses from the
   voice's name), and set the pitch for the age: kids highest, then teens, then grown-ups. Where the device has only one
   kind, the pitch does more of the work. Everything else (signs, bells, letters, the church) is the narrator. */
const VOICE_PITCH = {
  //            right kind of voice      only the other kind
  f: { kid: [1.5, 1.08], teen: [1.25, 1.04], adult: [1.05, .98], other: { kid: 1.9, teen: 1.7, adult: 1.5 } },
  m: { kid: [1.6, 1.08], teen: [1.2, 1.03], adult: [.85, .96], other: { kid: 1.3, teen: 1, adult: .55 } }
};
function whoSpeaks(name) {
  const i = CHARS.findIndex(c => c.name === name);
  if (i >= 0) return { c: CHARS[i], i };
  const h = typeof save !== "undefined" && save.hero && typeof makeHero === "function" ? makeHero(save.hero) : null;
  return h && h.name === name ? { c: h, i: 9 } : null;
}
function voiceStyle(name, calm) {
  if (calm) return { pitch: .95, rate: .85, slot: 0, kind: null };
  const w = whoSpeaks(name);
  if (!w) return { pitch: 1, rate: 1, slot: 0, kind: null };
  const { c, i } = w, kind = c.voice === "m" ? "m" : "f", age = c.kid ? "kid" : c.size < .93 ? "teen" : "adult";
  const [pitch, rate] = VOICE_PITCH[kind][age];
  // a small difference per person, so two kids or two grown-ups don't sound the same
  const d = ((i * 7) % 5 - 2) * .03;
  return { pitch: pitch + d, rate, slot: i, kind, age, other: VOICE_PITCH[kind].other[age] + d };
}

/* Is a device voice female or male? Guessed from its name ("Google UK English Female", "Microsoft Ryan", "Daniel"). */
const VOICE_F = /female|woman|girl|vrouw|samantha|karen|moira|tessa|serena|kate|stephanie|fiona|victoria|allison|ava|susan|zira|hazel|libby|sonia|maisie|mia|abbi|bella|hollie|olivia|emily|amy|martha|claire|ellen|fenna|colette|lotte|laura|anna|sara|google (uk english female|nederlands)/i;
const VOICE_M = /\bmale|\bman\b|boy|daniel|arthur|oliver|george|ryan|thomas|alfie|elliot|ethan|noah|james|fred|alex\b|david|mark|guy|rhys|xander|maarten|frank|ruben|lucas|bram|google uk english male/i;
function voiceGender(v) { const n = v.name || ""; return VOICE_F.test(n) && !/\bmale|\bman\b/i.test(n.replace(/female/i, "")) ? "f" : VOICE_M.test(n) ? "m" : null; }

/* The device's voices for the current language: British English or Dutch, falling back to any English voice. */
function voicesFor(lang) {
  const all = speechSynthesis.getVoices();
  if (lang === "nl") return all.filter(v => /^nl/i.test(v.lang));
  const gb = all.filter(v => /^en[-_]GB/i.test(v.lang));
  return gb.length ? gb : all.filter(v => /^en/i.test(v.lang));
}

function speakLine(name, text, calm) {
  if (!canSpeak || !voiceOn) return;
  speechSynthesis.cancel();
  // emoji and arrows are for the eyes: leave them out of the speech
  const clean = String(text).replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\uFE0F\u200D]/gu, " ").replace(/…/g, "... ").replace(/\s+/g, " ").trim();
  if (!/[\p{L}\p{N}]/u.test(clean)) return;
  const u = new SpeechSynthesisUtterance(clean), st = voiceStyle(name, calm), vs = voicesFor(LANG);
  u.lang = LANG === "nl" ? "nl-NL" : "en-GB";
  let pitch = st.pitch;
  if (vs.length) {
    if (st.kind) {
      // a voice of the right kind; if the device has none, another voice with the pitch moved further
      const mine = vs.filter(v => voiceGender(v) === st.kind), unknown = vs.filter(v => !voiceGender(v));
      const pool = mine.length ? mine : unknown.length ? unknown : vs;
      if (!mine.length && !unknown.length) pitch = st.other;
      u.voice = pool[st.slot % pool.length];
    } else u.voice = vs.find(v => v.default) || vs[0];
  }
  u.pitch = Math.max(0, Math.min(2, pitch)); u.rate = st.rate; u.volume = .9;
  speaking = u;
  speechSynthesis.speak(u);
}
let speaking = null; // the line being spoken now
/** Stop the voice. soft (you walked away): browsers can't turn a line down while it plays, so let it trail off: stop at
    the next word after a moment, and at the latest after about a second. Otherwise (a new line, the menu): stop now. */
function stopSpeaking(soft) {
  if (!canSpeak) return;
  if (!soft || !speaking) { speaking = null; speechSynthesis.cancel(); return; }
  const u = speaking, t0 = performance.now();
  const end = () => { if (speaking === u) { speaking = null; speechSynthesis.cancel(); } };
  u.onboundary = () => { if (performance.now() - t0 > 350) end(); };
  u.onend = () => { if (speaking === u) speaking = null; };
  setTimeout(end, 1100);
}

/* ---------- the Voices button (title screen) ---------- */
function showVoice() {
  const b = $("voiceBtn");
  b.hidden = !canSpeak;
  b.textContent = voiceOn ? T("🔊 Voices on", "🔊 Stemmen aan") : T("🔈 Voices off", "🔈 Stemmen uit");
  b.setAttribute("aria-pressed", String(voiceOn));
  b.title = T("Reads the conversations aloud with the voices on your device.", "Leest de gesprekken voor met de stemmen op je apparaat.");
}
$("voiceBtn").onclick = () => {
  voiceOn = !voiceOn;
  try { localStorage.setItem(VOICE_KEY, voiceOn ? "1" : "0"); } catch (e) {}
  showVoice(); tone(700, .04, "triangle", .04);
  if (voiceOn) speakLine("Paul", T("Voices on. Let's go scouting!", "Stemmen aan. Op verkenning!"));
  else stopSpeaking();
};
if (canSpeak) speechSynthesis.getVoices(); // some browsers only load their voices after the first ask
showVoice();
