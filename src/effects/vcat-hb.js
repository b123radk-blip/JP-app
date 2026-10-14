// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-forgot-umbrella': VM(pdc('gal2') + 7, '忘 (gal2): a girl steps out of her front door, walks off, rain starts and a thought bubble shows her umbrella; she slaps her forehead (あっ!), hurries back to the umbrella stand, lifts the umbrella over her head and it opens in the rain', ['gal2']),
};
