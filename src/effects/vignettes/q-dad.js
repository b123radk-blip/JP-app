// 父 / お父さん (models; split out of q-family.js). They play on a rug, so nobody stands on thin air.
//   q-dad   父: a dad with a big moustache faces his little girl (both side-on to you); he crouches, takes her under
//           the arms and lifts her up high above his head (たかい たかい), sways her while she cheers, hearts, sets her down.
//           outcome home: he steps out of a lit doorway with his briefcase, she runs to him (おかえり!), he sets the case
//           down and lifts her high; then he picks it up and they walk back in through the door hand in hand (お父さん)
import * as THREE from 'three';
import { timeline, acts } from './timeline.js';
import { many, HEART } from '../pieces/kit-things.js';
import { between } from './helpers.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { UP, lerp, label, pop, hearts, person, KID, liftKid, handInHand, briefcase, onHead, turnTo } from './q-common.js';

const W = new THREE.Vector3(), LOW = new THREE.Vector3(), HIGH = new THREE.Vector3(), AT = new THREE.Vector3();
// a big dark moustache (two curled capsules), worn at the mouth landmark
const tache = (u) => solidProp([[G.capsule(0.02 * u, 0.06 * u, -0.04 * u, -0.005 * u, 0, 1.25), 0x2a1810], [G.capsule(0.02 * u, 0.06 * u, 0.04 * u, -0.005 * u, 0, -1.25), 0x2a1810]], 0.25);
// an oval rug, its top at y = 0
const rug = (u, w) => solidProp([[G.cyl(0.5 * u, 0.5 * u, 0.012 * u, 0, -0.006 * u, 0), 0x6a3028], [G.cyl(0.42 * u, 0.42 * u, 0.012 * u, 0, -0.004 * u, 0), 0xa87a48], [G.cyl(0.3 * u, 0.3 * u, 0.012 * u, 0, -0.002 * u, 0), 0x8a4a34]].map(([g, c]) => [g.scale(w, 1, 0.55), c]), 0.15);
// a wall with a doorway full of warm light (someone behind the light is hidden: they are "inside"); origin at the doorway's
// foot, the wall in the x-y plane
const doorway = (u, dw = 0.62) => solidProp([
  [G.box(0.5 * u, 1.25 * u, 0.06 * u, -(dw / 2 + 0.25) * u, 0.625 * u, 0), 0xe8d8bc], [G.box(0.5 * u, 1.25 * u, 0.06 * u, (dw / 2 + 0.25) * u, 0.625 * u, 0), 0xe8d8bc],
  [G.box(dw * u, 0.17 * u, 0.06 * u, 0, 1.165 * u, 0), 0xe8d8bc], [G.box(dw * u, 1.08 * u, 0.01 * u, 0, 0.54 * u, -0.01 * u), 0xffe2a0],
  [G.box(0.05 * u, 1.1 * u, 0.08 * u, -dw / 2 * u, 0.55 * u, 0), 0x7a4a2a], [G.box(0.05 * u, 1.1 * u, 0.08 * u, dw / 2 * u, 0.55 * u, 0), 0x7a4a2a], [G.box((dw + 0.05) * u, 0.05 * u, 0.08 * u, 0, 1.1 * u, 0), 0x7a4a2a],
], 0.5);

