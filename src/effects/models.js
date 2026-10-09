// 3D models: glTF files from CC0 packs in assets/models/ (Kenney: kenney/<pack>/, each with its License.txt). A scene names the
// models it needs in the vignette catalog (`models`); the app loads them before it builds the card (loadModelsFor), so a
// scene clones them synchronously with createModel. Animations are sampled, not played: pose(clip, time) sets the pose at
// that time, so a scene stays a pure function of t.
import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from '../../vendor/three/addons/utils/SkeletonUtils.js';
import { mergeGeometries } from '../../vendor/three/addons/utils/BufferGeometryUtils.js';
import { appUrl } from '../core/urls.js';
import { MODELS as CFG } from '../config.js';
import { VIGNETTES } from './vignette-catalog.js';
import { parseSpec } from './catalog.js';
import { MODELS } from './model-list.js';

export { MODELS };

const loaded = new Map();               // name -> Promise<{ scene, animations, box }>
const ready = new Map();                // name -> { scene, animations, box } once loaded
let loader = null;

export function loadModel(name) {
  if (!MODELS[name]) return Promise.reject(new Error(`unknown model ${name}`));
  if (!loaded.has(name)) {
    loader ??= new GLTFLoader();
    loaded.set(name, loader.loadAsync(appUrl(`${CFG.root}${MODELS[name]}`)).then((g) => {
      mergeParts(g.scene); g.scene.updateMatrixWorld(true);
      const m = { scene: g.scene, animations: g.animations, box: new THREE.Box3().setFromObject(g.scene) };
      ready.set(name, m); return m;
    }).catch((e) => { loaded.delete(name); throw e; }));
  }
  return loaded.get(name);
}

// the models a recipe's scene needs (catalog `models`: a list, or a function of the scene's options)
export function modelsOf(effect) {
  const spec = effect && typeof effect === 'object' ? parseSpec('vignette', effect.vignette) : null, v = spec && VIGNETTES[spec.type];
  if (!v?.models) return [];
  return typeof v.models === 'function' ? v.models({ ...v.opts, ...spec }) : v.models;
}
export const loadModelsFor = (effect) => Promise.all(modelsOf(effect).map(loadModel));
export const hasModel = (name) => ready.has(name);

// A copy of a loaded model, `height` tall (or `width` wide), standing on y = 0, centred on x and z, facing +z (the viewer).
// tint: { materialName: colour } recolours a part. Returns { group, pose(clip, time, loop = true), node(name), materials, dc }. A model that is not loaded gives an empty
// group (the cost check then reports it).
export function createModel(name, { height = null, width = null, glow = CFG.glow, ownMaterials = false, tint = null } = {}) {
  const group = new THREE.Group(), m = ready.get(name);
  if (!m) return { group, pose() {}, node: () => null, materials: [], dc: 0 };
  const inner = m.animations.length || hasSkin(m.scene) ? cloneSkinned(m.scene) : m.scene.clone(true), size = m.box.getSize(new THREE.Vector3());
  const k = height ? height / size.y : width ? width / size.x : 1;
  inner.scale.multiplyScalar(k);
  inner.position.set(-(m.box.min.x + size.x / 2) * k, -m.box.min.y * k, -(m.box.min.z + size.z / 2) * k);
  group.add(inner);
  const materials = [];
  let dc = 0;
  inner.traverse((o) => {
    if (!o.isMesh) return;
    dc++; o.frustumCulled = false;
    o.material = kitLook(o.material, glow, ownMaterials || !!tint);
    if (tint?.[o.material.name] !== undefined) { o.material.color.setHex(tint[o.material.name]); if (!o.material.map) o.material.emissive.setHex(tint[o.material.name]); }
    materials.push(o.material);
  });
  const mixer = m.animations.length ? new THREE.AnimationMixer(inner) : null;
  const rest = [];                                     // every node's own transform, restored before each pose (pure of t)
  inner.traverse((o) => { if (o !== inner) rest.push([o, o.position.clone(), o.quaternion.clone(), o.scale.clone()]); });
  // The mixer skips writing a value it wrote last frame, so a scene's tweak of a node would stay: each pose first puts back
  // what the mixer wrote last time (post), then the rest pose of everything the clip does not drive.
  let cur = null, action = null, driven = new Set(), post = [];
  return {
    group, materials, dc,
    node: (n) => inner.getObjectByName(n),
    // the pose of animation `clip` at `time` seconds (looped, or held at its last frame); call it every frame before any
    // tweak of a node (node(name).rotation ...): it starts from the rest pose
    pose(clip, time, loop = true) {
      for (const [o, key, val] of post) o[key].copy(val);
      if (mixer && clip !== cur) {
        const c = THREE.AnimationClip.findByName(m.animations, clip);
        if (c) {
          mixer.stopAllAction(); action = mixer.clipAction(c); action.play(); cur = clip;
          driven = new Set(c.tracks.map((tr) => { const p = THREE.PropertyBinding.parseTrackName(tr.name); return `${p.nodeName}.${p.propertyName}`; }));
        }
      }
      for (const [o, p, q, s] of rest) {
        if (!driven.has(`${o.name}.position`)) o.position.copy(p);
        if (!driven.has(`${o.name}.quaternion`)) o.quaternion.copy(q);
        if (!driven.has(`${o.name}.scale`)) o.scale.copy(s);
      }
      if (!action) return;
      const d = action.getClip().duration;
      action.time = loop ? ((time % d) + d) % d : Math.min(Math.max(time, 0), d - 1e-4);
      mixer.update(0);
      post = rest.flatMap(([o]) => ['position', 'quaternion', 'scale'].filter((key) => driven.has(`${o.name}.${key}`)).map((key) => [o, key, o[key].clone()]));
    },
  };
}

