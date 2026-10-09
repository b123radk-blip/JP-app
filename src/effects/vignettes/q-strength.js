// Model scenes, strength and counting (Step 3a model pass).
//   q-heavy    重: a worker squats, grips the kanji and strains (sweat, ウーン); it lifts a hair and thumps down; he lets
//              go, staggers back and wipes his brow; outcome case: a person drags a huge suitcase that barely moves,
//              tug after tug, then flops down on it, worn out (重い)
//   q-barbell  強: a strong person lifts a barbell from his chest up over his head, holds it, sets it down and flexes
//              both arms, a burst; outcome car: he lifts a car over his head instead (強い)
//   q-rope     度: a child skips rope, the rope sweeping under her feet and over her head; a counter counts the times
//   q-same     同: two people that look exactly alike do the same jumping jacks side by side, in step; an = glows
//   q-height   丈: a child stands with her back to a height chart; her mum marks a line over her head; the child grows
//              a little and a new mark goes higher; outcome ok: a child running trips and falls; her mum calls
//              だいじょうぶ?; the child jumps up and gives a thumbs up (大丈夫)
import * as THREE from 'three';
import { acts, timeline, bump } from './timeline.js';
import { many, PUFF, DROP, burst } from '../pieces/kit-things.js';
import { solidProp } from '../pieces/kit-rig.js';
import { G } from '../pieces/shape-kit.js';
import { textPlane, emblemProp } from '../pieces/kit-props.js';
import { between, poseGlyph, liveText, puffs } from './helpers.js';
import { grow } from './step1-kit.js';
import { RIGHT, LEFT, lerp, label, pop, person, KID } from './q-common.js';

const W = new THREE.Vector3(), W2 = new THREE.Vector3();
// sweat drops flicking off a head (actor a), slots of a many(DROP)
function sweat(d, a, group, v, k, u) {
  for (let i = 0; i < d.count; i++) { const f = ((v * 1.2 + i / d.count) % 1), s = i % 2 ? 1 : -1; a.at('over', W, 0.08 * s + 0.06 * s * f, -0.08 - 0.12 * f * f, 0.02); group.worldToLocal(W); d.set(i, W.x, W.y, W.z, k * Math.sin(Math.PI * f)); }
  d.commit();
}

