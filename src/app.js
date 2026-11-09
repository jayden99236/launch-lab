/* ---------- persistence ---------- */
const UNLOCK = 4, MASTER = 7, RUN_LEN = 6, REVIEW_MAX = 40;
const KEY = 'launchlab.v1';
const freshTopic = () => ({ r: 1.5, n: 0, c: 0, hist: [1.5] });
function fresh() { return { grade: null, xp: 0, streak: 0, best: 0, runs: 0, n: 0, c: 0, fixed: 0, badges: {}, read: {}, review: [], topics: Object.fromEntries(TOPICS.map(t => [t.id, freshTopic()])) }; }
function load() {
  try {
    const j = JSON.parse(localStorage.getItem(KEY));
    if (j && j.topics) {
      const f = fresh(); Object.assign(f, j);
      for (const t of TOPICS) if (!f.topics[t.id]) f.topics[t.id] = freshTopic();
      f.read = f.read || {}; f.review = Array.isArray(f.review) ? f.review : []; f.fixed = f.fixed || 0;
      // Saves from before grade placement existed: keep their progress and skip the picker if they've played.
      if (f.grade == null && (f.n > 0 || Object.keys(f.read).length)) f.grade = 'existing';
      return f;
    }
  } catch (e) {}
  return fresh();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
let S = load();
const topic = id => TOPICS.find(t => t.id === id);
const isUnlocked = id => topic(id).req.every(r => S.topics[r].r >= UNLOCK);

/* ---------- levels & badges ---------- */
const RANKS = ['Lab Assistant', 'Technician', 'Experimenter', 'Analyst', 'Researcher', 'Physicist', 'Senior Physicist', 'Principal Investigator'];
const cum = L => 40 * (L - 1) * L;
function levelInfo(xp) { let L = 1; while (xp >= cum(L + 1)) L++; const lo = cum(L), hi = cum(L + 1); return { L, lo, hi, pct: (xp - lo) / (hi - lo) * 100, rank: RANKS[Math.min(RANKS.length - 1, Math.floor((L - 1) / 2))] }; }
const BADGES = [
  { id: 'first', m: '1', name: 'First Run', desc: 'Finish your first run.' },
  { id: 'reader', m: '¶', name: 'Bookworm', desc: 'Read your first lesson.' },
  { id: 'bullseye', m: '◎', name: 'Bullseye', desc: 'Hit a launch target on the first shot.' },
  { id: 'streak5', m: '5', name: 'Hot Streak', desc: 'Get 5 right in a row.' },
  { id: 'streak12', m: '12', name: 'Unbroken', desc: 'Get 12 right in a row.' },
  { id: 'clean', m: '✓', name: 'Clean Sheet', desc: 'A full run, all right, no hints.' },
  { id: 'fixer', m: '↺', name: 'Second Look', desc: 'Fix 10 problems from your review queue.' },
  { id: 'master', m: '7', name: 'Specialist', desc: 'Reach skill 7 at any station.' },
  { id: 'unit', m: 'U', name: 'Unit Complete', desc: 'Master every station in one unit.' },
  { id: 'allopen', m: '13', name: 'Full Lab', desc: 'Unlock all 13 stations.' },
  { id: 'scholar', m: 'Σ', name: 'Scholar', desc: 'Read every lesson.' },
  { id: 'grand', m: '★', name: 'Polymath', desc: 'Reach skill 7 at every station.' },
];
function award(id) {
  if (S.badges[id]) return;
  S.badges[id] = Date.now();
  const b = BADGES.find(x => x.id === id);
  toast(`Badge earned: ${b.name}`, b.desc);
  if (RUN) RUN.badges.push(b.name);
}
function checkBadges() {
  if (S.best >= 5) award('streak5');
  if (S.best >= 12) award('streak12');
  if (S.fixed >= 10) award('fixer');
  const m = id => S.topics[id].r >= MASTER;
  if (TOPICS.some(t => m(t.id))) award('master');
  if (UNITS.some(u => TOPICS.filter(t => t.unit === u.id).every(t => m(t.id)))) award('unit');
  if (TOPICS.every(t => m(t.id))) award('grand');
  if (TOPICS.every(t => isUnlocked(t.id))) award('allopen');
  if (Object.keys(S.read).length) award('reader');
  if (TOPICS.every(t => S.read[t.id])) award('scholar');
}
function toast(title, body) {
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = '<b></b><span></span>'; t.querySelector('b').textContent = title; t.querySelector('span').textContent = body || '';
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200);
}