export function dad(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, home = spec.outcome === 'home', x0 = B.maxX + (home ? 0.85 : 0.8) * u;
  const pa = person(spec.who, u, 0.92), kid = person(spec.kid, u, KID), stache = tache(u), love = many(HEART(u, 0.09), 3, 1), mat = rug(u, home ? 1.6 : 1.2);
  const bag = home ? briefcase(u) : null, hi = home ? label(u, 'おかえり!', '#d0603a', 0.13) : null, door = home ? doorway(u) : null;
  mat.position.set(x0 - (home ? 0.25 : 0.1) * u, floor, 0.05 * u);
  group.add(mat, pa.group, kid.group, stache, love, ...(home ? [bag, hi, door] : []));
  // the lift: they face each other across your view (he looks toward the kanji); she stands in front of him
  const yaw = -1.0, H = 0.92 * u, front = [x0 + Math.sin(yaw) * 0.36 * H, Math.cos(yaw) * 0.36 * H];
  // home: the doorway stands back on the right; he comes out of it and they go back in
  // the doorway faces the lift spot, so his path goes straight through the middle of it
  const dx = x0 + 0.7 * u, dz = -0.5 * u, nl = Math.hypot(x0 - dx, dz), nx = (x0 - dx) / nl, nz = -dz / nl;
  const inside = [dx - nx * 0.5 * u, dz - nz * 0.5 * u], wait = [B.maxX + 0.05 * u, 0.3 * u];
  if (home) { door.position.set(dx, floor, dz); door.rotation.y = Math.atan2(nx, nz); }
  const loop = home ? 10.0 : 6.6, toDoor = Math.atan2(inside[0] - x0, inside[1]);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // home: out of the door (0-1.8), she runs to him (1.4-2.4); the lift as in 父 from 2.4; turn (7.4), off in (7.6-9.6)
      const d = home ? 2.4 : 0, w = v - d;
      const T = timeline(w, { bend: [0.1, 0.5], lift: [0.6, 0.9], down: [3.8, 0.8], rise: [4.6, 0.5] });
      const Th = timeline(v, { come: [0, 1.8, 'out'], face: [1.8, 0.4], run: [1.4, 1.0, 'linear'], turn: [7.3, 0.4], go: [7.6, 2.0, 'linear'] });
      const crouch = pre ? 0 : T.bend * (1 - T.lift) + between(w, 3.9, 4.4) * (1 - T.rise);
      const walking = home && !pre && ((Th.come > 0 && Th.come < 1) || Th.go > 0);
      pa.pose(walking ? 'Walk' : crouch > 0.02 ? 'PickUp' : 'Idle', walking ? v : crouch > 0.02 ? 0.55 * crouch : t, !(crouch > 0.02) || walking);
      let px = x0, pz = 0, py = yaw;
      if (home) {
        if (pre || Th.come < 1) { const f = pre ? 0 : Th.come; px = lerp(inside[0], x0, f); pz = lerp(inside[1], 0, f); py = Math.atan2(x0 - inside[0], -inside[1]); }
        else if (Th.go > 0) { px = lerp(x0, inside[0], Th.go); pz = lerp(0, inside[1], Th.go); py = toDoor; }
        else py = Th.turn > 0 ? turnTo(yaw, toDoor, Th.turn) : turnTo(Math.atan2(x0 - inside[0], -inside[1]), yaw, Th.face);
      }
      pa.group.position.set(px, floor, pz); pa.group.rotation.y = py;
      pa.group.visible = !home || (!pre && v < 9.45);
      onHead(pa, stache, group, 'mouth', 0, -0.005, 0.045); stache.visible = pa.group.visible;
      // she is held by the sides: low in front of him, then high over his head, swayed
      const sway = 0.08 * Math.sin(w * 2.4) * between(w, 1.5, 1.9) * (1 - T.down);
      pa.local(0, 0.27, 0.36, LOW); pa.local(sway, 0.98, 0.4 + 0.03 * Math.sin(w * 4.8), HIGH);
      const up = pre ? 0 : T.lift * (1 - T.down), held = !pre && w > 0.1 && w < 4.9;
      AT.copy(LOW).lerp(HIGH, up);
      const cheer = !pre && up > 0.9, running = home && !pre && Th.run > 0 && Th.run < 1, going = home && !pre && w > 4.9 && Th.go > 0;
      kid.pose(cheer ? 'Victory' : running ? 'Run' : going ? 'Walk' : 'Idle', cheer ? 0.5 + 0.3 * Math.sin(w * 2) : going ? v + 0.3 : t + 1);
      kid.group.visible = true; kid.group.scale.setScalar(1);
      if (held) liftKid(pa, kid, group, AT, Math.min(1, between(w, 0.1, 0.6) * (1 - between(w, 4.5, 4.9))), true);
      else if (home && !pre && w > 4.9) {                        // hand in hand at his left, back in through the door
        kid.group.position.copy(group.worldToLocal(pa.local(0.26, 0, -0.06, W))).setY(floor); kid.group.rotation.y = pa.group.rotation.y;
        handInHand(pa, 'L', kid, 'R', between(v, 7.2, 7.6));
        kid.group.visible = v < 9.45;
      } else if (home && (pre || w <= 0.1)) {                    // she waits by the kanji, then runs to him
        const f = pre ? 0 : Th.run;
        kid.group.position.set(lerp(wait[0], front[0], f), floor, lerp(wait[1], front[1], f));
        kid.group.rotation.y = f > 0 && f < 1 ? Math.atan2(front[0] - wait[0], front[1] - wait[1]) : f >= 1 ? yaw + Math.PI : 0.3;
        if (!pre && v < 0.3) kid.group.scale.setScalar(Math.max(1e-3, v / 0.3));    // back for the next loop
      } else { kid.group.position.set(front[0], floor, front[1]); kid.group.rotation.y = yaw + Math.PI; }
      if (home) {
        // the briefcase hangs from his right fist by its handle, its broad side along his path (clear of his leg); set
        // down beside him while he holds her
        const inHand = pre || w < 0.3 || w > 4.3;
        bag.visible = pa.group.visible;
        if (inHand) { pa.fistMid('R', W).addScaledVector(UP, -0.03 * u); bag.position.copy(group.worldToLocal(W)); bag.rotation.y = pa.group.rotation.y + Math.PI / 2; }
        else { bag.position.copy(group.worldToLocal(pa.local(-0.38, 0, 0.05, W))).setY(floor + 0.175 * u); bag.rotation.y = yaw + Math.PI / 2; }
        pop(hi, pre ? 0 : between(v, 1.4, 1.6) * (1 - between(v, 2.6, 2.8)), wait[0] + 0.15 * u, floor + 0.78 * u, 0.4 * u);
      }
      hearts(love, 3, x0 - 0.05 * u, floor + 1.45 * u, 0.2 * u, pre ? -1 : w, 1.7, u);
    },
  };
}
