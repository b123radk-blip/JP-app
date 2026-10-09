// Gesture kit for the Quaternius people (Step 3a): actions their clips do not have (eat, drink, phone, wave, bow, nod,
// point, read, write, listen, look, sleep), layered on a clip. Every frame: a.pose(clip, t), then gestures, each with a
// 0..1 amount (0 = the clip's own pose). Arms reach with two-bone IK in world space, so a gesture works from any clip and
// any facing; heads and backs turn about the actor's own axes. pose() restores what was written, so nothing piles up.
//   const a = actor('guy', 0.85 * u); ...  a.pose('Idle', t); a.handTo('R', a.at('mouth'), k); a.carry(cup, 'R', grip);
// Landmarks (a.at): mouth, earR / earL, eyes, chest, front (a hand held out), lap, over (above the head), in the actor's
// own frame, following the head. People share one rig, so this works on all 16 (docs/MODELS.md).
import * as THREE from 'three';
import { createModel } from '../models.js';

// the pack's people have near-black skin with white eye shapes; on the app's dark skies they read as silhouettes
export const SKIN = { Skin: 0xf0c49c, Face: 0x2a1c18 };
const SIDE = { R: -1, L: 1 };                   // the actor's right hand is on its -x side (it faces +z, the viewer)
// landmarks in heights, relative to the Head bone (head ones) or the feet; x is to the actor's left
const HEAD = { mouth: [0, 0.07, 0.17], eyes: [0, 0.15, 0.2], earR: [-0.2, 0.12, 0.02], earL: [0.2, 0.12, 0.02], over: [0, 0.42, 0.06] };
const BODY = { chest: [0, 0.5, 0.2], front: [0, 0.48, 0.34], lap: [0, 0.32, 0.22] };

const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3(), v5 = new THREE.Vector3();
const q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), q3 = new THREE.Quaternion(), qa = new THREE.Quaternion();

// turn `bone` by the WORLD rotation q (keeps its children attached)
function turnWorld(bone, q) {
  bone.getWorldQuaternion(q2); bone.parent.getWorldQuaternion(q3);
  bone.quaternion.copy(q3.invert().multiply(q).multiply(q2));
  bone.updateMatrixWorld(true);
}
// rotate bone so its child's direction (from the bone) goes from `from` to `to` (world vectors)
const aim = (bone, from, to) => turnWorld(bone, q1.setFromUnitVectors(from.normalize(), to.normalize()));

