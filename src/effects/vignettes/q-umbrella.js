// 傘 "umbrella" (plan 021, card w1301940): rain pours on a girl; she lifts her red umbrella, opens it over her head and
// stays dry under it. Loop 8 s; nothing moves while the strokes draw.
//   0-0.5    Idle, the closed umbrella hanging down at her right side, its tip a little off the floor, no rain yet.
//   0.5      the rain fades in (0.3 s). 0.5-1.8 she hunches and holds her left hand over her head, rain on her.
//   1.0-1.8  she swings the umbrella up (her left hand comes down); 1.8-2.4 the canopy opens over her head.
//   2.4-6.4  the rain bounces off the canopy and she sways happily: a drop over the canopy stops at its surface and turns
//            into a small splash, everywhere else it falls to the ground.
//   6.4-6.9  the rain fades out; 6.9-7.4 the canopy closes; 7.4-8 she lowers it back down by her side, so the loop ends
//            where it began.
// Her right palm presses the J hook's tube: grip() on a point of the hook's centre circle with r = the tube's radius, so
// the tube rests against the palm and never inside the fist. The umbrella group is a child of the girl (it rides her
// sway, and the inspector counts it as carried). The shaft leans about 11° toward her head and passes beside it; the
// open canopy's rim sits about 0.06u above her hair. The rain is 60 short streaks: one whose column passes through the
// open canopy stops at the cone's surface and turns into a splash, the rest fall to the ground.
import * as THREE from 'three';
import { acts, timeline, lerp } from './timeline.js';
import { actor } from './model-kit.js';
import { many, DROP } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { ADULT } from './q-common.js';

const LOOP = 8;
const HOOK = 0.035, TUBE = 0.012, SHAFT = 0.62, CR = 0.38, CH = 0.12, CAT = 0.5;   // the umbrella in u: hook, tube,
// shaft length, canopy radius / height, and how far up the shaft the canopy's middle sits (its rim 0.1u below the tip)
const A_DOWN = 2.5, A_UP = -0.2;                          // the group's turn: the shaft points down-left, then up
const HOLD_DOWN = [0.42, 0.51], HOLD_UP = [0.42, 0.64];    // her hand (u, from the kanji's right edge), down and up poses
// (the shaft is 0.62u and leans 2.5 rad, so its tip lands 0.01u above the ground only with the hand at y 0.51)
const N = 60, FALL = 0.6, TOP = 1.5;                      // the rain: n drops, one fall of TOP u in FALL s
const hash = (i, k) => (i * k) % 1;                       // a steady spread per drop: its own x, z and phase
const V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), WS = new THREE.Vector3();

