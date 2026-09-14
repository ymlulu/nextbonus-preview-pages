(function(root){
  'use strict';
  const STORAGE_KEY='nextbonus-local-v8-state';
  const PENDING_KEY='nextbonus-canonical-assessment-pending';
  const OPEN_KEY='nextbonus-canonical-assessment-open';

  function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}catch(_){return {}}}
  function writeState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state||{}))}
  function supported(offerId){return !!root.NBStaticAssessmentIntegration?.productMap?.[offerId]}

  function openAssessment(restart){
    requestAnimationFrame(()=>root.NBStaticAssessmentIntegration?.open(!!restart));
  }

  document.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]');
    if(!action)return;
    const name=action.dataset.action;
    if(name==='assessment-start'||name==='assessment-restart'){
      const state=readState(),offerId=state.currentOfferId;
      if(!supported(offerId))return;
      if(!state.loggedIn){
        sessionStorage.setItem(PENDING_KEY,offerId);
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      openAssessment(name==='assessment-restart');
      return;
    }
    if(name==='login-success'){
      const offerId=sessionStorage.getItem(PENDING_KEY);
      if(!supported(offerId))return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const state=readState();
      state.loggedIn=true;
      state.currentOfferId=offerId;
      state.route='offer-detail';
      state.routeSource=state.routeSource||'discover';
      state.assessmentDraft=null;
      writeState(state);
      sessionStorage.removeItem(PENDING_KEY);
      sessionStorage.setItem(OPEN_KEY,offerId);
      location.reload();
    }
  },true);

  const autoOffer=sessionStorage.getItem(OPEN_KEY);
  if(autoOffer&&supported(autoOffer)){
    sessionStorage.removeItem(OPEN_KEY);
    const state=readState();
    if(state.loggedIn&&state.currentOfferId===autoOffer&&state.route==='offer-detail')openAssessment(false);
  }

  root.NBCanonicalAssessmentRouting=Object.freeze({supported});
})(window);
