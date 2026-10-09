// Take single models out of a big library file (one .glb holding many, like the Everything Library's animals after
// scripts/fbx-to-glb.mjs): each named node and its children becomes its own small .glb, its meshes joined, quantized.
// Materials get a white base colour (the FBX export leaves placeholder colours; the colour is in the vertex colours).
// Usage: node scripts/split-library.mjs <library.glb> <out dir> Name[=file] Name[=file] ...
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, quantize, flatten, join } from '@gltf-transform/functions';
import { statSync, mkdirSync } from 'node:fs';

const [src, outDir, ...names] = process.argv.slice(2);
if (!src || !outDir || !names.length) { console.error('usage: node scripts/split-library.mjs <library.glb> <out dir> Name[=file] ...'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
for (const arg of names) {
  const [name, file = name] = arg.split('=');
  const doc = await io.read(src), root = doc.getRoot(), scene = root.listScenes()[0];
  const node = root.listNodes().find((n) => n.getName() === name);
  if (!node) { console.log(`${name}: not in ${src}`); continue; }
  const keep = doc.createNode(name); keep.addChild(node);
  for (const c of scene.listChildren()) scene.removeChild(c);
  scene.addChild(keep);
  for (const a of root.listAnimations()) a.dispose();
  await doc.transform(prune(), dedup(), flatten(), join(), prune());
  for (const m of root.listMaterials()) if (root.listMeshes().some((me) => me.listPrimitives().some((p) => p.getMaterial() === m && p.getAttribute('COLOR_0')))) m.setBaseColorFactor([1, 1, 1, 1]);
  await doc.transform(quantize());
  const out = `${outDir}/${file}.glb`;
  await io.write(out, doc);
  console.log(`${out}: ${(statSync(out).size / 1024).toFixed(0)} KB, ${root.listMeshes().reduce((s, m) => s + m.listPrimitives().length, 0)} part(s)`);
}
