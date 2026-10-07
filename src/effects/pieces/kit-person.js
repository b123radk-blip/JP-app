// Props kit: a simple person (2 draw calls): capsule body and limbs, a big round head with hair and eyes (kid-book look),
// about `u` tall, standing with its feet at the group's origin and facing +z (towards you). person.face('right') turns it.
// Limbs: armL/armR (upper) + foreL/foreR, legL/legR + shinL/shinR; rotation.x swings a limb forward (+) or back (-),
// rotation.z swings an arm out to its side (person.raise does the sign). person.walk(phase) is a walk cycle,
// person.lean(a) bends at the hips (feet stay put). Call person.update() after posing.
import { createRig } from './kit-rig.js';

const FACE = { toward: 0, right: Math.PI / 2, left: -Math.PI / 2, away: Math.PI };

export function createPerson({ u = 0.26, shirt = 0x3a8ae0, pants = 0x2a3550, skin = 0xffd2b0, hair = 0x3a2416, shoes = 0x2a1a14, eyes = 0x1a1a24, glow = 0.3 } = {}) {
  const k = (x) => x * u, H = k(0.39);
  const arm = (s, n) => [
    { name: `arm${n}`, parent: 'body', at: 0.88, off: [k(0.12 * s), 0, 0], rest: [0, 0, Math.PI + 0.1 * s], len: k(0.17), r: k(0.042), color: shirt },
    { name: `fore${n}`, parent: `arm${n}`, len: k(0.15), r: k(0.038), r2: k(0.034), color: skin },
    { name: `hand${n}`, parent: `fore${n}`, len: k(0.04), r: 0, color: skin, blob: { r: k(0.046), y: 0.4 } },
  ];
  const leg = (s, n) => [
    { name: `leg${n}`, parent: 'body', at: 0, off: [k(0.058 * s), k(0.02), 0], rest: [0, 0, Math.PI], len: k(0.2), r: k(0.052), color: pants },
    { name: `shin${n}`, parent: `leg${n}`, len: k(0.19), r: k(0.047), r2: k(0.043), color: pants },
    { name: `foot${n}`, parent: `shin${n}`, off: [0, -k(0.005), -k(0.02)], rest: [Math.PI / 2, 0, 0], len: k(0.075), r: k(0.04), color: shoes },
  ];
  const rig = createRig([
    { name: 'body', off: [0, H, 0], len: k(0.29), r: k(0.105), r2: k(0.095), color: shirt },
    { name: 'head', parent: 'body', len: k(0.25), r: 0, color: skin, blob: { r: k(0.13), s: [1, 1.04, 0.98], y: 0.52 } },
    { name: 'hair', parent: 'head', at: 0.6, off: [0, k(0.015), -k(0.018)], len: k(0.01), r: 0, color: hair, blob: { r: k(0.135), s: [1.02, 0.78, 0.98] } },
    { name: 'eyeL', parent: 'head', at: 0.5, off: [k(0.045), 0, k(0.118)], len: k(0.01), r: 0, color: eyes, blob: { r: k(0.022), s: [1, 1.3, 0.6] } },
    { name: 'eyeR', parent: 'head', at: 0.5, off: [-k(0.045), 0, k(0.118)], len: k(0.01), r: 0, color: eyes, blob: { r: k(0.022), s: [1, 1.3, 0.6] } },
    ...arm(1, 'L'), ...arm(-1, 'R'), ...leg(1, 'L'), ...leg(-1, 'R'),
  ], { glow });
  const b = rig.bone, body = b('body');
  const p = {
    group: rig.group, rig, bone: b, drawCalls: rig.drawCalls, u,
    face(dir) { rig.group.rotation.y = typeof dir === 'number' ? dir : FACE[dir] ?? 0; return p; },
    reset() { rig.reset(); body.position.set(0, 0, 0); return p; },
    // arm out to its side by a (radians, + = up and out), either side
    raise(side, a) { b(`arm${side}`).rotation.z = (side === 'L' ? 1 : -1) * a; return p; },
    // walk cycle: phase in radians (2π = two steps), amt 0..1 (0 = standing)
    walk(phase, amt = 1) {
      const s = Math.sin(phase), c = Math.cos(phase);
      b('legL').rotation.x = 0.5 * s * amt; b('legR').rotation.x = -0.5 * s * amt;
      b('shinL').rotation.x = -0.7 * Math.max(0, -c) * amt; b('shinR').rotation.x = -0.7 * Math.max(0, c) * amt;
      b('armL').rotation.x = -0.45 * s * amt; b('armR').rotation.x = 0.45 * s * amt;
      b('foreL').rotation.x = b('foreR').rotation.x = 0.35 * amt;
      body.position.y = k(0.012) * Math.abs(c) * amt;
      return p;
    },
    // bend forward at the hips by a (feet stay planted: the legs turn back by the same amount)
    lean(a) { body.rotation.x = a; b('legL').rotation.x += a; b('legR').rotation.x += a; return p; },
    update() { rig.update(); return p; },
  };
  p.update();
  return p;
}
