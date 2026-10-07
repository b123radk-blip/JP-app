// Batch 3 kanji, part 1.
//   cake-slice     部: a round cake is cut into four; one slice slides out away from the rest, then back
//   puzzle-fill    全: puzzle pieces fly into a frame one by one; the last one clicks in and the whole picture glows
//   body-stretch   体: a person stretches: arms up, touch the toes, twist side to side; each part glows as it moves
//   letter-blocks  字: wooden letter blocks drop into a row, あ い う; a little finger points at each in turn
//   walk-through   通: a tunnel beside the kanji; a person walks in one end, vanishes, and comes out the other
//   cage-open      空: a bird cage's door swings open, the bird flies out up into the sky; the cage is left empty
//   bridge-walk    渡: a river with an arched bridge; a person walks over it from one bank to the other
//   paper-fold     紙: a sheet of paper flutters down, folds into a triangle, again, and becomes a paper hat that hops
//                  onto a kid's head
import * as THREE from 'three';
import { zebraCross, letterSend } from './variants3.js';
import { acts, timeline, bump, wobble } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { many, burst } from '../pieces/kit-things.js';
import { emblemProp, textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint } from './helpers.js';

function cakeSlice(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.55 * u, R = 0.38 * u, H = 0.24 * u;
  const wedge = (a) => solidProp([[new THREE.CylinderGeometry(R, R, H, 24, 1, false, a, Math.PI / 2), 0xffe8c8], [new THREE.CylinderGeometry(R * 1.01, R * 1.01, 0.03 * u, 24, 1, false, a, Math.PI / 2).translate(0, H / 2, 0), 0xff8ab0], [G.sphere(0.035 * u, Math.sin(a + Math.PI / 4) * R * 0.6, H / 2 + 0.03 * u, Math.cos(a + Math.PI / 4) * R * 0.6), 0xe02030]], 0.4);
  const wedges = [0, 1, 2, 3].map((i) => wedge(i * Math.PI / 2)), plate = solidProp([[G.cyl(R * 1.25, R * 1.1, 0.02 * u, 0, 0, 0, 0, 0, 0, 32), 0xf6f4ee]], 0.35), knife = solidProp([[G.box(0.02 * u, 0.4 * u, 0.012 * u, 0, 0, 0), 0xd8dde6], [G.box(0.04 * u, 0.15 * u, 0.03 * u, 0, 0.27 * u, 0), 0x5a3a20]], 0.3);
  const g = new THREE.Group(); g.add(plate, ...wedges); wedges.forEach((w) => { w.position.y = H / 2 + 0.01 * u; }); g.position.set(cx, floor, 0); g.rotation.x = 0.45;
  group.add(g, knife);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { c1: [0.2, 0.35, 'in'], c2: [0.8, 0.35, 'in'], out: [1.5, 0.6, 'out'], back: [3.8, 0.6] });
      const cut = Math.max(bump(v, 0.2, 0.5), bump(v, 0.8, 0.5));
      knife.visible = !pre && v < 1.4; knife.position.set(cx, floor + 0.62 * u - 0.38 * u * cut, 0.05 * u); knife.rotation.y = v < 0.7 ? 0.5 : -1.0;
      const o = pre ? 0 : T.out - T.back, a = Math.PI / 4;
      wedges[0].position.set(Math.sin(a) * 0.35 * u * o, H / 2 + 0.01 * u + 0.05 * u * o, Math.cos(a) * 0.35 * u * o);
    },
  };
}

