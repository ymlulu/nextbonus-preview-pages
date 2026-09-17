(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,currentOffer,offerResult}){
    const offer=currentOffer();
    const supportsAssessment=!!window.NBStaticAssessmentIntegration?.productMap?.[offer.id];
    const isEnded=state.unavailableSavedIds.includes(offer.id);
    const result=supportsAssessment?offerResult(offer):null;
    const isPlatinum=offer.id==='amex-platinum';
    const posterIndex=((state.posterIndex||0)%2+2)%2;
    const posterSrc=posterIndex===0
      ? 'assets/offer-detail/amex-platinum-poster.png'
      : 'assets/offer-detail/amex-platinum-poster-2.png';

    return Object.freeze({
      offer,
      supportsAssessment,
      isEnded,
      result,
      isPlatinum,
      posterIndex,
      posterSrc,
      hasAssessmentResult:!!state.assessmentResults[offer.id]
    });
  }

  root.offerDetail=Object.freeze({build});
})();
