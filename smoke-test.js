const { JSDOM } = require('jsdom');
const fs = require('fs');

const files = [
  'frontend/js/i18n-data.js',
  'frontend/js/ui-helpers.js',
  'frontend/js/ui-synth.js',
  'frontend/js/ui-render.js',
  'frontend/js/ui-buttons.js',
  'frontend/js/ui-api.js',
  'frontend/js/ui-features.js',
  'frontend/js/bridge.js',
  'frontend/app.js'
];

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
dom.window.matchMedia = () => ({ matches: false, addEventListener() {} });

let failed = 0;
for (const f of files) {
  if (!fs.existsSync(f)) { console.log('MISSING:', f); continue; }
  try {
    dom.window.eval(fs.readFileSync(f, 'utf-8'));
    console.log('OK:', f);
  } catch (e) {
    console.error('FAIL:', f, '->', e.message);
    failed++;
  }
}
console.log('');
console.log(failed === 0 ? 'ALL FILES OK' : `${failed} FILE(S) FAILED`);
process.exit(failed > 0 ? 1 : 0);
