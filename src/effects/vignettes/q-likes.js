// Model scenes, likes, dislikes and bad days (Step 3a model pass).
//   q-refuse  嫌: a mum holds a spoon of green peas out to a child; the child turns her head away, arms crossed, and
//             shakes her head: イヤ!; outcome stink: the child holds her nose over a smelly sock (green fumes) and
//             pushes it away with her foot: くさい! (嫌い)
//   q-flower  美: a flower grows up and opens beside a person, sparkling; she gasps, hands to her cheeks: きれい!;
//             outcome yum: she bites a rice ball, her cheeks glow pink, she nods, hearts: おいしい! (美味しい)
//   q-late    遅: a pupil with a slice of toast in her mouth runs past under a big clock whose hands spin: ちこく!
//   q-mud     汚: a person walks into a puddle; mud splashes up and his clothes are spotted brown; he looks down: あ〜あ;
//             outcome dishes: flies buzz round a pile of dirty plates; a person holds her nose and leans away: きたない! (汚い)
//   q-sick    病: a person in bed with an ice bag on his head and a red nose; 39° over him; he sits up and sneezes
//             (ハクション!) and lies back; pills and a glass of water by the bed; outcome germs: green germs with faces
//             circle over him (病気)
//   q-shrug   多分: a person looks up at a grey cloud, shrugs with her palms up (?), then opens an umbrella, just in case
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, DROP, HEART, stars } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { emblemProp } from '../pieces/kit-props.js';
import { between, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, hearts, person, KID } from './q-common.js';
import { bed } from './q-bed.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
const crossArms = (p, k) => { p.handTo('R', p.local(0.12, 0.52, 0.12, W), k, { out: 0.6, down: 0.9 }); p.handTo('L', p.local(-0.12, 0.5, 0.14, W), k, { out: 0.6, down: 0.9 }); };

