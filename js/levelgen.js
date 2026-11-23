"use strict";
// The level generator and the days made with it (days 2, 3, 6, 7 and 8).
const RAIL_CANOPY_HEIGHT = 160;
/* =====================================================================
   LEVEL GENERATOR (for the days that are not built by hand)
   ===================================================================== */
/** What the sign at the start of a ride says (genLevel(): `ride`). */
const RIDE_SIGNS = {
  ski: [T("Skis on! The slope takes you down by itself. → goes faster, ← slows you down, and jump over the logs.", "Ski's aan! De helling neemt je vanzelf mee naar beneden. → gaat sneller, ← remt af, en spring over de boomstammen."),
    T("Bend your knees at the bumps. And don't look at the goats.", "Door je knieën bij de bulten. En niet naar de geiten kijken.")],
  sled: [T("Onto the sledge! Down the run you go, faster and faster. ← brakes, and jump over the snow banks.", "Op de slee! Je gaat de baan af, steeds sneller. ← remt, en spring over de sneeuwwallen."),
    T("Steering a sledge is mostly hoping for the best.", "Een slee sturen is vooral hopen op het beste.")],
  skates: [T("Skates on! On the ice you glide a long way. It takes a while to get going, and a while to stop.", "Schaatsen aan! Op het ijs glij je een heel eind. Op gang komen duurt even, en stoppen ook."),
    T("Jump over the snow banks. Arms on your back, like a real Dutch skater.", "Spring over de sneeuwhopen. Handen op je rug, als een echte schaatser.")],
  bike: [T("A white bike! Pedal with ← and →, and jump over the obstacles.", "Een witte fiets! Trap met ← en → en spring over de hindernissen."),
    T("Hold ↓, 💬 or X/B on a controller to duck under branches.", "Houd ↓, 💬 of X/B op een controller vast om onder takken te bukken."),
    T("Leave it at the rack at the end, for the next one.", "Zet hem aan het eind terug in het rek, voor de volgende.")],
  kicksled: [T("One foot on the kicksled, one foot to push. Hold → to go and jump over the obstacles.", "Eén voet op de schopslee, met de andere afzetten. Houd → vast en spring over de hindernissen."),
    T("Kick, glide, kick, glide!", "Afzetten, glijden, afzetten, glijden!")],
  husky: [T("A husky team! Hold → to follow the trail, ← to slow down or go back.", "Een hondenslee! Houd → vast om het spoor te volgen, ← om te remmen of terug te gaan."),
    T("Jump together over the snow banks. The dogs are in front, so jump in good time!", "Spring samen over de sneeuwhopen. De honden lopen voorop, dus spring op tijd!")],
  railbike: [T("A rail bike! Pedal with ← and →. The bike stays on the rails.", "Een spoorfiets! Trap met ← en →. De fiets blijft op de rails."),
    T("Jump over the low ribbons; hold ↓, 💬 or X/B on a controller to duck under branches.", "Spring over de lage linten; houd ↓, 💬 of X/B op een controller vast om onder takken te bukken."),
    T("Some branches are high enough for a small rider to pass without ducking.", "Onder sommige takken passen kleine rijders zonder te bukken."),
    T("A thick curtain of leaves is too high to jump over: duck underneath it.", "Over een dicht bladergordijn kun je niet springen: buk eronderdoor."),
    T("Hit one and you lose a heart and go back to the last flag.", "Raak je er een, dan verlies je een hartje en ga je terug naar de laatste vlag.")]
};
function genLevel(o) {
  // Options that make a region play differently (see AGENTS.md, "Region gameplay"):
  //   hills: [low, high] – the ground goes up and down between those rows (12 = normal ground, 9 = high), like a mountain.
  //   movers: "floe" | "gondola" | "boat" – wide gaps (too wide to jump) with something that carries you across.
  //     A gondola rides on a slanted cable: up the mountain (2 or 3 rows), or down where the ground is already high.
  //   islands: n – with movers "boat": n boat crossings spread over the level (Venice: hop from island to island).
  //   river: { len } – a stretch of river to canoe down, near the start (the Ardèche): you sit in a canoe, the current
  //     carries you, rocks stick out of the water to jump over, and the river drops down two small waterfalls,
  //     each followed by rapids. Gives the level a `river` ({ x0, x1, surf, rapids }) and `rocks`.
  //   ride: { kind, len } – a stretch near the start where you don't walk but ride: "ski" or "sled" down a slope (the
  //     ground starts at row 9 and drops a row three times), "skates", "bike", "kicksled", "husky" or "railbike" on flat ground.
  //     Small blocks and tall rocks to jump over, with coins above them; one of the three things hangs above it.
  //     Gives the level a `ride` ({ kind, x0, x1 }); game.js changes how you move there, world.js draws what you ride.
  //   ice, dark, water, interior – used by the game and the drawing code, not by the generator.
  // The gate halfway (see AGENTS.md, "Gates and locks"): quest (bring something), or task: { kind: "levers" | "lights" |
  //   "timer" | "follow", ... }, or neither (no gate). The lock at the end: code.kind "symbols" (default), "count",
  //   "melody", "colours", "arrows", "word" or "clock".
  const R = rng(o.seed), w = o.w;
  const gated = !!(o.quest || o.task), gateX = gated ? Math.round(w * .6) : -99, codeX = o.code ? w - 14 : -99;
  const ground = [], plats = [], blocks = [], spikes = [], ents = [], slots = [], bad = new Set(), used = new Set();
  const coin = (x, y) => { if (o.coins !== false) ents.push(["coin", x, y]); };
  let cur = 0, x = 12, towerDone = !o.quest, gy = 12, ferries = o.movers ? (o.islands || 1) : 0, fi = 0, lofts = 0, riverDone = !o.river, river = null, rideDone = !o.ride, ride = null;
  const rocks = [], riverDeco = [];
  const ladderCols = [], ladderSigns = [];
  const [hLow, hHigh] = o.hills || [12, 12];
  const limit = (o.code ? codeX : w - 8) - 10;
  while (x < limit) {
    if (gated && x > gateX - 9 && x < gateX + 5) { x = gateX + 5; continue; }
    let type;
    if (!riverDone) type = "river";
    else if (!rideDone) type = "ride";
    else if (!towerDone && x > w * .3) type = "tower";
    // islands (Venice): several boat crossings spread over the level, so you hop from island to island
    else if (fi < ferries && x > w * (o.islands ? .1 + .8 * fi / ferries : .12)) type = "ferry";
    // ladders: a loft too high to jump onto, with a ladder up (twice per level: before and after the gate)
    else if (o.ladders && lofts < 2 && x > w * (lofts ? .66 : .2)) type = "loft";
    else { const r = R(); type = r < .22 && o.pits ? "pit" : r < .3 && o.movers ? "ferry" : r < .45 ? "plat2" : r < .6 ? "steps" : r < .72 ? "tower" : "run"; }
    const width = { pit: 8, plat2: 10, steps: 9, tower: 10, run: 11, ferry: 11, loft: 10, river: o.river ? o.river.len + 6 : 0, ride: o.ride ? o.ride.len + 12 : 0 }[type];
    if (x + width > limit || (gated && x <= gateX - 9 && x + width > gateX - 9)) { x += 3; continue; }
    // Hills: before a piece the ground may go up (at most 2 rows, so you can always jump it) or down.
    if (o.hills && type !== "ferry" && type !== "river" && type !== "ride") {
      let ny = gy + [-2, -1, 0, 1, 2][Math.floor(R() * 5)];
      ny = Math.max(hHigh, Math.min(hLow, ny));
      if (ny !== gy) { ground.push([cur, x, gy]); cur = x + 1; gy = ny; bad.add(x); bad.add(x + 1); }
    }
    const d = gy - 12; // everything in a piece is placed relative to the ground here
    if (type === "river") {
      // The river: first a bank that steps up to row 10, so the river can drop down two small waterfalls (10 → 11 → 12).
      if (gy > 10) { ground.push([cur, x, gy]); cur = x + 1; bad.add(x); bad.add(x + 1); gy = 10; }
      const len = o.river.len, x0 = x + 3, x1 = x0 + len - 1, third = Math.floor(len / 3);
      ground.push([cur, x0 - 1, gy]); riverDeco.push(x0 - 3);
      const surf = [], rapids = [];
      for (let i = 0; i < len; i++) { surf.push(gy + (i >= third ? 1 : 0) + (i >= 2 * third ? 1 : 0)); bad.add(x0 + i); }
      // rapids right below each waterfall: the current is stronger there
      rapids.push([x0 + third, x0 + third + 7], [x0 + 2 * third, x0 + 2 * third + 7]);
      // rocks: never right at a waterfall or a bank, now low, then tall. They are spread as on a river of 60 tiles
      // (about every 6 to 9 tiles there): a longer river has more water between the rocks, not more rocks.
      const k = len / 60;
      for (let j = 6; j < 56; j += 6 + Math.floor(R() * 4)) {
        if (Math.abs(j - 20) < 3 || Math.abs(j - 40) < 3) continue;
        const i = Math.round(j * k), r = surf[i], tall = R() < .4;
        rocks.push([x0 + i, tall ? r - 1 : r, tall ? 2 : 1]);
        // peaches in an arc over the rock, to catch while you jump
        [-1, 0, 1].forEach(dd => coin(x0 + i + dd, r - (tall ? 4 : 3) + (dd ? 1 : 0)));
      }
      // one of the things to find floats above the river, halfway down
      slots.push([x0 + Math.floor(len / 2) + 3, surf[Math.floor(len / 2) + 3] - 3, "river"]);
      river = { x0, x1, surf, rapids };
      // the far bank, at the level of the lowest stretch
      gy = surf[len - 1]; cur = x1 + 1; bad.add(x1 + 1); bad.add(x1 + 2); riverDeco.push(x1 + 2);
      riverDone = true;
    } else if (type === "ride") {
      // Down a slope (skis, a sledge): first up to row 9, at most 2 rows a step, then down a row three times to 12.
      const kind = o.ride.kind, len = o.ride.len, down = kind === "ski" || kind === "sled";
      let sx = x;
      if (down) while (gy > 9) { ground.push([cur, sx, gy]); cur = sx + 1; bad.add(sx); bad.add(sx + 1); gy = Math.max(9, gy - 2); sx += 2; }
      const x0 = sx + 3, x1 = x0 + len - 1, drops = down ? 12 - gy : 0, top = gy;
      ground.push([cur, x0 - 1, gy]);
      if (kind === "railbike") bad.add(x0 - 1);
      const rowAt = i => top + Math.min(drops, Math.floor(i * (drops + 1) / len));
      // the stretch itself, a piece of ground per row
      for (let i = 0, a = 0; i <= len; i++) if (i === len || rowAt(i) !== rowAt(a)) { ground.push([x0 + a, x0 + i - 1, rowAt(a)]); a = i; }
      for (let i = 0; i < len; i++) bad.add(x0 + i);
      // Other rides alternate small blocks and tall rocks, never right at a drop or at either end.
      const isDrop = i => i > 0 && rowAt(i) !== rowAt(i - 1);
      const hazards = [];
      if (kind === "railbike") {
        for (let i = 7; i < len - 5; i += 9 + Math.floor(R() * 6)) {
          if (R() < .5) {
            hazards.push({ x: x0 + i, kind: "ribbon" });
            [-1, 0, 1].forEach(dd => coin(x0 + i + dd, top - 4 - (dd ? 0 : 1)));
          } else {
            const choice = R();
            hazards.push({ x: x0 + i, kind: "branch", clearance: choice < .5 ? 55 : 58, canopy: choice < .25 || choice >= .75 });
          }
        }
      } else if (kind === "bike") {
        let bag = [];
        for (let i = 9; i < len - 8; i += 12 + Math.floor(R() * 8)) {
          if (!bag.length) {
            bag = ["block", "rock", "branch"];
            for (let j = bag.length - 1; j > 0; j--) { const k = Math.floor(R() * (j + 1)); [bag[j], bag[k]] = [bag[k], bag[j]]; }
          }
          const obstacle = bag.pop(), r = rowAt(i);
          if (obstacle === "branch") {
            const choice = R();
            hazards.push({ x: x0 + i, kind: "branch", clearance: choice < .5 ? 64 : 67, canopy: choice < .25 || choice >= .75 });
          } else {
            const tall = obstacle === "rock";
            if (tall) rocks.push([x0 + i, r - 2, 2]);
            else blocks.push([x0 + i, r - 1, 1]);
            [-1, 0, 1].forEach(dd => coin(x0 + i + dd, r - (tall ? 4 : 3) - (dd ? 0 : 1)));
          }
        }
      } else if (kind === "husky") {
        for (let i = 12; i < len - 10; i += 16 + Math.floor(R() * 5)) {
          blocks.push([x0 + i, top - 1, 1]);
          [-1, 0, 1].forEach(dd => coin(x0 + i + dd, top - 3 - (dd ? 0 : 1)));
        }
      } else {
        let obstacle = 0;
        for (let i = 7; i < len - 5; i += 7 + Math.floor(R() * 4)) {
          if ([-2, -1, 0, 1, 2].some(dd => isDrop(i + dd))) continue;
          const r = rowAt(i), tall = ++obstacle % 2 === 0;
          if (tall) rocks.push([x0 + i, r - 2, 2]);
          else blocks.push([x0 + i, r - 1, 1]);
          [-1, 0, 1].forEach(dd => coin(x0 + i + dd, r - (tall ? 4 : 3) - (dd ? 0 : 1)));
        }
      }
      // one of the things to find hangs above the ride, halfway (marked like the river: placed first, always one)
      if (kind !== "railbike") {
        const mid = Math.floor(len / 2) + 4;
        slots.push([x0 + mid, rowAt(mid) - 3, "river"]);
      }
      ride = { kind, x0, x1, ...(["railbike", "bike"].includes(kind) ? { hazards, row: top } : {}) };
      gy = rowAt(len - 1); cur = x1 + 1; bad.add(x1 + 1); bad.add(x1 + 2);
      rideDone = true;
      x = x1 + 3; continue;
    } else if (type === "pit") {
      const gw = R() < .5 ? 2 : 3;
      ground.push([cur, x + 1, gy]);
      for (let i = 0; i < gw; i++) { bad.add(x + 2 + i); coin(x + 2 + i, (i === 0 || i === gw - 1 ? 9 : 8) + d); }
      bad.add(x + 1); bad.add(x + 2 + gw);
      cur = x + 2 + gw;
    } else if (type === "ferry") {
      // a gap of 7 tiles: too wide to jump, so you ride across on an ice floe, a gondola or a boat
      // A boat or an ice floe floats on the water (row 12): on high ground the bank first steps down to the water.
      if (o.movers !== "gondola" && gy < 12) { ground.push([cur, x, gy]); cur = x + 1; bad.add(x); bad.add(x + 1); gy = 12; }
      ground.push([cur, x + 1, gy]);
      for (let i = 0; i < 7; i++) bad.add(x + 2 + i);
      bad.add(x + 1); bad.add(x + 9);
      let rise = 0;
      if (o.movers === "gondola") { const up = gy - hHigh, down = hLow - gy; rise = up >= 2 ? -Math.min(3, up) : down >= 2 ? Math.min(3, down) : 0; }
      ents.push(["mover", x + 2, gy, { range: 5, n: 2, rise }]);
      [3, 5, 7].forEach(i => coin(x + i, 8 + (gy - 12) + Math.round(rise * (i - 2) / 6)));
      cur = x + 9; fi++;
      gy += rise;
    } else if (type === "loft") {
      // a loft (a plank 6 rows up, too high to jump onto) with a ladder from the floor; one of the things may be up there
      const top = 6 + d;
      plats.push([x + 2, top, 6]); ladderCols.push([x + 2, top + 1, 11 + d]); slots.push([x + 6, top - 1]);
      [3, 4, 5, 7].forEach(i => coin(x + i, top - 1));
      bad.add(x + 2); if (!lofts) ladderSigns.push(x);
      lofts++;
    } else if (type === "plat2") {
      plats.push([x + 1, 9 + d, 3], [x + 5, 7 + d, 3]); slots.push([x + 2, 8 + d], [x + 6, 6 + d]);
      coin(x + 1, 10 + d); coin(x + 3, 10 + d); coin(x + 7, 5 + d);
    } else if (type === "steps") {
      blocks.push([x + 1, 11 + d, 1], [x + 2, 10 + d, 2], [x + 3, 9 + d, 3]); [1, 2, 3].forEach(i => bad.add(x + i));
      plats.push([x + 5, 7 + d, 3]); slots.push([x + 6, 6 + d]);
      coin(x + 1, 10 + d); coin(x + 2, 9 + d); coin(x + 3, 8 + d);
    } else if (type === "tower") {
      plats.push([x + 1, 9 + d, 2], [x + 4, 7 + d, 2], [x + 7, 5 + d, 2]); slots.push([x + 4, 6 + d], [x + 7, 4 + d, "high"]);
      coin(x + 1, 8 + d); coin(x + 2, 8 + d); towerDone = true;
    } else {
      if (o.enemies) ents.push(["enemy", x + 4, 11 + d]);
      for (let i = 2; i <= 6; i++) coin(x + i, 10 + d);
      if (o.spikes) { spikes.push([x + 8, 11 + d, 2]); bad.add(x + 8); bad.add(x + 9); }
    }
    x += width;
  }
  ground.push([cur, w - 1, gy]);
  // The ground row of every column (ROWS where there is no ground: a pit or a gap).
  const topAt = Array(w).fill(ROWS_GEN);
  for (const [a, b, t] of ground) for (let c = a; c <= b; c++) topAt[c] = Math.min(topAt[c], t);
  const yAt = c => (topAt[c] < ROWS_GEN ? topAt[c] : 12) - 1;
  const free = (t, lo = 3, hi = w - 3) => { t = Math.round(t); for (let dd = 0; dd < 80; dd++) for (const c of [t + dd, t - dd]) if (c >= lo && c <= hi && !bad.has(c) && !used.has(c) && topAt[c] < ROWS_GEN) { used.add(c); return c; } return t; };
  [gateX, gateX - 1, gateX + 1, codeX, codeX - 1, codeX + 1, w - 6].forEach(c => used.add(c));
  // Levers, lamps, the bell, the animal and clues get some room, so nobody stands right next to them.
  const room = c => { for (let d = -2; d <= 2; d++) used.add(c + d); return c; };

  if (o.intro) { const c = free(5); ents.push(["sign", c, yAt(c), o.intro]); }
  ladderSigns.forEach(lx => { const c = free(lx - 2, lx - 6, lx); ents.push(["sign", c, yAt(c), [T("A ladder! Hold ↑ (or jump) to climb up, and ↓ (or 💬) to climb down.", "Een ladder! Houd ↑ (of springen) ingedrukt om naar boven te klimmen, en ↓ (of 💬) om naar beneden te gaan."),
    T("Standing on a plank? Press ↓ to drop down through it.", "Sta je op een plank? Druk ↓ om erdoorheen naar beneden te zakken.")]]); });
  let gate = null, code = null;
  if (gated) {
    gate = [gateX, 2, yAt(gateX)];
    used.add(gateX - 3); ents.push(["npc", gateX - 3, yAt(gateX - 3), o.quest ? { quest: o.quest } : { task: o.task }]);
    ents.push(["check", gateX + 2, yAt(gateX + 2)]);
    const k = o.task && o.task.kind;
    if (o.quest) {
      const pre = slots.filter(s => s[0] < gateX - 6 && s[2] !== "river").sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      const q = pre[0]; slots.splice(slots.indexOf(q), 1); ents.push(["quest", q[0], q[1]]);
    } else if (k === "levers" || k === "lights") {
      // three levers or lamps spread over the way to the gate
      [.3, .6, .9].forEach((f, i) => { const c = free(8 + (gateX - 14) * f, 6, gateX - 5); ents.push(["switch", room(c), yAt(c), { i }]); });
    } else if (k === "timer") {
      // A bell well before the gate: ring it, and the gate stays open for a few seconds. Far enough that you have to
      // hurry: walking there takes about three quarters of the time (running gives some room). Never with a boat,
      // a floe or a gondola in between (you can't hurry a boat), nor the river.
      const secs = o.task.secs || 5, far = Math.round(secs * 60 * 4.4 / TS_GEN * .72);
      const after = Math.max(6, ...ents.filter(e => e[0] === "mover" && e[1] < gateX).map(e => e[1] + 9), river ? river.x1 + 3 : 0, ride ? ride.x1 + 3 : 0);
      const c = free(Math.max(after + 2, gateX - far), after + 2, gateX - 6); ents.push(["bell", room(c), yAt(c)]);
    } else if (k === "follow") {
      const c = free(gateX * .35, 6, gateX - 8); ents.push(["animal", room(c), yAt(c)]);
    }
  }
  const keysNeeded = o.keysNeeded ?? 3;
  if (keysNeeded) {
    while (slots.length < 3) { const fx = free(w * (.2 + slots.length * .25)), fy = yAt(fx) - 2; plats.push([fx, fy, 3]); slots.push([fx + 1, fy - 1]); }
    // With a river, one of the three always floats above it; the other two are spread over the rest of the level.
    const rs = slots.find(s => s[2] === "river");
    if (rs) { slots.splice(slots.indexOf(rs), 1); ents.push(["key", rs[0], rs[1]]); }
    slots.sort((a, b) => a[0] - b[0]);
    const n = rs ? 2 : 3;
    for (let i = 0; i < n; i++) { const s = slots[Math.floor(slots.length * (i + .5) / n)]; ents.push(["key", s[0], s[1]]); }
  }
  // A river gets a sign at the start and a flag right after the far bank, so a capsize later on never sends you back upstream.
  if (river) {
    const c = free(river.x0 - 5, 3, river.x0 - 2);
    ents.push(["sign", c, yAt(c), [T("Into the canoe! The river carries you along. Paddle with ← and →, and jump over the rocks: hit one and you capsize!", "In de kano! De rivier neemt je mee. Peddel met ← en →, en spring over de rotsen: raak je er een, dan sla je om!"),
      T("Two small waterfalls and some rapids on the way. Hold on to your hat!", "Onderweg twee kleine watervallen en een paar stroomversnellingen. Houd je hoed vast!")]]);
    const f = free(river.x1 + 5, river.x1 + 3); ents.push(["check", f, yAt(f)]);
  } else if (ride) {
    // a ride gets a sign at the start that says how it works, and a flag where you get off again
    const c = free(ride.x0 - 6, 3, ride.x0 - 2);
    const lines = ride.kind === "railbike" || ride.kind === "husky" ? RIDE_SIGNS[ride.kind] : [...RIDE_SIGNS[ride.kind],
      T("Small bumps stop you. Hit a tall rock and you fall: back to the last flag!", "Kleine hindernissen stoppen je. Raak je een hoge rots, dan val je: terug naar de laatste vlag!")];
    ents.push(["sign", c, yAt(c), lines]);
    if (ride.kind === "railbike" || ride.kind === "bike" || ride.kind === "husky") {
      const start = free(ride.x0 - 2, 3, ride.x0 - 1); ents.push(["check", start, yAt(start)]);
    }
    const f = free(ride.x1 + 5, ride.x1 + 3); ents.push(["check", f, yAt(f)]);
  } else { const c = free(w * .3); ents.push(["check", c, yAt(c)]); }
  if (!gated) { const c = free(w * .62); ents.push(["check", c, yAt(c)]); } // a gate already has a flag right behind it
  (o.npcs || []).forEach((lines, i) => { const c = free(w * [.2, .46, .8][i]); ents.push(["npc", c, yAt(c), { lines }]); });
  (o.signs || []).forEach(([f, lines]) => { const c = free(w * f); ents.push(["sign", c, yAt(c), lines]); });
  if (o.code) {
    const kind = o.code.kind || "symbols", ans = [...o.code.answer];
    code = { x: codeX, y1: 2, y2: yAt(codeX), pad: codeX - 2, answer: o.code.answer, title: o.code.title, kind, keys: lockKeys(o.code), riddle: o.code.riddle, count: o.code.count, questions: o.code.questions };
    used.add(codeX - 2);
    if (kind === "symbols") {
      const syms = o.code.syms;
      code.riddle = o.code.questions
        ? T(`Four symbols: ${syms.join("  ")}. Solve the questions on the signs for their digits.`, `Vier symbolen: ${syms.join("  ")}. Los de vragen op de bordjes op voor de cijfers.`)
        : T(`Four symbols: ${syms.join("  ")}. Signs along the way tell you which digit goes with which symbol.`,
          `Vier symbolen: ${syms.join("  ")}. Onderweg staan bordjes die vertellen welk cijfer bij welk symbool hoort.`);
      [.14, .37, .56, .74].forEach((f, i) => {
        const k = [2, 0, 3, 1][i], c = free(w * f);
        const clue = o.code.questions ? `${syms[k]}: ${o.code.questions[k]}` : T(`Someone scratched something on this sign: ${syms[k]} = ${ans[k]}`, `Op dit bordje is iets gekrast: ${syms[k]} = ${ans[k]}`);
        ents.push(["sign", c, yAt(c), [clue, o.code.flavor[k]]]);
      });
    } else if (kind === "melody" || kind === "colours" || kind === "arrows" || kind === "word") {
      // numbered clues along the way: bells, coloured lamps, signposts with an arrow, or carved letters
      const n = ans.length, end = (codeX - 4) / w;
      ans.forEach((v, i) => { const c = free(w * (.12 + i * (end - .16) / (n - 1))); ents.push(["clue", room(c), yAt(c), { kind, i, n, v, look: o.code.look }]); });
    } else if (kind === "clock") {
      (o.code.signs || []).forEach(([f, lines]) => { const c = free(w * f); ents.push(["sign", c, yAt(c), lines]); });
    }
  }
  let lanternX = null;
  if (o.lantern) { const lx = free(w * .7); lanternX = lx; ents.push(["lantern", lx, yAt(lx)]); for (let dd = -3; dd <= 3; dd++) used.add(lx + dd); }
  ents.push(["exit", w - 6, yAt(w - 6)]);
  if (o.enemyExtra) o.enemyExtra.forEach(f => { const c = free(w * f); ents.push(["enemy", c, yAt(c)]); });
  // moose (Småland): big friendly obstacles on flat ground; their back is a springboard
  (o.moose || []).forEach(f => { let c = free(w * f); for (let k = 0; k < 4 && [0, 1, 2].some(d => topAt[c + d] !== topAt[c]); k++) c = free(w * f + 3 * (k + 1)); ents.push(["moose", c, yAt(c)]); });

  // A counting lock: things to count are placed in exact numbers, and never as random decoration.
  const counted = o.code && o.code.kind === "count" ? o.code.count.map(c => c[0]) : [];
  const kinds = o.decoKinds.filter(k => !counted.includes(k));
  const deco = [];
  // Does a decoration fit here? All of it on the same flat ground: not over a pit, a cliff, a step of the hills, the river,
  // steps or spikes, and not in the gate or the code door.
  const fits = (k, c) => {
    const [l, r] = DECO_FOOT[k] || [0, 0], t = topAt[c];
    if (c == null || t >= ROWS_GEN) return false;
    // scenery animals stand in the background, behind the path: only where the path is at its normal height (row 12),
    // so the background ground behind it is always in view (drawBgAnimals() in world.js)
    if (BG_KINDS.has(k) && t !== 12) return false;
    for (let i = c + l; i <= c + r; i++) if (i < 1 || i >= w - 1 || topAt[i] !== t || bad.has(i) || Math.abs(i - gateX) < 3 || Math.abs(i - codeX) < 4) return false;
    return true;
  };
  // the nearest place where it fits (at most `reach` tiles away), or null
  const fitNear = (k, c, reach = 3) => { for (let d = 0; d <= reach; d++) for (const t of [c + d, c - d]) if (fits(k, t)) return t; return null; };
  for (let dx = 3; dx < w - 8; dx += 5 + Math.floor(R() * 7)) {
    if (bad.has(dx) || topAt[dx] >= ROWS_GEN || Math.abs(dx - gateX) < 4 || Math.abs(dx - codeX) < 5) continue;
    if (o.lantern && o.lanternDeco === "church" && lanternX != null && dx > lanternX - 7 && dx < lanternX + 6) continue;
    const k = kinds.length ? kinds[Math.floor(R() * kinds.length)] : "pine", c = fitNear(k, dx);
    if (c != null && !deco.some(([k2, c2]) => c2 + (DECO_FOOT[k2] || [0, 0])[1] >= c + (DECO_FOOT[k] || [0, 0])[0] && c2 + (DECO_FOOT[k2] || [0, 0])[0] <= c + (DECO_FOOT[k] || [0, 0])[1])) deco.push([k, c]);
  }
  if (counted.length) {
    const ns = [...o.code.answer].map(Number), list = [];
    counted.forEach((k, i) => { for (let j = 0; j < ns[i]; j++) list.push(k); });
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    const cols = [];
    for (let c = 6; c < codeX - 4; c++) if (!bad.has(c) && topAt[c] < ROWS_GEN && Math.abs(c - gateX) >= 4) cols.push(c);
    // spread evenly, each where it fits and not on top of another counted thing
    const picks = [];
    list.forEach((k, i) => {
      const want = cols[Math.floor((i + .5) * cols.length / list.length)];
      let c = null;
      for (let d = 0; d <= 60 && c == null; d++) for (const t of [want + d, want - d]) if (fits(k, t) && !picks.some(p => Math.abs(p - t) < 3)) { c = t; break; }
      picks.push(c ?? want);
    });
    for (let i = deco.length - 1; i >= 0; i--) if (picks.some(c => Math.abs(c - deco[i][1]) < 4)) deco.splice(i, 1);
    list.forEach((k, i) => deco.push([k, picks[i]]));
    code.riddle = o.code.riddle || T(`How many did you see along the way? ${o.code.count.map(c => c[1]).join(", ")}: one digit each, in that order.`,
      `Hoeveel zag je onderweg? ${o.code.count.map(c => c[1]).join(", ")}: elk één cijfer, in die volgorde.`);
  }
  if (o.lantern) { const l = ents.find(e => e[0] === "lantern"); deco.push(o.lanternDeco === "church" ? ["church", l[1] - 3] : ["bench", l[1] + 1]); }
  (o.decoExtra || []).filter(([k]) => !counted.includes(k)).forEach(([k, f]) => { const c = Math.round(w * f); deco.push([k, fitNear(k, c, 8) ?? c]); });
  riverDeco.forEach(c => deco.push(["canoe", fitNear("canoe", c, 4) ?? c]));
  return Object.assign({}, o, { ground, plats, blocks, spikes, gate, code, ents, deco, keysNeeded, ladderCols, river, rocks, ride });
}
/** The keys on the lock for each kind of lock: digits, notes, colours, arrows or letters. */
const NOTES = [["1", "do", 523, "#e8423a"], ["2", "re", 587, "#f2a03a"], ["3", "mi", 659, "#f5d23a"], ["4", "sol", 784, "#4cb860"], ["5", "la", 880, "#4a8ae8"]];
const COLOURS = { R: ["#e8423a", T("red", "rood")], O: ["#f2903a", T("orange", "oranje")], Y: ["#f5d23a", T("yellow", "geel")], G: ["#4cb860", T("green", "groen")],
  B: ["#3a7ae8", T("blue", "blauw")], P: ["#9a5ad8", T("purple", "paars")], W: ["#f4f4f0", T("white", "wit")], K: ["#ff7aa8", T("pink", "roze")] };
