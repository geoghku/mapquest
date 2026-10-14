/* Tiny WebAudio sound engine — all sounds generated in the browser (no files, works offline). */
(function () {
  let ac = null, master = null, musicGain = null, sfxGain = null;
  let musicOn = true, sfxOn = true, timer = null, step = 0, track = 'map';

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    musicGain = ac.createGain(); musicGain.gain.value = musicOn ? 0.16 : 0; musicGain.connect(master);
    sfxGain = ac.createGain(); sfxGain.gain.value = sfxOn ? 0.5 : 0; sfxGain.connect(master);
  }

  function tone(freq, start, dur, type, vol, dest, slideTo) {
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, start);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(start); o.stop(start + dur + 0.02);
  }
  function noise(start, dur, vol, hp) {
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = hp || 1200;
    const g = ac.createGain(); g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(sfxGain); s.start(start);
  }

  const N = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const SFX = {
    tap() { const t = ac.currentTime; tone(880, t, .06, 'triangle', .25); },
    jump() { const t = ac.currentTime; tone(330, t, .16, 'square', .16, null, 760); },
    coin() { const t = ac.currentTime; tone(N(83), t, .07, 'square', .18); tone(N(88), t + .07, .22, 'square', .18); },
    rare() { const t = ac.currentTime; [76, 80, 83, 88].forEach((n, i) => tone(N(n), t + i * .06, .16, 'triangle', .26)); },
    stomp() { const t = ac.currentTime; tone(220, t, .12, 'square', .2, null, 90); noise(t, .12, .25, 800); },
    bump() { const t = ac.currentTime; tone(180, t, .08, 'triangle', .3, null, 120); },
    hurt() { const t = ac.currentTime; tone(520, t, .35, 'sawtooth', .14, null, 120); },
    splash() { const t = ac.currentTime; noise(t, .4, .35, 1800); tone(400, t, .3, 'sine', .15, null, 120); },
    pop() { const t = ac.currentTime; tone(600, t, .1, 'sine', .3, null, 1200); },
    hop() { const t = ac.currentTime; tone(500, t, .1, 'triangle', .22, null, 900); },
    win() { const t = ac.currentTime; [72, 76, 79, 84, 79, 84, 88].forEach((n, i) => tone(N(n), t + i * .11, i === 6 ? .5 : .14, 'square', .16)); },
    stamp() { const t = ac.currentTime; noise(t, .15, .4, 500); tone(150, t, .2, 'sine', .4, null, 60); [84, 88, 91].forEach((n, i) => tone(N(n), t + .2 + i * .08, .25, 'triangle', .22)); },
    fanfare() { const t = ac.currentTime; [60, 64, 67, 72, 67, 72, 76, 79, 84].forEach((n, i) => tone(N(n), t + i * .12, .3, 'square', .14)); }
  };

  // two little loops: map (relaxed) and level (bouncy)
  const SONGS = {
    map: { bpm: 104, mel: [72, 0, 76, 79, 77, 76, 74, 0, 72, 74, 76, 0, 74, 72, 67, 0, 69, 72, 74, 76, 77, 76, 74, 72, 74, 0, 71, 72, 74, 0, 72, 0], bass: [48, 55, 52, 55, 53, 57, 55, 59] },
    level: { bpm: 150, mel: [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 0, 67, 0, 0, 0, 72, 0, 0, 67, 0, 0, 64, 0, 0, 69, 0, 71, 0, 70, 69, 0], bass: [48, 48, 55, 55, 53, 53, 55, 43] }
  };

  function tick() {
    if (!ac) return;
    const s = SONGS[track];
    const t = ac.currentTime + 0.05, beat = 60 / s.bpm / 2;
    const n = s.mel[step % s.mel.length];
    if (n) tone(N(n), t, beat * .9, track === 'level' ? 'square' : 'triangle', .22, musicGain);
    if (step % 4 === 0) { const b = s.bass[(step / 4) % s.bass.length]; tone(N(b), t, beat * 3.6, 'triangle', .35, musicGain); }
    if (track === 'level' && step % 2 === 1) { tone(N(96), t, .03, 'square', .05, musicGain); }
    step++;
  }
  function startMusic(which) {
    track = which || track;
    stopMusic(); step = 0;
    if (!ac) return;
    const s = SONGS[track];
    timer = setInterval(tick, 60000 / s.bpm / 2);
  }
  function stopMusic() { if (timer) clearInterval(timer); timer = null; }

  window.SOUND = {
    init,
    play(name) { if (!ac || !sfxOn) return; try { SFX[name] && SFX[name](); } catch (e) {} },
    music(which) { init(); if (which !== track || !timer) startMusic(which); },
    stopMusic,
    toggleMusic() { musicOn = !musicOn; if (musicGain) musicGain.gain.value = musicOn ? 0.16 : 0; return musicOn; },
    toggleSfx() { sfxOn = !sfxOn; if (sfxGain) sfxGain.gain.value = sfxOn ? 0.5 : 0; return sfxOn; },
    get musicOn() { return musicOn; }, get sfxOn() { return sfxOn; }
  };
})();
