/* Geography Buddy platformer — a small Mario-style side-scroller drawn on canvas. */
(function () {
  const T = 45, ROWS = 12, VIEW_H = ROWS * T;
  const GRAV = 2300, GRAV_FAST = 4600, JUMP_V = 880, RUN = 290, ACC = 2600, AIR_ACC = 1900, FRICT = 2600;
  const PW = 34, PH = 46;

  let canvas, ctx, dpr = 1, scale = 1, viewW = 960;
  let L = null; // current level state
  let raf = 0, last = 0, acc = 0, running = false, manual = false, paused = false;
  const input = { left: false, right: false, jump: false, jumpPressed: false, steer: false, pointerX: null };
  const imgs = {};
  let cb = {};

  function img(src) {
    if (imgs[src]) return imgs[src];
    const i = new Image(); i.src = src; imgs[src] = i; return i;
  }

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------------- Level generation ---------------- */
  const PLAN = {
    columns: ['flat', 'pillars', 'blocks', 'gap', 'pillars', 'blocks', 'step', 'pillars', 'blocks', 'flat'],
    sandbar: ['flat', 'gap', 'blocks', 'hops', 'flat', 'blocks', 'gap', 'hops', 'blocks', 'flat'],
    forest:  ['flat', 'float', 'blocks', 'step', 'float', 'blocks', 'gap', 'float', 'blocks', 'flat'],
    wetland: ['flat', 'hops', 'blocks', 'gap', 'step', 'blocks', 'hops', 'float', 'blocks', 'flat'],
    city:    ['flat', 'step', 'blocks', 'gap', 'float', 'blocks', 'step', 'gap', 'blocks', 'flat'],
    sky:     ['flat', 'float', 'blocks', 'gap', 'float', 'blocks', 'step', 'float', 'blocks', 'flat'],
    street:  ['flat', 'step', 'blocks', 'float', 'step', 'blocks', 'gap', 'float', 'blocks', 'flat'],
    newtown: ['flat', 'hops', 'blocks', 'gap', 'float', 'blocks', 'hops', 'step', 'blocks', 'flat'],
    airport: ['flat', 'float', 'blocks', 'step', 'gap', 'blocks', 'float', 'gap', 'blocks', 'flat']
  };

  function build(site, seedIdx) {
    const rand = mulberry(1234 + seedIdx * 97);
    const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
    const style = site.style;
    const [A, B, C] = site.items.map(i => i.key);
    const top = []; // ground top row per column (null = gap)
    const items = [], enemies = [], blocks = [], plats = [];
    let c = 0, h = 9;
    const put = (n, hh) => { for (let i = 0; i < n; i++) top[c++] = hh; };
    const gap = (n) => { for (let i = 0; i < n; i++) top[c++] = null; };
    const item = (col, row, key) => items.push({ x: col * T + T / 2, y: row * T + T / 2, key, taken: false, ph: rand() * 6 });
    const line = (c0, n, row, key) => { for (let i = 0; i < n; i++) item(c0 + i, row, key); };
    const enemy = (c0, c1, hh) => enemies.push({ x: (c0 + (c1 - c0) / 2) * T, y: hh * T - 40, w: 40, h: 40, vx: (rand() < .5 ? -1 : 1) * 60, min: c0 * T + 4, max: c1 * T - 44, alive: true, squash: 0, dead: 0 });

    put(8, 9);
    line(4, 3, 7, A);
    const plan = PLAN[style] || PLAN.forest;
    plan.forEach((f, idx) => {
      if (f === 'flat') {
        const n = ri(6, 8); const c0 = c; put(n, h);
        line(c0 + 1, 3, h - 2, A);
        if (c0 > 12) enemy(c0 + 2, c0 + n - 1, h);
      } else if (f === 'gap') {
        const w = 2; const c0 = c;
        // arc of items over the gap
        item(c0 - 0.5 + 0, h - 2, A); item(c0 + w / 2 - .5, h - 3, A); item(c0 + w - .5, h - 2, A);
        gap(w);
        const nh = Math.max(7, Math.min(10, h + ri(-1, 1))); h = nh; put(ri(3, 4), h);
      } else if (f === 'step') {
        const dir = h >= 9 ? -1 : (h <= 7 ? 1 : (rand() < .5 ? -1 : 1));
        for (let k = 0; k < 2; k++) { h = Math.max(6, Math.min(10, h + dir)); const c0 = c; put(3, h); item(c0 + 1, h - 1, A); }
        const c0 = c; put(5, h); if (c0 > 12) enemy(c0, c0 + 5, h);
      } else if (f === 'pillars') {
        const n = ri(3, 4);
        for (let k = 0; k < n; k++) {
          gap(k === 0 ? 1 : 2);
          const ph = Math.max(6, Math.min(10, h + ri(-1, 1)));
          const w = 3; const c0 = c; put(w, ph); item(c0 + 1, ph - 1, k % 2 ? B : A);
          h = ph;
        }
        gap(1); h = Math.max(7, Math.min(10, h)); put(3, h);
      } else if (f === 'float') {
        const c0 = c; put(1, h);
        const w = 4; gap(w);
        const pr = h - 3;
        plats.push({ x: (c0 + 1) * T + 6, y: pr * T, w: w * T - 12 });
        line(c0 + 1.5, 3, pr - 1, B);
        put(4, h);
      } else if (f === 'hops') {
        const c0 = c; gap(5);
        plats.push({ x: (c0 + 1.3) * T, y: (h - 1) * T, w: 2.4 * T });
        item(c0 + 2, h - 2.2, B); item(c0 + 0.2, h - 2, A); item(c0 + 4, h - 2, A);
        put(4, h);
      } else if (f === 'blocks') {
        const c0 = c; put(8, h);
        const br = h - 4;
        blocks.push({ c: c0 + 2, r: br, used: false, give: A, bump: 0 });
        blocks.push({ c: c0 + 3, r: br, used: false, give: C, bump: 0 });
        blocks.push({ c: c0 + 4, r: br, used: false, give: B, bump: 0 });
        item(c0 + 3, br - 1, A);
        if (idx > 3) enemy(c0 + 5, c0 + 7, h);
      }
    });
    // Finish
    const finish = c; put(16, h);
    line(finish + 1, 3, h - 2, A);
    const flagX = (finish + 9) * T;

    const totals = {}; [A, B, C].forEach(k => totals[k] = 0);
    items.forEach(i => totals[i.key]++);
    blocks.forEach(b => totals[b.give]++);
    return { top, cols: top.length, items, enemies, blocks, plats, flagX, flagH: h, totals, style };
  }

  /* ---------------- Collision helpers ---------------- */
  function solidAt(c, r) {
    if (c < 0) return true;
    if (c >= L.cols) return true;
    if (r < 0) return false;
    const t = L.top[c];
    if (t != null && r >= t) return true;
    return !!L.blockMap[c + ',' + r];
  }

  function moveX(p, dx) {
    p.x += dx;
    const r0 = Math.floor((p.y + 2) / T), r1 = Math.floor((p.y + PH - 2) / T);
    if (dx > 0) {
      const c = Math.floor((p.x + PW) / T);
      for (let r = r0; r <= r1; r++) if (solidAt(c, r)) { p.x = c * T - PW - 0.01; p.vx = 0; break; }
    } else if (dx < 0) {
      const c = Math.floor(p.x / T);
      for (let r = r0; r <= r1; r++) if (solidAt(c, r)) { p.x = (c + 1) * T + 0.01; p.vx = 0; break; }
    }
  }
  function moveY(p, dy) {
    const prevBottom = p.y + PH;
    p.y += dy;
    const c0 = Math.floor((p.x + 3) / T), c1 = Math.floor((p.x + PW - 3) / T);
    p.ground = false;
    if (dy > 0) {
      const r = Math.floor((p.y + PH) / T);
      for (let c = c0; c <= c1; c++) if (solidAt(c, r) && r >= 0) { p.y = r * T - PH; p.vy = 0; p.ground = true; break; }
      if (!p.ground) {
        for (const pl of L.plats) {
          if (p.x + PW > pl.x + 2 && p.x < pl.x + pl.w - 2 && prevBottom <= pl.y + 1 && p.y + PH >= pl.y) { p.y = pl.y - PH; p.vy = 0; p.ground = true; break; }
        }
      }
    } else if (dy < 0) {
      const r = Math.floor(p.y / T);
      for (let c = c0; c <= c1; c++) if (solidAt(c, r)) {
        p.y = (r + 1) * T; p.vy = 40;
        const b = L.blockMap[c + ',' + r];
        // hit the block closest to the player's centre
        const cc = Math.floor((p.x + PW / 2) / T);
        const hit = L.blockMap[cc + ',' + r] || b;
        if (hit) bumpBlock(hit); else window.SOUND.play('bump');
        break;
      }
    }
  }

  function bumpBlock(b) {
    b.bump = 1;
    if (b.used) { window.SOUND.play('bump'); return; }
    b.used = true;
    window.SOUND.play('pop');
    const it = { x: b.c * T + T / 2, y: b.r * T - T / 2, key: b.give, taken: false, ph: 0, rise: 1 };
    collect(it, true);
    L.fx.push({ type: 'popitem', key: b.give, x: it.x, y: b.r * T, t: 0 });
  }

  /* ---------------- Game flow ---------------- */
  function collect(it, fromBlock) {
    it.taken = true;
    L.got[it.key] = (L.got[it.key] || 0) + 1;
    L.score += it.key === L.keys[2] ? 50 : it.key === L.keys[1] ? 20 : 10;
    const rare = it.key !== L.keys[0];
    window.SOUND.play(rare ? 'rare' : 'coin');
    for (let i = 0; i < 8; i++) L.fx.push({ type: 'spark', x: it.x, y: it.y, vx: Math.cos(i / 8 * 6.28) * 160, vy: Math.sin(i / 8 * 6.28) * 160, t: 0, col: L.site.color });
    if (!L.seen[it.key]) { L.seen[it.key] = true; cb.onDiscover && cb.onDiscover(it.key); }
    hud();
  }

  function hurt(knock) {
    const p = L.p;
    if (p.inv > 0 || L.over) return;
    L.hearts--;
    window.SOUND.play('hurt');
    p.inv = 1.6;
    p.vy = -520; p.vx = knock * 260;
    hud();
    if (L.hearts <= 0) { L.over = 'lose'; L.overT = 0; window.SOUND.stopMusic(); setTimeout(() => cb.onLose && cb.onLose(), 900); }
  }

  function respawn() {
    const p = L.p;
    p.x = L.safe.x; p.y = L.safe.y - PH - 2; p.vx = 0; p.vy = 0;
  }

  function hud() {
    cb.onHud && cb.onHud({ got: L.got, totals: L.totals, hearts: L.hearts, score: L.score });
  }

  function start(site, idx, callbacks) {
    cb = callbacks || {};
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    const lv = build(site, idx);
    const blockMap = {}; lv.blocks.forEach(b => blockMap[b.c + ',' + b.r] = b);
    L = Object.assign(lv, {
      site, keys: site.items.map(i => i.key), blockMap,
      p: { x: 2 * T, y: 9 * T - PH, vx: 0, vy: 0, ground: false, face: 1, inv: 0, coyote: 0, buf: 0, squash: 0, runT: 0 },
      cam: 0, time: 0, got: {}, seen: {}, hearts: 3, score: 0, fx: [], over: null, overT: 0, flagRaise: 0,
      safe: { x: 2 * T, y: 9 * T }, bg: img(site.bg), player: img('img/player.webp')
    });
    L.keys.forEach(k => L.got[k] = 0);
    resize();
    hud();
    input.left = input.right = input.jump = false; input.jumpPressed = false; input.steer = false;
    running = true; last = performance.now(); acc = 0;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  }

  function stop() { running = false; cancelAnimationFrame(raf); L = null; }

  function resize() {
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    scale = canvas.height / VIEW_H;
    viewW = canvas.width / scale;
  }

  function update(dt) {
    if (!L) return;
    L.time += dt;
    const p = L.p;
    // fx
    L.fx = L.fx.filter(f => { f.t += dt; if (f.type === 'spark') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 400 * dt; } return f.t < (f.type === 'text' ? 1.1 : f.type === 'popitem' ? .7 : .5); });
    L.blocks.forEach(b => b.bump = Math.max(0, b.bump - dt * 6));

    if (L.over === 'win') {
      L.overT += dt; L.flagRaise = Math.min(1, L.flagRaise + dt * 1.2);
      // walk to the flag and celebrate
      p.vx = 0; p.vy += GRAV * dt; moveY(p, p.vy * dt);
      if (p.ground && L.overT > .4 && L.overT < 1.4 && Math.floor(L.overT * 3) % 2 === 0) p.vy = -420;
      return;
    }
    if (L.over === 'lose') { L.overT += dt; return; }

    // horizontal
    let dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    // mouse steering: Buddy runs towards the mouse pointer (laptops)
    if (!dir && input.steer && input.pointerX != null) {
      const bx = (p.x + PW / 2 - L.cam) * scale / dpr;
      const dx = input.pointerX - bx;
      if (Math.abs(dx) > 34) dir = Math.sign(dx);
    }
    const a = p.ground ? ACC : AIR_ACC;
    if (dir) { p.vx += dir * a * dt; p.face = dir; }
    else if (p.ground) { const s = Math.sign(p.vx); p.vx -= s * FRICT * dt; if (Math.sign(p.vx) !== s) p.vx = 0; }
    p.vx = Math.max(-RUN, Math.min(RUN, p.vx));

    // jump with coyote time + buffer
    p.coyote = p.ground ? 0.1 : Math.max(0, p.coyote - dt);
    if (input.jumpPressed) { p.buf = 0.13; input.jumpPressed = false; }
    else p.buf = Math.max(0, p.buf - dt);
    if (p.buf > 0 && p.coyote > 0) { p.vy = -JUMP_V; p.coyote = 0; p.buf = 0; p.ground = false; window.SOUND.play('jump'); p.squash = -0.25; }

    const g = (p.vy < 0 && !input.jump) ? GRAV_FAST : GRAV;
    p.vy = Math.min(1100, p.vy + g * dt);
    const wasGround = p.ground;
    moveX(p, p.vx * dt);
    moveY(p, p.vy * dt);
    if (p.ground && !wasGround) { p.squash = 0.22; }
    p.squash *= Math.pow(0.0015, dt);
    if (p.ground && Math.abs(p.vx) > 20) p.runT += dt * Math.abs(p.vx) / 40;
    if (p.inv > 0) p.inv -= dt;

    // safe spot (solid ground, not near an enemy)
    if (p.ground) {
      const c = Math.floor((p.x + PW / 2) / T);
      const t0 = L.top[c], tl = L.top[c - 1], tr = L.top[c + 1];
      if (t0 != null && tl != null && tr != null && Math.abs(p.y + PH - t0 * T) < 2) L.safe = { x: c * T + (T - PW) / 2, y: t0 * T };
    }

    // fell into water: no heart lost, Buddy pops back onto the last safe spot
    if (p.y > VIEW_H + 40) {
      window.SOUND.play('splash');
      L.falls = (L.falls || 0) + 1;
      respawn(); p.inv = 1.2;
      L.fx.push({ type: 'text', x: p.x - 10, y: p.y - 20, s: 'Splash! Try again', t: 0 });
    }

    // items
    for (const it of L.items) {
      if (it.taken) continue;
      if (Math.abs(p.x + PW / 2 - it.x) < 30 && Math.abs(p.y + PH / 2 - it.y) < 34) collect(it);
    }

    // enemies
    for (const e of L.enemies) {
      if (!e.alive) { e.dead += dt; continue; }
      e.x += e.vx * dt;
      if (e.x < e.min) { e.x = e.min; e.vx = Math.abs(e.vx); }
      if (e.x > e.max) { e.x = e.max; e.vx = -Math.abs(e.vx); }
      if (p.x + PW > e.x + 4 && p.x < e.x + e.w - 4 && p.y + PH > e.y + 6 && p.y < e.y + e.h) {
        if (p.vy > 60 && p.y + PH - e.y < 26) {
          e.alive = false; e.dead = 0; p.vy = -560; window.SOUND.play('stomp');
          L.score += 30;
          L.fx.push({ type: 'text', x: e.x, y: e.y - 10, s: 'Litter cleared!', t: 0 });
          for (let i = 0; i < 10; i++) L.fx.push({ type: 'spark', x: e.x + 20, y: e.y + 20, vx: (Math.random() - .5) * 300, vy: -Math.random() * 300, t: 0, col: '#9AA5B1' });
          hud();
        } else {
          hurt(p.x < e.x ? -1 : 1);
        }
      }
    }

    // goal
    if (p.x + PW > L.flagX - 6) {
      L.over = 'win'; L.overT = 0; p.vx = 0;
      window.SOUND.stopMusic(); window.SOUND.play('win');
      setTimeout(() => { if (L && L.over === 'win') cb.onWin && cb.onWin({ got: L.got, totals: L.totals, score: L.score, hearts: L.hearts }); }, 1900);
    }

    // camera
    const target = p.x + PW / 2 - viewW * 0.38;
    L.cam += (target - L.cam) * Math.min(1, dt * 8);
    L.cam = Math.max(0, Math.min(L.cols * T - viewW, L.cam));
  }

  /* ---------------- Rendering ---------------- */
  function drawBG() {
    const bg = L.bg;
    if (bg.complete && bg.naturalWidth) {
      // crop the painted ground band at the bottom of the artwork; our own terrain replaces it
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
    // soft haze to separate gameplay layer
    ctx.fillStyle = 'rgba(255,250,240,.12)'; ctx.fillRect(0, 0, viewW, VIEW_H);
  }

  function render() {
    if (!L || !ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawBG();
    const t = L.time;
    ctx.save();
    ctx.translate(-Math.round(L.cam), 0);
    const c0 = Math.max(0, Math.floor(L.cam / T) - 1), c1 = Math.min(L.cols - 1, Math.ceil((L.cam + viewW) / T) + 1);

    // water
    window.ART.drawWater(ctx, c0 * T, c1 * T + T, T * 9.9, VIEW_H - T * 9.9, t, L.style);

    // ground
    if (L.style === 'columns') {
      for (let c = c0; c <= c1; c++) { const tp = L.top[c]; if (tp == null) continue; window.ART.drawGround(ctx, c * T + 1, tp * T, T - 2, VIEW_H - tp * T, L.style, T); }
    } else {
      let c = c0;
      while (c <= c1) {
        const tp = L.top[c]; if (tp == null) { c++; continue; }
        let e = c; while (e + 1 <= c1 && L.top[e + 1] === tp) e++;
        window.ART.drawGround(ctx, c * T, tp * T, (e - c + 1) * T, VIEW_H - tp * T, L.style, T);
        c = e + 1;
      }
    }
    // platforms
    for (const pl of L.plats) if (pl.x + pl.w > L.cam - 20 && pl.x < L.cam + viewW + 20) window.ART.drawPlatform(ctx, pl.x, pl.y, pl.w, T, L.style, t);
    // blocks
    for (const b of L.blocks) window.ART.drawBlock(ctx, b.c * T, b.r * T - Math.sin(b.bump * Math.PI) * 10, T, b.used, t);
    // flag
    window.ART.drawFlag(ctx, L.flagX, L.flagH * T, T * 4.4, t, L.site.color, L.over === 'win' ? L.flagRaise : 0);
    // items
    for (const it of L.items) {
      if (it.taken || it.x < L.cam - 40 || it.x > L.cam + viewW + 40) continue;
      const bob = Math.sin(t * 3 + it.ph) * 4;
      const rare = it.key !== L.keys[0];
      ctx.save();
      ctx.globalAlpha = .55;
      ctx.fillStyle = rare ? '#FFF3B0' : '#FFFFFF';
      ctx.beginPath(); ctx.arc(it.x, it.y + bob, rare ? 24 : 21, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      window.ART.drawItem(ctx, it.key, it.x, it.y + bob, rare ? 19 : 16, t + it.ph);
    }
    // enemies
    for (const e of L.enemies) {
      if (!e.alive) { if (e.dead < .35) { ctx.save(); ctx.globalAlpha = 1 - e.dead / .35; window.ART.drawLitter(ctx, e.x, e.y, e.w, e.h, t, Math.min(1, e.dead * 6)); ctx.restore(); } continue; }
      window.ART.drawLitter(ctx, e.x, e.y, e.w, e.h, t);
    }
    // player
    drawPlayer(t);
    // fx
    for (const f of L.fx) {
      if (f.type === 'spark') { ctx.globalAlpha = 1 - f.t / .5; ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(f.x, f.y, 4, 0, 6.28); ctx.fill(); ctx.globalAlpha = 1; }
      else if (f.type === 'popitem') { const k = f.t / .7; ctx.globalAlpha = 1 - k * k; window.ART.drawItem(ctx, f.key, f.x, f.y - 20 - k * 60, 18, t); ctx.globalAlpha = 1; }
      else if (f.type === 'text') {
        ctx.globalAlpha = Math.min(1, 2.2 - f.t * 2);
        ctx.font = '700 22px Fredoka, Nunito, sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText(f.s, f.x + 20, f.y - f.t * 40);
        ctx.fillStyle = '#2B6E3A'; ctx.fillText(f.s, f.x + 20, f.y - f.t * 40);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  function drawPlayer(t) {
    const p = L.p;
    if (p.inv > 0 && Math.floor(p.inv * 12) % 2 === 0) return;
    const im = L.player;
    const w = 62, h = 80;
    const sq = p.squash;
    const sx = 1 + sq * .6, sy = 1 - sq * .7;
    const run = p.ground && Math.abs(p.vx) > 20;
    const bob = run ? Math.abs(Math.sin(p.runT * 1.4)) * -5 : 0;
    const tilt = run ? Math.sin(p.runT * 1.4) * .06 + p.vx / RUN * .06 : (p.ground ? 0 : p.vx / RUN * .1);
    ctx.save();
    ctx.translate(p.x + PW / 2, p.y + PH + bob);
    // shadow
    if (p.ground) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 5, 0, 0, 6.28); ctx.fill(); }
    ctx.rotate(tilt);
    ctx.scale(sx * (p.face < 0 ? -1 : 1), sy);
    if (im.complete && im.naturalWidth) ctx.drawImage(im, -w / 2, -h + 4, w, h);
    else { ctx.fillStyle = '#5B8FD9'; ctx.beginPath(); ctx.arc(0, -h / 2, w / 2, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!manual && !paused) {
      acc += dt;
      while (acc >= 1 / 60) { update(1 / 60); acc -= 1 / 60; }
    }
    render();
    raf = requestAnimationFrame(loop);
  }

  // test hooks
  window.advanceTime = (ms) => { manual = true; const n = Math.round(ms / (1000 / 60)); for (let i = 0; i < n; i++) update(1 / 60); render(); };
  window.render_game_to_text = () => {
    if (!L) return JSON.stringify({ mode: 'no-level' });
    const p = L.p;
    return JSON.stringify({ site: L.site.id, x: Math.round(p.x), y: Math.round(p.y), vx: Math.round(p.vx), vy: Math.round(p.vy), ground: p.ground, hearts: L.hearts, got: L.got, totals: L.totals, over: L.over, flagX: L.flagX, cols: L.cols,
      enemiesNear: L.enemies.filter(e => e.alive && Math.abs(e.x - p.x) < 400).map(e => Math.round(e.x - p.x)) });
  };
  window.__level = () => L;

  window.GAME = { start, stop, resize, input, render, get active() { return !!L; }, set paused(v) { paused = v; acc = 0; }, get paused() { return paused; } };
  window.addEventListener('resize', () => { if (L) { resize(); render(); } });
})();