const ARROWS = { "↑": T("up", "omhoog"), "→": T("right", "rechts"), "↓": T("down", "omlaag"), "←": T("left", "links") };
function lockKeys(c) {
  const k = c.kind || "symbols";
  if (k === "melody") return NOTES.map(([v, name, f, col]) => ({ v, name, f, col }));
  if (k === "colours") return [...(c.palette || "RYGBWP")].map(v => ({ v, name: COLOURS[v][1], col: COLOURS[v][0] }));
  if (k === "arrows") return Object.entries(ARROWS).map(([v, name]) => ({ v, name }));
  if (k === "word") return [...new Set([...c.answer, ...(c.extra || "")])].sort().map(v => ({ v, name: v }));
  return [..."1234567890"].map(v => ({ v, name: v }));
}
/** How far each decoration reaches over the ground, in tiles left and right of its column (measured from drawDeco();
    a kind that is not listed stands on one tile). Wide things (houses, stalls, cars) need flat ground under all of it,
    so nothing hangs over a cliff or floats over a pit. */
const DECO_FOOT = {
  bagpipes: [0, 1], balcony: [-1, 2], bath: [-1, 2], bed: [-1, 2], bench: [0, 1], bike: [-1, 1], boatdeco: [0, 2], buranohouse: [-1, 2],
  cake: [-1, 2], canoe: [0, 2], capanna: [0, 1], caravan: [0, 4], casone: [0, 1], castle: [-1, 2], chalet: [-1, 3], cheese: [-1, 1], church: [-1, 5],
  clogs: [-1, 1], column: [-1, 1], cow: [0, 1], dalahorse: [0, 1], deuche: [0, 3], dune: [-1, 2], fika: [0, 1], fire: [-1, 1], gablehouse: [-1, 1],
  gelatocart: [0, 1], glassshop: [-1, 2], gondola: [-1, 3], heather: [-1, 1], highlandhouse: [-1, 2], igloo: [-1, 2], kicksled: [-1, 1],
  kitchen: [-1, 4], larch: [-1, 1], lavender: [0, 1], legoset: [-1, 3], lighthouse: [-1, 1], mas: [-1, 3], maypole: [0, 1], moosedeco: [0, 1],
  muskox: [0, 1], palazzo: [-1, 2], parasol: [0, 2], polarbear: [0, 1], presents: [-1, 1], redhouse: [-1, 2], rifugio: [-1, 2], rorbu: [-1, 2],
  saab900: [0, 4], saab93: [0, 4], saab96: [0, 3], sauna: [-1, 3], scania: [0, 5], skis: [0, 1], sleigh: [-1, 2], sofa: [-1, 2], stalagmite: [-1, 1],
  stall: [-1, 3], stave: [-1, 3], stonehouse: [-1, 2], stove: [-1, 1], sunflowers: [0, 1], table: [-1, 4], tartan: [-1, 2], tent: [-1, 2],
  thatch: [-1, 3], tulips: [-1, 1], vespa: [0, 1], vines: [0, 2], volvo: [0, 4], walrus: [0, 1], waterfall: [-1, 1], windmill: [0, 1]
};
/** The number of rows and the tile size (canvas.js has ROWS and TS, but that file loads after this one). */
const ROWS_GEN = 15, TS_GEN = 32;
/** The scenery animals that stand in the background (the same as BG_ANIMALS in world.js, which loads later). */
const BG_KINDS = new Set(["moosedeco", "polarbear", "walrus", "muskox", "deer", "cow", "flamingo"]);

