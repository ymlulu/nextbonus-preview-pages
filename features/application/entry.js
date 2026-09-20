(() => {
  'use strict';

  const APP_STATE_KEY = 'nextbonus-local-v8-state';
  const MAX_POLICY_WAIT = 40;
  const POLICY_WAIT_MS = 50;

  function readAppState(){
    try{
      const raw = localStorage.getItem(APP_STATE_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(_){
      return null;
    }
  }

  function currentOfferId(explicitOfferId){
    if(explicitOfferId) return String(explicitOfferId);
    return readAppState()?.currentOfferId || null;
  }

  function offerFor(offerId){
    return offerId ? window.NextBonusOfferData?.[offerId] || null : null;
  }

  function startConfiguredHandoff(offerId){
    const policyApi = window.NextBonusWatchlistPolicy;
    if(!policyApi?.isReady) return {ready:false, tracked:false};
    const policy = policyApi.policyFor?.(offerId);
    if(policy?.followUpMode !== 'application') return {ready:true, tracked:false};

    const state = readAppState();
    if(!state || state.currentOfferId !== offerId) return {ready:true, tracked:false};

    const attempt = window.NextBonusApplicationHandoff?.start?.() || null;
    if(attempt) window.NextBonusApplicationWatchlistLifecycle?.sync?.();
    return {ready:true, tracked:!!attempt, attempt};
  }

  function waitForConfiguredHandoff(offerId, retries = 0){
    const result = startConfiguredHandoff(offerId);
    if(result.ready || retries >= MAX_POLICY_WAIT) return result;
    setTimeout(()=>waitForConfiguredHandoff(offerId,retries+1),POLICY_WAIT_MS);
    return result;
  }

  function beginApplication(options = {}){
    const offerId = currentOfferId(options.offerId);
    const offer = offerFor(offerId);
    if(!offerId || !offer?.applyUrl) return {opened:false,tracked:false,offerId,reason:'missing_application_url'};

    window.open(offer.applyUrl,'_blank','noopener,noreferrer');
    const tracking = waitForConfiguredHandoff(offerId);
    return {
      opened:true,
      tracked:!!tracking.tracked,
      offerId,
      source:options.source || 'unknown'
    };
  }

  document.addEventListener('click',event=>{
    const direct = event.target.closest?.('[data-action="direct-apply"]');
    if(direct){
      // app.js owns the current risk-confirmation orchestration. If the click
      // just opened that modal, wait for apply-confirm before tracking.
      if(!document.querySelector('[data-action="apply-confirm"]')){
        waitForConfiguredHandoff(currentOfferId());
      }
      return;
    }

    const confirm = event.target.closest?.('[data-action="apply-confirm"]');
    if(confirm){
      waitForConfiguredHandoff(currentOfferId());
      return;
    }

    const reportCta = event.target.closest?.('[data-action="assessment-ui-apply"]');
    if(reportCta){
      event.preventDefault();
      beginApplication({source:'assessment-full-report'});
    }
  });

  window.NextBonusApplicationEntry = Object.freeze({
    begin:beginApplication,
    startConfiguredHandoff
  });
})();
