// Model scenes, clothes and paper (Step 3a model pass, batch 4).
//   q-coat-on        着: a woman walks in and stops on a doormat: ついた! (arrive); a red coat drops onto her from above, she
//                    tugs the front straight and twirls in it (wear); outcome wear: a blue coat drops onto her and she does
//                    the buttons up one by one, then smooths it down (着る); jacket: in the snow she shivers (さむい), lifts a
//                    green jacket off a coat stand, swings it on and hugs herself warm: ぽかぽか (上着)
//   q-wardrobe-dress 服: a wardrobe opens; a red shirt flies onto a woman in plain grey, then blue trousers: her clothes
//                    change colour; she twirls to show them off
//   q-suit-up        背広: a man in a suit straightens his tie (a sparkle), picks up his briefcase and walks off to work
//   q-shoe-step      靴: a pair of red shoes hops onto a mat; a girl steps into them, looks down, hops and walks off in
//                    them; outcome socks: striped socks instead (靴下)
// Clothes on the fixed models: a shape drops or flies onto the person, then the person's own material takes its colour.
import * as THREE from 'three';
import { acts, timeline, bump, tremble } from './timeline.js';
import { many, PUFF, HEART, burst } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between, arc, wisps } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID, briefcase, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3(), C1 = new THREE.Color();
// recolour a person's material `name` toward `hex` by k (0 = its own colour); call every frame (pure of t)
export function dyer(a) {
  const orig = a.materials.map((m) => m.color.clone());
  return (name, hex, k = 1) => a.materials.forEach((m, i) => { if (m.name !== name) return; m.color.copy(orig[i]).lerp(C1.set(hex), k); if (!m.map) m.emissive.copy(m.color); });
}
// put a prop at a point of the actor's own frame (heights), turned with it
export function stick(a, prop, space, x, y, z) { prop.position.copy(space.worldToLocal(a.local(x, y, z, W2))); prop.rotation.set(0, a.group.rotation.y, 0); }

// a coat as a shape (dropping, hanging): body, sleeves, collar; origin at the shoulders' middle
const coatProp = (u, c) => solidProp([[G.box(0.26 * u, 0.3 * u, 0.17 * u, 0, -0.14 * u, 0), c], [G.cyl(0.13 * u, 0.16 * u, 0.16 * u, 0, -0.35 * u, 0), c],
  [G.cyl(0.04 * u, 0.045 * u, 0.24 * u, -0.16 * u, -0.12 * u, 0, 0, 0, -0.35), c], [G.cyl(0.04 * u, 0.045 * u, 0.24 * u, 0.16 * u, -0.12 * u, 0, 0, 0, 0.35), c],
  [G.box(0.16 * u, 0.04 * u, 0.18 * u, 0, 0.01 * u, 0), new THREE.Color(c).multiplyScalar(0.7).getHex()]], 0.45);
// the coat's skirt once it is on (the body and sleeves are the person's own material)
const hemProp = (u, c) => solidProp([[G.cyl(0.115 * u, 0.15 * u, 0.15 * u, 0, 0, 0, 0, 0, 0, 24), c]], 0.45);

