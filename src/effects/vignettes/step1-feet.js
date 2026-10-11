// 足 (feet-walk): two smooth bare feet on a sand slope tilted toward you. Each foot is built, not assembled from blobs: a lofted
// body (rounded heel, high instep, a lifted arch on the inner side, a broad ball) with an ankle stump and the two ankle bones, shaded
// by its own normals, plus five graded toes with toenails that hinge at their bases. They walk heel to toe (heel strike, flat,
// heel lifts, toes push off), leave footprints, stop side by side, and wiggle their toes in a wave.
import * as THREE from 'three';
import { acts } from './timeline.js';
import { solidProp, kitMaterial, mergeColored } from '../pieces/kit-rig.js';
import { between } from './helpers.js';

const PI = Math.PI;
const lerp = (a, b, f) => a + (b - a) * f;
const ss = (x) => x * x * (3 - 2 * x);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// a smooth curve through [s, value] points (Catmull-Rom with the neighbours' slopes)
function prof(pts) {
  const n = pts.length;
  return (s) => {
    if (s <= pts[0][0]) return pts[0][1];
    if (s >= pts[n - 1][0]) return pts[n - 1][1];
    let i = 0; while (s > pts[i + 1][0]) i++;
    const [s0, v0] = pts[i], [s1, v1] = pts[i + 1], h = s1 - s0, t = (s - s0) / h, t2 = t * t, t3 = t2 * t;
    const m0 = i > 0 ? (v1 - pts[i - 1][1]) / (s1 - pts[i - 1][0]) : (v1 - v0) / h, m1 = i + 2 < n ? (pts[i + 2][1] - v0) / (pts[i + 2][0] - s0) : (v1 - v0) / h;
    return (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * h * m1;
  };
}
// indexed geometries [[geo, colour, softness]] -> one geometry (position, normal, colour); the colour darkens the sides and the sole
function skinGeo(parts) {
  let nV = 0, nI = 0; for (const [g] of parts) { nV += g.attributes.position.count; nI += g.index.count; }
  const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3), idx = new Uint32Array(nI), c = new THREE.Color();
  let v = 0, k = 0;
  for (const [g, base, soft] of parts) {
    pos.set(g.attributes.position.array, v * 3); nor.set(g.attributes.normal.array, v * 3);
    for (let i = 0; i < g.index.count; i++) idx[k + i] = g.index.array[i] + v;
    for (let i = 0; i < g.attributes.position.count; i++) {
      const ny = nor[3 * (v + i) + 1], f = 1 - soft + soft * (ny * 0.5 + 0.5), sole = ny < -0.4 ? 0.12 : 0;
      c.set(base).multiplyScalar(f); col[3 * (v + i)] = c.r; col[3 * (v + i) + 1] = c.g * (1 - sole * 0.5); col[3 * (v + i) + 2] = c.b * (1 - sole * 0.6);
    }
    v += g.attributes.position.count; k += g.index.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}
const reverseWinding = (g) => { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const a = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = a; } };
// the mirror image (a right foot from a left): z flipped, normals and winding with it
const mirror = (g) => { g = g.clone(); g.scale(1, 1, -1); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setZ(i, -n.getZ(i)); reverseWinding(g); return g; };

// profiles along the foot (0 = heel, 1 = the big toe's tip), in foot lengths: half width, height of the top, lift of the arch
const FW = prof([[0, 0], [0.02, 0.07], [0.07, 0.11], [0.16, 0.125], [0.3, 0.118], [0.45, 0.126], [0.6, 0.15], [0.72, 0.178], [0.8, 0.19], [0.88, 0.18], [0.93, 0.15]]);
const FH = prof([[0, 0], [0.02, 0.07], [0.07, 0.15], [0.16, 0.21], [0.26, 0.2], [0.36, 0.17], [0.5, 0.135], [0.65, 0.103], [0.78, 0.088], [0.88, 0.078], [0.93, 0.06]]);
const FARCH = prof([[0, 0], [0.14, 0], [0.3, 0.045], [0.42, 0.064], [0.55, 0.036], [0.68, 0], [1, 0]]);
const SKIN = 0xf1bf9a, CUT = 0xf8dcc8, NAIL = 0xfbe4d8;

