// E. The walker: a pure function of t with loop length 8 s.
//   Path (x, z): (0.6, -0.6) -> (0.6, 0.3) -> (1.3, 0.3) -> (1.3, -0.6) -> back, at 0.5 u/s
//   (segs 0-1.8, 1.8-3.2, 3.2-5.0, 5.0-6.4 s), then stands at the start until 8 s.
//   Headings (atan2(dx, dz) in degrees): 0, 90, 180, -90. At each corner yaw turns
//   short-way (smoothstep) over 0.2 s centred on arrival; while standing it turns
//   -90 -> 0 over 6.4-7.0, holds, and "turns" 0 -> 0 over 7.6-8.0 (a no-op beat).
const LOOP = 8;
const T20 = Math.tan(20 * Math.PI / 180);
const clamp01 = (s) => Math.min(1, Math.max(0, s));
const ss = (s) => 3 * s * s - 2 * s * s * s; // smoothstep, expects clamped input
const norm180 = (d) => { let n = ((d + 180) % 360 + 360) % 360 - 180; return n === -180 ? 180 : n; };
// short-way turn from a to b, progress u in [0,1] (smoothstepped)
const turn = (a, b, u) => {
  const d = (b - a + 540) % 360 - 180; // signed shortest delta, in (-180, 180]
  return a + d * ss(clamp01(u));
};
const SEGS = [
  { from: 0.0, to: 1.8, a: [0.6, -0.6], b: [0.6, 0.3], yaw: 0 },    // +z
  { from: 1.8, to: 3.2, a: [0.6, 0.3], b: [1.3, 0.3], yaw: 90 },     // +x
  { from: 3.2, to: 5.0, a: [1.3, 0.3], b: [1.3, -0.6], yaw: 180 },   // -z
  { from: 5.0, to: 6.4, a: [1.3, -0.6], b: [0.6, -0.6], yaw: -90 },  // -x
];
const CORNERS = [
  { at: 1.8, from: 0, to: 90 },    // 90 deg the short way
  { at: 3.2, from: 90, to: 180 },  // +90 (the other way is -270)
  { at: 5.0, from: 180, to: -90 }, // +90 via 270 (the other way is -270)
];
export function walker(t) {
  const v = ((t % LOOP) + LOOP) % LOOP; // wraps negative t and t >= 8
  let x, z, yaw;
  if (v < 6.4) {
    let s = SEGS[0];
    for (const g of SEGS) if (v >= g.from) s = g; // current segment (corners belong to the next one)
    const w = (v - s.from) / (s.to - s.from);
    x = s.a[0] + (s.b[0] - s.a[0]) * w;
    z = s.a[1] + (s.b[1] - s.a[1]) * w;
    yaw = s.yaw;
    for (const c of CORNERS) {
      const d = v - c.at;
      if (d >= -0.1 && d <= 0.1) yaw = turn(c.from, c.to, d / 0.2 + 0.5); // 0.2 s centred on the corner
    }
  } else {
    x = 0.6; z = -0.6;
    if (v < 7.0) yaw = turn(-90, 0, (v - 6.4) / 0.6);
    else if (v < 7.6) yaw = 0;
    else yaw = turn(0, 0, (v - 7.6) / 0.4); // 0 -> first segment's heading (0): nothing happens
  }
  const y = (0.5 - z) * T20 + 0.045 + (v < 6.4 ? 0.012 : 0);
  return { x, y, z, yaw: norm180(yaw) };
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  for (const t of [1.75, 3.2, 5.05, 6.7, -0.5]) {
    const w = walker(t);
    console.log(`t=${t}  v=${(((t % 8) + 8) % 8).toFixed(2)}  x=${w.x.toFixed(6)} y=${w.y.toFixed(6)} z=${w.z.toFixed(6)} yaw=${w.yaw.toFixed(4)}`);
  }
  // discontinuity scan: sample densely, flag jumps
  const DT = 0.001;
  let worst = null;
  for (let i = 0; i < 20000; i++) {
    const a = walker(i * DT), b = walker((i + 1) * DT);
    const jump = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) + Math.min(Math.abs(b.yaw - a.yaw), 360 - Math.abs(b.yaw - a.yaw)) / 180;
    if (!worst || jump > worst.size) worst = { at: i * DT, size: jump, a, b };
  }
  console.log('largest jump over the loop (pos u, yaw normalised to 0..1):', worst ? `${worst.size.toExponential(3)} at t=${worst.at.toFixed(3)}` : 'none');
  for (const t of [6.399, 6.4, 6.401, 7.999, 0.001]) {
    const w = walker(t);
    console.log(`t=${t}  y=${w.y.toFixed(6)} (walking-bob present: ${w.y > 0.456 ? 'yes' : 'no'})`);
  }
}
