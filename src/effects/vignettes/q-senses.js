// Model scenes, the senses (Step 3a model pass): looking, listening, saying, reading.
//   q-look    見: a person lifts binoculars and sweeps them left and right; a pigeon flies in and lands on a branch; he
//             stops on it (!), lowers the binoculars and waves at it; it flies off; outcome show: a child brings a drawing out
//             from behind her back and holds it up to her mum, who leans in (!): じょうず! and hearts (見せる)
//   q-listen  聞: a person cups a hand to his ear toward a wind chime that rings; sound rings travel to his ear, he smiles
//             and nods, ♪; outcome shell: a child holds a seashell to her ear, eyes shut, while little waves wash past, ザザー (聞く)
//   q-hello   言: a person waves and says こんにちは in a big speech bubble that pops out of her mouth, then bows a little
//   q-read    読: a grandma on a stool holds an open book, her head bent over it; a page turns and letters float up out of it
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { createModel } from '../models.js';
import { many, HEART } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { textPlane } from '../pieces/kit-props.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { LEFT, RIGHT, lerp, label, pop, person, KID, turnTo, hearts, speech, say } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
const TAU = Math.PI * 2;

// ---- 見 ----
function look(ctx, spec, stage) {
  if (spec.outcome === 'show') return show(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), bang = label(u, '!', '#e0a020', 0.22);
  const bino = solidProp([[G.cyl(0.03 * u, 0.034 * u, 0.11 * u, -0.036 * u, 0, 0, Math.PI / 2), 0x23232c], [G.cyl(0.03 * u, 0.034 * u, 0.11 * u, 0.036 * u, 0, 0, Math.PI / 2), 0x23232c],
    [G.box(0.04 * u, 0.02 * u, 0.04 * u, 0, 0, 0), 0x23232c], [G.cyl(0.026 * u, 0.026 * u, 0.004 * u, -0.036 * u, 0, 0.056 * u, Math.PI / 2), 0x8ad0ff], [G.cyl(0.026 * u, 0.026 * u, 0.004 * u, 0.036 * u, 0, 0.056 * u, Math.PI / 2), 0x8ad0ff]], 0.45);
  const bx = x0 + 0.8 * u, by = floor + 0.92 * u, bz = -0.25 * u;
  const branch = solidProp([[G.cyl(0.03 * u, 0.04 * u, 1.0 * u, 0.12 * u, -0.5 * u, -0.02 * u), 0x7a4a24], [G.cyl(0.014 * u, 0.02 * u, 0.36 * u, -0.06 * u, 0, 0, 0, 0, Math.PI / 2 - 0.15), 0x7a4a24],
    [G.sphere(0.14 * u, 0.14 * u, 0.12 * u, -0.06 * u, 1.3, 0.8, 1), 0x3aa040], [G.sphere(0.1 * u, 0.28 * u, 0.0, -0.04 * u, 1.2, 0.8, 1), 0x48b048]], 0.4);
  branch.position.set(bx, by, bz);
  const perch = createModel('pigeon', { height: 0.16 * u }), flying = createModel('pigeonFlying', { height: 0.16 * u });
  group.add(p.group, bino, branch, perch.group, flying.group, bang);
  const loop = 7.2, bird = new THREE.Vector3(bx - 0.1 * u, by + 0.01 * u, bz);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [0.2, 0.5], land: [1.4, 1.0, 'out'], spot: [3.0, 0.4, 'back'], lower: [4.0, 0.4], wave: [4.3, 0.3], unwave: [5.5, 0.3], off: [5.7, 0.9, 'in'], home: [6.4, 0.6] });
      p.pose('Idle', t);
      // he sweeps the binoculars slowly left and right, then stops on the bird
      const sweep = pre ? 0.3 : 0.3 + 0.75 * Math.sin(between(v, 0.6, 3.0) * TAU * 1.0);
      const onBird = Math.atan2(bird.x - x0, bird.z - 0.05 * u);
      p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = turnTo(turnTo(sweep, onBird - 0.2, T.spot), 0.3, T.home);
      const l = pre ? A.setup : T.lift * (1 - T.lower);
      p.turn('Head', -0.12 * l);
      p.at('eyes', W, 0, -0.01, 0.1); bino.position.copy(group.worldToLocal(W)); bino.rotation.set(-0.12 * l, p.group.rotation.y, 0, 'YXZ');
      bino.visible = l > 0.05;
      p.handTo('R', p.at('eyes', W2, -0.05, -0.03, 0.1), l, { out: 0.8, down: 0.6 }); p.handTo('L', p.at('eyes', W2, 0.05, -0.03, 0.1), l, { out: 0.8, down: 0.6 });
      p.wave('R', T.wave * (1 - T.unwave), v);
      // the pigeon glides in from up and right, lands on the branch, later flies off the other way
      const air = pre || T.land < 1 || T.off > 0;
      const fx = bird.x + 1.0 * u * (1 - T.land) + 0.9 * u * T.off, fy = bird.y + 0.6 * u * (1 - T.land) + 0.7 * u * T.off;
      flying.group.visible = !pre && air && T.land > 0 && T.off < 1; perch.group.visible = !pre && !air;
      flying.group.position.set(fx, fy, bz); flying.group.rotation.y = T.off > 0 ? 0.4 : LEFT - 0.3;
      perch.group.position.copy(bird); perch.group.rotation.y = LEFT + 0.5 + 0.3 * Math.sin(v * 1.7);
      pop(bang, pre ? 0 : T.spot * (1 - T.lower), x0, floor + 1.15 * u, 0.1 * u);
    },
  };
}

