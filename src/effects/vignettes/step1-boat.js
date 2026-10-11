// 前 (hen-lead): a boat race. 月 is a boat pushed forward by oars (刂): in front, before. Two little rowing boats (Kenney pirate
// kit) on water, a person sitting in each and rowing (the oars dip, pull and lift, the hands stay on the oar handles); one boat
// pulls ahead and is plainly IN FRONT: a glowing ring on the water under it and an arrow over its bow point the way it goes,
// and its bow points forward along the motion. Water: a blue slab with ripples and a wake behind each boat.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { actor, SKIN } from './model-kit.js';
import { createModel } from '../models.js';
import { many } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x)), PI = Math.PI, lerp = (a, b, f) => a + (b - a) * f, ss = (x) => x * x * (3 - 2 * x);
const UPV = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0);

// one rowing boat with its rower. Boat frame: the bow along +z (the group is turned to face +x), y up, the bench at the middle.
function rower(u, who, shirt) {
  const kb = 0.55 * u, boat = createModel('rowboat', { height: 0.64 * kb });         // kb: metres per model unit (the hull is 2.4 long, 1.4 wide)
  const group = new THREE.Group(); group.add(boat.group);
  const old = boat.node('paddles'); if (old) old.parent.remove(old);                     // the boat's own fixed oars: we row with our own
  const p = actor(who, 0.78 * u, { tint: { ...SKIN, Shirt: shirt } });
  p.pose('SitDown', 1.0, false); p.group.updateWorldMatrix(true, true);
  const hipY = p.node('Hips').getWorldPosition(new THREE.Vector3()).y;
  p.group.rotation.y = PI; p.group.position.set(0, 0.56 * kb + 0.045 * u - hipY, 0.0); group.add(p.group);   // facing the stern, seated on the bench
  const oars = [0, 1].map(() => { const o = createModel('paddle', { height: 1 }), holder = new THREE.Group(); holder.add(o.group); group.add(holder); return holder; });
  return { group, boat, p, oars, kb, lockY: 0.6 * kb, lockX: 0.7 * kb };
}

