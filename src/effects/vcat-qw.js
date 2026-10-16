// Vignette catalog entries of the scenes Qwen builds on brad's PC (plans/qwen/queue/014-...; spread into
// vignette-catalog.js). One line per plan: add yours just above the closing brace.
import { VM, pdc } from './vcat-kit.js';

export const QW = {
  'q-power': VM(pdc('guy3') + 8, '力 (guy3): a man bends down, grips a barbell with huge black plates and heaves it up to his chest, trembling; he drops it with a thud (the kanji jumps) and cheers with both arms up', ['guy3']),
  'q-part-ways': VM(pdc('gal2', 'guy2') + 4, '別 (gal2, guy2): two friends walk together down a path toward you; where it forks they stop, turn to each other and wave goodbye, then walk off down the two branches and wave once more from far apart, as the kanji splits in two', ['gal2', 'guy2']),
  'q-ponder': VM(pdc('grandpa') + 11, '考 (grandpa): an old man sits on a cushion before a shogi board, hand on his chin, a thought bubble with a ? over him; the ? turns into a lightbulb, his finger goes up, he leans in and moves a piece, and nods', ['grandpa']),
  'q-try-hats': VM(pdc('gal') + 9, '試 (gal): a woman tries on hats: the big brown one drops over her eyes, she shakes her head and hangs it back; the small red one fits, and she poses happily', ['gal']),
  'q-hat-wind': VM(pdc('guy', 'guy2') + 2, '帽子 (guy, guy2): a gust blows a boy\'s red cap off his head; his dad catches it by the brim and, with both hands, sets it back on the boy\'s head and tugs it snug; the boy bounces happily', ['guy', 'guy2']),
  'q-glasses': VM(pdc('grandpa') + 3, '眼鏡 (grandpa): an old man squints at the wobbly kanji, picks his glasses up from a little table, puts them on (the lenses right over his eyes, the arms back to his ears), and the kanji stops wobbling; the lenses glint', ['grandpa']),
  'q-umbrella': VM(pdc('gal2') + 6, '傘 (gal2): rain pours on a girl; she opens a red umbrella and holds it up by its handle, and the rain bounces off it while she stays dry', ['gal2']),
  'q-key-door': VM(pdc('guy3') + 6, '鍵 (guy3): a man at a locked door puts a key into the keyhole, turns it with a click, and the door swings open', ['guy3']),
};