// ---- 見せる ----
function show(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u, mx = x0 + 0.62 * u;
  const kid = person(spec.who, u, KID + 0.1), mum = person(spec.mum ?? 'gal', u), bang = label(u, '!', '#e0a020', 0.2);
  const praise = speech(u, 'じょうず!', { h: 0.17, flip: true }), hs = many(HEART(u, 0.11), 3, 1);
  // a crayon drawing: a sun over a little house on white paper (its face is +z)
  const pic = solidProp([[G.box(0.34 * u, 0.26 * u, 0.006 * u, 0, 0, 0), 0xfbfaf4], [G.sphere(0.04 * u, -0.1 * u, 0.07 * u, 0.006 * u, 1, 1, 0.2), 0xffc020],
    [G.box(0.12 * u, 0.08 * u, 0.004 * u, 0.06 * u, -0.06 * u, 0.006 * u), 0xc07a3a], [G.cone(0.09 * u, 0.07 * u, 0.06 * u, 0.015 * u, 0.006 * u), 0xe04a3a],
    [G.box(0.3 * u, 0.012 * u, 0.004 * u, 0, -0.1 * u, 0.006 * u), 0x48b048]], 0.5);
  group.add(kid.group, mum.group, pic, bang, praise, hs);
  const loop = 6.5;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { out: [0.6, 0.5, 'back'], lean: [1.3, 0.5], spot: [1.5, 0.3, 'back'], up: [3.4, 0.5], down: [5.6, 0.6] });
      kid.pose('Idle', t); mum.pose('Idle', t);
      kid.group.position.set(x0, floor, 0.15 * u); kid.group.rotation.y = RIGHT - 0.6;
      mum.group.position.set(mx, floor, 0); mum.group.rotation.y = LEFT + 0.35;
      // the drawing comes out from behind her back and is held up high with both hands, its face toward mum and us
      const k = pre ? 0 : T.out * (1 - T.down), lean = pre ? 0 : T.lean * (1 - T.up);
      const back = kid.local(0, 0.35, -0.16, W), front = kid.local(0, 0.62, 0.3, W2), at = back.lerp(front, k);
      pic.position.copy(group.worldToLocal(at.clone())); pic.rotation.set(-0.1 * k, kid.group.rotation.y + (1 - k) * Math.PI, 0, 'YXZ');
      kid.handTo('R', at.clone().add(kid.local(-0.17, 0, 0, new THREE.Vector3()).sub(kid.local(0, 0, 0))), 1, { out: 0.6, down: 0.5 });
      kid.handTo('L', at.clone().add(kid.local(0.17, 0, 0, new THREE.Vector3()).sub(kid.local(0, 0, 0))), 1, { out: 0.6, down: 0.5 });
      kid.turn('Head', -0.15 * k);
      mum.bow(0.22 * lean); mum.turn('Head', 0.15 * lean);
      pop(bang, pre ? 0 : T.spot * (1 - T.up), mx, floor + 1.05 * u, 0.1 * u);
      say(praise, pre ? 0 : T.up * (1 - T.down), mx + 0.1 * u, floor + 1.1 * u, 0.1 * u);
      hearts(hs, 3, x0, floor + 0.75 * u, 0.25 * u, pre ? -1 : v, 3.8, u);
    },
  };
}

