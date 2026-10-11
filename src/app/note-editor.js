// A plain 2D text box for a review note, over the page (outside the headset view, where the system keyboard and its
// own voice-typing button work). openNoteEditor({ title, text, onSave(text) }); closes itself on Save or Cancel.
let panel = null;

export function openNoteEditor({ title, text = '', onSave }) {
  panel?.remove();
  panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(10,14,28,.75)';
  panel.innerHTML = `<div style="width:min(640px,92vw);background:#1d2436;border:1px solid #ffb36b;border-radius:14px;padding:16px;color:#fff3e2;font:16px system-ui,sans-serif">
    <div data-k="title" style="font-size:20px;margin-bottom:6px"></div>
    <div style="opacity:.8;margin-bottom:10px">Type or tap the keyboard's microphone and say what to fix. Save, then Enter VR to go on reviewing.</div>
    <textarea rows="5" style="width:100%;box-sizing:border-box;font:18px system-ui,sans-serif;padding:8px;border-radius:8px;border:1px solid #6a7390;background:#0f1424;color:#fff"></textarea>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px"><button data-k="cancel">Cancel</button><button data-k="save">Save note</button></div></div>`;
  panel.querySelector('[data-k="title"]').textContent = title;
  const box = panel.querySelector('textarea'); box.value = text;
  const close = () => { panel?.remove(); panel = null; };
  panel.querySelector('[data-k="save"]').onclick = () => { onSave?.(box.value.trim()); close(); };
  panel.querySelector('[data-k="cancel"]').onclick = close;
  document.body.append(panel);
  box.focus();
}
