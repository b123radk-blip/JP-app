// Verification for tasks A-D (three.js for the transforms, plain math for the rest).
import * as THREE from 'file:///G:/AI/JP-app/node_modules/three/build/three.module.js';

const deg = THREE.MathUtils.degToRad;
const fmt = (v, n = 3) => v.toFixed(n);
const vec = (v) => `(${fmt(v.x)}, ${fmt(v.y)}, ${fmt(v.z)})`;

// ---------------- A. nested groups ----------------
{
  const P = new THREE.Group();
  P.position.set(1.0, 0.1, -0.2);
  P.rotation.set(deg(20), deg(30), 0); // Euler order default 'XYZ'
  const C = new THREE.Group();
  C.position.set(0.2, 0, 0.1);
  C.rotation.set(0, 0, deg(90));
  C.scale.setScalar(0.5);
  P.add(C);
  const G = new THREE.Group();
  G.position.set(0, 0.3, 0);
  C.add(G);
  const root = new THREE.Group();
  root.add(P);
  root.updateMatrixWorld(true);

  const wp = new THREE.Vector3();
  G.getWorldPosition(wp);
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(G.getWorldQuaternion(new THREE.Quaternion())).normalize();
  const eyeLocal = new THREE.Vector3(1.2, 0.5, 0.0).clone();
  const lp = P.worldToLocal(eyeLocal);

  console.log('=== A ===');
  console.log('1. G world position:', vec(wp));
  console.log('2. G local +y in world:', vec(up));
  console.log('3. (1.2, 0.5, 0.0) in P-local:', vec(lp));
  // round-trip check
  const back = P.localToWorld(lp.clone());
  console.log('   round-trip:', vec(back), back.distanceTo(new THREE.Vector3(1.2, 0.5, 0.0)) < 1e-9 ? 'OK' : 'MISMATCH');
}

// ---------------- B. reach the cup ----------------
{
  const ss = (s) => 3 * s * s - 2 * s ** 3;
  const cupX = (t) => 0.6 + 0.5 * ss(Math.min(1, Math.max(0, (t - 1) / 2)));
  const S = { x: 1.0, y: 0.55, z: -0.1 }, R = 0.30;
  let lo = null;
  for (let t = 0; t <= 4.0000001; t += 0.0005) {
    const x = cupX(t);
    const d2 = (x - S.x) ** 2 + (0.45 - S.y) ** 2 + (0.05 - S.z) ** 2;
    const inR = d2 <= R * R + 1e-12;
    if (inR && lo === null) lo = t;
  }
  // exact boundary
  const dxMax = Math.sqrt(R * R - 0.15 * 0.15 - 0.1 * 0.1);
  const xNeed = 1.0 - dxMax;
  const sNeed = (xNeed - 0.6) / 0.5;
  let a = 0, b = 1;
  for (let i = 0; i < 80; i++) { const m = (a + b) / 2; (3 * m * m - 2 * m ** 3 - sNeed < 0) ? a = m : b = m; }
  const tExact = 1 + 2 * (a + b) / 2;
  console.log('=== B ===');
  console.log('reach window |dx| <=', fmt(dxMax, 6), ' -> x >=', fmt(xNeed, 6));
  console.log('enter at t =', fmt(tExact, 2), '(scan says', fmt(lo, 2) + ')  to t = 4.00 (end of the given interval)');
  for (const t of [0, 1, 1.7, tExact - 0.001, tExact + 0.001, 2.5, 3, 4]) {
    const x = cupX(t);
    const d = Math.hypot(x - S.x, -0.1, 0.15);
    console.log(`   t=${t}: x=${fmt(x)} d=${fmt(d, 4)} ${d <= R ? 'in' : 'out'}`);
  }
}

