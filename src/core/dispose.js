// Free GPU resources of everything under an object (geometries, materials, textures).
export function disposeObject(root) {
  root.traverse((o) => {
    o.geometry?.dispose();
    for (const m of [].concat(o.material || [])) {
      for (const v of Object.values(m)) if (v && v.isTexture) v.dispose();
      m.dispose();
    }
  });
  root.removeFromParent();
}
