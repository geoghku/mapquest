/* Map Quest Hong Kong — UI controller */
(function () {
  const $ = (id) => document.getElementById(id);
  const SITES = window.SITES, MAP = window.HK_MAP;
  const done = {};          // site id -> stars
  let current = null, currentIdx = 0, idleTimer = 0, discoverTimer = 0;
  const IDLE_MS = 90000;

  // badge offsets (in map units) so nearby pins do not overlap; a dashed stem points to the exact spot
  const OFFSET = {
    highisland: [26, 70], sharpisland: [10, 125], taipokau: [-10, -78],
    longvalley: [52, -66], kaitak: [81, -67], observatory: [60, 92],
    mongkok: [-112, -105], northern: [-86, -40], airport: [2, -71], hzmb: [-6, 96]
  };

  /* ---------------- Map ---------------- */
  function buildMap() {
    const svg = $('map');
    svg.setAttribute('viewBox', `0 0 ${MAP.w} ${MAP.h}`);
    const P = (lon, lat) => [(lon - 113.82) * Math.cos(22.35 * Math.PI / 180) * (MAP.w / ((114.46 - 113.82) * Math.cos(22.35 * Math.PI / 180))), (22.57 - lat) * (MAP.w / ((114.46 - 113.82) * Math.cos(22.35 * Math.PI / 180)))];
    const lbl = (lon, lat, txt, cls) => { const [x, y] = P(lon, lat); return `<text class="${cls}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="middle">${txt}</text>`; };
    let stems = '';
    SITES.forEach(s => {
      const [x, y] = MAP.pts[s.id], [dx, dy] = OFFSET[s.id];
      stems += `<path class="stem" d="M${x},${y} L${x + dx},${y + dy}"/><circle class="spot" cx="${x}" cy="${y}" r="6" style="fill:${s.color}"/>`;
    });
    svg.innerHTML = `
      <defs>
        <pattern id="feltLand" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#9BD35A"/>
          <circle cx="4" cy="5" r="1.6" fill="#B2DE78"/><circle cx="15" cy="12" r="1.4" fill="#86C24A"/><circle cx="9" cy="18" r="1.2" fill="#B2DE78"/>
        </pattern>
      </defs>
      <path class="land-shadow" d="${MAP.land}" transform="translate(5,8)"/>
      <path class="land" d="${MAP.land}"/>
      <path class="coast-stitch" d="${MAP.land}" transform="translate(0,0)"/>
      ${MAP.hzmb ? `<path class="bridge-casing" d="${MAP.hzmb}"/><path class="bridge-deck" d="${MAP.hzmb}"/><text class="bridge-label" x="2" y="522">◀ To Zhuhai &amp; Macao</text>` : ''}
      ${lbl(114.04, 22.445, 'New Territories', 'region')}
      ${lbl(113.93, 22.27, 'Lantau Island', 'region')}
      ${lbl(114.27, 22.165, 'South China Sea', 'sea-label')}
      ${stems}`;

    const pins = $('pins');
    pins.innerHTML = '';
    // home (HKU)
    const [hx, hy] = MAP.pts.hkuMain;
    const home = document.createElement('div');
    home.className = 'home';
    home.style.left = (hx / MAP.w * 100) + '%'; home.style.top = (hy / MAP.h * 100) + '%';
    home.style.transform = 'translate(calc(-17px * var(--u)),-50%)';
    home.innerHTML = `<svg class="home-star" viewBox="0 0 24 24"><path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17l-6 3.4 1.3-6.7-5-4.7 6.8-.8z" fill="#FFC93D" stroke="#7A4E2D" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
    pins.appendChild(home);
    const tag = document.createElement('div');
    tag.className = 'home'; tag.style.left = (hx / MAP.w * 100) + '%'; tag.style.top = ((hy + 34) / MAP.h * 100) + '%';
    tag.style.transform = 'translate(-85%, 0)';
    tag.innerHTML = `<div class="home-tag">You are here<small>HKU Geography</small></div>`;
    pins.appendChild(tag);

    SITES.forEach((s, i) => {
      const [x, y] = MAP.pts[s.id], [dx, dy] = OFFSET[s.id];
      const b = document.createElement('button');
      b.className = 'pin'; b.dataset.id = s.id;
      b.style.left = ((x + dx) / MAP.w * 100) + '%'; b.style.top = ((y + dy) / MAP.h * 100) + '%';
      b.style.setProperty('--c', s.color); b.style.setProperty('--cd', s.dark);
      b.style.transform = 'translate(-50%, calc(-32px * var(--u)))';
      b.setAttribute('aria-label', s.name);
      b.innerHTML = `<span class="pin-badge"><img src="${ART.itemURL(s.icon || s.items[0].key, 96)}" alt=""><kbd class="pin-key">${(i + 1) % 10}</kbd></span><span class="pin-name">${(s.short || s.name.replace('Nature Reserve', '').replace('Nature Park', '').replace('International ', '').trim())}</span>`;
      b.addEventListener('click', () => goSite(i));
      pins.appendChild(b);
    });
    // compact list of places (shown on phones held upright, where map labels would overlap)
    const list = $('siteList');
    if (list) list.innerHTML = SITES.map((s, i) => `<button class="site-pick" data-i="${i}" data-id="${s.id}" style="--c:${s.color};--cd:${s.dark}"><span class="pick-key">${(i + 1) % 10}</span><img src="${ART.itemURL(s.icon || s.items[0].key, 64)}" alt=""><span class="pick-name">${s.name}</span></button>`).join('');
    if (list) list.querySelectorAll('.site-pick').forEach(el => el.addEventListener('click', () => goSite(+el.dataset.i)));
    placeWalker(hx, hy, false);
  }

  // One size factor for the whole interface: bigger on large interactive screens, a little smaller on phones
  let uiScale = 1;
  function isPortraitPhone() { return window.innerWidth <= 700 && window.innerHeight > window.innerWidth; }
  function setUiScale() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let u = Math.min(vw / 1440, vh / 810);
    if (u > 1) u = Math.min(u, 3);
    else if (isPortraitPhone()) u = Math.max(0.8, Math.min(1, vw / 480));
    else u = Math.max(0.72, Math.min(1, vw / 1100, vh / 620));
    u = Math.round(u * 100) / 100;
    if (u !== uiScale || !document.documentElement.style.getPropertyValue('--u')) {
      uiScale = u; document.documentElement.style.setProperty('--u', u);
      document.body.classList.toggle('portrait-phone', isPortraitPhone());
    }
    document.body.classList.toggle('portrait-phone', isPortraitPhone());
  }

  function fitMap() {
    setUiScale();
    const area = $('mapArea').getBoundingClientRect();
    const u = uiScale, portrait = isPortraitPhone();
    const pad = (portrait ? 14 : 30) * u;
    const w = area.width - pad * 2, h = (portrait ? area.height * 0.52 : area.height) - pad * 2 - 10 * u;
    const k = Math.min(w / MAP.w, h / MAP.h);
    const box = $('mapBox');
    box.style.width = (MAP.w * k) + 'px'; box.style.height = (MAP.h * k) + 'px';
  }

  function placeWalker(x, y, animate) {
    const w = $('walker');
    if (!animate) { w.style.transition = 'none'; requestAnimationFrame(() => w.style.transition = ''); }
    w.style.left = (x / MAP.w * 100) + '%'; w.style.top = (y / MAP.h * 100) + '%';
    if (animate) { w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); }
  }

  function renderStamps() {
    const el = $('stamps');
    el.innerHTML = '<span class="label">Geo Stamps</span>' + SITES.map(s => `<span class="stamp ${done[s.id] ? 'got' : ''}" data-id="${s.id}" style="--c:${s.color}" title="${s.name}"><img src="${ART.itemURL(s.items[0].key, 64)}" alt=""></span>`).join('');
    document.querySelectorAll('.pin, .site-pick').forEach(p => p.classList.toggle('done', !!done[p.dataset.id]));
    const n = Object.keys(done).length;
    const pick = kbdMode ? 'Click a place, or press its number key (1–' + Math.min(9, SITES.length) + (SITES.length > 9 ? ', 0' : '') + ')' : 'Tap a place on the map';
    $('peekText').textContent = n === 0 ? pick + ' to jump into its adventure!' : n < SITES.length ? 'Great job! Pick another place to explore.' : 'You’ve got every Geo Stamp. Play any level again!';
  }

  /* ---------------- Site card ---------------- */
  function goSite(i) {
    window.SOUND.init(); window.SOUND.play('hop');
    const s = SITES[i];
    current = s; currentIdx = i;
    const [x, y] = MAP.pts[s.id];
    placeWalker(x, y, true);
    setTimeout(() => { if ($('gameScreen').classList.contains('hidden') && current === s) openSite(s); }, 650);
  }

  function openSite(s) {
    const card = $('siteCard');
    card.style.setProperty('--c', s.color); card.style.setProperty('--cd', s.dark);
    $('siteArt').style.backgroundImage = `linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), url(${s.bg})`;
    $('siteBuddy').src = s.buddy;
    $('siteChip').textContent = s.theme;
    $('siteName').textContent = s.name;
    $('siteZh').textContent = s.zh;
    $('siteArea').textContent = s.area;
    $('siteBlurb').textContent = s.blurb;
    $('impTitle').textContent = s.implication.title;
    $('impText').textContent = s.implication.text;
    $('collectRow').innerHTML = s.items.map(it => `<div class="collect"><img src="${ART.itemURL(it.key, 96)}" alt="">${it.name}</div>`).join('');
    // restart buddy pop animation
    const im = $('siteBuddy'); im.style.animation = 'none'; void im.offsetWidth; im.style.animation = '';
    $('siteModal').classList.remove('hidden');
    blurFocus();
    window.SOUND.play('pop');
  }
  function closeSite() { $('siteModal').classList.add('hidden'); }

  /* ---------------- Level ---------------- */
  function hudInit(s) {
    $('gameScreen').style.setProperty('--c', s.color); $('gameScreen').style.setProperty('--cd', s.dark);
    $('hudSite').textContent = s.name;
    $('hudItems').innerHTML = s.items.map(it => `<div class="hud-item" data-k="${it.key}"><img src="${ART.itemURL(it.key, 72)}" alt="${it.name}"><span>0</span></div>`).join('');
  }
  const heartSVG = (on) => `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.2 0 3.9 1.3 5.2 3 1.3-1.7 3-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" fill="${on ? '#F2453D' : '#E5D8C6'}" stroke="${on ? '#A8231C' : '#B9A58A'}" stroke-width="1.8"/></svg>`;
  let lastGot = {};
  function onHud(st) {
    document.querySelectorAll('.hud-item').forEach(el => {
      const k = el.dataset.k, g = st.got[k] || 0, tot = st.totals[k];
      el.querySelector('span').textContent = `${g}/${tot}`;
      el.classList.toggle('full', g >= tot);
      if (lastGot[k] !== undefined && g > lastGot[k]) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
      lastGot[k] = g;
    });
    $('hudHearts').innerHTML = [0, 1, 2].map(i => heartSVG(i < st.hearts)).join('');
  }

  function onDiscover(key) {
    const it = current.items.find(i => i.key === key);
    $('discoverBuddy').src = current.buddy;
    $('discoverIcon').src = ART.itemURL(key, 72);
    $('discoverName').textContent = it.name;
    $('discoverFact').textContent = it.fact;
    const d = $('discover'); d.classList.remove('hidden'); d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
    clearTimeout(discoverTimer);
    discoverTimer = setTimeout(() => d.classList.add('hidden'), 4200);
  }

  function showReady(s) {
    $('readyBuddy').src = s.buddy;
    $('readyEyebrow').textContent = s.theme;
    $('readyTitle').textContent = s.name;
    $('readyText').textContent = s.hello;
    $('readyTips').innerHTML = (s.tips || []).map(([k, t]) => `<li class="tip"><span class="key tipkey" style="--c:${s.color}">${k}</span> ${t}</li>`).join('');
    $('ovReady').classList.remove('hidden');
    blurFocus();
  }

  function startLevel() {
    closeSite();
    const s = current;
    $('mapScreen').classList.add('hidden');
    $('gameScreen').classList.remove('hidden');
    ['ovWin', 'ovLose'].forEach(id => $(id).classList.add('hidden'));
    $('discover').classList.add('hidden');
    hudInit(s); lastGot = {};
    window.GAME.start(s, currentIdx, { onHud, onDiscover, onWin, onLose });
    // freeze until "Let's go"
    paused = true; window.GAME.paused = true;
    showReady(s);
    window.SOUND.music('level');
  }
  let paused = false;

  function go() {
    $('ovReady').classList.add('hidden');
    paused = false; window.GAME.paused = false;
    window.SOUND.play('tap');
  }

  function onWin(r) {
    const s = current;
    clearTimeout(discoverTimer); $('discover').classList.add('hidden');
    const total = Object.values(r.totals).reduce((a, b) => a + b, 0);
    const got = Object.values(r.got).reduce((a, b) => a + b, 0);
    const pct = got / total;
    const stars = pct >= .85 ? 3 : pct >= .5 ? 2 : 1;
    const first = !done[s.id];
    done[s.id] = Math.max(done[s.id] || 0, stars);
    $('ovWin').querySelector('.ov-card').style.setProperty('--c', s.color);
    $('stampBig').style.setProperty('--c', s.color); $('stampBig').style.setProperty('--cd', s.dark);
    $('stampBig').innerHTML = `<img src="${ART.itemURL(s.items[0].key, 128)}" alt="">`;
    $('winTitle').textContent = stars === 3 ? 'Super collector!' : stars === 2 ? 'Brilliant run!' : 'You made it!';
    const star = (on, i) => `<svg class="${on ? 'on' : ''}" style="animation-delay:${.25 + i * .18}s" viewBox="0 0 24 24"><path d="M12 2l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17l-6 3.4 1.3-6.7-5-4.7 6.8-.8z" fill="${on ? '#FFC93D' : '#E5D8C6'}" stroke="${on ? '#A8770B' : '#B9A58A'}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    $('winStars').innerHTML = [0, 1, 2].map(i => star(i < stars, i)).join('');
    $('winRecap').innerHTML = s.items.map(it => `<div class="recap-row"><img src="${ART.itemURL(it.key, 92)}" alt=""><div><b>${it.name}</b><span>${it.fact}</span></div><div class="count">${r.got[it.key] || 0}/${r.totals[it.key]}</div></div>`).join('');
    $('winImpTitle').textContent = s.implication.title;
    $('winImpText').textContent = s.implication.text;
    $('ovWin').classList.remove('hidden');
    blurFocus();
    window.SOUND.play('stamp');
    renderStamps();
    if (first) setTimeout(() => { const st = document.querySelector(`.stamp[data-id="${s.id}"]`); st && st.classList.add('pop'); }, 50);
  }
  function onLose(r) {
    clearTimeout(discoverTimer); $('discover').classList.add('hidden');
    return onLose0(r);
  }
  function onLose0() { $('ovLose').classList.remove('hidden'); blurFocus(); }

  function backToMap() {
    window.GAME.stop();
    ['ovWin', 'ovLose', 'ovReady'].forEach(id => $(id).classList.add('hidden'));
    $('gameScreen').classList.add('hidden');
    $('mapScreen').classList.remove('hidden');
    fitMap();
    window.SOUND.music('map');
    renderStamps();
    if (Object.keys(done).length === SITES.length && !shownDone) { shownDone = true; setTimeout(() => { $('allDone').classList.remove('hidden'); blurFocus(); window.SOUND.play('fanfare'); }, 500); }
  }
  let shownDone = false;

  /* ---------------- Controls ---------------- */
  function bindHold(el, on, off) {
    const down = (e) => { e.preventDefault(); el.setPointerCapture && el.setPointerCapture(e.pointerId); el.classList.add('on'); on(); poke(); };
    const up = (e) => { el.classList.remove('on'); off(); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  const I = window.GAME.input;
  bindHold($('ctlLeft'), () => I.left = true, () => I.left = false);
  bindHold($('ctlRight'), () => I.right = true, () => I.right = false);
  bindHold($('ctlJump'), () => { if (!I.jump) I.jumpPressed = true; I.jump = true; }, () => I.jump = false);
  /* ---------------- Laptop / keyboard & mouse support ---------------- */
  // Laptops: keyboard to play (arrows/WASD + Space), or mouse (point where to go, click to jump).
  // Touch screens keep the big on-screen buttons. The mode switches automatically on first input.
  let kbdMode = !(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  function setMode(k) {
    if (kbdMode === k) return;
    kbdMode = k;
    document.body.classList.toggle('kbd', k);
    renderStamps();
  }
  document.body.classList.toggle('kbd', kbdMode);
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') setMode(false); else if (e.pointerType === 'mouse') setMode(true); }, true);

  function blurFocus() { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur(); }
  // Mouse clicks should not leave focus on a button (otherwise Space/Enter would press it again)
  document.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('button'); if (b && e.detail > 0) b.blur(); });

  const visible = (id) => !$(id).classList.contains('hidden');
  const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump' };
  function press(id) { const b = $(id); b.classList.add('pressed'); setTimeout(() => b.classList.remove('pressed'), 150); b.click(); }

  window.addEventListener('keydown', (e) => {
    poke();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    setMode(true);
    const code = e.code, enter = code === 'Enter' || code === 'NumpadEnter' || code === 'Space';
    const handled = () => { e.preventDefault(); e.stopPropagation(); };

    // start screen: any key
    if (visible('attract')) { if (!e.repeat) { handled(); $('attract').click(); } return; }
    if (visible('allDone')) { if (enter || code === 'Escape') { handled(); press('btnDoneClose'); } return; }
    if (visible('siteModal')) {
      if (enter && !e.repeat) { handled(); press('btnPlay'); }
      else if (code === 'Escape' || code === 'Backspace') { handled(); press('btnCloseSite'); }
      return;
    }
    if (visible('gameScreen')) {
      if (visible('ovReady')) {
        if ((enter || KEYS[code]) && !e.repeat) { handled(); go(); }
        else if (code === 'Escape') { handled(); backToMap(); }
        return;
      }
      if (visible('ovWin')) {
        if (e.repeat) return;
        if (code === 'Enter' || code === 'NumpadEnter' || code === 'Escape' || code === 'KeyM') { handled(); press('btnWinMap'); }
        else if (code === 'KeyR') { handled(); press('btnWinAgain'); }
        return;
      }
      if (visible('ovLose')) {
        if (e.repeat) return;
        if (code === 'Enter' || code === 'NumpadEnter' || code === 'KeyR') { handled(); press('btnRetry'); }
        else if (code === 'Escape' || code === 'KeyM') { handled(); press('btnLoseMap'); }
        return;
      }
      if (code === 'Escape') { handled(); backToMap(); return; }
      const k = KEYS[code]; if (!k || !window.GAME.active) return;
      handled();
      I.steer = false;
      if (k === 'jump' && !I.jump) I.jumpPressed = true;
      I[k] = true;
      return;
    }
    // map screen
    const digit = /^(Digit|Numpad)([0-9])$/.exec(code);
    if (digit) { const i = (+digit[2] + 9) % 10; if (SITES[i]) { handled(); goSite(i); } return; }
    if (code === 'ArrowRight' || code === 'ArrowLeft' || code === 'ArrowDown' || code === 'ArrowUp') {
      handled();
      const pins = [...document.querySelectorAll('.pin')];
      const cur = pins.indexOf(document.activeElement);
      const step = (code === 'ArrowRight' || code === 'ArrowDown') ? 1 : -1;
      const next = cur < 0 ? (step > 0 ? 0 : pins.length - 1) : (cur + step + pins.length) % pins.length;
      pins[next].focus();
      $('peekText').textContent = SITES[next].name + ': press Enter to visit';
      return;
    }
  }, true);
  window.addEventListener('keyup', (e) => {
    const k = KEYS[e.code]; if (k) I[k] = false;
    // stop the browser "clicking" a focused button on Space keyup
    if ((e.code === 'Space') && document.activeElement && document.activeElement.tagName === 'BUTTON' && !document.activeElement.classList.contains('pin')) e.preventDefault();
  }, true);
  window.addEventListener('blur', () => { I.left = I.right = I.jump = false; });

  // Mouse play on the game canvas: point where Buddy should go, click (or hold) to jump
  const cv = $('gameCanvas');
  cv.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    const r = cv.getBoundingClientRect();
    const nx = e.clientX - r.left;
    if (I.pointerX == null || Math.abs(nx - I.pointerX) > 3) I.steer = true;
    I.pointerX = nx; poke();
  });
  cv.addEventListener('pointerleave', () => { I.steer = false; });
  cv.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (e.button !== 0) return;
    e.preventDefault();
    if (!window.GAME.active || paused) return;
    const r = cv.getBoundingClientRect(); I.pointerX = e.clientX - r.left; I.steer = true;
    if (!I.jump) I.jumpPressed = true; I.jump = true;
  });
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { if (!document.querySelector('.ctl.on')) I.jump = false; } });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  // Touch: tapping the scene itself also jumps (handy on big interactive screens and phones)
  const touchIds = new Set();
  cv.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    e.preventDefault();
    if (!window.GAME.active || paused) return;
    touchIds.add(e.pointerId);
    if (!I.jump) I.jumpPressed = true; I.jump = true;
  });
  const touchEnd = (e) => { if (!touchIds.delete(e.pointerId)) return; if (!touchIds.size && !document.querySelector('.ctl.jump.on')) I.jump = false; };
  window.addEventListener('pointerup', touchEnd); window.addEventListener('pointercancel', touchEnd);
  let lastMove = 0;
  window.addEventListener('mousemove', () => { const n = Date.now(); if (n - lastMove > 1000) { lastMove = n; poke(); } }, { passive: true });

  // pause wrapper: block input while an overlay is up
  setInterval(() => {
    if (paused || !$('ovWin').classList.contains('hidden') || !$('ovLose').classList.contains('hidden')) { I.left = I.right = I.jump = false; I.jumpPressed = false; I.steer = false; }
  }, 50);

  /* ---------------- Sound buttons ---------------- */
  $('btnMusic').addEventListener('click', () => { window.SOUND.init(); const on = window.SOUND.toggleMusic(); $('btnMusic').classList.toggle('muted', !on); });
  $('btnSfx').addEventListener('click', () => { window.SOUND.init(); const on = window.SOUND.toggleSfx(); $('btnSfx').classList.toggle('muted', !on); });

  /* ---------------- Buttons ---------------- */
  $('btnPlay').addEventListener('click', startLevel);
  $('btnCloseSite').addEventListener('click', () => { closeSite(); window.SOUND.play('tap'); });
  $('siteModal').addEventListener('click', (e) => { if (e.target.id === 'siteModal') closeSite(); });
  $('btnGo').addEventListener('click', go);
  $('btnExit').addEventListener('click', backToMap);
  $('btnWinMap').addEventListener('click', backToMap);
  $('btnLoseMap').addEventListener('click', backToMap);
  $('btnWinAgain').addEventListener('click', startLevel);
  $('btnRetry').addEventListener('click', startLevel);
  $('btnDoneClose').addEventListener('click', () => $('allDone').classList.add('hidden'));
  $('btnDoneRestart').addEventListener('click', () => resetAll());
  $('btnReset').addEventListener('click', () => resetAll());

  /* ---------------- Attract & idle ---------------- */
  function buildOrbit() {
    const o = $('orbit');
    const keys = SITES.map(s => s.items[0].key);
    o.innerHTML = keys.map((k, i) => {
      const a = i / keys.length * Math.PI * 2 - Math.PI / 2;
      return `<img src="${ART.itemURL(k, 96)}" style="left:calc(50% + ${Math.cos(a) * 46}% - 29px * var(--u));top:calc(50% + ${Math.sin(a) * 46}% - 29px * var(--u))" alt="">`;
    }).join('');
  }
  function resetAll() {
    Object.keys(done).forEach(k => delete done[k]);
    shownDone = false;
    window.GAME.stop();
    ['siteModal', 'allDone'].forEach(id => $(id).classList.add('hidden'));
    ['ovWin', 'ovLose', 'ovReady'].forEach(id => $(id).classList.add('hidden'));
    $('gameScreen').classList.add('hidden');
    $('mapScreen').classList.remove('hidden');
    renderStamps();
    const [hx, hy] = MAP.pts.hkuMain; placeWalker(hx, hy, false);
    $('attract').classList.remove('hidden');
    window.SOUND.stopMusic();
  }
  function poke() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if ($('attract').classList.contains('hidden')) resetAll(); }, IDLE_MS);
  }
  ['pointerdown', 'touchstart'].forEach(ev => window.addEventListener(ev, poke, { passive: true }));
  $('attract').addEventListener('click', () => {
    window.SOUND.init();
    window.SOUND.music('map');
    window.SOUND.play('tap');
    $('attract').classList.add('hidden');
    fitMap();
    poke();
  });

  window.addEventListener('resize', () => { fitMap(); if (window.GAME.active) { window.GAME.resize(); window.GAME.render(); } });
  window.addEventListener('orientationchange', () => setTimeout(() => { fitMap(); if (window.GAME.active) { window.GAME.resize(); window.GAME.render(); } }, 300));

  $('doneEyebrow').textContent = 'All ' + SITES.length + ' Geo Stamps';
  buildMap();
  renderStamps();
  buildOrbit();
  fitMap();
  window.__app = { goSite, startLevel, go, backToMap, done };
})();
