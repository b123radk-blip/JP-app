// Batch 5 kanji, part 3.
//   post-kick      丈: a kid kicks a thick wooden post; it doesn't budge (thud rings); the kid hops holding a sore foot
//   alarm-wake     起: an alarm clock on the nightstand rings and hops; the person asleep in bed sits bolt upright, hair
//                  sticking up, and stretches
//   home-greet     帰: at dusk a person walks up the path to a house; the door opens, warm light spills out, and the
//                  family inside comes out for a hug
//   toast-run      遅: a kid runs with a slice of toast in their mouth, sweat flying, under a clock whose hands spin
//   mud-splash     汚: a person in white steps in a puddle; mud splashes up and their clothes go brown and spotty
//   hand-question  問: a kid raises a hand with a big "?" speech bubble; the grown-up beside scratches their head
import * as THREE from 'three';
import { phoneAnswer } from './variants6b.js';
import { answerCheck } from './batch6c.js';
import { birdHome, okUp, sturdyTable, sunWake, tortoiseHare } from './variants5b.js';
import { dirtyDishes, micInterview, quizBuzzer } from './variants5c.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, stars, heart, DROP } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, bonePoint } from './helpers.js';

const pop = (f) => Math.max(1e-3, f);

function postKick(ctx, spec, stage) {
  if (spec.outcome === 'weight') return sturdyTable(ctx, spec, stage);
  if (spec.outcome === 'ok') return okUp(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.35 * u;
  const post = solidProp([[G.cyl(0.12 * u, 0.13 * u, 0.7 * u, 0, 0.35 * u, 0, 0, 0, 0, 20), 0x8a5a30], [G.cyl(0.125 * u, 0.125 * u, 0.02 * u, 0, 0.7 * u, 0, 0, 0, 0, 20), 0xd8b080], [G.torus(0.13 * u, 0.012 * u).rotateX(Math.PI / 2).translate(0, 0.5 * u, 0), 0xe8d0a0], [G.torus(0.13 * u, 0.012 * u).rotateX(Math.PI / 2).translate(0, 0.46 * u, 0), 0xe8d0a0], [G.cyl(0.25 * u, 0.25 * u, 0.02 * u, 0, 0.01 * u, 0, 0, 0, 0, 20), 0x7a7a6a]], 0.35);
  post.position.set(px, floor, 0);
  const kid = createPerson({ u: 0.6 * u, shirt: 0xe04848 }), ow = stars(u, { r: 0.1, s: 0.07, n: 3 }), thud = many([[G.torus(0.08 * u, 0.008 * u), 0xffffff]], 2, 0.9);
  group.add(post, kid.group, ow, thud);
  const loop = 4.8, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { run: [0, 0.8], kick: [0.85, 0.15, 'in'], back: [1.0, 0.2] }), hop = v > 1.2 && v < 3.6;
      const kx = lerp(px + 0.9 * u, px + 0.22 * u, T.run);
      kid.reset().face('left').walk(v * 10, T.run > 0 && T.run < 1 ? 1 : 0); kid.bone('legR').rotation.x = 1.4 * (T.kick - T.back);
      if (hop) { kid.bone('legR').rotation.x = 0.6; kid.bone('shinR').rotation.x = -1.6; kid.bone('armR').rotation.x = 1.6; kid.raise('L', 1.8 + 0.4 * Math.sin(v * 9)); }
      kid.group.position.set(hop ? kx + 0.05 * u * Math.sin(v * 3) : kx, floor + (hop ? 0.06 * u * Math.abs(Math.sin(v * 7)) : 0), 0.12 * u); kid.group.scale.setScalar(pop(pre ? 1 : 1 - between(v, 4.2, 4.6))); kid.update();
      bonePoint(kid, 'head', 1.0, head); ow.visible = hop; ow.position.set(head.x, head.y + 0.03 * u, head.z); ow.rotation.y = t * 4;
      for (let i = 0; i < 2; i++) { const f = between(v, 1.0 + 0.15 * i, 1.6 + 0.15 * i); thud.set(i, px + 0.13 * u, floor + 0.15 * u, 0.1 * u, f > 0 && f < 1 ? 0.5 + 2 * f : 0, 0, Math.PI / 2); }
      thud.commit();
    },
  };
}