function puzzleFill(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), cx = B.maxX + 0.5 * u, cy = B.cy + 0.05 * u, S = 0.22 * u;
  const frame = solidProp([[G.box(2 * S + 0.08 * u, 0.04 * u, 0.04 * u, 0, S + 0.02 * u, 0), 0x8a5a30], [G.box(2 * S + 0.08 * u, 0.04 * u, 0.04 * u, 0, -S - 0.02 * u, 0), 0x8a5a30], [G.box(0.04 * u, 2 * S, 0.04 * u, -S - 0.02 * u, 0, 0), 0x8a5a30], [G.box(0.04 * u, 2 * S, 0.04 * u, S + 0.02 * u, 0, 0), 0x8a5a30], [G.box(2 * S, 2 * S, 0.01 * u, 0, 0, -0.02 * u), 0x30343c]], 0.3);
  const COLORS = [0xe04848, 0x40a0e0, 0x60c060, 0xf0c030], pieces = COLORS.map((c) => solidProp([[G.box(S * 0.96, S * 0.96, 0.03 * u, 0, 0, 0), c], [G.cyl(0.04 * u, 0.04 * u, 0.03 * u, S * 0.5, 0, 0, Math.PI / 2), c]], 0.45));
  const glow = burst(u, { s: 0.8, n: 8, color: 0xfff0a0 }), SLOT = [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]];
  frame.position.set(cx, cy, 0);
  group.add(frame, ...pieces, glow);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, away = between(v, 4.1, 4.6);
      pieces.forEach((p, i) => {
        const f = pre ? 0 : between(v, 0.2 + i * 0.5, 0.65 + i * 0.5), from = [cx + 1.0 * u * Math.cos(i * 1.7), cy + 0.7 * u * Math.sin(i * 1.7 + 1)], [x, y] = arc(from, [cx + SLOT[i][0] * S, cy + SLOT[i][1] * S], 0.2 * u, f);
        p.visible = f > 0 && away < 1; p.position.set(x, y, 0.02 * u); p.rotation.z = (1 - f) * 3; p.scale.setScalar(Math.max(1e-3, 1 - away));
      });
      const gl = pre ? 0 : bump(v, 2.2, 1.2); glow.visible = gl > 0; glow.scale.setScalar(Math.max(1e-3, gl)); glow.position.set(cx, cy, -0.04 * u); glow.rotation.z = v;
    },
  };
}

function bodyStretch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, SKIN = 0xffd2b0, SHIRT = 0x40a0e0, PANTS = 0x2a3550, HI = 0xfff080;
  const p = createPerson({ u, shirt: SHIRT });
  group.add(p.group);
  const loop = 5.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const up = bump(v, 0.2, 1.4), toes = bump(v, 1.7, 1.4), twist = v > 3.2 && v < 5.2 ? Math.sin((v - 3.2) * Math.PI) : 0;
      p.group.position.set(px, floor, 0.05 * u); p.face('toward').reset();
      p.raise('L', 2.9 * up); p.raise('R', 2.9 * up); p.lean(1.2 * toes); p.bone('armL').rotation.x = p.bone('armR').rotation.x = 1.3 * toes; p.bone('body').rotation.y = 0.7 * twist;
      p.update();
      const glow = (on, name, base) => p.rig.setColor(name, on > 0.5 ? HI : base);
      glow(up, 'armL', SHIRT); glow(up, 'armR', SHIRT); glow(up, 'foreL', SKIN); glow(up, 'foreR', SKIN);
      glow(toes, 'legL', PANTS); glow(toes, 'legR', PANTS); glow(toes, 'shinL', PANTS); glow(toes, 'shinR', PANTS);
      glow(Math.abs(twist), 'body', SHIRT);
    },
  };
}

function letterBlocks(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.3 * u, LET = [...(spec.letters ?? 'あいう')], S = 0.26 * u, COLORS = [0xe04848, 0x40a0e0, 0x60c060, 0xf0c030];
  const blocks = LET.map((ch, i) => { const g = new THREE.Group(), b = solidProp([[G.box(S, S, S, 0, 0, 0), 0xe8c890]], 0.35), t2 = textPlane(ch, { h: S * 0.9, w: S * 0.9, color: '#' + COLORS[i % 4].toString(16).padStart(6, '0'), size: 0.8 }); t2.position.z = S / 2 + 0.002; g.add(b, t2); return g; });
  const finger = createPerson({ u: 0.6 * u, shirt: 0xf0a030 });
  group.add(...blocks, finger.group);
  const loop = 4.8, at = (i) => x0 + i * (S + 0.04 * u);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, away = between(v, 4.2, 4.7);
      blocks.forEach((b, i) => { const f = pre ? 0 : between(v, 0.1 + i * 0.35, 0.45 + i * 0.35); b.visible = f > 0 && away < 1; b.position.set(at(i), floor + S / 2 + (1 - f * f) * 0.8 * u + 0.02 * u * wobble(v, 0.45 + i * 0.35, 0.3, 5), 0.02 * u); b.rotation.set(0.25, -0.15, (1 - f) * 0.8); b.scale.setScalar(Math.max(1e-3, 1 - away)); });
      const k = pre ? -1 : Math.floor((v - 1.6) / 0.7);
      finger.group.position.set(at(LET.length - 1) + 0.32 * u, floor, 0.25 * u); finger.face(-1.2).reset();
      if (k >= 0 && k < LET.length) { finger.bone('armR').rotation.x = 1.5; finger.group.rotation.y = -1.2 - 0.25 * (LET.length - 1 - k); }
      finger.update();
    },
  };
}