// ---- 嫌 / 嫌い ----
function refuse(ctx, spec, stage) {
  if (spec.outcome === 'stink') return stink(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.35 * u, mx = kx + 0.6 * u;
  const kid = person(spec.who, u, KID + 0.15), mum = person(spec.other, u), no = label(u, 'イヤ!', '#c03a3a', 0.14);
  const spoon = solidProp([[G.sphere(0.04 * u, 0, 0, 0, 1.2, 0.45, 1), 0xc8ccd4], [G.cyl(0.008 * u, 0.008 * u, 0.22 * u, 0.13 * u, 0.01 * u, 0, 0, 0, Math.PI / 2), 0xc8ccd4]], 0.5);
  const peas = many([[G.sphere(0.017 * u), 0x48c040]], 4, 0.7);
  group.add(kid.group, mum.group, spoon, peas, no);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      kid.pose('Idle', t); kid.group.position.set(kx, floor, 0.12 * u);
      mum.pose('Idle', t + 1); mum.group.position.set(mx, floor, 0.0); mum.group.rotation.y = LEFT + 0.5;
      // the spoon comes toward the child's mouth (twice); she turns her head right away and crosses her arms
      const reach = pre ? 0.3 : 0.3 + 0.7 * (bump(v, 0.4, 2.0) + bump(v, 2.8, 2.2) * 1.0);
      const mouth = kid.at('mouth', W2, 0, 0, 0.12), from = mum.local(-0.12, 0.5, 0.3, new THREE.Vector3());
      const at = from.lerp(mouth, Math.min(1, reach) * 0.85);
      spoon.position.copy(group.worldToLocal(at.clone())); spoon.rotation.y = mum.group.rotation.y + RIGHT;
      for (let i = 0; i < 4; i++) peas.set(i, spoon.position.x + 0.02 * u * ((i % 2) - 0.5), spoon.position.y + 0.02 * u + 0.012 * u * (i > 1), spoon.position.z + 0.015 * u * (i > 1 ? 1 : -1), 1);
      peas.commit();
      mum.handTo('R', at.addScaledVector(W.set(Math.cos(mum.group.rotation.y), 0, -Math.sin(mum.group.rotation.y)), 0.14 * u * group.getWorldScale(W2).y), 1, { out: 0.6, down: 0.8 });
      const no1 = pre ? 0 : between(v, 0.9, 1.2) * (1 - between(v, 5.6, 6.0));
      kid.group.rotation.y = RIGHT - 0.5 - 1.3 * no1; kid.turn('Head', -0.1 * no1, -0.5 * no1); crossArms(kid, no1);
      kid.shake(pre ? 0 : bump(v, 3.4, 1.6), v);
      pop(no, pre ? 0 : bump(v, 1.0, 4.4) > 0.3 ? 1 : 0, kx - 0.05 * u, floor + 0.78 * u, 0.15 * u);
    },
  };
}
function stink(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.45 * u, sx = kx + 0.35 * u;
  const kid = person(spec.who, u, KID + 0.1), ugh = label(u, 'くさい!', '#5a9a3a', 0.14), fumes = many(PUFF(u, 0x7ad050), 6, 0.6);
  const sock = solidProp([[G.box(0.07 * u, 0.16 * u, 0.06 * u, 0, 0.08 * u, 0), 0xf4f4f0], [G.box(0.12 * u, 0.06 * u, 0.06 * u, 0.03 * u, 0.0, 0), 0xf4f4f0], [G.box(0.072 * u, 0.03 * u, 0.062 * u, 0, 0.14 * u, 0), 0xe04848], [G.box(0.072 * u, 0.02 * u, 0.062 * u, 0, 0.1 * u, 0), 0xe04848]], 0.4);
  group.add(kid.group, sock, fumes, ugh);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pinch: [0.5, 0.3], push: [2.6, 0.6], away: [2.9, 0.8, 'out'], back: [5.4, 0.5] });
      kid.pose('Idle', t); kid.group.position.set(kx, floor, 0.1 * u); kid.group.rotation.y = RIGHT - 0.4;
      // she leans back holding her nose; then shoves the sock away with her foot
      const p = T.pinch * (1 - T.back);
      kid.handTo('R', kid.at('mouth', W, 0, 0.035, 0.05), p, { out: 0.5, down: 0.8 }); kid.turn('Abdomen', -0.15 * p); kid.turn('Head', -0.15 * p, -0.3 * p);
      kid.handTo('L', kid.local(0.3, 0.35, 0.1, W), p, { out: 0.7, down: 0.6 });
      const kick = T.push * (1 - T.away);
      kid.turn('UpperLegL', -0.7 * kick);
      const sx2 = sx + 0.6 * u * T.away * (1 - T.back);
      sock.position.set(sx2, floor, 0.1 * u); sock.rotation.z = -0.4 * T.away * (1 - T.back);
      wisps(fumes, 0, 6, sx2, floor + 0.12 * u, pre ? 0 : v, u, { period: 1.4, rise: 0.5, size: 0.8, on: 1 }); fumes.commit();
      pop(ugh, pre ? 0 : between(v, 0.8, 1.1) * (1 - between(v, 5.0, 5.4)), kx, floor + 0.85 * u, 0.15 * u);
    },
  };
}

