(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,currentOffer,offerResult}){
    const offer=currentOffer();
    const supportsAssessment=!!window.NextBonusAssessmentContract?.supported?.(offer.id);
    const history=window.NextBonusWatchlistState?.list?.('history')||[];
    const isEnded=history.some(item=>
      item.offerId===offer.id &&
      ['expired','ended','unavailable'].includes(String(item.status||'').toLowerCase())
    );
    const result=supportsAssessment?offerResult(offer):null;
    const isPlatinum=offer.id==='amex-platinum';
    const posterIndex=((state.posterIndex||0)%2+2)%2;
    const posterSrc=posterIndex===0
      ? 'assets/offer-detail/amex-platinum-poster.png'
      : 'assets/offer-detail/amex-platinum-poster-2.png';
    const valuationSpec=window.NextBonusOfferData?.[offer.id]?.valuation||null;
    const valuation=window.NextBonusOfferValuation?.build?.(valuationSpec)||
      Object.freeze({supported:false,estimatedValueUsd:null,displayValue:null,assumptions:[],examples:[]});

    return Object.freeze({
      offer,
      supportsAssessment,
      isEnded,
      result,
      valuation,
      isPlatinum,
      posterIndex,
      posterSrc,
      hasAssessmentResult:!!state.assessmentResults?.[offer.id]
    });
  }

  root.offerDetail=Object.freeze({build});
})();