// the foot body for a foot of length L: x forward, y up, z toward the big toe's side. Returns a geometry (left foot).
function footBody(L, { stump = true } = {}) {
  const NS = 48, NR = 24, send = 0.93, N = 2.5, P = [], I = [];
  const sg = (x) => Math.sign(x) * Math.pow(Math.abs(x), 2 / N);
  for (let i = 0; i <= NS; i++) {
    const s = send * (0.5 - 0.5 * Math.cos(PI * i / NS));
    const cap = s < 0.07 ? Math.sqrt(1 - (1 - s / 0.07) ** 2) : s > 0.85 ? Math.sqrt(Math.max(0, 1 - ((s - 0.85) / 0.08) ** 2)) : 1;
    const w = FW(s) * cap, h = FH(s) * cap, arch = FARCH(s) * cap;
    for (let j = 0; j < NR; j++) {
      const th = 2 * PI * j / NR, lat = sg(Math.cos(th)), vert = sg(Math.sin(th)), up = Math.max(0, vert), yb = arch * ss(clamp((lat + 0.2) / 1.2));
      P.push(s * L, (yb + (h - yb) * (0.5 + 0.5 * vert)) * L, w * lat * (1 - 0.22 * up) * L);
    }
  }
  for (let i = 0; i < NS; i++) for (let j = 0; j < NR; j++) { const a = i * NR + j, b = i * NR + (j + 1) % NR, c = (i + 1) * NR + j, d = (i + 1) * NR + (j + 1) % NR; I.push(a, c, b, b, c, d); }
  const body = new THREE.BufferGeometry(); body.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); body.setIndex(I); body.computeVertexNormals();
  if (body.attributes.normal.getY((NS >> 1) * NR + NR / 4) < 0) { reverseWinding(body); body.computeVertexNormals(); }   // wind outward: the top of the middle ring points up
  const parts = [[body, SKIN, 0.3]];
  if (stump) {
    // the ankle: a lathe flaring into the heel and rising to a flat cut, with the two ankle bones
    const lp = [[0.0, 0.13], [0.118, 0.14], [0.108, 0.22], [0.093, 0.3], [0.086, 0.4], [0.088, 0.5]].map(([r, y]) => new THREE.Vector2(r * L, y * L));
    const leg = new THREE.LatheGeometry(lp, 28).translate(0.17 * L, 0, 0);
    const capG = new THREE.CircleGeometry(0.088 * L, 28).rotateX(-PI / 2).translate(0.17 * L, 0.5 * L, 0);
    const bone = (z, y) => new THREE.SphereGeometry(0.04 * L, 14, 10).scale(1, 1.1, 0.8).translate(0.165 * L, y * L, z * L);
    parts.push([leg, SKIN, 0.3], [capG, CUT, 0], [bone(0.085, 0.27), SKIN, 0.3], [bone(-0.085, 0.22), SKIN, 0.3]);
  }
  return skinGeo(parts);
}
// toes [length, width, height, tip x, centre z (toward the inside)] in foot lengths: big toe first, graded down to the little toe
const TOES = [[0.105, 0.06, 0.047, 1.0, 0.13], [0.1, 0.04, 0.036, 0.985, 0.033], [0.085, 0.037, 0.033, 0.935, -0.04], [0.075, 0.034, 0.03, 0.88, -0.107], [0.065, 0.031, 0.027, 0.815, -0.17]];
// toe i: an ellipsoid with a nail, its hinge at the origin (the toe lies along +x from it, resting on y = 0)
function toeGeo(i, L) {
  const [a, b, c] = TOES[i], k = 0.7 * a * L;
  return mergeColored([[new THREE.SphereGeometry(1, 18, 14).scale(a * L, c * L, b * L).translate(k, c * L, 0), SKIN], [new THREE.SphereGeometry(1, 12, 8).scale(0.4 * a * L, 0.16 * c * L, 0.62 * b * L).translate(k + 0.42 * a * L, 1.86 * c * L, 0), NAIL]]);
}

// a footprint: the foot's flat outline (no ankle) with its five toes pressed in, in a darker sand
function printGeo(L) {
  const base = footBody(L, { stump: false }), parts = [[base, 0xc9a768, 0]];
  const toes = TOES.map(([a, b, c, tip, zc]) => [new THREE.SphereGeometry(1, 12, 8).scale(a * 0.85 * L, c * L, b * 0.9 * L).translate((tip - a) * L, c * L, zc * L), 0xc9a768, 0]);
  const g = skinGeo([...parts, ...toes]); g.scale(1, 0.05, 1); return g;
}

