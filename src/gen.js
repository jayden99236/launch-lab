/* ---------- problem generators ----------
   GEN[topic](difficulty) returns a problem: {type:'num'|'mc'|'launch', prompt, unit, answer, hint, solution, scene} */
const num = o => Object.assign({ type: 'num' }, o);
const GEN = {};

GEN.kin = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('kin', t);
  if (t === 0) {
    const r = R();
    if (r < 0.4) { const v = rint(3, 18), s = rint(3, 12); return num({ prompt: `A cyclist rides at a steady <b>${v} m/s</b> for <b>${s} s</b>. How far do they travel?`, unit: 'm', answer: v * s, hint: 'At constant velocity, distance = speed × time.', solution: `s = v·t = ${v} × ${s} = <b>${fmt(v * s)} m</b>`, scene: { kind: 'car', u: v, a: 0, T: s } }); }
    if (r < 0.7) { const x = rint(4, 30) * 10, s = rint(5, 40); return num({ prompt: `A runner covers <b>${x} m</b> in <b>${s} s</b>. What is their average speed?`, unit: 'm/s', answer: x / s, hint: 'Average speed = total distance ÷ total time.', solution: `v = s / t = ${x} / ${s} = <b>${fmt(x / s)} m/s</b>`, scene: { kind: 'car', u: x / s, a: 0, T: s, flag: `${x} m` } }); }
    const kmh = rint(4, 24) * 5; return num({ prompt: `A car’s speedometer reads <b>${kmh} km/h</b>. What is that in metres per second?`, unit: 'm/s', answer: kmh / 3.6, hint: '1 km/h = 1000 m ÷ 3600 s, so divide by 3.6.', solution: `${kmh} ÷ 3.6 = <b>${fmt(kmh / 3.6)} m/s</b>`, scene: { kind: 'car', u: kmh / 3.6, a: 0, T: 3 } });
  }
  if (t === 1) {
    const u = rint(0, 8), a = rstep(0.5, 4, 0.5), s = rint(2, 10), r = R();
    if (r < 0.35) { const v = u + a * s; return num({ prompt: `A car moving at <b>${u} m/s</b> accelerates at <b>${a} m/s²</b> for <b>${s} s</b>. What is its final speed?`, unit: 'm/s', answer: v, hint: 'Use v = u + at.', solution: `v = u + at = ${u} + ${a} × ${s} = <b>${fmt(v)} m/s</b>`, scene: { kind: 'car', u, a, T: s } }); }
    if (r < 0.7) { const x = u * s + 0.5 * a * s * s; return num({ prompt: `A car starts at <b>${u} m/s</b> and accelerates at <b>${a} m/s²</b> for <b>${s} s</b>. How far does it travel in that time?`, unit: 'm', answer: x, hint: 'Use s = ut + ½at².', solution: `s = ut + ½at² = ${u}×${s} + ½×${a}×${s}² = <b>${fmt(x)} m</b>`, scene: { kind: 'car', u, a, T: s } }); }
    const h = rint(5, 60), tt = Math.sqrt(2 * h / G);
    return num({ prompt: `A stone is dropped from a bridge <b>${h} m</b> above the water. How long does it fall?`, unit: 's', answer: tt, hint: 'It starts from rest and accelerates at g: h = ½gt².', solution: `t = √(2h / g) = √(2 × ${h} / 9.8) = <b>${fmt(tt)} s</b>`, scene: { kind: 'drop', h, m: 1 } });
  }
  const r = R();
  if (r < 0.4) { const u = rint(12, 32), a = rstep(4, 8, 0.5), x = u * u / (2 * a); return num({ prompt: `A driver travelling at <b>${u} m/s</b> brakes, decelerating at <b>${a} m/s²</b>. What is the stopping distance?`, unit: 'm', answer: x, hint: 'The final speed is 0. Use v² = u² + 2as with a negative a, then solve for s.', solution: `0 = u² − 2as → s = u² / (2a) = ${u}² / (2 × ${a}) = <b>${fmt(x)} m</b>`, scene: { kind: 'car', u, a: -a, T: u / a } }); }
  if (r < 0.75) { const u = rint(2, 10), a = rstep(1, 5, 0.5), x = rint(3, 12) * 10, tt = (-u + Math.sqrt(u * u + 2 * a * x)) / a; return num({ prompt: `A train passes a signal at <b>${u} m/s</b> and accelerates at <b>${a} m/s²</b>. How long does it take to cover the next <b>${x} m</b>?`, unit: 's', answer: tt, hint: 's = ut + ½at² is a quadratic in t. Take the positive root.', solution: `½a·t² + u·t − s = 0<br>t = (−u + √(u² + 2as)) / a<br>= (−${u} + √(${u}² + 2×${a}×${x})) / ${a} = <b>${fmt(tt)} s</b>`, scene: { kind: 'car', u, a, T: tt, flag: `${x} m` } }); }
  const u = rint(8, 25), H = u * u / (2 * G);
  return num({ prompt: `A ball is thrown straight up at <b>${u} m/s</b>. How high does it rise above the launch point?`, unit: 'm', answer: H, hint: 'At the top v = 0. Use v² = u² − 2gh.', solution: `0 = u² − 2gh → h = u² / 2g = ${u}² / (2 × 9.8) = <b>${fmt(H)} m</b>`, scene: { kind: 'proj', v: u, ang: 89.9, h: 0 } });
};

GEN.force = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('force', t);
  if (t === 0) {
    const m = rint(2, 20), a = rstep(0.5, 5, 0.5), r = R();
    if (r < 0.4) return num({ prompt: `What net force gives a <b>${m} kg</b> trolley an acceleration of <b>${a} m/s²</b>?`, unit: 'N', answer: m * a, hint: 'Newton’s second law: F = ma.', solution: `F = ma = ${m} × ${a} = <b>${fmt(m * a)} N</b>`, scene: { kind: 'block', angle: 0, m, F: m * a, mu: 0, a } });
    if (r < 0.75) { const F = m * a; return num({ prompt: `A net force of <b>${fmt(F)} N</b> acts on a <b>${m} kg</b> crate. What is its acceleration?`, unit: 'm/s²', answer: a, hint: 'Rearrange F = ma to get a = F / m.', solution: `a = F / m = ${fmt(F)} / ${m} = <b>${fmt(a)} m/s²</b>`, scene: { kind: 'block', angle: 0, m, F, mu: 0, a } }); }
    const mm = rint(3, 90);
    return num({ prompt: `What is the weight of a <b>${mm} kg</b> object on Earth?`, unit: 'N', answer: mm * G, hint: 'Weight is the force of gravity: W = mg, with g = 9.8 m/s².', solution: `W = mg = ${mm} × 9.8 = <b>${fmt(mm * G)} N</b>`, scene: { kind: 'drop', h: 10, m: mm } });
  }
  if (t === 1) {
    const m = rint(4, 25), mu = rstep(0.1, 0.4, 0.05), fr = mu * m * G, r = R();
    if (r < 0.4) { const F = Math.ceil(fr / 5) * 5 + rint(2, 8) * 5, a = (F - fr) / m; return num({ prompt: `You push a <b>${m} kg</b> box across the floor with <b>${F} N</b>. The coefficient of friction is <b>μ = ${mu}</b>. What is its acceleration?`, unit: 'm/s²', answer: a, hint: 'Friction f = μmg acts against the push. Net force = F − f.', solution: `f = μmg = ${mu} × ${m} × 9.8 = ${fmt(fr)} N<br>a = (F − f) / m = (${F} − ${fmt(fr)}) / ${m} = <b>${fmt(a)} m/s²</b>`, scene: { kind: 'block', angle: 0, m, F, mu, a } }); }
    if (r < 0.75) { const a = rstep(0.5, 3, 0.5), F = m * a + fr; return num({ prompt: `What pushing force makes a <b>${m} kg</b> box accelerate at <b>${a} m/s²</b> across a floor with <b>μ = ${mu}</b>?`, unit: 'N', answer: F, hint: 'The push must supply ma and also overcome friction μmg.', solution: `F − μmg = ma → F = ma + μmg<br>= ${m}×${a} + ${mu}×${m}×9.8 = <b>${fmt(F)} N</b>`, scene: { kind: 'block', angle: 0, m, F, mu, a } }); }
    const mm = rint(40, 90), a = rstep(0.5, 3, 0.5), up = R() < 0.5, N = mm * (G + (up ? a : -a));
    return num({ prompt: `A <b>${mm} kg</b> person stands on scales in a lift accelerating <b>${up ? 'upward' : 'downward'}</b> at <b>${a} m/s²</b>. What do the scales read, in newtons?`, unit: 'N', answer: N, hint: 'The scales read the normal force N. Apply N − mg = ma, with a positive when upward.', solution: `N = m(g ${up ? '+' : '−'} a) = ${mm} × (9.8 ${up ? '+' : '−'} ${a}) = <b>${fmt(N)} N</b>`, scene: { kind: 'drop', h: 3, m: mm, lift: true } });
  }
  const r = R();
  if (r < 0.4) {
    const th = rint(20, 45), mu = rstep(0.05, Math.min(0.3, Math.tan(rad(th)) - 0.1), 0.05), m = rint(2, 12);
    const a = G * (Math.sin(rad(th)) - mu * Math.cos(rad(th)));
    return num({ prompt: `A <b>${m} kg</b> block slides down a <b>${th}°</b> ramp with <b>μ = ${mu}</b>. What is its acceleration?`, unit: 'm/s²', answer: a, hint: 'Along the slope, mg sinθ pulls it down and μmg cosθ resists. The mass cancels.', solution: `a = g(sinθ − μ cosθ)<br>= 9.8 × (sin${th}° − ${mu} × cos${th}°) = <b>${fmt(a)} m/s²</b>`, scene: { kind: 'block', angle: th, m, F: 0, mu, a } });
  }
  const m1 = rint(3, 12), m2 = rint(1, m1 - 1), a = (m1 - m2) * G / (m1 + m2);
  if (r < 0.72) return num({ prompt: `Masses of <b>${m1} kg</b> and <b>${m2} kg</b> hang either side of a light, frictionless pulley. What is their acceleration?`, unit: 'm/s²', answer: a, hint: 'Treat both masses as one system: the net force is (m₁ − m₂)g and the total mass is (m₁ + m₂).', solution: `a = (m₁ − m₂)g / (m₁ + m₂) = (${m1} − ${m2}) × 9.8 / ${m1 + m2} = <b>${fmt(a)} m/s²</b>`, scene: { kind: 'atwood', m1, m2, a } });
  const T = 2 * m1 * m2 * G / (m1 + m2);
  return num({ prompt: `Masses of <b>${m1} kg</b> and <b>${m2} kg</b> hang either side of a light, frictionless pulley. What is the tension in the string?`, unit: 'N', answer: T, hint: 'First find a = (m₁ − m₂)g / (m₁ + m₂). Then, for the lighter mass, T − m₂g = m₂a.', solution: `a = (m₁ − m₂)g / (m₁ + m₂) = ${fmt(a)} m/s²<br>T = m₂(g + a) = ${m2} × (9.8 + ${fmt(a)}) = <b>${fmt(T)} N</b>`, scene: { kind: 'atwood', m1, m2, a } });
};