// ---- 聞 / 聞く ----
function listen(ctx, spec, stage) {
  if (spec.outcome === 'shell') return shell(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.4 * u;
  const p = person(spec.who, u), note = label(u, '♪', '#3a8a5a', 0.16), cx = x0 + 0.85 * u, cy = floor + 1.0 * u;
  const post = solidProp([[G.cyl(0.02 * u, 0.025 * u, 1.25 * u, 0.12 * u, -0.62 * u + 0.1 * u, -0.05 * u), 0x6a4a2a], [G.box(0.18 * u, 0.025 * u, 0.025 * u, 0.04 * u, 0.1 * u, -0.05 * u), 0x6a4a2a], [G.cyl(0.003 * u, 0.003 * u, 0.06 * u, 0, 0.07 * u, 0), 0xdddddd]], 0.4);
  const chime = solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1, 0.9, 1), 0x9ad8ff], [G.cyl(0.004 * u, 0.004 * u, 0.12 * u, 0, -0.08 * u, 0), 0xdddddd], [G.box(0.06 * u, 0.12 * u, 0.004 * u, 0, -0.18 * u, 0), 0xff5a5a]], 0.7);
  chime.material.transparent = true; chime.material.opacity = 0.85;
  post.position.set(cx, cy, 0); chime.position.set(cx, cy + 0.0 * u, 0);
  const rings = many([[G.torus(0.1 * u, 0.008 * u, Math.PI * 0.9, 0, 0, 0, Math.PI * 0.55), 0xffe070]], 4, 0.9);
  group.add(p.group, post, chime, rings, note);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const ring = pre ? 0 : between(v, 0.3, 0.6) * (1 - between(v, 4.4, 4.8));
      chime.rotation.z = 0.35 * ring * Math.sin(v * 7);
      // he turns his left ear toward the chime and cups it; sound rings travel from the chime to his ear
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.35;
      const cup = pre ? 0 : between(v, 0.8, 1.2) * (1 - between(v, 4.8, 5.2));
      p.cupEar('L', cup);
      const ear = p.at('earL', W, 0.08, 0, 0), ex = group.worldToLocal(ear).clone();
      for (let i = 0; i < 4; i++) {
        const f = pre ? -1 : ((v - 0.6) / 1.1 + i / 4) % 1, live = ring > 0.5 && v > 0.6 + i * 0.27 && f >= 0;
        rings.set(i, lerp(cx - 0.08 * u, ex.x + 0.04 * u, f), lerp(cy - 0.02 * u, ex.y, f), lerp(0, ex.z, f), live ? 0.5 + 0.7 * Math.sin(Math.PI * f) : 0);
      }
      rings.commit();
      p.nod(between(v, 2.6, 2.8) * (1 - between(v, 4.2, 4.4)), v);
      pop(note, pre ? 0 : bump(v, 2.6, 2.0) * 1.2, x0 + 0.2 * u, floor + 1.12 * u + 0.1 * u * between(v, 2.6, 4.6), 0.1 * u);
    },
  };
}
function shell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u, KID + 0.1), say = label(u, 'ザザー', '#3a7ac0', 0.12);
  const sh = solidProp([[G.cone(0.07 * u, 0.16 * u, 0, 0, 0, Math.PI / 2), 0xffb090], [G.sphere(0.07 * u, 0.0, 0, 0, 0.6, 1, 1), 0xffe0d0]], 0.6);
  const sea = solidProp([[G.box(1.6 * u, 0.32 * u, 0.04 * u, 0, 0.16 * u, -0.5 * u), 0x2a6ac0], [G.box(1.6 * u, 0.04 * u, 0.4 * u, 0, -0.02 * u, -0.2 * u), 0xf0d8a0]], 0.45);
  sea.position.set(x0 + 0.35 * u, floor, 0);
  const waves = many([[G.torus(0.08 * u, 0.012 * u, Math.PI, 0, 0, 0), 0xe8f6ff]], 6, 0.8);
  group.add(p.group, sh, sea, waves, say);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.1 * u); p.group.rotation.y = -0.3;
      // the shell is held against her left ear, the hand on its far side; her head tips into it, eyes shut (head down)
      const k = pre ? A.setup : between(v, 0.3, 0.8) * (1 - between(v, 5.2, 5.7));
      p.turn('Head', 0.15 * k, 0, -0.25 * k);
      const ear = p.at('earL', W, 0.05, 0, 0), hand = p.at('earL', W2, 0.1, -0.02, 0);
      sh.position.copy(group.worldToLocal(ear.lerp(p.local(0.15, 0.3, 0.1, new THREE.Vector3()), 1 - k))); sh.rotation.y = p.group.rotation.y;
      p.handTo('L', hand, k, { out: 0.9, down: 0.6 });
      for (let i = 0; i < 6; i++) { const f = ((pre ? 0 : v) * 0.35 + i / 6) % 1; waves.set(i, x0 - 0.3 * u + 1.3 * u * f, floor + 0.33 * u + 0.02 * u * Math.sin(v * 3 + i), -0.47 * u, k * Math.sin(Math.PI * f)); }
      waves.commit();
      pop(say, pre ? 0 : between(v, 1.0, 1.3) * (1 - between(v, 4.6, 4.9)), x0 + 0.35 * u, floor + 0.85 * u + 0.02 * u * Math.sin(v * 3), 0.1 * u);
    },
  };
}

