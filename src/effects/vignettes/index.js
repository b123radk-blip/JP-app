// Vignettes: the "vignette" recipe slot, a short scene that acts out the card's meaning with the kanji taking part in it
// (上手: a hand drives a nail in cleanly; 押: a person shoves the kanji along). Modules are grouped by theme in this folder;
// each exports SCENES = { type: create(ctx, spec, stage) -> { group?, step(t) } }, built from the props kit
// (pieces/kit-*.js) and timed with ./timeline.js. Types, options and costs are declared in ../vignette-catalog.js.
//
// stage (what a scene may use and move):
//   group      the effect's own space (metres, origin at the middle of the kanji); add props here (create() does it for group)
//   glyph      the pivot that carries the whole kanji or word (move / turn / scale it; the recipe's motion should be none)
//   parts      [{ element, strokes, outer }] the parts of the kanji (recipe "parts" and props on components); outer moves one
//   box        bounds of all strokes { minX, maxX, minY, maxY, w, h, cx, cy }; glyphBox(i): one glyph of a word; strokeBox(si)
//   offset(si, x, y, z)   moves one stroke (adds to ctx.so; call it every frame, it is reset each frame)
//   u          the glyph height, at least a kanji card's (build actors about this tall)
// step(t) runs after the reveal, before the materials: it may also change ctx.rv.progress (un-draw a stroke).
import * as THREE from 'three';
import { LAYOUT } from '../../config.js';
import { SCENES as CRAFT } from './craft.js';
import { SCENES as PEOPLE } from './people.js';
import { SCENES as THINGS } from './things.js';
import { SCENES as HOME } from './home.js';
import { SCENES as SKY } from './sky.js';
import { SCENES as OBJECTS } from './objects.js';
import { SCENES as FAMILY } from './family.js';
import { SCENES as SCHOOL } from './school.js';
import { SCENES as NATURE } from './nature.js';
import { SCENES as FOOD } from './food.js';
import { SCENES as CHORES } from './chores.js';
import { SCENES as TOWN } from './town.js';
import { SCENES as FOLK } from './folk.js';
import { SCENES as GLYPHPLAY } from './glyphplay.js';
import { SCENES as ACTIONS } from './actions.js';
import { SCENES as WORLD } from './world.js';
import { SCENES as EVERYDAY2 } from './everyday2.js';
import { SCENES as PLAY2 } from './play2.js';
import { SCENES as BATCH3A } from './batch3a.js';
import { SCENES as BATCH3B } from './batch3b.js';
import { SCENES as BATCH3C } from './batch3c.js';
import { SCENES as WORDS3A } from './words3a.js';
import { SCENES as WORDS3B } from './words3b.js';
import { SCENES as B4A } from './batch4a.js';
import { SCENES as B4B } from './batch4b.js';
import { SCENES as B4C } from './batch4c.js';
import { SCENES as B4D } from './batch4d.js';
import { SCENES as W4A } from './words4a.js';
import { SCENES as B5A } from './batch5a.js';
import { SCENES as B5B } from './batch5b.js';
import { SCENES as B5C } from './batch5c.js';
import { SCENES as B5D } from './batch5d.js';
import { SCENES as W5A } from './words5a.js';
import { SCENES as B6A } from './batch6a.js';
import { SCENES as B6B } from './batch6b.js';
import { SCENES as B6C } from './batch6c.js';
import { SCENES as S1A } from './step1-a.js';
import { SCENES as S1B } from './step1-b.js';
import { SCENES as S1C } from './step1-c.js';
import { SCENES as S1T } from './step1-time.js';
import { SCENES as S1D } from './step1-d.js';
import { SCENES as S1E } from './step1-e.js';
import { SCENES as S1G } from './step1-g.js';
import { SCENES as S1H } from './step1-h.js';
import { SCENES as S1F } from './step1-f.js';
import { SCENES as S1I } from './step1-i.js';
import { SCENES as S1J } from './step1-j.js';
import { SCENES as S1K } from './step1-k.js';
import { SCENES as S1L } from './step1-l.js';
import { SCENES as S1M } from './step1-m.js';
import { SCENES as S1N } from './step1-n.js';
import { SCENES as S1O } from './step1-o.js';
import { SCENES as MA } from './models-a.js';
import { SCENES as MB } from './models-b.js';
import { SCENES as QG } from './q-gestures.js';
import { SCENES as QA } from './q-animals.js';
import { SCENES as QF } from './q-family.js';
import { SCENES as QF2 } from './q-family2.js';
import { SCENES as QP } from './q-people.js';
import { SCENES as QS } from './q-school.js';
import { SCENES as QA2 } from './q-animals2.js';
import { SCENES as QA3 } from './q-animals3.js';
import { SCENES as QSE } from './q-senses.js';
import { SCENES as QB } from './q-bed.js';
import { SCENES as QFE } from './q-feel.js';
import { SCENES as QT } from './q-taste.js';
import { SCENES as QL } from './q-likes.js';
import { SCENES as QST } from './q-strength.js';
import { SCENES as QTK } from './q-talk.js';
import { SCENES as QMV } from './q-move.js';
import { SCENES as QW } from './q-weather.js';
import { SCENES as QWM } from './q-warm.js';
import { SCENES as QWE } from './q-wear.js';
import { SCENES as QWE2 } from './q-wear2.js';
import { SCENES as QLE } from './q-learn.js';
import { SCENES as QLE2 } from './q-learn2.js';
import { SCENES as QMU } from './q-music.js';
import { SCENES as QMU2 } from './q-music2.js';
import { SCENES as QTO } from './q-town.js';
import { SCENES as QTO2 } from './q-town2.js';
import { SCENES as QHO } from './q-home.js';
import { SCENES as QHO2 } from './q-home2.js';
import { SCENES as QRI } from './q-ride.js';
import { SCENES as QRI2 } from './q-ride2.js';
import { SCENES as KIT } from './kit-sheet.js';

