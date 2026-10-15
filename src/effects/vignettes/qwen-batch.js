// Scenes Qwen builds on brad's PC (plans/qwen/queue/014-016): one module per plan.
import { SCENES as POWER } from './q-power.js';
import { SCENES as PART } from './q-part-ways.js';
import { SCENES as PONDER } from './q-ponder.js';

export const SCENES = { ...POWER, ...PART, ...PONDER };