// ---- 美 / 美味しい ----
function flower(ctx, spec, stage) {
  if (spec.outcome === 'yum') return yum(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, fx = px + 0.45 * u;
  const p = person(spec.who, u), wow = label(u, 'きれい!', '#e0407a', 0.14), sparkle = stars(u, { r: 0.22, s: 0.07, n: 4 });
  const stem = solidProp([[G.cyl(0.012 * u, 0.012 * u, 1, 0, 0.5, 0), 0x3a9a3a], [G.sphere(0.05 * u, 0.05 * u, 0.3, 0, 1, 0.3, 0.6), 0x48b048]], 0.4);
  const bloom = solidProp([...Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return [G.sphere(0.06 * u, Math.cos(a) * 0.07 * u, Math.sin(a) * 0.07 * u, 0, 1, 1, 0.4), 0xff6a9a]; }), [G.sphere(0.045 * u, 0, 0, 0.01 * u), 0xffd040]], 0.8);
  const pot = solidProp([[G.cyl(0.09 * u, 0.07 * u, 0.13 * u, 0, 0.065 * u, 0), 0xc0603a]], 0.4);
  pot.position.set(fx, floor, 0.05 * u);
  group.add(p.group, pot, stem, bloom, sparkle, wow);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { grow: [0.2, 1.2, 'out'], open: [1.4, 0.6, 'back'], gasp: [1.9, 0.3], close: [5.6, 0.6] });
      const g = pre ? 0 : T.grow * (1 - T.close), o = pre ? 0 : T.open * (1 - T.close);
      const top = 0.13 * u + 0.5 * u * g;
      stem.position.set(fx, floor + 0.13 * u, 0.05 * u); stem.scale.set(1, Math.max(0.001, top - 0.13 * u), 1); stem.visible = g > 0.02;
      bloom.position.set(fx, floor + top, 0.07 * u); bloom.scale.setScalar(grow(0.25 + 0.75 * o) * (g > 0.02 ? 1 : 0.001)); bloom.rotation.z = 0.3 * Math.sin(v);
      sparkle.visible = o > 0.5; sparkle.position.set(fx, floor + top, 0.08 * u); sparkle.rotation.z = v * 1.5; sparkle.scale.setScalar(grow(o));
      p.pose('Idle', t); p.group.position.set(px, floor, 0.05 * u); p.group.rotation.y = RIGHT - 0.6;
      const k = T.gasp * (1 - between(v, 5.0, 5.4));
      p.handTo('R', p.at('mouth', W, -0.07, 0.02, 0.04), k, { out: 0.6, down: 0.9 }); p.handTo('L', p.at('mouth', W, 0.07, 0.02, 0.04), k, { out: 0.6, down: 0.9 });
      p.turn('Abdomen', -0.1 * k); p.turn('Head', -0.1 * k);
      pop(wow, k, px - 0.05 * u, floor + 1.12 * u, 0.15 * u);
    },
  };
}
function yum(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.5 * u;
  const p = person(spec.who, u), say = label(u, 'おいしい!', '#e07a3a', 0.14), hs = many(HEART(u, 0.1), 3, 1);
  const tri = new THREE.Shape(); tri.moveTo(-1, -0.8); tri.lineTo(1, -0.8); tri.lineTo(0, 0.95); tri.lineTo(-1, -0.8);
  const ball = solidProp([[G.extrude(tri, 0.6).scale(0.07 * u, 0.07 * u, 0.07 * u), 0xfaf8f0], [G.box(0.08 * u, 0.06 * u, 0.06 * u, 0, -0.04 * u, 0.0), 0x1a2a1a]], 0.6);
  const cheeks = many([[G.sphere(0.035 * u, 0, 0, 0, 1, 0.7, 0.4), 0xff7a9a]], 2, 1.2);
  group.add(p.group, ball, cheeks, hs, say);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(px, floor, 0.05 * u); p.group.rotation.y = -0.3;
      // the rice ball comes up to her mouth for a bite (twice), then she nods happily, cheeks glowing
      const bite = pre ? 0 : bump(v, 0.4, 1.0) + bump(v, 1.6, 1.0), k = pre ? A.setup : 1;
      const rest = p.local(-0.08, 0.5, 0.25, new THREE.Vector3()), mouth = p.at('mouth', W2, 0, -0.02, 0.06);
      const at = rest.lerp(mouth, bite);
      ball.position.copy(group.worldToLocal(at.clone())); ball.rotation.y = p.group.rotation.y;
      p.handTo('R', at.add(W.set(0, -0.07 * u * group.getWorldScale(W2).y, 0)), k, { out: 0.6, down: 0.8 });
      const glow = pre ? 0 : between(v, 2.8, 3.2) * (1 - between(v, 5.2, 5.6));
      for (const [i, s] of [[0, -1], [1, 1]]) { p.at('mouth', W, 0.06 * s, 0.035, 0.0); group.worldToLocal(W); cheeks.set(i, W.x, W.y, W.z, glow, 0, p.group.rotation.y); }
      cheeks.commit();
      p.nod(glow, v);
      hearts(hs, 3, px + 0.15 * u, floor + 1.0 * u, 0.15 * u, pre ? -1 : v, 3.0, u);
      pop(say, glow, px - 0.05 * u, floor + 1.12 * u, 0.15 * u);
    },
  };
}

