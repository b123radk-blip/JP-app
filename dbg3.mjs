import { launch, serve } from './scripts/lib/browser.mjs';
const { base: BASE, server } = await serve(), browser = await launch();
const page = await browser.newPage({ viewport: { width: 900, height: 720 } });
await page.goto(`${BASE}?preview=1&cards=w1444610&card=w1444610&t=0.5`);
await page.waitForFunction(() => window.__app?.ready === true, { timeout: 90000 });
await page.waitForFunction(() => {
  try { return window.__app.app.kit.scene.getObjectByName('vignette') != null; } catch(e){ return false; }
}, { timeout: 30000 }).catch(()=>{});
const r = await page.evaluate(async () => {
  const THREE = await import('three');
  const app = window.__app, { kit } = app.app, V = () => new THREE.Vector3();
  app.seek(0.5); kit.scene.updateMatrixWorld(true);
  const cam = kit.camera; cam.updateMatrixWorld(true);
  cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
  const holder = kit.scene.getObjectByName('vignette');
  if (!holder) return { err: 'no vignette', names: (function(){const n=[];kit.scene.traverse(o=>{if(o.name)n.push(o.name)});return n;})() };
  const info = holder.userData.inspect, k = holder.getWorldScale(V()).y, u = info.u * k;
  const origin = holder.parent.localToWorld(new THREE.Vector3(info.right, info.floor, 0));
  const U = (v) => Math.round(v/u*100)/100;
  const ndc = new THREE.Vector3();
  const frame = (wp) => { ndc.copy(wp).project(cam); return Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z<1; };
  const out = { camPos: cam.position.toArray().map(v=>+v.toFixed(3)), origin: origin.toArray().map(v=>+v.toFixed(3)), u: +u.toFixed(4) };
  const W = (sx,sy,sz) => new THREE.Vector3(origin.x + sx*u, origin.y + sy*u, origin.z + sz*u);
  out.probes = [];
  for (const sz of [-1,0,0.5,1,1.5]) for (const sx of [0,0.5,1,1.5,2,2.5,3]) {
    const wp = W(sx, 0.6, sz);
    out.probes.push(`${sx},${sz}:${frame(wp)?'+':'-'}${(ndc.x.toFixed(1),ndc.y.toFixed(1))}`);
  }
  const objs = {};
  for (const name of ['left bank','right bank','river','rowboat']) {
    const o = kit.scene.getObjectByName(name);
    if (!o){ objs[name]='missing'; continue; }
    o.updateWorldMatrix(true,true);
    const b = new THREE.Box3().setFromObject(o);
    const c = b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3());
    objs[name] = { scene: [U(c.x-origin.x),U(c.y-origin.y),U(c.z-origin.z)], size:[U(s.x),U(s.y),U(s.z)] };
  }
  out.objs = objs;
  return out;
});
console.log(JSON.stringify(r,null,2));
await browser.close(); server?.close();
