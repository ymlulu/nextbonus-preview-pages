(() => {
  'use strict';
  const STORAGE_KEY='nextbonus-local-v8-state';
  const RECOVERY_KEY='nextbonus-preview-recovery-20260914-1';
  try{
    if(localStorage.getItem(RECOVERY_KEY)==='done') return;
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      const state=JSON.parse(raw);
      if(['offer-detail','assessment','full-report'].includes(state.route)){
        state.route='discover';
        state.routeSource='discover';
        state.currentOfferId=null;
        state.assessmentDraft=null;
        localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      }
    }
    localStorage.setItem(RECOVERY_KEY,'done');
  }catch(_error){}
})();
