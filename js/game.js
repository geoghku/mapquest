/* Geography Buddy platformer — side-scroller drawn on canvas.
   Every site has its own signature mechanic; every item is placed within a normal jump
   (feet rise at most ~168px; nothing static sits more than ~3 tiles above a standable surface). */
(function () {
  const T = 45, ROWS = 12, VIEW_H = ROWS * T, WATER_Y = T * 9.9;
  const GRAV = 2300, GRAV_FAST = 4600, JUMP_V = 880, RUN = 290, ACC = 2600, AIR_ACC = 1900, FRICT = 2600;
  const PW = 34, PH = 46;
  const TAU = Math.PI * 2;

  let canvas, ctx, dpr = 1, scale = 1, viewW = 960;
  let L = null;
  let raf = 0, last = 0, acc = 0, running = false, manual = false, paused = false;
  const input = { left: false, right: false, jump: false, jumpPressed: false, steer: false, pointerX: null };
  const imgs = {};
  let cb = {};

  function img(src) { if (imgs[src]) return imgs[src]; const i = new Image(); i.src = src; imgs[src] = i; return i; }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const ease = (t, per, ph) => 0.5 - 0.5 * Math.cos(TAU * t / per + (ph || 0));
  const rr = (...a) => window.ART.rr(ctx, ...a);

  /* ---------------- Level plans ----------------
     Generic pieces: flat, gap, step, blocks, float, pillars
     Signature pieces are listed per site style. */
  const PLAN = {
    columns: ['flat', 'vents', 'risers', 'blocks', 'pillars', 'vents', 'risers', 'blocks', 'step', 'vents', 'flat'],
    sandbar: ['flat', 'tidebar', 'blocks', 'tidebar', 'step', 'blocks', 'tidebar', 'flat'],
    forest:  ['flat', 'leaves', 'butterflies', 'blocks', 'branches', 'leaves', 'step', 'butterflies', 'blocks', 'branches', 'flat'],
    wetland: ['flat', 'birdwatch', 'lily', 'blocks', 'fields', 'birdwatch', 'lily', 'blocks', 'birdwatch', 'flat'],
    city:    ['flat', 'planters', 'bikes', 'blocks', 'roofs', 'planters', 'gap', 'bikes', 'blocks', 'planters', 'flat'],
    sky:     ['flat', 'raincloud', 'wind', 'blocks', 'updraft', 'raincloud', 'float', 'blocks', 'updraft', 'wind', 'flat'],
    street:  ['flat', 'market', 'awnings', 'blocks', 'step', 'awnings', 'market', 'blocks', 'awnings', 'flat'],
    metro:   ['flat', 'beams', 'crane', 'blocks', 'ponds', 'crane', 'beams', 'blocks', 'crane', 'flat'],
    airport: ['flat', 'belt', 'planes', 'dolphins', 'blocks', 'belt', 'dolphins', 'planes', 'blocks', 'flat'],
    bridge:  ['flat', 'towers', 'buses', 'blocks', 'dive', 'towers', 'buses', 'blocks', 'flat']
  };

  function build(site, seedIdx) {
    const rand = mulberry(1234 + seedIdx * 97);
    const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
    const style = site.style;
    const [A, B, C] = site.items.map(i => i.key);
    const top = [], kind = [];
    const items = [], enemies = [], blocks = [], plats = [], ents = [], pools = [];
    let c = 0, h = 9;
    const put = (n, hh, k) => { for (let i = 0; i < n; i++) { kind[c] = k || null; top[c++] = hh; } };
    const gap = (n) => { for (let i = 0; i < n; i++) { kind[c] = null; top[c++] = null; } };
    const item = (col, row, key, extra) => { const it = Object.assign({ x: col * T + T / 2, y: row * T + T / 2, key, taken: false, ph: rand() * 6 }, extra || {}); it.x0 = it.x; it.y0 = it.y; items.push(it); return it; };
    const line = (c0, n, row, key) => { for (let i = 0; i < n; i++) item(c0 + i, row, key); };
    const enemy = (c0, c1, hh) => enemies.push({ x: (c0 + (c1 - c0) / 2) * T, y: hh * T - 40, w: 40, h: 40, vx: (rand() < .5 ? -1 : 1) * 60, min: c0 * T + 4, max: c1 * T - 44, alive: true, squash: 0, dead: 0 });
    const plat = (o) => { const p = Object.assign({ type: 'static', solid: true, dx: 0, dy: 0 }, o); p.x0b = p.x; p.y0b = p.y; p.prevY = p.y; plats.push(p); return p; };
    const blockRow = (c0, keys) => keys.forEach((k, i) => blocks.push({ c: c0 + i, r: h - 4, used: false, give: k, bump: 0 }));
    const pool = (o) => { const p = Object.assign({ timer: 0.6, live: [], left: o.n }, o); pools.push(p); return p; };

    const SEG = {
      flat() { const n = ri(6, 8), c0 = c; put(n, h); line(c0 + 1, 3, h - 2, A); if (c0 > 12) enemy(c0 + 2, c0 + n - 1, h); },
      gap() { const c0 = c; item(c0 - .5, h - 2, A); item(c0 + .5, h - 3, A); item(c0 + 1.5, h - 2, A); gap(2); h = Math.max(7, Math.min(10, h + ri(-1, 1))); put(ri(3, 4), h); },
      step() {
        const dir = h >= 9 ? -1 : (h <= 7 ? 1 : (rand() < .5 ? -1 : 1));
        for (let k = 0; k < 2; k++) { h = Math.max(6, Math.min(10, h + dir)); const c0 = c; put(3, h); item(c0 + 1, h - 1, A); }
        const c0 = c; put(5, h); if (c0 > 12) enemy(c0, c0 + 5, h);
      },
      blocks(idx) { const c0 = c; put(8, h); blockRow(c0 + 2, [A, C, B]); line(c0 + 2, 3, h - 1, A); if (idx > 3) enemy(c0 + 5, c0 + 7, h); },
      float() { const c0 = c; put(1, h); gap(4); plat({ x: (c0 + 1) * T + 6, y: (h - 3) * T, w: 4 * T - 12 }); line(c0 + 1.5, 3, h - 4, B); put(4, h); },
      pillars() {
        for (let k = 0; k < 3; k++) { gap(k === 0 ? 1 : 2); const ph = Math.max(6, Math.min(10, h + ri(-1, 1))); const c0 = c; put(3, ph); item(c0 + 1, ph - 1, k % 2 ? B : A); h = ph; }
        gap(1); h = Math.max(7, Math.min(10, h)); put(3, h);
      },

      /* High Island: steam vents throw volcano sparks; rising hexagon columns */
      vents() {
        const c0 = c; put(7, h);
        ents.push({ t: 'vent', x: (c0 + 3.5) * T, y: h * T });
        pool({ kind: 'spark', key: B, n: 3, x: (c0 + 3.5) * T, y: h * T - 10, every: 1.9, ground: h * T });
        item(c0 + 1, h - 1, A); item(c0 + 6, h - 1, A);
      },
      risers() {
        const c0 = c; put(2, h); gap(8);
        for (let k = 0; k < 3; k++) {
          const px = (c0 + 2.4 + k * 2.6) * T, base = (h + 0.5) * T, hi = (h - 2) * T;
          const p = plat({ type: 'move', x: px, y: base, w: T * 1.6, ax: px, ay: base, bx: px, by: hi, per: 4.2, ph: k * 1.9, look: 'hex' });
          item(0, 0, A, { follow: p, ox: T * .8, oy: -T * .7 });
        }
        put(4, h);
      },

      /* Sharp Island: the sandbar is only exposed at low tide */
      tidebar() {
        const c0 = c; put(2, h - 1, 'rock'); item(c0 + 1, h - 2.4, C);
        const s0 = c; put(6, h, 'tidal'); line(s0 + 1, 2, h - 1, A); item(s0 + 3.5, h - 1, B); item(s0 + 5, h - 1, A);
        put(2, h - 1, 'rock');
      },

      /* Tai Po Kau: catch falling leaves, follow butterflies, bounce on springy branches */
      leaves() {
        const c0 = c; put(9, h);
        ents.push({ t: 'canopy', x: (c0 + 1) * T, w: 7 * T, y: (h - 7) * T });
        pool({ kind: 'leaf', key: A, n: 4, x0: (c0 + 1.5) * T, x1: (c0 + 7.5) * T, y: (h - 6.2) * T, every: 1.5, ground: h * T, speed: 62 });
        if (c0 > 12) enemy(c0 + 5, c0 + 8, h);
      },
      butterflies() {
        const c0 = c; put(8, h);
        for (let k = 0; k < 2; k++) item(c0 + 2 + k * 3.5, h - 2.2, B, { path: 'flutter', ax: 56, ay: 26 });
      },
      branches() {
        const c0 = c; put(2, h); gap(7);
        plat({ type: 'spring', x: (c0 + 2.6) * T, y: (h - 1) * T, w: T * 1.8, look: 'branch', spring: 1000 });
        plat({ x: (c0 + 5) * T, y: (h - 4) * T, w: T * 2.6 });
        item(c0 + 6.2, h - 5, C); item(c0 + 3.5, h - 4, A); item(c0 + 3.5, h - 5.2, A);
        plat({ type: 'spring', x: (c0 + 7.6) * T, y: (h - 1) * T, w: T * 1.4, look: 'branch', spring: 820 });
        put(4, h);
      },

      /* Long Valley: photograph birds by keeping still; sinking lily pads; field paths */
      birdwatch() {
        const c0 = c; put(9, h);
        item(c0 + 6.5, h - 0.6, C, { photo: true, prog: 0 });
        item(c0 + 1, h - 1, A); item(c0 + 2, h - 1, A);
      },
      lily() {
        const c0 = c; put(1, h); gap(8);
        for (let k = 0; k < 3; k++) {
          const p = plat({ type: 'lily', x: (c0 + 1.6 + k * 2.6) * T, y: (h + .3) * T, w: T * 1.6, look: 'lily' });
          item(0, 0, A, { follow: p, ox: T * .8, oy: -T * 1.1 });
        }
        put(4, h);
      },
      fields() { const c0 = c; put(3, h); put(4, h - 1); put(3, h); item(c0 + 1, h - 1, B); item(c0 + 4.5, h - 2.2, B); item(c0 + 8, h - 1, B); enemy(c0 + 7, c0 + 10, h); },

      /* Kai Tak: plant trees in empty planters; bike boost; rooftop gardens with solar panels */
      planters() {
        const c0 = c; put(8, h);
        for (let k = 0; k < 3; k++) ents.push({ t: 'planter', x: (c0 + 1.5 + k * 2.2) * T, y: h * T, planted: false, key: A });
      },
      bikes() { const c0 = c; put(8, h); item(c0 + 2, h - 0.7, B, { bike: true }); line(c0 + 4, 3, h - 2, A); if (c0 > 12) enemy(c0 + 5, c0 + 8, h); },
      roofs() {
        const c0 = c; put(1, h); gap(7);
        plat({ x: (c0 + 1) * T + 4, y: (h - 2) * T, w: 2.6 * T, look: 'roof' });
        plat({ x: (c0 + 4.4) * T, y: (h - 4) * T, w: 2.6 * T, look: 'roof' });
        item(c0 + 2.3, h - 3, C); item(c0 + 5.7, h - 5, C);
        put(4, h);
      },

      /* Observatory: catch raindrops, ride updrafts, beat wind gusts */
      raincloud() {
        const c0 = c; put(8, h);
        ents.push({ t: 'cloud', x: (c0 + 1.2) * T, w: 5.6 * T, y: (h - 6.8) * T });
        pool({ kind: 'rain', key: B, n: 4, x0: (c0 + 1.8) * T, x1: (c0 + 6.3) * T, y: (h - 6) * T, every: 1.25, ground: h * T, speed: 150 });
        item(c0 + 7, h - 1, A);
      },
      wind() {
        const c0 = c; put(9, h);
        ents.push({ t: 'wind', x0: (c0 + 1) * T, x1: (c0 + 8) * T, y0: (h - 4) * T, y1: h * T, dir: -1, per: 3.2 });
        line(c0 + 2, 3, h - 1, A); item(c0 + 6, h - 2, A); if (c0 > 12) enemy(c0 + 6, c0 + 9, h);
      },
      updraft() {
        const c0 = c; put(3, h); gap(3); put(4, h);
        ents.push({ t: 'updraft', x0: (c0 + 3) * T + 6, x1: (c0 + 6) * T - 6, top: (h - 7.4) * T, y1: VIEW_H });
        plat({ type: 'cloudp', x: (c0 + 6.2) * T, y: (h - 6) * T, w: 3.2 * T });
        item(c0 + 7.3, h - 7, C); item(c0 + 4.5, h - 3, A); item(c0 + 4.5, h - 5, A);
      },

      /* Mong Kok: bouncy shop awnings; shop signs that blink on and off */
      market() { const c0 = c; put(8, h); for (let k = 0; k < 3; k++) item(c0 + 1.5 + k * 2.3, h - 1, A); ents.push({ t: 'stall', x: (c0 + 1) * T, w: 6.5 * T, y: h * T }); if (c0 > 12) enemy(c0 + 5, c0 + 8, h); },
      awnings() {
        const c0 = c; put(10, h);
        for (let k = 0; k < 2; k++) {
          const ax = (c0 + 1.5 + k * 4.5) * T;
          plat({ type: 'spring', x: ax, y: (h - 2) * T, w: T * 2.4, look: 'awning', spring: 1150 });
          item(c0 + 2.7 + k * 4.5 - .5, h - 7, B, { blink: 2.2, bph: k * 1.1, sign: true });
        }
      },

      /* Northern Metropolis: hang from moving crane hooks to cross gaps; steel beams; fish ponds */
      beams() { const c0 = c; put(2, h); gap(5); plat({ x: (c0 + 2.3) * T, y: (h - 2) * T, w: 2 * T }); plat({ x: (c0 + 4.6) * T, y: (h - 3) * T, w: 2 * T }); item(c0 + 3.3, h - 3.2, A); item(c0 + 5.6, h - 4.2, A); put(4, h); },
      crane() {
        const c0 = c; put(3, h); gap(8); put(4, h);
        const hy = (h - 2.4) * T, xa = (c0 + 2.2) * T, xb = (c0 + 11.8) * T;
        ents.push({ t: 'hook', xa, xb, y: hy, per: 6.4, ph: Math.PI, x: xa, vx: 0 });
        for (let k = 0; k < 3; k++) item(c0 + 4.6 + k * 2, h - 1.8, k === 1 ? B : A);
      },
      ponds() {
        const c0 = c; put(2, h); gap(2); put(3, h); gap(2); put(3, h);
        item(c0 + 2.5, h - 2.4, B); item(c0 + 7.5, h - 2.4, B); item(c0 + 5, h - 1, A);
        ents.push({ t: 'egrets', x: (c0 + 2) * T, w: 8 * T });
      },

      /* Airport: baggage belts, planes overhead, dolphins in the water gaps */
      belt() {
        const c0 = c; put(1, h); put(9, h, 'belt'); put(1, h);
        ents.push({ t: 'belt', x0: (c0 + 1) * T, x1: (c0 + 10) * T, y: h * T, v: 120 });
        for (let k = 0; k < 3; k++) item(c0 + 1.5 + k * 3, h - 0.62, B, { belt: { x0: (c0 + 1) * T + 18, x1: (c0 + 10) * T - 18, v: 120 } });
      },
      planes() { const c0 = c; put(10, h); item(c0 + 2, h - 2.8, A, { path: 'fly', x1: (c0 + 9) * T, per: 7, big: true }); item(c0 + 3, h - 1, A); item(c0 + 7, h - 1, A); if (c0 > 12) enemy(c0 + 6, c0 + 9, h); },
      dolphins() {
        const c0 = c; put(3, h); gap(3); put(4, h);
        const it = item(c0 + 4.5, h + 1.4, C, { spot: true, dx: (c0 + 4.5) * T, per: 3.6, ph: rand() * 3 });
        ents.push({ t: 'dolphin', it });
        item(c0 + 3.5, h - 2.4, A); item(c0 + 5.5, h - 2.4, A);
      },

      /* HZMB: bridge towers; ride the shuttle buses; swim through the sea above the immersed tunnel */
      towers() { const c0 = c; put(9, h); ents.push({ t: 'tower', x: (c0 + 4.5) * T, y: h * T }); item(c0 + 1.5, h - 1, A); item(c0 + 3, h - 2, A); item(c0 + 6, h - 2, A); item(c0 + 7.5, h - 1, A); if (c0 > 12) enemy(c0 + 6, c0 + 9, h); },
      buses() {
        const c0 = c; put(2, h); gap(9); put(3, h);
        const y = h * T, xa = (c0 + 2.1) * T, xb = (c0 + 8.6) * T;
        const p = plat({ type: 'move', x: xa, y, w: T * 2.3, ax: xa, ay: y, bx: xb, by: y, per: 6.5, ph: Math.PI, look: 'bus' });
        item(0, 0, B, { follow: p, ox: T * 1.15, oy: -T * .75 });
        item(c0 + 6, h - 2.6, A);
      },
      dive() {
        h = 7; const c0 = c; put(3, h); const s0 = c; put(13, 11, 'seabed'); put(4, 7); h = 7;
        const surf = 7.7 * T;
        ents.push({ t: 'swim', x0: s0 * T, x1: (s0 + 13) * T, surf });
        for (let k = 0; k < 4; k++) item(s0 + 2 + k * 3, 9.6 + (k % 2) * .7, A);
        item(s0 + 3.5, 7.3, C, { path: 'sail', x1: (s0 + 10) * T, per: 9 });
        item(s0 + 9.5, 10.2, B);
      }
    };

    put(8, 9);
    line(4, 3, 7, A);
    const plan = PLAN[style] || PLAN.forest;
    plan.forEach((f, idx) => (SEG[f] || SEG.flat)(idx));
    const finish = c; put(16, h);
    line(finish + 1, 3, h - 2, A);
    const flagX = (finish + 9) * T;

    const totals = {}; [A, B, C].forEach(k => totals[k] = 0);
    items.forEach(i => totals[i.key]++);
    blocks.forEach(b => totals[b.give]++);
    pools.forEach(p => totals[p.key] += p.n);
    ents.forEach(e => { if (e.t === 'planter') totals[e.key]++; });
    return { top, kind, cols: top.length, items, enemies, blocks, plats, ents, pools, flagX, flagH: h, totals, style };
  }

  /* ---------------- Collision helpers ---------------- */
  function topAt(c) {
    const t = L.top[c];
    if (t == null) return null;
    if (L.kind[c] === 'tidal' && L.tideHigh) return null;
    return t;
  }
  function solidAt(c, r) {
    if (c < 0 || c >= L.cols) return true;
    if (r < 0) return false;
    const t = topAt(c);
    if (t != null && r >= t) return true;
    return !!L.blockMap[c + ',' + r];
  }
  function moveX(p, dx) {
    p.x += dx;
    const r0 = Math.floor((p.y + 2) / T), r1 = Math.floor((p.y + PH - 2) / T);
    if (dx > 0) { const c = Math.floor((p.x + PW) / T); for (let r = r0; r <= r1; r++) if (solidAt(c, r)) { p.x = c * T - PW - 0.01; p.vx = 0; break; } }
    else if (dx < 0) { const c = Math.floor(p.x / T); for (let r = r0; r <= r1; r++) if (solidAt(c, r)) { p.x = (c + 1) * T + 0.01; p.vx = 0; break; } }
  }
  function moveY(p, dy) {
    const prevBottom = p.y + PH;
    p.y += dy;
    const c0 = Math.floor((p.x + 3) / T), c1 = Math.floor((p.x + PW - 3) / T);
    p.ground = false; p.on = null;
    if (dy > 0) {
      const r = Math.floor((p.y + PH) / T);
      for (let c = c0; c <= c1; c++) if (r >= 0 && solidAt(c, r)) { p.y = r * T - PH; p.vy = 0; p.ground = true; break; }
      if (!p.ground) {
        for (const pl of L.plats) {
          if (!pl.solid) continue;
          if (p.x + PW > pl.x + 2 && p.x < pl.x + pl.w - 2 && prevBottom <= pl.prevY + Math.abs(pl.dy) + 2 && p.y + PH >= pl.y) {
            p.y = pl.y - PH;
            if (pl.spring) { p.vy = -pl.spring; p.sprung = true; pl.squish = 1; window.SOUND.play('jump'); p.squash = -0.3; if (pl.look === 'awning') say(pl.x + pl.w / 2 - 20, pl.y - 20, 'Boing!'); }
            else { p.vy = 0; p.ground = true; p.on = pl; if (pl.type === 'lily' && !pl.sink) pl.sink = 0.001; }
            break;
          }
        }
      }
    } else if (dy < 0) {
      const r = Math.floor(p.y / T);
      for (let c = c0; c <= c1; c++) if (solidAt(c, r)) {
        p.y = (r + 1) * T; p.vy = 40;
        const cc = Math.floor((p.x + PW / 2) / T);
        const hit = L.blockMap[cc + ',' + r] || L.blockMap[c + ',' + r];
        if (hit) bumpBlock(hit); else window.SOUND.play('bump');
        break;
      }
    }
  }
  function bumpBlock(b) {
    b.bump = 1;
    if (b.used) { window.SOUND.play('bump'); return; }
    b.used = true; window.SOUND.play('pop');
    const it = { x: b.c * T + T / 2, y: b.r * T - T / 2, key: b.give, taken: false };
    collect(it);
    L.fx.push({ type: 'popitem', key: b.give, x: it.x, y: b.r * T, t: 0 });
  }
  function say(x, y, s) { L.fx.push({ type: 'text', x, y, s, t: 0 }); }

  /* ---------------- Game flow ---------------- */
  function collect(it, msg) {
    it.taken = true;
    L.got[it.key] = (L.got[it.key] || 0) + 1;
    L.score += it.key === L.keys[2] ? 50 : it.key === L.keys[1] ? 20 : 10;
    window.SOUND.play(it.key !== L.keys[0] ? 'rare' : 'coin');
    for (let i = 0; i < 8; i++) L.fx.push({ type: 'spark', x: it.x, y: it.y, vx: Math.cos(i / 8 * TAU) * 160, vy: Math.sin(i / 8 * TAU) * 160, t: 0, col: L.site.color });
    if (msg) say(it.x - 20, it.y - 26, msg);
    if (!L.seen[it.key]) { L.seen[it.key] = true; cb.onDiscover && cb.onDiscover(it.key); }
    hud();
  }
  function hurt(knock) {
    const p = L.p;
    if (p.inv > 0 || L.over) return;
    L.hearts--; window.SOUND.play('hurt');
    p.inv = 1.6; p.vy = -520; p.vx = knock * 260; p.hook = null;
    hud();
    if (L.hearts <= 0) { L.over = 'lose'; L.overT = 0; window.SOUND.stopMusic(); setTimeout(() => cb.onLose && cb.onLose(), 900); }
  }
  function respawn() { const p = L.p; p.x = L.safe.x; p.y = L.safe.y - PH - 2; p.vx = 0; p.vy = 0; p.hook = null; p.on = null; }
  function hud() { cb.onHud && cb.onHud({ got: L.got, totals: L.totals, hearts: L.hearts, score: L.score }); }

  function start(site, idx, callbacks) {
    cb = callbacks || {};
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    const lv = build(site, idx);
    const blockMap = {}; lv.blocks.forEach(b => blockMap[b.c + ',' + b.r] = b);
    L = Object.assign(lv, {
      site, keys: site.items.map(i => i.key), blockMap,
      p: { x: 2 * T, y: 9 * T - PH, vx: 0, vy: 0, ground: false, face: 1, inv: 0, coyote: 0, buf: 0, squash: 0, runT: 0, on: null, hook: null, hookCool: 0, boost: 0, swim: false, still: 0 },
      cam: 0, time: 0, got: {}, seen: {}, hearts: 3, score: 0, fx: [], over: null, overT: 0, flagRaise: 0,
      tideHigh: false, tideT: 0, tideMsg: '',
      safe: { x: 2 * T, y: 9 * T }, bg: img(site.bg), player: img('img/player.webp')
    });
    L.keys.forEach(k => L.got[k] = 0);
    resize(); hud();
    input.left = input.right = input.jump = false; input.jumpPressed = false; input.steer = false;
    running = true; last = performance.now(); acc = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; cancelAnimationFrame(raf); L = null; }
  function resize() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    scale = canvas.height / VIEW_H; viewW = canvas.width / scale;
  }

  /* ---------------- World update ---------------- */
  const TIDE_PER = 13, TIDE_HIGH = 4.2, TIDE_WARN = 2.4;
  function updateWorld(dt) {
    const t = L.time, p = L.p;
    // tide
    if (L.style === 'sandbar') {
      const ph = (t + 2) % TIDE_PER, lowLen = TIDE_PER - TIDE_HIGH;
      const was = L.tideHigh;
      L.tideHigh = ph >= lowLen;
      L.tideMsg = L.tideHigh ? 'High tide: wait on the rocks' : (ph > lowLen - TIDE_WARN ? 'Tide coming in!' : '');
      L.tideLevel = L.tideHigh ? Math.min(1, (ph - lowLen) / .6) : Math.max(0, 1 - ph / .6) * (t > 3 ? 1 : 0);
      if (L.tideHigh && !was) window.SOUND.play('splash');
    }
    // platforms
    for (const pl of L.plats) {
      pl.prevY = pl.y; const ox = pl.x, oy = pl.y;
      if (pl.type === 'move') { const k = ease(t, pl.per, pl.ph); pl.x = pl.ax + (pl.bx - pl.ax) * k; pl.y = pl.ay + (pl.by - pl.ay) * k; }
      else if (pl.type === 'lily') {
        if (pl.sink > 0) { pl.sink += dt; pl.y = pl.y0b + Math.min(46, pl.sink * 30); if (pl.sink > 1.7) { pl.solid = false; } if (pl.sink > 3.6) { pl.sink = 0; pl.solid = true; pl.y = pl.y0b; } }
        else pl.y = pl.y0b + Math.sin(t * 2 + pl.x0b) * 2;
      }
      if (pl.squish) pl.squish = Math.max(0, pl.squish - dt * 4);
      pl.dx = pl.x - ox; pl.dy = pl.y - oy;
    }
    // hooks
    for (const e of L.ents) if (e.t === 'hook') { const nx = e.xa + (e.xb - e.xa) * ease(t, e.per, e.ph); e.vx = (nx - e.x) / dt; e.x = nx; }
    // item motion
    for (const it of L.items) {
      if (it.follow) { it.x = it.follow.x + it.ox; it.y = it.follow.y + it.oy; }
      else if (it.path === 'flutter') { it.x = it.x0 + Math.sin(t * 1.3 + it.ph) * it.ax; it.y = it.y0 + Math.sin(t * 2.6 + it.ph) * it.ay; }
      else if (it.path === 'fly' || it.path === 'sail') { const k = ease(t, it.per, it.ph); it.dir = Math.sign(Math.sin(TAU * t / it.per + it.ph)) || 1; it.x = it.x0 + (it.x1 - it.x0) * k; }
      else if (it.belt) { it.x += it.belt.v * dt; if (it.x > it.belt.x1) it.x = it.belt.x0; }
      else if (it.spot) {
        const k = ((t + it.ph) % it.per) / it.per; // leap during first 30% of the cycle
        it.leap = k < .3 ? k / .3 : -1;
        it.y = it.leap >= 0 ? WATER_Y + 10 - Math.sin(it.leap * Math.PI) * 120 : WATER_Y + 40;
        it.x = it.dx - 50 + (it.leap >= 0 ? it.leap * 100 : 0);
      }
      if (it.scared > 0) it.scared -= dt;
    }
    // pools: sparks, leaves, raindrops
    for (const pool of L.pools) {
      const near = Math.abs(((pool.x0 != null ? (pool.x0 + pool.x1) / 2 : pool.x)) - p.x) < viewW * .8;
      pool.timer -= dt;
      if (near && pool.timer <= 0 && pool.left > 0 && pool.live.length < 2) {
        pool.timer = pool.every; pool.left--;
        let it;
        if (pool.kind === 'spark') { it = { x: pool.x, y: pool.y, vx: (Math.random() < .5 ? -1 : 1) * (70 + Math.random() * 60), vy: -640 - Math.random() * 80, g: 1200 }; L.fx.push({ type: 'puff', x: pool.x, y: pool.y + 6, t: 0 }); window.SOUND.play('pop'); }
        else it = { x: pool.x0 + Math.random() * (pool.x1 - pool.x0), y: pool.y, vy: pool.speed, sway: pool.kind === 'leaf' };
        Object.assign(it, { key: pool.key, taken: false, ph: Math.random() * 6, pool, falling: true });
        it.bx = it.x; pool.live.push(it); L.items.push(it);
      }
      for (const it of pool.live) {
        if (it.taken) continue;
        if (it.land != null) { it.land += dt; continue; }
        if (pool.kind === 'spark') { it.vy += it.g * dt; it.x += it.vx * dt; it.y += it.vy * dt; }
        else { it.y += it.vy * dt; if (it.sway) it.x = it.bx + Math.sin(L.time * 2.2 + it.ph) * 28; }
        if (it.y > pool.ground - 12 && (pool.kind !== 'spark' || it.vy > 0)) { it.y = pool.ground - 12; it.land = 0; }
      }
      // missed ones fade and go back to the pool; collected ones leave
      pool.live = pool.live.filter(it => {
        if (it.taken) { L.items.splice(L.items.indexOf(it), 1); return false; }
        if (it.land != null && it.land > .9) { pool.left++; L.items.splice(L.items.indexOf(it), 1); return false; }
        return true;
      });
    }
  }

  function update(dt) {
    if (!L) return;
    L.time += dt;
    const p = L.p;
    L.fx = L.fx.filter(f => { f.t += dt; if (f.type === 'spark' || f.type === 'bubble') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += (f.type === 'bubble' ? -60 : 400) * dt; } return f.t < (f.type === 'text' ? 1.2 : f.type === 'popitem' ? .7 : f.type === 'flash' ? .35 : f.type === 'bubble' ? .9 : f.type === 'puff' ? .6 : .5); });
    L.blocks.forEach(b => b.bump = Math.max(0, b.bump - dt * 6));
    updateWorld(dt);

    if (L.over === 'win') {
      L.overT += dt; L.flagRaise = Math.min(1, L.flagRaise + dt * 1.2);
      p.vx = 0; p.hook = null; p.vy += GRAV * dt; moveY(p, p.vy * dt);
      if (p.ground && L.overT > .4 && L.overT < 1.4 && Math.floor(L.overT * 3) % 2 === 0) p.vy = -420;
      return;
    }
    if (L.over === 'lose') { L.overT += dt; return; }

    // input direction
    let dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (!dir && input.steer && input.pointerX != null) {
      const bx = (p.x + PW / 2 - L.cam) * scale / dpr, dx = input.pointerX - bx;
      if (Math.abs(dx) > 34) dir = Math.sign(dx);
    }
    if (input.jumpPressed) { p.buf = 0.13; input.jumpPressed = false; } else p.buf = Math.max(0, p.buf - dt);
    p.hookCool = Math.max(0, p.hookCool - dt);
    if (p.boost > 0) p.boost -= dt;

    // riding a moving platform
    if (p.on && p.on.solid && (p.on.dx || p.on.dy)) {
      if (p.x + PW > p.on.x && p.x < p.on.x + p.on.w) { moveX(p, p.on.dx); p.y = p.on.y - PH; }
    }
    if (p.on && !p.on.solid) { p.on = null; p.ground = false; }

    // swimming zone
    const sw = L.ents.find(e => e.t === 'swim' && p.x + PW / 2 > e.x0 && p.x + PW / 2 < e.x1);
    const wasSwim = p.swim;
    p.swim = !!(sw && p.y + PH * .6 > sw.surf);
    if (p.swim && !wasSwim) { window.SOUND.play('splash'); if (!L.swamMsg) { L.swamMsg = 1; say(p.x, p.y - 30, 'Dive! Tap jump to swim'); } }

    if (p.hook) {
      // hanging from a crane hook
      const hk = p.hook;
      p.x = hk.x - PW / 2; p.y = hk.y + 18; p.vx = hk.vx; p.vy = 0; p.ground = false;
      if (dir) p.face = dir;
      if (p.buf > 0) { p.hook = null; p.hookCool = 1.1; p.vy = -280; p.sprung = true; p.buf = 0; window.SOUND.play('jump'); }
    } else if (p.swim) {
      const run = RUN * .72;
      if (dir) { p.vx += dir * 1500 * dt; p.face = dir; } else p.vx *= Math.pow(.15, dt);
      p.vx = Math.max(-run, Math.min(run, p.vx));
      if (p.buf > 0) { p.buf = 0; const nearTop = p.y < sw.surf + 8; p.vy = nearTop ? -760 : -330; p.sprung = nearTop; window.SOUND.play('jump'); for (let i = 0; i < 4; i++) L.fx.push({ type: 'bubble', x: p.x + PW / 2 + (Math.random() - .5) * 20, y: p.y + 10, vx: (Math.random() - .5) * 30, vy: -40, t: 0 }); }
      p.vy = Math.min(150, p.vy + 520 * dt);
      moveX(p, p.vx * dt); moveY(p, p.vy * dt);
      if (Math.random() < dt * 3) L.fx.push({ type: 'bubble', x: p.x + PW / 2, y: p.y + 6, vx: 0, vy: -30, t: 0 });
    } else {
      const run = RUN * (p.boost > 0 ? 1.45 : 1);
      const a = p.ground ? ACC : AIR_ACC;
      if (dir) { p.vx += dir * a * dt; p.face = dir; }
      else if (p.ground) { const s = Math.sign(p.vx); p.vx -= s * FRICT * dt; if (Math.sign(p.vx) !== s) p.vx = 0; }
      p.vx = Math.max(-run, Math.min(run, p.vx));
      p.coyote = p.ground ? 0.1 : Math.max(0, p.coyote - dt);
      if (p.buf > 0 && p.coyote > 0) { p.vy = -JUMP_V; p.coyote = 0; p.buf = 0; p.ground = false; p.on = null; window.SOUND.play('jump'); p.squash = -0.25; }
      if (p.vy >= 0) p.sprung = false;
      let g = (p.vy < 0 && !input.jump && !p.sprung) ? GRAV_FAST : GRAV;
      // updrafts
      for (const e of L.ents) if (e.t === 'updraft' && p.x + PW > e.x0 && p.x < e.x1 && p.y + PH > e.top) { g = 0; p.vy = Math.max(-720, p.vy - 5200 * dt); p.vx = Math.max(-120, Math.min(120, p.vx)); p.inUp = true; }
      p.vy = Math.min(1100, p.vy + g * dt);
      const wasGround = p.ground;
      moveX(p, p.vx * dt);
      // wind gusts and baggage belts
      for (const e of L.ents) {
        if (e.t === 'wind' && e.on && p.x + PW > e.x0 && p.x < e.x1 && p.y + PH > e.y0) moveX(p, e.dir * 150 * dt);
        if (e.t === 'belt' && p.ground && !p.on && p.x + PW / 2 > e.x0 && p.x + PW / 2 < e.x1 && Math.abs(p.y + PH - e.y) < 2) moveX(p, e.v * dt);
      }
      moveY(p, p.vy * dt);
      if (p.ground && !wasGround) p.squash = 0.22;
      // grab a crane hook
      if (!p.ground && p.hookCool <= 0) for (const e of L.ents) if (e.t === 'hook' && Math.abs(p.x + PW / 2 - e.x) < 30 && Math.abs(p.y - (e.y + 18)) < 34) { p.hook = e; window.SOUND.play('pop'); if (!L.hookMsg) { L.hookMsg = 1; say(e.x - 20, e.y - 30, 'Hang on! Jump to let go'); } break; }
    }
    // wind cycle
    for (const e of L.ents) if (e.t === 'wind') { e.on = ((L.time % e.per) / e.per) < .5; }

    p.squash *= Math.pow(0.0015, dt);
    if (p.ground && Math.abs(p.vx) > 20) p.runT += dt * Math.abs(p.vx) / 40;
    if (p.inv > 0) p.inv -= dt;
    p.still = (p.ground && Math.abs(p.vx) < 12) ? p.still + dt : 0;

    // safe spot: solid, non-tidal ground
    if (p.ground && !p.on) {
      const c = Math.floor((p.x + PW / 2) / T);
      const ok = k => L.top[k] != null && L.kind[k] !== 'tidal';
      if (ok(c) && ok(c - 1) && ok(c + 1) && Math.abs(p.y + PH - L.top[c] * T) < 2) L.safe = { x: c * T + (T - PW) / 2, y: L.top[c] * T };
    }
    if (p.y > VIEW_H + 40) {
      window.SOUND.play('splash'); L.falls = (L.falls || 0) + 1;
      respawn(); p.inv = 1.2;
      say(p.x - 10, p.y - 20, L.tideHigh ? 'The tide is in! Wait on the rocks' : 'Splash! Try again');
    }

    // items
    const pcx = p.x + PW / 2, pcy = p.y + PH / 2;
    for (const it of L.items) {
      if (it.taken) continue;
      if (it.photo) {
        const d = Math.abs(pcx - it.x);
        if (it.scared > 0) { it.prog = 0; continue; }
        if (d < 56 && Math.abs(pcy - it.y) < 50) { it.scared = 2.2; it.prog = 0; say(it.x - 30, it.y - 50, 'Too close! Keep your distance'); continue; }
        if (d < 230 && p.still > .15) { it.prog += dt; if (it.prog >= 1.1) { collect(it, 'Snap! Photo taken'); L.fx.push({ type: 'flash', t: 0 }); } }
        else it.prog = Math.max(0, it.prog - dt * 2);
        continue;
      }
      if (it.spot) {
        if (it.leap >= 0 && p.ground && Math.abs(pcx - it.x) < 300) collect(it, 'Dolphin spotted!');
        continue;
      }
      if (it.blink && !lit(it)) continue;
      if (it.land != null) continue;
      const rx = it.big ? 40 : 30, ry = it.big ? 38 : 34;
      if (Math.abs(pcx - it.x) < rx && Math.abs(pcy - it.y) < ry) {
        collect(it, it.bike ? 'Bike boost!' : it.pool && it.pool.kind === 'leaf' ? 'Caught!' : null);
        if (it.bike) p.boost = 6;
      }
    }
    // planters
    for (const e of L.ents) if (e.t === 'planter' && !e.planted && p.ground && Math.abs(pcx - e.x) < 26 && Math.abs(p.y + PH - e.y) < 4) {
      e.planted = true; e.grow = 0;
      collect({ x: e.x, y: e.y - 30, key: e.key }, 'Tree planted!');
    }
    for (const e of L.ents) if (e.t === 'planter' && e.planted) e.grow = Math.min(1, e.grow + dt * 2);

    // enemies
    for (const e of L.enemies) {
      if (!e.alive) { e.dead += dt; continue; }
      e.x += e.vx * dt;
      if (e.x < e.min) { e.x = e.min; e.vx = Math.abs(e.vx); }
      if (e.x > e.max) { e.x = e.max; e.vx = -Math.abs(e.vx); }
      if (p.x + PW > e.x + 4 && p.x < e.x + e.w - 4 && p.y + PH > e.y + 6 && p.y < e.y + e.h) {
        if (p.vy > 60 && p.y + PH - e.y < 26) {
          e.alive = false; e.dead = 0; p.vy = -560; window.SOUND.play('stomp'); L.score += 30;
          say(e.x, e.y - 10, 'Litter cleared!');
          for (let i = 0; i < 10; i++) L.fx.push({ type: 'spark', x: e.x + 20, y: e.y + 20, vx: (Math.random() - .5) * 300, vy: -Math.random() * 300, t: 0, col: '#9AA5B1' });
          hud();
        } else hurt(p.x < e.x ? -1 : 1);
      }
    }

    if (p.x + PW > L.flagX - 6) {
      L.over = 'win'; L.overT = 0; p.vx = 0; p.hook = null;
      window.SOUND.stopMusic(); window.SOUND.play('win');
      setTimeout(() => { if (L && L.over === 'win') cb.onWin && cb.onWin({ got: L.got, totals: L.totals, score: L.score, hearts: L.hearts }); }, 1900);
    }
    const target = p.x + PW / 2 - viewW * 0.38;
    L.cam += (target - L.cam) * Math.min(1, dt * 8);
    L.cam = Math.max(0, Math.min(L.cols * T - viewW, L.cam));
  }
  const lit = (it) => ((L.time + it.bph) % it.blink) < it.blink * .62;

  /* ---------------- Rendering ---------------- */
  function drawBG() {
    const bg = L.bg;
    if (bg.complete && bg.naturalWidth) {
      const sh = bg.naturalHeight * 0.8, h = VIEW_H, w = bg.naturalWidth * h / sh;
      const off = -(L.cam * 0.3) % (w * 2);
      for (let x = off; x < viewW + w; x += w) {
        const k = Math.round((x - off) / w);
        ctx.save();
        if (k % 2 === 1) { ctx.translate(x + w, 0); ctx.scale(-1, 1); ctx.drawImage(bg, 0, 0, bg.naturalWidth, sh, 0, 0, w, h); }
        else ctx.drawImage(bg, 0, 0, bg.naturalWidth, sh, x, 0, w, h);
        ctx.restore();
      }
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H); g.addColorStop(0, '#7CCBF2'); g.addColorStop(1, '#D8F1FF');
      ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, VIEW_H);
    }
    ctx.fillStyle = 'rgba(255,250,240,.12)'; ctx.fillRect(0, 0, viewW, VIEW_H);
  }

  function drawEnt(e, t) {
    const S = ctx;
    if (e.t === 'vent') {
      S.fillStyle = '#5A536B'; rr(e.x - 26, e.y - 14, 52, 18, 8); S.fill();
      S.fillStyle = '#FF8A3D'; S.beginPath(); S.ellipse(e.x, e.y - 12, 14, 5, 0, 0, TAU); S.fill();
      S.globalAlpha = .55; S.fillStyle = '#fff';
      for (let i = 0; i < 3; i++) { const k = (t * .8 + i / 3) % 1; S.beginPath(); S.arc(e.x + Math.sin(k * 6 + i) * 8, e.y - 18 - k * 70, 6 + k * 10, 0, TAU); S.fill(); }
      S.globalAlpha = 1;
    } else if (e.t === 'canopy') {
      S.fillStyle = '#5A3A1C'; S.fillRect(e.x - 10, e.y + 30, 18, VIEW_H); S.fillRect(e.x + e.w - 6, e.y + 30, 18, VIEW_H);
      S.fillStyle = '#3E9A47';
      for (let i = 0; i <= 6; i++) { S.beginPath(); S.arc(e.x + i * e.w / 6, e.y + 10 + (i % 2) * 14, 46, 0, TAU); S.fill(); }
      S.fillStyle = '#5CB85C';
      for (let i = 0; i < 6; i++) { S.beginPath(); S.arc(e.x + (i + .5) * e.w / 6, e.y - 6 + (i % 2) * 10, 30, 0, TAU); S.fill(); }
    } else if (e.t === 'cloud') {
      S.fillStyle = '#9AA3B5';
      for (let i = 0; i <= 5; i++) { S.beginPath(); S.arc(e.x + i * e.w / 5, e.y + (i % 2) * 10, 34, 0, TAU); S.fill(); }
      S.fillStyle = '#B9C0CE'; for (let i = 0; i < 5; i++) { S.beginPath(); S.arc(e.x + (i + .5) * e.w / 5, e.y - 14, 26, 0, TAU); S.fill(); }
    } else if (e.t === 'updraft') {
      S.save(); S.globalAlpha = .35; S.strokeStyle = '#fff'; S.lineWidth = 4; S.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const x = e.x0 + (i + .5) * (e.x1 - e.x0) / 4; for (let j = 0; j < 4; j++) { const y = VIEW_H - ((t * 160 + j * 110 + i * 40) % (VIEW_H - e.top)); S.beginPath(); S.moveTo(x, y); S.quadraticCurveTo(x + 10, y - 20, x, y - 40); S.stroke(); } }
      S.restore();
      S.fillStyle = 'rgba(255,255,255,.18)'; S.fillRect(e.x0, e.top, e.x1 - e.x0, VIEW_H - e.top);
    } else if (e.t === 'wind') {
      if (!e.on) return;
      S.save(); S.globalAlpha = .6; S.strokeStyle = '#fff'; S.lineWidth = 3; S.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const y = e.y0 + 20 + i * (e.y1 - e.y0 - 30) / 7, x = e.x1 - ((t * 420 + i * 97) % (e.x1 - e.x0)); S.beginPath(); S.moveTo(x, y); S.lineTo(x + 46, y); S.stroke(); }
      S.restore();
    } else if (e.t === 'planter') {
      S.fillStyle = '#8A5A2B'; rr(e.x - 22, e.y - 12, 44, 14, 4); S.fill(); S.strokeStyle = '#5C3A1C'; S.lineWidth = 2.5; S.stroke();
      S.fillStyle = '#5C3A1C'; S.fillRect(e.x - 18, e.y - 12, 36, 4);
      if (e.planted) { const g = .35 + e.grow * .65; window.ART.drawItem(S, 'tree', e.x, e.y - 12 - 22 * g, 22 * g, t); }
      else { S.globalAlpha = .55 + Math.sin(t * 5) * .25; S.fillStyle = '#FFF3B0'; S.beginPath(); S.moveTo(e.x, e.y - 22); S.lineTo(e.x - 8, e.y - 34); S.lineTo(e.x + 8, e.y - 34); S.fill(); S.globalAlpha = 1; }
    } else if (e.t === 'stall') {
      for (let i = 0; i < 3; i++) { const x = e.x + i * e.w / 3; S.fillStyle = '#8A5A2B'; S.fillRect(x + 8, e.y - 30, 6, 30); S.fillRect(x + e.w / 3 - 18, e.y - 30, 6, 30); S.fillStyle = '#F3DDB0'; rr(x + 4, e.y - 34, e.w / 3 - 14, 10, 4); S.fill(); }
    } else if (e.t === 'hook') {
      // crane jib along the top, cable and hook
      S.fillStyle = '#F2B33D'; S.fillRect(e.xa - 40, 72, e.xb - e.xa + 80, 12);
      S.strokeStyle = '#8A5A10'; S.lineWidth = 2; for (let x = e.xa - 40; x < e.xb + 40; x += 22) { S.beginPath(); S.moveTo(x, 72); S.lineTo(x + 11, 84); S.lineTo(x + 22, 72); S.stroke(); }
      S.fillStyle = '#3B4A5C'; rr(e.x - 14, 78, 28, 12, 3); S.fill();
      S.strokeStyle = '#3B4A5C'; S.lineWidth = 3; S.beginPath(); S.moveTo(e.x, 90); S.lineTo(e.x, e.y); S.stroke();
      S.strokeStyle = '#E8423A'; S.lineWidth = 6; S.lineCap = 'round'; S.beginPath(); S.arc(e.x, e.y + 8, 10, -Math.PI * .1, Math.PI * 1.05); S.stroke(); S.lineCap = 'butt';
      S.fillStyle = '#FFC93D'; rr(e.x - 8, e.y - 8, 16, 10, 3); S.fill();
    } else if (e.t === 'egrets') {
      for (let i = 0; i < 2; i++) window.ART.drawItem(S, 'egret', e.x + (i + .3) * e.w / 2, WATER_Y - 6 + Math.sin(t + i) * 2, 15, t);
    } else if (e.t === 'belt') {
      S.fillStyle = '#3B4048'; S.fillRect(e.x0, e.y - 4, e.x1 - e.x0, 12);
      S.fillStyle = '#FFC93D'; for (let x = e.x0 + ((t * e.v) % 30); x < e.x1 - 8; x += 30) { S.beginPath(); S.moveTo(x, e.y - 2); S.lineTo(x + 8, e.y + 2); S.lineTo(x, e.y + 6); S.fill(); }
    } else if (e.t === 'dolphin') {
      const it = e.it;
      if (it.leap >= 0) { S.save(); S.translate(it.x, it.y); S.rotate((it.leap - .5) * 1.6); window.ART.drawItem(S, 'dolphin', 0, 0, 26, t); S.restore(); if (it.leap > .85) L.fx.push({ type: 'spark', x: it.x, y: WATER_Y + 6, vx: (Math.random() - .5) * 200, vy: -150, t: 0, col: '#BFE7FB' }); }
      else { S.globalAlpha = .5; S.strokeStyle = '#fff'; S.lineWidth = 3; S.beginPath(); S.ellipse(it.dx, WATER_Y + 18, 20 + Math.sin(t * 4) * 4, 5, 0, 0, TAU); S.stroke(); S.globalAlpha = 1; }
    } else if (e.t === 'tower') {
      // cable-stayed pylon with a crossbeam knot, cables fanning to the deck
      const top = e.y - 330, lx = e.x - 26, rx = e.x + 26;
      S.strokeStyle = 'rgba(160,172,194,.9)'; S.lineWidth = 2;
      for (let i = 1; i <= 6; i++) { const ay = top + 40 + i * 16; S.beginPath(); S.moveTo(lx, ay); S.lineTo(e.x - 40 - i * 46, e.y - 6); S.moveTo(rx, ay); S.lineTo(e.x + 40 + i * 46, e.y - 6); S.stroke(); }
      S.fillStyle = '#F4F6FA'; S.strokeStyle = '#4A5A78'; S.lineWidth = 3;
      for (const sx of [-1, 1]) { const x = e.x + sx * 26; S.beginPath(); S.moveTo(x - 11, e.y); S.lineTo(x - 7, top); S.lineTo(x + 7, top); S.lineTo(x + 11, e.y); S.closePath(); S.fill(); S.stroke(); }
      rr(e.x - 34, top + 18, 68, 16, 6); S.fill(); S.stroke();
      S.beginPath(); S.arc(e.x, top + 58, 15, 0, TAU); S.fill(); S.stroke();
      S.beginPath(); S.arc(e.x, top + 58, 6, 0, TAU); S.strokeStyle = '#8C99B3'; S.stroke();
      S.fillStyle = '#F4F6FA'; S.strokeStyle = '#4A5A78'; rr(e.x - 34, e.y - 150, 68, 12, 5); S.fill(); S.stroke();
    } else if (e.t === 'swim') {
      S.fillStyle = 'rgba(44,143,203,.55)'; S.fillRect(e.x0, e.surf, e.x1 - e.x0, VIEW_H - e.surf);
      S.strokeStyle = 'rgba(255,255,255,.8)'; S.lineWidth = 3; S.beginPath();
      for (let x = e.x0; x <= e.x1; x += 30) S.lineTo(x, e.surf + Math.sin(t * 3 + x * .05) * 4); S.stroke();
      // immersed tunnel tube on the seabed
      S.fillStyle = '#C9CED6'; rr(e.x0 + 10, 11 * T - 34, e.x1 - e.x0 - 20, 34, 14); S.fill(); S.strokeStyle = '#4A5A78'; S.lineWidth = 3; S.stroke();
      S.fillStyle = '#FFE36B'; for (let x = e.x0 + 40; x < e.x1 - 30; x += 70) S.fillRect(x, 11 * T - 22, 22, 8);
    }
  }

  function drawRock(x, y, w) {
    // brown volcanic boulders, like the rocks along the Sharp Island sandbar
    ctx.fillStyle = '#9C7A5B'; ctx.strokeStyle = '#5E4532'; ctx.lineWidth = 3;
    rr(x + 2, y, w - 4, VIEW_H - y + 20, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(x + 10, y + 6, w - 26, 9, 5); ctx.fill();
    ctx.fillStyle = 'rgba(70,45,30,.25)';
    for (let i = 0; i < w / 30; i++) { ctx.beginPath(); ctx.ellipse(x + 18 + i * 30, y + 34 + (i % 2) * 22, 8, 5, 0, 0, TAU); ctx.fill(); }
  }

  function drawPlat(pl, t) {
    if (!pl.solid && pl.type === 'lily') { ctx.globalAlpha = .3; }
    const sq = pl.squish ? Math.sin(pl.squish * Math.PI) * 6 : 0;
    if (pl.look === 'hex') {
      ctx.fillStyle = '#9A93A8'; rr(pl.x, pl.y, pl.w, VIEW_H - pl.y + 20, 8); ctx.fill(); ctx.strokeStyle = '#5A536B'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#C9C2D6'; rr(pl.x, pl.y, pl.w, 14, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#6F6880'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pl.x + pl.w / 2, pl.y + 16); ctx.lineTo(pl.x + pl.w / 2, VIEW_H); ctx.stroke();
    } else if (pl.look === 'lily') {
      ctx.fillStyle = '#4FA34A'; ctx.beginPath(); ctx.ellipse(pl.x + pl.w / 2, pl.y + 8, pl.w / 2, 11, 0, .25, TAU - .05); ctx.lineTo(pl.x + pl.w / 2, pl.y + 8); ctx.fill(); ctx.strokeStyle = '#2A7535'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#F7A8BE'; ctx.beginPath(); ctx.arc(pl.x + pl.w * .3, pl.y + 4, 6, 0, TAU); ctx.fill();
      if (pl.sink > 0 && pl.solid) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(pl.x + pl.w / 2, pl.y + 16, pl.w / 2 + 6, 4, 0, 0, TAU); ctx.fill(); }
    } else if (pl.look === 'branch') {
      ctx.save(); ctx.translate(0, sq);
      ctx.fillStyle = '#7A4E2D'; rr(pl.x, pl.y + 4, pl.w, 14, 7); ctx.fill(); ctx.strokeStyle = '#4A2E16'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#5CC15A'; for (let x = pl.x + 6; x < pl.x + pl.w; x += 18) { ctx.beginPath(); ctx.ellipse(x, pl.y + 2, 10, 6, -.4, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#FFC93D'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(pl.x + pl.w / 2 - 12 + i * 8, pl.y + 22); ctx.lineTo(pl.x + pl.w / 2 - 8 + i * 8, pl.y + 30); } ctx.stroke();
      ctx.restore();
    } else if (pl.look === 'awning') {
      ctx.save(); ctx.translate(0, sq);
      ctx.fillStyle = '#8A5A2B'; ctx.fillRect(pl.x + 6, pl.y + 10, 6, VIEW_H); ctx.fillRect(pl.x + pl.w - 12, pl.y + 10, 6, VIEW_H);
      window.ART.drawPlatform(ctx, pl.x, pl.y, pl.w, T, 'street', t);
      ctx.restore();
    } else if (pl.look === 'bus') {
      window.ART.drawItem(ctx, 'shuttle', pl.x + pl.w / 2, pl.y + 26, pl.w / 2, t);
    } else if (pl.look === 'roof') {
      ctx.fillStyle = '#E8EEF3'; rr(pl.x, pl.y, pl.w, VIEW_H - pl.y, 6); ctx.fill(); ctx.strokeStyle = '#525B69'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#8FC1FF'; for (let y = pl.y + 26; y < VIEW_H; y += 30) for (let x = pl.x + 12; x < pl.x + pl.w - 14; x += 24) ctx.fillRect(x, y, 13, 14);
      ctx.fillStyle = '#6CC46A'; rr(pl.x - 3, pl.y - 6, pl.w + 6, 12, 6); ctx.fill(); ctx.strokeStyle = '#2A7535'; ctx.lineWidth = 2.5; ctx.stroke();
    } else if (pl.type === 'cloudp') {
      window.ART.drawPlatform(ctx, pl.x, pl.y, pl.w, T, 'sky', t);
    } else window.ART.drawPlatform(ctx, pl.x, pl.y, pl.w, T, L.style, t);
    ctx.globalAlpha = 1;
  }

  function render() {
    if (!L || !ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawBG();
    const t = L.time;
    ctx.save();
    ctx.translate(-Math.round(L.cam), 0);
    const x0 = L.cam - 80, x1 = L.cam + viewW + 80;
    const c0 = Math.max(0, Math.floor(L.cam / T) - 1), c1 = Math.min(L.cols - 1, Math.ceil((L.cam + viewW) / T) + 1);

    window.ART.drawWater(ctx, c0 * T, c1 * T + T, WATER_Y, VIEW_H - WATER_Y, t, L.style);
    // background-layer entities
    for (const e of L.ents) { const ex = e.x != null ? e.x : e.x0 != null ? e.x0 : e.xa; if (['tower', 'canopy', 'cloud', 'updraft', 'stall'].includes(e.t) && ex < x1 + 400 && ex > x0 - 900) drawEnt(e, t); }

    // ground
    const drawRun = (a, b, tp) => L.kind[a] === 'rock' ? drawRock(a * T, tp * T, (b - a + 1) * T) : window.ART.drawGround(ctx, a * T, tp * T, (b - a + 1) * T, VIEW_H - tp * T, L.kind[a] === 'rock' ? 'columns' : L.kind[a] === 'seabed' ? 'sandbar' : L.style, T);
    if (L.style === 'columns') {
      for (let c = c0; c <= c1; c++) { const tp = L.top[c]; if (tp == null) continue; window.ART.drawGround(ctx, c * T + 1, tp * T, T - 2, VIEW_H - tp * T, L.style, T); }
    } else {
      let c = c0;
      while (c <= c1) {
        const tp = L.top[c]; if (tp == null) { c++; continue; }
        let e = c; while (e + 1 <= c1 && L.top[e + 1] === tp && L.kind[e + 1] === L.kind[c]) e++;
        if (L.kind[c] === 'tidal' && L.tideLevel > 0) { ctx.globalAlpha = 1 - L.tideLevel * .55; drawRun(c, e, tp); ctx.globalAlpha = 1; }
        else drawRun(c, e, tp);
        c = e + 1;
      }
    }
    // high tide water over the sandbar
    if (L.style === 'sandbar' && L.tideLevel > 0) {
      for (let c = c0; c <= c1; c++) if (L.kind[c] === 'tidal') {
        const y = WATER_Y - L.tideLevel * (WATER_Y - (L.top[c] - .35) * T);
        ctx.fillStyle = 'rgba(47,180,216,.85)'; ctx.fillRect(c * T, y, T + 1, VIEW_H - y);
        ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(c * T, y, T + 1, 4);
      }
    }
    for (const e of L.ents) { const ex = e.x != null ? e.x : e.x0 != null ? e.x0 : e.xa; if (!['tower', 'canopy', 'cloud', 'updraft', 'stall', 'swim', 'dolphin'].includes(e.t) && (e.t === 'hook' || (ex < x1 && ex > x0 - 600))) drawEnt(e, t); }
    for (const pl of L.plats) if (pl.x + pl.w > x0 && pl.x < x1) drawPlat(pl, t);
    for (const b of L.blocks) window.ART.drawBlock(ctx, b.c * T, b.r * T - Math.sin(b.bump * Math.PI) * 10, T, b.used, t);
    window.ART.drawFlag(ctx, L.flagX, L.flagH * T, T * 4.4, t, L.site.color, L.over === 'win' ? L.flagRaise : 0);

    // items
    for (const it of L.items) {
      if (it.spot) continue;
      if (it.x < x0 || it.x > x1) continue;
      if (it.photo) { drawBird(it, t); continue; }
      if (it.taken) continue;
      const still = it.follow || it.path || it.belt || it.pool;
      const bob = still ? 0 : Math.sin(t * 3 + it.ph) * 4;
      const rare = it.key !== L.keys[0];
      let alpha = 1;
      if (it.land != null) alpha = Math.max(0, 1 - it.land / .9);
      const on = !it.blink || lit(it);
      ctx.save();
      ctx.globalAlpha = alpha * (on ? 1 : .35);
      if (it.sign) { ctx.strokeStyle = '#5C3A1C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(it.x - 34, it.y - 30); ctx.lineTo(it.x - 34, it.y + 30); ctx.stroke(); }
      if (on) { ctx.globalAlpha *= .55; ctx.fillStyle = rare ? '#FFF3B0' : '#FFFFFF'; ctx.beginPath(); ctx.arc(it.x, it.y + bob, it.big ? 32 : rare ? 24 : 21, 0, TAU); ctx.fill(); ctx.globalAlpha = alpha * (on ? 1 : .35); }
      if (it.path === 'fly' || it.path === 'sail') { ctx.translate(it.x, it.y); if (it.dir < 0) ctx.scale(-1, 1); window.ART.drawItem(ctx, it.key, 0, 0, it.big ? 30 : 22, t + it.ph); }
      else window.ART.drawItem(ctx, it.key, it.x, it.y + bob, it.big ? 28 : rare ? 19 : 16, t + it.ph);
      ctx.restore();
    }
    for (const e of L.ents) if (e.t === 'dolphin') drawEnt(e, t);
    for (const e of L.enemies) {
      if (!e.alive) { if (e.dead < .35) { ctx.save(); ctx.globalAlpha = 1 - e.dead / .35; window.ART.drawLitter(ctx, e.x, e.y, e.w, e.h, t, Math.min(1, e.dead * 6)); ctx.restore(); } continue; }
      window.ART.drawLitter(ctx, e.x, e.y, e.w, e.h, t);
    }
    drawPlayer(t);
    for (const e of L.ents) if (e.t === 'swim' && e.x1 > x0 && e.x0 < x1) drawEnt(e, t);
    // fx
    for (const f of L.fx) {
      if (f.type === 'spark') { ctx.globalAlpha = Math.max(0, 1 - f.t / .5); ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(f.x, f.y, 4, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      else if (f.type === 'bubble') { ctx.globalAlpha = Math.max(0, 1 - f.t / .9); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x, f.y, 5, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
      else if (f.type === 'puff') { ctx.globalAlpha = Math.max(0, .7 - f.t); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x, f.y - f.t * 40, 12 + f.t * 30, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      else if (f.type === 'popitem') { const k = f.t / .7; ctx.globalAlpha = 1 - k * k; window.ART.drawItem(ctx, f.key, f.x, f.y - 20 - k * 60, 18, t); ctx.globalAlpha = 1; }
      else if (f.type === 'text') {
        ctx.globalAlpha = Math.max(0, Math.min(1, 2.4 - f.t * 2));
        ctx.font = '700 22px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText(f.s, f.x + 20, f.y - f.t * 40);
        ctx.fillStyle = '#2B6E3A'; ctx.fillText(f.s, f.x + 20, f.y - f.t * 40);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
    // screen-space overlays
    for (const f of L.fx) if (f.type === 'flash') { ctx.fillStyle = `rgba(255,255,255,${.7 * (1 - f.t / .35)})`; ctx.fillRect(0, 0, viewW, VIEW_H); }
    if (L.tideMsg) banner(L.tideMsg, L.tideHigh ? '#137E8E' : '#B4521C');
    else if (L.p.boost > 0) banner('Bike boost!', '#A8324F');
  }

  function banner(s, col) {
    ctx.font = '700 24px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'center';
    const w = ctx.measureText(s).width + 40, x = viewW / 2, y = 96;
    ctx.fillStyle = 'rgba(255,255,255,.95)'; rr(x - w / 2, y - 26, w, 40, 20); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = col; ctx.fillText(s, x, y + 2);
  }

  function drawBird(it, t) {
    const fly = it.scared > 0;
    const y = fly ? it.y - (2.2 - it.scared) * 120 : it.y;
    ctx.save(); ctx.globalAlpha = it.taken ? .85 : 1;
    window.ART.drawItem(ctx, it.key, it.x, y, 22, fly ? t * 3 : t);
    ctx.restore();
    if (it.taken) { ctx.fillStyle = '#3FA34D'; ctx.beginPath(); ctx.arc(it.x + 22, it.y - 26, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(it.x + 16, it.y - 26); ctx.lineTo(it.x + 21, it.y - 21); ctx.lineTo(it.x + 28, it.y - 31); ctx.stroke(); return; }
    if (fly) return;
    // camera hint + progress ring
    ctx.save(); ctx.translate(it.x, it.y - 52);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#E6A817'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 17, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, it.prog / 1.1)); ctx.stroke();
    ctx.fillStyle = '#5C3A1C'; rr(-9, -5, 18, 12, 3); ctx.fill(); ctx.fillRect(-3, -8, 6, 4);
    ctx.fillStyle = '#9ED9F6'; ctx.beginPath(); ctx.arc(0, 1, 3.5, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawPlayer(t) {
    const p = L.p;
    if (p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0) return;
    const im = L.player, w = 62, h = 80;
    const sq = p.squash, sx = 1 + sq * .6, sy = 1 - sq * .7;
    const run = p.ground && Math.abs(p.vx) > 20;
    const bob = run ? Math.abs(Math.sin(p.runT * 1.4)) * -5 : 0;
    let tilt = run ? Math.sin(p.runT * 1.4) * .06 + p.vx / RUN * .06 : (p.ground ? 0 : p.vx / RUN * .1);
    if (p.hook) tilt = Math.sin(t * 3) * .12;
    if (p.swim) tilt = Math.sin(t * 4) * .15;
    ctx.save();
    ctx.translate(p.x + PW / 2, p.y + PH + bob);
    if (p.ground) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 5, 0, 0, TAU); ctx.fill(); }
    if (p.boost > 0 && p.ground) window.ART.drawItem(ctx, 'bike', 0, -8, 22, t);
    ctx.rotate(tilt);
    ctx.scale(sx * (p.face < 0 ? -1 : 1), sy);
    if (im.complete && im.naturalWidth) ctx.drawImage(im, -w / 2, -h + 4, w, h);
    else { ctx.fillStyle = '#5B8FD9'; ctx.beginPath(); ctx.arc(0, -h / 2, w / 2, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!manual && !paused) { acc += dt; while (acc >= 1 / 60) { update(1 / 60); acc -= 1 / 60; } }
    render();
    raf = requestAnimationFrame(loop);
  }

  // test hooks
  window.advanceTime = (ms) => { manual = true; const n = Math.round(ms / (1000 / 60)); for (let i = 0; i < n; i++) update(1 / 60); render(); };
  window.render_game_to_text = () => {
    if (!L) return JSON.stringify({ mode: 'no-level' });
    const p = L.p;
    return JSON.stringify({ site: L.site.id, x: Math.round(p.x), y: Math.round(p.y), vx: Math.round(p.vx), vy: Math.round(p.vy), ground: p.ground, hook: !!p.hook, swim: p.swim, hearts: L.hearts, got: L.got, totals: L.totals, over: L.over, flagX: L.flagX, cols: L.cols, tideHigh: L.tideHigh,
      enemiesNear: L.enemies.filter(e => e.alive && Math.abs(e.x - p.x) < 400).map(e => Math.round(e.x - p.x)) });
  };
  window.__level = () => L;
  window.__build = build;

  window.GAME = { start, stop, resize, input, render, get active() { return !!L; }, set paused(v) { paused = v; acc = 0; }, get paused() { return paused; } };
  window.addEventListener('resize', () => { if (L) { resize(); render(); } });
})();
