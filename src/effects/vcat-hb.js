// Vignette catalog entries of the Haiku batch (plans/haiku/h4-h13; spread into vignette-catalog.js). One line per plan:
// add yours just above the closing brace (git merges these lines with merge=union, see .gitattributes).
import { VM, pdc } from './vcat-kit.js';

export const HB = {
  'q-rocket-launch': VM(pdc('guy2') + 13, '発 (guy2): a rocket stands on its launch pad, a countdown 3, 2, 1 pops over it, smoke bursts out and a flame flickers under it, and it lifts off into the sky while a boy raises both arms, jumps and cheers (わーい!) (departure)', ['guy2']),
  'q-bird-branch': VM(8, '鳥 (plan h10, models): a bird swoops down onto a branch of a small tree, hops along it, turns its head, sings three notes (♪), then flies up and right and fades out', ['pigeon', 'pigeonFlying']),
  'q-stepping-stones': VM(pdc('gal2') + 13, '次 (gal2): a girl hops across a pond from stone to stone; a yellow arrow and a つぎ! bubble show the next stone, which glows; she waves on the last one, then fades out and back in on the first', ['gal2']),
  'q-late-run': VM(pdc('guy2') + 9, '急 (guy2): a man with a briefcase runs flat out across the street, sweat flying, looks at his watch and runs faster; an exclamation mark pops over him, a speech bubble says いそげ!, and a big alarm clock rings overhead with its hands racing round', ['guy2']),
};
