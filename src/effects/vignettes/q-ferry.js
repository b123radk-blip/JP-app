// 渡す (watasu, plan 012): a little rowboat waits at the far bank of a river that runs from the left to the right. A woman
// waits on that bank; she hops into the middle of the boat and sits; the ferryman rows her across the water toward the
// learner and up to the near bank (the oars dip and pull, the boat bobs); she hops out, turns to him and waves a thank-you,
// and walks off to the right while the ferryman rows the boat back to the far bank, so the loop ends where it started.
// The whole crossing runs toward the learner (the boat's bow points at them) and stays inside the learner's picture: the
// river runs left to right, the far bank is up (away) and the near bank is down (toward the learner).
import * as THREE from 'three';
import { acts } from './timeline.js';
import { createModel } from '../models.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { clamp01 } from '../pieces/util.js';
import { between } from './helpers.js';
import { lerp, turnTo, person } from './q-common.js';
import { seatAt } from './q-ride.js';
import { grow } from './step1-kit.js';

const PI = Math.PI, ss = (x) => x * x * (3 - 2 * x), UPV = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0);

// one rowboat with the ferryman on the middle bench (the 前 race's rower, one boat only). The model's bow is along +z, so the
// group stays unturned: the bow points at the learner, the stern toward the far bank. `seat` is the passenger's seat (the
// middle of the boat) in the group's own frame; the ferryman sits just behind it, at the oarlocks, facing the stern.
function ferryBoat(u) {
  const kb = 0.5 * u, boat = createModel('rowboat', { height: 0.64 * kb });
  const group = new THREE.Group(); group.add(boat.group); boat.group.name = 'rowboat';
  const old = boat.node('paddles'); if (old) old.parent.remove(old);                  // the boat's own fixed oars: we row with our own
  const p = person('guy3', u, 0.72);
  p.pose('SitDown', 1.0, false); p.group.updateWorldMatrix(true, true);
  const hipY = p.node('Hips').getWorldPosition(new THREE.Vector3()).y;
  const seatY = 0.24 * kb;                                                            // hips 0.12u up, well inside the 0.27u-deep hull
  const rz = -0.3 * kb;                                                                // the ferryman sits just behind the passenger, at the oarlocks
  p.group.rotation.y = PI; p.group.position.set(0, seatY - hipY, rz); group.add(p.group);      // facing the stern
  const oars = [0, 1].map(() => { const o = createModel('paddle', { height: 1 }), holder = new THREE.Group(); holder.add(o.group); group.add(holder); return holder; });
  return { group, p, oars, kb, lockY: 0.6 * kb, lockX: 0.7 * kb, rz, seat: [0, seatY, -rz] };
}

