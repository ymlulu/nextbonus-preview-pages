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
    const timingCurrent=window.NextBonusOfferDetailTiming?.cached?.(offer.id)?.current||null;
    const isPlatinum=offer.id==='amex-platinum';
    const usesCreditCardPanel=offer.category==='信用卡'&&supportsAssessment;

    return Object.freeze({
      offer,
      supportsAssessment,
      isEnded,
      result,
      timingCurrent,
      isPlatinum,
      usesCreditCardPanel,
      hasAssessmentResult:!!state.assessmentResults?.[offer.id]
    });
  }

  root.offerDetail=Object.freeze({build});
})();
