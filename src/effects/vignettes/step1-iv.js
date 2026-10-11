// Step 1 word variants of step1-i.js (same scene types, another outcome): saltPinch, cookieJar, cookieShare, untangle
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, PUFF } from '../pieces/kit-things.js';
import { textPlane, blackboard, emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, poseGlyph, puffs, liveText, wisps } from './helpers.js';
import { grow, countTag } from './step1-kit.js';
import { person, label, pop } from './q-common.js';

const _tp = new THREE.Vector3(), _tq = new THREE.Vector3();
// slide `hand.group` so the midpoint of the index and thumb tips sits exactly on `target` (in the hand group's parent space)
export function tipsTo(hand, target) {
  hand.group.updateMatrix();
  _tp.copy(hand.rig.pointOn('f1b', 1)).add(hand.rig.pointOn('tb', 1, _tq)).multiplyScalar(0.5).applyMatrix4(hand.group.matrix);
  hand.group.position.add(target).sub(_tp);
}

export function saltPinch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const pot = solidProp([[G.cyl(0.2 * u, 0.17 * u, 0.24 * u, 0, 0.12 * u, 0), 0x404858], [G.cyl(0.19 * u, 0.19 * u, 0.01 * u, 0, 0.23 * u, 0), 0xe0a050], [G.box(0.12 * u, 0.03 * u, 0.03 * u, -0.26 * u, 0.2 * u, 0), 0x303038], [G.box(0.12 * u, 0.03 * u, 0.03 * u, 0.26 * u, 0.2 * u, 0), 0x303038]], 0.45);
  const hand = createHand({ u: 0.45 * u, sleeve: 0xe06a8a }), salt = many([[G.box(0.012 * u, 0.012 * u, 0.012 * u), 0xffffff]], 8, 1.2), steam = many([[G.sphere(0.03 * u), 0xf0f0f0]], 4, 0.6), tag = textPlane('ちょっと', { h: 0.14 * u, color: '#202838', bg: '#ffffff', pad: 0.3 });
  pot.position.set(px, floor, 0); group.add(pot, hand.group, salt, steam, tag);
  const loop = 5.0, tip = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rub = !pre && v > 1.0 && v < 2.2;
      hand.pose('pinch', 'open', rub ? 0.15 + 0.15 * Math.sin(v * 20) : 0); hand.group.visible = !pre; hand.group.rotation.set(0, 0, Math.PI + 0.3);
      // the pinching fingertips hang straight above the pot's middle; the grains leave exactly from them and fall into the soup
      hand.group.position.set(0, 0, 0); tipsTo(hand, tip.set(px, floor + 0.5 * u + 0.08 * u * (1 - between(v, 0.2, 0.8)), 0));
      for (let i = 0; i < 8; i++) { const f = pre ? 0 : between(v, 1.0 + i * 0.13, 1.6 + i * 0.13); salt.set(i, px + 0.012 * u * Math.sin(i * 2) * f, floor + 0.5 * u - 0.265 * u * f, 0.012 * u * Math.cos(i * 3) * f, f > 0 && f < 1 ? 1 : 0, i); }
      salt.commit(); wisps(steam, 0, 4, px, floor + 0.26 * u, v, u, { period: 1.6, rise: 0.4, on: pre ? 0 : 1 }); steam.commit();
      const k = pre ? 0 : between(v, 2.3, 2.6) * (1 - between(v, 4.4, 4.8)); tag.visible = k > 0.01; tag.scale.setScalar(grow(k)); tag.position.set(px + 0.38 * u, floor + 0.85 * u, 0.06 * u);
    },
  };
}

export function cookieJar(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, jx = B.maxX + 0.45 * u;
  const jar = solidProp([[G.cyl(0.18 * u, 0.18 * u, 0.36 * u, 0, 0.18 * u, 0, 0, 0, 0, 28), 0xc8e8ff]], 0.3), lid = solidProp([[G.cyl(0.15 * u, 0.15 * u, 0.04 * u, 0, 0, 0), 0xe05a3a], [G.sphere(0.04 * u, 0, 0.04 * u, 0), 0xe05a3a]], 0.45);
  jar.material.transparent = true; jar.material.opacity = 0.45;
  const cookies = many([[G.cyl(0.07 * u, 0.07 * u, 0.025 * u, 0, 0, 0, Math.PI / 2), 0xc88a48], [G.sphere(0.012 * u, 0.02 * u, 0.02 * u, 0.014 * u), 0x3a2010], [G.sphere(0.012 * u, -0.03 * u, -0.01 * u, 0.014 * u), 0x3a2010]], 2, 0.5), tag = countTag(u, { s: 0.22 }), crumbs = many([[G.sphere(0.012 * u), 0xc88a48]], 6, 0.4);
  jar.position.set(jx, floor, 0); group.add(jar, lid, cookies, tag, crumbs);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, tip = pre ? 0 : bump(v, 0.6, 2.6);
      jar.rotation.z = -0.8 * tip; lid.position.set(jx + 0.35 * u * Math.sin(0.8 * tip) + 0.2 * u * between(v, 0.6, 1.0) * (1 - between(v, 2.8, 3.2)), floor + 0.38 * u * Math.cos(0.8 * tip) + 0.04 * u, 0.02 * u); lid.rotation.z = -0.8 * tip;
      for (let i = 0; i < 2; i++) { const f = pre ? 0 : between(v, 1.1 + 0.3 * i, 1.6 + 0.3 * i); cookies.set(i, jx + 0.1 * u + (0.25 + 0.17 * i) * u * f, floor + 0.07 * u + 0.1 * u * Math.sin(Math.PI * f), 0.05 * u, 1, f * 5); }
      cookies.commit();
      for (let i = 0; i < 6; i++) crumbs.set(i, jx + 0.3 * u + 0.05 * u * i, floor + 0.01 * u, 0.06 * u, !pre && v > 1.6 ? 1 : 0);
      crumbs.commit();
      tag.show(2, pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 4.8, 5.2))); tag.position.set(jx + 0.45 * u, floor + 0.38 * u, 0.06 * u);
    },
  };
}

