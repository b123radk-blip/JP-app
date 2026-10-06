// What a recipe may name: every piece per slot, its options (with defaults) and its performance cost. Pure data + small helpers,
// no three.js, so Node scripts (content check, similarity check, audit) can import it. Implementations: src/effects/pieces/.
import { MATERIALS, SKIES } from '../config.js';
import { planKanji, planWord } from './plan.js';

export const SLOTS = ['material', 'reveal', 'particles', 'scene', 'backdrop', 'motion', 'emblem'];
export const LIST_SLOTS = ['particles', 'scene'];             // these take a list
export const MAX_PARTICLE_LAYERS = 2, MAX_SCENE_PROPS = 2;

// Particle kinds. pool = which shared instanced mesh draws them (blend + space: 'glyph' moves with the kanji, 'world' does not).
// max = most alive at once at count 1 (sets the budget). Behaviour: pieces/particle-kinds.js.
export const PARTICLE_KINDS = {
  flames:  { pool: 'add-glyph', max: 900, desc: 'flames rising from the lit strokes' },
  embers:  { pool: 'add-glyph', max: 150, desc: 'slow glowing embers drifting up from the strokes' },
  bubbles: { pool: 'add-world', max: 90, desc: 'bubble rings rising around the kanji' },
  flow:    { pool: 'add-glyph', max: 220, desc: 'droplets running along each stroke in its writing direction' },
  rain:    { pool: 'norm-world', max: 420, desc: 'rain streaks falling through the card' },
  leaves:  { pool: 'norm-world', max: 50, desc: 'leaves tumbling down from above' },
  mist:    { pool: 'norm-world', max: 36, desc: 'big soft mist puffs drifting sideways low down' },
  motes:   { pool: 'add-world', max: 120, desc: 'small glints; dir up / down / still; color' },
  footprints: { pool: 'norm-world', max: 40, desc: 'a trail of footprints walking across the lower half (dir right / left / away / toward)' },
  wind: { pool: 'add-world', max: 90, desc: 'wind streaks blowing across from the left' },
  kana: { pool: 'norm-world', max: 30, desc: 'hiragana floating up (words, letters, language); color' },
  // used at the drawing tip by reveals (not as layers):
  snow:    { pool: 'norm-world', max: 110, desc: 'snowflakes drifting down' },
  petals:  { pool: 'norm-world', max: 60, desc: 'pink petals tumbling down' },
  steam:   { pool: 'norm-world', max: 30, desc: 'steam rising from below the kanji (food, a hot drink)' },
  coins:   { pool: 'norm-world', max: 50, desc: 'gold coins flipping as they fall' },
  hearts:  { pool: 'add-world', max: 30, desc: 'small hearts floating up' },
  notes:   { pool: 'add-world', max: 25, desc: 'music notes floating up' },
  // also used at the drawing tip by reveals; sparks and dust work as layers too
  front:   { pool: 'add-glyph', max: 110, tip: true, layer: false, desc: 'big flames at the tip (ignite)' },
  sparks:  { pool: 'add-glyph', max: 120, tip: true, desc: 'sparks (tip: thrown from the pen; layer: sparkling off the strokes)' },
  drops:   { pool: 'add-glyph', max: 90, tip: true, layer: false, desc: 'water droplets splashing from the tip' },
  dust:    { pool: 'norm-glyph', max: 90, tip: true, desc: 'stone dust (tip: falling from the pen; layer: drifting motes)' },
  sprouts: { pool: 'norm-glyph', max: 40, tip: true, layer: false, desc: 'green sprouts popping at the pen (grow)' },
  ink:     { pool: 'norm-glyph', max: 40, tip: true, layer: false, desc: 'ink flicked from the brush (brush)' },
};

const cost = (drawCalls = 0, particles = 0, pointLights = 0) => ({ drawCalls, particles, pointLights });
const VARIANT_OF = { compass: 'dir', stars: 'n', flag: 'kind', pie: 'part', thermometer: 'level' };
// { name: [drawCalls, default colour, description, extra options] } -> emblem catalog entries
const emblems = (table) => Object.fromEntries(Object.entries(table).map(([name, [dc, color, desc, extra = {}]]) => [name, { impl: name, variant: VARIANT_OF[name] ?? null, opts: { color, at: null, size: null, ...extra }, cost: (o) => cost(typeof dc === 'function' ? dc(o) : dc), desc }]));
// how many instances of a component a kanji has at the shallowest depth it occurs (see compose.js assignParts)
export function instancesOf(components = [], el) {
  const all = components.filter((c) => c.element === el);
  return all.length ? all.filter((c) => c.depth === Math.min(...all.map((x) => x.depth))).length : 0;
}
const glowMaterial = { impl: 'glow', variant: 'preset', opts: { preset: 'cyan', body: null, emissive: null, glow: null, emissiveK: null, glowK: null, breath: null, cycle: null }, cost: () => cost(4), desc: 'solid glowing glyph with a soft halo (presets in config MATERIALS); 4 draw calls per part, any stroke count' };

