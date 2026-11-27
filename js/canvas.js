"use strict";
// Het tekenvel, de schaal en kleine teken-hulpjes. Alles tekent op de globale g.
/* =====================================================================
   CANVAS
   ===================================================================== */
const TS = 32, ROWS = 15, VIEW_H = ROWS * TS;
const cv = document.getElementById("cv");
// Ondoorzichtig: het spel tekent altijd het hele scherm, dus de browser hoeft niets te mengen met wat erachter ligt.
let g = cv.getContext("2d", { alpha: false });
let scale = 1, viewW = 800, dpr = 1;
/* Graphics (settings, #gfxBtn): how many pixels the game draws. "sharp" uses the screen's own pixels (up to 2 per CSS
   pixel); "smooth" draws one pixel per CSS pixel, at most 720 rows, and lets the browser scale it up: up to four times
   fewer pixels, much smoother on TVs and slower phones, a little softer. "auto" starts sharp and goes down a step
   (GFX_STEPS) when frames come late while you play (watchFrames() in app.js); the step is remembered per device. */
const GFX_KEY = "cabin-week-graphics", GFX_AUTO_KEY = "cabin-week-graphics-auto", GFX_STEPS = [2, 1.5, 1, .75];
let gfxMode = (() => { try { const m = localStorage.getItem(GFX_KEY); return m === "sharp" || m === "smooth" ? m : "auto"; } catch (e) { return "auto"; } })();
let gfxAuto = (() => { try { const r = +localStorage.getItem(GFX_AUTO_KEY); return GFX_STEPS.includes(r) ? r : 2; } catch (e) { return 2; } })();
let renderRatio = 1, resizes = 0; // resizes counts the size changes (watchFrames() waits a moment after one)
function resize() {
  resizes++;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  renderRatio = gfxMode === "sharp" ? dpr : gfxMode === "smooth" ? Math.min(dpr, 1, 720 / innerHeight) : Math.min(dpr, gfxAuto);
  cv.width = Math.round(innerWidth * renderRatio); cv.height = Math.round(innerHeight * renderRatio);
  scale = cv.height / VIEW_H; viewW = cv.width / scale;
  // fewer pixels than the screen has: let the browser scale up smoothly instead of in blocks
  document.documentElement.classList.toggle("lowres", renderRatio < dpr - .01);
}
addEventListener("resize", resize); resize();

/* Het menu in de breedte: op een scherm dat breder is dan hoog (computer, tv, telefoon of tablet gedraaid) is het
   menu ontworpen op 960×540 (de Google TV) en schaalt het mee (--fit), zodat alles in beeld past zonder scrollen.
   Rechtop blijft het één kolom die je scrolt. */
function fitMenu() {
  const wide = innerWidth > innerHeight && innerWidth >= 560;
  document.documentElement.classList.toggle("wide", wide);
  document.documentElement.style.setProperty("--fit", Math.min(1.6, innerWidth / 960, innerHeight / 540).toFixed(4));
}
addEventListener("resize", fitMenu); fitMenu();

const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const $ = id => document.getElementById(id);
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
// Emoji één keer als plaatje tekenen (op de echte schermgrootte) en daarna alleen kopiëren: kleuremoji tekenen is
// op Android en tv's traag, en er staan vaak tientallen frietjes of koekjes in beeld.
const EMOJI_CACHE = new Map();
function emoji(ch, x, y, size) {
  const m = g.getTransform ? g.getTransform() : null, k = m ? Math.round(Math.hypot(m.a, m.b) * 100) / 100 : 0;
  if (!k || k > 8) { g.font = `${size}px ${EMOJI_FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, x, y); return; }
  const key = ch + "|" + size + "|" + k + "|" + g.fillStyle;
  let c = EMOJI_CACHE.get(key);
  if (!c) {
    const side = Math.ceil(size * 1.6 * k) + 4;
    c = mk(side, side);
    const cx = c.getContext("2d");
    cx.font = `${size * k}px ${EMOJI_FONT}`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillStyle = g.fillStyle;
    cx.fillText(ch, side / 2, side / 2);
    if (EMOJI_CACHE.size > 400) EMOJI_CACHE.clear();
    EMOJI_CACHE.set(key, c);
  }
  const s = c.width / k;
  g.drawImage(c, x - s / 2, y - s / 2, s, s);
}
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }

/* ---------- Teken-hulpjes ---------- */
const OUT = "#1e1622";
function mk(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function withCtx(ctx, fn) { const keep = g; g = ctx; try { fn(); } finally { g = keep; } }
function shade(hex, a) {
  const n = parseInt(hex.slice(1), 16); const ch = [n >> 16, (n >> 8) & 255, n & 255];
  const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)));
  return `rgb(${f(ch[0])},${f(ch[1])},${f(ch[2])})`;
}
function rp(x, y, w, h, r) { g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); }
function blob(fill, fn, stroke = true) { g.beginPath(); fn(); g.fillStyle = fill; g.fill(); if (stroke) g.stroke(); }
function sparkle(x, y, s, a) {
  g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = "#fffbe0";
  g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .25 : s; const an = i * Math.PI / 4; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.fill(); g.restore();
}
