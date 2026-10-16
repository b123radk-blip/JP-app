// Scenes Qwen builds on brad's PC (plans/qwen/queue/014-022): one module per plan.
import { SCENES as POWER } from './q-power.js';
import { SCENES as PART } from './q-part-ways.js';
import { SCENES as PONDER } from './q-ponder.js';
import { SCENES as HATS } from './q-try-hats.js';
import { SCENES as HATWIND } from './q-hat-wind.js';
import { SCENES as GLASSES } from './q-glasses.js';
import { SCENES as UMBRELLA } from './q-umbrella.js';
import { SCENES as KEYDOOR } from './q-key-door.js';

export const SCENES = { ...POWER, ...PART, ...PONDER, ...HATS, ...HATWIND, ...GLASSES, ...UMBRELLA, ...KEYDOOR };
