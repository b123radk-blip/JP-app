// Renders the page in headless Chromium (software WebGL) at fixed points of the timeline.
// Usage: npm run serve  (in another shell), then: npm run screenshots
// Other page / times: PAGE=fire.html PREFIX=fire- TIMES=0.8,1.6,3,6 npm run screenshots
// Needs Playwright (global or local) and a Chromium binary (PLAYWRIGHT_BROWSERS_PATH or /opt/pw-browsers/chromium).
import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/_');
let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch { ({ chromium } = require('playwright')); }

const URL = process.env.URL || 'http://localhost:8080/' + (process.env.PAGE || '');
const PREFIX = process.env.PREFIX || '';
const OUT = process.env.OUT || 'docs/screenshots';
const TIMES = process.env.TIMES
  ? process.env.TIMES.split(',').map((t) => [`t${t}`, parseFloat(t)])
  : [['0-before-dawn', 0.0], ['1-mid-dawn', 1.0], ['2-dawn-done', 2.0], ['3-mid-strokes', 3.4], ['4-all-strokes', 5.0], ['5-idle', 7.0]];

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking', '--disable-component-update', '--no-first-run', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
const errors = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.goto(URL + '?t=0', { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });
for (const [name, t] of TIMES) {
  await page.evaluate((x) => window.__setTime(x), t);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${PREFIX}${name}.png` });
  console.log('shot', name, t);
}
console.log('status line:', await page.locator('#status').innerText());
console.log(errors.length ? 'CONSOLE ISSUES:\n' + errors.join('\n') : 'no console errors or warnings');
await browser.close();
