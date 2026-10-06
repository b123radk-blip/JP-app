// Scene props that show the place itself, behind the kanji: "mountains" (a range whose peaks sit right behind the tops of
// the strokes, rising as they are drawn, snow caps once done), "river" (a winding river on a tilted valley panel that fills
// from the far end as the strokes draw, then keeps flowing towards you), "ripples" (a water surface where every stroke lands
// with a ring, and rings keep coming). The panels stand nearly upright: anything flat at the card's height would be seen edge-on.
import * as THREE from 'three';
import { smooth, mulberry32, lerp } from './util.js';

function bounds(ctx) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of ctx.strokes) for (const p of s.pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  return { minX, maxX, minY, maxY, h: maxY - minY };
}

export function mountains(ctx, spec) {
  const group = new THREE.Group(), rnd = mulberry32(11), b = bounds(ctx);
  // peaks: the highest point of each stroke that reaches the upper part of the kanji (close ones merge)
  let peaks = ctx.strokes.map((s) => s.pts.reduce((a, p) => (p.y > a.y ? p : a), s.pts[0])).filter((p) => p.y > b.minY + 0.3 * b.h).map((p) => ({ x: p.x, y: p.y })).sort((a, c) => a.x - c.x);
  peaks = peaks.reduce((out, p) => { const q = out.at(-1); if (q && p.x - q.x < 0.05) { if (p.y > q.y) out[out.length - 1] = p; } else out.push(p); return out; }, []);
  if (!peaks.length) peaks = [{ x: 0, y: b.maxY }];
  const X = 1.35;                                                    // the range is wider than the kanji: peaks loom out beside the strokes
  peaks = peaks.map((p) => ({ x: p.x * X, y: p.y + 0.05 }));
  const valley = b.minY + 0.02 * b.h, ridge = [[-2.2, -0.55], [-1.0, -0.22]];
  const crag = (a, c, k = 3) => { for (let i = 1; i < k; i++) { const u = i / k; ridge.push([lerp(a[0], c[0], u), lerp(a[1], c[1], u) + (rnd() - 0.5) * 0.018]); } };
  const tops = [];
  peaks.forEach((p, i) => {
    const v = [i ? (peaks[i - 1].x + p.x) / 2 : p.x - 0.24, valley], top = [p.x, p.y];
    crag(ridge.at(-1), v); ridge.push(v); crag(v, top); ridge.push(top); tops.push({ top, left: v });
  });
  const end = [peaks.at(-1).x + 0.24, valley];
  crag(ridge.at(-1), end); ridge.push(end, [1.0, -0.22], [2.2, -0.55]);
  tops.forEach((t, i) => { t.right = i + 1 < tops.length ? tops[i + 1].left : end; });
  const shapeOf = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], -3); pts.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(pts.at(-1)[0], -3); return s; };
  const nearMat = new THREE.MeshBasicMaterial({ color: spec.color }), farMat = new THREE.MeshBasicMaterial({ color: spec.far });
  const near = new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(ridge)), nearMat); near.position.z = -0.3;
  const farPts = [[-3, -0.4]]; for (let x = -2.6; x <= 2.6; x += 0.18) farPts.push([x, -0.05 + rnd() * 0.22 * (1 - Math.abs(x) / 3)]); farPts.push([3, -0.4]);
  const far = new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(farPts)), farMat); far.position.z = -0.95;
  // snow caps: the top 30 % of each main peak with a ragged lower edge
  const caps = tops.map(({ top, left, right }) => {
    const L = [lerp(top[0], left[0], 0.3), lerp(top[1], left[1], 0.3)], R = [lerp(top[0], right[0], 0.3), lerp(top[1], right[1], 0.3)];
    const s = new THREE.Shape(); s.moveTo(...top); s.lineTo(...R);
    for (let i = 1; i < 5; i++) { const u = i / 5; s.lineTo(lerp(R[0], L[0], u), lerp(R[1], L[1], u) + (i % 2 ? 0.012 : -0.006)); }
    s.lineTo(...L); s.closePath(); return s;
  });
  const capMat = new THREE.MeshBasicMaterial({ color: 0xf4f8ff, transparent: true, opacity: 0 });
  const cap = new THREE.Mesh(new THREE.ShapeGeometry(caps), capMat); cap.position.z = -0.299;
  group.add(far, near, cap);
  return {
    group,
    step(t) {
      const u = smooth(t / Math.max(0.5, ctx.rv.end));                 // the range rises while the strokes are drawn
      near.position.y = -0.42 * (1 - u); far.position.y = -0.25 * (1 - u); cap.position.y = near.position.y;
      capMat.opacity = spec.snow ? smooth((ctx.idle - 0.1) / 0.7) : 0;
    },
  };
}

const WATER_VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
function panel(w, h, uniforms, frag) {
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: WATER_VERT, fragmentShader: frag, transparent: true, depthWrite: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = -5;
  return m;
}

