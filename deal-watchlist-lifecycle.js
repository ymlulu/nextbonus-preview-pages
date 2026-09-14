(() => {
  'use strict';

  const POLICY_URL = 'offer-follow-up-policy.json';
  let policy = null;
  let ready = false;

  const todayIso = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  function dealPolicy(offerId){
    const entry = policy?.offers?.[offerId] || null;
    return entry?.followUpMode === 'deal' ? entry : null;
  }

  function lifecycleFor(offerId){
    return dealPolicy(offerId)?.lifecycle || null;
  }

  function expireDueDeals(){
    if(!ready) return false;
    const api = window.NextBonusWatchlistState;
    if(!api) return false;
    const today = todayIso();
    let changed = false;

    api.list('in_progress').forEach(item => {
      const lifecycle = lifecycleFor(item.offerId);
      if(!lifecycle?.endDate || today <= lifecycle.endDate) return;
      api.archive(item.offerId, lifecycle.expireStatus || 'expired', {
        sourceType:'deal',
        sourceId:item.sourceId || item.id,
        completedAt:new Date().toISOString(),
        meta:{
          ...(item.meta || {}),
          lifecycleEndDate:lifecycle.endDate,
          terminalReason:'offer_expired'
        }
      });
      changed = true;
    });

    if(changed) window.NextBonusWatchlistUI?.refresh?.();
    return changed;
  }

  function complete(offerId){
    const api = window.NextBonusWatchlistState;
    const lifecycle = lifecycleFor(offerId);
    if(!api || !lifecycle) return null;
    const item = api.getActive(offerId);
    if(!item || item.stage !== 'in_progress') return null;

    const result = api.archive(offerId, lifecycle.completeStatus || 'completed', {
      sourceType:'deal',
      sourceId:item.sourceId || item.id,
      completedAt:new Date().toISOString(),
      meta:{
        ...(item.meta || {}),
        lifecycleEndDate:lifecycle.endDate || null,
        terminalReason:'user_completed'
      }
    });
    window.NextBonusWatchlistUI?.refresh?.();
    return result;
  }

  async function load(){
    try{
      const response = await fetch(POLICY_URL,{cache:'no-store'});
      if(!response.ok) throw new Error(`Policy HTTP ${response.status}`);
      policy = await response.json();
    }catch(error){
      console.warn('[NextBonus] Deal lifecycle policy unavailable.',error);
      policy = {offers:{}};
    }
    ready = true;
    expireDueDeals();
  }

  for(const type of ['focus','pageshow']) window.addEventListener(type,expireDueDeals);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) expireDueDeals(); });

  window.NextBonusDealWatchlistLifecycle = Object.freeze({
    complete,
    expireDueDeals,
    lifecycleFor,
    get ready(){ return ready; }
  });

  load();
})();
