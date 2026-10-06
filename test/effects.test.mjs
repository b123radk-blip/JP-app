// The recipe layer without a browser: parsing / validation / defaults, cost estimates, similarity, component parsing and
// which strokes each styled part gets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeRecipe, validateRecipe, estimateCost, describeRecipe, parseSpec } from '../src/effects/catalog.js';
import { recipeSimilarity } from '../src/effects/similarity.js';
import { assignParts } from '../src/effects/plan.js';
import { parseKanjiVG } from '../scripts/lib/kanjivg.mjs';
import { COMPONENT_LOOKS } from '../src/config.js';

const card = (hex) => JSON.parse(readFileSync(`content/cards/${hex}.json`, 'utf8'));
const strokes = (hex) => JSON.parse(readFileSync(`data/kanji-${hex}.json`, 'utf8'));
const norm = (e) => normalizeRecipe(e, COMPONENT_LOOKS);

test('shorthands, aliases and defaults', () => {
  assert.deepEqual(parseSpec('backdrop', 'sky:storm'), { type: 'sky', preset: 'storm' });
  assert.deepEqual(parseSpec('emblem', 'dots:3'), { type: 'dots', n: 3 });
  const r = norm({ material: 'wood', reveal: 'draw:dust', backdrop: { type: 'halo', color: '#ffc860' } });
  assert.equal(r.material.type, 'glow'); assert.equal(r.material.preset, 'wood');
  assert.equal(r.reveal.tip, 'dust'); assert.equal(r.reveal.speed, 0.6);
  assert.equal(r.backdrop.color, 0xffc860); assert.equal(r.backdrop.flicker, true);
  assert.equal(r.motion.type, 'none'); assert.equal(r.emblem, null); assert.deepEqual(r.particles, []);
  assert.equal(norm(undefined).motion.type, 'sway', 'cards without a recipe sway (the old default effect)');
  assert.deepEqual(normalizeRecipe('my-effect'), { bespoke: 'my-effect' });
});

test('component looks are shared, and a recipe can override them', () => {
  const r = norm({ parts: { '木': {}, '日': { material: 'silver' } } });
  assert.equal(r.parts['木'].material.preset, 'wood');
  assert.equal(r.parts['日'].material.preset, 'silver');
});

test('validation catches typos and impossible recipes', () => {
  const comps = strokes('6797').components;
  const p = validateRecipe({ materal: 'wood', reveal: 'melt', particles: ['rain', 'snow', 'mist'], backdrop: 'sky:sea', motion: { type: 'sway', ampp: 1 }, parts: { '日': {} } }, { components: comps });
  const has = (re) => assert.ok(p.some((x) => re.test(x)), `expected a problem matching ${re}: ${p.join(' | ')}`);
  has(/unknown recipe key "materal"/); has(/unknown reveal "melt"/); has(/at most 2 particle layers/);
  has(/unknown sky preset "sea"/); has(/unknown option "ampp" for sway/); has(/"日" is not a component/);
  assert.deepEqual(validateRecipe(card('706b').effect), []);
  assert.deepEqual(validateRecipe('fire', { bespokeIds: [] }).length, 1);
});

test('cost estimates match what the pieces build (checked in the browser by npm run e2e as well)', () => {
  assert.deepEqual(estimateCost(norm(card('706b').effect), 4), { drawCalls: 4, particles: 1280, pointLights: 2 }, 'heat body + caps, halo, one particle pool');
  assert.equal(estimateCost(norm(card('65e5').effect), 4).drawCalls, 18, 'glow 4 + sunrise 14');
});

test('similarity: identical recipes score 1, the pilot cards stay apart, one changed slot lowers the score', () => {
  const fire = norm(card('706b').effect), sun = norm(card('65e5').effect);
  assert.equal(recipeSimilarity(fire, fire).score, 1);
  assert.ok(recipeSimilarity(fire, sun).score < 0.5);
  const up = norm(card('4e0a').effect), down = norm(card('4e0b').effect);
  assert.ok(recipeSimilarity(up, down).score < 0.72, 'the 上 / 下 pair must not look alike');
  const sameButEmblem = norm({ ...card('4e0a').effect, emblem: 'question' });
  assert.ok(recipeSimilarity(up, sameButEmblem).score < 1 && recipeSimilarity(up, sameButEmblem).score > 0.8);
  assert.match(describeRecipe(fire), /^heat · ignite · flames\+embers · halo · none · —$/);
});

test('KanjiVG components: nested groups, repeated components, split parts merged', () => {
  const svg = (hex) => readFileSync(`data/source/0${hex}.svg`, 'utf8');
  const rin = parseKanjiVG(svg('6797'), '06797');
  assert.deepEqual(rin.components.map((c) => [c.element, c.position, c.strokes.join()]), [['木', 'left', '0,1,2,3'], ['木', 'right', '4,5,6,7']]);
  const nani = parseKanjiVG(svg('4f55'), '04f55');
  assert.deepEqual(nani.components.find((c) => c.element === '亻').strokes, [0, 1]);
  assert.deepEqual(nani.components.find((c) => c.element === '丁').strokes, [2, 6], '丁 is split in two parts around 口 and merged back');
  assert.equal(nani.strokes.length, 7);
});

test('parts: both 木 of 林 are styled, the rest of 時 keeps the recipe material', () => {
  const rin = assignParts(norm(card('6797').effect), strokes('6797').components, 8);
  assert.deepEqual(rin.map((p) => [p.element, p.index, p.strokes.join()]), [['木', 0, '0,1,2,3'], ['木', 1, '4,5,6,7']]);
  const ji = assignParts(norm(card('6642').effect), strokes('6642').components, 10);
  assert.deepEqual(ji.map((p) => [p.element, p.strokes.length, p.material?.preset ?? null]), [['日', 4, 'gold'], [null, 6, null]]);
});

test('scene props: shorthand, validation, cost of a prop placed on a repeated component', () => {
  const rin = norm(card('6797').effect);
  assert.deepEqual(rin.scene.map((p) => [p.type, p.on]), [['tree', '木']]);
  assert.equal(estimateCost(rin, 8, strokes('6797').components).drawCalls, 4 * 2 + 2 + 1 + 1, 'two 木 parts (4 each), one crown per 木, sky, leaves pool');
  const p = validateRecipe({ scene: ['tree:日', 'volcano', 'river', 'dial'] }, { components: strokes('6797').components });
  assert.ok(p.some((x) => /at most 2 scene props/.test(x)), p.join(' | '));
  assert.ok(validateRecipe({ scene: ['tree:日'] }, { components: strokes('6797').components }).some((x) => /"日" is not a component/.test(x)));
  assert.ok(validateRecipe({ scene: ['volcano'] }).some((x) => /unknown scene "volcano"/.test(x)));
});