const DAY22 = genLevel({
  seed: 2212, w: 280, ride: { kind: "railbike", len: 120 }, day: dayLabel(1), name: T("Forest & Old Railway", "Bos & oude spoorlijn"), theme: "bos",
  sub: T("The walking map has blown away in three pieces. Without the map we'll never find the old railway path.",
    "De wandelkaart is in drie stukken gewaaid. Zonder kaart vinden we het oude spoorpad nooit terug."),
  keyType: "🗺️", keyHud: "🗺️", keyName: T("map pieces", "kaartstukjes"),
  questType: "🩹", questHud: "🩹", questName: T("plaster", "pleister"),
  coin: "🍟", coinName: T("chips", "frietjes"), enemy: "zwijn", spikeMsg: T("Ouch, brambles!", "Au, bramen!"),
  pits: true, enemies: true, spikes: true, exitStyle: "arch", exitLabel: T("Trail → cabin", "Spoorpad → huis"),
  intro: T(["The old railway: part is a walking path, part still has rails for a rail bike.", "Flat as a pancake, they say. We call it a challenge."],
    ["De oude spoorlijn: deels een wandelpad, deels rails voor een spoorfiets.", "Plat als een pannenkoek, zeggen ze. Wij noemen het een uitdaging."]),
  quest: {
    need: T(["Ouch! I fell over and grazed my knee.", "The first aid bag with plasters is hanging somewhere high up in the trees. Don't ask how it got there."],
      ["Au! Ik ben gevallen en heb mijn knie geschaafd.", "Ergens hoog in de bomen hangt de EHBO-tas met pleisters. Vraag niet hoe die daar komt."]),
    done: T(["A plaster with dinosaurs on it! Now I don't feel a thing.", "The gate is open. Keep going!"], ["Een pleister met dinosaurussen erop! Nu voel ik niks meer.", "Het hek is open. Doorlopen!"]),
    after: T(["Look at my plaster. Cool, right?"], ["Kijk, mijn pleister. Stoer hè?"]) },
  npcs: [T(["According to the app it's only 2 more kilometres.", "The app said that an hour ago too."], ["Volgens de app is het nog maar 2 kilometer.", "Dat zei de app een uur geleden ook."]),
         T(["I saw a squirrel! Or it was a leaf. It did move."], ["Ik heb een eekhoorn gezien! Of het was een bladje. Het bewoog wel."]),
         T(["Nearly back. I can smell the chips already. Or that's my imagination."], ["Bijna terug. Ik ruik de frieten al. Of dat is de verbeelding."])],
  code: { answer: "3817", title: T("Barrier on the old railway", "Slagboom van het spoorpad"), syms: ["🍄", "🌲", "🦔", "🍂"],
    questions: T(["You see 1 mushroom, then 2 more. How many in total?", "There are 4 pairs of pine cones. How many cones?", "A hedgehog sleeps by day and searches for food at night. How many nights are in one day and night?", "A week has 5 weekdays and 2 weekend days. How many days in all?"],
      ["Je ziet 1 paddenstoel en daarna nog 2. Hoeveel samen?", "Er zijn 4 paren dennenappels. Hoeveel dennenappels?", "Een egel slaapt overdag en zoekt 's nachts eten. Hoeveel nachten zitten er in één dag en nacht?", "Een week heeft 5 doordeweekse dagen en 2 weekenddagen. Hoeveel dagen samen?"]),
    flavor: T(["Mushrooms are fungi. Look, but don't eat wild ones.", "A pair means two.", "Hedgehogs are usually active at night.", "Count the days together."],
      ["Paddenstoelen zijn schimmels. Kijk ernaar, maar eet geen wilde paddenstoelen.", "Een paar betekent twee.", "Egels zijn meestal 's nachts actief.", "Tel de dagen bij elkaar op."]) },
  decoKinds: ["tree", "tree", "pine"],
  doneMsg: T("The map is complete and everyone is back. Tired, muddy and happy.", "De kaart is compleet en iedereen is terug. Moe, modderig en vrolijk.")
});

