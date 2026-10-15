// Haiku plan h16 (card 51ac, 冬 winter): a girl in a red scarf and woolly hat builds a snowman in the falling snow.
// Scene type: q-snowman. Loop 7 s. 0-2.4 she walks in behind a snowball that grows as it rolls left, pushing it with both
// hands, bent over; 2.4-2.8 she turns to the head ball beside her; 2.6-3.4 she lifts it onto the body; 3.4-4.0 the eyes,
// nose and buttons pop in; 4.0-5.6 she shivers, arms round herself, さむい!; 5.6-6.4 she waves at the learner; 6.4-7.0 the
// snowman melts back to a small ball, the head goes away, for the loop.
import * as THREE from 'three';
import { acts, tremble } from './timeline.js';
import { between } from './helpers.js';
import { person, speech, pop, KID } from './q-common.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';

const LOOP = 7, D = Math.PI / 180;
const YAW = -60 * D;                                      // her turn all loop: the head ball lies at her left, reached by a lean
const sm = (x) => x * x * (3 - 2 * x);                    // ease 0..1
const shown = (m, k) => { m.visible = k > 0.01; m.scale.setScalar(Math.max(1e-3, k)); };
const mix = (a, b, f) => a.map((x, i) => x + (b[i] - x) * f);
// the head ball's hand grips: start (beside her) and top (on the body), offsets from its centre in u; the hands keep GR from
// its centre (its radius 0.11 and the fist), turning round it from the start angle to the top angle
const RS = [-0.1, 0, -0.06], RT = [0.135, 0, 0.05], LS = [-0.1, 0, 0.06], LT = [0.1, 0.03, -0.06], GR = 0.15;

