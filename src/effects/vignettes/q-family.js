// Model scenes, the family (Step 3a model pass): Quaternius people as parents, brothers and sisters; children are adults
// scaled down (q-common.js KID).
//   q-dad      父: a dad with a moustache crouches, lifts his little girl high over his head (たかい たかい) and sways her
//              while she cheers, then sets her down; outcome home: he comes home with a briefcase, she runs to him (おかえり!)
//              and is lifted high, then they walk off hand in hand (お父さん)
//   q-mum      母: a mum rocks a baby bundle in her arms, looking down at it, a lullaby ♪ and hearts; outcome cook: she
//              stirs a steaming pot with a ladle, tastes from it and nods (お母さん)
//   q-brother  兄: a big brother holds a ball up high, the little one jumps for it; he hands it down and pats his head;
//              outcome piggyback: he walks along carrying the little one on his back (お兄さん)
//   q-sister   姉: a big sister crouches and ties her little sister's shoelace (a bow pops), then they walk off hand in
//              hand; outcome hair: she ties a ribbon in the little one's hair, who hops for joy (お姉さん)
//   q-follow   弟: a big brother walks on; the little one runs after; the big one stops, holds out his hand, and they go
//              on hand in hand
//   q-catch    兄弟: a big brother and a little brother throw a ball back and forth
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, HEART } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { ball, PUFF } from '../pieces/kit-things.js';
import { textPlane } from '../pieces/kit-props.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { wisps } from './helpers.js';
import { RIGHT, LEFT, UP, DOWN, lerp, label, pop, hearts, person, KID, TEEN, liftKid, handInHand, briefcase, babyBundle, moustache, onHead, turnTo, axisOf } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();

// ---- 父 / お父さん ----
function dad(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.62 * u, home = spec.outcome === 'home';
  const pa = person(spec.who, u, 0.92), kid = person(spec.kid, u, KID), tache = moustache(u), love = many(HEART(u, 0.09), 3, 1);
  const bag = home ? briefcase(u) : null, hi = home ? label(u, 'おかえり!', '#d0603a', 0.13) : null;
  group.add(pa.group, kid.group, tache, love, ...(home ? [bag, hi] : []));
  const loop = home ? 9.0 : 6.6, yaw = LEFT + 0.6, chest = new THREE.Vector3(), low = new THREE.Vector3(), high = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // home: he walks in (0-1.6), she runs to him (1.2-2.2); then the same lift as 父, 2.2 s later; then off together
      const d = home ? 2.2 : 0, w = v - d;
      const T = timeline(w, { bend: [0.1, 0.5], lift: [0.6, 0.9], down: [3.8, 0.8], rise: [4.6, 0.5] });
      const Th = timeline(v, { come: [0, 1.6, 'out'], run: [1.2, 1.0, 'linear'], turn: [7.0, 0.4], go: [7.2, 1.8, 'in'] });
      const crouch = pre ? 0 : T.bend * (1 - T.lift) + between(w, 3.9, 4.4) * (1 - T.rise);
      const walking = home && !pre && ((Th.come > 0 && Th.come < 1) || Th.go > 0);
      pa.pose(walking ? 'Walk' : crouch > 0.02 ? 'PickUp' : 'Idle', walking ? v : crouch > 0.02 ? 0.55 * crouch : t, !(crouch > 0.02) || walking);
      const px = x0 + (home ? (pre ? 0 : (1 - Th.come) * 0.9 * u + Th.go * 1.2 * u) : 0);
      pa.group.position.set(px, floor, 0); pa.group.rotation.y = home && !pre ? (Th.come < 1 ? LEFT + 0.6 : turnTo(yaw, RIGHT - 0.5, Th.turn)) : yaw;
      if (home && !pre && Th.come >= 1 && Th.turn <= 0) pa.group.rotation.y = turnTo(LEFT + 0.6, yaw, between(v, 1.6, 2.0));
      onHead(pa, tache, group, 'mouth', 0, 0.03, 0.02);
      // she stands in front of him; held by the sides, up high over his head, swayed
      pa.local(0, 0.24, 0.3, low); pa.local(0.1 * Math.sin(w * 2.4) * between(w, 1.5, 1.9) * (1 - T.down), 0.84, 0.5 + 0.04 * Math.sin(w * 4.8), high);
      const up = pre ? 0 : T.lift * (1 - T.down), held = !pre && w > 0.1 && w < 4.9;
      chest.copy(low).lerp(high, up);
      const cheer = !pre && up > 0.9;
      kid.pose(cheer ? 'Victory' : (home && !pre && Th.run > 0 && Th.run < 1) ? 'Run' : 'Idle', cheer ? 0.5 + 0.3 * Math.sin(w * 2) : t + 1);
      if (held) liftKid(pa, kid, group, chest, Math.min(1, between(w, 0.1, 0.6) * (1 - between(w, 4.5, 4.9))), true);
      else {
        kid.group.position.copy(group.worldToLocal(low.clone())).setY(floor); kid.group.rotation.y = pa.group.rotation.y + Math.PI;
        if (home && !pre && w < 0.1) {                         // she waits by the kanji, then runs to him
          kid.group.position.x = lerp(B.maxX - 0.1 * u, kid.group.position.x, Th.run); kid.group.position.z = lerp(0.4 * u, kid.group.position.z, Th.run);
          kid.group.rotation.y = Th.run > 0 ? RIGHT - 0.4 : 0.2;
        }
        if (home && !pre && w > 4.9) {                         // off together, hand in hand
          kid.group.position.copy(group.worldToLocal(pa.local(0.32, 0, 0.05, W))); kid.group.rotation.y = pa.group.rotation.y;
          kid.pose(Th.go > 0 ? 'Walk' : 'Idle', v + 0.3);
          handInHand(pa, 'L', kid, 'R', between(v, 6.9, 7.2));
        }
      }
      if (home) {
        // the briefcase: in his right hand, set down when he crouches for her, back in the hand when he sets her down
        const inHand = pre || w < 0.3 || w > 4.3;
        if (inHand) { pa.hold(bag, 'R', group, 0.004 * u); bag.rotation.y = pa.group.rotation.y; }
        else bag.position.copy(group.worldToLocal(pa.local(-0.3, 0.2, 0.05, W))).setY(floor + 0.2 * u);
        pop(hi, pre ? 0 : between(v, 1.3, 1.5) * (1 - between(v, 2.4, 2.6)), B.maxX + 0.1 * u, floor + 0.75 * u, 0.4 * u);
      }
      hearts(love, 3, x0 - 0.05 * u, floor + 1.25 * u, 0.2 * u, pre ? -1 : w, 1.7, u);
    },
  };
}