const DAY23 = genLevel({
  seed: 2323, w: 140, day: dayLabel(2), name: T("Christmas Market in Luxembourg", "Kerstmarkt in Luxemburg"), theme: "stad", quiet: true,
  sub: T("A day in Luxembourg: the red bridge, the glass lift and the Christmas market. In the crowds everyone has lost a mitten.",
    "Een dagje Luxemburg: de rode brug, de glazen lift en de kerstmarkt. In de drukte is iedereen een want kwijt."),
  keyType: "🧤", keyHud: "🧤", keyName: T("mittens", "wanten"),
  questType: "🎟️", questHud: "🎟️", questName: T("carousel ticket", "draaimolenkaartje"),
  coin: "🌰", coinName: T("roasted chestnuts", "gepofte kastanjes"), enemy: "sneeuwpop", spikeMsg: "",
  pits: false, enemies: false, spikes: false, lantern: true, lanternDeco: "church",
  exitStyle: "arch", exitLabel: T("Back to the car", "Terug naar de auto"),
  intro: T(["Welcome to Luxembourg! Here the bus is free and the lift is made of glass.", "The Christmas market smells of waffles, chestnuts and mulled wine."],
    ["Welkom in Luxemburg! Hier is de bus gratis en de lift van glas.", "Op de kerstmarkt ruikt het naar wafels, kastanjes en glühwein."]),
  quest: {
    need: T(["The carousel is about to start, but my ticket blew away.", "It blew that way. Up. Why does everything always blow upwards?"],
      ["De draaimolen gaat zo draaien, maar mijn kaartje is weggewaaid.", "Het waaide die kant op. Naar boven. Waarom waait alles altijd naar boven?"]),
    done: T(["My ticket! Three rides. On the horse. No, the carriage. No, the horse after all.", "The gate to the rest of the market is open."],
      ["Mijn kaartje! Drie rondjes. Op het paard. Nee, de koets. Nee, toch het paard.", "Het hek naar de rest van de markt is open."]),
    after: T(["One more ride. Really the last one. Really."], ["Nog één rondje. Echt de laatste. Echt."]) },
  npcs: [T(["The red bridge is really called the Grand Duchess Charlotte Bridge. Red is easier to remember."], ["De rode brug heet eigenlijk de Groothertogin Charlotte-brug. Rood is makkelijker te onthouden."]),
         T(["The glass lift takes you from the old town straight down. Don't look down. Or do."], ["Met de glazen lift ga je zo van de oude stad naar beneden. Niet naar beneden kijken. Of juist wel."]),
         T(["Mulled wine for the grown-ups, hot chocolate for the kids. And for anyone who can't decide: both."], ["Glühwein voor de volwassenen, warme chocomel voor de kinderen. En voor wie twijfelt: allebei."])],
  code: { answer: "6382", title: T("Christmas market gate", "Hek van de kerstmarkt"), syms: ["⭐", "🔔", "🎠", "🥨"],
    questions: T(["Three stalls each hang 2 stars. How many stars altogether?", "Luxembourg borders Belgium, France and Germany. How many countries is that?", "Two carousel rides each last 4 minutes. How many minutes in total?", "A pretzel costs 4 euros. You share the cost equally with a friend. How many euros does each pay?"],
      ["Drie kraampjes hangen elk 2 sterren op. Hoeveel sterren samen?", "Luxemburg grenst aan België, Frankrijk en Duitsland. Hoeveel landen zijn dat?", "Twee ritjes in de draaimolen duren elk 4 minuten. Hoeveel minuten samen?", "Een krakeling kost 4 euro. Je deelt de kosten eerlijk met een vriend. Hoeveel euro betaalt ieder?"]),
    flavor: T(["Add the three pairs.", "The country and its capital city are both called Luxembourg.", "Two times four minutes.", "Half of four euros."],
      ["Tel de drie paren op.", "Het land en de hoofdstad heten allebei Luxemburg.", "Twee keer vier minuten.", "De helft van vier euro."]) },
  decoKinds: ["stall", "stall", "streetlamp", "xtree"], decoExtra: [["saab96", .1]],
  doneMsg: T("A lovely day in Luxembourg. Tomorrow is Paul's birthday.", "Een mooie dag in Luxemburg. Morgen is Paul jarig.")
});

