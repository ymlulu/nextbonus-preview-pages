(() => {
  'use strict';

  const STORAGE_KEY = 'nextbonus-local-v8-state';

  function identity({ productId, benefitId, cycleType, date }) {
    const cycleId = window.NextBonusBenefitCycle?.cycleId(cycleType, date);
    if (!productId || !benefitId || !cycleType || !cycleId) return null;
    return { productId, benefitId, cycleType, cycleId };
  }

  function isStructured(item) {
    return !!(item?.productId && item.benefitId && item.cycleType && item.cycleId);
  }

  function isLegacy(item) {
    return !item?.benefitId;
  }

  function matchingBenefitAttention(items, identity, legacyMatch) {
    const list = Array.isArray(items) ? items : [];
    if (identity?.productId && identity.benefitId && identity.cycleId) {
      const exact = list.find(item => item.type === 'benefit' && isStructured(item) &&
        item.productId === identity.productId &&
        item.benefitId === identity.benefitId &&
        item.cycleId === identity.cycleId);
      if (exact) return exact;
    }
    if (typeof legacyMatch !== 'function') return null;
    return list.find(item => item.type === 'benefit' && isLegacy(item) && legacyMatch(item)) || null;
  }

  function seedIdentity(item) {
    if (!item || item.type !== 'benefit') return null;
    if (item.id === 'a-hilton-credit' && item.productId === 'p-hilton-aspire-2308') {
      const expectedBenefitId = 'hilton-aspire-resort-credit';
      if (item.benefitId && item.benefitId !== expectedBenefitId) return null;
      return identity({
        productId: item.productId,
        benefitId: expectedBenefitId,
        cycleType: 'half-year',
        date: item.dueDate || '2026-09-18'
      });
    }
    return null;
  }

  function applyIdentity(item, structured) {
    if (!item || !structured) return false;
    let changed = false;
    for (const key of ['productId', 'benefitId', 'cycleType', 'cycleId']) {
      if (item[key] !== structured[key]) {
        item[key] = structured[key];
        changed = true;
      }
    }
    return changed;
  }

  function backfillPersistedState() {
    let state;
    try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (_) { return false; }
    if (!state || typeof state !== 'object') return false;

    let changed = false;
    const active = Array.isArray(state.activeAttention) ? state.activeAttention : [];
    for (const item of active) {
      const structured = isStructured(item) ? item : seedIdentity(item);
      if (structured && applyIdentity(item, structured)) changed = true;
    }

    const history = Array.isArray(state.attentionHistory) ? state.attentionHistory : [];
    for (const item of history) {
      const source = item?.source && typeof item.source === 'object' ? item.source : null;
      let structured = source && isStructured(source) ? source : null;
      if (!structured && source) {
        structured = seedIdentity(source);
        if (structured && applyIdentity(source, structured)) changed = true;
      }
      if (!structured && isStructured(item)) structured = item;
      if (!structured) structured = seedIdentity(item);
      if (structured && applyIdentity(item, structured)) changed = true;
    }

    if (!changed) return false;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) { return false; }
    return true;
  }

  window.NextBonusBenefitAttention = Object.freeze({
    identity,
    isStructured,
    isLegacy,
    matchingBenefitAttention,
    backfillPersistedState
  });

  backfillPersistedState();
})();