GEN.energy = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('energy', t);
  if (t === 0) {
    const r = R();
    if (r < 0.35) { const m = rint(1, 20), v = rint(2, 12), E = 0.5 * m * v * v; return num({ prompt: `What is the kinetic energy of a <b>${m} kg</b> ball moving at <b>${v} m/s</b>?`, unit: 'J', answer: E, hint: 'KE = ½mv².', solution: `KE = ½mv² = ½ × ${m} × ${v}² = <b>${fmt(E)} J</b>`, scene: { kind: 'car', u: v, a: 0, T: 3, ball: true } }); }
    if (r < 0.7) { const m = rint(1, 30), h = rint(2, 25), E = m * G * h; return num({ prompt: `A <b>${m} kg</b> box is lifted onto a shelf <b>${h} m</b> high. How much gravitational potential energy does it gain?`, unit: 'J', answer: E, hint: 'GPE = mgh.', solution: `GPE = mgh = ${m} × 9.8 × ${h} = <b>${fmt(E)} J</b>`, scene: { kind: 'drop', h, m } }); }
    const F = rint(10, 200), x = rint(2, 30);
    return num({ prompt: `You push a trolley with a steady <b>${F} N</b> force for <b>${x} m</b> in the direction it moves. How much work do you do?`, unit: 'J', answer: F * x, hint: 'Work = force × distance moved in the direction of the force.', solution: `W = Fd = ${F} × ${x} = <b>${fmt(F * x)} J</b>`, scene: { kind: 'block', angle: 0, m: 10, F, mu: 0, a: 1 } });
  }
  if (t === 1) {
    const r = R();
    if (r < 0.35) { const h = rint(2, 40), v = Math.sqrt(2 * G * h); return num({ prompt: `A stone is dropped from <b>${h} m</b>. Ignoring air resistance, how fast is it moving when it hits the ground?`, unit: 'm/s', answer: v, hint: 'All the potential energy becomes kinetic: mgh = ½mv². The mass cancels.', solution: `mgh = ½mv² → v = √(2gh) = √(2 × 9.8 × ${h}) = <b>${fmt(v)} m/s</b>`, scene: { kind: 'drop', h, m: 1 } }); }
    if (r < 0.7) { const k = rint(1, 8) * 100, x = rstep(0.05, 0.3, 0.05), E = 0.5 * k * x * x; return num({ prompt: `A spring with stiffness <b>k = ${k} N/m</b> is compressed by <b>${x} m</b>. How much energy does it store?`, unit: 'J', answer: E, hint: 'Elastic energy E = ½kx².', solution: `E = ½kx² = ½ × ${k} × ${x}² = <b>${fmt(E, 3)} J</b>`, scene: { kind: 'spring', k, x, m: 1 } }); }
    const tin = rint(2, 20) * 100, eff = rint(15, 90), out = tin * eff / 100;
    return num({ prompt: `An electric motor takes in <b>${tin} J</b> and does <b>${out} J</b> of useful work. What is its efficiency, as a percentage?`, unit: '%', answer: eff, hint: 'Efficiency = useful output ÷ total input × 100.', solution: `efficiency = ${out} / ${tin} × 100 = <b>${fmt(eff)}%</b>`, scene: { kind: 'drop', h: 6, m: 5, lift: true } });
  }
  const r = R();
  if (r < 0.35) {
    const m = rint(2, 15), h = rint(3, 15), frac = rstep(0.1, 0.5, 0.05), Wf = Math.round(m * G * h * frac);
    const v = Math.sqrt(2 * (m * G * h - Wf) / m);
    return num({ prompt: `A <b>${m} kg</b> sled starts at rest and slides down a hill <b>${h} m</b> high. Friction does <b>${Wf} J</b> of work against it. How fast is it going at the bottom?`, unit: 'm/s', answer: v, hint: 'Energy in = energy out: mgh = ½mv² + work against friction.', solution: `½mv² = mgh − W_f = ${m}×9.8×${h} − ${Wf} = ${fmt(m * G * h - Wf)} J<br>v = √(2 × ${fmt(m * G * h - Wf)} / ${m}) = <b>${fmt(v)} m/s</b>`, scene: { kind: 'block', angle: 30, m, F: 0, mu: 0.2, a: 3 } });
  }
  if (r < 0.7) {
    const k = rint(2, 10) * 100, x = rstep(0.1, 0.3, 0.05), m = rstep(0.1, 0.5, 0.05), h = k * x * x / (2 * m * G);
    return num({ prompt: `A toy launcher has a spring with <b>k = ${k} N/m</b> compressed <b>${x} m</b>. It fires a <b>${m} kg</b> ball straight up. How high does the ball rise?`, unit: 'm', answer: h, hint: 'Spring energy becomes potential energy at the top: ½kx² = mgh.', solution: `h = kx² / (2mg) = ${k} × ${x}² / (2 × ${m} × 9.8) = <b>${fmt(h)} m</b>`, scene: { kind: 'spring', k, x, m } });
  }
  const m = rint(5, 40) * 10, h = rint(5, 30), s = rint(5, 40), P = m * G * h / s;
  return num({ prompt: `A crane lifts a <b>${m} kg</b> load <b>${h} m</b> in <b>${s} s</b> at a steady speed. What is its power output?`, unit: 'W', answer: P, hint: 'Power = work ÷ time, and the work done lifting is mgh.', solution: `P = mgh / t = ${m} × 9.8 × ${h} / ${s} = <b>${fmt(P)} W</b>`, scene: { kind: 'drop', h, m, lift: true } });
};