// ---- 遅 ----
function late(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.1 * u, xe = xs + 1.3 * u;
  const p = person(spec.who, u, 0.8), clock = emblemProp('clock', 0.38 * u), say = label(u, 'ちこく!', '#c03a3a', 0.14);
  const toast = solidProp([[G.box(0.12 * u, 0.12 * u, 0.02 * u, 0, 0, 0), 0xe0a050], [G.box(0.1 * u, 0.1 * u, 0.022 * u, 0, -0.005 * u, 0), 0xf8e8c0]], 0.5);
  const bag = solidProp([[G.box(0.14 * u, 0.16 * u, 0.08 * u, 0, 0, 0), 0x2a3a6a]], 0.4);
  clock.position.set(xs + 0.65 * u, floor + 1.3 * u, -0.2 * u);
  group.add(p.group, clock, toast, bag, say);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // she runs across (left to right) in a hurry, again and again; the clock's hands spin round
      const f = pre ? 0.3 : between(v, 0.2, 3.6);
      p.pose(pre ? 'Idle' : 'Run', pre ? t : v * 1.2); p.group.position.set(lerp(xs, xe, f), floor, 0.1 * u); p.group.rotation.y = RIGHT - 0.2;
      p.group.visible = pre || (v > 0.2 && v < 3.6);
      clock.idle(pre ? 0 : v * 6);
      p.at('mouth', W, 0, -0.01, 0.06); toast.position.copy(group.worldToLocal(W)); toast.rotation.set(0, p.group.rotation.y, 0.3);
      toast.visible = bag.visible = p.group.visible;
      p.local(0, 0.6, -0.12, W); bag.position.copy(group.worldToLocal(W)); bag.rotation.y = p.group.rotation.y;
      pop(say, pre ? 0 : (v > 0.4 && v < 3.4 ? 1 : 0), lerp(xs, xe, f), floor + 0.92 * u, 0.15 * u);
    },
  };
}

