// Batch 4 kanji, part 3.
//   shop-counter    店: a stall with a striped awning; a customer hands over a coin, the till drawer dings open, the
//                   shopkeeper hands back a bag and the customer walks off with it
//   phone-charge    要: a phone's battery blinks red with a "!"; a hand plugs the charger in and the battery fills green
//   wardrobe-dress  服: a wardrobe opens, a red shirt and blue trousers fly out onto a person, who twirls to show them off
//   easel-paint     画: on an easel a brush paints a green hill and a sun; a gold frame drops round the picture
//   projector       映: a projector's beam lights a screen behind the kanji, where a little figure runs across
//   pot-cook        料: a carrot, a fish and a rice ball drop into a pot on the stove; a ladle stirs, steam rises
import * as THREE from 'three';
import { cafe, popcorn, waterNeed } from './variants4a.js';
import { panFlip } from './variants4b.js';
import { acts, timeline, bump, lerp } from './timeline.js';
import { createPerson } from '../pieces/kit-person.js';
import { createHand } from '../pieces/kit-hand.js';
import { many, burst, PUFF } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, bonePoint, handTo, beam, wisps } from './helpers.js';

const pop = (f) => Math.max(1e-3, f), WOOD = 0xc89a60;

function shopCounter(ctx, spec, stage) {
  if (spec.outcome === 'cafe') return cafe(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.55 * u, W = 0.8 * u, CH = 0.36 * u;
  const stripes = Array.from({ length: 6 }, (_, i) => [G.box(W / 6, 0.03 * u, 0.3 * u, (i / 5 - 0.5) * W * 5 / 6, 0.95 * u, 0.0, 0), i % 2 ? 0xffffff : 0xe04848]);
  const stall = solidProp([[G.box(W, CH, 0.24 * u, 0, CH / 2, 0), WOOD], [G.box(W + 0.04 * u, 0.03 * u, 0.28 * u, 0, CH + 0.015 * u, 0), 0x8a5a30], [G.box(0.03 * u, 0.95 * u, 0.03 * u, -W / 2, 0.475 * u, -0.1 * u), 0x8a5a30], [G.box(0.03 * u, 0.95 * u, 0.03 * u, W / 2, 0.475 * u, -0.1 * u), 0x8a5a30], ...stripes.map(([g, c]) => [g.rotateX(0.35), c]), [G.box(0.18 * u, 0.12 * u, 0.14 * u, -0.25 * u, CH + 0.09 * u, 0), 0x8a8e96], [G.box(0.12 * u, 0.05 * u, 0.01 * u, -0.25 * u, CH + 0.12 * u, 0.072 * u), 0x60e080]], 0.35);
  stall.position.set(sx, floor, 0);
  const drawer = solidProp([[G.box(0.16 * u, 0.03 * u, 0.12 * u, 0, 0, 0), 0x60646c]], 0.4), ding = burst(u, { s: 0.16, n: 6, color: 0xffe040 });
  const keeper = createPerson({ u: 0.85 * u, shirt: 0x40a0e0 }), buyer = createPerson({ u: 0.8 * u, shirt: 0xe07ab0 });
  const coin = solidProp([[G.cyl(0.035 * u, 0.035 * u, 0.008 * u, 0, 0, 0, Math.PI / 2), 0xffc830]], 0.7), bag = solidProp([[G.box(0.14 * u, 0.16 * u, 0.06 * u, 0, -0.1 * u, 0), 0xf0e0c0], [G.torus(0.04 * u, 0.008 * u, Math.PI, 0, -0.02 * u, 0), 0x8a5a30]], 0.4);
  group.add(stall, drawer, ding, keeper.group, buyer.group, coin, bag);
  const loop = 5.6, hb = new THREE.Vector3(), hk = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { in: [0, 0.7], pay: [0.8, 0.5], till: [1.4, 0.2, 'back'], shut: [2.2, 0.2], give: [1.8, 0.6], go: [3.0, 1.4], out: [4.4, 0.3] });
      keeper.reset().face(0.3); keeper.bone('armR').rotation.x = 1.3 * bump(v, 1.7, 1.0); keeper.group.position.set(sx + 0.05 * u, floor, -0.22 * u); keeper.update();
      const walking = (T.in > 0 && T.in < 1) || (T.go > 0 && T.go < 1);
      buyer.reset().face(T.go > 0 ? 'right' : walking ? 'left' : Math.PI - 0.5).walk(v * 9, walking ? 1 : 0); buyer.bone('armL').rotation.x = 1.3 * bump(v, 0.7, 0.9) + 0.6 * (T.give > 0.9 ? 1 : 0);
      buyer.group.position.set(sx + 0.65 * u - 0.35 * u * T.in + 0.7 * u * T.go, floor, 0.32 * u); buyer.group.scale.setScalar(pop(pre ? 1 : (T.in > 0 ? 1 : 0.001) * (1 - T.out))); buyer.update();
      bonePoint(buyer, 'handL', 0.6, hb); bonePoint(keeper, 'handR', 0.6, hk);
      coin.visible = !pre && T.pay > 0 && T.pay < 1; coin.position.copy(hb).lerp(new THREE.Vector3(sx - 0.25 * u, floor + CH + 0.02 * u, 0.05 * u), T.pay); coin.rotation.y = v * 8;
      drawer.position.set(sx - 0.25 * u, floor + CH + 0.04 * u, 0.07 * u + 0.08 * u * (T.till - T.shut));
      const d = pre ? 0 : bump(v, 1.45, 0.6); ding.visible = d > 0; ding.scale.setScalar(pop(d)); ding.position.set(sx - 0.25 * u, floor + CH + 0.3 * u, 0.1 * u);
      bag.visible = !pre && T.give > 0 && T.out < 1; bag.position.copy(T.give < 1 ? hk.clone().lerp(hb, T.give) : hb); bag.position.z += 0.04 * u;
    },
  };
}

