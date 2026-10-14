// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-sea-shore': VM(pdc('gal2') + 12, '海 (models): three rounded crests roll in over a tilted deep-blue sea onto a sandy beach; a girl on the sand jumps back with both arms up, saying わあ!, when the foam reaches her feet, and an orange fish leaps out of the sea with a splash', ['gal2', 'fishOrange']),
};
