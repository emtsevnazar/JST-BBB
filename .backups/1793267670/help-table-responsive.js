// Адаптивная таблица help-table для экранов < 500px
(function() {
  'use strict';

  function setDataLabels() {
    const tables = document.querySelectorAll('.help-table');
    tables.forEach(function(table) {
      const headers = table.querySelectorAll('thead th');
      if (!headers.length) return;

      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(function(row) {
        const cells = row.querySelectorAll('td');
        cells.forEach(function(cell, index) {
          if (headers[index]) {
            // Берём текст заголовка (уже переведённый через i18n)
            const label = headers[index].textContent.trim();
            if (label) {
              cell.setAttribute('data-label', label);
            }
          }
        });
      });
    });
  }

  // Запускаем после загрузки DOM и после возможного перевода
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setDataLabels);
  } else {
    setDataLabels();
  }

  // Повторяем при смене языка (если i18n перерисовывает таблицу)
  const observer = new MutationObserver(function() {
    setDataLabels();
  });
  const helpModal = document.getElementById('help-modal');
  if (helpModal) {
    observer.observe(helpModal, { childList: true, subtree: true });
  }
})();
