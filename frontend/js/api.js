/* api.js — ES6 модуль для fetch-обёрток
   ⚠ НЕ подключён в index.html (нужен для будущего рефакторинга)
   ⚠ НЕ влияет на работу app.js
*/

export async function fetchJSON(url, options = {}) {
  const r = await fetch(url, {
    headers: { 'Accept': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!r.ok) {
    let body = null;
    try { body = await r.json(); } catch (e) {}
    throw new Error(`HTTP ${r.status} ${r.statusText}: ${JSON.stringify(body)}`);
  }
  return r.json();
}

export async function fetchText(url, options = {}) {
  const r = await fetch(url, options);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.text();
}

export async function fetchPostJSON(url, data, options = {}) {
  return fetchJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(data),
    ...options
  });
}

export async function fetchPostForm(url, formData, options = {}) {
  const r = await fetch(url, {
    method: 'POST',
    body: formData,
    ...options
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
  return r.json();
}

export const API = {
  models: () => fetchJSON('/api/models'),
  voices: () => fetchJSON('/api/voices'),
  presets: () => fetchJSON('/api/presets'),
  moods: () => fetchJSON('/api/moods'),
  output: () => fetchJSON('/api/output'),
  errorState: () => fetchJSON('/api/error-state'),
  audit: () => fetchJSON('/api/audit')
};
