(function(){
  'use strict';
  var OFFLINE_URL='/offline';
  function redirect(reason,status){
    if(location.pathname===OFFLINE_URL||location.pathname==='/offline.html')return;
    // анти-цикл
    if(sessionStorage.getItem('jst_err_guard')==='1')return;
    sessionStorage.setItem('jst_err_guard','1');
    var q=new URLSearchParams({reason:reason||'unknown'});
    if(status)q.set('status',String(status));
    window.location.replace(OFFLINE_URL+'?'+q.toString());
  }
  // 1. Потеря сети
  window.addEventListener('offline',function(){redirect('offline')});
  // 2. Ошибки загрузки критичных ресурсов (JS/CSS)
  window.addEventListener('error',function(e){
    var t=e.target;
    if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK'))redirect('network');
  },true);
  // 3. Необработанные промисы
  window.addEventListener('unhandledrejection',function(){redirect('exception')});
  // 4. Network-level ошибки fetch (не HTTP-статусы)
  var _f=window.fetch;
  if(_f){window.fetch=function(){
    return _f.apply(this,arguments).catch(function(err){
      if(err&&err.name==='TypeError')redirect('network');
      throw err;
    });
  };}
  // 5. Снимаем guard после успешной загрузки
  window.addEventListener('load',function(){
    setTimeout(function(){sessionStorage.removeItem('jst_err_guard')},1500);
  });
})();