// ---- 言 ----
function hello(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u;
  const p = person(spec.who, u), bubble = new THREE.Group(), text = textPlane('こんにちは!', { h: 0.17 * u, color: '#20242c', bg: '#ffffff', pad: 0.35 });
  const tail = solidProp([[G.cone(0.05 * u, 0.14 * u, 0, 0, 0, 2.6), 0xffffff]], 1.0);
  bubble.add(text, tail); tail.position.set(-0.22 * u, -0.12 * u, -0.005 * u);
  group.add(p.group, bubble);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', t); p.group.position.set(x0, floor, 0.05 * u); p.group.rotation.y = -0.25;
      p.wave('R', pre ? 0 : between(v, 0.2, 0.5) * (1 - between(v, 2.4, 2.7)), v);
      // the bubble pops out of her mouth and floats up to the right of her head, then she bows a little
      const s = pre ? 0 : between(v, 0.6, 1.0) * (1 - between(v, 4.6, 5.0));
      p.at('mouth', W); group.worldToLocal(W);
      bubble.visible = s > 0.01; bubble.scale.setScalar(grow(s)); bubble.position.set(W.x + 0.45 * u * s, W.y + 0.28 * u * s, W.z + 0.05 * u);
      p.turn('Head', 0.06 * Math.max(0, Math.sin(v * 14)) * between(v, 0.6, 0.8) * (1 - between(v, 1.8, 2.0)));
      p.bow(0.6 * bump(v, 3.0, 1.4));
    },
  };
}

