(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';

  function esc(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (_) { return {}; }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[®™℠]/g, '').replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
  }

  function matchingAttention(title) {
    const state = readState();
    const productId = state.currentProductId;
    const items = Array.isArray(state.activeAttention) ? state.activeAttention : [];
    const needle = normalize(title);
    const aliases = ['uber','clear','hilton','marriott','resy','walmart','lululemon','oura','equinox','globalentry','tsa','prioritypass','航空','酒店'];
    return items.find((item) => {
      if (item.productId !== productId || item.type !== 'benefit') return false;
      const haystack = normalize(`${item.action || ''} ${item.key || ''} ${item.secondary || ''}`);
      if (haystack.includes(needle) || needle.includes(haystack)) return true;
      return aliases.some((word) => needle.includes(normalize(word)) && haystack.includes(normalize(word)));
    }) || null;
  }

  function detailMarkup(title, short, attention) {
    const rows = [['福利说明', short || '以当前公开规则为准']];
    if (attention?.time) rows.push(['本期时间', attention.time]);
    if (attention?.keySub) rows.push(['当前周期', attention.keySub]);
    if (attention?.summary) rows.push(['使用提示', attention.summary]);
    const checklist = Array.isArray(attention?.checklist) ? attention.checklist : [];
    const actions = attention ? `<div class="nb-benefit-attention-actions">
      ${attention.instruction ? `<div class="instruction-title">${esc(attention.instruction)}</div>` : ''}
      ${checklist.length ? `<div class="checklist">${checklist.map((item) => `<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done ? 'checked' : ''}><span>${esc(item.label)}</span></label>`).join('')}</div>` : ''}
      <div class="attention-actions"><button class="btn primary small" data-action="complete-attention" data-id="${esc(attention.id)}">${esc(attention.primary || '确认完成')}</button>${attention.secondaryAction ? `<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>` : ''}</div>
    </div>` : '';
    return `<div class="benefit-detail v4-benefit-expanded nb-source-benefit-expanded" data-nb-source-benefit-detail="1"><dl>${rows.map(([label, value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>${actions}</div>`;
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
    wrap.insertAdjacentHTML('beforeend', detailMarkup(title, short, matchingAttention(title)));
    row.setAttribute('aria-expanded', 'true');
    if (chev) chev.classList.add('up');
  }

  function enhance() {
    document.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach(ensureAffordance);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest?.('[data-action]')) return;
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
  enhance();
})();
