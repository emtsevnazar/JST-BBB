(function(){
  'use strict';
  var OFFLINE='/offline';
  function redirect(reason,status){
    if(location.pathname===OFFLINE||location.pathname==='/offline.html')return;
    if(sessionStorage.getItem('jst_err_guard')==='1')return;
    sessionStorage.setItem('jst_err_guard','1');
    var q=new URLSearchParams({reason:reason||'unknown'});
    if(status)q.set('status',String(status));
    window.location.replace(OFFLINE+'?'+q.toString());
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

  // 4. Fetch: TypeError → network; 5xx с "model" → server
  var _f=window.fetch;
  if(_f){
    window.fetch=function(){
      return _f.apply(this,arguments).then(function(r){
        if(r.status>=500&&r.status<600&&r.url&&r.url.indexOf('/api/')!==-1){
          r.clone().text().then(function(b){
            if(/model|tts|stt|ollama|load/i.test(b))redirect('server',r.status);
          }).catch(function(){});
        }
        return r;
      }).catch(function(err){
        if(err&&err.name==='TypeError')redirect('network');
        throw err;
      });
    };
  }

  // 5. WebSocket: если не открылся за 10s → network
  if(window.WebSocket){
    var _WS=window.WebSocket;
    var _wrap=function(u,p){
      var ws=new _WS(u,p);
      var t=setTimeout(function(){
        if(ws.readyState!==_WS.OPEN)redirect('network');
      },10000);
      ws.addEventListener('open',function(){clearTimeout(t)},{once:true});
      ws.addEventListener('error',function(){
        setTimeout(function(){
          if(ws.readyState!==_WS.OPEN)redirect('network');
        },2000);
      },{once:true});
      return ws;
    };
    _wrap.prototype=_WS.prototype;
    _wrap.CONNECTING=_WS.CONNECTING; _wrap.OPEN=_WS.OPEN;
    _wrap.CLOSING=_WS.CLOSING; _wrap.CLOSED=_WS.CLOSED;
    window.WebSocket=_wrap;
  }

  // 6. Heartbeat: /readyz каждые 30s, 3 фейла подряд → network
  var fails=0;
  function ping(){
    var ctl=window.AbortController?new AbortController():null;
    var to=setTimeout(function(){if(ctl)ctl.abort();},6000);
    var opts={cache:'no-store'};
    if(ctl)opts.signal=ctl.signal;
    _f.call(window,'/readyz',opts).then(function(r){
      clearTimeout(to);
      fails=r.ok?0:fails+1;
    }).catch(function(){
      clearTimeout(to); fails++;
    }).then(function(){
      if(fails>=2){fails=0;redirect('network');}
    });
  }
  setTimeout(ping,3000);
  setInterval(ping,10000);

  // 7. Снять guard после успешной загрузки
  window.addEventListener('load',function(){
    setTimeout(function(){
      sessionStorage.removeItem('jst_err_guard');
      // 7a. Proactive readyz (1.5s after load)
      if(_f){
        _f.call(window,'/readyz',{cache:'no-store',signal:AbortSignal.timeout(3000)})
          .then(function(r){ if(!r.ok) redirect('network'); })
          .catch(function(){ redirect('network'); });
        // 7b. Models check (5s timeout)
        _f.call(window,'/api/models',{cache:'no-store',signal:AbortSignal.timeout(5000)})
          .then(function(r){ return r.ok ? r.json() : null; })
          .then(function(j){
            var n = Array.isArray(j) ? j.length : (j && j.models ? j.models.length : -1);
            if(n === 0) redirect('server', '503');
          })
          .catch(function(){});
      }
    }, 1500);
  });
})();
