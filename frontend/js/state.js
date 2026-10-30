/* state.js — ES6 модуль состояния (заготовка для будущего рефакторинга)
   ⚠ НЕ подключён — app.js использует свои глобалы
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
