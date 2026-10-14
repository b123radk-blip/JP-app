// Scenes of the Haiku batch (plans/haiku/h4-h13): one module per plan, so parallel builders never edit the same file.
import { SCENES as DECIDE } from './h-decide.js';
import { SCENES as SEA } from './h-sea.js';
import { SCENES as HURRY } from './h-hurry.js';
import { SCENES as LAUNCH } from './h-launch.js';
import { SCENES as NARROW } from './h-narrow.js';
import { SCENES as PLAY } from './h-play.js';
import { SCENES as BIRD } from './h-bird.js';
import { SCENES as FORGET } from './h-forget.js';
import { SCENES as CORRECT } from './h-correct.js';
import { SCENES as NEXT } from './h-next.js';

export const SCENES = { ...DECIDE, ...SEA, ...HURRY, ...LAUNCH, ...NARROW, ...PLAY, ...BIRD, ...FORGET, ...CORRECT, ...NEXT };
