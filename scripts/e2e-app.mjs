// End-to-end check of the app in headless Chromium (software WebGL): real mouse clicks on the 3D buttons, a multi-day scenario
// with the fake clock, a mocked XR `select` aimed at a button, and screenshots into docs/screenshots/app-*.png.
// Usage: npm run serve (other shell), then npm run e2e. Exit code 1 if any check fails. It cannot test a real headset.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire('/opt/node22/lib/node_modules/_')('playwright');

const BASE = process.env.BASE || 'http://localhost:8080/', OUT = process.env.OUT || 'docs/screenshots';
mkdirSync(OUT, { recursive: true });
const failures = [], errors = [];
const check = (cond, msg) => { if (!cond) failures.push(msg); console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); };
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--disable-background-networking', '--disable-component-update', '--no-first-run', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
});

async function open(query = '?debug=1&today=2026-10-06', { mockXR = false, size = { width: 1100, height: 760 } } = {}) {
  const ctx = await browser.newContext({ viewport: size });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  if (mockXR) await page.addInitScript(() => Object.defineProperty(navigator, 'xr', { value: { isSessionSupported: async () => true, requestSession: async (m) => { throw new Error('mock refusal for ' + m); } } }));
  await page.goto(BASE + query, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__app?.ready === true, null, { timeout: 20000 });
  await page.waitForTimeout(300);
  return page;
}
const info = (page) => page.evaluate(() => window.__app.info());
const shot = (page, name) => page.screenshot({ path: `${OUT}/app-${name}.png` });
async function click(page, id) {                      // a REAL mouse click at the button's projected screen position (exercises the raycast)
  await page.waitForFunction((i) => window.__app.ids().includes(i), id, { timeout: 8000 });
  const p = await page.evaluate((i) => window.__app.screenPos(i), id);
  await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(250);
}
const waitCard = (page, id) => page.waitForFunction((cid) => window.__app.info().player?.id === cid, id, { timeout: 15000 }).catch(async (e) => {
  const i = await info(page); console.log(`waiting for card ${id} failed; state:`, JSON.stringify({ screen: i.screen, player: i.player && { id: i.player.id, active: i.player.active, revealed: i.player.revealed }, ids: i.ids }));
  await page.screenshot({ path: '/tmp/claude-0/e2e-fail.png' }); throw e;
});
const seekEnd = async (page) => { const t = (await info(page)).player.times.rating + 0.6; await page.evaluate((x) => window.__app.seek(x), t); await page.waitForTimeout(250); };
const setDay = (page, n) => page.evaluate((k) => { window.__app.app.clock.addDays(k); window.__app.app.show('home'); }, n);
const close = (page, y) => page.evaluate((cy) => { const { kit } = window.__app.app; kit.camera.position.set(0, 1.4 + cy, -0.62); kit.controls.target.set(0, 1.4 + cy, -1.2); kit.controls.update(); }, y);

// ---------- 1. day 1: deck tile -> study -> three new cards (日 sun, 火 fire, 水 default) ----------
let page = await open();
let st = await info(page);
check(st.screen === 'home' && st.ids.join() === 'deck-n5', 'home shows one pressable deck tile (N4-N1 are "coming soon" and not pressable)');
await shot(page, '1-home');
await click(page, 'deck-n5');
await waitCard(page, '65e5'); st = await info(page);
check(st.screen === 'study' && st.player.active, 'clicking the N5 tile starts a session on card 日 with its animation active');
check(st.player.effectId === 'sun' && !st.ids.includes('rate-good'), '日 uses the sun effect; rating buttons are hidden while the animation plays');
await page.evaluate(() => window.__app.seek(3.2)); await page.waitForTimeout(250); await shot(page, '2-sun-mid-strokes');
await seekEnd(page); st = await info(page);
check(st.ids.includes('rate-good') && !st.ids.includes('skip'), 'after the sentence, rating buttons appear and Skip disappears');
check(await page.evaluate(() => { const g = window.__app.app.screen.player.group; const f = (n) => { let o; g.traverse((x) => { if (x.name === n) o = x; }); return o; }; return !f('show-answer').visible && !f('skip').visible; }), 'hidden buttons (Show answer, Skip) are not drawn at all on an active card');
await shot(page, '3-sun-rating');
await click(page, 'rate-good');
await waitCard(page, '706b'); st = await info(page);
check(st.player.effectId === 'fire' && st.player.active, 'next card is 火 with the fire effect');
await page.evaluate(() => window.__app.seek(2.6)); await page.waitForTimeout(250); await shot(page, '4-fire-mid-strokes');
await seekEnd(page); await shot(page, '5-fire-rating'); await close(page, -0.2); await page.waitForTimeout(300); await shot(page, '6-sentence-closeup');
await page.evaluate(() => { const { kit } = window.__app.app; kit.camera.position.set(0, 1.45, 0.25); kit.controls.target.set(0, 1.4, -1.2); kit.controls.update(); });
await page.waitForTimeout(200);
await click(page, 'rate-good');
await waitCard(page, '6c34'); st = await info(page);
check(st.player.effectId === 'default' && st.player.active, 'third card 水 has no effect of its own and gets the default effect');
await seekEnd(page); await shot(page, '7-default-rating');
await click(page, 'rate-good');
await page.waitForFunction(() => window.__app.info().screen === 'done'); await page.waitForTimeout(300);
await shot(page, '8-done');
st = await info(page);
check(Object.keys(st.cards).length === 3 && Object.values(st.cards).every((c) => c.reps === 1 && c.interval === 1), 'three cards saved with one Good each (interval 1 day)');

