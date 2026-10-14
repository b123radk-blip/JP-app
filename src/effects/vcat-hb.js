// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-stepping-stones': VM(pdc('gal2') + 13, '次 (gal2): a girl hops across a pond from stone to stone; a yellow arrow and a つぎ! bubble show the next stone, which glows; she waves on the last one, then fades out and back in on the first', ['gal2']),
};