function alarmWake(ctx, spec, stage) {
  if (spec.outcome === 'sun') return sunWake(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.6 * u, top = floor + 0.24 * u, pu = 0.7 * u, hip = 0.39 * pu;
  const bed = solidProp([[G.box(0.8 * u, 0.2 * u, 0.34 * u, 0, 0.1 * u, 0), 0x8a5a30], [G.box(0.78 * u, 0.06 * u, 0.32 * u, 0, 0.21 * u, 0), 0xf4f4f4], [G.box(0.04 * u, 0.36 * u, 0.34 * u, -0.4 * u, 0.18 * u, 0), 0x6a4020], [G.box(0.16 * u, 0.26 * u, 0.16 * u, -0.55 * u, 0.13 * u, 0), 0xa86a38]], 0.35);
  bed.position.set(bx, floor, 0);
  const blanket = solidProp([[G.box(0.46 * u, 0.08 * u, 0.3 * u, 0, 0, 0), 0x6a8ad8]], 0.4);
  const clock = emblemProp('alarm', 0.22 * u), rings = many([[G.torus(0.07 * u, 0.007 * u), 0xffffff]], 3, 0.9);
  const p = createPerson({ u: pu, shirt: 0xf0a030 }), pivot = new THREE.Group(); pivot.add(p.group); p.group.position.y = -hip;
  const spikes = solidProp([-0.6, -0.2, 0.2, 0.6].map((a) => [G.cone(0.025 * u, 0.09 * u, Math.sin(a) * 0.08 * u, 0.06 * u + Math.cos(a) * 0.02 * u, -0.02 * u, -a), 0x3a2416]), 0.4);
  p.rig.attach('head', spikes, 0.85);
  group.add(bed, blanket, clock, rings, pivot);
  const loop = 5.2, cx = bx - 0.55 * u, cy = floor + 0.38 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { up: [1.3, 0.25, 'back'], down: [4.5, 0.6] }), ring = !pre && v > 0.4 && v < 2.4;
      const lie = pre ? 1 : 1 - (T.up - T.down);
      p.reset().face('right'); p.bone('legL').rotation.x = p.bone('legR').rotation.x = 1.5 * (1 - lie); p.raise('L', 2.6 * bump(v, 2.4, 1.4)); p.raise('R', 2.6 * bump(v, 2.4, 1.4)); p.update();
      pivot.position.set(bx - 0.18 * u, top + 0.06 * u, 0.0); pivot.rotation.z = Math.PI / 2 * lie;
      spikes.visible = lie < 0.5; spikes.scale.setScalar(pop(1 + 0.2 * bump(v, 1.5, 0.4)));
      blanket.position.set(bx + 0.12 * u, top + 0.06 * u, 0.04 * u); blanket.rotation.z = -0.3 * (1 - lie);
      clock.position.set(cx, cy + (ring ? 0.03 * u * Math.abs(Math.sin(v * 25)) : 0), 0.0); clock.rotation.z = ring ? 0.15 * Math.sin(v * 30) : 0; clock.idle(t);
      for (let i = 0; i < 3; i++) { const f = ring ? ((v * 2 + i / 3) % 1) : 0; rings.set(i, cx, cy + 0.1 * u, 0.0, f > 0 ? 0.5 + 2 * f : 0); }
      rings.commit();
    },
  };
}

function homeGreet(ctx, spec, stage) {
  if (spec.outcome === 'bird') return birdHome(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, hx = B.maxX + 0.85 * u, W = 0.5 * u, H = 0.45 * u;
  const tri = new THREE.Shape(); tri.moveTo(-3.4, 0); tri.lineTo(3.4, 0); tri.lineTo(0, 2.2); tri.lineTo(-3.4, 0); const k = (W + 0.1 * u) / 6.8;
  const house = solidProp([[G.box(W, H, 0.4 * u, 0, H / 2, 0), 0xe8d0b0], [G.extrude(tri, 4.4).scale(k, k, k).translate(0, H, 0), 0xc04030], [G.box(0.14 * u, 0.3 * u, 0.01 * u, -0.12 * u, 0.15 * u, 0.2 * u), 0xffd070], [G.box(0.12 * u, 0.1 * u, 0.01 * u, 0.12 * u, 0.28 * u, 0.201 * u), 0xffd070]], 0.5);
  house.position.set(hx, floor, -0.15 * u);
  const door = new THREE.Group(), doorM = solidProp([[G.box(0.14 * u, 0.3 * u, 0.02 * u, 0.07 * u, 0.15 * u, 0), 0x8a5a30], [G.sphere(0.012 * u, 0.12 * u, 0.15 * u, 0.012 * u), 0xffd040]], 0.35); door.add(doorM); door.position.set(hx - 0.19 * u, floor, 0.06 * u);
  const glow = solidProp([[new THREE.PlaneGeometry(0.22 * u, 0.5 * u).rotateX(-Math.PI / 2), 0xffd070]], 0.9); glow.material.transparent = true; glow.material.opacity = 0.5;
  const traveller = createPerson({ u: 0.7 * u, shirt: 0x40a0e0 }), mom = createPerson({ u: 0.8 * u, shirt: 0xe07ab0 }), hrt = heart(u, { s: 0.15 });
  group.add(house, door, glow, traveller.group, mom.group, hrt);
  const loop = 5.6, dx = hx - 0.12 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.6], open: [1.4, 0.4], out: [1.8, 0.4], hug: [2.3, 0.4], unhug: [4.0, 0.4], shut: [4.6, 0.4] });
      const o = T.open - T.shut, hug = T.hug - T.unhug; door.rotation.y = -1.6 * o; glow.visible = o > 0.05; glow.scale.setScalar(pop(o)); glow.position.set(dx, floor + 0.004 * u, 0.3 * u);
      traveller.reset().face(T.walk < 1 ? 'right' : 0.9).walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); traveller.bone('armL').rotation.x = traveller.bone('armR').rotation.x = 1.2 * hug;
      traveller.group.position.set(lerp(B.maxX + 0.15 * u, dx - 0.22 * u, T.walk), floor, 0.3 * u); traveller.group.visible = pre || T.shut < 0.9; traveller.update();
      mom.reset().face(-0.9); mom.bone('armL').rotation.x = mom.bone('armR').rotation.x = 1.2 * Math.max(hug, T.out * 0.6); mom.group.position.set(dx + 0.02 * u, floor, lerp(0.0, 0.3 * u, T.out)); mom.group.visible = T.out > 0 && T.shut < 0.5; mom.update();
      const h = pre ? 0 : bump(v, 2.5, 1.6); hrt.visible = h > 0; hrt.scale.setScalar(pop(h)); hrt.position.set(dx - 0.1 * u, floor + 0.85 * u + 0.1 * u * h, 0.3 * u);
    },
  };
}

