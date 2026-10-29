/* v1.10.66: force model-grid fill + 84×38 (inline !important) */
(function () {
  'use strict';

  function fixModelGrid() {
    var mg = document.getElementById('model-grid');
    if (!mg) return;

    var wrap = mg.closest('.carousel-wrap');
    if (wrap) {
      wrap.classList.add('has-model-grid');
      wrap.style.setProperty('padding', '0 42px', 'important');
      wrap.style.setProperty('display', 'flex', 'important');
      wrap.style.setProperty('flex-direction', 'row', 'important');
      wrap.style.setProperty('align-items', 'center', 'important');
      wrap.style.setProperty('width', '100%', 'important');
      wrap.style.setProperty('max-width', '100%', 'important');
      wrap.style.setProperty('min-height', '46px', 'important');
      wrap.style.setProperty('box-sizing', 'border-box', 'important');

      var btns = wrap.querySelectorAll('.carousel-btn');
      for (var b = 0; b < btns.length; b++) {
        btns[b].style.setProperty('display', 'flex', 'important');
        btns[b].style.setProperty('visibility', 'visible', 'important');
        btns[b].style.setProperty('opacity', '1', 'important');
        btns[b].style.setProperty('pointer-events', 'auto', 'important');
        btns[b].style.setProperty('width', '32px', 'important');
        btns[b].style.setProperty('height', '32px', 'important');
        btns[b].style.setProperty('min-width', '32px', 'important');
        btns[b].style.setProperty('min-height', '32px', 'important');
        btns[b].style.setProperty('max-width', '32px', 'important');
        btns[b].style.setProperty('max-height', '32px', 'important');
        btns[b].style.setProperty('border-radius', '50%', 'important');
        btns[b].style.setProperty('position', 'absolute', 'important');
        btns[b].style.setProperty('top', '50%', 'important');
        btns[b].style.setProperty('transform', 'translateY(-50%)', 'important');
        btns[b].style.setProperty('z-index', '5', 'important');
      }
    }

    // #model-grid — fill
    mg.style.setProperty('display', 'flex', 'important');
    mg.style.setProperty('flex-direction', 'row', 'important');
    mg.style.setProperty('flex-wrap', 'nowrap', 'important');
    mg.style.setProperty('gap', '8px', 'important');
    mg.style.setProperty('width', '100%', 'important');
    mg.style.setProperty('max-width', '100%', 'important');
    mg.style.setProperty('min-width', '0', 'important');
    mg.style.setProperty('flex', '1 1 auto', 'important');
    mg.style.setProperty('overflow-x', 'auto', 'important');
    mg.style.setProperty('overflow-y', 'hidden', 'important');
    mg.style.setProperty('padding', '4px 0', 'important');
    mg.style.setProperty('box-sizing', 'border-box', 'important');

    // Дети — 84×38 (НЕ 56)
    var kids = mg.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      k.style.setProperty('flex', '1 1 0', 'important');
      k.style.setProperty('width', 'auto', 'important');
      k.style.setProperty('min-width', '84px', 'important');
      k.style.setProperty('max-width', 'none', 'important');
      k.style.setProperty('flex-shrink', '1', 'important');
      k.style.setProperty('height', '38px', 'important');
      k.style.setProperty('min-height', '38px', 'important');
      k.style.setProperty('max-height', '38px', 'important');
      k.style.setProperty('box-sizing', 'border-box', 'important');
      k.style.setProperty('padding', '4px 8px', 'important');
      k.style.setProperty('border-radius', '10px', 'important');
      k.style.setProperty('display', 'flex', 'important');
      k.style.setProperty('align-items', 'center', 'important');
      k.style.setProperty('justify-content', 'center', 'important');
      k.style.setProperty('text-align', 'center', 'important');
      k.style.setProperty('overflow', 'hidden', 'important');
      k.style.setProperty('white-space', 'nowrap', 'important');
      k.style.setProperty('text-overflow', 'ellipsis', 'important');
    }
  }

  function run() {
    fixModelGrid();
    setTimeout(fixModelGrid, 200);
    setTimeout(fixModelGrid, 800);
    setTimeout(fixModelGrid, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  function watch() {
    var mg = document.getElementById('model-grid');
    if (!mg || mg.dataset.mgObs) return;
    mg.dataset.mgObs = '1';
    var obs = new MutationObserver(function () { fixModelGrid(); });
    obs.observe(mg, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class'] });
  }
  setTimeout(watch, 100);
  setTimeout(watch, 1000);
})();
