/* dom.js — ES6 модуль DOM-хелперов
   ⚠ НЕ подключён в index.html
*/

export function $(idOrEl) {
  if (typeof idOrEl === 'string') return document.getElementById(idOrEl);
  return idOrEl;
}

export function $$(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function getOrCreate(id, parent = document.body) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    parent.appendChild(el);
  }
  return el;
}

export function createEl(tag, attrs = {}, text = '') {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  if (text) el.textContent = text;
  return el;
}

export function show(el) { if (el) el.style.display = ''; }
export function hide(el) { if (el) el.style.display = 'none'; }

export function toggleClass(el, cls, force) {
  if (!el) return;
  if (force === undefined) el.classList.toggle(cls);
  else el.classList.toggle(cls, force);
}

export function addClass(el, ...cls) { if (el) el.classList.add(...cls); }
export function removeClass(el, ...cls) { if (el) el.classList.remove(...cls); }
export function hasClass(el, cls) { return el ? el.classList.contains(cls) : false; }
