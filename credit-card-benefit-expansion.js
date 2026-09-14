(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function currentProductId() {
    return readState().currentProductId || null;
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[®™℠]/g, '')
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
  }

  function matchingAttention(title, productId) {
    if (!productId) return null;
    const state = readState();
    const items = Array.isArray(state.activeAttention) ? state.activeAttention : [];
    const needle = normalize(title);
    if (!needle) return null;

    return items.find((item) => {
      if (item.productId !== productId || item.type !== 'benefit') return false;
      const haystack = normalize(`${item.action || ''} ${item.key || ''} ${item.secondary || ''}`);
      return haystack.includes(needle) || needle.includes(haystack);
    }) || null;
  }

  function detailMarkup(title, short, attention) {
    const rows = [
      ['福利说明', short || '以当前公开规则为准']
    ];

    if (attention?.time) rows.push(['本期时间', attention.time]);
    if (attention?.keySub) rows.push(['当前周期', attention.keySub]);
    if (attention?.summary) rows.push(['使用提示', attention.summary]);

    return `<div class="benefit-detail v4-benefit-expanded nb-source-benefit-expanded" data-nb-source-benefit-detail="1">
      <dl>${rows.map(([label, value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>
    </div>`;
  }

  function closeOthers(section, keepWrap) {
    section.querySelectorAll('[data-nb-source-benefit-detail="1"]').forEach((detail) => {
      const wrap = detail.closest('.v4-benefit-item-wrap');
      if (wrap === keepWrap) return;
      detail.remove();
      const row = wrap?.querySelector('.v4-benefit-row');
      const chev = row?.querySelector('b,.chev');
      if (row) row.setAttribute('aria-expanded', 'false');
      if (chev) chev.classList.remove('up');
    });
  }

  function ensureAffordance(row) {
    if (!row || row.dataset.action === 'toggle-benefit') return;
    row.classList.add('nb-source-benefit-row');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    if (!row.hasAttribute('aria-expanded')) row.setAttribute('aria-expanded', 'false');
    if (!row.querySelector('b,.chev')) {
      const chev = document.createElement('b');
      chev.className = 'chev';
      chev.setAttribute('aria-hidden', 'true');
      chev.textContent = '›';
      row.appendChild(chev);
    }
  }

  function toggle(row) {
    if (!row || row.dataset.action === 'toggle-benefit') return;
    const section = row.closest('.v4-pd-benefits');
    const wrap = row.closest('.v4-benefit-item-wrap');
    if (!section || !wrap) return;

    const existing = wrap.querySelector(':scope > [data-nb-source-benefit-detail="1"]');
    closeOthers(section, wrap);

    const chev = row.querySelector('b,.chev');
    if (existing) {
      existing.remove();
      row.setAttribute('aria-expanded', 'false');
      if (chev) chev.classList.remove('up');
      return;
    }

    const title = row.querySelector('strong')?.textContent?.trim() || '';
    const short = row.querySelector('small')?.textContent?.trim() || '';
    const attention = matchingAttention(title, currentProductId());
    wrap.insertAdjacentHTML('beforeend', detailMarkup(title, short, attention));
    row.setAttribute('aria-expanded', 'true');
    if (chev) chev.classList.add('up');
  }

  function enhance() {
    document.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach(ensureAffordance);
  }

  document.addEventListener('click', (event) => {
    const row = event.target.closest?.('.v4-pd-benefits .v4-benefit-row');
    if (!row || row.dataset.action === 'toggle-benefit') return;
    event.preventDefault();
    toggle(row);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest?.('.v4-pd-benefits .v4-benefit-row');
    if (!row || row.dataset.action === 'toggle-benefit') return;
    event.preventDefault();
    toggle(row);
  });

  window.addEventListener('nextbonus-product-facts-rendered', enhance);
  window.addEventListener('DOMContentLoaded', enhance);
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
  enhance();
})();