function rainUmbrella(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u;
  const who = actor('gal2', ADULT * u);
  const umbrella = new THREE.Group(); umbrella.name = 'umbrella';
  const handle = solidProp([[G.torus(HOOK * u, TUBE * u, Math.PI, 0, -0.02 * u, 0, Math.PI), 0x4a2a18]], 0.25);
  const shaft = solidProp([[G.cyl(0.01 * u, 0.01 * u, SHAFT * u, 0, SHAFT * u / 2, 0), 0x303030]], 0.3);
  const canopy = solidProp([[G.cone(CR * u, CH * u, 0, 0, 0), 0xd03040]], 0.3);
  handle.name = 'handle'; shaft.name = 'shaft'; canopy.name = 'canopy';
  canopy.position.y = CAT * u;                            // the pivot is the bottom of the shaft
  umbrella.add(handle, shaft, canopy);
  who.group.add(umbrella);
  const rain = many(DROP(u).map(([g, c]) => [g.scale(0.8, 1.5, 0.8), c]), N, 0.85); rain.name = 'rain';
  const splash = many([[G.sphere(0.03 * u, 0, 0, 0, 1, 0.34, 1), 0xcfe9ff]], N, 0.85); splash.name = 'splash';
  group.add(who.group, rain, splash);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, LOOP), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { lift: [1.0, 0.8, 'out'], open: [1.8, 0.6], rainIn: [0.5, 0.3], rainOut: [6.4, 0.5], close: [6.9, 0.5], lower: [7.4, 0.6] });
      const ws = group.getWorldScale(WS).y;
      const up = T.lift * (1 - T.lower), op = T.open * (1 - T.close);
      const rainK = pre ? 0 : T.rainIn * (1 - T.rainOut);
      const shield = between(v, 0.5, 0.9) * (1 - between(v, 1.15, 1.8));
      const happy = between(v, 2.4, 2.9) * (1 - between(v, 6.4, 6.8));
      const swing = Math.sin(v * 1.0) * happy;            // a small slow sway, side to side, while she holds it up
      who.group.position.set(X(0.62) + 0.022 * u * swing, floor, 0);
      who.group.rotation.z = 0.05 * swing;
      umbrella.position.set((lerp(HOLD_DOWN[0], HOLD_UP[0], up) - 0.62) * u, lerp(HOLD_DOWN[1], HOLD_UP[1], up) * u, 0.06 * u);
      umbrella.rotation.z = lerp(A_DOWN, A_UP, up);
      canopy.scale.set(0.12 + 0.88 * op, 2.5 - 1.5 * op, 0.12 + 0.88 * op);   // closed: a narrow cone hugging the shaft
      who.pose('Idle', t);
      // under the rain she hunches and shields her head; she stands up again as the canopy opens
      const h = shield * (1 - between(v, 1.6, 2.2));
      who.turn('Abdomen', 0.22 * h); who.turn('Torso', 0.16 * h); who.turn('Head', 0.2 * h);
      who.handTo('L', who.at('over', V3, 0.06, -0.04, 0.05), shield, { out: 0.35, down: 0.3 });
      // Her right palm against the J hook's tube (grip with r = the tube's radius, so the tube rests on the palm and
      // never inside the fist): the palm under the hook's bowl, so the fist sits on the shaft's axis above the handle.
      who.grip('R', umbrella.localToWorld(V2.set(0, -(HOOK + 0.02) * u, 0)),
        V3.set(0, -1, 0).transformDirection(umbrella.matrixWorld), TUBE * u * ws, pre ? A.setup : 1);
      // the rain: every drop is a pure function of t; over the open canopy it stops at the cone's surface and splashes
      const s = v - 0.5, C = group.worldToLocal(umbrella.localToWorld(V3.set(0, CAT * u, 0)));
      const cr = CR * u * (0.12 + 0.88 * op), ch = CH * u * (2.5 - 1.5 * op) * Math.cos(umbrella.rotation.z);
      for (let i = 0; i < N; i++) {
        if (s < 0 || rainK <= 0.01) { rain.set(i, 0, 0, 0, 0); splash.set(i, 0, 0, 0, 0); continue; }
        const x = X(0.05 + 1.1 * hash(i, 0.618034)), z = (-0.2 + 0.5 * hash(i, 0.3771)) * u;
        const f = (((s + hash(i, 0.1379) * FALL) % FALL) + FALL) % FALL / FALL;
        const d = Math.hypot(x - C.x, z - C.z), on = op > 0.55 && d < cr;
        const land = on ? Math.max(0, C.y - floor + ch / 2 - (d / cr) * ch) / u : 0;
        const hit = 1 - land / TOP;                       // the share of its fall it takes to reach that height
        if (f < hit) { rain.set(i, x, floor + TOP * (1 - f) * u, z, rainK); splash.set(i, 0, 0, 0, 0); }
        else { rain.set(i, 0, 0, 0, 0); splash.set(i, x, floor + land * u, z, on ? Math.sin(Math.PI * (f - hit) / (1 - hit)) * rainK : 0); }
      }
      rain.commit(); splash.commit();
    },
  };
}

export const SCENES = { 'q-umbrella': rainUmbrella };
