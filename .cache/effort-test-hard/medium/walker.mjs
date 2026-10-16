// Task E — walker(t): { x, y, z, yaw } (yaw in degrees, normalised to (-180, 180]).
// Loop 8 s. Walks a closed rectangle at 0.5 u/s (0..6.4 s), stands at the start (6.4..8 s).

const L = 8, SPEED = 0.5, T = Math.tan(20 * Math.PI / 180);
const ss = (s) => { s = Math.min(1, Math.max(0, s)); return s * s * (3 - 2 * s); };
const norm = (a) => { let d = ((a % 360) + 540) % 360 - 180; return d === -180 ? 180 : d; };
const shortTurn = (from, to, k) => { // k in [0,1]: from -> to the short way round
  let d = norm(to - from);
  if (d === 180) d = -180; // both ways equal; pick one
  return norm(from + d * k);
};

// corners: A -> B -> C -> D -> A
const SEGS = [
  { ax: 0.6, az: -0.6, bx: 0.6, bz: 0.3,  t0: 0.0, t1: 1.8, yaw: 0 },    // +z
  { ax: 0.6, az: 0.3,  bx: 1.3, bz: 0.3,  t0: 1.8, t1: 3.2, yaw: 90 },   // +x
  { ax: 1.3, az: 0.3,  bx: 1.3, bz: -0.6, t0: 3.2, t1: 5.0, yaw: 180 },  // -z
  { ax: 1.3, az: -0.6, bx: 0.6, bz: -0.6, t0: 5.0, t1: 6.4, yaw: -90 },  // -x
];
const CORNERS = [ // [v of corner arrival, from yaw, to yaw]
  [1.8, 0, 90], [3.2, 90, 180], [5.0, 180, -90],
];

export function walker(t) {
  const v = ((t % L) + L) % L;
  let x, z, yaw;
  if (v < 6.4) {
    const seg = SEGS.find((s) => v < s.t1) ?? SEGS[3];
    const u = (v - seg.t0) / (seg.t1 - seg.t0);
    x = seg.ax + (seg.bx - seg.ax) * u;
    z = seg.az + (seg.bz - seg.az) * u;
    yaw = seg.yaw;
    for (const [tc, from, to] of CORNERS) {
      if (Math.abs(v - tc) < 0.1 - 1e-9) {
        yaw = shortTurn(from, to, ss((v - (tc - 0.1)) / 0.2));
        break;
      }
    }
  } else {
    x = 0.6; z = -0.6;
    if (v < 7.0) yaw = shortTurn(-90, 0, ss((v - 6.4) / 0.6));
    else if (v < 7.6) yaw = 0;
    else yaw = shortTurn(0, SEGS[0].yaw, ss((v - 7.6) / 0.4)); // 0 -> 0: nothing happens
  }
  const y = (0.5 - z) * T + 0.045 + (v < 6.4 ? 0.012 : 0);
  return { x, y, z, yaw };
}

if (process.argv[1]?.endsWith('walker.mjs')) {
  for (const t of [1.75, 3.2, 5.05, 6.7, -0.5]) {
    const w = walker(t);
    console.log(`t=${t}: x=${w.x.toFixed(4)} y=${w.y.toFixed(4)} z=${w.z.toFixed(4)} yaw=${w.yaw.toFixed(3)}`);
  }
  // discontinuity scan over the loop
  const jumps = [];
  for (let i = 0; i < 8000; i++) {
    const t0 = (i / 8000) * 8, t1 = (i + 1) / 8000 * 8;
    const a = walker(t0), b = walker(t1);
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    let dyaw = b.yaw - a.yaw; if (dyaw > 180) dyaw -= 360; if (dyaw < -180) dyaw += 360;
    if (Math.hypot(dx, dz) > 0.01 || dy > 0.005 || Math.abs(dyaw) > 5) jumps.push([t0.toFixed(3), { dx: +dx.toFixed(4), dy: +dy.toFixed(4), dz: +dz.toFixed(4), dyaw: +dyaw.toFixed(3) }]);
  }
  console.log('jumps found at loop times:', JSON.stringify(jumps));
  for (const t of [6.4, 6.4 - 1e-4, 8, 0, 0 + 1e-4]) console.log(`check t=${t}:`, JSON.stringify(walker(t)));
}
