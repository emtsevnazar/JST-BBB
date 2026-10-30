export async function fetchJSON(url, options = {}) {
  const r = await fetch(url, { headers: { 'Accept': 'application/json', ...(options.headers || {}) }, ...options });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const API = {
  models: () => fetchJSON('/api/models'),
  voices: () => fetchJSON('/api/voices'),
  presets: () => fetchJSON('/api/presets'),
  moods: () => fetchJSON('/api/moods'),
  output: () => fetchJSON('/api/output'),
  errorState: () => fetchJSON('/api/error-state')
};
