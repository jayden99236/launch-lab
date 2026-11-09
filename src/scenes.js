/* ---------- simulation bench ---------- */
const cv = $('#scene');
const SC = { p: null, k: 0, rev: false, raf: 0 };
function colors() {
  const cs = getComputedStyle(document.documentElement), g = n => cs.getPropertyValue(n).trim();
  return { bg: g('--scene-bg'), grid: g('--scene-grid'), ink: g('--ink'), muted: g('--muted'), line: g('--line'), accent: g('--accent'), blue: g('--blue'), good: g('--good'), bad: g('--bad'), warn: g('--warn'), card: g('--card'), water: g('--water'), mono: g('--f-mono') };
}
function sceneSet(p) { cancelAnimationFrame(SC.raf); SC.p = p; SC.k = 0; SC.rev = false; drawScene(); }
function animate(dur, onFrame, done) {
  cancelAnimationFrame(SC.raf);
  const t0 = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = now => { const k = reduce ? 1 : Math.min(1, (now - t0) / dur); onFrame(k); drawScene(); if (k < 1) SC.raf = requestAnimationFrame(step); else if (done) done(); };
  SC.raf = requestAnimationFrame(step);
}
function scenePlay() { SC.rev = true; animate(2800, k => SC.k = k); }
function drawScene() {
  if (!SC.p) return;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !H) return;
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const col = colors();
  c.fillStyle = col.bg; c.fillRect(0, 0, W, H);
  c.strokeStyle = col.grid; c.lineWidth = 1;
  for (let x = 0; x < W; x += 20) { c.beginPath(); c.moveTo(x + .5, 0); c.lineTo(x + .5, H); c.stroke(); }
  for (let y = 0; y < H; y += 20) { c.beginPath(); c.moveTo(0, y + .5); c.lineTo(W, y + .5); c.stroke(); }
  c.font = `12px ${col.mono}`; c.textBaseline = 'middle'; c.setLineDash([]);
  (DRAW[SC.p.kind] || (() => {}))(c, W, H, SC.p, SC.k, SC.rev, col);
}
function niceStep(x) { const p = 10 ** Math.floor(Math.log10(x)), m = x / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
function arrow(c, x1, y1, x2, y2, color, label, col) {
  const L = Math.hypot(x2 - x1, y2 - y1); if (L < 2) return;
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2 - ux * 8, y2 - uy * 8); c.stroke();
  c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * 10 - uy * 5, y2 - uy * 10 + ux * 5); c.lineTo(x2 - ux * 10 + uy * 5, y2 - uy * 10 - ux * 5); c.closePath(); c.fill();
  if (label) { c.font = `600 12px ${col.mono}`; c.textAlign = ux > 0.3 ? 'left' : ux < -0.3 ? 'right' : 'center'; c.fillText(label, x2 + ux * 8, y2 + uy * 12); }
}
function text(c, s, x, y, color, align = 'left', weight = 400, size = 12, col) { c.fillStyle = color; c.textAlign = align; c.font = `${weight} ${size}px ${col.mono}`; c.fillText(s, x, y); }
function readout(c, lines, col) {
  lines = (lines || []).filter(Boolean); if (!lines.length) return;
  c.font = `500 12px ${col.mono}`;
  const w = Math.max(120, ...lines.map(l => c.measureText(l).width + 18)), h = 10 + lines.length * 18;
  c.fillStyle = col.card; c.globalAlpha = 0.92; c.fillRect(10, 10, w, h); c.globalAlpha = 1;
  c.strokeStyle = col.line; c.lineWidth = 1; c.strokeRect(10.5, 10.5, w, h);
  lines.forEach((l, i) => text(c, l, 18, 24 + i * 18, col.ink, 'left', 500, 12, col));
}
function ground(c, W, y, col) { c.strokeStyle = col.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(10, y); c.lineTo(W - 10, y); c.stroke(); }

