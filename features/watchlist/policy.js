(() => {
  'use strict';

  const POLICY_URL='offer-follow-up-policy.json';
  const DEFAULT_POLICY=Object.freeze({followUpMode:'none',watchlistEntry:'saved'});
  let data={defaults:DEFAULT_POLICY,offers:{}};
  let readyState=false;
  let readyPromise=null;

  function policyFor(offerId){
    return data?.offers?.[offerId] || data?.defaults || DEFAULT_POLICY;
  }

  function load(){
    if(readyPromise) return readyPromise;
    readyPromise=fetch(POLICY_URL,{cache:'no-store'})
      .then(response=>{
        if(!response.ok) throw new Error(`Policy HTTP ${response.status}`);
        return response.json();
      })
      .then(next=>{
        data=next&&typeof next==='object'?next:{defaults:DEFAULT_POLICY,offers:{}};
        readyState=true;
        return data;
      })
      .catch(error=>{
        console.warn('[NextBonus] Watchlist policy unavailable; using safe saved defaults.',error);
        data={defaults:DEFAULT_POLICY,offers:{}};
        readyState=true;
        return data;
      });
    return readyPromise;
  }

  window.NextBonusWatchlistPolicy=Object.freeze({
    DEFAULT_POLICY,
    policyFor,
    load,
    ready:load,
    get isReady(){return readyState;}
  });

  load();
})();