// ---------------- C. sight lines ----------------
{
  const E = { x: -0.45, y: 0.35, z: 2.6 };
  const box = { x0: 0.7, x1: 1.2, y0: 0, y1: 0.5, z0: 0.1, z1: 0.3 };
  // segment E->P: find t-range inside the box (each axis gives a range; intersect)
  const inside = (P) => {
    const d = { x: P.x - E.x, y: P.y - E.y, z: P.z - E.z };
    let tLo = 0, tHi = 1;
    for (const ax of ['x', 'y', 'z']) {
      const lo = box[ax + '0'], hi = box[ax + '1'], p = E[ax], dv = d[ax];
      let a, b;
      if (Math.abs(dv) < 1e-12) { if (p < lo || p > hi) return null; continue; }
      a = (lo - p) / dv; b = (hi - p) / dv;
      if (a > b) [a, b] = [b, a];
      tLo = Math.max(tLo, a); tHi = Math.min(tHi, b);
      if (tLo > tHi) return null;
    }
    return [tLo, tHi];
  };
  const head = { x: 0.95, y: 0.62, z: -0.25 };
  const knee = { x: 0.95, y: 0.20, z: -0.15 };
  console.log('=== C ===');
  console.log('1. head hidden?', inside(head) ? `YES ${inside(head).map(fmt)}` : 'no (segment clears the cabinet)');
  const kh = inside(knee);
  console.log('2. knee hidden?', kh ? `YES, through the cabinet at t=${kh.map((v) => fmt(v, 4))}` : 'no');
  // 3. lowest visible y for x 0.95, z -0.25: the ray must clear the top edge at y 0.5 over the
  //    t-range where the ray is inside the cabinet's x and z slabs.
  const dx = 0.95 - E.x, dz = -0.25 - E.z;
  const txLo = (box.x0 - E.x) / dx, txHi = (box.x1 - E.x) / dx;
  const tzLo = (box.z0 - E.z) / dz, tzHi = (box.z1 - E.z) / dz;
  const tIn = Math.max(txLo, tzLo), tOut = Math.min(txHi, tzHi);
  console.log('   ray inside x/z slab for t in', [fmt(tIn, 6), fmt(tOut, 6)]);
  // y(t) = E.y + (y - E.y) * t increases in t (y > E.y): worst (lowest) point of the ray in the slab is at tIn
  const yMin = E.y + (0.5 - E.y) / tIn;
  console.log('3. lowest visible head height y =', fmt(yMin, 3), '(ray grazes the top edge at x=' + fmt(E.x + dx * tIn) + ', y=0.5)');
  // sanity: a ray at yMin actually touches the top face, and one slightly lower enters the box
  const touch = { x: 0.95, y: yMin, z: -0.25 };
  const justBelow = { x: 0.95, y: yMin - 1e-4, z: -0.25 };
  console.log('   check: yMin ->', inside(touch) ? 'inside (bad)' : 'clear', '| just below ->', inside(justBelow) ? 'inside (good)' : 'clear (bad)');
}

// ---------------- D. board tilt ----------------
{
  const C = { x: 0.95, y: 0.15, z: 0 }, E = { x: -0.45, y: 0.35, z: 2.6 };
  const d = { x: E.x - C.x, y: E.y - C.y, z: E.z - C.z };
  const L = Math.hypot(d.x, d.y, d.z);
  const u = { x: d.x / L, y: d.y / L, z: d.z / L };
  console.log('=== D ===');
  console.log('centre->eye dir:', vec(new THREE.Vector3(u.x, u.y, u.z)), '| len', fmt(L, 5));
  const N = (th) => {
    const n = { x: 0, y: Math.cos(th), z: Math.sin(th) };
    const cos = n.x * u.x + n.y * u.y + n.z * u.z;
    const ang = Math.acos(Math.min(1, Math.max(-1, cos)));
    return 90 - THREE.MathUtils.radToDeg(ang);
  };
  console.log('1. N at theta=0:', fmt(N(0), 3), 'deg');
  // smallest theta with N >= 30  <=>  cos(angle between n and u) >= 0.5
  let lo = 0, hi = 90;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; (N(THREE.MathUtils.degToRad(m)) < 30) ? lo = m : hi = m; }
  console.log('2. smallest theta with N >= 30:', fmt((lo + hi) / 2, 2), 'deg  (N there =', fmt(N(THREE.MathUtils.degToRad((lo + hi) / 2)), 3) + ')');
  console.log('   monotonic check N(30deg)=', fmt(N(deg(30)), 3), ' N(31deg)=', fmt(N(deg(31)), 3));
}
