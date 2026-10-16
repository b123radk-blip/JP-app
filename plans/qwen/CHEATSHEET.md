# Cheat sheet: building a scene

Read this with every plan. The finished example to copy from is `src/effects/vignettes/q-pour.js` (注: a girl pours a jug
into a glass). It shows everything below in about 80 lines.

## Your three tools (use them instead of guessing)

| Tool | Use it to | Time |
|---|---|---|
| `check_goals` | see which goals FAIL, with the measured numbers, plus faults over the whole loop | ~8 s |
| `measure` | get exact numbers: where a hand, head, foot or prop is at a moment, how big a model really is | ~6 s |
| `try_value` | try a change (exact old text -> new text) and see what it does to the goals, **without keeping it** | ~15 s |

- Before changing a number to fix a FAIL, `measure` the two things the goal names at the failing moment. Then work out
  the change from the numbers. Don't guess.
- If you're not sure a change helps, `try_value` it first. When it helps, make the same edit with your edit tool.
- `try_value` only changes files under `src/` and `content/` and always puts the file back.
- Numbers are in u (the kanji's height): x from the kanji's right edge, y above the ground, z toward the viewer.

## A scene file

```js
// <what the scene shows, one line per beat with its seconds>
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { actor } from './model-kit.js';
import { between } from './helpers.js';
function myScene(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;   // B.maxX: the kanji's right edge
  const who = actor('gal2', 0.9 * u);              // ADULT 0.9, TEEN 0.75, KID 0.55 (q-common.js)
  group.add(who.group);
  const loop = 6;
  return { group, step(t) {
    const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;   // pre: the strokes are still drawing
    const T = timeline(v, { lift: [0, 1.2], back: [4, 0.6] });         // each beat eases 0 -> 1
    who.pose('Idle', t);                           // ALWAYS first, every frame, before any gesture
    who.group.position.set(B.maxX + 1 * u, floor, 0.05 * u);
  } };
}
export const SCENES = { 'my-scene': myScene };
```

Rules: every frame is a pure function of t (no state, no `Math.random`). The end of the loop must look like its start.
Register the scene in `vignettes/index.js` and its catalog entry where the plan says.

## People (model-kit.js), all positions in world space

- `a.pose(clip, t)` first. Each model has its own clips (docs/MODELS.md lists them; most people have `Idle`, `Walk`,
  `Run`, `SitDown`, `Victory`, `PickUp`). Use only a clip that row lists.
- Turn the whole person: `a.group.rotation.y` (0 faces the viewer; `-Math.PI / 2` faces left, toward the kanji).
- Reach: `a.handTo('R', worldPoint, k)`. Point in the person's own frame: `a.local(x, y, z)` (in heights, x to its
  left, z to its front).
- Hold a thing: `a.grip('R', centre, toward, r, k)` then `a.hold(prop, 'R', group, r)`. The palm rests against the
  thing (radius r, world units). It never goes inside the fist, because the fist has no fingers.
- Gestures (k from 0 to 1): `toMouth sip toEar cupEar shadeEyes wave point holdOut bow nod shake write`.
- Bend: `a.turn('Abdomen' | 'Torso' | 'Head', ax, ay, az)` (+ax tips forward).
- Body points: `a.at('mouth' | 'eyes' | 'earR' | 'chest' | 'lap' | 'over')`.

## Props

- `solidProp([[G.box(w, h, d, x, y, z), 0xcolor], [G.cyl(rTop, rBot, h, x, y, z), 0xcolor]], glow)` from
  `pieces/kit-rig.js` and `pieces/shape-kit.js`. Sizes are in world units, so multiply by u.
- **Anything worn on a head** (hat, cap, helmet): never guess its size or place. Size it from the real head with
  `a.headR(depth)` (the head and hair's radius `depth` below its top, in heights; times `ADULT * u` for world units)
  and put it on every frame with `a.wear(hat, group, r)`: it slides a hat whose rim's inner radius is r (heights) down
  the head until it fits, centred on the crown and turned with the head (the hat's pivot is the middle of its rim).
  Example: the 試 cap, `r = a.headR(0.11) + 0.01`; a big hat that drops over the eyes, `a.headR(0.21) + 0.012`.
  A `fits` goal measures it: how much of the head and hair the hat covers, how far hair sticks out, how far off-centre.
  If it FAILs, change r or the hat's height; never shrink the head.
- **Anything worn on the face** (glasses, a mask): `a.shape().eyes` gives the measured eyes (in heights: `apart` from
  the outer edge of one eye to the other's, `half` half the face's width at the eyes, `z` the face's front); put it on
  every frame with `a.onEyes(thing, group, { out })` (its pivot goes to the middle of the eyes, `out` in front of the
  face, turned with the head). Goals can name the point `<person> eyes`. `held.jpg` (inspect without `--quick`) shows
  everything worn or held close up from the front and both sides: look at it.
- **Name every prop the goals or the plan mention**: `glass.name = 'glass'`. Goals and `measure` find things by name;
  an unnamed thing shows up only as a colour.
- Effects that fly on purpose (stars, hearts, bursts): `burst(u)`, `stars(u)`, `heart(u)` from `pieces/kit-things.js`.
  Show one with `pop(mesh, k, x, y, z)` from `q-common.js`. Don't write your own fade or pop.
- Labels and speech: `label(u, text, bg)` and `speech(u, text)` from `q-common.js`.

## Timing helpers

`between(v, a, b)`: 0 before a, rising to 1 at b. `bump(v, at, dur)`: 0, then up to 1 and back down. `timeline(v,
{ beat: [at, dur, 'out'] })` for eased beats (`smooth`, `in`, `out`, `back`, `bounce`).

## Common faults and their fixes

- A FLOATS ABOVE / SUNK INTO gap of N u: move that thing's y by exactly N u, the other way.
- A hand that doesn't reach: check the arm length with `measure` (shoulder to hand). If the target is farther away,
  move the person closer. Don't stretch the arm.
- A person under 85% visible: something sits between them and the viewer. Move the thing aside or the person forward
  (+z).
- Something passes through a body: `measure` both at that moment and move one by the overlap plus 0.02 u.
