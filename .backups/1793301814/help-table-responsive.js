/* JST-HELP-TABLE-RESPONSIVE v20 */
(function(){
  'use strict';
  var t = null;
  function setLabels(){
    document.querySelectorAll('.help-table').forEach(function(tbl){
      var heads = tbl.querySelectorAll('thead th');
      if (!heads.length) return;
      tbl.querySelectorAll('tbody tr').forEach(function(tr){
        tr.querySelectorAll('td').forEach(function(td, i){
          if (heads[i]) {
            var label = heads[i].textContent.trim();
            if (label && td.getAttribute('data-label') !== label)
              td.setAttribute('data-label', label);
          }
        });
      });
    });
  }
  function debounce(){
    if (t) clearTimeout(t);
    t = setTimeout(setLabels, 60);
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', debounce);
  else debounce();
  new MutationObserver(debounce).observe(document.body,
    { childList: true, subtree: true });
})();
