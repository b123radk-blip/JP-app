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
import { SCENES as KIT } from './kit-sheet.js';

export const SCENES = { ...CRAFT, ...PEOPLE, ...THINGS, ...HOME, ...SKY, ...OBJECTS, ...FAMILY, ...SCHOOL, ...NATURE, ...FOOD, ...CHORES, ...TOWN, ...FOLK, ...GLYPHPLAY, ...ACTIONS, ...WORLD, ...EVERYDAY2, ...PLAY2, ...BATCH3A, ...KIT };

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
