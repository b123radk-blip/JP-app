// End-to-end check of the app in headless Chromium (software WebGL): real mouse clicks on the 3D buttons, a multi-day scenario
// with the fake clock, a mocked XR `select` aimed at a button, and screenshots into docs/screenshots/app-*.png.
// Usage: npm run serve (other shell), then npm run e2e. Exit code 1 if any check fails. It cannot test a real headset.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { EFFECTS } from '../src/config.js';
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

const deckIds = JSON.parse(readFileSync('content/decks/n5.json', 'utf8')).cards;
const budget = (st) => st && Object.keys(EFFECTS.budget).every((k) => st[k] <= EFFECTS.budget[k]);
// rate every card of the current session Good until the session ends; returns the card ids seen, in order
async function rateAll(page, onCard = async () => {}) {
  const seen = [];
  for (;;) {
    await page.waitForFunction((prev) => { const i = window.__app.info(); return i.screen === 'done' || (i.player && i.player.id !== prev); }, seen.at(-1) ?? null, { timeout: 15000 });
    const i = await info(page);
    if (i.screen === 'done') return seen;
    seen.push(i.player.id); await onCard(i);
    await seekEnd(page); await click(page, 'rate-good');
  }
}

// ---------- 1. day 1: deck tile -> study -> the 10 new cards of the day, each with its recipe animation ----------
let page = await open();
let st = await info(page);
check(st.screen === 'home' && st.ids.join() === 'deck-n5', 'home shows one pressable deck tile (N4-N1 are "coming soon" and not pressable)');
check(!(await page.locator('#buttons button').allInnerTexts()).some((b) => b.startsWith('Sound')) && !(await page.locator('#footer').innerText()).includes('Voice'), 'no voice clips yet: no Sound button and no voice credit');
await shot(page, '1-home');
await click(page, 'deck-n5');
await waitCard(page, '65e5'); st = await info(page);
check(st.screen === 'study' && st.player.active, 'clicking the N5 tile starts a session on card 日 with its animation active');
check(st.player.effectId === 'recipe' && !st.ids.includes('rate-good'), '日 is built from a recipe; rating buttons are hidden while the animation plays');
await page.evaluate(() => window.__app.seek(3.2)); await page.waitForTimeout(250); await shot(page, '2-sun-mid-strokes');
await seekEnd(page); st = await info(page);
check(st.ids.includes('rate-good') && !st.ids.includes('skip'), 'after the sentence, rating buttons appear and Skip disappears');
check(await page.evaluate(() => { const g = window.__app.app.screen.player.group; const f = (n) => { let o; g.traverse((x) => { if (x.name === n) o = x; }); return o; }; return !f('show-answer').visible && !f('skip').visible; }), 'hidden buttons (Show answer, Skip) are not drawn at all on an active card');
await shot(page, '3-sun-rating');
await click(page, 'rate-good');
await waitCard(page, '706b'); st = await info(page);
check(st.player.effectId === 'recipe' && st.player.active && st.player.effect.particles > 0, 'next card is 火, a recipe with particles');
await page.evaluate(() => window.__app.seek(2.6)); await page.waitForTimeout(250); await shot(page, '4-fire-mid-strokes');
await seekEnd(page); await shot(page, '5-fire-rating'); await close(page, -0.2); await page.waitForTimeout(300); await shot(page, '6-sentence-closeup');
await page.evaluate(() => { const { kit } = window.__app.app; kit.camera.position.set(0, 1.45, 0.25); kit.controls.target.set(0, 1.4, -1.2); kit.controls.update(); });
await page.waitForTimeout(200);
await click(page, 'rate-good');
const overBudget = [];
const day1 = ['65e5', '706b', ...await rateAll(page, async (i) => {
  if (!budget(i.player.effect)) overBudget.push(i.player.id);
  if (i.player.id === '6c34') { await seekEnd(page); await shot(page, '7-water-rating'); }
})];
check(day1.join() === deckIds.slice(0, 10).join(), `day 1 shows the first 10 cards of the deck in order (new-card limit): ${day1.length}`);
check(!overBudget.length, `every effect stays within the performance budget ${overBudget.join(' ')}`);
await page.waitForTimeout(300); await shot(page, '8-done');
st = await info(page);
check(Object.keys(st.cards).length === 10 && Object.values(st.cards).every((c) => c.reps === 1 && c.interval === 1), 'ten cards saved with one Good each (interval 1 day)');

