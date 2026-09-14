(() => {
  'use strict';

  function apply() {
    const earning = document.querySelector('.v4-product-detail-page .v4-pd-earning');
    if (!earning) return;

    const count = earning.querySelectorAll(':scope > div').length;
    if (!count) return;

    const columns = [];
    for (let i = 0; i < count; i += 1) {
      if (i) columns.push('1px');
      columns.push('minmax(0,1fr)');
    }

    earning.style.gridTemplateColumns = columns.join(' ');
    earning.dataset.earningColumns = String(count);
  }

  window.addEventListener('nextbonus-product-facts-rendered', apply);
  window.addEventListener('DOMContentLoaded', apply);
  apply();
})();
