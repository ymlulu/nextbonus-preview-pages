(() => {
  'use strict';

  const PRODUCT_MAP=Object.freeze({
    'chase-sapphire':'chase_sapphire_preferred',
    'amex-gold':'amex_gold',
    'amex-platinum':'amex_platinum',
    'bilt-palladium':'bilt_palladium',
    'capitalone-venturex':'capital_one_venture_x',
    'citi-strata':'citi_strata_elite'
  });

  const cache=new Map();
  const pending=new Map();

  function localDate(){
    const now=new Date();
    const pad=value=>String(value).padStart(2,'0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  }

  function normalize(payload){
    const current=payload?.current;
    if(!current||!Number.isFinite(Number(current.comparable_value))){
      return Object.freeze({status:'unavailable',current:null});
    }
    return Object.freeze({
      status:'ready',
      offerTimingId:payload.offer_timing_id||null,
      snapshot:payload.snapshot||null,
      current:Object.freeze({
        offerLabel:current.offer_label||null,
        comparableValue:Number(current.comparable_value),
        comparisonUnit:current.comparison_unit||null,
        offerMechanism:current.offer_mechanism||null,
        evaluationDate:current.evaluation_date||null
      })
    });
  }

  function cached(offerId){
    return cache.get(offerId)||null;
  }

  async function load(offerId){
    if(cache.has(offerId)) return cache.get(offerId);
    if(pending.has(offerId)) return pending.get(offerId);

    const productId=PRODUCT_MAP[offerId];
    if(!productId||!window.AssessmentClient?.getOfferHistory){
      const unavailable=Object.freeze({status:'unsupported',current:null});
      cache.set(offerId,unavailable);
      return unavailable;
    }

    const request=window.AssessmentClient
      .getOfferHistory(productId,localDate())
      .then(normalize)
      .catch(()=>Object.freeze({status:'error',current:null}))
      .then(result=>{
        cache.set(offerId,result);
        pending.delete(offerId);
        return result;
      });

    pending.set(offerId,request);
    return request;
  }

  window.NextBonusOfferDetailTiming=Object.freeze({
    cached,
    load,
    isSupported(offerId){return !!PRODUCT_MAP[offerId];}
  });
})();