export function ferry(ctx, spec, stage) {
  // x runs from the word's right edge (B.maxX); y is above the kanji's bottom line; the learner is at +z (toward the viewer).
  // The river runs left to right (x 0..1.1) and the boat crosses it from the far bank (the 'left bank', z -1.5..-1.0) toward
  // the learner, to the near bank (the 'right bank', z 1.0..1.5). The waterline is at z = -1 (far) and z = +1 (near).
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX, gx = x0 + 0.55 * u;
  const ground = new THREE.Group(); ground.position.set(0, floor, 0);
  const bank = (z, name) => {
    const m = solidProp([[G.box(1.1 * u, 0.12 * u, 0.5 * u, 0, 0.06 * u, 0), 0x6ab04c]], 0.4);   // grass, top 0.12u
    m.position.set(gx, 0, z); m.name = name; return m;
  };
  const left = bank(-1.25 * u, 'left bank');                                            // the far bank: z -1.5..-1.0
  const right = bank(1.25 * u, 'right bank');                                           // the near bank: z 1.0..1.5
  const river = solidProp([[G.box(1.1 * u, 0.05 * u, 2.0 * u, 0, 0.025 * u, 0), 0x2f8fe0], [G.box(1.1 * u, 0.014 * u, 2.0 * u, 0, 0.057 * u, 0), 0x5cc0f8]], 0.5);
  river.name = 'river'; river.position.set(gx, 0, 0);                                    // the water: z -1..1, surface ~0.057u
  ground.add(left, river, right);
  const boatZ = floor + 0.057 * u;                                                      // the hull bottom rests on the water surface
  const standY = floor + 0.12 * u;                                                      // the bank tops
  const boat = ferryBoat(u), w = person('gal2', u, 0.72);
  group.add(ground, boat.group, w.group);
  const Z0 = -0.55 * u, Z1 = 0.55 * u;                                                  // the boat's centre at the far / near waterline
  const waitP = new THREE.Vector3(gx - 0.3 * u, standY, -1.2 * u), outP = new THREE.Vector3(gx - 0.3 * u, standY, 1.2 * u);
  const seatW = new THREE.Vector3(), H = new THREE.Vector3(), Pl = new THREE.Vector3(), d = new THREE.Vector3(), q = new THREE.Quaternion(), wp = new THREE.Vector3();
  // her hips onto the middle seat (boat frame -> world); she faces the way they go (+z, the learner)
  const inSeat = (yaw) => { w.group.position.copy(group.worldToLocal(boat.group.localToWorld(seatW.set(...boat.seat)))); w.group.rotation.y = yaw; };
  const seatWorld = () => boat.group.localToWorld(seatW.set(...boat.seat));
  const loop = 9.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const bz = pre || v < 1.6 ? Z0 : v < 5.5 ? lerp(Z0, Z1, ss((v - 1.6) / 3.9)) : v < 7.6 ? Z1 : lerp(Z1, Z0, ss((v - 7.6) / 1.4));
      const bob = 0.008 * u * Math.sin(t * 2.6);
      boat.group.position.set(gx, boatZ + bob, bz);
      boat.group.rotation.set(0.02 * Math.sin(t * 2.2), 0, 0.02 * Math.sin(t * 1.9), 'YXZ');
      boat.group.updateWorldMatrix(true, true);
      // the ferryman rows while the boat moves (across, and back); the oars dip, pull and lift, the hands stay on the handles
      const rowing = !pre && (between(v, 1.55, 5.55) + between(v, 7.5, 9.05) > 0);
      const ph = rowing ? ((v - (v >= 7.6 ? 7.6 : 1.6))) % 1 : 0, drive = ph < 0.45 ? ss(ph / 0.45) : 1 - ss((ph - 0.45) / 0.55), inW = ph > 0.03 && ph < 0.47 ? 1 : 0;
      const p = boat.p;
      p.pose('SitDown', 1.0, false);
      p.turn('Torso', rowing ? lerp(0.3, -0.1, drive) : 0.05);
      [1, -1].forEach((sd, n) => {
        const side = sd === 1 ? 'R' : 'L';          // facing the stern, the rower's right hand is on the boat's +x side
        H.set(sd * 0.2 * boat.kb, (rowing ? lerp(0.8, 1.0, inW * ss(clamp01(Math.min(ph / 0.1, (0.5 - ph) / 0.08)))) : 0.84) * boat.kb, rowing ? lerp(-0.7, -0.3, drive) * boat.kb : -0.5 * boat.kb);
        Pl.set(sd * boat.lockX, boat.lockY, boat.rz);                                             // the oarlocks at the rower
        d.copy(H).sub(Pl); const din = d.length(); d.normalize();
        const Lout = 1.05 * boat.kb, tip = Pl.clone().addScaledVector(d, -Lout), len = Lout + din + 0.12 * boat.kb;
        const oar = boat.oars[n]; oar.position.copy(tip); q.setFromUnitVectors(UPV, d); oar.quaternion.copy(q); oar.scale.setScalar(len); oar.children[0].scale.set(0.45, 1, 0.45);
        boat.group.localToWorld(wp.copy(H));
        p.grip(side, wp, DOWN, 0.012 * u, 1, { out: 0.9, down: 0.6 });
      });
      // she waits, hops in and sits in the middle, rides across, stands up and hops out, waves thanks and walks off to the right
      if (pre || v < 1) {
        w.pose('Idle', t); w.group.position.copy(waitP); w.group.rotation.y = 0; w.group.scale.setScalar(1);
      } else if (v < 1.3) {
        const f = (v - 1) / 0.3;
        w.pose('Walk', v);
        w.group.position.copy(waitP).lerp(seatWorld(), f);
        w.group.position.y += 0.3 * u * Math.sin(PI * f);      // hop over the gunwale into the boat
        w.group.rotation.y = lerp(0, 0.5, f);
      } else if (v < 1.6) {
        w.pose('SitDown', Math.min(1, (v - 1.3) * 1.25), false);
        inSeat(0); seatAt(w, group, seatWorld(), between(v, 1.3, 1.6));
      } else if (v < 5.5) {
        w.pose('SitDown', 1, false);
        inSeat(0); seatAt(w, group, seatWorld(), 1);
      } else if (v < 5.8) {
        w.pose('StandUp', Math.min(1, (v - 5.5) / 0.3), false);
        inSeat(0); seatAt(w, group, seatWorld(), 1 - between(v, 5.5, 5.78));
      } else if (v < 6.2) {
        const f = (v - 5.8) / 0.4;
        w.pose('Walk', v);
        w.group.position.copy(seatWorld()).lerp(outP, f);
        w.group.position.y += 0.25 * u * Math.sin(PI * f);     // hop over the gunwale out to the bank
        w.group.rotation.y = 0;
      } else if (v < 7.6) {
        w.pose('Idle', t); w.group.position.copy(outP);
        w.group.rotation.y = turnTo(0, 2.8, between(v, 6.2, 6.6));     // turn back to the boat and the ferryman
        w.wave('L', between(v, 6.5, 6.8) * (1 - between(v, 7.1, 7.4)), v);
      } else {
        const f = (v - 7.6) / 1.4;
        w.pose('Walk', v);
        w.group.position.set(gx - (0.3 - 0.5 * f) * u, standY, 1.2 * u);   // a short walk to the right while she fades out
        w.group.rotation.y = -PI / 2;
        w.group.scale.setScalar(grow(1 - between(v, 8.1, 8.9)));
      }
    },
  };
}

export const SCENES = { 'q-ferry': ferry };
