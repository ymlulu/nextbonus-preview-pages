(() => {
  'use strict';

  const api = window.NextBonusWatchlistState;
  if(!api) return;

  const raw = api.read();
  const storeKey = api.STORE_KEY;

  function repairStore(){
    let store;
    try{
      store = JSON.parse(localStorage.getItem(storeKey) || 'null');
    }catch(_){
      return;
    }
    if(!store || !Array.isArray(store.items)) return;

    let changed = false;
    store.items.forEach(item=>{
      if(item?.stage === 'history' && item.sourceType === 'legacy_unavailable'){
        item.sourceType = 'legacy_expired_history';
        item.sourceId = item.sourceId || `legacy-expired:${item.offerId}`;
        item.meta = {...(item.meta || {}), migratedAsDurableHistory:true};
        changed = true;
      }
    });

    const lifecycleEnded = new Set(
      store.items
        .filter(item=>item?.stage === 'history' && ['application','deal'].includes(item.sourceType))
        .map(item=>String(item.offerId))
    );
    const before = store.items.length;
    store.items = store.items.filter(item=>!(
      item?.stage !== 'history' &&
      item?.sourceType === 'legacy_saved' &&
      lifecycleEnded.has(String(item.offerId))
    ));
    if(store.items.length !== before) changed = true;

    if(changed){
      store.updatedAt = new Date().toISOString();
      localStorage.setItem(storeKey,JSON.stringify(store));
    }
  }

  repairStore();

  const originalSync = api.syncLegacyStateObject.bind(api);
  const guarded = Object.freeze({
    ...api,
    syncLegacyStateObject(legacyState){
      const current = api.read();
      if(current.legacySyncedAt) return current;
      const result = originalSync(legacyState);
      repairStore();
      return api.read() || result;
    }
  });

  window.NextBonusWatchlistState = guarded;
})();
