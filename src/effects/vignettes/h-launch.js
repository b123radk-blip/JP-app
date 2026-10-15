// Departure (Haiku plan h7, card 発): a rocket stands on its launch pad, a countdown 3, 2, 1 pops over it, smoke bursts
// out and a flame flickers under it, it lifts off while a boy cheers. Scene type: q-rocket-launch.
//   loop 7 s: 0.5-2 the countdown 3, 2, 1; 2-2.4 smoke bursts out round the pad, the flame flickers; 2.4-4.5 the rocket
//   rises (slowly, then faster) with a trail of smoke puffs; 4.5-5 it shrinks away at the top; 3-4.4 the boy raises both
//   arms, jumps once and cheers (わーい!); 5-6.2 the smoke drifts and fades; 6.2-7 a new rocket grows out of the pad.
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { many, PUFF, flies } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { textPlane } from '../pieces/kit-props.js';
import { smooth } from '../pieces/util.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { KID, RIGHT, pop, speech, person } from './q-common.js';

const LOOP = 7.0, N_PUFF = 10, N_TRAIL = 12;

// the rocket, about u tall, origin at the middle of its base: white body, red nose and three fins, a blue window
function rocketProp(u) {
  const parts = [[G.cyl(0.07 * u, 0.07 * u, 0.45 * u, 0, 0.225 * u, 0), 0xf4f6fa], [G.cone(0.07 * u, 0.12 * u, 0, 0.51 * u, 0), 0xe03030], [G.sphere(0.03 * u, 0, 0.32 * u, 0.066 * u), 0x3a8cff]];
  for (let i = 0; i < 3; i++) parts.push([G.box(0.05 * u, 0.12 * u, 0.012 * u, 0.095 * u, 0.06 * u, 0).rotateY(i * 2 * Math.PI / 3), 0xe03030]);
  return solidProp(parts, 0.5);
}

function rocketLaunch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  // group-local points (stage units): x from the kanji's right edge, y from the ground line, z to the learner
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);
  const boy = person('guy2', u, KID);
  const pad = solidProp([[G.cyl(0.2 * u, 0.2 * u, 0.05 * u, 0, 0.025 * u, 0, 0, 0, 0, 24), 0x9aa2ae]], 0.4);
  pad.name = 'pad'; pad.position.copy(P(0.95, 0, -0.05));
  const rocket = new THREE.Group(), body = rocketProp(u), flame = flies(solidProp([[G.cone(0.1 * u, 0.12 * u, 0, 0.06 * u, 0), 0xffa030]], 0.9));
  body.name = 'rocket'; flame.name = 'flame'; rocket.add(body, flame);
  const counts = ['3', '2', '1'].map((s) => {
    const c = new THREE.Group(), disc = flies(solidProp([[G.cyl(0.17 * u, 0.17 * u, 0.02 * u, 0, 0, 0, Math.PI / 2, 0, 0, 28), 0x1c2330]], 0.3));
    const num = flies(textPlane(s, { h: 0.26 * u, color: '#ffffff' })); num.position.z = 0.015 * u;
    c.add(disc, num); return c;
  });
  const puff = many(PUFF(u), N_PUFF, 0.8), trail = many(PUFF(u), N_TRAIL, 0.8);
  const bubble = speech(u, 'わーい!', { h: 0.15 });
  boy.group.rotation.y = RIGHT - 0.25;   // turned to the rocket, a little to the learner
  group.add(pad, rocket, ...counts, puff, trail, bubble, boy.group);
  // the rocket's base height (u) while it lifts: slow to start, faster, at 0.55 when it reaches the top of its climb
  const lift = (v) => (v < 5 ? smooth(between(v, 2.4, 4.5)) : 0);
  return {
    group,
    step(t) {
      const v = acts(ctx, t, LOOP).v;
      const f1 = between(v, 2.0, 2.4), f2 = between(v, 5.0, 6.2), up = between(v, 4.5, 5.0), b = 0.05 + 0.5 * lift(v);
      // the rocket: on the pad, lifting off, shrinking away at the top, growing back out of the pad for the loop's start
      const rk = v < 5 ? 1 - up : between(v, 6.2, 7.0);
      rocket.visible = rk > 0.01; rocket.scale.setScalar(grow(rk));
      rocket.position.copy(P(0.95, b + 0.3 * up, -0.05));
      // the flame under the rocket: flickers for 2.0-2.4
      const fk = between(v, 2.0, 2.1) * (1 - between(v, 2.4, 2.5)), fl = Math.sin(v * 40);
      flame.visible = fk > 0.01; flame.scale.set(1 + 0.15 * fl, grow(fk) * (1 + 0.25 * fl), 1 + 0.15 * fl);
      // the countdown: 3, 2, 1 pop one after another over the rocket, half a second each
      const cp = P(0.95, 0.85, 0.12);
      counts.forEach((c, i) => pop(c, bump(v, 0.5 + 0.5 * i, 0.5), cp.x, cp.y, cp.z));
      // smoke: a burst round the pad (2-2.4), it stays, then drifts and fades (5-6.2)
      const kb = between(v, 2.0, 2.2) * (1 - f2);
      for (let i = 0; i < N_PUFF; i++) {
        const a = i * 2 * Math.PI / N_PUFF + 0.3, r = 0.03 + 0.22 * f1 + 0.25 * f2, p = P(0.95 + Math.cos(a) * r, 0.08 + 0.15 * f1 + 0.2 * f2, -0.05 + Math.sin(a) * r * 0.8);
        puff.set(i, p.x, p.y, p.z, kb * (1.6 + 0.4 * (i % 3)));
      }
      puff.commit();
      // the trail: a puff left at the rocket's base as it passes (2.4 onwards)
      for (let i = 0; i < N_TRAIL; i++) {
        const te = 2.4 + i * 0.18, kt = between(v, te, te + 0.25) * (1 - f2);
        const p = P(0.95 + 0.04 * Math.sin(i * 2.1), 0.1 + 0.5 * lift(te) + 0.2 * f2, -0.05 + 0.02 * Math.cos(i * 1.3));
        trail.set(i, p.x, p.y, p.z, kt * 1.2);
      }
      trail.commit();
      // the boy: both arms up, one jump (3.1-4.0), a cheer bubble
      const jump = bump(v, 3.1, 0.9), cheer = between(v, 3.0, 3.4) * (1 - between(v, 4.2, 4.4));
      boy.group.position.set(B.maxX + 0.55 * u, floor + 0.12 * u * jump, 0.25 * u);
      boy.pose('Idle', t);
      boy.handTo('R', boy.local(-0.12, 1.05, 0.04), cheer, { out: 0.9, down: 0.4 });
      boy.handTo('L', boy.local(0.12, 1.05, 0.04), cheer, { out: 0.9, down: 0.4 });
      const bk = between(v, 3.2, 3.5) * (1 - between(v, 4.2, 4.4)), bp = P(0.68, 0.92 + 0.12 * jump, 0.3);
      pop(bubble, bk, bp.x, bp.y, bp.z);
    },
  };
}

export const SCENES = { 'q-rocket-launch': rocketLaunch };
