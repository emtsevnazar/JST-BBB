export function $(id) { return typeof id === 'string' ? document.getElementById(id) : id; }
export function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
export function getOrCreate(id, parent = document.body) {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement('div'); el.id = id; parent.appendChild(el); }
  return el;
}
export function show(el) { if (el) el.style.display = ''; }
export function hide(el) { if (el) el.style.display = 'none'; }