// ---- 母 / お母さん ----
function mum(ctx, spec, stage) {
  if (spec.outcome === 'cook') return cook(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.6 * u;
  const m = person(spec.who, u), baby = babyBundle(u), song = label(u, '♪', '#8a5ac0', 0.16), love = many(HEART(u, 0.08), 3, 1);
  group.add(m.group, baby, song, love);
  const loop = 6.0, yaw = -0.35, C = new THREE.Vector3(), head = new THREE.Vector3(), seat = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, rock = pre ? 0 : Math.sin(v * 2.1);
      m.pose('Idle', t);
      m.group.position.set(x0, floor, 0.05 * u); m.group.rotation.y = yaw;
      m.turn('Torso', 0, 0.06 * rock, 0.05 * rock); m.turn('Head', 0.35, 0.1 * rock);
      // the bundle lies across her arms at the chest, its head on her left arm, rocked side to side
      m.local(0.02 + 0.05 * rock, 0.42, 0.28, C);
      baby.position.copy(group.worldToLocal(C.clone())); baby.rotation.set(0, yaw, 0.28 + 0.12 * rock);
      baby.updateWorldMatrix(true, false);
      baby.localToWorld(head.set(0.1 * u, -0.06 * u, 0)); baby.localToWorld(seat.set(-0.08 * u, -0.07 * u, 0));
      m.grip('L', head, UP, 0, 1, { out: 0.9, down: 0.5 }); m.grip('R', seat, UP, 0, 1, { out: 0.7, down: 0.6 });
      pop(song, pre ? 0 : 0.8 + 0.2 * Math.sin(v * 4), x0 - 0.25 * u + 0.05 * u * Math.sin(v * 1.5), floor + 1.0 * u + 0.05 * u * Math.sin(v * 3), 0.2 * u);
      hearts(love, 3, x0 + 0.05 * u, floor + 0.85 * u, 0.3 * u, pre ? -1 : v, 2.4, u);
    },
  };
}
function cook(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.75 * u;
  const m = person(spec.who, u), yum = label(u, 'おいしい!', '#d0603a', 0.13), steam = many(PUFF(u, 0xffffff), 6, 0.5);
  const stove = solidProp([[G.box(0.42 * u, 0.36 * u, 0.3 * u, 0, 0.18 * u, 0), 0xe8e4dc], [G.cyl(0.11 * u, 0.11 * u, 0.012 * u, 0, 0.365 * u, 0), 0x303438]], 0.35);
  const pot = solidProp([[G.cyl(0.12 * u, 0.1 * u, 0.15 * u, 0, 0.075 * u, 0), 0xc04a3a], [G.cyl(0.105 * u, 0.105 * u, 0.01 * u, 0, 0.14 * u, 0), 0xf0c060], [G.torus(0.12 * u, 0.01 * u, Math.PI * 2, 0, 0.15 * u, 0).rotateX(Math.PI / 2), 0x8a2a20]], 0.4);
  const ladle = solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.26 * u, 0, 0, 0.13 * u, Math.PI / 2), 0xe8c070], [G.sphere(0.04 * u, 0, -0.012 * u, 0.27 * u, 1, 0.6, 1), 0xe8c070]], 0.5);
  group.add(m.group, stove, pot, ladle, yum, steam);
  const loop = 6.4, yaw = LEFT + 0.75, top = new THREE.Vector3(), tip = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { up: [2.6, 0.6], down: [4.0, 0.5] }), taste = T.up * (1 - T.down);
      m.pose('Idle', t);
      m.group.position.set(x0, floor, 0); m.group.rotation.y = yaw;
      stove.position.copy(group.worldToLocal(m.local(0, 0, 0.42, W))).setY(floor); stove.rotation.y = yaw;
      pot.position.copy(stove.position).setY(floor + 0.37 * u);
      // stir: the ladle's bowl circles in the pot; taste: the bowl comes up to her lips
      pot.getWorldPosition(top).add(W2.set(0.04 * u * Math.cos(v * 5), 0.08 * u, 0.04 * u * Math.sin(v * 5)).multiplyScalar(group.getWorldScale(W).y));
      tip.copy(top).lerp(m.at('mouth', W, 0, -0.01, 0.06), taste);
      const back = axisOf(m, -0.35, 0.75 - 0.6 * taste, -0.45, W2), len = 0.27 * u * group.getWorldScale(W).y;
      m.grip('R', tip.clone().addScaledVector(back, len), axisOf(m, 1, 0, 0, W), 0, pre ? A.setup : 1, { out: 0.8, down: 0.6 });
      m.hold(ladle, 'R', group, 0.008 * u);
      ladle.lookAt(tip);
      m.turn('Head', 0.25 * (1 - taste));
      m.nod(between(v, 4.5, 4.7) * (1 - between(v, 5.6, 5.8)), v);
      wisps(steam, 0, 6, pot.position.x, floor + 0.55 * u, pre ? 0 : v, u, { period: 1.8, rise: 0.4, size: 0.8, on: pre ? A.setup : 1 }); steam.commit();
      pop(yum, between(v, 4.4, 4.6) * (1 - between(v, 5.8, 6.0)), x0 - 0.1 * u, floor + 1.05 * u, 0.2 * u);
    },
  };
}

