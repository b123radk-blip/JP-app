import { launch, serve } from './scripts/lib/browser.mjs';
const { base: BASE, server } = await serve(), browser = await launch();
const page = await browser.newPage({ viewport: { width: 900, height: 720 } });
await page.goto(`${BASE}?preview=1&cards=w1444610&card=w1444610&t=0.5`);
await page.waitForFunction(() => window.__app?.ready === true, { timeout: 90000 });
const r = await page.evaluate(() => {
  const scene = window.__app.app.kit.scene;
  const cam = window.__app.app.kit.camera;
  const V3 = cam.position.constructor;
  cam.updateMatrixWorld(true);
  function ndc(x,y,z){ const p=new V3(x,y,z).applyMatrix4(cam.matrixWorldInverse).applyMatrix4(cam.projectionMatrix); if(p.w<=0)return null; const nx=p.x/p.w,ny=p.y/p.w; return { nx:nx.toFixed(2), ny:ny.toFixed(2), in: Math.abs(nx)<=1&&Math.abs(ny)<=1 }; }
  const out={};
  out.cam = { pos:cam.position.toArray().map(v=>v.toFixed(3)), target:window.__app.app.kit.controls.target.toArray().map(v=>v.toFixed(3)), fov:cam.fov, aspect:cam.aspect };
  // word box: the vignette stage box is not exposed; find the glyph/text mesh
  // Instead: list all named objects
  const names=[]; scene.traverse(o=>{ if(o.name) names.push(o.name+':'+o.type); });
  out.names = names.slice(0,60);
  // probe a grid in world space around the origin to map the visible region
  const grid=[];
  for(let z=-2;z<=1.5;z+=0.5){ for(let x=-1.5;x<=3;x+=0.5){ const n=ndc(x,0.6,z); if(n) grid.push(`${x.toFixed(1)},${z.toFixed(1)}:${n.in?'+':'-'}`); } }
  out.grid = grid.join(' ');
  return out;
});
console.log(JSON.stringify(r,null,2));
await browser.close(); server?.close();
