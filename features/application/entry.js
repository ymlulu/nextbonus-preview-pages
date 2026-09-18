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
    const routing = window.NextBonusWatchlistFollowRouting;
    if(!routing?.ready) return {ready:false, tracked:false};
    const policy = routing.policyFor?.(offerId);
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

  function closeAssessmentDialog(button){
    const dialog = button?.closest?.('dialog');
    const closeButton = dialog?.querySelector?.('[data-modal-action="close"]');
    if(closeButton){
      closeButton.click();
      return true;
    }
    if(typeof dialog?.close === 'function'){
      dialog.close();
      return true;
    }
    return false;
  }

  document.addEventListener('click',event=>{
    const direct = event.target.closest?.('[data-action="direct-apply"]');
    if(direct){
      event.preventDefault();
      event.stopImmediatePropagation();
      beginApplication({source:'offer-detail'});
      return;
    }

    const reportCta = event.target.closest?.('[data-modal-action="report-cta"][data-dest="current_application_url"]');
    if(reportCta){
      event.preventDefault();
      event.stopImmediatePropagation();
      closeAssessmentDialog(reportCta);
      beginApplication({source:'assessment-full-report'});
    }
  },true);

  window.NextBonusApplicationEntry = Object.freeze({
    begin:beginApplication,
    startConfiguredHandoff
  });
})();