// ---- 着 / 着る / 上着 ----
function coatOn(ctx, spec, stage) {
  const o = spec.outcome, u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.45 * u, xs = px + 0.85 * u;
  const C = new THREE.Color(spec.color ?? (o === 'jacket' ? 0x3a8a5a : o === 'wear' ? 0x2a6ad0 : 0xc8402a)).getHex();
  const p = person(spec.who, u), dye = dyer(p), coat = coatProp(u, C), hem = hemProp(u, C), btn = many([[G.sphere(0.017 * u), 0xffd040]], 3, 0.8);
  const extra = o === 'jacket' ? solidProp([[G.cyl(0.018 * u, 0.018 * u, 0.9 * u, 0, 0.45 * u, 0), 0x6a4a2a], [G.cyl(0.12 * u, 0.14 * u, 0.04 * u, 0, 0.02 * u, 0), 0x6a4a2a], [G.cyl(0.01 * u, 0.01 * u, 0.12 * u, 0.05 * u, 0.84 * u, 0, 0, 0, -0.9), 0x6a4a2a], [G.cyl(0.01 * u, 0.01 * u, 0.12 * u, -0.05 * u, 0.84 * u, 0, 0, 0, 0.9), 0x6a4a2a]], 0.35)
    : o === 'wear' ? null : solidProp([[G.box(0.55 * u, 0.02 * u, 0.32 * u, 0, 0.01 * u, 0), 0x8a5a30], [G.box(0.49 * u, 0.022 * u, 0.26 * u, 0, 0.012 * u, 0), 0xc8964a]], 0.3);
  const sx = px + 0.42 * u;
  if (extra) { extra.position.set(o === 'jacket' ? sx : px, floor, o === 'jacket' ? -0.1 * u : 0.1 * u); if (o !== 'jacket') extra.rotation.x = 0.45; group.add(extra); }
  const say = o === 'wear' ? null : label(u, o === 'jacket' ? 'さむい…' : 'ついた!', o === 'jacket' ? '#3a7ac0' : '#e0802a', 0.13), warm = o === 'jacket' ? label(u, 'ぽかぽか', '#e0702a', 0.13) : null;
  const puffs = o === 'jacket' ? many(PUFF(u, 0xf4f8ff), 4, 0.6) : null;
  group.add(p.group, coat, hem, btn, ...[say, warm, puffs].filter(Boolean));
  const loop = o === 'arrive' || !o ? 7.6 : o === 'wear' ? 6.6 : 7.2, hook = new THREE.Vector3(sx, floor + 0.8 * u, -0.04 * u);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // cp: where the coat shape is (group space), null when it is on her
      const shoulder = () => group.worldToLocal(p.local(0, 0.66, 0.0, new THREE.Vector3())), above = (k) => shoulder().add(W2.set(0, k * 1.0 * u, 0));
      if (o === 'wear') {
        const T = timeline(v, { drop: [0.3, 0.6, 'in'], off: [5.6, 0.6, 'in'] });
        p.pose('Idle', t); p.group.position.set(px, floor, 0.08 * u); p.group.rotation.y = -0.25 + 0.3 * Math.sin(between(v, 3.9, 5.3) * Math.PI * 2);
        const dressed = !pre && T.drop >= 1 && T.off <= 0, on = pre ? 0 : T.drop * (1 - T.off);
        // the buttons, top to bottom: both hands meet at each one in turn, her head bent to watch
        const b = pre ? -1 : (v - 1.2) / 0.8;
        if (dressed && b > 0 && b < 3) {
          const i = Math.floor(b), f = bump(b - i, 0.05, 0.9);
          p.handTo('R', p.local(-0.03, 0.5 - 0.075 * i, 0.15, W), f, { out: 0.6, down: 0.9 }); p.handTo('L', p.local(0.03, 0.5 - 0.075 * i, 0.15, W), f, { out: 0.6, down: 0.9 });
        }
        p.turn('Head', 0.3 * between(b, 0, 0.3) * (1 - between(b, 2.7, 3)));
        place(dressed, !dressed && on > 0 ? above(1 - T.drop + T.off) : null, pre ? 0 : Math.min(3, Math.max(0, Math.floor(b + 0.6))));
        return;
      }
      if (o === 'jacket') {
        const T = timeline(v, { take: [1.4, 0.5], swing: [1.9, 0.8, 'smooth'], hug: [3.0, 0.4], unhug: [5.0, 0.4], back: [5.6, 0.8] });
        const cold = pre ? 1 : 1 - between(v, 2.6, 2.9) + between(v, 6.3, 6.6), dressed = !pre && T.swing >= 1 && T.back <= 0;
        p.pose('Idle', t); p.group.position.set(px + 0.012 * u * tremble(pre ? t : v, 9) * cold, floor, 0.08 * u); p.group.rotation.y = turnTo(-0.2, RIGHT - 0.3, T.take * (1 - T.swing));
        const hug = Math.max(cold * (pre ? 1 : 1 - between(v, 1.2, 1.5) + between(v, 6.3, 6.6)), T.hug * (1 - T.unhug));
        p.handTo('R', p.local(0.12, 0.5, 0.13, W), hug, { out: 0.6, down: 0.9 }); p.handTo('L', p.local(-0.12, 0.48, 0.15, W), hug, { out: 0.6, down: 0.9 });
        // off the hook, up over her head in her right hand, down onto her shoulders; at the end it floats back to the hook
        let cp = null;
        if (!dressed) {
          const top = shoulder();
          if (T.back > 0) cp = top.clone().lerp(hook, T.back).setY(lerp(top.y, hook.y, T.back) + 0.4 * u * Math.sin(Math.PI * T.back));
          else { const [ax, ay] = arc([hook.x, hook.y], [top.x, top.y], 0.35 * u, T.swing); cp = new THREE.Vector3(ax, ay, lerp(hook.z, top.z, T.swing)); }
          if (T.take > 0 && T.swing < 1) p.handTo('R', group.localToWorld(cp.clone().add(W.set(0, 0.03 * u, 0.06 * u))), T.take, { out: 0.7, down: 0.5 });
        }
        place(dressed, cp, 3);
        pop(say, cold > 0.5 ? 1 : 0, px - 0.05 * u, floor + 1.05 * u, 0.15 * u); pop(warm, pre ? 0 : T.hug * (1 - T.unhug), px - 0.05 * u, floor + 1.05 * u, 0.15 * u);
        p.at('mouth', W, 0, 0, 0.08); group.worldToLocal(W); wisps(puffs, 0, 4, W.x, W.y, pre ? t : v, u, { period: 1.2, rise: 0.25, size: 0.6 * cold });
        puffs.commit();
        return;
      }
      // arrive: in from the right, stops on the mat; the coat drops on; tug; twirl; it lifts off; she walks back out
      const T = timeline(v, { walk: [0, 1.4, 'linear'], face: [1.4, 0.3], drop: [2.5, 0.6, 'in'], twirl: [4.0, 1.2], off: [5.6, 0.5, 'in'], go: [6.1, 0.3], out: [6.3, 1.0, 'linear'], home: [7.3, 0.3] });
      const yaw = pre ? LEFT + 0.4 : T.go > 0 ? turnTo(turnTo(-0.25, RIGHT, T.go), LEFT + 0.4, T.home) : turnTo(LEFT + 0.2, -0.25, T.face);
      const walking = !pre && ((T.walk > 0 && T.walk < 1) || (T.out > 0 && T.out < 1));
      p.pose(walking ? 'Walk' : 'Idle', walking ? v : t);
      p.group.position.set(pre ? xs : lerp(lerp(xs, px, T.walk), xs, T.out), floor, 0.1 * u); p.group.rotation.y = yaw + Math.PI * 2 * T.twirl;
      const dressed = !pre && T.drop >= 1 && T.off <= 0, on = pre ? 0 : T.drop * (1 - T.off), tug = pre ? 0 : bump(v, 3.2, 0.7);
      p.handTo('R', p.local(-0.06, 0.42 - 0.04 * tug, 0.19, W), tug, { out: 0.6, down: 0.9 }); p.handTo('L', p.local(0.06, 0.42 - 0.04 * tug, 0.19, W), tug, { out: 0.6, down: 0.9 });
      p.turn('Head', 0.3 * tug);
      place(dressed, !dressed && on > 0 ? above(1 - T.drop + T.off) : null, 3);
      pop(say, pre ? 0 : between(v, 1.5, 1.8) * (1 - between(v, 2.4, 2.6)), px, floor + 1.05 * u, 0.15 * u);
    },
  };
  // the coat shape (falling, swinging) or, once on, her own jacket in the coat's colour + its skirt and buttons
  function place(dressed, cp, nb) {
    coat.visible = !!cp;
    if (cp) { coat.position.copy(cp); coat.rotation.set(0, p.group.rotation.y, 0); }
    dye('Black', C, dressed ? 1 : 0); dye('Shirt', C, 0); dye('Pants', C, dressed ? 1 : 0);
    hem.visible = dressed; if (dressed) stick(p, hem, group, 0, 0.27, 0.0);
    for (let i = 0; i < 3; i++) { p.local(0, 0.5 - 0.075 * i, 0.165, W); group.worldToLocal(W); btn.set(i, W.x, W.y, W.z, dressed && i < nb ? 1 : 0); }
    btn.commit();
  }
}

