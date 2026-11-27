"use strict";
// Start het spel: versie, service worker, updatebalk en de spellus.

/** Staat op het titelscherm. Altijd hetzelfde getal als CACHE in sw.js (tests/pwa.spec.js controleert dat). */
const GAME_VERSION = 97;
$("version").textContent = "v" + GAME_VERSION;
if (legacyMenu) $("update-bar").hidden = false;

/* ---------- Installeerbare app en updates ---------- */
/** De service worker vertelt welke versie hij serveert; is die nieuwer dan deze pagina, dan bieden we herladen aan. */
function swVersion(cache) {
  const n = +String(cache).replace(/^cabinweek-v/, "");
  if (n > GAME_VERSION) $("update-bar").hidden = false;
}
$("update-reload").onclick = () => { persist(); location.reload(); };
// Alleen als echte site (niet in een los bestand of als artifact zonder manifest).
// Niet in de Google TV-app: die heeft het spel al in zich (appassets.androidplatform.net).
if ("serviceWorker" in navigator && document.querySelector('link[rel="manifest"]') && /^https?:$/.test(location.protocol) && location.hostname !== "appassets.androidplatform.net") {
  navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.type === "version") swVersion(e.data.cache); });
  navigator.serviceWorker.register("sw.js").catch(() => {});
  navigator.serviceWorker.ready.then(r => r.active && r.active.postMessage({ type: "version?" })).catch(() => {});
}

/* ---------- Meldingen: installeren als app, en het scherm draaien ---------- */
// Niet in de Google TV-app en niet als het spel al als app draait.
const IN_TV_APP = location.hostname === "appassets.androidplatform.net";
// In the Android app a link that opens a new window goes nowhere: show the source and the licence as plain text there.
if (IN_TV_APP) $("credits").textContent = T("Source: github.com/w3nl/tripscouts · Licence: GPL-3.0", "Broncode: github.com/w3nl/tripscouts · Licentie: GPL-3.0");
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_ANDROID = /Android/i.test(navigator.userAgent);
const IS_CHROMEOS = /\bCrOS\b/.test(navigator.userAgent);
const IS_CHROME = /(?:Chrome|Chromium)\//.test(navigator.userAgent) && !/(?:Android|Edg\/|OPR\/|CriOS\/)/.test(navigator.userAgent);
const IS_APP = () => matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
let installEvt = null, installOffer = false, installManual = false, playClicked = false, rotateClosed = false, rotateTimer = 0;
/** De tekst en knoppen van de installeerbalk: de web-app, de Chrome-extensie en op Android ook de app uit Google Play. */
function installChoice() {
  const web = !!installEvt;
  $("installBtn").hidden = !web;
  $("installBtn").textContent = IS_ANDROID ? T("Web app", "Web-app") : T("Install", "Installeren");
  $("installPlay").hidden = !IS_ANDROID;
  $("installChrome").hidden = !IS_CHROME;
  $("installText").textContent = IS_IOS ? T("📲 Put the game on your home screen: tap Share, then Add to Home Screen.", "📲 Zet het spel op je beginscherm: tik op Deel en dan op Zet op beginscherm.")
    : IS_ANDROID && web ? T("📲 Play as an app: add the web app to your home screen, or get the Android app from Google Play.", "📲 Speel als app: zet de web-app op je beginscherm, of haal de Android-app uit Google Play.")
    : IS_ANDROID ? T("📲 Play as an app: get the Android app from Google Play, or add the game to your home screen from the browser menu.", "📲 Speel als app: haal de Android-app uit Google Play, of zet het spel via het browsermenu op je beginscherm.")
    : IS_CHROME && web ? T("📲 Add TripScouts to Chrome: get the extension, or install the web app for offline play.", "📲 Zet TripScouts in Chrome: haal de extensie op, of installeer de web-app om offline te spelen.")
    : IS_CHROME ? T("📲 Add TripScouts to Chrome: get the extension, or use Chrome's menu to install the web app for offline play.", "📲 Zet TripScouts in Chrome: haal de extensie op, of installeer de web-app via het Chrome-menu om offline te spelen.")
    : T("📲 Put TripScouts on your home screen: play with one tap, even offline.", "📲 Zet TripScouts op je beginscherm: met één tik spelen, ook zonder internet.");
}
function installLater() { try { return Date.now() < +(localStorage.getItem("cabin-week-install-later") || 0); } catch (e) { return false; } }
/** Zet de meldingen aan of uit, passend bij het scherm (aangeroepen vanuit setScreen() en bij draaien). */
function updateHints() {
  const inst = $("installBar"), rot = $("rotateHint");
  if (state !== "settings") installManual = false;
  if (inst) {
    inst.hidden = !(installOffer && !playClicked && !IS_APP() && !IN_TV_APP && ((state === "title" && !installLater()) || (state === "settings" && installManual)));
    if (!legacyMenu) $("installAgain").hidden = !(IS_IOS || IS_ANDROID) || IS_APP() || IN_TV_APP || !inst.hidden;
  }
  // Draaien: alleen op een aanraakscherm dat rechtop staat, in het menu of tijdens het spelen.
  if (rot) {
    rot.hidden = !(isTouch && innerHeight > innerWidth && !rotateClosed && (state === "title" || state === "play") && !dialog);
    // Tijdens het spelen: net onder de bovenbalk, en na 6 seconden vanzelf weg (hij komt terug in het menu).
    const hud = $("hud");
    rot.style.top = !rot.hidden && state === "play" && !hud.hidden ? Math.round(hud.getBoundingClientRect().bottom + 8) + "px" : "";
    clearTimeout(rotateTimer);
    if (!rot.hidden && state === "play") rotateTimer = setTimeout(() => { rot.hidden = true; }, 6000);
  }
}
// Android en Chrome: de browser biedt installeren aan; wij tonen een eigen balk met een knop.
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; installOffer = true; installChoice(); updateHints(); });
addEventListener("appinstalled", () => { installOffer = false; installManual = false; installEvt = null; updateHints(); });
// iPhone en iPad: Safari heeft geen installeerknop, dus uitleg in één zin.
// Android: meteen de keuze voor de Android-app uit Google Play (de web-app-knop komt erbij zodra de browser die aanbiedt).
if ((IS_IOS || IS_ANDROID || (IS_CHROMEOS && location.protocol !== "chrome-extension:")) && !IS_APP() && !IN_TV_APP) installOffer = true;
installChoice();
if (!legacyMenu) $("installAgain").onclick = () => { installManual = true; installOffer = true; playClicked = false; installChoice(); updateHints(); };
$("installPlay").onclick = () => { playClicked = true; setTimeout(updateHints, 0); };
$("installBtn").onclick = async e => {
  if (!installEvt) return;
  if (!e.isTrusted) {
    $("installText").textContent = T("To install, open Chrome’s ⋮ menu and choose “Install TripScouts” or “Add to Home screen”.", "Open het ⋮-menu van Chrome en kies ‘TripScouts installeren’ of ‘Toevoegen aan startscherm’.");
    return;
  }
  installEvt.prompt();
  try { await installEvt.userChoice; } catch (e) {}
  installEvt = null; installOffer = false; updateHints();
};
$("installClose").onclick = () => { installManual = false; try { localStorage.setItem("cabin-week-install-later", String(Date.now() + 14 * 864e5)); } catch (e) {} updateHints(); };
$("rotateClose").onclick = () => { rotateClosed = true; updateHints(); };
// Language: English or Dutch (see i18n.js); the current one is marked.
document.querySelectorAll("[data-lang]").forEach(b => { b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)); b.onclick = () => setLang(b.dataset.lang); });
addEventListener("resize", updateHints);

