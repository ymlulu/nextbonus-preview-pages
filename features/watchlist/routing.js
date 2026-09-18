(() => {
  'use strict';

  function statusFor(policy){
    if(policy.followUpMode==='deal'&&policy.watchlistEntry==='in_progress') return 'deal_active';
    if(policy.followUpMode==='application'&&policy.watchlistEntry==='in_progress') return 'awaiting_result';
    return policy.watchlistEntry==='in_progress'?'in_progress':'saved';
  }

  function sourceTypeFor(policy){
    if(policy.followUpMode==='deal') return 'deal';
    if(policy.followUpMode==='application') return 'application';
    return 'watchlist';
  }

  function applyPolicy(offerId){
    const state=window.NextBonusWatchlistState;
    const policyApi=window.NextBonusWatchlistPolicy;
    if(!state||!policyApi) return null;
    const item=state.getActive(offerId);
    if(!item) return null;
    const policy=policyApi.policyFor(offerId);
    if(policy.watchlistEntry!=='in_progress'||item.stage==='in_progress') return item;
    return state.moveToInProgress(offerId,statusFor(policy),{
      sourceType:sourceTypeFor(policy),
      sourceId:item.sourceId||null,
      meta:{...(item.meta||{}),followUpMode:policy.followUpMode,watchlistEntry:policy.watchlistEntry,routedBy:'offer-follow-up-policy'}
    });
  }

  function followExplicitly(offerId){
    const state=window.NextBonusWatchlistState;
    const policyApi=window.NextBonusWatchlistPolicy;
    if(!state||!offerId) return null;
    const policy=policyApi?.policyFor?.(offerId)||{followUpMode:'none',watchlistEntry:'saved'};
    const stage=policy.watchlistEntry==='in_progress'?'in_progress':'saved';
    return state.follow(String(offerId),{
      stage,
      status:statusFor(policy),
      sourceType:sourceTypeFor(policy),
      meta:{followUpMode:policy.followUpMode,watchlistEntry:policy.watchlistEntry,routedBy:'offer-follow-up-policy'}
    });
  }

  function unfollowExplicitly(offerId){
    return window.NextBonusWatchlistState?.unfollow?.(String(offerId||''))||0;
  }

  async function init(){
    await window.NextBonusWatchlistPolicy?.ready?.();
    const state=window.NextBonusWatchlistState;
    if(!state) return;
    state.list().filter(item=>item.stage!=='history').forEach(item=>applyPolicy(item.offerId));
  }

  window.NextBonusWatchlistRouting=Object.freeze({
    statusFor,
    applyPolicy,
    followExplicitly,
    unfollowExplicitly,
    init
  });

  init();
})();