GEN.proj = d => {
  const t = tier(d), r = R();
  if (r < 0.15) return mcFrom('proj', t);
  if (r < [0.5, 0.58, 0.62][t]) return launchProblem(t);
  if (t === 0) {
    const h = rint(5, 45), v = rint(4, 20), tt = Math.sqrt(2 * h / G);
    if (R() < 0.5) return num({ prompt: `A ball rolls off a cliff <b>${h} m</b> high. How long does it take to reach the ground?`, unit: 's', answer: tt, hint: 'The ball starts with no vertical velocity. Use h = ½gt².', solution: `t = √(2h / g) = √(2 × ${h} / 9.8) = <b>${fmt(tt)} s</b>`, scene: { kind: 'proj', v, ang: 0, h } });
    return num({ prompt: `A ball rolls off a <b>${h} m</b> cliff at <b>${v} m/s</b> horizontally. How far from the base of the cliff does it land?`, unit: 'm', answer: v * tt, hint: 'Find the fall time from h = ½gt². The horizontal speed stays constant during the fall.', solution: `t = √(2h/g) = √(2×${h}/9.8) = ${fmt(tt)} s<br>x = v·t = ${v} × ${fmt(tt)} = <b>${fmt(v * tt)} m</b>`, scene: { kind: 'proj', v, ang: 0, h } });
  }
  if (t === 1) {
    const v = rint(10, 30), ang = pick([15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70]), s = Math.sin(rad(ang)), q = R();
    if (q < 0.4) { const Rg = v * v * Math.sin(rad(2 * ang)) / G; return num({ prompt: `A ball is kicked at <b>${v} m/s</b> at <b>${ang}°</b> above level ground. How far away does it land?`, unit: 'm', answer: Rg, hint: 'On level ground, range R = v² sin(2θ) / g.', solution: `R = v² sin(2θ) / g = ${v}² × sin(${2 * ang}°) / 9.8 = <b>${fmt(Rg)} m</b>`, scene: { kind: 'proj', v, ang, h: 0 } }); }
    if (q < 0.7) { const Hm = (v * s) ** 2 / (2 * G); return num({ prompt: `A ball is launched at <b>${v} m/s</b> at <b>${ang}°</b>. What maximum height does it reach?`, unit: 'm', answer: Hm, hint: 'Only the vertical part matters: v_y = v sinθ, and v_y = 0 at the top. Use v² = u² − 2gh.', solution: `v_y = ${v} × sin${ang}° = ${fmt(v * s)} m/s<br>H = v_y² / (2g) = <b>${fmt(Hm)} m</b>`, scene: { kind: 'proj', v, ang, h: 0 } }); }
    const tf = 2 * v * s / G;
    return num({ prompt: `A ball is launched at <b>${v} m/s</b> at <b>${ang}°</b> over level ground. How long is it in the air?`, unit: 's', answer: tf, hint: 'Time to the top is v sinθ / g, and the trip down takes just as long.', solution: `t = 2v sinθ / g = 2 × ${v} × sin${ang}° / 9.8 = <b>${fmt(tf)} s</b>`, scene: { kind: 'proj', v, ang, h: 0 } });
  }
  const v = rint(10, 25), ang = pick([20, 25, 30, 35, 40, 45]), h = rint(10, 40);
  const vx = v * Math.cos(rad(ang)), vy = v * Math.sin(rad(ang)), tf = (vy + Math.sqrt(vy * vy + 2 * G * h)) / G;
  return num({ prompt: `A cannon on a <b>${h} m</b> cliff fires at <b>${v} m/s</b>, <b>${ang}°</b> above horizontal. How far from the cliff base does the shot land?`, unit: 'm', answer: vx * tf, hint: 'Solve the vertical motion for time: −h = v_y·t − ½gt². Then x = v_x·t.', solution: `v_x = ${fmt(vx)} m/s, v_y = ${fmt(vy)} m/s<br>t = (v_y + √(v_y² + 2gh)) / g = ${fmt(tf)} s<br>x = v_x·t = <b>${fmt(vx * tf)} m</b>`, scene: { kind: 'proj', v, ang, h } });
};
function launchProblem(t) {
  let p;
  if (t === 0) {
    const X = rint(15, 45);
    p = { mode: 'free', X, H: 0, w: 6, v0: 15, a0: 45, sol: `One clean setting: at 45°, R = v²/g, so v = √(gR) = √(9.8 × ${X}) = <b>${fmt(Math.sqrt(G * X))} m/s</b>. Many other angle and speed pairs also work.` };
    p.prompt = `Hit the target <b>${X} m</b> away. You choose both the angle and the speed. The target is ${p.w} m wide.`;
    p.hint = 'At 45°, the range is v²/g. Pick an angle, then adjust the speed.';
  } else if (t === 1) {
    const X = rint(20, 50), v = Math.ceil(Math.sqrt(G * X / rstep(0.55, 0.9, 0.05)) * 2) / 2;
    const a1 = 0.5 * deg(Math.asin(G * X / (v * v)));
    p = { mode: 'angle', X, H: 0, w: 4, v0: v, a0: 30, sol: `sin(2θ) = gR / v² = 9.8 × ${X} / ${v}² = ${fmt(G * X / v / v, 3)}<br>θ = <b>${fmt(a1, 1)}°</b> or <b>${fmt(90 - a1, 1)}°</b>` };
    p.prompt = `The launcher is locked at <b>${v} m/s</b>. Find an angle that lands the ball on the target <b>${X} m</b> away (${p.w} m wide).`;
    p.hint = 'Rearrange R = v² sin(2θ)/g to get sin(2θ) = gR/v². Two angles work.';
  } else {
    const ang = pick([35, 40, 45, 50, 55, 60]), X = rint(20, 45), H = clamp(rint(3, Math.floor(X * Math.tan(rad(ang)) * 0.4)), 3, 15);
    const c = Math.cos(rad(ang)), v = Math.sqrt(G * X * X / (2 * c * c * (X * Math.tan(rad(ang)) - H)));
    p = { mode: 'speed', X, H, w: 3, v0: 15, a0: ang, sol: `From y = x tanθ − g x² / (2v² cos²θ), with y = ${H}:<br>v = √( g x² / (2cos²θ (x tanθ − y)) )<br>= √( 9.8 × ${X}² / (2 × cos²${ang}° × (${X} × tan${ang}° − ${H})) ) = <b>${fmt(v)} m/s</b>` };
    p.prompt = `The launcher is locked at <b>${ang}°</b>. Find the speed that lands the ball on a platform <b>${H} m</b> high, <b>${X} m</b> away (${p.w} m wide).`;
    p.hint = 'Use the trajectory equation y = x tanθ − g x² / (2v² cos²θ), put in x and y, and solve for v.';
  }
  return { type: 'launch', prompt: p.prompt, hint: p.hint, solution: p.sol, L: p, scene: { kind: 'proj', target: { x: p.X, H: p.H, w: p.w }, shots: [], aimV: p.v0, aimAng: p.a0, h: 0 } };
}

GEN.mom = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('mom', t);
  if (t === 0) {
    const m = rint(2, 80), v = rint(2, 15);
    if (R() < 0.55) return num({ prompt: `What is the momentum of a <b>${m} kg</b> object moving at <b>${v} m/s</b>?`, unit: 'kg·m/s', answer: m * v, hint: 'p = mv.', solution: `p = mv = ${m} × ${v} = <b>${fmt(m * v)} kg·m/s</b>`, scene: { kind: 'car', u: v, a: 0, T: 3, ball: true } });
    return num({ prompt: `A <b>${m} kg</b> sled has <b>${m * v} kg·m/s</b> of momentum. How fast is it moving?`, unit: 'm/s', answer: v, hint: 'Rearrange p = mv to get v = p / m.', solution: `v = p / m = ${m * v} / ${m} = <b>${fmt(v)} m/s</b>`, scene: { kind: 'car', u: v, a: 0, T: 3 } });
  }
  if (t === 1) {
    if (R() < 0.7) {
      const m1 = rint(2, 10), v1 = rint(3, 10), m2 = rint(2, 10), v2 = pick([0, 0, rint(1, v1 - 1), -rint(1, 5)]);
      const vf = (m1 * v1 + m2 * v2) / (m1 + m2);
      const desc = v2 === 0 ? 'at rest' : v2 > 0 ? `moving the same way at <b>${v2} m/s</b>` : `moving towards it at <b>${-v2} m/s</b>`;
      return num({ prompt: `A <b>${m1} kg</b> cart rolling right at <b>${v1} m/s</b> hits a <b>${m2} kg</b> cart ${desc}. They couple together. What is their velocity afterwards? (Right is positive.)`, unit: 'm/s', answer: vf, hint: 'Total momentum before = total momentum after. Afterwards they move as one mass, m₁ + m₂.', solution: `m₁v₁ + m₂v₂ = (m₁ + m₂)v<br>v = (${m1}×${v1} + ${m2}×(${v2})) / ${m1 + m2} = <b>${fmt(vf)} m/s</b>`, scene: { kind: 'carts', m1, v1, m2, v2, e: 0 } });
    }
    const mb = rstep(0.01, 0.05, 0.005), vb = rint(200, 600), mg = rstep(2, 6, 0.5), vr = mb * vb / mg;
    return num({ prompt: `A <b>${mg} kg</b> rifle fires a <b>${mb} kg</b> bullet at <b>${vb} m/s</b>. How fast does the rifle recoil?`, unit: 'm/s', answer: vr, hint: 'Total momentum is zero before firing, so the rifle’s momentum must cancel the bullet’s.', solution: `m_g v_g = m_b v_b → v_g = ${mb} × ${vb} / ${mg} = <b>${fmt(vr)} m/s</b>`, scene: { kind: 'carts', m1: mg, v1: 3, m2: 1, v2: 0, e: 1 } });
  }
  const r = R();
  if (r < 0.38) {
    const m1 = rint(2, 10), m2 = rint(2, 10), v1 = rint(3, 10);
    const v1f = (m1 - m2) / (m1 + m2) * v1, v2f = 2 * m1 / (m1 + m2) * v1;
    if (R() < 0.5) return num({ prompt: `A <b>${m1} kg</b> cart moving at <b>${v1} m/s</b> collides <i>elastically</i> with a <b>${m2} kg</b> cart at rest. How fast does the second cart move afterwards?`, unit: 'm/s', answer: v2f, hint: 'For an elastic collision with the target at rest, v₂′ = 2m₁u₁ / (m₁ + m₂).', solution: `v₂′ = 2m₁u₁ / (m₁ + m₂) = 2 × ${m1} × ${v1} / ${m1 + m2} = <b>${fmt(v2f)} m/s</b>`, scene: { kind: 'carts', m1, v1, m2, v2: 0, e: 1 } });
    return num({ prompt: `A <b>${m1} kg</b> cart moving right at <b>${v1} m/s</b> collides <i>elastically</i> with a <b>${m2} kg</b> cart at rest. What is the first cart’s velocity afterwards? (Right is positive.)`, unit: 'm/s', answer: v1f, hint: 'For an elastic collision with the target at rest, v₁′ = (m₁ − m₂)u₁ / (m₁ + m₂). It can be negative.', solution: `v₁′ = (m₁ − m₂)u₁ / (m₁ + m₂) = (${m1} − ${m2}) × ${v1} / ${m1 + m2} = <b>${fmt(v1f)} m/s</b>`, scene: { kind: 'carts', m1, v1, m2, v2: 0, e: 1 } });
  }
  if (r < 0.7) {
    const m = rstep(0.1, 0.6, 0.05), v = rint(5, 20), v2 = rint(2, v), dt = rstep(0.01, 0.1, 0.01), F = m * (v + v2) / dt;
    return num({ prompt: `A <b>${m} kg</b> ball hits a wall at <b>${v} m/s</b> and bounces straight back at <b>${v2} m/s</b>. Contact lasts <b>${dt} s</b>. What average force does the wall exert?`, unit: 'N', answer: F, hint: 'F = Δp / Δt. The velocity reverses, so the change in velocity is v + v′.', solution: `Δp = m(v + v′) = ${m} × (${v} + ${v2}) = ${fmt(m * (v + v2))} kg·m/s<br>F = Δp / Δt = ${fmt(m * (v + v2))} / ${dt} = <b>${fmt(F)} N</b>`, scene: { kind: 'carts', m1: m * 10, v1: v, wall: true, e: v2 / v } });
  }
  const m1 = rint(2, 10), v1 = rint(3, 12), m2 = rint(2, 10), vf = m1 * v1 / (m1 + m2), loss = 0.5 * m1 * v1 * v1 - 0.5 * (m1 + m2) * vf * vf;
  return num({ prompt: `A <b>${m1} kg</b> cart at <b>${v1} m/s</b> hits and sticks to a <b>${m2} kg</b> cart at rest. How much kinetic energy is lost?`, unit: 'J', answer: loss, hint: 'Find the shared final velocity from momentum, then compare kinetic energy before and after.', solution: `v = m₁u₁ / (m₁ + m₂) = ${fmt(vf)} m/s<br>KE before = ½×${m1}×${v1}² = ${fmt(0.5 * m1 * v1 * v1)} J<br>KE after = ½×${m1 + m2}×${fmt(vf)}² = ${fmt(0.5 * (m1 + m2) * vf * vf)} J<br>Lost = <b>${fmt(loss)} J</b>`, scene: { kind: 'carts', m1, v1, m2, v2: 0, e: 0 } });
};