/* ---------- adaptive engine ---------- */
// Expected success at difficulty d for skill r. Tuned so d == r gives ~70%.
const expected = (d, r) => 1 / (1 + Math.exp((d - r) * 0.9 - 0.85));
function rate(tid, d, score) {
  const T = S.topics[tid], before = T.r, K = T.n < 8 ? 1.15 : 0.75;
  T.r = clamp(T.r + K * (score - expected(d, T.r)), 1, 10);
  T.n++; if (score >= 0.6) T.c++;
  T.hist.push(+T.r.toFixed(2)); if (T.hist.length > 30) T.hist.shift();
  return T.r - before;
}
function chooseDifficulty(tid) {
  const r = S.topics[tid].r;
  let d = r + (R() * 1.3 - 0.45), why = 'Pitched near your current skill.';
  const last = RUN.res.filter(x => x.tid === tid), l2 = last.slice(-2), l3 = last.slice(-3);
  if (l2.length === 2 && l2.every(x => x.score < 0.6)) { d -= 0.9; why = 'Easing off after two misses.'; }
  else if (l3.length === 3 && l3.every(x => x.score >= 1)) { d += 0.7; why = 'Stretch problem after three in a row.'; }
  return { d: clamp(d, 1, 10), why };
}
function pickMixTopic() {
  const open = TOPICS.filter(t => isUnlocked(t.id));
  const w = open.map(t => Math.pow(10.5 - S.topics[t.id].r, 1.6));
  let x = R() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < open.length; i++) { x -= w[i]; if (x <= 0) return open[i].id; }
  return open[open.length - 1].id;
}

/* ---------- views ---------- */
const VIEWS = ['welcome', 'home', 'learn', 'sheet', 'run', 'summary'];