// ---- 兄 / お兄さん ----
function brother(ctx, spec, stage) {
  if (spec.outcome === 'piggyback') return piggyback(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xb = B.maxX + 0.95 * u, xs = B.maxX + 0.45 * u;
  const big = person(spec.who, u, TEEN), sm = person(spec.kid, u, KID), toy = ball(u, { r: 0.06, color: 0xe04848, stripe: 0xffffff });
  const love = many(HEART(u, 0.08), 3, 1);
  group.add(big.group, sm.group, toy, love);
  const loop = 7.2, P = new THREE.Vector3(), R = 0.06 * u, head = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ws = group.getWorldScale(W).y;
      const T = timeline(v, { give: [2.6, 0.8], back: [6.3, 0.7] });
      const hops = !pre && v > 0.4 && v < 2.5;
      big.pose('Idle', t); sm.pose(hops ? 'Jump' : 'Idle', hops ? (v - 0.4) % 1.0 : t + 1);
      big.group.position.set(xb, floor, 0); big.group.rotation.y = LEFT + 0.7;
      sm.group.position.set(xs, floor, 0.1 * u); sm.group.rotation.y = RIGHT - 0.7;
      // the ball: high on his palm, down into the little one's hands, back up at the end
      const high = big.local(-0.12, 1.0, 0.12, new THREE.Vector3()), low = sm.local(0, 0.36, 0.22, new THREE.Vector3());
      const g = T.give * (1 - T.back); P.copy(high).lerp(low, g); P.y += 0.25 * u * ws * Math.sin(Math.PI * T.back);
      big.grip('R', P, UP, R * ws, pre ? A.setup : 1 - between(v, 3.3, 3.5) * (1 - between(v, 6.2, 6.4)), { out: 0.6, down: 0.5 });
      toy.position.copy(group.worldToLocal(P.clone()));
      // he laughs; she reaches up while hopping, then holds the ball with both palms
      if (hops) { sm.handTo('R', sm.local(-0.1, 0.75, 0.15, W), 0.9); sm.handTo('L', sm.local(0.1, 0.75, 0.15, W), 0.9); }
      const hold = between(v, 3.2, 3.4) * (1 - between(v, 6.1, 6.3));
      sm.grip('R', P, axisOf(sm, 1, 0, 0, W), R * ws, hold); sm.grip('L', P, axisOf(sm, -1, 0, 0, W), R * ws, hold);
      // the pat on the head
      const pat = between(v, 3.6, 3.9) * (1 - between(v, 5.4, 5.7));
      sm.at('over', head, 0, -0.08 - 0.03 * Math.abs(Math.sin(v * 7)), -0.02);
      big.grip('L', head, DOWN, 0, pat, { out: 0.5, down: 0.4 });
      if (!pre && v < 2.5) big.turn('Head', -0.15, 0, 0.05 * Math.sin(v * 9));
      hearts(love, 3, xs, floor + 0.7 * u, 0.2 * u, pre ? -1 : v, 3.8, u);
    },
  };
}
function piggyback(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xa = B.maxX + 0.35 * u, xb = B.maxX + 1.25 * u;
  const big = person(spec.who, u, TEEN), sm = person(spec.kid, u, KID), hips = new THREE.Vector3();
  group.add(big.group, sm.group);
  const loop = 8.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // along the front from right to left, round, and back along a line further back (a loop)
      const f = pre ? 0 : v / loop, ang = f * Math.PI * 2, cx = (xa + xb) / 2, rx = (xb - xa) / 2;
      const x = cx + rx * Math.cos(ang), z = 0.05 * u - 0.3 * u * Math.sin(ang);
      big.pose(pre ? 'Idle' : 'Walk', pre ? t : v);
      big.group.position.set(x, floor, z); big.group.rotation.y = pre ? LEFT + 0.6 : Math.atan2(-rx * Math.sin(ang), -0.3 * u * Math.cos(ang)) ;
      // the little one sits on his back: hips at his lower back, arms round his shoulders; his hands hold her legs
      sm.pose('SitDown', 1.0, false);
      sm.group.rotation.y = big.group.rotation.y; sm.group.position.set(0, 0, 0); sm.group.updateWorldMatrix(true, true);
      sm.node('Hips').getWorldPosition(hips);
      const back = big.local(0, 0.42 + 0.01 * Math.abs(Math.sin(v * 5)), -0.17, new THREE.Vector3());
      sm.group.position.copy(group.worldToLocal(back.sub(hips.sub(group.localToWorld(W.set(0, 0, 0)))).clone()));
      sm.group.updateWorldMatrix(true, true);
      sm.handTo('R', big.local(-0.12, 0.6, 0.02, W), 1); sm.handTo('L', big.local(0.12, 0.6, 0.02, W), 1);
      big.handTo('R', big.local(-0.2, 0.36, -0.12, W), 1, { out: 0.9, down: 0.3 }); big.handTo('L', big.local(0.2, 0.36, -0.12, W), 1, { out: 0.9, down: 0.3 });
      sm.turn('Head', 0, 0.3 * Math.sin(v * 1.3));
    },
  };
}

