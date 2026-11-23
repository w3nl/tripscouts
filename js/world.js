"use strict";
// De wereld tekenen: texturen, achtergronden, interieur, decoratie, uitgangen en render().
/* =====================================================================
   TEKENEN
   ===================================================================== */
const pxr = (x, y, w = 1, h = 1) => g.fillRect(x * 2, y * 2, w * 2, h * 2);
const fl = Math.floor;

/* ---------- Tegel-texturen (pixel-art, 1x gemaakt, scherp opgeschaald) ---------- */
const TEXCACHE = {};
function texTile(fn) { const c = mk(32, 32); withCtx(c.getContext("2d"), fn); return c; }
const PAL = {
  bos: { base: "#7b4a2b", dark: "#5f381f", light: "#946038", edge: "#2a1708" },
  sneeuw: { base: "#566b8f", dark: "#40527a", light: "#7189b0", edge: "#25324d" },
  huis: { base: "#d5c7b0", dark: "#b9a98e", light: "#e6dbc8", edge: "#7d6b52" },
  stad: { base: "#7c7882", dark: "#615d68", light: "#9894a0", edge: "#2e2b34" },
  kust: { base: "#d8c9a8", dark: "#bfae8a", light: "#ebe1c9", edge: "#6e5e44" },
  straat: { base: "#857d70", dark: "#6a6358", light: "#a39a8a", edge: "#332e28" },
  grot: { base: "#6a5a48", dark: "#54473a", light: "#80705a", edge: "#2a221a" }
};
function fillTex(theme, R) {
  const p = PAL[theme];
  g.fillStyle = p.base; g.fillRect(0, 0, 32, 32);
  if (theme === "bos") {
    for (let i = 0; i < 30; i++) { g.fillStyle = R() < .55 ? p.dark : p.light; pxr(fl(R() * 16), fl(R() * 16)); }
    for (let i = 0; i < 3; i++) { const x = fl(R() * 14), y = fl(R() * 14); g.fillStyle = p.dark; pxr(x, y, 2, 1); pxr(x + 1, y + 1); }
    if (R() < .18) {
      const x = fl(R() * 10) + 1, y = fl(R() * 10) + 2;
      g.fillStyle = "#3a2414"; pxr(x + 1, y, 4, 1); pxr(x, y + 1, 6, 2); pxr(x + 1, y + 3, 4, 1);
      g.fillStyle = "#9b958a"; pxr(x + 1, y + 1, 4, 2); g.fillStyle = "#c8c2b5"; pxr(x + 1, y + 1, 2, 1); g.fillStyle = "#726c62"; pxr(x + 3, y + 2, 2, 1);
    }
    if (R() < .25) { g.fillStyle = "#4b2b16"; let x = fl(R() * 12), y = fl(R() * 6) + 6; for (let i = 0; i < 6; i++) { pxr(x, y); x++; if (R() < .5) y++; } }
  } else if (theme === "kust") {
    // sunny limestone (the Dalmatian coast): pale blocks, thin cracks, little holes
    for (let i = 0; i < 26; i++) { g.fillStyle = R() < .5 ? p.dark : p.light; pxr(fl(R() * 16), fl(R() * 16)); }
    g.fillStyle = p.dark; let cx = fl(R() * 16), cy = 0; for (let i = 0; i < 10; i++) { pxr(cx % 16, cy); cy++; if (R() < .4) cx++; }
    for (let i = 0; i < 2; i++) { g.fillStyle = "#a8977a"; pxr(fl(R() * 14), fl(R() * 14), 2, 1); }
  } else if (theme === "grot") {
    // cave rock: dark blotches and a few glittering flecks
    for (let i = 0; i < 34; i++) { g.fillStyle = R() < .6 ? p.dark : p.light; pxr(fl(R() * 16), fl(R() * 16), 1 + fl(R() * 2), 1); }
    if (R() < .3) { g.fillStyle = "#c8b48e"; pxr(fl(R() * 15), fl(R() * 15)); }
  } else if (theme === "sneeuw") {
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      g.fillStyle = p.dark; pxr(0, row * 4 + 3, 16, 1);
      for (let x = off; x < 16 + 8; x += 8) { pxr(x % 16, row * 4, 1, 3); }
      g.fillStyle = p.light; for (let x = off + 1; x < 16 + 8; x += 8) pxr((x) % 16, row * 4, 5, 1);
    }
    for (let i = 0; i < 6; i++) { g.fillStyle = "#8ea6c9"; pxr(fl(R() * 16), fl(R() * 16)); }
  } else {
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? 4 : 0;
      g.fillStyle = p.dark; pxr(0, row * 4 + 3, 16, 1);
      for (let x = off; x < 24; x += 8) pxr(x % 16, row * 4, 1, 3);
      g.fillStyle = p.light; for (let x = off + 1; x < 24; x += 8) pxr(x % 16, row * 4, 5, 1);
    }
  }
}
function topTex(theme, R) {
  if (theme === "bos") {
    for (let x = 0; x < 16; x++) {
      const h = 4 + (R() < .5 ? 1 : 0) + (R() < .2 ? 1 : 0);
      g.fillStyle = "#4f9e3c"; pxr(x, 0, 1, h); g.fillStyle = "#2c6a28"; pxr(x, h, 1, 1);
      g.fillStyle = R() < .3 ? "#a8e878" : "#7fcf5a"; pxr(x, 1, 1, 1);
      if (R() < .2) { g.fillStyle = "#3b8a35"; pxr(x, 2 + fl(R() * 2), 1, 1); }
    }
    g.fillStyle = "#24461b"; g.fillRect(0, 0, 32, 2);
  } else if (theme === "sneeuw") {
    for (let x = 0; x < 16; x++) {
      const h = 5 + (R() < .5 ? 1 : 0);
      g.fillStyle = "#f4f8ff"; pxr(x, 0, 1, h); g.fillStyle = "#c3d4ec"; pxr(x, h, 1, 1);
      if (R() < .2) { g.fillStyle = "#ffffff"; pxr(x, 1); }
      if (R() < .15) { g.fillStyle = "#a9c6ea"; pxr(x, 3); }
    }
    g.fillStyle = "#8ea6c9"; g.fillRect(0, 0, 32, 2);
  } else if (theme === "kust") {
    for (let x = 0; x < 16; x++) {
      const h = 3 + (R() < .5 ? 1 : 0);
      g.fillStyle = R() < .5 ? "#b9a95a" : "#a39a4a"; pxr(x, 0, 1, h); g.fillStyle = "#8a7a3a"; pxr(x, h, 1, 1);
      if (R() < .25) { g.fillStyle = "#d8cf7a"; pxr(x, 0); }
      if (R() < .12) { g.fillStyle = "#f4f1ea"; pxr(x, h + 1); }
    }
    g.fillStyle = "#6e6a32"; g.fillRect(0, 0, 32, 2);
  } else if (theme === "stad") {
    // kasseien met een laagje sneeuw
    g.fillStyle = "#3e3a44"; g.fillRect(0, 0, 32, 12);
    for (let x = 0; x < 16; x += 3) { const o = (x / 3) % 2; g.fillStyle = ["#8d8894", "#a19ca8", "#7e7a86"][x % 3]; pxr(x, 1 + o, 2, 2); pxr(x + 1, 3 + o, 2, 2); g.fillStyle = "#b9b4c0"; pxr(x, 1 + o, 1, 1); }
    g.fillStyle = "#f4f8ff"; for (let x = 0; x < 16; x++) pxr(x, 0, 1, 1 + (R() < .4 ? 1 : 0));
    g.fillStyle = "#c3d4ec"; pxr(0, 6, 16, 1);
  } else if (theme === "grot") {
    // the cave floor: worn, pale rock on top, wet here and there
    for (let x = 0; x < 16; x++) {
      const h = 2 + (R() < .5 ? 1 : 0);
      g.fillStyle = R() < .5 ? "#9a8a70" : "#8a7a62"; pxr(x, 0, 1, h); g.fillStyle = "#4a3e30"; pxr(x, h, 1, 1);
      if (R() < .15) { g.fillStyle = "#b8a888"; pxr(x, 0); }
    }
    g.fillStyle = "#3a3026"; g.fillRect(0, 0, 32, 1);
  } else if (theme === "straat") {
    // summer cobbles (Edinburgh, Glasgow): no snow, a little moss between the stones
    g.fillStyle = "#3a352e"; g.fillRect(0, 0, 32, 12);
    for (let x = 0; x < 16; x += 3) { const o = (x / 3) % 2; g.fillStyle = ["#948b7c", "#a89f8e", "#857d70"][x % 3]; pxr(x, 0 + o, 2, 2); pxr(x + 1, 2 + o, 2, 2); g.fillStyle = "#c2b9a6"; pxr(x, o, 1, 1); }
    g.fillStyle = "#5f7a3e"; for (let x = 0; x < 16; x++) if (R() < .18) pxr(x, 4 + (x % 2), 1, 1);
    g.fillStyle = "#4e473d"; pxr(0, 6, 16, 1);
  } else {
    const cols = ["#c08a55", "#b07a47", "#c99560", "#b88450"];
    let x = 0, i = fl(R() * 4);
    while (x < 16) { const w = 4 + fl(R() * 4); g.fillStyle = cols[i++ % 4]; pxr(x, 0, w, 5); g.fillStyle = "#7a4f2b"; pxr(x, 0, 1, 5); g.fillStyle = "#dcae78"; pxr(x + 1, 1, w - 2, 1); x += w; }
    g.fillStyle = "#6b4426"; g.fillRect(0, 0, 32, 2); g.fillStyle = "#7a5636"; pxr(0, 5, 16, 1);
  }
}
function platTex(theme) {
  const snowy = theme === "sneeuw" || theme === "stad";
  if (theme === "huis") {
    g.fillStyle = "#6b4a2a"; g.fillRect(0, 0, 32, 10);
    g.fillStyle = "#c89a64"; g.fillRect(0, 2, 32, 6); g.fillStyle = "#e0b880"; g.fillRect(0, 2, 32, 2);
    g.fillStyle = "#8a8a86"; g.fillRect(14, 10, 4, 2); g.fillRect(15, 10, 2, 8); g.fillRect(12, 10, 2, 2);
    return;
  }
  const dark = snowy ? "#5a3d26" : "#6b4220", mid = snowy ? "#86603f" : "#a86c3a", hi = snowy ? "#a57c56" : "#d39858";
  const y0 = snowy ? 4 : 0;
  g.fillStyle = "#2e1a0b"; g.fillRect(0, y0, 32, 14);
  g.fillStyle = mid; g.fillRect(0, y0 + 2, 32, 10); g.fillStyle = hi; g.fillRect(0, y0 + 2, 32, 2); g.fillStyle = dark; g.fillRect(0, y0 + 10, 32, 2);
  g.fillStyle = dark; g.fillRect(4, y0 + 6, 10, 1); g.fillRect(18, y0 + 5, 9, 1); g.fillRect(0, y0 + 2, 1, 10);
  g.fillStyle = "#d8d8d0"; g.fillRect(3, y0 + 4, 2, 2); g.fillRect(27, y0 + 4, 2, 2);
  if (snowy) {
    g.fillStyle = "#8ea6c9"; g.fillRect(0, 0, 32, 2);
    g.fillStyle = "#f4f8ff"; g.fillRect(0, 2, 32, 4); g.fillRect(2, 0, 10, 2); g.fillRect(18, 0, 8, 2);
    g.fillStyle = "#cfefff"; [[5, 6], [13, 4], [24, 7]].forEach(([x, h]) => { g.fillRect(x, 18, 3, h); g.fillRect(x + 1, 18 + h, 1, 2); });
  }
}
function blockTex(theme, R) {
  if (theme === "huis") {
    g.fillStyle = "#6b6b66"; g.fillRect(0, 0, 32, 32);
    g.fillStyle = "#f6f4ee"; g.fillRect(2, 2, 28, 28); g.fillStyle = "#e2dfd6"; g.fillRect(2, 26, 28, 4); g.fillRect(28, 2, 2, 28);
    g.fillStyle = "#c9c5bb"; g.fillRect(2, 12, 28, 2); g.fillStyle = "#8f8b82"; g.fillRect(12, 6, 8, 2); g.fillRect(12, 18, 8, 2);
    return;
  }
  if (theme === "sneeuw") {
    g.fillStyle = "#3f6f9a"; g.fillRect(0, 0, 32, 32);
    g.fillStyle = "#9fd2ee"; g.fillRect(2, 2, 28, 28); g.fillStyle = "#d8f2ff"; g.fillRect(2, 2, 28, 3); g.fillRect(2, 2, 3, 28);
    g.fillStyle = "#6aa8cf"; g.fillRect(2, 27, 28, 3); g.fillRect(27, 2, 3, 28);
    g.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 3; i++) { g.fillRect(8 + i * 4, 18 - i * 4, 2, 2); } g.fillRect(20, 8, 4, 2);
    return;
  }
  g.fillStyle = "#2e2c28"; g.fillRect(0, 0, 32, 32);
  g.fillStyle = "#8f8d84"; g.fillRect(2, 2, 28, 28); g.fillStyle = "#b6b4a9"; g.fillRect(2, 2, 28, 3); g.fillRect(2, 2, 3, 28);
  g.fillStyle = "#64625a"; g.fillRect(2, 27, 28, 3); g.fillRect(27, 2, 3, 28);
  g.fillStyle = "#55534c"; g.fillRect(10, 10, 2, 6); g.fillRect(12, 16, 4, 2); g.fillRect(20, 18, 2, 4);
  if (theme === "bos") { g.fillStyle = "#5c9a3e"; g.fillRect(2, 2, 12, 3); g.fillRect(4, 5, 4, 2); g.fillRect(20, 2, 8, 2); g.fillStyle = "#86c45c"; g.fillRect(4, 2, 6, 1); }
  else if (theme !== "kust" && theme !== "straat" && theme !== "grot") { g.fillStyle = "#f4f8ff"; g.fillRect(2, 2, 28, 3); }
}
function spikeTex(theme, R, kind) {
  if (kind === "cones") {
    // pine cones on the floor of the mountain hut
    [[7, 26, 0], [19, 25, 1], [28, 27, 0]].forEach(([x, y, f]) => {
      g.fillStyle = OUT; g.beginPath(); g.ellipse(x, y, 6, 4.5, f ? .4 : -.3, 0, 7); g.fill();
      g.fillStyle = "#7a4a26"; g.beginPath(); g.ellipse(x, y, 5, 3.5, f ? .4 : -.3, 0, 7); g.fill();
      g.fillStyle = "#a8703e"; for (let i = -3; i <= 3; i += 2) for (let j = -1; j <= 1; j += 2) g.fillRect(x + i, y + j, 1.5, 1.5);
    });
    return;
  }
  if (kind === "blocks") {
    // wooden toy blocks and marbles in Santa's workshop
    [[2, 22, "#d8423a", "A"], [16, 24, "#2f7fe0", "B"]].forEach(([x, y, c]) => { g.fillStyle = OUT; g.fillRect(x - 1, y - 1, 11, 11); g.fillStyle = c; g.fillRect(x, y, 9, 9); g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(x + 2, y + 2, 5, 1.5); g.fillRect(x + 2, y + 2, 1.5, 5); });
    [[12, 28, "#59c28a"], [29, 28, "#ffd25e"], [26, 22, "#ff7aa8"]].forEach(([x, y, c]) => { g.fillStyle = OUT; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x, y, 2.8, 0, 7); g.fill(); g.fillStyle = "#fff"; g.fillRect(x - 1.5, y - 1.5, 1.2, 1.2); });
    return;
  }
  if (kind === "pins") {
    // drawing pins that fell off the notice board in the post office
    [[5, 27, "#d8423a"], [15, 25, "#2f7fe0"], [24, 28, "#ffd25e"], [29, 24, "#59c28a"]].forEach(([x, y, c]) => {
      g.fillStyle = "#c9ced8"; g.fillRect(x - .6, y - 8, 1.4, 6);
      g.fillStyle = OUT; g.beginPath(); g.ellipse(x, y - 1, 4.5, 2.6, 0, 0, 7); g.fill();
      g.fillStyle = c; g.beginPath(); g.ellipse(x, y - 1.4, 3.6, 1.9, 0, 0, 7); g.fill();
    });
    return;
  }
  if (theme === "grot") {
    // stalagmites: little pointed cones of dripstone on the cave floor
    [[5, 14], [14, 22], [22, 12], [28, 18]].forEach(([x, h]) => {
      g.fillStyle = "#3a3026"; g.beginPath(); g.moveTo(x - 5, 32); g.lineTo(x, 32 - h - 2); g.lineTo(x + 5, 32); g.fill();
      g.fillStyle = "#a8967a"; g.beginPath(); g.moveTo(x - 4, 32); g.lineTo(x, 32 - h); g.lineTo(x + 4, 32); g.fill();
      g.fillStyle = "#d0c0a0"; g.fillRect(x - 1, 32 - h + 3, 1, h - 5);
    });
  } else if (theme === "straat" || kind === "thistles") {
    // thistles (Scotland, the Ardèche): spiky green stems with purple heads
    [[5, 0], [15, 1], [25, 0]].forEach(([x, f]) => {
      g.fillStyle = "#2c5a2a"; g.fillRect(x - 1, 14 + f * 3, 2, 18 - f * 3);
      g.beginPath(); g.moveTo(x - 7, 32); g.lineTo(x, 22); g.lineTo(x + 7, 32); g.fill();
      g.fillStyle = "#4a8a3a"; g.beginPath(); g.moveTo(x - 4, 30); g.lineTo(x, 24); g.lineTo(x + 4, 30); g.fill();
      g.fillStyle = "#3a6a32"; g.beginPath(); g.ellipse(x, 16 + f * 3, 3.5, 3, 0, 0, 7); g.fill();
      g.fillStyle = "#8a4ab8"; g.fillRect(x - 3, 9 + f * 3, 6, 5); g.fillStyle = "#b67ae0"; g.fillRect(x - 2, 8 + f * 3, 1.5, 4); g.fillRect(x + 1, 8 + f * 3, 1.5, 4);
      g.fillStyle = "#d9d0b0"; g.fillRect(x - 5, 18 + f * 3, 1.5, 1.5); g.fillRect(x + 4, 17 + f * 3, 1.5, 1.5);
    });
  } else if (theme === "bos") {
    g.fillStyle = "#24461b";
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 8, 32); g.lineTo(i * 8 + 4, 10 + (i % 2) * 4); g.lineTo(i * 8 + 8, 32); g.fill(); }
    g.fillStyle = "#3e7a2c"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 8 + 2, 32); g.lineTo(i * 8 + 4, 14 + (i % 2) * 4); g.lineTo(i * 8 + 6, 32); g.fill(); }
    g.fillStyle = "#d9d0b0"; [[6, 20], [14, 16], [22, 22], [27, 18]].forEach(([x, y]) => g.fillRect(x, y, 2, 2));
    [[9, 22], [19, 18], [25, 25]].forEach(([x, y]) => { g.fillStyle = "#1e1030"; g.fillRect(x - 1, y - 1, 6, 6); g.fillStyle = "#5a2a7a"; g.fillRect(x, y, 4, 4); g.fillStyle = "#b37ad9"; g.fillRect(x, y, 2, 2); });
  } else if (theme === "kust") {
    // sea urchins: black spiky balls on the rocks
    [[6, 26, 6], [17, 25, 7], [27, 27, 5]].forEach(([x, y, r]) => {
      g.strokeStyle = "#1a1424"; g.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) { const a = Math.PI + i * Math.PI / 11; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5)); g.stroke(); }
      g.fillStyle = "#2a1f3a"; g.beginPath(); g.arc(x, y, r, Math.PI, 0); g.fill(); g.fillStyle = "#5a4a7a"; g.fillRect(x - 2, y - r + 2, 2, 2);
    });
  } else if (theme === "huis") {
    const br = (x, y, c) => { g.fillStyle = OUT; g.fillRect(x - 1, y - 1, 14, 9); g.fillStyle = c; g.fillRect(x, y, 12, 7); g.fillRect(x + 1, y - 3, 3, 3); g.fillRect(x + 7, y - 3, 3, 3); g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(x, y, 12, 2); };
    br(2, 24, "#e8423a"); br(17, 24, "#2f7fe0"); br(9, 17, "#f5c22b"); br(21, 14, "#3bb35a");
  } else {
    for (let i = 0; i < 4; i++) {
      const h = 18 + (i % 2) * 6;
      g.fillStyle = "#3f6f9a"; g.beginPath(); g.moveTo(i * 8, 32); g.lineTo(i * 8 + 4, 32 - h - 2); g.lineTo(i * 8 + 8, 32); g.fill();
      g.fillStyle = "#bfeaff"; g.beginPath(); g.moveTo(i * 8 + 1, 32); g.lineTo(i * 8 + 4, 32 - h); g.lineTo(i * 8 + 7, 32); g.fill();
      g.fillStyle = "#fff"; g.fillRect(i * 8 + 3, 32 - h + 4, 1, h - 6);
    }
  }
}
function getTex(theme, spikeKind) {
  const key = spikeKind ? theme + ":" + spikeKind : theme;
  if (TEXCACHE[key]) return TEXCACHE[key];
  const R = rng(theme.length * 977 + 13), T = { fill: [], top: [] };
  for (let v = 0; v < 4; v++) { T.fill.push(texTile(() => fillTex(theme, R))); T.top.push(texTile(() => { fillTex(theme, R); topTex(theme, R); })); }
  T.plat = texTile(() => platTex(theme)); T.block = texTile(() => blockTex(theme, R)); T.spike = texTile(() => spikeTex(theme, R, spikeKind));
  // Alle tegels ook in één atlas (met een rand van 1 px ertussen): zo tekent de grafische chip honderden tegels per
  // beeld uit één plaatje, in plaats van steeds te wisselen. Pixel voor pixel hetzelfde resultaat.
  const all = [...T.fill, ...T.top, T.plat, T.block, T.spike];
  T.atlas = mk(all.length * 34, 34); T.at = new Map();
  const actx = T.atlas.getContext("2d");
  all.forEach((c, i) => {
    const x = i * 34 + 1;
    actx.drawImage(c, x, 1); T.at.set(c, x);
    // Copy each edge one pixel outwards, so a tile drawn on half a screen pixel never picks up an empty pixel next to it.
    actx.drawImage(c, 0, 0, 1, 32, x - 1, 1, 1, 32); actx.drawImage(c, 31, 0, 1, 32, x + 32, 1, 1, 32);
    actx.drawImage(c, 0, 0, 32, 1, x, 0, 32, 1); actx.drawImage(c, 0, 31, 32, 1, x, 33, 32, 1);
  });
  return TEXCACHE[key] = T;
}

/* ---------- Achtergrondlagen (naadloos herhalend) ---------- */
const LW = 1536;
const per = (x, k, ph) => Math.sin(x / LW * Math.PI * 2 * k + ph);
const ridge = (base, amps, x) => base - amps.reduce((s, [a, k, p]) => s + a * per(x, k, p), 0);
/** A background layer. It remembers its ground line (the first ridge drawn on it, `_ground`), so the scenery animals can
    stand on it (drawBgAnimals()). */
let LAYER_GROUND = null;
function layerCanvas(fn) { const c = mk(LW, VIEW_H); LAYER_GROUND = null; withCtx(c.getContext("2d"), fn); c._ground = LAYER_GROUND; LAYER_GROUND = null; return c; }
/** Battlements on a wall from x0 to x1 whose top is at y: blocks of size s standing on the wall, with gaps between. */
function battlements(x0, x1, y, s, line) {
  const n = Math.max(2, Math.round((x1 - x0) / (s * 2))), step = (x1 - x0 - s) / (n - 1);
  for (let i = 0; i < n; i++) { const x = x0 + i * step; g.fillRect(x, y - s, s, s + .5); if (line) g.strokeRect(x, y - s, s, s); }
}
/** The lowest ground (largest y) under something w wide at x, so a building on a slope stands on the hill instead of floating. */
function groundUnder(top, x, w) { let y = 0; for (let d = 0; d <= w; d += 2) y = Math.max(y, top(x + d)); return y; }
function fillRidge(base, amps, col, hi) {
  if (!LAYER_GROUND) LAYER_GROUND = { base, amps };
  g.fillStyle = col; g.beginPath(); g.moveTo(0, VIEW_H);
  for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(base, amps, x));
  g.lineTo(LW, VIEW_H); g.fill();
  if (hi) { g.strokeStyle = hi; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(base, amps, x) + 1.5); g.stroke(); }
}
function wrapAt(x, fn) { fn(x); if (x < 120) fn(x + LW); if (x > LW - 120) fn(x - LW); }
function pineShape(x, y, h, c1, c2, snow, outline) {
  const w = h * .38;
  g.fillStyle = "#4a3020"; g.fillRect(x - h * .04, y - h * .16, h * .08, h * .16);
  for (let i = 0; i < 4; i++) {
    const ww = w * (1 - i * .2), yy = y - h * .12 - i * h * .19, top = yy - h * .32;
    if (outline) { g.fillStyle = outline; g.beginPath(); g.moveTo(x - ww - 1.5, yy + 1.5); g.lineTo(x + ww + 1.5, yy + 1.5); g.lineTo(x, top - 2); g.fill(); }
    g.fillStyle = c1; g.beginPath(); g.moveTo(x - ww, yy); g.lineTo(x + ww, yy); g.lineTo(x, top); g.fill();
    g.fillStyle = c2; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + ww, yy); g.lineTo(x, top); g.fill();
    if (snow) { g.fillStyle = snow; g.beginPath(); g.moveTo(x - ww * .55, yy - h * .14); g.quadraticCurveTo(x, yy - h * .08, x + ww * .55, yy - h * .14); g.lineTo(x, top); g.fill(); }
  }
}
function leafTree(x, y, h, cols, outline) {
  g.fillStyle = "#4a3020"; g.fillRect(x - h * .05, y - h * .5, h * .1, h * .5);
  const blobs = [[0, -.62, .3], [-.22, -.52, .22], [.22, -.5, .22], [-.1, -.8, .2], [.14, -.75, .2]];
  if (outline) { g.fillStyle = outline; blobs.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * h, y + dy * h, r * h + 2, 0, 7); g.fill(); }); }
  blobs.forEach(([dx, dy, r], i) => { g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(x + dx * h, y + dy * h, r * h, 0, 7); g.fill(); });
  g.fillStyle = "rgba(255,255,255,.18)"; g.beginPath(); g.arc(x - h * .06, y - h * .72, h * .12, 0, 7); g.fill();
}
function village(x, y, s, lit, roof, wall) {
  const houses = [[0, 22, 18], [22, 18, 14], [38, 26, 16], [62, 20, 13]];
  houses.forEach(([dx, w, h]) => {
    const hx = x + dx * s, hw = w * s, hh = h * s;
    g.fillStyle = wall; g.fillRect(hx, y - hh, hw, hh);
    g.fillStyle = roof; g.beginPath(); g.moveTo(hx - 2, y - hh); g.lineTo(hx + hw / 2, y - hh - hw * .45); g.lineTo(hx + hw + 2, y - hh); g.fill();
    g.fillStyle = lit; for (let i = 0; i < Math.floor(w / 9); i++) g.fillRect(hx + (3 + i * 8) * s, y - hh + 5 * s, 3 * s, 4 * s);
  });
  // kerk
  const cx = x + 90 * s;
  g.fillStyle = wall; g.fillRect(cx, y - 30 * s, 12 * s, 30 * s); g.fillRect(cx + 12 * s, y - 16 * s, 22 * s, 16 * s);
  g.fillStyle = roof; g.beginPath(); g.moveTo(cx - 1, y - 30 * s); g.lineTo(cx + 6 * s, y - 52 * s); g.lineTo(cx + 12 * s + 1, y - 30 * s); g.fill();
  g.beginPath(); g.moveTo(cx + 12 * s, y - 16 * s); g.lineTo(cx + 23 * s, y - 26 * s); g.lineTo(cx + 34 * s, y - 16 * s); g.fill();
  g.fillStyle = lit; g.fillRect(cx + 4 * s, y - 24 * s, 4 * s, 6 * s);
  g.fillRect(cx + 6 * s - .5, y - 58 * s, 1.2, 7 * s); g.fillRect(cx + 4 * s, y - 56 * s, 5 * s, 1.2);
}
const LAYERS = {};
function getLayers(theme) {
  if (LAYERS[theme]) return LAYERS[theme];
  const R = rng(theme === "bos" ? 4242 : 777);
  const out = {};
  if (theme === "bos") {
    out.clouds = layerCanvas(() => {
      for (let i = 0; i < 9; i++) {
        const cx = i * LW / 9 + R() * 80, cy = 50 + R() * 110, s = .7 + R() * .7;
        wrapAt(cx, x => {
          const puffs = [[0, 0, 22], [24, -10, 26], [50, -2, 20], [70, 4, 15], [-20, 6, 15]];
          g.fillStyle = "#a9c8e2"; puffs.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, cy + dy * s + 5, r * s + 2, 0, 7); g.fill(); });
          g.fillStyle = "#ffffff"; puffs.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(x + dx * s, cy + dy * s, r * s, 0, 7); g.fill(); });
          g.fillStyle = "#dcebf6"; g.fillRect(x - 34 * s, cy + 8 * s, 120 * s, 10 * s);
        });
      }
    });
    out.far = layerCanvas(() => {
      const a = [[38, 2, 1], [22, 5, 2], [9, 11, 0]];
      fillRidge(265, a, "#8fb6cf", "#b8d6e6");
      g.fillStyle = "#7ea7c2"; for (let x = 0; x < LW; x += 14) { const y = ridge(265, a, x); g.fillRect(x, y + 14 + R() * 30, 6, 2); }
    });
    out.mid = layerCanvas(() => {
      const a = [[24, 3, 4], [12, 7, 1], [5, 17, 2]];
      fillRidge(310, a, "#6aa05a", "#8cc46e");
      for (let i = 0; i < 2; i++) { const vx = 200 + i * 760; village(vx, ridge(310, a, vx + 60) + 6, 1, "#ffe7a8", "#b5453a", "#f1e6d6"); }
      for (let x = 0; x < LW; x += 22) {
        if (x % 760 > 180 && x % 760 < 340) continue;
        const r = R(); if (r < .3) continue; const y = ridge(310, a, x) + 8;
        wrapAt(x, xx => r < .7 ? pineShape(xx, y, 40 + r * 30, "#3f7d47", "#2f6539") : leafTree(xx, y, 40 + r * 20, ["#e08a2e", "#f2b53c", "#c9562b"]));
      }
    });
    out.near = layerCanvas(() => {
      const a = [[16, 4, 2], [9, 9, 5]];
      fillRidge(372, a, "#3f7a45");
      for (let x = 0; x < LW; x += 34) {
        const r = R(), y = ridge(372, a, x) + 10;
        wrapAt(x, xx => r < .55 ? pineShape(xx, y, 80 + r * 50, "#2d6338", "#21502b", null, "#173220") : leafTree(xx, y, 80 + r * 30, ["#d9742a", "#eaa635", "#b44a25", "#e9c04a"], "#3b1e0e"));
      }
      g.fillStyle = "#2e6a37"; for (let x = 0; x < LW; x += 18) { const y = ridge(372, a, x) + 14; g.beginPath(); g.arc(x, y, 12 + R() * 8, Math.PI, 0); g.fill(); }
    });
  } else if (theme === "sneeuw") {
    out.far = layerCanvas(() => {
      const a = [[46, 2, 2], [26, 5, 1], [10, 13, 4]];
      fillRidge(280, a, "#3a5689");
      g.fillStyle = "#c9d8f0"; g.beginPath();
      for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(280, a, x));
      for (let x = LW; x >= 0; x -= 6) { const y = ridge(280, a, x); g.lineTo(x, y + Math.max(2, (262 - y) * .55) + Math.sin(x * .09) * 3); }
      g.fill();
    });
    out.mid = layerCanvas(() => {
      const a = [[22, 3, 1], [10, 8, 3]];
      fillRidge(330, a, "#a8bfe0", "#e4eefb");
      village(520, ridge(330, a, 580) + 6, 1, "#ffd27a", "#3b4660", "#c9d3e6");
      village(1180, ridge(330, a, 1240) + 6, .9, "#ffd27a", "#3b4660", "#c9d3e6");
      for (let x = 0; x < LW; x += 20) {
        if ((x > 480 && x < 660) || (x > 1150 && x < 1320)) continue;
        const r = R(); if (r < .35) continue; const y = ridge(330, a, x) + 8;
        wrapAt(x, xx => pineShape(xx, y, 34 + r * 30, "#2a4a5e", "#203a4c", "#e8f0fb"));
      }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 3], [8, 10, 1]];
      fillRidge(380, a, "#dfe9f7", "#ffffff");
      g.fillStyle = "#c7d7ee"; for (let x = 0; x < LW; x += 26) { const y = ridge(380, a, x) + 18; g.beginPath(); g.ellipse(x, y, 20, 4, 0, 0, 7); g.fill(); }
      for (let x = 0; x < LW; x += 40) {
        const r = R(), y = ridge(380, a, x) + 10; if (r < .25) continue;
        wrapAt(x, xx => pineShape(xx, y, 80 + r * 50, "#1f4152", "#173444", "#f4f8ff", "#0f2230"));
      }
    });
  }
  else if (theme === "stad") {
    // Kirchberg: moderne torens met verlichte ramen
    out.far = layerCanvas(() => {
      for (let x = 10; x < LW - 40; x += 60 + R() * 70) {
        const w = 26 + R() * 34, h = 70 + R() * 100, y = 300;
        g.fillStyle = "#43527a"; g.fillRect(x, y - h, w, h + 60); g.fillStyle = "#56668f"; g.fillRect(x, y - h, w * .35, h + 60);
        g.fillStyle = "rgba(255,226,150,.85)"; for (let wy = y - h + 6; wy < y + 40; wy += 8) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (R() < .4) g.fillRect(wx, wy, 3, 4);
        if (R() < .3) { g.fillStyle = "#ff5a5a"; g.fillRect(x + w / 2 - 1, y - h - 6, 2, 6); }
      }
    });
    // de oude stad op de rotsen, met de rode brug en de torens van de kathedraal
    out.mid = layerCanvas(() => {
      const a = [[14, 3, 1], [8, 7, 2]];
      fillRidge(345, a, "#6e6a5c");
      g.fillStyle = "#5b5849"; for (let x = 0; x < LW; x += 9) g.fillRect(x, ridge(345, a, x) + 10 + R() * 40, 5, 2);
      for (let x = 0; x < LW; x += 30) {
        if (x > 280 && x < 700) continue;
        const y = ridge(345, a, x) + 4, h = 34 + R() * 26, w = 26;
        g.fillStyle = ["#e9e0cf", "#d8c9b0", "#cfd6dc", "#e6d2bf"][Math.floor(R() * 4)]; g.fillRect(x, y - h, w, h);
        g.fillStyle = "#3c4150"; g.beginPath(); g.moveTo(x - 2, y - h); g.lineTo(x + w / 2, y - h - 16); g.lineTo(x + w + 2, y - h); g.fill();
        g.fillStyle = "#f4f8ff"; g.fillRect(x - 1, y - h - 2, w + 2, 2);
        g.fillStyle = "#ffd27a"; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) if (R() < .7) g.fillRect(x + 5 + i * 11, y - h + 8 + j * 12, 5, 6);
      }
      // de rode brug over het dal
      g.fillStyle = "#3a3846"; g.fillRect(280, 330, 420, 150);
      g.fillStyle = "#c4302b"; g.fillRect(270, 286, 440, 10);
      for (let i = 0; i < 3; i++) { const bx = 330 + i * 130; g.beginPath(); g.moveTo(bx, 296); g.lineTo(bx + 34, 420); g.lineTo(bx + 46, 420); g.lineTo(bx + 80, 296); g.lineTo(bx + 66, 296); g.lineTo(bx + 40, 390); g.lineTo(bx + 14, 296); g.fill(); }
      g.fillStyle = "rgba(255,230,160,.9)"; for (let x = 275; x < 705; x += 12) g.fillRect(x, 283, 2, 3);
      // kathedraal
      const cx = 1100, cy = ridge(345, a, 1100) + 6;
      g.fillStyle = "#cbbf9f"; g.fillRect(cx, cy - 60, 90, 60);
      [[cx - 6, 110], [cx + 40, 90], [cx + 84, 110]].forEach(([tx, h]) => { g.fillStyle = "#cbbf9f"; g.fillRect(tx, cy - h, 12, h); g.fillStyle = "#4f5f5a"; g.beginPath(); g.moveTo(tx - 2, cy - h); g.lineTo(tx + 6, cy - h - 34); g.lineTo(tx + 14, cy - h); g.fill(); });
      g.fillStyle = "#ffd27a"; g.fillRect(cx + 38, cy - 40, 14, 18);
    });
    // kale bomen met lichtjes en slingers tussen de palen
    out.near = layerCanvas(() => {
      fillRidge(400, [[6, 5, 1]], "#2f2c40");
      for (let x = 20; x < LW; x += 90 + R() * 60) {
        const y = 404, h = 70 + R() * 30;
        g.strokeStyle = "#241f2c"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
        g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const by = y - h * .45 - i * h * .09, d = (i % 2 ? 1 : -1) * (18 + R() * 16); g.beginPath(); g.moveTo(x, by); g.lineTo(x + d, by - 16 - R() * 10); g.stroke(); }
        for (let i = 0; i < 14; i++) { g.fillStyle = ["#ffe08a", "#ffffff", "#ffcf6a"][i % 3]; g.beginPath(); g.arc(x + (R() - .5) * 60, y - h * .5 - R() * h * .55, 1.6, 0, 7); g.fill(); }
      }
      for (let x = 0; x < LW; x += 160) {
        g.fillStyle = "#1e1a26"; g.fillRect(x, 300, 4, 110);
        g.strokeStyle = "#1e1a26"; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 2, 302); g.quadraticCurveTo(x + 82, 334, x + 162, 302); g.stroke();
        for (let i = 1; i < 12; i++) { const t = i / 12, lx = x + 2 + t * 160, ly = 302 + Math.sin(t * Math.PI) * 16; g.fillStyle = ["#ff6b6b", "#ffd25e", "#59c28a", "#5aa8ff"][i % 4]; g.beginPath(); g.arc(lx, ly + 3, 2.2, 0, 7); g.fill(); }
      }
    });
  }
  return LAYERS[theme] = out;
}
/* ---------- Scenes of the other regions: North Pole, Tirol (Alps) and Norway (fjord) ---------- */
function chaletShape(x, y, s, wall, roof) {
  g.fillStyle = wall; g.fillRect(x, y - 22 * s, 30 * s, 22 * s);
  g.fillStyle = "rgba(0,0,0,.18)"; for (let i = 1; i < 5; i++) g.fillRect(x, y - 22 * s + i * 4.4 * s, 30 * s, 1);
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - 6 * s, y - 20 * s); g.lineTo(x + 15 * s, y - 34 * s); g.lineTo(x + 36 * s, y - 20 * s); g.fill();
  g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(x - 6 * s, y - 20 * s); g.lineTo(x + 15 * s, y - 34 * s); g.lineTo(x + 36 * s, y - 20 * s); g.lineTo(x + 15 * s, y - 30 * s); g.fill();
  g.fillStyle = "#ffd27a"; g.fillRect(x + 5 * s, y - 15 * s, 5 * s, 5 * s); g.fillRect(x + 20 * s, y - 15 * s, 5 * s, 5 * s);
}
const SCENES = new Set(["pole", "alps", "fjord", "polder", "grachten", "duinen", "adriatic", "oldtown", "falls", "smaland", "highlands", "ardeche", "grotte", "laguna", "venezia", "burano", "verona", "dolomiti"]);
/** A small windmill in the background (sails do not turn there: the layer is drawn once). */
function farMill(x, y, s, body, sail) {
  g.fillStyle = body; g.beginPath(); g.moveTo(x - 6 * s, y); g.lineTo(x - 3 * s, y - 26 * s); g.lineTo(x + 3 * s, y - 26 * s); g.lineTo(x + 6 * s, y); g.fill();
  g.strokeStyle = sail; g.lineWidth = 1.6 * s; const a = (x * .37) % 1.6;
  for (let k = 0; k < 4; k++) { const b = a + k * Math.PI / 2; g.beginPath(); g.moveTo(x, y - 26 * s); g.lineTo(x + Math.cos(b) * 18 * s, y - 26 * s + Math.sin(b) * 18 * s); g.stroke(); }
}
/** Cave paintings in the style of the Chauvet Cave: animals in charcoal outline and red ochre, hand stencils and dots.
 *  Drawn freely in code (a simple likeness of the style, not a copy of one painting). */
function caveArt(kind, x, y) {
  const coal = "rgba(30,22,18,.85)", ochre = "rgba(150,52,30,.8)";
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  const animal = (col, body, head, legs) => { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); body(); g.stroke(); g.beginPath(); head(); g.stroke(); g.lineWidth = 2.4; legs.forEach(([lx, ly, ex, ey]) => { g.beginPath(); g.moveTo(x + lx, y + ly); g.lineTo(x + ex, y + ey); g.stroke(); }); };
  if (kind === "horses") {
    // four horses' heads, one above the other
    for (let i = 0; i < 4; i++) { const hx = x + i * 10, hy = y - 46 + i * 22;
      g.strokeStyle = coal; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy); g.quadraticCurveTo(hx + 18, hy - 14, hx + 34, hy - 6); g.quadraticCurveTo(hx + 46, hy, hx + 44, hy + 8); g.quadraticCurveTo(hx + 30, hy + 12, hx + 16, hy + 8); g.stroke();
      g.fillStyle = "rgba(30,22,18,.35)"; g.beginPath(); g.ellipse(hx + 26, hy + 2, 12, 5, -.15, 0, 7); g.fill();
      g.lineWidth = 2; for (let m = 0; m < 5; m++) { g.beginPath(); g.moveTo(hx + 4 + m * 4, hy - 4 - m); g.lineTo(hx + 2 + m * 4, hy - 10 - m); g.stroke(); }
      g.fillStyle = coal; g.beginPath(); g.arc(hx + 32, hy - 2, 1.6, 0, 7); g.fill(); }
  } else if (kind === "lions") {
    // cave lions, no mane, hunting together
    for (let i = 0; i < 3; i++) { const lx = x + i * 26 - 20, ly = y + i * 6;
      g.strokeStyle = coal; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx + 30, ly - 12, lx + 60, ly - 6); g.quadraticCurveTo(lx + 74, ly - 10, lx + 78, ly); g.quadraticCurveTo(lx + 72, ly + 8, lx + 62, ly + 6); g.stroke();
      g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx - 12, ly + 4, lx - 14, ly + 16); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(lx + 8, ly + 6); g.lineTo(lx + 6, ly + 22); g.moveTo(lx + 52, ly + 4); g.lineTo(lx + 54, ly + 22); g.stroke(); }
  } else if (kind === "mammoth") {
    animal(coal, () => { g.moveTo(x - 40, y + 20); g.quadraticCurveTo(x - 36, y - 40, x, y - 42); g.quadraticCurveTo(x + 30, y - 44, x + 34, y - 10); },
      () => { g.moveTo(x + 34, y - 10); g.quadraticCurveTo(x + 46, y + 10, x + 40, y + 30); g.moveTo(x + 30, y + 2); g.quadraticCurveTo(x + 50, y + 4, x + 54, y - 8); },
      [[-34, 18, -34, 40], [-20, 22, -20, 42], [16, 18, 16, 40], [26, 14, 26, 38]]);
  } else if (kind === "rhino") {
    animal(coal, () => { g.moveTo(x - 40, y); g.quadraticCurveTo(x - 10, y - 26, x + 30, y - 14); g.quadraticCurveTo(x + 44, y - 8, x + 50, y + 4); g.moveTo(x - 40, y); g.quadraticCurveTo(x - 4, y + 20, x + 40, y + 10); },
      () => { g.moveTo(x + 46, y); g.quadraticCurveTo(x + 66, y - 18, x + 72, y - 40); g.moveTo(x + 40, y - 8); g.quadraticCurveTo(x + 48, y - 20, x + 52, y - 28); },
      [[-30, 8, -32, 26], [-14, 12, -14, 28], [20, 12, 22, 28], [32, 10, 34, 26]]);
  } else if (kind === "bear") {
    animal(ochre, () => { g.moveTo(x - 36, y + 10); g.quadraticCurveTo(x - 30, y - 26, x + 4, y - 24); g.quadraticCurveTo(x + 26, y - 22, x + 34, y - 6); g.moveTo(x - 36, y + 10); g.lineTo(x + 30, y + 12); },
      () => { g.moveTo(x + 34, y - 6); g.quadraticCurveTo(x + 50, y - 10, x + 52, y); g.quadraticCurveTo(x + 46, y + 6, x + 34, y + 4); g.moveTo(x + 36, y - 10); g.lineTo(x + 38, y - 16); },
      [[-28, 10, -28, 28], [-12, 12, -12, 28], [14, 12, 14, 28], [26, 12, 26, 28]]);
  } else if (kind === "hands") {
    // hand stencils: a hand held against the rock with red paint blown around it
    for (let i = 0; i < 3; i++) { const hx = x + i * 36 - 30, hy = y - 10 + (i % 2) * 22;
      const gr = g.createRadialGradient(hx, hy, 4, hx, hy, 26); gr.addColorStop(0, "rgba(150,52,30,.75)"); gr.addColorStop(1, "rgba(150,52,30,0)");
      g.fillStyle = gr; g.fillRect(hx - 26, hy - 30, 52, 56);
      g.fillStyle = "#c2a882"; g.beginPath(); g.ellipse(hx, hy + 4, 8, 9, 0, 0, 7); g.fill();
      [[-7, -6, -.5], [-3, -10, -.15], [1, -11, 0], [5, -9, .2], [9, -1, .9]].forEach(([fx, fy, a]) => { g.save(); g.translate(hx + fx, hy + fy); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 2.2, 7, 0, 0, 7); g.fill(); g.restore(); }); }
  } else if (kind === "dots") {
    // big red dots: palms pressed against the rock with red paint
    g.fillStyle = ochre; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(x - 30 + (i % 5) * 16 + (i % 2) * 5, y - 20 + Math.floor(i / 5) * 18, 6, 7, 0, 0, 7); g.fill(); }
  }
  g.restore();
}
function getSceneLayers(scene) {
  if (LAYERS[scene]) return LAYERS[scene];
  const R = rng({ pole: 9001, alps: 9002, fjord: 9003, polder: 9004, grachten: 9005, duinen: 9006, adriatic: 9007, oldtown: 9008, falls: 9009, smaland: 9010, highlands: 9011, ardeche: 9012, grotte: 9013, laguna: 9014, venezia: 9015, burano: 9016, verona: 9017, dolomiti: 9018 }[scene] || 1), out = {};
  if (scene === "pole") {
    // ice floes and icebergs far away
    out.far = layerCanvas(() => {
      g.fillStyle = "#9fc2de"; g.fillRect(0, 300, LW, 200);
      for (let x = 0; x < LW; x += 70 + R() * 90) {
        const w = 50 + R() * 90, h = 30 + R() * 60, y = 304;
        g.fillStyle = "#cfe4f5"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * .2, y - h * .8); g.lineTo(x + w * .45, y - h); g.lineTo(x + w * .7, y - h * .6); g.lineTo(x + w, y); g.fill();
        g.fillStyle = "#a9cbe6"; g.beginPath(); g.moveTo(x + w * .45, y - h); g.lineTo(x + w * .7, y - h * .6); g.lineTo(x + w, y); g.lineTo(x + w * .5, y); g.fill();
      }
      g.fillStyle = "rgba(255,255,255,.35)"; for (let x = 0; x < LW; x += 18) g.fillRect(x, 306 + R() * 20, 10, 1.5);
    });
    // Santa's village: red houses with snowy roofs, warm windows and candy-cane poles
    out.mid = layerCanvas(() => {
      const a = [[12, 3, 1], [6, 8, 2]];
      fillRidge(338, a, "#dbe8f6", "#ffffff");
      for (let x = 30; x < LW - 60; x += 64 + R() * 50) {
        const y = ridge(338, a, x + 20) + 6, w = 34 + R() * 16, h = 22 + R() * 10;
        g.fillStyle = ["#b8372f", "#a52f2a", "#2f6a4a"][Math.floor(R() * 3)]; g.fillRect(x, y - h, w, h);
        g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(x - 4, y - h); g.lineTo(x + w / 2, y - h - w * .42); g.lineTo(x + w + 4, y - h); g.fill();
        g.fillStyle = "#ffd27a"; g.fillRect(x + 6, y - h + 7, 6, 6); g.fillRect(x + w - 12, y - h + 7, 6, 6);
        if (R() < .4) { g.fillStyle = "#e9e3d6"; g.fillRect(x + w - 2, y + 2, 3, -38); for (let i = 0; i < 6; i++) { g.fillStyle = "#d33"; g.fillRect(x + w - 2, y - 36 + i * 6, 3, 3); } }
      }
      // the big tree in the middle of the village
      pineShape(760, ridge(338, a, 760) + 8, 120, "#1f5a3a", "#174a2f", "#f4f8ff");
      for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#ffd25e" : "#ff6b6b"; g.beginPath(); g.arc(760 + (R() - .5) * 60 * (1 - i / 18), ridge(338, a, 760) - 10 - i * 6, 2, 0, 7); g.fill(); }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 2], [8, 9, 4]];
      fillRidge(386, a, "#e6effa", "#ffffff");
      g.fillStyle = "#c9dbef"; for (let x = 0; x < LW; x += 30) { const y = ridge(386, a, x) + 16; g.beginPath(); g.ellipse(x, y, 22, 4, 0, 0, 7); g.fill(); }
      for (let x = 0; x < LW; x += 60) { const r = R(), y = ridge(386, a, x) + 10; if (r < .45) continue; wrapAt(x, xx => pineShape(xx, y, 60 + r * 40, "#1f4152", "#173444", "#f4f8ff", "#0f2230")); }
    });
  } else if (scene === "alps") {
    // high, sharp peaks with snow caps
    out.far = layerCanvas(() => {
      const pts = []; let x = -40; while (x < LW + 80) { pts.push([x, 120 + R() * 90]); x += 70 + R() * 90; pts.push([x, 230 + R() * 50]); x += 50 + R() * 60; }
      g.fillStyle = "#5b6f9e"; g.beginPath(); g.moveTo(0, VIEW_H); pts.forEach(([px, py]) => g.lineTo(px, py)); g.lineTo(LW, VIEW_H); g.fill();
      g.fillStyle = "#4b5d88"; for (let i = 0; i < pts.length - 1; i += 2) { const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x1 + 10, VIEW_H); g.fill(); }
      g.fillStyle = "#eef4fc";
      for (let i = 0; i < pts.length; i += 2) {
        const [px, py] = pts[i], prev = pts[i - 1] || [px - 60, py + 90], next = pts[i + 1] || [px + 60, py + 90];
        const k = .38; g.beginPath(); g.moveTo(px, py);
        g.lineTo(px + (next[0] - px) * k, py + (next[1] - py) * k); g.lineTo(px + (next[0] - px) * k * .5, py + (next[1] - py) * k * .7);
        g.lineTo(px, py + (next[1] - py) * k * .9); g.lineTo(px + (prev[0] - px) * k * .5, py + (prev[1] - py) * k * .7);
        g.lineTo(px + (prev[0] - px) * k, py + (prev[1] - py) * k); g.fill();
      }
    });
    // slopes with chalets, an onion-dome church and the cable car
    out.mid = layerCanvas(() => {
      const a = [[30, 2, 1], [14, 6, 3]];
      fillRidge(330, a, "#c3d4ec", "#f2f7fd");
      g.strokeStyle = "#2a2f3c"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(120, ridge(330, a, 120) - 10); g.lineTo(700, 150); g.stroke();
      g.fillStyle = "#2a2f3c"; g.fillRect(118, ridge(330, a, 120) - 14, 4, 14); g.fillRect(698, 150, 4, 30);
      [.35, .7].forEach(t => { const cx = 120 + (580 * t), cy = ridge(330, a, 120) - 10 + (150 - ridge(330, a, 120) + 10) * t; g.fillStyle = "#2a2f3c"; g.fillRect(cx - 1, cy, 2, 8); g.fillStyle = "#d8423a"; g.fillRect(cx - 9, cy + 8, 18, 13); g.fillStyle = "#ffe7a8"; g.fillRect(cx - 6, cy + 11, 12, 5); });
      for (let x = 820; x < LW - 60; x += 46 + R() * 40) chaletShape(x, ridge(330, a, x + 15) + 6, .9 + R() * .3, "#8a5a34", "#4a2f22");
      for (let x = 140; x < 600; x += 70 + R() * 50) chaletShape(x, ridge(330, a, x + 15) + 6, .8, "#9a6338", "#4a2f22");
      const cx = 1250, cy = ridge(330, a, 1256) + 6;
      g.fillStyle = "#f1ece0"; g.fillRect(cx, cy - 46, 12, 46); g.fillRect(cx + 12, cy - 22, 26, 22);
      g.fillStyle = "#4a6a3a"; g.beginPath(); g.ellipse(cx + 6, cy - 52, 8, 9, 0, 0, 7); g.fill(); g.fillRect(cx + 5, cy - 66, 2, 8);
      g.fillStyle = "#4a2f22"; g.beginPath(); g.moveTo(cx + 10, cy - 22); g.lineTo(cx + 25, cy - 32); g.lineTo(cx + 40, cy - 22); g.fill();
      for (let x = 0; x < LW; x += 24) { if ((x > 100 && x < 620) || (x > 800 && x < 1320)) continue; const r = R(); if (r < .4) continue; wrapAt(x, xx => pineShape(xx, ridge(330, a, x) + 8, 30 + r * 26, "#2a4a5e", "#203a4c", "#e8f0fb")); }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 3], [8, 10, 1]];
      fillRidge(384, a, "#dfe9f7", "#ffffff");
      for (let x = 0; x < LW; x += 38) { const r = R(), y = ridge(384, a, x) + 10; if (r < .3) continue; wrapAt(x, xx => pineShape(xx, y, 80 + r * 50, "#1f4152", "#173444", "#f4f8ff", "#0f2230")); }
    });
  } else if (scene === "fjord") {
    // steep mountain walls on both sides of a calm fjord
    out.far = layerCanvas(() => {
      const a = [[60, 2, 2], [34, 5, 1], [12, 11, 3]];
      fillRidge(250, a, "#2c3a5e");
      g.fillStyle = "#dfe8f5"; g.beginPath();
      for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(250, a, x));
      for (let x = LW; x >= 0; x -= 6) { const y = ridge(250, a, x); g.lineTo(x, y + Math.max(3, (220 - y) * .5)); }
      g.fill();
      // the water: dark, with the reflection of the snowy tops
      g.fillStyle = "#18264a"; g.fillRect(0, 330, LW, 200);
      g.fillStyle = "rgba(200,220,255,.18)"; for (let x = 0; x < LW; x += 10) { const y = 2 * 330 - ridge(250, a, x); if (y > 332) g.fillRect(x, 332 + (y - 332) * .25, 8, 1.5); }
      g.fillStyle = "rgba(255,255,255,.25)"; for (let x = 0; x < LW; x += 26) g.fillRect(x + R() * 10, 340 + R() * 50, 14, 1);
    });
    // red fishermen's cabins (rorbuer) on stilts along the shore, and little boats
    out.mid = layerCanvas(() => {
      const a = [[10, 3, 1], [6, 7, 2]];
      fillRidge(352, a, "#cdd9ec", "#f4f8ff");
      for (let x = 40; x < LW - 50; x += 80 + R() * 70) {
        const y = 346, w = 34 + R() * 10;
        g.fillStyle = "#3a2a22"; for (let i = 0; i < 4; i++) g.fillRect(x + 3 + i * (w - 6) / 3, y - 2, 2, 14);
        g.fillStyle = "#b2322a"; g.fillRect(x, y - 24, w, 22);
        g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(x - 4, y - 24); g.lineTo(x + w / 2, y - 40); g.lineTo(x + w + 4, y - 24); g.fill();
        g.fillStyle = "#ffd27a"; g.fillRect(x + 6, y - 17, 6, 6); g.fillRect(x + w - 12, y - 17, 6, 6);
        if (R() < .5) { const bx = x + w + 14; g.fillStyle = "#e9e3d6"; g.beginPath(); g.moveTo(bx, 356); g.lineTo(bx + 30, 356); g.lineTo(bx + 24, 364); g.lineTo(bx + 6, 364); g.fill(); g.fillStyle = "#3a2a22"; g.fillRect(bx + 14, 330, 2, 26); }
      }
    });
    out.near = layerCanvas(() => {
      const a = [[14, 4, 3], [8, 10, 1]];
      fillRidge(384, a, "#dfe9f7", "#ffffff");
      for (let x = 0; x < LW; x += 36) { const r = R(), y = ridge(384, a, x) + 10; if (r < .25) continue; wrapAt(x, xx => pineShape(xx, y, 80 + r * 60, "#1a3a3a", "#132e2e", "#f4f8ff", "#0b1c1c")); }
    });
  }
  else if (scene === "polder") {
    // flat polder to the horizon: distant windmills and a church tower, frosty fields with ditches
    out.far = layerCanvas(() => {
      g.fillStyle = "#b9c6d6"; g.fillRect(0, 300, LW, 200);
      for (let x = 30; x < LW; x += 110 + R() * 120) farMill(x, 302, .9 + R() * .4, "#5a6474", "#5a6474");
      [[420, 46], [1180, 38]].forEach(([x, h]) => { g.fillStyle = "#6a7484"; g.fillRect(x, 302 - h, 10, h); g.beginPath(); g.moveTo(x - 2, 302 - h); g.lineTo(x + 5, 302 - h - 18); g.lineTo(x + 12, 302 - h); g.fill(); });
      g.fillStyle = "#c9d4e2"; g.fillRect(0, 300, LW, 3);
    });
    out.mid = layerCanvas(() => {
      g.fillStyle = "#dbe5ef"; g.fillRect(0, 330, LW, 200);
      g.strokeStyle = "#a9bccf"; g.lineWidth = 2; for (let y = 340; y < 420; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(LW, y + (y % 3) * 2); g.stroke(); }
      // the dike with a row of windmills, like Kinderdijk
      const a = [[6, 3, 1], [3, 9, 2]];
      fillRidge(328, a, "#cdd9e6", "#f4f8ff");
      for (let x = 60; x < LW; x += 150 + R() * 60) farMill(x, ridge(328, a, x) + 2, 1.9, "#3e4a3a", "#f1ece0");
      for (let x = 0; x < LW; x += 40) { const r = R(); if (r < .5) continue; g.fillStyle = "#6a5a48"; g.fillRect(x, ridge(328, a, x) - 14, 4, 14); g.fillStyle = "rgba(106,90,72,.6)"; g.beginPath(); g.arc(x + 2, ridge(328, a, x) - 18, 8, 0, 7); g.fill(); }
    });
    out.near = layerCanvas(() => {
      const a = [[6, 4, 2], [4, 9, 1]];
      fillRidge(392, a, "#e6effa", "#ffffff");
      // reeds along the ditch
      g.strokeStyle = "#b8a77a"; g.lineWidth = 1.5;
      for (let x = 0; x < LW; x += 5) { const y = ridge(392, a, x) + 6, h = 10 + R() * 18; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - h); g.stroke(); }
    });
  } else if (scene === "grachten") {
    // canal houses with gables, the canal with reflections and houseboats, trees with lights
    out.far = layerCanvas(() => {
      let x = 0;
      while (x < LW) {
        const w = 34 + Math.floor(R() * 3) * 6, h = 90 + R() * 60, y = 330, v = Math.floor(R() * 3);
        g.fillStyle = ["#5a2e26", "#3a3e4a", "#6a4a32", "#4a2a2a", "#2e3a3a"][Math.floor(R() * 5)];
        g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h);
        if (v === 0) { const st = w / 6; [[0, 8], [st, 8], [st, 16], [2 * st, 16], [2 * st, 24], [4 * st, 24], [4 * st, 16], [5 * st, 16], [5 * st, 8], [w, 8], [w, 0]].forEach(([dx, dy]) => g.lineTo(x + dx, y - h - dy)); }
        else if (v === 1) { g.lineTo(x + w * .25, y - h); g.lineTo(x + w * .3, y - h - 20); g.lineTo(x + w * .7, y - h - 20); g.lineTo(x + w * .75, y - h); g.lineTo(x + w, y - h); }
        else { g.quadraticCurveTo(x + 2, y - h - 18, x + w / 2, y - h - 24); g.quadraticCurveTo(x + w - 2, y - h - 18, x + w, y - h); }
        g.lineTo(x + w, y); g.closePath(); g.fill();
        g.strokeStyle = "#f4f8ff"; g.lineWidth = 1.5; g.stroke();
        for (let r = 0; r < Math.floor(h / 22); r++) for (let c = 0; c < 2; c++) { g.fillStyle = R() < .55 ? "#ffd88a" : "#22283a"; g.fillRect(x + 6 + c * (w / 2 - 2), y - h + 8 + r * 22, 8, 12); }
        x += w + 2;
      }
    });
    out.mid = layerCanvas(() => {
      g.fillStyle = "#1a2a4a"; g.fillRect(0, 330, LW, 200);
      g.fillStyle = "rgba(255,216,138,.35)"; for (let x = 0; x < LW; x += 9) if (R() < .5) g.fillRect(x, 334 + R() * 40, 5, 1.5);
      for (let x = 80; x < LW; x += 260 + R() * 120) {
        g.fillStyle = "#3a5a3a"; g.fillRect(x, 336, 90, 14); g.fillStyle = "#6a4a32"; g.fillRect(x + 10, 322, 60, 14); g.fillStyle = "#ffd88a"; g.fillRect(x + 18, 326, 8, 6); g.fillRect(x + 44, 326, 8, 6);
      }
      // a bridge with lights
      [500, 1240].forEach(bx => { g.fillStyle = "#4a4250"; g.beginPath(); g.moveTo(bx, 330); g.quadraticCurveTo(bx + 70, 300, bx + 140, 330); g.lineTo(bx + 140, 340); g.lineTo(bx + 110, 340); g.quadraticCurveTo(bx + 70, 316, bx + 30, 340); g.lineTo(bx, 340); g.fill(); g.fillStyle = "#ffe08a"; for (let i = 0; i < 9; i++) { const t = i / 8; g.beginPath(); g.arc(bx + t * 140, 330 - Math.sin(t * Math.PI) * 30 + 6, 2, 0, 7); g.fill(); } });
    });
    out.near = layerCanvas(() => {
      for (let x = 20; x < LW; x += 120 + R() * 80) {
        const y = 404, h = 80 + R() * 30;
        g.strokeStyle = "#241f2c"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
        g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const by2 = y - h * .45 - i * h * .09, d = (i % 2 ? 1 : -1) * (18 + R() * 16); g.beginPath(); g.moveTo(x, by2); g.lineTo(x + d, by2 - 16 - R() * 10); g.stroke(); }
        for (let i = 0; i < 12; i++) { g.fillStyle = ["#ffe08a", "#ffffff"][i % 2]; g.beginPath(); g.arc(x + (R() - .5) * 60, y - h * .5 - R() * h * .5, 1.6, 0, 7); g.fill(); }
      }
    });
  } else if (scene === "duinen") {
    // the sea far away (with a lighthouse), dunes with marram grass, and pines
    out.far = layerCanvas(() => {
      g.fillStyle = "#6a8aaa"; g.fillRect(0, 290, LW, 200);
      g.fillStyle = "rgba(255,255,255,.4)"; for (let x = 0; x < LW; x += 20) g.fillRect(x + R() * 10, 296 + R() * 30, 12, 1.5);
      const lx = 980; for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#c8323a"; g.fillRect(lx, 290 - (i + 1) * 12, 10, 12); } g.fillStyle = "#ffe8a0"; g.fillRect(lx + 1, 212, 8, 6);
    });
    out.mid = layerCanvas(() => {
      const a = [[22, 3, 1], [14, 7, 2], [6, 15, 3]];
      fillRidge(330, a, "#e2d2a8", "#f4f8ff");
      g.strokeStyle = "#8a9a5a"; g.lineWidth = 1.2; for (let x = 0; x < LW; x += 7) { const y = ridge(330, a, x) + 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 8 - R() * 6); g.stroke(); }
    });
    out.near = layerCanvas(() => {
      const a = [[12, 4, 3], [7, 10, 1]];
      fillRidge(386, a, "#ece0bc", "#f8fbff");
      for (let x = 0; x < LW; x += 70) { const r = R(), y = ridge(386, a, x) + 10; if (r < .5) continue; wrapAt(x, xx => pineShape(xx, y, 70 + r * 50, "#2d5a3a", "#21482c", "#f4f8ff", "#173220")); }
    });
  }
  else if (scene === "smaland") {
    // Småland in summer: a blue lake, endless forest of pines and birches, red cottages with white corners
    out.far = layerCanvas(() => {
      fillRidge(262, [[44, 2, 1], [20, 6, 3], [9, 12, 2]], "#5a7a6a");
      g.fillStyle = "#2a6a9a"; g.fillRect(0, 300, LW, 200);
      g.fillStyle = "rgba(255,255,255,.45)"; for (let x = 0; x < LW; x += 18) g.fillRect(x + R() * 10, 304 + R() * 30, 10, 1.5);
      // the far shore: a dark line of spruce
      for (let x = 0; x < LW; x += 9) { const h = 14 + R() * 18; g.fillStyle = "#2a4a3a"; g.beginPath(); g.moveTo(x - 5, 300); g.lineTo(x, 300 - h); g.lineTo(x + 5, 300); g.fill(); }
    });
    out.mid = layerCanvas(() => {
      const a = [[12, 3, 1], [6, 8, 2]];
      fillRidge(338, a, "#5a9a4a", "#7ab85a");
      for (let x = 20; x < LW; x += 40 + R() * 46) {
        const y = ridge(338, a, x) + 6, r = R();
        if (r < .3) {
          // a red cottage with white corners and a white door
          const w = 34 + R() * 12, h = 22 + R() * 6;
          g.fillStyle = "#a8322a"; g.fillRect(x, y - h, w, h);
          g.fillStyle = "#f4f1ea"; g.fillRect(x, y - h, 3, h); g.fillRect(x + w - 3, y - h, 3, h); g.fillRect(x + 6, y - h + 6, 6, 6); g.fillRect(x + w - 12, y - h + 6, 6, 6); g.fillRect(x + w / 2 - 3, y - 12, 6, 12);
          g.fillStyle = "#3a3a3a"; g.beginPath(); g.moveTo(x - 4, y - h); g.lineTo(x + w / 2, y - h - 14); g.lineTo(x + w + 4, y - h); g.fill();
        } else if (r < .7) { pineShape(x, y + 4, 50 + R() * 40, "#2a5a3a", "#21482c", null, "#173220"); }
        else {
          // a birch: white trunk with black marks
          g.fillStyle = "#f4f1ea"; g.fillRect(x - 2, y - 46, 4, 46); g.fillStyle = "#2a2a2a"; for (let i = 0; i < 5; i++) g.fillRect(x - 2, y - 40 + i * 8, 2 + (i % 2) * 2, 1.5);
          g.fillStyle = "#6aa84a"; g.beginPath(); g.ellipse(x, y - 52, 13, 18, 0, 0, 7); g.fill(); g.fillStyle = "#8ac85a"; g.beginPath(); g.ellipse(x - 3, y - 56, 7, 10, 0, 0, 7); g.fill();
        }
      }
    });
    out.near = layerCanvas(() => {
      const a = [[10, 4, 2], [6, 9, 1]];
      fillRidge(392, a, "#6aa84a", "#8ac85a");
      for (let x = 0; x < LW; x += 7) { const y = ridge(392, a, x) + 4; g.strokeStyle = "#4a8a3a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 5 - R() * 7); g.stroke();
        if (R() < .12) { g.fillStyle = ["#f5d23a", "#f4f4f0", "#9a5ad8", "#e8423a"][Math.floor(R() * 4)]; g.beginPath(); g.arc(x + 2, y - 8, 2, 0, 7); g.fill(); } }
    });
  }
  else if (scene === "ardeche") {
    // The Ardèche gorge: pale limestone cliffs, the green river and the Pont d'Arc, a stone arch the river cut through the rock
    out.far = layerCanvas(() => {
      const back = [[26, 2, 1], [12, 6, 2], [5, 15, 3]], front = [[18, 3, 2], [8, 9, 1]];
      fillRidge(236, back, "#cdbb94");
      fillRidge(268, front, "#bfa982");
      // layers in the limestone and green scrub on top
      g.fillStyle = "rgba(120,96,64,.28)";
      for (let y = 250; y < 312; y += 9) for (let x = 0; x < LW; x += 30) if (R() < .6) g.fillRect(x + R() * 10, y + R() * 3, 18 + R() * 20, 1.5);
      for (let x = 0; x < LW; x += 6) if (R() < .5) { g.fillStyle = R() < .5 ? "#6a7a3a" : "#5a6a32"; g.beginPath(); g.arc(x, ridge(236, back, x) + 3, 3 + R() * 3, 0, 7); g.fill(); }
      g.fillStyle = "#3a9a88"; g.fillRect(0, 312, LW, 200);
      g.fillStyle = "rgba(230,250,240,.45)"; for (let x = 0; x < LW; x += 20) g.fillRect(x + R() * 10, 316 + R() * 28, 10, 1.5);
      // the Pont d'Arc: a rock bridge with the river flowing under it (the hole shows the cliffs and river behind)
      const ax = 700, aw = 210, top = 214, foot = 318;
      g.fillStyle = "#c4ae86"; g.beginPath();
      g.moveTo(ax, foot); g.lineTo(ax + 6, top + 30); g.quadraticCurveTo(ax + 20, top - 4, ax + 80, top); g.quadraticCurveTo(ax + 150, top - 8, ax + aw - 10, top + 22); g.lineTo(ax + aw, foot); g.closePath();
      g.moveTo(ax + 40, foot); g.ellipse(ax + aw / 2 + 4, foot, aw / 2 - 36, 72, 0, Math.PI, 0); g.closePath();
      g.fill("evenodd");
      g.fillStyle = "rgba(110,86,56,.35)"; for (let y = top + 12; y < top + 32; y += 7) g.fillRect(ax + 14, y, aw - 30, 1.5);
      for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#6a7a3a" : "#5a6a32"; g.beginPath(); g.arc(ax + 20 + i * 11, top + 1 + Math.sin(i) * 3, 4, 0, 7); g.fill(); }
      g.fillStyle = "rgba(230,250,240,.5)"; g.fillRect(ax + 60, 322, 70, 1.5);
    });
    out.mid = layerCanvas(() => {
      const a = [[16, 3, 1], [8, 8, 2]], top = x => ridge(338, a, x);
      fillRidge(338, a, "#a4a85c", "#bcbc6a");
      for (let x = 30; x < LW; x += 70 + R() * 70) {
        const r = R(), w = 50 + R() * 40;
        if (r < .25) {
          // a lavender field: purple rows
          for (let i = 0; i < w; i += 6) { const y = top(x + i); g.fillStyle = "#8a62c0"; g.fillRect(x + i, y - 5, 4, 7); g.fillStyle = "#a882d8"; g.fillRect(x + i, y - 5, 4, 2); }
        } else if (r < .5) {
          // a sunflower field: yellow heads on green
          for (let i = 0; i < w; i += 5) { const y = top(x + i); g.fillStyle = "#5a7a32"; g.fillRect(x + i + 1, y - 7, 1.5, 7); g.fillStyle = "#f2c42a"; g.beginPath(); g.arc(x + i + 2, y - 8, 2.4, 0, 7); g.fill(); }
        } else if (r < .7) {
          // a vineyard: rows of green
          for (let i = 0; i < w; i += 8) { const y = top(x + i); g.fillStyle = "#4a6a2a"; g.beginPath(); g.ellipse(x + i + 3, y - 4, 4, 4, 0, 0, 7); g.fill(); }
        } else if (r < .85) {
          // an old village on the hill: stone houses with tiled roofs and a church tower
          const base = groundUnder(top, x, 80) + 4;
          for (let i = 0; i < 5; i++) { const hx = x + i * 15, hh = 16 + (i * 7) % 12; g.fillStyle = ["#d8c49a", "#cbb48a", "#e0cfa8"][i % 3]; g.fillRect(hx, base - hh, 16, hh); g.fillStyle = "#b8603a"; g.fillRect(hx - 1, base - hh - 3, 18, 4); g.fillStyle = "#5a4a3a"; g.fillRect(hx + 6, base - hh + 6, 3, 4); }
          g.fillStyle = "#cbb48a"; g.fillRect(x + 32, base - 44, 12, 44); g.fillStyle = "#b8603a"; g.beginPath(); g.moveTo(x + 30, base - 44); g.lineTo(x + 38, base - 54); g.lineTo(x + 46, base - 44); g.fill();
          g.fillStyle = "#5a4a3a"; g.fillRect(x + 36, base - 38, 4, 6);
        } else {
          const y = top(x) + 4; g.fillStyle = "#2a4a2a"; g.beginPath(); g.ellipse(x, y - 18, 5, 18, 0, 0, 7); g.fill();
        }
      }
    });
    out.near = layerCanvas(() => {
      const a = [[10, 4, 2], [6, 9, 1]];
      fillRidge(392, a, "#8e9a4a", "#a8b05a");
      for (let x = 0; x < LW; x += 7) { const y = ridge(392, a, x) + 4; g.strokeStyle = "#7a8a3a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 5 - R() * 7); g.stroke();
        if (R() < .08) { g.fillStyle = ["#f2c42a", "#9a6ad8", "#f4f4f0"][Math.floor(R() * 3)]; g.beginPath(); g.arc(x + 2, y - 8, 2, 0, 7); g.fill(); } }
      for (let x = 20; x < LW; x += 60 + R() * 80) { const y = ridge(392, a, x) + 2; g.fillStyle = "#5a6a2a"; g.beginPath(); g.arc(x, y - 6, 9 + R() * 5, Math.PI, 0); g.fill(); }
    });
  }
  else if (scene === "laguna") {
    // the Venetian lagoon: flat water, low marsh islands, wooden channel poles, flamingos, Venice far away
    out.far = layerCanvas(() => {
      fillRidge(292, [[6, 2, 1], [3, 7, 2]], "#9ab0c0");
      // Venice on the horizon: towers and domes
      for (const vx of [380, 1150]) {
        g.fillStyle = "#8a98a8"; for (let i = 0; i < 14; i++) g.fillRect(vx + i * 9, 296 - 8 - (i * 7) % 12, 8, 14 + (i * 7) % 12);
        g.fillRect(vx + 50, 248, 9, 50); g.beginPath(); g.moveTo(vx + 48, 248); g.lineTo(vx + 54.5, 234); g.lineTo(vx + 61, 248); g.fill();
        g.beginPath(); g.arc(vx + 90, 286, 10, Math.PI, 0); g.fill();
      }
      g.fillStyle = "#3a8a96"; g.fillRect(0, 300, LW, 200);
      g.fillStyle = "rgba(230,250,250,.45)"; for (let x = 0; x < LW; x += 20) g.fillRect(x + R() * 10, 304 + R() * 30, 10, 1.5);
      // flamingos wading in the shallow water
      for (let x = 60; x < LW; x += 120 + R() * 160) for (let k = 0; k < 3 + R() * 4; k++) {
        const fx = x + k * 9 + R() * 4, fy = 318 + R() * 10;
        g.strokeStyle = "#e88a9a"; g.lineWidth = 1; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy - 9); g.stroke();
        g.fillStyle = "#f4a0b0"; g.beginPath(); g.ellipse(fx, fy - 11, 4, 2.5, 0, 0, 7); g.fill();
        g.strokeStyle = "#f4a0b0"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(fx + 3, fy - 12); g.quadraticCurveTo(fx + 6, fy - 18, fx + 4, fy - 20); g.stroke();
      }
      // groups of wooden poles that mark the channels
      for (let x = 30; x < LW; x += 90 + R() * 80) { g.fillStyle = "#6a5a48"; [0, 4, 8].forEach((d, i) => g.fillRect(x + d, 306 - (i === 1 ? 14 : 10), 2.5, 22)); }
    });
    out.mid = layerCanvas(() => {
      // low marsh islands (barene) with grass and the odd fisherman's hut
      const a = [[6, 3, 1], [3, 9, 2]];
      for (let x = 0; x < LW; x += 220 + R() * 140) {
        const w = 120 + R() * 120, y = 340;
        g.fillStyle = "#8a9a5a"; g.beginPath(); g.moveTo(x, y + 6); g.quadraticCurveTo(x + w / 2, y - 16, x + w, y + 6); g.fill();
        g.strokeStyle = "#6a7a3a"; g.lineWidth = 1; for (let i = 8; i < w - 8; i += 5) { g.beginPath(); g.moveTo(x + i, y + 2); g.lineTo(x + i + 1, y - 6 - R() * 6); g.stroke(); }
        if (R() < .5) { const hx = x + w * .4; g.fillStyle = "#7a5a3a"; g.fillRect(hx, y - 22, 3, 22); g.fillRect(hx + 22, y - 22, 3, 22); g.fillStyle = "#a07a4a"; g.fillRect(hx - 2, y - 36, 30, 14); g.fillStyle = "#c8a868"; g.beginPath(); g.moveTo(hx - 6, y - 36); g.lineTo(hx + 13, y - 50); g.lineTo(hx + 32, y - 36); g.fill(); }
      }
    });
    out.near = layerCanvas(() => {
      const a = [[8, 4, 2], [5, 9, 1]];
      fillRidge(396, a, "#d8c898", "#e8dab0");
      for (let x = 0; x < LW; x += 9) { const y = ridge(396, a, x) + 3; if (R() < .4) { g.strokeStyle = "#9aa060"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 6 - R() * 8); g.stroke(); } }
    });
  }
  else if (scene === "venezia" || scene === "burano") {
    // Venice (or Burano): the lagoon, rows of houses along the water, a bell tower, domes, gondolas
    const bur = scene === "burano";
    out.far = layerCanvas(() => {
      g.fillStyle = "#3a8a96"; g.fillRect(0, 300, LW, 200);
      g.fillStyle = "rgba(230,250,250,.4)"; for (let x = 0; x < LW; x += 20) g.fillRect(x + R() * 10, 306 + R() * 30, 10, 1.5);
      for (let x = 0; x < LW; x += 420) {
        // a bell tower (on Burano it leans: it really does) and domes
        g.save(); g.translate(x + 120, 300); if (bur) g.rotate(.06);
        g.fillStyle = bur ? "#d8c0a0" : "#b8584a"; g.fillRect(-8, -110, 16, 110);
        g.fillStyle = "#e8e0d0"; g.fillRect(-10, -122, 20, 12); g.fillStyle = bur ? "#a07a5a" : "#5a8a6a"; g.beginPath(); g.moveTo(-10, -122); g.lineTo(0, -150); g.lineTo(10, -122); g.fill();
        g.restore();
        if (!bur) { g.fillStyle = "#c8c0b0"; [[200, 18], [232, 22], [264, 18]].forEach(([dx, r]) => { g.beginPath(); g.arc(x + dx, 268, r, Math.PI, 0); g.fill(); g.fillRect(x + dx - r, 268, r * 2, 32); });
          // the long pink-and-white palace with arcades
          g.fillStyle = "#e8c8b8"; g.fillRect(x + 300, 262, 90, 38); g.fillStyle = "#c89a88"; for (let i = 0; i < 9; i++) g.fillRect(x + 304 + i * 10, 288, 6, 12); }
      }
    });
    out.mid = layerCanvas(() => {
      // houses straight out of the water: Venice in ochre and terracotta, Burano in bright colours
      const cols = bur ? ["#e84a4a", "#f2c42a", "#3a8ad8", "#4ab868", "#e87ab0", "#f28a2a", "#8a5ad8"] : ["#d8a868", "#c87858", "#e0c098", "#b86a4a", "#e8d0a8"];
      for (let x = 0; x < LW; ) {
        const w = 34 + R() * 26, h = 50 + R() * 50, y = 330;
        g.fillStyle = cols[Math.floor(R() * cols.length)]; g.fillRect(x, y - h, w, h);
        g.fillStyle = "rgba(0,0,0,.12)"; g.fillRect(x + w - 3, y - h, 3, h);
        g.fillStyle = "#b8584a"; g.fillRect(x - 2, y - h - 4, w + 4, 5);
        g.fillStyle = "#3a3a42"; for (let wy = y - h + 10; wy < y - 14; wy += 18) for (let wx = x + 6; wx < x + w - 8; wx += 12) { g.fillRect(wx, wy, 6, 10); if (!bur) { g.beginPath(); g.arc(wx + 3, wy, 3, Math.PI, 0); g.fill(); } }
        if (R() < .3) { g.fillStyle = "#6a5a48"; g.fillRect(x + w / 2 - 1, y - 2, 2, 14); }
        x += w + (R() < .25 ? 30 + R() * 40 : 0);
      }
      g.fillStyle = "#3a8a96"; g.fillRect(0, 330, LW, 200);
      g.fillStyle = "rgba(230,250,250,.4)"; for (let x = 0; x < LW; x += 16) g.fillRect(x + R() * 8, 334 + R() * 20, 8, 1.5);
      // gondolas on the water
      for (let x = 80; x < LW; x += 260 + R() * 200) { g.fillStyle = "#1d1d26"; g.beginPath(); g.moveTo(x, 338); g.quadraticCurveTo(x + 30, 346, x + 60, 338); g.quadraticCurveTo(x + 64, 330, x + 66, 326); g.lineTo(x + 58, 340); g.quadraticCurveTo(x + 30, 350, x + 2, 340); g.fill(); }
    });
    out.near = layerCanvas(() => {
      const a = [[4, 4, 2], [2, 9, 1]];
      fillRidge(398, a, "#9a9284", "#b0a898");
    });
  }
  else if (scene === "verona") {
    // Verona: cypress hills, a tall brick tower, terracotta roofs and the Roman Arena
    out.far = layerCanvas(() => {
      const a = [[20, 2, 1], [10, 6, 2]];
      fillRidge(262, a, "#8aa06a");
      for (let x = 10; x < LW; x += 18 + R() * 30) { const y = ridge(262, a, x) + 6; g.fillStyle = "#2a4a2a"; g.beginPath(); g.ellipse(x, y - 12, 3.5, 12, 0, 0, 7); g.fill(); }
      for (const tx of [260, 1040]) { g.fillStyle = "#b86a4a"; g.fillRect(tx, 200, 16, 120); g.fillStyle = "#e8d8c0"; g.fillRect(tx - 2, 190, 20, 12); g.fillStyle = "#b86a4a"; g.beginPath(); g.moveTo(tx - 2, 190); g.lineTo(tx + 8, 172); g.lineTo(tx + 18, 190); g.fill(); }
    });
    out.mid = layerCanvas(() => {
      // terracotta roofs
      for (let x = 0; x < LW; x += 30 + R() * 20) { const h = 30 + R() * 40, w = 30 + R() * 22; g.fillStyle = ["#e0c8a0", "#d8b088", "#e8d8b8"][Math.floor(R() * 3)]; g.fillRect(x, 340 - h, w, h); g.fillStyle = "#b8603a"; g.fillRect(x - 2, 340 - h - 6, w + 4, 7); }
      // the Arena: a huge oval of pink stone with rows of arches
      for (const ax of [520]) {
        const w = 420, top = 236;
        g.fillStyle = "#d8a88a"; g.beginPath(); g.moveTo(ax, 340); g.lineTo(ax, top + 14); g.quadraticCurveTo(ax + w / 2, top - 10, ax + w, top + 14); g.lineTo(ax + w, 340); g.fill();
        g.fillStyle = "#8a5a48";
        for (let row = 0; row < 3; row++) for (let i = 0; i < 18; i++) {
          const wx = ax + 10 + i * 22.5, wy = top + 24 + row * 30;
          g.beginPath(); g.moveTo(wx, wy + 20); g.lineTo(wx, wy + 6); g.arc(wx + 7, wy + 6, 7, Math.PI, 0); g.lineTo(wx + 14, wy + 20); g.fill();
        }
        g.fillStyle = "rgba(255,240,220,.35)"; g.fillRect(ax, top + 16, w, 3); g.fillRect(ax, top + 50, w, 2); g.fillRect(ax, top + 80, w, 2);
      }
    });
    out.near = layerCanvas(() => {
      const a = [[6, 4, 2], [3, 9, 1]];
      fillRidge(396, a, "#a89a84", "#c0b49c");
    });
  }
  else if (scene === "dolomiti") {
    // the Dolomites: pale, jagged towers of rock with a pink glow, green meadows and larch forests
    out.far = layerCanvas(() => {
      // The towers of rock stand on a broad base of scree and larch forest that runs down behind the meadows (the
      // middle layer starts at about 306), so the mountains never float above the hills.
      const foot = 410;
      g.fillStyle = "#d8c8c8";
      for (let x = -40; x < LW; x += 70 + R() * 60) {
        const h = 120 + R() * 110, w = 40 + R() * 50, base = 300;
        g.beginPath(); g.moveTo(x - 12, foot); g.lineTo(x, base);
        for (let i = 0; i <= 6; i++) g.lineTo(x + w * i / 6 + (R() - .5) * 8, base - h * (i % 2 ? .85 + R() * .15 : .6 + R() * .2) * (i === 0 || i === 6 ? .3 : 1));
        g.lineTo(x + w, base); g.lineTo(x + w + 12, foot); g.closePath(); g.fill();
      }
      // the three peaks, side by side
      const tx = 700; g.fillStyle = "#e0cccc";
      [[0, 150, 30], [36, 190, 36], [80, 160, 30]].forEach(([dx, h, w]) => { g.beginPath(); g.moveTo(tx + dx - 10, foot); g.lineTo(tx + dx, 300); g.lineTo(tx + dx + w * .2, 300 - h); g.lineTo(tx + dx + w * .7, 300 - h + 6); g.lineTo(tx + dx + w, 300); g.lineTo(tx + dx + w + 10, foot); g.closePath(); g.fill(); });
      // the pink glow of sunset and the dark lines of the cliffs: only on the rock, never on the sky
      g.globalCompositeOperation = "source-atop";
      g.fillStyle = "rgba(240,150,165,.3)"; g.fillRect(0, 0, LW, 300);
      g.strokeStyle = "rgba(120,100,110,.35)"; g.lineWidth = 1.2; for (let x = 0; x < LW; x += 11) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x + 2, 200 + R() * 60); g.stroke(); }
      g.globalCompositeOperation = "source-over";
      // the foot of the mountains, all along: grey scree slopes, then dark larch forest further down
      const scree = [[14, 3, 1], [7, 9, 3]], wood = [[10, 4, 2], [6, 11, 4]];
      g.fillStyle = "#b9a8ac"; g.beginPath(); g.moveTo(0, foot); for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(292, scree, x)); g.lineTo(LW, foot); g.fill();
      g.strokeStyle = "rgba(120,100,110,.25)"; g.lineWidth = 1; for (let x = 0; x < LW; x += 9) { const y = ridge(292, scree, x); g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x + 5, y + 16 + R() * 10); g.stroke(); }
      g.fillStyle = "#4f7a52"; g.beginPath(); g.moveTo(0, foot); for (let x = 0; x <= LW; x += 6) g.lineTo(x, ridge(312, wood, x)); g.lineTo(LW, foot); g.fill();
      for (let x = 0; x < LW; x += 9 + R() * 8) { const y = ridge(312, wood, x) + 3; pineShape(x, y, 14 + R() * 10, "#46704a", "#3c6440", null, "#2c4a30"); }
    });
    out.mid = layerCanvas(() => {
      const a = [[16, 3, 1], [8, 8, 2]];
      fillRidge(330, a, "#5a9a4a", "#7ab85a");
      for (let x = 0; x < LW; x += 12 + R() * 22) { const y = ridge(330, a, x) + 6; pineShape(x, y, 34 + R() * 28, "#3a6a3a", "#2e5a30", null, "#1e3a20"); }
      // an alpine meadow in front of the forest: the cows graze here (it is this layer's ground for them)
      const m = [[5, 3, 1], [3, 8, 2]];
      fillRidge(354, m, "#78b456", "#94cc6a");
      LAYER_GROUND = { base: 354, amps: m };
      for (let x = 0; x < LW; x += 9) { const y = ridge(354, m, x) + 5 + R() * 10; if (R() < .25) { g.fillStyle = ["#f4f4f0", "#f5d23a", "#9a5ad8"][Math.floor(R() * 3)]; g.fillRect(x, y, 2, 2); } }
    });
    out.near = layerCanvas(() => {
      const a = [[10, 4, 2], [6, 9, 1]];
      fillRidge(392, a, "#6aaa4a", "#8ac85a");
      for (let x = 0; x < LW; x += 7) { const y = ridge(392, a, x) + 4; if (R() < .15) { g.fillStyle = ["#f4f4f0", "#f5d23a", "#9a5ad8", "#e8423a"][Math.floor(R() * 4)]; g.beginPath(); g.arc(x + 2, y - 6, 2, 0, 7); g.fill(); } }
    });
  }
  else if (scene === "grotte") {
    // inside the Chauvet Cave: a pale rock wall with paintings in charcoal and red ochre, stalactites above, a rocky floor
    out.far = layerCanvas(() => {
      g.fillStyle = "#7a6650"; g.fillRect(0, 30, LW, 400);
      for (let i = 0; i < 260; i++) { g.fillStyle = R() < .5 ? "rgba(60,44,30,.18)" : "rgba(200,180,150,.16)"; g.beginPath(); g.ellipse(R() * LW, 40 + R() * 380, 10 + R() * 40, 4 + R() * 14, R(), 0, 7); g.fill(); }
      // a lighter band of wall where the paintings are
      g.fillStyle = "rgba(220,200,168,.35)"; g.fillRect(0, 120, LW, 170);
      const art = ["horses", "lions", "mammoth", "hands", "rhino", "dots", "bear", "horses"];
      art.forEach((k, i) => caveArt(k, 90 + i * 186 + R() * 40, 210 + R() * 40));
      // the ceiling: dark rock with hanging stalactites
      g.fillStyle = "#2a2018"; g.beginPath(); g.moveTo(0, 0); g.lineTo(LW, 0); g.lineTo(LW, 50);
      for (let x = LW; x >= 0; x -= 12) g.lineTo(x, 46 + Math.sin(x * .03) * 12 + R() * 8);
      g.closePath(); g.fill();
      for (let x = 10; x < LW; x += 14 + R() * 30) { const h = 16 + R() * 40, w = 4 + R() * 6; g.fillStyle = "#3a2e22"; g.beginPath(); g.moveTo(x - w, 50); g.lineTo(x, 50 + h); g.lineTo(x + w, 50); g.fill(); g.fillStyle = "rgba(220,200,160,.25)"; g.fillRect(x - 1, 52, 1.5, h * .7); }
    });
    out.mid = layerCanvas(() => {
      // columns where a stalactite and a stalagmite grew together
      for (let x = 120; x < LW; x += 300 + R() * 160) {
        const w = 18 + R() * 12;
        g.fillStyle = "#4a3c2e"; g.beginPath(); g.moveTo(x - w, 0); g.quadraticCurveTo(x - w * .3, 200, x - w * 1.3, 420); g.lineTo(x + w * 1.3, 420); g.quadraticCurveTo(x + w * .3, 200, x + w, 0); g.fill();
        g.fillStyle = "rgba(220,200,160,.18)"; g.fillRect(x - 3, 0, 3, 420);
      }
    });
    out.near = layerCanvas(() => {
      const a = [[10, 4, 2], [6, 9, 1]];
      fillRidge(396, a, "#3a2e24", "#54463a");
      for (let x = 20; x < LW; x += 30 + R() * 50) { const y = ridge(396, a, x) + 2, h = 10 + R() * 26; g.fillStyle = "#5a4a3a"; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x, y - h); g.lineTo(x + 6, y); g.fill(); }
    });
  }
  else if (scene === "highlands") {
    // Layered Highland ridges, a deep loch and stone castles in long summer light.
    out.far = layerCanvas(() => {
      const back = [[48, 3, 1], [27, 8, 2], [12, 15, 3]], front = [[32, 4, 2], [17, 10, 1]];
      fillRidge(260, back, "#647878");
      fillRidge(286, front, "#526b67");
      g.fillStyle = "#315c70"; g.fillRect(0, 300, LW, 200);
      g.fillStyle = "rgba(220,240,240,.42)";
      for (let x = 0; x < LW; x += 22) g.fillRect(x + R() * 12, 306 + R() * 34, 12, 1.5);
      for (let x = 130; x < LW; x += 390) {
        const y = 302 + R() * 5, w = 80 + R() * 55;
        g.fillStyle = "#45594f"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w * .5, y - 16, x + w, y); g.fill();
      }
      // a small ruined castle on the highest hilltop, standing on the lowest point under its walls so it never floats
      const cx = 544, base = groundUnder(x => Math.min(ridge(260, back, x), ridge(286, front, x)), cx, 60) + 3;
      g.fillStyle = "#6b6d64"; g.fillRect(cx + 6, base - 43, 48, 43); g.fillRect(cx, base - 59, 14, 59); g.fillRect(cx + 45, base - 53, 14, 53);
      g.fillStyle = "#565b55";
      battlements(cx, cx + 14, base - 59, 4); battlements(cx + 17, cx + 42, base - 43, 4); battlements(cx + 45, cx + 59, base - 53, 4);
      g.fillRect(cx + 23, base - 26, 9, 26);
    });
    out.mid = layerCanvas(() => {
      const a = [[18, 4, 1], [9, 9, 2]];
      fillRidge(340, a, "#557253", "#78905d");
      for (let x = 22; x < LW; x += 160 + R() * 130) {
        const w = 42 + R() * 26, h = 28 + R() * 16, y = groundUnder(xx => ridge(340, a, xx), x, w) + 2;
        g.fillStyle = "#74766c"; g.fillRect(x, y - h, w, h);
        g.fillStyle = "#555d58"; g.fillRect(x + 6, y - h + 8, w - 12, 3);
        g.fillRect(x + 11, y - 11, 8, 11); g.fillRect(x + w - 19, y - 11, 8, 11);
        g.fillStyle = "#4a5a51"; g.fillRect(x + w * .48, y - 21, 8, 21);
        g.fillStyle = "#6c7065"; g.fillRect(x - 4, y - h - 4, w + 8, 6);
      }
      for (let x = 0; x < LW; x += 8) if (R() < .35) {
        const y = ridge(340, a, x) + 2;
        g.fillStyle = ["#8b6680", "#ac7791", "#d0b38a"][Math.floor(R() * 3)];
        g.fillRect(x, y - 5 - R() * 8, 2, 2);
      }
    });
    out.near = layerCanvas(() => {
      const a = [[11, 4, 2], [6, 9, 1]];
      fillRidge(392, a, "#60794b", "#83945e");
      for (let x = 0; x < LW; x += 7) {
        const y = ridge(392, a, x) + 4;
        g.strokeStyle = "#75855a"; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 5 - R() * 7); g.stroke();
      }
    });
  }
  else if (scene === "adriatic") {
    // the summer sea with islands, the grey coastal mountains behind (like the Velebit and the Biokovo)
    out.far = layerCanvas(() => {
      fillRidge(250, [[50, 2, 1], [26, 5, 3], [10, 11, 2]], "#8a9ab0");
      fillRidge(275, [[30, 3, 2], [14, 8, 1]], "#7a8aa0");
      g.fillStyle = "#2aa0c8"; g.fillRect(0, 300, LW, 200);
      for (let x = 40; x < LW; x += 220 + R() * 160) { const w = 80 + R() * 140, h = 14 + R() * 22; g.fillStyle = "#6a8a6a"; g.beginPath(); g.moveTo(x, 302); g.quadraticCurveTo(x + w / 2, 302 - h * 2, x + w, 302); g.fill(); }
      g.fillStyle = "rgba(255,255,255,.55)"; for (let x = 0; x < LW; x += 16) g.fillRect(x + R() * 10, 306 + R() * 40, 10, 1.5);
    });
    out.mid = layerCanvas(() => {
      const a = [[12, 3, 1], [6, 8, 2]];
      fillRidge(340, a, "#c8b896", "#e8dcc0");
      for (let x = 20; x < LW; x += 46 + R() * 50) { const y = ridge(340, a, x) + 6, r = R();
        if (r < .45) { g.fillStyle = "#3a5a2a"; g.beginPath(); g.ellipse(x, y - 34, 26, 12, 0, 0, 7); g.fill(); g.fillStyle = "#5a4030"; g.fillRect(x - 2, y - 26, 4, 26); }
        else if (r < .7) { g.fillStyle = "#2a4a2a"; g.beginPath(); g.ellipse(x, y - 30, 6, 30, 0, 0, 7); g.fill(); }
        else { g.fillStyle = "#f1e8d6"; g.fillRect(x, y - 24, 30, 24); g.fillStyle = "#c8583a"; g.beginPath(); g.moveTo(x - 3, y - 24); g.lineTo(x + 15, y - 34); g.lineTo(x + 33, y - 24); g.fill(); g.fillStyle = "#3a6a4a"; g.fillRect(x + 5, y - 18, 5, 7); g.fillRect(x + 19, y - 18, 5, 7); } }
    });
    out.near = layerCanvas(() => {
      const a = [[10, 4, 2], [6, 9, 1]];
      fillRidge(392, a, "#d8c8a6", "#efe4cc");
      for (let x = 0; x < LW; x += 9) { const y = ridge(392, a, x) + 4; g.strokeStyle = "#8a8a3a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 6 - R() * 6); g.stroke(); }
    });
  } else if (scene === "oldtown") {
    // a walled old town of pale stone with terracotta roofs, a bell tower and the sea
    out.far = layerCanvas(() => {
      fillRidge(220, [[40, 2, 2], [20, 6, 1]], "#9aa6b2");
      g.fillStyle = "#2aa0c8"; g.fillRect(0, 330, LW, 200);
    });
    out.mid = layerCanvas(() => {
      // the city wall with towers
      g.fillStyle = "#d8c8a6"; g.fillRect(0, 300, LW, 40);
      for (let x = 0; x < LW; x += 14) { g.fillStyle = "#c8b896"; g.fillRect(x, 292, 9, 8); }
      for (let x = 80; x < LW; x += 300) { g.fillStyle = "#d0c09e"; g.fillRect(x, 248, 46, 92); for (let i = 0; i < 4; i++) g.fillRect(x + i * 12, 240, 8, 8); g.fillStyle = "#8a7a5a"; g.fillRect(x + 20, 270, 6, 12); }
      // roofs inside the walls
      for (let x = 0; x < LW; x += 28 + R() * 14) { const h = 10 + R() * 26, w = 26 + R() * 10; g.fillStyle = ["#f1e8d6", "#e8dcc0", "#ece4d2"][Math.floor(R() * 3)]; g.fillRect(x, 300 - h, w, h); g.fillStyle = ["#c8583a", "#b84a30", "#d8683a"][Math.floor(R() * 3)]; g.beginPath(); g.moveTo(x - 3, 300 - h); g.lineTo(x + w / 2, 300 - h - 10); g.lineTo(x + w + 3, 300 - h); g.fill(); }
      // the bell tower
      const bx = 760; g.fillStyle = "#e8dcc0"; g.fillRect(bx, 170, 30, 130); g.fillStyle = "#3a2a1a"; g.fillRect(bx + 10, 190, 10, 16); g.fillStyle = "#4a7a6a"; g.beginPath(); g.moveTo(bx - 4, 170); g.lineTo(bx + 15, 140); g.lineTo(bx + 34, 170); g.fill();
    });
    out.near = layerCanvas(() => {
      g.fillStyle = "#e6dac0"; g.fillRect(0, 392, LW, 40);
      for (let x = 30; x < LW; x += 140 + R() * 80) { g.fillStyle = "#2a4a2a"; g.beginPath(); g.ellipse(x, 340, 9, 52, 0, 0, 7); g.fill(); g.fillStyle = "#3a5a3a"; g.beginPath(); g.ellipse(x - 2, 336, 5, 44, 0, 0, 7); g.fill(); }
    });
  } else if (scene === "falls") {
    // green hills, waterfalls tumbling into turquoise lakes (Krka, Plitvice)
    out.far = layerCanvas(() => {
      fillRidge(230, [[40, 2, 1], [20, 5, 2], [8, 13, 3]], "#5a8a5a");
      fillRidge(270, [[24, 3, 2], [10, 9, 1]], "#4a7a4a");
    });
    out.mid = layerCanvas(() => {
      const a = [[18, 3, 1], [8, 7, 2]];
      fillRidge(300, a, "#3f6f3f", "#5a8a4a");
      g.fillStyle = "#3ab0a0"; g.fillRect(0, 330, LW, 200);
      for (let x = 60; x < LW; x += 200 + R() * 120) {
        const top = ridge(300, a, x + 20) + 4, w = 30 + R() * 30;
        const wg = g.createLinearGradient(0, top, 0, 334); wg.addColorStop(0, "#e8fbff"); wg.addColorStop(1, "#9ae0e8");
        g.fillStyle = wg; g.fillRect(x, top, w, 334 - top);
        g.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 5; i++) g.fillRect(x + 3 + i * w / 5, top, 2, 334 - top);
        g.fillStyle = "#f4ffff"; g.beginPath(); g.ellipse(x + w / 2, 336, w * .7, 5, 0, 0, 7); g.fill();
      }
      for (let x = 0; x < LW; x += 22) { const r = R(); if (r < .5) continue; g.fillStyle = "#2a5a3a"; g.beginPath(); g.arc(x, ridge(300, a, x) - 4, 10 + r * 8, 0, 7); g.fill(); }
    });
    out.near = layerCanvas(() => {
      const a = [[10, 4, 2], [6, 9, 1]];
      fillRidge(392, a, "#4a7a3a", "#6a9a4a");
      for (let x = 0; x < LW; x += 40) { const r = R(); if (r < .4) continue; g.fillStyle = "#2e5a2e"; g.beginPath(); g.arc(x, ridge(392, a, x) - 10, 18 + r * 10, 0, 7); g.fill(); g.fillStyle = "#3a6a34"; g.beginPath(); g.arc(x - 5, ridge(392, a, x) - 16, 10, 0, 7); g.fill(); }
    });
  }
  return LAYERS[scene] = out;
}
/** Northern lights: a few slow, wavy green and purple curtains (cheap: three paths per frame). */
function drawAurora(strength) {
  const cols = [["rgba(90,255,170,", 150], ["rgba(120,230,255,", 110], ["rgba(190,120,255,", 80]];
  for (let k = 0; k < 3; k++) {
    const [c, base] = cols[k], amp = 26 + k * 8;
    g.fillStyle = grad("aurora" + k, () => { const gr = g.createLinearGradient(0, base - 70, 0, base + 60); gr.addColorStop(0, c + "0)"); gr.addColorStop(.55, c + (.38 * strength).toFixed(2) + ")"); gr.addColorStop(1, c + "0)"); return gr; });
    g.beginPath(); g.moveTo(0, base + 60);
    for (let x = 0; x <= viewW + 24; x += 24) g.lineTo(x, base - 50 + Math.sin(x * .006 + frame * .008 + k * 2) * amp + Math.sin(x * .017 - frame * .011) * 10);
    g.lineTo(viewW + 24, base + 60); g.fill();
  }
}
function drawSceneSky(scene) {
  const skies = { pole: ["#061024", "#14385a", "#3a6f92"], alps: ["#1a2a5a", "#5a6aa8", "#e0a5a0"], fjord: ["#050b22", "#1a2350", "#3b3f7a"],
    polder: ["#4a6488", "#8ea6c4", "#d8c8b8"], grachten: ["#0a1430", "#2a3466", "#6a5a82"], duinen: ["#5a7ca8", "#a8c4dc", "#f0dcc0"],
    adriatic: ["#2a7ad8", "#7ac0f0", "#d8f0fa"], smaland: ["#3a7ad8", "#9ad0f0", "#eef8f4"], oldtown: ["#3a7ad0", "#f0b878", "#f8d8a8"], falls: ["#3a8ad8", "#9ad0f0", "#e0f4f8"],
    highlands: ["#7298b1", "#bdd0ce", "#f2dbac"], ardeche: ["#2a78d0", "#8ac6ee", "#f6e6c0"], laguna: ["#3a80d0", "#a0d0ee", "#f6e0c8"], venezia: ["#3a7ad0", "#9acaee", "#f8e2c4"], burano: ["#3a80d8", "#a0d4f2", "#f4ecd8"], verona: ["#2a5aa8", "#e8a888", "#f8d8a8"], dolomiti: ["#2a6ad0", "#8ac0ee", "#f0e4f0"], grotte: ["#0e0a08", "#1e1610", "#2e2218"] }[scene];
  g.fillStyle = grad("sky-" + scene, () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, skies[0]); gr.addColorStop(.62, skies[1]); gr.addColorStop(1, skies[2]); return gr; });
  g.fillRect(0, 0, viewW, VIEW_H);
  if (scene === "grotte") return; // inside a cave: no sun, no stars
  g.fillStyle = "#fff";
  if (scene === "adriatic" || scene === "oldtown" || scene === "falls" || scene === "smaland" || scene === "highlands" || scene === "ardeche" || scene === "laguna" || scene === "venezia" || scene === "burano" || scene === "verona" || scene === "dolomiti") {
    // summer: a big warm sun, no stars
    const sx = viewW * (scene === "oldtown" || scene === "ardeche" ? .78 : scene === "highlands" ? .76 : .2), sy = scene === "oldtown" ? 150 : scene === "highlands" ? 74 : 80;
    g.fillStyle = grad("sun-" + scene, () => { const sg = g.createRadialGradient(sx, sy, 10, sx, sy, 160); sg.addColorStop(0, "rgba(255,250,210,1)"); sg.addColorStop(.25, "rgba(255,236,160,.7)"); sg.addColorStop(1, "rgba(255,236,160,0)"); return sg; });
    g.fillRect(sx - 160, sy - 160, 320, 320);
    g.fillStyle = "#fff8d8"; g.beginPath(); g.arc(sx, sy, 30, 0, 7); g.fill();
    return;
  }
  const starA = { alps: .5, polder: .15, duinen: 0 }[scene] ?? 1;
  if (starA) for (let i = 0; i < 70; i++) { g.globalAlpha = (.3 + .6 * Math.abs(Math.sin(frame / (30 + i % 13) + i))) * starA; g.fillRect(((hash(i * 3) * 3000) % viewW + viewW) % viewW, hash(i * 7) * 220, 2, 2); }
  g.globalAlpha = 1;
  if (scene === "pole" || scene === "fjord") drawAurora(scene === "fjord" ? 1 : .8);
}

/** De rijen van een laag waar iets op staat (de rest is doorzichtig), met 2 lege rijen marge zodat de randen precies hetzelfde blijven. */
function layerBand(cnv) {
  if (cnv._band) return cnv._band;
  let top = 0, bot = cnv.height;
  try {
    const d = cnv.getContext("2d").getImageData(0, 0, cnv.width, cnv.height).data, w = cnv.width;
    const filled = y => { for (let i = (y * w) * 4 + 3, e = i + w * 4; i < e; i += 4) if (d[i]) return true; return false; };
    while (top < cnv.height && !filled(top)) top++;
    while (bot > top && !filled(bot - 1)) bot--;
    top = Math.max(0, top - 2); bot = Math.min(cnv.height, bot + 2);
  } catch (e) { top = 0; bot = cnv.height; }
  return (cnv._band = [top, Math.max(0, bot - top)]);
}
// Teken alleen de strook waar iets op staat: scheelt veel schilderwerk per beeld (vooral op tv's en tragere toestellen).
function drawLayer(cnv, off) {
  const [y0, h] = layerBand(cnv);
  if (!h) return;
  let x = -(((off % LW) + LW) % LW);
  for (; x < viewW; x += LW) g.drawImage(cnv, 0, y0, LW, h, x, y0, LW, h);
}

/* ---------- Interieur (hele level in één keer getekend) ---------- */
function buildInterior() {
  const W = L.w * TS, c = mk(W, VIEW_H);
  withCtx(c.getContext("2d"), () => {
    const R = rng(99);
    for (let x = 0; x < L.w; x++) {
      const zone = L.d.fixedInterior ? (x < 50 ? 0 : x < 90 ? 1 : x < 133 ? 2 : 0) : Math.floor(x / 48) % 3;
      const px = x * TS, fy = groundTop(x) * TS;
      if (L.d.interior === "wood") {
        // a Tirolean hut or chalet: pine panelling, a darker wainscot and little hearts cut in the wood
        g.fillStyle = zone === 1 ? "#d09a62" : "#c88f56"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "#b47c46"; g.fillRect(px, 0, 2, VIEW_H); g.fillRect(px + 15, 0, 1, VIEW_H);
        g.fillStyle = "#8a5a32"; g.fillRect(px, fy - 110, TS, 110); g.fillStyle = "#6e4426"; g.fillRect(px, fy - 112, TS, 4);
        if (x % 4 === 0) { g.fillStyle = "#6e4426"; g.beginPath(); g.arc(px + 13, fy - 62, 4, 0, 7); g.arc(px + 19, fy - 62, 4, 0, 7); g.fill(); g.beginPath(); g.moveTo(px + 9, fy - 60); g.lineTo(px + 16, fy - 52); g.lineTo(px + 23, fy - 60); g.fill(); }
        g.fillStyle = "#6e4426"; g.fillRect(px, 0, TS, 16);
        continue;
      }
      if (L.d.interior === "workshop") {
        // Santa's workshop: red and white striped walls, a green wainscot and a garland of lights
        g.fillStyle = (x % 2) ? "#c8323a" : "#f4ece0"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = zone === 2 ? "#2a7a4a" : "#2f6a3a"; g.fillRect(px, fy - 96, TS, 96); g.fillStyle = "#e8c45a"; g.fillRect(px, fy - 98, TS, 4);
        g.fillStyle = ["#ffd25e", "#ff6b6b", "#59c28a", "#5aa8ff"][x % 4]; g.beginPath(); g.arc(px + 16, 34 + Math.sin(x * 1.3) * 6, 4, 0, 7); g.fill();
        g.fillStyle = "#1f4a2f"; g.fillRect(px, 0, TS, 18);
        continue;
      }
      if (zone === 0) {
        g.fillStyle = "#efe3cf"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "#e3d3b8"; for (let y = 24; y < fy; y += 24) { const o = (y / 24) % 2 ? 16 : 0; g.save(); g.translate(px + 8 + o / 2, y); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
      } else if (zone === 1) {
        g.fillStyle = "#e9eef1"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "#d3dde3"; g.fillRect(px, 0, 1, VIEW_H); for (let y = 0; y < VIEW_H; y += 16) g.fillRect(px, y, TS, 1);
        g.fillStyle = "#d8b48a"; g.fillRect(px, fy - 120, TS, 120);
        g.fillStyle = "#b8936a"; for (let i = 0; i < TS; i += 8) g.fillRect(px + i, fy - 120, 2, 120);
      } else {
        g.fillStyle = (x % 2) ? "#ecd8d4" : "#e4ccc7"; g.fillRect(px, 0, TS, VIEW_H);
        g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(px + 15, 0, 2, VIEW_H);
      }
      if (zone !== 1) {
        g.fillStyle = "#f5efe4"; g.fillRect(px, fy - 96, TS, 96);
        g.fillStyle = "#d9cdb8"; g.fillRect(px, fy - 98, TS, 4);
        if (x % 3 === 0) { g.strokeStyle = "#ddd2bf"; g.lineWidth = 2; g.strokeRect(px + 6, fy - 84, TS * 3 - 12, 64); }
      }
      g.fillStyle = "#ffffff"; g.fillRect(px, fy - 12, TS, 12); g.fillStyle = "#d4cbbd"; g.fillRect(px, fy - 13, TS, 2);
      g.fillStyle = "#f8f3ea"; g.fillRect(px, 0, TS, 14); g.fillStyle = "#d9cdb8"; g.fillRect(px, 14, TS, 3);
    }
    const win = (x, fy) => {
      const px = x * TS, top = fy - 230;
      g.fillStyle = "#6e5a46"; g.fillRect(px - 26, top - 16, 132, 6);
      const wg = g.createLinearGradient(0, top, 0, top + 110); wg.addColorStop(0, "#14244a"); wg.addColorStop(1, "#4d6ea6");
      g.fillStyle = "#fff"; g.fillRect(px - 6, top - 6, 92, 124); g.fillStyle = wg; g.fillRect(px, top, 80, 112);
      g.fillStyle = "#f6f2dc"; g.beginPath(); g.arc(px + 60, top + 22, 9, 0, 7); g.fill();
      g.fillStyle = "#d9e5f5"; g.beginPath(); g.moveTo(px, top + 112); g.quadraticCurveTo(px + 30, top + 72, px + 80, top + 92); g.lineTo(px + 80, top + 112); g.fill();
      [[14, 96, 26], [40, 92, 34], [66, 98, 22]].forEach(([dx, y, h]) => pineShape(px + dx, top + y, h, "#1e3b4c", "#163040", "#eef4ff"));
      g.fillStyle = "#fff"; for (let i = 0; i < 14; i++) g.fillRect(px + R() * 78, top + R() * 100, 2, 2);
      g.fillStyle = "#fff"; g.fillRect(px + 38, top, 4, 112); g.fillRect(px, top + 54, 80, 4);
      g.fillStyle = "#e8e2d6"; g.fillRect(px - 10, top + 118, 100, 7);
      ["#b5453a", "#3f7f8a", "#8a6bb0"].forEach((col, i) => { if (i !== (x % 3)) return;
        [px - 24, px + 80].forEach(cx => { g.fillStyle = col; g.fillRect(cx, top - 10, 24, 140); g.fillStyle = shade(col, -.25); for (let k = 3; k < 24; k += 7) g.fillRect(cx + k, top - 10, 2, 140); g.fillStyle = shade(col, .2); g.fillRect(cx, top - 10, 24, 4); });
      });
    };
    const frame2 = (px, y, w, h, kind) => {
      g.fillStyle = "#8a6a3a"; g.fillRect(px - 5, y - 5, w + 10, h + 10); g.fillStyle = "#c9a45a"; g.fillRect(px - 3, y - 3, w + 6, h + 6);
      if (kind === 0) { g.fillStyle = "#9fd0ea"; g.fillRect(px, y, w, h); g.fillStyle = "#5fa05a"; g.beginPath(); g.moveTo(px, y + h); g.quadraticCurveTo(px + w * .4, y + h * .3, px + w, y + h * .7); g.lineTo(px + w, y + h); g.fill(); g.fillStyle = "#ffd25e"; g.beginPath(); g.arc(px + w * .75, y + h * .3, 5, 0, 7); g.fill(); }
      else if (kind === 1) {
        g.fillStyle = "#fffdf5"; g.fillRect(px, y, w, h);
        g.strokeStyle = "#c43a3a"; g.lineWidth = 1.5; g.strokeRect(px + w * .3, y + h * .35, w * .4, h * .35); g.beginPath(); g.moveTo(px + w * .25, y + h * .37); g.lineTo(px + w * .5, y + h * .15); g.lineTo(px + w * .75, y + h * .37); g.stroke();
        const cols = ["#e8553f", "#3fb0a3", "#f2a93b", "#b67ad9", "#3d7fd9", "#d9497a", "#4fae55", "#f07d2f", "#27b2d6"];
        cols.forEach((c2, i) => { const sx = px + 4 + i * (w - 8) / 8, sy = y + h - 6; g.strokeStyle = c2; g.beginPath(); g.arc(sx, sy - 9, 2, 0, 7); g.moveTo(sx, sy - 7); g.lineTo(sx, sy - 2); g.moveTo(sx - 2, sy); g.lineTo(sx, sy - 2); g.lineTo(sx + 2, sy); g.stroke(); });
      } else { g.fillStyle = "#34506e"; g.fillRect(px, y, w, h); g.fillStyle = "#e2a34a"; g.beginPath(); g.arc(px + w / 2, y + h / 2, h / 3, 0, 7); g.fill(); g.fillStyle = "#c85a3a"; g.fillRect(px + 4, y + h - 10, w - 8, 6); }
    };
    const lamp = (px, fy) => {
      const cone = g.createLinearGradient(0, 60, 0, fy); cone.addColorStop(0, "rgba(255,226,150,.38)"); cone.addColorStop(1, "rgba(255,226,150,0)");
      g.fillStyle = cone; g.beginPath(); g.moveTo(px - 10, 66); g.lineTo(px + 10, 66); g.lineTo(px + 70, fy); g.lineTo(px - 70, fy); g.fill();
      g.fillStyle = "#333"; g.fillRect(px - 1, 14, 2, 40);
      g.fillStyle = "#2d2d2d"; g.beginPath(); g.moveTo(px - 16, 66); g.lineTo(px + 16, 66); g.lineTo(px + 8, 50); g.lineTo(px - 8, 50); g.fill();
      g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(px, 66, 12, 3, 0, 0, 7); g.fill();
    };
    const fixed = L.d.fixedInterior;
    (fixed ? [5, 18, 27, 57, 70, 95, 116, 138] : Array.from({ length: Math.floor(L.w / 13) }, (_, i) => 5 + i * 13)).forEach(x => win(x, groundTop(x) * TS));
    if (fixed) { frame2(12 * TS, 120, 60, 44, 0); frame2(41 * TS, 140, 50, 40, 2); frame2(99 * TS, 120, 80, 56, 1); frame2(122 * TS, 120, 54, 40, 0); frame2(64 * TS, 170, 44, 34, 2); }
    else for (let x = 11, i = 0; x < L.w - 4; x += 26, i++) frame2(x * TS, 120 + (i % 2) * 30, 56, 42, i % 3);
    (fixed ? [9, 24, 36, 47, 62, 80, 101, 112, 127, 142] : Array.from({ length: Math.floor(L.w / 12) }, (_, i) => 9 + i * 12)).forEach(x => lamp(x * TS + 16, groundTop(x) * TS));
    g.font = "600 13px Fredoka, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle";
    (L.d.labels || T([["Level 0", 2], ["Level 1 · wellness", 53], ["Level 2", 93], ["Terrace →", 136]], [["Niveau 0", 2], ["Niveau 1 · wellness", 53], ["Niveau 2", 93], ["Terras →", 136]])).forEach(([t, x]) => {
      const px = x * TS, y = groundTop(x) * TS - 150, w = g.measureText(t).width + 16;
      g.fillStyle = "#8a6a2a"; g.fillRect(px - 2, y - 13, w + 4, 26); g.fillStyle = "#e9c873"; g.fillRect(px, y - 11, w, 22);
      g.fillStyle = "#4a3410"; g.fillText(t, px + 8, y + 1);
    });
  });
  return c;
}

/* ---------- Kleine voorgrond-details op de grond ---------- */
function buildGroundDecor() {
  const list = [], th = L.d.theme;
  if (th === "huis") return list;
  for (let x = 0; x < L.w; x++) for (let y = 1; y < ROWS; y++) {
    if (L.grid[y][x] !== "#" || L.grid[y - 1][x] !== " ") continue;
    const r = hash(x * 13 + y * 7);
    if (r < .45) continue;
    list.push({ x: x * TS + 4 + hash(x) * 22, y: y * TS + 2, k: fl(hash(x * 3.7 + 1) * 6), r });
  }
  return list;
}
function drawGroundDecor(d, th) {
  const x = d.x, y = d.y;
  if (th === "bos") {
    if (d.k === 0 || d.k === 1) { g.fillStyle = "#3f8a35"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x + i * 3, y); g.lineTo(x + i * 3 + 1 + Math.sin(frame / 30 + x + i) * 1.2, y - 7 - (i % 2) * 3); g.lineTo(x + i * 3 + 2.5, y); g.fill(); } }
    else if (d.k === 2) { const c = ["#ffffff", "#ffd25e", "#e8553f"][fl(d.r * 30) % 3]; g.fillStyle = "#3f8a35"; g.fillRect(x + 3, y - 8, 1.5, 8); g.fillStyle = c; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([a, b]) => { g.beginPath(); g.arc(x + 3.8 + a * 2.4, y - 9 + b * 2.4, 2, 0, 7); g.fill(); }); g.fillStyle = "#f2b53c"; g.beginPath(); g.arc(x + 3.8, y - 9, 1.5, 0, 7); g.fill(); }
    else if (d.k === 3) { g.fillStyle = OUT; g.fillRect(x + 2, y - 7, 2.5, 7); g.fillStyle = "#f4ead8"; g.fillRect(x + 2.5, y - 7, 1.5, 7); g.fillStyle = OUT; g.beginPath(); g.arc(x + 3.2, y - 7, 5.5, Math.PI, 0); g.fill(); g.fillStyle = "#d8323a"; g.beginPath(); g.arc(x + 3.2, y - 7, 4.5, Math.PI, 0); g.fill(); g.fillStyle = "#fff"; g.fillRect(x + 1, y - 10, 1.5, 1.5); g.fillRect(x + 4.5, y - 9.5, 1.5, 1.5); }
    else if (d.k === 4) { g.fillStyle = "#2a1a10"; g.beginPath(); g.ellipse(x + 5, y - 2, 6.5, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = "#9b958a"; g.beginPath(); g.ellipse(x + 5, y - 2, 5.5, 3, 0, Math.PI, 0); g.fill(); g.fillStyle = "#c8c2b5"; g.fillRect(x + 2, y - 4, 3, 1); }
    else { g.strokeStyle = "#4f9e3c"; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x + 4, y); g.quadraticCurveTo(x - 2, y - 6, x - 3, y - 10); g.moveTo(x + 4, y); g.quadraticCurveTo(x + 10, y - 6, x + 11, y - 10); g.moveTo(x + 4, y); g.lineTo(x + 4, y - 12); g.stroke(); }
  } else if (th === "grot") {
    if (d.k < 2) { g.fillStyle = "#4a3e30"; g.beginPath(); g.ellipse(x + 4, y - 1, 4, 2, 0, Math.PI, 0); g.fill(); g.fillStyle = "#7a6a52"; g.fillRect(x + 2, y - 2.5, 2, 1); }
    else if (d.k === 3) { g.fillStyle = "rgba(150,190,200,.45)"; g.beginPath(); g.ellipse(x + 6, y - .5, 8, 1.5, 0, 0, 7); g.fill(); }
  } else if (th === "straat") {
    if (d.k < 2) { g.fillStyle = "#5f8a3e"; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + i * 3, y); g.lineTo(x + i * 3 + 1, y - 4 - (i % 2) * 2); g.lineTo(x + i * 3 + 2, y); g.fill(); } }
    else if (d.k === 3) { g.fillStyle = "#5f8a3e"; g.fillRect(x + 3, y - 6, 1.2, 6); g.fillStyle = "#f5d23a"; g.beginPath(); g.arc(x + 3.6, y - 7, 2, 0, 7); g.fill(); }
  } else if (th === "kust") {
    if (d.k < 2) { g.strokeStyle = "#a89a4a"; g.lineWidth = 1.2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x + i * 2.5, y); g.lineTo(x + i * 2.5 + 1.5, y - 6 - (i % 2) * 3); g.stroke(); } }
    else if (d.k === 2) { g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(x + 3, y - 1.5, 3, 2, 0, 0, 7); g.ellipse(x + 8, y - 1, 2, 1.5, 0, 0, 7); g.fill(); }
    else if (d.k === 3) { g.strokeStyle = "#6a8a4a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + 4, y - 9); g.stroke(); g.fillStyle = "#9a7ad9"; for (let i = 0; i < 4; i++) g.fillRect(x + 3, y - 9 - i * 2, 2.5, 1.5); }
    else if (d.k === 4) { g.fillStyle = "#e8a8a0"; g.beginPath(); g.arc(x + 4, y - 1, 3, Math.PI, 0); g.fill(); g.strokeStyle = "#b8786a"; g.lineWidth = .8; g.beginPath(); g.moveTo(x + 4, y - 1); g.lineTo(x + 2, y - 3.5); g.moveTo(x + 4, y - 1); g.lineTo(x + 6, y - 3.5); g.stroke(); }
  } else {
    if (d.k < 2) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x + 5, y, 8, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = "#d6e3f4"; g.fillRect(x - 2, y - 1, 14, 1); }
    else if (d.k === 2 && th === "sneeuw") pineShape(x + 4, y, 22, "#1f4152", "#173444", "#f4f8ff", "#0f2230");
    else if (d.k === 3) { g.fillStyle = "#2a6a3a"; g.beginPath(); g.ellipse(x + 2, y - 3, 3.5, 2, .5, 0, 7); g.ellipse(x + 7, y - 3, 3.5, 2, -.5, 0, 7); g.fill(); g.fillStyle = "#d32a2a"; g.beginPath(); g.arc(x + 4.5, y - 4, 1.6, 0, 7); g.arc(x + 6, y - 2.5, 1.6, 0, 7); g.fill(); }
    else if (d.k === 4) { g.strokeStyle = "#8aa3c4"; g.lineWidth = 1.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(x + i * 3, y); g.lineTo(x + i * 3 + 1, y - 6 - i); g.stroke(); } }
    else if ((frame + d.x) % 90 < 8) sparkle(x + 4, y - 3, 3, 0);
  }
}

/* ---------- Achtergrond tekenen ---------- */
// Verloopkleuren één keer maken en hergebruiken (ze hangen alleen af van de schermbreedte): scheelt werk per beeld.
const GRADS = {};
let gradsW = 0;
function grad(key, make) {
  if (gradsW !== viewW) { for (const k in GRADS) delete GRADS[k]; gradsW = viewW; }
  return GRADS[key] || (GRADS[key] = make());
}
function drawBackground(theme, camX) {
  const scene = arguments.length > 2 ? arguments[2] : L && L.d.scene;
  if (SCENES.has(scene)) {
    const Ls = getSceneLayers(scene);
    drawSceneSky(scene);
    drawLayer(Ls.far, camX * .15);
    drawLayer(Ls.mid, camX * .3); drawBgAnimals(camX, Ls.mid, "mid");
    drawLayer(Ls.near, camX * .5); drawBgAnimals(camX, Ls.near, "near");
    return;
  }
  if (theme === "huis") {
    if (!L.interior) L.interior = buildInterior();
    const sx = Math.max(0, camX), w = Math.min(viewW, L.interior.width - sx);
    g.fillStyle = "#efe3cf"; g.fillRect(0, 0, viewW, VIEW_H);
    if (w > 0) g.drawImage(L.interior, sx, 0, w, VIEW_H, sx - camX, 0, w, VIEW_H);
    return;
  }
  const Ls = getLayers(theme);
  if (theme === "bos") {
    g.fillStyle = grad("sky-bos", () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "#3a8ad6"); gr.addColorStop(.6, "#9fd3f0"); gr.addColorStop(1, "#d8f0f6"); return gr; });
    g.fillRect(0, 0, viewW, VIEW_H);
    g.fillStyle = grad("sun", () => { const sun = g.createRadialGradient(viewW * .2, 80, 10, viewW * .2, 80, 120); sun.addColorStop(0, "rgba(255,250,210,1)"); sun.addColorStop(.25, "rgba(255,240,170,.8)"); sun.addColorStop(1, "rgba(255,240,170,0)"); return sun; }); g.fillRect(0, 0, viewW, 260);
    drawLayer(Ls.clouds, camX * .08 + frame * .15);
    drawLayer(Ls.far, camX * .15);
    g.fillStyle = "rgba(220,240,250,.25)"; g.fillRect(0, 250, viewW, 120);
    drawLayer(Ls.mid, camX * .3); drawBgAnimals(camX, Ls.mid, "mid");
    drawLayer(Ls.near, camX * .5); drawBgAnimals(camX, Ls.near, "near");
    // vogeltjes
    g.strokeStyle = "#2a3a4a"; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { const bx = ((frame * (.6 + i * .2) + i * 400) % (viewW + 200)) - 100, by = 70 + i * 26 + Math.sin(frame / 40 + i) * 6, w = Math.sin(frame / 6 + i) * 3;
      g.beginPath(); g.moveTo(bx - 6, by - w); g.lineTo(bx, by); g.lineTo(bx + 6, by - w); g.stroke(); }
  } else if (theme === "stad") {
    g.fillStyle = grad("sky-stad", () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "#142247"); gr.addColorStop(.55, "#4b4f86"); gr.addColorStop(1, "#d9967a"); return gr; }); g.fillRect(0, 0, viewW, VIEW_H);
    g.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { g.globalAlpha = .3 + .5 * Math.abs(Math.sin(frame / 40 + i)); g.fillRect(((hash(i * 3) * 3000 - camX * .04) % viewW + viewW) % viewW, hash(i * 7) * 160, 2, 2); } g.globalAlpha = 1;
    drawLayer(Ls.far, camX * .15);
    g.fillStyle = "rgba(230,170,150,.18)"; g.fillRect(0, 250, viewW, 120);
    drawLayer(Ls.mid, camX * .3); drawBgAnimals(camX, Ls.mid, "mid");
    drawLayer(Ls.near, camX * .5); drawBgAnimals(camX, Ls.near, "near");
  } else {
    g.fillStyle = grad("sky-sneeuw", () => { const gr = g.createLinearGradient(0, 0, 0, VIEW_H); gr.addColorStop(0, "#081230"); gr.addColorStop(.7, "#2a4a82"); gr.addColorStop(1, "#4a6fa8"); return gr; }); g.fillRect(0, 0, viewW, VIEW_H);
    g.fillStyle = "#fff";
    for (let i = 0; i < 90; i++) {
      const tw = .4 + .6 * Math.abs(Math.sin(frame / (30 + i % 17) + i));
      g.globalAlpha = tw * (.3 + hash(i) * .7);
      const sx = ((hash(i * 3) * 3000 - camX * .04) % viewW + viewW) % viewW; const s = hash(i * 5) > .9 ? 3 : 2;
      g.fillRect(sx, hash(i * 7) * 250, s, s);
    }
    g.globalAlpha = 1;
    const mx = viewW * .8;
    g.fillStyle = grad("moon", () => { const mg = g.createRadialGradient(mx, 90, 20, mx, 90, 110); mg.addColorStop(0, "rgba(255,250,220,.35)"); mg.addColorStop(1, "rgba(255,250,220,0)"); return mg; }); g.fillRect(mx - 110, 0, 220, 220);
    g.fillStyle = "#f7f3dc"; g.beginPath(); g.arc(mx, 90, 28, 0, 7); g.fill();
    g.fillStyle = "#e3dcc0"; [[-8, -6, 6], [9, 7, 4], [4, -12, 3]].forEach(([dx, dy, r]) => { g.beginPath(); g.arc(mx + dx, 90 + dy, r, 0, 7); g.fill(); });
    drawLayer(Ls.far, camX * .15);
    g.fillStyle = "rgba(160,190,230,.18)"; g.fillRect(0, 260, viewW, 120);
    drawLayer(Ls.mid, camX * .3); drawBgAnimals(camX, Ls.mid, "mid");
    drawLayer(Ls.near, camX * .5); drawBgAnimals(camX, Ls.near, "near");
  }
}

/* ---------- Tegels ---------- */
/** A ladder tile: two wooden rails and three rungs (indoors a steep attic ladder in light wood). */
function drawLadder(px, py, theme) {
  const wood = theme === "huis" ? "#c8955a" : "#8a5a32", dark = theme === "huis" ? "#8a5a32" : "#5a3a20";
  g.fillStyle = dark; g.fillRect(px + 5, py, 5, TS + .5); g.fillRect(px + 22, py, 5, TS + .5);
  g.fillStyle = wood; g.fillRect(px + 6, py, 3, TS + .5); g.fillRect(px + 23, py, 3, TS + .5);
  for (let i = 0; i < 3; i++) { const y = py + 4 + i * 11; g.fillStyle = dark; g.fillRect(px + 8, y, 16, 4); g.fillStyle = wood; g.fillRect(px + 8, y, 16, 2.5); }
}
// Tiles overlap the next one by one screen pixel: with a scale like ×1.35 their edges fall on half pixels, and the
// background would shine through as thin lines that flicker while the camera moves.
function tile(T, tex, px, py) { const o = 1 / scale; g.drawImage(T.atlas, T.at.get(tex), 1, TS, TS, px, py, TS + o, TS + o); }
function drawTile(c, px, py, theme, tx, ty, T) {
  if (c === "#") {
    const top = cell(tx, ty - 1) !== "#" && cell(tx, ty - 1) !== "S";
    const v = fl(hash(tx * 31 + ty * 17) * 4);
    tile(T, top ? T.top[v] : T.fill[v], px, py);
    const pe = PAL[theme].edge;
    if (cell(tx - 1, ty) !== "#") { g.fillStyle = pe; g.fillRect(px, py, 2, TS); if (top && theme !== "huis") { g.fillStyle = theme === "bos" ? "#4f9e3c" : theme === "kust" ? "#b9a95a" : theme === "straat" ? "#a89f8e" : theme === "grot" ? "#9a8a70" : "#f4f8ff"; g.fillRect(px - 3, py + 2, 5, 8); g.fillStyle = pe; g.fillRect(px - 3, py + 10, 5, 2); g.fillRect(px - 5, py + 2, 2, 8); } }
    if (cell(tx + 1, ty) !== "#") { g.fillStyle = pe; g.fillRect(px + TS - 2, py, 2, TS); if (top && theme !== "huis") { g.fillStyle = theme === "bos" ? "#4f9e3c" : theme === "kust" ? "#b9a95a" : theme === "straat" ? "#a89f8e" : theme === "grot" ? "#9a8a70" : "#f4f8ff"; g.fillRect(px + TS - 2, py + 2, 5, 8); g.fillStyle = pe; g.fillRect(px + TS - 2, py + 10, 5, 2); g.fillRect(px + TS + 3, py + 2, 2, 8); } }
  } else if (c === "=") tile(T, T.plat, px, py);
  else if (c === "|") drawLadder(px, py, theme);
  else if (c === "S") tile(T, T.block, px, py);
  else if (c === "^") tile(T, T.spike, px, py);
  else if (c === "R") drawRock(px, py, cell(tx, ty - 1) !== "R");
}
/** A rock in the river (the Ardèche): pale limestone, rounded on top, wet at the bottom. Jump over it in the canoe. */
function drawRock(px, py, top) {
  g.strokeStyle = OUT; g.lineWidth = 2; g.lineJoin = "round";
  const h = hash(px * .37);
  g.fillStyle = "#b8a888"; g.beginPath();
  if (top) { g.moveTo(px + 1, py + TS); g.quadraticCurveTo(px - 1, py + 6 + h * 6, px + 10, py + 3 + h * 4); g.quadraticCurveTo(px + 20, py - 1, px + 28, py + 6 + h * 5); g.quadraticCurveTo(px + 33, py + 16, px + 31, py + TS); }
  else { g.moveTo(px + 1, py); g.lineTo(px + 31, py); g.lineTo(px + 32, py + TS); g.lineTo(px, py + TS); }
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#d4c6a6"; if (top) { g.beginPath(); g.ellipse(px + 12, py + 9 + h * 3, 7, 3, -.3, 0, 7); g.fill(); }
  g.fillStyle = "#8a7a5e"; g.fillRect(px + 6 + h * 10, py + 18, 9, 2); g.fillRect(px + 18 - h * 6, py + 24, 7, 2);
}

/* ---------- Hek (opdracht) en codedeur ---------- */
function drawGates(theme) {
  g.lineJoin = "round"; g.lineCap = "round";
  if (L.gateFade > 0) {
    const [gx, y1, y2] = L.d.gate, px = gx * TS, top = y1 * TS, bot = (y2 + 1) * TS;
    g.globalAlpha = L.gateFade;
    if (theme === "huis") {
      g.fillStyle = "#e8e0d2"; g.fillRect(px - 6, top, TS + 12, bot - top);
      g.fillStyle = "#cfc4b2"; g.fillRect(px - 6, top, 3, bot - top); g.fillRect(px + TS + 3, top, 3, bot - top);
      g.fillStyle = "#6b5a46"; g.fillRect(px - 4, bot - 78, TS + 8, 78);
      g.fillStyle = "#f6f2ea"; g.fillRect(px, bot - 74, TS, 74); g.strokeStyle = "#cfc4b2"; g.lineWidth = 2; g.strokeRect(px + 5, bot - 68, TS - 10, 28); g.strokeRect(px + 5, bot - 34, TS - 10, 28);
      g.fillStyle = "#c9a34a"; g.beginPath(); g.arc(px + TS - 7, bot - 38, 2.5, 0, 7); g.fill();
      sign2(px - 14, bot - 120, 60, 26, "#fff", L.d.fixedInterior ? "🛁 Privé" : `${L.d.questHud} eerst!`, "#2a4a6a");
    } else {
      const wood = theme === "bos" ? "#8a5a32" : "#6e4e34", woodL = theme === "bos" ? "#b07a44" : "#8f6a48";
      g.strokeStyle = OUT; g.lineWidth = 2;
      for (const x of [px - 2, px + TS - 8]) { g.fillStyle = wood; g.fillRect(x, top - 10, 10, bot - top + 10); g.strokeRect(x, top - 10, 10, bot - top + 10); g.fillStyle = woodL; g.fillRect(x + 2, top - 8, 3, bot - top + 6); }
      for (let y = top + 10; y < bot - 10; y += 34) { g.fillStyle = woodL; g.fillRect(px - 6, y, TS + 12, 9); g.strokeRect(px - 6, y, TS + 12, 9); }
      g.strokeStyle = wood; g.lineWidth = 6; g.beginPath(); g.moveTo(px, bot - 12); g.lineTo(px + TS, top + 14); g.stroke();
      if (theme === "sneeuw") { g.fillStyle = "#f4f8ff"; g.fillRect(px - 4, top - 14, 14, 5); g.fillRect(px + TS - 10, top - 14, 14, 5); for (let y = top + 10; y < bot - 10; y += 34) g.fillRect(px - 6, y - 3, TS + 12, 4); }
      sign2(px - 18, bot - 120, 68, 28, "#f4e2b8", `${L.d.questHud} eerst!`, "#4a2a10");
    }
    g.globalAlpha = 1;
  }
  if (L.codeFade > 0) {
    const c = L.d.code, px = c.x * TS, top = c.y1 * TS, bot = (c.y2 + 1) * TS;
    g.globalAlpha = L.codeFade;
    g.strokeStyle = OUT; g.lineWidth = 2;
    if (theme === "huis") {
      g.fillStyle = "#e8e0d2"; g.fillRect(px - 6, top, TS + 12, bot - top);
      g.fillStyle = "#5a3e28"; g.fillRect(px - 2, bot - 80, TS + 4, 80); g.fillStyle = "#7a5638"; g.fillRect(px + 2, bot - 76, TS - 4, 76);
      g.fillStyle = "#5a3e28"; for (let i = 0; i < 3; i++) g.fillRect(px + 2, bot - 70 + i * 24, TS - 4, 2);
    } else {
      g.fillStyle = "#3a4250"; g.fillRect(px - 4, top - 6, 8, bot - top + 6); g.fillRect(px + TS - 4, top - 6, 8, bot - top + 6);
      g.strokeRect(px - 4, top - 6, 8, bot - top + 6); g.strokeRect(px + TS - 4, top - 6, 8, bot - top + 6);
      g.fillStyle = "#4b5566"; for (let i = 0; i < 3; i++) { const x = px + 6 + i * 8; g.fillRect(x, top, 4, bot - top); g.beginPath(); g.moveTo(x - 2, top); g.lineTo(x + 2, top - 10); g.lineTo(x + 6, top); g.fill(); }
      g.fillStyle = "#5f6b7e"; for (let y = top + 20; y < bot; y += 60) { g.fillRect(px - 4, y, TS + 8, 6); g.strokeRect(px - 4, y, TS + 8, 6); }
      if (theme === "sneeuw") { g.fillStyle = "#f4f8ff"; for (let y = top + 20; y < bot; y += 60) g.fillRect(px - 4, y - 3, TS + 8, 3); }
    }
    emoji("🔒", px + 16, bot - 46, 20);
    g.globalAlpha = 1;
  }
}
function sign2(x, y, w, h, bg, text, fg) {
  g.fillStyle = OUT; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = bg; g.fillRect(x, y, w, h);
  g.fillStyle = "rgba(0,0,0,.08)"; g.fillRect(x, y + h - 4, w, 4);
  g.fillStyle = fg; g.font = "700 12px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, x + w / 2, y + h / 2 + 1);
}

/* ---------- Decoratie ---------- */
/** Animals in the scenery that stand still: drawn in the background by drawBgAnimals() (behind the path, smaller,
 *  hazy, with parallax), so you can see at once that they are not something to bump into or stand on. */
const BG_ANIMALS = BG_KINDS; // levelgen.js
function drawDeco(kind, x, theme, far) {
  if (!far && BG_ANIMALS.has(kind)) return; // drawn in the background by drawBgAnimals()
  const by = groundTop(x) * TS, px = x * TS;
  g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = OUT; g.lineWidth = 2;
  const H = hash(x * 5.3);
  if (kind === "tent") {
    // a dome tent with guy lines
    const c = ["#e8823a", "#3a8ad8", "#4aa860"][Math.floor(H * 3)];
    shadowAt(px + 32, by, 40);
    g.fillStyle = c; g.beginPath(); g.moveTo(px, by); g.quadraticCurveTo(px + 32, by - 80, px + 64, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = shade(c, -.25); g.beginPath(); g.moveTo(px + 22, by); g.quadraticCurveTo(px + 32, by - 34, px + 42, by); g.closePath(); g.fill();
    g.strokeStyle = "#f4f1ea"; g.lineWidth = 1; g.beginPath(); g.moveTo(px + 32, by - 60); g.lineTo(px + 32, by - 30); g.moveTo(px + 6, by - 20); g.lineTo(px - 14, by); g.moveTo(px + 58, by - 20); g.lineTo(px + 78, by); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "caravan") {
    // a white caravan with an awning
    shadowAt(px + 50, by, 56);
    g.fillStyle = "#f4f1ea"; g.beginPath(); rp(px, by - 62, 100, 52, 14); g.fill(); g.stroke();
    g.fillStyle = "#3a8ad8"; g.fillRect(px + 2, by - 30, 96, 5);
    g.fillStyle = "#9ad0f0"; g.beginPath(); rp(px + 12, by - 52, 30, 16, 4); g.fill(); g.stroke(); g.beginPath(); rp(px + 70, by - 52, 20, 30, 3); g.fill(); g.stroke();
    g.fillStyle = "#2a2f3c"; g.beginPath(); g.arc(px + 40, by - 8, 9, 0, 7); g.fill(); g.fillStyle = "#9aa"; g.beginPath(); g.arc(px + 40, by - 8, 4, 0, 7); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#e8823a"; g.beginPath(); g.moveTo(px + 100 + i * 8, by - 62); g.lineTo(px + 108 + i * 8, by - 62); g.lineTo(px + 112 + i * 8, by - 48); g.lineTo(px + 104 + i * 8, by - 48); g.fill(); }
    g.fillStyle = "#6a6a6a"; g.fillRect(px + 146, by - 50, 3, 50);
  } else if (kind === "lavender") {
    shadowAt(px + 20, by, 22);
    for (let i = 0; i < 12; i++) { const lx = px + 4 + i * 3, h = 18 + (i % 3) * 5; g.strokeStyle = "#6a8a4a"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(lx, by); g.lineTo(lx + (i - 6) * .6, by - h); g.stroke(); g.fillStyle = "#9a6ad8"; g.fillRect(lx + (i - 6) * .6 - 1.5, by - h - 6, 3, 7); }
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "parasol") {
    // a striped beach umbrella with a towel
    g.fillStyle = "#4a3a2a"; g.fillRect(px + 22, by - 70, 3, 70);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#e8323a"; g.beginPath(); g.moveTo(px + 23, by - 74); g.lineTo(px - 14 + i * 12.5, by - 54); g.lineTo(px - 1.5 + i * 12.5, by - 54); g.closePath(); g.fill(); }
    g.beginPath(); g.moveTo(px + 23, by - 74); g.lineTo(px - 14, by - 54); g.lineTo(px + 61, by - 54); g.closePath(); g.stroke();
    g.fillStyle = "#3aa0d8"; g.fillRect(px + 30, by - 4, 40, 4); g.fillStyle = "#f2c230"; g.fillRect(px + 30, by - 4, 40, 1.5);
  } else if (kind === "cypress") {
    shadowAt(px + 16, by, 12);
    g.fillStyle = "#1f4a2a"; g.beginPath(); g.ellipse(px + 16, by - 60, 12, 60, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#2e6a3a"; g.beginPath(); g.ellipse(px + 13, by - 64, 6, 50, 0, 0, 7); g.fill();
  } else if (kind === "olive") {
    // an old olive tree: twisted trunk, silvery leaves
    shadowAt(px + 20, by, 30);
    g.fillStyle = "#6a5a48"; g.beginPath(); g.moveTo(px + 12, by); g.quadraticCurveTo(px + 22, by - 30, px + 14, by - 54); g.lineTo(px + 24, by - 54); g.quadraticCurveTo(px + 32, by - 28, px + 26, by); g.closePath(); g.fill(); g.stroke();
    [[20, -66, 22], [2, -58, 16], [38, -58, 16], [20, -82, 14]].forEach(([dx, dy, r]) => { g.fillStyle = OUT; g.beginPath(); g.arc(px + dx, by + dy, r + 2, 0, 7); g.fill(); });
    [[20, -66, 22], [2, -58, 16], [38, -58, 16], [20, -82, 14]].forEach(([dx, dy, r], i) => { g.fillStyle = i % 2 ? "#8a9a6a" : "#9aaa7a"; g.beginPath(); g.arc(px + dx, by + dy, r, 0, 7); g.fill(); });
  } else if (kind === "palm") {
    shadowAt(px + 16, by, 18);
    g.strokeStyle = "#8a6a42"; g.lineWidth = 8; g.beginPath(); g.moveTo(px + 14, by); g.quadraticCurveTo(px + 22, by - 60, px + 12, by - 110); g.stroke();
    g.strokeStyle = "#6a4e30"; g.lineWidth = 1.5; for (let y = 8; y < 108; y += 8) { g.beginPath(); g.moveTo(px + 9 + (y / 108) * 4, by - y); g.lineTo(px + 19 + (y / 108) * 2, by - y - 2); g.stroke(); }
    for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6 + Math.sin(frame / 50 + i) * .04; g.strokeStyle = "#2e7a3a"; g.lineWidth = 5; g.beginPath(); g.moveTo(px + 12, by - 110); g.quadraticCurveTo(px + 12 + Math.cos(a) * 28, by - 124 + Math.sin(a) * 10, px + 12 + Math.cos(a) * 52, by - 104 + Math.sin(a) * 30 + 14); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "stonehouse") {
    // a Dalmatian stone house: pale stone, terracotta roof, green shutters, a bougainvillea
    shadowAt(px + 40, by, 46);
    g.fillStyle = "#e8dcc0"; g.fillRect(px, by - 90, 80, 90); g.strokeRect(px, by - 90, 80, 90);
    g.fillStyle = "#d4c6a6"; for (let y = by - 84; y < by; y += 12) for (let xx = px + ((y / 12) % 2) * 8; xx < px + 80; xx += 16) g.fillRect(xx, y, 14, 1);
    g.fillStyle = "#c8583a"; g.beginPath(); g.moveTo(px - 8, by - 88); g.lineTo(px + 40, by - 114); g.lineTo(px + 88, by - 88); g.closePath(); g.fill(); g.stroke();
    [[px + 12, by - 74], [px + 52, by - 74], [px + 12, by - 38]].forEach(([wx, wy]) => { g.fillStyle = "#3a2a1a"; g.fillRect(wx, wy, 16, 22); g.fillStyle = "#3a7a4a"; g.fillRect(wx - 7, wy, 6, 22); g.fillRect(wx + 17, wy, 6, 22); });
    g.fillStyle = "#6a4a2a"; g.fillRect(px + 50, by - 34, 18, 34); g.strokeRect(px + 50, by - 34, 18, 34);
    g.fillStyle = "#d83a8a"; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(px + 72 + Math.sin(i * 2.1) * 8, by - 20 - i * 4, 3, 0, 7); g.fill(); }
  } else if (kind === "highlandhouse") {
    shadowAt(px + 42, by, 42);
    g.fillStyle = "#77796f"; g.fillRect(px, by - 54, 84, 54); g.strokeRect(px, by - 54, 84, 54);
    g.fillStyle = "#686d66";
    for (let y = by - 48; y < by - 4; y += 11) for (let xx = px + (y % 2 ? 7 : 0); xx < px + 84; xx += 18) g.fillRect(xx, y, 15, 2);
    g.fillStyle = "#424b4d"; g.beginPath(); g.moveTo(px - 8, by - 52); g.lineTo(px + 42, by - 86); g.lineTo(px + 92, by - 52); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#525952"; g.fillRect(px + 63, by - 82, 9, 29); g.strokeRect(px + 63, by - 82, 9, 29);
    [[px + 12, by - 40], [px + 52, by - 40]].forEach(([wx, wy]) => { g.fillStyle = "#3e4c50"; g.fillRect(wx, wy, 14, 17); g.strokeRect(wx, wy, 14, 17); g.fillStyle = "#e5d19c"; g.fillRect(wx + 2, wy + 2, 10, 13); });
    g.fillStyle = "#4c4940"; g.fillRect(px + 33, by - 29, 18, 29); g.strokeRect(px + 33, by - 29, 18, 29);
  } else if (kind === "deuche") {
    // a Citroën 2CV: round roof, ribbed bonnet, round headlamps on the wings, a canvas roof. No number plates.
    const col = ["#9cc4d8", "#e8d27a", "#c8483a", "#9aa49a"][Math.floor(H * 4)];
    shadowAt(px + 64, by, 66);
    g.fillStyle = col; g.beginPath(); g.moveTo(px + 4, by - 16); g.lineTo(px + 4, by - 30); g.quadraticCurveTo(px + 8, by - 62, px + 40, by - 64);
    g.lineTo(px + 70, by - 64); g.quadraticCurveTo(px + 80, by - 62, px + 86, by - 44); g.lineTo(px + 116, by - 38); g.quadraticCurveTo(px + 126, by - 34, px + 124, by - 16); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = shade(col, -.25); g.beginPath(); g.moveTo(px + 14, by - 54); g.quadraticCurveTo(px + 20, by - 62, px + 40, by - 63); g.lineTo(px + 68, by - 63); g.lineTo(px + 70, by - 58); g.lineTo(px + 16, by - 56); g.closePath(); g.fill();
    g.fillStyle = "#2a3542"; g.beginPath(); rp(px + 16, by - 54, 26, 16, 4); g.fill(); g.beginPath(); rp(px + 46, by - 54, 28, 16, 4); g.fill();
    g.strokeStyle = shade(col, -.35); g.lineWidth = 1.2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(px + 90 + i * 5, by - 42 + i); g.lineTo(px + 90 + i * 5, by - 34 + i); g.stroke(); }
    g.beginPath(); g.moveTo(px + 44, by - 54); g.lineTo(px + 44, by - 18); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
    [[28], [104]].forEach(([dx]) => { g.fillStyle = shade(col, -.15); g.beginPath(); g.ellipse(px + dx, by - 16, 17, 13, 0, Math.PI, 0); g.fill(); g.stroke(); g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(px + dx, by - 10, 10, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#d8dce0"; g.beginPath(); g.arc(px + dx, by - 10, 5, 0, 7); g.fill(); });
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(px + 114, by - 40, 5, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c9ced6"; g.fillRect(px + 118, by - 22, 8, 3); g.fillRect(px, by - 22, 6, 3);
  } else if (kind === "flamingo") {
    // a flamingo on one leg, its neck in an S
    const f = H < .5 ? 1 : -1;
    g.strokeStyle = "#d8707e"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px + 16, by); g.lineTo(px + 16, by - 34); g.moveTo(px + 16, by - 22); g.lineTo(px + 16 - 7 * f, by - 28); g.lineTo(px + 16, by - 32); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
    blob("#f49aaa", () => g.ellipse(px + 16, by - 40, 13, 8, -.15 * f, 0, 7));
    g.fillStyle = "#e0707e"; g.beginPath(); g.ellipse(px + 16 - 6 * f, by - 40, 6, 4, 0, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 6; g.beginPath(); g.moveTo(px + 16 + 9 * f, by - 44); g.quadraticCurveTo(px + 16 + 24 * f, by - 54, px + 16 + 12 * f, by - 62); g.quadraticCurveTo(px + 16 + 4 * f, by - 70, px + 16 + 12 * f, by - 76); g.stroke();
    g.strokeStyle = "#f49aaa"; g.lineWidth = 3.5; g.stroke();
    blob("#f49aaa", () => g.arc(px + 16 + 13 * f, by - 77, 5, 0, 7));
    g.fillStyle = "#1d1d26"; g.beginPath(); g.moveTo(px + 16 + 17 * f, by - 78); g.lineTo(px + 16 + 24 * f, by - 72); g.lineTo(px + 16 + 17 * f, by - 74); g.fill();
    g.fillStyle = "#f4f4f0"; g.beginPath(); g.moveTo(px + 16 + 17 * f, by - 79); g.lineTo(px + 16 + 21 * f, by - 76); g.lineTo(px + 16 + 17 * f, by - 76); g.fill();
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(px + 16 + 14 * f, by - 79, 1.2, 0, 7); g.fill();
  } else if (kind === "vespa") {
    // a mint-green Vespa scooter
    shadowAt(px + 30, by, 30);
    g.fillStyle = "#9ad8c0"; g.beginPath(); g.moveTo(px + 6, by - 14); g.quadraticCurveTo(px + 4, by - 34, px + 24, by - 32); g.lineTo(px + 36, by - 22); g.lineTo(px + 46, by - 22); g.quadraticCurveTo(px + 50, by - 34, px + 52, by - 46); g.lineTo(px + 58, by - 46); g.quadraticCurveTo(px + 60, by - 26, px + 56, by - 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6a4a3a"; g.beginPath(); rp(px + 12, by - 38, 20, 6, 3); g.fill(); g.stroke();
    g.strokeStyle = "#5a5a62"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px + 54, by - 46); g.lineTo(px + 48, by - 56); g.lineTo(px + 60, by - 56); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(px + 58, by - 46, 3, 0, 7); g.fill();
    [[14], [52]].forEach(([dx]) => { g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(px + dx, by - 7, 7, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(px + dx, by - 7, 3, 0, 7); g.fill(); });
  } else if (kind === "capanna") {
    // a striped wooden beach hut on the Lido
    shadowAt(px + 28, by, 30);
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : ["#3a8ad8", "#e8582a", "#2a9a6a"][Math.floor(H * 3)]; g.fillRect(px + 4 + i * 7, by - 50, 7, 50); }
    g.strokeRect(px + 4, by - 50, 49, 50);
    g.fillStyle = "#e8e0d0"; g.beginPath(); g.moveTo(px - 2, by - 48); g.lineTo(px + 28, by - 66); g.lineTo(px + 58, by - 48); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#5a4a3a"; g.fillRect(px + 20, by - 30, 16, 30); g.strokeRect(px + 20, by - 30, 16, 30);
  } else if (kind === "palazzo") {
    // a Venetian palace: pastel plaster, pointed Gothic windows, a balcony and a mooring pole
    const col = ["#e8c8a8", "#d89a7a", "#f0d8b0", "#c8a088"][Math.floor(H * 4)];
    shadowAt(px + 44, by, 46);
    g.fillStyle = col; g.fillRect(px, by - 104, 88, 104); g.strokeRect(px, by - 104, 88, 104);
    g.fillStyle = "#e8e0d0"; g.fillRect(px - 3, by - 108, 94, 6); g.strokeRect(px - 3, by - 108, 94, 6);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
      const wx = px + 10 + i * 19, wy = by - 92 + r * 38;
      g.fillStyle = "#2a3542"; g.beginPath(); g.moveTo(wx, wy + 24); g.lineTo(wx, wy + 8); g.quadraticCurveTo(wx + 6, wy - 2, wx + 6, wy - 4); g.quadraticCurveTo(wx + 6, wy - 2, wx + 12, wy + 8); g.lineTo(wx + 12, wy + 24); g.closePath(); g.fill();
    }
    g.fillStyle = "#e8e0d0"; g.fillRect(px + 6, by - 52, 76, 4); g.strokeRect(px + 6, by - 52, 76, 4);
    g.fillStyle = "#5a3a2a"; g.fillRect(px + 34, by - 30, 20, 30); g.strokeRect(px + 34, by - 30, 20, 30);
  } else if (kind === "gondola") {
    // a moored black gondola with its curly iron prow, and a striped pole
    shadowAt(px + 50, by, 50);
    g.fillStyle = "#1d1d26"; g.beginPath(); g.moveTo(px, by - 16); g.quadraticCurveTo(px + 50, by + 4, px + 96, by - 16); g.quadraticCurveTo(px + 100, by - 26, px + 104, by - 34); g.lineTo(px + 96, by - 10); g.quadraticCurveTo(px + 50, by + 8, px + 4, by - 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c9ced6"; g.fillRect(px + 98, by - 36, 6, 2); g.fillRect(px + 99, by - 32, 6, 2); g.fillRect(px + 100, by - 28, 6, 2);
    g.fillStyle = "#b8302a"; g.beginPath(); rp(px + 40, by - 16, 22, 7, 3); g.fill();
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#2a5ab8"; g.fillRect(px - 10, by - 70 + i * 12, 6, 12); }
    g.strokeRect(px - 10, by - 70, 6, 70); g.fillStyle = "#c8a838"; g.beginPath(); g.arc(px - 7, by - 72, 4, 0, 7); g.fill(); g.stroke();
  } else if (kind === "lion") {
    // the winged lion of St Mark on a column
    shadowAt(px + 20, by, 18);
    g.fillStyle = "#d8d0c0"; g.fillRect(px + 12, by - 70, 16, 70); g.strokeRect(px + 12, by - 70, 16, 70); g.fillRect(px + 6, by - 76, 28, 7); g.strokeRect(px + 6, by - 76, 28, 7);
    // a golden lion lying down, with a big mane, a raised wing and a tail with a tuft
    const ly = by - 76;
    g.strokeStyle = "#a07a28"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px + 6, ly - 8); g.quadraticCurveTo(px - 4, ly - 16, px + 2, ly - 24); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
    blob("#a07a28", () => g.arc(px + 2, ly - 25, 3, 0, 7));
    blob("#d8b048", () => g.ellipse(px + 18, ly - 8, 15, 7, 0, 0, 7));
    blob("#d8b048", () => { g.moveTo(px + 28, ly - 2); g.lineTo(px + 40, ly - 2); g.lineTo(px + 40, ly + 1); g.lineTo(px + 26, ly + 1); g.closePath(); });
    blob("#e8c868", () => { g.moveTo(px + 12, ly - 12); g.quadraticCurveTo(px + 2, ly - 30, px + 8, ly - 44); g.quadraticCurveTo(px + 16, ly - 30, px + 24, ly - 26); g.quadraticCurveTo(px + 22, ly - 18, px + 20, ly - 12); g.closePath(); });
    g.strokeStyle = "#b08a30"; g.lineWidth = 1; [[10, -20, 20, -24], [8, -28, 18, -30], [8, -36, 14, -36]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(px + a, ly + b); g.lineTo(px + c, ly + d); g.stroke(); }); g.strokeStyle = OUT; g.lineWidth = 2;
    blob("#b8862a", () => { for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, r = i % 2 ? 9 : 11; g.lineTo(px + 33 + Math.cos(a) * r, ly - 16 + Math.sin(a) * r); } g.closePath(); });
    blob("#e0b850", () => g.arc(px + 34, ly - 16, 6, 0, 7));
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(px + 36, ly - 18, 1.2, 0, 7); g.fill(); g.fillRect(px + 37, ly - 13, 3, 1.2);
  } else if (kind === "gelatocart") {
    // a gelato cart with a striped umbrella
    shadowAt(px + 26, by, 26);
    g.fillStyle = "#f4f1ea"; g.beginPath(); rp(px + 4, by - 40, 44, 28, 4); g.fill(); g.stroke();
    ["#f4a0b0", "#9ad8c0", "#f2d07a", "#8a5a3a"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(px + 12 + i * 9, by - 41, 4.5, Math.PI, 0); g.fill(); });
    g.fillStyle = "#1c1c20"; [[12], [40]].forEach(([dx]) => { g.beginPath(); g.arc(px + dx, by - 7, 6, 0, 7); g.fill(); g.stroke(); });
    g.strokeStyle = "#6a6a6a"; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 26, by - 40); g.lineTo(px + 26, by - 74); g.stroke(); g.strokeStyle = OUT;
    for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#e8582a"; g.beginPath(); g.moveTo(px + 26, by - 82); g.lineTo(px - 4 + i * 12, by - 70); g.lineTo(px + 8 + i * 12, by - 70); g.closePath(); g.fill(); }
  } else if (kind === "buranohouse") {
    // a house on Burano, painted a bright colour so the fishermen find it in the fog
    const col = ["#e84a4a", "#f2c42a", "#3a8ad8", "#4ab868", "#e87ab0", "#8a5ad8"][Math.floor(H * 6)];
    shadowAt(px + 34, by, 36);
    g.fillStyle = col; g.fillRect(px, by - 76, 68, 76); g.strokeRect(px, by - 76, 68, 76);
    g.fillStyle = "#f4f1ea"; g.fillRect(px - 2, by - 80, 72, 5); g.strokeRect(px - 2, by - 80, 72, 5);
    [[px + 10, by - 64], [px + 42, by - 64], [px + 10, by - 34]].forEach(([wx, wy]) => { g.fillStyle = "#f4f1ea"; g.fillRect(wx - 2, wy - 2, 18, 22); g.fillStyle = "#2a3542"; g.fillRect(wx, wy, 14, 18); g.fillStyle = "#3a6a3a"; g.fillRect(wx - 6, wy, 4, 18); g.fillRect(wx + 16, wy, 4, 18); });
    g.fillStyle = "#5a3a2a"; g.fillRect(px + 42, by - 30, 16, 30); g.strokeRect(px + 42, by - 30, 16, 30);
    g.strokeStyle = "#6a6a6a"; g.lineWidth = 1; g.beginPath(); g.moveTo(px + 2, by - 50); g.lineTo(px + 66, by - 50); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
    ["#f4f1ea", "#e8423a", "#3a8ad8"].forEach((c, i) => { g.fillStyle = c; g.fillRect(px + 14 + i * 16, by - 50, 8, 9); });
  } else if (kind === "glassshop") {
    // a glass blower's workshop on Murano: an orange glowing furnace and glass in the window
    shadowAt(px + 40, by, 42);
    g.fillStyle = "#c8a888"; g.fillRect(px, by - 70, 80, 70); g.strokeRect(px, by - 70, 80, 70);
    g.fillStyle = "#b8584a"; g.beginPath(); g.moveTo(px - 6, by - 68); g.lineTo(px + 40, by - 86); g.lineTo(px + 86, by - 68); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3a2a22"; g.beginPath(); rp(px + 8, by - 46, 30, 46, 14); g.fill(); g.stroke();
    g.fillStyle = `rgba(255,${150 + Math.sin(frame / 6) * 30 | 0},60,.95)`; g.beginPath(); g.arc(px + 23, by - 22, 8, 0, 7); g.fill();
    g.fillStyle = "#e8f4f8"; g.fillRect(px + 46, by - 50, 28, 22); g.strokeRect(px + 46, by - 50, 28, 22);
    ["#3a8ad8", "#e8423a", "#4ab868"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.ellipse(px + 52 + i * 8, by - 36, 3, 6, 0, 0, 7); g.fill(); });
  } else if (kind === "casone") {
    // a fisherman's hut on stilts in the lagoon, with a thatched roof
    shadowAt(px + 30, by, 30);
    g.fillStyle = "#6a5a48"; [6, 26, 46].forEach(dx => g.fillRect(px + dx, by - 26, 4, 26));
    g.fillStyle = "#a07a4a"; g.fillRect(px, by - 50, 56, 26); g.strokeRect(px, by - 50, 56, 26);
    g.fillStyle = "#c8a868"; g.beginPath(); g.moveTo(px - 8, by - 48); g.lineTo(px + 28, by - 78); g.lineTo(px + 64, by - 48); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3a2a1a"; g.fillRect(px + 22, by - 44, 12, 20);
  } else if (kind === "balcony") {
    // a stone balcony on an old house, with flowers: Juliet's balcony in Verona
    shadowAt(px + 36, by, 38);
    g.fillStyle = "#d8b890"; g.fillRect(px, by - 110, 72, 110); g.strokeRect(px, by - 110, 72, 110);
    g.fillStyle = "#3a2a22"; g.beginPath(); g.moveTo(px + 24, by - 66); g.lineTo(px + 24, by - 90); g.arc(px + 36, by - 90, 12, Math.PI, 0); g.lineTo(px + 48, by - 66); g.fill();
    g.fillStyle = "#e8e0d0"; g.beginPath(); rp(px + 12, by - 68, 48, 14, 3); g.fill(); g.stroke();
    g.strokeStyle = "#b8a888"; g.lineWidth = 1.5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(px + 16 + i * 8, by - 66); g.lineTo(px + 16 + i * 8, by - 56); g.stroke(); } g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#4a8a3a"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(px + 14 + i * 6, by - 54 + (i % 2) * 3, 3, 0, 7); g.fill(); }
    g.fillStyle = "#e8423a"; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(px + 18 + i * 12, by - 54, 2, 0, 7); g.fill(); }
    g.fillStyle = "#5a3a2a"; g.fillRect(px + 26, by - 34, 20, 34); g.strokeRect(px + 26, by - 34, 20, 34);
  } else if (kind === "rifugio") {
    // a mountain hut: stone below, wood above, red-and-white shutters and a flag
    shadowAt(px + 44, by, 46);
    g.fillStyle = "#a8a098"; g.fillRect(px, by - 30, 88, 30); g.strokeRect(px, by - 30, 88, 30);
    g.fillStyle = "#8a5a32"; g.fillRect(px, by - 64, 88, 34); g.strokeRect(px, by - 64, 88, 34);
    g.fillStyle = "#5a4a3a"; g.beginPath(); g.moveTo(px - 10, by - 62); g.lineTo(px + 44, by - 92); g.lineTo(px + 98, by - 62); g.closePath(); g.fill(); g.stroke();
    [[px + 12, by - 56], [px + 62, by - 56]].forEach(([wx, wy]) => { g.fillStyle = "#2a3542"; g.fillRect(wx, wy, 14, 14); for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#c4202a"; g.fillRect(wx - 6, wy + i * 3.5, 5, 3.5); g.fillRect(wx + 15, wy + i * 3.5, 5, 3.5); } });
    g.fillStyle = "#5a3a2a"; g.fillRect(px + 38, by - 28, 14, 28);
    g.fillStyle = "#6a6a6a"; g.fillRect(px + 92, by - 100, 2.5, 100); ["#009246", "#ffffff", "#ce2b37"].forEach((c, i) => { g.fillStyle = c; g.fillRect(px + 94.5 + i * 7, by - 100, 7, 14); });
  } else if (kind === "larch") {
    // a larch: a soft, light-green conifer of the Alps
    pineShape(px + 16, by, 90 + H * 30, "#5a9a4a", "#4a8a3a", null, OUT);
  } else if (kind === "canoe") {
    // canoes pulled up on the bank, with a paddle against them
    shadowAt(px + 40, by, 44);
    [["#d8402a", 0], ["#3a8ad8", 10]].forEach(([c, dy]) => { g.fillStyle = c; g.beginPath(); g.moveTo(px, by - 14 - dy); g.quadraticCurveTo(px + 6, by - dy, px + 24, by - dy); g.lineTo(px + 56, by - dy); g.quadraticCurveTo(px + 74, by - dy, px + 80, by - 14 - dy); g.quadraticCurveTo(px + 40, by - 8 - dy, px, by - 14 - dy); g.closePath(); g.fill(); g.stroke(); g.fillStyle = "#f2c42a"; g.fillRect(px + 8, by - 9 - dy, 64, 2); });
    g.strokeStyle = "#6a4426"; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 66, by); g.lineTo(px + 80, by - 44); g.stroke(); g.fillStyle = "#f2c42a"; g.strokeStyle = OUT; g.lineWidth = 1.5; g.beginPath(); g.ellipse(px + 81, by - 46, 4, 8, .3, 0, 7); g.fill(); g.stroke(); g.lineWidth = 2;
  } else if (kind === "sunflowers") {
    // a patch of sunflowers, their heads turned towards the sun
    shadowAt(px + 30, by, 30);
    [[6, 58], [18, 70], [30, 52], [42, 66], [54, 60]].forEach(([dx, h], i) => {
      const fx = px + dx, fy = by - h;
      g.strokeStyle = "#4a7a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(fx, by); g.lineTo(fx + 1, fy); g.stroke();
      g.fillStyle = "#5a8a32"; g.beginPath(); g.ellipse(fx + (i % 2 ? 6 : -6), by - h * .45, 7, 3.5, i % 2 ? -.5 : .5, 0, 7); g.fill();
      g.fillStyle = "#f2c42a"; for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; g.beginPath(); g.ellipse(fx + 1 + Math.cos(a) * 7, fy + Math.sin(a) * 7, 4, 2.2, a, 0, 7); g.fill(); }
      g.fillStyle = "#6a4020"; g.beginPath(); g.arc(fx + 1, fy, 5, 0, 7); g.fill(); g.fillStyle = "#8a5a2a"; g.fillRect(fx - 1, fy - 2, 2, 2);
    });
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "vines") {
    // a row of grapevines on wires, with bunches of purple grapes
    shadowAt(px + 46, by, 48);
    g.fillStyle = "#7a5a3a"; g.fillRect(px + 2, by - 46, 4, 46); g.fillRect(px + 86, by - 46, 4, 46);
    g.strokeStyle = "#8a8a80"; g.lineWidth = 1; [-40, -26].forEach(dy => { g.beginPath(); g.moveTo(px + 4, by + dy); g.lineTo(px + 88, by + dy); g.stroke(); });
    for (let i = 0; i < 4; i++) {
      const vx = px + 14 + i * 21;
      g.strokeStyle = "#5a3e24"; g.lineWidth = 3; g.beginPath(); g.moveTo(vx, by); g.quadraticCurveTo(vx - 3, by - 14, vx + 1, by - 26); g.stroke();
      [[-7, -36], [6, -34], [0, -44], [-4, -26], [8, -24]].forEach(([dx, dy], k) => { g.fillStyle = k % 2 ? "#5a8a32" : "#4a7a2a"; g.beginPath(); g.ellipse(vx + dx, by + dy, 7, 5, 0, 0, 7); g.fill(); });
      g.fillStyle = "#5a2a6a"; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(vx - 2 + (k % 3) * 3 - (k > 2 ? -1.5 : 0), by - 22 + Math.floor(k / 3) * 3 + (k === 5 ? 3 : 0), 2, 0, 7); g.fill(); }
    }
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "barrel") {
    // an oak wine barrel with iron hoops
    shadowAt(px + 16, by, 18);
    g.fillStyle = "#8a5a32"; g.beginPath(); g.moveTo(px + 4, by); g.quadraticCurveTo(px - 2, by - 22, px + 4, by - 44); g.lineTo(px + 28, by - 44); g.quadraticCurveTo(px + 34, by - 22, px + 28, by); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#6a4426"; g.lineWidth = 1; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(px + 4 + i * 6, by - 43); g.quadraticCurveTo(px + 2 + i * 6.5, by - 22, px + 4 + i * 6, by - 1); g.stroke(); }
    g.strokeStyle = "#3a3a40"; g.lineWidth = 2.5; [-38, -26, -16, -6].forEach(dy => { g.beginPath(); g.moveTo(px + 2, by + dy); g.lineTo(px + 30, by + dy); g.stroke(); });
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "mas") {
    // a mas: an old stone farmhouse of the south, with a tiled roof and blue shutters
    shadowAt(px + 50, by, 54);
    g.fillStyle = "#e0c896"; g.fillRect(px, by - 64, 100, 64); g.strokeRect(px, by - 64, 100, 64);
    g.fillStyle = "#cdb27e"; for (let i = 0; i < 18; i++) g.fillRect(px + 4 + hash(x + i) * 88, by - 60 + hash(x * 3 + i) * 54, 8, 3);
    g.fillStyle = "#c0603a"; g.beginPath(); g.moveTo(px - 8, by - 62); g.lineTo(px + 50, by - 84); g.lineTo(px + 108, by - 62); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#9a4a2a"; for (let i = 0; i < 9; i++) g.fillRect(px - 4 + i * 13, by - 64, 8, 3);
    [[px + 12, by - 50], [px + 70, by - 50]].forEach(([wx, wy]) => { g.fillStyle = "#3a2a1a"; g.fillRect(wx, wy, 14, 18); g.fillStyle = "#4a7ab0"; g.fillRect(wx - 7, wy, 6, 18); g.fillRect(wx + 15, wy, 6, 18); });
    g.fillStyle = "#4a7ab0"; g.fillRect(px + 42, by - 32, 18, 32); g.strokeRect(px + 42, by - 32, 18, 32);
    g.fillStyle = "#5a8a32"; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(px + 34 + Math.sin(i * 1.7) * 4, by - 4 - i * 5, 3.5, 0, 7); g.fill(); }
  } else if (kind === "stalagmite") {
    // stalagmites on the cave floor, growing a centimetre every hundred years
    shadowAt(px + 24, by, 26);
    [[6, 30, 6], [20, 56, 9], [36, 40, 7], [48, 22, 5]].forEach(([dx, h, w]) => {
      g.fillStyle = "#9a8668"; g.beginPath(); g.moveTo(px + dx - w, by); g.quadraticCurveTo(px + dx - w * .4, by - h * .6, px + dx, by - h); g.quadraticCurveTo(px + dx + w * .4, by - h * .6, px + dx + w, by); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "rgba(240,225,190,.45)"; g.fillRect(px + dx - 1.5, by - h + 6, 1.5, h - 10);
    });
  } else if (kind === "column") {
    // a column: a stalactite and a stalagmite that grew into each other
    const w = 14;
    g.fillStyle = "#8a7658"; g.beginPath(); g.moveTo(px + 16 - w * 1.6, by); g.quadraticCurveTo(px + 16 - w * .4, by - 120, px + 16 - w * .5, by - 220);
    g.lineTo(px + 16 - w * 1.4, by - 400); g.lineTo(px + 16 + w * 1.4, by - 400); g.lineTo(px + 16 + w * .5, by - 220); g.quadraticCurveTo(px + 16 + w * .4, by - 120, px + 16 + w * 1.6, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(240,225,190,.35)"; g.fillRect(px + 12, by - 380, 3, 370);
  } else if (kind === "heather") {
    // a low clump of purple heather on the hillside
    shadowAt(px + 22, by, 26);
    [[8, 9, 0], [22, 12, 1], [36, 9, 2], [15, 7, 3], [29, 8, 4]].forEach(([dx, r, i]) => {
      g.fillStyle = i % 2 ? "#4a6a3a" : "#3e5e32"; g.beginPath(); g.ellipse(px + dx, by - r * .7, r, r * .8, 0, Math.PI, 0); g.fill();
    });
    for (let i = 0; i < 26; i++) {
      const hx = px + 2 + hash(x * 7 + i) * 40, hy = by - 2 - hash(x * 11 + i * 3) * 14;
      g.fillStyle = ["#9a5aa8", "#b878c4", "#7e4690"][i % 3]; g.fillRect(hx, hy, 2.2, 2.2);
    }
  } else if (kind === "castle") {
    shadowAt(px + 48, by, 50);
    g.fillStyle = "#77796f"; g.fillRect(px + 8, by - 66, 76, 66); g.strokeRect(px + 8, by - 66, 76, 66);
    g.fillStyle = "#666b65"; g.fillRect(px, by - 88, 24, 88); g.strokeRect(px, by - 88, 24, 88);
    g.fillRect(px + 68, by - 80, 24, 80); g.strokeRect(px + 68, by - 80, 24, 80);
    g.fillStyle = "#62675f";
    battlements(px, px + 24, by - 88, 6, true); battlements(px + 29, px + 63, by - 66, 6, true); battlements(px + 68, px + 92, by - 80, 6, true);
    g.fillStyle = "#424b4d"; g.fillRect(px + 39, by - 34, 16, 34); g.strokeRect(px + 39, by - 34, 16, 34);
    g.fillStyle = "#a9a48d"; g.fillRect(px + 16, by - 59, 5, 12); g.fillRect(px + 76, by - 70, 5, 12);
  } else if (kind === "tartan") {
    shadowAt(px + 34, by, 24);
    g.fillStyle = "#264d3a"; g.fillRect(px, by - 48, 68, 42); g.strokeRect(px, by - 48, 68, 42);
    g.fillStyle = "#9c2935";
    for (let xx = px + 7; xx < px + 68; xx += 18) g.fillRect(xx, by - 48, 5, 42);
    for (let yy = by - 42; yy < by - 6; yy += 16) g.fillRect(px, yy, 68, 5);
    g.fillStyle = "rgba(240,210,120,.72)";
    for (let xx = px + 2; xx < px + 68; xx += 18) g.fillRect(xx, by - 48, 1.5, 42);
    for (let yy = by - 42; yy < by - 6; yy += 16) g.fillRect(px, yy, 68, 1.5);
    g.fillStyle = "#795333"; g.fillRect(px + 10, by - 6, 4, 6); g.fillRect(px + 54, by - 6, 4, 6);
  } else if (kind === "bagpipes") {
    shadowAt(px + 32, by, 22);
    g.strokeStyle = "#26352e"; g.lineWidth = 5; g.beginPath(); g.moveTo(px + 27, by - 16); g.lineTo(px + 22, by - 72); g.moveTo(px + 39, by - 18); g.lineTo(px + 48, by - 70); g.stroke();
    g.fillStyle = "#8b2934"; g.beginPath(); g.ellipse(px + 31, by - 22, 21, 17, -.2, 0, 7); g.fill(); g.stroke();
    g.strokeStyle = "#d5b96e"; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 18, by - 34); g.lineTo(px + 44, by - 33); g.stroke();
    g.strokeStyle = "#26352e"; g.lineWidth = 4; g.beginPath(); g.moveTo(px + 19, by - 29); g.quadraticCurveTo(px + 4, by - 17, px + 12, by - 2); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "waterfall") {
    // a waterfall over limestone, splashing into a pool (Krka, Plitvice)
    const h = 150, w = 46;
    g.fillStyle = "#b8a888"; g.beginPath(); g.moveTo(px - 10, by); g.lineTo(px - 6, by - h - 10); g.lineTo(px + w + 6, by - h - 10); g.lineTo(px + w + 10, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a7a3a"; g.beginPath(); g.ellipse(px + w / 2, by - h - 12, w / 2 + 14, 9, 0, 0, 7); g.fill();
    const wg = g.createLinearGradient(0, by - h, 0, by); wg.addColorStop(0, "#e8fbff"); wg.addColorStop(1, "#8ad8e8");
    g.fillStyle = wg; g.fillRect(px + 4, by - h - 6, w - 8, h + 6);
    g.fillStyle = "rgba(255,255,255,.8)"; for (let i = 0; i < 5; i++) { const sx = px + 8 + i * (w - 16) / 4; for (let k = 0; k < 4; k++) { const yy = by - h + ((frame * 3 + k * 40 + i * 13) % h); g.fillRect(sx, yy, 2, 14); } }
    g.fillStyle = "#f4ffff"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(px + w / 2 + Math.sin(frame / 7 + i * 1.7) * (w / 2), by - 4 - Math.abs(Math.sin(frame / 9 + i)) * 6, 4, 0, 7); g.fill(); }
  } else if (kind === "boatdeco") {
    // a little wooden fishing boat pulled up on the shore
    shadowAt(px + 36, by, 40);
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.moveTo(px, by - 18); g.lineTo(px + 74, by - 18); g.quadraticCurveTo(px + 70, by, px + 54, by); g.lineTo(px + 14, by); g.quadraticCurveTo(px + 2, by - 4, px, by - 18); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#3a8ad8"; g.fillRect(px + 4, by - 16, 68, 4); g.fillStyle = "#d8402e"; g.fillRect(px + 10, by - 8, 50, 2);
    g.strokeStyle = "#5a3a22"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px + 30, by - 18); g.lineTo(px + 50, by - 30); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "windmill") {
    // a Dutch windmill: a dark octagonal body, a thatched cap, a stage around it and sails that turn in the wind
    shadowAt(px + 30, by, 44);
    g.fillStyle = "#3e4a3a"; g.beginPath(); g.moveTo(px + 6, by); g.lineTo(px + 16, by - 120); g.lineTo(px + 44, by - 120); g.lineTo(px + 54, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4e5c48"; g.beginPath(); g.moveTo(px + 30, by); g.lineTo(px + 30, by - 120); g.lineTo(px + 44, by - 120); g.lineTo(px + 54, by); g.closePath(); g.fill();
    g.fillStyle = "#6e4426"; g.fillRect(px - 4, by - 58, 68, 5); g.strokeRect(px - 4, by - 58, 68, 5);
    for (let xx = px; xx <= px + 60; xx += 10) g.fillRect(xx, by - 53, 2, 14);
    g.fillStyle = "#f1ece0"; g.fillRect(px + 24, by - 24, 12, 24); g.strokeRect(px + 24, by - 24, 12, 24); g.fillStyle = "#ffd88a"; g.fillRect(px + 26, by - 92, 8, 10);
    g.fillStyle = "#8a6a3a"; g.beginPath(); g.moveTo(px + 12, by - 118); g.quadraticCurveTo(px + 30, by - 146, px + 48, by - 118); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px + 14, by - 122); g.quadraticCurveTo(px + 30, by - 144, px + 46, by - 122); g.quadraticCurveTo(px + 30, by - 136, px + 14, by - 122); g.fill();
    const hx = px + 30, hy = by - 118, a0 = frame * .012 + H * 6;
    for (let k = 0; k < 4; k++) {
      const a = a0 + k * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
      g.strokeStyle = "#4a3020"; g.lineWidth = 3; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + ca * 64, hy + sa * 64); g.stroke();
      g.save(); g.translate(hx, hy); g.rotate(a);
      g.fillStyle = "rgba(244,240,228,.85)"; g.fillRect(10, 1, 52, 11); g.strokeStyle = "#4a3020"; g.lineWidth = 1; for (let i = 14; i < 62; i += 6) { g.beginPath(); g.moveTo(i, 1); g.lineTo(i, 12); g.stroke(); }
      g.restore();
    }
    g.strokeStyle = OUT; g.lineWidth = 2; g.fillStyle = "#3a2a1a"; g.beginPath(); g.arc(hx, hy, 4, 0, 7); g.fill();
  } else if (kind === "gablehouse") {
    // a narrow canal house with a stepped, neck or bell gable, white window frames and a hoist beam
    const v = Math.floor(H * 3), cols = ["#7a3a2a", "#3e4a5a", "#8a5a3a", "#5a3a3a"], w = 52, h = 140;
    shadowAt(px + w / 2, by, 34);
    g.fillStyle = cols[Math.floor(H * 4)]; g.beginPath(); g.moveTo(px, by); g.lineTo(px, by - h);
    if (v === 0) [[0, 12], [8, 12], [8, 24], [16, 24], [16, 36], [36, 36], [36, 24], [44, 24], [44, 12], [52, 12], [52, 0]].forEach(([dx, dy]) => g.lineTo(px + dx, by - h - dy));
    else if (v === 1) { g.lineTo(px + 12, by - h); g.quadraticCurveTo(px + 12, by - h - 20, px + 16, by - h - 30); g.lineTo(px + 36, by - h - 30); g.quadraticCurveTo(px + 40, by - h - 20, px + 40, by - h); g.lineTo(px + w, by - h); }
    else { g.quadraticCurveTo(px + 4, by - h - 26, px + w / 2, by - h - 34); g.quadraticCurveTo(px + w - 4, by - h - 26, px + w, by - h); }
    g.lineTo(px + w, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f1ea"; g.fillRect(px + w / 2 - 2, by - h - 26, 4, 10);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const wx = px + 8 + c * 22, wy = by - h + 10 + r * 30; g.fillStyle = "#f4f1ea"; g.fillRect(wx - 2, wy - 2, 18, 22); g.fillStyle = (hash(x * 3 + r * 7 + c) > .45) ? "#ffd88a" : "#2a3550"; g.fillRect(wx, wy, 14, 18); }
    g.fillStyle = "#2a3a2a"; g.fillRect(px + 18, by - 26, 16, 26); g.strokeRect(px + 18, by - 26, 16, 26);
    g.fillStyle = "#f4f8ff"; g.fillRect(px - 2, by - h - 2, w + 4, 3);
  } else if (kind === "polarbear") {
    // A polar bear standing on the ice, facing right (scenery: it minds its own business, so its legs stay still).
    // The rump is higher than the shoulders, a long neck, a narrow head with a Roman nose, big paws, a cream-white coat.
    const fur = "#f3f0e4", shadow = "#d9d6c6", far = "#e2dfd0", sx = px - 2;
    shadowAt(sx + 36, by, 38);
    const leg = (x, top, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - 6, top); g.lineTo(x + 6, top); g.quadraticCurveTo(x + 7, by - 10, x + 6, by - 4);
      g.quadraticCurveTo(x + 9, by, x + 4, by); g.lineTo(x - 6, by); g.quadraticCurveTo(x - 7, by - 4, x - 6, top); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = shadow; g.lineWidth = 1; [-2, 1, 4].forEach(d => { g.beginPath(); g.moveTo(x + d, by - 2.5); g.lineTo(x + d, by); g.stroke(); }); g.strokeStyle = OUT; g.lineWidth = 2; };
    // far legs first, a little darker
    leg(sx + 18, by - 24, far); leg(sx + 50, by - 22, far);
    // the body: high rump at the back, the back slopes down to the shoulders, a heavy belly
    const body = () => { g.beginPath(); g.moveTo(sx + 6, by - 30); g.quadraticCurveTo(sx + 6, by - 46, sx + 22, by - 46); g.quadraticCurveTo(sx + 40, by - 45, sx + 52, by - 40);
      g.quadraticCurveTo(sx + 60, by - 37, sx + 60, by - 28); g.quadraticCurveTo(sx + 58, by - 18, sx + 46, by - 18); g.quadraticCurveTo(sx + 30, by - 15, sx + 14, by - 19);
      g.quadraticCurveTo(sx + 6, by - 21, sx + 6, by - 30); g.closePath(); };
    g.fillStyle = fur; body(); g.fill();
    g.save(); body(); g.clip(); g.fillStyle = shadow; g.beginPath(); g.ellipse(sx + 32, by - 16, 30, 7, 0, 0, 7); g.fill(); g.restore();
    body(); g.stroke();
    // a little tail
    g.fillStyle = fur; g.beginPath(); g.ellipse(sx + 6, by - 36, 3, 2.5, 0, 0, 7); g.fill(); g.stroke();
    // near legs
    leg(sx + 13, by - 26, fur); leg(sx + 45, by - 26, fur);
    // the long neck and the head, held a little low and forward
    g.fillStyle = fur; g.beginPath(); g.moveTo(sx + 50, by - 41); g.quadraticCurveTo(sx + 62, by - 44, sx + 70, by - 38); g.lineTo(sx + 70, by - 28); g.quadraticCurveTo(sx + 62, by - 26, sx + 56, by - 26); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(sx + 52, by - 41); g.quadraticCurveTo(sx + 62, by - 44, sx + 68, by - 40); g.stroke();
    g.beginPath(); g.moveTo(sx + 66, by - 40); g.quadraticCurveTo(sx + 72, by - 44, sx + 78, by - 40); g.quadraticCurveTo(sx + 86, by - 36, sx + 88, by - 33);
    g.quadraticCurveTo(sx + 89, by - 29, sx + 85, by - 28); g.quadraticCurveTo(sx + 76, by - 26, sx + 68, by - 28); g.quadraticCurveTo(sx + 64, by - 33, sx + 66, by - 40); g.closePath(); g.fill(); g.stroke();
    // ear, eye, nose, mouth
    g.beginPath(); g.arc(sx + 70, by - 42, 3, Math.PI * .9, Math.PI * 2.1); g.fill(); g.stroke();
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(sx + 77, by - 36.5, 1.5, 0, 7); g.fill();
    g.beginPath(); g.ellipse(sx + 87, by - 32, 2.6, 2, 0, 0, 7); g.fill();
    g.strokeStyle = "#1d1d26"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx + 86, by - 29); g.quadraticCurveTo(sx + 82, by - 28, sx + 79, by - 29); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "walrus") {
    // a walrus resting on the ice, with long tusks and a moustache
    shadowAt(px + 26, by, 30);
    g.fillStyle = "#8a5a44"; g.beginPath(); g.moveTo(px, by); g.quadraticCurveTo(px + 2, by - 30, px + 30, by - 34); g.quadraticCurveTo(px + 52, by - 34, px + 54, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#a8745a"; g.beginPath(); g.ellipse(px + 18, by - 24, 10, 4, -.3, 0, 7); g.fill();
    g.fillStyle = "#6a4232"; g.beginPath(); g.ellipse(px + 4, by - 3, 9, 4, .3, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c89a7a"; g.beginPath(); g.ellipse(px + 46, by - 22, 7, 5, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#fff8e8"; g.beginPath(); g.moveTo(px + 42, by - 18); g.lineTo(px + 43, by - 4); g.lineTo(px + 45, by - 18); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(px + 48, by - 18); g.lineTo(px + 49, by - 4); g.lineTo(px + 51, by - 18); g.fill(); g.stroke();
    g.fillStyle = "#1d1d26"; g.fillRect(px + 40, by - 32, 2, 2); g.fillRect(px + 49, by - 32, 2, 2);
  } else if (kind === "muskox") {
    // a musk ox: a shaggy brown blanket with horns
    shadowAt(px + 26, by, 28);
    g.fillStyle = "#3a2a1e"; [[10], [18], [34], [42]].forEach(([dx]) => g.fillRect(px + dx, by - 12, 5, 12));
    g.fillStyle = "#5a4030"; g.beginPath(); g.moveTo(px + 2, by - 8); g.quadraticCurveTo(px, by - 38, px + 26, by - 40); g.quadraticCurveTo(px + 50, by - 40, px + 50, by - 8);
    for (let i = 0; i <= 8; i++) g.lineTo(px + 50 - i * 6, by - 8 + (i % 2) * 4); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#7a5a40"; g.beginPath(); g.ellipse(px + 20, by - 34, 14, 4, 0, 0, 7); g.fill();
    g.fillStyle = "#4a3426"; g.beginPath(); rp(px + 44, by - 30, 14, 16, 5); g.fill(); g.stroke();
    g.strokeStyle = "#e8dcc4"; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 46, by - 30); g.quadraticCurveTo(px + 38, by - 26, px + 44, by - 18); g.moveTo(px + 56, by - 30); g.quadraticCurveTo(px + 62, by - 26, px + 58, by - 18); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#1d1d26"; g.fillRect(px + 48, by - 24, 2, 2); g.fillRect(px + 53, by - 24, 2, 2);
  } else if (kind === "cow") {
    // A cow in the field, facing right. In the Netherlands mostly a black-and-white Holstein, now and then a red-and-white
    // one; in the Dolomites a brown Alpine cow with a bell. The patches are clipped to the body, so they follow its shape.
    const alp = L && L.d && L.d.scene === "dolomiti", red = !alp && H > .72;
    const hide = alp ? "#9a6a44" : "#f7f5ef", spot = red ? "#9a3f26" : "#22222a", hoof = "#3a3036", sx = px - 4;
    shadowAt(sx + 30, by, 30);
    // legs (far pair a little darker), with knees and hooves
    const leg = (x, far, k) => { g.lineWidth = 1.4; g.fillStyle = far ? shade(hide, -.14) : hide; g.beginPath(); g.moveTo(x - 4, by - 21); g.lineTo(x + 4, by - 21); g.lineTo(x + 3.5 + k, by - 10); g.lineTo(x + 3, by - 3); g.lineTo(x - 3, by - 3); g.lineTo(x - 3.5 + k, by - 10); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = hoof; g.beginPath(); rp(x - 3.5, by - 4.5, 7, 4.5, 1.5); g.fill(); g.lineWidth = 2; };
    leg(sx + 14, true, -1); leg(sx + 40, true, 1);
    // tail with a tuft
    g.strokeStyle = shade(hide, -.25); g.lineWidth = 2; g.beginPath(); g.moveTo(sx + 5, by - 33); g.quadraticCurveTo(sx - 2, by - 26, sx + 1, by - 13); g.stroke();
    g.fillStyle = alp ? "#5a3a22" : spot; g.beginPath(); g.ellipse(sx + 1, by - 11, 2.5, 4, 0, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 2;
    // the body: a straight back with hip bones, a round belly
    const body = () => { g.beginPath(); g.moveTo(sx + 6, by - 34); g.quadraticCurveTo(sx + 9, by - 39, sx + 14, by - 37); g.quadraticCurveTo(sx + 30, by - 35, sx + 46, by - 38);
      g.quadraticCurveTo(sx + 52, by - 37, sx + 52, by - 30); g.quadraticCurveTo(sx + 52, by - 20, sx + 44, by - 19); g.quadraticCurveTo(sx + 28, by - 15, sx + 12, by - 19);
      g.quadraticCurveTo(sx + 3, by - 21, sx + 4, by - 28); g.closePath(); };
    g.fillStyle = hide; body(); g.fill();
    if (!alp) { g.save(); body(); g.clip(); g.fillStyle = spot;
      [[14, -32, 9, 7, .4], [33, -33, 8, 5, -.3], [27, -21, 7, 4, .2], [47, -27, 5, 6, 0], [6, -24, 4, 5, .5]].forEach(([dx, dy, rx, ry, a], i) => {
        if (red && i === 4) return; g.beginPath(); g.ellipse(sx + dx + (H - .5) * 4, by + dy, rx, ry, a, 0, 7); g.fill(); });
      g.restore(); }
    else { g.fillStyle = "#c79a70"; g.beginPath(); g.ellipse(sx + 28, by - 20, 14, 3, 0, 0, 7); g.fill(); }
    g.strokeStyle = OUT; body(); g.stroke();
    // udder
    g.lineWidth = 1.4; g.fillStyle = "#f2b6b0"; g.beginPath(); g.ellipse(sx + 18, by - 17.5, 3.6, 2.4, 0, 0, 7); g.fill(); g.stroke(); g.lineWidth = 2;
    // near legs, in front of the body
    leg(sx + 10, false, -1); leg(sx + 44, false, 1);
    // the head: neck, a long face, ears, short horns, a pink muzzle
    g.fillStyle = hide; g.beginPath(); g.moveTo(sx + 46, by - 37); g.quadraticCurveTo(sx + 54, by - 42, sx + 58, by - 41); g.lineTo(sx + 56, by - 27); g.quadraticCurveTo(sx + 51, by - 26, sx + 48, by - 28); g.closePath(); g.fill();
    g.strokeStyle = "#d8cfb8"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(sx + 56, by - 44); g.quadraticCurveTo(sx + 55, by - 49, sx + 52, by - 50); g.moveTo(sx + 61, by - 44); g.quadraticCurveTo(sx + 63, by - 49, sx + 66, by - 50); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = hide; g.beginPath(); g.ellipse(sx + 52, by - 41, 5, 2.6, -.3, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(sx + 54, by - 45); g.quadraticCurveTo(sx + 59, by - 47, sx + 64, by - 44); g.quadraticCurveTo(sx + 67, by - 36, sx + 67, by - 29); g.lineTo(sx + 57, by - 28); g.quadraticCurveTo(sx + 53, by - 37, sx + 54, by - 45); g.closePath(); g.fill(); g.stroke();
    if (!alp && !red) { g.fillStyle = spot; g.beginPath(); g.ellipse(sx + 57.5, by - 41, 3.5, 3, .3, 0, 7); g.fill(); }
    g.fillStyle = "#f0b4ac"; g.beginPath(); rp(sx + 56, by - 33, 12, 7, 3.5); g.fill(); g.stroke();
    g.fillStyle = "#8a4a4a"; g.fillRect(sx + 60, by - 31, 1.6, 1.6); g.fillRect(sx + 64, by - 31, 1.6, 1.6);
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(sx + 63, by - 39, 1.6, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.fillRect(sx + 63, by - 40, .8, .8);
    // an Alpine cow wears a bell
    if (alp) { g.strokeStyle = "#7a3a2a"; g.lineWidth = 3; g.beginPath(); g.moveTo(sx + 52, by - 29); g.lineTo(sx + 56, by - 27); g.stroke(); g.strokeStyle = OUT; g.lineWidth = 2;
      g.fillStyle = "#e0b24a"; g.beginPath(); g.moveTo(sx + 51, by - 27); g.lineTo(sx + 57, by - 27); g.lineTo(sx + 58, by - 20); g.lineTo(sx + 50, by - 20); g.closePath(); g.fill(); g.stroke(); }
  } else if (kind === "clogs") {
    // a giant pair of wooden clogs: a classic photo spot
    shadowAt(px + 30, by, 34);
    [[0, "#f2c230"], [30, "#f2c230"]].forEach(([dx, c]) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(px + dx, by - 4); g.quadraticCurveTo(px + dx - 2, by - 26, px + dx + 8, by - 28); g.lineTo(px + dx + 18, by - 28);
      g.quadraticCurveTo(px + dx + 24, by - 16, px + dx + 30, by - 12); g.quadraticCurveTo(px + dx + 36, by - 8, px + dx + 30, by); g.lineTo(px + dx + 4, by); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#3a2a1a"; g.beginPath(); g.ellipse(px + dx + 11, by - 26, 6, 2.5, 0, 0, 7); g.fill();
      g.fillStyle = "#d8232a"; g.beginPath(); g.arc(px + dx + 20, by - 12, 3, 0, 7); g.fill();
    });
  } else if (kind === "tulips") {
    // tulips in a wooden crate (from the greenhouse: it's winter)
    shadowAt(px + 22, by, 24);
    for (let i = 0; i < 7; i++) {
      const tx = px + 4 + i * 6, ty = by - 30 - (i % 2) * 6;
      g.strokeStyle = "#3a7a3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, by - 14); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = ["#e8323a", "#f2c230", "#e85aa0", "#f08a2a"][i % 4]; g.beginPath(); g.moveTo(tx - 4, ty); g.lineTo(tx - 4, ty - 7); g.lineTo(tx - 1.5, ty - 4); g.lineTo(tx, ty - 8); g.lineTo(tx + 1.5, ty - 4); g.lineTo(tx + 4, ty - 7); g.lineTo(tx + 4, ty); g.closePath(); g.fill();
    }
    g.strokeStyle = OUT; g.lineWidth = 2; g.fillStyle = "#a87a4a"; g.fillRect(px, by - 16, 46, 16); g.strokeRect(px, by - 16, 46, 16);
    g.fillStyle = "#8a5a32"; g.fillRect(px, by - 9, 46, 2);
  } else if (kind === "cheese") {
    // a stack of Gouda cheese wheels on a wooden barrow
    shadowAt(px + 28, by, 34);
    g.fillStyle = "#8a5a32"; g.fillRect(px, by - 10, 58, 6); g.strokeRect(px, by - 10, 58, 6);
    g.fillStyle = "#3a2a1a"; g.beginPath(); g.arc(px + 10, by - 3, 4, 0, 7); g.arc(px + 48, by - 3, 4, 0, 7); g.fill();
    [[4, 0], [30, 0], [17, 1]].forEach(([dx, row]) => { const cy = by - 18 - row * 14; g.fillStyle = "#f2b630"; g.beginPath(); g.ellipse(px + dx + 12, cy, 13, 8, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#f8d060"; g.beginPath(); g.ellipse(px + dx + 12, cy - 3, 11, 4, 0, 0, 7); g.fill(); });
  } else if (kind === "bike") {
    // a Dutch bike (upright, with a crate on the front)
    const c = ["#1d1d26", "#2e5a9a", "#c43a3a", "#f4f1ea"][Math.floor(H * 4)];
    g.strokeStyle = "#2a2f3c"; g.lineWidth = 2.5; [px + 8, px + 44].forEach(cx => { g.beginPath(); g.arc(cx, by - 11, 11, 0, 7); g.stroke(); });
    g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 8, by - 11); g.lineTo(px + 22, by - 11); g.lineTo(px + 18, by - 30); g.moveTo(px + 22, by - 11); g.lineTo(px + 38, by - 28); g.lineTo(px + 44, by - 11); g.moveTo(px + 18, by - 26); g.lineTo(px + 38, by - 26); g.stroke();
    g.strokeStyle = "#2a2f3c"; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 38, by - 28); g.lineTo(px + 36, by - 36); g.lineTo(px + 30, by - 38); g.stroke();
    g.fillStyle = "#3a2a1a"; g.fillRect(px + 13, by - 33, 10, 3);
    g.strokeStyle = OUT; g.lineWidth = 2; g.fillStyle = "#a87a4a"; g.fillRect(px + 40, by - 40, 14, 10); g.strokeRect(px + 40, by - 40, 14, 10);
  } else if (kind === "thatch") {
    // a farmhouse with a thatched roof (Giethoorn), with a little bridge to the door
    shadowAt(px + 48, by, 56);
    g.fillStyle = "#8a4a32"; g.fillRect(px, by - 40, 96, 40); g.strokeRect(px, by - 40, 96, 40);
    g.fillStyle = "#a07a42"; g.beginPath(); g.moveTo(px - 10, by - 36); g.quadraticCurveTo(px + 48, by - 112, px + 106, by - 36); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 10, by - 36); g.quadraticCurveTo(px + 48, by - 112, px + 106, by - 36); g.quadraticCurveTo(px + 48, by - 98, px - 10, by - 36); g.fill();
    g.fillStyle = "#2a5a3a"; g.fillRect(px + 40, by - 30, 16, 30); g.strokeRect(px + 40, by - 30, 16, 30);
    [[px + 10, by - 30], [px + 70, by - 30]].forEach(([wx, wy]) => { g.fillStyle = "#f4f1ea"; g.fillRect(wx - 2, wy - 2, 18, 18); g.fillStyle = "#ffd88a"; g.fillRect(wx, wy, 14, 14); });
  } else if (kind === "willow") {
    // a pollard willow by the ditch: a short thick trunk with a crown of thin branches
    shadowAt(px + 16, by, 16);
    g.fillStyle = "#5a4a3a"; g.beginPath(); g.moveTo(px + 8, by); g.lineTo(px + 10, by - 50); g.lineTo(px + 24, by - 50); g.lineTo(px + 26, by); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#6a5a48"; g.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (i - 6.5) * .16; g.beginPath(); g.moveTo(px + 17, by - 50); g.quadraticCurveTo(px + 17 + Math.cos(a) * 20, by - 50 + Math.sin(a) * 30, px + 17 + Math.cos(a) * 34, by - 50 + Math.sin(a) * 44); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2; g.fillStyle = "#f4f8ff"; g.fillRect(px + 9, by - 52, 16, 3);
  } else if (kind === "dune") {
    // a dune with marram grass
    g.fillStyle = "#e6d4a8"; g.beginPath(); g.moveTo(px - 30, by); g.quadraticCurveTo(px + 24, by - 60, px + 80, by); g.closePath(); g.fill();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 10, by - 18); g.quadraticCurveTo(px + 24, by - 52, px + 60, by - 18); g.quadraticCurveTo(px + 24, by - 40, px - 10, by - 18); g.fill();
    g.strokeStyle = "#8a9a4a"; g.lineWidth = 1.5; for (let i = 0; i < 16; i++) { const gx = px - 10 + i * 6, gy = by - 6 - Math.sin(i / 16 * Math.PI) * 44; g.beginPath(); g.moveTo(gx, gy + 6); g.lineTo(gx + 4, gy - 8); g.moveTo(gx, gy + 6); g.lineTo(gx - 3, gy - 6); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2;
  } else if (kind === "lighthouse") {
    // a red-and-white lighthouse with a turning light
    const w = 34, h = 190;
    shadowAt(px + w / 2, by, 30);
    g.save(); g.beginPath(); g.moveTo(px, by); g.lineTo(px + 6, by - h); g.lineTo(px + w - 6, by - h); g.lineTo(px + w, by); g.closePath(); g.clip();
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#c8323a"; g.fillRect(px - 2, by - (i + 1) * h / 6, w + 4, h / 6); }
    g.restore();
    g.beginPath(); g.moveTo(px, by); g.lineTo(px + 6, by - h); g.lineTo(px + w - 6, by - h); g.lineTo(px + w, by); g.closePath(); g.stroke();
    g.fillStyle = "#2a2f3c"; g.fillRect(px + 2, by - h - 6, w - 4, 6); g.fillStyle = "#ffe8a0"; g.fillRect(px + 8, by - h - 26, w - 16, 20); g.strokeRect(px + 8, by - h - 26, w - 16, 20);
    g.fillStyle = "#c8323a"; g.beginPath(); g.moveTo(px + 4, by - h - 26); g.lineTo(px + w / 2, by - h - 40); g.lineTo(px + w - 4, by - h - 26); g.closePath(); g.fill(); g.stroke();
    const a = frame * .03, beam = g.createLinearGradient(px + w / 2, 0, px + w / 2 + Math.cos(a) * 200, 0);
    beam.addColorStop(0, "rgba(255,240,170,.55)"); beam.addColorStop(1, "rgba(255,240,170,0)");
    g.fillStyle = beam; g.beginPath(); g.moveTo(px + w / 2, by - h - 16); g.lineTo(px + w / 2 + Math.cos(a) * 200, by - h - 16 - 24); g.lineTo(px + w / 2 + Math.cos(a) * 200, by - h - 16 + 24); g.closePath(); g.fill();
  } else if (kind === "candycane") {
    // a candy-cane pole, red and white
    g.lineWidth = 9; g.strokeStyle = OUT; g.beginPath(); g.moveTo(px + 16, by); g.lineTo(px + 16, by - 64); g.arc(px + 26, by - 64, 10, Math.PI, 0); g.stroke();
    g.lineWidth = 6; g.strokeStyle = "#f8f4ec"; g.stroke();
    g.strokeStyle = "#d8232a"; g.lineWidth = 6; g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]);
    g.lineWidth = 2; g.strokeStyle = OUT;
  } else if (kind === "presents") {
    shadowAt(px + 22, by, 26);
    [[0, 22, 20, "#d8232a", "#ffd25e"], [24, 18, 16, "#2a9a4a", "#ffffff"], [8, 14, 14, "#1e5aa8", "#ff9b45"]].forEach(([dx, w, h, c, rib], i) => {
      const yy = by - h - (i === 2 ? 20 : 0);
      g.fillStyle = c; g.fillRect(px + dx, yy, w, h); g.strokeRect(px + dx, yy, w, h);
      g.fillStyle = rib; g.fillRect(px + dx + w / 2 - 2, yy, 4, h); g.fillRect(px + dx, yy + h / 2 - 2, w, 4);
      g.beginPath(); g.ellipse(px + dx + w / 2 - 4, yy - 2, 4, 2.5, -.4, 0, 7); g.ellipse(px + dx + w / 2 + 4, yy - 2, 4, 2.5, .4, 0, 7); g.fill();
    });
  } else if (kind === "igloo") {
    shadowAt(px + 30, by, 40);
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.arc(px + 30, by, 38, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#b9cde6"; g.lineWidth = 1.5;
    for (let r = 1; r < 4; r++) { const yy = by - r * 10; const hw = Math.sqrt(38 * 38 - (r * 10) ** 2); g.beginPath(); g.moveTo(px + 30 - hw, yy); g.lineTo(px + 30 + hw, yy); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#24324a"; g.beginPath(); g.arc(px + 52, by, 12, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,210,120,.5)"; g.beginPath(); g.arc(px + 52, by, 8, Math.PI, 0); g.fill();
  } else if (kind === "sleigh") {
    shadowAt(px + 30, by, 40);
    g.strokeStyle = "#e8c45a"; g.lineWidth = 3; g.beginPath(); g.moveTo(px - 4, by - 3); g.lineTo(px + 58, by - 3); g.quadraticCurveTo(px + 70, by - 3, px + 66, by - 14); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#b8232a"; g.beginPath(); g.moveTo(px, by - 10); g.lineTo(px + 52, by - 10); g.quadraticCurveTo(px + 62, by - 22, px + 56, by - 38); g.lineTo(px + 44, by - 30); g.lineTo(px + 8, by - 30); g.quadraticCurveTo(px - 4, by - 40, px, by - 10); g.fill(); g.stroke();
    g.fillStyle = "#e8c45a"; g.fillRect(px + 6, by - 22, 42, 3);
    [["#2a9a4a", 10], ["#1e5aa8", 24], ["#ffd25e", 36]].forEach(([c, dx]) => { g.fillStyle = c; g.fillRect(px + dx, by - 42, 12, 12); g.strokeRect(px + dx, by - 42, 12, 12); });
  } else if (kind === "chalet") {
    // an Alpine chalet: wooden walls, a wide snowy roof and a balcony
    shadowAt(px + 50, by, 60);
    g.fillStyle = "#f1ece0"; g.fillRect(px, by - 44, 100, 44); g.strokeRect(px, by - 44, 100, 44);
    g.fillStyle = "#8a5a34"; g.fillRect(px, by - 96, 100, 52); g.strokeRect(px, by - 96, 100, 52);
    g.fillStyle = "#6e4426"; for (let yy = by - 90; yy < by - 44; yy += 8) g.fillRect(px, yy, 100, 1.5);
    g.fillStyle = "#4a2f22"; g.beginPath(); g.moveTo(px - 16, by - 92); g.lineTo(px + 50, by - 132); g.lineTo(px + 116, by - 92); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 16, by - 92); g.lineTo(px + 50, by - 132); g.lineTo(px + 116, by - 92); g.lineTo(px + 106, by - 96); g.lineTo(px + 50, by - 126); g.lineTo(px - 6, by - 96); g.closePath(); g.fill();
    g.fillStyle = "#5a3a22"; g.fillRect(px - 4, by - 58, 108, 5); for (let xx = px; xx < px + 100; xx += 8) g.fillRect(xx, by - 70, 3, 12); g.fillRect(px - 4, by - 72, 108, 3);
    g.fillStyle = "#d8423a"; for (let xx = px + 6; xx < px + 96; xx += 14) { g.beginPath(); g.arc(xx, by - 74, 3, 0, 7); g.fill(); }
    [[px + 12, by - 36], [px + 70, by - 36], [px + 20, by - 88], [px + 62, by - 88]].forEach(([wx, wy]) => { g.fillStyle = "#ffd88a"; g.fillRect(wx, wy, 18, 14); g.strokeRect(wx, wy, 18, 14); g.fillStyle = "#3a5a2a"; g.fillRect(wx - 5, wy, 4, 14); g.fillRect(wx + 19, wy, 4, 14); });
    g.fillStyle = "#6e4426"; g.fillRect(px + 40, by - 30, 18, 30); g.strokeRect(px + 40, by - 30, 18, 30);
  } else if (kind === "skis") {
    // skis and poles stuck in the snow
    [[0, "#d8423a"], [9, "#1e5aa8"]].forEach(([dx, c]) => { g.fillStyle = c; g.save(); g.translate(px + 12 + dx, by); g.rotate(-.08 + dx * .012); g.beginPath(); rp(-3, -62, 6, 62, 3); g.fill(); g.stroke(); g.restore(); });
    g.strokeStyle = "#3a3f4b"; g.lineWidth = 2; [[30, .12], [36, .2]].forEach(([dx, a]) => { g.beginPath(); g.moveTo(px + dx, by); g.lineTo(px + dx + Math.sin(a) * 56, by - 56); g.stroke(); });
    g.strokeStyle = OUT; g.fillStyle = "#f4f8ff"; g.beginPath(); g.ellipse(px + 22, by - 2, 22, 4, 0, 0, 7); g.fill();
  } else if (kind === "rorbu") {
    // a red Norwegian cabin with a turf roof under the snow
    shadowAt(px + 44, by, 52);
    g.fillStyle = "#b2322a"; g.fillRect(px, by - 54, 88, 54); g.strokeRect(px, by - 54, 88, 54);
    g.fillStyle = "#952820"; for (let xx = px + 6; xx < px + 88; xx += 8) g.fillRect(xx, by - 54, 1.5, 54);
    g.fillStyle = "#4a3a2a"; g.beginPath(); g.moveTo(px - 10, by - 50); g.lineTo(px + 44, by - 82); g.lineTo(px + 98, by - 50); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 10, by - 50); g.lineTo(px + 44, by - 82); g.lineTo(px + 98, by - 50); g.lineTo(px + 90, by - 54); g.lineTo(px + 44, by - 76); g.lineTo(px - 2, by - 54); g.closePath(); g.fill();
    [[px + 10, by - 40], [px + 62, by - 40]].forEach(([wx, wy]) => { g.fillStyle = "#f8f4ec"; g.fillRect(wx - 2, wy - 2, 20, 18); g.fillStyle = "#ffd27a"; g.fillRect(wx, wy, 16, 14); g.strokeRect(wx, wy, 16, 14); g.fillStyle = "#f8f4ec"; g.fillRect(wx + 7, wy, 2, 14); g.fillRect(wx, wy + 6, 16, 2); });
    g.fillStyle = "#f8f4ec"; g.fillRect(px + 34, by - 32, 20, 32); g.fillStyle = "#3a5a7a"; g.fillRect(px + 36, by - 30, 16, 30); g.strokeRect(px + 34, by - 32, 20, 32);
    g.fillStyle = "#ffe08a"; star(px + 44, by - 62, 6);
  } else if (kind === "kicksled") {
    // a Norwegian kicksled: a little chair on long runners
    g.strokeStyle = "#3a3f4b"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px - 6, by - 2); g.lineTo(px + 52, by - 2); g.quadraticCurveTo(px + 60, by - 2, px + 58, by - 8); g.stroke();
    g.beginPath(); g.moveTo(px + 6, by - 2); g.lineTo(px + 6, by - 46); g.lineTo(px + 14, by - 52); g.moveTo(px + 30, by - 2); g.lineTo(px + 30, by - 20); g.stroke();
    g.strokeStyle = OUT; g.lineWidth = 2; g.fillStyle = "#b2322a"; g.fillRect(px + 6, by - 24, 26, 5); g.strokeRect(px + 6, by - 24, 26, 5); g.fillRect(px + 6, by - 40, 5, 18); g.strokeRect(px + 6, by - 40, 5, 18);
  } else if (kind === "stave") {
    // a stave church: dark wood, stacked roofs and dragon heads
    const w = 120, top = by - 120;
    shadowAt(px + w / 2, by, 70);
    g.fillStyle = "#4a3020"; g.fillRect(px, top + 40, w, 80); g.strokeRect(px, top + 40, w, 80);
    g.fillStyle = "#3a2418"; for (let xx = px + 6; xx < px + w; xx += 9) g.fillRect(xx, top + 40, 2, 80);
    [[0, 40, 1], [16, 10, .75], [34, -18, .45]].forEach(([inset, y, s]) => {
      g.fillStyle = "#2e1e14"; g.beginPath(); g.moveTo(px + inset - 10, top + y + 6); g.lineTo(px + w / 2, top + y - 34 * s); g.lineTo(px + w - inset + 10, top + y + 6); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px + inset - 10, top + y + 6); g.lineTo(px + w / 2, top + y - 34 * s); g.lineTo(px + w - inset + 10, top + y + 6); g.lineTo(px + w / 2, top + y - 26 * s); g.closePath(); g.fill();
    });
    g.strokeStyle = "#2e1e14"; g.lineWidth = 3; [[px + 24, top + 2, -1], [px + w - 24, top + 2, 1]].forEach(([dx, dy, d]) => { g.beginPath(); g.moveTo(dx, dy + 10); g.quadraticCurveTo(dx + d * 6, dy - 4, dx + d * 14, dy - 2); g.stroke(); });
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#ffd88a"; g.beginPath(); rp(px + w / 2 - 12, by - 40, 24, 40, 10); g.fill(); g.stroke();
  } else if (kind === "tree") {
    shadowAt(px + 16, by, 26);
    g.fillStyle = "#4a2e18"; g.beginPath(); g.moveTo(px + 9, by); g.lineTo(px + 13, by - 70); g.lineTo(px + 20, by - 70); g.lineTo(px + 24, by); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#6b4426"; g.fillRect(px + 15, by - 60, 3, 56);
    g.strokeStyle = "#4a2e18"; g.lineWidth = 4; g.beginPath(); g.moveTo(px + 16, by - 55); g.lineTo(px - 4, by - 80); g.moveTo(px + 17, by - 60); g.lineTo(px + 38, by - 86); g.stroke();
    const cols = H < .5 ? ["#e0862e", "#f2b53c", "#c9562b"] : ["#d24a2a", "#e98a2e", "#f4c44a"];
    const bl = [[16, -100, 30], [-6, -84, 22], [38, -88, 22], [2, -118, 22], [30, -116, 22], [16, -76, 20]];
    g.fillStyle = OUT; bl.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(px + dx, by + dy, r + 2.5, 0, 7); g.fill(); });
    bl.forEach(([dx, dy, r], i) => { g.fillStyle = cols[i % 3]; g.beginPath(); g.arc(px + dx, by + dy, r, 0, 7); g.fill(); });
    g.fillStyle = "rgba(255,255,255,.22)"; bl.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(px + dx - r * .3, by + dy - r * .35, r * .35, 0, 7); g.fill(); });
    g.fillStyle = "rgba(90,30,10,.25)"; bl.forEach(([dx, dy, r]) => { g.beginPath(); g.arc(px + dx + r * .3, by + dy + r * .4, r * .4, 0, 7); g.fill(); });
  } else if (kind === "pine") {
    shadowAt(px + 16, by, 22);
    pineShape(px + 16, by, 110 + H * 30, "#24543f", "#1b4332", theme === "sneeuw" ? "#f4f8ff" : null, OUT);
  } else if (kind === "redhouse") {
    // a Falu-red cottage with white corners, white windows and a small Swedish flag
    shadowAt(px + 40, by, 46);
    g.fillStyle = "#a8322a"; g.fillRect(px, by - 54, 80, 54); g.strokeRect(px, by - 54, 80, 54);
    g.fillStyle = "#93291f"; for (let i = 1; i < 8; i++) g.fillRect(px + i * 10, by - 54, 1.5, 54);
    g.fillStyle = "#f4f1ea"; g.fillRect(px, by - 54, 5, 54); g.fillRect(px + 75, by - 54, 5, 54);
    g.fillStyle = "#3a3a40"; g.beginPath(); g.moveTo(px - 8, by - 54); g.lineTo(px + 40, by - 82); g.lineTo(px + 88, by - 54); g.closePath(); g.fill(); g.stroke();
    [[12], [56]].forEach(([dx]) => { g.fillStyle = "#f4f1ea"; g.fillRect(px + dx - 2, by - 44, 16, 18); g.fillStyle = "#9ad0f0"; g.fillRect(px + dx, by - 42, 5, 6); g.fillRect(px + dx + 7, by - 42, 5, 6); g.fillRect(px + dx, by - 34, 5, 6); g.fillRect(px + dx + 7, by - 34, 5, 6); });
    g.fillStyle = "#f4f1ea"; g.fillRect(px + 33, by - 28, 14, 28); g.strokeRect(px + 33, by - 28, 14, 28);
    g.fillStyle = "#e8e4dc"; g.fillRect(px + 92, by - 76, 2.5, 76);
    const w = Math.sin(frame / 10) * 1.5; g.fillStyle = "#006aa7"; g.fillRect(px + 94, by - 76 + w, 16, 10); g.fillStyle = "#fecc02"; g.fillRect(px + 99, by - 76 + w, 3, 10); g.fillRect(px + 94, by - 72.5 + w, 16, 3);
  } else if (kind === "birch") {
    // a birch: white trunk with black marks, bright green leaves
    g.fillStyle = "#f4f1ea"; g.fillRect(px + 14, by - 96, 7, 96); g.strokeRect(px + 14, by - 96, 7, 96);
    g.fillStyle = "#2a2a2a"; for (let i = 0; i < 9; i++) g.fillRect(px + 14 + (i % 2) * 2, by - 88 + i * 10, 3 + (i % 3), 2);
    [[17, -112, 22, 26, "#5a9a3a"], [6, -100, 14, 16, "#6aa84a"], [30, -98, 14, 16, "#6aa84a"], [17, -122, 14, 14, "#8ac85a"]].forEach(([dx, dy, rx, ry, c]) => { g.fillStyle = c; g.beginPath(); g.ellipse(px + dx, by + dy, rx, ry, 0, 0, 7); g.fill(); });
  } else if (kind === "dalahorse") {
    // a big red Dala horse with its painted harness
    shadowAt(px + 20, by, 22);
    g.fillStyle = "#6b4528"; g.fillRect(px + 2, by - 6, 38, 6); g.strokeRect(px + 2, by - 6, 38, 6);
    g.fillStyle = "#c8232a"; g.beginPath(); g.moveTo(px + 6, by - 6); g.lineTo(px + 8, by - 26); g.lineTo(px + 28, by - 26); g.lineTo(px + 32, by - 40); g.lineTo(px + 38, by - 44); g.lineTo(px + 42, by - 36); g.lineTo(px + 36, by - 30); g.lineTo(px + 34, by - 6); g.lineTo(px + 28, by - 6); g.lineTo(px + 27, by - 16); g.lineTo(px + 14, by - 16); g.lineTo(px + 13, by - 6); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "#2a5ab0"; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 9, by - 20); g.quadraticCurveTo(px + 18, by - 14, px + 27, by - 20); g.stroke();
    g.strokeStyle = "#f5d23a"; g.beginPath(); g.moveTo(px + 30, by - 30); g.lineTo(px + 36, by - 38); g.stroke();
    g.fillStyle = "#f4f4f0"; [[12, -22], [18, -20], [24, -22]].forEach(([dx, dy]) => { g.beginPath(); g.arc(px + dx, by + dy, 1.6, 0, 7); g.fill(); });
    g.fillStyle = "#1d1d26"; g.beginPath(); g.arc(px + 37, by - 39, 1.3, 0, 7); g.fill();
    g.strokeStyle = OUT;
  } else if (kind === "moosedeco") {
    // a moose standing in the trees (scenery)
    shadowAt(px + 34, by, 36);
    g.fillStyle = "#3a2a1e"; [[12], [20], [44], [52]].forEach(([dx]) => { g.fillRect(px + dx, by - 34, 5, 34); });
    g.fillStyle = "#5a4030"; g.beginPath(); rp(px + 6, by - 62, 54, 30, 12); g.fill(); g.stroke();
    g.fillStyle = "#4a3426"; g.beginPath(); g.moveTo(px + 52, by - 58); g.lineTo(px + 66, by - 66); g.lineTo(px + 82, by - 54); g.lineTo(px + 80, by - 46); g.lineTo(px + 64, by - 48); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c8a878"; g.beginPath(); g.moveTo(px + 60, by - 66); g.lineTo(px + 52, by - 82); g.lineTo(px + 58, by - 76); g.lineTo(px + 60, by - 86); g.lineTo(px + 64, by - 76); g.lineTo(px + 70, by - 84); g.lineTo(px + 68, by - 68); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#1d1d26"; g.fillRect(px + 70, by - 58, 2.5, 2.5);
  } else if (kind === "volvo") {
    // a classic boxy Volvo estate in dark blue
    shadowAt(px + 70, by, 70);
    g.fillStyle = "#24477a"; g.beginPath(); g.moveTo(px + 2, by - 12); g.lineTo(px + 2, by - 58); g.lineTo(px + 96, by - 58); g.lineTo(px + 112, by - 38); g.lineTo(px + 140, by - 36); g.lineTo(px + 142, by - 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2a3542"; g.fillRect(px + 8, by - 53, 26, 14); g.fillRect(px + 38, by - 53, 26, 14); g.fillRect(px + 68, by - 53, 26, 14);
    g.fillStyle = "#c9ced6"; g.fillRect(px + 2, by - 22, 140, 4); g.fillRect(px + 128, by - 32, 14, 6);
    g.fillStyle = "#fff6d8"; g.fillRect(px + 134, by - 31, 7, 4); g.fillStyle = "#c4202a"; g.fillRect(px + 2, by - 40, 4, 12);
    [[30], [118]].forEach(([dx]) => { g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(px + dx, by - 12, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(px + dx, by - 12, 6, 0, 7); g.fill(); });
  } else if (kind === "scania") {
    // a Scania timber truck: a red cab and a load of logs from the forest
    shadowAt(px + 100, by, 100);
    g.fillStyle = "#3a3a40"; g.fillRect(px, by - 26, 196, 10);
    g.fillStyle = "#c4202a"; g.beginPath(); rp(px + 150, by - 76, 48, 56, 5); g.fill(); g.stroke();
    g.fillStyle = "#2a3542"; g.fillRect(px + 158, by - 70, 34, 18); g.fillStyle = "#e8e4dc"; g.fillRect(px + 186, by - 38, 12, 14);
    g.fillStyle = "#c9ced6"; g.fillRect(px + 196, by - 44, 3, 20);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 4 - row; i++) { const cx = px + 30 + i * 30 + row * 15, cy = by - 38 - row * 22; g.fillStyle = "#8a5a32"; g.fillRect(cx - 28, cy - 11, 110 - i * 26 - row * 8, 22); g.fillStyle = "#d8b07a"; g.beginPath(); g.arc(cx - 28, cy, 11, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#a8743e"; g.beginPath(); g.arc(cx - 28, cy, 5, 0, 7); g.stroke(); g.strokeStyle = OUT; }
    g.fillStyle = "#3a3a40"; g.fillRect(px + 140, by - 96, 4, 76);
    [[30], [64], [170]].forEach(([dx]) => { g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(px + dx, by - 12, 12, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#8a9099"; g.beginPath(); g.arc(px + dx, by - 12, 5, 0, 7); g.fill(); });
  } else if (kind === "maypole") {
    // the midsummer pole with leaves, flowers and two rings
    g.fillStyle = "#6b4528"; g.fillRect(px + 30, by - 150, 6, 150); g.fillRect(px + 8, by - 140, 50, 5);
    g.strokeStyle = "#4a8a3a"; g.lineWidth = 5; g.beginPath(); g.moveTo(px + 33, by - 150); g.lineTo(px + 33, by); g.stroke();
    [[14, -118], [52, -118]].forEach(([dx, dy]) => { g.strokeStyle = "#4a8a3a"; g.lineWidth = 4; g.beginPath(); g.arc(px + dx, by + dy, 12, 0, 7); g.stroke(); });
    g.strokeStyle = OUT; g.lineWidth = 2;
    for (let i = 0; i < 18; i++) { g.fillStyle = ["#f5d23a", "#f4f4f0", "#9a5ad8", "#e8423a", "#2a6ad8"][i % 5]; g.beginPath(); g.arc(px + 33 + (i % 2 ? 3 : -3), by - 146 + i * 8, 2.5, 0, 7); g.fill(); }
    g.fillStyle = "#006aa7"; g.fillRect(px + 36, by - 160, 14, 9); g.fillStyle = "#fecc02"; g.fillRect(px + 40, by - 160, 3, 9); g.fillRect(px + 36, by - 157, 14, 3);
  } else if (kind === "fika") {
    // a fika table: a checked cloth, cinnamon buns, a cake and a teapot (Paul and Laura drink tea)
    g.fillStyle = "#6b4528"; g.fillRect(px + 4, by - 26, 4, 26); g.fillRect(px + 56, by - 26, 4, 26);
    g.fillStyle = "#f4f4f0"; g.fillRect(px - 2, by - 32, 68, 8); g.strokeRect(px - 2, by - 32, 68, 8);
    g.fillStyle = "#3a7ad8"; for (let i = 0; i < 9; i++) if (i % 2) g.fillRect(px - 2 + i * 7.5, by - 32, 7.5, 8);
    [[10], [22]].forEach(([dx]) => { g.fillStyle = "#c8894a"; g.beginPath(); g.arc(px + dx, by - 36, 5, 0, 7); g.fill(); g.stroke(); g.strokeStyle = "#8a5a2a"; g.beginPath(); g.arc(px + dx, by - 36, 2.5, 0, 5); g.stroke(); g.strokeStyle = OUT; });
    g.fillStyle = "#8ac85a"; g.beginPath(); rp(px + 32, by - 46, 14, 14, 3); g.fill(); g.stroke(); g.fillStyle = "#ff9ab8"; g.beginPath(); g.arc(px + 39, by - 47, 2.5, 0, 7); g.fill();
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(px + 56, by - 40, 7, 7, 0, 0, 7); g.fill(); g.stroke(); g.fillRect(px + 62, by - 42, 5, 2);
  } else if (kind === "saab93") { drawSaab("93", px, by);
  } else if (kind === "saab900") { drawSaab("900", px, by);
  } else if (kind === "saab96") { drawSaab("96", px, by);
  } else if (kind === "legoset") {
    // Lego for the birthday boy: a little tower, "40" in bricks (Paul turns 40) and a Saab made of Lego
    g.fillStyle = "#2a9a4a"; g.fillRect(px - 4, by - 6, 120, 6); g.strokeRect(px - 4, by - 6, 120, 6);
    for (let r = 0; r < 7; r++) drawLegoBrick(px + 10, by - 12 - r * 11, LEGO_COLS[r % LEGO_COLS.length]);
    const four = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4]];
    const zero = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2], [0, 3], [2, 3], [0, 4], [1, 4], [2, 4]];
    [[32, four], [62, zero]].forEach(([ox, digit]) => digit.forEach(([c, r]) => drawLegoBrick(px + ox + c * 9, by - 56 + r * 10, "#d8232a", 9)));
    g.save(); g.translate(px + 92, by - 6); g.scale(.22, .22); drawSaab("900", -72, 0, { tree: false, color: "#d8232a" }); g.restore();
  } else if (kind === "stall") {
    // kerstmarktkraam
    const names = L.d.stalls || T(["Mulled wine", "Waffles", "Chips", "Baubles", "Chocolate", "Pretzels"], ["Glühwein", "Wafels", "Frieten", "Kerstballen", "Chocolade", "Krakelingen"]), name = names[Math.floor(H * names.length)];
    shadowAt(px + 48, by, 50);
    g.fillStyle = "#7a4a26"; g.fillRect(px, by - 70, 96, 70); g.strokeRect(px, by - 70, 96, 70);
    g.fillStyle = "#6b3f20"; for (let x = px + 8; x < px + 96; x += 12) g.fillRect(x, by - 70, 2, 70);
    const warm = g.createLinearGradient(0, by - 56, 0, by - 26); warm.addColorStop(0, "#ffd88a"); warm.addColorStop(1, "#f0a050");
    g.fillStyle = warm; g.fillRect(px + 8, by - 56, 80, 28); g.strokeRect(px + 8, by - 56, 80, 28);
    g.fillStyle = "#5a3416"; g.fillRect(px + 4, by - 30, 88, 6); g.strokeRect(px + 4, by - 30, 88, 6);
    for (let i = 0; i < 5; i++) { g.fillStyle = ["#c43a3a", "#fff", "#e8b44a", "#59c28a", "#fff"][i]; g.beginPath(); g.arc(px + 18 + i * 15, by - 36, 4, 0, 7); g.fill(); }
    g.fillStyle = "#3a2010"; g.beginPath(); g.moveTo(px - 10, by - 68); g.lineTo(px + 48, by - 104); g.lineTo(px + 106, by - 68); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 10, by - 68); g.lineTo(px + 48, by - 104); g.lineTo(px + 106, by - 68); g.lineTo(px + 96, by - 72); g.lineTo(px + 48, by - 98); g.lineTo(px, by - 72); g.closePath(); g.fill();
    for (let i = 0; i < 9; i++) { const t = i / 8; g.fillStyle = (Math.floor(frame / 18) + i) % 2 ? "#ffe08a" : "#ff8a6a"; g.beginPath(); g.arc(px - 6 + t * 108, by - 66 - Math.sin(t * Math.PI) * 30, 2.4, 0, 7); g.fill(); }
    sign2(px + 10, by - 92, 76, 16, "#f4e2b8", name, "#4a2a10");
  } else if (kind === "xtree") {
    shadowAt(px + 16, by, 40);
    pineShape(px + 16, by, 170, "#1f5a3a", "#174a2f", "#f4f8ff", OUT);
    for (let i = 0; i < 22; i++) { g.fillStyle = (Math.floor(frame / 15) + i) % 3 ? "#ffd25e" : "#ff6b6b"; const t = hash(i * 9 + x); g.beginPath(); g.arc(px + 16 + (hash(i + x) - .5) * 70 * (1 - t), by - 26 - t * 120, 2.6, 0, 7); g.fill(); }
    g.fillStyle = "#ffe066"; star(px + 16, by - 168, 11);
  } else if (kind === "streetlamp") {
    const lg = g.createRadialGradient(px + 16, by - 96, 2, px + 16, by - 96, 60); lg.addColorStop(0, "rgba(255,226,150,.55)"); lg.addColorStop(1, "rgba(255,226,150,0)");
    g.fillStyle = lg; g.fillRect(px - 44, by - 156, 120, 120);
    g.fillStyle = "#1e1e24"; g.fillRect(px + 13, by - 90, 6, 90); g.fillRect(px + 8, by - 6, 16, 6);
    g.beginPath(); g.moveTo(px + 6, by - 90); g.lineTo(px + 26, by - 90); g.lineTo(px + 22, by - 108); g.lineTo(px + 10, by - 108); g.closePath(); g.fill();
    g.fillStyle = "#ffe8a8"; g.fillRect(px + 11, by - 104, 10, 12);
    g.fillStyle = "#1e1e24"; g.beginPath(); g.moveTo(px + 8, by - 108); g.lineTo(px + 16, by - 116); g.lineTo(px + 24, by - 108); g.fill();
    g.fillStyle = "#f4f8ff"; g.fillRect(px + 9, by - 112, 14, 3);
  } else if (kind === "church") {
    // een stenen kerk; de deur staat open en binnen is het warm
    const w = 176, top = by - 196;
    g.fillStyle = "#b9ae9a"; g.fillRect(px, top, w, 196); g.strokeRect(px, top, w, 196);
    g.fillStyle = "#a89d88"; for (let y = top + 12; y < by; y += 16) for (let xx = px + ((y / 16) % 2) * 12; xx < px + w; xx += 24) g.fillRect(xx, y, 22, 1.5);
    g.fillStyle = "#b9ae9a"; g.beginPath(); g.moveTo(px - 8, top); g.lineTo(px + w / 2, top - 50); g.lineTo(px + w + 8, top); g.closePath(); g.fill(); g.stroke();
    g.fillRect(px + w / 2 - 16, top - 96, 32, 56); g.strokeRect(px + w / 2 - 16, top - 96, 32, 56);
    g.fillStyle = "#4f5f5a"; g.beginPath(); g.moveTo(px + w / 2 - 20, top - 96); g.lineTo(px + w / 2, top - 150); g.lineTo(px + w / 2 + 20, top - 96); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#e8c45a"; g.fillRect(px + w / 2 - 1, top - 164, 2, 14); g.fillRect(px + w / 2 - 5, top - 160, 10, 2);
    g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(px - 8, top); g.lineTo(px + w / 2, top - 50); g.lineTo(px + w / 2, top - 43); g.lineTo(px, top + 2); g.closePath(); g.fill();
    // roosvenster en ramen met warm licht
    const glow = (x, y, ww, hh) => { g.fillStyle = "#5a3a2a"; g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x, y + ww / 2); g.arc(x + ww / 2, y + ww / 2, ww / 2, Math.PI, 0); g.lineTo(x + ww, y + hh); g.closePath(); g.fill(); g.stroke(); const gg = g.createLinearGradient(0, y, 0, y + hh); gg.addColorStop(0, "#ffd88a"); gg.addColorStop(1, "#e88a4a"); g.fillStyle = gg; g.beginPath(); g.moveTo(x + 3, y + hh - 3); g.lineTo(x + 3, y + ww / 2); g.arc(x + ww / 2, y + ww / 2, ww / 2 - 3, Math.PI, 0); g.lineTo(x + ww - 3, y + hh - 3); g.closePath(); g.fill(); };
    glow(px + 20, top + 40, 30, 60); glow(px + w - 50, top + 40, 30, 60);
    g.fillStyle = "#5a3a2a"; g.beginPath(); g.arc(px + w / 2, top + 40, 22, 0, 7); g.fill(); g.stroke();
    for (let i = 0; i < 8; i++) { g.fillStyle = ["#e85a5a", "#5aa8ff", "#ffd25e", "#59c28a"][i % 4]; g.beginPath(); g.moveTo(px + w / 2, top + 40); g.arc(px + w / 2, top + 40, 18, i * Math.PI / 4, (i + 1) * Math.PI / 4); g.closePath(); g.fill(); }
    g.fillStyle = "#ffe8a8"; g.beginPath(); g.arc(px + w / 2, top + 40, 5, 0, 7); g.fill();
    glow(px + w / 2 - 30, by - 96, 60, 96);
  } else if (kind === "deer") {
    shadowAt(px + 16, by, 16);
    g.fillStyle = "#9a6a3e"; [[4, 0], [8, 1], [22, 0], [26, 1]].forEach(([dx]) => { g.fillRect(px + dx, by - 16, 3, 16); });
    g.beginPath(); g.ellipse(px + 16, by - 20, 15, 8, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#f4e6d0"; g.beginPath(); g.ellipse(px + 3, by - 20, 3, 4, 0, 0, 7); g.fill();
    g.fillStyle = "#9a6a3e"; g.beginPath(); g.moveTo(px + 24, by - 24); g.lineTo(px + 30, by - 38); g.lineTo(px + 34, by - 36); g.lineTo(px + 30, by - 22); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(px + 34, by - 38, 6, 4.5, .3, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#1e1622"; g.fillRect(px + 35, by - 40, 2, 2); g.fillRect(px + 39, by - 37, 2, 2);
    g.strokeStyle = "#e9d7b4"; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 32, by - 42); g.lineTo(px + 28, by - 54); g.lineTo(px + 24, by - 58); g.moveTo(px + 29, by - 50); g.lineTo(px + 34, by - 56); g.moveTo(px + 35, by - 42); g.lineTo(px + 38, by - 54); g.lineTo(px + 42, by - 58); g.stroke();
    if (theme === "sneeuw") { g.fillStyle = "#f4f8ff"; g.beginPath(); g.ellipse(px + 16, by - 27, 10, 2.5, 0, 0, 7); g.fill(); }
  } else if (kind === "bench") {
    g.fillStyle = "#6b4528"; [[px, by - 20, 46, 6], [px + 2, by - 14, 5, 14], [px + 39, by - 14, 5, 14], [px, by - 34, 46, 6], [px + 4, by - 30, 4, 10], [px + 38, by - 30, 4, 10]].forEach(r => { g.fillRect(...r); g.strokeRect(...r); });
    g.fillStyle = "#fff"; g.fillRect(px, by - 24, 46, 4); g.fillRect(px, by - 38, 46, 4);
  } else if (kind === "sofa") {
    shadowAt(px + 40, by, 42);
    g.fillStyle = "#4f6280"; g.beginPath(); rp(px, by - 40, 84, 28, 8); g.fill(); g.stroke();
    g.fillStyle = "#5f7496"; g.beginPath(); rp(px - 4, by - 26, 92, 22, 6); g.fill(); g.stroke();
    g.fillStyle = "#71879f"; [[px + 6, by - 36], [px + 44, by - 36]].forEach(([x, y]) => { g.beginPath(); rp(x, y, 34, 14, 5); g.fill(); g.stroke(); });
    g.fillStyle = "#f2a93b"; g.beginPath(); rp(px + 2, by - 44, 16, 16, 4); g.fill(); g.stroke();
    g.fillStyle = "#4a3020"; g.fillRect(px + 2, by - 4, 5, 4); g.fillRect(px + 77, by - 4, 5, 4);
  } else if (kind === "lamp") {
    g.fillStyle = "#333"; g.fillRect(px + 15, by - 86, 3, 82); g.fillRect(px + 6, by - 4, 21, 4);
    const lg = g.createRadialGradient(px + 16, by - 88, 2, px + 16, by - 88, 50); lg.addColorStop(0, "rgba(255,230,160,.6)"); lg.addColorStop(1, "rgba(255,230,160,0)");
    g.fillStyle = lg; g.fillRect(px - 34, by - 138, 100, 100);
    g.fillStyle = "#ffe7a8"; g.beginPath(); g.moveTo(px + 2, by - 84); g.lineTo(px + 30, by - 84); g.lineTo(px + 23, by - 104); g.lineTo(px + 9, by - 104); g.closePath(); g.fill(); g.stroke();
  } else if (kind === "table") {
    shadowAt(px + 56, by, 60);
    g.fillStyle = "#5a3e28"; g.fillRect(px, by - 36, 112, 8); g.strokeRect(px, by - 36, 112, 8); g.fillRect(px + 8, by - 28, 6, 28); g.fillRect(px + 98, by - 28, 6, 28);
    [px - 14, px + 120].forEach(cx => { g.fillStyle = "#3a3a3a"; g.fillRect(cx, by - 46, 4, 46); g.fillRect(cx, by - 22, 14, 4); g.fillRect(cx + 10, by - 22, 4, 22); });
    g.fillStyle = "#fff"; g.beginPath(); g.ellipse(px + 30, by - 38, 10, 3, 0, 0, 7); g.ellipse(px + 80, by - 38, 10, 3, 0, 0, 7); g.fill();
    g.fillStyle = "#e9e3d6"; g.fillRect(px + 52, by - 52, 8, 14); g.fillStyle = "#ffd25e"; g.beginPath(); g.ellipse(px + 56, by - 56 + Math.sin(frame / 8), 2, 4, 0, 0, 7); g.fill();
  } else if (kind === "stove") {
    g.fillStyle = "#1e1e22"; g.beginPath(); rp(px, by - 62, 54, 62, 4); g.fill(); g.stroke();
    g.fillStyle = "#3a3a40"; g.fillRect(px + 4, by - 58, 46, 6); g.fillRect(px + 22, by - 110, 10, 48);
    const fg2 = g.createLinearGradient(0, by - 44, 0, by - 12); fg2.addColorStop(0, "#ffd25e"); fg2.addColorStop(1, "#ff5a2a");
    g.fillStyle = "#120a08"; g.fillRect(px + 8, by - 46, 38, 34);
    for (let i = 0; i < 5; i++) { g.fillStyle = fg2; const h = 14 + Math.abs(Math.sin(frame / 7 + i * 1.3)) * 12; g.beginPath(); g.moveTo(px + 10 + i * 7, by - 13); g.quadraticCurveTo(px + 13 + i * 7, by - 13 - h, px + 16 + i * 7, by - 13); g.fill(); }
    const glow = g.createRadialGradient(px + 27, by - 28, 4, px + 27, by - 28, 70); glow.addColorStop(0, "rgba(255,160,80,.3)"); glow.addColorStop(1, "rgba(255,160,80,0)");
    g.fillStyle = glow; g.fillRect(px - 44, by - 98, 140, 100);
  } else if (kind === "kitchen") {
    g.fillStyle = "#f2f0ea"; g.fillRect(px, by - 42, 128, 42); g.strokeRect(px, by - 42, 128, 42);
    for (let i = 0; i < 4; i++) { g.strokeStyle = "#c9c5bb"; g.strokeRect(px + i * 32 + 3, by - 36, 26, 32); g.fillStyle = "#8f8b82"; g.fillRect(px + i * 32 + 12, by - 32, 8, 2); }
    g.strokeStyle = OUT; g.fillStyle = "#2f2f33"; g.fillRect(px - 3, by - 47, 134, 6); g.strokeRect(px - 3, by - 47, 134, 6);
    g.fillStyle = "#f2f0ea"; g.fillRect(px + 4, by - 150, 120, 46); g.strokeRect(px + 4, by - 150, 120, 46); g.fillStyle = "#c9c5bb"; g.fillRect(px + 64, by - 146, 2, 38);
    g.fillStyle = "#1e1e22"; g.fillRect(px + 10, by - 68, 20, 21); g.fillStyle = "#c0392b"; g.fillRect(px + 13, by - 64, 14, 4);
    g.fillStyle = "#d9d9d9"; g.beginPath(); g.ellipse(px + 50, by - 55, 9, 8, 0, 0, 7); g.fill(); g.stroke(); g.fillRect(px + 47, by - 66, 6, 4);
    emoji("🧀", px + 82, by - 58, 18); emoji("🍞", px + 108, by - 58, 18);
  } else if (kind === "bed") {
    shadowAt(px + 32, by, 34);
    g.fillStyle = "#6b4a33"; g.fillRect(px, by - 24, 66, 20); g.strokeRect(px, by - 24, 66, 20); g.fillRect(px - 2, by - 48, 8, 48); g.strokeRect(px - 2, by - 48, 8, 48);
    g.fillStyle = "#fff"; g.beginPath(); rp(px + 6, by - 32, 22, 10, 4); g.fill(); g.stroke();
    const qc = ["#9db7d6", "#e8a1a1", "#a6d4a0"][fl(H * 3)];
    g.fillStyle = qc; g.beginPath(); rp(px + 22, by - 32, 44, 14, 4); g.fill(); g.stroke();
    g.fillStyle = shade(qc.length === 7 ? qc : "#9db7d6", -.15); for (let i = 0; i < 3; i++) g.fillRect(px + 28 + i * 13, by - 30, 6, 10);
    g.fillStyle = "#4a3020"; g.fillRect(px + 2, by - 4, 5, 4); g.fillRect(px + 60, by - 4, 5, 4);
  } else if (kind === "sauna") {
    g.fillStyle = "#c48a52"; g.fillRect(px, by - 100, 96, 100); g.strokeRect(px, by - 100, 96, 100);
    g.fillStyle = "#a8703c"; for (let i = 0; i < 10; i++) g.fillRect(px, by - 100 + i * 10, 96, 2);
    g.fillStyle = "rgba(210,236,255,.75)"; g.fillRect(px + 32, by - 80, 32, 80); g.strokeRect(px + 32, by - 80, 32, 80);
    g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(px + 36, by - 76, 4, 60);
    for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(255,255,255,${.25 + .15 * Math.sin(frame / 20 + i)})`; g.beginPath(); g.arc(px + 40 + i * 8, by - 90 - ((frame / 2 + i * 15) % 30), 6, 0, 7); g.fill(); }
    sign2(px + 18, by - 120, 60, 18, "#5a3416", "SAUNA", "#ffe0b0");
  } else if (kind === "bath") {
    g.fillStyle = "#fff"; g.beginPath(); rp(px, by - 34, 86, 34, 12); g.fill(); g.stroke();
    g.fillStyle = "#9bd3f2"; g.fillRect(px + 6, by - 30, 74, 6);
    g.fillStyle = "#fff"; [[18, -36], [30, -40], [46, -37], [60, -41]].forEach(([dx, dy]) => { g.beginPath(); g.arc(px + dx, by + dy, 6, 0, 7); g.fill(); });
    g.fillStyle = "#ffd25e"; g.beginPath(); g.ellipse(px + 66, by - 40, 6, 5, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#ff8a2a"; g.fillRect(px + 71, by - 41, 4, 2);
    g.fillStyle = "#bbb"; g.fillRect(px + 78, by - 54, 4, 20);
  } else if (kind === "garland") {
    const cols = ["#ff5a7a", "#ffd25e", "#59c28a", "#5aa8ff"];
    g.strokeStyle = "#7a5a3a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(px - 70, 52); g.quadraticCurveTo(px + 30, 78, px + 130, 52); g.stroke();
    for (let i = 0; i < 11; i++) { const t = i / 10, xx = px - 70 + t * 200, yy = 52 + Math.sin(t * Math.PI) * 13; g.fillStyle = cols[i % 4]; g.beginPath(); g.moveTo(xx - 7, yy); g.lineTo(xx + 7, yy); g.lineTo(xx, yy + 16); g.closePath(); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1; g.stroke(); }
    // Only on Paul's birthday does the garland say his age; elsewhere it's just a Christmas garland.
    sign2(px - 10, 92, 90, 24, "#fff4e6", L.d.birthday ? "PAUL 40" : "HO HO HO", "#c43a3a");
    [[-40, 130, "#ff5a7a"], [100, 124, "#5aa8ff"]].forEach(([dx, y, c2]) => { g.strokeStyle = "#888"; g.lineWidth = 1; g.beginPath(); g.moveTo(px + dx, y + 14); g.lineTo(px + dx + 2, y + 50); g.stroke(); g.fillStyle = c2; g.beginPath(); g.ellipse(px + dx, y + Math.sin(frame / 30 + dx) * 3, 10, 13, 0, 0, 7); g.fill(); g.strokeStyle = OUT; g.stroke(); g.fillStyle = "rgba(255,255,255,.5)"; g.beginPath(); g.ellipse(px + dx - 3, y - 4, 2.5, 4, -.4, 0, 7); g.fill(); });
  } else if (kind === "fire") {
    [[0, 0], [10, 2], [22, 0], [32, 1]].forEach(([dx, dy]) => { g.fillStyle = "#7a7a72"; g.beginPath(); g.ellipse(px - 2 + dx, by - 3 + dy, 6, 4, 0, 0, 7); g.fill(); g.stroke(); });
    g.fillStyle = "#5a3a20"; g.fillRect(px + 2, by - 10, 28, 5); g.strokeRect(px + 2, by - 10, 28, 5);
    if (L.questDone) {
      const glow = g.createRadialGradient(px + 16, by - 20, 4, px + 16, by - 20, 80); glow.addColorStop(0, "rgba(255,170,80,.45)"); glow.addColorStop(1, "rgba(255,170,80,0)");
      g.fillStyle = glow; g.fillRect(px - 64, by - 100, 160, 110);
      [["#ff5a2a", 30], ["#ff9b45", 22], ["#ffd25e", 13]].forEach(([c2, h0], i) => { g.fillStyle = c2; for (let k = 0; k < 3; k++) { const h = h0 + Math.sin(frame / 5 + k + i) * 5; g.beginPath(); g.moveTo(px + 6 + k * 8, by - 9); g.quadraticCurveTo(px + 10 + k * 8, by - 9 - h, px + 14 + k * 8, by - 9); g.fill(); } });
      g.fillStyle = "#ffd25e"; for (let k = 0; k < 4; k++) { const t = (frame * 1.5 + k * 25) % 60; g.fillRect(px + 14 + Math.sin(k * 3 + t / 8) * 8, by - 30 - t, 2, 2); }
    }
  } else if (kind === "cake") {
    g.fillStyle = "#6b4528"; g.fillRect(px - 8, by - 28, 48, 5); g.strokeRect(px - 8, by - 28, 48, 5); g.fillRect(px - 4, by - 23, 4, 23); g.fillRect(px + 32, by - 23, 4, 23);
    g.fillStyle = "#fff4e6"; g.beginPath(); rp(px, by - 50, 32, 22, 3); g.fill(); g.stroke();
    g.fillStyle = "#ff7aa8"; g.fillRect(px, by - 50, 32, 6); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(px + 4 + i * 8, by - 44, 3, 0, Math.PI); g.fill(); }
    g.fillStyle = "#c43a3a"; g.font = "700 11px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("40", px + 16, by - 35);
    for (let i = 0; i < 4; i++) { g.fillStyle = ["#5aa8ff", "#ffd25e", "#59c28a", "#ff7aa8"][i]; g.fillRect(px + 5 + i * 7, by - 58, 2.5, 8); g.fillStyle = "#ffd25e"; g.beginPath(); g.ellipse(px + 6 + i * 7, by - 61 + Math.sin(frame / 5 + i) * .8, 1.6, 3, 0, 0, 7); g.fill(); }
    [[-30, "#d33a3a", "#ffd25e"], [44, "#3d7fd9", "#fff"]].forEach(([dx, c1, c2]) => { g.fillStyle = c1; g.fillRect(px + dx, by - 18, 20, 18); g.strokeRect(px + dx, by - 18, 20, 18); g.fillStyle = c2; g.fillRect(px + dx + 8, by - 18, 4, 18); g.fillRect(px + dx, by - 11, 20, 4); });
  }
}
function groundTop(x) { for (let y = 0; y < ROWS; y++) if (L.grid[y][x] === "#") return y; return ROWS; }

/* ---------- Saabs ---------- */
/** Een Saab van opzij, met de neus naar rechts. x = links, by = de grond. */
function drawSaab(model, x, by, opts = {}) {
  g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = OUT; g.lineWidth = 2;
  const wheel = (cx, r) => {
    g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(cx, by - r, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c9ced6"; g.beginPath(); g.arc(cx, by - r, r * .58, 0, 7); g.fill();
    g.strokeStyle = "#8a9099"; g.lineWidth = 1.4; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + .3; g.beginPath(); g.moveTo(cx, by - r); g.lineTo(cx + Math.cos(a) * r * .55, by - r + Math.sin(a) * r * .55); g.stroke(); }
    g.strokeStyle = OUT; g.lineWidth = 2;
  };
  // witte aero-velg van de Saab 900, met drie gebogen sleuven
  const aero = (cx, r) => {
    g.fillStyle = "#1c1c20"; g.beginPath(); g.arc(cx, by - r, r, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#f2f2ee"; g.beginPath(); g.arc(cx, by - r, r * .66, 0, 7); g.fill();
    g.strokeStyle = "#9a9ca4"; g.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + frame * 0; g.beginPath(); g.arc(cx, by - r, r * .42, a, a + .9); g.stroke(); }
    g.fillStyle = "#9a9ca4"; g.beginPath(); g.arc(cx, by - r, 1.6, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 2;
  };
  if (model === "93") {
    // Saab 9-3 SportCombi in Snow Silver metallic, met een dakkoffer
    const body = opts.color || "#bfc4cb", dark = shade(body, -.2);
    shadowAt(x + 75, by, 74);
    g.fillStyle = "#3a3f48"; g.fillRect(x + 22, by - 64, 4, 6); g.fillRect(x + 80, by - 64, 4, 6);
    if (opts.roofbox !== false) { g.fillStyle = "#dfe3e8"; g.beginPath(); rp(x + 16, by - 80, 74, 16, 8); g.fill(); g.stroke(); g.fillStyle = "#c3c8cf"; g.fillRect(x + 22, by - 70, 62, 3); }
    g.fillStyle = body; g.beginPath();
    g.moveTo(x + 3, by - 12); g.lineTo(x + 2, by - 42); g.quadraticCurveTo(x + 4, by - 58, x + 14, by - 59); g.lineTo(x + 86, by - 59);
    g.quadraticCurveTo(x + 96, by - 58, x + 112, by - 42); g.quadraticCurveTo(x + 138, by - 40, x + 148, by - 34); g.quadraticCurveTo(x + 152, by - 26, x + 150, by - 14); g.lineTo(x + 3, by - 12); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = dark; g.fillRect(x + 4, by - 22, 145, 8);
    // metallic glans
    g.fillStyle = "rgba(255,255,255,.45)"; g.fillRect(x + 8, by - 38, 128, 2.5); g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(x + 108, by - 40, 30, 2);
    g.fillStyle = "#2a3542"; g.beginPath(); g.moveTo(x + 10, by - 54); g.lineTo(x + 86, by - 54); g.quadraticCurveTo(x + 94, by - 53, x + 106, by - 42); g.lineTo(x + 10, by - 42); g.closePath(); g.fill();
    g.fillStyle = body; g.fillRect(x + 38, by - 55, 4, 14); g.fillRect(x + 66, by - 55, 4, 14);
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x + 14, by - 52, 20, 3);
    g.strokeStyle = dark; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 40, by - 41); g.lineTo(x + 40, by - 18); g.moveTo(x + 68, by - 41); g.lineTo(x + 70, by - 18); g.stroke();
    g.fillStyle = "#9aa0a8"; g.fillRect(x + 50, by - 36, 6, 2); g.fillRect(x + 78, by - 36, 6, 2);
    g.fillStyle = body; g.beginPath(); g.ellipse(x + 104, by - 43, 4, 2.5, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#fff6d8"; g.beginPath(); g.ellipse(x + 142, by - 33, 6, 2.6, -.2, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c4202a"; g.fillRect(x + 2, by - 42, 5, 12);
    g.fillStyle = "#1c1c20"; g.fillRect(x + 140, by - 24, 10, 6);
    g.fillStyle = "#c4202a"; g.beginPath(); g.arc(x + 146, by - 28, 1.8, 0, 7); g.fill();
    g.fillStyle = "#3a3f48"; g.fillRect(x + 12, by - 61, 72, 2);
    wheel(x + 30, 13); wheel(x + 120, 13);
  } else if (model === "900") {
    // klassieke Saab 900 driedeurs: lange motorkap, steile voorruit, schuine achterklep met spoilertje,
    // grijze onderrand en witte aero-velgen; met een kerstboom op het dak zoals op de kersttrui
    const body = opts.color || "#b8232a", dark = shade(body, -.25), trim = "#3c3d44";
    shadowAt(x + 75, by, 74);
    g.fillStyle = body; g.beginPath();
    g.moveTo(x + 3, by - 16); g.lineTo(x + 3, by - 36); g.lineTo(x + 8, by - 41); g.lineTo(x + 16, by - 43);
    g.lineTo(x + 52, by - 63); g.quadraticCurveTo(x + 56, by - 65, x + 62, by - 65); g.lineTo(x + 90, by - 65);
    g.quadraticCurveTo(x + 94, by - 64, x + 108, by - 45); g.quadraticCurveTo(x + 132, by - 42, x + 146, by - 36);
    g.quadraticCurveTo(x + 149, by - 30, x + 148, by - 16); g.closePath(); g.fill(); g.stroke();
    // spoilertje op de achterklep
    g.fillStyle = "#1c1c20"; g.beginPath(); g.moveTo(x + 10, by - 44); g.lineTo(x + 22, by - 47); g.lineTo(x + 22, by - 44); g.closePath(); g.fill();
    // grijze onderrand en bumpers
    g.fillStyle = trim; g.beginPath(); rp(x + 1, by - 27, 149, 13, 3); g.fill(); g.stroke();
    g.fillStyle = "#8a8c94"; g.fillRect(x + 3, by - 24, 145, 1.5);
    // ramen: portierruit en een kleine zijruit; daarachter de brede C-stijl in de kleur van de auto,
    // smal bij het dak en breed onderin, en de achterruit als smalle strook langs de schuine achterklep
    g.fillStyle = "#2a3542";
    g.beginPath(); g.moveTo(x + 44, by - 45); g.lineTo(x + 56, by - 60); g.lineTo(x + 64, by - 61); g.lineTo(x + 64, by - 45); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + 68, by - 45); g.lineTo(x + 68, by - 61); g.lineTo(x + 89, by - 61); g.quadraticCurveTo(x + 92, by - 60, x + 102, by - 45); g.closePath(); g.fill();
    g.fillStyle = "#1c1c20"; g.fillRect(x + 64, by - 61, 4, 16);
    g.strokeStyle = "#2a3542"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 19, by - 45); g.lineTo(x + 50, by - 63); g.stroke();
    g.strokeStyle = shade(body, .25); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 26, by - 44); g.lineTo(x + 52, by - 60); g.stroke();
    g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x + 72, by - 57, 14, 2.5);
    g.beginPath(); g.moveTo(x + 50, by - 49); g.lineTo(x + 56, by - 57); g.lineTo(x + 58, by - 56); g.lineTo(x + 52, by - 48); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 2;
    // lange portier, kruk, ventilatierooster, richtingaanwijzer, lampen
    g.strokeStyle = dark; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 66, by - 44); g.lineTo(x + 66, by - 27); g.moveTo(x + 104, by - 44); g.quadraticCurveTo(x + 106, by - 36, x + 104, by - 27); g.stroke();
    g.fillStyle = "#1c1c20"; g.fillRect(x + 71, by - 38, 6, 2); g.fillRect(x + 22, by - 38, 16, 2.5);
    g.fillStyle = "#e8a020"; g.fillRect(x + 112, by - 34, 4, 3);
    g.fillStyle = body; g.beginPath(); g.ellipse(x + 103, by - 46, 3.5, 2.4, 0, 0, 7); g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "#fff6d8"; g.fillRect(x + 138, by - 35, 9, 5); g.strokeRect(x + 138, by - 35, 9, 5);
    g.fillStyle = "#e8a020"; g.fillRect(x + 134, by - 35, 4, 5);
    g.fillStyle = "#c4202a"; g.fillRect(x + 3, by - 36, 4, 8); g.fillStyle = "#e8a020"; g.fillRect(x + 3, by - 30, 4, 3);
    g.strokeStyle = OUT; g.lineWidth = 2;
    if (opts.tree !== false) {
      // de boom ligt over de lengte op het dak, met touwtjes vast
      const ry = by - 67;
      g.fillStyle = "#5a3a20"; g.fillRect(x + 14, ry - 5, 14, 5); g.strokeRect(x + 14, ry - 5, 14, 5);
      for (let i = 0; i < 5; i++) { const tx = x + 24 + i * 15, h = 18 - i * 3; g.fillStyle = OUT; g.beginPath(); g.moveTo(tx - 1, ry - h - 1); g.lineTo(tx + 24, ry - 2); g.lineTo(tx - 1, ry + 1); g.fill(); g.fillStyle = i % 2 ? "#226b40" : "#1a5634"; g.beginPath(); g.moveTo(tx, ry - h); g.lineTo(tx + 22, ry - 2); g.lineTo(tx, ry); g.fill(); g.fillStyle = "#f4f8ff"; g.fillRect(tx + 2, ry - h + 3, 9, 2); }
      g.strokeStyle = "#c9a34a"; g.lineWidth = 1.5; [x + 40, x + 74].forEach(rx => { g.beginPath(); g.moveTo(rx, ry - 18); g.lineTo(rx - 3, by - 60); g.stroke(); });
      for (let i = 0; i < 6; i++) { g.fillStyle = (Math.floor(frame / 15) + i) % 2 ? "#ffd25e" : "#ff6b6b"; g.beginPath(); g.arc(x + 30 + i * 12, ry - 6 - (i % 2) * 5, 2.2, 0, 7); g.fill(); }
      g.strokeStyle = OUT; g.lineWidth = 2;
    }
    aero(x + 30, 13); aero(x + 120, 13);
  } else if (model === "96") {
    // Saab 96: rond als een druppel
    const body = opts.color || "#7fb0a8";
    shadowAt(x + 55, by, 56);
    g.fillStyle = body; g.beginPath(); g.moveTo(x + 4, by - 14); g.quadraticCurveTo(x + 2, by - 34, x + 18, by - 40); g.quadraticCurveTo(x + 48, by - 70, x + 76, by - 44); g.quadraticCurveTo(x + 104, by - 40, x + 110, by - 26); g.lineTo(x + 108, by - 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2a3542"; g.beginPath(); g.moveTo(x + 24, by - 42); g.quadraticCurveTo(x + 48, by - 64, x + 70, by - 44); g.closePath(); g.fill();
    g.fillStyle = body; g.fillRect(x + 46, by - 60, 4, 18);
    g.fillStyle = "#e9e6dc"; g.fillRect(x + 4, by - 20, 104, 3);
    g.fillStyle = "#fff6d8"; g.beginPath(); g.arc(x + 104, by - 30, 4, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#c4202a"; g.fillRect(x + 4, by - 32, 4, 6);
    wheel(x + 26, 11); wheel(x + 88, 11);
  }
  g.restore();
}

/* ---------- Lego ---------- */
function drawLegoBrick(cx, cy, col, w = 18) {
  g.save(); g.strokeStyle = OUT; g.lineWidth = 1.4;
  g.fillStyle = col; g.beginPath(); rp(cx - w / 2, cy - 4, w, 11, 1.5); g.fill(); g.stroke();
  for (let i = 0; i < Math.round(w / 9); i++) { g.beginPath(); rp(cx - w / 2 + 2 + i * 9, cy - 8, 5, 4, 1); g.fill(); g.stroke(); }
  g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(cx - w / 2 + 2, cy - 2, w - 4, 2);
  g.restore();
}
const LEGO_COLS = ["#d8232a", "#1e5aa8", "#f5c518", "#2a9a4a", "#f57d20", "#ffffff"];

/* ---------- Uitgang ---------- */
function drawExit(theme) {
  const e = L.exit, x = e.x, by = e.y + e.h;
  g.lineJoin = "round"; g.strokeStyle = OUT; g.lineWidth = 2;
  const style = L.d.exitStyle;
  if (style === "arch") {
    const sn = theme !== "bos" && theme !== "kust" && theme !== "straat" && theme !== "grot";
    [x - 26, x + 50].forEach(px => { g.fillStyle = "#6b4528"; g.fillRect(px, by - 110, 10, 110); g.strokeRect(px, by - 110, 10, 110); g.fillStyle = "#8a5a32"; g.fillRect(px + 2, by - 108, 3, 106); });
    g.font = "700 14px Fredoka, sans-serif"; const w = Math.max(96, g.measureText(L.d.exitLabel).width + 24);
    g.fillStyle = "#c9955a"; g.beginPath(); rp(x + 14 - w / 2, by - 132, w, 30, 4); g.fill(); g.stroke();
    g.fillStyle = "#3a200c"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(L.d.exitLabel, x + 14, by - 116);
    if (sn) { g.fillStyle = "#f4f8ff"; g.beginPath(); rp(x + 10 - w / 2, by - 137, w + 8, 7, 3); g.fill(); }
    else { g.fillStyle = "#4f9e3c"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(x + 14 - w / 2 + i * w / 7, by - 132, 5, 0, 7); g.fill(); } }
    const ok = L.keys >= L.need;
    g.fillStyle = ok ? "#59c28a" : "#ff6b6b"; g.beginPath(); g.arc(x + 14, by - 145, 6, 0, 7); g.fill(); g.stroke();
    return;
  }
  if (style === "car") {
    // de twee auto's van de families: de witte Saab 9-3 met dakkoffer en een donkere stationwagen
    drawSaab("93", x - 190, by, { color: "#3a3f4a", roofbox: false });
    drawSaab("93", x - 30, by);
    if (L.keys >= L.need) { emoji("🧦", x + 30, by - 92, 14); emoji("🧳", x + 60, by - 94, 16); }
    return;
  }
  if (style === "door") theme = "huis";
  else if (style === "tree") theme = "sneeuw";
  else if (style === "house") theme = "bos";
  if (theme === "bos") {
    const fx = x - 4 * TS, fw = 9 * TS, top = by - 7 * TS;
    // schoorsteen + rook
    g.fillStyle = "#6b5a52"; g.fillRect(fx + fw - 70, top - 120, 18, 60); g.strokeRect(fx + fw - 70, top - 120, 18, 60);
    for (let i = 0; i < 4; i++) { const t = (frame * .5 + i * 30) % 120; g.fillStyle = `rgba(230,230,235,${.5 - t / 260})`; g.beginPath(); g.arc(fx + fw - 61 + Math.sin(t / 15) * 6 + t * .2, top - 126 - t, 6 + t / 10, 0, 7); g.fill(); }
    // muur
    g.fillStyle = "#cdbdbc"; g.fillRect(fx, top, fw, 7 * TS); g.strokeRect(fx, top, fw, 7 * TS);
    g.fillStyle = "#bfaead"; for (let i = 0; i < 40; i++) g.fillRect(fx + hash(i) * fw, top + hash(i * 3) * 7 * TS, 3, 2);
    g.fillStyle = "#f4f2ee"; for (let y = top; y < by - 24; y += 22) { g.fillRect(fx, y, 12, 12); g.fillRect(fx + fw - 12, y, 12, 12); }
    g.fillStyle = "#8f6e64"; g.fillRect(fx, by - 24, fw, 24); g.strokeRect(fx, by - 24, fw, 24);
    // dak
    g.fillStyle = "#3a3f4b"; g.beginPath(); g.moveTo(fx - 18, top + 6); g.lineTo(fx + fw / 2, top - 118); g.lineTo(fx + fw + 18, top + 6); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#4a505e"; for (let i = 1; i < 8; i++) { const yy = top + 6 - i * 15, half = (fw / 2 + 18) * (1 - i / 8.2); g.fillRect(fx + fw / 2 - half, yy, half * 2, 2); }
    g.fillStyle = "#cfd8e2"; g.fillRect(fx + 30, top - 40, 16, 12); g.fillRect(fx + fw - 50, top - 40, 16, 12);
    g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.moveTo(fx + 24, top - 2); g.quadraticCurveTo(fx + fw / 2, top - 126, fx + fw - 24, top - 2); g.stroke();
    g.lineWidth = 2.5; for (let i = 1; i < 9; i++) { const t = i / 9; const ax = fx + 24 + t * (fw - 48); const ay = top - 2 - Math.sin(t * Math.PI) * 60; g.beginPath(); g.moveTo(ax, ay); g.lineTo(fx + fw / 2, top - 70); g.stroke(); }
    g.lineWidth = 2; g.strokeStyle = OUT;
    // ramen
    const lit = L.keys >= 3;
    [[fx + 30, top + 40], [fx + fw - 80, top + 40], [fx + 30, top + 128], [fx + fw - 80, top + 128], [fx + fw / 2 - 25, top - 54]].forEach(([wx, wy]) => {
      g.fillStyle = "#f6f4ef"; g.fillRect(wx - 7, wy - 7, 64, 74); g.strokeRect(wx - 7, wy - 7, 64, 74);
      g.fillStyle = "#435c7a"; g.fillRect(wx, wy, 50, 60);
      g.fillStyle = lit ? "#ffe7a8" : "#6f8aa8"; g.fillRect(wx + 3, wy + 3, 20, 26); g.fillRect(wx + 27, wy + 3, 20, 26);
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(wx + 5, wy + 33, 4, 22);
      g.fillStyle = "#f6f4ef"; g.fillRect(wx + 23, wy, 4, 60); g.fillRect(wx, wy + 29, 50, 4);
      g.fillStyle = "#e7e2d8"; g.fillRect(wx - 10, wy + 66, 70, 6);
    });
    if (lit) { for (let i = 0; i < 16; i++) { g.fillStyle = ["#ff5a5a", "#ffd25e", "#59c28a", "#5aa8ff"][(i + fl(frame / 20)) % 4]; g.beginPath(); g.arc(fx + 10 + i * (fw - 20) / 15, top + 10 + Math.sin(i * .8) * 4, 3, 0, 7); g.fill(); } }
    // deur
    g.fillStyle = "#f6f4ef"; g.fillRect(x - 10, e.y - 14, e.w + 20, e.h + 14); g.strokeRect(x - 10, e.y - 14, e.w + 20, e.h + 14);
    g.fillStyle = lit ? "#ffe7a8" : "#ffffff"; g.fillRect(x - 2, e.y - 6, e.w + 4, e.h + 6); g.strokeRect(x - 2, e.y - 6, e.w + 4, e.h + 6);
    g.strokeStyle = "#d8d2c6"; g.strokeRect(x + 3, e.y, e.w - 6, 24); g.strokeRect(x + 3, e.y + 30, e.w - 6, 28); g.strokeStyle = OUT;
    g.fillStyle = "#c9a34a"; g.beginPath(); g.arc(x + 25, e.y + 30, 2.5, 0, 7); g.fill();
    g.fillStyle = "#2a2a2a"; g.fillRect(x + 50, by - 54, 22, 14); g.strokeRect(x + 50, by - 54, 22, 14); g.fillStyle = "#c9a34a"; g.fillRect(x + 54, by - 50, 14, 2);
    g.fillStyle = "#d8d0c4"; g.fillRect(x - 16, by - 4, e.w + 32, 4);
  } else if (theme === "huis") {
    g.fillStyle = "#3a3a3a"; g.fillRect(x - 10, e.y - 40, e.w + 20, e.h + 40); g.strokeRect(x - 10, e.y - 40, e.w + 20, e.h + 40);
    const sky = g.createLinearGradient(0, e.y - 34, 0, by); sky.addColorStop(0, "#1b2b4a"); sky.addColorStop(1, "#4d6ea6");
    g.fillStyle = sky; g.fillRect(x - 4, e.y - 34, e.w + 8, e.h + 34);
    g.fillStyle = "#e3ecf7"; g.fillRect(x - 4, by - 20, e.w + 8, 20);
    pineShape(x + 6, by - 14, 30, "#1e3b4c", "#163040", "#eef4ff");
    g.fillStyle = "#c7b9a6"; g.beginPath(); g.moveTo(x + 14, e.y - 10); g.lineTo(x + 44, e.y + 2); g.lineTo(x + 14, e.y + 2); g.fill();
    g.fillStyle = "#3a3a3a"; g.fillRect(x + 14, e.y - 34, 4, e.h + 34);
    g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x - 2, e.y - 30, 4, e.h + 20);
  } else {
    const cx = x + 16, top = by - 180;
    shadowAt(cx, by, 60);
    g.fillStyle = "#5a3a20"; g.fillRect(cx - 8, by - 24, 16, 24); g.strokeRect(cx - 8, by - 24, 16, 24);
    for (let i = 0; i < 5; i++) {
      const w = 76 - i * 14, yy = by - 22 - i * 30;
      g.fillStyle = OUT; g.beginPath(); g.moveTo(cx - w - 2, yy + 2); g.lineTo(cx + w + 2, yy + 2); g.lineTo(cx, yy - 62); g.fill();
      g.fillStyle = "#226b40"; g.beginPath(); g.moveTo(cx - w, yy); g.lineTo(cx + w, yy); g.lineTo(cx, yy - 58); g.fill();
      g.fillStyle = "#1a5634"; g.beginPath(); g.moveTo(cx, yy); g.lineTo(cx + w, yy); g.lineTo(cx, yy - 58); g.fill();
      g.fillStyle = "#f4f8ff"; g.beginPath(); g.moveTo(cx - w, yy); g.quadraticCurveTo(cx, yy - 8, cx + w, yy); g.lineTo(cx + w - 6, yy - 4); g.quadraticCurveTo(cx, yy - 12, cx - w + 6, yy - 4); g.fill();
    }
    g.strokeStyle = "#ffd25e"; g.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(cx - 50 + i * 12, by - 40 - i * 34); g.quadraticCurveTo(cx, by - 26 - i * 34, cx + 46 - i * 12, by - 46 - i * 34); g.stroke(); }
    for (let i = 0; i < 18; i++) { g.fillStyle = (fl(frame / 15) + i) % 3 ? "#ffd25e" : "#ff8a8a"; g.beginPath(); g.arc(cx - 54 + hash(i) * 108 * (1 - (i % 5) / 6), by - 34 - (i % 5) * 28, 2.5, 0, 7); g.fill(); }
    [[-30, -50], [28, -84], [-12, -118]].forEach(([dx, dy], i) => {
      if (i < L.keys) drawItem("bauble", cx + dx, by + dy, frame * 16);
      else { g.strokeStyle = "rgba(255,255,255,.6)"; g.setLineDash([3, 3]); g.lineWidth = 1.5; g.beginPath(); g.arc(cx + dx, by + dy + 2, 8, 0, 7); g.stroke(); g.setLineDash([]); }
    });
    g.strokeStyle = OUT; g.lineWidth = 2;
    const done = L.keys >= 3;
    if (done) { const sg = g.createRadialGradient(cx, top + 2, 2, cx, top + 2, 40); sg.addColorStop(0, "rgba(255,230,120,.7)"); sg.addColorStop(1, "rgba(255,230,120,0)"); g.fillStyle = sg; g.fillRect(cx - 40, top - 38, 80, 80); }
    g.fillStyle = done ? "#ffe066" : "#8a8a8a"; star(cx, top + 2, 13); g.stroke();
    [[-58, "#d33a3a", "#ffd25e"], [40, "#3d7fd9", "#fff"], [-20, "#59c28a", "#ff5a7a"]].forEach(([dx, c1, c2], i) => {
      const w = 22 - i * 3; g.fillStyle = c1; g.fillRect(cx + dx, by - w, w + 4, w); g.strokeRect(cx + dx, by - w, w + 4, w);
      g.fillStyle = c2; g.fillRect(cx + dx + w / 2, by - w, 4, w); g.fillRect(cx + dx, by - w * .6, w + 4, 3);
    });
  }
}
function star(cx, cy, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * .45 : r; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.closePath(); g.fill(); }

/* ---------- Bordjes, vlaggen, codepaal, lantaarn ---------- */
function drawSign(s) {
  g.strokeStyle = OUT; g.lineWidth = 2;
  g.fillStyle = "#6b4528"; g.fillRect(s.x + 13, s.y + 2, 6, 30); g.strokeRect(s.x + 13, s.y + 2, 6, 30);
  g.fillStyle = "#c9955a"; g.beginPath(); rp(s.x - 3, s.y - 18, 38, 24, 3); g.fill(); g.stroke();
  g.fillStyle = "#b07e48"; g.fillRect(s.x - 1, s.y - 7, 34, 2);
  g.fillStyle = "#5a3416"; g.fillRect(s.x + 4, s.y - 14, 24, 2); g.fillRect(s.x + 4, s.y - 3, 16, 2);
  g.fillStyle = "#e0e0d8"; g.fillRect(s.x, s.y - 15, 2, 2); g.fillRect(s.x + 30, s.y - 15, 2, 2);
  if (L.d.theme === "sneeuw" || L.d.theme === "stad") { g.fillStyle = "#f4f8ff"; g.beginPath(); rp(s.x - 4, s.y - 22, 40, 6, 3); g.fill(); }
}
/** Checkpoint flags: white until you pass, then the flag of the region (Belgium, Austria, Norway, or a North Pole flag). */
const FLAGS = {
  ardennes: [3, (i, r) => ["#1d1d1d", "#fdda24", "#ef3340"][fl(i / 4)]],
  ardeche: [3, (i, r) => ["#002395", "#ffffff", "#ed2939"][fl(i / 4)]],
  veneto: [3, (i, r) => ["#009246", "#ffffff", "#ce2b37"][fl(i / 4)]],
  tirol: [3, (i, r) => r === 1 ? "#ffffff" : "#c8102e"],
  norway: [7, (i, r) => { const v = i === 4 || r === 3, w = i >= 3 && i <= 5 || r >= 2 && r <= 4; return v ? "#00205b" : w ? "#ffffff" : "#ba0c2f"; }],
  pole: [3, (i, r) => ["#d8232a", "#ffffff", "#2a9a4a"][r]],
  netherlands: [3, (i, r) => ["#ae1c28", "#ffffff", "#21468b"][r]],
  smaland: [5, (i, r) => r === 2 || i === 3 || i === 4 ? "#fecc02" : "#006aa7"],
  // the saltire: a white diagonal cross on blue
  scotland: [9, (i, r) => { const d = i * 8 / 11; return Math.abs(r - d) < 1.1 || Math.abs(r - (8 - d)) < 1.1 ? "#ffffff" : "#0065bd"; }],
  dalmatia: [6, (i, r) => i >= 5 && i <= 6 && r >= 1 && r <= 3 ? ((i + r) % 2 ? "#ffffff" : "#d8232a") : ["#d8232a", "#d8232a", "#ffffff", "#ffffff", "#1a3a8a", "#1a3a8a"][r]]
};
function drawCheck(c) {
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#d8d8d8"; g.fillRect(c.x + 13, c.y - 30, 4, TS + 30); g.strokeRect(c.x + 13, c.y - 30, 4, TS + 30);
  g.fillStyle = "#ffd25e"; g.beginPath(); g.arc(c.x + 15, c.y - 32, 3.5, 0, 7); g.fill(); g.stroke();
  const [rows, col] = FLAGS[REGION.id] || FLAGS.ardennes, h = 18 / rows;
  for (let i = 0; i < 12; i++) {
    const wav = Math.sin(frame / 8 - i * .5) * (1 + i * .25);
    for (let r = 0; r < rows; r++) { g.fillStyle = c.on ? col(i, r) : r % 2 ? "#b9c6d6" : "#d6dee8"; g.fillRect(c.x + 17 + i * 2, c.y - 28 + r * h + wav, 2.2, h + .3); }
  }
}
function drawPad() {
  const p = L.pad;
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#4a4a4a"; g.fillRect(p.x + 13, p.y + 4, 6, 28); g.strokeRect(p.x + 13, p.y + 4, 6, 28);
  g.fillStyle = "#59647a"; g.beginPath(); rp(p.x + 2, p.y - 20, 28, 28, 4); g.fill(); g.stroke();
  g.fillStyle = "#0b1520"; g.fillRect(p.x + 6, p.y - 16, 20, 7);
  g.fillStyle = L.codeOpen ? "#59c28a" : (fl(frame / 30) % 2 ? "#ff6b6b" : "#a83a3a"); g.fillRect(p.x + 8, p.y - 14, 16, 3);
  g.fillStyle = "#d6dbe6"; for (let i = 0; i < 9; i++) g.fillRect(p.x + 7 + (i % 3) * 7, p.y - 7 + fl(i / 3) * 4.5, 4.5, 3);
}
function drawLantern(l) {
  if (L.d.theme === "stad") return drawCandles(l);
  const lx = l.x + 16, ly = l.y - 14;
  if (l.lit) { const gl = g.createRadialGradient(lx, ly, 2, lx, ly, 90); gl.addColorStop(0, "rgba(255,220,150,.5)"); gl.addColorStop(1, "rgba(255,220,150,0)"); g.fillStyle = gl; g.fillRect(lx - 90, ly - 90, 180, 180); }
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#2b2b30"; g.fillRect(lx - 2.5, ly + 10, 5, 36); g.fillRect(lx - 7, ly + 42, 14, 4);
  g.fillStyle = "#2b2b30"; g.beginPath(); g.moveTo(lx - 11, ly - 12); g.lineTo(lx + 11, ly - 12); g.lineTo(lx, ly - 22); g.closePath(); g.fill();
  g.fillStyle = l.lit ? "#ffe8b0" : "#56607a"; g.fillRect(lx - 8, ly - 12, 16, 22); g.strokeRect(lx - 8, ly - 12, 16, 22);
  g.fillStyle = "#2b2b30"; g.fillRect(lx - 1, ly - 12, 2, 22);
  if (l.lit) { g.fillStyle = "#ff9b45"; g.beginPath(); g.ellipse(lx, ly - 1 + Math.sin(frame / 12) * .6, 2.6, 5, 0, 0, 7); g.fill(); g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(lx, ly, 1.2, 2.5, 0, 0, 7); g.fill(); }
  g.fillStyle = "#f4f8ff"; g.beginPath(); rp(lx - 12, ly - 16, 24, 4, 2); g.fill();
}

/* ---------- The gate halfway: levers, lamps, the bell and the animal; clues for the lock ---------- */
function numPlate(cx, cy, n, col = "#fff4e6") {
  g.fillStyle = OUT; g.beginPath(); g.arc(cx, cy, 8.5, 0, 7); g.fill();
  g.fillStyle = col; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
  g.fillStyle = "#2a1404"; g.font = "700 11px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(n, cx, cy + .5);
}
function drawSwitch(s) {
  const cx = s.x + 16, by = s.y + TS, kind = L.d.task.kind, look = L.d.task.look;
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  if (kind === "levers") {
    // a lever on a little iron box: down and red when off, up and green when on
    const a = s.on ? -.5 : .5;
    g.save(); g.translate(cx, by - 14); g.rotate(a);
    g.fillStyle = "#5a3a20"; g.fillRect(-2.5, -26, 5, 26); g.strokeRect(-2.5, -26, 5, 26);
    g.fillStyle = s.on ? "#59c28a" : "#e8423a"; g.beginPath(); g.arc(0, -27, 5, 0, 7); g.fill(); g.stroke();
    g.restore();
    g.fillStyle = "#5a6070"; g.beginPath(); rp(cx - 13, by - 16, 26, 16, 3); g.fill(); g.stroke();
    g.fillStyle = s.on ? "#8dffb5" : "#3a3f4a"; g.fillRect(cx - 8, by - 10, 4, 4); g.fillStyle = s.on ? "#3a3f4a" : "#ff8a8a"; g.fillRect(cx + 4, by - 10, 4, 4);
    return;
  }
  // a lamp to light: a lantern on a post, or a torch
  const ly = by - 50;
  if (s.on) { g.fillStyle = grad("lampglow", () => { const gl = g.createRadialGradient(0, 0, 2, 0, 0, 70); gl.addColorStop(0, "rgba(255,210,120,.5)"); gl.addColorStop(1, "rgba(255,210,120,0)"); return gl; });
    const m0 = g.getTransform(); g.translate(cx, ly); g.fillRect(-70, -70, 140, 140); g.setTransform(m0); }
  if (look === "torch") {
    g.fillStyle = "#6b4528"; g.fillRect(cx - 3, ly, 6, by - ly); g.strokeRect(cx - 3, ly, 6, by - ly);
    g.fillStyle = "#3a2a1a"; g.fillRect(cx - 5, ly - 4, 10, 7); g.strokeRect(cx - 5, ly - 4, 10, 7);
    if (s.on) [["#ff5a2a", 16], ["#ff9b45", 12], ["#ffd25e", 7]].forEach(([c, h], i) => { const hh = h + Math.sin(frame / 4 + i) * 3; g.fillStyle = c; g.beginPath(); g.moveTo(cx - 5 + i, ly - 4); g.quadraticCurveTo(cx, ly - 4 - hh * 2, cx + 5 - i, ly - 4); g.fill(); });
    return;
  }
  g.fillStyle = "#2b2b30"; g.fillRect(cx - 2.5, ly + 10, 5, by - ly - 10); g.fillRect(cx - 8, by - 4, 16, 4);
  g.beginPath(); g.moveTo(cx - 10, ly - 10); g.lineTo(cx + 10, ly - 10); g.lineTo(cx, ly - 19); g.closePath(); g.fill();
  g.fillStyle = s.on ? "#ffe8b0" : "#56607a"; g.fillRect(cx - 7, ly - 10, 14, 20); g.strokeRect(cx - 7, ly - 10, 14, 20);
  if (s.on) { g.fillStyle = "#ff9b45"; g.beginPath(); g.ellipse(cx, ly + 1 + Math.sin(frame / 12) * .6, 2.6, 5, 0, 0, 7); g.fill(); }
}
function drawBell(b) {
  const cx = b.x + 16, by = b.y + TS, top = by - 64;
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#6b4528"; g.fillRect(cx - 18, top, 5, by - top); g.strokeRect(cx - 18, top, 5, by - top); g.fillRect(cx + 13, top, 5, by - top); g.strokeRect(cx + 13, top, 5, by - top);
  g.fillRect(cx - 22, top - 6, 44, 7); g.strokeRect(cx - 22, top - 6, 44, 7);
  const a = Math.sin(b.swing / 3) * b.swing / 120;
  g.save(); g.translate(cx, top + 1); g.rotate(a);
  g.fillStyle = "#e8b44a"; g.beginPath(); g.moveTo(-5, 4); g.quadraticCurveTo(-6, 18, -12, 24); g.lineTo(12, 24); g.quadraticCurveTo(6, 18, 5, 4); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#fff3c4"; g.fillRect(-2, 8, 2, 10);
  g.fillStyle = "#8a6a2a"; g.beginPath(); g.arc(0, 26, 3, 0, 7); g.fill();
  g.restore();
  if (L.timer > 0) { g.fillStyle = "#ffd25e"; g.font = "700 14px Fredoka, sans-serif"; g.textAlign = "center"; g.fillText(Math.ceil(L.timer / 60), cx, top - 16); }
}
function drawAnimal(a) {
  const found = a.follow || a.home, cx = a.x + 16, by = a.y + TS, moving = a.follow && Math.abs(P.vx) > .3, bob = moving ? Math.abs(Math.sin(frame / 5)) * 3 : 0;
  shadowAt(cx, by, found ? 15 : 12);
  g.fillStyle = "#000"; // emoji take the alpha of the fill colour: the shadow's see-through colour made the animal look like a ghost
  const m0 = g.getTransform(); g.translate(cx, by - (found ? 16 : 13) - bob); g.scale(-a.face, 1);
  // once found it is bigger, with a white outline, so you always see it walking with you
  if (found) { g.shadowColor = "#ffffff"; g.shadowBlur = 5 * scale; emoji(L.d.task.animal, 0, 0, 34); emoji(L.d.task.animal, 0, 0, 34); g.shadowBlur = 0; g.shadowColor = "transparent"; }
  else { g.globalAlpha = .6; emoji(L.d.task.animal, 0, 0, 28); g.globalAlpha = 1; } // still hiding: a bit see-through, so it takes some looking
  g.setTransform(m0);
  if (a.follow && (frame % 120) < 50) {
    const yy = by - 48 - ((frame % 120) / 50) * 8;
    g.globalAlpha = 1 - (frame % 120) / 50; emoji("💛", cx, yy, 14); g.globalAlpha = 1;
  }
  if (!a.follow && !a.home) {
    const yy = by - 46 + Math.sin(frame / 10) * 2;
    g.fillStyle = OUT; g.beginPath(); g.arc(cx, yy, 9.5, 0, 7); g.fill(); g.fillStyle = "#ffd25e"; g.beginPath(); g.arc(cx, yy, 8, 0, 7); g.fill();
    g.fillStyle = "#3a200c"; g.font = "700 13px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", cx, yy + 1);
  }
}
function drawClue(c) {
  const cx = c.x + 16, by = c.y + TS;
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  if (c.kind === "melody") {
    // a bell on a post, in the colour of its note
    const col = NOTES[+c.v - 1][3], a = c.ring ? Math.sin(c.ring / 2.5) * c.ring / 100 : 0;
    g.fillStyle = "#6b4528"; g.fillRect(cx - 2.5, by - 52, 5, 52); g.strokeRect(cx - 2.5, by - 52, 5, 52); g.fillRect(cx - 2.5, by - 54, 16, 5); g.strokeRect(cx - 2.5, by - 54, 16, 5);
    g.save(); g.translate(cx + 10, by - 49); g.rotate(a);
    g.fillStyle = col; g.beginPath(); g.moveTo(-3, 0); g.quadraticCurveTo(-4, 10, -9, 15); g.lineTo(9, 15); g.quadraticCurveTo(4, 10, 3, 0); g.closePath(); g.fill(); g.stroke();
    g.restore();
    if (c.ring) { g.strokeStyle = col; g.lineWidth = 2; for (let i = 1; i <= 2; i++) { g.beginPath(); g.arc(cx + 10, by - 40, 10 + i * 6 + (50 - c.ring) / 5, -.9, .9); g.stroke(); } }
    numPlate(cx, by - 20, c.i + 1);
  } else if (c.kind === "colours") {
    // a lamp post with a coloured globe
    const col = COLOURS[c.v][0];
    g.fillStyle = "#2b2b30"; g.fillRect(cx - 2.5, by - 56, 5, 56); g.fillRect(cx - 8, by - 4, 16, 4);
    const glow = g.createRadialGradient(cx, by - 62, 3, cx, by - 62, 40); glow.addColorStop(0, col + "aa"); glow.addColorStop(1, col + "00");
    g.fillStyle = glow; g.fillRect(cx - 40, by - 102, 80, 80);
    g.fillStyle = col; g.beginPath(); g.arc(cx, by - 62, 9, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(cx - 3, by - 65, 2.5, 0, 7); g.fill();
    numPlate(cx, by - 24, c.i + 1);
  } else if (c.kind === "arrows") {
    // a signpost with an arrow
    g.fillStyle = "#6b4528"; g.fillRect(cx - 3, by - 50, 6, 50); g.strokeRect(cx - 3, by - 50, 6, 50);
    g.fillStyle = "#e8d4a8"; g.beginPath(); rp(cx - 17, by - 62, 34, 26, 4); g.fill(); g.stroke();
    g.save(); g.translate(cx, by - 49); g.rotate({ "→": 0, "↓": Math.PI / 2, "←": Math.PI, "↑": -Math.PI / 2 }[c.v]);
    g.fillStyle = "#c43a3a"; g.beginPath(); g.moveTo(-9, -3); g.lineTo(2, -3); g.lineTo(2, -8); g.lineTo(10, 0); g.lineTo(2, 8); g.lineTo(2, 3); g.lineTo(-9, 3); g.closePath(); g.fill();
    g.restore();
    numPlate(cx, by - 20, c.i + 1);
  } else {
    // a stone with a carved letter (indoors: a wooden letter block)
    if (L.d.theme === "huis") { g.fillStyle = "#e0b070"; g.beginPath(); rp(cx - 16, by - 32, 32, 32, 4); g.fill(); g.stroke(); g.fillStyle = "#c8955a"; g.fillRect(cx - 12, by - 28, 24, 2); }
    else { g.fillStyle = "#8a8f98"; g.beginPath(); g.ellipse(cx, by - 16, 18, 17, 0, Math.PI, 0); g.lineTo(cx + 18, by); g.lineTo(cx - 18, by); g.closePath(); g.fill(); g.stroke(); }
    if (L.d.theme === "sneeuw") { g.fillStyle = "#f4f8ff"; g.beginPath(); g.ellipse(cx, by - 31, 12, 4, 0, 0, 7); g.fill(); }
    g.fillStyle = "#3a3f4a"; g.font = "700 18px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(c.v, cx, by - 15);
    numPlate(cx + 17, by - 30, c.i + 1);
  }
}

/** Een kaarsenstandaard in de kerk: een paar kaarsjes branden al, en je kunt er een bij aansteken. */
function drawCandles(l) {
  const cx = l.x + 16, by = l.y + TS;
  const lit = [0, 1, 0, 1, 1, 0, 1].map((v, i) => v || (l.lit && i === 2));
  if (lit.some(Boolean)) { const gl = g.createRadialGradient(cx, by - 34, 2, cx, by - 34, 70); gl.addColorStop(0, `rgba(255,214,140,${l.lit ? .55 : .35})`); gl.addColorStop(1, "rgba(255,214,140,0)"); g.fillStyle = gl; g.fillRect(cx - 70, by - 104, 140, 140); }
  g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.fillStyle = "#2b2b30"; g.fillRect(cx - 2, by - 26, 4, 26); g.fillRect(cx - 10, by - 3, 20, 3);
  g.fillStyle = "#3a3a42"; g.beginPath(); rp(cx - 26, by - 30, 52, 6, 2); g.fill(); g.stroke();
  lit.forEach((on, i) => {
    const x = cx - 22 + i * 7.3;
    g.fillStyle = "#f6f1e4"; g.fillRect(x - 1.8, by - 37, 3.6, 7);
    if (on) { g.fillStyle = "#ff9b45"; g.beginPath(); g.ellipse(x, by - 40 + Math.sin(frame / 10 + i) * .4, 1.6, 3, 0, 0, 7); g.fill(); g.fillStyle = "#fff3c4"; g.beginPath(); g.ellipse(x, by - 39.5, .7, 1.5, 0, 0, 7); g.fill(); }
  });
}

/* ---------- Sfeer-deeltjes ---------- */
let leaves = [], motes = [];
function drawAmbient(theme) {
  const summerWood = theme === "bos" && !!(L && L.d.summer);
  if (leaves.summer !== summerWood) { leaves = []; leaves.summer = summerWood; }
  if (summerWood) {
    // a summer forest: butterflies instead of autumn leaves
    while (leaves.length < 10) leaves.push({ x: Math.random() * viewW, y: 60 + Math.random() * (VIEW_H - 160), vy: 0, r: Math.random() * 6, c: ["#f5d23a", "#f4f4f0", "#e8823a", "#9ad0f0"][leaves.length % 4] });
    for (const l of leaves) {
      if (state === "play" && !dialog) { l.x += .6 + Math.sin(frame / 30 + l.r) * .8; l.y += Math.sin(frame / 17 + l.r * 3) * .7; }
      if (l.x > viewW + 10) { l.x = -10; l.y = 60 + Math.random() * (VIEW_H - 160); }
      const f = Math.abs(Math.sin(frame / 4 + l.r)) * 4 + 1;
      g.fillStyle = l.c; g.beginPath(); g.ellipse(l.x - 2.5, l.y, f, 3.5, 0, 0, 7); g.ellipse(l.x + 2.5, l.y, f, 3.5, 0, 0, 7); g.fill();
      g.fillStyle = "#2a2a2a"; g.fillRect(l.x - .7, l.y - 3, 1.4, 6);
    }
    return;
  }
  if (theme === "bos") {
    while (leaves.length < 14) leaves.push({ x: Math.random() * viewW, y: -Math.random() * VIEW_H, vy: .5 + Math.random() * .6, r: Math.random() * 6, c: ["#e0862e", "#f2b53c", "#c9562b"][leaves.length % 3] });
    for (const l of leaves) {
      if (state === "play" && !dialog) { l.y += l.vy; l.x += Math.sin(frame / 40 + l.r) * .8; l.r += .03; }
      if (l.y > VIEW_H) { l.y = -10; l.x = Math.random() * viewW; }
      g.save(); g.translate(l.x, l.y); g.rotate(l.r); g.fillStyle = l.c; g.beginPath(); g.ellipse(0, 0, 5, 2.5, 0, 0, 7); g.fill(); g.restore();
    }
  } else if (theme === "huis") {
    while (motes.length < 26) motes.push({ x: Math.random() * viewW, y: Math.random() * VIEW_H, p: Math.random() * 6 });
    g.fillStyle = "rgba(255,240,200,.55)";
    for (const m of motes) { m.y -= .12; m.x += Math.sin(frame / 60 + m.p) * .15; if (m.y < 0) m.y = VIEW_H; g.fillRect(m.x, m.y, 1.6, 1.6); }
  }
}
function drawFlakes() {
  if (flakes.length < 120) for (let i = 0; i < 120; i++) flakes.push({ x: Math.random() * 2000, y: Math.random() * VIEW_H, vy: .4 + Math.random() * 1, r: .8 + Math.random() * 2.2, p: Math.random() * 6 });
  g.fillStyle = "#fff";
  for (const f of flakes) { g.globalAlpha = .5 + f.r / 6; g.beginPath(); g.arc(f.x % (viewW + 10), f.y, f.r, 0, 7); g.fill(); }
  g.globalAlpha = 1;
}
function vignette() {
  g.fillStyle = grad("vignette", () => {
    const vg = g.createRadialGradient(viewW / 2, VIEW_H * .55, VIEW_H * .45, viewW / 2, VIEW_H * .55, Math.max(viewW, VIEW_H) * .8);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,10,30,.32)"); return vg;
  }); g.fillRect(0, 0, viewW, VIEW_H);
}

/* ---------- Region gameplay: water, movers and darkness ---------- */
/** Water in the gaps (North Pole and Norway): you see what you would fall into. */
function waterColour() { return L.d.summer ? (L.d.scene === "falls" ? "#2aa88a" : L.d.scene === "ardeche" ? "#3a9a88" : ["laguna", "venezia", "burano"].includes(L.d.scene) ? "#3a8a96" : L.d.scene === "smaland" ? "#2a6a9a" : "#2aa0b8") : L.d.scene === "pole" ? "#2a5f8f" : "#1d3b66"; }
/** Water in the gaps. Each stretch of water is one rectangle (drawn per tile, the edges would show as thin lines).
 *  With `front` (columns from–to, see-through) it is drawn again in front of a swimmer: the same colour as the water
 *  behind, so you only see that the lower half of the swimmer is under water, not a box. */
function drawWater(cx, front) {
  let x0 = Math.max(0, fl(cx / TS) - 1), x1 = Math.min(L.w - 1, fl((cx + viewW) / TS) + 1);
  const wet = x => x >= 0 && x < L.w && L.grid[ROWS - 1][x] !== "#";
  if (front) { x0 = front[0]; x1 = front[1]; while (wet(x0 - 1) && waterTop(x0 - 1) === waterTop(x0)) x0--; while (wet(x1 + 1) && waterTop(x1 + 1) === waterTop(x1)) x1++; g.globalAlpha = .8; }
  for (let x = x0; x <= x1; x++) {
    if (!wet(x)) continue;
    // one rectangle per stretch at the same height (the river steps down at its waterfalls)
    const top = waterTop(x);
    let e = x; while (e < x1 && wet(e + 1) && waterTop(e + 1) === top) e++;
    g.fillStyle = waterColour(); g.fillRect(x * TS, top, (e - x + 1) * TS, VIEW_H - top);
    if (!front && L.d.river) {
      const r = L.d.river;
      // a waterfall where the next stretch is lower: a white sheet of water falling down, and foam at the bottom
      if (wet(e + 1) && waterTop(e + 1) > top) {
        const fx = (e + 1) * TS, low = waterTop(e + 1);
        g.fillStyle = "rgba(235,250,250,.9)"; g.fillRect(fx - 4, top, 10, low - top + 4);
        g.fillStyle = "rgba(255,255,255,.8)"; for (let i = 0; i < 3; i++) g.fillRect(fx - 3 + i * 3, top + ((frame * 2 + i * 9) % (low - top)), 1.5, 8);
        for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(fx + 4 + i * 6, low + 2 + Math.sin(frame / 5 + i) * 1.5, 3.5 - i * .4, 0, 7); g.fill(); }
      }
      // the rapids: fast white foam streaks
      g.fillStyle = "rgba(255,255,255,.75)";
      for (const [a, b] of r.rapids) for (let c = Math.max(a, x); c <= Math.min(b, e); c++) for (let i = 0; i < 3; i++) g.fillRect(c * TS + ((frame * 2.4 + i * 11 + c * 5) % (TS - 6)), top + 2 + i * 6, 6, 1.5);
    }
    g.fillStyle = "rgba(255,255,255,.45)";
    for (let c = x; c <= e; c++) for (let i = 0; i < 2; i++) g.fillRect(c * TS + ((frame * .4 + i * 16 + c * 7) % (TS - 8)), top + 3 + i * 9, 8, 1.5);
    x = e;
  }
  g.globalAlpha = 1;
}
/** A canoe around the player (cx, the waterline y): red with a yellow stripe, and a paddle going left and right. */
function drawCanoe(cx, y, face, pace) {
  g.save(); g.strokeStyle = OUT; g.lineWidth = 2; g.lineJoin = "round";
  // the paddle: a shaft in your hands, the blade dipping in on one side, then the other
  const a = Math.sin(frame / (pace ? 8 : 20)) * .7;
  g.save(); g.translate(cx, y - 14); g.rotate(a);
  g.strokeStyle = "#6a4426"; g.lineWidth = 3; g.beginPath(); g.moveTo(-26, 10); g.lineTo(26, -10); g.stroke();
  g.fillStyle = "#f2c42a"; g.strokeStyle = OUT; g.lineWidth = 1.5; [[-26, 10], [26, -10]].forEach(([bx, by]) => { g.beginPath(); g.ellipse(bx, by, 7, 3.5, -.38, 0, 7); g.fill(); g.stroke(); });
  g.restore();
  // the hull, in front of your legs
  g.fillStyle = "#d8402a"; g.beginPath(); g.moveTo(cx - 34, y - 8); g.quadraticCurveTo(cx - 30, y + 8, cx - 10, y + 10); g.lineTo(cx + 10, y + 10);
  g.quadraticCurveTo(cx + 30, y + 8, cx + 34, y - 8); g.quadraticCurveTo(cx, y - 2, cx - 34, y - 8); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#f2c42a"; g.beginPath(); g.moveTo(cx - 31, y - 4); g.quadraticCurveTo(cx, y + 2, cx + 31, y - 4); g.lineTo(cx + 30, y - 1); g.quadraticCurveTo(cx, y + 5, cx - 30, y - 1); g.closePath(); g.fill();
  g.restore();
}
/* ---------- Rides (genLevel(): `ride`): skis, a sledge, skates, a bike ----------
   Drawn around the player: cx is the middle, y the feet, k the size of the character. The person is drawn by render();
   on a sledge and a bike only the part above the seat (rideClip()), with the legs drawn here. */
/** Two skis with turned-up tips and two poles. */
function drawSkis(cx, y, face, k) {
  g.save(); g.translate(cx, y); g.scale(face, 1); g.lineJoin = "round"; g.lineCap = "round";
  // the poles, from the hands back into the snow
  g.strokeStyle = "#2a2f3c"; g.lineWidth = 2;
  [[2, -18 * k, -16, 0], [6, -17 * k, -10, 1]].forEach(([hx, hy, px, py]) => { g.beginPath(); g.moveTo(hx, hy); g.lineTo(px, py); g.stroke(); g.fillStyle = "#2a2f3c"; g.beginPath(); g.arc(px + 1, py - 3, 2.2, 0, 7); g.fill(); });
  // two skis, the near one a bit lower
  [[-1, "#d8402a"], [1, "#2e5a9a"]].forEach(([o, c]) => {
    g.fillStyle = c; g.strokeStyle = OUT; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-24, y0(o)); g.lineTo(18, y0(o)); g.quadraticCurveTo(26, y0(o), 27, y0(o) - 6); g.lineTo(24, y0(o) - 5); g.quadraticCurveTo(22, y0(o) - 2, 18, y0(o) - 2.5); g.lineTo(-24, y0(o) - 2.5); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2a2f3c"; g.fillRect(-4, y0(o) - 4.5, 8, 2);
  });
  function y0(o) { return 1 + o * .8; }
  g.restore();
}
/** A wooden sledge you sit in: slats, a curled front and two runners. Your legs go along the top, forwards. */
function drawSled(cx, y, face, k, pants) {
  g.save(); g.translate(cx, y); g.scale(face, 1); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = OUT;
  // legs stretched forwards, feet on the front
  g.lineWidth = 6 * k; g.strokeStyle = shade(pants, -.15); g.beginPath(); g.moveTo(-2, -11); g.lineTo(15, -12); g.stroke();
  g.fillStyle = "#3a2a22"; g.beginPath(); g.ellipse(17, -13, 3.2 * k, 4 * k, 0, 0, 7); g.fill();
  // the runners, curling up at the front
  g.strokeStyle = "#5a3a20"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-24, 0); g.lineTo(18, 0); g.quadraticCurveTo(28, 0, 26, -10); g.stroke();
  // the body of the sledge
  g.fillStyle = "#b8743a"; g.strokeStyle = OUT; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(-24, -10); g.lineTo(20, -10); g.quadraticCurveTo(25, -10, 25, -6); g.lineTo(23, -3); g.lineTo(-24, -3); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#d89a5a"; g.fillRect(-22, -9, 42, 2);
  [-16, -4, 8].forEach(x => { g.fillStyle = "#5a3a20"; g.fillRect(x, -3, 2.5, 3); });
  g.restore();
}
/** Ice skates: a shiny blade under each shoe. */
function drawSkates(cx, y, face, k) {
  g.save(); g.translate(cx, y); g.scale(face, 1); g.lineCap = "round";
  [-4, 4].forEach(x => { g.strokeStyle = "#dfe8f2"; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6 * k, 1); g.lineTo(x + 6 * k, 1); g.quadraticCurveTo(x + 8 * k, 1, x + 7.5 * k, -1); g.stroke();
    g.strokeStyle = "#8a96a8"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 3 * k, 0); g.lineTo(x - 3 * k, -1.5); g.moveTo(x + 3 * k, 0); g.lineTo(x + 3 * k, -1.5); g.stroke(); });
  g.restore();
}
/** A white bike (the free bikes of the Hoge Veluwe), behind the rider; pedal = how far the wheels have turned. */
function drawBike(cx, y, face, k, pedal) {
  g.save(); g.translate(cx, y); g.scale(face, 1); g.lineJoin = "round"; g.lineCap = "round";
  const r = 10, wy = -r, back = -17, front = 18, crank = [0, -10], seat = [-4, -26], bar = [13, -30];
  for (const wx of [back, front]) {
    g.strokeStyle = "#2a2f3c"; g.lineWidth = 3; g.beginPath(); g.arc(wx, wy, r, 0, 7); g.stroke();
    g.strokeStyle = "#c9ced8"; g.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = pedal + i * Math.PI / 3; g.beginPath(); g.moveTo(wx - Math.cos(a) * r, wy - Math.sin(a) * r); g.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); g.stroke(); }
  }
  g.strokeStyle = OUT; g.lineWidth = 4.5;
  const tubes = () => { g.beginPath(); g.moveTo(back, wy); g.lineTo(...crank); g.lineTo(...seat); g.lineTo(back, wy); g.moveTo(...seat); g.lineTo(bar[0] - 2, bar[1] + 6); g.lineTo(...crank); g.moveTo(bar[0] - 2, bar[1] + 6); g.lineTo(front, wy); g.stroke(); };
  tubes(); g.strokeStyle = "#f4f6f8"; g.lineWidth = 2.5; tubes();
  g.strokeStyle = OUT; g.lineWidth = 2; g.beginPath(); g.moveTo(bar[0] - 3, bar[1]); g.lineTo(bar[0] + 3, bar[1] - 1); g.stroke();
  g.fillStyle = "#3a2a22"; g.beginPath(); g.ellipse(seat[0], seat[1] - 1, 5, 2, 0, 0, 7); g.fill();
  g.restore();
}
/** The pedalling legs on a bike, from the saddle to the pedals (drawn after the rider, in front of the bike). */
function drawBikeLegs(cx, y, face, k, pedal, pants, seatY = -26) {
  g.save(); g.translate(cx, y); g.scale(face, 1); g.lineJoin = "round"; g.lineCap = "round";
  for (const [ph, c] of [[pedal + Math.PI, shade(pants, -.25)], [pedal, pants]]) {
    const px = Math.cos(ph) * 6, py = -10 + Math.sin(ph) * 6, hip = [-3, seatY + 1], knee = [(hip[0] + px) / 2 + 6, (hip[1] + py) / 2 - 2];
    g.strokeStyle = c; g.lineWidth = 5.5 * k; g.beginPath(); g.moveTo(...hip); g.lineTo(...knee); g.lineTo(px, py); g.stroke();
    g.fillStyle = "#3a2a22"; g.beginPath(); g.ellipse(px + 1.5, py, 3.5 * k, 2.2 * k, 0, 0, 7); g.fill();
  }
  g.restore();
}
/** The frozen canal of a skating ride: smooth, pale blue ice over the ground, with white scratches from the skates. */
function drawRideIce(c0, c1) {
  const r = L.d.ride;
  for (let c = Math.max(c0, r.x0); c <= Math.min(c1, r.x1); c++) {
    let row = 0; while (row < ROWS && L.grid[row][c] !== "#") row++;
    if (row >= ROWS) continue;
    const x = c * TS, y = row * TS - 3;
    g.fillStyle = "#b9def2"; g.fillRect(x, y, TS + 1, 13);
    g.fillStyle = "#e6f6ff"; g.fillRect(x, y, TS + 1, 3);
    g.fillStyle = "rgba(255,255,255,.7)"; g.fillRect(x + (c * 13) % 20, y + 6, 9, 1.2); g.fillRect(x + (c * 7) % 22 + 4, y + 9, 6, 1);
    g.fillStyle = "rgba(60,110,150,.35)"; g.fillRect(x, y + 12, TS + 1, 1.5);
  }
}
/** On a sledge or a bike you sit: the rider is moved so the hip is on the seat, and cut off just below the hem of the
    coat (so the whole body shows, for a kid as well as a grown-up); the legs are drawn with the sledge or the bike. */
function rideSeat(kind, feet, ch) {
  if (kind !== "sled" && kind !== "bike") return null;
  const sz = ch.size || 1, hip = (ch.kid ? 12 : 13) * sz, hem = (ch.coat === "long" ? 8 : 3) * sz;
  const seat = kind === "sled" ? feet - 9 : feet - 26;
  return { by: seat + hip, clip: seat + hem, seat: seat - feet };
}
/** An ice floe, a gondola of the cable car, or a little boat: you stand on top of it. */
function drawMover(m) {
  const x = m.x, y = m.y, w = m.w, st = L.d.movers;
  g.strokeStyle = OUT; g.lineWidth = 2; g.lineJoin = "round";
  if (st === "gondola") {
    // The cable runs from the station at the bottom to the one at the top (or level, if the ground is level).
    const k = (m.y1 - m.y0) / (m.x1 - m.x0), cy = sx => m.y0 - 70 + (sx - m.x0 - w / 2) * k;
    const sa = m.x0 - TS / 2, sb = m.x1 + w + TS / 2;
    g.strokeStyle = "#2a2f3c"; g.lineWidth = 2; g.beginPath(); g.moveTo(sa, cy(sa)); g.lineTo(sb, cy(sb)); g.stroke();
    for (const [sx, gy] of [[sa, m.y0], [sb, m.y1]]) {
      g.fillStyle = "#5a6070"; g.fillRect(sx - 4, cy(sx) - 4, 8, gy - cy(sx) + 4); g.strokeStyle = OUT; g.strokeRect(sx - 4, cy(sx) - 4, 8, gy - cy(sx) + 4);
      g.fillStyle = "#2a2f3c"; g.beginPath(); g.arc(sx, cy(sx), 7, 0, 7); g.fill();
      g.fillStyle = "#c9ced8"; g.beginPath(); g.arc(sx, cy(sx), 3, 0, 7); g.fill();
    }
    const hy = cy(x + w / 2);
    g.fillStyle = "#2a2f3c"; g.fillRect(x + w / 2 - 2, hy, 4, y - 50 - hy); g.beginPath(); g.arc(x + w / 2, hy, 5, 0, 7); g.fill();
    g.strokeStyle = OUT; g.lineWidth = 2;
    g.fillStyle = "#d8423a"; g.beginPath(); rp(x + 2, y - 50, w - 4, 50, 6); g.fill(); g.stroke();
    g.fillStyle = "#ffe7a8"; g.fillRect(x + 8, y - 42, w - 16, 16); g.strokeRect(x + 8, y - 42, w - 16, 16);
    g.fillStyle = "#f4f8ff"; g.fillRect(x + 2, y - 4, w - 4, 4);
    g.fillStyle = "#b8332c"; g.fillRect(x, y - 2, w, 6); g.strokeRect(x, y - 2, w, 6);
  } else if (st === "boat" && L.d.boatLook === "vaporetto") {
    // a vaporetto, the water bus of Venice: a white hull, a blue stripe and a cabin with windows
    const bob = Math.sin(frame / 20 + x * .01) * 1.2;
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.moveTo(x - 10, y + bob); g.lineTo(x + w + 14, y + bob); g.quadraticCurveTo(x + w + 10, y + 14 + bob, x + w, y + 16 + bob); g.lineTo(x - 6, y + 16 + bob); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#2a5ab8"; g.fillRect(x - 8, y + 6 + bob, w + 20, 3); g.fillStyle = "#f2c42a"; g.fillRect(x - 8, y + 10 + bob, w + 18, 2);
    // the cabin roof is behind you, so you stand on the deck in front of it
    g.fillStyle = "#e8e4dc"; g.fillRect(x - 6, y - 26 + bob, 14, 26); g.strokeRect(x - 6, y - 26 + bob, 14, 26);
    g.fillStyle = "#9ad0f0"; g.fillRect(x - 3, y - 22 + bob, 8, 8);
    g.fillStyle = "#2a5ab8"; g.fillRect(x - 8, y - 30 + bob, 18, 5);
  } else if (st === "boat") {
    const bob = Math.sin(frame / 20 + x * .01) * 1.5;
    g.fillStyle = "#8a5a32"; g.beginPath(); g.moveTo(x - 6, y + bob); g.lineTo(x + w + 6, y + bob); g.lineTo(x + w - 6, y + 16 + bob); g.lineTo(x + 6, y + 16 + bob); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#b2322a"; g.fillRect(x - 4, y + 2 + bob, w + 8, 4);
    g.fillStyle = "#f4f8ff"; g.fillRect(x - 6, y - 1 + bob, w + 12, 3);
    g.strokeStyle = "#5a3a22"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + w - 10, y + bob); g.lineTo(x + w + 8, y - 10 + bob); g.stroke();
  } else {
    g.fillStyle = "#cfe4f5"; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + w + 4, y); g.lineTo(x + w - 2, y + 14); g.lineTo(x + 2, y + 14); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#ffffff"; g.fillRect(x - 3, y, w + 6, 4);
    g.fillStyle = "rgba(90,140,200,.35)"; g.fillRect(x + 6, y + 7, w - 20, 2);
  }
}
/** Wind streaks (the Netherlands): they fly the way the wind blows, faster in a gust. */
let gusts = [];
function drawWind() {
  const w = windNow();
  while (gusts.length < 22) gusts.push({ x: Math.random() * viewW, y: 40 + Math.random() * (VIEW_H - 120), l: 20 + Math.random() * 40 });
  g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1.5;
  for (const s of gusts) {
    if (state === "play" && !dialog) s.x += w * 22 + Math.sign(w || 1) * 1.5;
    if (s.x > viewW + 60) s.x = -60; if (s.x < -60) s.x = viewW + 60;
    g.globalAlpha = Math.min(1, Math.abs(w) * 2.2); g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - Math.sign(w || 1) * s.l, s.y + 1); g.stroke();
  }
  g.globalAlpha = 1;
}
/** Changeable weather (Scotland): about ten seconds of sun, then a breeze, then a shower, and round again.
 *  Only to look at: it does not push you (that is `wind`). Drawn in front of the world, like the wind. */
function weatherPhase() { return Math.floor(L.time / 600) % 3; }
function drawWeather() {
  const phase = weatherPhase();
  if (phase === 0) return;
  g.save();
  g.globalAlpha = phase === 1 ? .35 : .5;
  if (phase === 1) {
    g.strokeStyle = "#f4f8ff"; g.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) {
      const x = (i * 83 + frame * 2.5) % viewW, y = 70 + (i * 47) % (VIEW_H - 120);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 26, y + 2); g.stroke();
    }
  } else {
    g.fillStyle = "rgba(55,70,82,.2)"; g.fillRect(0, 0, viewW, VIEW_H);
    g.strokeStyle = "rgba(225,240,248,.72)"; g.lineWidth = 1;
    for (let i = 0; i < 56; i++) {
      const x = (i * 53 + frame * 1.7) % viewW, y = (i * 71 + frame * 4) % VIEW_H;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 9); g.stroke();
    }
  }
  g.restore();
}
/** Darkness with a circle of light around you (the troll forest, the northern lights night). Finding things makes it bigger. */
/** How far you can see in the dark: more for every thing you find, the task item and every lamp or torch you light. */
function darkRadius() { const dk = L.d.dark; return dk.r + L.keys * (dk.key || 0) + (L.hasQuest || L.questDone ? dk.quest || 0 : 0) + L.switches.filter(s => s.on).length * (dk.lamp || 0); }
/* Darkness (dark levels): a dark layer with holes of light. One around you, and one around every lamp or torch you
   lit: that place stays light when you walk on, so you can see the way back. The layer is drawn at half size on its own
   canvas (DARK_CV) and scaled up: the edges are soft anyway, and it is quick enough for the TV. */
let DARK_CV = null;
const LAMP_LIGHT = 3.6 * TS; // how far a lit lamp lights up its surroundings
function darkLights(cx) {
  const r = darkRadius(), out = [[P.x + P.w / 2 - cx, P.y + P.h / 2, r, .45]];
  for (const s of L.switches) if (s.on && L.d.task && L.d.task.kind === "lights") {
    const lx = s.x + 16 - cx, ly = s.y + TS - 50;
    if (lx > -LAMP_LIGHT && lx < viewW + LAMP_LIGHT) out.push([lx, ly + 10, LAMP_LIGHT * (1 + Math.sin(frame / 9 + s.x) * .03), .35]);
  }
  return out;
}
function drawDark(cx) {
  const k = .5, w = Math.ceil(viewW * k), h = Math.ceil(VIEW_H * k);
  DARK_CV = DARK_CV || document.createElement("canvas");
  if (DARK_CV.width !== w || DARK_CV.height !== h) { DARK_CV.width = w; DARK_CV.height = h; }
  const d = DARK_CV.getContext("2d");
  d.globalCompositeOperation = "source-over"; d.clearRect(0, 0, w, h);
  d.fillStyle = "rgba(4,6,18,.9)"; d.fillRect(0, 0, w, h);
  d.globalCompositeOperation = "destination-out";
  const lights = darkLights(cx);
  for (const [x, y, r, inner] of lights) {
    const gr = d.createRadialGradient(x * k, y * k, r * inner * k, x * k, y * k, r * k);
    gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    d.fillStyle = gr; d.fillRect((x - r) * k, (y - r) * k, 2 * r * k, 2 * r * k);
  }
  g.drawImage(DARK_CV, 0, 0, viewW, VIEW_H);
  // a warm glow around the lit lamps
  const m0 = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
  for (const [x, y, r] of lights.slice(1)) {
    const gl = g.createRadialGradient(x, y, 4, x, y, r * .8);
    gl.addColorStop(0, "rgba(255,190,110,.22)"); gl.addColorStop(1, "rgba(255,190,110,0)");
    g.fillStyle = gl; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.globalCompositeOperation = m0;
}

/** The scenery animals (cows, polar bears, deer, flamingos...) are part of the landscape: they stand on the ground of a
    background layer and move exactly with it, so they never slide against the houses and trees behind them.
    Usually that is the middle layer, with the villages (a layer without a ridge, like the lagoon, gets a flat ground). Where the near layer is a dense forest that would hide them
    (snow, the Alps, the fjord), they stand on the near layer instead: on the strip of snow between its trees and the
    path, in front of the trees. drawBackground() calls this right after that layer. The generator only puts them
    where the path is at its normal height (BG_KINDS in levelgen.js), so the ground behind the path is in view; their
    feet are never lower than BG_CLEAR above the path. They are never left out: some locks count them. Animals you
    can bump into (the enemies, the penguin, the moose) stay on the path. */
const BG_NEAR = new Set(["sneeuw", "bos", "alps", "fjord"]);
const BG_PAR = { mid: .3, near: .5 }, BG_SIZE = { mid: .42, near: .5 }, BG_CLEAR = 12;
function bgAnimalLayer() { return L && L.d && BG_NEAR.has(L.d.scene || L.d.theme) ? "near" : "mid"; }
/** Where a scenery animal is drawn: its x on screen and the y of its feet. */
function bgAnimalAt(x, cx, layer, which) {
  // a layer without a ridge (the lagoon is only water) gets a flat ground at the usual height
  const par = BG_PAR[which], gr = layer._ground || { base: which === "mid" ? 342 : 382, amps: [] };
  // its spot in the layer, chosen so it is on screen when you are at its place in the level
  const lx = x * TS * par + viewW * (1 - par) / 2, sx = lx - cx * par;
  // Its feet stay on the ground of its layer. Only where that ground runs below the normal path (the near layers) are
  // they lifted to just above the path line, so they never sink behind it. Where the path is higher (hills), the path
  // simply covers them, like everything else behind it: they are never pushed up into the air.
  return [sx, Math.min(ridge(gr.base, gr.amps, ((lx % LW) + LW) % LW) + 6, 12 * TS - BG_CLEAR)];
}
function drawBgAnimals(cx, layer, which) {
  if (!L || !L.d || !layer || which !== bgAnimalLayer() || state === "title" || state === "map" || state === "hero" || state === "save") return;
  const size = BG_SIZE[which], theme = L.d.theme;
  for (const [k, x] of L.d.deco) {
    if (!BG_ANIMALS.has(k)) continue;
    const [sx, feet] = bgAnimalAt(x, cx, layer, which);
    if (sx < -60 || sx > viewW + 60) continue;
    const bx = x * TS + 32, gy = groundTop(x) * TS;
    g.save(); g.translate(sx, feet); g.scale(size, size); g.translate(-bx, -gy); g.globalAlpha = .92;
    drawDeco(k, x, theme, true); g.restore();
  }
}

/* ---------- Alles samen ---------- */
function render() {
  // Geen aparte wisbeurt: de achtergrond (lucht of interieur) bedekt altijd het hele canvas.
  g.setTransform(scale, 0, 0, scale, 0, 0);
  g.imageSmoothingEnabled = true;

  if (!L || state === "title" || state === "map" || state === "hero" || state === "save") {
    drawBackground("sneeuw", frame * .6, REGION.scene);
    if (!REGION.summer) drawFlakes();
    vignette();
    return;
  }
  const theme = L.d.theme, cx = Math.round(cam);
  drawBackground(theme, cx);
  g.save(); g.translate(-cx, 0);

  for (const [k, x] of L.d.deco) drawDeco(k, x, theme);
  if (L.exit) drawExit(theme);

  const T = getTex(theme, L.d.spikeKind);
  g.imageSmoothingEnabled = false;
  const x0 = Math.max(0, fl(cx / TS) - 1), x1 = Math.min(L.w - 1, fl((cx + viewW) / TS) + 1);
  for (let ty = 0; ty < ROWS; ty++) for (let tx = x0; tx <= x1; tx++) { const c = L.grid[ty][tx]; if (c !== " " && c !== "G" && c !== "H") drawTile(c, tx * TS, ty * TS, theme, tx, ty, T); }
  g.imageSmoothingEnabled = true;

  if (L.d.water) drawWater(cx);
  if (L.d.ride && L.d.ride.kind === "skates") drawRideIce(x0, x1);
  for (const m of L.movers) drawMover(m);
  if (!L.groundDecor) L.groundDecor = buildGroundDecor();
  for (const d of L.groundDecor) if (d.x > cx - 20 && d.x < cx + viewW + 20) drawGroundDecor(d, theme);

  drawGates(theme);
  if (L.pad && (!L.codeOpen || L.codeFade > 0)) drawPad();
  for (const c of L.checks) drawCheck(c);
  if (L.lantern) drawLantern(L.lantern);
  for (const s of L.signs) drawSign(s);
  for (const c of L.clues) drawClue(c);
  for (const s of L.switches) drawSwitch(s);
  if (L.bell) drawBell(L.bell);

  for (const it of L.items) if (!it.taken) {
    const cx2 = it.x + 16, cy2 = it.y + 16 + Math.sin(frame / 18 + it.x) * 3;
    if (it.type === "coin" || it.type === "heart") {
      g.fillStyle = "rgba(0,0,0,.15)"; g.beginPath(); g.ellipse(cx2, it.y + 31, 7, 2, 0, 0, 7); g.fill();
      const m0 = g.getTransform(); g.translate(cx2, cy2);
      g.fillStyle = grad("glow", () => { const gl = g.createRadialGradient(0, 0, 2, 0, 0, 16); gl.addColorStop(0, "rgba(255,240,170,.5)"); gl.addColorStop(1, "rgba(255,240,170,0)"); return gl; });
      g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); g.setTransform(m0); // exact terug, zonder afrondingsfout
      if (it.type === "coin" && L.d.coin === "lego") drawLegoBrick(cx2, cy2 + 2, LEGO_COLS[Math.floor(hash(it.x) * 5)]);
      else emoji(it.type === "coin" ? L.d.coin : "🍫", cx2, cy2, it.type === "coin" ? 22 : 24);
      if ((frame + it.x) % 120 < 14) sparkle(cx2 + 8, cy2 - 8, 3, frame / 10);
    } else drawItem(it.type === "key" ? L.d.keyType : L.d.questType, cx2, cy2, frame * 16);
  }

  const hat = theme === "sneeuw" ? "xmas" : null, summer = !!L.d.summer;
  const scarf = theme === "sneeuw" || theme === "stad";
  for (const n of L.npcs) {
    const face = P.x > n.x ? 1 : -1;
    shadowAt(n.x + 11, n.y + TS, 11);
    drawPerson(n.who, n.x + 11, n.y + TS, 1, face, 0, false, hat, { t: frame * 16 + n.x * 7, scarf, summer, indoor: theme === "huis" });
    g.font = "600 12px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    const tw = g.measureText(n.who.name).width + 12;
    g.fillStyle = OUT; g.beginPath(); rp(n.x + 11 - tw / 2 - 1.5, n.y - 33.5, tw + 3, 19, 6); g.fill();
    g.fillStyle = "#c9955a"; g.beginPath(); rp(n.x + 11 - tw / 2, n.y - 32, tw, 16, 5); g.fill();
    g.fillStyle = "#3a200c"; g.fillText(n.who.name, n.x + 11, n.y - 23.5);
    const needs = n.quest && !L.questDone;
    if (needs || !n.talked) {
      const by = n.y - 48 + Math.sin(frame / 10) * 2;
      g.fillStyle = OUT; g.beginPath(); g.arc(n.x + 11, by, 9.5, 0, 7); g.fill();
      g.fillStyle = needs ? "#ffd25e" : "#ffffff"; g.beginPath(); g.arc(n.x + 11, by, 8, 0, 7); g.fill();
      g.fillStyle = "#3a200c"; g.font = "700 13px Fredoka, sans-serif"; g.fillText(needs ? "!" : "…", n.x + 11, by + 1);
    }
  }
  for (const e of L.enemies) drawEnemy(e, frame * 16);
  if (L.animal && !L.animal.follow) drawAnimal(L.animal);

  if (!(P.inv > 0 && fl(P.inv / 4) % 2)) {
    const ch = heroChar();
    // On the birthday level the birthday boy wears a party hat.
    const pHat = L.d.birthday === ch.name ? "party" : hat;
    if (P.capsize) {
      // capsized: only the bottom of the canoe shows, rocking in the water (you are underneath it)
      const cx = P.x + P.w / 2, wt = waterTop(fl(cx / TS));
      g.save(); g.translate(cx, wt + 2); g.rotate(Math.sin(frame / 5) * .08); g.scale(1, -1); drawCanoe(0, 0, P.face, 0); g.restore();
      drawWater(cx, [fl(P.x / TS) - 1, fl((P.x + P.w) / TS) + 1]);
    } else if (P.slide) {
      // Op de buik: het staande poppetje een kwartslag gedraaid, hoofd vooruit, buik naar beneden, midden op de plek.
      const cx = P.x + P.w / 2, gy = P.y + P.h;
      shadowAt(cx, gy, 20);
      const m0 = g.getTransform();
      g.translate(cx - P.face * P.h / 2, gy - 9 + Math.sin(frame / 3) * .4); g.rotate(P.face * Math.PI / 2);
      drawPerson(ch, 0, 0, 1, P.face, 0, false, pHat, { t: frame * 16, scarf, summer, indoor: theme === "huis", slide: true });
      g.setTransform(m0);
    } else {
      const rx = P.x + P.w / 2, feet = P.y + P.h, rk = ch.size || 1, rd = P.ride, seat = rd && rideSeat(rd, feet, ch), pedal = P.x / 10;
      if (P.onGround && !P.canoe) shadowAt(rx, feet, rd ? 24 : 11);
      if (rd === "bike") drawBike(rx, feet, P.face, rk, pedal);
      // in a canoe you sit inside it: only draw what sticks out above the edge (no legs under the boat, also mid-jump);
      // on a sledge or a bike you sit too, and the legs are drawn with it
      if (P.canoe) { g.save(); g.beginPath(); g.rect(P.x - 80, P.y - 120, P.w + 160, 120 + P.h * .45 + 4); g.clip(); }
      if (seat) { g.save(); g.beginPath(); g.rect(P.x - 80, seat.clip - 140, P.w + 160, 140); g.clip(); }
      // on skis you glide (no steps); on skates you stride
      drawPerson(ch, rx, seat ? seat.by : feet, 1, P.face, rd === "skates" ? P.anim * .55 : P.anim, !P.onGround, pHat,
        { t: frame * 16, moving: Math.abs(P.vx) > .3 && !P.canoe && (!rd || rd === "skates"), scarf, summer, indoor: theme === "huis" });
      if (P.canoe || seat) g.restore();
      if (rd === "ski") drawSkis(rx, feet, P.face, rk);
      if (rd === "skates") drawSkates(rx, feet, P.face, rk);
      if (rd === "sled") drawSled(rx, feet, P.face, rk, ch.pants);
      if (rd === "bike") drawBikeLegs(rx, feet, P.face, rk, pedal, ch.pants, seat.seat);
      // swimming: the water covers you up to your chest
      if (P.swim) {
        drawWater(cx, [fl(P.x / TS), fl((P.x + P.w) / TS)]);
        // a small ripple around the swimmer, only as wide as the swimmer
        const wt = waterTop(fl((P.x + P.w / 2) / TS));
        g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(P.x + P.w / 2, wt + 1 + Math.sin(frame / 8), P.w * (P.canoe ? 1.4 : .75), 2.2, 0, 0, 7); g.fill();
      }
      // in the river you sit in a canoe, also while you jump with it over a rock
      if (P.canoe) drawCanoe(P.x + P.w / 2, P.y + P.h * .45 + 2, P.face, P.swim ? Math.abs(P.vx) + 1 : 0);
    }
  }
  // a found animal walks with you, drawn in front so you always see it
  if (L.animal && L.animal.follow) drawAnimal(L.animal);

  if (!dialog) {
    const near = nearest(L.npcs) || nearest(L.switches.filter(s => !s.on)) || (L.bell && !L.questDone && nearest([L.bell])) || (L.animal && !L.animal.follow && !L.animal.home && nearest([L.animal], 48))
      || nearest(L.signs) || nearest(L.clues) || (L.lantern && Math.abs(L.lantern.x + 16 - (P.x + P.w / 2)) < 44 ? L.lantern : null)
      || (L.pad && !L.codeOpen && Math.abs(L.pad.x + 16 - (P.x + P.w / 2)) < 50 ? L.pad : null);
    if (near) {
      const label = GP.on ? "□" : isTouch ? "💬" : "E", bx = P.x + P.w / 2, byy = P.y - 22 + Math.sin(frame / 8) * 1.5;
      g.fillStyle = OUT; g.beginPath(); rp(bx - 13.5, byy - 11.5, 27, 23, 7); g.fill();
      g.fillStyle = "#ffd25e"; g.beginPath(); rp(bx - 12, byy - 10, 24, 20, 6); g.fill();
      g.fillStyle = "#2a1404"; g.font = "700 13px Fredoka, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(label, bx, byy + 1);
    }
  }
  for (const p of particles) { g.globalAlpha = Math.min(1, p.life / 20); g.fillStyle = p.c; g.fillRect(p.x, p.y, p.s, p.s); }
  g.globalAlpha = 1;
  g.textBaseline = "middle"; g.textAlign = "center"; g.font = "700 15px Fredoka, sans-serif"; g.lineJoin = "round";
  for (const p of popups) { g.globalAlpha = Math.min(1, p.life / 20); g.lineWidth = 4; g.strokeStyle = "rgba(20,10,20,.8)"; g.strokeText(p.text, p.x, p.y); g.fillStyle = p.color; g.fillText(p.text, p.x, p.y); }
  g.globalAlpha = 1;
  g.restore();
  if (L.d.dark) drawDark(cx);
  if (L.d.wind) drawWind();
  if (L.d.weather) drawWeather();
  drawAmbient(theme);
  if (theme === "sneeuw" || theme === "stad") drawFlakes();
  vignette();
  if (L.timer > 0) drawGateTimer();
}
/** After ringing the bell: a big countdown at the top of the screen, with a bar that runs out and an arrow towards the gate.
    Gold while there is time, red and pulsing in the last two seconds. */
function drawGateTimer() {
  const total = Math.round((L.d.task.secs || 5) * 60), left = Math.max(0, L.timer), secs = left / 60, hurry = secs <= 2;
  const w = 236, h = 46, x = viewW / 2 - w / 2, y = 54, pulse = hurry ? 1 + Math.sin(frame / 3) * .04 : 1;
  const gx = L.d.gate[0] * TS + 16, dir = gx > P.x + P.w / 2 ? "→" : "←";
  g.save(); g.translate(viewW / 2, y + h / 2); g.scale(pulse, pulse); g.translate(-viewW / 2, -(y + h / 2));
  g.fillStyle = "rgba(20,10,4,.78)"; g.strokeStyle = hurry ? "#ff6a5a" : "#ffd25e"; g.lineWidth = 2.5;
  g.beginPath(); rp(x, y, w, h, 12); g.fill(); g.stroke();
  // the bar that runs out
  g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); rp(x + 10, y + h - 13, w - 20, 6, 3); g.fill();
  g.fillStyle = hurry ? "#ff6a5a" : "#ffd25e"; g.beginPath(); rp(x + 10, y + h - 13, Math.max(6, (w - 20) * left / total), 6, 3); g.fill();
  g.textBaseline = "middle"; g.textAlign = "left"; g.font = "700 15px Fredoka, sans-serif"; g.fillStyle = "#fff";
  emoji("🔔", x + 22, y + 17, 18);
  g.fillStyle = "#fff"; g.fillText(T("Gate open", "Hek open") + "  " + dir, x + 38, y + 17);
  g.textAlign = "right"; g.font = "700 20px Fredoka, sans-serif"; g.fillStyle = hurry ? "#ff8a7a" : "#ffd25e";
  g.fillText(secs.toFixed(1) + " s", x + w - 12, y + 17);
  g.restore();
}