const DAY26 = genLevel({
  seed: 2626, w: 160, day: dayLabel(5), name: T("The Wildlife Park", "Het wildpark"), theme: "sneeuw",
  sub: T("Boxing Day. Take 3 animal photos for the group chat and make sure the animals get fed.",
    "Tweede kerstdag. Maak 3 dierenfoto's voor de groepsapp en zorg dat de dieren te eten krijgen."),
  keyType: "📸", keyHud: "📸", keyName: T("animal photos", "dierenfoto's"),
  questType: "🥕", questHud: "🥕", questName: T("bag of carrots", "zak wortels"),
  coin: "🍪", coinName: T("Christmas biscuits", "kerstkoekjes"), enemy: "sneeuwpop", spikeMsg: T("Slippery! Icicles!", "Glad! IJspegels!"),
  pits: true, enemies: true, spikes: true, exitStyle: "arch", exitLabel: T("Park exit", "Uitgang wildpark"),
  intro: T(["Welcome to the wildlife park! Deer, wild boars and lots of snow.", "Only feed the animals the right food. Christmas biscuits are for us."],
    ["Welkom in het wildpark! Herten, wilde zwijnen en heel veel sneeuw.", "Voeren mag alleen met de juiste voeding. Kerstkoekjes zijn voor ons."]),
  quest: {
    need: T(["The deer are looking at me very expectantly.", "There's a bag of carrots on top of the lookout tower. Will you get it?"],
      ["De herten kijken me heel verwachtingsvol aan.", "Er ligt een zak wortels bovenop de uitkijktoren. Haal jij hem?"]),
    done: T(["Carrots! The deer will be grateful forever.", "The gate to the next part of the park is open."], ["Wortels! De herten zijn je eeuwig dankbaar.", "Het hek naar het volgende deel van het park is open."]),
    after: T(["That deer with the huge antlers? That's the boss here."], ["Dat hert met dat grote gewei? Dat is de baas hier."]) },
  npcs: [T(["I've got 40 photos of the same deer. They're all a bit different. A bit."], ["Ik heb al 40 foto's van hetzelfde hert. Ze zijn allemaal een beetje anders. Een beetje."]),
         T(["The owls here only wake up when we've gone. Typical."], ["De uilen hier worden pas wakker als wij weg zijn. Typisch."]),
         T(["Hot chocolate at the exit. That's the real reason we're here."], ["Warme chocolademelk bij de uitgang. Dat is de echte reden dat we hier zijn."])],
  code: { answer: "6254", title: T("Wildlife park gate", "Poort van het wildpark"), syms: ["🦌", "🐗", "🦉", "🦊"],
    questions: T(["A deer has 4 legs. An insect has 2 more. How many legs does the insect have?", "A wild boar has 4 legs. How many pairs of legs is that?", "Each owl has 2 wings. How many owls have 10 wings altogether?", "A fox has one paw on each leg. How many paws does a fox have?"],
      ["Een hert heeft 4 poten. Een insect heeft er 2 meer. Hoeveel poten heeft het insect?", "Een wild zwijn heeft 4 poten. Hoeveel paren poten zijn dat?", "Elke uil heeft 2 vleugels. Hoeveel uilen hebben samen 10 vleugels?", "Hoeveel poten heeft een vos?"]),
    flavor: T(["Insects have three pairs of legs.", "A pair means two.", "Owls are birds and each has one pair of wings.", "Foxes are mammals with four legs."],
      ["Insecten hebben drie paar poten.", "Een paar betekent twee.", "Uilen zijn vogels en hebben elk één paar vleugels.", "Vossen zijn zoogdieren met vier poten."]) },
  decoKinds: ["pine", "pine", "deer"],
  doneMsg: T("Three photos in the group chat, 47 replies within a minute. Well done!", "Drie foto's in de groepsapp, 47 reacties binnen een minuut. Goed gedaan!")
});