// ---- 汚 ----
function mud(ctx, spec, stage) {
  if (spec.outcome === 'dishes') return dishes(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.2 * u, xp = xs + 0.6 * u;
  const p = person(spec.who, u), oh = label(u, 'あ〜あ', '#8a5a2a', 0.13), drops = many([[G.sphere(0.025 * u), 0x6a4020]], 10, 0.4), spots = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 1, 0.5), 0x5a3418]], 8, 0.3);
  const puddle = solidProp([[G.cyl(0.25 * u, 0.25 * u, 0.01 * u, 0, 0.005 * u, 0, 0, 0, 0, 24), 0x6a4a28]], 0.3);
  puddle.position.set(xp, floor, 0.12 * u); puddle.scale.z = 0.6;
  const SPOTS = [[0.05, 0.6, 0.1], [-0.08, 0.5, 0.1], [0.02, 0.42, 0.1], [-0.06, 0.3, 0.07], [0.07, 0.22, 0.06], [-0.04, 0.12, 0.06], [0.1, 0.7, 0.08], [-0.02, 0.8, 0.09]];
  group.add(puddle, p.group, drops, spots, oh);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0.1, 1.3, 'linear'], back: [5.4, 0.9, 'linear'] });
      const walking = !pre && ((v > 0.1 && v < 1.4) || v > 5.4);
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(lerp(xs, xp, T.walk * (1 - T.back)), floor, 0.12 * u); p.group.rotation.y = v > 5.4 ? LEFT + 0.3 : RIGHT - 0.3;
      // splash: brown drops fly up round him; his clothes come out spotted; he looks down at himself
      const sp = pre ? -1 : between(v, 1.35, 2.1);
      for (let i = 0; i < 10; i++) { const a = i * 0.63; drops.set(i, xp + Math.cos(a) * 0.3 * u * sp, floor + 0.5 * u * Math.sin(Math.PI * sp) * (0.6 + 0.4 * ((i * 0.37) % 1)), 0.12 * u + Math.sin(a) * 0.15 * u * sp, sp > 0 && sp < 1 ? 1 : 0); }
      drops.commit();
      const dirty = pre ? 0 : between(v, 1.5, 2.0) * (1 - between(v, 6.2, 6.4));
      SPOTS.forEach(([x, y, z], i) => { p.local(x, y, z, W); group.worldToLocal(W); spots.set(i, W.x, W.y, W.z, dirty, 0, p.group.rotation.y); });
      spots.commit();
      const look = pre ? 0 : between(v, 2.1, 2.4) * (1 - between(v, 5.0, 5.3));
      p.turn('Head', 0.5 * look); p.turn('Abdomen', 0.1 * look);
      p.handTo('R', p.local(-0.35, 0.55, 0.15, W), look, { out: 0.8, down: 0.6 }); p.handTo('L', p.local(0.35, 0.55, 0.15, W), look, { out: 0.8, down: 0.6 });
      pop(oh, look, xp, floor + 1.1 * u, 0.15 * u);
    },
  };
}

function dishes(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, sx = x0 + 0.55 * u;
  const p = person(spec.who, u), ugh = label(u, 'きたない!', '#8a5a2a', 0.13), flies = many([[G.sphere(0.03 * u), 0x101010], [G.sphere(0.024 * u, 0, 0.02 * u, 0, 1.6, 0.5, 1), 0xd0e8ff]], 4, 0.3);
  const sink = solidProp([[G.box(0.5 * u, 0.45 * u, 0.35 * u, 0, 0.225 * u, 0), 0xd8dce4], [G.box(0.52 * u, 0.03 * u, 0.37 * u, 0, 0.46 * u, 0), 0xa8b0bc],
    ...[0, 1, 2, 3, 4, 5].map((i) => [G.cyl(0.17 * u, 0.12 * u, 0.03 * u, 0.025 * u * Math.sin(i * 2), 0.49 * u + 0.035 * u * i, 0.02 * u * Math.cos(i * 3)), 0xf4f0e8]),
    ...[0, 1, 2, 3, 4, 5].map((i) => [G.sphere(0.045 * u, 0.08 * u * Math.sin(i * 2.3), 0.51 * u + 0.035 * u * i, 0.13 * u, 1.4, 0.6, 0.4), [0x6a4a1a, 0x8aa030, 0x5a3a1a][i % 3]])], 0.4);
  sink.position.set(sx, floor, -0.1 * u);
  group.add(sink, p.group, flies, ugh);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.1 * u);
      // she looks at the pile of dirty plates, holds her nose and leans away; flies buzz round it
      const k = pre ? 0 : between(v, 1.0, 1.4) * (1 - between(v, 5.0, 5.5));
      p.group.rotation.y = RIGHT - 0.5 - 0.9 * k; p.turn('Abdomen', -0.12 * k);
      p.handTo('R', p.at('mouth', W, 0, 0.035, 0.05), k, { out: 0.5, down: 0.8 }); p.handTo('L', p.local(0.3, 0.45, 0.2, W), k, { out: 0.8, down: 0.8 });
      for (let i = 0; i < 4; i++) { const a = (pre ? 0 : v) * (3 + i) + i * 1.6; flies.set(i, sx + Math.cos(a) * 0.24 * u, floor + 0.75 * u + Math.sin(a * 1.3) * 0.1 * u, -0.1 * u + Math.sin(a) * 0.15 * u, 1, 0, a); }
      flies.commit();
      pop(ugh, k, x0, floor + 1.1 * u, 0.15 * u);
    },
  };
}

