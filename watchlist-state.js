(() => {
  'use strict';

  const STORE_KEY = 'nextbonus-watchlist-v1';
  const LEGACY_APP_STATE_KEY = 'nextbonus-local-v8-state';
  const SCHEMA_VERSION = 1;
  const STAGES = new Set(['saved', 'in_progress', 'history']);

  const nowIso = () => new Date().toISOString();
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function emptyStore() {
    return { schemaVersion: SCHEMA_VERSION, items: [], updatedAt: null, legacySyncedAt: null };
  }

  function normalizeStage(stage) {
    return STAGES.has(stage) ? stage : 'saved';
  }

  function defaultStatus(stage) {
    if (stage === 'in_progress') return 'in_progress';
    if (stage === 'history') return 'completed';
    return 'saved';
  }

  function normalizeItem(item) {
    if (!item || !item.offerId) return null;
    const stage = normalizeStage(item.stage);
    return {
      id: String(item.id || `watch-${item.offerId}-${item.createdAt || 'legacy'}`),
      offerId: String(item.offerId),
      offerVersionId: item.offerVersionId || null,
      stage,
      status: item.status || defaultStatus(stage),
      followedAt: item.followedAt || null,
      startedAt: item.startedAt || null,
      completedAt: item.completedAt || null,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
      sourceId: item.sourceId || null,
      sourceType: item.sourceType || null,
      sourceOrder: Number.isInteger(item.sourceOrder) ? item.sourceOrder : null,
      meta: item.meta && typeof item.meta === 'object' ? clone(item.meta) : null
    };
  }

  function normalizeStore(raw) {
    const store = raw && typeof raw === 'object' ? raw : emptyStore();
    const items = Array.isArray(store.items) ? store.items.map(normalizeItem).filter(Boolean) : [];
    const seen = new Set();
    return {
      schemaVersion: SCHEMA_VERSION,
      items: items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }),
      updatedAt: store.updatedAt || null,
      legacySyncedAt: store.legacySyncedAt || null
    };
  }

  function readStore() {
    return normalizeStore(readJson(STORE_KEY, null));
  }

  function saveStore(store) {
    const next = normalizeStore(store);
    next.updatedAt = nowIso();
    writeJson(STORE_KEY, next);
    return clone(next);
  }

  function createId(offerId) {
    return `watch-${offerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function legacyItem(kind, offerId, order) {
    const history = kind === 'legacy_unavailable';
    return {
      id: `legacy:${kind}:${offerId}`,
      offerId,
      offerVersionId: null,
      stage: history ? 'history' : 'saved',
      status: history ? 'expired' : 'saved',
      followedAt: null,
      startedAt: null,
      completedAt: null,
      createdAt: null,
      updatedAt: null,
      sourceId: null,
      sourceType: kind,
      sourceOrder: order,
      meta: { migratedFrom: LEGACY_APP_STATE_KEY }
    };
  }

  function syncLegacyStateObject(legacyState) {
    const state = legacyState && typeof legacyState === 'object' ? legacyState : {};
    const saved = Array.isArray(state.savedOfferIds) ? state.savedOfferIds.map(String) : [];
    const unavailable = Array.isArray(state.unavailableSavedIds) ? state.unavailableSavedIds.map(String) : [];
    const savedSet = new Set(saved);
    const unavailableSet = new Set(unavailable.filter(id => !savedSet.has(id)));
    const store = readStore();

    store.items = store.items.filter(item => {
      if (item.sourceType === 'legacy_saved') return savedSet.has(item.offerId);
      if (item.sourceType === 'legacy_unavailable') return unavailableSet.has(item.offerId);
      return true;
    });

    saved.forEach((offerId, index) => {
      const hasActive = store.items.some(item => item.offerId === offerId && item.stage !== 'history');
      if (!hasActive) store.items.push(legacyItem('legacy_saved', offerId, index));
    });

    unavailable.forEach((offerId, index) => {
      if (savedSet.has(offerId)) return;
      const exists = store.items.some(item => item.offerId === offerId && item.sourceType === 'legacy_unavailable');
      if (!exists) store.items.push(legacyItem('legacy_unavailable', offerId, index));
    });

    store.legacySyncedAt = nowIso();
    return saveStore(store);
  }

  function activeForOffer(store, offerId) {
    return store.items.find(item => item.offerId === offerId && item.stage !== 'history') || null;
  }

  function follow(offerId, options = {}) {
    if (!offerId) return null;
    const store = readStore();
    const requestedStage = options.stage === 'in_progress' ? 'in_progress' : 'saved';
    const existing = activeForOffer(store, String(offerId));
    const timestamp = nowIso();

    if (existing) {
      existing.stage = requestedStage;
      existing.status = options.status || existing.status || defaultStatus(requestedStage);
      existing.offerVersionId = options.offerVersionId || existing.offerVersionId || null;
      existing.sourceId = options.sourceId || existing.sourceId || null;
      existing.sourceType = options.sourceType || existing.sourceType || 'watchlist';
      existing.startedAt = requestedStage === 'in_progress' ? (existing.startedAt || timestamp) : existing.startedAt;
      existing.updatedAt = timestamp;
      saveStore(store);
      return clone(existing);
    }

    const item = normalizeItem({
      id: createId(String(offerId)),
      offerId: String(offerId),
      offerVersionId: options.offerVersionId || null,
      stage: requestedStage,
      status: options.status || defaultStatus(requestedStage),
      followedAt: timestamp,
      startedAt: requestedStage === 'in_progress' ? timestamp : null,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sourceId: options.sourceId || null,
      sourceType: options.sourceType || 'watchlist',
      meta: options.meta || null
    });
    store.items.unshift(item);
    saveStore(store);
    return clone(item);
  }

  function moveToInProgress(offerId, status = 'in_progress', patch = {}) {
    return follow(offerId, { ...patch, stage: 'in_progress', status });
  }

  function archive(offerId, status = 'completed', patch = {}) {
    if (!offerId) return null;
    const store = readStore();
    const timestamp = nowIso();
    let item = activeForOffer(store, String(offerId));

    if (!item) {
      item = normalizeItem({
        id: createId(String(offerId)),
        offerId: String(offerId),
        stage: 'history',
        status,
        followedAt: patch.followedAt || null,
        startedAt: patch.startedAt || null,
        completedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        offerVersionId: patch.offerVersionId || null,
        sourceId: patch.sourceId || null,
        sourceType: patch.sourceType || 'watchlist',
        meta: patch.meta || null
      });
      store.items.unshift(item);
    } else {
      item.stage = 'history';
      item.status = status;
      item.completedAt = patch.completedAt || timestamp;
      item.updatedAt = timestamp;
      item.offerVersionId = patch.offerVersionId || item.offerVersionId || null;
      item.sourceId = patch.sourceId || item.sourceId || null;
      item.sourceType = patch.sourceType || item.sourceType || 'watchlist';
      if (patch.meta) item.meta = clone(patch.meta);
    }

    saveStore(store);
    return clone(item);
  }

  function unfollow(offerId) {
    const store = readStore();
    const before = store.items.length;
    store.items = store.items.filter(item => !(item.offerId === String(offerId) && item.stage !== 'history'));
    if (store.items.length !== before) saveStore(store);
    return before - store.items.length;
  }

  function list(stage = null) {
    const items = readStore().items;
    return clone(stage ? items.filter(item => item.stage === stage) : items);
  }

  function getActive(offerId) {
    return clone(activeForOffer(readStore(), String(offerId)));
  }

  const legacy = readJson(LEGACY_APP_STATE_KEY, null);
  if (legacy) syncLegacyStateObject(legacy);

  window.NextBonusWatchlistState = Object.freeze({
    STORE_KEY,
    SCHEMA_VERSION,
    read: () => clone(readStore()),
    list,
    getActive,
    follow,
    moveToInProgress,
    archive,
    unfollow,
    syncLegacyStateObject
  });
})();