// ---- 重 / 重い ----
function heavy(ctx, spec, stage) {
  if (spec.outcome === 'case') return suitcase(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.22 * u;
  const p = person(spec.who, u), ugh = label(u, 'ウーン', '#8a5a2a', 0.13), drops = many(DROP(u), 4, 0.8), dust = many(PUFF(u), 5, 0.4);
  group.add(p.group, ugh, drops, dust);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { squat: [0.2, 0.5], strain: [0.7, 2.2, 'linear'], drop: [2.9, 0.15, 'in'], back: [3.1, 0.6], wipe: [3.8, 0.4], unwipe: [5.0, 0.4] });
      // he crouches at the kanji's right edge, hands under it, and heaves; it rises a hair, shaking, and thumps down
      const sq = T.squat * (1 - T.back), heave = pre ? 0 : T.strain * (1 - T.drop);
      p.pose('PickUp', 0.55 * sq, false);
      const shake = heave * Math.sin(v * 45);
      p.group.position.set(x0 + 0.25 * u * T.back * (1 - between(v, 5.6, 6.2)) + 0.004 * u * shake, floor, 0.1 * u); p.group.rotation.y = LEFT + 0.35;
      poseGlyph(stage, 0.004 * u * shake, 0.05 * u * heave, 0.02 * heave, B.maxX, B.minY);
      const edge = new THREE.Vector3(B.maxX - 0.02 * u, B.minY + 0.1 * u + 0.05 * u * heave, 0.1 * u); group.localToWorld(edge);
      p.handTo('R', edge, sq, { out: 0.6, down: 0.6 }); p.handTo('L', edge.add(W.set(0, 0.0, -0.08 * u * group.getWorldScale(W2).y)), sq, { out: 0.6, down: 0.6 });
      p.turn('Head', -0.3 * heave);
      sweat(drops, p, group, pre ? 0 : v, heave > 0.1 || (v > 3.1 && v < 4.6) ? 1 : 0, u);
      pop(ugh, heave > 0.2 ? 1 : 0, x0 + 0.1 * u, floor + 0.95 * u + 0.01 * u * shake, 0.15 * u);
      puffs(dust, 0, 5, B.maxX - 0.3 * u, floor, pre ? 0 : between(v, 2.95, 3.6), u, 0.4); dust.commit();
      const wipe = T.wipe * (1 - T.unwipe);
      p.handTo('R', p.at('eyes', W, -0.03, 0.08, 0.05), wipe, { out: 0.8, down: 0.5 });
    },
  };
}
function suitcase(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.25 * u, H = 0.42 * u;
  const p = person(spec.who, u), ugh = label(u, 'おもい…', '#8a5a2a', 0.13), drops = many(DROP(u), 4, 0.8);
  const box = solidProp([[G.box(0.6 * u, H, 0.26 * u, 0, H / 2, 0), 0x8a3a5a], [G.box(0.62 * u, 0.03 * u, 0.27 * u, 0, H * 0.5, 0), 0x5a2438], [G.box(0.03 * u, 0.04 * u, 0.04 * u, 0.33 * u, H * 0.75, 0), 0x2a2a30], [G.cyl(0.03 * u, 0.03 * u, 0.02 * u, -0.22 * u, 0.0, 0.1 * u, Math.PI / 2), 0x202020], [G.cyl(0.03 * u, 0.03 * u, 0.02 * u, 0.22 * u, 0.0, 0.1 * u, Math.PI / 2), 0x202020]], 0.4);
  group.add(box, p.group, ugh, drops);
  const loop = 7.2;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // three tugs; the case creeps a little each time; then he turns round and flops down on it
      const tugs = pre ? 0 : Math.min(3, Math.max(0, (v - 0.4) / 1.0)), step = Math.floor(tugs) + Math.min(1, (tugs % 1) * 4) * (tugs < 3 ? 1 : 0);
      const tug = tugs < 3 && !pre && v > 0.4 ? Math.sin(Math.PI * Math.min(1, (tugs % 1) * 1.4)) : 0;
      const back = pre ? 0 : between(v, 6.4, 7.0), bx = x0 + 0.05 * u * Math.min(3, step) * (1 - back);
      box.position.set(bx, floor, 0); box.rotation.z = 0.03 * tug;
      const sit = pre ? 0 : between(v, 3.6, 4.2) * (1 - between(v, 6.0, 6.4));
      const hx = bx + 0.33 * u;
      if (sit > 0.5) { p.pose('SitDown', 1.0, false); p.group.position.set(bx + 0.05 * u, floor + H - 0.13 * u, 0.02 * u); p.group.rotation.y = -0.2; }
      else { p.pose(sit > 0 ? 'SitDown' : 'Idle', sit > 0 ? 0.6 * sit : t, sit === 0); p.group.position.set(hx + 0.3 * u - 0.06 * u * tug, floor, 0.05 * u); p.group.rotation.y = RIGHT + 0.2; }
      // pulling: he leans away, both hands back on the handle
      const pull = sit > 0 ? 0 : (pre ? 0.4 : 1);
      p.turn('Abdomen', -0.3 * tug * pull); p.turn('Head', -0.2 * tug);
      const handle = box.localToWorld(W2.set(0.33 * u, H * 0.75, 0));
      p.handTo('R', handle, pull, { out: 0.4, down: 0.8 }); p.handTo('L', handle, pull, { out: 0.4, down: 0.8 });
      const slump = sit > 0.5 ? 1 : 0; p.turn('Abdomen', 0.35 * slump); p.turn('Head', 0.4 * slump);
      sweat(drops, p, group, pre ? 0 : v, !pre && v > 0.4 ? 1 : 0, u);
      pop(ugh, pre ? 0 : between(v, 1.0, 1.3) * (1 - between(v, 6.0, 6.3)), x0 + 0.5 * u, floor + 1.0 * u, 0.15 * u);
    },
  };
}

