export const state = {
  ws: null, isStreaming: false, audioCtx: null,
  activeSources: [], lang: 'ru', voices: [], models: [], settings: {}
};
export function setState(key, value) {
  state[key] = value;
  window.dispatchEvent(new CustomEvent('jst:state', { detail: { key, value } }));
}