function toastRun(ctx, spec, stage) {
  if (spec.outcome === 'tortoise') return tortoiseHare(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, pu = 0.75 * u;
  const kid = createPerson({ u: pu, shirt: 0xffffff, pants: 0x23304a }), toast = solidProp([[G.box(0.12 * u, 0.12 * u, 0.02 * u, 0, 0, 0), 0xf0c070], [G.box(0.1 * u, 0.1 * u, 0.022 * u, 0, 0, 0), 0xffe8b0]], 0.5);
  kid.rig.attach('head', toast, 0.35).position.set(0, -0.02 * pu, 0.14 * pu); toast.rotation.y = Math.PI / 2;
  const cx = B.maxX + 0.55 * u, cy = B.maxY + 0.05 * u, R = 0.2 * u;
  const face = solidProp([[G.cyl(R, R, 0.03 * u, 0, 0, 0, Math.PI / 2, 0, 0, 28), 0xfaf6ea], [G.torus(R, 0.02 * u), 0xe04848], ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [G.box(0.012 * u, 0.03 * u, 0.006 * u, Math.sin(a) * 0.85 * R, Math.cos(a) * 0.85 * R, 0.018 * u, -a), 0x2a2a30]; })], 0.45);
  face.position.set(cx, cy, -0.1 * u);
  const hand = (l, w) => { const p = new THREE.Group(), m = solidProp([[G.box(w, l, 0.008 * u, 0, l / 2 - 0.01 * u, 0), 0x2a2a30]], 0.5); p.add(m); p.position.set(cx, cy, -0.075 * u); return p; }, hh = hand(0.1 * u, 0.02 * u), mh = hand(0.16 * u, 0.012 * u);
  const sweat = many(DROP(u), 4, 0.8);
  group.add(kid.group, face, hh, mh, sweat);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0.5 : v / loop, x = B.maxX + 0.1 * u + 0.9 * u * f;
      kid.reset().face('right').walk(v * 16, pre ? 0 : 1.3).lean(pre ? 0 : 0.25); kid.group.position.set(x, floor + (pre ? 0 : 0.04 * u * Math.abs(Math.sin(v * 16))), 0.15 * u); kid.group.scale.setScalar(pop(Math.min(1, Math.min(f, 1 - f) * 10))); kid.update();
      mh.rotation.z = pre ? -0.5 : -v * 12; hh.rotation.z = pre ? -2.3 : -v * 1.2 - 2.3; face.rotation.z = pre ? 0 : 0.06 * Math.sin(v * 30);
      for (let i = 0; i < 4; i++) { const g = ((v * 2 + i / 4) % 1); sweat.set(i, x - 0.1 * u - 0.25 * u * g, floor + 0.7 * pu + 0.1 * u * Math.sin(Math.PI * g), 0.15 * u, pre ? 0 : Math.sin(Math.PI * g)); }
      sweat.commit();
    },
  };
}