/* =====================================================================
   LUS
   ===================================================================== */
// Het spel rekent in vaste stappen van 1/60 s. Het scherm ververst niet altijd precies zo vaak (een tv op 50 Hz,
// of een trager toestel dat een beeld overslaat); dan krijgt het ene beeld twee stappen en het volgende geen, en
// hapert het lopen. Daarom tekenen we het poppetje, de vijanden en de camera op de tussenstand tussen de laatste
// twee stappen (interpolatie). De spelregels blijven precies hetzelfde; alleen het tekenen is vloeiender.
const STEP_MS = 1000 / 60;
let last = 0, last2 = 0, acc = 0, simT = 0;
const before = { L: null, x: 0, y: 0, cam: 0, en: [] };
function snapshot() {
  before.L = L;
  if (!L || !P) return;
  before.x = P.x; before.y = P.y; before.cam = cam;
  before.en = L.enemies.map(e => [e.x, e.y]);
  before.mv = L.movers.map(m => [m.x, m.y]);
}
function renderSmooth(a) {
  if (!L || !P || before.L !== L || state !== "play") { render(); return; }
  // Een sprong van meer dan anderhalve tegel (opnieuw beginnen, een nieuw level) tekenen we niet als beweging.
  const mix = (b, n) => Math.abs(n - b) > 48 ? n : b + (n - b) * a;
  const now = { x: P.x, y: P.y, cam }, en = L.enemies.map(e => [e.x, e.y]);
  const same = before.en.length === en.length;
  P.x = mix(before.x, now.x); P.y = mix(before.y, now.y); cam = mix(before.cam, now.cam);
  if (same) L.enemies.forEach((e, i) => { e.x = mix(before.en[i][0], en[i][0]); e.y = mix(before.en[i][1], en[i][1]); });
  const mv = L.movers.map(m => [m.x, m.y]), mvSame = before.mv && before.mv.length === mv.length;
  if (mvSame) L.movers.forEach((m, i) => { m.x = mix(before.mv[i][0], mv[i][0]); m.y = mix(before.mv[i][1], mv[i][1]); });
  try { render(); } finally {
    P.x = now.x; P.y = now.y; cam = now.cam;
    if (same) L.enemies.forEach((e, i) => { e.x = en[i][0]; e.y = en[i][1]; });
    if (mvSame) L.movers.forEach((m, i) => { m.x = mv[i][0]; m.y = mv[i][1]; });
  }
}
/* ---------- Graphics (settings): the #gfxBtn cycles auto → sharp → smooth (see resize() in canvas.js) ---------- */
// (an older cached page has no #gfxBtn: then graphics stay on auto)
function showGfx() {
  const b = $("gfxBtn");
  if (!b) return;
  b.textContent = { auto: T("🖼️ Graphics: auto", "🖼️ Beeld: automatisch"), sharp: T("🖼️ Graphics: sharp", "🖼️ Beeld: scherp"), smooth: T("🖼️ Graphics: smooth", "🖼️ Beeld: soepel") }[gfxMode];
  b.title = { auto: T("Sharp, and a little less sharp by itself if the game doesn't run smoothly on this device.", "Scherp, en vanzelf iets minder scherp als het spel op dit apparaat niet soepel loopt."),
    sharp: T("Always as sharp as the screen. Can stutter on TVs and slower phones.", "Altijd zo scherp als het scherm. Kan haperen op tv's en tragere telefoons."),
    smooth: T("Fewer pixels: a little softer, but much smoother on TVs and slower phones.", "Minder pixels: iets zachter, maar veel soepeler op tv's en tragere telefoons.") }[gfxMode];
}
if ($("gfxBtn")) $("gfxBtn").onclick = () => {
  gfxMode = { auto: "sharp", sharp: "smooth", smooth: "auto" }[gfxMode];
  // choosing auto again starts sharp and learns anew
  if (gfxMode === "auto") gfxAuto = 2;
  try { localStorage.setItem(GFX_KEY, gfxMode); localStorage.setItem(GFX_AUTO_KEY, String(gfxAuto)); } catch (e) {}
  resize(); showGfx(); tone(700, .04, "triangle", .04);
};
showGfx();
/* Graphics "auto": while you play, count the frames that come late (more than 22 ms: a missed frame on a 60 Hz screen,
   and on a 50 Hz TV too). If about a third of 3 seconds goes to late frames, draw fewer pixels: one step down
   (GFX_STEPS), remembered per device. It counts in time, not frames, so a slow device gets there just as quickly. Never
   in the first 2 seconds after a level starts or the size changes (caches are being made then), never in the menus or
   a conversation, and not in automated tests (navigator.webdriver), unless a test asks for it (window.__gfxWatch). */
