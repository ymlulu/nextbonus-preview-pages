(() => {
  'use strict';

  const todayIso=()=>{
    const d=new Date();
    const pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  function lifecycleFor(offerId){
    const policy=window.NextBonusWatchlistPolicy?.policyFor?.(offerId);
    return policy?.followUpMode==='deal'?policy.lifecycle||null:null;
  }

  function expireDueDeals(){
    const state=window.NextBonusWatchlistState;
    if(!state||!window.NextBonusWatchlistPolicy?.isReady) return false;
    const today=todayIso();
    let changed=false;
    state.list('in_progress').forEach(item=>{
      const lifecycle=lifecycleFor(item.offerId);
      if(!lifecycle?.endDate||today<=lifecycle.endDate) return;
      state.archive(item.offerId,lifecycle.expireStatus||'expired',{
        sourceType:'deal',
        sourceId:item.sourceId||item.id,
        completedAt:new Date().toISOString(),
        meta:{...(item.meta||{}),lifecycleEndDate:lifecycle.endDate,terminalReason:'offer_expired'}
      });
      changed=true;
    });
    return changed;
  }

  function complete(offerId){
    const state=window.NextBonusWatchlistState;
    const lifecycle=lifecycleFor(offerId);
    if(!state||!lifecycle) return null;
    const item=state.getActive(offerId);
    if(!item||item.stage!=='in_progress') return null;
    return state.archive(offerId,lifecycle.completeStatus||'completed',{
      sourceType:'deal',
      sourceId:item.sourceId||item.id,
      completedAt:new Date().toISOString(),
      meta:{...(item.meta||{}),lifecycleEndDate:lifecycle.endDate||null,terminalReason:'user_completed'}
    });
  }

  async function init(){
    await window.NextBonusWatchlistPolicy?.ready?.();
    expireDueDeals();
  }

  for(const type of ['focus','pageshow']) window.addEventListener(type,expireDueDeals);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) expireDueDeals();});

  window.NextBonusDealWatchlistLifecycle=Object.freeze({complete,expireDueDeals,lifecycleFor,init});
  init();
})();