function phoneCharge(ctx, spec, stage) {
  if (spec.outcome === 'water') return waterNeed(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), px = B.maxX + 0.35 * u, py = B.cy + 0.08 * u, PW = 0.26 * u, PH = 0.46 * u;
  const phone = solidProp([[G.box(PW, PH, 0.04 * u, 0, 0, 0), 0x2a2a30], [G.box(PW * 0.88, PH * 0.84, 0.004 * u, 0, 0, 0.021 * u), 0x203048], [G.box(0.12 * u, 0.06 * u, 0.004 * u, 0, 0, 0.024 * u), 0xffffff], [G.box(0.1 * u, 0.045 * u, 0.004 * u, 0, 0, 0.026 * u), 0x203048], [G.box(0.012 * u, 0.024 * u, 0.004 * u, 0.067 * u, 0, 0.024 * u), 0xffffff]], 0.5);
  phone.position.set(px, py, 0);
  const fill = solidProp([[G.box(1, 0.037 * u, 0.004 * u, 0.5, 0, 0), 0xffffff]], 0.9); fill.position.set(px - 0.047 * u, py, 0.029 * u);
  const plug = solidProp([[G.box(0.05 * u, 0.08 * u, 0.04 * u, 0, -0.04 * u, 0), 0xf4f4f4], [G.box(0.02 * u, 0.02 * u, 0.02 * u, 0, 0.01 * u, 0), 0xc8ccd4], [G.cyl(0.01 * u, 0.01 * u, 0.4 * u, 0, -0.28 * u, 0), 0xf4f4f4]], 0.4);
  const hand = createHand({ u: 0.45 * u, side: -1, sleeve: 0x60b060 }); hand.pose('grip');
  const warn = emblemProp('exclaim', 0.25 * u, { color: 0xff4040 }), bolt = emblemProp('bolt', 0.18 * u, { color: 0xffe040 });
  group.add(phone, fill, plug, hand.group, warn, bolt);
  const loop = 5.2, red = new THREE.Color(0xff3030), green = new THREE.Color(0x40e060), col = new THREE.Color();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { plug: [1.1, 0.6, 'out'], charge: [1.9, 2.0], unplug: [4.3, 0.4, 'in'] });
      const level = 0.1 + 0.9 * T.charge * (1 - between(v, 4.6, 5.1)), low = T.charge < 0.05, blink = low && !pre && Math.sin(v * 12) < 0;
      fill.scale.x = pop(0.094 * u * level); fill.visible = !blink; fill.material.color.copy(col.copy(red).lerp(green, Math.min(1, T.charge * 2)));
      const pl = T.plug - T.unplug, y = py - PH / 2 - 0.02 * u - 0.45 * u * (1 - pl);
      plug.visible = hand.group.visible = !pre && v > 0.6; plug.position.set(px, y, 0.0); hand.group.rotation.set(0, 0, 0); handTo(hand, px, y - 0.1 * u, 0.03 * u); hand.update();
      const w = pre ? 1 : low && T.plug < 1 ? 1 : 0; warn.visible = w > 0; warn.scale.setScalar(0.25 * u * (1 + 0.15 * Math.sin(t * 10))); warn.position.set(px + 0.25 * u, py + 0.2 * u, 0.05 * u); warn.idle(t);
      const b = T.charge > 0 && T.charge < 1 ? 1 : 0; bolt.visible = b > 0; bolt.scale.setScalar(0.18 * u); bolt.position.set(px, py + 0.1 * u, 0.04 * u); bolt.idle(t);
    },
  };
}