// ---------- 2. progress survives a reload (localStorage) ----------
await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => window.__app?.ready === true);
st = await info(page); check(Object.keys(st.cards).length === 10, 'progress is still there after reloading the page');

// ---------- 3. day 2 and 5: the 2-days retirement rule through the real UI ----------
await page.evaluate(() => window.__app.app.show('home'));
await shot(page, '9-home-nothing-due');
await click(page, 'deck-n5'); await page.waitForFunction(() => window.__app.info().screen === 'done'); st = await info(page);
check(st.screen === 'done', 'same day: nothing due, so the deck opens the "all caught up" screen');
await shot(page, '10-all-caught-up');
check(st.ids.includes('study-ahead'), '...with a "Study ahead" option');
await setDay(page, 1);
await click(page, 'deck-n5'); await waitCard(page, '65e5'); st = await info(page);
check(st.player.active, 'day 2: after only ONE good day, 日 still shows its animation');
const wordsSeen = [];
const day2 = ['65e5', ...await (async () => { await seekEnd(page); await click(page, 'rate-good'); return rateAll(page, async (i) => { if (i.player.type === 'word') { wordsSeen.push(i.player.id); if (!budget(i.player.effect)) overBudget.push(i.player.id); } }); })()];
check(day2.length === 20 && day2.slice(10).join() === deckIds.slice(10, 20).join(), `day 2: the 10 due cards, then 10 new ones in deck order (${day2.length})`);
check(wordsSeen.length >= 3, `day 2 brings the first word cards, each drawn from its kanji (${wordsSeen.join(' ')})`);
const deckJson = JSON.parse(readFileSync('content/decks/n5.json', 'utf8'));
check(day2.filter((id) => deckJson.requires[id]).every((id) => deckJson.requires[id].every((k) => day2.indexOf(k) < day2.indexOf(id) || day1.includes(k))), 'every word came after the kanji it needs');
await setDay(page, 3);                                       // the first ten are now due after a 3-day interval
await click(page, 'deck-n5'); await page.waitForFunction(() => window.__app.info().player);
await page.evaluate(() => window.__app.app.screen.jump('65e5')); await waitCard(page, '65e5'); st = await info(page);   // the debug panel's jump
check(!st.player.active && !st.player.hasEffect, 'day 5: Good on 2 different days -> 日 is retired: no animation, plain kanji');
check(st.ids.includes('show-answer') && !st.ids.includes('rate-good'), 'retired card asks "Show answer" first; no rating buttons yet');
await shot(page, '11-retired-front');
await click(page, 'show-answer'); await page.evaluate(() => window.__app.seek(1.5)); await page.waitForTimeout(300);
st = await info(page); check(st.ids.includes('rate-hard'), 'after Show answer the rating buttons appear');
await shot(page, '12-retired-answer');
await click(page, 'rate-hard');                              // a lapse: the animation must come back
await page.waitForFunction(() => window.__app.info().player?.id !== '65e5' || window.__app.info().screen === 'done');
await page.evaluate(() => window.__app.app.show('home'));
await setDay(page, 1);
await click(page, 'deck-n5'); await page.waitForFunction(() => window.__app.info().player);
await page.evaluate(() => window.__app.app.screen.jump('65e5')); await waitCard(page, '65e5'); st = await info(page);
check(st.player.active && st.player.hasEffect, '日 rated Hard -> its animation is back');
await shot(page, '13-animation-back');
await page.evaluate(() => window.__app.app.debug.forceAnimation = 'off');
await close(page, 0); await page.close();