// ---- 姉 / お姉さん ----
function sister(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.45 * u, hair = spec.outcome === 'hair';
  const big = person(spec.who, u, TEEN), sm = person(spec.kid, u, KID), love = many(HEART(u, 0.08), 3, 1);
  const bow = solidProp([[G.sphere(0.035 * u, -0.035 * u, 0, 0, 1.2, 0.8, 0.5), 0xff5a8a], [G.sphere(0.035 * u, 0.035 * u, 0, 0, 1.2, 0.8, 0.5), 0xff5a8a], [G.sphere(0.018 * u), 0xe0306a]], 0.7);
  group.add(big.group, sm.group, bow, love);
  const loop = hair ? 6.6 : 8.2, P = new THREE.Vector3(), Q = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      if (hair) {
        // she stands behind the little one, both hands at the back of her head, working; a ribbon pops; the little one hops
        const T = timeline(v, { tie: [0.3, 0.4], done: [2.6, 0.4] }), joy = !pre && v > 3.0 && v < 5.0;
        big.pose('Idle', t); sm.pose(joy ? 'Jump' : 'Idle', joy ? (v - 3.0) % 1.0 : t + 1);
        sm.group.position.set(xs + 0.1 * u, floor, 0.15 * u); sm.group.rotation.y = 0.2;
        big.group.position.set(xs + 0.3 * u, floor, -0.15 * u); big.group.rotation.y = -0.5;
        const work = T.tie * (1 - T.done), wig = 0.02 * Math.sin(v * 12);
        sm.at('over', P, -0.08, -0.1 + wig, -0.12); sm.at('over', Q, 0.08, -0.1 - wig, -0.12);
        big.grip('R', P, axisOf(sm, 1, 0, 0, W), 0, work, { out: 0.7, down: 0.4 }); big.grip('L', Q, axisOf(sm, -1, 0, 0, W), 0, work, { out: 0.7, down: 0.4 });
        big.turn('Head', 0.3 * work);
        const k = pre ? 0 : between(v, 2.4, 2.7) * (1 - between(v, 6.1, 6.4));
        bow.visible = k > 0.01; bow.scale.setScalar(1.6 * k); bow.position.copy(group.worldToLocal(sm.at('over', W, 0.1, -0.06, -0.02))); bow.rotation.set(0, sm.group.rotation.y, 0.3);
        hearts(love, 3, xs + 0.1 * u, floor + 0.6 * u, 0.3 * u, pre ? -1 : v, 3.0, u);
        return;
      }
      // she crouches at the little one's shoe, ties it (a bow pops), stands, takes her hand, and they walk off together
      const T = timeline(v, { kneel: [0.2, 0.5], up: [2.7, 0.5], go: [3.8, 3.0, 'linear'] });
      const crouch = T.kneel * (1 - T.up), walk = !pre && T.go > 0 && T.go < 1, off = T.go * 1.0 * u;
      big.pose(walk ? 'Walk' : crouch > 0.02 ? 'PickUp' : 'Idle', walk ? v : crouch > 0.02 ? 0.55 * crouch : t, !(crouch > 0.02));
      sm.pose(walk ? 'Walk' : 'Idle', walk ? v + 0.4 : t + 1);
      sm.group.position.set(xs + off, floor, 0.12 * u); big.group.position.set(xs + 0.36 * u + off, floor, 0.0);
      sm.group.rotation.y = walk || T.go >= 1 ? RIGHT - 0.5 : 0.25; big.group.rotation.y = walk || T.go >= 1 ? RIGHT - 0.5 : turnTo(LEFT + 0.6, 0.2, T.up);
      const shoe = sm.local(0.06, 0.03, 0.08, P), work = crouch > 0.6 ? 1 : 0, wig = 0.015 * u * Math.sin(v * 13) * group.getWorldScale(W).y;
      big.handTo('R', W2.copy(shoe).add(W.set(0, wig, 0)), crouch, { out: 0.6, down: 0.8 }); big.handTo('L', W2.copy(shoe).add(W.set(0.02 * u, -wig, 0)), crouch * work, { out: 0.6, down: 0.8 });
      const k = pre ? 0 : between(v, 2.3, 2.6) * (1 - between(v, 7.6, 7.9));
      bow.visible = k > 0.01; bow.scale.setScalar(k); bow.position.copy(group.worldToLocal(sm.local(0.06, 0.04, 0.1, W))); bow.rotation.set(-0.6, sm.group.rotation.y, 0);
      handInHand(big, 'L', sm, 'R', between(v, 3.2, 3.7));
      hearts(love, 3, xs + 0.2 * u + off, floor + 0.8 * u, 0.2 * u, pre ? -1 : v, 3.6, u);
    },
  };
}

