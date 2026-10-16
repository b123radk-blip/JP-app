import { walker } from './walker.mjs';
import { step } from './fixed.mjs';

// ---- E ----
console.log('=== E: requested t values ===');
for (const t of [1.75, 3.2, 5.05, 6.7, -0.5]) {
  const w = walker(t);
  console.log(`t=${t}  x=${w.x.toFixed(6)}  y=${w.y.toFixed(6)}  z=${w.z.toFixed(6)}  yaw=${w.yaw.toFixed(4)} deg`);
}
// dense discontinuity scan over one loop (plus the loop point)
const DT = 0.0005;
let worst = null;
for (let i = 0; i < 16000; i++) {
  const a = walker(i * DT), b = walker((i + 1) * DT);
  const yawD = Math.min(Math.abs(b.yaw - a.yaw), 360 - Math.abs(b.yaw - a.yaw));
  const size = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) + yawD / 180;
  if (!worst || size > worst.size) worst = { at: i * DT, size, a, b };
}
console.log('largest single-step change over v in [0,8):', worst ? `pos+jaw ${worst.size.toExponential(3)} between t=${worst.at.toFixed(4)} and t=${(worst.at + DT).toFixed(4)}` : 'none');
console.log('  there:', `x ${worst.a.x.toFixed(4)}->${worst.b.x.toFixed(4)}  y ${worst.a.y.toFixed(6)}->${worst.b.y.toFixed(6)}  z ${worst.a.z.toFixed(4)}->${worst.b.z.toFixed(4)}  yaw ${worst.a.yaw}->${worst.b.yaw}`);
for (const t of [6.399, 6.4, 6.401, 7.9995, 0.0005]) {
  const w = walker(t);
  console.log(`t=${t}  v=${(((t % 8) + 8) % 8).toFixed(4)}  y=${w.y.toFixed(6)}  yaw=${w.yaw.toFixed(3)}`);
}
// corner checks: mid-turn values
for (const [t, expect] of [[1.8, 45], [3.2, 135], [5.0, -135], [6.4, -90], [6.7, -45], [7.5, 0], [7.9, 0]]) {
  const w = walker(t);
  console.log(`corner check t=${t}: yaw=${w.yaw.toFixed(3)} (expect ~${expect})`);
}
// purity: same t twice, out of order
const o1 = walker(-0.5), o2 = walker(-0.5);
console.log('pure at same t:', JSON.stringify(o1) === JSON.stringify(o2));

// ---- F ----
console.log('\n=== F: fixed.mjs behaviour ===');
const o = { ball: { x: 0, y: 0 }, glyph: { rotY: 0 }, board: { rotX: 0, rotY: 0 } };
const show = (t) => { step(t, o); console.log(`t=${t}  ball.x=${o.ball.x.toFixed(6)}  ball.y=${o.ball.y.toFixed(6)}  glyph.rotY=${o.glyph.rotY.toFixed(6)}  board(${(o.board.rotX * 180 / Math.PI).toFixed(1)}deg, ${(o.board.rotY * 180 / Math.PI).toFixed(1)}deg)`); };
for (const t of [0, 1, 2, 2.5, 3, 3.25, 3.5, 3.75, 4, 5, 6 - 1e-9, -0.5, -2, 12.5]) show(t);
// determinism: call in any order, on a fresh object, random t's
const fresh = () => ({ ball: { x: undefined, y: undefined }, glyph: { rotY: undefined }, board: { rotX: undefined, rotY: undefined } });
const t1 = step(2.5, fresh()); const t2 = step(2.5, fresh()); const t3 = step(2.5, fresh());
console.log('deterministic fresh seeks at t=2.5:', JSON.stringify(t1) === JSON.stringify(t2) && JSON.stringify(t2) === JSON.stringify(t3), JSON.stringify(t1));
const a = step(-2, fresh()), b = step(4, fresh()), c = step(-2, fresh());
console.log('order-independence: step(-2) == step(-2) after step(4):', JSON.stringify(a) === JSON.stringify(c));
// loop closure: t just below 6 vs t just above 0
const e1 = step(6 - 1e-9, fresh()), e2 = step(1e-9, fresh());
console.log('loop closure x:', e1.ball.x.toFixed(6), 'vs', e2.ball.x.toFixed(6), '| y:', e1.ball.y, e2.ball.y, '| rotY:', e1.glyph.rotY.toFixed(6), e2.glyph.rotY.toFixed(6));