export function boatRace(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, waterY = floor + 0.06 * u, xs = B.maxX + 0.95 * u, zNear = 0.4 * u, zFar = -0.42 * u;
  // the water: a blue slab (with a lighter top), a little wider than the race
  const water = solidProp([[G.box(3.0 * u, 0.12 * u, 1.7 * u, 0, -0.06 * u, 0), 0x2f8fe0], [G.box(3.0 * u, 0.012 * u, 1.7 * u, 0, -0.006 * u, 0), 0x5cc0f8]], 0.55);
  water.position.set(xs + 0.7 * u, waterY, -0.02 * u); group.add(water);
  const lead = rower(u, 'guy', 0xe0453a), trail = rower(u, 'gal', 0x3a78e8);
  const boats = [lead, trail];
  boats.forEach((b) => group.add(b.group));
  // wakes and ripples: flat white strips behind each boat, and rings where the blades dip
  const wakes = many([[G.box(0.5 * u, 0.012 * u, 0.04 * u, 0, 0, 0), 0xf4fbff]], 4, 0.9), rip = many([[G.torus(0.07 * u, 0.008 * u).rotateX(PI / 2), 0xf4fbff]], 4, 0.9);
  group.add(wakes, rip);
  // the marker for the boat in front: a ring on the water under it, an arrow above its bow
  const ring = solidProp([[G.torus(0.62 * u, 0.018 * u).rotateX(PI / 2).scale(1, 1, 0.6), 0xffe45a]], 1.6), arrow = solidProp([[G.box(0.3 * u, 0.045 * u, 0.045 * u, -0.1 * u, 0, 0), 0xffe45a], [G.cone(0.1 * u, 0.2 * u, 0.1 * u, 0, 0, -PI / 2), 0xffe45a]], 1.6);
  group.add(ring, arrow);
  const loop = 7.0, D = [1.5 * u, 0.42 * u], T0 = 0.2, T1 = 5.2;
  const tmp = new THREE.Vector3(), H = new THREE.Vector3(), Pl = new THREE.Vector3(), d = new THREE.Vector3(), q = new THREE.Quaternion(), wp = new THREE.Vector3();
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const go = pre ? 0 : between(v, T0, T1), glide = pre ? 0 : between(v, T1, 6.2), away = pre ? 0 : between(v, 6.3, 6.9);
      boats.forEach((b, i) => {
        const bi = i;
        const x = xs + D[i] * ss(go) + (i === 0 ? 0.12 * u * glide : 0.04 * u * glide), z = i === 0 ? zNear : zFar, rowing = !pre && v > T0 - 0.1 && v < T1 + 0.2, period = i === 0 ? 0.95 : 1.1;
        const bob = 0.008 * u * Math.sin(t * 2.6 + i * 2);
        b.group.position.set(x, waterY - 0.07 * u + bob, z); b.group.rotation.set(0.02 * Math.sin(t * 2.2 + i), PI / 2, 0.02 * Math.sin(t * 1.9 + i * 3), 'YXZ'); b.group.scale.setScalar(grow(1 - away));
        // the stroke: ph 0 = the catch (arms out toward the stern, blades forward and in), 0.45 = the finish, then the recovery
        const ph = rowing ? ((v - T0) / period) % 1 : 0, drive = ph < 0.45 ? ss(ph / 0.45) : 1 - ss((ph - 0.45) / 0.55), idle = rowing ? 1 : 0;
        const hz = lerp(-0.5, -0.22, drive) * b.kb, lean = lerp(0.3, -0.1, drive), inW = ph > 0.03 && ph < 0.47 ? 1 : 0, wet = rowing ? lerp(b.wet ?? 0, inW, 1) : 0;
        b.p.pose('SitDown', 1.0, false);
        b.group.updateWorldMatrix(true, true);
        b.p.turn('Torso', rowing ? lean : 0.05);
        [1, -1].forEach((sd, n) => {
          const side = sd === 1 ? 'R' : 'L';          // facing the stern, the rower's right hand is on the boat's +x side
          // the handle point, boat frame; the oarlock on the rim
          H.set(sd * 0.2 * b.kb, (rowing ? lerp(0.8, 1.0, inW * ss(clamp01(Math.min(ph / 0.1, (0.5 - ph) / 0.08)))) : 0.84) * b.kb, rowing ? hz : -0.4 * b.kb);
          Pl.set(sd * b.lockX, b.lockY, -0.05 * b.kb);
          d.copy(H).sub(Pl); const din = d.length(); d.normalize();
          const Lout = 1.05 * b.kb, tip = Pl.clone().addScaledVector(d, -Lout), len = Lout + din + 0.12 * b.kb;
          const oar = b.oars[n]; oar.position.copy(tip); q.setFromUnitVectors(UPV, d); oar.quaternion.copy(q); oar.scale.setScalar(len); oar.children[0].scale.set(0.45, 1, 0.45);
          // the hand takes the handle: the grip is in world space
          b.group.localToWorld(wp.copy(H));
          b.p.grip(side, wp, DOWN, 0.012 * u, 1, { out: 0.9, down: 0.6 });
          // a ring on the water where the blade dips
          group.worldToLocal(b.group.localToWorld(tmp.copy(tip))); const f = rowing && inW ? clamp01((ph - 0.03) / 0.5) : 0;
          rip.set(bi * 2 + n, tmp.x, waterY + 0.006 * u, tmp.z, f > 0 ? 0.5 + 1.6 * Math.sin(PI * f) : 0);
        });
      });
      // the water marks: wake strips behind each boat, rings where blades dip
      for (let i = 0; i < 2; i++) {
        const b = boats[i], sp = (i === 0 ? 1 : 0.5) * (pre ? 0 : between(v, T0, T0 + 0.8) * (1 - between(v, T1 + 0.4, 6.0)));
        const x = b.group.position.x - 0.55 * u, z = b.group.position.z;
        for (let s = 0; s < 2; s++) wakes.set(i * 2 + s, x - 0.1 * u, waterY + 0.008 * u, z + (s ? 1 : -1) * 0.15 * u, grow(sp), (s ? 1 : -1) * 0.3, 0);
      }
      wakes.commit();
      rip.commit();
      // the marker: follows the leader
      const lb = lead.group, k = pre ? 0 : between(v, 1.2, 1.7) * (1 - away);
      ring.visible = k > 0.01; ring.position.set(lb.position.x + 0.03 * u, waterY + 0.012 * u, lb.position.z); ring.scale.setScalar(grow(k) * (1 + 0.04 * Math.sin(t * 5)));
      arrow.visible = k > 0.01; arrow.position.set(lb.position.x + 0.5 * u + 0.04 * u * Math.sin(t * 5), waterY + 0.82 * u, lb.position.z); arrow.scale.setScalar(grow(k));
    },
  };
}
