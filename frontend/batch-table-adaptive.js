/* v1.10.72: help-table / batch-table → text < 500px (RU/EN) */
(function () {
  'use strict';

  const DICT = {
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
    const l = (document.documentElement.getAttribute('lang') || 'ru').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'ru';
  }

  function translate(raw) {
    if (!raw) return '';
    const key = raw.trim().toLowerCase().replace(/[:.]$/, '');
    const entry = DICT[key];
    return entry ? (entry[getLang()] || entry.ru || raw.trim()) : raw.trim();
  }

  function processTable(table) {
    if (!table) return;
    const thead = table.querySelector('thead');
    if (!thead) return;
    const ths = thead.querySelectorAll('th');
    if (!ths.length) return;
    const labels = [];
    for (let i = 0; i < ths.length; i++) {
      labels.push(translate(ths[i].textContent));
    }
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr');
    for (let r = 0; r < rows.length; r++) {
      const tds = rows[r].querySelectorAll('td');
      for (let c = 0; c < tds.length; c++) {
        tds[c].setAttribute('data-label', labels[c] || (`#${  c + 1}`));
      }
    }
  }

  function processAll() {
    const tables = document.querySelectorAll(
      '.help-modal-content table, .help-table, ' +
      '.batch-dialog table, .batch-modal table, .batch-table, ' +
      '.help-doc table, .ai-modal table'
    );
    for (let i = 0; i < tables.length; i++) {
      processTable(tables[i]);
    }
  }

  function init() {
    processAll();
    setTimeout(processAll, 300);
    setTimeout(processAll, 1000);
    setTimeout(processAll, 2500);
    setTimeout(processAll, 5000);

    const tables = document.querySelectorAll('table');
    for (let i = 0; i < tables.length; i++) {
      const tbody = tables[i].querySelector('tbody');
      if (!tbody) continue;
      (function (tb) {
        const obs = new MutationObserver(() => { processAll(); });
        obs.observe(tb, { childList: true, subtree: false });
      })(tbody);
    }
  }

  let lastLang = getLang();
  setInterval(() => {
    const cur = getLang();
    if (cur !== lastLang) {
      lastLang = cur;
      document.querySelectorAll('td[data-label]').forEach((td) => {
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
