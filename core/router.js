(() => {
  'use strict';

  const PROTECTED_ROUTES=new Set(['wishlist','products','attention']);

  function offerOverlayFor(state){
    if(state?.route==='offer-detail'&&state.currentOfferId){
      const source=state.routeSource==='wishlist'?'wishlist':'discover';
      return {
        offerId:String(state.currentOfferId),
        source,
        scrollY:Number(state.pageScroll?.[source]||0),
        posterIndex:Number(state.posterIndex||0)
      };
    }
    const saved=state?.offerOverlay;
    if(!saved?.offerId) return null;
    const source=saved.source==='wishlist'?'wishlist':'discover';
    return {
      offerId:String(saved.offerId),
      source,
      scrollY:Number(saved.scrollY||0),
      posterIndex:Number(saved.posterIndex||0)
    };
  }

  function productOverlayFor(state){
    if(state?.route==='product-detail'&&state.currentProductId){
      return {
        productId:String(state.currentProductId),
        source:'products',
        scrollY:Number(state.pageScroll?.products||0)
      };
    }
    const saved=state?.productOverlay;
    if(!saved?.productId) return null;
    return {
      productId:String(saved.productId),
      source:'products',
      scrollY:Number(saved.scrollY||0)
    };
  }

  function historySnapshot(state){
    const offerOverlay=offerOverlayFor(state);
    const productOverlay=productOverlayFor(state);
    let route=state.route;
    let routeSource=state.routeSource;
    if(offerOverlay){
      route=offerOverlay.source;
      routeSource=offerOverlay.source;
    }else if(productOverlay){
      route='products';
      routeSource='products';
    }
    const offerDetailTask=offerOverlay&&['assessment','annual-value'].includes(state.offerDetailTask)
      ? state.offerDetailTask
      : null;
    return {
      nb:true,
      route,
      routeSource,
      currentOfferId:state.currentOfferId,
      currentProductId:state.currentProductId,
      attentionTab:state.attentionTab,
      attentionProductFilter:state.attentionProductFilter,
      historyStatusFilter:state.historyStatusFilter,
      posterIndex:state.posterIndex,
      nbOfferOverlay:offerOverlay,
      nbOfferDetailTask:offerDetailTask,
      nbProductOverlay:productOverlay
    };
  }

  function historyKey(snapshot){
    return JSON.stringify([
      snapshot.route,
      snapshot.routeSource,
      snapshot.currentOfferId,
      snapshot.currentProductId,
      snapshot.nbOfferOverlay?.offerId||null,
      snapshot.nbOfferDetailTask||null,
      snapshot.nbProductOverlay?.productId||null
    ]);
  }

  function applyHistorySnapshot(state,snapshot){
    if(!snapshot?.nb) return false;
    const offerOverlay=snapshot.nbOfferOverlay||null;
    const productOverlay=snapshot.nbProductOverlay||null;
    state.route=offerOverlay?'offer-detail':productOverlay?'product-detail':snapshot.route||'discover';
    state.routeSource=offerOverlay?.source||productOverlay?.source||snapshot.routeSource||'discover';
    state.currentOfferId=offerOverlay?.offerId||snapshot.currentOfferId||state.currentOfferId;
    state.currentProductId=productOverlay?.productId||snapshot.currentProductId||state.currentProductId;
    state.offerOverlay=offerOverlay;
    state.offerDetailTask=snapshot.nbOfferDetailTask||null;
    state.productOverlay=productOverlay;
    state.attentionTab=snapshot.attentionTab||'active';
    state.attentionProductFilter=snapshot.attentionProductFilter||'all';
    state.historyStatusFilter=snapshot.historyStatusFilter||'all';
    state.posterIndex=Number(snapshot.posterIndex||0);
    return true;
  }

  function activePrimaryRoute(state){
    if(['discover','offer-detail'].includes(state.route))return state.routeSource==='wishlist'?'wishlist':'discover';
    if(state.route==='wishlist')return 'wishlist';
    if(['products','product-detail'].includes(state.route))return 'products';
    if(state.route==='attention')return 'attention';
    return '';
  }

  function scrollBucket(route,state){return route==='offer-detail'?state.routeSource:route==='product-detail'?'products':route;}
  function isProtected(route){return PROTECTED_ROUTES.has(route);}

  window.NextBonusRouter=Object.freeze({
    historySnapshot,
    historyKey,
    applyHistorySnapshot,
    offerOverlayFor,
    productOverlayFor,
    activePrimaryRoute,
    scrollBucket,
    isProtected
  });
})();
