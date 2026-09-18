(() => {
  'use strict';

  const STORAGE_KEY='nextbonus-local-v8-state';
  const RESET_ON_LOAD=Object.freeze({modal:null,addFlow:null,editFlow:null,accountMenu:false,expandedAttentionId:null,expandedBenefitId:null});
  const OMIT_ON_SAVE=Object.freeze({modal:null,addFlow:null,editFlow:null,accountMenu:false,returnTarget:null,returnSource:null,pendingIntent:null});
  const MIGRATION_KEY='nextbonus-preview-overlay-migration-20260918-1';

  function offerOverlayFrom(state){
    if(state?.route==='offer-detail'&&state.currentOfferId){
      const source=state.routeSource==='wishlist'?'wishlist':'discover';
      return {offerId:String(state.currentOfferId),source,scrollY:Number(state.pageScroll?.[source]||0),posterIndex:Number(state.posterIndex||0)};
    }
    return state?.offerOverlay?.offerId?{
      offerId:String(state.offerOverlay.offerId),
      source:state.offerOverlay.source==='wishlist'?'wishlist':'discover',
      scrollY:Number(state.offerOverlay.scrollY||0),
      posterIndex:Number(state.offerOverlay.posterIndex||0)
    }:null;
  }

  function productOverlayFrom(state){
    if(state?.route==='product-detail'&&state.currentProductId){
      return {productId:String(state.currentProductId),source:'products',scrollY:Number(state.pageScroll?.products||0)};
    }
    return state?.productOverlay?.productId?{
      productId:String(state.productOverlay.productId),
      source:'products',
      scrollY:Number(state.productOverlay.scrollY||0)
    }:null;
  }

  function normalizeForPersistence(state){
    const copy={...state,...OMIT_ON_SAVE};
    const offerOverlay=offerOverlayFrom(state);
    const productOverlay=productOverlayFrom(state);

    if(state.route==='offer-detail'&&offerOverlay){
      copy.route=offerOverlay.source;
      copy.routeSource=offerOverlay.source;
      copy.offerOverlay=offerOverlay;
      copy.productOverlay=null;
    }else if(state.route===offerOverlay?.source){
      copy.offerOverlay=offerOverlay;
    }else{
      copy.offerOverlay=null;
    }

    if(state.route==='product-detail'&&productOverlay){
      copy.route='products';
      copy.routeSource='products';
      copy.productOverlay=productOverlay;
      copy.offerOverlay=null;
    }else if(state.route==='products'&&productOverlay){
      copy.productOverlay=productOverlay;
    }else{
      copy.productOverlay=null;
    }

    return copy;
  }

  function migrate(saved){
    if(!saved||typeof saved!=='object') return saved;
    if(saved.route==='offer-detail'&&saved.currentOfferId){
      const overlay=offerOverlayFrom(saved);
      saved.route=overlay.source;
      saved.routeSource=overlay.source;
      saved.offerOverlay=overlay;
    }else if(saved.route==='product-detail'&&saved.currentProductId){
      const overlay=productOverlayFrom(saved);
      saved.route='products';
      saved.routeSource='products';
      saved.productOverlay=overlay;
    }else if(['assessment','full-report'].includes(saved.route)){
      saved.route='discover';
      saved.routeSource='discover';
      saved.currentOfferId=null;
      saved.offerOverlay=null;
      saved.assessmentDraft=null;
    }
    try{localStorage.setItem(MIGRATION_KEY,'done');}catch(_){}
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
    const copy=normalizeForPersistence(state);
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(copy));return true;}catch(_){return false;}
  }

  window.NextBonusStorage=Object.freeze({
    key:STORAGE_KEY,
    migrationKey:MIGRATION_KEY,
    load,
    save,
    normalizeForPersistence
  });
})();
