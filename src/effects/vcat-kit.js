// Helpers of the vignette catalog (vignette-catalog.js and its vcat-*.js parts): pure data, no three.js.
//   variant: the option that tells two uses of one type apart (上手 / 下手: one set-up, two outcomes)
export const V = (dc, desc, opts = {}, variant = null) => ({ dc, desc, opts: { at: null, size: null, ...opts }, variant });
// a scene built from glTF models (effects/models.js): `models` names what must be loaded before it is built
export const VM = (dc, desc, models, opts = {}, variant = null) => ({ ...V(dc, desc, opts, variant), models });
// draw calls of each Quaternius person (docs/MODELS.md): scenes that let a recipe pick the actor (`who`) cost by name
export const PERSON_DC = { guy: 6, gal: 6, guy2: 6, gal2: 6, guy3: 6, gal3: 6, kimono: 5, kimonoMan: 4, doctor: 6, doctorWoman: 6, chef: 6, suitMan: 7, suitWoman: 7, worker: 6, grandpa: 8, grandma: 8 };
export const pdc = (...names) => names.reduce((s, n) => s + (PERSON_DC[n] ?? 0), 0);