// ---- 読 ----
function read(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u, h = 0.9;
  const p = person(spec.who, u, h), stool = solidProp([[G.cyl(0.1 * u, 0.1 * u, 0.025 * u, 0, 0.1 * u, 0), 0x8a5a30], [G.cyl(0.012 * u, 0.012 * u, 0.1 * u, -0.06 * u, 0.05 * u, 0), 0x6a4020], [G.cyl(0.012 * u, 0.012 * u, 0.1 * u, 0.06 * u, 0.05 * u, 0), 0x6a4020]], 0.35);
  // the open book: two pages in a shallow V about the spine (origin), the cover under them; a page that turns
  const book = new THREE.Group(), pages = solidProp([[G.box(0.16 * u, 0.22 * u, 0.012 * u, -0.08 * u, 0, 0, 0), 0xfaf6ea], [G.box(0.16 * u, 0.22 * u, 0.012 * u, 0.08 * u, 0, 0), 0xfaf6ea],
    [G.box(0.34 * u, 0.235 * u, 0.008 * u, 0, 0, -0.01 * u), 0xb03030], ...[-0.13, -0.1, -0.07, -0.04].flatMap((y) => [[G.box(0.11 * u, 0.008 * u, 0.002 * u, -0.08 * u, y * u + 0.12 * u, 0.007 * u), 0x8a8a90], [G.box(0.11 * u, 0.008 * u, 0.002 * u, 0.08 * u, y * u + 0.12 * u, 0.007 * u), 0x8a8a90]])], 0.5);
  const leaf = new THREE.Group(), leafM = solidProp([[G.box(0.16 * u, 0.22 * u, 0.004 * u, 0.08 * u, 0, 0.012 * u), 0xffffff]], 0.6);
  leaf.add(leafM); book.add(pages, leaf);
  const letters = ['あ', 'い', 'う'].map((c, i) => textPlane(c, { h: 0.2 * u, color: ['#e04848', '#3a7ae0', '#e0a020'][i], weight: 900 }));
  stool.position.set(x0, floor, 0);
  group.add(stool, p.group, book, ...letters);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('SitDown', 1.0, false); p.group.position.set(x0, floor + 0.0 * u, 0.0); p.group.rotation.y = -0.3;
      p.turn('Head', 0.45); p.turn('Torso', 0.1);
      // the book is held up in front of her chest, tilted toward her face; both hands at its outer edges
      p.local(0, 0.36, 0.3, W); book.position.copy(group.worldToLocal(W)); book.rotation.set(-1.2, p.group.rotation.y, 0, 'YXZ');
      book.updateWorldMatrix(true, true);
      p.handTo('R', book.localToWorld(W.set(-0.17 * u, -0.04 * u, -0.02 * u)), 1, { out: 0.8, down: 0.8 });
      p.handTo('L', book.localToWorld(W.set(0.17 * u, -0.04 * u, -0.02 * u)), 1, { out: 0.8, down: 0.8 });
      // a page turns from right to left every few seconds; her head follows the lines a little
      const f = pre ? 0 : between(v % 3, 1.8, 2.5);
      leaf.rotation.y = -Math.PI * f; leaf.visible = f > 0 && f < 1;
      p.turn('Head', 0, 0.12 * Math.sin(v * 1.6));
      book.getWorldPosition(W2); group.worldToLocal(W2);
      letters.forEach((m, i) => {
        const g = pre ? 0 : ((v - 0.5 - i * 0.9) / 2.4), on = g > 0 && g < 1 && v < loop - 0.4;
        m.visible = on; m.scale.setScalar(grow(on ? Math.sin(Math.PI * g) : 0)); m.position.set(W2.x + 0.12 * u * (i - 1) + 0.05 * u * Math.sin(g * 6), W2.y + 0.12 * u + 0.5 * u * g, W2.z + 0.05 * u);
      });
    },
  };
}

export const SCENES = { 'q-look': look, 'q-listen': listen, 'q-hello': hello, 'q-read': read };
