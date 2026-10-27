/* v1.10.35: click-toggle для .dropdown (touch-friendly) */
(function(){
  'use strict';
  function closeAll(){
    document.querySelectorAll('.dropdown.open').forEach(function(d){ d.classList.remove('open'); });
  }
  function init(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('.dropdown > .btn, .dropdown > button');
      var menu = e.target.closest('.dropdown-menu');
      var inDD = e.target.closest('.dropdown');

      if (!inDD) { closeAll(); return; }

      if (btn && !menu) {
        var dd = btn.closest('.dropdown');
        var wasOpen = dd.classList.contains('open');
        closeAll();
        if (!wasOpen) {
          dd.classList.add('open');
          e.stopPropagation();
          e.preventDefault();
        }
      } else if (menu) {
        setTimeout(closeAll, 80);
      }
    }, true);

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeAll();
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