function walkThrough(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, tx = B.maxX + 0.75 * u;
  const mouth = (s) => new THREE.CircleGeometry(0.22 * u, 24, 0, Math.PI).rotateY(s * 0.75).translate(s * 0.5 * u, 0, 0.2 * u);
  const hill = solidProp([[new THREE.SphereGeometry(0.5 * u, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.4, 1.0, 0.6), 0x4a8a3a], [mouth(-1), 0x101418], [mouth(1), 0x101418], [G.cone(0.05 * u, 0.12 * u, -0.1 * u, 0.47 * u, 0), 0x2f6a2a], [G.cone(0.06 * u, 0.15 * u, 0.12 * u, 0.46 * u, -0.05 * u), 0x2f6a2a]], 0.25);
  hill.position.set(tx, floor, -0.1 * u);
  const p = createPerson({ u: 0.42 * u, shirt: 0xf0a030 });
  group.add(hill, p.group);
  const loop = 4.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0, 3.6);
      const x = tx - 1.0 * u + 2.0 * u * f, inside = x > tx - 0.48 * u && x < tx + 0.48 * u;
      p.group.visible = !pre && !inside && f < 1; p.group.position.set(x, floor, 0.22 * u); p.face('right').reset().walk(v * 10, 1).update();
    },
  };
}

function cageOpen(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.5 * u;
  const bars = [], R = 0.27 * u, H = 0.6 * u;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; if (i === 2) continue; bars.push([G.cyl(0.008 * u, 0.008 * u, H, Math.sin(a) * R, H / 2, Math.cos(a) * R), 0xf4f4f8]); }
  const cage = solidProp([...bars, [G.torus(R, 0.012 * u).rotateX(Math.PI / 2), 0xf4f4f8], [G.torus(R, 0.012 * u).rotateX(Math.PI / 2).translate(0, H, 0), 0xf4f4f8], [G.sphere(R, 0, H, 0, 1, 0.5, 1), 0xf4f4f8], [G.cyl(0.006 * u, 0.006 * u, R * 1.8, 0, H * 0.4, 0, 0, 0, Math.PI / 2), 0x8a5a30]], 0.35);
  cage.position.set(cx, floor, 0);
  const door = new THREE.Group(), doorM = solidProp([[G.box(0.008 * u, H * 0.8, 0.008 * u, 0, H * 0.4, 0.06 * u), 0xf4f4f8], [G.box(0.008 * u, H * 0.8, 0.008 * u, 0, H * 0.4, -0.06 * u), 0xf4f4f8], [G.box(0.008 * u, 0.008 * u, 0.12 * u, 0, H * 0.4, 0), 0xf4f4f8]], 0.35);
  door.add(doorM); door.position.set(cx + Math.sin(0.4 * Math.PI) * R, floor, Math.cos(0.4 * Math.PI) * R);
  const bird = emblemProp('bird', 0.42 * u, { color: 0xffd020 });
  group.add(cage, door, bird);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.4, 0.4, 'back'], fly: [1.0, 2.2, 'in'], back: [4.0, 0.8, 'out'] });
      door.rotation.y = 1.6 * (pre ? 0 : T.open - T.back);
      const f = T.fly, b = T.back, x = cx + 0.9 * u * f * (1 - b), y = floor + H * 0.4 + 1.0 * u * f * f * (1 - b);
      bird.position.set(x, y, 0.02 * u + 0.3 * u * f * (1 - b)); bird.scale.setScalar(0.42 * u * (1 - 0.3 * f * (1 - b))); bird.idle(f > 0 && f < 1 ? v : 0); bird.visible = !(f >= 1 && b === 0);
    },
  };
}

