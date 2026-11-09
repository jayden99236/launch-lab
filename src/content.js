/* ---------- constants & helpers ---------- */
const G = 9.8, GC = 6.67e-11, ME = 5.97e24, RE = 6.37e6, CL = 3e8, VS = 343, CW = 4180, LF = 3.34e5, LV = 2.26e6, RHO = 1000, PATM = 101300;
const $ = s => document.querySelector(s);
const R = Math.random;
const rint = (a, b) => Math.floor(a + R() * (b - a + 1));
const rstep = (a, b, s) => +(a + s * rint(0, Math.round((b - a) / s))).toFixed(6);
const pick = a => a[Math.floor(R() * a.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const tier = d => d < 3.5 ? 0 : d < 6.5 ? 1 : 2;
const TIER = ['Warm-up', 'Core', 'Challenge'];
const rad = d => d * Math.PI / 180;
const deg = r => r * 180 / Math.PI;
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
function sci(x, sig = 3) {
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = +(x / 10 ** e).toPrecision(sig);
  if (Math.abs(m) >= 10) { e++; m = +(x / 10 ** e).toPrecision(sig); }
  return `${m} × 10${String(e).replace(/./g, c => SUP[c])}`;
}
function fmt(x, dp = 2) {
  if (!isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e6 || a < 1e-3)) return sci(x);
  if (a !== 0 && a < 1) dp = Math.max(dp, 2 - Math.floor(Math.log10(a)));
  const r = Math.round(x * 10 ** dp) / 10 ** dp;
  return r.toLocaleString('en', { maximumFractionDigits: dp });
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- course structure ---------- */
const UNITS = [
  { id: 'u1', name: 'Motion and forces', desc: 'How things move and why.' },
  { id: 'u2', name: 'Circles, orbits and oscillations', desc: 'Motion that turns, swings and repeats.' },
  { id: 'u3', name: 'Matter and heat', desc: 'Fluids, pressure and thermal energy.' },
  { id: 'u4', name: 'Electricity and light', desc: 'Circuits, waves, rays and lenses.' },
];
const TOPICS = [
  { id: 'kin', unit: 'u1', req: [], name: 'Kinematics', sym: 'v = u + at', blurb: 'Speed, acceleration and stopping distances.' },
  { id: 'force', unit: 'u1', req: ['kin'], name: 'Forces', sym: 'F = ma', blurb: 'Newton’s laws, friction, ramps and pulleys.' },
  { id: 'energy', unit: 'u1', req: ['force'], name: 'Energy', sym: 'E = ½mv² + mgh', blurb: 'Work, kinetic and potential energy, power.' },
  { id: 'proj', unit: 'u1', req: ['kin'], name: 'Projectiles', sym: 'R = v² sin2θ / g', blurb: 'Cliffs, cannons and hitting targets.' },
  { id: 'mom', unit: 'u1', req: ['force'], name: 'Momentum', sym: 'p = mv', blurb: 'Collisions, impulse and conservation.' },
  { id: 'circ', unit: 'u2', req: ['proj', 'force'], name: 'Circular motion', sym: 'a = v² / r', blurb: 'Bends, loops and spinning discs.' },
  { id: 'grav', unit: 'u2', req: ['circ'], name: 'Gravitation', sym: 'F = Gm₁m₂ / r²', blurb: 'Planets, satellites and orbits.' },
  { id: 'shm', unit: 'u2', req: ['energy'], name: 'Oscillations', sym: 'T = 2π√(m/k)', blurb: 'Springs, pendulums and simple harmonic motion.' },
  { id: 'waves', unit: 'u2', req: ['energy'], name: 'Waves and sound', sym: 'v = fλ', blurb: 'Wavelength, echoes and vibrating strings.' },
  { id: 'fluids', unit: 'u3', req: ['force'], name: 'Pressure and fluids', sym: 'P = ρgh', blurb: 'Depth, hydraulics and buoyancy.' },
  { id: 'thermal', unit: 'u3', req: ['energy'], name: 'Heat and temperature', sym: 'Q = mcΔT', blurb: 'Heating, melting, mixing and gas laws.' },
  { id: 'elec', unit: 'u4', req: ['energy'], name: 'Circuits', sym: 'V = IR', blurb: 'Current, resistance, power and cost.' },
  { id: 'optics', unit: 'u4', req: ['waves'], name: 'Light and optics', sym: 'n₁sinθ₁ = n₂sinθ₂', blurb: 'Reflection, refraction and lenses.' },
];
const tname = id => TOPICS.find(t => t.id === id).name;

/* ---------- grade placement ----------
   Starting skill per station for a typical student at the end of each grade.
   Ratings: under 3.5 = warm-up problems, 3.5–6.5 = core, above 6.5 = challenge. 4 opens dependent stations.
   Order: kin, force, energy, proj, mom, circ, grav, shm, waves, fluids, thermal, elec, optics */
const GRADE_ORDER = ['kin', 'force', 'energy', 'proj', 'mom', 'circ', 'grav', 'shm', 'waves', 'fluids', 'thermal', 'elec', 'optics'];
const GRADES = [
  { g: 8, title: 'Grade 8', desc: 'Speed and distance, pushes and pulls, simple circuits, heat and light basics.', r: [4.0, 3.0, 2.5, 2.0, 1.5, 1.0, 1.0, 1.0, 2.0, 2.5, 2.5, 2.5, 1.5] },
  { g: 9, title: 'Grade 9', desc: 'Acceleration, Newton’s laws, kinetic and potential energy, Ohm’s law, v = fλ.', r: [4.5, 4.0, 3.5, 2.5, 2.5, 1.5, 1.5, 1.5, 3.0, 3.0, 3.0, 3.0, 2.0] },
  { g: 10, title: 'Grade 10', desc: 'Equations of motion, friction, energy conservation, momentum, pressure, Q = mcΔT, series and parallel.', r: [5.5, 5.0, 4.5, 4.0, 4.0, 2.5, 2.0, 2.5, 4.0, 4.5, 4.5, 4.5, 3.0] },
  { g: 11, title: 'Grade 11', desc: 'Projectiles, impulse, circular motion, oscillations, sound, gas laws, refraction and lenses.', r: [6.0, 5.5, 5.5, 5.0, 5.0, 4.0, 3.0, 4.0, 5.0, 5.0, 5.0, 5.0, 4.5] },
  { g: 12, title: 'Grade 12', desc: 'Gravitation and orbits, SHM in depth, standing waves, multi-step problems across every topic.', r: [6.5, 6.5, 6.0, 6.0, 6.0, 5.0, 4.5, 5.0, 5.5, 5.5, 5.5, 5.5, 5.0] },
];

/* ---------- lessons ----------
   Each: intro, sections [heading, html], eqs [formula, meaning], ex {q, steps}, traps [] */
const LESSONS = {
  kin: {
    intro: 'Kinematics describes motion without asking what causes it. Four ideas carry it: position, velocity, acceleration and time.',
    sections: [
      ['Distance and displacement, speed and velocity', 'Distance is how far you travel along the path. Displacement is the straight-line change in position, and it has a direction. Speed is distance per unit time; velocity is displacement per unit time, with a direction. One lap of a 400 m track is 400 m of distance but zero displacement.'],
      ['Acceleration', 'Acceleration is the rate of change of velocity: <i class="v">a = Δv / Δt</i>, in m/s². A car going from 0 to 20 m/s in 5 s accelerates at 4 m/s². Slowing down is acceleration too. It points against the motion, so it gets a negative sign.'],
      ['The equations of motion', 'When acceleration is constant, five quantities are linked: <i class="v">s</i> (displacement), <i class="v">u</i> (initial velocity), <i class="v">v</i> (final velocity), <i class="v">a</i> and <i class="v">t</i>. Each equation leaves one of them out. List what you know and what you need, then pick the equation that skips the one you don’t have.'],
      ['Reading motion graphs', 'On a position–time graph, the slope is velocity. On a velocity–time graph, the slope is acceleration and the area under the line is displacement. A straight sloped line on a v–t graph means constant acceleration.'],
      ['Free fall', 'Anything falling freely near Earth accelerates downward at <i class="v">g = 9.8 m/s²</i>, whatever its mass, as long as air resistance is small. A dropped stone is 4.9 m below its start after 1 s and 19.6 m after 2 s.'],
    ],
    eqs: [['v = u + at', 'leaves out s'], ['s = ut + ½at²', 'leaves out v'], ['v² = u² + 2as', 'leaves out t'], ['s = ½(u + v)t', 'leaves out a'], ['speed = distance / time', 'any motion, on average'], ['km/h ÷ 3.6 = m/s', 'unit conversion']],
    ex: { q: 'A cyclist at 4 m/s accelerates at 1.5 m/s² for 6 s. How far do they go?', steps: ['Known: u = 4 m/s, a = 1.5 m/s², t = 6 s. Unknown: s. v is not needed.', 'Choose the equation without v: s = ut + ½at².', 's = 4 × 6 + ½ × 1.5 × 6² = 24 + 27 = 51 m.'] },
    traps: ['Mixing units: convert km/h to m/s by dividing by 3.6.', 'Forgetting that slowing down means a negative acceleration.', 'Using these equations when the acceleration is not constant.'],
  },
  force: {
    intro: 'Forces explain why motion changes. Newton’s three laws are the whole toolkit.',
    sections: [
      ['Newton’s first law', 'An object keeps its velocity, including staying at rest, unless a net force acts on it. Constant velocity means the forces are balanced, not that there are no forces.'],
      ['Newton’s second law', 'The net force equals mass times acceleration: <i class="v">F_net = ma</i>. Add up all the forces first, with forces in opposite directions subtracting, then divide by the mass. One newton accelerates 1 kg at 1 m/s².'],
      ['Newton’s third law', 'If A pushes B, B pushes A equally hard in the opposite direction. The two forces act on different objects, so they never cancel each other.'],
      ['Forces you will meet', 'Weight <i class="v">W = mg</i> pulls down. The normal force <i class="v">N</i> pushes out of a surface. Friction <i class="v">f = μN</i> opposes sliding. Tension pulls along a string. On a slope tilted at θ, weight splits into <i class="v">mg sinθ</i> along the slope and <i class="v">mg cosθ</i> into it.'],
      ['Free-body diagrams', 'Draw the object as a box and every force on it as an arrow. Choose a positive direction. Then write ΣF = ma along each direction separately. For connected objects, like two masses over a pulley, you can treat them as one system.'],
    ],
    eqs: [['F_net = ma', 'Newton’s second law'], ['W = mg', 'weight'], ['f = μN', 'sliding friction'], ['a = g(sinθ − μcosθ)', 'block sliding down a slope'], ['a = (m₁ − m₂)g / (m₁ + m₂)', 'two masses over a pulley'], ['T = 2m₁m₂g / (m₁ + m₂)', 'string tension over a pulley']],
    ex: { q: 'A 10 kg box is pushed with 60 N across a floor where μ = 0.3. Find its acceleration.', steps: ['Weight: mg = 10 × 9.8 = 98 N, so N = 98 N on a flat floor.', 'Friction: f = μN = 0.3 × 98 = 29.4 N, opposing the push.', 'Net force: 60 − 29.4 = 30.6 N, so a = 30.6 / 10 = 3.06 m/s².'] },
    traps: ['Putting the applied force instead of the net force into F = ma.', 'Treating mass (kg) and weight (N) as the same thing.', 'Thinking a moving object needs a force to keep moving.'],
  },
  energy: {
    intro: 'Energy is the bookkeeping of physics. It changes form but the total stays the same, which often gives a shortcut past forces and times.',
    sections: [
      ['Work', 'A force does work when it moves something along its own direction: <i class="v">W = Fd</i>, in joules. Carrying a bag along a level corridor at steady speed does no work against gravity, because the movement is sideways to the weight.'],
      ['Kinetic and potential energy', 'A moving object has kinetic energy <i class="v">½mv²</i>. Raising it by <i class="v">h</i> stores gravitational potential energy <i class="v">mgh</i>. A spring compressed or stretched by <i class="v">x</i> stores <i class="v">½kx²</i>.'],
      ['Conservation of energy', 'With no friction, kinetic plus potential energy stays constant: potential energy lost becomes kinetic energy gained. With friction, the work done against friction goes on the “energy out” side and ends up as heat.'],
      ['Power and efficiency', 'Power is how fast energy is transferred: <i class="v">P = W / t</i>, in watts (J/s). Efficiency is useful energy out divided by total energy in, usually given as a percentage.'],
    ],
    eqs: [['W = Fd', 'work done by a force along the motion'], ['KE = ½mv²', 'kinetic energy'], ['GPE = mgh', 'gravitational potential energy'], ['E = ½kx²', 'energy in a spring'], ['P = W / t', 'power'], ['efficiency = useful out / total in', 'as a fraction or %']],
    ex: { q: 'A 2 kg ball is dropped from 5 m. How fast is it going when it lands?', steps: ['At the top: GPE = mgh = 2 × 9.8 × 5 = 98 J, and KE = 0.', 'At the bottom all 98 J is kinetic: ½ × 2 × v² = 98.', 'v² = 98, so v = 9.9 m/s. The mass cancels, so anything dropped from 5 m lands at 9.9 m/s.'] },
    traps: ['Forgetting to square v in the kinetic energy.', 'Using the length of a slope instead of its vertical height.', 'Mixing up power (watts) and energy (joules).'],
  },
  proj: {
    intro: 'A projectile is anything flying freely under gravity alone. The key is to split its motion into two parts that don’t affect each other.',
    sections: [
      ['Horizontal and vertical are independent', 'Horizontally there is no force (ignoring air), so the horizontal velocity stays constant: <i class="v">x = v_x t</i>. Vertically there is a constant downward acceleration g, so the equations of motion apply. Time is the only thing the two parts share.'],
      ['Resolving the launch velocity', 'A launch at speed <i class="v">v</i> and angle <i class="v">θ</i> above horizontal has <i class="v">v_x = v cosθ</i> and <i class="v">v_y = v sinθ</i>. Set your calculator to degrees.'],
      ['Results on level ground', 'Time of flight is <i class="v">2v sinθ / g</i>. Maximum height is <i class="v">(v sinθ)² / 2g</i>. Range is <i class="v">v² sin2θ / g</i>, largest at 45°. Angles that add up to 90°, such as 30° and 60°, give the same range.'],
      ['Launching from a height', 'If the projectile starts h above where it lands, the level-ground formulas don’t apply. Solve the vertical equation <i class="v">−h = v_y t − ½gt²</i> for t, then use <i class="v">x = v_x t</i>. To hit a target at height y, use the trajectory equation.'],
    ],
    eqs: [['v_x = v cosθ, v_y = v sinθ', 'resolve the launch'], ['x = v_x t', 'horizontal: constant speed'], ['y = v_y t − ½gt²', 'vertical'], ['R = v² sin2θ / g', 'range on level ground'], ['H = (v sinθ)² / 2g', 'maximum height'], ['y = x tanθ − gx² / (2v²cos²θ)', 'trajectory equation']],
    ex: { q: 'A ball rolls off a 20 m cliff at 8 m/s. How far out does it land?', steps: ['Vertical: it starts with v_y = 0, so 20 = ½ × 9.8 × t² and t = √(40 / 9.8) = 2.02 s.', 'Horizontal: x = v_x t = 8 × 2.02 = 16.2 m.'] },
    traps: ['Using the full speed v where v_x or v_y belongs.', 'Leaving the calculator in radians.', 'Thinking a faster horizontal speed makes something fall more slowly.'],
  },
  mom: {
    intro: 'Momentum measures how hard something is to stop. In collisions it is the quantity that never changes.',
    sections: [
      ['Momentum', 'Momentum is <i class="v">p = mv</i>, in kg·m/s. It is a vector, so give opposite directions opposite signs.'],
      ['Conservation of momentum', 'When no outside force acts on a group of objects, their total momentum before equals their total momentum after. This holds for every collision and every explosion.'],
      ['Elastic and inelastic collisions', 'In an elastic collision kinetic energy is also conserved and the objects bounce cleanly. In an inelastic one some kinetic energy becomes heat and sound. In a perfectly inelastic collision the objects stick and move off together.'],
      ['Impulse', 'A force acting for a time changes momentum: <i class="v">FΔt = Δp</i>. The same change in momentum spread over a longer time needs a smaller force. Crumple zones, airbags and bending your knees on landing all work this way.'],
    ],
    eqs: [['p = mv', 'momentum'], ['m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂', 'conservation'], ['v = (m₁u₁ + m₂u₂) / (m₁ + m₂)', 'objects that stick together'], ['FΔt = Δp', 'impulse'], ['v₁′ = (m₁ − m₂)u₁ / (m₁ + m₂)', 'elastic, target at rest'], ['v₂′ = 2m₁u₁ / (m₁ + m₂)', 'elastic, target at rest']],
    ex: { q: 'A 3 kg cart at 4 m/s hits and sticks to a 1 kg cart at rest. How fast do they move?', steps: ['Momentum before: 3 × 4 + 1 × 0 = 12 kg·m/s.', 'Afterwards they move together with mass 4 kg, so 4v = 12.', 'v = 3 m/s.'] },
    traps: ['Forgetting the negative sign for something moving the other way.', 'Assuming kinetic energy is conserved in every collision.', 'For a bounce, the change in velocity is v + v′, not v − v′.'],
  },
  circ: {
    intro: 'Anything moving in a circle is accelerating, even at a steady speed, because its direction keeps changing.',
    sections: [
      ['Describing circular motion', 'The period <i class="v">T</i> is the time for one lap, and frequency <i class="v">f = 1/T</i>. Speed is <i class="v">v = 2πr / T</i>. Angular velocity <i class="v">ω = 2π / T</i> is measured in radians per second, and <i class="v">v = ωr</i>. To convert rpm, multiply by 2π/60.'],
      ['Centripetal acceleration', 'The velocity always points along the circle, but the acceleration points to the centre: <i class="v">a = v² / r = ω²r</i>.'],
      ['Centripetal force is a job, not a new force', 'Some real force must pull inward with <i class="v">F = mv² / r</i>: string tension for a whirled stone, friction for a car on a bend, gravity for the Moon. If that force disappears, the object carries on in a straight line along the tangent. Nothing throws it outward.'],
      ['Vertical circles and hills', 'At the top of a loop, gravity helps pull inward, so the slowest speed that keeps the cart on the track is <i class="v">v = √(gr)</i>. At the bottom, the string or track must supply <i class="v">mg + mv²/r</i>. Driving over a hump, the road pushes up with only <i class="v">m(g − v²/r)</i>, which is why you feel light.'],
    ],
    eqs: [['v = 2πr / T', 'speed from period'], ['ω = 2π / T = 2πf', 'angular velocity'], ['a = v² / r = ω²r', 'centripetal acceleration'], ['F = mv² / r', 'inward force needed'], ['v_max = √(μgr)', 'flat bend, friction limit'], ['v_min = √(gr)', 'top of a vertical loop']],
    ex: { q: 'A 0.5 kg ball on a 1.2 m string goes round a horizontal circle at 4 m/s. Find the tension.', steps: ['The tension provides the centripetal force: T = mv² / r.', 'T = 0.5 × 4² / 1.2 = 6.67 N.'] },
    traps: ['Drawing a “centrifugal force” outward on a free-body diagram.', 'Using the diameter instead of the radius.', 'Forgetting to convert rpm to rad/s.'],
  },
  grav: {
    intro: 'Every mass attracts every other mass. The same law that drops an apple keeps the planets in orbit.',
    sections: [
      ['Newton’s law of gravitation', '<i class="v">F = Gm₁m₂ / r²</i>, with <i class="v">G = 6.67 × 10⁻¹¹ N·m²/kg²</i>. Here r is the distance between the centres. It is an inverse-square law: double the distance and the force falls to a quarter.'],
      ['Field strength', 'Near a planet of mass M, <i class="v">g = GM / r²</i>. At Earth’s surface (r = 6.37 × 10⁶ m) that gives 9.8 m/s². At the space station, 400 km up, g is still about 8.7 m/s².'],
      ['Orbits', 'In a circular orbit, gravity supplies the centripetal force: <i class="v">GMm / r² = mv² / r</i>, so <i class="v">v = √(GM / r)</i>. Lower orbits are faster, and the satellite’s own mass cancels out.'],
      ['Kepler’s third law and weightlessness', '<i class="v">T² ∝ r³</i>: a planet 4 times farther from its star takes 8 times as long to go round. Astronauts feel weightless because they and their spacecraft are falling around Earth together, not because gravity has gone.'],
    ],
    eqs: [['F = Gm₁m₂ / r²', 'gravitational force'], ['g = GM / r²', 'field strength'], ['v = √(GM / r)', 'circular orbit speed'], ['T = 2πr / v', 'orbital period'], ['T² ∝ r³', 'Kepler’s third law'], ['G = 6.67×10⁻¹¹; M_E = 5.97×10²⁴ kg; R_E = 6.37×10⁶ m', 'constants']],
    ex: { q: 'Find g at 1000 km above Earth’s surface.', steps: ['r = R_E + h = 6.37×10⁶ + 1.00×10⁶ = 7.37×10⁶ m.', 'g = GM / r² = 6.67×10⁻¹¹ × 5.97×10²⁴ / (7.37×10⁶)² = 7.33 m/s².'] },
    traps: ['Measuring r from the surface instead of the centre.', 'Forgetting to square r.', 'Believing there is no gravity in orbit.'],
  },
  shm: {
    intro: 'Springs, pendulums, guitar strings and atoms in a crystal all oscillate the same way when the restoring force grows with displacement.',
    sections: [
      ['Restoring force', 'A spring pulls back with <i class="v">F = −kx</i>: the further you stretch it, the harder it pulls, always toward the middle. Motion under a force like this is called simple harmonic motion (SHM).'],
      ['Period and frequency', 'The period <i class="v">T</i> is the time for one full cycle, and <i class="v">f = 1/T</i> in hertz. For a mass on a spring, <i class="v">T = 2π√(m/k)</i>. For a simple pendulum, <i class="v">T = 2π√(L/g)</i>.'],
      ['What the period does not depend on', 'In SHM the period does not depend on amplitude: a bigger swing just moves faster. A pendulum’s period does not depend on the bob’s mass either, only on its length and g. That is why pendulum clocks keep time.'],
      ['Speed and energy', 'The object moves fastest through the middle and stops for an instant at each end. With <i class="v">ω = 2π / T</i>, the maximum speed is <i class="v">Aω</i> and the maximum acceleration is <i class="v">Aω²</i>. Energy swaps between kinetic and potential while the total stays <i class="v">½kA²</i>.'],
    ],
    eqs: [['F = −kx', 'restoring force (Hooke’s law)'], ['f = 1 / T', 'frequency'], ['T = 2π√(m / k)', 'mass on a spring'], ['T = 2π√(L / g)', 'simple pendulum'], ['ω = 2π / T', 'angular frequency'], ['v_max = Aω, a_max = Aω²', 'peak speed and acceleration']],
    ex: { q: 'How long must a pendulum be to have a period of 2.0 s?', steps: ['Rearrange T = 2π√(L/g) to L = g(T / 2π)².', 'L = 9.8 × (2.0 / 6.283)² = 0.993 m.'] },
    traps: ['Putting the bob’s mass into the pendulum formula.', 'Mixing up frequency f and angular frequency ω.', 'Thinking a bigger swing takes longer.'],
  },
  waves: {
    intro: 'A wave carries energy from place to place without carrying the material along with it.',
    sections: [
      ['Transverse and longitudinal', 'In a transverse wave (light, ripples, a shaken rope) the medium vibrates across the direction of travel. In a longitudinal wave (sound) it vibrates back and forth along it, making compressions and rarefactions.'],
      ['Describing a wave', 'Wavelength <i class="v">λ</i> is the distance between neighbouring crests. Amplitude is the largest displacement from rest. Frequency <i class="v">f</i> is how many waves pass each second, and the period is <i class="v">T = 1/f</i>.'],
      ['The wave equation', '<i class="v">v = fλ</i>. The medium sets the speed: about 343 m/s for sound in air, 1500 m/s in water, 3.00 × 10⁸ m/s for light in a vacuum. Changing the frequency changes the wavelength, not the speed.'],
      ['Echoes and vibrating strings', 'An echo travels there and back, so the distance is <i class="v">vt / 2</i>. A string fixed at both ends vibrates in standing waves with <i class="v">λ = 2L / n</i>, so its harmonics are <i class="v">fₙ = nv / 2L</i>. Waves on a string travel at <i class="v">v = √(T/μ)</i>, where μ is the mass per metre.'],
    ],
    eqs: [['v = fλ', 'wave equation'], ['T = 1 / f', 'period'], ['d = vt / 2', 'echo distance'], ['fₙ = nv / 2L', 'harmonics of a string'], ['v = √(T / μ)', 'wave speed on a string'], ['c = 3.00×10⁸ m/s; sound ≈ 343 m/s', 'speeds to remember']],
    ex: { q: 'A 440 Hz note travels through air. What is its wavelength?', steps: ['λ = v / f = 343 / 440 = 0.780 m.'] },
    traps: ['Forgetting to halve the echo time.', 'Thinking a higher frequency travels faster.', 'Confusing amplitude (loudness) with frequency (pitch).'],
  },
  fluids: {
    intro: 'Fluids push on everything they touch. That push explains dams, hydraulic brakes and why ships float.',
    sections: [
      ['Pressure', 'Pressure is force per unit area: <i class="v">P = F / A</i>, in pascals (1 Pa = 1 N/m²). The same force on a smaller area gives more pressure, which is why knives cut and snowshoes don’t sink.'],
      ['Pressure in a liquid', 'At depth h, the liquid above adds pressure <i class="v">ρgh</i>. It depends only on depth and density, not on the shape of the container. Water (ρ = 1000 kg/m³) adds about one atmosphere every 10 m. Absolute pressure is atmospheric pressure (101 kPa) plus ρgh.'],
      ['Pascal’s principle', 'Pressure applied to a trapped fluid spreads equally everywhere. In a hydraulic press, <i class="v">F₁/A₁ = F₂/A₂</i>, so a small force on a small piston can lift a car on a large piston. The small piston has to move much further.'],
      ['Archimedes’ principle', 'A fluid pushes up on an object with a buoyant force equal to the weight of fluid it displaces: <i class="v">F_b = ρ_fluid V g</i>. A floating object sinks until it displaces its own weight, so the fraction under the surface is <i class="v">ρ_object / ρ_fluid</i>.'],
    ],
    eqs: [['P = F / A', 'pressure'], ['P = ρgh', 'extra pressure at depth h'], ['P_abs = P_atm + ρgh', 'absolute pressure (P_atm = 101 300 Pa)'], ['F₁/A₁ = F₂/A₂', 'hydraulics'], ['F_b = ρ_fluid V g', 'buoyant force'], ['fraction under = ρ_obj / ρ_fluid', 'floating objects']],
    ex: { q: 'A 0.002 m³ stone weighs 54 N in air. What does it seem to weigh under water?', steps: ['Buoyant force = 1000 × 0.002 × 9.8 = 19.6 N.', 'Apparent weight = 54 − 19.6 = 34.4 N.'] },
    traps: ['Using the container’s width instead of the depth.', 'Leaving out atmospheric pressure when the absolute pressure is asked.', 'Using the object’s density in the buoyancy formula.'],
  },
  thermal: {
    intro: 'Temperature tells you how hot something is. Heat is energy that flows because of a temperature difference.',
    sections: [
      ['Temperature scales', 'The Kelvin scale starts at absolute zero: <i class="v">K = °C + 273</i>. A change of 1 °C is the same as a change of 1 K. Gas-law calculations must use kelvin.'],
      ['Specific heat capacity', '<i class="v">Q = mcΔT</i>: the energy needed depends on the mass, the material and the temperature change. Water’s <i class="v">c = 4180 J/(kg·°C)</i> is unusually high, which is why seas warm slowly. Aluminium is 900, iron 450 and copper 385.'],
      ['Changes of state', 'Melting and boiling need energy without changing the temperature: <i class="v">Q = mL</i>. For water, melting takes <i class="v">L_f = 3.34 × 10⁵ J/kg</i> and boiling takes <i class="v">L_v = 2.26 × 10⁶ J/kg</i>.'],
      ['Mixing and heat transfer', 'When hot and cold things mix, the heat lost by one equals the heat gained by the other until they reach the same temperature. Heat moves by conduction (contact), convection (fluid flow) and radiation (infrared).'],
      ['Gas laws', 'For a fixed amount of gas, <i class="v">PV/T</i> stays constant, with T in kelvin. Heat a sealed can and its pressure rises in proportion to its absolute temperature.'],
    ],
    eqs: [['K = °C + 273', 'temperature conversion'], ['Q = mcΔT', 'heating without a change of state'], ['Q = mL', 'melting or boiling'], ['m₁(T₁ − T) = m₂(T − T₂)', 'mixing water'], ['P₁V₁/T₁ = P₂V₂/T₂', 'gas law (kelvin)'], ['c_water = 4180 J/(kg·°C)', 'constant']],
    ex: { q: 'How much energy heats 2 kg of water from 20 °C to 100 °C?', steps: ['ΔT = 100 − 20 = 80 °C.', 'Q = mcΔT = 2 × 4180 × 80 = 668 800 J, about 669 kJ.'] },
    traps: ['Using °C in gas-law ratios.', 'Forgetting the latent heat when ice melts.', 'Treating heat and temperature as the same thing.'],
  },
  elec: {
    intro: 'Circuits carry energy from a battery to whatever is plugged in. Three quantities do all the work: current, voltage and resistance.',
    sections: [
      ['Charge and current', 'Current is the rate of flow of charge: <i class="v">I = Q / t</i>, in amperes. One amp is one coulomb of charge passing a point each second.'],
      ['Voltage and resistance', 'Voltage (potential difference) is the energy given to each coulomb, in volts. Resistance opposes the current, in ohms. Ohm’s law links them: <i class="v">V = IR</i>.'],
      ['Series circuits', 'Components in a single loop carry the same current. Resistances add: <i class="v">R = R₁ + R₂ + …</i>. The battery voltage is shared out in proportion to each resistance.'],
      ['Parallel circuits', 'Each branch gets the full battery voltage, and the branch currents add up. The combined resistance is less than the smallest branch: <i class="v">1/R = 1/R₁ + 1/R₂ + …</i>. Homes are wired in parallel.'],
      ['Power and energy', '<i class="v">P = VI = I²R = V²/R</i>, in watts. Energy is <i class="v">E = Pt</i>. Bills use kilowatt-hours: a 2 kW heater running for 3 h uses 6 kWh.'],
    ],
    eqs: [['I = Q / t', 'current'], ['V = IR', 'Ohm’s law'], ['R = R₁ + R₂', 'series'], ['1/R = 1/R₁ + 1/R₂', 'parallel'], ['P = VI = I²R = V²/R', 'power'], ['E = Pt', 'energy (J, or kWh with kW and h)']],
    ex: { q: 'A 12 V battery drives current through 4 Ω and 8 Ω resistors in series. Find the current and the voltage across the 8 Ω resistor.', steps: ['Total resistance: 4 + 8 = 12 Ω.', 'Current: I = V / R = 12 / 12 = 1 A.', 'Voltage across 8 Ω: V = IR = 1 × 8 = 8 V.'] },
    traps: ['Adding parallel resistances as if they were in series.', 'Forgetting to flip 1/R at the end.', 'Mixing watts and kilowatts when working out energy costs.'],
  },
  optics: {
    intro: 'Light travels in straight lines until it meets a surface. Then it reflects, refracts, or both.',
    sections: [
      ['Reflection', 'The angle of incidence equals the angle of reflection. Both are measured from the normal, the line at 90° to the surface. A flat mirror makes an upright, virtual image as far behind the mirror as the object is in front.'],
      ['Refraction', 'Light slows down inside materials. The refractive index is <i class="v">n = c / v</i>: about 1.33 for water and 1.5 for glass. Going into a slower material, light bends toward the normal. Snell’s law gives the angle: <i class="v">n₁ sinθ₁ = n₂ sinθ₂</i>.'],
      ['Total internal reflection', 'Going from a higher n to a lower n, light hitting the surface beyond the critical angle reflects completely: <i class="v">sinθ_c = n₂ / n₁</i>. Optical fibres and the sparkle of diamonds depend on it.'],
      ['Lenses', 'A converging lens of focal length f forms an image at distance dᵢ given by <i class="v">1/f = 1/d₀ + 1/dᵢ</i>. A positive dᵢ means a real, upside-down image on the far side. A negative dᵢ means a virtual image on the same side, as in a magnifying glass. Magnification is <i class="v">m = −dᵢ / d₀</i>.'],
    ],
    eqs: [['θᵢ = θᵣ', 'law of reflection'], ['n = c / v', 'refractive index'], ['n₁ sinθ₁ = n₂ sinθ₂', 'Snell’s law'], ['sinθ_c = n₂ / n₁', 'critical angle'], ['1/f = 1/d₀ + 1/dᵢ', 'thin lens'], ['m = −dᵢ / d₀ = hᵢ / h₀', 'magnification']],
    ex: { q: 'Light enters glass (n = 1.5) from air at 40° to the normal. Find the refracted angle.', steps: ['1.00 × sin40° = 1.5 × sinθ₂.', 'sinθ₂ = 0.643 / 1.5 = 0.429, so θ₂ = 25.4°.'] },
    traps: ['Measuring angles from the surface instead of the normal.', 'Expecting total internal reflection when light enters a denser material.', 'Sign mistakes in the lens equation.'],
  },
};

/* ---------- concept questions (first option is correct; t = tier) ---------- */
const MC = {
  kin: [
    { t: 0, q: 'A velocity–time graph is a flat horizontal line above zero. What is the object doing?', o: ['Moving at a constant velocity', 'Standing still', 'Speeding up steadily', 'Slowing down'], h: 'Velocity is on the vertical axis. Is it changing?', w: 'The velocity never changes, so the object moves at a constant, non-zero velocity. Acceleration is zero.' },
    { t: 0, q: 'Which of these is a vector quantity?', o: ['Velocity', 'Speed', 'Distance', 'Time'], h: 'A vector has both a size and a direction.', w: 'Velocity includes a direction (5 m/s east). Speed, distance and time only have a size.' },
    { t: 0, q: 'A car travels at 90 km/h. What is that in m/s?', o: ['25 m/s', '90 m/s', '324 m/s', '9 m/s'], h: 'Divide km/h by 3.6.', w: '90 km/h = 90 000 m ÷ 3600 s = 25 m/s.' },
    { t: 1, q: 'The slope of a velocity–time graph gives the…', o: ['Acceleration', 'Displacement', 'Average speed', 'Distance travelled'], h: 'Slope = change in the vertical quantity ÷ change in time.', w: 'Slope = Δv / Δt, which is the definition of acceleration.' },
    { t: 1, q: 'A ball is thrown straight up. At the very top of its flight, its acceleration is…', o: ['9.8 m/s² downward', 'Zero', '9.8 m/s² upward', 'Briefly undefined'], h: 'Gravity doesn’t switch off when the ball pauses.', w: 'Velocity is zero for an instant, but gravity still acts, so acceleration stays 9.8 m/s² downward the whole flight.' },
    { t: 1, q: 'Which velocity–time graph shows constant acceleration?', o: ['A straight line sloping upward', 'A flat line', 'A curve that gets steeper', 'A vertical line'], h: 'Acceleration is the slope. Constant acceleration means constant slope.', w: 'A straight sloped line has the same slope everywhere, so the acceleration is constant.' },
    { t: 2, q: 'The area under a velocity–time graph gives the…', o: ['Displacement', 'Acceleration', 'Jerk', 'Force'], h: 'Area = velocity × time. What does that product measure?', w: 'Velocity × time has units of metres, so the area is the displacement.' },
    { t: 2, q: 'With the same braking deceleration, doubling a car’s speed multiplies its stopping distance by…', o: ['4', '2', '√2', '8'], h: 'Stopping distance s = u² / (2a).', w: 's ∝ u², so doubling u gives 2² = 4 times the distance.' },
    { t: 2, q: 'Two stones are dropped from a tower one second apart. While both are falling, the gap between them…', o: ['Grows', 'Stays the same', 'Shrinks', 'Grows, then shrinks'], h: 'The first stone is always 9.8 m/s faster than the second.', w: 'The first stone always has a 9.8 m/s head start in speed, so it pulls further ahead every moment.' },
  ],
  force: [
    { t: 0, q: 'A book rests on a table. The net force on the book is…', o: ['Zero', 'Equal to its weight, downward', 'Equal to its weight, upward', 'Twice its weight'], h: 'It isn’t accelerating.', w: 'No acceleration means F_net = ma = 0. The table’s normal force balances the weight.' },
    { t: 0, q: 'The two forces in a Newton’s third law pair act on…', o: ['Different objects', 'The same object', 'Only moving objects', 'Only objects in contact'], h: 'Think of you pushing a wall and the wall pushing you.', w: 'Action–reaction pairs always act on two different objects, which is why they never cancel out.' },
    { t: 0, q: 'The SI unit of force is the…', o: ['Newton', 'Joule', 'Watt', 'Kilogram'], h: '1 kg × 1 m/s².', w: 'One newton accelerates one kilogram at one metre per second squared.' },
    { t: 1, q: 'A puck slides across frictionless ice at constant velocity. What net force acts on it?', o: ['None', 'A forward force equal to its momentum', 'A small forward force', 'Its weight'], h: 'Constant velocity means zero acceleration.', w: 'Newton’s first law: no net force is needed to keep moving at constant velocity.' },
    { t: 1, q: 'You double the net force on a cart and halve its mass. Its acceleration becomes…', o: ['4 times larger', '2 times larger', 'Unchanged', 'Half as large'], h: 'a = F / m.', w: 'a = (2F) / (m/2) = 4F/m, four times the original.' },
    { t: 1, q: 'A skydiver falls at a steady terminal velocity. The net force on them is…', o: ['Zero', 'Their weight, downward', 'Increasing', 'Upward'], h: 'Steady velocity means no acceleration.', w: 'At terminal velocity, air resistance has grown to equal the weight, so the forces balance.' },
    { t: 2, q: 'On a frictionless ramp, a block’s acceleration down the slope depends on…', o: ['Only the angle (and g)', 'Its mass and the angle', 'Only its mass', 'Its starting speed'], h: 'Write ma = mg sinθ and look at what cancels.', w: 'ma = mg sinθ, so a = g sinθ. The mass cancels.' },
    { t: 2, q: 'You stand on a bathroom scale in a lift that is accelerating upward. The scale reads…', o: ['More than your weight', 'Less than your weight', 'Exactly your weight', 'Zero'], h: 'The scale shows the normal force N. Apply N − mg = ma.', w: 'N = m(g + a), which is more than mg, so you feel heavier.' },
    { t: 2, q: 'A horse pulls a cart, and the cart pulls back on the horse just as hard. They still move forward because…', o: ['The two forces act on different objects', 'The horse pulls slightly harder', 'Newton’s third law doesn’t apply to moving things', 'Friction cancels the cart’s pull'], h: 'For the horse’s motion, only forces on the horse matter.', w: 'The horse moves because the ground pushes it forward harder than the cart pulls it back. The third-law pair acts on two different bodies.' },
  ],
  energy: [
    { t: 0, q: 'Which has more kinetic energy?', o: ['A 1 kg ball at 4 m/s', 'A 2 kg ball at 2 m/s', 'They are equal', 'Not enough information'], h: 'KE = ½mv². Speed is squared.', w: '½·1·4² = 8 J versus ½·2·2² = 4 J. Speed counts for more because it is squared.' },
    { t: 0, q: 'The SI unit of energy is the…', o: ['Joule', 'Watt', 'Newton', 'Pascal'], h: 'It equals one newton-metre.', w: '1 joule = 1 newton × 1 metre. The watt is a joule per second, a unit of power.' },
    { t: 0, q: 'A ball is thrown straight up. At its highest point it has the most…', o: ['Gravitational potential energy', 'Kinetic energy', 'Speed', 'Momentum'], h: 'It stops for an instant at the top.', w: 'At the top it is highest and slowest, so potential energy is greatest and kinetic energy is zero.' },
    { t: 1, q: 'Ignoring air resistance, a falling ball’s total mechanical energy…', o: ['Stays constant', 'Increases', 'Decreases', 'Drops to zero'], h: 'Potential energy turns into kinetic energy.', w: 'Lost potential energy equals gained kinetic energy, so the total is conserved.' },
    { t: 1, q: 'Compressing a spring twice as far stores how much more energy?', o: ['4 times as much', '2 times as much', '8 times as much', 'The same'], h: 'E = ½kx².', w: 'E ∝ x², so 2² = 4 times the energy.' },
    { t: 1, q: 'How much energy does a 60 W bulb use in 10 s?', o: ['600 J', '6 J', '60 J', '0.6 J'], h: 'E = Pt.', w: '60 J every second for 10 s is 600 J.' },
    { t: 2, q: 'Two balls of different mass slide down the same frictionless ramp from the same height. At the bottom they have the same…', o: ['Speed', 'Kinetic energy', 'Momentum', 'Potential energy'], h: 'Set mgh = ½mv² and see what cancels.', w: 'v = √(2gh). Mass cancels, so the speeds match, but the heavier ball has more kinetic energy and momentum.' },
    { t: 2, q: 'Power measures…', o: ['How fast work is done', 'Total work done', 'Force × time', 'Energy per kilogram'], h: 'Its unit is the watt, one joule per second.', w: 'P = W / t: the rate of doing work, or of transferring energy.' },
    { t: 2, q: 'A motor takes in 500 J and lifts a load, giving it 350 J of potential energy. Its efficiency is…', o: ['70%', '35%', '143%', '30%'], h: 'Efficiency = useful output ÷ total input.', w: '350 / 500 = 0.70, so 70%. The other 150 J became heat and sound.' },
  ],
  proj: [
    { t: 0, q: 'One ball rolls off a table while another is dropped from the same height at the same moment. Which lands first?', o: ['They land together', 'The rolling ball', 'The dropped ball', 'It depends on the rolling speed'], h: 'Horizontal and vertical motion are independent.', w: 'Both start with zero vertical velocity and fall the same height, so they take the same time.' },
    { t: 0, q: 'Ignoring air resistance, a projectile’s horizontal velocity…', o: ['Stays constant', 'Increases', 'Decreases', 'Is zero at the top'], h: 'Which way does gravity point?', w: 'Gravity is purely vertical, so nothing changes the horizontal velocity.' },
    { t: 0, q: 'During its flight, a projectile’s vertical acceleration is…', o: ['9.8 m/s² downward the whole time', 'Zero at the top', 'Upward on the way up', 'Zero throughout'], h: 'Gravity acts the whole time.', w: 'Gravity is the only force, so the acceleration is 9.8 m/s² downward from launch to landing.' },
    { t: 1, q: 'On level ground with no air resistance, which launch angle gives the longest range?', o: ['45°', '30°', '60°', '90°'], h: 'R = v² sin(2θ) / g. When is sin(2θ) largest?', w: 'sin(2θ) peaks at 1 when 2θ = 90°, so θ = 45°.' },
    { t: 1, q: 'At the top of its arc, a projectile’s velocity is…', o: ['Horizontal only', 'Zero', 'Vertical only', 'At its maximum'], h: 'The vertical part is zero for an instant. What about the horizontal part?', w: 'v_y = 0 at the peak, but v_x is unchanged, so the velocity points horizontally.' },
    { t: 1, q: 'Which part of the launch velocity decides how long a projectile stays in the air?', o: ['The vertical component', 'The horizontal component', 'Only the total speed', 'The mass'], h: 'Flight time is a question about up and down.', w: 'Time up and down depends only on v_y and g. v_x just decides how far it goes in that time.' },
    { t: 2, q: 'On level ground, launches at 30° and 60° with the same speed give…', o: ['The same range', 'A longer range at 60°', 'A longer range at 30°', 'Ranges that depend on mass'], h: 'Compare sin 60° and sin 120°.', w: 'Complementary angles give equal sin(2θ), so equal ranges. The 60° shot just flies higher and stays up longer.' },
    { t: 2, q: 'Double the launch speed (same angle, level ground) and the range…', o: ['Quadruples', 'Doubles', 'Stays the same', 'Halves'], h: 'R ∝ v².', w: 'R = v² sin(2θ) / g, so twice the speed gives four times the range.' },
    { t: 2, q: 'With air resistance included, the angle for maximum range is…', o: ['Less than 45°', 'Exactly 45°', 'More than 45°', '90°'], h: 'High arcs spend longer fighting the air.', w: 'Drag hurts long, high flights most, so a flatter launch below 45° goes furthest in real life.' },
  ],
  mom: [
    { t: 0, q: 'Momentum is mass multiplied by…', o: ['Velocity', 'Acceleration', 'Distance', 'Force'], h: 'Units are kg·m/s.', w: 'p = mv. It is a vector, pointing the same way as the velocity.' },
    { t: 0, q: 'Which has more momentum: a 1000 kg car at 1 m/s or a 50 kg runner at 10 m/s?', o: ['The car', 'The runner', 'They are equal', 'They can’t be compared'], h: 'Work out mv for each.', w: 'Car: 1000 kg·m/s. Runner: 500 kg·m/s.' },
    { t: 0, q: 'The unit of momentum is…', o: ['kg·m/s', 'N', 'J', 'kg/m'], h: 'Mass × velocity.', w: 'kg × m/s = kg·m/s. It is also equal to a newton-second.' },
    { t: 1, q: 'In a collision with no outside forces, the total momentum…', o: ['Is conserved', 'Increases', 'Decreases', 'Becomes zero'], h: 'Third-law forces inside the system cancel.', w: 'Internal forces are equal and opposite, so the total momentum is unchanged.' },
    { t: 1, q: 'Airbags reduce injuries mainly by…', o: ['Making the stop take longer, which lowers the force', 'Reducing the change in momentum', 'Increasing your mass', 'Bouncing your energy back'], h: 'Impulse: F·Δt = Δp.', w: 'Δp is fixed by your speed. Stretching Δt makes the average force F = Δp / Δt smaller.' },
    { t: 1, q: 'A rifle kicks back when it fires because…', o: ['The bullet and rifle gain equal and opposite momentum', 'The rifle is lighter than the bullet', 'Air pushes it back', 'Energy is lost'], h: 'Total momentum before firing is zero.', w: 'Momentum is zero before and must be zero after, so the rifle moves back as the bullet moves forward.' },
    { t: 2, q: 'In a perfectly inelastic collision…', o: ['The objects stick together and kinetic energy is lost', 'Kinetic energy is conserved', 'Momentum is lost', 'The objects bounce apart at equal speeds'], h: 'Inelastic means some KE becomes heat, sound and bent metal.', w: 'Momentum is always conserved. When objects stick together, the largest possible share of kinetic energy is lost.' },
    { t: 2, q: 'A cart hits an identical cart at rest in a perfectly elastic collision. Afterwards…', o: ['The first cart stops and the second moves off at the original speed', 'Both move at half the original speed', 'Both stop', 'The first cart bounces back at the original speed'], h: 'Momentum and kinetic energy must both be conserved.', w: 'With equal masses the velocities swap: v₁′ = 0 and v₂′ = u₁.' },
    { t: 2, q: 'A ball bounces straight back off a wall at the same speed. Its change in momentum is…', o: ['2mv', 'Zero', 'mv', '½mv'], h: 'Velocity goes from +v to −v.', w: 'Δp = m(−v) − m(v) = −2mv. The size is 2mv.' },
  ],
  circ: [
    { t: 0, q: 'An object moves in a circle at a constant speed. Is it accelerating?', o: ['Yes, because its direction keeps changing', 'No, because its speed is constant', 'Only if the circle is vertical', 'Only if friction acts'], h: 'Acceleration is a change in velocity, and velocity has a direction.', w: 'The velocity’s direction changes all the time, so there is an acceleration toward the centre.' },
    { t: 0, q: 'Which way does centripetal acceleration point?', o: ['Toward the centre', 'Outward', 'Along the motion', 'Against the motion'], h: '“Centripetal” means centre-seeking.', w: 'It points toward the centre of the circle at every moment.' },
    { t: 1, q: 'A stone whirled on a string flies off when the string snaps. It travels…', o: ['In a straight line along the tangent', 'Straight outward from the centre', 'Along a curved path', 'Straight toward the centre'], h: 'With no force, Newton’s first law applies.', w: 'With nothing pulling it inward, it keeps the velocity it had, which points along the tangent.' },
    { t: 1, q: 'What provides the centripetal force for a car turning on a flat road?', o: ['Friction between the tyres and the road', 'The engine', 'Centrifugal force', 'The car’s weight'], h: 'Which real force can point sideways toward the centre?', w: 'Sideways friction on the tyres points toward the centre of the bend. On ice there is too little, and the car slides straight on.' },
    { t: 2, q: 'A car takes the same bend at twice the speed. The friction force needed becomes…', o: ['4 times as large', '2 times as large', 'The same', 'Half as large'], h: 'F = mv² / r.', w: 'F ∝ v², so doubling the speed needs four times the force.' },
    { t: 2, q: 'At the top of a loop at exactly the minimum speed, the track pushes on the cart with…', o: ['Zero force', 'Its full weight', 'Twice its weight', 'mv²/r upward'], h: 'At minimum speed, gravity alone provides the centripetal force.', w: 'mg = mv²/r exactly, so the track does not need to push at all.' },
  ],
  grav: [
    { t: 0, q: 'If the distance between two masses doubles, the gravitational force becomes…', o: ['A quarter as strong', 'Half as strong', 'Twice as strong', 'Unchanged'], h: 'F ∝ 1/r².', w: '1/2² = 1/4.' },
    { t: 0, q: 'Your mass on the Moon, compared with on Earth, is…', o: ['The same', 'One sixth as much', 'Six times as much', 'Zero'], h: 'Mass is the amount of matter. Weight is the force.', w: 'Your mass doesn’t change. Your weight drops to about one sixth because the Moon’s g is 1.62 m/s².' },
    { t: 1, q: 'Astronauts on the space station float because…', o: ['They are in free fall along with the station', 'There is no gravity at that height', 'The station blocks gravity', 'They are above the atmosphere'], h: 'At 400 km, g is still about 8.7 m/s².', w: 'Everything on board falls around Earth at the same rate, so nothing presses on anything else.' },
    { t: 1, q: 'Where is Earth’s gravitational field strongest?', o: ['At the surface', 'At the centre', '400 km up', 'It is the same everywhere'], h: 'Inside Earth, less mass is below you.', w: 'Above the surface g falls as 1/r². Inside, less of Earth’s mass pulls you down, so g falls toward zero at the centre.' },
    { t: 2, q: 'A satellite moves to a higher circular orbit. Its orbital speed…', o: ['Decreases', 'Increases', 'Stays the same', 'Depends on its mass'], h: 'v = √(GM / r).', w: 'A larger r gives a smaller v. Higher orbits are slower and take longer.' },
    { t: 2, q: 'Planet B orbits 4 times farther from its star than planet A. Its year is…', o: ['8 times longer', '4 times longer', '16 times longer', '2 times longer'], h: 'T² ∝ r³.', w: 'T ∝ r^1.5, and 4^1.5 = 8.' },
  ],
  shm: [
    { t: 0, q: 'Frequency is measured in…', o: ['Hertz', 'Seconds', 'Metres', 'Newtons'], h: 'Cycles per second.', w: '1 Hz is one full cycle every second.' },
    { t: 0, q: 'Where is a swinging pendulum moving fastest?', o: ['At the bottom of its swing', 'At the ends', 'Halfway up', 'Its speed never changes'], h: 'Where has all the potential energy become kinetic?', w: 'At the lowest point all the potential energy has become kinetic energy.' },
    { t: 1, q: 'Doubling the mass on a spring changes its period by a factor of…', o: ['√2', '2', '4', '½'], h: 'T = 2π√(m/k).', w: 'T ∝ √m, so twice the mass gives √2 ≈ 1.41 times the period.' },
    { t: 1, q: 'A heavier bob on the same pendulum swings with a period that is…', o: ['The same', 'Longer', 'Shorter', 'Dependent on the amplitude'], h: 'Look at T = 2π√(L/g).', w: 'Mass doesn’t appear in the formula. Only length and g matter.' },
    { t: 2, q: 'Making a pendulum 4 times as long makes its period…', o: ['Twice as long', 'Four times as long', 'Half as long', 'The same'], h: 'T ∝ √L.', w: '√4 = 2.' },
    { t: 2, q: 'In simple harmonic motion, acceleration is greatest when…', o: ['The displacement is greatest', 'The speed is greatest', 'The object passes the middle', 'The period is shortest'], h: 'a = −ω²x.', w: 'Acceleration is proportional to displacement, so it peaks at the ends, where the object stops for an instant.' },
  ],
  waves: [
    { t: 0, q: 'Sound waves are…', o: ['Longitudinal', 'Transverse', 'Electromagnetic', 'Only standing waves'], h: 'Air molecules move back and forth along the direction of travel.', w: 'Sound is a pressure wave of compressions and rarefactions, so it is longitudinal.' },
    { t: 0, q: 'The distance between two neighbouring crests is the…', o: ['Wavelength', 'Amplitude', 'Frequency', 'Period'], h: 'Its symbol is λ.', w: 'Wavelength is one full wave’s length, crest to crest.' },
    { t: 1, q: 'Raising the frequency of a sound in the same air makes its wavelength…', o: ['Shorter', 'Longer', 'Unchanged', 'Zero'], h: 'v = fλ, and the air fixes v.', w: 'With v fixed, a larger f means a smaller λ.' },
    { t: 1, q: 'Which of these can travel through a vacuum?', o: ['Light', 'Sound', 'Water ripples', 'A wave on a string'], h: 'Which one doesn’t need a material to travel through?', w: 'Light is an electromagnetic wave and needs no medium. That’s how sunlight reaches us.' },
    { t: 2, q: 'Tightening a guitar string raises its pitch because…', o: ['The wave speed on the string increases', 'The string gets shorter', 'The string gets heavier', 'The amplitude grows'], h: 'v = √(T/μ) and f = v / 2L.', w: 'More tension gives a faster wave and, with the same length, a higher frequency.' },
    { t: 2, q: 'The second harmonic on a string of length L has a wavelength of…', o: ['L', '2L', 'L/2', '4L'], h: 'λₙ = 2L / n.', w: 'With n = 2, λ = 2L / 2 = L.' },
  ],
  fluids: [
    { t: 0, q: 'Pressure is measured in…', o: ['Pascals (N/m²)', 'Newtons', 'Joules', 'Kilograms'], h: 'Force per area.', w: '1 Pa = 1 N/m².' },
    { t: 0, q: 'A sharp knife cuts better than a blunt one because…', o: ['The same force on a smaller area gives more pressure', 'It is heavier', 'It has less friction', 'Air pressure helps it'], h: 'P = F / A.', w: 'A thin edge has a tiny area, so the same push gives a huge pressure.' },
    { t: 1, q: 'Three tanks of different shapes are filled with water to the same depth. The pressure at the bottom is…', o: ['The same in all three', 'Largest in the widest tank', 'Largest in the narrowest tank', 'Set by the volume of water'], h: 'P = ρgh.', w: 'Only depth and density matter, not the shape or the amount of water.' },
    { t: 1, q: 'A hydraulic jack multiplies…', o: ['Force', 'Energy', 'Pressure', 'Power'], h: 'The pressure is the same on both pistons.', w: 'The same pressure on a bigger area gives a bigger force. Energy is not multiplied: the small piston moves further.' },
    { t: 2, q: 'A steel ship floats because…', o: ['Its hull displaces water weighing as much as the ship', 'Steel is less dense than water', 'Air pressure holds it up', 'It is moving'], h: 'Archimedes’ principle.', w: 'The hollow hull pushes aside a large volume of water. The ship sinks until that water weighs as much as the ship.' },
    { t: 2, q: 'An ice cube floats in a glass filled to the brim. When it melts, the water level…', o: ['Stays the same', 'Rises and spills', 'Falls', 'Rises, then falls'], h: 'Floating ice displaces its own weight of water.', w: 'The melted ice makes exactly the volume of water the floating ice was already displacing.' },
  ],
  thermal: [
    { t: 0, q: 'Absolute zero is…', o: ['0 K, about −273 °C', '0 °C', '−100 °C', '273 K'], h: 'It is the start of the Kelvin scale.', w: '0 K is the lowest possible temperature, −273 °C.' },
    { t: 0, q: 'Heat flows naturally from…', o: ['Hotter objects to colder ones', 'Bigger objects to smaller ones', 'Colder objects to hotter ones', 'Denser objects to less dense ones'], h: 'Think of a hot drink in a cold room.', w: 'Heat flows down a temperature difference until both sides are equally hot.' },
    { t: 1, q: 'While ice is melting at 0 °C, adding more heat…', o: ['Breaks bonds without raising the temperature', 'Raises the temperature', 'Lowers the temperature', 'Has no effect'], h: 'This is latent heat.', w: 'The energy goes into breaking the solid structure, so the temperature stays at 0 °C until it has all melted.' },
    { t: 1, q: 'Metal feels colder than wood at the same temperature because metal…', o: ['Conducts heat away from your hand faster', 'Really is colder', 'Has a lower specific heat', 'Reflects heat'], h: 'Your skin senses heat flow, not temperature.', w: 'Both are at room temperature, but metal draws heat from your skin much faster.' },
    { t: 2, q: 'A sealed gas is heated from 27 °C to 327 °C. Its pressure…', o: ['Doubles', 'Becomes 12 times larger', 'Stays the same', 'Halves'], h: 'Convert to kelvin: 300 K and 600 K.', w: 'P ∝ T in kelvin, and 600 / 300 = 2.' },
    { t: 2, q: 'Coastal towns have milder climates mainly because water has…', o: ['A high specific heat capacity', 'A low boiling point', 'A high density', 'A low conductivity'], h: 'Q = mcΔT.', w: 'Water stores a lot of heat for each degree, so the sea warms and cools slowly and evens out the temperature.' },
  ],
  elec: [
    { t: 0, q: 'Electric current is measured in…', o: ['Amperes', 'Volts', 'Ohms', 'Watts'], h: 'The unit is often shortened to “amps”.', w: '1 A is 1 coulomb of charge per second.' },
    { t: 0, q: 'In a series circuit, the current is…', o: ['The same everywhere', 'Largest near the battery', 'Split between the components', 'Zero after each bulb'], h: 'There is only one path.', w: 'Charge can’t pile up or disappear, so the same current flows all the way round.' },
    { t: 1, q: 'Adding another resistor in parallel makes the total resistance…', o: ['Smaller', 'Larger', 'Unchanged', 'Zero'], h: 'More paths for the current.', w: 'Each new branch is an extra path, so the circuit draws more current and the combined resistance falls.' },
    { t: 1, q: 'Household appliances are wired in parallel so that…', o: ['Each gets the full voltage and can be switched on its own', 'They share the current equally', 'The resistance increases', 'They use less power'], h: 'What happens in series if one appliance is switched off?', w: 'In parallel each appliance gets the full mains voltage and works independently.' },
    { t: 2, q: 'Two bulbs rated 60 W and 100 W for the same voltage. Which has the higher resistance?', o: ['The 60 W bulb', 'The 100 W bulb', 'They are equal', 'It depends on the current'], h: 'P = V²/R at fixed V.', w: 'R = V²/P, so the smaller power means the larger resistance.' },
    { t: 2, q: 'If the current through a resistor doubles, the power it uses becomes…', o: ['4 times as large', '2 times as large', 'Unchanged', 'Half as large'], h: 'P = I²R.', w: 'P ∝ I², and 2² = 4.' },
  ],
  optics: [
    { t: 0, q: 'Angles of incidence and reflection are measured from the…', o: ['Normal', 'Surface', 'Horizontal', 'Light source'], h: 'The normal is the line at 90° to the surface.', w: 'All ray angles in optics are measured from the normal.' },
    { t: 0, q: 'A ray hits a mirror at 30° to the normal. The reflected ray leaves at…', o: ['30° to the normal', '60° to the normal', '90° to the normal', '15° to the normal'], h: 'Angle in = angle out.', w: 'The law of reflection: θᵢ = θᵣ.' },
    { t: 1, q: 'Light passing from air into water bends…', o: ['Toward the normal', 'Away from the normal', 'Not at all', 'Back on itself'], h: 'Light slows down in water.', w: 'Entering a slower, higher-n material, the ray bends toward the normal.' },
    { t: 1, q: 'A straw in a glass of water looks bent because of…', o: ['Refraction', 'Reflection', 'Diffraction', 'Dispersion'], h: 'Light changes direction as it leaves the water.', w: 'Light from the straw bends at the water surface, so the underwater part appears shifted.' },
    { t: 2, q: 'Total internal reflection can happen when light travels…', o: ['From glass into air', 'From air into glass', 'From air into water', 'Only inside mirrors'], h: 'It needs a higher n to a lower n.', w: 'Only when light heads into a lower-index material can it bend so far that it reflects completely.' },
    { t: 2, q: 'An object sits closer to a converging lens than its focal length. The image is…', o: ['Virtual, upright and magnified', 'Real and upside down', 'Real and smaller', 'Not formed at all'], h: 'This is how a magnifying glass works.', w: 'With d₀ < f, dᵢ comes out negative: a virtual, upright, enlarged image on the same side as the object.' },
  ],
};
function defaultScene(tid) {
  return {
    kin: { kind: 'car', u: 4, a: 1.5, T: 6 },
    force: { kind: 'block', angle: 0, m: 5, F: 30, mu: 0.2 },
    energy: { kind: 'drop', h: 12, m: 2 },
    proj: { kind: 'proj', v: 18, ang: 45, h: 0 },
    mom: { kind: 'carts', m1: 3, v1: 4, m2: 3, v2: 0, e: 1 },
    circ: { kind: 'circle', r: 2, v: 5 },
    grav: { kind: 'orbit', alt: 0.6, lines: ['g = GM / r²'] },
    shm: { kind: 'pendulum', L: 1, lines: ['T = 2π√(L/g)'] },
    waves: { kind: 'wave', lam: 2, A: 1, f: 2, lines: ['v = fλ'] },
    fluids: { kind: 'tank', h: 3, obj: 'float', frac: 0.6, lines: ['F_b = ρVg'] },
    thermal: { kind: 'thermo', T1: 20, T2: 80, lines: ['Q = mcΔT'] },
    elec: { kind: 'circuit', V: 12, Rs: [4, 8], mode: 'series' },
    optics: { kind: 'refract', n1: 1, n2: 1.5, th1: 40 },
  }[tid];
}
function mcFrom(tid, t) {
  const pool = MC[tid].filter(q => q.t === t);
  const q = pick(pool.length ? pool : MC[tid]);
  const opts = shuffle(q.o.map((s, i) => ({ s, ok: i === 0 })));
  return { type: 'mc', prompt: q.q, choices: opts.map(o => o.s), correct: opts.findIndex(o => o.ok), hint: q.h, solution: q.w, scene: defaultScene(tid) };
}
