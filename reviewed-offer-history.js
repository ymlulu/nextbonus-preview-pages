(function(root){
  'use strict';
  const PRODUCT_MAP=Object.freeze({'chase-sapphire':'chase_sapphire_preferred','amex-gold':'amex_gold','amex-platinum':'amex_platinum','bilt-palladium':'bilt_palladium','capitalone-venturex':'capital_one_venture_x','citi-strata':'citi_strata_elite'});
  const cache=new Map(),pending=new Map(),active=new Map();
  const canonicalSource=root.NextBonusOfferData||{};
  function localDate(date=new Date()){const pad=value=>String(value).padStart(2,'0');return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;}
  function hash(value){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function normalize(payload,offerId){
    const rows=Array.isArray(payload&&payload.history)?payload.history:[],seen=new Set();
    return rows.filter(row=>row&&row.display_eligible===true&&row.timing_eligible==='YES'&&row.confidence==='HIGH'&&row.bonus_label&&row.spend_requirement&&row.date_label)
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))
      .filter(row=>{const key=`${row.bonus_label}|||${row.spend_requirement}`;if(seen.has(key))return false;seen.add(key);return true;})
      .map(row=>({id:`reviewed-${offerId}-${hash(`${row.date}|${row.bonus_label}|${row.spend_requirement}`)}`,offerId,value:String(row.bonus_label),requirement:String(row.spend_requirement),dateLabel:String(row.date_label),source:'reviewed-offer-history'}));
  }
  async function load(offerId){
    const productId=PRODUCT_MAP[offerId];if(!productId)return {supported:false,status:'unsupported',choices:[]};
    if(cache.has(offerId))return cache.get(offerId);if(pending.has(offerId))return pending.get(offerId);
    const promise=(async()=>{try{if(!root.AssessmentClient?.getOfferHistory)throw new Error('Reviewed Offer History API is unavailable');const payload=await root.AssessmentClient.getOfferHistory(productId,localDate());const result={supported:true,status:'ready',productId,snapshot:payload?.snapshot||null,offerTimingId:payload?.offer_timing_id||null,choices:normalize(payload,offerId)};cache.set(offerId,result);return result;}catch(error){const result={supported:true,status:'error',productId,choices:[],error:error?.message||'Offer History unavailable'};cache.set(offerId,result);return result;}finally{pending.delete(offerId);}})();pending.set(offerId,promise);return promise;
  }
  function activate(offerId,choiceId){const result=cache.get(offerId),choice=result?.choices?.find(item=>item.id===choiceId)||null;if(choice)active.set(offerId,choice);else active.delete(offerId);return choice;}
  function clear(offerId){if(offerId)active.delete(offerId);else active.clear();}
  function current(offerId){return active.get(offerId)||null;} function cached(offerId){return cache.get(offerId)||null;} function isSupported(offerId){return !!PRODUCT_MAP[offerId];}
  if(typeof Proxy==='function'){
    const adapterTarget={...canonicalSource};
    root.NextBonusOfferData=new Proxy(adapterTarget,{get(target,prop,receiver){const base=Reflect.get(target,prop,receiver);if(typeof prop!=='string'||!base)return base;const choice=active.get(prop);return choice?{...base,primaryValue:choice.value,primaryRequirement:choice.requirement}:base;}});
  }
  root.NextBonusReviewedOfferHistory=Object.freeze({productMap:{...PRODUCT_MAP},load,activate,clear,current,cached,isSupported});
})(window);