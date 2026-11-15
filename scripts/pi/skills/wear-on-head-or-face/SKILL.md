---
name: wear-on-head-or-face
description: Put a hat, cap, helmet, glasses or mask on a person in a card scene, or fix a "fits" goal. Use whenever anything is worn on a head or face.
---

# Worn on a head or face

Never size or place a worn thing by eye or by hand-typed numbers. The kit measures the real head and hair.

## Hats, caps, helmets
- Rim size from the head: `const r = a.headR(depth) + 0.01;` (heights; `depth` = how far below the top of the head the
  rim sits). Cap that sits high: `a.headR(0.11) + 0.01`. Big hat down to the eyebrows: `a.headR(0.21) + 0.012`.
- Build the hat with its pivot at the middle of its rim (rim at y 0, crown above). World size = heights x `ADULT * u`.
- Every frame, after the pose: `a.wear(hat, group, r)`. It slides the hat down until it fits, centres it on the crown and
  turns it with the head. Don't set the hat's position yourself.
- A `fits` goal FAIL: change `r` (bigger r sits lower) or the hat's height. Never shrink the head or move the hat by hand.

## Glasses, masks
- `const e = a.shape().eyes;` (heights): `half` = half the face's width at the eyes, `z` = front of the face.
  `e.apart` can be tiny on some models: don't space lenses from it.
- Lenses: centres about +-0.06 heights, radius about 0.045, thin wire (tube 0.008). They must not overlap: each eye
  shows through its own ring. End pieces stop at `e.half`; temples run back to the ears.
- Every frame: `a.onEyes(glasses, group, { out: 0.01 })` (pivot = middle between the lenses).

## Check it
Run `inspect.mjs` without `--quick` and open `held.jpg`: front and both sides close up. Look for hair poking through,
a hat floating above the hair, lenses over the nose, an end piece sticking out past the face.