// ---- 弟 ----
function follow(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const big = person(spec.who, u, TEEN), sm = person(spec.kid, u, KID), wait = label(u, 'まって!', '#3a8ac0', 0.12);
  group.add(big.group, sm.group, wait);
  const loop = 7.6;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { walk: [0, 1.8, 'linear'], run: [0.6, 1.6, 'out'], turn: [1.9, 0.4], hand: [2.4, 0.5], back: [3.0, 0.4], go: [3.4, 3.6, 'linear'] });
      const bigWalk = !pre && ((T.walk > 0 && T.walk < 1) || (T.go > 0 && T.go < 1)), smRun = !pre && T.run > 0 && T.run < 1;
      const bx = B.maxX + 0.45 * u + 0.5 * u * T.walk + 0.9 * u * T.go;
      big.pose(bigWalk ? 'Walk' : 'Idle', bigWalk ? v : t);
      big.group.position.set(bx, floor, 0.05 * u);
      big.group.rotation.y = T.back > 0 ? turnTo(LEFT + 0.6, RIGHT - 0.5, T.back) : turnTo(RIGHT - 0.5, LEFT + 0.6, T.turn);
      // the little one hurries after, bouncing, and catches up
      const sx = lerp(B.minX + 0.1 * u, bx - 0.36 * u, pre ? 0 : T.run) + (T.go > 0 ? 0 : 0);
      sm.pose(smRun ? 'Run' : T.go > 0 && T.go < 1 ? 'Walk' : 'Idle', smRun || T.go > 0 ? v + 0.3 : t + 1);
      sm.group.position.set(T.go > 0 ? bx - 0.36 * u : sx, floor, 0.25 * u); sm.group.rotation.y = RIGHT - 0.5;
      big.handTo('L', big.local(0.25, 0.4, 0.3, W), T.hand * (1 - T.back), { out: 0.5, down: 0.9 });
      handInHand(big, 'L', sm, 'R', between(v, 3.1, 3.5));
      pop(wait, pre ? 0 : between(v, 0.7, 0.9) * (1 - between(v, 1.9, 2.1)), sx, floor + 0.75 * u, 0.3 * u);
    },
  };
}

