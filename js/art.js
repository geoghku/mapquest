/* Procedural felt-style art for items, enemies, blocks and terrain. */
(function () {
  const TAU = Math.PI * 2;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function stitch(ctx, color, w) {
    ctx.save();
    ctx.setLineDash([w * 1.6, w * 1.4]);
    ctx.lineWidth = w;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }
  function outline(ctx, w, c) {
    ctx.lineWidth = w; ctx.strokeStyle = c || 'rgba(60,35,20,.55)'; ctx.stroke();
  }
  function poly(ctx, pts) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  /* ---------- Collectible items (centered at 0,0, radius r) ---------- */
  const ITEMS = {
    hexcol(ctx, r) {
      // a hexagonal column seen at an angle
      const w = r * 0.62, top = -r * 0.85, bot = r * 0.85, e = r * 0.28;
      ctx.fillStyle = '#9A93A8';
      poly(ctx, [[-w, top + e], [-w * .5, top], [w * .5, top], [w, top + e], [w, bot], [w * .5, bot + e * .6], [-w * .5, bot + e * .6], [-w, bot]]);
      ctx.fill(); outline(ctx, r * .08);
      ctx.fillStyle = '#B9B3C6';
      poly(ctx, [[-w * .5, top + e * .6], [w * .5, top + e * .6], [w * .5, bot + e * .6], [-w * .5, bot + e * .6]]); ctx.fill();
      ctx.fillStyle = '#D9D4E3';
      poly(ctx, [[-w, top + e], [-w * .5, top], [w * .5, top], [w, top + e], [w * .5, top + e * 1.9], [-w * .5, top + e * 1.9]]);
      ctx.fill(); outline(ctx, r * .07);
    },
    ember(ctx, r, t) {
      const f = 1 + Math.sin(t * 8) * 0.06;
      ctx.save(); ctx.scale(f, f);
      ctx.fillStyle = '#FFB13B';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * .9, -r * .2, r * .8, r * .8, 0, r * .9);
      ctx.bezierCurveTo(-r * .8, r * .8, -r * .9, -r * .2, 0, -r);
      ctx.fill(); outline(ctx, r * .08, '#B4521C');
      ctx.fillStyle = '#FF6A2B';
      ctx.beginPath();
      ctx.moveTo(0, -r * .35);
      ctx.bezierCurveTo(r * .5, r * .1, r * .45, r * .7, 0, r * .72);
      ctx.bezierCurveTo(-r * .45, r * .7, -r * .5, r * .1, 0, -r * .35);
      ctx.fill();
      ctx.fillStyle = '#FFF1B8';
      ctx.beginPath(); ctx.arc(0, r * .38, r * .2, 0, TAU); ctx.fill();
      ctx.restore();
    },
    seacave(ctx, r) {
      ctx.fillStyle = '#8F8698';
      ctx.beginPath();
      ctx.moveTo(-r, r * .7); ctx.lineTo(-r * .9, -r * .2);
      ctx.quadraticCurveTo(-r * .6, -r, 0, -r * .95);
      ctx.quadraticCurveTo(r * .65, -r, r * .92, -r * .15);
      ctx.lineTo(r, r * .7); ctx.closePath(); ctx.fill(); outline(ctx, r * .08);
      ctx.fillStyle = '#3B3346';
      ctx.beginPath(); ctx.moveTo(-r * .42, r * .7);
      ctx.quadraticCurveTo(-r * .42, -r * .35, 0, -r * .38);
      ctx.quadraticCurveTo(r * .42, -r * .35, r * .42, r * .7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#38B6D8';
      ctx.beginPath(); ctx.moveTo(-r * 1.05, r * .55);
      for (let i = 0; i <= 6; i++) ctx.quadraticCurveTo(-r * 1.05 + (i + .5) * r * .35, r * .35, -r * 1.05 + (i + 1) * r * .35, r * .55);
      ctx.lineTo(r * 1.05, r * .95); ctx.lineTo(-r * 1.05, r * .95); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = r * .07; ctx.beginPath();
      ctx.moveTo(-r * .7, r * .62); ctx.lineTo(-r * .4, r * .62); ctx.moveTo(r * .2, r * .62); ctx.lineTo(r * .55, r * .62); ctx.stroke();
    },
    pebble(ctx, r) {
      const cols = ['#E8C98F', '#C9A36B', '#F3DDB0', '#B98C5A'];
      const pts = [[-.42, .25, .42], [.38, .3, .38], [0, -.28, .45], [-.2, .62, .22], [.55, -.2, .22]];
      pts.forEach((p, i) => {
        ctx.fillStyle = cols[i % cols.length];
        ctx.beginPath(); ctx.ellipse(p[0] * r, p[1] * r, p[2] * r * 1.15, p[2] * r, i * .6, 0, TAU); ctx.fill(); outline(ctx, r * .06);
      });
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.beginPath(); ctx.arc(-r * .1, -r * .42, r * .1, 0, TAU); ctx.fill();
    },
    shell(ctx, r) {
      ctx.fillStyle = '#FFB3B8';
      ctx.beginPath(); ctx.moveTo(0, r * .85);
      ctx.lineTo(-r * .95, -r * .1);
      ctx.quadraticCurveTo(-r * .7, -r * .95, 0, -r * .95);
      ctx.quadraticCurveTo(r * .7, -r * .95, r * .95, -r * .1);
      ctx.closePath(); ctx.fill(); outline(ctx, r * .08, '#B9586A');
      ctx.strokeStyle = '#E07887'; ctx.lineWidth = r * .08;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, r * .8); ctx.lineTo(i * r * .36, -r * .82 + Math.abs(i) * r * .18); ctx.stroke(); }
      ctx.fillStyle = '#FFD7DA'; rr(ctx, -r * .32, r * .55, r * .64, r * .38, r * .12); ctx.fill(); outline(ctx, r * .06, '#B9586A');
    },
    bunrock(ctx, r) {
      ctx.fillStyle = '#D9A15A';
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * .85, 0, 0, TAU); ctx.fill(); outline(ctx, r * .08, '#7A4E2D');
      ctx.save(); ctx.clip();
      ctx.strokeStyle = '#8A5A2B'; ctx.lineWidth = r * .09;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(i * r * .42 - r, -r); ctx.lineTo(i * r * .42 + r, r); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i * r * .42 + r, -r); ctx.lineTo(i * r * .42 - r, r); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(255,240,200,.45)';
      ctx.beginPath(); ctx.ellipse(-r * .3, -r * .4, r * .3, r * .15, -.4, 0, TAU); ctx.fill();
    },
    leaf(ctx, r, t) {
      ctx.save(); ctx.rotate(Math.sin(t * 3) * .15 - .5);
      ctx.fillStyle = '#5CC15A';
      ctx.beginPath(); ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * .95, -r * .2, 0, r * .9);
      ctx.quadraticCurveTo(-r * .95, -r * .2, 0, -r); ctx.fill(); outline(ctx, r * .08, '#2A7535');
      ctx.strokeStyle = '#2A7535'; ctx.lineWidth = r * .08;
      ctx.beginPath(); ctx.moveTo(0, -r * .8); ctx.lineTo(0, r * 1.05); ctx.stroke();
      for (let i = 0; i < 3; i++) { const y = -r * .4 + i * r * .38; ctx.beginPath(); ctx.moveTo(0, y + r * .15); ctx.lineTo(r * .38, y - r * .05); ctx.moveTo(0, y + r * .15); ctx.lineTo(-r * .38, y - r * .05); ctx.stroke(); }
      ctx.restore();
    },
    butterfly(ctx, r, t) {
      const f = .55 + Math.abs(Math.sin(t * 9)) * .45;
      ctx.save(); ctx.scale(f, 1);
      [[-1, '#FF8A3D'], [1, '#FF8A3D']].forEach(([s, c]) => {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.ellipse(s * r * .5, -r * .3, r * .5, r * .48, s * .5, 0, TAU); ctx.fill(); outline(ctx, r * .07, '#7A3A12');
        ctx.fillStyle = '#FFC93D';
        ctx.beginPath(); ctx.ellipse(s * r * .42, r * .38, r * .34, r * .3, -s * .4, 0, TAU); ctx.fill(); outline(ctx, r * .07, '#7A3A12');
        ctx.fillStyle = '#2B1A10'; ctx.beginPath(); ctx.arc(s * r * .58, -r * .38, r * .12, 0, TAU); ctx.fill();
      });
      ctx.restore();
      ctx.fillStyle = '#3B2414'; rr(ctx, -r * .1, -r * .6, r * .2, r * 1.2, r * .1); ctx.fill();
      ctx.strokeStyle = '#3B2414'; ctx.lineWidth = r * .06;
      ctx.beginPath(); ctx.moveTo(0, -r * .6); ctx.lineTo(-r * .25, -r * .95); ctx.moveTo(0, -r * .6); ctx.lineTo(r * .25, -r * .95); ctx.stroke();
    },
    bird(ctx, r, t) {
      ctx.fillStyle = '#4FA3E0';
      ctx.beginPath(); ctx.ellipse(0, r * .1, r * .78, r * .62, 0, 0, TAU); ctx.fill(); outline(ctx, r * .08, '#22558A');
      ctx.fillStyle = '#FFD45E';
      ctx.beginPath(); ctx.ellipse(r * .1, r * .35, r * .45, r * .3, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(-r * .25, 0); ctx.rotate(Math.sin(t * 10) * .4);
      ctx.fillStyle = '#2F7EC2'; ctx.beginPath(); ctx.ellipse(0, 0, r * .45, r * .25, -.5, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#FF9F1C'; poly(ctx, [[r * .7, -r * .1], [r * 1.05, r * .02], [r * .7, r * .14]]); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * .38, -r * .15, r * .17, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1B1B1B'; ctx.beginPath(); ctx.arc(r * .42, -r * .15, r * .09, 0, TAU); ctx.fill();
    },
    rice(ctx, r) {
      ctx.strokeStyle = '#7FA23A'; ctx.lineWidth = r * .1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, r); ctx.quadraticCurveTo(r * .1, 0, r * .5, -r * .7); ctx.stroke();
      ctx.fillStyle = '#F2C94C';
      for (let i = 0; i < 6; i++) {
        const p = i / 6, x = r * .05 + p * r * .45, y = r * .1 - p * r * .78;
        [[-1], [1]].forEach(([s]) => { ctx.beginPath(); ctx.ellipse(x + s * r * .2, y, r * .17, r * .1, s * .7, 0, TAU); ctx.fill(); outline(ctx, r * .04, '#A8770B'); });
      }
      ctx.fillStyle = '#7FA23A'; ctx.beginPath(); ctx.ellipse(-r * .3, r * .5, r * .35, r * .1, -.7, 0, TAU); ctx.fill();
      ctx.lineCap = 'butt';
    },
    veg(ctx, r) {
      ctx.fillStyle = '#FF8A2B';
      ctx.beginPath(); ctx.moveTo(-r * .38, -r * .35); ctx.quadraticCurveTo(0, -r * .5, r * .38, -r * .35);
      ctx.lineTo(0, r * 1); ctx.closePath(); ctx.fill(); outline(ctx, r * .08, '#A84A0E');
      ctx.strokeStyle = '#D9661A'; ctx.lineWidth = r * .07;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * .2 + i * r * .05, -r * .05 + i * r * .28); ctx.lineTo(r * .05 + i * r * .04, -r * .05 + i * r * .28); ctx.stroke(); }
      ctx.fillStyle = '#4CAF50';
      [[-.35, -.75, -.5], [0, -.9, 0], [.35, -.75, .5]].forEach(([x, y, a]) => { ctx.save(); ctx.translate(x * r, y * r); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, r * .16, r * .42, 0, 0, TAU); ctx.fill(); outline(ctx, r * .05, '#2A7535'); ctx.restore(); });
    },
    egret(ctx, r, t) {
      ctx.strokeStyle = '#E3A72F'; ctx.lineWidth = r * .07;
      ctx.beginPath(); ctx.moveTo(-r * .1, r * .4); ctx.lineTo(-r * .15, r * 1); ctx.moveTo(r * .15, r * .4); ctx.lineTo(r * .2, r * 1); ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(-r * .05, r * .15, r * .62, r * .36, -.2, 0, TAU); ctx.fill(); outline(ctx, r * .07, '#8C9BAD');
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * .2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(r * .35, 0); ctx.quadraticCurveTo(r * .65, -r * .3, r * .38, -r * .62); ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * .4, -r * .68, r * .18, 0, TAU); ctx.fill(); outline(ctx, r * .06, '#8C9BAD');
      ctx.fillStyle = '#F2B33D'; poly(ctx, [[r * .55, -r * .74], [r * 1.05, -r * .66], [r * .55, -r * .6]]); ctx.fill();
      ctx.fillStyle = '#1B1B1B'; ctx.beginPath(); ctx.arc(r * .45, -r * .72, r * .05, 0, TAU); ctx.fill();
    },
    tree(ctx, r) {
      ctx.fillStyle = '#8A5A2B'; rr(ctx, -r * .14, r * .1, r * .28, r * .9, r * .08); ctx.fill();
      ctx.fillStyle = '#4CBB5C';
      [[0, -.35, .55], [-.42, -.05, .42], [.42, -.05, .42], [0, .12, .45]].forEach(([x, y, s]) => { ctx.beginPath(); ctx.arc(x * r, y * r, s * r, 0, TAU); ctx.fill(); });
      ctx.beginPath(); ctx.arc(0, -r * .35, r * .55, 0, TAU); outline(ctx, r * .06, '#2A7535');
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-r * .18, -r * .55, r * .14, 0, TAU); ctx.fill();
    },
    bike(ctx, r) {
      ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = r * .12;
      ctx.beginPath(); ctx.arc(-r * .55, r * .35, r * .38, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(r * .55, r * .35, r * .38, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#E8547A'; ctx.lineWidth = r * .12; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-r * .55, r * .35); ctx.lineTo(-r * .15, -r * .25); ctx.lineTo(r * .4, -r * .25); ctx.lineTo(r * .55, r * .35);
      ctx.moveTo(-r * .15, -r * .25); ctx.lineTo(r * .05, r * .35); ctx.lineTo(r * .4, -r * .25); ctx.stroke();
      ctx.strokeStyle = '#2E3A59'; ctx.lineWidth = r * .1;
      ctx.beginPath(); ctx.moveTo(-r * .3, -r * .45); ctx.lineTo(0, -r * .45); ctx.moveTo(r * .4, -r * .25); ctx.lineTo(r * .32, -r * .55); ctx.lineTo(r * .55, -r * .6); ctx.stroke();
    },
    solar(ctx, r) {
      ctx.save(); ctx.rotate(-.12);
      ctx.fillStyle = '#9AA3B5'; rr(ctx, -r * .08, r * .45, r * .16, r * .5, r * .05); ctx.fill();
      ctx.fillStyle = '#2B5FB8'; rr(ctx, -r * .95, -r * .65, r * 1.9, r * 1.15, r * .1); ctx.fill(); outline(ctx, r * .08, '#183A75');
      ctx.strokeStyle = '#8FC1FF'; ctx.lineWidth = r * .05;
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-r * .95 + i * r * .475, -r * .65); ctx.lineTo(-r * .95 + i * r * .475, r * .5); ctx.stroke(); }
      for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * .95, -r * .65 + i * r * .383); ctx.lineTo(r * .95, -r * .65 + i * r * .383); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.45)'; poly(ctx, [[-r * .8, -r * .55], [-r * .35, -r * .55], [-r * .7, -r * .1]]); ctx.fill();
      ctx.restore();
    },
    thermo(ctx, r) {
      ctx.fillStyle = '#FFFFFF'; rr(ctx, -r * .22, -r, r * .44, r * 1.45, r * .22); ctx.fill(); outline(ctx, r * .08, '#7A5CDB');
      ctx.beginPath(); ctx.arc(0, r * .55, r * .38, 0, TAU); ctx.fill(); outline(ctx, r * .08, '#7A5CDB');
      ctx.fillStyle = '#F2453D'; rr(ctx, -r * .09, -r * .55, r * .18, r * 1.1, r * .09); ctx.fill();
      ctx.beginPath(); ctx.arc(0, r * .55, r * .26, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#7A5CDB'; ctx.lineWidth = r * .06;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(r * .22, -r * .75 + i * r * .25); ctx.lineTo(r * .4, -r * .75 + i * r * .25); ctx.stroke(); }
    },
    rain(ctx, r) {
      ctx.fillStyle = '#4DB6F5';
      ctx.beginPath(); ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * .35, -r * .45, r * .8, 0, r * .8, r * .3);
      ctx.arc(0, r * .3, r * .8, 0, Math.PI);
      ctx.bezierCurveTo(-r * .8, 0, -r * .35, -r * .45, 0, -r); ctx.fill(); outline(ctx, r * .08, '#1F6FA8');
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-r * .3, r * .1, r * .12, r * .25, .4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#16405F';
      ctx.beginPath(); ctx.arc(-r * .22, r * .3, r * .08, 0, TAU); ctx.arc(r * .22, r * .3, r * .08, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#16405F'; ctx.lineWidth = r * .06; ctx.beginPath(); ctx.arc(0, r * .45, r * .16, .2, Math.PI - .2); ctx.stroke();
    },
    vane(ctx, r, t) {
      ctx.strokeStyle = '#4A3B78'; ctx.lineWidth = r * .1;
      ctx.beginPath(); ctx.moveTo(0, -r * .2); ctx.lineTo(0, r); ctx.stroke();
      ctx.save(); ctx.translate(0, -r * .35); ctx.rotate(t * 6);
      for (let i = 0; i < 3; i++) {
        ctx.rotate(TAU / 3);
        ctx.strokeStyle = '#4A3B78'; ctx.lineWidth = r * .07; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r * .55, 0); ctx.stroke();
        ctx.fillStyle = '#FFC93D'; ctx.beginPath(); ctx.arc(r * .6, 0, r * .22, 0, TAU); ctx.fill(); outline(ctx, r * .05, '#A8770B');
      }
      ctx.restore();
      ctx.fillStyle = '#7A5CDB'; ctx.beginPath(); ctx.arc(0, -r * .35, r * .12, 0, TAU); ctx.fill();
    },
    neon(ctx, r, t) {
      // vertical hanging shop sign with glowing border (no text)
      const glow = .6 + Math.sin(t * 5) * .25;
      ctx.strokeStyle = '#5C3A1C'; ctx.lineWidth = r * .08;
      ctx.beginPath(); ctx.moveTo(-r * .9, -r * .95); ctx.lineTo(-r * .35, -r * .95); ctx.stroke();
      ctx.fillStyle = '#E8547A'; rr(ctx, -r * .45, -r * .85, r * .9, r * 1.75, r * .14); ctx.fill(); outline(ctx, r * .08, '#7A1F3D');
      ctx.save(); ctx.globalAlpha = glow; ctx.strokeStyle = '#FFE36B'; ctx.lineWidth = r * .09;
      rr(ctx, -r * .32, -r * .72, r * .64, r * 1.49, r * .1); ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#FFF3B0';
      [[-.42], [0], [.42]].forEach(([y]) => { rr(ctx, -r * .17, y * r - r * .13, r * .34, r * .26, r * .07); ctx.fill(); });
    },
    goldfish(ctx, r, t) {
      // clear water bag with an orange fish
      ctx.fillStyle = 'rgba(160,220,255,.75)';
      ctx.beginPath(); ctx.moveTo(-r * .18, -r * .7);
      ctx.quadraticCurveTo(-r * .95, -r * .1, -r * .75, r * .55);
      ctx.quadraticCurveTo(0, r * 1.15, r * .75, r * .55);
      ctx.quadraticCurveTo(r * .95, -r * .1, r * .18, -r * .7); ctx.closePath(); ctx.fill(); outline(ctx, r * .07, '#2E7FB8');
      ctx.fillStyle = '#E8F7FF'; rr(ctx, -r * .26, -r * .98, r * .52, r * .32, r * .1); ctx.fill(); outline(ctx, r * .06, '#2E7FB8');
      const sw = Math.sin(t * 6) * .15;
      ctx.save(); ctx.translate(0, r * .25); ctx.rotate(sw);
      ctx.fillStyle = '#FF8A1F';
      ctx.beginPath(); ctx.ellipse(r * .08, 0, r * .36, r * .24, 0, 0, TAU); ctx.fill(); outline(ctx, r * .05, '#B4521C');
      poly(ctx, [[-r * .22, 0], [-r * .55, -r * .25], [-r * .48, r * .25]]); ctx.fill(); outline(ctx, r * .05, '#B4521C');
      ctx.fillStyle = '#1B1B1B'; ctx.beginPath(); ctx.arc(r * .26, -r * .05, r * .05, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-r * .45, r * .05, r * .08, r * .22, .3, 0, TAU); ctx.fill();
    },
    minibus(ctx, r) {
      ctx.fillStyle = '#FFF3DD'; rr(ctx, -r, -r * .62, r * 2, r * 1.15, r * .3); ctx.fill(); outline(ctx, r * .08, '#7A4E2D');
      ctx.fillStyle = '#E2453C'; rr(ctx, -r, -r * .62, r * 2, r * .42, r * .3); ctx.fill();
      ctx.fillRect(-r, r * .12, r * 2, r * .2);
      ctx.fillStyle = '#9ED9F6';
      for (let i = 0; i < 3; i++) { rr(ctx, -r * .82 + i * r * .5, -r * .5, r * .4, r * .32, r * .06); ctx.fill(); }
      rr(ctx, r * .66, -r * .5, r * .26, r * .46, r * .06); ctx.fill();
      ctx.fillStyle = '#2E3640';
      [[-.55], [.55]].forEach(([x]) => { ctx.beginPath(); ctx.arc(x * r, r * .55, r * .22, 0, TAU); ctx.fill(); });
      ctx.fillStyle = '#C9CED6';
      [[-.55], [.55]].forEach(([x]) => { ctx.beginPath(); ctx.arc(x * r, r * .55, r * .09, 0, TAU); ctx.fill(); });
    },
    estate(ctx, r) {
      ctx.fillStyle = '#F3C969'; rr(ctx, -r * .85, -r * .55, r * .8, r * 1.5, r * .08); ctx.fill(); outline(ctx, r * .07, '#8A5A2B');
      ctx.fillStyle = '#7FC6E8'; rr(ctx, -r * .02, -r * .95, r * .85, r * 1.9, r * .08); ctx.fill(); outline(ctx, r * .07, '#22558A');
      ctx.fillStyle = '#FFFFFF';
      for (let y = 0; y < 6; y++) for (let x = 0; x < 3; x++) ctx.fillRect(r * .1 + x * r * .24, -r * .82 + y * r * .28, r * .14, r * .15);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) ctx.fillRect(-r * .75 + x * r * .24, -r * .42 + y * r * .3, r * .14, r * .16);
      ctx.fillStyle = '#5CB85C'; ctx.beginPath(); ctx.ellipse(0, r * .95, r * 1, r * .14, 0, 0, TAU); ctx.fill();
    },
    train(ctx, r) {
      ctx.fillStyle = '#E9EEF3'; rr(ctx, -r * .95, -r * .55, r * 1.9, r * 1.05, r * .35); ctx.fill(); outline(ctx, r * .08, '#3B4A5C');
      ctx.fillStyle = '#E8423A'; ctx.fillRect(-r * .95, r * .05, r * 1.9, r * .16);
      ctx.fillStyle = '#2B6CB0'; ctx.fillRect(-r * .95, r * .21, r * 1.9, r * .08);
      ctx.fillStyle = '#7FC6E8';
      for (let i = 0; i < 3; i++) { rr(ctx, -r * .78 + i * r * .46, -r * .4, r * .34, r * .32, r * .06); ctx.fill(); }
      rr(ctx, r * .6, -r * .4, r * .24, r * .32, r * .06); ctx.fill();
      ctx.fillStyle = '#3B4A5C'; ctx.fillRect(-r, r * .6, r * 2, r * .1);
      [[-.5], [.5]].forEach(([x]) => { ctx.beginPath(); ctx.arc(x * r, r * .55, r * .14, 0, TAU); ctx.fill(); });
    },
    dragonboat(ctx, r, t) {
      const b = Math.sin(t * 4) * r * .04;
      ctx.save(); ctx.translate(0, b);
      ctx.fillStyle = '#E8423A';
      ctx.beginPath(); ctx.moveTo(-r * 1.0, -r * .05); ctx.quadraticCurveTo(0, r * .55, r * .85, -r * .05); ctx.lineTo(-r * 1.0, -r * .05); ctx.fill(); outline(ctx, r * .07, '#8A1F1A');
      ctx.fillStyle = '#FFC93D'; ctx.fillRect(-r * .8, -r * .02, r * 1.5, r * .1);
      // dragon head
      ctx.fillStyle = '#3FA34D';
      ctx.beginPath(); ctx.moveTo(r * .7, -r * .05); ctx.quadraticCurveTo(r * .9, -r * .7, r * 1.05, -r * .45); ctx.lineTo(r * .95, -r * .2); ctx.closePath(); ctx.fill(); outline(ctx, r * .06, '#1D5E27');
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * .9, -r * .5, r * .07, 0, TAU); ctx.fill();
      // rowers
      ctx.fillStyle = '#5B8FD9';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-r * .55 + i * r * .4, -r * .25, r * .13, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#8A5A2B'; ctx.lineWidth = r * .06;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * .55 + i * r * .4, -r * .2); ctx.lineTo(-r * .75 + i * r * .4, r * .45); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = '#38B6D8'; ctx.lineWidth = r * .1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-r * .95, r * .55); ctx.quadraticCurveTo(-r * .5, r * .4, 0, r * .55); ctx.quadraticCurveTo(r * .5, r * .7, r * .95, r * .55); ctx.stroke(); ctx.lineCap = 'butt';
    },
    plane(ctx, r) {
      ctx.save(); ctx.rotate(-.35);
      ctx.fillStyle = '#C9D6E8';
      poly(ctx, [[-r * .1, -r * .1], [-r * .45, -r * .85], [-r * .2, -r * .85], [r * .3, -r * .1]]); ctx.fill(); outline(ctx, r * .06, '#3B4A5C');
      poly(ctx, [[-r * .1, r * .1], [-r * .45, r * .85], [-r * .2, r * .85], [r * .3, r * .1]]); ctx.fill(); outline(ctx, r * .06, '#3B4A5C');
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1, r * .2, 0, 0, TAU); ctx.fill(); outline(ctx, r * .07, '#3B4A5C');
      ctx.fillStyle = '#3D7BE0'; poly(ctx, [[-r * .75, -r * .05], [-r * .98, -r * .48], [-r * .82, -r * .48], [-r * .55, -r * .05]]); ctx.fill(); outline(ctx, r * .05, '#2453A3');
      ctx.fillStyle = '#7FC6E8'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-r * .3 + i * r * .22, -r * .03, r * .05, 0, TAU); ctx.fill(); }
      ctx.restore();
    },
    suitcase(ctx, r) {
      ctx.strokeStyle = '#5C3A1C'; ctx.lineWidth = r * .1;
      rr(ctx, -r * .28, -r * .95, r * .56, r * .35, r * .1); ctx.stroke();
      ctx.fillStyle = '#F07F3C'; rr(ctx, -r * .8, -r * .65, r * 1.6, r * 1.35, r * .2); ctx.fill(); outline(ctx, r * .08, '#8A3E12');
      ctx.fillStyle = '#FFC93D'; ctx.fillRect(-r * .5, -r * .65, r * .14, r * 1.35); ctx.fillRect(r * .36, -r * .65, r * .14, r * 1.35);
      ctx.fillStyle = '#FFFFFF'; rr(ctx, -r * .25, -r * .15, r * .5, r * .32, r * .06); ctx.fill(); outline(ctx, r * .04, '#8A3E12');
      ctx.fillStyle = '#2E3640'; [[-.55], [.55]].forEach(([x]) => { ctx.beginPath(); ctx.arc(x * r, r * .8, r * .12, 0, TAU); ctx.fill(); });
    },
    dolphin(ctx, r, t) {
      ctx.save(); ctx.rotate(-.25 + Math.sin(t * 3) * .1);
      ctx.fillStyle = '#F7A8BE';
      ctx.beginPath(); ctx.moveTo(r * 1, -r * .05);
      ctx.quadraticCurveTo(r * .6, -r * .55, -r * .1, -r * .45);
      ctx.quadraticCurveTo(-r * .7, -r * .35, -r * .85, r * .05);
      ctx.lineTo(-r * 1.05, -r * .3); ctx.lineTo(-r * .95, r * .2); ctx.lineTo(-r * 1.05, r * .55);
      ctx.quadraticCurveTo(-r * .5, r * .3, 0, r * .3);
      ctx.quadraticCurveTo(r * .6, r * .3, r * 1, -r * .05); ctx.closePath(); ctx.fill(); outline(ctx, r * .07, '#B9586A');
      ctx.fillStyle = '#F7A8BE'; poly(ctx, [[-r * .05, -r * .44], [-r * .3, -r * .85], [r * .2, -r * .45]]); ctx.fill(); outline(ctx, r * .06, '#B9586A');
      ctx.fillStyle = '#FFE0E8'; ctx.beginPath(); ctx.ellipse(r * .2, r * .12, r * .4, r * .1, -.1, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1B1B1B'; ctx.beginPath(); ctx.arc(r * .6, -r * .15, r * .06, 0, TAU); ctx.fill();
      ctx.restore();
    }
  };

  function drawItem(ctx, key, x, y, r, t) {
    ctx.save(); ctx.translate(x, y);
    (ITEMS[key] || ITEMS.leaf)(ctx, r, t || 0);
    ctx.restore();
  }

  // Render an item to a data URL (for HTML badges/cards)
  const cache = {};
  function itemURL(key, size) {
    const id = key + size;
    if (cache[id]) return cache[id];
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d');
    drawItem(g, key, size / 2, size / 2, size * .4, 0.3);
    return (cache[id] = c.toDataURL());
  }

  /* ---------- Litter blob enemy ---------- */
  function drawLitter(ctx, x, y, w, h, t, squash) {
    ctx.save(); ctx.translate(x + w / 2, y + h);
    const s = squash || 0;
    ctx.scale(1 + s * .5, 1 - s * .7);
    const wob = Math.sin(t * 10) * .06;
    ctx.rotate(wob);
    // bag body
    ctx.fillStyle = '#5E6B7A';
    ctx.beginPath();
    ctx.moveTo(-w * .48, 0);
    ctx.quadraticCurveTo(-w * .6, -h * .6, -w * .2, -h * .82);
    ctx.lineTo(w * .2, -h * .82);
    ctx.quadraticCurveTo(w * .6, -h * .6, w * .48, 0);
    ctx.closePath(); ctx.fill(); outline(ctx, w * .06, '#2E3640');
    // tie
    ctx.fillStyle = '#5E6B7A';
    poly(ctx, [[-w * .2, -h * .8], [-w * .32, -h * 1.02], [0, -h * .9], [w * .32, -h * 1.02], [w * .2, -h * .8]]); ctx.fill(); outline(ctx, w * .05, '#2E3640');
    // sheen
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.ellipse(-w * .22, -h * .45, w * .08, h * .22, .2, 0, TAU); ctx.fill();
    // eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(-w * .15, -h * .48, w * .11, h * .13, 0, 0, TAU); ctx.ellipse(w * .15, -h * .48, w * .11, h * .13, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1B1B1B';
    ctx.beginPath(); ctx.arc(-w * .13, -h * .45, w * .055, 0, TAU); ctx.arc(w * .17, -h * .45, w * .055, 0, TAU); ctx.fill();
    // brows
    ctx.strokeStyle = '#1B1B1B'; ctx.lineWidth = w * .06; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * .27, -h * .66); ctx.lineTo(-w * .05, -h * .6); ctx.moveTo(w * .27, -h * .66); ctx.lineTo(w * .05, -h * .6); ctx.stroke();
    // mouth
    ctx.beginPath(); ctx.arc(0, -h * .2, w * .1, Math.PI + .5, -.5); ctx.stroke();
    ctx.lineCap = 'butt';
    // feet
    ctx.fillStyle = '#2E3640';
    const step = Math.sin(t * 14) * w * .05;
    ctx.beginPath(); ctx.ellipse(-w * .22 + step, 0, w * .14, h * .06, 0, 0, TAU); ctx.ellipse(w * .22 - step, 0, w * .14, h * .06, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  /* ---------- Geo block (bump from below) ---------- */
  function drawBlock(ctx, x, y, s, used, t, color) {
    ctx.save();
    rr(ctx, x + 1, y + 1, s - 2, s - 2, s * .16);
    ctx.fillStyle = used ? '#B9A58A' : '#FFC93D'; ctx.fill();
    outline(ctx, s * .06, used ? '#7A6650' : '#A8770B');
    rr(ctx, x + s * .12, y + s * .12, s * .76, s * .76, s * .1);
    stitch(ctx, used ? 'rgba(90,70,50,.45)' : 'rgba(168,119,11,.8)', s * .035);
    if (!used) {
      const b = Math.sin(t * 4) * s * .03;
      ctx.fillStyle = '#7A4E2D';
      ctx.font = `700 ${s * .62}px Fredoka, Nunito, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', x + s / 2, y + s * .54 + b);
    }
    ctx.restore();
  }

  /* ---------- Goal flag ---------- */
  function drawFlag(ctx, x, groundY, h, t, color, raised) {
    ctx.save();
    ctx.fillStyle = '#E9DCC6'; rr(ctx, x - 5, groundY - h, 10, h, 5); ctx.fill(); outline(ctx, 3, '#7A4E2D');
    ctx.fillStyle = '#FFC93D'; ctx.beginPath(); ctx.arc(x, groundY - h - 6, 11, 0, TAU); ctx.fill(); outline(ctx, 3, '#A8770B');
    const fy = groundY - h + 14 + (1 - raised) * (h - 90);
    const wave = Math.sin(t * 6) * 6;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x + 5, fy);
    ctx.quadraticCurveTo(x + 45, fy - 8 + wave, x + 85, fy + 4);
    ctx.quadraticCurveTo(x + 75, fy + 28, x + 85, fy + 52);
    ctx.quadraticCurveTo(x + 45, fy + 44 + wave, x + 5, fy + 52); ctx.closePath(); ctx.fill(); outline(ctx, 3, 'rgba(0,0,0,.35)');
    // globe emblem
    ctx.fillStyle = '#5B8FD9'; ctx.beginPath(); ctx.arc(x + 44, fy + 25, 15, 0, TAU); ctx.fill(); outline(ctx, 2.5, '#fff');
    ctx.fillStyle = '#9BD35A';
    ctx.beginPath(); ctx.ellipse(x + 39, fy + 20, 6, 4, .5, 0, TAU); ctx.ellipse(x + 49, fy + 30, 5, 4, -.3, 0, TAU); ctx.fill();
    // base
    ctx.fillStyle = '#7A4E2D'; rr(ctx, x - 22, groundY - 16, 44, 16, 6); ctx.fill();
    ctx.restore();
  }

  /* ---------- Terrain tiles per style ---------- */
  const STYLES = {
    columns: { top: '#C9C2D6', body: '#9A93A8', line: '#6F6880', edge: '#5A536B', deco: 'hex' },
    sandbar: { top: '#F6DFA8', body: '#E3BF7A', line: '#C79C55', edge: '#9C7238', deco: 'pebble' },
    forest:  { top: '#5CB85C', body: '#8A5A2B', line: '#6B4220', edge: '#2A7535', deco: 'grass' },
    wetland: { top: '#8CCB5E', body: '#A0703F', line: '#7A5230', edge: '#4F7F2E', deco: 'grass' },
    city:    { top: '#7D8796', body: '#B6BCC6', line: '#8C93A0', edge: '#525B69', deco: 'runway' },
    sky:     { top: '#7FD27A', body: '#9B6B3E', line: '#7A5230', edge: '#3F8F3A', deco: 'grass' },
    street:  { top: '#D9CBB5', body: '#B3A48C', line: '#8C7C64', edge: '#6B5B44', deco: 'kerb' },
    newtown: { top: '#7FD27A', body: '#C9B79A', line: '#A8967A', edge: '#3F8F3A', deco: 'grass' },
    airport: { top: '#6F7887', body: '#C2C7CF', line: '#9AA0AA', edge: '#4A5260', deco: 'runway' }
  };

  function drawGround(ctx, x, y, w, h, style, T, isTopRow) {
    const S = STYLES[style];
    ctx.save();
    rr(ctx, x, y, w, h + T, Math.min(T * .32, 14));
    ctx.fillStyle = S.body; ctx.fill();
    ctx.clip();
    // texture
    if (style === 'columns') {
      ctx.strokeStyle = S.line; ctx.lineWidth = 3;
      for (let cx = x + T * .5; cx < x + w; cx += T * .5) { ctx.beginPath(); ctx.moveTo(cx, y + T * .4); ctx.lineTo(cx, y + h + T); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      for (let cx = x; cx < x + w; cx += T) ctx.fillRect(cx + 4, y + T * .4, T * .18, h);
    } else if (style === 'street') {
      ctx.strokeStyle = S.line; ctx.lineWidth = 2;
      for (let cy = y + T * .9; cy < y + h + T; cy += T * .55) { ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + w, cy); ctx.stroke(); }
      for (let cx = x + T * .5; cx < x + w; cx += T * .6) { ctx.beginPath(); ctx.moveTo(cx, y + T * .45); ctx.lineTo(cx, y + h + T); ctx.stroke(); }
    } else if (style === 'city' || style === 'airport') {
      ctx.fillStyle = style === 'airport' ? '#B0B6C0' : '#A5ACB8';
      for (let cy = y + T; cy < y + h; cy += T * .8) for (let cx = x + ((cy / T) % 2 ? 0 : T * .4); cx < x + w; cx += T * .8) { rr(ctx, cx + 3, cy + 3, T * .8 - 6, T * .8 - 6, 4); ctx.fill(); }
    } else {
      ctx.fillStyle = 'rgba(0,0,0,.08)';
      for (let i = 0; i < (w * h) / 900; i++) {
        const px = x + ((i * 97.3) % w), py = y + T * .6 + ((i * 53.7) % Math.max(1, h));
        ctx.beginPath(); ctx.ellipse(px, py, 5, 3, i, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
    // top surface
    ctx.save();
    const th = T * .42;
    rr(ctx, x, y, w, th, Math.min(T * .32, 14));
    ctx.fillStyle = S.top; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = S.edge; ctx.stroke();
    // stitches
    ctx.beginPath(); ctx.moveTo(x + 8, y + th * .55); ctx.lineTo(x + w - 8, y + th * .55);
    stitch(ctx, 'rgba(255,255,255,.55)', 2.2);
    if (style === 'street') {
      ctx.fillStyle = '#F2C94C';
      for (let cx = x + 10; cx < x + w - 14; cx += T * .9) ctx.fillRect(cx, y + th * .3, T * .45, 5);
    }
    if (style === 'city' || style === 'airport') {
      ctx.fillStyle = style === 'airport' ? '#FFE36B' : '#FFFFFF';
      for (let cx = x + 14; cx < x + w - 20; cx += T * 1.2) ctx.fillRect(cx, y + th * .4, T * .5, 4);
    }
    if (style === 'forest' || style === 'wetland' || style === 'sky' || style === 'newtown') {
      ctx.fillStyle = S.top;
      for (let cx = x + 6; cx < x + w - 6; cx += 14) { ctx.beginPath(); ctx.moveTo(cx, y + th); ctx.lineTo(cx + 7, y + th + 7); ctx.lineTo(cx + 14, y + th); ctx.fill(); }
    }
    ctx.restore();
    // outline of whole block
    ctx.save(); rr(ctx, x, y, w, h + T, Math.min(T * .32, 14)); ctx.lineWidth = 3; ctx.strokeStyle = S.edge; ctx.stroke(); ctx.restore();
  }

  function drawPlatform(ctx, x, y, w, T, style, t) {
    if (style === 'sky') {
      // fluffy cloud
      ctx.save();
      const bob = 0;
      ctx.fillStyle = '#FFFFFF';
      const n = Math.max(2, Math.round(w / (T * .7)));
      ctx.beginPath();
      for (let i = 0; i < n; i++) { const cx = x + (i + .5) * (w / n); ctx.moveTo(cx + T * .45, y + T * .35 + bob); ctx.arc(cx, y + T * .35 + bob, T * .45, 0, TAU); }
      ctx.rect(x + T * .2, y + T * .35, w - T * .4, T * .45);
      ctx.fill();
      ctx.strokeStyle = 'rgba(122,92,219,.35)'; ctx.lineWidth = 3;
      rr(ctx, x + T * .05, y + T * .55, w - T * .1, T * .32, T * .16); ctx.fillStyle = '#E8E2FA'; ctx.fill();
      ctx.restore();
      return;
    }
    if (style === 'forest') {
      ctx.save();
      rr(ctx, x, y + 4, w, T * .55, T * .27); ctx.fillStyle = '#9C6A3A'; ctx.fill(); outline(ctx, 3, '#5C3A1C');
      ctx.strokeStyle = '#7A5230'; ctx.lineWidth = 2;
      for (let cx = x + 18; cx < x + w - 10; cx += 26) { ctx.beginPath(); ctx.arc(cx, y + T * .32, 6, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#5CB85C';
      for (let cx = x + 10; cx < x + w; cx += 34) { ctx.beginPath(); ctx.ellipse(cx, y + 4, 12, 6, -.3, 0, TAU); ctx.fill(); }
      ctx.restore();
      return;
    }
    if (style === 'wetland') {
      // lily pad / straw bale
      ctx.save();
      rr(ctx, x, y + 2, w, T * .5, T * .25); ctx.fillStyle = '#F2D27A'; ctx.fill(); outline(ctx, 3, '#A8770B');
      ctx.strokeStyle = '#D9A93D'; ctx.lineWidth = 2;
      for (let cx = x + 10; cx < x + w - 6; cx += 9) { ctx.beginPath(); ctx.moveTo(cx, y + 8); ctx.lineTo(cx + 4, y + T * .45); ctx.stroke(); }
      ctx.restore();
      return;
    }
    if (style === 'city') {
      ctx.save();
      rr(ctx, x, y, w, T * .6, 8); ctx.fillStyle = '#E8EEF3'; ctx.fill(); outline(ctx, 3, '#525B69');
      ctx.fillStyle = '#6CC46A'; rr(ctx, x + 4, y - 6, w - 8, 12, 6); ctx.fill(); outline(ctx, 2.5, '#2A7535');
      ctx.fillStyle = '#8FC1FF';
      for (let cx = x + 10; cx < x + w - 16; cx += 22) ctx.fillRect(cx, y + 12, 12, 10);
      ctx.restore();
      return;
    }
    if (style === 'street') {
      // striped market-stall awning
      ctx.save();
      rr(ctx, x, y, w, T * .5, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#E8423A';
      for (let cx = x; cx < x + w; cx += 28) ctx.fillRect(cx, y, 14, T * .5);
      ctx.restore();
      rr(ctx, x, y, w, T * .5, 8); outline(ctx, 3, '#8A1F1A');
      ctx.fillStyle = '#E8423A';
      for (let cx = x + 7; cx < x + w - 6; cx += 28) { ctx.beginPath(); ctx.arc(cx, y + T * .5, 7, 0, Math.PI); ctx.fill(); }
      ctx.restore();
      return;
    }
    if (style === 'newtown') {
      // rowing pontoon
      ctx.save();
      rr(ctx, x, y + 2, w, T * .48, 10); ctx.fillStyle = '#C98A4B'; ctx.fill(); outline(ctx, 3, '#6B4220');
      ctx.strokeStyle = '#8A5A2B'; ctx.lineWidth = 2;
      for (let cx = x + 16; cx < x + w - 6; cx += 18) { ctx.beginPath(); ctx.moveTo(cx, y + 4); ctx.lineTo(cx, y + T * .46); ctx.stroke(); }
      ctx.fillStyle = '#FFC93D'; rr(ctx, x + 6, y + T * .38, 18, 10, 4); ctx.fill(); rr(ctx, x + w - 24, y + T * .38, 18, 10, 4); ctx.fill();
      ctx.restore();
      return;
    }
    if (style === 'airport') {
      // cargo containers
      ctx.save();
      const n = Math.max(1, Math.round(w / (T * 1.2))), cw = w / n;
      const cols = ['#3D7BE0', '#F07F3C', '#3FA34D'];
      for (let i = 0; i < n; i++) {
        rr(ctx, x + i * cw + 1, y, cw - 2, T * .62, 6); ctx.fillStyle = cols[i % 3]; ctx.fill(); outline(ctx, 3, 'rgba(0,0,0,.45)');
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
        for (let cx = x + i * cw + 10; cx < x + (i + 1) * cw - 6; cx += 10) { ctx.beginPath(); ctx.moveTo(cx, y + 5); ctx.lineTo(cx, y + T * .57); ctx.stroke(); }
      }
      ctx.restore();
      return;
    }
    // columns / sandbar default: stone slab
    ctx.save();
    const S = STYLES[style];
    rr(ctx, x, y, w, T * .62, 10); ctx.fillStyle = S.body; ctx.fill(); outline(ctx, 3, S.edge);
    rr(ctx, x, y, w, T * .26, 10); ctx.fillStyle = S.top; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 8, y + T * .4); ctx.lineTo(x + w - 8, y + T * .4); stitch(ctx, 'rgba(255,255,255,.5)', 2);
    ctx.restore();
  }

  function drawWater(ctx, x0, x1, y, h, t, style) {
    const col = style === 'wetland' ? '#5FB7C9' : style === 'forest' ? '#56B6D6' : style === 'city' ? '#3F8FD2' : style === 'sky' ? '#9FD8F5' : style === 'street' ? '#4FA3E0' : style === 'newtown' ? '#3FA9C9' : style === 'airport' ? '#2F8FD8' : '#2FB4D8';
    ctx.save();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x0, y + 10);
    for (let x = x0; x <= x1 + 40; x += 40) ctx.quadraticCurveTo(x + 20, y + 10 + Math.sin(t * 2.4 + x * .05) * 7 - 8, x + 40, y + 10);
    ctx.lineTo(x1 + 40, y + h); ctx.lineTo(x0, y + h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 3; ctx.setLineDash([16, 22]);
    ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.moveTo(x0, y + 26); ctx.lineTo(x1 + 40, y + 26); ctx.stroke();
    ctx.restore();
  }

  window.ART = { drawItem, itemURL, drawLitter, drawBlock, drawFlag, drawGround, drawPlatform, drawWater, STYLES, rr };
})();