GEN.circ = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('circ', t);
  if (t === 0) {
    if (R() < 0.5) { const r = rstep(0.5, 10, 0.5), T = rstep(0.5, 6, 0.5), v = 2 * Math.PI * r / T; return num({ prompt: `A child on a roundabout sits <b>${r} m</b> from the centre and goes round once every <b>${T} s</b>. How fast is the child moving?`, unit: 'm/s', answer: v, hint: 'One lap is a distance of 2πr, covered in one period T.', solution: `v = 2πr / T = 2π × ${r} / ${T} = <b>${fmt(v)} m/s</b>`, scene: { kind: 'circle', r, v } }); }
    const v = rint(2, 20), r = rint(1, 30), a = v * v / r;
    return num({ prompt: `A go-kart drives round a circle of radius <b>${r} m</b> at a steady <b>${v} m/s</b>. What is its centripetal acceleration?`, unit: 'm/s²', answer: a, hint: 'a = v² / r.', solution: `a = v² / r = ${v}² / ${r} = <b>${fmt(a)} m/s²</b>`, scene: { kind: 'circle', r, v } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.35) { const m = rstep(0.2, 2, 0.1), r = rstep(0.5, 2, 0.1), v = rint(2, 10), F = m * v * v / r; return num({ prompt: `A <b>${m} kg</b> ball on a string is whirled in a horizontal circle of radius <b>${r} m</b> at <b>${v} m/s</b>. What is the tension in the string?`, unit: 'N', answer: F, hint: 'The tension is the centripetal force: F = mv² / r.', solution: `T = mv² / r = ${m} × ${v}² / ${r} = <b>${fmt(F)} N</b>`, scene: { kind: 'circle', r, v, m } }); }
    if (q < 0.7) { const mu = rstep(0.3, 0.9, 0.05), r = rint(20, 150), v = Math.sqrt(mu * G * r); return num({ prompt: `A car rounds a flat bend of radius <b>${r} m</b>. The friction coefficient between tyres and road is <b>μ = ${mu}</b>. What is the fastest it can go without skidding?`, unit: 'm/s', answer: v, hint: 'Friction μmg is the most centripetal force available. Set μmg = mv²/r; the mass cancels.', solution: `μmg = mv² / r → v = √(μgr) = √(${mu} × 9.8 × ${r}) = <b>${fmt(v)} m/s</b>`, scene: { kind: 'circle', r, v } }); }
    const rpm = rint(30, 600), r = rstep(0.1, 1.5, 0.05), w = rpm * 2 * Math.PI / 60, a = w * w * r;
    return num({ prompt: `A disc spins at <b>${rpm} rpm</b>. What is the centripetal acceleration of a point <b>${r} m</b> from the centre?`, unit: 'm/s²', answer: a, hint: 'Convert to rad/s first: ω = rpm × 2π / 60. Then a = ω²r.', solution: `ω = ${rpm} × 2π / 60 = ${fmt(w)} rad/s<br>a = ω²r = ${fmt(w)}² × ${r} = <b>${fmt(a)} m/s²</b>`, scene: { kind: 'circle', r, v: w * r } });
  }
  const q = R();
  if (q < 0.33) { const r = rint(3, 20), v = Math.sqrt(G * r); return num({ prompt: `A roller coaster has a vertical loop of radius <b>${r} m</b>. What is the minimum speed at the top for the cars to stay on the track?`, unit: 'm/s', answer: v, hint: 'At the minimum speed gravity alone provides the centripetal force: mg = mv²/r.', solution: `mg = mv² / r → v = √(gr) = √(9.8 × ${r}) = <b>${fmt(v)} m/s</b>`, scene: { kind: 'circle', r, v, vertical: true } }); }
  if (q < 0.66) { const m = rstep(0.2, 2, 0.1), r = rstep(0.5, 1.5, 0.1), v = rint(3, 9), T = m * G + m * v * v / r; return num({ prompt: `A <b>${m} kg</b> ball on a <b>${r} m</b> string is swung in a vertical circle. At the bottom it moves at <b>${v} m/s</b>. What is the tension in the string there?`, unit: 'N', answer: T, hint: 'At the bottom the tension must hold up the weight and also provide the centripetal force: T − mg = mv²/r.', solution: `T = mg + mv² / r = ${m}×9.8 + ${m}×${v}²/${r} = <b>${fmt(T)} N</b>`, scene: { kind: 'circle', r, v, vertical: true, m } }); }
  const m = rint(8, 15) * 100, r = rint(30, 100), v = rint(5, Math.floor(Math.sqrt(G * r) * 0.9)), N = m * (G - v * v / r);
  return num({ prompt: `A <b>${m} kg</b> car drives over a hump-backed bridge with a radius of curvature of <b>${r} m</b> at <b>${v} m/s</b>. What normal force does the road exert at the top?`, unit: 'N', answer: N, hint: 'At the crest, mg − N must equal the centripetal force mv²/r.', solution: `mg − N = mv² / r → N = m(g − v²/r) = ${m} × (9.8 − ${v}²/${r}) = <b>${fmt(N)} N</b>`, scene: { kind: 'circle', r, v, vertical: true } });
};