/* ---------- first launch: grade placement ---------- */
let PICK = null;
const gradeVals = g => Object.fromEntries(GRADE_ORDER.map((id, i) => [id, GRADES.find(x => x.g === g).r[i]]));
function renderWelcome() {
  renderHeader();
  $('#grades').innerHTML = GRADES.map(x => `<button class="grade" role="radio" aria-checked="${PICK === x.g}" data-grade="${x.g}"><b><small>Grade</small>${x.g}</b><span>${x.desc}</span></button>`).join('');
  $('#grades').querySelectorAll('[data-grade]').forEach(b => b.onclick = () => { PICK = +b.dataset.grade; renderWelcome(); });
  const pl = $('#placement'), btn = $('#btn-place');
  if (!PICK) { pl.hidden = true; btn.disabled = true; btn.textContent = 'Choose a grade'; return; }
  const v = gradeVals(PICK), open = TOPICS.filter(t => t.req.every(r => v[r] >= UNLOCK));
  pl.hidden = false;
  $('#pl-title').textContent = `Grade ${PICK} starting point`;
  $('#pl-open').textContent = `${open.length} of ${TOPICS.length} stations open`;
  $('#pl-rows').innerHTML = TOPICS.map(t => { const on = open.includes(t); return `<div class="pl-row${on ? '' : ' off'}"><span>${t.name}${on ? '' : ' · locked'}</span>${gauge(v[t.id])}<span class="mono">${v[t.id].toFixed(1)}</span></div>`; }).join('');
  btn.disabled = false; btn.textContent = `Start at Grade ${PICK} level`;
}
function applyGrade(g) {
  if (g === 'scratch') { S.grade = 'scratch'; }
  else { const v = gradeVals(g); for (const id of GRADE_ORDER) S.topics[id] = { r: v[id], n: 0, c: 0, hist: [v[id]] }; S.grade = g; }
  save(); show('home'); renderHome();
  const open = TOPICS.filter(t => isUnlocked(t.id)).length;
  toast(g === 'scratch' ? 'Starting from the beginning' : `Placed at Grade ${g} level`, `${open} station${open > 1 ? 's' : ''} open. Start with a lesson, then practise.`);
}
function showWelcome() { PICK = null; show('welcome'); renderWelcome(); }
function show(id) { for (const s of VIEWS) $('#' + s).hidden = s !== id; window.scrollTo(0, 0); }
function renderHeader() {
  const L = levelInfo(S.xp);
  $('#m-level').textContent = L.L; $('#m-rank').textContent = L.rank;
  $('#m-xpfill').style.width = L.pct.toFixed(1) + '%';
  $('#m-xptext').textContent = `${S.xp - L.lo} / ${L.hi - L.lo} XP`;
  $('#m-streak').textContent = S.streak;
  $('#m-badges').textContent = `${Object.keys(S.badges).length}/${BADGES.length}`;
}
function spark(hist, mastered) {
  const w = 160, h = 30, n = hist.length;
  const pts = hist.map((r, i) => [n === 1 ? w - 2 : (i / (n - 1)) * (w - 4) + 2, h - 3 - ((r - 1) / 9) * (h - 6)]);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1], y4 = h - 3 - (3 / 9) * (h - 6), y7 = h - 3 - (6 / 9) * (h - 6);
  const stroke = mastered ? 'var(--good)' : 'var(--blue)';
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><line x1="0" x2="${w}" y1="${y4}" y2="${y4}" stroke="var(--line)" stroke-dasharray="3 3"/><line x1="0" x2="${w}" y1="${y7}" y2="${y7}" stroke="var(--line)" stroke-dasharray="3 3"/><path d="${d} L${last[0]} ${h} L${pts[0][0]} ${h}Z" fill="${stroke}" opacity=".12"/><path d="${d}" fill="none" stroke="${stroke}" stroke-width="1.8" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.8" fill="${stroke}"/></svg>`;
}
const gauge = (r, extra = '') => `<div class="gauge${r >= MASTER ? ' m' : ''}" ${extra}><i style="width:${(r - 1) / 9 * 100}%"></i><span class="tick" style="left:${(UNLOCK - 1) / 9 * 100}%"></span><span class="tick" style="left:${(MASTER - 1) / 9 * 100}%"></span></div>`;
function stationCard(tp, code) {
  const T = S.topics[tp.id], open = isUnlocked(tp.id), mastered = T.r >= MASTER;
  let chip;
  if (!open) chip = '<span class="chip">Locked</span>';
  else if (mastered) chip = '<span class="chip good">Mastered</span>';
  else if (!S.read[tp.id]) chip = '<span class="chip acc">New lesson</span>';
  else if (T.n === 0) chip = '<span class="chip acc">Ready</span>';
  else chip = '<span class="chip blue">Learning</span>';
  const acc = T.n ? `${Math.round(T.c / T.n * 100)}% of ${T.n} right` : 'Not practised yet';
  const needs = tp.req.filter(r => S.topics[r].r < UNLOCK).map(tname).join(' and ');
  return `<article class="station${open ? '' : ' locked'}">
    <div class="gline"><span class="num">${code}</span>${chip}</div>
    <div><h3>${tp.name}</h3><div class="formula">${tp.sym}</div></div>
    <p class="blurb">${open ? tp.blurb : `Reach skill ${UNLOCK} in ${needs} to unlock.`}</p>
    <div><div class="gline"><span class="label">Skill</span><span class="mono">${T.r.toFixed(1)}<span class="note"> / 10</span></span></div>${gauge(T.r, 'style="margin-top:6px"')}</div>
    ${spark(T.hist, mastered)}
    <span class="note mono">${acc}${S.read[tp.id] ? ' · lesson read' : ''}</span>
    <div class="btns"><button class="btn small" data-learn="${tp.id}">Lesson</button><button class="btn small${open && !mastered ? ' primary' : ''}" ${open ? '' : 'disabled'} data-start="${tp.id}">${open ? 'Practise' : 'Locked'}</button></div>
  </article>`;
}
function renderHome() {
  renderHeader();
  $('#hero-label').textContent = `Physics course · ${UNITS.length} units · ${TOPICS.length} stations`;
  $('#units').innerHTML = UNITS.map((u, ui) => {
    const ts = TOPICS.filter(t => t.unit === u.id), done = ts.filter(t => S.topics[t.id].r >= MASTER).length;
    return `<div class="unit-h"><span class="label">Unit ${ui + 1}</span><h3>${u.name}</h3><span class="note">${u.desc}</span><span class="chip${done === ts.length ? ' good' : ''}">${done}/${ts.length} mastered</span></div>
      <div class="stations">${ts.map((t, i) => stationCard(t, `${ui + 1}.${i + 1}`)).join('')}</div>`;
  }).join('');
  $('#units').querySelectorAll('[data-start]').forEach(b => b.onclick = () => startRun(b.dataset.start));
  $('#units').querySelectorAll('[data-learn]').forEach(b => b.onclick = () => openLesson(b.dataset.learn));
  // next step
  const open = TOPICS.filter(t => isUnlocked(t.id));
  const unread = open.find(t => !S.read[t.id]);
  const learning = open.filter(t => S.topics[t.id].r < MASTER).sort((a, b) => S.topics[a.id].r - S.topics[b.id].r)[0];
  const nt = unread || learning || open.slice().sort((a, b) => S.topics[a.id].r - S.topics[b.id].r)[0];
  const NT = S.topics[nt.id];
  const nxt = TOPICS.filter(t => !isUnlocked(t.id) && t.req.includes(nt.id)).map(t => t.name);
  let sub;
  if (unread) sub = 'Start with the lesson: key ideas, equations, a worked example and common mistakes.';
  else if (NT.r < UNLOCK && nxt.length) sub = `Skill ${NT.r.toFixed(1)}. Reach ${UNLOCK} to open ${nxt.join(' and ')}.`;
  else if (NT.r < MASTER) sub = `Skill ${NT.r.toFixed(1)}. Reach ${MASTER} to master this station.`;
  else sub = 'Every open station is mastered. Keep your skills sharp.';
  $('#next-text').innerHTML = `<h3 style="font-size:22px">${nt.name}</h3><span class="note">${sub}</span>`;
  $('#btn-continue').textContent = unread ? `Read the ${nt.name} lesson` : `Practise ${nt.name}`;
  $('#btn-continue').onclick = () => unread ? openLesson(nt.id) : startRun(nt.id);
  const canMix = open.length >= 2;
  $('#btn-mix').disabled = !canMix;
  const rv = S.review.length;
  $('#btn-review').disabled = !rv;
  $('#btn-review').textContent = rv ? `Review mistakes (${rv})` : 'No mistakes to review';
  $('#mix-note').textContent = canMix ? 'Adaptive practice mixes your open stations and favours the weakest.' : 'Adaptive practice opens once you unlock a second station.';
  const bb = $('#badges'); bb.innerHTML = '';
  BADGES.forEach(b => { const got = !!S.badges[b.id]; const d = document.createElement('div'); d.className = 'badge' + (got ? ' got' : ''); d.innerHTML = `<div class="medal">${b.m}</div><div style="min-width:0"><b>${b.name}</b><span>${b.desc}</span></div>`; bb.appendChild(d); });
  $('#badge-count').textContent = `${Object.keys(S.badges).length} of ${BADGES.length}`;
  $('#st-n').textContent = S.n; $('#st-acc').textContent = S.n ? Math.round(S.c / S.n * 100) + '%' : '—'; $('#st-best').textContent = S.best;
  $('#placed-note').textContent = typeof S.grade === 'number' ? `You started at Grade ${S.grade} level. Your ratings keep adjusting to your answers.` : S.grade === 'scratch' ? 'You started from the beginning.' : '';
  resetUI(false);
}
function resetUI(confirming) {
  const row = $('#reset-row');
  if (!confirming) { row.innerHTML = '<button class="btn small ghost" id="btn-reset">Reset progress</button>'; $('#btn-reset').onclick = () => resetUI(true); return; }
  row.innerHTML = '<span class="note">Erase all skill, XP, badges and review items, and choose your grade again?</span><button class="btn small" id="rs-yes">Erase</button><button class="btn small ghost" id="rs-no">Keep</button>';
  $('#rs-yes').onclick = () => { S = fresh(); save(); showWelcome(); };
  $('#rs-no').onclick = () => resetUI(false);
}

