export function formatTime(sec) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  return Math.floor(sec/60) + ':' + String(Math.floor(sec%60)).padStart(2, '0');
}
export function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
