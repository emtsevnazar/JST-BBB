/* state.js — ES6 модуль состояния JST Studio
   Phase 2: добавлен resetStreaming (для ws-manager.js)
   ⚠ Пока НЕ подключён к index.html — app.js использует свои глобалы.
*/

export const state = {
  ws: null,
  isStreaming: false,
  audioCtx: null,
  activeSources: [],
  nextStartTime: 0,
  totalSamples: 0,
  allChunks: [],
  lang: 'ru',
  voices: [],
  models: [],
  presets: [],
  moods: [],
  settings: {}
};

export function setState(key, value) {
  state[key] = value;
  window.dispatchEvent(new CustomEvent('jst:state-change', {
    detail: { key, value }
  }));
}

export function getState(key) {
  return state[key];
}

export function resetState(keys = null) {
  if (keys === null) {
    for (const k of Object.keys(state)) {
      if (typeof state[k] === 'boolean') state[k] = false;
      else if (Array.isArray(state[k])) state[k] = [];
      else if (typeof state[k] === 'number') state[k] = 0;
      else state[k] = null;
    }
  } else {
    for (const k of keys) {
      if (k in state) state[k] = null;
    }
  }
}

/**
 * Сброс состояния синтеза. Безопасно вызывать из любого модуля.
 * Синхронизирует state.* и window.JST_IS_STREAMING, эмитит
 * 'jst:reset-streaming' — app.js может подписаться и сбросить свой
 * модульный isStreaming (Phase 4).
 * @param {string} reason
 */
export function resetStreaming(reason = 'manual') {
  state.isStreaming = false;
  window.JST_IS_STREAMING = false;
  if (state.ws) {
    try { state.ws.onclose = null; state.ws.onmessage = null; state.ws.onerror = null; } catch (e) {}
    try { state.ws.close(); } catch (e) {}
    state.ws = null;
  }
  if (state.wsTimeoutTimer) {
    clearTimeout(state.wsTimeoutTimer);
    state.wsTimeoutTimer = null;
  }
  try {
    window.dispatchEvent(new CustomEvent('jst:reset-streaming', { detail: { reason } }));
  } catch (e) {}
  console.log('[JST state] resetStreaming:', reason);
}
