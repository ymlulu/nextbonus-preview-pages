(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';
  const CYCLE_KEY = 'nextbonus-benefit-cycle-v1';

  function esc(value) {
    return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); }
    catch (_) { return {}; }
  }

  function writeCycles(value) {
    try { localStorage.setItem(CYCLE_KEY, JSON.stringify(value)); }
    catch (_) {}
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[®™℠]/g, '').replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
  }

  function matchingAttention(title) {
    const state = readJson(STORAGE_KEY);
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

  function pad(value) { return String(value).padStart(2, '0'); }
  function dateKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
  function formatDate(date) { return `${date.getMonth() + 1}月${date.getDate()}日`; }

  function cycleWindow(type, now = new Date()) {
    const y = now.getFullYear();
    const m = now.getMonth();
    let start;
    let end;
    if (type === 'month') {
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0);
    } else if (type === 'quarter') {
      const first = Math.floor(m / 3) * 3;
      start = new Date(y, first, 1);
      end = new Date(y, first + 3, 0);
    } else if (type === 'half-year') {
      const first = m < 6 ? 0 : 6;
      start = new Date(y, first, 1);
      end = new Date(y, first + 6, 0);
    } else if (type === 'calendar-year') {
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
    } else {
      return null;
    }
    return { start, end, id: `${dateKey(start)}:${dateKey(end)}` };
  }

  function cycleInfo(row) {
    const benefitId = row?.dataset?.benefitId;
    const cycleType = row?.dataset?.cycleType;
    if (!benefitId || !cycleType) return null;
    const appState = readJson(STORAGE_KEY);
    const productId = appState.currentProductId;
    const window = cycleWindow(cycleType);
    if (!productId || !window) return null;
    const key = `${productId}|${benefitId}|${window.id}`;
    const store = readJson(CYCLE_KEY);
    const record = store.records?.[key] || null;
    return { productId, benefitId, cycleType, key, window, record, used: record?.status === 'used' };
  }

  function appAction(action, id) {
    if (!action || !id) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.hidden = true;
    button.dataset.action = action;
    button.dataset.id = id;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function setCycleUsed(info, used, attention) {
    const store = readJson(CYCLE_KEY);
    store.records = store.records || {};
    if (used) {
      store.records[info.key] = {
        status: 'used',
        usedAt: new Date().toISOString(),
        attentionId: attention?.id || null
      };
    } else {
      delete store.records[info.key];
    }
    writeCycles(store);
    window.dispatchEvent(new CustomEvent('nextbonus-benefit-cycle-changed', {
      detail: { productId: info.productId, benefitId: info.benefitId, cycleId: info.window.id, status: used ? 'used' : 'available' }
    }));
    if (used && attention?.id) appAction('complete-attention', attention.id);
    if (!used && info.record?.attentionId) {
      const appState = readJson(STORAGE_KEY);
      const history = Array.isArray(appState.attentionHistory) ? appState.attentionHistory : [];
      if (history.some((item) => item.id === info.record.attentionId)) appAction('history-correction', info.record.attentionId);
    }
  }

  function detailMarkup(row, title, short, attention) {
    const cycle = cycleInfo(row);
    const rows = [['福利说明', short || '以当前公开规则为准']];
    if (cycle) {
      rows.push(['本期可用至', formatDate(cycle.window.end)]);
      rows.push(['当前状态', cycle.used ? '本期已使用' : '本期可使用']);
    }
    if (attention?.time) rows.push(['本期提醒', attention.time]);
    if (attention?.summary) rows.push(['使用提示', attention.summary]);

    const checklist = Array.isArray(attention?.checklist) ? attention.checklist : [];
    let actions = '';
    if (cycle) {
      actions = `<div class="nb-benefit-attention-actions">
        ${attention?.instruction ? `<div class="instruction-title">${esc(attention.instruction)}</div>` : ''}
        ${checklist.length ? `<div class="checklist">${checklist.map((item) => `<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done ? 'checked' : ''}><span>${esc(item.label)}</span></label>`).join('')}</div>` : ''}
        <div class="attention-actions"><button class="btn ${cycle.used ? 'secondary' : 'primary'} small" type="button" data-nb-cycle-toggle="1">${cycle.used ? '撤销已使用' : '已使用'}</button>${attention?.secondaryAction ? `<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>` : ''}</div>
      </div>`;
    } else if (attention) {
      actions = `<div class="nb-benefit-attention-actions">
        ${attention.instruction ? `<div class="instruction-title">${esc(attention.instruction)}</div>` : ''}
        ${checklist.length ? `<div class="checklist">${checklist.map((item) => `<label class="check"><input type="checkbox" data-action="checklist" data-attention="${esc(attention.id)}" data-check="${esc(item.id)}" ${item.done ? 'checked' : ''}><span>${esc(item.label)}</span></label>`).join('')}</div>` : ''}
        <div class="attention-actions"><button class="btn primary small" data-action="complete-attention" data-id="${esc(attention.id)}">${esc(attention.primary || '确认完成')}</button>${attention.secondaryAction ? `<button class="btn secondary small" data-action="skip-attention" data-id="${esc(attention.id)}">${esc(attention.secondaryAction)}</button>` : ''}</div>
      </div>`;
    }

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

  function openDetail(row) {
    const wrap = row.closest('.v4-benefit-item-wrap');
    if (!wrap) return;
    const title = row.querySelector('strong')?.textContent?.trim() || '';
    const short = row.querySelector('small')?.textContent?.trim() || '';
    wrap.insertAdjacentHTML('beforeend', detailMarkup(row, title, short, matchingAttention(title)));
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
    openDetail(row);
    row.setAttribute('aria-expanded', 'true');
    if (chev) chev.classList.add('up');
  }

  function refreshRow(row) {
    const wrap = row.closest('.v4-benefit-item-wrap');
    const detail = wrap?.querySelector(':scope > [data-nb-source-benefit-detail="1"]');
    if (!detail) return;
    detail.remove();
    openDetail(row);
  }

  function enhance() {
    document.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach(ensureAffordance);
  }

  document.addEventListener('click', (event) => {
    const cycleButton = event.target.closest?.('[data-nb-cycle-toggle="1"]');
    if (cycleButton) {
      event.preventDefault();
      event.stopPropagation();
      const row = cycleButton.closest('.v4-benefit-item-wrap')?.querySelector('.v4-benefit-row');
      const title = row?.querySelector('strong')?.textContent?.trim() || '';
      const cycle = cycleInfo(row);
      if (!row || !cycle) return;
      const attention = matchingAttention(title);
      setCycleUsed(cycle, !cycle.used, attention);
      if (!attention) refreshRow(row);
      return;
    }
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
