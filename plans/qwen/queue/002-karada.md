# Plan 002: 体 "body" (card 4f53), scene `q-exercise`

The card's scene today is a man in a hard hat doing jumping jacks on a small blue mat that floats in the sky. It reads as
"exercise", not "body". The new scene is **"Head, shoulders, knees and toes"**: a person standing on a round patch of
grass touches, with both hands, first the head, then the shoulders, then the knees (bending a little), then the toes
(bending right down). Each touched spot glows and its Japanese name pops up beside the person:
あたま、かた、ひざ、つまさき. A child should think "the parts of the body".

You change exactly two places:

1. `src/effects/vignettes/q-feel.js`: the header comment line for `q-exercise` (lines 2-3) and the function
   `exercise()` (the `// ---- 体 ----` block, lines 26-50). Nothing else in the file.
2. `src/effects/vignette-catalog.js`: the one `'q-exercise'` line (line 441).

No new imports: everything used below (`THREE`, `acts`, `bump`, `many`, `solidProp`, `G`, `label`, `pop`, `person`, `W`,
`W2`) is already imported or defined at the top of q-feel.js. Keep the `SCENES` table at the bottom as it is.

## 1. q-feel.js

Replace header lines 2-3 with:

```js
//   q-exercise 体: head, shoulders, knees and toes: on a patch of grass a person touches each with both hands in turn;
//              the touched spot glows and its name pops up (あたま、かた、ひざ、つまさき)
```

Replace the whole `// ---- 体 ----` block (the comment line and `function exercise ... }`) with exactly this:

```js
// ---- 体 ----
// the four touches: name, how far the person bends, where the hand goes (x = -1 right hand, +1 left hand; heights in the
// actor's own frame, or a head landmark so the hands follow the head) and the elbow's bend (out to the side, down)
const PARTS = [
  { name: 'あたま', bow: 0, at: (p, x) => p.at(x < 0 ? 'earR' : 'earL', W, 0.02 * x, 0.1, 0), out: 0.9, down: 0.2 },
  { name: 'かた', bow: 0, at: (p, x) => p.local(0.13 * x, 0.66, 0.03, W), out: 0.9, down: 0.6 },
  { name: 'ひざ', bow: 0.45, at: (p, x) => p.local(0.07 * x, 0.26, 0.13, W), out: 0.4, down: 0.6 },
  { name: 'つまさき', bow: 0.8, at: (p, x) => p.local(0.07 * x, 0.04, 0.14, W), out: 0.3, down: 0.4 },
];
function exercise(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.6 * u, z0 = 0.05 * u;
  const p = person(spec.who, u), names = PARTS.map((P) => label(u, P.name, '#d0603a', 0.13));
  const grass = solidProp([[G.cyl(0.42 * u, 0.42 * u, 0.03 * u, 0, 0.015 * u, 0), 0x6ab04c]], 0.35);
  const glow = many([[G.sphere(0.06 * u), 0xffe36a]], 2, 1.0);
  grass.position.set(x0, floor, z0);
  group.add(grass, p.group, glow, ...names);
  const loop = 7.5;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      p.pose('Idle', 0.2); p.group.position.set(x0, floor + 0.03 * u, z0); p.group.rotation.y = -0.2;
      // one touch every 1.5 s, each held a moment at full reach (k = 1); nothing while the strokes draw
      let on = -1, k1 = 0;
      PARTS.forEach((P, i) => {
        const k = pre ? 0 : Math.min(1, 1.6 * bump(v, 0.4 + 1.5 * i, 1.3));
        pop(names[i], k > 0.3 ? k : 0, x0 + 0.55 * u, floor + 1.1 * u, z0);
        if (k <= 0) return;
        p.bow(P.bow * k);
        p.handTo('R', P.at(p, -1), k, P); p.handTo('L', P.at(p, 1), k, P);
        on = i; k1 = k;
      });
      // the touched spot glows, pulsing, while the hands are on it
      const g = on < 0 ? 0 : Math.max(0, (k1 - 0.8) / 0.2) * (0.85 + 0.25 * Math.sin(v * 12));
      ['R', 'L'].forEach((s, j) => { group.worldToLocal(p.fist(s, W2)); glow.set(j, W2.x, W2.y, W2.z, g); });
      glow.commit();
    },
  };
}
```

## 2. vignette-catalog.js line 441

Replace the `'q-exercise'` line with:

```js
  'q-exercise': VM((o) => pdc(o.who) + 6, '体 (models): head, shoulders, knees and toes: on a patch of grass a person touches each with both hands in turn; the touched spot glows and its name pops up (あたま、かた、ひざ、つまさき)', (o) => [o.who], { who: 'guy' }),
```

The `+ 6` is the scene's own meshes: the grass (1), the glow pool (1) and the four name labels (4). If the cost check
reports a mismatch, change only that number to the built count and say so in the report.

## Checks

- `node --check src/effects/vignettes/q-feel.js` and `node --check src/effects/vignette-catalog.js`
- `npm test`
- `node scripts/check-piece-costs.mjs vignette "^q-exercise$"`
- `node scripts/orbit.mjs 4f53 --times 1.05,2.55,4.05,5.55 --out plans/qwen/renders/002-karada.jpg`
  (four columns: the moments the hands are on the head, shoulders, knees and toes)

## What the render must show (check each)

- Column 1: both hands on the sides of the head (not inside it, not floating above it); あたま label.
- Column 2: hands on the shoulders; かた label.
- Column 3: bent a little forward, hands on the knees; ひざ label.
- Column 4: bent right down, hands at the toes, near the grass but not through it; つまさき label.
- The feet stand on the grass patch (not floating above it, not sunk into it), and the patch sits on the same level as
  the bottom of the kanji. Two yellow glowing balls at the hands in every column.
- The labels sit to the right of the person, above head height, and do not cover the person or the kanji.

Number fixes you may make (at most two tries, re-render after each, say what and why): the hand targets in `PARTS`
(e.g. hands inside the head: raise the 0.1 or widen the 0.02; hands short of the knees: lower 0.26 or move 0.13), the
`bow` amounts, `x0`'s 0.6, the label position. Anything else goes in the report.

Commit message for the code and render: `体: head, shoulders, knees and toes (Qwen, plan 002)`
