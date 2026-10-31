/* ui-buttons.js — Phase 10: bindUI (event listeners для всех кнопок).
   Загружается после ui-synth, ui-render, help-content, i18n-data, ui-helpers.
*/
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var t = (window.__jstHelpers && window.__jstHelpers.t) || function (k) { return k; };
  var ti = (window.__jstHelpers && window.__jstHelpers.ti) || function (k) { return k; };
  var setStatus = (window.__jstHelpers && window.__jstHelpers.setStatus) || function () {};
  function bindUI() {
    var sliderIds = ["exaggeration","cfg_weight","temperature","repetition_penalty","speed","pitch_shift","volume"];
    var outputIds = { exaggeration:["o-exag",2], cfg_weight:["o-cfg",2], temperature:["o-temp",2],
      repetition_penalty:["o-rep",2], speed:["o-speed",2], pitch_shift:["o-pitch",0], volume:["o-vol",2] };
    sliderIds.forEach(function (key) {
      var el = $(key); if (!el) return;
      var outId = outputIds[key][0], dec = outputIds[key][1];
      el.addEventListener("input", function () {
        var out = $(outId); if (out) out.textContent = Number(el.value).toFixed(dec);
      });
    });

    var textEl = $("text");
    if (textEl) textEl.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (window.__jstSynth && window.__jstSynth.synthesize) window.__jstSynth.synthesize();
      }
    });

    var btnR = $("btn-random");
    var _btnSynth = $("btn-synth");
    if (_btnSynth) _btnSynth.addEventListener("click", function () {
      if (window.__jstSynth && window.__jstSynth.synthesize) window.__jstSynth.synthesize();
    });
    var _btnStop = $("btn-stop");
    if (_btnStop) _btnStop.addEventListener("click", function () {
      if (window.__jstSynth && window.__jstSynth.stopPlayback) window.__jstSynth.stopPlayback();
    });
    if (btnR) btnR.addEventListener("click", function () {
      var lang = (window.currentLang || window.LANG || "ru").toLowerCase();
      var bank = (window.JST_TEST_PHRASES && window.JST_TEST_PHRASES[lang]) || [];
      if (!bank.length) { console.warn("[JST] JST_TEST_PHRASES пуст для lang=", lang); return; }
      var phrase = bank[Math.floor(Math.random() * bank.length)];
      var ta = $("text");
      if (ta) { ta.value = phrase; ta.dispatchEvent(new Event("input", { bubbles: true })); }
    });

    var btnC = $("btn-clear-history");
    if (btnC) btnC.addEventListener("click", function () {
      if (textEl) { textEl.value = ""; textEl.focus(); }
      setStatus(ti("cleared"), "");
    });

    var dz = $("btn-download-zip");
    if (dz) dz.addEventListener("click", function (e) { e.preventDefault(); window.location.href = "/api/download-all-zip"; });
    var dm = $("btn-download-merged");
    if (dm) dm.addEventListener("click", function (e) { e.preventDefault(); window.location.href = "/api/download-all-merged"; });

    var hb = document.querySelector("#help-body");
    if (hb && !hb.dataset.filled) {
      if (window.__jstHelpContent && window.__jstHelpContent.HELP_HTML) {
        hb.innerHTML = window.__jstHelpContent.HELP_HTML;
      } else {
        console.warn('[JST help] help-content.js not loaded — using stub');
        hb.innerHTML = '<div class="help-doc" style="padding:20px;color:#c00">Help content failed to load. Hard-refresh (Cmd+Shift+R).</div>';
      }
      hb.dataset.filled = "1";
      (function () {
        var root = document.getElementById("help-body") || document.body;
        root.querySelectorAll("table.help-table").forEach(function (tbl) {
          var headers = Array.prototype.slice.call(tbl.querySelectorAll("tr:first-child th")).map(function (th) { return th.textContent.trim(); });
          if (!headers.length) return;
          tbl.querySelectorAll("tr").forEach(function (tr, trIdx) {
            if (trIdx === 0) return;
            var tds = tr.querySelectorAll("td");
            Array.prototype.forEach.call(tds, function (td, i) {
              if (i < headers.length && !td.hasAttribute("data-label")) {
                td.setAttribute("data-label", headers[i]);
              }
            });
          });
        });
      })();
    }
  }

  window.__jstUI = { bindUI: bindUI };
  if (typeof console !== 'undefined') console.log('[JST ui-buttons] exports:', Object.keys(window.__jstUI));
})();