// ---- 服 ----
function wardrobe(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u, wx = px + 0.62 * u, WW = 0.5 * u, WH = 1.0 * u;
  const cab = solidProp([[G.box(WW, WH, 0.3 * u, 0, WH / 2, 0), 0x8a5a30], [G.box(WW * 0.9, WH * 0.92, 0.01 * u, 0, WH / 2, 0.152 * u), 0x2a1a10], [G.cyl(0.008 * u, 0.008 * u, WW * 0.85, 0, WH * 0.85, 0.165 * u, 0, 0, Math.PI / 2), 0xc8ccd4],
    ...[0xf0c030, 0x60c060, 0xe07ab0, 0x40a0e0].map((c, i) => [G.box(0.09 * u, 0.32 * u, 0.012 * u, (-0.15 + 0.1 * i) * u, WH * 0.66, 0.163 * u), c])], 0.35);
  cab.position.set(wx, floor, -0.2 * u);
  const door = solidProp([[G.box(WW / 2, WH * 0.92, 0.02 * u, WW / 4, WH / 2, 0), 0xa86a38], [G.sphere(0.016 * u, WW * 0.42, WH * 0.5, 0.016 * u), 0xffd040]], 0.35), door2 = door.clone();
  const dL = new THREE.Group(), dR = new THREE.Group(); dL.add(door); dR.add(door2); door2.scale.x = -1;
  dL.position.set(wx - WW / 2, floor, -0.025 * u); dR.position.set(wx + WW / 2, floor, -0.025 * u);
  const RED = 0xe03a3a, BLUE = 0x2f5ad8, shirt = emblemProp('shirt', 0.3 * u, { color: RED });
  const pants = solidProp([[G.box(0.18 * u, 0.05 * u, 0.06 * u, 0, 0, 0), BLUE], [G.box(0.08 * u, 0.22 * u, 0.06 * u, -0.05 * u, -0.13 * u, 0), BLUE], [G.box(0.08 * u, 0.22 * u, 0.06 * u, 0.05 * u, -0.13 * u, 0), BLUE]], 0.45);
  const p = person(spec.who, u), dye = dyer(p), spark = burst(u, { s: 0.22, n: 6, color: 0xfff0a0 });
  group.add(cab, dL, dR, shirt, pants, p.group, spark);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { open: [0.2, 0.5, 'back'], s: [0.9, 0.7], pt: [1.8, 0.7], spin: [2.9, 1.3], sb: [5.0, 0.6], pb: [5.4, 0.6], close: [6.2, 0.5] });
      const o = pre ? 0 : T.open * (1 - T.close); dL.rotation.y = -2.4 * o; dR.rotation.y = 2.4 * o;
      const cheer = !pre && v > 2.9 && v < 4.4;
      p.pose(cheer ? 'Victory' : 'Idle', cheer ? 0.5 + 0.25 * Math.sin((v - 2.9) * 3) : t, !cheer);
      p.group.position.set(px, floor + 0.04 * u * bump(v, 4.0, 0.35), 0.12 * u); p.group.rotation.y = -0.35 + Math.PI * 2 * T.spin;
      // plain grey to start with; each piece flies out of the wardrobe and her own clothes take its colour; at the end back in
      const top = !pre && T.s >= 1 && T.sb <= 0, bot = !pre && T.pt >= 1 && T.pb <= 0;
      dye('Shirt', top ? RED : 0xb8b8bc, 1); dye('Pants', bot ? BLUE : 0x7c7c84, 1);
      const from = [wx, floor + WH * 0.65], chest = group.worldToLocal(p.local(0, 0.46, 0.05, W)), hip = group.worldToLocal(p.local(0, 0.28, 0.05, W2));
      const fs = T.s < 1 ? T.s : 1 - T.sb, fp = T.pt < 1 ? T.pt : 1 - T.pb;
      { const [x, y] = arc(from, [chest.x, chest.y], 0.35 * u, fs); shirt.visible = !pre && fs > 0 && fs < 1; shirt.position.set(x, y, lerp(-0.1 * u, chest.z + 0.05 * u, fs)); shirt.rotation.z = (1 - fs) * 3; shirt.idle(0); }
      { const [x, y] = arc(from, [hip.x, hip.y], 0.35 * u, fp); pants.visible = !pre && fp > 0 && fp < 1; pants.position.set(x, y, lerp(-0.1 * u, hip.z + 0.05 * u, fp)); pants.rotation.z = (1 - fp) * 3; }
      const s = pre ? 0 : bump(v, 3.2, 1.0); pop(spark, s, px + 0.2 * u, floor + 0.95 * u, 0.2 * u); spark.rotation.z = v * 2;
    },
  };
}

