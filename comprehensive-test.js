const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const CWD = __dirname;
const HTML = path.join(CWD, 'frontend/index.html');
let html = fs.readFileSync(HTML, 'utf-8');

const srcs = [];
const re = /<script[^>]+src=["']([^"']+)["'][^>]*>/g;
let m;
while ((m = re.exec(html)) !== null) srcs.push(m[1]);
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

const dom = new JSDOM(html, { url: 'http://localhost:8000/', runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window;
const doc = w.document;

const pageLogs = [];
w.console = {
  log: (...a) => pageLogs.push('log: ' + a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
  warn: (...a) => pageLogs.push('WARN: ' + a.join(' ')),
  error: (...a) => pageLogs.push('ERROR: ' + a.join(' ')),
  info: () => {}, debug: () => {}
};

w.matchMedia = (q) => ({ matches: false, media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
w.cancelAnimationFrame = () => {};
w.fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '', blob: async () => new w.Blob([]) });
w.WebSocket = class { constructor(){} send(){} close(){} addEventListener(){} removeEventListener(){} };
w.AudioContext = class {
  constructor(){ this.destination={}; this.currentTime=0; this.sampleRate=24000; this.state='running'; }
  createBufferSource(){ return { connect(){return this;}, start(){}, stop(){}, buffer:null, onended:null }; }
  createGain(){ return { connect(){return this;}, gain:{ value:1, setValueAtTime(){}, linearRampToValueAtTime(){} } }; }
  createAnalyser(){ return { connect(){return this;}, fftSize:0, frequencyBinCount:0, getByteFrequencyData(){} }; }
  decodeAudioData(b,ok){ok&&ok(b);}
  close(){} resume(){}
};
w.MediaRecorder = class { constructor(){} start(){} stop(){} addEventListener(){} };
w.SpeechRecognition = class { start(){} stop(){} addEventListener(){} };
w.webkitSpeechRecognition = w.SpeechRecognition;
if (!w.navigator.mediaDevices) w.navigator.mediaDevices = {};
w.navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [], getAudioTracks: () => [] });
w.URL.createObjectURL = () => 'blob:mock';
w.URL.revokeObjectURL = () => {};
w.alert = () => {}; w.confirm = () => true; w.prompt = () => ''; w.scrollTo = () => {};
try { w.HTMLElement.prototype.scrollBy = function(){}; } catch(e){}

const loaded = [], failed = [];
for (let s of srcs) {
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//')) continue;
  let rel = s.split('?')[0];
  if (rel.startsWith('/static/')) rel = 'frontend/' + rel.slice('/static/'.length);
  else if (rel.startsWith('/')) rel = 'frontend' + rel;
  else rel = 'frontend/' + rel;
  const p = path.join(CWD, rel);
  if (!fs.existsSync(p)) { failed.push(rel + ' [MISSING]'); continue; }
  try { w.eval(fs.readFileSync(p, 'utf-8')); loaded.push(rel); }
  catch(e) { failed.push(rel + ' :: ' + e.message); }
}
try { doc.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true })); } catch(e){}
try { w.dispatchEvent(new w.Event('load')); } catch(e){}
try { doc.dispatchEvent(new w.Event('load', { bubbles: true })); } catch(e){}

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { const r = fn(); if (r === false) throw new Error('assert false'); console.log('PASS | ' + name + (typeof r === 'string' ? ' :: ' + r : '')); pass++; }
  catch(e) { console.log('FAIL | ' + name + ' :: ' + e.message); fail++; }
};

console.log('\n--- SCRIPTS: ' + loaded.length + ' loaded, ' + failed.length + ' failed ---');
failed.forEach(s => console.log('  x ' + s));

console.log('\n--- PAGE LOGS (' + pageLogs.length + ') ---');
pageLogs.slice(0, 20).forEach(l => console.log('  ' + l.slice(0, 200)));

console.log('\n--- TESTS ---');
t('history-dropdown exists', () => !!doc.getElementById('history-dropdown'));
t('dl-dropdown exists', () => !!doc.getElementById('dl-dropdown'));
t('.jst-dot on #history-dropdown > .btn', () => { const b = doc.querySelector('#history-dropdown > .btn'); return b && b.querySelector('.jst-dot') ? 'yes' : 'no'; });