export const PIECES = {
  material: {
    glow: glowMaterial,
    heat: { impl: 'heat', opts: {}, cost: () => cost(2), desc: 'charcoal that glows white-hot where the reveal front passes, then breathes as embers; 2 draw calls per part' },
    // every MATERIALS preset is also a material name: "wood" = { type: "glow", preset: "wood" }
    ...Object.fromEntries(Object.keys(MATERIALS).map((k) => [k, { ...glowMaterial, alias: { type: 'glow', preset: k } }])),
    rainbow: { ...glowMaterial, alias: { type: 'glow', preset: 'pearl', cycle: 0.18 }, desc: 'pearl whose colour walks round the rainbow (colour, change)' },
  },
  reveal: {
    draw: { impl: 'draw', variant: 'tip', opts: { tip: null, speed: 0.6, gap: 0.06, rate: 1, erase: false }, cost: (o) => cost(0, o.tip ? PARTICLE_KINDS[o.tip]?.max ?? 0 : 0), desc: 'strokes draw in, in stroke order; optional tip particles (drops, dust, sparks); erase: after a pause they un-draw backwards and redraw (erase, vanish)' },
    ignite: { impl: 'ignite', opts: { speed: 0.6, gap: 0.06 }, cost: () => cost(0, PARTICLE_KINDS.front.max + PARTICLE_KINDS.sparks.max), desc: 'a flame front runs along each stroke, throwing sparks' },
    grow: { impl: 'grow', opts: { speed: 0.6, gap: 0.06 }, cost: () => cost(0, PARTICLE_KINDS.sprouts.max), desc: 'the kanji grows up out of its base while drawing, sprouts popping at the pen (grow, plant, life)' },
    stamp: { impl: 'stamp', opts: { speed: 0.45, gap: 0.04 }, cost: () => cost(0, PARTICLE_KINDS.dust.max), desc: 'drawn on a raised seal that slams down at the end with a puff of dust (seal, name, now)' },
    brush: { impl: 'brush', opts: { speed: 0.6, gap: 0.08, color: 0x8a5a30, ink: 0x15151e, erase: false }, cost: () => cost(2, PARTICLE_KINDS.ink.max), desc: 'a calligraphy brush draws each stroke, flicking ink, then lifts away (write, letter, sentence)' },
    assemble: { impl: 'assemble', opts: { speed: 0.6, gap: 0.06 }, cost: () => cost(), desc: 'every stroke flies in from its own direction while it draws (fit together, build, meet)' },
  },
  particles: Object.fromEntries(Object.entries(PARTICLE_KINDS).filter(([, k]) => k.layer !== false).map(([name, k]) => [name, {
    impl: name, variant: ['motes', 'footprints'].includes(name) ? 'dir' : null,
    opts: { count: 1, color: null, ...(name === 'motes' ? { dir: 'up' } : name === 'footprints' ? { dir: 'right' } : {}) },
    cost: (o) => cost(0, Math.round(k.max * (o.count ?? 1))), desc: k.desc,
  }])),
  // scene props: the thing itself, shown with the kanji (pieces/props-*.js). space 'glyph' = moves with the kanji or a part.
  scene: {
    mountains: { impl: 'mountains', space: 'world', opts: { color: 0x1a2238, far: 0x34406a, snow: true }, cost: () => cost(3), desc: 'a range whose peaks sit behind the tops of the strokes; rises while drawing, snow caps after' },
    river: { impl: 'river', space: 'world', opts: { water: 0x1f6fc0, light: 0xd6f2ff, bank: 0x1f3a24 }, cost: () => cost(1), desc: 'a winding river on a valley panel; fills from the far end while drawing, then flows towards you' },
    ripples: { impl: 'ripples', space: 'world', opts: { water: 0x0b3552, light: 0xc8eeff }, cost: () => cost(1), desc: 'a water surface: a ring where each stroke lands, then rings keep coming' },
    tree: { impl: 'tree', space: 'glyph', variant: 'on', opts: { on: null, glyph: null, color: 0x4f9a3a }, cost: (o, n, info) => cost(o.on ? Math.max(1, instancesOf(info.components, o.on)) : 1), desc: 'a leafy crown bursting out behind the strokes; on: a component (each instance gets one and sways with it); glyph: in a word, behind that glyph only (0 = first)' },
    lanterns: { impl: 'lanterns', space: 'world', variant: 'n', opts: { n: 3, color: 0xff6a3a }, cost: (o) => cost(5 * (o.n ?? 3)), desc: 'n paper lanterns lighting one by one (one per stroke when n = the stroke count)' },
    dial: { impl: 'dial', space: 'world', opts: { color: 0xfff0d0 }, cost: () => cost(7), desc: 'a big clock face behind the kanji, hands sweeping, a small sun arcing over it' },
    road: { impl: 'road', space: 'world', opts: { color: 0x3a3a40, verge: 0x2a4a28, line: 0xf0e8c0, dashes: true }, cost: () => cost(1), desc: 'a road (or a path: dashes false, earth colour) winding towards you' },
    field: { impl: 'field', space: 'world', opts: { color: 0x5aa040, water: 0x3a6a8a, ridge: 0x6a5030 }, cost: () => cost(1), desc: 'rice paddies seen from above, water glinting' },
    room: { impl: 'room', space: 'world', variant: 'kind', opts: { kind: 'home', wall: 0x8a6a50, floor: 0x5a3a24, frame: 0xe8dcc8, window: 0x9fd0ff }, cost: (o) => cost(6 + (o.kind && o.kind !== 'home' ? 2 : 0)), desc: 'inside a room: wall, floor, a window with daylight, a hanging lamp; kind home / classroom (blackboard) / kitchen (counter, stove) / shop (shelves of goods) / station (platform, train)' },
    bridge: { impl: 'bridge', space: 'world', opts: { color: 0xd03828, deck: 0x6a4024 }, cost: () => cost(2), desc: 'a red arched bridge across the lower part (cross over); pairs with a river' },
    gate: { impl: 'gate', space: 'world', opts: { color: 0xc03028, door: 0xe8dcc0, light: 0xfff0c0, close: false }, cost: () => cost(4), desc: 'a gate whose doors slide open after the strokes, light behind (close: they start open and slide shut, the light goes out)' },
  },
  backdrop: {
    plain: { impl: 'plain', opts: { rim: 0x58d8ff }, cost: () => cost(0, 0, 2), desc: 'nothing behind the kanji; key + rim light' },
    sunrise: { impl: 'sunrise', opts: { dawn: 2.0 }, lead: 1.6, cost: () => cost(14, 0, 2), desc: 'dawn sky, a sun rising from behind a hill, slow rays' },
    sky: { impl: 'sky', variant: 'preset', opts: { preset: 'night', moon: null, stars: null }, cost: (o) => { const s = SKIES[o.preset] || {}, moon = o.moon ?? s.moon, stars = o.stars ?? s.stars; return cost(1 + (stars ? 1 : 0) + (moon ? 2 : 0) + (s.shafts || 0), 0, 2); }, desc: 'gradient sky sphere; presets in config SKIES (moon, stars, lightning, light shafts); moon / stars override the preset' },
    halo: { impl: 'halo', opts: { color: 0xff6a1a, size: 1.5, flicker: true }, lead: 0.5, cost: () => cost(1, 0, 2), desc: 'a glow behind the kanji that grows as it is revealed (firelight)' },
  },
  motion: {
    none: { impl: 'none', opts: {}, cost: () => cost(), desc: 'still' },
    sway: { impl: 'sway', opts: { amp: 0.3, speed: 0.7, bob: 0, axis: 'y', phase: 0 }, cost: () => cost(), desc: 'slow turn (axis y) or rocking from the base (axis z)' },
    float: { impl: 'float', opts: { amp: 0.012, speed: 1.1 }, cost: () => cost(), desc: 'bobs gently up and down' },
    pulse: { impl: 'pulse', opts: { amp: 0.06, speed: 2.2 }, cost: () => cost(), desc: 'breathes bigger and smaller' },
    drift: { impl: 'drift', variant: 'dir', opts: { dir: 'up', dist: 0.05, dur: 1.6, bob: 0.006 }, cost: () => cost(), desc: 'moves up / down / left / right / toward / away after the strokes, then hovers' },
    lean: { impl: 'lean', variant: 'toward', opts: { toward: 'right', angle: 0.2, dur: 1.2 }, cost: () => cost(), desc: 'tilts over from its base (for a part: leaning on something)' },
    tilt: { impl: 'tilt', opts: { angle: 0.16, every: 2.4 }, cost: () => cost(), desc: 'puzzled head tilt, left then right' },
    count: { impl: 'count', variant: 'n', opts: { n: 3, every: 0.5, amp: 0.1, rest: 1.4 }, cost: () => cost(), desc: 'pops n times in a row, rests, repeats' },
    grow: { impl: 'grow', variant: 'to', opts: { to: 1.25, dur: 1.2 }, cost: () => cost(), desc: 'grows from its base after the strokes (big, tall)' },
    shrink: { impl: 'shrink', variant: 'to', opts: { to: 0.7, dur: 1.2 }, cost: () => cost(), desc: 'shrinks towards its base (small, few)' },
    stretch: { impl: 'stretch', variant: 'axis', opts: { axis: 'x', to: 1.35, dur: 1.4 }, cost: () => cost(), desc: 'stretches wide (x) or tall (y): long' },
    spin: { impl: 'spin', opts: { every: 4, dur: 1.4 }, cost: () => cost(), desc: 'one full turn now and then' },
    bounce: { impl: 'bounce', opts: { height: 0.02, speed: 3 }, cost: () => cost(), desc: 'bounces (a child, a ball)' },
    shake: { impl: 'shake', opts: { amp: 0.006, every: 2.2 }, cost: () => cost(), desc: 'short trembles (electricity, cold, fear)' },
    wave: { impl: 'wave', opts: { amp: 0.12, speed: 3 }, cost: () => cost(), desc: 'rocks from its base like a waving hand' },
    wag: { impl: 'wag', opts: { amp: 0.08, speed: 9 }, cost: () => cost(), desc: 'quick wagging from its base (a dog)' },
    walk: { impl: 'walk', opts: { step: 0.01, speed: 4, dist: 0.03 }, cost: () => cost(), desc: 'steps along: bobbing and rocking' },
    blink: { impl: 'blink', opts: { every: 3.2 }, cost: () => cost(), desc: 'squashes shut for a moment, like an eye blinking' },
    swim: { impl: 'swim', opts: { amp: 0.03, speed: 1.6 }, cost: () => cost(), desc: 'swims side to side, turning (a fish)' },
    fly: { impl: 'fly', opts: { height: 0.04 }, cost: () => cost(), desc: 'takes off: rises and dips, wings beating, banking' },
    sink: { impl: 'sink', opts: { depth: 0.012, every: 2.6 }, cost: () => cost(), desc: 'thuds down onto its base, squashed, and slowly recovers (heavy)' },
    roll: { impl: 'roll', opts: { every: 3.2, dur: 1.2, dist: 0.03 }, cost: () => cost(), desc: 'rolls over: one full turn in its own plane, now and then (roll, turn over)' },
    stand: { impl: 'stand', opts: { every: 4.2 }, cost: () => cost(), desc: 'lies back flat, then springs upright (stand up, get up)' },
    bow: { impl: 'bow', opts: { angle: 0.55, every: 3.4 }, cost: () => cost(), desc: 'bows politely towards you from its base' },
    hang: { impl: 'hang', opts: { amp: 0.1, speed: 1.8 }, cost: () => cost(), desc: 'swings from its top like a picture on a nail (hang)' },
    turn: { impl: 'turn', opts: { every: 3.6 }, cost: () => cost(), desc: 'turns away, then turns back to face you (face towards)' },
    flip: { impl: 'flip', opts: { every: 4 }, cost: () => cost(), desc: 'flips over to its back side and back again (return, reverse)' },
    shove: { impl: 'shove', variant: 'dir', opts: { dir: 'right', dist: 0.03, every: 2.4 }, cost: () => cost(), desc: 'jolts one way as if shoved, then eases back (push)' },
    vanish: { impl: 'vanish', opts: { every: 4.4 }, cost: () => cost(), desc: 'shrinks away to nothing, stays gone a moment, pops back (nothing, without)' },
    slide: { impl: 'slide', opts: { dist: 0.03, speed: 1.6 }, cost: () => cost(), desc: 'slides from side to side, leaning into it (move)' },
    split: { impl: 'split', variant: 'axis', opts: { axis: 'x', dist: 0.055, every: 3.2, hold: 0.9 }, cost: () => cost(), desc: 'strokes either side of the middle move apart and back (divide, cut, half); axis y: top and bottom' },
    jiggle: { impl: 'jiggle', opts: { amp: 0.004, speed: 5 }, cost: () => cost(), desc: 'every stroke wobbles on its own, like jelly (strange, change)' },
  },
  emblem: {
    arrow: { impl: 'arrow', variant: 'dir', opts: { dir: 'up', color: 0xffd27a, at: null, size: null }, cost: () => cost(2), desc: 'a 3D arrow that bounces in its direction (up down left right toward away)' },
    question: { impl: 'question', opts: { color: 0xffe08a, at: null, size: null }, cost: () => cost(2), desc: 'a bouncing, wobbling "?"' },
    zzz: { impl: 'zzz', opts: { color: 0xbfd8ff, at: null, size: null }, cost: () => cost(3), desc: 'three Z letters floating up (sleep / rest)' },
    clock: { impl: 'clock', opts: { color: 0xfff0d0, at: null, size: null }, cost: () => cost(4), desc: 'a clock face whose hands sweep round' },
    dots: { impl: 'dots', variant: 'n', opts: { n: 3, color: 0xffe2a0, at: null, size: null }, cost: (o) => cost(o.n ?? 3), desc: 'n glowing beads that pop in one by one (counting)' },
    // pieces/emblem-body.js and emblem-things.js; draw calls must match what they build (npm run e2e checks)
    ...emblems({
      speech: [4, 0xf4f0e8, 'speech bubble, dots typing'], eye: [3, 0xf0f0f0, 'eye looking around, blinking', { iris: null }], ear: [4, 0xffc8a8, 'ear with sound waves coming in'],
      hand: [1, 0xffd0b0, 'open hand, waving'], foot: [2, 0xd8c0a8, 'footprints stepping'], person: [2, 0xffd0a8, 'a person waving'], heart: [1, 0xff5a7a, 'beating heart'],
      note: [1, 0xffe08a, 'music note, bobbing'], lightbulb: [2, 0xffe08a, 'light bulb switching on (an idea)'], book: [3, 0x8a3a2a, 'open book, a page turning'],
      yen: [2, 0xffc84a, 'gold coin with ¥, flipping'], crescent: [1, 0xfff0b0, 'crescent moon'], compass: [3, 0xffd27a, 'compass rose, needle settling on dir', { dir: 'N' }],
      plus: [1, 0xff7060, 'a plus sign'], calendar: [4, 0xe04848, 'calendar, a page flipping'], stars: [1, 0xfff6c0, 'n stars twinkling (the Big Dipper)', { n: 7 }],
      window: [2, 0x9a6438, 'window frame with glass'], bowl: [3, 0x3a5aa0, 'rice bowl with chopsticks'], cup: [2, 0xf0e8d8, 'cup tipping to drink', { drink: null }],
      phone: [3, 0x30a080, 'telephone receiver ringing'], train: [2, 0x40a060, 'train rolling'], car: [2, 0xd84040, 'car bouncing along'], bolt: [1, 0xffe040, 'lightning bolt flashing'],
      sun: [1, 0xffb030, 'sun with turning rays'], cloud: [1, 0xf0f4ff, 'cloud drifting'], target: [1, 0xff5050, 'target rings (the middle)'], house: [2, 0xe8c890, 'a house'], pen: [2, 0xffcc30, 'a pencil writing'],
      // signs and symbols (pieces/emblem-signs.js)
      stop: [3, 0xd02828, 'Japanese stop sign (red triangle, 止まれ) wobbling on its pole', { text: '止まれ' }], check: [1, 0x40d070, 'check mark (right, answer)'], cross: [1, 0xff4040, 'a cross shaking (wrong, no)'], exclaim: [1, 0xffd040, 'exclamation mark (important, need)'],
      equals: [1, 0x9ad0ff, 'equals sign (same)'], repeat: [1, 0x60d0a0, 'circular arrow going round (again)'], swap: [2, 0xffd27a, 'two arrows passing each other (exchange)', { other: 0x80c0ff }],
      flag: [(o) => (o.kind === 'start' ? 2 : 3), 0x40c060, 'flag waving; kind start (plain colour) / finish (checkered) / japan', { kind: 'start' }], pin: [3, 0xe04040, 'map pin dropping onto its spot (place)'],
      signpost: [2, 0xe8c890, 'signpost, boards pointing two ways (direction, way)'], ticket: [2, 0xffe8b0, 'numbered queue ticket popping up (number, turn)'], tag: [3, 0xffd060, 'price tag swinging (sell, price)'],
      pie: [2, 0xffa040, 'pie chart, one slice lifted out (part); part 0 = whole (all)', { part: 0.25, rest: null }], trophy: [1, 0xffc840, 'trophy cup (most, best)'], gem: [1, 0x9ae8ff, 'cut gem sparkling (true, genuine)'],
      onsen: [2, 0xff7050, 'hot-spring sign: bath and steam (warm)'], globe: [3, 0xd8b060, 'globe turning on its stand (world, earth)'], splash: [1, 0xff3030, 'blob of paint (a colour)'], rainbow: [6, 0xffffff, 'rainbow arcs (colour)'], frown: [2, 0xffd070, 'face shaking its head (dislike)'],
      // tools and household things (pieces/emblem-tools.js)
      knife: [2, 0x5a3a20, 'kitchen knife chopping (cut)'], umbrella: [2, 0x3a7ad0, 'open umbrella twirling'], gears: [2, 0xc0c8d8, 'two gears meshing (machine)', { other: null }], camera: [3, 0x303840, 'camera, flash firing (photo, copy)'],
      hammer: [2, 0x8a5a30, 'hammer striking (make)'], wrench: [1, 0xd8dde6, 'wrench turning (use, tool)'], scale: [2, 0xd8b060, 'balance, beam tipping (both, weigh)'], dumbbell: [1, 0x606878, 'dumbbell lifted (strong)'],
      weight: [1, 0x505860, 'heavy weight thudding down (heavy)'], thermometer: [3, 0xff3030, 'thermometer rising to level (degrees; hot 0.9, cold 0.15)', { level: 0.85 }], ruler: [2, 0xf0d070, 'ruler (measure)'],
      suitcase: [2, 0xd06030, 'suitcase rolling (travel)'], briefcase: [2, 0x6a4024, 'briefcase (business, matters)'], bag: [1, 0xe0a050, 'shopping bag swinging (hold, carry)'], box: [3, 0xc89a60, 'cardboard box, flaps opening (a thing)'],
      mirror: [3, 0xd8b060, 'hand mirror, glint sweeping (self)'], glasses: [1, 0x303040, 'pair of glasses'], shirt: [1, 0x4a8ae0, 'T-shirt (clothes, wear)'], shoe: [2, 0xd04040, 'shoe stepping (shoes)'], bed: [3, 0x5a7ad0, 'bed (sleep, lodging)'],
      pot: [2, 0x808890, 'cooking pot, lid rattling (cooking)'], spoon: [1, 0xd8dde6, 'spoon (taste)'], plate: [2, 0xf0f0f0, 'plate with food, tilting (dish)'], frame: [4, 0xd8a040, 'framed picture (picture)'], film: [3, 0xc8ccd6, 'film reel turning, film unrolling (movie)'],
      mic: [2, 0xc0c8d0, 'microphone (sing)'], speaker: [4, 0xffe08a, 'loudspeaker, sound rings going out (sound)'], sheet: [2, 0xd03030, 'worksheet, ticked lines (homework, topic)'], ring: [2, 0xffd060, 'ring with a gem (husband, marriage)'],
      mask: [3, 0xfaf4ea, 'noh mask (face)'], alarm: [3, 0xe04040, 'alarm clock ringing (wake up)'], bow: [3, 0x8a5a30, 'bow drawn, arrow loosed (pull)'], boomerang: [1, 0xe0a040, 'boomerang flying out and back (return)'],
      // animals, plants, vehicles, buildings (pieces/emblem-life.js)
      bird: [4, 0x60a0e0, 'little bird flapping (bird, chirp, fly)'], cow: [3, 0xf4f0ea, 'cow head (cow)'], snail: [2, 0xd08040, 'snail creeping (slow, late)'], leaf: [2, 0x5ab840, 'big leaf swaying (leaf)'],
      flower: [3, 0xffd030, 'flower turning (flower; yellow by default)'], bike: [3, 0x40a0e0, 'bicycle (ride)'], plane: [1, 0xf8f8f8, 'paper plane gliding (paper, fly)'], boat: [2, 0xc04030, 'sailing boat rocking (ocean, ship)'],
      stairs: [2, 0xd8c8a8, 'steps, a ball bouncing down them (steps, descend)', { ball: null }], blocks: [3, 0xe04848, 'blocks stacking up (build)'], puzzle: [2, 0xffa040, 'two puzzle pieces snapping together (fit)', { other: null }],
      pill: [2, 0xe04848, 'capsule pill (illness, medicine)'], hospital: [3, 0xe03030, 'hospital, red cross (hospital)'], museum: [1, 0xe8dcc8, 'columned hall (building, hall)'], shield: [2, 0x5a7ad0, 'shield (sturdy, protect)'], letter: [2, 0xd03030, 'envelope (letter)'],
    }),
  },
};