const PLANETS = [{ n: 'the Moon', g: 1.62 }, { n: 'Mars', g: 3.71 }, { n: 'Jupiter', g: 24.8 }, { n: 'Venus', g: 8.87 }, { n: 'Mercury', g: 3.7 }];
GEN.grav = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('grav', t);
  if (t === 0) {
    if (R() < 0.5) { const F = rint(2, 9) * 100, k = pick([2, 3, 4, 5]); return num({ prompt: `Two asteroids attract each other with a force of <b>${F} N</b>. If the distance between them becomes <b>${k} times</b> larger, what is the new force?`, unit: 'N', answer: F / k / k, hint: 'Gravity is an inverse-square law: F ∝ 1/r².', solution: `F′ = F / k² = ${F} / ${k}² = <b>${fmt(F / k / k)} N</b>`, scene: { kind: 'orbit', alt: 0.3 + k * 0.2, lines: [`r × ${k}`, `F ÷ ${k * k}`] } }); }
    const m = rint(40, 120), p = pick(PLANETS);
    return num({ prompt: `An astronaut with a mass of <b>${m} kg</b> stands on ${p.n}, where <b>g = ${p.g} m/s²</b>. What is their weight there?`, unit: 'N', answer: m * p.g, hint: 'W = mg, using the local value of g. Mass doesn’t change.', solution: `W = mg = ${m} × ${p.g} = <b>${fmt(m * p.g)} N</b>`, scene: { kind: 'orbit', alt: 0, lines: [`g = ${p.g} m/s²`] } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.33) { const m1 = rint(50, 120), m2 = rint(50, 120), r = rstep(0.5, 3, 0.5), F = GC * m1 * m2 / (r * r); return num({ prompt: `Two people of mass <b>${m1} kg</b> and <b>${m2} kg</b> stand <b>${r} m</b> apart. What gravitational force does each feel from the other? (Use e for powers of ten, e.g. 2.5e-7.)`, unit: 'N', answer: F, hint: 'F = Gm₁m₂ / r² with G = 6.67 × 10⁻¹¹.', solution: `F = 6.67×10⁻¹¹ × ${m1} × ${m2} / ${r}² = <b>${fmt(F)} N</b>. Tiny, which is why you never notice it.`, scene: { kind: 'orbit', alt: 0.4, lines: ['F = Gm₁m₂ / r²'] } }); }
    if (q < 0.66) { const h = rint(2, 30) * 100, r = RE + h * 1000, g = GC * ME / (r * r); return num({ prompt: `What is the gravitational field strength <b>${h} km</b> above Earth’s surface? (M_E = 5.97×10²⁴ kg, R_E = 6.37×10⁶ m)`, unit: 'm/s²', answer: g, hint: 'g = GM / r², where r is measured from Earth’s centre: r = R_E + h.', solution: `r = 6.37×10⁶ + ${h * 1000} = ${fmt(r)} m<br>g = GM / r² = 6.67×10⁻¹¹ × 5.97×10²⁴ / r² = <b>${fmt(g)} m/s²</b>`, scene: { kind: 'orbit', alt: h / 6370, lines: [`h = ${h} km`] } }); }
    const a = rstep(0.5, 9, 0.5), b = rstep(2, 9, 0.5), g = GC * a * 1e24 / (b * 1e6) ** 2;
    return num({ prompt: `A planet has a mass of <b>${a} × 10²⁴ kg</b> and a radius of <b>${b} × 10⁶ m</b>. What is g at its surface?`, unit: 'm/s²', answer: g, hint: 'g = GM / R².', solution: `g = 6.67×10⁻¹¹ × ${a}×10²⁴ / (${b}×10⁶)² = <b>${fmt(g)} m/s²</b>`, scene: { kind: 'orbit', alt: 0, lines: ['g = GM / R²'] } });
  }
  const q = R();
  if (q < 0.4) { const h = rint(2, 20) * 100, r = RE + h * 1000, v = Math.sqrt(GC * ME / r); return num({ prompt: `A satellite orbits <b>${h} km</b> above Earth’s surface. What is its orbital speed? (M_E = 5.97×10²⁴ kg, R_E = 6.37×10⁶ m)`, unit: 'm/s', answer: v, hint: 'Gravity provides the centripetal force: GMm/r² = mv²/r, so v = √(GM/r). Remember r = R_E + h.', solution: `r = ${fmt(r)} m<br>v = √(GM / r) = √(6.67×10⁻¹¹ × 5.97×10²⁴ / ${fmt(r)}) = <b>${fmt(v)} m/s</b>`, scene: { kind: 'orbit', alt: h / 6370, lines: [`h = ${h} km`, 'v = ?'] } }); }
  if (q < 0.75) { const h = rint(2, 20) * 100, r = RE + h * 1000, v = Math.sqrt(GC * ME / r), T = 2 * Math.PI * r / v / 60; return num({ prompt: `How many minutes does a satellite take to orbit Earth at a height of <b>${h} km</b>? (M_E = 5.97×10²⁴ kg, R_E = 6.37×10⁶ m)`, unit: 'min', answer: T, hint: 'Find the orbital speed v = √(GM/r), then T = 2πr / v. Convert seconds to minutes.', solution: `r = ${fmt(r)} m, v = √(GM/r) = ${fmt(v)} m/s<br>T = 2πr / v = ${fmt(T * 60)} s = <b>${fmt(T)} min</b>`, scene: { kind: 'orbit', alt: h / 6370, lines: [`h = ${h} km`, 'T = ?'] } }); }
  const k = rstep(1.5, 10, 0.5), T = Math.pow(k, 1.5);
  return num({ prompt: `A planet orbits its star <b>${k} times</b> as far out as Earth orbits the Sun (same star mass). How many Earth years is its year?`, unit: 'years', answer: T, hint: 'Kepler’s third law: T² ∝ r³, so T ∝ r^1.5.', solution: `T = ${k}^1.5 = √(${k}³) = <b>${fmt(T)} years</b>`, scene: { kind: 'orbit', alt: 1.2, lines: [`r = ${k} AU`] } });
};

GEN.shm = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('shm', t);
  if (t === 0) {
    if (R() < 0.5) { const f = rstep(0.5, 10, 0.5); return num({ prompt: `A vibrating ruler oscillates at <b>${f} Hz</b>. What is its period?`, unit: 's', answer: 1 / f, hint: 'T = 1 / f.', solution: `T = 1 / f = 1 / ${f} = <b>${fmt(1 / f)} s</b>`, scene: { kind: 'osc', A: 1, lines: [`f = ${f} Hz`] } }); }
    const L = rstep(0.2, 3, 0.1), T = 2 * Math.PI * Math.sqrt(L / G);
    return num({ prompt: `What is the period of a simple pendulum <b>${L} m</b> long?`, unit: 's', answer: T, hint: 'T = 2π√(L/g).', solution: `T = 2π√(L/g) = 2π√(${L}/9.8) = <b>${fmt(T)} s</b>`, scene: { kind: 'pendulum', L, lines: [`L = ${L} m`] } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.35) { const m = rstep(0.1, 2, 0.1), k = rint(5, 80) * 10, T = 2 * Math.PI * Math.sqrt(m / k); return num({ prompt: `A <b>${m} kg</b> mass hangs on a spring with <b>k = ${k} N/m</b>. What is its period of oscillation?`, unit: 's', answer: T, hint: 'T = 2π√(m/k).', solution: `T = 2π√(m/k) = 2π√(${m}/${k}) = <b>${fmt(T)} s</b>`, scene: { kind: 'osc', A: 1, lines: [`m = ${m} kg`, `k = ${k} N/m`] } }); }
    if (q < 0.7) { const T = rstep(0.5, 3, 0.1), L = G * (T / (2 * Math.PI)) ** 2; return num({ prompt: `How long must a pendulum be to have a period of <b>${T} s</b>?`, unit: 'm', answer: L, hint: 'Rearrange T = 2π√(L/g) to get L = g(T / 2π)².', solution: `L = g(T / 2π)² = 9.8 × (${T} / 6.283)² = <b>${fmt(L)} m</b>`, scene: { kind: 'pendulum', L, lines: [`T = ${T} s`] } }); }
    const N = rint(10, 50), s = rint(5, 40);
    return num({ prompt: `A mass on a spring completes <b>${N} oscillations</b> in <b>${s} s</b>. What is its frequency?`, unit: 'Hz', answer: N / s, hint: 'Frequency = number of cycles ÷ time.', solution: `f = ${N} / ${s} = <b>${fmt(N / s)} Hz</b>`, scene: { kind: 'osc', A: 1, lines: [`${N} cycles in ${s} s`] } });
  }
  const q = R();
  if (q < 0.35) { const A = rstep(0.02, 0.2, 0.01), m = rstep(0.2, 2, 0.1), k = rint(10, 80) * 10, w = Math.sqrt(k / m); return num({ prompt: `A <b>${m} kg</b> mass on a spring with <b>k = ${k} N/m</b> oscillates with amplitude <b>${A} m</b>. What is its maximum speed?`, unit: 'm/s', answer: A * w, hint: 'v_max = Aω, with ω = √(k/m).', solution: `ω = √(k/m) = √(${k}/${m}) = ${fmt(w)} rad/s<br>v_max = Aω = ${A} × ${fmt(w)} = <b>${fmt(A * w)} m/s</b>`, scene: { kind: 'osc', A: 1, lines: [`A = ${A} m`] } }); }
  if (q < 0.7) { const p = pick(PLANETS), L = rstep(0.5, 2, 0.1), T = +(2 * Math.PI * Math.sqrt(L / p.g)).toFixed(2), g = 4 * Math.PI * Math.PI * L / (T * T); return num({ prompt: `On another world, a <b>${L} m</b> pendulum has a period of <b>${T} s</b>. What is g there?`, unit: 'm/s²', answer: g, hint: 'Rearrange T = 2π√(L/g) to get g = 4π²L / T².', solution: `g = 4π²L / T² = 4π² × ${L} / ${T}² = <b>${fmt(g)} m/s²</b> (that’s ${p.n})`, scene: { kind: 'pendulum', L, lines: [`T = ${T} s`] } }); }
  const m = rstep(0.2, 3, 0.1), T = rstep(0.3, 2, 0.1), k = 4 * Math.PI * Math.PI * m / (T * T);
  return num({ prompt: `A <b>${m} kg</b> mass on a spring oscillates with a period of <b>${T} s</b>. What is the spring constant?`, unit: 'N/m', answer: k, hint: 'Rearrange T = 2π√(m/k) to get k = 4π²m / T².', solution: `k = 4π²m / T² = 4π² × ${m} / ${T}² = <b>${fmt(k)} N/m</b>`, scene: { kind: 'osc', A: 1, lines: [`T = ${T} s`] } });
};