// ---- 背広 ----
function suitUp(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u;
  const p = person(spec.who, u), bag = briefcase(u), spark = burst(u, { s: 0.18, n: 6, color: 0xfff0a0 });
  group.add(p.group, bag, spark);
  const loop = 6.6, rest = new THREE.Vector3(px + 0.22 * u, floor + 0.175 * u, 0.12 * u);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { fix: [0.3, 0.4], unfix: [1.6, 0.4], dip: [2.1, 0.5], up: [2.7, 0.5], turn: [3.3, 0.3], walk: [3.5, 1.6, 'linear'], gone: [5.0, 0.3], back: [6.1, 0.4, 'back'] });
      const walking = T.walk > 0 && T.walk < 1, crouch = pre ? 0 : T.dip * (1 - T.up);
      p.pose(walking ? 'Walk' : crouch > 0.02 ? 'PickUp' : 'Idle', walking ? v : crouch > 0.02 ? 0.55 * crouch : t, !(crouch > 0.02) || walking);
      p.group.position.set(px + 0.75 * u * T.walk, floor, 0.12 * u); p.group.rotation.y = turnTo(-0.3, RIGHT - 0.15, T.turn);
      p.group.scale.setScalar(grow(T.gone > 0 && T.back <= 0 ? 1 - T.gone : T.back > 0 ? T.back : 1));
      // straightens his jacket by the lapels, two little tugs, his head bent to check; a sparkle on the tie
      const fix = pre ? 0 : T.fix * (1 - T.unfix);
      const tg = 0.03 * Math.max(0, Math.sin(v * 7)) * fix;
      p.handTo('R', p.local(-0.08, 0.5 - tg, 0.13, W), fix, { out: 1, down: 0.5 }); p.handTo('L', p.local(0.08, 0.5 - tg, 0.13, W), fix, { out: 1, down: 0.5 }); p.turn('Head', 0.25 * fix);
      pop(spark, pre ? 0 : bump(v, 1.3, 0.6), px + 0.02 * u, floor + 0.58 * u, 0.3 * u); spark.rotation.z = v * 3;
      // the briefcase waits on the floor by his right foot; he crouches and picks it up and keeps it in hand
      const held = !pre && v > 2.45 && v < 5.3;
      if (held) { if (v < 2.7) p.grip('R', rest.clone().applyMatrix4(group.matrixWorld), W2.set(0, -1, 0), 0, 1, { out: 0.5, down: 0.6 }); p.hold(bag, 'R', group, 0.004 * u); bag.rotation.set(0, p.group.rotation.y, 0); }
      else { bag.position.copy(rest); bag.rotation.set(0, -0.3, 0); if (crouch > 0.02) p.grip('R', rest.clone().applyMatrix4(group.matrixWorld), W2.set(0, -1, 0), 0, crouch, { out: 0.5, down: 0.6 }); }
      bag.visible = !(v > 5.3 && v < 6.1) || pre;
      bag.scale.setScalar(grow(held ? p.group.scale.x : v > 6.1 && !pre ? T.back : 1));
    },
  };
}

