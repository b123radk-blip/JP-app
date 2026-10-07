// The "vignette" slot's catalog: every scene type, its options (with defaults) and the draw calls it builds. Pure data, no
// three.js (Node scripts import it through catalog.js). Implementations: src/effects/vignettes/ (one module per theme).
// Every vignette also takes `at` ([x, y] offset of its actors in glyph heights) and `size` (scale of its actors).
// A vignette uses no particle slots and no lights of its own; draw calls must equal what it builds (npm run e2e checks).
//   variant: the option that tells two uses of one type apart (上手 / 下手: one set-up, two outcomes)
const V = (dc, desc, opts = {}, variant = null) => ({ dc, desc, opts: { at: null, size: null, ...opts }, variant });

export const VIGNETTES = {
  'hammer-nail': V(10, 'a hand swings a hammer at a nail standing in a board; outcome clean: three blows drive it in flush, a sparkle, thumbs up (skilled); bend: the nail bends over, the hammer hits the thumb, stars (unskilled)', { outcome: 'clean' }, 'outcome'),
  push: V(3, 'a person walks up beside the kanji, leans in and shoves it along in three heaves, dust puffing where it scrapes (push); dir: the way it is pushed (left: they stand on its right)', { dir: 'left' }),
  'lift-heavy': V(4, 'a person squats, grips the kanji and strains (shaking, sweat flying); it barely lifts and thuds down, knocking them onto their bottom (heavy)'),
  'come-near': V(3, 'a person far down a path walks towards you, growing, until they stand right beside the kanji and lean in close (near)'),
  'stack-plates': V(2, 'the kanji is the stand: plates fly in and stack on it with a clink, the top one wobbles, a cake lands on it (dish, plate)'),
  'odd-one-out': V(4, 'a row of identical blue balls bounces along in step; one is red and square and hops out of time; a magnifier finds it, a cross pops up (different, wrong)'),
  'hand-in-hand': V(5, 'two people walk in from either side, meet in front of the kanji, take hands and swing them, hearts rising (two people, a couple)'),
  kit: V(21, 'review sheet of the props kit: hand poses, a person walking, hammer, nail, board, plate, ball, heart, burst (not for cards)', { pose: 'all' }),
};