GEN.waves = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('waves', t);
  if (t === 0) {
    const q = R();
    if (q < 0.4) { const f = rint(2, 50), lam = rstep(0.1, 5, 0.1); return num({ prompt: `Waves on a pond have a frequency of <b>${f} Hz</b> and a wavelength of <b>${lam} m</b>. How fast do they travel?`, unit: 'm/s', answer: f * lam, hint: 'v = fλ.', solution: `v = fλ = ${f} × ${lam} = <b>${fmt(f * lam)} m/s</b>`, scene: { kind: 'wave', lam: 2, A: 1, lines: [`f = ${f} Hz`, `λ = ${lam} m`] } }); }
    if (q < 0.75) { const f = pick([128, 256, 440, 512, 1000, 2000]); return num({ prompt: `A tuning fork makes a <b>${f} Hz</b> note in air (sound travels at 343 m/s). What is its wavelength?`, unit: 'm', answer: VS / f, hint: 'Rearrange v = fλ to get λ = v / f.', solution: `λ = v / f = 343 / ${f} = <b>${fmt(VS / f)} m</b>`, scene: { kind: 'wave', lam: 2, A: 1, lines: [`f = ${f} Hz`] } }); }
    const f = rint(2, 200);
    return num({ prompt: `A wave has a frequency of <b>${f} Hz</b>. What is its period?`, unit: 's', answer: 1 / f, hint: 'T = 1 / f.', solution: `T = 1 / ${f} = <b>${fmt(1 / f)} s</b>`, scene: { kind: 'wave', lam: 2, A: 1, lines: [`f = ${f} Hz`] } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.4) { const s = rstep(0.2, 4, 0.1), x = VS * s / 2; return num({ prompt: `You shout at a cliff and hear the echo <b>${s} s</b> later. How far away is the cliff? (Sound travels at 343 m/s.)`, unit: 'm', answer: x, hint: 'The sound goes there and back, so the distance is half of vt.', solution: `d = vt / 2 = 343 × ${s} / 2 = <b>${fmt(x)} m</b>`, scene: { kind: 'wave', lam: 2, A: 0.6, lines: [`t = ${s} s`] } }); }
    if (q < 0.7) { const f = rstep(4, 7.5, 0.1), lam = CL / (f * 1e14); return num({ prompt: `Light of frequency <b>${f} × 10¹⁴ Hz</b> travels through a vacuum. What is its wavelength? (Use e for powers of ten, e.g. 5.5e-7.)`, unit: 'm', answer: lam, hint: 'λ = c / f, with c = 3.00 × 10⁸ m/s.', solution: `λ = c / f = 3.00×10⁸ / ${f}×10¹⁴ = <b>${fmt(lam)} m</b> (${fmt(lam * 1e9, 0)} nm)`, scene: { kind: 'wave', lam: 1, A: 1, lines: [`f = ${f}×10¹⁴ Hz`] } }); }
    const f = rstep(88, 108, 0.1), lam = CL / (f * 1e6);
    return num({ prompt: `An FM radio station broadcasts at <b>${f} MHz</b>. What is the wavelength of its radio waves?`, unit: 'm', answer: lam, hint: 'Radio waves travel at the speed of light. 1 MHz = 10⁶ Hz.', solution: `λ = c / f = 3.00×10⁸ / ${f}×10⁶ = <b>${fmt(lam)} m</b>`, scene: { kind: 'wave', lam: 3, A: 1, lines: [`f = ${f} MHz`] } });
  }
  const q = R();
  if (q < 0.35) { const L = rstep(0.3, 1.2, 0.05), v = rint(100, 500), f = v / (2 * L); return num({ prompt: `Waves travel at <b>${v} m/s</b> along a guitar string <b>${L} m</b> long. What is the fundamental frequency?`, unit: 'Hz', answer: f, hint: 'The fundamental has λ = 2L. Then f = v / λ.', solution: `f₁ = v / 2L = ${v} / (2 × ${L}) = <b>${fmt(f)} Hz</b>`, scene: { kind: 'wave', standing: 1, A: 1, lines: [`L = ${L} m`] } }); }
  if (q < 0.7) { const L = rstep(0.3, 1.2, 0.05), v = rint(100, 500), n = rint(2, 5), f = n * v / (2 * L); return num({ prompt: `A string <b>${L} m</b> long carries waves at <b>${v} m/s</b>. What is the frequency of its harmonic number <b>${n}</b>?`, unit: 'Hz', answer: f, hint: 'fₙ = nv / 2L.', solution: `f${'₀₁₂₃₄₅'[n]} = ${n} × ${v} / (2 × ${L}) = <b>${fmt(f)} Hz</b>`, scene: { kind: 'wave', standing: n, A: 1, lines: [`n = ${n}`] } }); }
  const T = rint(20, 200), mu = rstep(0.001, 0.02, 0.001), v = Math.sqrt(T / mu);
  return num({ prompt: `A string under <b>${T} N</b> of tension has a mass per metre of <b>${mu} kg/m</b>. How fast do waves travel along it?`, unit: 'm/s', answer: v, hint: 'v = √(T / μ).', solution: `v = √(T/μ) = √(${T} / ${mu}) = <b>${fmt(v)} m/s</b>`, scene: { kind: 'wave', standing: 2, A: 1, lines: [`T = ${T} N`] } });
};

GEN.fluids = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('fluids', t);
  if (t === 0) {
    if (R() < 0.5) { const F = rint(100, 2000), A = rstep(0.01, 0.5, 0.01), P = F / A; return num({ prompt: `A <b>${F} N</b> crate rests on a base of area <b>${A} m²</b>. What pressure does it put on the floor?`, unit: 'Pa', answer: P, hint: 'P = F / A.', solution: `P = F / A = ${F} / ${A} = <b>${fmt(P)} Pa</b>`, scene: { kind: 'tank', h: 2, obj: null, lines: [`F = ${F} N`, `A = ${A} m²`] } }); }
    const h = rint(1, 50), P = RHO * G * h;
    return num({ prompt: `A diver is <b>${h} m</b> below the surface of fresh water. How much extra pressure does the water above put on them?`, unit: 'Pa', answer: P, hint: 'P = ρgh, with ρ = 1000 kg/m³ for water.', solution: `P = ρgh = 1000 × 9.8 × ${h} = <b>${fmt(P)} Pa</b>`, scene: { kind: 'tank', h, obj: 'diver', lines: [`h = ${h} m`] } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.35) { const F1 = rint(50, 500), A1 = rstep(0.005, 0.05, 0.005), A2 = rstep(0.2, 1, 0.05), F2 = F1 * A2 / A1; return num({ prompt: `In a hydraulic lift, a <b>${F1} N</b> force pushes a small piston of area <b>${A1} m²</b>. The large piston has an area of <b>${A2} m²</b>. What force does it lift?`, unit: 'N', answer: F2, hint: 'The pressure is the same on both pistons: F₁/A₁ = F₂/A₂.', solution: `F₂ = F₁ × A₂ / A₁ = ${F1} × ${A2} / ${A1} = <b>${fmt(F2)} N</b>`, scene: { kind: 'hydraulic', F1, A1, A2 } }); }
    if (q < 0.7) { const V = rstep(0.001, 0.05, 0.001), F = RHO * V * G; return num({ prompt: `A rock of volume <b>${V} m³</b> is fully under water. What buoyant force acts on it?`, unit: 'N', answer: F, hint: 'F_b = ρ_water V g: the weight of the water pushed aside.', solution: `F_b = 1000 × ${V} × 9.8 = <b>${fmt(F)} N</b>`, scene: { kind: 'tank', h: 3, obj: 'sink', lines: [`V = ${V} m³`] } }); }
    const h = rint(2, 60), P = PATM + RHO * G * h;
    return num({ prompt: `What is the absolute pressure <b>${h} m</b> below the surface of a lake? (Atmospheric pressure = 101 300 Pa.)`, unit: 'Pa', answer: P, hint: 'Absolute pressure = atmospheric pressure + ρgh.', solution: `P = 101 300 + 1000 × 9.8 × ${h} = <b>${fmt(P)} Pa</b>`, scene: { kind: 'tank', h, obj: 'diver', lines: [`h = ${h} m`] } });
  }
  const q = R();
  if (q < 0.33) { const rho = rint(30, 95) * 10, frac = rho / RHO * 100; return num({ prompt: `A block of wood with density <b>${rho} kg/m³</b> floats in fresh water. What percentage of its volume is under the surface?`, unit: '%', answer: frac, hint: 'A floating object displaces its own weight: fraction under = ρ_object / ρ_water.', solution: `fraction = ${rho} / 1000 = <b>${fmt(frac)}%</b>`, scene: { kind: 'tank', h: 2, obj: 'float', frac: rho / RHO, lines: [`ρ = ${rho} kg/m³`] } }); }
  if (q < 0.66) { const m = rstep(1, 20, 0.5), rho = rint(20, 80) * 100, V = m / rho, W = m * G - RHO * V * G; return num({ prompt: `A <b>${m} kg</b> metal block with density <b>${rho} kg/m³</b> hangs from a spring scale, fully under water. What does the scale read?`, unit: 'N', answer: W, hint: 'Find the volume V = m/ρ, then the buoyant force ρ_water V g. Scale reading = weight − buoyant force.', solution: `V = ${m} / ${rho} = ${fmt(V)} m³<br>F_b = 1000 × ${fmt(V)} × 9.8 = ${fmt(RHO * V * G)} N<br>reading = ${fmt(m * G)} − ${fmt(RHO * V * G)} = <b>${fmt(W)} N</b>`, scene: { kind: 'tank', h: 3, obj: 'sink', lines: [`m = ${m} kg`] } }); }
  const Wa = rint(20, 200), ratio = rstep(2, 11, 0.5), Ww = +(Wa * (1 - 1 / ratio)).toFixed(1), rho = Wa / (Wa - Ww) * RHO;
  return num({ prompt: `A crown weighs <b>${Wa} N</b> in air and <b>${Ww} N</b> when fully under water. What is its density?`, unit: 'kg/m³', answer: rho, hint: 'The weight lost equals the buoyant force ρ_water V g. Density = weight ÷ (weight lost) × ρ_water.', solution: `buoyant force = ${Wa} − ${Ww} = ${fmt(Wa - Ww)} N<br>ρ = ${Wa} / ${fmt(Wa - Ww)} × 1000 = <b>${fmt(rho)} kg/m³</b>`, scene: { kind: 'tank', h: 3, obj: 'sink', lines: ['Archimedes’ test'] } });
};