// ---- 靴 / 靴下 ----
const SHOE = (u, c) => [[G.box(0.075 * u, 0.022 * u, 0.15 * u, 0, 0.011 * u, 0.02 * u), 0xf4f4f4], [G.sphere(0.048 * u, 0, 0.035 * u, 0.05 * u, 0.8, 0.7, 1.1), c], [G.box(0.07 * u, 0.06 * u, 0.06 * u, 0, 0.045 * u, -0.025 * u), c], [G.box(0.05 * u, 0.008 * u, 0.04 * u, 0, 0.078 * u, 0.0), 0xffffff]];
const SOCK = (u, c) => [[G.sphere(0.045 * u, 0, 0.03 * u, 0.04 * u, 0.85, 0.65, 1.4), c], [G.cyl(0.036 * u, 0.036 * u, 0.14 * u, 0, 0.09 * u, -0.01 * u), c], ...[0.06, 0.1, 0.14].map((y) => [G.cyl(0.038 * u, 0.038 * u, 0.018 * u, 0, y * u, -0.01 * u), 0xffffff])];
function shoeStep(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, mx = B.maxX + 0.5 * u, socks = spec.outcome === 'socks', C = socks ? 0xff5a8a : 0xe03a3a;
  const mat = solidProp([[G.box(0.5 * u, 0.02 * u, 0.36 * u, 0, 0.01 * u, 0), 0x8a5a30], [G.box(0.44 * u, 0.022 * u, 0.3 * u, 0, 0.012 * u, 0), 0xc8964a]], 0.3);
  mat.position.set(mx, floor, 0.12 * u);
  const pair = many((socks ? SOCK : SHOE)(u, C), 2, 0.45), kid = person(spec.who, u, KID + 0.1), spark = burst(u, { s: 0.16, n: 6, color: 0xfff0a0 });
  const feet = ['FootL', 'FootR'].map((n) => kid.node(n));
  group.add(mat, pair, kid.group, spark);
  const loop = 6.6, back = -0.35 * u;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { hop: [0.1, 1.3, 'linear'], line: [1.4, 0.3], step: [1.9, 0.9, 'linear'], look: [3.0, 0.3], unlook: [3.6, 0.3], turn: [4.1, 0.3], walk: [4.3, 1.3, 'linear'], gone: [5.5, 0.3], back: [6.2, 0.4, 'back'] });
      const walking = !pre && ((T.step > 0 && T.step < 1) || (T.walk > 0 && T.walk < 1)), jump = !pre && v > 3.6 && v < 4.1;
      kid.pose(walking ? 'Walk' : jump ? 'Jump' : 'Idle', walking ? v : jump ? (v - 3.6) * 2 : t);
      kid.group.position.set(mx + 0.7 * u * T.walk, floor, lerp(back, 0.12 * u, T.step)); kid.group.rotation.y = turnTo(0, RIGHT - 0.2, T.turn);
      kid.group.scale.setScalar(grow(T.gone > 0 && T.back <= 0 ? 1 - T.gone : T.back > 0 ? T.back : 1));
      kid.turn('Head', 0.45 * T.look * (1 - T.unlook));
      // the pair hops in from the right and lines up on the mat; once she has stepped in, they go on her feet
      const worn = !pre && T.step >= 1 && T.back <= 0;
      for (let i = 0; i < 2; i++) {
        if (worn) {
          feet[i].getWorldPosition(W); group.worldToLocal(W);
          const fw = axisOf(kid, 0, 0, 1, W2), ws = 1 / group.getWorldScale(new THREE.Vector3()).y;
          pair.set(i, W.x + fw.x * 0.02 * u * ws * 0, socks ? W.y - 0.06 * u : floor + 0.002 * u + Math.max(0, W.y - floor - 0.06 * u), W.z, 1.25 * kid.group.scale.x, 0, kid.group.rotation.y);
        } else {
          const side = i ? 1 : -1, ph = (pre ? 0 : v) * 7 + i * Math.PI, inF = pre ? 0 : T.hop;
          pair.set(i, mx + side * 0.07 * u + 0.9 * u * (1 - inF), floor + 0.022 * u + (inF > 0 && inF < 1 ? 0.1 * u * Math.abs(Math.sin(ph)) : 0), 0.12 * u, pre || v > 6.2 ? 0 : 1.25, 0, lerp(LEFT, 0, T.line));
        }
      }
      pair.commit();
      pop(spark, pre ? 0 : bump(v, 2.8, 0.6), mx, floor + 0.2 * u, 0.3 * u); spark.rotation.z = v * 3;
    },
  };
}