function wardrobeDress(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, wx = B.maxX + 0.35 * u, WW = 0.46 * u, WH = 0.9 * u;
  const cab = solidProp([[G.box(WW, WH, 0.3 * u, 0, WH / 2, 0), 0x8a5a30], [G.box(WW * 0.9, WH * 0.9, 0.01 * u, 0, WH / 2, 0.15 * u), 0x3a2414], [G.cyl(0.008 * u, 0.008 * u, WW * 0.85, 0, WH * 0.85, 0.08 * u, 0, 0, Math.PI / 2), 0xc8ccd4]], 0.3);
  cab.position.set(wx, floor, -0.1 * u);
  const door = (s) => { const p = new THREE.Group(), m = solidProp([[G.box(WW / 2, WH * 0.92, 0.02 * u, -s * WW / 4, WH / 2, 0), WOOD], [G.sphere(0.015 * u, -s * WW * 0.42, WH * 0.5, 0.015 * u), 0xffd040]], 0.35); p.add(m); p.position.set(wx + s * WW / 2, floor, 0.06 * u); return p; };
  const dL = door(-1), dR = door(1), RED = 0xe04848, BLUE = 0x3a6ad8;
  const shirt = emblemProp('shirt', 0.3 * u, { color: RED }), pants = solidProp([[G.box(0.16 * u, 0.04 * u, 0.06 * u, 0, 0, 0), BLUE], [G.box(0.07 * u, 0.2 * u, 0.06 * u, -0.045 * u, -0.11 * u, 0), BLUE], [G.box(0.07 * u, 0.2 * u, 0.06 * u, 0.045 * u, -0.11 * u, 0), BLUE]], 0.45);
  const p = createPerson({ u: 0.8 * u, shirt: 0xe8e8e8, pants: 0x9a9aa0 });
  group.add(cab, dL, dR, shirt, pants, p.group);
  const loop = 5.6, chest = new THREE.Vector3(), hip = new THREE.Vector3(), px = wx + 0.5 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { open: [0.2, 0.4, 'back'], s: [0.8, 0.6], pt: [1.6, 0.6], spin: [2.5, 1.2], close: [4.6, 0.4] });
      const o = pre ? 0 : T.open - T.close; dL.rotation.y = 1.8 * o; dR.rotation.y = -1.8 * o;
      const reset = v > 4.5 || pre, top = T.s >= 1 && !reset, bot = T.pt >= 1 && !reset;
      ['body', 'armL', 'armR'].forEach((n) => p.rig.setColor(n, top ? RED : 0xe8e8e8)); ['legL', 'legR', 'shinL', 'shinR'].forEach((n) => p.rig.setColor(n, bot ? BLUE : 0x9a9aa0));
      p.reset(); p.group.position.set(px, floor + 0.05 * u * bump(v, 3.8, 0.4), 0.1 * u); p.group.rotation.y = -0.4 + Math.PI * 2 * T.spin; p.raise('L', 0.5 * bump(v, 2.5, 1.4)); p.raise('R', 0.5 * bump(v, 2.5, 1.4)); p.update();
      bonePoint(p, 'body', 0.6, chest); bonePoint(p, 'body', 0.0, hip);
      const from = [wx, floor + WH * 0.7];
      { const [x, y] = arc(from, [chest.x, chest.y], 0.3 * u, T.s); shirt.visible = !pre && T.s > 0 && T.s < 1; shirt.position.set(x, y, 0.2 * u); shirt.rotation.z = (1 - T.s) * 3; shirt.idle(0); }
      { const [x, y] = arc(from, [hip.x, hip.y], 0.3 * u, T.pt); pants.visible = !pre && T.pt > 0 && T.pt < 1; pants.position.set(x, y, 0.2 * u); pants.rotation.z = (1 - T.pt) * 3; }
    },
  };
}