/* ---------- lessons & formula sheet ---------- */
function lessonHTML(tid) {
  const L = LESSONS[tid], tp = topic(tid), u = UNITS.find(x => x.id === tp.unit);
  return `<article class="lesson">
    <div><span class="label">${u.name}</span><h2>${tp.name}</h2></div>
    <p class="intro">${L.intro}</p>
    ${L.sections.map(([h, b]) => `<section><h3>${h}</h3><p>${b}</p></section>`).join('')}
    <div class="eqs-wrap"><span class="label">Key equations</span><table class="eqs"><tbody>${L.eqs.map(([f, m]) => `<tr><td>${f}</td><td>${m}</td></tr>`).join('')}</tbody></table></div>
    <div class="example"><span class="label">Worked example</span><p style="margin:6px 0 0"><strong>${L.ex.q}</strong></p><ol>${L.ex.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>
    <section><h3>Common mistakes</h3><ul class="traps">${L.traps.map(t => `<li>${t}</li>`).join('')}</ul></section>
  </article>`;
}
let LEARN_ID = null;
function openLesson(tid) {
  LEARN_ID = tid;
  $('#lesson').innerHTML = lessonHTML(tid);
  const open = isUnlocked(tid);
  $('#learn-go').disabled = !open;
  $('#learn-go').textContent = open ? `Practise ${tname(tid)}` : 'Station locked';
  show('learn');
  if (!S.read[tid]) {
    S.read[tid] = Date.now(); S.xp += 25;
    toast('Lesson read: +25 XP', `${tname(tid)} notes are also on the formula sheet.`);
    checkBadges(); save(); renderHeader();
  }
}
function openSheet() {
  $('#sheet-grid').innerHTML = TOPICS.map(t => `<div class="eqs-wrap"><h3>${t.name}</h3><table class="eqs"><tbody>${LESSONS[t.id].eqs.map(([f, m]) => `<tr><td>${f}</td><td>${m}</td></tr>`).join('')}</tbody></table></div>`).join('');
  show('sheet');
}
function openNotes() {
  if (!RUN || !RUN.cur) return;
  $('#notes-title').textContent = `${tname(RUN.cur.tid)} notes`;
  $('#notes-body').innerHTML = lessonHTML(RUN.cur.tid);
  const d = $('#notes');
  try { d.showModal(); } catch (e) { d.setAttribute('open', ''); }
}

