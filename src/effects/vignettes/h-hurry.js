// Haiku plan h6 (card 6025, 急 "hurry"): scene q-late-run. A man with a briefcase runs flat out across the street, sweat
// flying off his head and speed lines behind him; at 1.1-1.7 s he slows, lifts his left hand to look at his watch, an
// exclamation mark pops over him, then he runs on. An alarm clock rings overhead and a speech bubble says いそげ!.
//   loop 3.4 s: 0-0.3 he fades in at the back right; 0.3-2.5 he runs the path to the front left (faster at the end);
//   2.6-3.0 he fades out; 3.0-3.4 nothing. The clock rings and its hands race the whole loop.
import * as THREE from 'three';
import { acts, bump } from './timeline.js';
import { many, DROP } from '../pieces/kit-things.js';
import { emblemProp } from '../pieces/kit-props.js';
import { G } from '../pieces/shape-kit.js';
import { between } from './helpers.js';
import { grow } from './step1-kit.js';
import { ADULT, DOWN, pop, person, briefcase, speech } from './q-common.js';

const LOOP = 3.4, RUN0 = 0.3, RUN1 = 2.5, YAW = Math.atan2(-0.7, 0.75);   // the path's direction: front left
// his progress along the path by time: a speed profile (slow at 1.4 s, faster after 1.9 s), integrated once
const speed = (v) => 1 - 0.7 * bump(v, 1.1, 0.6) + 0.6 * between(v, 1.9, 2.5), N = 220, CUM = [0];
for (let i = 0; i < N; i++) CUM.push(CUM[i] + speed(RUN0 + (RUN1 - RUN0) * (i + 0.5) / N) * (RUN1 - RUN0) / N);
for (let i = 0; i <= N; i++) CUM[i] /= CUM[N];
const progress = (v) => { if (v <= RUN0) return 0; if (v >= RUN1) return 1; const x = (v - RUN0) / (RUN1 - RUN0) * N, i = Math.floor(x); return CUM[i] + (CUM[i + 1] - CUM[i]) * (x - i); };
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3();

function lateRun(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const P = (x, y, z) => new THREE.Vector3(B.maxX + x * u, floor + y * u, z * u);   // group-local: x from the kanji's right edge, y up from the ground
  const runner = new THREE.Group();                                                // the man, his sweat and speed lines: the feet at its origin, faces its +z
  const man = person('guy2', u, ADULT), bag = briefcase(u);
  const drops = many(DROP(u * 1.8), 6, 0.6), lines = many([[G.box(0.22 * u, 0.012 * u, 0.012 * u), 0xffffff]], 3, 0.9);
  const exWrap = new THREE.Group(), exclaim = emblemProp('exclaim', 0.2 * u);
  exWrap.add(exclaim); exWrap.name = 'exclaim';
  bag.name = 'briefcase';
  runner.add(man.group, bag, drops, lines, exWrap);
  const clock = emblemProp('alarm', 0.25 * u), hands = clock.children[0].children[2];   // the alarm's hands: its third mesh
  clock.children[0].children[0].name = 'clock';   // the alarm's body (its centre is the clock's centre)
  const bubble = speech(u, 'いそげ!', { h: 0.11, flip: true });
  group.add(runner, clock, bubble);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, LOOP), pre = A.u < 0, v = pre ? 0 : A.v;
      // where he is: the path, the fades, the slow-down while he looks at his watch
      const p = progress(v), x = 1.3 - 0.7 * p, z = -0.4 + 0.75 * p;
      const k = between(v, 0, 0.3) * (1 - between(v, 2.6, 3.0)), run = 1 - bump(v, 1.4, 0.6), watch = between(v, 1.1, 1.3) * (1 - between(v, 1.5, 1.7));
      runner.position.copy(P(x, 0, z)); runner.rotation.y = YAW;
      // the fades: his own materials (cloned per actor) and the briefcase go transparent; he stays in the scene at full size
      for (const mt of [...man.materials, bag.material]) { mt.opacity = k; mt.transparent = k < 1; }
      // the man: a run cycle; the left hand up to his eyes (his watch) with the head tipped down to it
      man.pose('Run', t);
      man.turn('Head', 0.15 * watch);
      man.handTo('L', man.at('eyes', v2, 0.1, -0.17, -0.08), watch, { out: 0.3, down: 0.8 });
      // the briefcase: its handle (the top of the grip) in his right hand, palm down on it; the hand holds it from above
      const ws = runner.getWorldScale(v1).y, r = 0.043 * u * ws;
      man.grip('R', man.local(-0.2, 0.5, 0.1, v3), DOWN, r, 1, { out: 0.9, down: 0.5 });
      man.hold(bag, 'R', runner, r);
      // an exclamation mark over his head while he stops to look (it stands clear of the clock)
      const ex = between(v, 1.2, 1.35) * (1 - between(v, 1.5, 1.7));
      exWrap.visible = ex > 0.01; exWrap.scale.setScalar(grow(ex)); exWrap.position.copy(runner.worldToLocal(man.at('over', v4, 0, 0.15, 0.12)));
      // sweat: six drops fly off his head backwards while he runs
      const gate = between(v, RUN0, 0.5) * (1 - between(v, 2.4, RUN1)) * run, head = runner.worldToLocal(man.at('over', v2, 0, -0.05, -0.05));
      for (let i = 0; i < 6; i++) {
        const f = (v * 1.4 + i / 6) % 1, side = i % 2 ? 0.05 : -0.05;
        drops.set(i, head.x + side * u * f, head.y + u * (0.12 * f - 0.25 * f * f), head.z - 0.35 * u * f, Math.sin(Math.PI * f) * gate);
      }
      drops.commit();
      // three thin speed lines trailing behind him, flickering
      for (let i = 0; i < 3; i++) lines.set(i, (i - 1) * 0.1 * u, (0.4 + 0.1 * i) * u, (-0.32 - 0.07 * i) * u, gate * (0.6 + 0.4 * Math.sin(v * 18 + i * 2)), 0, Math.PI / 2, 0);
      lines.commit();
      // the alarm clock rings over the street: it shakes and its hands race round
      clock.position.copy(P(1.0, 1.0, -0.1)); clock.position.x += 0.006 * u * Math.sin(t * 60); clock.rotation.z = 0.12 * Math.sin(t * 45);
      hands.rotation.z = -t * 9;
      // いそげ! pops near him at the start
      const say = between(v, 0.5, 0.7) * (1 - between(v, 1.0, 1.2)), at = P(1.3, 1.13, -0.05);
      pop(bubble, say, at.x, at.y, at.z);
    },
  };
}

export const SCENES = { 'q-late-run': lateRun };