// ---------- 4. preview page: every card on its own, Prev / Next, built cost = catalog estimate, URL recipes ----------
page = await open('?preview=1&deck=n5');
st = await info(page);
check(st.screen === 'preview' && st.player.id === deckIds[0], 'the preview page opens on the first card of the deck');
await click(page, 'preview-next'); await page.waitForFunction((i) => window.__app.info().player?.id === i, deckIds[1]);
await click(page, 'preview-prev'); await page.waitForFunction((i) => window.__app.info().player?.id === i, deckIds[0]);
check(true, 'Next / Prev buttons flip through the cards');
const costs = await page.evaluate(async (ids) => {
  const { normalizeRecipe, estimateCost } = await import('/src/effects/catalog.js');
  const { COMPONENT_LOOKS } = await import('/src/config.js');
  const get = async (p) => (await fetch(p)).json(), hex = (ch) => ch.codePointAt(0).toString(16), out = [];
  for (const id of ids) {
    window.__app.app.screen.jump(id);
    for (let k = 0; k < 100 && window.__app.info().player?.id !== id; k++) await new Promise((r) => setTimeout(r, 50));
    const card = await get(`/content/cards/${id}.json`), r = normalizeRecipe(card.effect, COMPONENT_LOOKS);
    let est;
    if (card.type === 'word') {                         // each taught kanji with its own card's recipe, kana plain (src/effects/plan.js)
      const glyphs = await Promise.all([...card.word].map(async (ch) => { const d = await get(`/data/kanji-${hex(ch)}.json`), taught = card.kanji.includes(hex(ch));
        return { strokes: d.strokes.length, components: d.components, recipe: taught ? normalizeRecipe((await get(`/content/cards/${hex(ch)}.json`)).effect, COMPONENT_LOOKS) : null }; }));
      est = estimateCost(r, 0, [], glyphs);
    } else { const s = await get(`/data/kanji-${id}.json`); est = estimateCost(r, s.strokes.length, s.components); }
    out.push({ id, est, built: window.__app.info().player.effect });
  }
  return out;
}, deckIds);
const off = costs.filter((c) => c.est.drawCalls !== c.built.drawCalls || c.est.particles !== c.built.particles || c.est.pointLights !== c.built.pointLights);
check(!off.length, `built draw calls / particle slots / lights equal the catalog estimate for all ${costs.length} cards ${JSON.stringify(off)}`);
await page.evaluate(() => window.__app.app.screen.jump('706b')); await page.waitForFunction(() => window.__app.info().player?.id === '706b');
await page.evaluate(() => window.__app.seek(2.4)); await page.waitForTimeout(200); await shot(page, '14-preview');
await page.evaluate(() => window.__app.app.screen.jump('w1443530')); await page.waitForFunction(() => window.__app.info().player?.id === 'w1443530');
await page.evaluate(() => window.__app.seek(7)); await page.waitForTimeout(200); await shot(page, '15-word-card');   // 電車: 電 and 車 keep their looks
await page.close();
page = await open(`?preview=1&card=6c34&t=2&recipe=${encodeURIComponent(JSON.stringify({ material: 'heat', reveal: 'ignite', particles: ['flames'], backdrop: 'halo' }))}`);
st = await info(page);
check(st.player.id === '6c34' && st.player.paused && st.player.effect.drawCalls === 2 + 1 + 1, `a URL recipe is tried on 水 (heat material: 2 draw calls for the whole kanji, + flames + halo) and t= freezes the time (${st.player.effect.drawCalls})`);
await page.close();

// ---------- 5. voice clips: when the manifest has clips, Sound button + VOICEVOX credit ----------
page = await (await browser.newContext({ viewport: { width: 1100, height: 760 } })).newPage();
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.route('**/audio/manifest.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ voice: { credit: 'VOICEVOX: テスト' }, clips: { '65e5-reading': { src: 'audio/test.wav', text: 'ひ' } } }) }));
await page.goto(BASE + '?today=2026-10-06', { waitUntil: 'load' }); await page.waitForFunction(() => window.__app?.ready === true);
check((await page.locator('#buttons button').allInnerTexts()).includes('Sound: on') && (await page.locator('#footer').innerText()).includes('Voice: VOICEVOX: テスト'), 'with clips in the manifest: Sound button and the VOICEVOX credit appear');
await page.close();

// ---------- 6. mocked XR: buttons, error path, and a `select` ray aimed at a button ----------
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
