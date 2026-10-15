// Vignette catalog entries of the scenes Qwen builds on brad's PC (plans/qwen/queue/014-...; spread into
// vignette-catalog.js). One line per plan: add yours just above the closing brace.
import { VM, pdc } from './vcat-kit.js';

export const QW = {
  'q-power': VM(pdc('guy3') + 8, '力 (guy3): a man bends down, grips a barbell with huge black plates and heaves it up to his chest, trembling; he drops it with a thud (the kanji jumps) and cheers with both arms up', ['guy3']),
  'q-part-ways': VM(pdc('gal2', 'guy2') + 4, '別 (gal2, guy2): two friends walk together down a path toward you; where it forks they stop, turn to each other and wave goodbye, then walk off down the two branches and wave once more from far apart, as the kanji splits in two', ['gal2', 'guy2']),
  'q-ponder': VM(pdc('grandpa') + 4, '考 (grandpa): an old man sits on a cushion before a shogi board, hand on his chin, a thought bubble with a ? over him; the ? turns into a lightbulb, his finger goes up, he leans in and moves a piece, and nods', ['grandpa']),
};
