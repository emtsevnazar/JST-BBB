/* v1.10.37: horizontal scroll для .controls через кнопки-стрелки */
(function(){
  'use strict';
  window.__jstControlsScroll = function(btn, dir) {
    var wrap = btn.closest('.controls-wrap');
    if (!wrap) return;
    var ctl = wrap.querySelector('.controls');
    if (!ctl) return;
    var step = Math.max(200, ctl.clientWidth * 0.7);
    ctl.scrollBy({ left: dir * step, behavior: 'smooth' });
  };
})();
