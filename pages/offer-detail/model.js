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
    const isGold=offer.id==='amex-gold';
    const usesCreditCardPanel=offer.category==='信用卡'&&supportsAssessment;
    const posterIndex=((state.posterIndex||0)%2+2)%2;
    const posterSrc=posterIndex===0
      ? 'assets/offer-detail/amex-platinum-poster.png'
      : 'assets/offer-detail/amex-platinum-poster-2.png';
    const staticPosterSrc=isGold
      ? 'assets/offer-detail/amex-gold-poster.webp'
      : null;

    return Object.freeze({
      offer,
      supportsAssessment,
      isEnded,
      result,
      timingCurrent,
      isPlatinum,
      isGold,
      usesCreditCardPanel,
      posterIndex,
      posterSrc,
      staticPosterSrc,
      hasAssessmentResult:!!state.assessmentResults?.[offer.id]
    });
  }

  root.offerDetail=Object.freeze({build});
})();