const DRAW = {};
DRAW.car = (c, W, H, p, k, rev, col) => {
  const { u, a, T } = p;
  const sAt = t => { if (a < 0) { const ts = Math.min(t, u / -a); return u * ts + 0.5 * a * ts * ts; } return u * t + 0.5 * a * t * t; };
  const vAt = t => a < 0 ? Math.max(0, u + a * t) : u + a * t;
  const L = Math.max(sAt(T), 1), x0 = 40, x1 = W - 50, sc = (x1 - x0) / L, gy = H * 0.66;
  ground(c, W, gy, col);
  if (rev) {
    const st = niceStep(L / 6);
    for (let s = 0; s <= L + 1e-6; s += st) { const x = x0 + s * sc; c.strokeStyle = col.muted; c.lineWidth = 1; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy + 7); c.stroke(); text(c, `${fmt(s, 1)}`, x, gy + 18, col.muted, 'center', 400, 11, col); }
    text(c, 'm', W - 20, gy + 18, col.muted, 'right', 400, 11, col);
  }
  c.strokeStyle = col.accent; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, gy); c.lineTo(x1, gy - 60); c.stroke();
  c.fillStyle = col.accent; c.fillRect(x1, gy - 60, 22, 14);
  text(c, rev ? `${fmt(L, 1)} m` : (p.flag || '?'), x1 - 4, gy - 72, col.accent, 'center', 600, 12, col);
  const t = k * T, s = sAt(t), cx = x0 + s * sc;
  if (p.ball) { c.fillStyle = col.blue; c.beginPath(); c.arc(cx, gy - 14, 14, 0, 7); c.fill(); }
  else {
    c.fillStyle = col.blue; c.beginPath(); c.roundRect(cx - 24, gy - 30, 48, 18, 4); c.fill();
    c.beginPath(); c.roundRect(cx - 12, gy - 42, 26, 14, 4); c.fill();
    c.fillStyle = col.ink; for (const dx of [-14, 14]) { c.beginPath(); c.arc(cx + dx, gy - 10, 7, 0, 7); c.fill(); }
  }
  const v = vAt(t);
  arrow(c, cx, gy - 62, cx + clamp(v, 0, 40) * 3 + 6, gy - 62, col.blue, `${fmt(v, 1)} m/s`, col);
  if (a !== 0) arrow(c, cx, gy + 34, cx + Math.sign(a) * (16 + Math.abs(a) * 6), gy + 34, col.warn, `a = ${fmt(a, 1)}`, col);
  readout(c, rev ? [`t = ${fmt(t, 2)} s`, `v = ${fmt(v, 2)} m/s`, `s = ${fmt(s, 1)} m`] : [`u = ${fmt(u, 2)} m/s`, `a = ${fmt(a, 2)} m/s²`], col);
};
DRAW.block = (c, W, H, p, k, rev, col) => {
  const th = rad(p.angle || 0), dir = [Math.cos(th), Math.sin(th)], nrm = [Math.sin(th), -Math.cos(th)];
  const base = H * 0.84, len = Math.min(W * 0.8, th ? (H * 0.62) / Math.sin(th) : W * 0.8);
  const sx = W * 0.08, sy = base - len * Math.sin(th);
  c.fillStyle = col.line; c.strokeStyle = col.ink; c.lineWidth = 2;
  if (th) { c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + len * dir[0], base); c.lineTo(sx, base); c.closePath(); c.fill(); c.stroke(); text(c, `${p.angle}°`, sx + len * dir[0] - 46, base - 12, col.ink, 'left', 600, 12, col); }
  else { c.beginPath(); c.moveTo(sx - 10, sy); c.lineTo(sx + len + 10, sy); c.stroke(); for (let x = sx; x < sx + len; x += 14) { c.beginPath(); c.moveTo(x, sy); c.lineTo(x - 8, sy + 8); c.strokeStyle = col.muted; c.lineWidth = 1; c.stroke(); } }
  const bs = 46, travel = len - bs - 50, along = 20 + (p.a > 0 ? k * k : 0) * travel;
  const cx = sx + dir[0] * (along + bs / 2) + nrm[0] * bs / 2, cy = sy + dir[1] * (along + bs / 2) + nrm[1] * bs / 2;
  c.save(); c.translate(cx, cy); c.rotate(th); c.fillStyle = col.blue; c.fillRect(-bs / 2, -bs / 2, bs, bs);
  text(c, `${p.m} kg`, 0, 0, col.card, 'center', 600, 12, col); c.restore();
  const forces = [p.m * G, p.F || 0, (p.mu || 0) * p.m * G * Math.cos(th)];
  const fs = 70 / Math.max(...forces, 1);
  arrow(c, cx, cy, cx, cy + Math.max(26, p.m * G * fs), col.ink, `mg ${fmt(p.m * G, 0)} N`, col);
  const nl = Math.max(26, p.m * G * Math.cos(th) * fs);
  arrow(c, cx, cy, cx + nrm[0] * nl, cy + nrm[1] * nl, col.muted, 'N', col);
  if (p.F) { const L = Math.max(30, p.F * fs); arrow(c, cx + dir[0] * bs / 2, cy + dir[1] * bs / 2, cx + dir[0] * (bs / 2 + L), cy + dir[1] * (bs / 2 + L), col.accent, `F ${fmt(p.F, 0)} N`, col); }
  if (p.mu) { const f = p.mu * p.m * G * Math.cos(th), L = Math.max(22, f * fs); const ox = cx - dir[0] * bs / 2 - nrm[0] * (bs / 2 - 6), oy = cy - dir[1] * bs / 2 - nrm[1] * (bs / 2 - 6); arrow(c, ox, oy, ox - dir[0] * L, oy - dir[1] * L, col.bad, `f ${rev ? fmt(f, 1) + ' N' : 'μN'}`, col); }
  readout(c, rev ? [`a = ${fmt(p.a, 2)} m/s²`, `μ = ${p.mu || 0}`] : [`m = ${p.m} kg`, `μ = ${p.mu || 0}`, 'a = ?'], col);
};
DRAW.atwood = (c, W, H, p, k, rev, col) => {
  const px = W / 2, py = H * 0.16, r = 24;
  c.strokeStyle = col.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(px - 60, 14); c.lineTo(px + 60, 14); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(px, 14); c.lineTo(px, py); c.stroke();
  c.beginPath(); c.arc(px, py, r, 0, 7); c.fillStyle = col.line; c.fill(); c.stroke();
  const disp = rev ? k * k * H * 0.26 : 0;
  const s1 = 26 + p.m1 * 2.4, s2 = 26 + p.m2 * 2.4;
  const y1 = H * 0.52 + disp, y2 = H * 0.52 - disp;
  c.beginPath(); c.moveTo(px - r, py); c.lineTo(px - r, y1); c.moveTo(px + r, py); c.lineTo(px + r, y2); c.stroke();
  c.fillStyle = col.blue; c.fillRect(px - r - s1 / 2, y1, s1, s1); c.fillStyle = col.accent; c.fillRect(px + r - s2 / 2, y2, s2, s2);
  text(c, `${p.m1} kg`, px - r, y1 + s1 / 2, col.card, 'center', 600, 12, col);
  text(c, `${p.m2} kg`, px + r, y2 + s2 / 2, col.card, 'center', 600, 12, col);
  readout(c, rev ? [`a = ${fmt(p.a, 2)} m/s²`, `T = ${fmt(p.m2 * (G + p.a), 1)} N`] : ['a = ?', 'T = ?'], col);
};
DRAW.drop = (c, W, H, p, k, rev, col) => {
  const gy = H * 0.88, top = H * 0.14, x = W * 0.42;
  ground(c, W, gy, col);
  c.strokeStyle = col.muted; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x - 70, top); c.lineTo(x + 40, top); c.stroke(); c.setLineDash([]);
  arrow(c, x - 60, gy, x - 60, top, col.muted, '', col); arrow(c, x - 60, top, x - 60, gy, col.muted, '', col);
  text(c, `h = ${p.h} m`, x - 68, (top + gy) / 2, col.ink, 'right', 600, 12, col);
  const f = rev ? (p.lift ? 1 - k : k * k) : (p.lift ? 1 : 0);
  const y = top + f * (gy - top - 16);
  c.fillStyle = col.blue;
  if (p.lift) { c.fillRect(x - 18, y - 4, 36, 36); c.strokeStyle = col.ink; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y - 4); c.stroke(); }
  else { c.beginPath(); c.arc(x, y, 16, 0, 7); c.fill(); }
  text(c, `${p.m} kg`, x + 26, y, col.ink, 'left', 500, 12, col);
  const bx = W * 0.72, bw = 30, bh = H * 0.6, by = H * 0.2;
  const pe = 1 - f, ke = p.lift ? 0 : f;
  [[pe, 'GPE', col.accent], [ke, 'KE', col.blue]].forEach(([v, l, cl], i) => {
    const xx = bx + i * (bw + 22);
    c.strokeStyle = col.line; c.lineWidth = 1; c.strokeRect(xx + .5, by + .5, bw, bh);
    c.fillStyle = cl; c.fillRect(xx + 1, by + bh * (1 - v), bw - 1, bh * v);
    text(c, l, xx + bw / 2, by + bh + 14, col.muted, 'center', 500, 11, col);
  });
  const t = Math.sqrt(2 * p.h / G) * k;
  readout(c, rev && !p.lift ? [`t = ${fmt(t, 2)} s`, `v = ${fmt(G * t, 2)} m/s`] : ['g = 9.8 m/s²'], col);
};
DRAW.spring = (c, W, H, p, k, rev, col) => {
  const gy = H * 0.7, wx = 34;
  ground(c, W, gy, col);
  c.fillStyle = col.ink; c.fillRect(wx - 10, gy - 90, 10, 90);
  const L0 = W * 0.34, Lc = L0 * 0.45;
  const ext = rev ? Math.min(1, k / 0.35) : 0;
  const L = Lc + (L0 - Lc) * Math.sin(ext * Math.PI / 2);
  const vb = Math.sqrt(p.k * p.x * p.x / p.m);
  const bx = wx + L + (rev && k > 0.35 ? (k - 0.35) * (W * 0.9) : 0);
  c.strokeStyle = col.warn; c.lineWidth = 2.5; c.beginPath(); c.moveTo(wx, gy - 26);
  const n = 12; for (let i = 1; i <= n; i++) c.lineTo(wx + (Math.min(L, L0) * i) / n, gy - 26 + (i % 2 ? -14 : 14) * (i < n ? 1 : 0));
  c.stroke();
  c.fillStyle = col.blue; c.fillRect(Math.min(bx, W - 60), gy - 48, 44, 44);
  text(c, `${p.m} kg`, Math.min(bx, W - 60) + 22, gy - 26, col.card, 'center', 600, 11, col);
  text(c, `k = ${p.k} N/m`, wx + 6, gy - 104, col.ink, 'left', 600, 12, col);
  text(c, `x = ${p.x} m`, wx + 6, gy + 20, col.muted, 'left', 500, 12, col);
  readout(c, rev ? [`E = ${fmt(0.5 * p.k * p.x * p.x, 2)} J`, `v = ${fmt(vb, 2)} m/s`] : ['E = ½kx²'], col);
};
function traj(v, angDeg, h0, target) {
  const vx = v * Math.cos(rad(angDeg)), vy = v * Math.sin(rad(angDeg));
  const pts = [[0, h0]]; let x = 0, y = h0, t = 0, hit = false, landX = null;
  const dt = 0.01;
  for (let i = 0; i < 6000; i++) {
    t += dt; const nx = vx * t, ny = h0 + vy * t - 0.5 * G * t * t;
    if (target) {
      const l = target.x - target.w / 2, r = target.x + target.w / 2;
      if (target.H > 0 && nx >= l && nx <= r && ny < target.H) {
        if (y >= target.H) { const f = (y - target.H) / (y - ny); const hx = x + f * (nx - x); pts.push([hx, target.H]); hit = true; landX = hx; break; }
        pts.push([nx, ny]); landX = nx; break;
      }
      if (target.H === 0 && ny <= 0) { const f = y / (y - ny); const hx = x + f * (nx - x); pts.push([hx, 0]); landX = hx; hit = hx >= l && hx <= r; break; }
    }
    if (ny <= 0) { const f = y / (y - ny); const hx = x + f * (nx - x); pts.push([hx, 0]); landX = hx; break; }
    pts.push([nx, ny]); x = nx; y = ny;
  }
  return { pts, hit, landX, T: t };
}
DRAW.proj = (c, W, H, p, k, rev, col) => {
  const h0 = p.h || 0, tg = p.target;
  const trs = [];
  if (tg) { p.shots.forEach(s => trs.push({ pts: s.pts, f: 1, old: true, hit: s.hit })); if (p.live) trs.push({ pts: p.live.pts, f: p.liveK }); }
  else { const tr = traj(p.v, p.ang, h0, null); trs.push({ pts: tr.pts, f: rev ? k : 0 }); p._land = tr.landX; p._apex = Math.max(...tr.pts.map(q => q[1])); }
  let xmax = tg ? tg.x + tg.w + 10 : 10, ymax = Math.max(h0, tg ? tg.H : 0) + 4;
  for (const t of trs) for (const q of t.pts) { xmax = Math.max(xmax, tg ? Math.min(q[0], tg.x * 1.9) : q[0]); ymax = Math.max(ymax, q[1]); }
  if (tg) ymax = Math.max(ymax, xmax * 0.35);
  if (!tg && xmax < ymax * 0.4) xmax = ymax * 0.4;
  xmax *= 1.06; ymax *= 1.12;
  const padL = h0 > 0 ? 64 : 34, padR = 16, padT = 16, padB = 32;
  const sc = Math.min((W - padL - padR) / xmax, (H - padT - padB) / ymax);
  const ox = padL, oy = H - padB, X = x => ox + x * sc, Y = y => oy - y * sc;
  c.strokeStyle = col.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(6, oy); c.lineTo(W - 6, oy); c.stroke();
  if (tg || rev) {
    const st = niceStep(xmax / 6);
    for (let s = 0; s <= xmax; s += st) { c.strokeStyle = col.muted; c.lineWidth = 1; c.beginPath(); c.moveTo(X(s), oy); c.lineTo(X(s), oy + 6); c.stroke(); text(c, fmt(s, 0), X(s), oy + 17, col.muted, 'center', 400, 11, col); }
    text(c, 'm', W - 8, oy + 17, col.muted, 'right', 400, 11, col);
  }
  if (h0 > 0) { c.fillStyle = col.line; c.fillRect(0, Y(h0), X(0), oy - Y(h0)); c.strokeStyle = col.ink; c.strokeRect(-1, Y(h0), X(0) + 1, oy - Y(h0)); text(c, `${h0} m`, X(0) - 6, (Y(h0) + oy) / 2, col.ink, 'right', 600, 12, col); }
  if (tg) {
    const l = X(tg.x - tg.w / 2), r = X(tg.x + tg.w / 2);
    if (tg.H > 0) { c.fillStyle = col.line; c.fillRect(l, Y(tg.H), r - l, oy - Y(tg.H)); c.strokeStyle = col.ink; c.lineWidth = 1; c.strokeRect(l, Y(tg.H), r - l, oy - Y(tg.H)); }
    c.fillStyle = col.good; c.fillRect(l, Y(tg.H) - 5, r - l, 5);
    c.strokeStyle = col.good; c.lineWidth = 2; c.beginPath(); c.moveTo((l + r) / 2, Y(tg.H) - 5); c.lineTo((l + r) / 2, Y(tg.H) - 36); c.stroke();
    c.fillStyle = col.good; c.beginPath(); c.moveTo((l + r) / 2, Y(tg.H) - 36); c.lineTo((l + r) / 2 + 18, Y(tg.H) - 30); c.lineTo((l + r) / 2, Y(tg.H) - 24); c.fill();
    text(c, `${tg.x} m${tg.H ? `, ${tg.H} m up` : ''}`, (l + r) / 2, Y(tg.H) - 46, col.good, 'center', 600, 12, col);
  }
  const ang = tg ? p.aimAng : p.ang, v = tg ? p.aimV : p.v;
  c.save(); c.translate(X(0), Y(h0)); c.rotate(-rad(ang)); c.fillStyle = col.ink; c.fillRect(-4, -6, 30, 12); c.restore();
  c.fillStyle = col.ink; c.beginPath(); c.arc(X(0), Y(h0), 9, 0, 7); c.fill();
  if (tg && !p.live) { c.setLineDash([3, 4]); arrow(c, X(0), Y(h0), X(0) + Math.cos(rad(ang)) * (24 + v * 2.2), Y(h0) - Math.sin(rad(ang)) * (24 + v * 2.2), col.accent, '', col); c.setLineDash([]); }
  for (const t of trs) {
    const n = Math.max(1, Math.floor(t.pts.length * t.f));
    c.strokeStyle = t.old ? (t.hit ? col.good : col.muted) : col.accent; c.lineWidth = t.old ? 1.5 : 2.5; c.globalAlpha = t.old ? 0.65 : 1;
    if (t.old) c.setLineDash([5, 4]);
    c.beginPath(); t.pts.slice(0, n).forEach((q, i) => i ? c.lineTo(X(q[0]), Y(q[1])) : c.moveTo(X(q[0]), Y(q[1]))); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    if (t.f > 0) { const q = t.pts[n - 1]; c.fillStyle = t.old ? (t.hit ? col.good : col.muted) : col.blue; c.beginPath(); c.arc(X(q[0]), Y(q[1]), t.old ? 4 : 7, 0, 7); c.fill(); }
  }
  if (tg) readout(c, [`θ = ${fmt(ang, 1)}°`, `v = ${fmt(v, 1)} m/s`], col);
  else readout(c, rev ? [`range = ${fmt(p._land, 1)} m`, `peak = ${fmt(p._apex, 1)} m`, `θ = ${fmt(ang, 1)}°`] : [`θ = ${fmt(ang, 1)}°`, `v = ${v} m/s`], col);
};
DRAW.carts = (c, W, H, p, k, rev, col) => {
  const gy = H * 0.68;
  ground(c, W, gy, col);
  const w1 = 34 + Math.sqrt(p.m1) * 9, w2 = p.wall ? 18 : 34 + Math.sqrt(p.m2) * 9;
  const x1s = W * 0.1, x2s = p.wall ? W - 40 : W * 0.56;
  const v2 = p.wall ? 0 : p.v2;
  const rel = p.v1 - v2, gap = x2s - (x1s + w1), tc = 1.0, s = gap / (rel * tc);
  let v1f, v2f;
  if (p.wall) { v1f = -p.e * p.v1; v2f = 0; }
  else if (p.e === 0) { v1f = v2f = (p.m1 * p.v1 + p.m2 * v2) / (p.m1 + p.m2); }
  else { v1f = ((p.m1 - p.m2) * p.v1 + 2 * p.m2 * v2) / (p.m1 + p.m2); v2f = ((p.m2 - p.m1) * v2 + 2 * p.m1 * p.v1) / (p.m1 + p.m2); }
  const t = rev ? k * 2.6 : 0;
  let x1, x2, a1 = p.v1, a2 = v2;
  if (t <= tc) { x1 = x1s + p.v1 * s * t; x2 = x2s + v2 * s * t; }
  else { const c1 = x1s + p.v1 * s * tc, c2 = x2s + v2 * s * tc; x1 = c1 + v1f * s * (t - tc); x2 = c2 + v2f * s * (t - tc); a1 = v1f; a2 = v2f; }
  const cart = (x, w, color, label) => { c.fillStyle = color; c.fillRect(x, gy - 40, w, 28); c.fillStyle = col.ink; c.beginPath(); c.arc(x + 9, gy - 7, 6, 0, 7); c.arc(x + w - 9, gy - 7, 6, 0, 7); c.fill(); text(c, label, x + w / 2, gy - 26, col.card, 'center', 600, 11, col); };
  cart(x1, w1, col.blue, p.wall ? `${fmt(p.m1 / 10, 2)} kg` : `${p.m1} kg`);
  if (p.wall) { c.fillStyle = col.ink; c.fillRect(x2s, gy - 110, w2, 110); }
  else cart(x2, w2, col.accent, `${p.m2} kg`);
  const lab = v => `${fmt(v, 2)} m/s`;
  if (Math.abs(a1) > 0.01) arrow(c, x1 + w1 / 2, gy - 58, x1 + w1 / 2 + Math.sign(a1) * (18 + Math.abs(a1) * 4), gy - 58, col.blue, lab(a1), col);
  if (!p.wall && Math.abs(a2) > 0.01) arrow(c, x2 + w2 / 2, gy - 82, x2 + w2 / 2 + Math.sign(a2) * (18 + Math.abs(a2) * 4), gy - 82, col.accent, lab(a2), col);
  readout(c, [p.wall ? (rev ? `rebound ${lab(-v1f)}` : 'bounce off wall') : (p.e === 0 ? 'couple together' : 'elastic'), p.wall ? '' : `Σp = ${fmt(p.m1 * p.v1 + p.m2 * v2, 1)} kg·m/s`], col);
};

