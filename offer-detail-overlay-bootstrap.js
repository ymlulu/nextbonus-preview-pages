(() => {
  'use strict';

  const STATE_KEY = 'nextbonus-local-v8-state';
  const originalStorageSet = Storage.prototype.setItem;
  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);

  function safeParse(raw){
    try{return JSON.parse(raw || 'null');}catch(_err){return null;}
  }

  function sourceFor(state){
    return state?.routeSource === 'wishlist' || state?.route === 'wishlist' ? 'wishlist' : 'discover';
  }

  function overlayInfoFromState(state){
    if(!state?.currentOfferId) return null;
    const source = sourceFor(state);
    return {
      offerId: state.currentOfferId,
      source,
      scrollY: Number(state.pageScroll?.[source] || 0),
      posterIndex: Number(state.posterIndex || 0)
    };
  }

  function normalizedPersistedState(state, info){
    if(!state || !info) return state;
    return {
      ...state,
      route: info.source,
      routeSource: info.source,
      currentOfferId: info.offerId,
      offerOverlay: info
    };
  }

  let saved = safeParse(localStorage.getItem(STATE_KEY)) || {};
  let active = history.state?.nbOfferOverlay || saved.offerOverlay || null;
  let restoring = false;

  /* Migrate any legacy persisted standalone Offer Detail route into source+overlay state. */
  if(saved.route === 'offer-detail' && saved.currentOfferId){
    const info = overlayInfoFromState(saved);
    saved = normalizedPersistedState(saved, info);
    active = active || info;
    originalStorageSet.call(localStorage, STATE_KEY, JSON.stringify(saved));
  }

  /* Keep app.js free to use its internal Offer Detail renderer while making persistence
     reflect the real navigation model: source page + Offer Detail overlay. */
  Storage.prototype.setItem = function(key, value){
    if(this === localStorage && key === STATE_KEY){
      const next = safeParse(value);
      if(next){
        if(next.route === 'offer-detail' && next.currentOfferId){
          const info = overlayInfoFromState(next);
          active = info;
          return originalStorageSet.call(this, key, JSON.stringify(normalizedPersistedState(next, info)));
        }

        /* Once navigation actually returns to a base route, stale overlay state must not
           survive and reopen the offer on the next mobile restore/reload. */
        if(['discover','wishlist','products','attention','login'].includes(next.route)){
          const copy = {...next};
          if(active && restoring && (next.route === active.source)) copy.offerOverlay = active;
          else delete copy.offerOverlay;
          return originalStorageSet.call(this, key, JSON.stringify(copy));
        }
      }
    }
    return originalStorageSet.call(this, key, value);
  };

  function transformHistoryState(state){
    if(!state?.nb || state.route !== 'offer-detail' || !state.currentOfferId) return null;
    const info = overlayInfoFromState(state);
    active = info;
    return {
      ...state,
      route: info.source,
      routeSource: info.source,
      nbOfferOverlay: info
    };
  }

  history.pushState = function(state, title, url){
    const transformed = transformHistoryState(state);
    if(transformed){
      if(restoring) return originalReplace(transformed, title, url);
      return originalPush(transformed, title, url);
    }
    return originalPush(state, title, url);
  };

  history.replaceState = function(state, title, url){
    const transformed = transformHistoryState(state);
    if(transformed) return originalReplace(transformed, title, url);

    /* app.js replaces history.state on initial boot. Preserve the overlay marker across
       refresh so the runtime can reconstruct the same overlay after the source page loads. */
    if(state?.nb && active && state.route === active.source && !state.nbOfferOverlay){
      return originalReplace({...state, nbOfferOverlay:active}, title, url);
    }
    return originalReplace(state, title, url);
  };

  /* This listener is registered before app.js. It updates overlay ownership before
     app.js handles popstate, so mobile Back writes a clean source state instead of
     persisting a stale Offer Detail resume marker. */
  window.addEventListener('popstate', event => {
    active = event.state?.nbOfferOverlay || null;
    restoring = false;
    window.dispatchEvent(new CustomEvent('nb:offer-overlay-history', {
      detail: {overlay:active, state:event.state || null}
    }));
  }, true);

  window.NBOfferOverlayBridge = Object.freeze({
    getActive(){ return active; },
    beginRestore(info){ active = info || active; restoring = true; },
    endRestore(){ restoring = false; },
    clear(){ active = null; restoring = false; },
    isRestoring(){ return restoring; }
  });
})();