// ---------- 2. progress survives a reload (localStorage) ----------
await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => window.__app?.ready === true);
st = await info(page); check(Object.keys(st.cards).length === 3, 'progress is still there after reloading the page');

// ---------- 3. day 2 and 3: the 2-days retirement rule through the real UI ----------
await click(page, 'home').catch(() => {});
await page.evaluate(() => window.__app.app.show('home'));
await shot(page, '9-home-nothing-due');
await click(page, 'deck-n5'); await page.waitForFunction(() => window.__app.info().screen === 'done'); st = await info(page);
check(st.screen === 'done', 'same day: nothing due, so the deck opens the "all caught up" screen');
await shot(page, '10-all-caught-up');
check(st.ids.includes('study-ahead'), '...with a "Study ahead" option');
await setDay(page, 1);
await click(page, 'deck-n5'); await waitCard(page, '65e5'); st = await info(page);
check(st.player.active, 'day 2: after only ONE good day, 日 still shows its animation');
for (const id of ['65e5', '706b', '6c34']) { await waitCard(page, id); await seekEnd(page); await click(page, 'rate-good'); }
await page.waitForFunction(() => window.__app.info().screen === 'done');
await setDay(page, 3);                                       // interval is now 3 days
await click(page, 'deck-n5'); await waitCard(page, '65e5'); st = await info(page);
check(!st.player.active && !st.player.hasEffect, 'day 5: Good on 2 different days -> 日 is retired: no animation, plain kanji');
check(st.ids.includes('show-answer') && !st.ids.includes('rate-good'), 'retired card asks "Show answer" first; no rating buttons yet');
await shot(page, '11-retired-front');
await click(page, 'show-answer'); await page.evaluate(() => window.__app.seek(1.5)); await page.waitForTimeout(300);
st = await info(page); check(st.ids.includes('rate-hard'), 'after Show answer the rating buttons appear');
await shot(page, '12-retired-answer');
await click(page, 'rate-hard');                              // a lapse: the animation must come back
await waitCard(page, '706b'); await page.evaluate(() => window.__app.app.show('home'));
await setDay(page, 4);
await click(page, 'deck-n5'); await page.waitForFunction(() => window.__app.info().player);
st = await info(page); check(st.player.id === '706b', 'overdue cards (火, 水) come before 日, which is due later after Hard');
await page.evaluate(() => window.__app.app.screen.jump('65e5')); await waitCard(page, '65e5'); st = await info(page);   // the debug panel's jump
check(st.player.active && st.player.hasEffect, '日 rated Hard -> its animation is back');
await shot(page, '13-animation-back');
await page.evaluate(() => window.__app.app.debug.forceAnimation = 'off'); 
await close(page, 0); await page.close();

// ---------- 4. mocked XR: buttons, error path, and a `select` ray aimed at a button ----------
page = await open('?debug=1', { mockXR: true });
const labels = await page.locator('#buttons button').allInnerTexts();
check(labels.includes('Enter VR') && labels.includes('Enter AR'), `Enter VR / Enter AR buttons appear when the browser reports support (${labels.join(', ')})`);
await page.locator('#buttons button', { hasText: 'Enter VR' }).click(); await page.waitForTimeout(200);
check((await page.locator('#status').innerText()).includes('mock refusal'), 'a refused XR session shows its error on the 2D page');
const hit = await page.evaluate(async () => {
  const THREE = await import('/vendor/three/three.module.js');
  const { app } = window.__app, { kit, input } = app;
  kit.scene.updateMatrixWorld(true);
  const target = (id) => input.byId(id).getWorldPosition(new THREE.Vector3());
  // an XR-style select event whose controller sits at the origin and points at `to`
  const fire = (to) => {
    const origin = new THREE.Vector3(0, 1.3, 0), dir = to.clone().sub(origin).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
    const frame = { getPose: () => ({ transform: { position: { x: origin.x, y: origin.y, z: origin.z }, orientation: { x: q.x, y: q.y, z: q.z, w: q.w } } }) };
    return input.handleXRSelect({ inputSource: { targetRaySpace: {} }, frame }, {});
  };
  const out = { onTile: fire(target('deck-n5')), screenAfter: app.screen.name };
  app.show('home'); kit.scene.updateMatrixWorld(true);
  out.atEmptySpace = fire(new THREE.Vector3(2.5, 3, -1.2)); out.screenAfterEmpty = app.screen.name;
  out.noPose = input.handleXRSelect({ inputSource: { targetRaySpace: {} }, frame: { getPose: () => null } }, {});
  return out;
});
check(hit.onTile && hit.screenAfter === 'study', 'an XR select ray aimed at the N5 tile presses it (pose -> ray -> hit -> handler)');
check(!hit.atEmptySpace && hit.screenAfterEmpty === 'home' && !hit.noPose, 'a select ray at empty space (or with no pose) does nothing');
await page.close();

check(errors.length === 0, errors.length ? `console errors/warnings:\n  ${errors.join('\n  ')}` : 'no console errors or warnings');
await browser.close();
console.log(failures.length ? `\n${failures.length} check(s) FAILED` : '\nall checks passed');
process.exit(failures.length ? 1 : 0);
