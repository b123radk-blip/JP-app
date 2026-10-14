// A plan's goals, checked on inspect.mjs's measurements at every moment it measures (the whole-loop scan and --times),
// so "done" is a PASS, not a judgment of a picture. Goals file (JSON, a list), each with a name and optional "t": [from, to]
// (seconds after the last stroke; default: every moment):
//   { "goal": "hands on the toes", "point": "gal3 right hand", "near": "gal3 right foot", "within": 0.1, "t": [4, 5] }
//   { "goal": "kids apart", "point": "guy2 head (middle)", "near": "gal3", "beyond": 0.3 }
//   { "goal": "girl in view", "visible": "gal3", "min": 85 }
//   { "goal": "kit on the ground", "rests": "red", "on": "ground", "t": [5, 6.5] }
//   { "goal": "nothing through the doctor", "clear": "doctor" }
// A thing is named by (part of) its name in the report (gal3, slide, "red #c02020"); a person's point adds one of: top of
// the head, head (middle), neck, right shoulder, left shoulder, chest, hips, right knee, left knee, right foot, left
// foot, right hand, left hand. A point may also be [x, y, z] in u. "near" a thing without a point means its box.
// Props are easiest to name when the code names them (mesh.name = 'sandbox'); otherwise use the colour name the report
// prints ("brown/skin"). Give a goal the time when the thing is there ("t"): a thing not yet in the scene fails.
const lc = (s) => String(s).toLowerCase();

function thing(m, name) {
  const n = lc(name), items = m.items.filter((x) => x.kind !== 'particles');
  return items.find((x) => lc(x.name) === n) ?? items.find((x) => lc(x.name).includes(n));
}
// a named point: [x,y,z] | "<person> <mark>" | a thing (its box)
function where(m, ref) {
  if (Array.isArray(ref)) return { p: ref };
  for (const b of m.bodies ?? []) for (const [k, p] of Object.entries(b.marks)) if (lc(ref) === lc(`${b.name} ${k}`)) return { p };
  const x = thing(m, ref);
  if (!x) return null;
  const h = x.size.map((s) => s / 2), lo = x.centre.map((c, i) => c - h[i]), hi = x.centre.map((c, i) => c + h[i]);
  return { p: x.centre, lo, hi, x };
}
const dist = (a, b) => {
  if (b.lo) return Math.hypot(...a.p.map((v, i) => Math.max(b.lo[i] - v, 0, v - b.hi[i])));
  if (a.lo) return dist(b, a);
  return Math.hypot(...a.p.map((v, i) => v - b.p[i]));
};
const r2 = (v) => Math.round(v * 100) / 100;

// one goal at one moment: { ok, value, why }
function judge(g, m) {
  if (g.point) {
    const a = where(m, g.point), b = where(m, g.near);
    if (!a || !b) return { ok: false, why: `${!a ? g.point : g.near} is not in the scene` };
    const d = r2(dist(a, b));
    return g.beyond != null ? { ok: d >= g.beyond, value: d, why: `${d}u apart (needs ≥ ${g.beyond})` } : { ok: d <= (g.within ?? 0.05), value: d, why: `${d}u apart (needs ≤ ${g.within ?? 0.05})` };
  }
  if (g.visible) {
    const x = thing(m, g.visible), h = x && m.hidden.find((y) => y.id === x.id);
    if (!h || h.pct == null) return { ok: false, why: `${g.visible} is not in the learner's view` };
    const v = Math.min(h.pct, h.frame ?? 100), min = g.min ?? 85;
    return { ok: v >= min, value: v, why: `${v}% visible (needs ≥ ${min})` };
  }
  if (g.rests) {
    const x = thing(m, g.rests), s = x && m.support.find((y) => y.id === x.id);
    if (!s) return { ok: false, why: `${g.rests} is not in the scene` };
    const said = s.text.replace(/^T\d+ \S+ /, ''), ok = !s.fault && !/high in the air|in the air on purpose/.test(s.text) && (!g.on || lc(s.text.split(':').slice(1).join(':')).includes(lc(g.on)));
    return { ok, value: Math.abs(s.gap ?? 0), why: said };
  }
  if (g.clear) {
    const x = thing(m, g.clear);
    if (!x) return { ok: false, why: `${g.clear} is not in the scene` };
    const tag = `${x.id} ${x.kind} ${x.name}`, hit = [...m.through, ...m.touching].filter((h) => h.text.includes(tag) && !(g.except ?? []).some((e) => lc(h.text).includes(lc(e))));
    return { ok: !hit.length, value: hit.length, why: hit.length ? hit[0].text.replace(/\bT\d+ /g, '') : 'nothing passes into it' };
  }
  return { ok: false, why: 'unknown goal (needs point + near, visible, rests or clear)' };
}

export function goalChecker(goals) {
  const seen = goals.map(() => ({ n: 0, bad: [], worst: null }));
  return {
    // every measured moment (dt: seconds after the last stroke)
    note(m, dt) {
      goals.forEach((g, i) => {
        if (g.t && (dt < g.t[0] - 1e-6 || dt > g.t[1] + 1e-6)) return;
        const r = judge(g, m), e = seen[i];
        if (e.at?.has(dt)) return;
        (e.at ??= new Set()).add(dt); e.n++;
        if (!r.ok) { e.bad.push(dt); (e.why ??= new Map()).has(r.why.replace(/[\d.]+u/g, '#')) || e.why.set(r.why.replace(/[\d.]+u/g, '#'), { dt, ...r }); }
        else e.ok ??= { dt, ...r };
      });
    },
    failed: () => seen.filter((e) => !e.n || e.bad.length).length,
    lines(spans, step) {
      const pass = goals.length - this.failed();
      const out = [`## Goals: ${pass} of ${goals.length} PASS (checked at every moment measured; a goal passes only if it holds at all of them)`, ''];
      goals.forEach((g, i) => {
        const e = seen[i], when = g.t ? ` (t+${g.t[0]} to t+${g.t[1]})` : '';
        if (!e.n) out.push(`  FAIL ${g.goal ?? JSON.stringify(g)}${when}: no moment measured in its time (add it to --times or use --scan)`);
        else if (e.bad.length) out.push(`  FAIL ${g.goal ?? JSON.stringify(g)}${when}: fails at ${spans(e.bad.sort((a, b) => a - b), step)} of ${e.n} moments; ${[...e.why.values()].slice(0, 3).map((w) => `t+${w.dt}: ${w.why}`).join('; ')}`);
        else out.push(`  PASS ${g.goal ?? JSON.stringify(g)}${when}: ${e.n} moments, e.g. t+${e.ok.dt}: ${e.ok.why}`);
      });
      return [...out, ''];
    },
  };
}