function snowman(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY;
  const X = (x) => B.maxX + x * u, Y = (y) => floor + y * u, Z = (z) => z * u;
  const P = (x, y, z) => new THREE.Vector3(X(x), Y(y), Z(z));   // group space, from u
  const white = 0xffffff, coal = 0x2a2a2a, carrot = 0xff8a2a, red = 0xd02828;
  const snow = solidProp([[G.sphere(0.5 * u, 0, 0.015 * u, 0, 0.95, 0.03, 0.7), 0xeef4ff]], 0.3);
  snow.name = 'snowfield'; snow.position.set(X(0.93), floor, 0);
  const body = new THREE.Group(), ball = solidProp([[G.sphere(0.17 * u), white]], 0.3);
  const buttons = solidProp([[G.sphere(0.022 * u, 0, 0.06 * u, 0.159 * u), coal], [G.sphere(0.022 * u, 0, -0.01 * u, 0.17 * u), coal], [G.sphere(0.022 * u, 0, -0.07 * u, 0.155 * u), coal]], 0.2);
  ball.name = 'snowbody'; body.add(ball, buttons); body.name = 'snowbody';
  const head = new THREE.Group(), hball = solidProp([[G.sphere(0.11 * u), white]], 0.3);
  const eyes = solidProp([[G.sphere(0.018 * u, -0.04 * u, 0.04 * u, 0.095 * u), coal], [G.sphere(0.018 * u, 0.04 * u, 0.04 * u, 0.095 * u), coal]], 0.2);
  const nose = solidProp([[G.cyl(0, 0.022 * u, 0.08 * u, 0, 0, 0.13 * u, Math.PI / 2), carrot]], 0.5);   // a cone pointing at the learner
  hball.name = 'snowhead'; head.add(hball, eyes, nose); head.name = 'snowhead';
  const scarf = solidProp([[new THREE.TorusGeometry(0.045 * u, 0.014 * u, 10, 24).rotateX(Math.PI / 2), red]], 0.4);
  const hat = solidProp([[new THREE.SphereGeometry(0.075 * u, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), red]], 0.4);
  const who = person('gal2', u, KID), bubble = speech(u, 'さむい!', { h: 0.12 });
  group.add(snow, body, head, who.group, scarf, hat, bubble);
  return {
    group,
    step(t) {
      const A = acts(ctx, t, LOOP), pre = A.u < 0, v = pre ? 0 : A.v;
      // the snowball: grows as it rolls left (0-2.4), melts back to a small ball where it started (6.4-7)
      const roll = between(v, 0, 2.4), me = sm(between(v, 6.4, 7));
      const R = 0.17 * sm(roll) * (1 - me), bx = 0.95 - 0.23 * sm(roll);   // u: it grows from nothing; it melts in place
      body.visible = R > 0.004; body.position.copy(P(bx, 0.03 + R, 0.02)); body.scale.setScalar(Math.max(1e-3, R / 0.17));
      body.rotation.z = (0.95 - bx) / 0.17;               // rolling left: the distance come over its radius
      // the head ball: beside her on the snow from 2.2, lifted onto the body (2.6-3.4) on an arc toward the learner;
      // in the melt (6.4-7) it shrinks with the body and stays on top of it, then goes (6.95-7)
      const lift = sm(between(v, 2.6, 3.4)), ap = Math.sin(Math.PI * lift), hs = R / 0.17;
      const hx = 1.15 - 0.43 * lift, hy = 0.14 + 0.33 * lift + 0.3 * ap, hz = 0.15 - 0.13 * lift + 0.15 * ap;   // over her head on the way
      const hp = me > 0 ? [bx, 0.03 + 2 * R + 0.11 * hs, 0.02] : [hx, hy, hz];   // in the melt it sits on the body, rigidly
      head.position.copy(P(hp[0], hp[1], hp[2]));
      const hk = between(v, 2.2, 2.4) * (1 - between(v, 6.95, 7));
      head.visible = hk > 0.01; head.scale.setScalar(Math.max(1e-3, hs * hk));
      // the features pop in one after another (3.4-4.0); the buttons go with the melt
      shown(eyes, between(v, 3.4, 3.55)); shown(nose, between(v, 3.55, 3.7));
      shown(buttons, between(v, 3.7, 3.85) * (1 - between(v, 6.6, 6.8)));
      // the girl: walks in to the snowball (0-2.4), turns to the head (2.4-2.8), lifts it, turns back to the snowman
      const walk = 1 - roll, yaw = YAW;
      const shiv = between(v, 3.95, 4.1) * (1 - between(v, 5.5, 5.6));
      who.group.position.copy(P(0.98 + 0.2165 * walk, 0.03, 0.07 - 0.125 * walk)); who.group.position.x += 0.012 * u * shiv * tremble(v, 6);
      who.group.rotation.y = yaw;
      who.pose(v < 2.4 ? 'Walk' : 'Idle', v);
      who.bow(0.5 * (1 - between(v, 2.2, 2.4)));
      const lean = between(v, 2.4, 2.7) - between(v, 2.9, 3.3);   // leans to her left, toward the head ball
      who.turn('Abdomen', 0, 0, -0.5 * lean); who.turn('Torso', 0, 0, -0.25 * lean);
      // the scarf round her neck, the hat on her head
      scarf.position.copy(group.worldToLocal(who.at('chest', new THREE.Vector3(), 0, 0.32, 0))); scarf.quaternion.copy(who.group.quaternion);
      hat.position.copy(group.worldToLocal(who.at('eyes', new THREE.Vector3(), 0, 0.19, -0.01))); hat.quaternion.copy(who.group.quaternion);
      // hands: pushing the snowball's back side (0-2.4), gripping the head ball (2.7-3.3, tracking it), arms round the
      // chest (4.0-5.6), a wave (5.6-6.4)
      const push = 1 - between(v, 2.2, 2.4);
      const back = (dz) => group.localToWorld(P(bx + R + 0.035, 0.03 + R - 0.02, 0.02 + dz));
      if (push > 0) { who.handTo('R', back(-0.05), push); who.handTo('L', back(0.05), push); }
      const pick = between(v, 2.5, 2.7) * (1 - between(v, 3.3, 3.4));
      const grip = (s, e) => { const a0 = Math.atan2(s[2], s[0]), a1 = Math.atan2(e[2], e[0]), d = a1 - a0, a = a0 + (d - 2 * Math.PI * Math.round(d / (2 * Math.PI))) * lift; return group.localToWorld(P(hx + GR * Math.cos(a), hy + mix(s, e, lift)[1], hz + GR * Math.sin(a))); };
      if (pick > 0) { who.handTo('R', grip(RS, RT), pick); who.handTo('L', grip(LS, LT), pick); }
      const wave = between(v, 5.55, 5.8) * (1 - between(v, 6.3, 6.5));
      if (shiv > 0) { who.handTo('R', who.at('chest', new THREE.Vector3(), -0.12, 0.2, 0.06), shiv); who.handTo('L', who.at('chest', new THREE.Vector3(), 0.12, 0.2, 0.06), shiv); }
      if (wave > 0) who.wave('R', wave, t);
      // さむい! over her head while she shivers
      const over = group.worldToLocal(who.at('over', new THREE.Vector3(), 0, 0.1, 0));
      pop(bubble, between(v, 4.0, 4.2) * (1 - between(v, 5.4, 5.6)), over.x - 0.1 * u, over.y + 0.2 * u, over.z);
    },
  };
}

export const SCENES = { 'q-snowman': snowman };
