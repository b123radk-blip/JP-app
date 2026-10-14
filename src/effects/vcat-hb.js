// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-seesaw': VM(pdc('gal2', 'guy2') + 6, '遊 (gal2, guy2): two children go up and down on a seesaw, both hands on the handle; the one on top raises an arm and stars pop over the head; わーい!', ['gal2', 'guy2']),
};
