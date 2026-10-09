// Slim a downloaded glTF model for the app: keep only the animation clips a scene uses, drop what nothing references,
// merge duplicates, thin out keyframes, store vertices as small integers, and write one binary .glb (about a third of
// an embedded base64 .gltf).
// FBX: convert to .glb first (three's FBXLoader + GLTFExporter in the browser), then run this.
// Usage: node scripts/prep-model.mjs <in.gltf|glb> <out.glb> [--keep Idle,Walk,SitDown]   (no --keep: keep every clip)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, quantize } from '@gltf-transform/functions';
import { statSync } from 'node:fs';

const [src, out] = process.argv.slice(2), i = process.argv.indexOf('--keep');
if (!src || !out) { console.error('usage: node scripts/prep-model.mjs <in> <out.glb> [--keep A,B]'); process.exit(1); }
const keep = i > 0 ? new Set(process.argv[i + 1].split(',')) : null;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS), doc = await io.read(src), root = doc.getRoot();
for (const a of root.listAnimations()) a.setName(a.getName().replace(/^.*\|/, '').replace(/\.\d+$/, ''));   // FBX exports: "Armature|Swim.001" -> "Swim"
if (keep) {
  const names = root.listAnimations().map((a) => a.getName()), missing = [...keep].filter((k) => !names.includes(k));
  if (missing.length) { console.error(`${src}: no clip ${missing.join(', ')} (has ${names.join(', ')})`); process.exit(1); }
  for (const a of root.listAnimations()) if (!keep.has(a.getName())) a.dispose();
}
await doc.transform(dedup(), resample(), prune(), quantize());              // KHR_mesh_quantization: three.js reads it natively
await io.write(out, doc);
console.log(`${out}: ${(statSync(src).size / 1024).toFixed(0)} KB -> ${(statSync(out).size / 1024).toFixed(0)} KB, clips ${root.listAnimations().map((a) => a.getName()).join(', ')}`);
