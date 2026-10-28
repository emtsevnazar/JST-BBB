/* v1.10.72: help-table / batch-table → text < 500px (RU/EN) */
(function () {
  'use strict';

  var DICT = {
    'модель': { ru: 'Модель', en: 'Model' },
    'model': { ru: 'Модель', en: 'Model' },
    'название': { ru: 'Название', en: 'Name' },
    'name': { ru: 'Название', en: 'Name' },
    'языки': { ru: 'Языки', en: 'Languages' },
    'язык': { ru: 'Язык', en: 'Language' },
    'language': { ru: 'Язык', en: 'Language' },
    'languages': { ru: 'Языки', en: 'Languages' },
    'статус': { ru: 'Статус', en: 'Status' },
    'status': { ru: 'Статус', en: 'Status' },
    'размер': { ru: 'Размер', en: 'Size' },
    'size': { ru: 'Размер', en: 'Size' },
    'загружена': { ru: 'Загружена', en: 'Loaded' },
    'loaded': { ru: 'Загружена', en: 'Loaded' },
    'код': { ru: 'Код', en: 'Code' },
    'code': { ru: 'Код', en: 'Code' },
    'параметры': { ru: 'Параметры', en: 'Params' },
    'params': { ru: 'Параметры', en: 'Params' },
    'engine': { ru: 'Движок', en: 'Engine' },
    'движок': { ru: 'Движок', en: 'Engine' },
    'голос': { ru: 'Голос', en: 'Voice' },
    'voice': { ru: 'Голос', en: 'Voice' },
    'текст': { ru: 'Текст', en: 'Text' },
    'text': { ru: 'Текст', en: 'Text' },
    'длительность': { ru: 'Длительность', en: 'Duration' },
    'duration': { ru: 'Длительность', en: 'Duration' },
    'файл': { ru: 'Файл', en: 'File' },
    'file': { ru: 'Файл', en: 'File' },
    'пресет': { ru: 'Пресет', en: 'Preset' },
    'preset': { ru: 'Пресет', en: 'Preset' },
    'акцент': { ru: 'Акцент', en: 'Accent' },
    'accent': { ru: 'Акцент', en: 'Accent' },
    'эмоция': { ru: 'Эмоция', en: 'Mood' },
    'mood': { ru: 'Эмоция', en: 'Mood' },
    'дата': { ru: 'Дата', en: 'Date' },
    'date': { ru: 'Дата', en: 'Date' },
    'время': { ru: 'Время', en: 'Time' },
    'time': { ru: 'Время', en: 'Time' },
    'улучшение': { ru: 'Улучшение', en: 'Enhance' },
    'enhance': { ru: 'Улучшение', en: 'Enhance' },
    'промпт': { ru: 'Промпт', en: 'Prompt' },
    'prompt': { ru: 'Промпт', en: 'Prompt' },
    'до': { ru: 'До', en: 'Before' },
    'before': { ru: 'До', en: 'Before' },
    'после': { ru: 'После', en: 'After' },
    'after': { ru: 'После', en: 'After' }
  };

  function getLang() {
    var l = (document.documentElement.getAttribute('lang') || 'ru').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'ru';
  }

  function translate(raw) {
    if (!raw) return '';
    var key = raw.trim().toLowerCase().replace(/[:.]$/, '');
    var entry = DICT[key];
    return entry ? (entry[getLang()] || entry.ru || raw.trim()) : raw.trim();
  }

  function processTable(table) {
    if (!table) return;
    var thead = table.querySelector('thead');
    if (!thead) return;
    var ths = thead.querySelectorAll('th');
    if (!ths.length) return;
    var labels = [];
    for (var i = 0; i < ths.length; i++) {
      labels.push(translate(ths[i].textContent));
    }
    var tbody = table.querySelector('tbody');
    if (!tbody) return;
    var rows = tbody.querySelectorAll('tr');
    for (var r = 0; r < rows.length; r++) {
      var tds = rows[r].querySelectorAll('td');
      for (var c = 0; c < tds.length; c++) {
        tds[c].setAttribute('data-label', labels[c] || ('#' + (c + 1)));
      }
    }
  }

  function processAll() {
    var tables = document.querySelectorAll(
      '.help-modal-content table, .help-table, ' +
      '.batch-dialog table, .batch-modal table, .batch-table, ' +
      '.help-doc table, .ai-modal table'
    );
    for (var i = 0; i < tables.length; i++) {
      processTable(tables[i]);
    }
  }

  function init() {
    processAll();
    setTimeout(processAll, 300);
    setTimeout(processAll, 1000);
    setTimeout(processAll, 2500);
    setTimeout(processAll, 5000);

    var tables = document.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++) {
      var tbody = tables[i].querySelector('tbody');
      if (!tbody) continue;
      (function (tb) {
        var obs = new MutationObserver(function () { processAll(); });
        obs.observe(tb, { childList: true, subtree: false });
      })(tbody);
    }
  }

  var lastLang = getLang();
  setInterval(function () {
    var cur = getLang();
    if (cur !== lastLang) {
      lastLang = cur;
      document.querySelectorAll('td[data-label]').forEach(function (td) {
        td.removeAttribute('data-label');
      });
      processAll();
    }
  }, 800);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