// Models converted from FBX come as one mesh of many primitives (three: one mesh each; the fish has 95 for 3 materials).
// Siblings with the same material (and skeleton) become one mesh, so a model costs a draw call per material.
export function mergeParts(root) {
  const parents = new Set(); root.traverse((o) => { if (o.isMesh && o.parent) parents.add(o.parent); });
  for (const p of parents) {
    const sets = new Map();
    for (const o of p.children) if (o.isMesh && !o.children.length) { const k = `${o.material.uuid}:${o.isSkinnedMesh ? o.skeleton.uuid : '-'}:${o.matrix.elements.join()}`; sets.set(k, [...(sets.get(k) ?? []), o]); }
    for (const list of sets.values()) {
      if (list.length < 2) continue;
      const geo = mergeGeometries(list.map((o) => o.geometry)), a = list[0];
      if (!geo) continue;                                   // different attributes: leave them
      const m = a.isSkinnedMesh ? new THREE.SkinnedMesh(geo, a.material) : new THREE.Mesh(geo, a.material);
      m.name = a.name; m.position.copy(a.position); m.quaternion.copy(a.quaternion); m.scale.copy(a.scale);
      if (a.isSkinnedMesh) m.bind(a.skeleton, a.bindMatrix);
      list.forEach((o) => p.remove(o)); p.add(m);
    }
  }
}

function hasSkin(o) { let s = false; o.traverse((x) => { if (x.isSkinnedMesh) s = true; }); return s; }

// glTF materials lit like the kit's props: a little self-light from the texture so they read on dark skies
const looks = new Map();
function kitLook(mat, glow, own) {
  const key = `${mat.uuid}:${glow}`;
  if (!own && looks.has(key)) return looks.get(key);
  const m = mat.clone();
  m.emissive = new THREE.Color(m.map ? 0xffffff : m.color);
  if (m.map) m.emissiveMap = m.map;
  m.emissiveIntensity = glow; m.roughness = Math.max(m.roughness, 0.6); m.metalness = Math.min(m.metalness, 0.1);
  if (m.vertexColors) {                                  // coloured per vertex (Everything Library): the glow takes that colour
    m.emissive.setHex(0); const k = { value: glow };
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uVGlow = k;
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uVGlow;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uVGlow;');
    };
    m.customProgramCacheKey = () => 'model-vglow';
  }
  if (!own) looks.set(key, m);
  return m;
}
