// 力 (plan 014): a strong man (guy3) bends down, grips a barbell with huge black plates and heaves it up to his chest.
// He holds it there, trembling with the effort (sweat flying); then he lets go and it drops with a thud that makes the
// kanji jump (dust at each plate's foot), and he cheers with both arms up while gold stars orbit his head.
// Loop 7 s: 0-0.8 Idle, the barbell lies on the mat; 0.8-1.5 he bows and both hands reach the bar; 1.5-2.4 he heaves it
// from y 0.2 to y 0.5 and stands straight; 2.4-4.2 he holds it at his chest, trembling; 4.2-4.6 it falls back to the
// mat (hands on it until 4.6); 4.6 the thud (the kanji jumps 0.06, dust bursts, 0.4 s); 5.0-6.6 Victory, gold stars
// above his head 5.2-6.4; 6.6-7 Idle, everything as at 0.
import * as THREE from 'three';
import { acts, timeline, bump, tremble } from './timeline.js';
import { actor } from './model-kit.js';
import { burst, stars, many, DROP, flies } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph } from './helpers.js';
import { pop } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), W3 = new THREE.Vector3();

function power(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const who = actor('guy3', 0.9 * u);
  const px = B.maxX + 0.95 * u, pz = -0.15 * u;                 // his feet, facing the learner
  const mat = solidProp([[G.box(0.95 * u, 0.02 * u, 0.55 * u), 0x3a6ea5]], 0.25);
  mat.name = 'floor mat';
  const bar = solidProp([[G.cyl(0.015 * u, 0.015 * u, 0.70 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xc0c4cc]], 0.4);   // axis along x
  bar.name = 'bar';
  bar.userData.flies = true;                                   // the bar sits at hub height (axis 0.2 u up): it never stands on the mat itself
  const plateL = solidProp([                                   // the discs, with a light rim on the outer face
    [G.cyl(0.2 * u, 0.2 * u, 0.08 * u, -0.39 * u, 0, 0, 0, 0, Math.PI / 2), 0x222222],
    [G.cyl(0.2 * u, 0.2 * u, 0.012 * u, -0.425 * u, 0, 0, 0, 0, Math.PI / 2), 0x9aa0a8],
  ], 0.25);
  plateL.name = 'plate L';
  const plateR = solidProp([
    [G.cyl(0.2 * u, 0.2 * u, 0.08 * u, 0.41 * u, 0, 0, 0, 0, Math.PI / 2), 0x222222],
    [G.cyl(0.2 * u, 0.2 * u, 0.012 * u, 0.425 * u, 0, 0, 0, 0, Math.PI / 2), 0x9aa0a8],
  ], 0.25);
  plateR.name = 'plate R';
  const bell = new THREE.Group();                               // the bar and the plates move together
  bell.add(bar, plateL, plateR);
  const dustL = burst(u, { s: 0.16, n: 6, color: 0x9a9a94 }), dustR = burst(u, { s: 0.16, n: 6, color: 0x9a9a94 });
  const st = stars(u, { s: 0.08, n: 4, color: 0xffd24a });
  const sweat = flies(many(DROP(1.4 * u), 2, 0.7));
  mat.position.set(px, floor - 0.01 * u, 0);                    // the mat's top at y 0
  bell.position.set(px, floor + 0.2 * u, 0.12 * u);
  who.group.position.set(px, floor, pz);
  group.add(who.group, mat, bell, dustL, dustR, st, sweat);
  const loop = 7;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { bow: [0.8, 0.7], lift: [1.5, 0.9, 'out'], drop: [4.2, 0.4, 'in'] });
      const f = T.lift - T.drop, axisY = 0.2 + 0.3 * f;         // the bar's axis height (0.2 on the mat, 0.5 at the chest)
      const bowK = T.bow * (1 - T.lift);
      const handK = T.bow * (1 - between(v, 4.6, 4.8));
      const holdK = between(v, 2.4, 2.7) * (1 - between(v, 3.9, 4.2));
      const tr = pre ? 0 : tremble(v, 1.2) * 0.005 * u * holdK;  // the strain shake, about 0.005 u
      who.pose(!pre && v >= 5.0 && v < 6.6 ? 'Victory' : 'Idle', !pre && v >= 5.0 && v < 6.6 ? v - 5.0 : t);
      who.group.position.set(px + 0.5 * tr, floor, pz);
      who.bow(bowK);
      // the palm against the bar: from above while it lies on the mat, from behind when it is at his chest; grip wants
      // world points, so the group-local grip points go through localToWorld. r is a hair negative: the bar is thin, so
      // the palm closes on it (a grip), which also brings the wrists to the bar for the goals
      const tow = W.set(0, -Math.cos(f * Math.PI / 2), Math.sin(f * Math.PI / 2));
      who.grip('R', group.localToWorld(W2.set(px - 0.13 * u, floor + axisY * u, 0.12 * u)), tow, -0.025 * u, handK);
      who.grip('L', group.localToWorld(W3.set(px + 0.13 * u, floor + axisY * u, 0.12 * u)), tow, -0.025 * u, handK);
      bell.position.set(px + tr, floor + axisY * u + 0.6 * tr, 0.12 * u);
      const held = f > 0.06;                                    // the plates stand on the mat only at the ends of the loop
      plateL.userData.flies = held; plateR.userData.flies = held;
      // the thud: the kanji jumps 0.06 u and back, and a grey dust burst at each plate's foot
      poseGlyph(stage, 0, pre ? 0 : bump(v, 4.6, 0.3) * 0.06 * u);
      const thud = pre ? 0 : bump(v, 4.6, 0.4);
      // the dust kicks out just beside each disc's foot (in the foot's own column the plate would read sunk into it)
      pop(dustL, thud, px - 0.51 * u, floor + 0.02 * u, 0.12 * u);
      pop(dustR, thud, px + 0.51 * u, floor + 0.02 * u, 0.12 * u);
      st.rotation.y = v * 2;
      pop(st, pre ? 0 : bump(v, 5.2, 1.2), px, floor + 1.05 * u, pz + 0.05 * u);
      for (let i = 0; i < 2; i++) {                             // sweat drops fly off his head while he holds it
        const sw = pre ? 0 : holdK, f0 = (((v - 2.4 + i * 0.9) % 1.8 + 1.8) % 1.8) / 1.8;
        sweat.set(i, px + (i ? 0.12 : -0.12) * u, floor + (0.8 - 0.3 * f0) * u, -0.05 * u, sw * (f0 < 1 ? 1.2 * Math.sin(Math.PI * f0) : 0), 0, 0, 0);
      }
      sweat.commit();
    },
  };
}

export const SCENES = { 'q-power': power };
