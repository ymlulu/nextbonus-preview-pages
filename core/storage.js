(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-local-v8-state';
  const RESET_ON_LOAD=Object.freeze({modal:null,addFlow:null,editFlow:null,accountMenu:false,expandedAttentionId:null,expandedBenefitId:null});
  const OMIT_ON_SAVE=Object.freeze({modal:null,addFlow:null,editFlow:null,accountMenu:false,returnTarget:null,returnSource:null,pendingIntent:null});
  const MIGRATION_KEY='nextbonus-preview-recovery-20260914-1';

  function migrate(saved){
    if(!saved||typeof saved!=='object') return saved;
    try{
      if(localStorage.getItem(MIGRATION_KEY)!=='done'){
        if(['offer-detail','assessment','full-report'].includes(saved.route)){
          saved.route='discover';
          saved.routeSource='discover';
          saved.currentOfferId=null;
          saved.assessmentDraft=null;
        }
        localStorage.setItem(MIGRATION_KEY,'done');
      }
    }catch(_){}
    return saved;
  }

  function load(createDefaultState){
    const base=createDefaultState();
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return base;
      const saved=migrate(JSON.parse(raw));
      return {...base,...saved,...RESET_ON_LOAD};
    }catch(_){return base;}
  }

  function save(state){
    const copy={...state,...OMIT_ON_SAVE};
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(copy));return true;}catch(_){return false;}
  }

  window.NextBonusStorage=Object.freeze({key:STORAGE_KEY,migrationKey:MIGRATION_KEY,load,save});
})();
