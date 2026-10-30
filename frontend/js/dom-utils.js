/* dom-utils.js — DOM helpers */
export function $(id) { return typeof id === 'string' ? document.getElementById(id) : id; }
export function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
export function getOrCreate(id, parent) {
  var el = document.getElementById(id);
  if (!el) { el = document.createElement('div'); el.id = id; (parent || document.body).appendChild(el); }
  return el;
}
