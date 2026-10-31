const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const CWD = __dirname;

function buildDom(hoverNone) {
  let html = fs.readFileSync(path.join(CWD, 'frontend/index.html'), 'utf-8');
  const srcs = [];
  const re = /<script[^>]+src=["']([^"']+)["'][^>]*>/g;
  let m; while ((m = re.exec(html)) !== null) srcs.push(m[1]);
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, doc = w.document;
  w.matchMedia = (q) => ({ matches: hoverNone && /hover:\s*none/.test(q), media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} });
  w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = () => {};
  w.fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '', blob: async () => new w.Blob([]) });
  w.WebSocket = class { send(){} close(){} addEventListener(){} removeEventListener(){} };
  w.AudioContext = class { constructor(){this.destination={};this.currentTime=0;this.sampleRate=24000;this.state='running';} createBufferSource(){return{connect(){return this;},start(){},stop(){},buffer:null,onended:null};} createGain(){return{connect(){return this;},gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){}}};} createAnalyser(){return{connect(){return this;},fftSize:0,frequencyBinCount:0,getByteFrequencyData(){}};} decodeAudioData(b,ok){ok&&ok(b);} close(){} resume(){} };
  w.MediaRecorder = class { start(){} stop(){} addEventListener(){} };
  w.SpeechRecognition = class { start(){} stop(){} addEventListener(){} };
  w.webkitSpeechRecognition = w.SpeechRecognition;
  w.navigator.mediaDevices = w.navigator.mediaDevices || {};
  w.navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [], getAudioTracks: () => [] });
  w.URL.createObjectURL = () => 'blob:mock'; w.URL.revokeObjectURL = () => {};
  w.alert = () => {}; w.confirm = () => true; w.prompt = () => ''; w.scrollTo = () => {};
  try { w.HTMLElement.prototype.scrollBy = function(){}; } catch(e){}

  const SKIP = /pwa\.js|help-content\.js/;
  for (let s of srcs) {
    if (s.startsWith('http') || s.startsWith('//') || SKIP.test(s)) continue;
    let rel = s.split('?')[0];
    if (rel.startsWith('/static/')) rel = 'frontend/' + rel.slice(8);
    else if (rel.startsWith('/')) rel = 'frontend' + rel;
    else rel = 'frontend/' + rel;
    const p = path.join(CWD, rel);
    if (!fs.existsSync(p)) continue;
    try { w.eval(fs.readFileSync(p, 'utf-8')); } catch(e) {}
  }
  try { doc.dispatchEvent(new w.Event('DOMContentLoaded', { bubbles: true })); } catch(e){}
  try { w.dispatchEvent(new w.Event('load')); } catch(e){}
  return { w, doc };
}

function testClick(hoverNone) {
  const { doc } = buildDom(hoverNone);
  const dd = doc.getElementById('history-dropdown');
  const btn = dd && dd.querySelector('.btn');
  if (!btn) return 'no element';
  const states = [];
  for (let i = 0; i < 4; i++) { btn.click(); states.push(dd.classList.contains('open')); }
  const toggles = states.filter((s,i) => i>0 && s !== states[i-1]).length;
  return `hover:none=${hoverNone} states=${states.join(',')} toggles=${toggles} ${toggles >= 1 ? 'WORKS' : 'BROKEN'}`;
}

console.log(testClick(false));
console.log(testClick(true));
