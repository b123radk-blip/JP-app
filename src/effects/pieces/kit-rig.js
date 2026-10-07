// The props kit's base (vignettes, src/effects/vignettes/): one material for every kit prop, a coloured merge so a static
// prop (hammer, board ...) is ONE draw call whatever its colours, and a bone rig drawn as two instanced meshes (limb
// segments + round joints / blobs) so an articulated actor (a hand, a person) costs 2 draw calls however many bones it has.
// Units are metres in the effect's space; builders take a size `u` (usually the glyph height) and build to it.
import * as THREE from 'three';

// Standard material whose glow is its own colour (per vertex or per instance), so props stay readable on dark skies.
export function kitMaterial(glow = 0.32, extra = {}) {
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide, ...extra });
  const uGlow = { value: glow };
  m.onBeforeCompile = (s) => {
    s.uniforms.uGlow = uGlow;
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uGlow;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uGlow;');
  };
  m.customProgramCacheKey = () => `kit-glow-${m.vertexColors}`;
  m.userData.glow = uGlow;
  return m;
}
// instanced meshes colour per instance, not per vertex
export const rigMaterial = (glow) => { const m = kitMaterial(glow); m.vertexColors = false; return m; };

// [[geometry, colour], ...] -> one indexed geometry with a colour attribute (position, normal, color)
export function mergeColored(list) {
  const parts = list.map(([g, c]) => {
    if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    return [g, new THREE.Color(c)];
  });
  const nV = parts.reduce((s, [g]) => s + g.attributes.position.count, 0), nI = parts.reduce((s, [g]) => s + g.index.count, 0);
  const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3), idx = new Uint32Array(nI);
  let v = 0, i = 0;
  for (const [g, c] of parts) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, v * 3); nor.set(g.attributes.normal.array, v * 3);
    for (let k = 0; k < n; k++) { col[3 * (v + k)] = c.r; col[3 * (v + k) + 1] = c.g; col[3 * (v + k) + 2] = c.b; }
    const src = g.index.array; for (let k = 0; k < src.length; k++) idx[i + k] = src[k] + v;
    v += n; i += src.length; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3)); out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}
// one static prop: [[geometry, colour], ...] -> a mesh (1 draw call)
export const solidProp = (list, glow) => { const m = new THREE.Mesh(mergeColored(list), kitMaterial(glow)); m.frustumCulled = false; return m; };

// A bone rig. bones: [{ name, parent?, at? (0..1 along the parent, default its end), off? [x,y,z] (extra offset in the
// parent's space), rest? [rx,ry,rz], len, r (segment radius; 0 = no segment), r2? (radius at the far end), color,
// blob? { r, s: [sx,sy,sz], y? (0..1 along the bone), color? } (a round shape on the bone: a head, a palm), joint? (round
// caps at both ends, default true when it has a segment) }]. Every bone points along its own +y; animate bone(name).rotation
// (on top of its rest pose: x swings the tip towards +z, z swings it sideways). Call update() after posing.
export function createRig(bones, { glow = 0.3 } = {}) {
  const group = new THREE.Group(), skel = new THREE.Group(), byName = {};
  for (const b of bones) {
    const rest = new THREE.Group(), rot = new THREE.Group();
    rest.rotation.set(...(b.rest ?? [0, 0, 0])); rest.add(rot);
    const parent = b.parent ? byName[b.parent] : null;
    if (parent) rest.position.set(...(b.off ?? [0, 0, 0])).add(new THREE.Vector3(0, parent.len * (b.at ?? 1), 0));
    else rest.position.set(...(b.off ?? [0, 0, 0]));
    (parent ? parent.rot : skel).add(rest);
    byName[b.name] = { ...b, rest, rot };
  }
  const list = Object.values(byName), segs = list.filter((b) => b.r > 0);
  const caps = list.flatMap((b) => [...(b.r > 0 && b.joint !== false ? [{ b, y: 0, r: b.r }, { b, y: 1, r: b.r2 ?? b.r }] : []), ...(b.blob ? [{ b, y: b.blob.y ?? 0.5, r: b.blob.r, s: b.blob.s, color: b.blob.color }] : [])]);
  const segMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 14, 1, true).translate(0, 0.5, 0), rigMaterial(glow), Math.max(1, segs.length));
  const capMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 18, 12), rigMaterial(glow), Math.max(1, caps.length));
  segs.forEach((b, i) => segMesh.setColorAt(i, new THREE.Color(b.color)));
  caps.forEach((c, i) => capMesh.setColorAt(i, new THREE.Color(c.color ?? c.b.color)));
  segMesh.frustumCulled = capMesh.frustumCulled = false;
  group.add(skel, segMesh, capMesh);                          // skel holds no meshes of its own, only props attached to bones
  const m = new THREE.Matrix4(), local = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const hidden = new Set();
  const toRig = (b) => { m.identity(); for (let o = b.rot; o !== skel; o = o.parent) m.premultiply(o.matrix); return m; };   // a bone's frame in the rig's space (safe while the rig is scaled to 0)
  function update() {
    skel.updateMatrixWorld(true);
    segs.forEach((b, i) => {
      if (hidden.has(b.name)) return segMesh.setMatrixAt(i, hide);
      const r2 = b.r2 ?? b.r;   // a tapered bone is drawn at its mean radius (the caps show the taper)
      segMesh.setMatrixAt(i, toRig(b).multiply(local.makeScale((b.r + r2) / 2, b.len, (b.r + r2) / 2)));
    });
    caps.forEach((c, i) => {
      if (hidden.has(c.b.name)) return capMesh.setMatrixAt(i, hide);
      const [sx, sy, sz] = c.s ?? [1, 1, 1];
      local.compose(v.set(0, c.b.len * c.y, 0), q.identity(), s.set(c.r * sx, c.r * sy, c.r * sz));
      capMesh.setMatrixAt(i, toRig(c.b).multiply(local));
    });
    segMesh.instanceMatrix.needsUpdate = capMesh.instanceMatrix.needsUpdate = true;
  }
  // where a point on a bone is in the rig group's space (to attach a prop to a hand, or test a hit)
  const pointOn = (name, y = 1, out = new THREE.Vector3(), off = [0, 0, 0]) => { skel.updateMatrixWorld(true); const b = byName[name]; return out.set(off[0], b.len * y + off[1], off[2]).applyMatrix4(toRig(b)); };
  return {
    group, skel, update, pointOn, drawCalls: 2,
    bone: (name) => byName[name].rot,
    // hand a prop (an Object3D) to a bone: it is drawn with the rig and rides along with that bone (a hammer in a fist)
    attach(name, obj, y = 1) { const b = byName[name], a = new THREE.Group(); a.position.y = b.len * y; b.rot.add(a); a.add(obj); return a; },
    hide(name, on = true) { if (on) hidden.add(name); else hidden.delete(name); },
    reset() { for (const b of list) b.rot.rotation.set(0, 0, 0); },
    setColor(name, color) { const c = new THREE.Color(color); segs.forEach((b, i) => { if (b.name === name) segMesh.setColorAt(i, c); }); caps.forEach((x, i) => { if (x.b.name === name) capMesh.setColorAt(i, c); }); segMesh.instanceColor.needsUpdate = capMesh.instanceColor.needsUpdate = true; },
  };
}
