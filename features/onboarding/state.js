(() => {
  'use strict';

  const SEEN_KEY='nextbonus-onboarding-v5-seen';
  const PENDING_KEY='nextbonus-onboarding-v5-pending';
  const SEEN_VERSION='2026-09';

  function safeGet(key){ try{return localStorage.getItem(key);}catch(_){return null;} }
  function safeSet(key,value){ try{localStorage.setItem(key,value);}catch(_){} }
  function safeRemove(key){ try{localStorage.removeItem(key);}catch(_){} }

  function isSeen(){ return !!safeGet(SEEN_KEY); }
  function shouldShow(){ return !isSeen(); }
  function hasPending(){ return !!safeGet(PENDING_KEY); }
  function markPending(){ if(shouldShow()) safeSet(PENDING_KEY,'1'); }
  function finish(){ safeSet(SEEN_KEY,SEEN_VERSION); safeRemove(PENDING_KEY); }
  function clearPending(){ safeRemove(PENDING_KEY); }
  function reset(){ safeRemove(SEEN_KEY); safeRemove(PENDING_KEY); }

  window.NextBonusOnboardingState=Object.freeze({
    isSeen,
    shouldShow,
    hasPending,
    markPending,
    finish,
    clearPending,
    reset
  });
})();