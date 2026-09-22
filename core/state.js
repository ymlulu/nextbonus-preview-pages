(() => {
  'use strict';

  function createDefaultState(){
    const seed=window.NextBonusSeedData;
    if(!seed) throw new Error('Seed Data unavailable');
    return {
      loggedIn:false,
      route:'discover',
      routeSource:'discover',
      returnTarget:null,
      returnSource:null,
      pendingIntent:null,
      currentOfferId:null,
      currentProductId:null,
      offerOverlay:null,
      productOverlay:null,
      offerSearch:'',
      offerCategory:'全部',
      watchlistHistoryOpen:false,
      pastOpen:false,
      productSectionExpanded:{'其他':false},
      productSorts:{},
      productSortPicker:null,
      walletCardExpandedId:null,
      pageScroll:{discover:0,wishlist:0,products:0,attention:0},
      expandedAttentionId:null,
      expandedBenefitId:null,
      productHistoryOpen:false,
      attentionTab:'active',
      historyVisibleCount:20,
      products:structuredClone(seed.defaultProducts),
      pastProducts:structuredClone(seed.defaultPastProducts),
      activeAttention:structuredClone(seed.defaultAttention),
      attentionHistory:structuredClone(seed.defaultHistory),
      assessmentResults:{},
      annualValueProfiles:{},
      annualValueDraft:null,
      offerDetailTask:null,
      posterIndex:0,
      modal:null,
      addFlow:null,
      editFlow:null,
      accountMenu:false
    };
  }

  window.NextBonusState=Object.freeze({createDefaultState});
})();