// ---- 紙 / 手紙 ----
function paperFold(ctx, spec, stage) {
  if (spec.outcome === 'letter') return letter(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, kx = B.maxX + 0.4 * u, cx = kx + 0.42 * u, cy = floor + 0.62 * u, S = 0.42 * u;
  const tri = () => { const sh = new THREE.Shape(); sh.moveTo(-0.5, 0); sh.lineTo(0.5, 0); sh.lineTo(0, 0.5); sh.lineTo(-0.5, 0); return new THREE.ShapeGeometry(sh).scale(S, S, 1); };
  const lower = solidProp([[tri().rotateZ(Math.PI), 0xfaf6ea]], 0.55), upper = new THREE.Group(), upperM = solidProp([[tri(), 0xf0ead8]], 0.55);
  upper.add(upperM); lower.material.side = upperM.material.side = THREE.DoubleSide;
  const sheet = new THREE.Group(); sheet.add(lower, upper);
  const hat = solidProp([[G.cone(0.12 * u, 0.2 * u, 0, 0.1 * u, 0), 0xfaf6ea], [G.cyl(0.125 * u, 0.125 * u, 0.025 * u, 0, 0.012 * u, 0), 0xe04848]], 0.5);
  const kid = person(spec.who, u, KID + 0.1), wow = label(u, 'わあ!', '#e0802a', 0.13);
  group.add(sheet, hat, kid.group, wow);
  const loop = 6.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { drift: [0, 1.0, 'out'], fold1: [1.1, 0.5], fold2: [1.7, 0.5], hat: [2.3, 0.3], hop: [2.6, 0.6], off: [5.2, 0.5] });
      const cheer = !pre && v > 3.3 && v < 4.9;
      kid.pose(cheer ? 'Victory' : 'Idle', cheer ? 0.5 + 0.2 * Math.sin((v - 3.3) * 3) : t, !cheer);
      kid.group.position.set(kx, floor, 0.12 * u); kid.group.rotation.y = 0.35 - 0.35 * between(v, 3.2, 3.5);
      kid.turn('Head', -0.3 * (pre ? 0 : between(v, 0, 0.4) * (1 - between(v, 2.6, 3.1))), 0.3 * (1 - between(v, 2.6, 3.1)));
      // a sheet flutters down in front of him, folds in half (a triangle), folds again and becomes a paper hat
      sheet.visible = !pre && T.hat < 1;
      sheet.position.set(cx + 0.18 * u * Math.sin(v * 3) * (1 - T.drift), cy + 0.6 * u * (1 - T.drift), 0.05 * u);
      sheet.rotation.set(0, 0, 0.35 * Math.sin(v * 4) * (1 - T.drift) + Math.PI / 4 * T.fold2); sheet.scale.setScalar(grow((1 - 0.4 * T.fold2) * (1 - T.hat)));
      upper.rotation.x = Math.PI * T.fold1;
      // ... which hops onto his head; at the end it lifts off and floats away
      const head = group.worldToLocal(kid.at('over', W, 0, -0.12, -0.02)), [hx, hy] = arc([cx, cy], [head.x, head.y], 0.3 * u, T.hop);
      hat.visible = !pre && T.hat > 0 && T.off < 1;
      hat.position.set(T.hop < 1 ? hx : head.x, (T.hop < 1 ? hy : head.y) + 0.5 * u * T.off, T.hop < 1 ? lerp(0.05 * u, head.z, T.hop) : head.z);
      hat.scale.setScalar(grow(T.hat * (1 - T.off))); hat.rotation.set(0, 0, T.hop < 1 ? (1 - T.hop) * 3 : -0.15);
      pop(wow, pre ? 0 : between(v, 3.3, 3.6) * (1 - between(v, 4.8, 5.1)), kx - 0.05 * u, floor + 0.95 * u, 0.15 * u);
    },
  };
}
function letter(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, px = B.maxX + 0.42 * u;
  const p = person(spec.who, u), sheet = solidProp([[G.box(0.2 * u, 0.26 * u, 0.006 * u, 0, 0, 0), 0xfdfaf0]], 0.55), lines = many([[G.box(0.15 * u, 0.018 * u, 0.006 * u, 0.075 * u, 0, 0), 0x2a3a90]], 5, 0.5);
  const pen = solidProp([[G.cyl(0.008 * u, 0.008 * u, 0.13 * u, 0, 0, 0), 0x2a2a3a], [G.cone(0.008 * u, 0.02 * u, 0, -0.075 * u, 0, Math.PI), 0xd0a040]], 0.5);
  const env = solidProp([[G.box(0.26 * u, 0.17 * u, 0.012 * u, 0, 0, 0), 0xf0e0c0], [G.poly([[-0.13 * u, 0.085 * u], [0, -0.01 * u], [0.13 * u, 0.085 * u]], 0.004 * u), 0xb89a70]], 0.5), seal = solidProp(HEART(u, 0.07, 0xe02040), 0.7);
  sheet.add(lines); group.add(p.group, sheet, pen, env, seal);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { write: [0.2, 0.3], unwrite: [2.0, 0.3], fold: [2.2, 0.4], seal: [2.7, 0.3, 'back'], up: [3.1, 0.4], fly: [3.6, 1.4], wave: [3.9, 0.3], unwave: [5.2, 0.3], fresh: [5.6, 0.5, 'back'] });
      p.pose('Idle', t); p.group.position.set(px, floor, 0.1 * u); p.group.rotation.y = 0.15;
      // she writes a letter on a sheet held in her left hand (lines appear), folds it into an envelope, seals it with a
      // heart, holds it up and lets it fly off like a bird; she waves it goodbye; a fresh sheet
      const hold = pre ? A.setup : 1, up = T.up * (1 - T.fly), paper = p.local(0.02 + 0.2 * up, 0.44 + 0.25 * up, 0.27, new THREE.Vector3());
      const wr = pre ? 0 : T.write * (1 - T.unwrite), done = pre ? 0 : (v - 0.45) / 0.3;
      sheet.position.copy(group.worldToLocal(paper.clone())); sheet.rotation.set(-0.45, p.group.rotation.y, 0, 'YXZ'); sheet.visible = pre || T.fold < 0.5 || T.fresh > 0;
      sheet.scale.setScalar(grow(T.fresh > 0 ? T.fresh : 1 - T.fold));
      for (let i = 0; i < 5; i++) lines.set(i, -0.075 * u, 0.08 * u - 0.04 * u * i, 0.005 * u, T.fresh <= 0 && done - i > 0 ? 1 : 0);
      lines.commit();
      p.handTo('L', p.local(0.1 + 0.2 * up, 0.42 + 0.25 * up, 0.25, W), hold * (1 - T.fly), { out: 0.6, down: 0.9 });
      const nib = paper.clone().add(W.set(0, 0.03 * u * group.getWorldScale(W2).y, 0));
      p.write('R', nib, wr, v); p.hold(pen, 'R', group, 0.01 * u); pen.rotation.set(0.5, p.group.rotation.y, 0.4); pen.visible = wr > 0.05;
      p.wave('R', T.wave * (1 - T.unwave), v);
      // the envelope: in her hands, then flapping off up and to the right
      const e = pre ? 0 : T.fold * (1 - T.fresh), f = T.fly;
      env.visible = seal.visible = e > 0.02 && f < 1;
      env.position.copy(group.worldToLocal(p.local(0.02 + 0.2 * T.up, 0.44 + 0.25 * T.up, 0.27, W2))).add(W.set(0.9 * u * f, 0.6 * u * f, 0.05 * u)); env.rotation.set(-0.3 * (1 - f), p.group.rotation.y * (1 - f), 0.3 * f + 0.25 * Math.sin(v * 9) * f);
      env.scale.set(grow(e * (1 - 0.5 * f)), grow(e * (1 - 0.5 * f) * (1 - 0.5 * Math.abs(Math.sin(v * 9)) * f)), 1);
      seal.position.copy(env.position).add(W.set(0, 0.0, 0.015 * u)); seal.rotation.copy(env.rotation); seal.scale.setScalar(grow(T.seal * (1 - 0.5 * f)));
    },
  };
}

export const SCENES = { 'q-coat-on': coatOn, 'q-wardrobe-dress': wardrobe, 'q-suit-up': suitUp, 'q-shoe-step': shoeStep, 'q-paper-fold': paperFold };