const MATS = [{ n: 'aluminium', c: 900 }, { n: 'iron', c: 450 }, { n: 'copper', c: 385 }];
GEN.thermal = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('thermal', t);
  if (t === 0) {
    if (R() < 0.4) { const T = rint(-50, 150); return num({ prompt: `What is <b>${T} °C</b> in kelvin?`, unit: 'K', answer: T + 273, hint: 'K = °C + 273.', solution: `${T} + 273 = <b>${T + 273} K</b>`, scene: { kind: 'thermo', T1: T, T2: T, lines: [`${T} °C`] } }); }
    const m = rstep(0.2, 5, 0.1), dT = rint(5, 80), Q = m * CW * dT;
    return num({ prompt: `How much energy heats <b>${m} kg</b> of water by <b>${dT} °C</b>? (c = 4180 J/kg·°C)`, unit: 'J', answer: Q, hint: 'Q = mcΔT.', solution: `Q = mcΔT = ${m} × 4180 × ${dT} = <b>${fmt(Q)} J</b>`, scene: { kind: 'thermo', T1: 20, T2: 20 + dT, lines: [`ΔT = ${dT} °C`] } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.25) { const m = rstep(0.5, 3, 0.1), T1 = rint(10, 30), Q = rint(20, 200) * 1000, T2 = T1 + Q / (m * CW); return num({ prompt: `<b>${fmt(Q)} J</b> of heat goes into <b>${m} kg</b> of water at <b>${T1} °C</b>. What is its final temperature?`, unit: '°C', answer: T2, hint: 'ΔT = Q / (mc). Add it to the starting temperature.', solution: `ΔT = ${fmt(Q)} / (${m} × 4180) = ${fmt(Q / (m * CW))} °C<br>T = ${T1} + ${fmt(Q / (m * CW))} = <b>${fmt(T2)} °C</b>`, scene: { kind: 'thermo', T1, T2, lines: [`Q = ${fmt(Q)} J`] } }); }
    if (q < 0.5) { const m = rstep(0.1, 3, 0.1), Q = m * LF; return num({ prompt: `How much energy melts <b>${m} kg</b> of ice already at 0 °C? (L_f = 3.34×10⁵ J/kg)`, unit: 'J', answer: Q, hint: 'Melting needs latent heat: Q = mL. The temperature doesn’t change.', solution: `Q = mL = ${m} × 334 000 = <b>${fmt(Q)} J</b>`, scene: { kind: 'thermo', T1: 0, T2: 0, ice: true, lines: ['melting at 0 °C'] } }); }
    if (q < 0.75) { const m = rstep(0.5, 2, 0.1), T1 = rint(10, 25), P = pick([1500, 2000, 2500, 3000]), s = m * CW * (100 - T1) / P; return num({ prompt: `A <b>${P} W</b> kettle heats <b>${m} kg</b> of water from <b>${T1} °C</b> to 100 °C. How many seconds does it take, assuming no heat is lost?`, unit: 's', answer: s, hint: 'Energy needed Q = mcΔT. Time = Q / P.', solution: `Q = ${m} × 4180 × ${100 - T1} = ${fmt(m * CW * (100 - T1))} J<br>t = Q / P = <b>${fmt(s)} s</b>`, scene: { kind: 'thermo', T1, T2: 100, lines: [`P = ${P} W`] } }); }
    const mat = pick(MATS), m = rstep(0.2, 3, 0.1), dT = rint(10, 200), Q = m * mat.c * dT;
    return num({ prompt: `How much energy heats a <b>${m} kg</b> block of ${mat.n} by <b>${dT} °C</b>? (c = ${mat.c} J/kg·°C)`, unit: 'J', answer: Q, hint: 'Q = mcΔT, using the specific heat of the metal.', solution: `Q = ${m} × ${mat.c} × ${dT} = <b>${fmt(Q)} J</b>`, scene: { kind: 'thermo', T1: 20, T2: 20 + dT, lines: [mat.n] } });
  }
  const q = R();
  if (q < 0.35) { const m1 = rstep(0.2, 2, 0.1), T1 = rint(60, 95), m2 = rstep(0.2, 2, 0.1), T2 = rint(5, 30), Tf = (m1 * T1 + m2 * T2) / (m1 + m2); return num({ prompt: `<b>${m1} kg</b> of water at <b>${T1} °C</b> is mixed with <b>${m2} kg</b> of water at <b>${T2} °C</b>. What is the final temperature, if no heat is lost?`, unit: '°C', answer: Tf, hint: 'Heat lost by the hot water = heat gained by the cold water. With the same c, it cancels: m₁(T₁ − T) = m₂(T − T₂).', solution: `T = (m₁T₁ + m₂T₂) / (m₁ + m₂) = (${m1}×${T1} + ${m2}×${T2}) / ${fmt(m1 + m2)} = <b>${fmt(Tf)} °C</b>`, scene: { kind: 'thermo', T1, T2: Tf, lines: ['mixing'] } }); }
  if (q < 0.7) { const m = rstep(0.1, 1, 0.1), T = rint(10, 60), Q = m * LF + m * CW * T; return num({ prompt: `How much energy turns <b>${m} kg</b> of ice at 0 °C into water at <b>${T} °C</b>? (L_f = 3.34×10⁵ J/kg, c = 4180 J/kg·°C)`, unit: 'J', answer: Q, hint: 'Two steps: melt it (Q = mL), then heat the water (Q = mcΔT). Add them.', solution: `melt: ${m} × 334 000 = ${fmt(m * LF)} J<br>heat: ${m} × 4180 × ${T} = ${fmt(m * CW * T)} J<br>total = <b>${fmt(Q)} J</b>`, scene: { kind: 'thermo', T1: 0, T2: T, ice: true, lines: ['melt, then heat'] } }); }
  const P1 = rint(100, 300), T1 = rint(5, 30), T2 = rint(60, 250), P2 = P1 * (T2 + 273) / (T1 + 273);
  return num({ prompt: `A sealed can holds gas at <b>${P1} kPa</b> and <b>${T1} °C</b>. It is heated to <b>${T2} °C</b>. What is the new pressure?`, unit: 'kPa', answer: P2, hint: 'At fixed volume P/T is constant, with T in kelvin.', solution: `T₁ = ${T1 + 273} K, T₂ = ${T2 + 273} K<br>P₂ = P₁ × T₂ / T₁ = ${P1} × ${T2 + 273} / ${T1 + 273} = <b>${fmt(P2)} kPa</b>`, scene: { kind: 'thermo', T1, T2, lines: ['sealed can'] } });
};