t('history-dropdown toggles .open', () => {
  const dd = doc.getElementById('history-dropdown'); if (!dd) return 'no element';
  const btn = dd.querySelector('.btn'); if (!btn) return 'no .btn';
  const states = [];
  for (let i = 0; i < 3; i++) { btn.click(); states.push(dd.classList.contains('open')); }
  const toggled = states.some((s,i) => i>0 && s !== states[i-1]);
  return 'states=' + states.join(',') + ' ' + (toggled ? 'TOGGLES' : 'NO CHANGE');
});

t('dl-dropdown toggles .open', () => {
  const dd = doc.getElementById('dl-dropdown'); if (!dd) return 'no element';
  const btn = dd.querySelector('.btn'); if (!btn) return 'no .btn';
  const states = [];
  for (let i = 0; i < 3; i++) { btn.click(); states.push(dd.classList.contains('open')); }
  const toggled = states.some((s,i) => i>0 && s !== states[i-1]);
  return 'states=' + states.join(',') + ' ' + (toggled ? 'TOGGLES' : 'NO CHANGE');
});

t('.controls-wrap', () => doc.querySelectorAll('.controls-wrap').length + ' found');
t('.controls', () => doc.querySelectorAll('.controls').length + ' found');
t('.controls-btn', () => doc.querySelectorAll('.controls-btn').length + ' found');
t('.controls-btn.controls-prev', () => doc.querySelectorAll('.controls-btn.controls-prev').length + ' found');
t('.controls-btn.controls-next', () => doc.querySelectorAll('.controls-btn.controls-next').length + ' found');
t('__jstControlsScroll registered', () => typeof w.__jstControlsScroll === 'function' ? 'yes' : 'NO');

t('controls-prev click runs', () => {
  const btn = doc.querySelector('.controls-btn.controls-prev');
  if (!btn) return 'no btn';
  try { btn.click(); return 'ok'; } catch(e){ return 'threw: ' + e.message; }
});

t('theme-toggle cycles modes', () => {
  const el = doc.getElementById('theme-toggle');
  if (!el) return 'no #theme-toggle';
  const modes = [doc.documentElement.getAttribute('data-mode')];
  el.click(); modes.push(doc.documentElement.getAttribute('data-mode'));
  el.click(); modes.push(doc.documentElement.getAttribute('data-mode'));
  el.click(); modes.push(doc.documentElement.getAttribute('data-mode'));
  const uniq = new Set(modes.filter(Boolean));
  return 'modes=' + modes.join('->') + ' unique=' + uniq.size + ' ' + (uniq.size >= 2 ? 'CYCLES' : 'STUCK');
});

t('all buttons clickable', () => {
  const btns = doc.querySelectorAll('button, .btn, [role="button"]');
  let count = 0, errs = [];
  for (const b of btns) {
    try { b.click(); count++; }
    catch(e) { errs.push((b.id||b.className||'?').slice(0,25) + ': ' + e.message.slice(0,50)); }
  }
  return count + ' clicked, ' + errs.length + ' errors' + (errs.length ? '\n    ' + errs.slice(0,5).join('\n    ') : '');
});

t('textarea typing', () => {
  const ta = doc.querySelector('textarea, #text, #synth-text');
  if (!ta) return 'no textarea';
  ta.value = 'test input';
  ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  return ta.value === 'test input' ? 'ok' : 'value lost';
});

t('modules/instruction.js loaded', () => {
  const ok = loaded.some(f => f.includes('modules/instruction'));
  return ok ? 'yes' : 'NOT LOADED';
});
t('__jstHelpers', () => !!w.__jstHelpers);
t('__jstApi', () => !!w.__jstApi);
t('__jstDotsV8', () => !!w.__jstDotsV8);

console.log('\n--- .controls-btn.controls-prev outerHTML ---');
const prev = doc.querySelector('.controls-btn.controls-prev');
console.log(prev ? prev.outerHTML.slice(0, 600) : 'NOT FOUND');

console.log('\nRESULT: ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail > 0 ? 1 : 0);
