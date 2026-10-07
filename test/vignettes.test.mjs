// The "vignette" slot (a scene acting out the meaning) without a browser: parsing, validation, cost, how scene cards are
// compared, and the shared timeline. Building and drawing them is checked by npm run e2e and check-piece-costs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRecipe, validateRecipe, estimateCost, describeRecipe, PIECES } from '../src/effects/catalog.js';
import { recipeSimilarity } from '../src/effects/similarity.js';
import { timeline, acts, bump } from '../src/effects/vignettes/timeline.js';
import { EFFECTS, COMPONENT_LOOKS } from '../src/config.js';

const norm = (e) => normalizeRecipe(e, COMPONENT_LOOKS);

test('vignette: shorthand, defaults, none, validation', () => {
  assert.equal(norm({}).vignette, null);
  assert.equal(norm({ vignette: 'none' }).vignette, null);
  const r = norm({ vignette: 'hammer-nail' });
  assert.equal(r.vignette.type, 'hammer-nail'); assert.equal(r.vignette.outcome, 'clean');
  assert.equal(norm({ vignette: 'hammer-nail:bend' }).vignette.outcome, 'bend', '"type:variant" sets the outcome');
  assert.deepEqual(validateRecipe({ vignette: { type: 'hammer-nail', outcome: 'bend' } }), []);
  assert.match(validateRecipe({ vignette: 'juggling' })[0], /unknown vignette "juggling"/);
  assert.match(validateRecipe({ vignette: { type: 'push', speed: 2 } })[0], /unknown option "speed" for push/);
  assert.match(describeRecipe(r), /scene hammer-nail:clean$/);
});

test('vignette: its draw calls are part of the cost estimate', () => {
  const base = estimateCost(norm({}), 3), withScene = estimateCost(norm({ vignette: 'push' }), 3);
  assert.equal(withScene.drawCalls - base.drawCalls, PIECES.vignette.push.cost({}).drawCalls);
  assert.equal(withScene.particles, base.particles); assert.equal(withScene.pointLights, base.pointLights);
});

test('similarity: scene cards are compared by their scene', () => {
  const a = norm({ material: 'skin', backdrop: 'sky:day', vignette: 'push' });
  assert.equal(recipeSimilarity(a, norm({ material: 'ink', backdrop: 'sky:night', vignette: 'push' })).score, 1, 'the same scene is a look-alike whatever else differs');
  assert.equal(recipeSimilarity(a, norm({ material: 'skin', backdrop: 'sky:day', vignette: 'lift-heavy' })).score, 0, 'different scenes do not match on the sky and material underneath');
  const clean = norm({ vignette: 'hammer-nail:clean' }), bend = norm({ vignette: 'hammer-nail:bend' });
  assert.equal(recipeSimilarity(clean, bend).score, EFFECTS.similarity.sceneVariant, '上手 / 下手: one set-up, two outcomes');
  assert.ok(EFFECTS.similarity.sceneVariant < EFFECTS.similarity.warn);
  const emblemCard = norm({ material: 'skin', backdrop: 'sky:day', emblem: 'ring' });
  assert.ok(recipeSimilarity(a, emblemCard).score < EFFECTS.similarity.warn, 'a scene card and an emblem card on the same sky are not alike');
});

test('timeline: beats ease from 0 to 1, acts splits set-up / action / loops', () => {
  const T = timeline(0.5, { a: [0, 1, 'linear'], b: [1, 1], c: [0, 0.25] });
  assert.equal(T.a, 0.5); assert.equal(T.b, 0); assert.equal(T.c, 1);
  assert.equal(bump(0.5, 0, 1), 1); assert.equal(bump(2, 0, 1), 0);
  const ctx = { rv: { items: [{ start: 1, dur: 1 }, { start: 2.1, dur: 0.9 }], end: 3 } };
  assert.deepEqual(acts(ctx, 2, 4), { setup: 0.5, u: -1, v: -1, n: -1, s: 1 });
  const later = acts(ctx, 3 + 4 * 2 + 0.5, 4);
  assert.equal(later.n, 2); assert.ok(Math.abs(later.v - 0.5) < 1e-9, 'the action loops');
});