// ---- 病 ----
function sick(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.38 * u;
  const p = person(spec.who, u, 0.85), b = bed(u, p, x0, floor, 0.1 * u), achoo = label(u, 'ハクション!', '#3a7ac0', 0.15), temp = label(u, '39°', '#e03030', 0.14);
  const ice = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1.2, 0.5, 1), 0x7ac0ff]], 0.7), nose = solidProp([[G.sphere(0.02 * u), 0xff3030]], 1.0), puffs = many(PUFF(u, 0xf0f8ff), 5, 0.6);
  const table = solidProp([[G.box(0.2 * u, 0.2 * u, 0.18 * u, 0, 0.1 * u, 0), 0xa87a50], [G.cyl(0.03 * u, 0.025 * u, 0.1 * u, -0.04 * u, 0.25 * u, 0), 0xcfe8ff], [G.capsule(0.012 * u, 0.025 * u, 0.05 * u, 0.215 * u, 0.03 * u, Math.PI / 2), 0xe04848], [G.capsule(0.012 * u, 0.025 * u, 0.06 * u, 0.215 * u, -0.02 * u, 1.2), 0xf0f0f0]], 0.4);
  table.position.set(x0 - 0.18 * u, floor, -0.05 * u);
  const bugs = spec.outcome === 'germs' ? many([[G.sphere(0.04 * u), 0x58c040], ...[0, 1, 2, 3, 4, 5].map((i) => [G.cone(0.012 * u, 0.04 * u, Math.cos(i * 1.05) * 0.045 * u, Math.sin(i * 1.05) * 0.045 * u, 0, i * 1.05 - Math.PI / 2), 0x3a9a30]), [G.sphere(0.01 * u, -0.012 * u, 0.01 * u, 0.035 * u), 0x101010], [G.sphere(0.01 * u, 0.012 * u, 0.01 * u, 0.035 * u), 0x101010]], 5, 0.7) : null;
  group.add(p.group, b.group, table, ice, nose, puffs, achoo, temp, ...(bugs ? [bugs] : []));
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', 0.3);
      // lying ill; he sits up suddenly to sneeze, then sinks back down
      const sit = pre ? 0 : 0.7 * (between(v, 2.4, 2.8) * (1 - between(v, 3.6, 4.3)));
      b.place(sit, 0.85 - 0.4 * sit);
      p.turn('Head', 0.35 * bump(v, 2.9, 0.4));
      p.at('over', W, 0, -0.02, 0.02); ice.position.copy(group.worldToLocal(W)); ice.rotation.set(0, 0, p.group.rotation.x + Math.PI / 2 * (1 - sit));
      p.at('mouth', W, 0, 0.04, 0.05); nose.position.copy(group.worldToLocal(W)); nose.scale.setScalar(1 + 0.2 * Math.sin(v * 3));
      const sneeze = pre ? -1 : between(v, 2.9, 3.6);
      p.at('mouth', W2, 0, 0, 0.1); group.worldToLocal(W2);
      for (let i = 0; i < 5; i++) puffs.set(i, W2.x + 0.25 * u * sneeze * (0.6 + 0.1 * i), W2.y + 0.05 * u * (i - 2) * sneeze, W2.z + 0.15 * u * sneeze, sneeze > 0 && sneeze < 1 ? 1.2 * (1 - sneeze) : 0);
      puffs.commit();
      pop(achoo, pre ? 0 : bump(v, 2.9, 1.0) * 1.2, x0 + 0.55 * u, floor + 0.85 * u, 0.15 * u);
      // (germs) little green germs with faces circle over him, scattered by the sneeze and back again
      if (bugs) { p.at('over', W, 0, 0, 0); group.worldToLocal(W); for (let i = 0; i < 5; i++) { const a = v * 1.3 + i * 1.26, r = (0.22 + 0.25 * Math.max(0, sneeze) * (sneeze < 1 ? 1 : 0)) * u; bugs.set(i, W.x + 0.25 * u + Math.cos(a) * r, W.y + 0.3 * u + Math.sin(a) * r * 0.5, W.z + 0.1 * u, 1, Math.sin(v * 3 + i) * 0.4); } bugs.commit(); }
      pop(temp, pre ? 0 : between(v, 0.3, 0.6) * (1 - between(v, 2.6, 2.8) + between(v, 4.2, 4.4)) * (1 - between(v, 5.9, 6.2)), x0 + 0.2 * u, floor + 0.6 * u + 0.02 * u * Math.sin(v * 2), 0.2 * u);
    },
  };
}