function easelPaint(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, ex = B.maxX + 0.45 * u, cy = floor + 0.62 * u, CW = 0.5 * u, CH = 0.4 * u;
  const easel = solidProp([[G.box(0.025 * u, 0.95 * u, 0.025 * u, -0.18 * u, 0.47 * u, 0, -0.18), WOOD], [G.box(0.025 * u, 0.95 * u, 0.025 * u, 0.18 * u, 0.47 * u, 0, 0.18), WOOD], [G.box(0.6 * u, 0.03 * u, 0.06 * u, 0, cy - floor - CH / 2 - 0.02 * u, 0.03 * u), WOOD]], 0.3);
  easel.position.set(ex, floor, -0.05 * u);
  const canvas = solidProp([[G.box(CW, CH, 0.02 * u, 0, 0, 0), 0xfaf6ea], [G.box(CW * 0.96, CH * 0.5, 0.004 * u, 0, CH * 0.22, 0.012 * u), 0xa8dcff]], 0.45);
  canvas.position.set(ex, cy, 0.0);
  const hill = solidProp([[new THREE.CircleGeometry(0.2 * u, 24, 0, Math.PI).scale(1.2, 0.8, 1), 0x60b050]], 0.5), sun = solidProp([[new THREE.CircleGeometry(0.06 * u, 20), 0xffc020]], 0.8);
  hill.position.set(ex, cy - CH / 2 + 0.005 * u, 0.016 * u); sun.position.set(ex + 0.13 * u, cy + 0.1 * u, 0.017 * u);
  const fr = 0.035 * u, frame = solidProp([[G.box(CW + 2 * fr, fr, 0.04 * u, 0, CH / 2 + fr / 2, 0), 0xe0b030], [G.box(CW + 2 * fr, fr, 0.04 * u, 0, -CH / 2 - fr / 2, 0), 0xe0b030], [G.box(fr, CH, 0.04 * u, -CW / 2 - fr / 2, 0, 0), 0xe0b030], [G.box(fr, CH, 0.04 * u, CW / 2 + fr / 2, 0, 0), 0xe0b030]], 0.5);
  const brush = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.3 * u, 0, 0.18 * u, 0), 0x8a5a30], [G.cone(0.02 * u, 0.05 * u, 0, 0.0, 0, Math.PI), 0x60b050]], 0.4);
  group.add(easel, canvas, hill, sun, frame, brush);
  const loop = 5.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, T = timeline(v, { hill: [0.4, 0.9], sun: [1.5, 0.5, 'back'], frame: [2.3, 0.5, 'bounce'], out: [4.5, 0.5] });
      const h = pre ? 0 : T.hill * (1 - T.out), s = pre ? 0 : T.sun * (1 - T.out); hill.visible = h > 0.01; hill.scale.set(pop(h), pop(h), 1); sun.visible = s > 0.01; sun.scale.setScalar(pop(s));
      const fy = cy + 0.8 * u * (1 - T.frame); frame.visible = !pre && T.frame > 0 && T.out < 1; frame.position.set(ex, fy, 0.03 * u);
      const painting = v > 0.3 && v < 2.1, bx = v < 1.4 ? ex - 0.2 * u + 0.4 * u * between(v, 0.4, 1.3) : ex + 0.13 * u + 0.03 * u * Math.cos(v * 12), by = v < 1.4 ? cy - CH / 2 + 0.12 * u + 0.05 * u * Math.sin(v * 9) : cy + 0.1 * u + 0.03 * u * Math.sin(v * 12);
      brush.visible = !pre && painting; brush.position.set(bx, by, 0.05 * u); brush.rotation.z = -0.5;
    },
  };
}