export function river(ctx, spec) {
  const U = { uTime: { value: 0 }, uFill: { value: 0 }, uOn: { value: 0 }, uWater: { value: new THREE.Color(spec.water) }, uLight: { value: new THREE.Color(spec.light) }, uBank: { value: new THREE.Color(spec.bank) } };
  const m = panel(1.7, 1.3, U, `varying vec2 vUv; uniform float uTime, uFill, uOn; uniform vec3 uWater, uLight, uBank;
    void main(){
      float v = vUv.y, cx = 0.5 + 0.11 * sin(v * 4.0 + 0.6) + 0.04 * sin(v * 9.0 + 2.0), w = mix(0.2, 0.07, v);
      float d = abs(vUv.x - cx) / w, inRiver = smoothstep(1.0, 0.86, d), filled = smoothstep(1.0 - uFill - 0.05, 1.0 - uFill, v);
      float s = sin(v * 46.0 + uTime * 3.2 + sin(vUv.x * 31.0 + v * 7.0) * 1.6) * sin(v * 23.0 + uTime * 2.1 + vUv.x * 9.0);
      vec3 water = mix(uWater, uLight, smoothstep(0.55, 1.0, s) * 0.6 + smoothstep(0.62, 1.0, d) * 0.55);
      vec3 bank = uBank * (0.8 + 0.2 * sin(vUv.x * 7.0 + v * 5.0) * sin(v * 9.0 - vUv.x * 3.0)), bed = vec3(0.16, 0.12, 0.08);
      vec3 col = mix(bank, mix(bed, water, filled), inRiver);
      float a = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x) * smoothstep(0.0, 0.12, v) * smoothstep(1.0, 0.7, v);
      gl_FragColor = vec4(col, a * uOn);
      #include <colorspace_fragment>
    }`);
  m.position.set(0, -0.06, -0.38); m.rotation.x = -0.55;                  // top leans away: a valley seen from above
  const group = new THREE.Group(); group.add(m);
  const first = ctx.rv.items[0].start;
  return { group, step(t) { U.uTime.value = t; U.uOn.value = smooth(t / 0.8); U.uFill.value = smooth((t - first) / Math.max(0.5, ctx.rv.end - first)); } };
}

export function ripples(ctx, spec) {
  const N = 6, src = Array.from({ length: N }, () => new THREE.Vector3(0, 0, -99));
  const W = 1.5, H = 1.0, U = { uTime: { value: 0 }, uOn: { value: 0 }, uSrc: { value: src }, uWater: { value: new THREE.Color(spec.water) }, uLight: { value: new THREE.Color(spec.light) } };
  const m = panel(W, H, U, `varying vec2 vUv; uniform float uTime, uOn; uniform vec3 uSrc[${N}]; uniform vec3 uWater, uLight;
    void main(){
      vec2 p = vec2((vUv.x - 0.5) * ${W.toFixed(2)}, (vUv.y - 0.5) * ${H.toFixed(2)});
      float c = sin(p.x * 70.0 + uTime * 1.3 + 2.0 * sin(p.y * 45.0 + uTime)) * sin(p.y * 64.0 - uTime * 1.1 + 2.0 * sin(p.x * 39.0));
      float ring = 0.0;
      for (int i = 0; i < ${N}; i++) { float age = uTime - uSrc[i].z; if (age > 0.0 && age < 4.0) { float r = age * 0.16, d = length(p - uSrc[i].xy);
        ring += exp(-pow((d - r) * 60.0, 2.0)) * exp(-age * 0.9); } }
      vec3 col = mix(uWater, uLight, clamp(smoothstep(0.7, 1.0, c) * 0.07 + ring * 0.65, 0.0, 1.0));
      float a = smoothstep(0.5, 0.3, length((vUv - 0.5) * vec2(1.0, 1.25)));
      gl_FragColor = vec4(col, a * uOn);
      #include <colorspace_fragment>
    }`);
  m.position.set(0, 0, -0.3); m.rotation.x = -0.3;
  const group = new THREE.Group(); group.add(m);
  const ends = ctx.strokes.slice(0, N).map((s, i) => ({ x: s.pts.at(-1).x, y: s.pts.at(-1).y + 0.03, t: ctx.rv.items[i].start + ctx.rv.items[i].dur }));
  const period = 2.4;
  return {
    group,
    step(t) {
      U.uTime.value = t; U.uOn.value = smooth(t / 0.8);
      ends.forEach((e, i) => {                                            // ring when the stroke lands, then again every `period`
        let t0 = e.t; const first = ctx.rv.end + 0.8 + (i * period) / ends.length;
        if (t >= first) t0 = first + Math.floor((t - first) / period) * period;
        src[i].set(e.x, e.y, t0);
      });
    },
  };
}