export function feetWalk(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, L = 0.7 * u, ALPHA = 0.55;
  const rx = B.maxX + 1.25 * u, halfW = 1.15 * u, halfD = 0.78 * u, cy = halfD * Math.sin(ALPHA) + 0.01 * u;
  // the sand slope, tilted toward us, on a sand wedge that stands on the floor (one mesh)
  const zf = halfD * Math.cos(ALPHA), yb = 2 * halfD * Math.sin(ALPHA) - 0.04 * u, wsh = new THREE.Shape();
  wsh.moveTo(-zf, 0); wsh.lineTo(zf, 0); wsh.lineTo(zf, yb); wsh.lineTo(-zf, 0.002 * u); wsh.closePath();
  const sand = solidProp([[new THREE.BoxGeometry(2 * halfW, 0.05 * u, 2 * halfD).translate(0, -0.025 * u, 0).rotateX(ALPHA).translate(0, cy, 0), 0xe9d29c],
    [new THREE.ExtrudeGeometry(wsh, { depth: 2 * halfW, bevelEnabled: false }).rotateY(PI / 2).translate(-halfW, 0, 0), 0xcfae6e]], 0.45);
  sand.position.set(rx, floor, 0);
  const ramp = new THREE.Group(); ramp.position.set(rx, floor + cy, 0); ramp.rotation.x = ALPHA;       // the slope's own frame: y out of the sand, z down the slope
  const left = footBody(L), mat = kitMaterial(0.3);
  const bodies = [new THREE.Mesh(left, mat), new THREE.Mesh(mirror(left), mat)];
  const toes = TOES.map((_, i) => new THREE.InstancedMesh(toeGeo(i, L), kitMaterial(0.3), 2));
  const flat = printGeo(L);
  const NSTEP = 4, NP = NSTEP + 2, prints = new THREE.InstancedMesh(flat, kitMaterial(0.35), NP);
  [...bodies, ...toes, prints].forEach((m) => { m.frustumCulled = false; });
  ramp.add(...bodies, ...toes, prints); group.add(sand, ramp);

  const M = new THREE.Matrix4(), M2 = new THREE.Matrix4(), M3 = new THREE.Matrix4(), Sf = new THREE.Vector3(1, 1, -1), Z = new THREE.Matrix4().makeScale(1e-4, 1e-4, 1e-4);
  const loop = 7.4, Ts = 0.7, ell = 0.45 * u, x0 = -halfW + 0.12 * u, zOff = [-0.2 * u, 0.2 * u], yaw = [0.09, -0.09], t0 = 0.3;
  // where step j lands (the left foot takes steps 0, 2, 4; the right 1, 3, 5; the last closes up beside the other)
  const P = (j) => (j < 0 ? 0 : (Math.min(j, NSTEP - 2) + 1) * ell);
  const footAt = (F, tau) => {
    const j = Math.floor(tau / Ts), g = tau / Ts - j;
    if (j >= NSTEP) return [P(NSTEP - 1), 0, 0];
    if (j % 2 !== F) return [P(j - 1), 0, 0];
    const u1 = clamp(g / 0.85), pitch = u1 < 1 ? -0.5 * (1 - between(u1, 0, 0.3)) + 0.38 * between(u1, 0.55, 0.97) : 0.38 * (1 - between(g, 0.85, 1));
    return [lerp(P(j - 2), P(j), ss(u1)), u1 > 0 && u1 < 1 ? 0.2 * L * Math.sin(PI * u1) : 0, pitch];
  };
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, walkEnd = t0 + NSTEP * Ts, tau = pre ? 0 : clamp(v - t0, 0, NSTEP * Ts);
      const wig = pre ? 0 : between(v, walkEnd + 0.2, walkEnd + 0.6) * (1 - between(v, walkEnd + 2.6, walkEnd + 3.0));
      for (let F = 0; F < 2; F++) {
        const [x, lift, pitch] = footAt(F, tau), m = F ? -1 : 1, px = pitch < 0 ? 0.82 * L : 0.04 * L;
        // the foot: placed, turned out a little, then pitched about its heel (heel strike) or ball (push-off)
        M.makeTranslation(x0 + x, lift, zOff[F]).multiply(M2.makeRotationY(yaw[F])).multiply(M2.makeTranslation(px, 0, 0)).multiply(M2.makeRotationZ(pitch)).multiply(M2.makeTranslation(-px, 0, 0));
        M.decompose(bodies[F].position, bodies[F].quaternion, bodies[F].scale);
        for (let i = 0; i < 5; i++) {
          const [a, , , tip, zc] = TOES[i], w = wig * (0.3 + 0.26 * Math.sin(t * 11 - i * 0.9 + F * 1.5)) + 0.12 * Math.max(0, -pitch);
          M3.multiplyMatrices(M, M2.makeTranslation((tip - 1.7 * a) * L, 0, m * zc * L).multiply(new THREE.Matrix4().makeRotationZ(w)));
          toes[i].setMatrixAt(F, M3);
        }
      }
      toes.forEach((m) => { m.instanceMatrix.needsUpdate = true; });
      // prints: the two starting spots, then each landing once the foot has set down
      for (let n = 0; n < NP; n++) {
        const j = n - 2, F = ((j % 2) + 2) % 2, on = j < 0 || (!pre && tau / Ts > j + 0.85);
        M.makeTranslation(x0 + P(j), 0.004 * u, zOff[F]).multiply(M2.makeRotationY(yaw[F])); if (F) M.scale(Sf);
        prints.setMatrixAt(n, on ? M : Z);
      }
      prints.instanceMatrix.needsUpdate = true;
    },
  };
}
