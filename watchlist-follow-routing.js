(() => {
  'use strict';

  const LEGACY_KEY = 'nextbonus-local-v8-state';
  const POLICY_URL = 'offer-follow-up-policy.json';
  const DEFAULT_POLICY = Object.freeze({followUpMode:'none',watchlistEntry:'saved'});
  let policyMap = {};
  let ready = false;
  let lastSaved = new Set();
  let queued = false;

  function readLegacy(){
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function policyFor(offerId){ return policyMap[offerId] || DEFAULT_POLICY; }

  function statusFor(policy){
    if(policy.followUpMode === 'deal' && policy.watchlistEntry === 'in_progress') return 'deal_active';
    if(policy.followUpMode === 'application' && policy.watchlistEntry === 'in_progress') return 'awaiting_result';
    return 'in_progress';
  }

  function applyPolicy(offerId){
    const api = window.NextBonusWatchlistState;
    if(!api || !ready) return null;
    const item = api.getActive(offerId);
    if(!item) return null;
    const policy = policyFor(offerId);
    if(policy.watchlistEntry !== 'in_progress' || item.stage !== 'saved') return item;
    return api.moveToInProgress(offerId,statusFor(policy),{
      sourceType:policy.followUpMode === 'deal' ? 'deal' : item.sourceType || 'watchlist',
      meta:{...(item.meta||{}),followUpMode:policy.followUpMode,watchlistEntry:policy.watchlistEntry,routedBy:'offer-follow-up-policy'}
    });
  }

  function migrateLegacyOnce(){
    const api = window.NextBonusWatchlistState;
    const legacy = readLegacy();
    if(!api || !legacy) return;
    if(!api.read().legacySyncedAt) api.syncLegacyStateObject(legacy);
    lastSaved = new Set(Array.isArray(legacy.savedOfferIds) ? legacy.savedOfferIds.map(String) : []);
    api.list().filter(x=>x.stage!=='history').forEach(x=>applyPolicy(x.offerId));
  }

  function followExplicitly(offerId){
    const api = window.NextBonusWatchlistState;
    if(!api) return;
    const current = api.getActive(offerId);
    api.follow(offerId,{stage:current?.stage === 'in_progress' ? 'in_progress' : 'saved',status:current?.status || 'saved',sourceType:'watchlist'});
    applyPolicy(offerId);
    window.NextBonusWatchlistUI?.refresh?.();
    window.NextBonusWatchlistControlSync?.refresh?.();
  }

  function unfollowExplicitly(offerId){
    window.NextBonusWatchlistState?.unfollow?.(offerId);
    window.NextBonusWatchlistUI?.refresh?.();
    window.NextBonusWatchlistControlSync?.refresh?.();
  }

  function reconcileLegacyAdditions(){
    if(!ready) return;
    const legacy = readLegacy();
    if(!legacy) return;
    const next = new Set(Array.isArray(legacy.savedOfferIds) ? legacy.savedOfferIds.map(String) : []);
    next.forEach(id=>{ if(!lastSaved.has(id)) followExplicitly(id); });
    lastSaved = next;
  }

  function queueReconcile(){
    if(queued) return;
    queued = true;
    setTimeout(()=>{queued=false;reconcileLegacyAdditions();},0);
  }

  document.addEventListener('click',event=>{
    const button = event.target.closest?.('[data-action="bookmark"][data-id]');
    if(!button) return;
    const offerId = String(button.dataset.id || '');
    if(!offerId) return;
    const wasActive = !!window.NextBonusWatchlistState?.getActive?.(offerId);
    setTimeout(()=>{
      const legacy = readLegacy();
      if(!legacy?.loggedIn) return;
      if(wasActive) unfollowExplicitly(offerId);
      else followExplicitly(offerId);
      lastSaved = new Set(Array.isArray(legacy.savedOfferIds) ? legacy.savedOfferIds.map(String) : []);
    },0);
  });

  const app = document.getElementById('app');
  if(app) new MutationObserver(queueReconcile).observe(app,{childList:true,subtree:true});

  window.addEventListener('storage',event=>{ if(event.key===LEGACY_KEY) queueReconcile(); });

  async function loadPolicy(){
    try{
      const response = await fetch(POLICY_URL,{cache:'no-store'});
      if(!response.ok) throw new Error(`Policy HTTP ${response.status}`);
      const data = await response.json();
      policyMap = data && typeof data.offers === 'object' ? data.offers : {};
    }catch(error){
      console.warn('[NextBonus] Watchlist follow-up policy unavailable; using safe saved defaults.',error);
      policyMap = {};
    }
    ready = true;
    migrateLegacyOnce();
    window.NextBonusWatchlistUI?.refresh?.();
  }

  window.NextBonusWatchlistFollowRouting = Object.freeze({policyFor,applyPolicy,followExplicitly,unfollowExplicitly,get ready(){return ready;}});
  loadPolicy();
})();

import('./watchlist-control-sync.js');