function bridgeWalk(ctx, spec, stage) {
  if (spec.outcome === 'zebra') return zebraCross(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, bx = B.maxX + 0.7 * u, span = 1.0 * u, rise = 0.25 * u;
  const water = solidProp([[G.box(0.75 * u, 0.05 * u, 0.7 * u, 0, -0.025 * u, 0), 0x2a7ad0], [G.box(0.3 * u, 0.1 * u, 0.7 * u, -0.6 * u, -0.05 * u, 0), 0x5aa040], [G.box(0.3 * u, 0.1 * u, 0.7 * u, 0.6 * u, -0.05 * u, 0), 0x5aa040]], 0.5); water.position.set(bx, floor, 0);
  const pts = Array.from({ length: 9 }, (_, i) => { const f = i / 8; return [(f - 0.5) * span, rise * Math.sin(Math.PI * f)]; });
  const bridge = solidProp([[G.tube(pts, 0.025 * u), 0xd03828], [G.tube(pts.map(([x, y]) => [x, y + 0.12 * u]), 0.012 * u), 0xd03828], ...pts.filter((_, i) => i % 2 === 0).map(([x, y]) => [G.cyl(0.01 * u, 0.01 * u, 0.12 * u, x, y + 0.06 * u, 0), 0xd03828])], 0.35);
  bridge.position.set(bx, floor, 0.1 * u);
  const ripples = many([[G.torus(0.06 * u, 0.006 * u).rotateX(Math.PI / 2), 0xa8dcff]], 3, 0.8), p = createPerson({ u: 0.55 * u, shirt: 0xf0a030 });
  group.add(water, bridge, ripples, p.group);
  const loop = 4.8;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, f = pre ? 0 : between(v, 0, 3.6);
      p.group.position.set(bx + (f - 0.5) * span * 1.2, floor + rise * Math.sin(Math.PI * Math.min(1, Math.max(0, (f - 0.08) / 0.84))) + 0.02 * u, 0.1 * u); p.face('right').reset().walk(v * 9, f > 0 && f < 1 ? 1 : 0).update();
      for (let i = 0; i < 3; i++) { const r = ((t * 0.5 + i / 3) % 1); ripples.set(i, bx + (i - 1) * 0.15 * u, floor + 0.005 * u, 0.1 * u, 0.5 + 1.5 * r); }
      ripples.commit();
    },
  };
}

function paperFold(ctx, spec, stage) {
  if (spec.outcome === 'letter') return letterSend(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, cy = B.cy + 0.15 * u, S = 0.5 * u;
  const tri = (c) => { const sh = new THREE.Shape(); sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0, 0.5); sh.lineTo(-0.5, 0); return new THREE.ShapeGeometry(sh).scale(S, S, 1); };
  const lower = solidProp([[tri().rotateZ(Math.PI), 0xfaf6ea]], 0.5), upper = new THREE.Group(), upperM = solidProp([[tri(), 0xfaf6ea]], 0.5);
  upper.add(upperM); lower.material.side = upperM.material.side = THREE.DoubleSide;
  const hat = solidProp([[G.cone(0.13 * u, 0.2 * u, 0, 0.1 * u, 0), 0xfaf6ea], [G.torus(0.13 * u, 0.012 * u).rotateX(Math.PI / 2), 0xe04848]], 0.5);
  const kid = createPerson({ u: 0.8 * u, shirt: 0x40a0e0 }), sheet = new THREE.Group(); sheet.add(lower, upper);
  group.add(sheet, hat, kid.group);
  const loop = 5.0, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { drift: [0, 0.8, 'out'], fold1: [0.9, 0.5], fold2: [1.5, 0.5], hat: [2.1, 0.3], hop: [2.4, 0.6] });
      const k = pre ? 0 : 1 - T.fold2 * 0.5;
      sheet.visible = !pre && T.hat < 1; sheet.position.set(cx + 0.2 * u * Math.sin(v * 3) * (1 - T.drift), cy + 0.6 * u * (1 - T.drift), 0.03 * u); sheet.rotation.set(0, 0, 0.3 * Math.sin(v * 4) * (1 - T.drift) + Math.PI / 4 * T.fold2); sheet.scale.setScalar(Math.max(1e-3, k * (1 - T.hat)));
      upper.rotation.x = Math.PI * T.fold1;
      kid.group.position.set(cx + 0.4 * u, floor, 0.1 * u); kid.face(-0.5).reset(); kid.update();
      bonePoint(kid, 'head', 1.0, head);
      const [hx, hy] = arc([cx, cy], [head.x, head.y], 0.3 * u, T.hop);
      hat.visible = !pre && T.hat > 0 && v < 4.6; hat.position.set(hx, hy, head.z); hat.scale.setScalar(Math.max(1e-3, T.hat * (1 - between(v, 4.3, 4.6)))); hat.rotation.z = (1 - T.hop) * 3;
    },
  };
}

export const SCENES = { 'cake-slice': cakeSlice, 'puzzle-fill': puzzleFill, 'body-stretch': bodyStretch, 'letter-blocks': letterBlocks, 'walk-through': walkThrough, 'cage-open': cageOpen, 'bridge-walk': bridgeWalk, 'paper-fold': paperFold };
