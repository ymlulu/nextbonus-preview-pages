(() => {
  'use strict';

  const APP_KEY = 'nextbonus-local-v8-state';
  const CYCLE_KEY = 'nextbonus-benefit-cycle-v1';

  const DEFINITIONS = {
    'p-amex-plat-1005': {
      '$600 FHR 酒店报销': 'half',
      '$300 数字娱乐报销': 'month',
      '$300 Equinox 报销': 'year',
      '$209 CLEAR 报销': 'year',
      '$200 Oura Ring Credit': 'year',
      '$300 Lululemon 报销': 'quarter',
      '$400 Resy 报销': 'quarter',
      'Walmart+ 会员': 'month',
      '$200 航空杂费报销': 'year',
      '$200 Uber Credit + $100 Uber One': 'month'
    }
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); }
    catch (_) { return {}; }
  }

  function write(value) {
    try { localStorage.setItem(CYCLE_KEY, JSON.stringify(value)); }
    catch (_) {}
  }

  function currentProduct() {
    const state = read(APP_KEY);
    const all = [...(state.products || []), ...(state.pastProducts || [])];
    return all.find((item) => item.id === state.currentProductId) || null;
  }

  function cycleFor(kind, now = new Date()) {
    const y = now.getFullYear();
    const m = now.getMonth();
    let start;
    let end;

    if (kind === 'month') {
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0);
    } else if (kind === 'quarter') {
      const q = Math.floor(m / 3) * 3;
      start = new Date(y, q, 1);
      end = new Date(y, q + 3, 0);
    } else if (kind === 'half') {
      const h = m < 6 ? 0 : 6;
      start = new Date(y, h, 1);
      end = new Date(y, h + 6, 0);
    } else if (kind === 'year') {
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
    } else {
      return null;
    }

    const today = new Date(y, m, now.getDate());
    const daysLeft = Math.ceil((end - today) / 86400000);
    return {
      id: `${kind}:${start.toISOString().slice(0, 10)}:${end.toISOString().slice(0, 10)}`,
      end,
      attentionActive: daysLeft >= 0 && daysLeft <= 7
    };
  }

  function recordKey(productId, title, cycleId) {
    return `${productId}|${title}|${cycleId}`;
  }

  function formatDate(date) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function render(detail) {
    const product = currentProduct();
    const defs = product && DEFINITIONS[product.id];
    const wrap = detail.closest('.v4-benefit-item-wrap');
    const row = wrap?.querySelector('.v4-benefit-row');
    const title = row?.querySelector('strong')?.textContent?.trim();
    const kind = title && defs?.[title];
    if (!product || !kind || !row) return;

    const cycle = cycleFor(kind);
    if (!cycle) return;

    const state = read(CYCLE_KEY);
    const key = recordKey(product.id, title, cycle.id);
    const used = state.records?.[key]?.status === 'used';

    detail.querySelector('[data-nb-cycle-ui]')?.remove();
    const box = document.createElement('div');
    box.dataset.nbCycleUi = '1';
    box.className = 'nb-benefit-cycle-ui';

    const endLabel = formatDate(cycle.end);
    box.innerHTML = `<dl><dt>本期可用至</dt><dd>${endLabel}</dd><dt>当前状态</dt><dd>${used ? '本期已使用' : '本期可使用'}${cycle.attentionActive && !used ? ` · 本期截止 ${endLabel}` : ''}</dd></dl>`;

    if (!detail.querySelector('.nb-benefit-attention-actions')) {
      const actions = document.createElement('div');
      actions.className = 'attention-actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `btn ${used ? 'secondary' : 'primary'} small`;
      button.textContent = used ? '撤销已使用' : '已使用';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = read(CYCLE_KEY);
        next.records = next.records || {};
        if (used) delete next.records[key];
        else next.records[key] = { status: 'used', updatedAt: new Date().toISOString() };
        write(next);
        render(detail);
      });
      actions.appendChild(button);
      box.appendChild(actions);
    }

    detail.appendChild(box);
  }

  function apply() {
    document.querySelectorAll('.v4-pd-benefits [data-nb-source-benefit-detail="1"]').forEach(render);
  }

  window.addEventListener('nextbonus-product-facts-rendered', apply);
  window.addEventListener('DOMContentLoaded', apply);
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();
