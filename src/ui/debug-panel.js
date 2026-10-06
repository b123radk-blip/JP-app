// `?debug=1`: a small 2D panel for testing the day-based rules without waiting days. Fake clock: `?today=YYYY-MM-DD`.
import { animationActive } from '../srs/retirement.js';

export function createDebugPanel(app) {
  if (!new URLSearchParams(location.search).has('debug')) return;
  const el = document.createElement('div');
  el.id = 'debug';
  el.style.cssText = 'position:fixed;left:8px;bottom:56px;max-width:430px;padding:8px 10px;background:rgba(0,0,0,.78);color:#cfe;font:12px/1.4 monospace;border:1px solid #345;border-radius:8px;z-index:5';
  const info = document.createElement('pre'); info.style.cssText = 'margin:0 0 6px;white-space:pre-wrap;max-height:180px;overflow:auto';
  const row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px';
  el.append(info, row); document.body.append(el);

  const btn = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.style.cssText = 'font:12px monospace;padding:3px 7px'; b.onclick = fn; row.append(b); return b; };
  const toHome = () => app.show('home');
  btn('+1 day', () => { app.clock.addDays(1); toHome(); });
  btn('+7 days', () => { app.clock.addDays(7); toHome(); });
  const modes = ['auto', 'on', 'off'];
  const anim = btn('animation: auto', () => { app.debug.forceAnimation = modes[(modes.indexOf(app.debug.forceAnimation) + 1) % 3]; anim.textContent = `animation: ${app.debug.forceAnimation}`; app.screen?.reload?.(); });
  btn('reset progress', () => { app.progress = app.storage.reset(); app.save(); toHome(); });
  const jump = document.createElement('select'); jump.style.cssText = 'font:12px monospace';
  jump.append(new Option('jump to card…', ''));
  for (const id of app.decks.flatMap((d) => d.cards)) jump.append(new Option(id, id));
  jump.onchange = () => {
    if (!jump.value) return;
    if (app.screen?.name !== 'study') app.show('study', { deckId: app.decks.find((d) => d.enabled).id });
    setTimeout(() => app.screen?.jump?.(jump.value), 50); jump.value = '';
  };
  row.append(jump);

  setInterval(() => {
    const p = app.screen?.player?.info?.(), st = p && app.progress.cards[p.id];
    info.textContent = `today ${app.clock.today()}  screen ${app.screen?.name}\n` +
      (p ? `card ${p.id}  animation ${p.active ? 'ACTIVE' : 'retired'} (auto would be ${animationActive(st, 'auto') ? 'active' : 'retired'}, forced: ${app.debug.forceAnimation})\nstate ${st ? JSON.stringify({ ...st, history: st.history.map((h) => `${h.day}:${h.rating}`) }) : 'new card'}` : '');
  }, 400);
}