// ---- 強 ----
function barbell(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.5 * u;
  const p = person(spec.who, u), pop1 = burst(u, { s: 0.22, color: 0xffd040 });
  const car = spec.outcome === 'car', bar = car ? emblemProp('car', 0.5 * u, { color: '#e04848' }) : solidProp([[G.cyl(0.012 * u, 0.012 * u, 0.9 * u, 0, 0, 0, 0, 0, Math.PI / 2), 0xa8b0bc], ...[-0.38, -0.32, 0.32, 0.38].map((x) => [G.cyl(0.11 * u, 0.11 * u, 0.04 * u, x * u, 0, 0, 0, 0, Math.PI / 2), 0x30343c])], 0.4);
  group.add(p.group, bar, pop1);
  const loop = 6.4;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { pick: [0.2, 0.5], press: [1.0, 0.5, 'out'], lower: [2.8, 0.4], set: [3.3, 0.5], flex: [3.9, 0.3], unflex: [5.6, 0.4] });
      p.pose('Idle', 0.2); p.group.position.set(x0, floor, 0.0); p.group.rotation.y = -0.15;
      // the bar: on the floor, at the chest, overhead (wobbling a little), back to the chest, back down
      const lift = T.pick * (1 - T.set), high = T.press * (1 - T.lower);
      const y = lerp(0.11, lerp(0.62, 1.12, high), lift);
      p.local(0, y + (car ? 0.12 : 0), 0.12 + 0.05 * (1 - high), W); bar.position.copy(group.worldToLocal(W)); bar.rotation.set(0, p.group.rotation.y, 0.04 * high * Math.sin(v * 5));
      bar.updateWorldMatrix(true, false);
      const hk = lift > 0.02 ? 1 : 0;
      p.handTo('R', car ? p.local(-0.2, y + 0.05, 0.12, W) : bar.localToWorld(W.set(-0.17 * u, 0, 0)), hk, { out: 0.7, down: 0.6 }); p.handTo('L', car ? p.local(0.2, y + 0.05, 0.12, W) : bar.localToWorld(W.set(0.17 * u, 0, 0)), hk, { out: 0.7, down: 0.6 });
      if (lift < 0.5 && lift > 0.02) p.turn('Abdomen', 0.6 * (1 - lift * 2));
      // the flex: both fists up by the head, elbows out
      const fl = T.flex * (1 - T.unflex);
      p.handTo('R', p.local(-0.25, 0.92, 0.04, W), fl, { out: 1, down: -0.6 }); p.handTo('L', p.local(0.25, 0.92, 0.04, W), fl, { out: 1, down: -0.6 });
      pop1.visible = fl > 0.05; pop1.scale.setScalar(grow(fl)); pop1.position.set(x0, floor + 1.15 * u, 0.0); pop1.rotation.z = v;
    },
  };
}

// ---- 度 ----
function rope(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.45 * u, h = KID + 0.1;
  const p = person(spec.who, u, h), count = liveText(u, { h: 0.2, w: 0.42, color: '#ffffff', bg: '#3a7ae0' });
  // the rope: half a loop between the two hands, turning about the line through them
  const arc = new THREE.Group(), line = solidProp([[G.torus(0.3 * h * u, 0.008 * u, Math.PI, 0, 0, 0), 0xe04848]], 0.6);
  arc.add(line); group.add(p.group, arc, count);
  count.position.set(x0 + 0.5 * u, floor + 0.95 * u, 0);
  const loop = 6.0, per = 0.75;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, on = !pre && v > 0.3 && v < 5.6;
      const ph = on ? (v - 0.3) / per : 0, n = Math.floor(ph), f = ph % 1;
      // a hop each time the rope passes under her feet
      p.pose('Idle', 0.2); p.group.position.set(x0, floor + 0.09 * u * h * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (f - 0.35) / 0.3)))), 0.05 * u); p.group.rotation.y = -0.2;
      const hR = p.local(-0.26, 0.42, 0.05, new THREE.Vector3()), hL = p.local(0.26, 0.42, 0.05, new THREE.Vector3());
      p.handTo('R', hR, 1, { out: 0.9, down: 0.9 }); p.handTo('L', hL, 1, { out: 0.9, down: 0.9 });
      group.worldToLocal(hR); group.worldToLocal(hL);
      // the arc spans the hands; it turns forward over the head and back under the feet
      arc.position.copy(hR).add(hL).multiplyScalar(0.5); arc.rotation.order = 'YXZ';
      arc.rotation.set(-(on ? f : 0.5) * Math.PI * 2 + Math.PI / 2, p.group.rotation.y, 0);
      const span = hR.distanceTo(hL); line.scale.set(span / (0.6 * h * u), 1.6, 1.6);
      count.set(on ? `${n + 1}かい` : 'とぶ!');
    },
  };
}