// ---- 兄弟 ----
function playCatch(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.35 * u, xb = B.maxX + 1.1 * u;
  const big = person(spec.who, u, TEEN), sm = person(spec.kid, u, KID), toy = ball(u, { r: 0.06, color: 0x40a0ff, stripe: 0xffffff });
  group.add(big.group, sm.group, toy);
  const loop = 4.4, R = 0.06 * u, a = new THREE.Vector3(), b = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, ws = group.getWorldScale(W).y;
      big.pose('Idle', t); sm.pose('Idle', t + 1);
      big.group.position.set(xb, floor, 0); big.group.rotation.y = LEFT + 0.6;
      sm.group.position.set(xs, floor, 0.1 * u); sm.group.rotation.y = RIGHT - 0.6;
      // catch: both palms out in front; throw: the right hand swings from over the shoulder; the ball flies in an arc
      big.local(0, 0.5, 0.26, a); sm.local(0, 0.36, 0.22, b);
      const toSmall = between(v, 0.5, 1.5), toBig = between(v, 2.7, 3.7), f = v < 2.2 ? toSmall : toBig, from = v < 2.2 ? a : b, to = v < 2.2 ? b : a;
      const P = from.clone().lerp(to, f); P.y += 0.45 * u * ws * Math.sin(Math.PI * f);
      if (pre) P.copy(a);
      toy.position.copy(group.worldToLocal(P.clone())); toy.rotation.z = -6 * f;
      for (const [p, mine, wind, at] of [[big, v < 0.5 || v > 3.7, between(v, 0.1, 0.45) * (1 - between(v, 0.5, 0.7)), a], [sm, v > 1.5 && v < 2.7, between(v, 2.3, 2.65) * (1 - between(v, 2.7, 2.9)), b]]) {
        const hold = mine ? 1 : between(v, p === big ? 3.3 : 1.1, p === big ? 3.6 : 1.4);
        if (wind > 0.02) p.handTo('R', p.local(-0.18, 0.95, -0.05, W), wind, { out: 0.8, down: 0.3 });
        p.grip('R', at, axisOf(p, 1, 0, 0, W), R * ws, wind > 0.02 ? 0 : hold); p.grip('L', at, axisOf(p, -1, 0, 0, W), R * ws, hold);
      }
    },
  };
}

export const SCENES = { 'q-dad': dad, 'q-mum': mum, 'q-brother': brother, 'q-sister': sister, 'q-follow': follow, 'q-catch': playCatch };