// ---- 多分 ----
function shrug(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), q = label(u, '?', '#6a6a7a', 0.2), umb = emblemProp('umbrella', 0.5 * u, { color: '#e04868' }), rain = many(DROP(u), 10, 0.8);
  const cloud = solidProp([[G.sphere(0.16 * u, 0, 0, 0, 1.5, 0.8, 0.7), 0x8a909c], [G.sphere(0.12 * u, -0.18 * u, -0.03 * u, 0, 1.2, 0.8, 0.7), 0x7a808c], [G.sphere(0.12 * u, 0.2 * u, -0.04 * u, 0, 1.2, 0.8, 0.7), 0x7a808c]], 0.4);
  cloud.position.set(x0 + 0.3 * u, floor + 1.35 * u, -0.2 * u);
  group.add(p.group, cloud, umb, rain, q);
  const loop = 6.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { look: [0.3, 0.4], shrug: [1.2, 0.3], unshrug: [2.6, 0.3], open: [3.1, 0.5, 'back'], close: [5.8, 0.5] });
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.2;
      cloud.position.x = x0 + 0.3 * u + 0.05 * u * Math.sin(v * 0.8);
      // she looks up at the cloud; shrugs, palms up: rain or not?
      const look = T.look * (1 - between(v, 2.8, 3.1)), sh = T.shrug * (1 - T.unshrug);
      p.turn('Head', -0.4 * look, 0.25 * look, 0.2 * sh);
      p.handTo('R', p.local(-0.32, 0.55, 0.18, W), sh, { out: 0.9, down: 0.9 }); p.handTo('L', p.local(0.32, 0.55, 0.18, W), sh, { out: 0.9, down: 0.9 });
      p.twist('R', W2.set(0, 1, 0), sh); p.twist('L', W2.set(0, 1, 0), sh);
      pop(q, sh, x0, floor + 1.15 * u, 0.15 * u);
      // just in case: she opens an umbrella over her head; a few drops do start to fall
      const o = T.open * (1 - T.close);
      p.handTo('R', p.local(-0.08, 0.72, 0.15, W), o, { out: 0.6, down: 0.8 });
      umb.visible = o > 0.02; umb.scale.setScalar(0.5 * u * grow(o)); p.local(-0.05, 1.15, 0.12, W); umb.position.copy(group.worldToLocal(W)); umb.idle(v);
      for (let i = 0; i < 10; i++) { const f = (((pre ? 0 : v) * 0.9 + i * 0.37) % 1); rain.set(i, x0 + (((i * 0.53) % 1) - 0.3) * 0.8 * u, floor + 1.25 * u - 1.25 * u * f, -0.1 * u, !pre && v > 3.8 && v < 5.8 ? 1 : 0); }
      rain.commit();
    },
  };
}

export const SCENES = { 'q-refuse': refuse, 'q-flower': flower, 'q-late': late, 'q-mud': mud, 'q-sick': sick, 'q-shrug': shrug };