function mudSplash(ctx, spec, stage) {
  if (spec.outcome === 'dishes') return dirtyDishes(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.65 * u, MUD = 0x7a5530;
  const puddle = solidProp([[G.sphere(0.22 * u, 0, 0, 0, 1.3, 0.06, 0.7), MUD]], 0.35); puddle.position.set(mx, floor, 0.12 * u);
  const p = createPerson({ u: 0.8 * u, shirt: 0xffffff, pants: 0xf0f0f0 }), drops = many([[G.sphere(0.025 * u, 0, 0, 0, 1, 1, 0.8), MUD]], 12, 0.4);
  group.add(puddle, p.group, drops);
  const loop = 5.0, dirty = new THREE.Color(0xb08a60), clean = new THREE.Color(0xffffff), c = new THREE.Color();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { walk: [0, 1.2], dirt: [1.25, 0.3], sad: [1.7, 0.4], out: [4.4, 0.4] }), d = pre ? 0 : T.dirt * (1 - T.out);
      c.copy(clean).lerp(dirty, d); ['body', 'armL', 'armR', 'legL', 'legR', 'shinL', 'shinR'].forEach((n) => p.rig.setColor(n, c.getHex()));
      p.reset().face(T.walk < 1 ? 'right' : 0).walk(v * 9, T.walk > 0 && T.walk < 1 ? 1 : 0); p.bone('head').rotation.x = 0.4 * T.sad; p.raise('L', 0.7 * T.sad); p.raise('R', 0.7 * T.sad);
      p.group.position.set(lerp(B.maxX + 0.15 * u, mx, T.walk), floor, 0.12 * u); p.group.scale.setScalar(pop(pre ? 1 : 1 - T.out)); p.update();
      for (let i = 0; i < 12; i++) { const f = between(v, 1.2, 1.8), a = (i / 12) * Math.PI * 2; drops.set(i, mx + Math.cos(a) * 0.3 * u * f, floor + 0.05 * u + 0.6 * u * Math.sin(Math.PI * f) * (0.5 + 0.5 * Math.abs(Math.sin(a * 1.7))), 0.12 * u + Math.sin(a) * 0.15 * u * f, f > 0 && f < 1 ? 1 : 0); }
      drops.commit();
    },
  };
}

function handQuestion(ctx, spec, stage) {
  if (spec.outcome === 'phone') return phoneAnswer(ctx, spec, stage);
  if (spec.outcome === 'answer') return answerCheck(ctx, spec, stage);
  if (spec.outcome === 'quiz') return quizBuzzer(ctx, spec, stage);
  if (spec.outcome === 'mic') return micInterview(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.35 * u;
  const kid = createPerson({ u: 0.6 * u, shirt: 0xf0a030 }), adult = createPerson({ u: 0.95 * u, shirt: 0x60b060 });
  const bubble = solidProp([[G.sphere(0.2 * u, 0, 0, 0, 1.3, 1, 0.35), 0xffffff], [G.cone(0.05 * u, 0.12 * u, -0.1 * u, -0.2 * u, 0, 0.5), 0xffffff]], 0.6), q = emblemProp('question', 0.25 * u, { color: 0x3a7ad0 });
  group.add(kid.group, adult.group, bubble, q);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { hand: [0.3, 0.3, 'back'], bub: [0.7, 0.4, 'back'], scratch: [1.6, 0.3], down: [4.0, 0.4] }), b = pre ? 0 : T.bub * (1 - T.down);
      kid.reset().face(0.6); kid.raise('R', 2.9 * (T.hand - T.down)); kid.group.position.set(kx, floor + 0.04 * u * bump(v, 0.6, 0.6), 0.15 * u); kid.update();
      const sc = T.scratch * (1 - T.down); adult.reset().face(-0.6); adult.bone('armR').rotation.x = 2.4 * sc; adult.bone('foreR').rotation.x = 1.6 * sc + 0.3 * Math.sin(v * 14) * sc; adult.bone('head').rotation.z = 0.2 * sc;
      adult.group.position.set(kx + 0.55 * u, floor, 0.0); adult.update();
      bubble.visible = q.visible = b > 0.01; bubble.scale.setScalar(pop(b)); bubble.position.set(kx + 0.05 * u, floor + 0.95 * u, 0.15 * u); q.scale.setScalar(pop(0.25 * u * b)); q.position.set(kx + 0.05 * u, floor + 0.95 * u, 0.2 * u); q.idle(t);
    },
  };
}

export const SCENES = { 'post-kick': postKick, 'alarm-wake': alarmWake, 'home-greet': homeGreet, 'toast-run': toastRun, 'mud-splash': mudSplash, 'hand-question': handQuestion };