// ---- 同 ----
function same(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u;
  const a = person(spec.who, u, 0.8), b = person(spec.who, u, 0.8), eq = label(u, '=', '#3aa050', 0.25);
  group.add(a.group, b.group, eq);
  const loop = 5.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v, on = !pre && v > 0.3 && v < 4.5;
      const ph = on ? ((v - 0.3) / 0.8) % 1 : 0, out = Math.sin(Math.PI * ph);
      [a, b].forEach((p, i) => {
        // jumping jacks: arms up over the head and legs apart, then back together; both exactly in step
        p.pose('Idle', 0.2); p.group.position.set(x0 + 0.62 * u * i, floor + 0.05 * u * out, 0.05 * u); p.group.rotation.y = -0.1;
        p.handTo('R', p.local(-0.18, 1.12, 0.03, W), out, { out: 0.9, down: 0.1 }); p.handTo('L', p.local(0.18, 1.12, 0.03, W), out, { out: 0.9, down: 0.1 });
        p.turn('UpperLegR', 0, 0, 0.25 * out); p.turn('UpperLegL', 0, 0, -0.25 * out);
      });
      pop(eq, pre ? 0 : between(v, 0.6, 0.9) * (1 - between(v, 4.4, 4.8)) * (1 + 0.15 * out), x0 + 0.31 * u, floor + 0.55 * u, 0.15 * u);
    },
  };
}

