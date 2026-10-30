/**
 * JST WebSocket watchdog — resets streaming state if WS dies.
 * Phase 1 scaffold; jst-force.js keeps working until Phase 2.
 */
import { state, resetStreaming } from './state.js';

const SYNTH_BUTTON_ID = 'btnSynth';
const WATCHDOG_INTERVAL_MS = 700;

export function startWatchdog() {
  setInterval(() => {
    const synth = document.getElementById(SYNTH_BUTTON_ID);
    const wsAlive =
      state.ws && (state.ws.readyState === 0 || state.ws.readyState === 1);
    const hasBusy = synth && synth.classList.contains('is-busy');
    const jstStreaming = window.JST_IS_STREAMING === true;

    if (hasBusy && !wsAlive) {
      console.warn('[JST ws-manager] hasBusy but WS dead — reset');
      resetStreaming('watchdog:hasBusy-no-ws');
      return;
    }
    if (jstStreaming && !hasBusy) {
      console.warn('[JST ws-manager] JST_IS_STREAMING but no is-busy — reset');
      resetStreaming('watchdog:streaming-no-busy');
    }
  }, WATCHDOG_INTERVAL_MS);
}
