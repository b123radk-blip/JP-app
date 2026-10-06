// Builds every emblem, scene prop, reveal and particle layer once in the browser (on 大 through ?preview=1) and compares
// what was built with the catalog's declared cost. npm run e2e does the same for deck cards; this covers pieces no card uses yet.
// Usage: npm run serve (other shell), then node scripts/check-piece-costs.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { PIECES, normalizeRecipe, estimateCost } from '../src/effects/catalog.js';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const BASE = process.env.BASE || 'http://localhost:8080/', ID = '5927', data = JSON.parse(readFileSync(`data/kanji-${ID}.json`, 'utf8'));
const base = { material: 'chalk', backdrop: 'plain' };
const recipes = [
  ...Object.keys(PIECES.emblem).map((e) => ({ ...base, emblem: e })),
  { ...base, emblem: 'flag:finish' }, { ...base, emblem: 'flag:japan' },
  ...Object.keys(PIECES.scene).filter((s) => s !== 'tree').map((s) => ({ ...base, scene: [s] })),
  ...['classroom', 'kitchen', 'shop', 'station'].map((k) => ({ ...base, scene: [`room:${k}`] })),
  ...Object.keys(PIECES.reveal).map((r) => ({ ...base, reveal: r })),
  ...Object.entries(PIECES.particles).map(([p]) => ({ ...base, particles: [p] })),
];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const page = await browser.newPage(), errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let bad = 0;
for (const r of recipes) {
  await page.goto(`${BASE}?preview=1&cards=${ID}&card=${ID}&t=0&recipe=${encodeURIComponent(JSON.stringify(r))}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__app?.ready && window.__app.info().player?.effect);
  const built = await page.evaluate(() => window.__app.info().player.effect), est = estimateCost(normalizeRecipe(r), data.strokes.length, data.components);
  const ok = built.drawCalls === est.drawCalls && built.particles === est.particles && built.pointLights === est.pointLights;
  if (!ok) { bad++; console.log(`MISMATCH ${JSON.stringify(r)}: built ${JSON.stringify(built)} declared ${JSON.stringify(est)}`); }
}
console.log(`${recipes.length} recipes, ${bad} cost mismatches${errors.length ? `, page errors:\n${[...new Set(errors)].join('\n')}` : ''}`);
await browser.close();
process.exit(bad || errors.length ? 1 : 0);