// tip particles each reveal brings (draw: its own `tip` option); keep in step with pieces/reveal.js TIPS
export const REVEAL_TIPS = { ignite: ['front', 'sparks'], grow: ['sprouts'], brush: ['ink'], stamp: ['dust'] };
export const DEFAULT_RECIPE = { motion: { type: 'sway', amp: 0.25 } };       // cards with no "effect"
const SLOT_DEFAULTS = { material: 'glow', reveal: 'draw', backdrop: 'plain', motion: 'none', emblem: null };
const RECIPE_KEYS = new Set([...SLOTS, 'parts', 'options']);
const OPTION_KEYS = new Set(['start', 'seed']);

// "type", "type:variant" or { type, ...options } -> { type, ...options } (aliases resolved), or null for none.
export function parseSpec(slot, v) {
  if (v === null || v === undefined || v === 'none' && slot === 'emblem') return null;
  let spec = typeof v === 'string' ? (() => { const [type, variant] = v.split(':'); return { type, ...(variant !== undefined ? { [PIECES[slot]?.[type]?.variant ?? 'variant']: isNaN(+variant) ? variant : +variant } : {}) }; })() : { ...v };
  const piece = PIECES[slot]?.[spec.type];
  if (piece?.alias) spec = { ...piece.alias, ...spec, type: piece.alias.type };
  return spec;
}