// ---- 丈 / 大丈夫 ----
function height(ctx, spec, stage) {
  if (spec.outcome === 'ok') return okay(ctx, spec, stage);
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, x0 = B.maxX + 0.35 * u;
  const kid = person(spec.who, u, KID), mum = person(spec.other, u, 0.85), pen = solidProp([[G.cyl(0.01 * u, 0.01 * u, 0.12 * u, 0, 0, 0), 0xe04848]], 0.5);
  const chart = solidProp([[G.box(0.22 * u, 1.0 * u, 0.02 * u, 0, 0.5 * u, 0), 0xfaf0c8], ...Array.from({ length: 10 }, (_, i) => [G.box(i % 2 ? 0.05 * u : 0.1 * u, 0.008 * u, 0.004 * u, -0.06 * u + (i % 2 ? -0.025 : 0) * u, 0.1 * u * (i + 1), 0.012 * u), 0x6a5a40])], 0.4);
  const marks = many([[G.box(0.2 * u, 0.012 * u, 0.006 * u, 0, 0, 0), 0xe04848]], 2, 1.0), cm = [textPlane('100', { h: 0.1 * u, color: '#c03030', bg: '#ffffff', weight: 900 }), textPlane('110', { h: 0.1 * u, color: '#c03030', bg: '#ffffff', weight: 900 })];
  chart.position.set(x0, floor, -0.06 * u);
  group.add(chart, kid.group, mum.group, pen, marks, ...cm);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      const T = timeline(v, { mark1: [0.5, 0.5], grow: [2.4, 1.2], mark2: [4.0, 0.5], reset: [6.4, 0.5] });
      // she grows a little between the two marks (a year later); each time mum draws a line just over her head
      const s = 1 + 0.12 * T.grow * (1 - T.reset);
      kid.pose('Idle', 0.2); kid.group.scale.setScalar(s); kid.group.position.set(x0, floor, 0.0); kid.group.rotation.y = 0;
      mum.pose('Idle', t); mum.group.position.set(x0 + 0.45 * u, floor, 0.1 * u); mum.group.rotation.y = LEFT + 0.3;
      const top = floor + KID * u * s * 1.02;
      const draw = pre ? 0 : bump(v, 0.5, 1.2) + bump(v, 4.0, 1.2);
      W.set(x0 + 0.06 * u + 0.08 * u * Math.sin(v * 6) * draw, top, 0.02 * u); pen.position.copy(W); pen.rotation.z = 0.6;
      mum.handTo('R', group.localToWorld(W.clone()), draw, { out: 0.6, down: 0.7 }); pen.visible = draw > 0.05;
      const m1 = pre ? 0 : T.mark1 * (1 - T.reset), m2 = pre ? 0 : T.mark2 * (1 - T.reset), y1 = floor + KID * u * 1.02;
      marks.set(0, x0, y1, -0.04 * u, m1); marks.set(1, x0, floor + KID * u * 1.12 * 1.02, -0.04 * u, m2); marks.commit();
      pop(cm[0], m1, x0 - 0.2 * u, y1, 0.05 * u); pop(cm[1], m2, x0 - 0.2 * u, floor + KID * u * 1.12 * 1.02, 0.05 * u);
    },
  };
}
function okay(ctx, spec, stage) {
  const u = stage.u, B = stage.box, group = new THREE.Group(), floor = B.minY, xs = B.maxX + 0.15 * u, xf = xs + 0.55 * u;
  const kid = person(spec.who, u, KID + 0.1), mum = person(spec.other, u, 0.85), ask = label(u, 'だいじょうぶ?', '#3a7ac0', 0.12), yes = label(u, 'うん!', '#3aa050', 0.13), dust = many(PUFF(u), 5, 0.4);
  group.add(kid.group, mum.group, ask, yes, dust);
  const loop = 7.0;
  return {
    group,
    step(t) {
      const A = acts(ctx, t, loop), pre = A.u < 0, v = pre ? -1 : A.v;
      // runs, trips and falls flat; mum asks; she pops up and gives a big thumbs up
      let x = xf;
      if (pre) { kid.pose('Idle', t); x = xs; }
      else if (v < 1.0) { kid.pose('Run', v); x = lerp(xs, xf, v); }
      else if (v < 3.6) kid.pose('Death', Math.min(1.2, (v - 1.0) * 1.3), false);
      else if (v < 6.4) kid.pose('Idle', t);
      else { kid.pose('Walk', v); x = lerp(xf, xs, between(v, 6.4, 7.0)); }
      kid.group.position.set(x, floor, 0.12 * u); kid.group.rotation.y = v >= 6.4 ? LEFT : RIGHT - 0.3;
      mum.pose('Idle', t + 1); mum.group.position.set(xf + 0.55 * u, floor, 0.0); mum.group.rotation.y = LEFT + 0.4;
      mum.turn('Abdomen', 0.25 * (pre ? 0 : between(v, 1.8, 2.1) * (1 - between(v, 3.6, 3.8))));
      pop(ask, pre ? 0 : between(v, 2.0, 2.3) * (1 - between(v, 3.5, 3.7)), xf + 0.4 * u, floor + 1.05 * u, 0.15 * u);
      // the thumbs up: the right fist held up in front, the head nodding
      const up = pre ? 0 : between(v, 3.7, 4.0) * (1 - between(v, 6.0, 6.3));
      kid.handTo('R', kid.local(-0.12, 0.85, 0.3, W), up, { out: 0.6, down: 0.8 }); kid.nod(up, v);
      pop(yes, up, xf, floor + 0.85 * u, 0.15 * u);
      puffs(dust, 0, 5, xf + 0.1 * u, floor, pre ? 0 : between(v, 3.55, 4.2) + between(v, 1.5, 2.1) * 0, u, 0.3); dust.commit();
    },
  };
}

export const SCENES = { 'q-heavy': heavy, 'q-barbell': barbell, 'q-rope': rope, 'q-same': same, 'q-height': height };