GEN.elec = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('elec', t);
  if (t === 0) {
    const q = R();
    if (q < 0.4) { const V = pick([1.5, 3, 4.5, 6, 9, 12, 24]), Rr = rint(2, 100), I = V / Rr; return num({ prompt: `A <b>${V} V</b> battery is connected across a <b>${Rr} Ω</b> resistor. What current flows?`, unit: 'A', answer: I, hint: 'Ohm’s law: I = V / R.', solution: `I = V / R = ${V} / ${Rr} = <b>${fmt(I)} A</b>`, scene: { kind: 'circuit', V, Rs: [Rr], mode: 'series' } }); }
    if (q < 0.7) { const I = rstep(0.1, 5, 0.1), s = rint(5, 300); return num({ prompt: `A current of <b>${I} A</b> flows for <b>${s} s</b>. How much charge passes?`, unit: 'C', answer: I * s, hint: 'Q = It.', solution: `Q = It = ${I} × ${s} = <b>${fmt(I * s)} C</b>`, scene: { kind: 'circuit', V: 6, Rs: [10], mode: 'series' } }); }
    const V = pick([3, 6, 9, 12, 24]), I = rstep(0.1, 3, 0.1);
    return num({ prompt: `A <b>${V} V</b> supply drives <b>${I} A</b> through a lamp. What is the lamp’s resistance?`, unit: 'Ω', answer: V / I, hint: 'R = V / I.', solution: `R = V / I = ${V} / ${I} = <b>${fmt(V / I)} Ω</b>`, scene: { kind: 'circuit', V, Rs: [V / I], mode: 'series' } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.35) { const V = pick([6, 9, 12, 24]), R1 = rint(2, 30), R2 = rint(2, 30), I = V / (R1 + R2); return num({ prompt: `A <b>${V} V</b> battery is connected to <b>${R1} Ω</b> and <b>${R2} Ω</b> resistors in series. What current flows?`, unit: 'A', answer: I, hint: 'In series, resistances add. Then I = V / R_total.', solution: `R = ${R1} + ${R2} = ${R1 + R2} Ω<br>I = ${V} / ${R1 + R2} = <b>${fmt(I)} A</b>`, scene: { kind: 'circuit', V, Rs: [R1, R2], mode: 'series' } }); }
    if (q < 0.65) { const V = pick([12, 120, 230]), Rr = rint(5, 200), P = V * V / Rr; return num({ prompt: `A heater with a resistance of <b>${Rr} Ω</b> runs on <b>${V} V</b>. What is its power?`, unit: 'W', answer: P, hint: 'P = V² / R.', solution: `P = V² / R = ${V}² / ${Rr} = <b>${fmt(P)} W</b>`, scene: { kind: 'circuit', V, Rs: [Rr], mode: 'series' } }); }
    const P = rint(5, 30) * 100, h = rstep(0.5, 8, 0.5), price = rstep(0.1, 0.4, 0.01), cost = P / 1000 * h * price;
    return num({ prompt: `A <b>${P} W</b> heater runs for <b>${h} hours</b>. Electricity costs <b>$${price.toFixed(2)} per kWh</b>. How much does it cost, in dollars?`, unit: '$', answer: cost, hint: 'Energy in kWh = power in kW × hours. Then multiply by the price.', solution: `E = ${P / 1000} kW × ${h} h = ${fmt(P / 1000 * h)} kWh<br>cost = ${fmt(P / 1000 * h)} × ${price.toFixed(2)} = <b>$${fmt(cost)}</b>`, scene: { kind: 'circuit', V: 230, Rs: [26], mode: 'series' } });
  }
  const q = R();
  if (q < 0.33) { const R1 = rint(2, 60), R2 = rint(2, 60), Rp = R1 * R2 / (R1 + R2); return num({ prompt: `What is the combined resistance of <b>${R1} Ω</b> and <b>${R2} Ω</b> resistors in parallel?`, unit: 'Ω', answer: Rp, hint: '1/R = 1/R₁ + 1/R₂. For two resistors, R = R₁R₂ / (R₁ + R₂).', solution: `R = R₁R₂ / (R₁ + R₂) = ${R1}×${R2} / ${R1 + R2} = <b>${fmt(Rp)} Ω</b>`, scene: { kind: 'circuit', V: 12, Rs: [R1, R2], mode: 'parallel' } }); }
  if (q < 0.66) { const V = pick([6, 9, 12, 24]), R1 = rint(2, 40), R2 = rint(2, 40), V2 = V * R2 / (R1 + R2); return num({ prompt: `<b>${R1} Ω</b> and <b>${R2} Ω</b> resistors are in series across <b>${V} V</b>. What is the voltage across the <b>${R2} Ω</b> resistor?`, unit: 'V', answer: V2, hint: 'Find the current from the total resistance, then V = IR for that resistor.', solution: `I = ${V} / ${R1 + R2} = ${fmt(V / (R1 + R2))} A<br>V₂ = I × ${R2} = <b>${fmt(V2)} V</b>`, scene: { kind: 'circuit', V, Rs: [R1, R2], mode: 'series' } }); }
  const V = pick([6, 9, 12, 24]), R1 = rint(2, 20), R2 = rint(4, 40), R3 = rint(4, 40), Rp = R2 * R3 / (R2 + R3), I = V / (R1 + Rp);
  return num({ prompt: `A <b>${R1} Ω</b> resistor is in series with a parallel pair of <b>${R2} Ω</b> and <b>${R3} Ω</b>, across <b>${V} V</b>. What current comes from the battery?`, unit: 'A', answer: I, hint: 'Combine the parallel pair first, add the series resistor, then use I = V / R.', solution: `parallel: ${R2}×${R3} / ${R2 + R3} = ${fmt(Rp)} Ω<br>total: ${R1} + ${fmt(Rp)} = ${fmt(R1 + Rp)} Ω<br>I = ${V} / ${fmt(R1 + Rp)} = <b>${fmt(I)} A</b>`, scene: { kind: 'circuit', V, Rs: [R1, R2, R3], mode: 'combo' } });
};

const MEDIA = [{ n: 'water', n1: 1.33 }, { n: 'glass', n1: 1.5 }, { n: 'diamond', n1: 2.42 }, { n: 'acrylic', n1: 1.49 }, { n: 'ice', n1: 1.31 }];
GEN.optics = d => {
  const t = tier(d);
  if (R() < 0.22) return mcFrom('optics', t);
  if (t === 0) {
    if (R() < 0.5) { const m = pick(MEDIA), v = CL / m.n1; return num({ prompt: `The refractive index of ${m.n} is <b>${m.n1}</b>. How fast does light travel in it? (c = 3.00×10⁸ m/s; use e for powers of ten, e.g. 2.0e8.)`, unit: 'm/s', answer: v, hint: 'n = c / v, so v = c / n.', solution: `v = c / n = 3.00×10⁸ / ${m.n1} = <b>${fmt(v)} m/s</b>`, scene: { kind: 'refract', n1: 1, n2: m.n1, th1: 35 } }); }
    const v = rstep(1.8, 2.3, 0.05), n = 3 / v;
    return num({ prompt: `Light travels at <b>${v} × 10⁸ m/s</b> in a plastic. What is the plastic’s refractive index?`, unit: '', answer: n, hint: 'n = c / v.', solution: `n = 3.00×10⁸ / ${v}×10⁸ = <b>${fmt(n)}</b>`, scene: { kind: 'refract', n1: 1, n2: n, th1: 35 } });
  }
  if (t === 1) {
    const q = R();
    if (q < 0.4) { const m = pick(MEDIA), th1 = rint(10, 70), th2 = deg(Math.asin(Math.sin(rad(th1)) / m.n1)); return num({ prompt: `Light passes from air into ${m.n} (<b>n = ${m.n1}</b>) at <b>${th1}°</b> to the normal. What is the angle of refraction?`, unit: '°', answer: th2, hint: 'Snell’s law: n₁ sinθ₁ = n₂ sinθ₂, with n = 1.00 for air.', solution: `sinθ₂ = sin${th1}° / ${m.n1} = ${fmt(Math.sin(rad(th1)) / m.n1, 3)}<br>θ₂ = <b>${fmt(th2, 1)}°</b>`, scene: { kind: 'refract', n1: 1, n2: m.n1, th1 } }); }
    if (q < 0.7) { const m = pick(MEDIA), c = deg(Math.asin(1 / m.n1)); return num({ prompt: `What is the critical angle for light going from ${m.n} (<b>n = ${m.n1}</b>) into air?`, unit: '°', answer: c, hint: 'sinθ_c = n₂ / n₁ = 1 / n.', solution: `θ_c = sin⁻¹(1 / ${m.n1}) = <b>${fmt(c, 1)}°</b>`, scene: { kind: 'refract', n1: m.n1, n2: 1, th1: c } }); }
    const th1 = rint(10, 38), th2 = deg(Math.asin(1.5 * Math.sin(rad(th1))));
    return num({ prompt: `Light inside a glass block (<b>n = 1.5</b>) hits the surface at <b>${th1}°</b> to the normal and passes into air. What angle does it leave at?`, unit: '°', answer: th2, hint: 'Snell’s law again: 1.5 sinθ₁ = 1.00 sinθ₂. It bends away from the normal.', solution: `sinθ₂ = 1.5 × sin${th1}° = ${fmt(1.5 * Math.sin(rad(th1)), 3)}<br>θ₂ = <b>${fmt(th2, 1)}°</b>`, scene: { kind: 'refract', n1: 1.5, n2: 1, th1 } });
  }
  const q = R(), f = rint(5, 30);
  if (q < 0.4) { const d0 = f + rint(2, 40), di = 1 / (1 / f - 1 / d0); return num({ prompt: `An object is <b>${d0} cm</b> from a converging lens of focal length <b>${f} cm</b>. How far from the lens is the image?`, unit: 'cm', answer: di, hint: '1/f = 1/d₀ + 1/dᵢ, so 1/dᵢ = 1/f − 1/d₀.', solution: `1/dᵢ = 1/${f} − 1/${d0} = ${fmt(1 / f - 1 / d0, 4)}<br>dᵢ = <b>${fmt(di)} cm</b> (real, upside down)`, scene: { kind: 'lens', f, d0 } }); }
  if (q < 0.7) { const d0 = f + rint(2, 40), di = 1 / (1 / f - 1 / d0), h0 = rint(2, 20), hi = h0 * di / d0; return num({ prompt: `A <b>${h0} cm</b> tall candle stands <b>${d0} cm</b> from a converging lens with <b>f = ${f} cm</b>. How tall is its image?`, unit: 'cm', answer: hi, hint: 'Find dᵢ from the lens equation, then image height = h₀ × dᵢ / d₀.', solution: `dᵢ = 1 / (1/${f} − 1/${d0}) = ${fmt(di)} cm<br>hᵢ = ${h0} × ${fmt(di)} / ${d0} = <b>${fmt(hi)} cm</b> (upside down)`, scene: { kind: 'lens', f, d0 } }); }
  const d0 = rint(2, f - 1), di = 1 / (1 / f - 1 / d0);
  return num({ prompt: `A magnifying glass has <b>f = ${f} cm</b>. An insect is <b>${d0} cm</b> away. What is the image distance? (Give a negative number for a virtual image.)`, unit: 'cm', answer: di, hint: 'Use 1/dᵢ = 1/f − 1/d₀. With d₀ < f the answer is negative.', solution: `1/dᵢ = 1/${f} − 1/${d0} = ${fmt(1 / f - 1 / d0, 4)}<br>dᵢ = <b>${fmt(di)} cm</b> (virtual, upright, magnified ×${fmt(-di / d0)})`, scene: { kind: 'lens', f, d0 } });
};