// A card's "effect" -> { bespoke: id } or a full recipe with every slot filled and options defaulted.
export function normalizeRecipe(effect, looks = {}) {
  if (typeof effect === 'string') return { bespoke: effect };
  const r = effect ?? DEFAULT_RECIPE, out = { options: { ...(r.options || {}) }, parts: {} };
  for (const slot of SLOTS) {
    if (LIST_SLOTS.includes(slot)) { out[slot] = (r[slot] || []).map((p) => withDefaults(slot, parseSpec(slot, p))); continue; }
    out[slot] = withDefaults(slot, parseSpec(slot, r[slot] === undefined ? SLOT_DEFAULTS[slot] : r[slot]));
  }
  for (const [el, p] of Object.entries(r.parts || {})) {
    const look = { ...(looks[el] || {}), ...(p || {}) };
    out.parts[el] = { material: look.material ? withDefaults('material', parseSpec('material', look.material)) : null, motion: look.motion ? withDefaults('motion', parseSpec('motion', look.motion)) : null };
  }
  return out;
}
const COLOR_KEYS = ['color', 'rim', 'body', 'emissive', 'glow'];
function withDefaults(slot, spec) {
  if (!spec) return null;
  for (const k of COLOR_KEYS) if (typeof spec[k] === 'string' && /^#[0-9a-f]{6}$/i.test(spec[k])) spec[k] = parseInt(spec[k].slice(1), 16);   // "#ffc860" in JSON
  const piece = PIECES[slot][spec.type];
  return piece ? { ...piece.opts, ...spec } : spec;
}

// Problems with a card's "effect" (empty = fine). components: the kanji's KanjiVG components, to check "parts".
export function validateRecipe(effect, { bespokeIds = [], components = null } = {}) {
  if (effect === undefined) return [];
  if (typeof effect === 'string') return bespokeIds.includes(effect) ? [] : [`unknown bespoke effect "${effect}" (known: ${bespokeIds.join(', ') || 'none'})`];
  const out = [];
  for (const k of Object.keys(effect)) if (!RECIPE_KEYS.has(k)) out.push(`unknown recipe key "${k}" (slots: ${[...RECIPE_KEYS].join(', ')})`);
  for (const k of Object.keys(effect.options || {})) if (!OPTION_KEYS.has(k)) out.push(`unknown option "${k}" (known: ${[...OPTION_KEYS].join(', ')})`);
  const check = (slot, v, where = slot) => {
    const spec = parseSpec(slot, v);
    if (!spec) return;
    const piece = PIECES[slot][spec.type];
    if (!piece) return out.push(`${where}: unknown ${slot} "${spec.type}" (known: ${Object.keys(PIECES[slot]).join(', ')})`);
    for (const k of Object.keys(spec)) if (k !== 'type' && !(k in piece.opts)) out.push(`${where}: unknown option "${k}" for ${spec.type} (known: ${Object.keys(piece.opts).join(', ') || 'none'})`);
    if (spec.preset && slot === 'material' && !MATERIALS[spec.preset]) out.push(`${where}: unknown material preset "${spec.preset}"`);
    if (spec.preset && slot === 'backdrop' && !SKIES[spec.preset]) out.push(`${where}: unknown sky preset "${spec.preset}"`);
    if (spec.tip && !PARTICLE_KINDS[spec.tip]?.tip) out.push(`${where}: unknown tip particles "${spec.tip}"`);
  };
  for (const slot of SLOTS) if (!LIST_SLOTS.includes(slot) && effect[slot] !== undefined) check(slot, effect[slot]);
  for (const [slot, max, what] of [['particles', MAX_PARTICLE_LAYERS, 'particle layers'], ['scene', MAX_SCENE_PROPS, 'scene props']]) {
    if (effect[slot] !== undefined && !Array.isArray(effect[slot])) out.push(`${slot} must be a list`);
    else if ((effect[slot] || []).length > max) out.push(`at most ${max} ${what}`);
    else (effect[slot] || []).forEach((p, i) => check(slot, p, `${slot}[${i}]`));
  }
  (effect.scene || []).forEach((p, i) => { const sp = parseSpec('scene', p); if (sp?.on && components && !components.some((c) => c.element === sp.on)) out.push(`scene[${i}]: "${sp.on}" is not a component of this kanji`); });
  for (const [el, p] of Object.entries(effect.parts || {})) {
    if (components && !components.some((c) => c.element === el)) out.push(`parts: "${el}" is not a component of this kanji (KanjiVG has: ${[...new Set(components.map((c) => c.element))].join(' ') || 'none'})`);
    for (const k of Object.keys(p || {})) if (!['material', 'motion'].includes(k)) out.push(`parts.${el}: only material and motion can be set`);
    if (p?.material) check('material', p.material, `parts.${el}.material`);
    if (p?.motion) check('motion', p.motion, `parts.${el}.motion`);
  }
  return out;
}

// Static cost estimate of a normalized recipe for a kanji with n strokes (the content check compares it with EFFECTS.budget).
// components (KanjiVG, data/kanji-*.json) are needed for parts and props placed on components. A word passes its glyphs
// ([{ strokes, components, recipe }], see plan.js) instead.
export function estimateCost(r, n, components = [], glyphs = null) {
  const sum = cost(), add = (c) => { sum.drawCalls += c.drawCalls; sum.particles += c.particles; sum.pointLights += c.pointLights; };
  const pools = new Set();
  for (const part of glyphs ? planWord(r, glyphs) : planKanji(r, components, n)) add(PIECES.material[part.material.type].cost(part.material, part.strokes.length));
  if (glyphs) components = glyphs.flatMap((g) => g.components ?? []);
  add(PIECES.reveal[r.reveal.type].cost(r.reveal));
  for (const k of REVEAL_TIPS[r.reveal.type] ?? (r.reveal.tip ? [r.reveal.tip] : [])) pools.add(PARTICLE_KINDS[k].pool);
  for (const p of r.particles) { add(PIECES.particles[p.type].cost(p)); pools.add(PARTICLE_KINDS[p.type].pool); }
  for (const p of r.scene) add(PIECES.scene[p.type].cost(p, n, { components }));
  add(PIECES.backdrop[r.backdrop.type].cost(r.backdrop));
  if (r.emblem) add(PIECES.emblem[r.emblem.type].cost(r.emblem));
  sum.drawCalls += pools.size;
  return sum;
}

// One-line summary of a normalized recipe, e.g. "heat · ignite · flames+embers · halo · none · —".
export function describeRecipe(r) {
  if (r.bespoke) return `bespoke: ${r.bespoke}`;
  const v = (slot, s) => { if (!s) return '—'; const k = PIECES[slot]?.[s.type]?.variant; return k && s[k] !== null && s[k] !== undefined ? `${s.type}:${s[k]}` : s.type; };
  const parts = Object.entries(r.parts).map(([el, p]) => `${el}=${[p.material && v('material', p.material), p.motion && v('motion', p.motion)].filter(Boolean).join('/')}`);
  return [v('material', r.material), v('reveal', r.reveal), r.particles.map((p) => v('particles', p)).join('+') || '—', ...(r.scene.length ? [r.scene.map((p) => v('scene', p)).join('+')] : []), v('backdrop', r.backdrop), v('motion', r.motion), v('emblem', r.emblem)].join(' · ') + (parts.length ? ` · parts ${parts.join(' ')}` : '');
}