function projector(ctx, spec, stage) {
  if (spec.outcome === 'popcorn') return popcorn(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, sx = B.maxX + 0.45 * u, sy = B.cy + 0.15 * u, SW = 0.62 * u, SH = 0.44 * u;
  const screen = solidProp([[G.box(SW, SH, 0.01 * u, 0, 0, 0), 0xf4f4f0], [G.box(SW + 0.04 * u, 0.03 * u, 0.03 * u, 0, SH / 2 + 0.015 * u, 0), 0x3a3a44], [G.cyl(0.01 * u, 0.01 * u, sy - floor - SH / 2, 0, -SH / 2 - (sy - floor - SH / 2) / 2, -0.01 * u), 0x3a3a44]], 0.7);
  screen.position.set(sx, sy, -0.5 * u);
  const proj = solidProp([[G.box(0.22 * u, 0.12 * u, 0.16 * u, 0, 0, 0), 0x3a3a44], [G.cyl(0.035 * u, 0.04 * u, 0.05 * u, -0.12 * u, 0, 0, 0, 0, Math.PI / 2), 0x202024], [G.box(0.04 * u, 0.2 * u, 0.04 * u, 0, -0.16 * u, 0), 0x60646c]], 0.4);
  const reel = solidProp([[G.cyl(0.07 * u, 0.07 * u, 0.02 * u, 0, 0, 0, Math.PI / 2), 0x8a8e96], [G.box(0.12 * u, 0.015 * u, 0.025 * u, 0, 0, 0), 0x3a3a44]], 0.4);
  const px = sx + 0.55 * u, py = floor + 0.3 * u, pz = 0.3 * u; proj.position.set(px, py, pz); reel.position.set(px + 0.03 * u, py + 0.13 * u, pz);
  const ray = solidProp([[G.cyl(0.26 * u, 0.02 * u, 1, 0, 0.5, 0, 0, 0, 0, 24), 0xfff4c0]], 1.0); ray.material.transparent = true; ray.material.opacity = 0.18; ray.material.depthWrite = false;
  beam(ray, new THREE.Vector3(px - 0.14 * u, py, pz), new THREE.Vector3(sx, sy, -0.49 * u));
  const S = 0x1a1a24, actor = createPerson({ u: 0.28 * u, shirt: S, pants: S, skin: S, hair: S, shoes: S, eyes: S, glow: 0.1 });
  group.add(screen, proj, reel, ray, actor.group);
  const loop = 4.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, on = !pre, f = pre ? 0 : (v / loop);
      ray.visible = on; reel.rotation.x = t * 4;
      actor.reset().face('right').walk(v * 12, 1); actor.group.visible = on && f > 0.05 && f < 0.95; actor.group.position.set(sx - SW / 2 + 0.05 * u + (SW - 0.1 * u) * f, sy - SH / 2 + 0.05 * u + 0.08 * u * Math.abs(Math.sin(v * 5)) * bump(v, 1.4, 1.2), -0.49 * u); actor.update();
    },
  };
}

