// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-narrow-gap': VM(pdc('guy2') + 5, '細 (models): a man walks up to a very narrow gap between two brick walls and bumps (a ! pops), turns sideways, breathes in and squeezes through toward the learner, then wipes his brow (ふう)', ['guy2']),
};
