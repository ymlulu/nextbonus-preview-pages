(() => {
  'use strict';

  const STATE_KEY = 'nextbonus-local-v8-state';
  const SEEN_KEY = 'nextbonus-attention-product-seen-v1';
  let queued = false;

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function readState() {
    return readJson(STATE_KEY, {});
  }

  function localDateISO(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function daysUntil(dateString) {
    if (!dateString) return null;
    const due = new Date(`${dateString}T12:00:00`);
    const today = new Date(`${localDateISO()}T12:00:00`);
    if (Number.isNaN(due.getTime()) || Number.isNaN(today.getTime())) return null;
    return Math.ceil((due - today) / 86400000);
  }

  // This mirrors the current V1 presentation window only so red dots consume the
  // same items the existing reminder badge exposes. It never changes Attention state.
  function isActiveNow(item) {
    const days = daysUntil(item?.dueDate);
    if (item?.type === 'benefit') return days !== null && days >= 0 && days <= 7;
    if (item?.type === 'annual') return days !== null && days >= 0 && days <= 30;
    return true;
  }

  function activeAttention(state) {
    const list = Array.isArray(state?.activeAttention) ? state.activeAttention : [];
    return list.filter(isActiveNow);
  }

  function attentionSignature(item) {
    return [
      item?.id || '',
      item?.benefitId || '',
      item?.cycleId || '',
      item?.dueDate || '',
      item?.action || ''
    ].join('|');
  }

  function activeForProduct(state, productId) {
    return activeAttention(state).filter(item => item.productId === productId);
  }

  function pruneSeen(state) {
    const seen = readJson(SEEN_KEY, {});
    const activeByProduct = new Map();
    activeAttention(state).forEach(item => {
      if (!activeByProduct.has(item.productId)) activeByProduct.set(item.productId, new Set());
      activeByProduct.get(item.productId).add(attentionSignature(item));
    });

    let changed = false;
    Object.keys(seen).forEach(productId => {
      const current = activeByProduct.get(productId);
      if (!current || !current.size) {
        delete seen[productId];
        changed = true;
        return;
      }
      const previous = Array.isArray(seen[productId]) ? seen[productId] : [];
      const next = previous.filter(signature => current.has(signature));
      if (next.length !== previous.length) {
        seen[productId] = next;
        changed = true;
      }
    });

    if (changed) writeJson(SEEN_KEY, seen);
    return seen;
  }

  function markProductSeen(state, productId) {
    if (!productId) return;
    const signatures = activeForProduct(state, productId).map(attentionSignature).sort();
    const seen = readJson(SEEN_KEY, {});
    const previous = Array.isArray(seen[productId]) ? [...seen[productId]].sort() : [];
    if (JSON.stringify(previous) === JSON.stringify(signatures)) return;
    if (signatures.length) seen[productId] = signatures;
    else delete seen[productId];
    writeJson(SEEN_KEY, seen);
  }

  function hasUnseen(state, seen, productId) {
    const known = new Set(Array.isArray(seen[productId]) ? seen[productId] : []);
    return activeForProduct(state, productId).some(item => !known.has(attentionSignature(item)));
  }

  function makeDot(extraClass = '', label = '需要关注') {
    const dot = document.createElement('span');
    dot.className = `nb-attention-dot ${extraClass}`.trim();
    dot.setAttribute('role', 'img');
    dot.setAttribute('aria-label', label);
    return dot;
  }

  function setDirectDot(host, selectorClass, shouldShow, label = '需要关注') {
    if (!host) return false;
    const existing = Array.from(host.children).find(child => child.classList?.contains(selectorClass));
    if (shouldShow && !existing) {
      host.appendChild(makeDot(selectorClass, label));
      return true;
    }
    if (!shouldShow && existing) {
      existing.remove();
      return true;
    }
    return !!existing;
  }

  function syncWallet(state) {
    const page = document.querySelector('.v4-products-page');
    if (!page) return;

    // The sidebar reminder count is the global summary now; do not duplicate it
    // with another pending list at the top of Wallet.
    page.querySelectorAll('.v4-needs-attention').forEach(node => node.remove());

    const seen = pruneSeen(state);
    page.querySelectorAll('.v4-owned-product-card[data-id]').forEach(tile => {
      const productId = tile.dataset.id;
      const show = hasUnseen(state, seen, productId);
      setDirectDot(tile, 'nb-wallet-attention-dot', show, '有新的提醒');

      if (!tile.dataset.nbBaseAriaLabel) {
        tile.dataset.nbBaseAriaLabel = tile.getAttribute('aria-label') || '';
      }
      const base = tile.dataset.nbBaseAriaLabel;
      if (base) tile.setAttribute('aria-label', show ? `${base}，有新的提醒` : base);
    });
  }

  function productById(state, productId) {
    return [
      ...(Array.isArray(state?.products) ? state.products : []),
      ...(Array.isArray(state?.pastProducts) ? state.pastProducts : [])
    ].find(product => product.id === productId) || null;
  }

  function findOverviewFact(page, labelText) {
    return Array.from(page.querySelectorAll('.v4-pd-facts > div')).find(item => {
      return item.querySelector('small')?.textContent?.trim() === labelText;
    }) || null;
  }

  function decorateAnnualFee(page, attention) {
    const annual = attention.filter(item => item.type === 'annual');
    const fact = findOverviewFact(page, '年费');
    const value = fact?.querySelector('strong');
    if (!value) return new Set();
    setDirectDot(value, 'nb-detail-attention-dot', annual.length > 0, '年费需要关注');
    return new Set(annual.map(item => item.id));
  }

  function decorateBenefits(page, attention) {
    const benefits = attention.filter(item => item.type === 'benefit');
    const matched = new Set();
    page.querySelectorAll('.v4-pd-benefits .v4-benefit-row').forEach(row => {
      const benefitId = row.dataset.benefitId || '';
      const hits = benefitId ? benefits.filter(item => item.benefitId === benefitId) : [];
      const title = row.querySelector('strong');
      if (title) setDirectDot(title, 'nb-detail-attention-dot', hits.length > 0, '这项福利需要关注');
      hits.forEach(item => matched.add(item.id));
    });
    return matched;
  }

  function buildAttentionRow(item, productId, rowClass) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = rowClass;
    row.dataset.action = 'attention-for-product';
    row.dataset.id = productId;

    const dot = makeDot('nb-detail-attention-dot', '需要关注');
    const copy = document.createElement('span');
    copy.className = 'nb-inline-attention-copy';
    const title = document.createElement('strong');
    title.textContent = item.action || '需要关注';
    const secondary = document.createElement('small');
    secondary.textContent = item.secondary || item.key || '';
    copy.appendChild(title);
    if (secondary.textContent) copy.appendChild(secondary);

    const time = document.createElement('span');
    time.className = 'nb-inline-attention-time';
    time.textContent = item.time || '';
    const chevron = document.createElement('span');
    chevron.className = 'nb-inline-attention-chevron';
    chevron.textContent = '›';
    row.append(dot, copy, time, chevron);
    return row;
  }

  function renderBonusBlock(page, attention, product) {
    const bonuses = attention.filter(item => item.type === 'bonus');
    const existing = page.querySelector('.nb-attention-reward-block');
    if (!bonuses.length) {
      existing?.remove();
      return new Set();
    }

    const signature = bonuses.map(attentionSignature).sort().join('||');
    if (existing?.dataset.nbSignature === signature) {
      return new Set(bonuses.map(item => item.id));
    }
    existing?.remove();

    const section = document.createElement('section');
    section.className = 'v4-pd-section nb-attention-reward-block';
    section.dataset.nbSignature = signature;
    const head = document.createElement('div');
    head.className = 'v4-section-head';
    const heading = document.createElement('h2');
    heading.textContent = product?.type === '信用卡' ? '开卡奖励' : '开户奖励';
    head.appendChild(heading);
    const list = document.createElement('div');
    list.className = 'nb-attention-reward-list';
    bonuses.forEach(item => list.appendChild(buildAttentionRow(item, product?.id || item.productId, 'nb-attention-reward-row')));
    section.append(head, list);

    const anchor = page.querySelector('.v4-pd-benefits') || page.querySelector('.v4-pd-history');
    if (anchor?.parentNode) anchor.parentNode.insertBefore(section, anchor);
    else page.appendChild(section);
    return new Set(bonuses.map(item => item.id));
  }

  function renderFallbackRows(page, attention, representedIds, productId) {
    const remaining = attention.filter(item => !representedIds.has(item.id));
    const existing = page.querySelector('.nb-detail-attention-strips');
    if (!remaining.length) {
      existing?.remove();
      return;
    }

    const signature = remaining.map(attentionSignature).sort().join('||');
    if (existing?.dataset.nbSignature === signature) return;
    existing?.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'nb-detail-attention-strips';
    wrapper.dataset.nbSignature = signature;
    remaining.forEach(item => wrapper.appendChild(buildAttentionRow(item, productId, 'nb-detail-attention-strip')));

    const anchor = page.querySelector('.v4-pd-benefits') || page.querySelector('.v4-pd-history');
    if (anchor?.parentNode) anchor.parentNode.insertBefore(wrapper, anchor);
    else page.appendChild(wrapper);
  }

  function syncDetail(state) {
    const page = document.querySelector('.v4-product-detail-page');
    if (!page) return;

    // Product Detail no longer carries a second full reminder list. Attention is
    // reflected at the actual reward / benefit / fee / update location instead.
    page.querySelectorAll('.v4-pd-attention').forEach(node => node.remove());

    const productId = state.currentProductId;
    if (!productId) return;
    const product = productById(state, productId);
    const related = activeForProduct(state, productId);

    // Visiting the Product Detail acknowledges the product-level discovery dot,
    // but does not complete or remove any Attention item.
    markProductSeen(state, productId);

    const represented = new Set();
    renderBonusBlock(page, related, product).forEach(id => represented.add(id));
    decorateAnnualFee(page, related).forEach(id => represented.add(id));
    decorateBenefits(page, related).forEach(id => represented.add(id));
    renderFallbackRows(page, related, represented, productId);
  }

  function sync() {
    const state = readState();
    if (!state || typeof state !== 'object') return;
    syncWallet(state);
    syncDetail(state);
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }

  window.addEventListener('storage', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('nextbonus-product-facts-rendered', schedule);
  document.addEventListener('click', () => setTimeout(schedule, 0));
  document.addEventListener('change', () => setTimeout(schedule, 0));

  const root = document.getElementById('app');
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });

  window.NextBonusAttentionDotUI = Object.freeze({ sync });
})();
