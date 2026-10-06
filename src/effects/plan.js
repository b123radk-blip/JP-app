// Which strokes get which material: pure planning shared by compose.js (building), catalog.js (cost estimate) and the
// content check. No three.js here.
//
// Kanji card: a component listed in recipe.parts (or carrying a scene prop, "tree:木") claims its strokes, every instance
// at the shallowest depth it occurs (both 木 of 林); unclaimed strokes form the "rest" with the recipe's own material.
// Word card: every glyph is planned with its own kanji card's recipe, so 学 looks the same in 学 and in 学生; kana and
// kanji without a card use the word recipe's material (a quiet "ivory" by default), unless the glyph brings its own look
// (katakana, kanji outside the plan: config EFFECTS.glyphLooks).

export function assignParts(recipe, components = [], n) {
  const owner = new Array(n).fill(-1), parts = [];
  for (const [el, p] of Object.entries(recipe.parts)) {
    const all = components.filter((c) => c.element === el);
    if (!all.length) continue;
    const depth = Math.min(...all.map((c) => c.depth));
    all.filter((c) => c.depth === depth).forEach((c, index) => {
      const strokes = c.strokes.filter((i) => owner[i] === -1);
      if (!strokes.length) return;
      strokes.forEach((i) => { owner[i] = parts.length; });
      parts.push({ element: el, strokes, material: p.material, motion: p.motion, index });
    });
  }
  const rest = owner.map((o, i) => (o === -1 ? i : -1)).filter((i) => i >= 0);
  if (rest.length) parts.push({ element: null, strokes: rest, material: null, motion: null, index: 0 });
  return parts;
}

// parts of one kanji recipe, with props placed on components turned into parts; material always filled in
export function planKanji(recipe, components, n) {
  const parts = { ...recipe.parts };
  for (const p of recipe.scene ?? []) if (p.on && !parts[p.on]) parts[p.on] = { material: null, motion: null };
  return assignParts({ ...recipe, parts }, components, n).map((p) => ({ ...p, material: p.material ?? recipe.material }));
}

// glyphs: [{ strokes: n, components, recipe: normalized kanji recipe | null, material?: normalized material spec }] -> parts over the word's combined strokes
export function planWord(wordRecipe, glyphs) {
  const out = []; let offset = 0;
  glyphs.forEach((g, gi) => {
    const local = g.recipe ? planKanji(g.recipe, g.components ?? [], g.strokes) : [{ element: null, strokes: [...Array(g.strokes).keys()], material: g.material ?? wordRecipe.material, motion: null, index: 0 }];
    for (const p of local) out.push({ ...p, glyph: gi, motion: null, strokes: p.strokes.map((i) => i + offset) });
    offset += g.strokes;
  });
  return out;
}
