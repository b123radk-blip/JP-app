// Vignette catalog entries of flag-fix round 4 (spread into vignette-catalog.js). Scenes: vignettes/q-words4.js, q-words4b.js.
import { V, VM, pdc } from './vcat-kit.js';

export const W4 = {
  'tooth-brush': V(12, '歯: a big friendly molar (crown, two roots, gum) with brown plaque spots and a worried face; a hand scrubs a toothbrush with toothpaste across its top, foam piling up; the foam pops, the tooth shines white, sparkles, grins and hops: ピカピカ! (tooth, teeth)'),
  'easel-picture': V(14, '絵: a big gilt frame on an easel; a hand with a paintbrush paints the picture inside it stroke by stroke (sky, sun, cloud, hills, a tree, flowers), everything staying inside the frame; the picture clears and it starts again (picture, drawing)'),
  'caterpillar-butterfly': V(9, 'なる: a green caterpillar on a leaf crawls along a branch, round its tip and under it, spins silk and becomes a green chrysalis; it shakes, a colourful butterfly crawls out, pumps its wings open and flutters away: なった! (to become)'),
  'hurdle-jump': VM((o) => pdc(o.who) + 7, 'できる (guy2): a runner takes a run-up and jumps at a high bar but knocks it off (あっ!), lands on the mat and hangs his head; the bar goes back up (もういちど!), he runs and jumps again, sails over it and cheers on the mat: できた! (to be able to do)', (o) => [o.who], { who: 'guy2' }),
};