/* ---------- run flow ---------- */
let RUN = null;
function startRun(mode) {
  const queue = mode === 'review' ? S.review.slice(0, RUN_LEN).map(x => x.id) : null;
  RUN = { mode, queue, len: queue ? queue.length : RUN_LEN, res: [], xp: 0, bestStreak: S.streak, before: Object.fromEntries(TOPICS.map(t => [t.id, S.topics[t.id].r])), unlockedBefore: Object.fromEntries(TOPICS.map(t => [t.id, isUnlocked(t.id)])), badges: [], unlocks: [] };
  if (!RUN.len) return;
  show('run'); nextProblem();
}
function nextProblem() {
  if (RUN.res.length >= RUN.len) return endRun();
  let P;
  if (RUN.mode === 'review') {
    const id = RUN.queue[RUN.res.length], item = S.review.find(x => x.id === id);
    if (!item) { RUN.len = RUN.res.length; return endRun(); }
    P = Object.assign(JSON.parse(JSON.stringify(item.p)), { tid: item.tid, d: item.d, why: 'A problem you missed before. Get it right to clear it.', reviewId: id });
  } else {
    const tid = RUN.mode === 'mix' ? pickMixTopic() : RUN.mode;
    const { d, why } = chooseDifficulty(tid);
    P = GEN[tid](d);
    Object.assign(P, { tid, d, why });
  }
  Object.assign(P, { usedHint: false, done: false });
  RUN.cur = P;
  renderProblem();
}
function renderDots() {
  const box = $('#dots'); box.innerHTML = '';
  for (let i = 0; i < RUN.len; i++) { const r = RUN.res[i]; const el = document.createElement('i'); el.className = r ? (r.score >= 1 ? 'ok' : r.score >= 0.5 ? 'part' : 'no') : (i === RUN.res.length ? 'cur' : ''); box.appendChild(el); }
}
function renderProblem() {
  const P = RUN.cur;
  $('#run-mode').textContent = RUN.mode === 'mix' ? 'Adaptive practice' : RUN.mode === 'review' ? 'Review mistakes' : `${UNITS.find(u => u.id === topic(P.tid).unit).name}`;
  $('#run-topic').textContent = tname(P.tid);
  $('#run-skill').textContent = `Skill ${S.topics[P.tid].r.toFixed(1)}`;
  renderDots();
  $('#diff-chip').textContent = `Difficulty ${P.d.toFixed(1)} · ${TIER[tier(P.d)]}`;
  $('#diff-why').textContent = P.why;
  $('#prompt').innerHTML = P.prompt;
  $('#hint').hidden = true; $('#hint-text').textContent = P.hint;
  $('#pre-actions').hidden = false; $('#btn-hint').disabled = false;
  $('#hint-note').textContent = 'Using a hint caps this problem at 60% credit.';
  $('#fb').hidden = true; $('#btn-next').hidden = true; $('#btn-replay').hidden = true;
  const box = $('#answer-box'); box.innerHTML = '';
  if (P.type === 'num') {
    box.innerHTML = `<form class="ansrow" id="numform" autocomplete="off"><input id="ans" inputmode="text" placeholder="Your answer" aria-label="Your answer${P.unit ? ' in ' + P.unit : ''}">${P.unit ? `<span class="unit">${P.unit}</span>` : ''}<button class="btn primary" type="submit">Check</button></form><span class="note">Give 3 significant figures. Within 2% counts. Write powers of ten with e, e.g. 3e8.</span>`;
    $('#numform').onsubmit = e => { e.preventDefault(); checkNum(); };
    setTimeout(() => { const a = $('#ans'); if (a && innerWidth > 820) a.focus({ preventScroll: true }); }, 50);
    $('#scene-cap').textContent = 'Setup · the simulation runs after you answer';
  } else if (P.type === 'mc') {
    const ch = document.createElement('div'); ch.className = 'choices';
    P.choices.forEach((s, i) => { const b = document.createElement('button'); b.className = 'choice'; b.innerHTML = `<span class="k">${'ABCD'[i]}</span><span></span>`; b.lastChild.textContent = s; b.onclick = () => checkMC(i); ch.appendChild(b); });
    box.appendChild(ch);
    $('#scene-cap').textContent = 'Concept check';
  } else {
    renderLaunch(box, P);
    $('#scene-cap').textContent = 'Launch range · dashed lines are earlier shots';
  }
  sceneSet(P.scene);
}
function renderLaunch(box, P) {
  const L = P.L, sp = P.scene;
  box.innerHTML = `
    <div class="ctrl${L.mode === 'speed' ? ' fixed' : ''}"><label class="label" for="ang-r">Angle</label><input type="range" id="ang-r" min="5" max="85" step="0.5" value="${sp.aimAng}" ${L.mode === 'speed' ? 'disabled' : ''}><input type="number" id="ang-n" min="5" max="85" step="0.1" value="${sp.aimAng}" ${L.mode === 'speed' ? 'disabled' : ''} aria-label="Angle in degrees"></div>
    <div class="ctrl${L.mode === 'angle' ? ' fixed' : ''}" style="margin-top:10px"><label class="label" for="v-r">Speed</label><input type="range" id="v-r" min="5" max="40" step="0.1" value="${sp.aimV}" ${L.mode === 'angle' ? 'disabled' : ''}><input type="number" id="v-n" min="5" max="40" step="0.1" value="${sp.aimV}" ${L.mode === 'angle' ? 'disabled' : ''} aria-label="Speed in metres per second"></div>
    <div class="actions" style="margin-top:14px"><button class="btn primary" id="btn-fire">Fire</button><div class="shots" id="shots" aria-label="Shots used"></div><span class="inline-msg" id="shot-msg">3 shots. A first-shot hit earns full credit.</span></div>`;
  const sync = src => {
    if (src === 'ar') $('#ang-n').value = $('#ang-r').value; if (src === 'an') $('#ang-r').value = $('#ang-n').value;
    if (src === 'vr') $('#v-n').value = $('#v-r').value; if (src === 'vn') $('#v-r').value = $('#v-n').value;
    sp.aimAng = clamp(+$('#ang-n').value || 5, 5, 85); sp.aimV = clamp(+$('#v-n').value || 5, 5, 40);
    if (!sp.live) drawScene();
  };
  $('#ang-r').oninput = () => sync('ar'); $('#ang-n').oninput = () => sync('an');
  $('#v-r').oninput = () => sync('vr'); $('#v-n').oninput = () => sync('vn');
  $('#btn-fire').onclick = fire;
  renderShots();
}
function renderShots() {
  const P = RUN.cur, box = $('#shots'); if (!box) return; box.innerHTML = '';
  for (let i = 0; i < 3; i++) { const s = P.scene.shots[i]; const e = document.createElement('i'); e.className = s ? (s.hit ? 'hit' : 'used') : ''; box.appendChild(e); }
}
function fire() {
  const P = RUN.cur, sp = P.scene; if (P.done || sp.live) return;
  const tr = traj(sp.aimV, sp.aimAng, 0, sp.target);
  sp.live = tr; sp.liveK = 0;
  $('#btn-fire').disabled = true;
  animate(clamp(tr.T * 380, 900, 2200), k => sp.liveK = k, () => {
    sp.shots.push({ pts: tr.pts, hit: tr.hit }); sp.live = null; drawScene();
    renderShots();
    const n = sp.shots.length;
    if (tr.hit) { if (n === 1) award('bullseye'); finish([1, 0.75, 0.5][n - 1], `Hit on shot ${n} at θ = ${fmt(sp.aimAng, 1)}°, v = ${fmt(sp.aimV, 1)} m/s.`); }
    else {
      const off = tr.landX - sp.target.x;
      const msg = sp.target.H > 0 && Math.abs(off) <= sp.target.w / 2 + 0.5 ? 'Clipped the side of the platform. You need a bit more speed.' : `Landed at ${fmt(tr.landX, 1)} m, ${fmt(Math.abs(off), 1)} m ${off < 0 ? 'short' : 'long'}.`;
      if (n >= 3) finish(0, `Three misses. ${msg}`);
      else { $('#shot-msg').textContent = `${msg} ${3 - n} shot${3 - n > 1 ? 's' : ''} left.`; $('#btn-fire').disabled = false; }
    }
  });
}
function parseAnswer(s) {
  s = s.trim().replace(/,/g, '').replace(/\s/g, '').replace(/[−–]/g, '-').replace(/[x×*]10\^?/i, 'e').replace(/^\$/, '').replace(/%$/, '').replace(/°$/, '');
  return parseFloat(s);
}
function checkNum() {
  const P = RUN.cur; if (P.done) return;
  const x = parseAnswer($('#ans').value);
  if (!isFinite(x)) { $('#ans').value = ''; $('#ans').placeholder = 'Enter a number'; $('#ans').focus(); return; }
  const a = P.answer, tol = a === 0 ? 0.005 : Math.max(0.02 * Math.abs(a), Math.abs(a) >= 1e-3 && Math.abs(a) < 1e5 ? 0.005 : 0);
  const err = Math.abs(x - a), ok = err <= tol;
  let detail = `You answered <b class="mono">${fmt(x)} ${P.unit}</b>. Correct answer: <b class="mono">${fmt(a)} ${P.unit}</b>.`;
  if (!ok && Math.abs(x + a) <= tol) detail += ' Right size, wrong sign. Check which direction is positive.';
  else if (!ok && err <= 0.12 * Math.abs(a)) detail += ' Close. Check your rounding, or the value of g.';
  else if (!ok && a !== 0 && [10, 100, 1000, 1e3, 1e6].some(f => Math.abs(x * f - a) <= tol || Math.abs(x / f - a) <= tol)) detail += ' The digits are right but the power of ten is off. Check your unit conversions.';
  $('#ans').disabled = true; document.querySelector('#numform button').disabled = true;
  finish(ok ? 1 : 0, detail);
}
function checkMC(i) {
  const P = RUN.cur; if (P.done) return;
  document.querySelectorAll('.choice').forEach((b, j) => { b.disabled = true; if (j === P.correct) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
  finish(i === P.correct ? 1 : 0, i === P.correct ? '' : `The answer is <b>${P.choices[P.correct]}</b>.`);
}
function trackReview(P, score) {
  if (P.reviewId) {
    if (score >= 0.6) { S.review = S.review.filter(x => x.id !== P.reviewId); S.fixed++; return 'Cleared from your review queue.'; }
    return 'This one stays in your review queue.';
  }
  if (score < 0.6 && P.type !== 'launch') {
    const keep = { type: P.type, prompt: P.prompt, unit: P.unit, answer: P.answer, choices: P.choices, correct: P.correct, hint: P.hint, solution: P.solution, scene: P.scene };
    if (!S.review.some(x => x.p.prompt === P.prompt)) { S.review.push({ id: Date.now() + '-' + Math.floor(R() * 1e6), tid: P.tid, d: P.d, p: keep }); if (S.review.length > REVIEW_MAX) S.review.shift(); }
    return 'Added to your review queue.';
  }
  return '';
}
function finish(score, detail) {
  const P = RUN.cur; P.done = true;
  if (P.usedHint) score = Math.min(score, 0.6);
  const delta = rate(P.tid, P.d, score);
  S.n++; if (score >= 0.6) S.c++;
  if (score >= 0.6) { S.streak++; S.best = Math.max(S.best, S.streak); } else S.streak = 0;
  RUN.bestStreak = Math.max(RUN.bestStreak, S.streak);
  const xp = Math.round((8 + 4 * P.d) * score * (1 + Math.min(S.streak, 10) * 0.05));
  const lvBefore = levelInfo(S.xp).L;
  S.xp += xp; RUN.xp += xp;
  RUN.res.push({ score, tid: P.tid, hint: P.usedHint });
  const rnote = trackReview(P, score);
  const lv = levelInfo(S.xp);
  if (lv.L > lvBefore) toast(`Level ${lv.L} reached`, `Rank: ${lv.rank}`);
  TOPICS.forEach(t => { if (isUnlocked(t.id) && !RUN.unlockedBefore[t.id]) { RUN.unlockedBefore[t.id] = true; toast(`Station unlocked: ${t.name}`, 'Read its lesson first.'); RUN.unlocks.push(t.name); } });
  checkBadges();
  save();
  const cls = score >= 1 ? 'ok' : score >= 0.5 ? 'part' : 'no';
  const head = score >= 1 ? 'Correct' : score >= 0.5 ? (P.usedHint ? 'Correct, with a hint' : 'Got there') : 'Not quite';
  const fb = $('#fb'); fb.className = 'fb ' + cls; fb.hidden = false;
  fb.innerHTML = `<h3>${head}</h3>${detail ? `<div>${detail}</div>` : ''}<div><span class="label">${P.type === 'mc' ? 'Why' : 'Worked solution'}</span><div class="${P.type === 'mc' ? '' : 'sol'}">${P.solution}</div></div>
    <div class="fbmeta"><span class="chip ${delta >= 0 ? 'good' : 'warn'}">Skill ${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)} → ${S.topics[P.tid].r.toFixed(1)}</span><span class="chip acc">+${xp} XP</span>${S.streak >= 2 ? `<span class="chip blue">Streak ${S.streak}</span>` : ''}${rnote ? `<span class="chip">${rnote}</span>` : ''}</div>`;
  $('#pre-actions').hidden = true;
  $('#run-skill').textContent = `Skill ${S.topics[P.tid].r.toFixed(1)}`;
  renderDots(); renderHeader();
  $('#btn-next').textContent = RUN.res.length >= RUN.len ? 'See results' : 'Next problem';
  $('#btn-next').hidden = false;
  if (P.type === 'launch') {
    const fb2 = $('#btn-fire'); if (fb2) fb2.disabled = true;
    document.querySelectorAll('#answer-box input').forEach(i => i.disabled = true);
    $('#shot-msg').textContent = '';
  } else { scenePlay(); $('#btn-replay').hidden = false; $('#scene-cap').textContent = 'Simulation of this problem'; }
  setTimeout(() => $('#btn-next').focus({ preventScroll: true }), 30);
  if (innerWidth < 820) fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function endRun() {
  S.runs++;
  award('first');
  if (RUN.len >= RUN_LEN && RUN.res.every(r => r.score >= 1 && !r.hint)) award('clean');
  checkBadges(); save();
  const right = RUN.res.filter(r => r.score >= 0.6).length;
  $('#sum-label').textContent = RUN.mode === 'mix' ? 'Adaptive practice complete' : RUN.mode === 'review' ? 'Review complete' : `${tname(RUN.mode)} run complete`;
  $('#sum-title').textContent = right === RUN.len ? 'Perfect run' : right >= RUN.len * 0.66 ? 'Strong run' : right >= RUN.len * 0.33 ? 'Progress made' : 'Tough set. The next one will be gentler.';
  $('#sum-score').textContent = `${right}/${RUN.len}`;
  $('#sum-xp').textContent = `+${RUN.xp}`;
  $('#sum-streak').textContent = RUN.bestStreak;
  const touched = [...new Set(RUN.res.map(r => r.tid))];
  $('#sum-skills').innerHTML = touched.map(tid => {
    const a = RUN.before[tid], b = S.topics[tid].r, dl = b - a;
    return `<div class="skillrow"><b>${tname(tid)}</b>${gauge(b)}<span class="mono">${a.toFixed(1)} → ${b.toFixed(1)} <span class="${dl >= 0 ? 'up' : 'down'}">${dl >= 0 ? '▲' : '▼'}${Math.abs(dl).toFixed(1)}</span></span></div>`;
  }).join('');
  const extra = [];
  RUN.unlocks.forEach(u => extra.push(`<span class="chip good">Unlocked: ${u}</span>`));
  RUN.badges.forEach(b => extra.push(`<span class="chip acc">Badge: ${b}</span>`));
  if (S.review.length) extra.push(`<span class="chip">${S.review.length} in review queue</span>`);
  $('#sum-extra').innerHTML = extra.length ? `<div class="fbmeta">${extra.join('')}</div>` : '';
  const mode = RUN.mode;
  $('#btn-again').disabled = mode === 'review' && !S.review.length;
  $('#btn-again').textContent = mode === 'review' ? 'Review more' : 'Another run';
  $('#btn-again').onclick = () => startRun(mode);
  show('summary'); renderHeader();
}
function goHome() { cancelAnimationFrame(SC.raf); RUN = null; const d = $('#notes'); if (d.open) d.close(); if (S.grade == null) return showWelcome(); show('home'); renderHome(); }

/* ---------- wiring ---------- */
$('#btn-place').onclick = () => PICK && applyGrade(PICK);
$('#btn-scratch').onclick = () => applyGrade('scratch');
$('#btn-hint').onclick =() => { const P = RUN.cur; if (P.done) return; P.usedHint = true; $('#hint').hidden = false; $('#btn-hint').disabled = true; $('#hint-note').textContent = 'Hint used: this problem is capped at 60% credit.'; };
$('#btn-next').onclick = nextProblem;
$('#btn-replay').onclick = scenePlay;
$('#btn-quit').onclick = goHome;
$('#btn-map').onclick = goHome;
$('#brand').onclick = goHome;
$('#btn-mix').onclick = () => startRun('mix');
$('#btn-review').onclick = () => startRun('review');
$('#btn-sheet').onclick = openSheet;
$('#sheet-back').onclick = goHome;
$('#learn-back').onclick = goHome;
$('#learn-back2').onclick = goHome;
$('#learn-go').onclick = () => startRun(LEARN_ID);
$('#btn-notes').onclick = openNotes;
$('#notes-close').onclick = () => { const d = $('#notes'); d.open && d.close ? d.close() : d.removeAttribute('open'); };
window.llBack = () => {
  const d = $('#notes'); if (d.open) { d.close(); return true; }
  if (!$('#run').hidden || !$('#summary').hidden || !$('#learn').hidden || !$('#sheet').hidden) { goHome(); return true; }
  return false;
};
new ResizeObserver(() => drawScene()).observe(cv);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawScene);
new MutationObserver(drawScene).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
if (document.fonts) document.fonts.ready.then(drawScene);
if (S.grade == null) showWelcome();
else { checkBadges(); save(); show('home'); renderHome(); }
