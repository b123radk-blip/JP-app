import { launch, serve } from './scripts/lib/browser.mjs';
const { base: BASE, server } = await serve(), browser = await launch();
const page = await browser.newPage({ viewport: { width: 900, height: 720 } });
await page.goto(`${BASE}?preview=1&cards=524d&card=524d&t=0`);
await page.waitForFunction(() => window.__app?.ready === true, { timeout: 90000 });
const r = await page.evaluate(() => {
  const scene = window.__app.app.kit.scene;
  function bounds(obj) {
    let min = [1e9,1e9,1e9], max = [-1e9,-1e9,-1e9];
    obj.updateWorldMatrix(true, true);
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry;
      if (!g.boundingSphere) g.computeBoundingSphere();
      const c = g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);
      const r = g.boundingSphere.radius;
      for (const [i,ax] of ['x','y','z'].entries()) { min[i] = Math.min(min[i], c[ax]-r); max[i] = Math.max(max[i], c[ax]+r); }
    });
    return { min, max };
  }
  const out = {};
  for (const name of ['rowboat','paddle']) {
    const g = scene.getObjectByName(name);
    if (!g) { out[name] = 'missing'; continue; }
    const b = bounds(g);
    out[name] = { w:(b.max[0]-b.min[0]).toFixed(3), h:(b.max[1]-b.min[1]).toFixed(3), d:(b.max[2]-b.min[2]).toFixed(3),
      minX:b.min[0].toFixed(3),maxX:b.max[0].toFixed(3),minY:b.min[1].toFixed(3),maxY:b.max[1].toFixed(3),minZ:b.min[2].toFixed(3),maxZ:b.max[2].toFixed(3) };
  }
  const boat = scene.getObjectByName('rowboat');
  const grp = boat?.parent;
  out.boatGroupScale = grp ? grp.scale.x.toFixed(4) : null;
  const cam = window.__app.app.kit.camera;
  out.seat = { pos: cam.position.toArray().map(v=>v.toFixed(3)), target: window.__app.app.kit.controls.target.toArray().map(v=>v.toFixed(3)) };
  return out;
});
console.log(JSON.stringify(r, null, 2));
await browser.close(); server?.close();