/* new topics */
DRAW.circle = (c, W, H, p, k, rev, col) => {
  const cx = W * 0.5, cy = H * 0.52, Rr = Math.min(W, H) * 0.33;
  c.strokeStyle = col.muted; c.lineWidth = 1.5; c.setLineDash([5, 5]); c.beginPath(); c.arc(cx, cy, Rr, 0, 7); c.stroke(); c.setLineDash([]);
  c.fillStyle = col.ink; c.beginPath(); c.arc(cx, cy, 4, 0, 7); c.fill();
  const phi = (p.vertical ? Math.PI / 2 : -0.5) - (rev ? k * Math.PI * 3 : 0);
  const x = cx + Rr * Math.cos(phi), y = cy - Rr * Math.sin(phi);
  c.strokeStyle = col.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke();
  text(c, `r = ${fmt(p.r)} m`, (cx + x) / 2 + 8, (cy + y) / 2 - 10, col.ink, 'left', 600, 12, col);
  const tx = -Math.sin(phi), ty = -Math.cos(phi);
  arrow(c, x, y, x + tx * 60, y + ty * 60, col.blue, 'v', col);
  arrow(c, x, y, x + (cx - x) * 0.4, y + (cy - y) * 0.4, col.accent, 'a', col);
  if (p.vertical) arrow(c, x + 14, y, x + 14, y + 40, col.ink, 'mg', col);
  c.fillStyle = col.blue; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill();
  readout(c, [`v = ${fmt(p.v)} m/s`, rev ? `a = v²/r = ${fmt(p.v * p.v / p.r)} m/s²` : 'a = ?'], col);
};
DRAW.orbit = (c, W, H, p, k, rev, col) => {
  const cx = W * 0.55, cy = H * 0.52, Rp = Math.min(W, H) * 0.17, Ro = Math.min(Rp * (1 + (p.alt || 0)), Math.min(W, H) * 0.44);
  c.fillStyle = col.blue; c.globalAlpha = 0.85; c.beginPath(); c.arc(cx, cy, Rp, 0, 7); c.fill(); c.globalAlpha = 1;
  c.strokeStyle = col.card; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, Rp, Rp * 0.35, 0, 0, 7); c.stroke();
  if (Ro > Rp + 4) {
    c.strokeStyle = col.muted; c.setLineDash([4, 5]); c.beginPath(); c.arc(cx, cy, Ro, 0, 7); c.stroke(); c.setLineDash([]);
    const phi = 2.4 - (rev ? k * Math.PI * 2 : 0), x = cx + Ro * Math.cos(phi), y = cy - Ro * Math.sin(phi);
    arrow(c, x, y, x + (cx - x) * 0.3, y + (cy - y) * 0.3, col.accent, 'F', col);
    arrow(c, x, y, x - Math.sin(phi) * 45, y - Math.cos(phi) * 45, col.good, 'v', col);
    c.fillStyle = col.ink; c.fillRect(x - 7, y - 4, 14, 8); c.fillStyle = col.warn; c.fillRect(x - 16, y - 2, 8, 4); c.fillRect(x + 8, y - 2, 8, 4);
  } else {
    const x = cx, y = cy - Rp;
    c.fillStyle = col.accent; c.fillRect(x - 5, y - 18, 10, 18);
    arrow(c, x + 18, y - 12, x + 18, y + 22, col.ink, 'mg', col);
  }
  readout(c, p.lines, col);
};
DRAW.pendulum = (c, W, H, p, k, rev, col) => {
  const px = W * 0.5, py = 24, Lp = H * 0.68, th0 = 0.42;
  c.strokeStyle = col.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(px - 70, py); c.lineTo(px + 70, py); c.stroke();
  c.strokeStyle = col.muted; c.lineWidth = 1; c.setLineDash([4, 5]); c.beginPath(); c.arc(px, py, Lp, Math.PI / 2 - th0, Math.PI / 2 + th0); c.stroke();
  c.beginPath(); c.moveTo(px, py); c.lineTo(px, py + Lp + 10); c.stroke(); c.setLineDash([]);
  const th = th0 * Math.cos(rev ? k * Math.PI * 2 * 2.5 : 0);
  const bx = px + Lp * Math.sin(th), by = py + Lp * Math.cos(th);
  c.strokeStyle = col.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(px, py); c.lineTo(bx, by); c.stroke();
  c.fillStyle = col.blue; c.beginPath(); c.arc(bx, by, 16, 0, 7); c.fill();
  text(c, 'L', (px + bx) / 2 + 10, (py + by) / 2, col.ink, 'left', 600, 13, col);
  const sp = Math.abs(Math.sin(rev ? k * Math.PI * 2 * 2.5 : 0));
  if (rev) arrow(c, bx, by + 24, bx + (Math.sin(k * Math.PI * 5) < 0 ? 1 : -1) * (10 + sp * 50), by + 24, col.good, '', col);
  readout(c, p.lines, col);
};
DRAW.osc = (c, W, H, p, k, rev, col) => {
  const gy = H * 0.68, wx = 34, eq = W * 0.5, A = W * 0.18;
  ground(c, W, gy, col);
  c.fillStyle = col.ink; c.fillRect(wx - 10, gy - 90, 10, 90);
  c.strokeStyle = col.muted; c.lineWidth = 1; c.setLineDash([4, 4]);
  [eq - A, eq, eq + A].forEach(x => { c.beginPath(); c.moveTo(x + 22, gy - 70); c.lineTo(x + 22, gy + 10); c.stroke(); });
  c.setLineDash([]);
  text(c, '−A', eq - A + 22, gy + 22, col.muted, 'center', 500, 11, col); text(c, '0', eq + 22, gy + 22, col.muted, 'center', 500, 11, col); text(c, '+A', eq + A + 22, gy + 22, col.muted, 'center', 500, 11, col);
  const x = eq + A * Math.cos(rev ? k * Math.PI * 2 * 2.5 : 0);
  c.strokeStyle = col.warn; c.lineWidth = 2.5; c.beginPath(); c.moveTo(wx, gy - 24);
  const n = 14; for (let i = 1; i <= n; i++) c.lineTo(wx + ((x - wx) * i) / n, gy - 24 + (i % 2 ? -12 : 12) * (i < n ? 1 : 0));
  c.stroke();
  c.fillStyle = col.blue; c.fillRect(x, gy - 46, 44, 44);
  if (rev) { const v = -Math.sin(k * Math.PI * 5); if (Math.abs(v) > 0.05) arrow(c, x + 22, gy - 62, x + 22 + v * 50, gy - 62, col.good, 'v', col); }
  readout(c, p.lines, col);
};
DRAW.wave = (c, W, H, p, k, rev, col) => {
  const y0 = H * 0.55, A = H * 0.2, x0 = 30, x1 = W - 30;
  c.strokeStyle = col.muted; c.lineWidth = 1; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.stroke(); c.setLineDash([]);
  const ph = rev ? k * Math.PI * 2 * 3 : 0.6;
  c.strokeStyle = col.blue; c.lineWidth = 3; c.beginPath();
  if (p.standing) {
    const n = p.standing;
    for (let x = x0; x <= x1; x += 2) { const s = (x - x0) / (x1 - x0); const y = y0 - A * Math.sin(n * Math.PI * s) * Math.cos(ph); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    c.globalAlpha = 0.25; c.beginPath(); for (let x = x0; x <= x1; x += 2) { const s = (x - x0) / (x1 - x0); const y = y0 + A * Math.sin(n * Math.PI * s); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.globalAlpha = 1;
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; c.fillStyle = col.accent; c.beginPath(); c.arc(x, y0, 5, 0, 7); c.fill(); }
    c.fillStyle = col.ink; c.fillRect(x0 - 8, y0 - A - 10, 8, 2 * A + 20); c.fillRect(x1, y0 - A - 10, 8, 2 * A + 20);
    text(c, `n = ${n}: ${n + 1} nodes`, W / 2, H - 16, col.muted, 'center', 500, 12, col);
  } else {
    const lp = (x1 - x0) / 2.5;
    for (let x = x0; x <= x1; x += 2) { const y = y0 - A * Math.sin(2 * Math.PI * (x - x0) / lp - ph); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
    c.stroke();
    let cr = x0 + (Math.PI / 2 + ph) / (2 * Math.PI) * lp; while (cr > x0 + lp) cr -= lp; while (cr < x0) cr += lp;
    const yb = y0 - A - 16;
    arrow(c, cr, yb, cr + lp, yb, col.accent, '', col); arrow(c, cr + lp, yb, cr, yb, col.accent, '', col);
    text(c, 'λ', cr + lp / 2, yb - 10, col.accent, 'center', 600, 13, col);
    arrow(c, x1 - 14, y0, x1 - 14, y0 - A, col.warn, '', col); text(c, 'A', x1 - 20, y0 - A / 2, col.warn, 'right', 600, 13, col);
    arrow(c, W / 2 - 30, H - 16, W / 2 + 30, H - 16, col.good, 'v', col);
  }
  readout(c, p.lines, col);
};
DRAW.tank = (c, W, H, p, k, rev, col) => {
  const tx = W * 0.22, tw = W * 0.56, ty = H * 0.12, th = H * 0.78, sy = ty + th * 0.14;
  c.fillStyle = col.water; c.fillRect(tx, sy, tw, ty + th - sy);
  c.strokeStyle = col.ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx, ty + th); c.lineTo(tx + tw, ty + th); c.lineTo(tx + tw, ty); c.stroke();
  c.strokeStyle = col.blue; c.lineWidth = 1.5; c.beginPath(); for (let x = tx; x <= tx + tw; x += 4) { const y = sy + 2 * Math.sin(x / 9 + k * 20); x === tx ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
  const bob = Math.sin(k * Math.PI * 6) * 3;
  if (p.obj === 'float') {
    const bh = 60, bw = 80, sub = clamp(p.frac || 0.6, 0.05, 0.98), bx = tx + tw / 2 - bw / 2, by = sy - bh * (1 - sub) + bob;
    c.fillStyle = col.warn; c.fillRect(bx, by, bw, bh); c.strokeStyle = col.ink; c.lineWidth = 1; c.strokeRect(bx, by, bw, bh);
    arrow(c, bx + bw / 2 - 12, by + bh, bx + bw / 2 - 12, by + bh + 40, col.ink, 'mg', col);
    arrow(c, bx + bw / 2 + 12, by + bh, bx + bw / 2 + 12, by + bh - 70, col.good, 'F_b', col);
  } else if (p.obj === 'sink') {
    const bw = 54, bx = tx + tw / 2 - bw / 2, by = sy + (ty + th - sy) * 0.45 + bob;
    c.strokeStyle = col.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx + bw / 2, 0); c.lineTo(bx + bw / 2, by); c.stroke();
    c.fillStyle = col.muted; c.fillRect(bx, by, bw, bw);
    arrow(c, bx - 12, by + bw / 2, bx - 12, by + bw / 2 + 50, col.ink, 'mg', col);
    arrow(c, bx + bw + 12, by + bw / 2, bx + bw + 12, by + bw / 2 - 40, col.good, 'F_b', col);
  } else if (p.obj === 'diver') {
    const dy = sy + (ty + th - sy) * 0.62 + bob, dx = tx + tw * 0.6;
    c.fillStyle = col.accent; c.beginPath(); c.ellipse(dx, dy, 26, 9, 0, 0, 7); c.fill();
    c.strokeStyle = col.muted; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(tx + 20, sy); c.lineTo(tx + 20, dy); c.stroke(); c.setLineDash([]);
    arrow(c, tx + 20, sy, tx + 20, dy, col.ink, '', col); text(c, 'h', tx + 30, (sy + dy) / 2, col.ink, 'left', 600, 13, col);
    if (rev) [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([ux, uy]) => arrow(c, dx + ux * 60, dy + uy * 34, dx + ux * 34, dy + uy * 14, col.blue, '', col));
  }
  readout(c, p.lines, col);
};
DRAW.hydraulic = (c, W, H, p, k, rev, col) => {
  const by = H * 0.85, lx = W * 0.2, lw = W * 0.1, rx = W * 0.55, rw = W * 0.32, top = H * 0.35;
  const d1 = rev ? k * H * 0.18 : 0, d2 = d1 * lw / rw;
  c.fillStyle = col.water;
  c.fillRect(lx, top + d1, lw, by - top - d1); c.fillRect(rx, top - d2, rw, by - top + d2); c.fillRect(lx, by - 30, rx + rw - lx, 30);
  c.strokeStyle = col.ink; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(lx, H * 0.15); c.lineTo(lx, by); c.lineTo(rx + rw, by); c.lineTo(rx + rw, H * 0.1); c.moveTo(lx + lw, H * 0.15); c.lineTo(lx + lw, by - 30); c.lineTo(rx, by - 30); c.lineTo(rx, H * 0.1); c.stroke();
  c.fillStyle = col.ink; c.fillRect(lx, top + d1 - 8, lw, 8); c.fillRect(rx, top - d2 - 8, rw, 8);
  arrow(c, lx + lw / 2, top + d1 - 60, lx + lw / 2, top + d1 - 10, col.accent, '', col);
  text(c, `F₁ = ${p.F1} N`, lx + lw / 2, top + d1 - 72, col.accent, 'center', 600, 12, col);
  c.fillStyle = col.blue; c.fillRect(rx + rw * 0.2, top - d2 - 48, rw * 0.6, 40);
  text(c, rev ? `F₂ = ${fmt(p.F1 * p.A2 / p.A1, 0)} N` : 'F₂ = ?', rx + rw / 2, top - d2 - 28, col.card, 'center', 600, 12, col);
  readout(c, [`A₁ = ${p.A1} m²`, `A₂ = ${p.A2} m²`], col);
};
DRAW.thermo = (c, W, H, p, k, rev, col) => {
  const T = rev ? p.T1 + (p.T2 - p.T1) * Math.min(1, k * 1.2) : p.T1;
  const bx = W * 0.25, bw = W * 0.32, by = H * 0.28, bh = H * 0.5;
  const hot = clamp((T + 20) / 140, 0, 1);
  c.fillStyle = col.water; c.fillRect(bx, by + bh * 0.2, bw, bh * 0.8);
  c.globalAlpha = hot * 0.6; c.fillStyle = col.accent; c.fillRect(bx, by + bh * 0.2, bw, bh * 0.8); c.globalAlpha = 1;
  if (p.ice && (!rev || k < 0.5)) { c.fillStyle = col.card; for (let i = 0; i < 3; i++) { c.fillRect(bx + 14 + i * (bw / 3.4), by + bh * 0.25 + (i % 2) * 14, 26, 22); c.strokeStyle = col.blue; c.strokeRect(bx + 14 + i * (bw / 3.4), by + bh * 0.25 + (i % 2) * 14, 26, 22); } }
  c.strokeStyle = col.ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by + bh); c.lineTo(bx + bw, by + bh); c.lineTo(bx + bw, by); c.stroke();
  c.fillStyle = col.ink; c.fillRect(bx - 10, by + bh + 6, bw + 20, 10);
  if (rev) for (let i = 0; i < 4; i++) { const x = bx + bw * (0.15 + i * 0.23); c.strokeStyle = col.accent; c.lineWidth = 2; c.beginPath(); for (let y = 0; y < 18; y += 2) c.lineTo(x + Math.sin((y + k * 60) / 3) * 3, by + bh + 34 - y); c.stroke(); }
  const tx = W * 0.72, tt = H * 0.12, tb = H * 0.8;
  c.strokeStyle = col.ink; c.lineWidth = 2; c.beginPath(); c.roundRect(tx - 8, tt, 16, tb - tt, 8); c.stroke();
  c.fillStyle = col.bad; c.beginPath(); c.arc(tx, tb + 6, 13, 0, 7); c.fill();
  const lvl = clamp((T + 50) / 300, 0.02, 1);
  c.fillRect(tx - 4, tb - (tb - tt - 8) * lvl, 8, (tb - tt - 8) * lvl + 4);
  for (let v = -50; v <= 250; v += 50) { const y = tb - (tb - tt - 8) * ((v + 50) / 300); c.strokeStyle = col.muted; c.lineWidth = 1; c.beginPath(); c.moveTo(tx + 10, y); c.lineTo(tx + 18, y); c.stroke(); text(c, `${v}`, tx + 22, y, col.muted, 'left', 400, 10, col); }
  text(c, `${fmt(T, 1)} °C`, tx - 16, tb - (tb - tt - 8) * lvl, col.ink, 'right', 600, 12, col);
  readout(c, p.lines, col);
};
DRAW.circuit = (c, W, H, p, k, rev, col) => {
  const L = W * 0.14, Rt = W * 0.86, T = H * 0.2, B = H * 0.8;
  c.strokeStyle = col.ink; c.lineWidth = 2.5;
  const res = (x, y, label, vertical) => {
    c.fillStyle = col.bg;
    if (vertical) { c.fillRect(x - 12, y - 28, 24, 56); c.strokeRect(x - 12, y - 28, 24, 56); text(c, label, x + 18, y, col.ink, 'left', 600, 12, col); }
    else { c.fillRect(x - 30, y - 11, 60, 22); c.strokeRect(x - 30, y - 11, 60, 22); text(c, label, x, y - 24, col.ink, 'center', 600, 12, col); }
  };
  const path = [];
  c.beginPath(); c.moveTo(L, T); c.lineTo(Rt, T); c.lineTo(Rt, B); c.lineTo(L, B); c.closePath(); c.stroke();
  path.push([L, B], [L, T], [Rt, T], [Rt, B], [L, B]);
  const lbl = r => `${fmt(r, 1)} Ω`;
  if (p.mode === 'series') { const n = p.Rs.length; p.Rs.forEach((r, i) => res(L + (Rt - L) * (i + 1) / (n + 1), T, lbl(r))); }
  else if (p.mode === 'parallel') {
    const m1 = L + (Rt - L) * 0.4, m2 = L + (Rt - L) * 0.7;
    c.beginPath(); c.moveTo(m1, T); c.lineTo(m1, B); c.moveTo(m2, T); c.lineTo(m2, B); c.stroke();
    c.fillStyle = col.bg; c.fillRect(Rt - 3, T + 4, 6, B - T - 8); c.fillRect(m2 + 3, T - 3, Rt - m2 - 6, 6); c.fillRect(m2 + 3, B - 3, Rt - m2 - 6, 6);
    res(m1, (T + B) / 2, lbl(p.Rs[0]), true); res(m2, (T + B) / 2, lbl(p.Rs[1]), true);
  } else {
    res(L + (Rt - L) * 0.3, T, lbl(p.Rs[0]));
    const m1 = L + (Rt - L) * 0.62;
    c.beginPath(); c.moveTo(m1, T); c.lineTo(m1, B); c.stroke();
    res(m1, (T + B) / 2, lbl(p.Rs[1]), true); res(Rt, (T + B) / 2, lbl(p.Rs[2]), true);
  }
  const by = (T + B) / 2;
  c.fillStyle = col.bg; c.fillRect(L - 14, by - 14, 28, 28);
  c.strokeStyle = col.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(L - 16, by - 6); c.lineTo(L + 16, by - 6); c.stroke();
  c.lineWidth = 6; c.beginPath(); c.moveTo(L - 8, by + 6); c.lineTo(L + 8, by + 6); c.stroke();
  text(c, `${p.V} V`, L - 22, by, col.ink, 'right', 600, 12, col);
  if (rev) {
    const per = 2 * ((Rt - L) + (B - T)), n = 14;
    for (let i = 0; i < n; i++) {
      let d = ((i / n) + k * 1.5) % 1 * per, x, y;
      if (d < B - T) { x = L; y = B - d; } else if ((d -= B - T) < Rt - L) { x = L + d; y = T; } else if ((d -= Rt - L) < B - T) { x = Rt; y = T + d; } else { d -= B - T; x = Rt - d; y = B; }
      c.fillStyle = col.accent; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill();
    }
  }
  readout(c, [], col);
};
DRAW.refract = (c, W, H, p, k, rev, col) => {
  const y0 = H * 0.5, cx = W * 0.5, len = Math.min(W, H) * 0.42;
  c.fillStyle = col.water; c.fillRect(0, p.n2 > p.n1 ? y0 : 0, W, y0);
  c.strokeStyle = col.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(0, y0); c.lineTo(W, y0); c.stroke();
  c.strokeStyle = col.muted; c.lineWidth = 1; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(cx, y0 - len); c.lineTo(cx, y0 + len); c.stroke(); c.setLineDash([]);
  text(c, `n₁ = ${fmt(p.n1)}`, W - 14, y0 - 16, col.ink, 'right', 600, 12, col);
  text(c, `n₂ = ${fmt(p.n2)}`, W - 14, y0 + 18, col.ink, 'right', 600, 12, col);
  const t1 = rad(p.th1), sx = cx - len * Math.sin(t1), sy = y0 - len * Math.cos(t1);
  const f1 = rev ? Math.min(1, k * 2) : 1;
  c.strokeStyle = col.accent; c.lineWidth = 3; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + (cx - sx) * f1, sy + (y0 - sy) * f1); c.stroke();
  text(c, `${fmt(p.th1, 1)}°`, cx - 34, y0 - 40, col.accent, 'center', 600, 12, col);
  const s2 = p.n1 * Math.sin(t1) / p.n2;
  if (rev && k > 0.5) {
    const f2 = Math.min(1, (k - 0.5) * 2);
    if (s2 <= 1) { const t2 = Math.asin(s2), ex = cx + len * Math.sin(t2) * f2, ey = y0 + len * Math.cos(t2) * f2; c.strokeStyle = col.blue; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, y0); c.lineTo(ex, ey); c.stroke(); text(c, `${fmt(deg(t2), 1)}°`, cx + 36, y0 + 40, col.blue, 'center', 600, 12, col); }
    c.globalAlpha = s2 >= 0.999 ? 1 : 0.3; c.strokeStyle = col.accent; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, y0); c.lineTo(cx + len * Math.sin(t1) * f2, y0 - len * Math.cos(t1) * f2); c.stroke(); c.globalAlpha = 1;
  }
  if (!rev) text(c, 'θ₂ = ?', cx + 36, y0 + 40, col.blue, 'center', 600, 12, col);
  readout(c, s2 > 1 && rev ? ['total internal reflection'] : [], col);
};
DRAW.lens = (c, W, H, p, k, rev, col) => {
  const y0 = H * 0.55, cx = W * 0.5, di = 1 / (1 / p.f - 1 / p.d0);
  const span = Math.max(p.d0, Math.abs(di), p.f * 1.3) * 1.15, sc = (W * 0.46) / span;
  const X = d => cx + d * sc;
  c.strokeStyle = col.muted; c.lineWidth = 1; c.beginPath(); c.moveTo(0, y0); c.lineTo(W, y0); c.stroke();
  c.strokeStyle = col.blue; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, y0, 8, H * 0.38, 0, 0, 7); c.stroke();
  [-1, 1].forEach(s => { c.fillStyle = col.ink; c.beginPath(); c.arc(X(s * p.f), y0, 4, 0, 7); c.fill(); text(c, 'F', X(s * p.f), y0 + 16, col.ink, 'center', 600, 12, col); });
  const h0 = H * 0.2, ox = X(-p.d0);
  arrow(c, ox, y0, ox, y0 - h0, col.accent, '', col); text(c, `${p.d0} cm`, ox, y0 + 30, col.accent, 'center', 600, 12, col);
  if (rev) {
    const m = -di / p.d0, ix = X(di), iy = y0 - h0 * m, f = Math.min(1, k * 1.4);
    c.lineWidth = 1.6; c.strokeStyle = col.warn;
    const ray = (pts) => { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); };
    const ext = (a, b, xe) => [xe, a[1] + (b[1] - a[1]) * (xe - a[0]) / (b[0] - a[0])];
    const top = [ox, y0 - h0], lt = [cx, y0 - h0];
    c.globalAlpha = f;
    ray([top, lt, ext(lt, [X(p.f), y0], W + 20)]);
    ray([top, ext(top, [cx, y0], W + 20)]);
    if (di < 0) { c.setLineDash([4, 4]); ray([[cx, y0 - h0], [ix, iy]]); ray([[ox, y0 - h0], [ix, iy]]); c.setLineDash([]); }
    c.globalAlpha = 1;
    if (k > 0.6) { if (di < 0) c.setLineDash([5, 4]); arrow(c, ix, y0, ix, iy, col.good, '', col); c.setLineDash([]); text(c, `${fmt(di, 1)} cm`, ix, y0 + (m > 0 ? 30 : -14), col.good, 'center', 600, 12, col); }
  }
  readout(c, [`f = ${p.f} cm`, rev ? (di > 0 ? 'real, upside down' : 'virtual, upright') : 'image = ?'], col);
};
