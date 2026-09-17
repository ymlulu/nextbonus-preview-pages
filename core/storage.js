(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-local-v8-state';
  const RESET_ON_LOAD=Object.freeze({modal:null,addFlow:null,editFlow:null,accountMenu:false,expandedAttentionId:null,expandedBenefitId:null});
  const OMIT_ON_SAVE=Object.freeze({modal:null,addFlow:null,editFlow:null,accountMenu:false,returnTarget:null,returnSource:null,pendingIntent:null});

  function load(createDefaultState){
    const base=createDefaultState();
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return base;
      const saved=JSON.parse(raw);
      return {...base,...saved,...RESET_ON_LOAD};
    }catch(_){return base;}
  }

  function save(state){
    const copy={...state,...OMIT_ON_SAVE};
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(copy));return true;}catch(_){return false;}
  }

  window.NextBonusStorage=Object.freeze({key:STORAGE_KEY,load,save});
})();
