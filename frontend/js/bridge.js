/* bridge.js — единая точка для classic scripts (window.__jst.*)
   ⚠ Подключается как <script src="/static/js/bridge.js"></script> ДО app.js
   ПОСЛЕ i18n-data.js, ui-helpers.js, help-content.js.

   Barrel паттерн для classic: агрегирует все window.__jst* в один объект,
   чтобы новые classic-скрипты могли обращаться через window.__jst.X,
   а не помнить 4 разных имени (__jstI18n, __jstHelpers, __jstPwa, __jstHelpContent).

   Существующие window.__jstI18n и др. НЕ удаляются — обратная совместимость
   с app.js-делегатами, которые уже написаны.
*/
(function () {
  'use strict';

  // Безопасная сборка с fallback на пустые объекты
  const jst = {
    // Данные (classic scripts)
    i18n: (typeof window !== 'undefined' && window.__jstI18n && window.__jstI18n.I18N) || { ru: {}, en: {} },
    helpers: (typeof window !== 'undefined' && window.__jstHelpers) || {},

    // Данные (module scripts, экспортированные через <script type="module">)
    pwa: (typeof window !== 'undefined' && window.__jstPwa) || null,
    helpContent: (typeof window !== 'undefined' && window.__jstHelpContent && window.__jstHelpContent.HELP_HTML) || '',

    // Версия bridge — для диагностики
    version: '5d',
  };

  // Метод получения перевода — удобный шорткат
  // window.__jst.t('batch_title', 'ru') → 'Пакетный синтез'
  jst.t = function (key, lang) {
    const L = lang || (typeof window.LANG !== 'undefined' ? window.LANG : 'ru');
    const dict = jst.i18n[L] || jst.i18n.ru || {};
    const v = dict[key];
    return (v && typeof v === 'string') ? v : key;
  };

  // shim-проверка: всё ли загрузилось до bridge.js?
  jst.ready = function () {
    const missing = [];
    if (!window.__jstI18n) missing.push('i18n-data.js');
    if (!window.__jstHelpers) missing.push('ui-helpers.js');
    if (!window.__jstPwa) missing.push('pwa.js (module — загружается async)');
    if (!window.__jstHelpContent) missing.push('help-content.js (module — загружается async)');
    return { ok: missing.length === 0, missing: missing };
  };

  window.__jst = jst;
  console.log(`[JST bridge] v${  jst.version  } ready;`,
    `i18n=${  Object.keys(jst.i18n).join(',')}`,
    `helpers=${  Object.keys(jst.helpers).join(',')}`,
    `pwa=${  jst.pwa ? 'yes' : 'pending'}`,
    `helpContent=${  jst.helpContent ? `${jst.helpContent.length  }b` : 'pending'}`);
})();
