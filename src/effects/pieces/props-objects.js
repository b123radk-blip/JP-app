// Scene props that are objects: "tree" (a leafy crown bursting out behind the strokes once they are drawn; with `on` it
// grows on each instance of a component, e.g. both 木 of 林, and sways with it), "lanterns" (n paper lanterns that light one
// by one: one per stroke when n = the stroke count, so counting = writing), "dial" (a big clock face behind the kanji, hands
// sweeping, a small sun arcing over it).
import * as THREE from 'three';
import { smooth, pop, mulberry32, radialTexture } from './util.js';

// anchor: { strokes: [stroke indices] } -> the crown sits behind the upper part of those strokes
export function tree(ctx, spec, anchor) {
  const pts = anchor.strokes.flatMap((i) => ctx.strokes[i].pts), box = new THREE.Box3().setFromPoints(pts);
  const w = box.max.x - box.min.x, h = box.max.y - box.min.y, cx = (box.min.x + box.max.x) / 2, rnd = mulberry32(5 + anchor.index);
  const N = 12, base = new THREE.Color(spec.color), k = Math.min(w, h);
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.85 }), N);
  const blobs = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 + rnd() * 0.5, r = i === 0 ? 0 : 0.35 + rnd() * 0.65;
    mesh.setColorAt(i, base.clone().offsetHSL((rnd() - 0.5) * 0.06, 0, (rnd() - 0.5) * 0.18));
    return { x: cx + Math.cos(a) * r * 0.42 * w, y: box.min.y + 0.8 * h + Math.sin(a) * r * 0.26 * h, z: -ctx.rz * 2.6 - 0.02 - rnd() * 0.04, r: (0.2 + rnd() * 0.12) * k, delay: 0.05 * i + rnd() * 0.1 };
  });
  mesh.frustumCulled = false; mesh.instanceColor.needsUpdate = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  return {
    group: mesh,
    step(t) {
      for (let i = 0; i < N; i++) {
        const b = blobs[i], k = pop(ctx.idle - b.delay, 0.5) * (1 + 0.03 * Math.sin(t * 1.3 + i));
        e.set(i, i * 0.7, 0); q.setFromEuler(e); v.set(b.x, b.y, b.z); s.setScalar(Math.max(1e-4, b.r * k));
        mesh.setMatrixAt(i, m.compose(v, q, s));
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.visible = ctx.idle > 0;
    },
  };
}

export function lanterns(ctx, spec) {
  const group = new THREE.Group(), n = spec.n, gap = 0.2, perStroke = n === ctx.strokes.length;
  const capMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.6 }), capGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16);
  const stringGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.5, 6).translate(0, 0.25, 0), bodyGeo = new THREE.SphereGeometry(0.045, 20, 14).scale(1, 1.25, 1);
  const glowTex = radialTexture(0.3, 0.3);
  const items = Array.from({ length: n }, (_, i) => {
    const g = new THREE.Group(); g.position.set((i - (n - 1) / 2) * gap, 0.03, -0.28);
    const mat = new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0, roughness: 0.7 });
    const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, color: spec.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 });
    const top = new THREE.Mesh(capGeo, capMat), bottom = new THREE.Mesh(capGeo, capMat); top.position.y = 0.056; bottom.position.y = -0.056;
    const string = new THREE.Mesh(stringGeo, capMat); string.position.y = 0.06;
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), glowMat); glow.position.z = -0.01;
    g.add(new THREE.Mesh(bodyGeo, mat), top, bottom, string, glow); group.add(g);
    const it = ctx.rv.items[Math.min(i, ctx.rv.items.length - 1)];
    return { g, mat, glowMat, at: perStroke ? it.start + it.dur : ctx.rv.end + 0.3 + i * 0.5 };
  });
  return {
    group,
    step(t) {
      group.visible = t > 0.2; group.scale.setScalar(smooth(t / 0.6));
      items.forEach((it, i) => {
        const lit = smooth((t - it.at) / 0.25), flash = Math.exp(-Math.max(0, t - it.at) / 0.35) * (t > it.at ? 1 : 0);
        it.mat.emissiveIntensity = 1.4 * lit + 1.2 * flash; it.glowMat.opacity = 0.75 * lit + 0.5 * flash;
        it.g.position.y = 0.03 + 0.006 * Math.sin(t * 1.4 + i * 1.3); it.g.rotation.z = 0.04 * Math.sin(t * 0.9 + i);
      });
    },
  };
}

export function dial(ctx, spec) {
  const group = new THREE.Group(), R = 0.2; group.position.set(0, 0.01, -0.24);
  const ink = new THREE.MeshStandardMaterial({ color: spec.color, emissive: spec.color, emissiveIntensity: 0.35, roughness: 0.4 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 56), new THREE.MeshBasicMaterial({ color: 0x0b0e1a, transparent: true, opacity: 0.6 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.007, 8, 72), ink);
  const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.007, 0.026, 0.004), ink, 12), m = new THREE.Matrix4();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ticks.setMatrixAt(i, m.makeRotationZ(-a).setPosition(Math.sin(a) * (R - 0.025), Math.cos(a) * (R - 0.025), 0.004)); }
  const hand = (len, wd) => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.005), ink); b.position.set(0, len / 2 - 0.012, 0.008); g.add(b); return g; };
  const minute = hand(0.165, 0.009), hour = hand(0.11, 0.014);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffc24a }));
  const sunGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: radialTexture(0.3, 0.35), color: 0xffa040, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  sunGlow.position.z = -0.005;
  group.add(face, ring, ticks, minute, hour, sun, sunGlow);
  return {
    group,
    step(t) {
      group.scale.setScalar(pop(t - 0.1, 0.7));
      const run = Math.max(0, ctx.idle);
      minute.rotation.z = -run * 1.6; hour.rotation.z = -1.1 - run * 0.13;
      const a = Math.PI * (1 - ((t * 0.09) % 1)), Rs = R * 1.32;                // the sun crosses from left to right, over and over
      sun.position.set(Math.cos(a) * Rs, Math.sin(a) * Rs, 0.01); sunGlow.position.set(sun.position.x, sun.position.y, 0.005);
    },
  };
}