export function cookieShare(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, cy = B.cy;
  const halfC = () => solidProp([[new THREE.CylinderGeometry(0.17 * u, 0.17 * u, 0.04 * u, 24, 1, false, 0, Math.PI).rotateX(Math.PI / 2), 0xd09a50], [G.sphere(0.02 * u, 0.06 * u, 0.06 * u, 0.02 * u), 0x3a2010], [G.sphere(0.02 * u, 0.1 * u, -0.05 * u, 0.02 * u), 0x3a2010], [G.sphere(0.02 * u, 0.03 * u, -0.1 * u, 0.02 * u), 0x3a2010]], 0.5);
  const left = halfC(), right = halfC(), H1 = createHand({ u: 0.45 * u, sleeve: 0x3a8ae0 }), H2 = createHand({ u: 0.45 * u, sleeve: 0xe06a8a, side: -1 }), crumbs = many([[G.sphere(0.012 * u), 0xd09a50]], 6, 0.4);
  left.rotation.z = Math.PI;
  group.add(left, right, H1.group, H2.group, crumbs);
  const loop = 5.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { snap: [0.5, 0.3, 'back'], take: [1.2, 0.9, 'out'], back: [4.4, 0.8] }), s = T.snap - T.back, k = T.take - T.back;
      left.position.set(cx - 0.03 * u * s - 0.35 * u * k, cy - 0.15 * u * k, 0.02 * u); left.rotation.z = Math.PI + 0.2 * s; right.position.set(cx + 0.03 * u * s + 0.35 * u * k, cy - 0.15 * u * k, 0.02 * u); right.rotation.z = -0.2 * s;
      left.visible = right.visible = !pre;
      H1.pose('pinch'); H1.group.position.set(cx - 0.12 * u - 0.35 * u * k, cy - 0.5 * u - 0.15 * u * k, 0.04 * u); H1.group.rotation.set(0, 0, -0.5); H1.group.visible = !pre;
      H2.pose('pinch'); H2.group.position.set(cx + 0.12 * u + 0.35 * u * k, cy - 0.5 * u - 0.15 * u * k, 0.04 * u); H2.group.rotation.set(0, 0, 0.5); H2.group.visible = !pre;
      for (let i = 0; i < 6; i++) { const f = pre ? 0 : between(v, 0.6, 1.4); crumbs.set(i, cx + (i - 2.5) * 0.03 * u, cy - 0.5 * u * f * f, 0.05 * u, f > 0 && f < 1 ? 1 : 0); }
      crumbs.commit();
    },
  };
}

// 分かる: a student at a blackboard "1+1=?" scratches their head under a "?"; a light bulb switches on, the "?" turns into "!",
// they jump, and the board fills in "2": I get it!
const W3 = new THREE.Vector3();
export function untangle(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, bx = x0 + 0.78 * u, by = floor + 0.77 * u;
  const p = person(spec.who ?? 'guy2', u), board = blackboard(u, { w: 0.8, h: 0.5 }), sum = liveText(u, { h: 0.26, w: 0.7, color: '#f4f4ec', bg: '#1f4a32' });
  const q = label(u, '?', '#6a6a7a', 0.3), bang = label(u, '!', '#e0a020', 0.3), bulb = emblemProp('lightbulb', 0.36 * u, { color: '#ffe060' });
  board.position.set(bx, by, -0.12 * u); sum.position.set(bx, by, -0.1 * u);
  group.add(board, sum, p.group, q, bang, bulb);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { think: [0.3, 0.4], unthink: [2.5, 0.2], on: [2.7, 0.35, 'back'], off: [6.0, 0.5] });
      // standing beside the board, turned a little towards it; the "?" hangs over their head while they scratch it
      const jump = !pre && v > 3.1 && v < 4.1;
      p.pose(jump ? 'Jump' : 'Idle', jump ? v - 3.1 : t, !jump); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = 0.45;
      const sc = T.think * (1 - T.unthink);
      p.handTo('R', p.at('earR', W3, -0.04 - 0.02 * Math.sin(v * 16), 0.12, 0.1), sc, { out: 0.8, down: 0.3 }); p.turn('Head', 0, 0, 0.2 * sc);
      const on = T.on * (1 - T.off);
      pop(q, sc, x0 + 0.05 * u, floor + 1.22 * u, 0.1 * u);
      pop(bang, on, x0 + 0.4 * u, floor + 1.1 * u, 0.1 * u);
      bulb.visible = on > 0.01; bulb.scale.setScalar(0.36 * u * grow(on)); bulb.position.set(x0 + 0.02 * u, floor + 1.3 * u + 0.05 * u * (jump ? Math.sin((v - 3.1) * Math.PI) : 0), 0.1 * u); bulb.idle(v);
      p.nod(pre ? 0 : bump(v, 2.9, 0.4) + bump(v, 4.5, 0.5), v);
      // the board: 1+1=? until they get it, then the answer appears
      sum.set(!pre && v > 3.4 && v < 6.3 ? '1+1=2' : '1+1=?'); sum.scale.setScalar(1 + 0.25 * (pre ? 0 : bump(v, 3.5, 0.4)));
    },
  };
}
