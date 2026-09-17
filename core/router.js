(() => {
  'use strict';

  const PROTECTED_ROUTES=new Set(['wishlist','products','attention']);
  function historySnapshot(state){return {nb:true,route:state.route,routeSource:state.routeSource,currentOfferId:state.currentOfferId,currentProductId:state.currentProductId,attentionTab:state.attentionTab,attentionProductFilter:state.attentionProductFilter,historyStatusFilter:state.historyStatusFilter,posterIndex:state.posterIndex};}
  function historyKey(snapshot){return JSON.stringify([snapshot.route,snapshot.routeSource,snapshot.currentOfferId,snapshot.currentProductId]);}
  function activePrimaryRoute(state){
    if(['discover','offer-detail'].includes(state.route))return state.routeSource==='wishlist'?'wishlist':'discover';
    if(state.route==='wishlist')return 'wishlist';
    if(['products','product-detail'].includes(state.route))return 'products';
    if(state.route==='attention')return 'attention';
    return '';
  }
  function scrollBucket(route,state){return route==='offer-detail'?state.routeSource:route==='product-detail'?'products':route;}
  function isProtected(route){return PROTECTED_ROUTES.has(route);}
  window.NextBonusRouter=Object.freeze({historySnapshot,historyKey,activePrimaryRoute,scrollBucket,isProtected});
})();