export function actor(name, h, { tint = SKIN } = {}) {
  const m = createModel(name, { height: h, tint }), g = m.group, bones = {};
  for (const n of ['Head', 'Neck', 'Torso', 'Abdomen', 'Hips', 'UpperArmR', 'LowerArmR', 'FistR', 'UpperArmL', 'LowerArmL', 'FistL']) bones[n] = m.node(n);
  const ok = !!bones.Head && !!bones.FistR;
  const axis = (x, y, z) => v5.set(x, y, z).applyQuaternion(g.getWorldQuaternion(qa)).normalize();
  const refresh = () => g.updateWorldMatrix(true, true);
  const scale = () => g.getWorldScale(v4).y * h;           // the actor's height in world units
  // the head's rest turn in the actor's frame (landmarks on the head follow it from there)
  const headRest = new THREE.Quaternion();
  if (ok) { refresh(); bones.Head.getWorldQuaternion(headRest).premultiply(g.getWorldQuaternion(qa).invert()); }

  const a = {
    ...m, h, ok,
    // the clip pose; always first
    pose(clip, t, loop) { m.pose(clip, t, loop); if (ok) refresh(); },
    // a landmark in world space (out: a Vector3); offsets in heights
    at(name, out = new THREE.Vector3(), dx = 0, dy = 0, dz = 0) {
      const o = HEAD[name] ?? BODY[name], s = scale(), gq = g.getWorldQuaternion(qa);
      v1.set((o[0] + dx) * s, (o[1] + dy) * s, (o[2] + dz) * s).applyQuaternion(gq);
      if (!ok || !HEAD[name]) return g.getWorldPosition(out).add(v1);
      // follows the head: its turn since the rest pose (nods and bows carry the landmark along)
      const rest = q3.copy(gq).multiply(headRest), rot = bones.Head.getWorldQuaternion(q2).multiply(rest.invert());
      return bones.Head.getWorldPosition(out).add(v1.applyQuaternion(rot));
    },
    // a point in the actor's own frame (heights; x to its left, z toward its front) -> world
    local(x, y, z, out = new THREE.Vector3()) { g.getWorldPosition(out); const s = scale(); return out.add(v1.set(x * s, y * s, z * s).applyQuaternion(g.getWorldQuaternion(qa))); },
    // two-bone IK: the fist of `side` ('R' / 'L') reaches world point `target` (amount k); the elbow bends out and down
    handTo(side, target, k = 1, { out = 0.6, down = 0.8 } = {}) {
      if (!ok || k <= 0) return;
      const up = bones[`UpperArm${side}`], lo = bones[`LowerArm${side}`], fist = bones[`Fist${side}`];
      const s0 = up.quaternion.clone(), l0 = lo.quaternion.clone();
      const S = up.getWorldPosition(new THREE.Vector3()), E = lo.getWorldPosition(new THREE.Vector3()), W = fist.getWorldPosition(new THREE.Vector3());
      const la = S.distanceTo(E), lb = E.distanceTo(W), T = target.clone(), d = T.clone().sub(S);
      const dist = THREE.MathUtils.clamp(d.length(), Math.abs(la - lb) + 1e-4, (la + lb) * 0.999);
      d.setLength(dist);
      // elbow: law of cosines, bent toward the pole (out to the side and down)
      const pole = axis(SIDE[side] * out, -down, -0.15).clone(), n = d.clone().normalize();
      pole.sub(n.clone().multiplyScalar(pole.dot(n))).normalize();
      const cosA = (la * la + dist * dist - lb * lb) / (2 * la * dist), sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
      const Ew = S.clone().add(n.clone().multiplyScalar(la * cosA)).add(pole.multiplyScalar(la * sinA));
      aim(up, v2.copy(E).sub(S), v3.copy(Ew).sub(S));
      lo.getWorldPosition(E); fist.getWorldPosition(W);
      aim(lo, v2.copy(W).sub(E), v3.copy(S).add(d).sub(E));
      if (k < 1) { up.quaternion.slerpQuaternions(s0, up.quaternion.clone(), k); lo.quaternion.slerpQuaternions(l0, lo.quaternion.clone(), k); }
      refresh();
    },
    // turn a bone about the actor's own axis (x: its left, so +x tips the head / back forward; y: up; z: front), radians
    turn(bone, ax, ay, az) {
      const b = bones[bone] ?? m.node(bone); if (!b) return;
      if (ax) turnWorld(b, q1.setFromAxisAngle(axis(1, 0, 0), ax));
      if (ay) turnWorld(b, q1.setFromAxisAngle(axis(0, 1, 0), ay));
      if (az) turnWorld(b, q1.setFromAxisAngle(axis(0, 0, 1), az));
      refresh();
    },
    fist(side, out = new THREE.Vector3()) { return ok ? bones[`Fist${side}`].getWorldPosition(out) : g.getWorldPosition(out); },
    // put a prop (a child of `space`, usually the scene group) in the hand: grip [x, y, z] in heights in the actor's frame
    carry(prop, side, space, grip = [0, 0, 0]) {
      const k = scale(), p = a.fist(side, new THREE.Vector3()).add(v1.set(grip[0], grip[1], grip[2]).multiplyScalar(k).applyQuaternion(g.getWorldQuaternion(qa)));
      prop.position.copy(space.worldToLocal(p));
    },
  };
  // ---- gestures (amount k: 0 = the clip's pose, 1 = full) ----
  Object.assign(a, {
    // eat / drink: the hand comes up to the mouth; the head dips to meet it a little
    toMouth(side, k) { a.turn('Head', 0.12 * k); a.handTo(side, a.at('mouth', new THREE.Vector3(), SIDE[side] * 0.02, -0.02, 0.06), k); },
    // drink from a cup: the head tips back as the cup tips
    sip(side, k) { a.turn('Head', -0.3 * k); a.handTo(side, a.at('mouth', new THREE.Vector3(), SIDE[side] * 0.02, -0.03, 0.07), Math.min(1, k * 1.6)); },
    // a phone or cupped hand at the ear
    toEar(side, k) { a.turn('Head', 0, 0, -SIDE[side] * 0.15 * k); a.handTo(side, a.at(`ear${side}`, new THREE.Vector3(), SIDE[side] * 0.03, 0, 0.03), k); },
    cupEar(side, k) { a.turn('Head', 0, SIDE[side] * 0.25 * k, -SIDE[side] * 0.12 * k); a.handTo(side, a.at(`ear${side}`, new THREE.Vector3(), SIDE[side] * 0.06, 0, -0.01), k); },
    // a hand flat over the eyes, looking into the distance (the head turns toward `look`, radians)
    shadeEyes(side, k, look = 0) { a.turn('Head', -0.1 * k, look * k); a.handTo(side, a.at('eyes', new THREE.Vector3(), 0, 0.06, 0.04), k); },
    // wave: the hand up beside the head, swinging (phase: seconds)
    wave(side, k, phase = 0) { a.handTo(side, a.local(SIDE[side] * (0.32 + 0.07 * Math.sin(phase * 9)), 0.98, 0.12), k, { out: 0.9, down: 0.4 }); },
    // point the arm straight at a world point
    point(side, target, k) {
      const S = bones[`UpperArm${side}`].getWorldPosition(new THREE.Vector3()), d = target.clone().sub(S).setLength(0.42 * scale());
      a.handTo(side, S.add(d), k, { out: 0.3, down: 1 });
    },
    // both hands in front of the chest, apart (holding a book open, a bowl, a box)
    hold(k, { apart = 0.2, y = 0.44, z = 0.3 } = {}) {
      a.handTo('R', a.local(-apart / 2, y, z), k); a.handTo('L', a.local(apart / 2, y, z), k);
    },
    // bow (お辞儀): the back and head tip forward; hands stay at the sides
    bow(k) { a.turn('Abdomen', 0.55 * k); a.turn('Torso', 0.4 * k); a.turn('Head', 0.2 * k); },
    nod(k, t = 0) { a.turn('Head', 0.28 * k * Math.max(0, Math.sin(t * 7))); },
    shake(k, t = 0) { a.turn('Head', 0, 0.45 * k * Math.sin(t * 9)); },
    // a writing hand: the fist scribbles over a point on a table or page
    write(side, target, k, t = 0) { a.turn('Head', 0.3 * k); a.handTo(side, target.clone().add(a.local(0.03 * Math.sin(t * 11), 0.01 * Math.abs(Math.sin(t * 5.5)), 0.02 * Math.sin(t * 3)).sub(a.local(0, 0, 0))), k); },
  });
  return a;
}