function potCook(ctx, spec, stage) {
  if (spec.outcome === 'pan') return panFlip(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, cx = B.maxX + 0.45 * u, PR = 0.22 * u, PH = 0.22 * u, base = floor + 0.08 * u;
  const pot = solidProp([[G.box(0.6 * u, 0.08 * u, 0.36 * u, 0, 0.04 * u, 0), 0xe8e8ee], [G.torus(0.13 * u, 0.012 * u).rotateX(Math.PI / 2).translate(0, 0.082 * u, 0), 0x2a2a30], [G.cyl(PR, PR * 0.92, PH, 0, 0.08 * u + PH / 2, 0, 0, 0, 0, 28), 0x8a8e96], [G.torus(PR, 0.015 * u).rotateX(Math.PI / 2).translate(0, 0.08 * u + PH, 0), 0x6a6e76], [G.box(0.1 * u, 0.025 * u, 0.04 * u, -PR - 0.04 * u, 0.08 * u + PH * 0.8, 0), 0x2a2a30], [G.box(0.1 * u, 0.025 * u, 0.04 * u, PR + 0.04 * u, 0.08 * u + PH * 0.8, 0), 0x2a2a30], [G.cyl(PR * 0.9, PR * 0.9, 0.01 * u, 0, 0.08 * u + PH * 0.85, 0, 0, 0, 0, 28), 0xd89a50]], 0.35);
  pot.position.set(cx, floor, 0);
  const flames = many([[G.cone(0.03 * u, 0.08 * u, 0, 0.04 * u, 0), 0xff7a20]], 6, 1.0);
  const items = [solidProp([[G.cone(0.04 * u, 0.2 * u, 0, 0, 0, Math.PI), 0xf07a20], [G.cone(0.03 * u, 0.06 * u, 0, 0.12 * u, 0), 0x40a040]], 0.5), solidProp([[G.sphere(0.06 * u, 0, 0, 0, 1.8, 0.8, 0.6), 0x8aa0c0], [G.cone(0.05 * u, 0.06 * u, 0.13 * u, 0, 0, -Math.PI / 2), 0x8aa0c0]], 0.5), solidProp([[G.sphere(0.07 * u, 0, 0, 0, 1, 0.95, 0.8), 0xffffff], [G.box(0.07 * u, 0.06 * u, 0.06 * u, 0, -0.03 * u, 0.025 * u), 0x1a3020]], 0.5)];
  const ladle = solidProp([[G.cyl(0.01 * u, 0.01 * u, 0.4 * u, 0, 0.2 * u, 0), 0x8a5a30], [G.sphere(0.04 * u, 0, 0, 0, 1, 0.6, 1), 0x8a5a30]], 0.4), steam = many(PUFF(u, 0xffffff), 6, 0.6);
  group.add(pot, flames, ...items, ladle, steam);
  const loop = 5.4, rim = floor + 0.08 * u + PH;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; flames.set(i, cx + Math.cos(a) * 0.13 * u, floor + 0.08 * u, Math.sin(a) * 0.13 * u, 0.8 + 0.3 * Math.sin(t * 13 + i * 2)); }
      flames.commit();
      items.forEach((o, i) => { const f = pre ? 0 : between(v, 0.3 + 0.55 * i, 0.75 + 0.55 * i); o.visible = f > 0 && f < 1; o.position.set(cx + (i - 1) * 0.05 * u, lerp(rim + 0.7 * u, rim - 0.05 * u, f * f), 0.02 * u); o.rotation.z = f * 3 * (i % 2 ? 1 : -1); });
      const stir = v > 2.0 && v < 4.6, a = v * 4;
      ladle.visible = !pre && stir; ladle.position.set(cx + 0.1 * u * Math.cos(a), rim - 0.05 * u, 0.1 * u * Math.sin(a)); ladle.rotation.z = -0.4;
      wisps(steam, 0, 6, cx, rim + 0.02 * u, t, u, { period: 1.6, rise: 0.5, size: 1.0, on: pre ? 0.4 : Math.min(1, 0.3 + v / 2) });
      steam.commit();
    },
  };
}

export const SCENES = { 'shop-counter': shopCounter, 'phone-charge': phoneCharge, 'wardrobe-dress': wardrobeDress, 'easel-paint': easelPaint, projector, 'pot-cook': potCook };