const DAY27 = genLevel({
  seed: 2727, w: 150, day: dayLabel(6), name: T("The Last Evening", "De laatste avond"), theme: "huis",
  sub: T("Raclette night! Find 3 pieces of raclette cheese and the Uno cards for the last game.",
    "Raclette-avond! Vind 3 stukken raclettekaas en de Uno-kaarten voor het laatste potje."),
  keyType: "🧀", keyHud: "🧀", keyName: T("raclette cheeses", "raclettekazen"),
  questType: "🃏", questHud: "🃏", questName: T("Uno cards", "Uno-kaarten"),
  coin: "🧇", coinName: T("waffles", "wafels"), enemy: "robot", spikeMsg: T("OUCH! A Lego brick!", "AU! Een legosteentje!"),
  pits: false, enemies: true, spikes: true, exitStyle: "door",
  labels: T([["Living room", 2], ["Dining room", 50], ["Wellness", 95]], [["Zitkamer", 2], ["Eetkamer", 50], ["Wellness", 95]]),
  intro: T(["The last evening. Who packs tonight, and who panics tomorrow?", "Raclette first. Packing can wait."],
    ["De laatste avond. Wie pakt vanavond al in, en wie morgen in paniek?", "Eerst nog raclette. Inpakken kan altijd nog."]),
  quest: {
    need: T(["No Uno, no last game. No last game, no winner of the week.", "The cards are somewhere up high. Someone hid them after last night's game..."],
      ["Zonder Uno geen laatste potje. Zonder laatste potje geen winnaar van de week.", "De kaarten liggen ergens hoog. Iemand heeft ze verstopt na het potje van gisteren..."]),
    done: T(["There they are! Someone kept the +4 cards very safe.", "The door to the dining room is open. Raclette!"], ["Daar zijn ze! Iemand heeft de +4-kaarten wel heel goed bewaard.", "De deur naar de eetkamer is open. Raclette!"]),
    after: T(["I'm not saying who won yesterday. I'm only saying: it was me."], ["Ik zeg niks over wie er gisteren won. Ik zeg alleen: dat was ik."]) },
  npcs: [T(["The sauna is open until 10 pm. After that it's just a warm wooden shed."], ["Sauna is open tot 22:00. Daarna is het gewoon een warm houten hok."]),
         T(["I've already packed my suitcase. Just kidding. It's still open on the bed."], ["Ik heb mijn koffer al ingepakt. Grapje. Hij ligt nog open op bed."]),
         T(["Home tomorrow. I'll miss the steam room. And the gourmet set. And the raclette."], ["Morgen naar huis. Ik ga het stoombad missen. En de gourmet. En de raclette."])],
  code: { answer: "7924", title: T("Door to the terrace", "Deur naar het terras"), syms: ["🌙", "👨‍👩‍👧", "🛏️", "🧖"],
    questions: T(["A week has 5 weekdays and 2 weekend days. How many days is that?", "The families have 4 grown-ups and 5 children. How many people altogether?", "Four people share 2 bedrooms equally. How many in each room?", "Eight people go to the sauna in 2 equal groups. How many in each group?"],
      ["Een week heeft 5 doordeweekse dagen en 2 weekenddagen. Hoeveel dagen zijn dat?", "De gezinnen hebben 4 volwassenen en 5 kinderen. Hoeveel mensen zijn dat samen?", "Vier mensen verdelen zich eerlijk over 2 slaapkamers. Hoeveel per kamer?", "Acht mensen gaan in 2 gelijke groepen naar de sauna. Hoeveel per groep?"]),
    flavor: T(["There are seven nights in a week too.", "Add grown-ups and children.", "Share four people between two rooms.", "Share eight people between two groups."],
      ["Een week heeft ook zeven nachten.", "Tel volwassenen en kinderen bij elkaar op.", "Verdeel vier mensen over twee kamers.", "Verdeel acht mensen over twee groepen."]) },
  decoKinds: ["sofa", "lamp", "table", "bed", "stove"],
  doneMsg: T("Raclette gone, Uno won (by someone who won't say it out loud). Good night!", "Raclette op, Uno gewonnen (door iemand die het niet hardop zegt). Welterusten!")
});

