(() => {
  'use strict';

  function offerChoicesFor(prod){
    const source=prod?.offerId||null;
    const offer=source?window.NextBonusOfferData?.[source]:null;
    if(!source||!offer) return {status:'unsupported',choices:[]};

    const current={
      id:`current-${source}`,
      kind:'current',
      sourceOfferId:source,
      value:String(offer.primaryValue||''),
      req:String(offer.primaryRequirement||''),
      dateLabel:'当前公开'
    };
    const history=window.NextBonusReviewedOfferHistory;
    const result=history?.cached?.(source)||null;
    const duplicate=value=>String(value||'').toLowerCase().replace(/\s+/g,' ').trim();
    const reviewed=(result?.choices||[])
      .filter(choice=>!(
        duplicate(choice.value)===duplicate(current.value) &&
        duplicate(choice.requirement)===duplicate(current.req)
      ))
      .map(choice=>({
        id:choice.id,
        kind:'reviewed',
        sourceOfferId:source,
        value:choice.value,
        req:choice.requirement,
        dateLabel:choice.dateLabel
      }));

    return {
      status:result?.status||(history?.isSupported?.(source)?'loading':'unsupported'),
      choices:[current,...reviewed]
    };
  }

  function resolveOfferChoice(prod,choiceId){
    if(!prod?.offerId||!choiceId||choiceId==='manual') return null;
    return offerChoicesFor(prod).choices.find(choice=>choice.id===choiceId)||null;
  }

  async function ensureReviewedOfferHistory(prod){
    const offerId=prod?.offerId;
    const history=window.NextBonusReviewedOfferHistory;
    if(!offerId||!history?.isSupported?.(offerId)||history.cached?.(offerId)) return;
    await history.load(offerId);
  }

  window.NextBonusBonusOfferChoice=Object.freeze({
    offerChoicesFor,
    resolveOfferChoice,
    ensureReviewedOfferHistory
  });
})();
