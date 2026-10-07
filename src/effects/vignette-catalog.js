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
  'box-tumble': V(9, 'a box beside the kanji pops its flaps; things tumble out one after another (ball, cup, apple, shoe) into a heap, the last one bonking the kanji; they hop back in (thing, things)'),
  'house-build': V(7, 'a wall rises behind the kanji, a roof drops on, the chimney smokes; a person walks home, goes in the door and the window lights up (house, home)'),
  'scrub-wash': V(8, 'mud splats onto the kanji; a hand scrubs it with a sponge, foam builds, a bucket tips water over it and it sparkles (wash)'),
  'tea-pour': V(6, 'tea leaves drop into a teapot, it rattles, tips and pours a green stream into a cup that fills and steams (tea)'),
  'rice-bowl': V(6, 'rice plops into a bowl in heaps and steams; chopsticks dip in and lift clumps away until it is empty (meal, rice)'),
  'sunset-lights': V(6, 'the sun sinks behind a hill with little houses, dusk falls, their windows light up one by one, the moon rises, stars come out (nightfall, evening)'),
  'calendar-back': V((o) => 3 + (o.days ?? 1), 'a calendar shows today; its page flips back a day (days 2: two) while a little sun runs backwards across the sky (yesterday)', { days: 1 }, 'days'),
  'go-to-bed': V(10, 'a person yawns, lies down on a futon and pulls up the blanket; dusk falls, the moon rises, stars twinkle, Zzz floats up (night)'),
  'noon-sun': V(7, 'the sun climbs from the horizon to straight overhead, the person looking up after it; at the top it flares, they cheer and open their lunchbox (noon, daytime)'),
  'chop-split': V(2, 'a cleaver chops straight down through the middle of the kanji; a flash along the cut and the halves slide apart, then back (cut)'),
  'todo-list': V(4, 'a pencil ticks the three boxes of a to-do list one by one; the list spins round and starts again (matter, things to do)'),
  'pin-drop': V(5, 'a big map pin drops from the sky and stabs into the ground beside the kanji, a ring pulsing out; a person runs over and waves from the spot (place)'),
  'dart-bullseye': V(5, 'darts fly from where you stand into the bullseye of a target one by one; it wobbles, a ding (hit, correct)'),
  'apple-ripen': V(4, 'a green apple on a branch ripens yellow then red, swells, sparkles and drops; a new one grows (red)'),
  'eraser-rub': V(4, 'a hand rubs the strokes out one by one with an eraser, crumbs falling; then they write back in (erase)'),
  'wheels-roll': V(4, 'wheels pop out under the kanji, it revs with puffs of exhaust and drives off to the right, then back (move)'),
  'coat-on': V(4, 'a person walks in and stops on a mat beside the kanji (arrive); a coat drops onto them, the sleeves slide down, they tug it straight and twirl (wear)', { color: null }),
  'mirror-me': V(6, 'a person in front of a standing mirror; their face looks back from the glass; they point at their own nose (the Japanese "me"), the reflection too, a sparkle (oneself)'),
  'big-brother': V(5, 'a big kid holds a ball up high while a small one hops for it; he laughs, hands it down and pats the small one\'s head (older brother)'),
  'teach-board': V(9, 'a teacher writes 1+1=2 on a blackboard, tapping with a pointer; a small pupil shoots a hand up and a lightbulb pops on (teach)', { text: null }),
  'queue-number': V(8, 'three people queue at a counter under a number sign; it counts 1, 2, 3 and each time the front one is served and walks off, the rest shuffle up (turn, number)'),
  'which-way': V(4, 'a person by a signpost looks one way, then the other, scratching their head; the sign\'s arm swings round to point and off they walk (direction, way)'),
  'drum-fun': V(5, 'a kid drums on top of the kanji with two sticks; it squashes with every beat and music notes fly up (fun, music)'),
  'leaf-fall': V(3, 'a branch reaches out from the kanji, a bud unfurls into a big leaf that flutters, lets go and zigzags down to the ground (leaf)'),
  'gust-hat': V(5, 'a gust blows across: the kanji leans over, a person leans into it and their hat flies off tumbling away; the wind drops and a new hat lands (wind)'),
  kit: V(21, 'review sheet of the props kit: hand poses, a person walking, hammer, nail, board, plate, ball, heart, burst (not for cards)', { pose: 'all' }),
};