const DAY28 = genLevel({
  seed: 2828, w: 160, day: dayLabel(7), name: T("Going Home", "Naar huis"), theme: "bos",
  sub: T("Everything has to go! Find 3 lost socks and the last suitcase before the car leaves.",
    "Alles moet mee! Vind 3 verdwaalde sokken en de laatste koffer voordat de auto vertrekt."),
  keyType: "🧦", keyHud: "🧦", keyName: T("lost socks", "verdwaalde sokken"),
  questType: "🧳", questHud: "🧳", questName: T("suitcase", "koffer"),
  coin: "🍫", coinName: T("leftover chocolate", "restjes chocolade"), enemy: "zwijn", spikeMsg: T("Ouch, brambles!", "Au, bramen!"),
  pits: true, enemies: true, spikes: true, exitStyle: "car",
  intro: T(["Last day. Everything has to go, except the brambles.", "There are still socks in the forest. How? Nobody knows."],
    ["Laatste dag. Alles moet mee, behalve de bramen.", "Er liggen nog sokken in het bos. Hoe? Niemand weet het."]),
  quest: {
    need: T(["There's still a suitcase missing. The one with... all the Christmas presents.", "It's somewhere up high. Why? Because it's a game."],
      ["Er mist nog een koffer. De koffer met... alle kerstcadeaus.", "Hij staat ergens hoog. Waarom? Omdat het een spel is."]),
    done: T(["Found it! Without that suitcase it would have been a very quiet drive home.", "The way to the car is clear."], ["Gevonden! Zonder die koffer was het een héél stille terugreis geworden.", "De weg naar de auto is vrij."]),
    after: T(["Who's in the back? I'm in the front. I called it first."], ["Wie zit er achterin? Ik zit voorin. Ik heb het als eerste geroepen."]) },
  npcs: [T(["I've packed everything. Except my toothbrush. And my charger."], ["Ik heb alles ingepakt. Behalve mijn tandenborstel. En mijn oplader."]),
         T(["It was a great week. Same cabin next year?"], ["Het was een topweek. Zelfde huis volgend jaar?"]),
         T(["Are we there yet? We haven't even left."], ["Zijn we er al? We zijn nog niet eens vertrokken."])],
  code: { answer: "2128", title: T("Driveway gate", "Hek van de oprit"), syms: ["🚗", "🧳", "🎄", "🏠"],
    questions: T(["A car has 4 wheels. How many pairs of wheels is that?", "A bag weighs 1,000 grams. How many kilograms is that?", "Which part of a tree takes up water? 1: the needles. 2: the roots.", "A spider is not an insect. How many legs does a spider have?"],
      ["Een auto heeft 4 wielen. Hoeveel paren wielen zijn dat?", "Een tas weegt 1.000 gram. Hoeveel kilogram is dat?", "Welk deel van een boom neemt water op? 1: de naalden. 2: de wortels.", "Een spin is geen insect. Hoeveel poten heeft een spin?"]),
    flavor: T(["A pair is two wheels.", "One kilogram is 1,000 grams.", "Roots take up water from the soil.", "Spiders have four pairs of legs; insects have three."],
      ["Een paar is twee wielen.", "Eén kilogram is 1.000 gram.", "Wortels nemen water uit de grond op.", "Spinnen hebben vier paar poten; insecten hebben er drie."]) },
  decoKinds: ["tree", "tree", "pine"],
  doneMsg: ""
});

LEVELS.splice(1, 0, DAY22, DAY23);
LEVELS.push(DAY26, DAY27, DAY28);
