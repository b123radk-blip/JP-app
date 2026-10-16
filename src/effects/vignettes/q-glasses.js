// 眼鏡 (plan 020, card w1577670): an old man peers at the kanji, which wobbles, blurry, until he puts on his glasses.
// Loop 8 s: 0-1.4 Idle, holding the glasses upright in front of his chest with both hands at the hinges, his head
// turned toward the kanji and squinting; the kanji jiggles (0-2.6). 1.4-2.4 both hands lift the glasses to his face
// (the glasses blend from the chest place to the onEyes place, the grips following the hinges). 2.4-2.6 they settle
// on his eyes and the kanji goes still. 3.0-3.4 a small white four-point star glints on his left lens. 3.4-5.2 he
// looks at the kanji, pleased, and nods twice, the glasses staying on his eyes. 5.2-6.0 both hands come back to the
// hinges. 6.0-7.0 he takes them off (blend back to the chest place, both hands with them) and the kanji starts
// wobbling again from 6.4. 7.0-8.0 Idle, holding them at his chest, so the loop ends where it began. The glasses are
// sized from his face (shape().eyes) and are worn with onEyes every frame; the hands grip the ends (hinges) with the
// palm against them, never inside the frame.
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { burst } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { pop, ADULT } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), Q0 = new THREE.Quaternion();

function glassesScene(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u;
  const who = actor('grandpa', ADULT * u);
  // the glasses, sized from his face: rings over his eyes (centres ±0.06 hu, radius 0.045 hu, a 0.015 hu wire),
  // a thin bridge between the inner edges, end pieces out to the hinges at his half-face width, and the arms straight
  // back from the hinges to his ears
  const hu = ADULT * u, e = who.shape().eyes, hx = e.half * hu, ringR = 0.045 * hu;
  const cx = 0.06 * hu, armLen = (e.z - who.shape().mid.z + 0.02) * hu, T = 0.008 * hu, tab = hx + 0.02 * hu;
  const lenses = solidProp([
    [G.torus(ringR, 0.015 * hu, Math.PI * 2, cx, 0, 0), 0x202020],
    [G.torus(ringR, 0.015 * hu, Math.PI * 2, -cx, 0, 0), 0x202020],
    [G.box(0.03 * hu, 0.01 * hu, T, 0, 0.01 * hu, 0), 0x202020],
    [G.box(tab - (cx + ringR), 0.012 * hu, T, (tab + cx + ringR) / 2, 0, 0), 0x202020],
    [G.box(tab - (cx + ringR), 0.012 * hu, T, -(tab + cx + ringR) / 2, 0, 0), 0x202020],
  ], 0.35);
  const arms = solidProp([
    [G.box(T, 0.015 * hu, armLen, hx, 0, -armLen / 2), 0x202020],
    [G.box(T, 0.015 * hu, armLen, -hx, 0, -armLen / 2), 0x202020],
  ], 0.35);
  const glasses = new THREE.Group(); glasses.add(lenses, arms);
  const worn = new THREE.Object3D();                                    // helper: where onEyes puts the glasses, each frame
  const glint = burst(u, { s: 0.05, n: 4, color: 0xffffff });
  lenses.name = 'lenses'; arms.name = 'arms';
  group.add(who.group, glasses, worn, glint);
  const chest = new THREE.Vector3(X(0.56), floor + 0.465 * u, 0.13 * u); // the glasses' middle at his chest
  const loop = 8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const ws = group.getWorldScale(W2).y;
      who.pose('Idle', t);
      who.group.position.set(X(0.55), floor, 0);
      who.turn('Head', 0.08, -0.28);                                    // toward the kanji, and there all along
      // the kanji jiggles until the glasses are on (eased out by 2.6), and again from 6.4
      const wob = pre ? 0 : v < 2.6 ? 1 - between(v, 2.4, 2.6) : v >= 6.4 ? between(v, 6.4, 6.8) : 0;
      for (let si = 0; si < ctx.strokes.length; si++) {
        const j = wob * 0.015 * u;
        stage.offset(si, j * Math.sin(v * 30 + si * 1.7), j * Math.cos(v * 27 + si), 0);
      }
      // the glasses: at the chest (0-1.4, 7-8) or on his eyes (2.4-6), blended between; the grips follow the hinges
      let on = pre ? 0 : between(v, 1.4, 2.4) * (1 - between(v, 6.0, 7.0));
      on = on * on * (3 - 2 * on);
      who.onEyes(worn, group, { out: 0.03 });
      if (on >= 1) { glasses.position.copy(worn.position); glasses.quaternion.copy(worn.quaternion); }
      else if (on <= 0) { glasses.position.copy(chest); glasses.quaternion.copy(Q0); }
      else { glasses.position.lerpVectors(chest, worn.position, on); glasses.quaternion.slerpQuaternions(Q0, worn.quaternion, on); }
      const k = pre ? 0 : Math.max(1 - between(v, 2.6, 3.0), between(v, 5.2, 6.0));   // both hands at the hinges
      if (k > 0) for (const [side, s] of [['L', 1], ['R', -1]]) {           // his left hand (the learner's right) at +x
        const H = W.set(s * (hx - 0.01 * hu), 0, 0).applyQuaternion(glasses.quaternion).add(glasses.position);
        const Tw = group.localToWorld(H);
        const C = group.localToWorld(W2.copy(glasses.position));
        who.grip(side, Tw, C.sub(Tw).normalize(), 0.01 * u * ws, k);
      }
      // a glint on his left lens, 3.0-3.4
      const gp = W.set(0.06 * hu, 0.01 * hu, 0.02 * hu).applyQuaternion(glasses.quaternion).add(glasses.position);
      pop(glint, pre ? 0 : bump(v, 3.0, 0.4), gp.x, gp.y, gp.z);
      who.nod(pre ? 0 : bump(v, 3.4, 0.9) + bump(v, 4.5, 0.9), v);         // twice, pleased
    },
  };
}

export const SCENES = { 'q-glasses': glassesScene };
