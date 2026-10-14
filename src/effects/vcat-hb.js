// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-late-run': VM(pdc('guy2') + 9, '急 (guy2): a man with a briefcase runs flat out across the street, sweat flying, looks at his watch and runs faster; an exclamation mark pops over him, a speech bubble says いそげ!, and a big alarm clock rings overhead with its hands racing round', ['guy2']),
};
