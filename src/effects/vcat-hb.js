// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-pick-cake': VM(pdc('gal2') + 8, '決 (models): a girl cannot choose between two cakes: a big question mark over her head, her hand hovers over one and the other; then an exclamation mark, she taps the chocolate one, a green tick pops over it, she pulls it toward her, and a heart pops up', ['gal2']),
};