export const SCENES = { ...CRAFT, ...PEOPLE, ...THINGS, ...HOME, ...SKY, ...OBJECTS, ...FAMILY, ...SCHOOL, ...NATURE, ...FOOD, ...CHORES, ...TOWN, ...FOLK, ...GLYPHPLAY, ...ACTIONS, ...WORLD, ...EVERYDAY2, ...PLAY2, ...BATCH3A, ...BATCH3B, ...BATCH3C, ...WORDS3A, ...WORDS3B, ...B4A, ...B4B, ...B4C, ...B4D, ...W4A, ...B5A, ...B5B, ...B5C, ...B5D, ...W5A, ...B6A, ...B6B, ...B6C, ...S1A, ...S1B, ...S1C, ...S1T, ...S1D, ...S1E, ...S1G, ...S1H, ...S1F, ...S1I, ...S1J, ...S1K, ...S1L, ...S1M, ...S1N, ...S1O, ...MA, ...MB, ...QG, ...QA, ...QF, ...QF2, ...QP, ...QS, ...QA2, ...QA3, ...QSE, ...QB, ...QFE, ...QT, ...QL, ...QST, ...QTK, ...QMV, ...QW, ...QWM, ...QWE, ...QWE2, ...QLE, ...QLE2, ...QMU, ...QMU2, ...QTO, ...QTO2, ...QHO, ...QHO2, ...QRI, ...QRI2, ...KIT };

const boxOf = (pts) => {
  const b = new THREE.Box3().setFromPoints(pts);
  return { minX: b.min.x, maxX: b.max.x, minY: b.min.y, maxY: b.max.y, w: b.max.x - b.min.x, h: b.max.y - b.min.y, cx: (b.min.x + b.max.x) / 2, cy: (b.min.y + b.max.y) / 2 };
};

export function create(ctx, spec, { group, glyph, parts }) {
  const strokes = ctx.strokes, holder = new THREE.Group();
  const stage = {
    group: holder, glyph, parts, u: Math.max(ctx.glyphHeight, LAYOUT.glyphHeight), K: ctx.K,      // long words have small glyphs; actors stay kanji-card sized
    box: boxOf(strokes.flatMap((s) => s.pts)),
    glyphBox: (i) => boxOf(strokes.filter((s) => (s.glyph ?? 0) === i).flatMap((s) => s.pts)),
    strokeBox: (si) => boxOf(strokes[si].pts),
    offset(si, x = 0, y = 0, z = 0) { ctx.so[3 * si] += x; ctx.so[3 * si + 1] += y; ctx.so[3 * si + 2] += z; },
  };
  // `size` scales the actors about the kanji's bottom-right corner (where most scenes stand), `at` shifts them (glyph heights)
  const [ax, ay] = spec.at ?? [0, 0], k = spec.size ?? 1, cx = stage.box.maxX, cy = stage.box.minY;
  holder.position.set(ax * stage.u + cx * (1 - k), ay * stage.u + cy * (1 - k), 0); holder.scale.setScalar(k);
  if (glyph) glyph.userData.base = glyph.position.clone();          // before the scene is built: it may hang things on the kanji
  const scene = SCENES[spec.type](ctx, spec, stage);
  if (scene.group) holder.add(scene.group);
  group.add(holder);
  return { group: holder, step: (t) => scene.step(t) };
}