const gfxWatch = { t: 0, late: 0, skip: 2000, state: "", size: 0 };
function watchFrames(dt) {
  // a new screen or a new canvas size (also a window you resize yourself): the caches are made again, so wait a moment
  if (state !== gfxWatch.state || resizes !== gfxWatch.size) { gfxWatch.state = state; gfxWatch.size = resizes; gfxWatch.skip = 2000; gfxWatch.t = gfxWatch.late = 0; }
  // A pause of more than a second is the page waiting (another tab, the device asleep), not a slow frame. Slower frames
  // than that do count, capped, so a device at 10 frames a second or less steps down too.
  if (gfxMode !== "auto" || state !== "play" || dialog || document.hidden || dt > 1000 || (navigator.webdriver && !window.__gfxWatch)) return;
  dt = Math.min(dt, 250);
  if (gfxWatch.skip > 0) { gfxWatch.skip -= dt; return; }
  gfxWatch.t += dt; if (dt > 22) gfxWatch.late += dt;
  if (gfxWatch.t < 3000) return;
  const late = gfxWatch.late / gfxWatch.t;
  gfxWatch.t = gfxWatch.late = 0;
  // late counts the time spent in late frames: at 50 fps a fifth of the frames late is about a third of the time
  if (late <= .3) return;
  const next = GFX_STEPS.find(r => r < renderRatio - .01);
  if (!next) return;
  gfxAuto = next;
  try { localStorage.setItem(GFX_AUTO_KEY, String(gfxAuto)); } catch (e) {}
  resize(); gfxWatch.skip = 2000;
}
function loop(ts) {
  const dt = Math.min(100, ts - (last || ts)); last = ts; acc += dt;
  watchFrames(ts - (last2 || ts)); last2 = ts;
  pollGamepads();
  // simT is het moment van de laatste stap; elke stap verwerkt de knoppen tot en met zijn eigen moment (applyHolds).
  if (!simT || Math.abs(ts - acc - simT) > 3 * STEP_MS) {
    // Speltijd overgeslagen (een druk toestel, of een tabblad op de achtergrond): schuif het loslaten van knoppen die nu
    // ingedrukt zijn even ver op, zodat een tikje in het spel even lang duurt als in het echt.
    if (simT) shiftHolds(ts - acc - simT);
    simT = ts - acc;
  }
  while (acc >= STEP_MS) { simT += STEP_MS; applyHolds(simT); snapshot(); step(); acc -= STEP_MS; }
  renderSmooth(acc / STEP_MS); drawConfetti();
  requestAnimationFrame(loop);
}
buildTitle(); nextJoke(); setScreen("title");
saveFromLink();
document.documentElement.classList.add("ready");
requestAnimationFrame(loop);
