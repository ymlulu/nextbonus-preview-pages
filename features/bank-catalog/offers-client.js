(() => {
  'use strict';
  const ENDPOINT='https://dd.nextbonus.app/api/public/bank-offers';
  const CACHE_KEY='nextbonus-bank-offers-v1';
  const listeners=new Set();
  let offers=Object.freeze([]);
  let pending=null;
  let state=Object.freeze({status:'idle',stale:false,error:null,updatedAt:null});
  const str=value=>typeof value==='string'?value.trim():'';
  function normalize(input){
    if(!input||typeof input!=='object'||!str(input.slug)||!Array.isArray(input.productIds))return null;
    return Object.freeze({
      slug:str(input.slug),title:str(input.title),bank:str(input.bank),account:str(input.account),
      productIds:Object.freeze(input.productIds.filter(x=>typeof x==='string'&&x.includes('/'))),
      bonusAmountCents:Number.isFinite(input.bonusAmountCents)?input.bonusAmountCents:null,
      expiresOn:str(input.expiresOn)||null,verifiedOn:str(input.verifiedOn)||null,
      eligibilityNotes:str(input.eligibilityNotes)||null,
      applicationUrl:str(input.applicationUrl)||null,officialTermsUrl:str(input.officialTermsUrl)||null,
      ddReportsUrl:str(input.ddReportsUrl)||null,
      ddRequired:input.ddRequired===true,ddRequirement:str(input.ddRequirement),
      extraRequirements:input.extraRequirements,
      checklistReady:input.checklistReady===true&&!!input.requirements,
      requirements:input.checklistReady===true?input.requirements:null,
      tiers:Array.isArray(input.tiers)?input.tiers:[],
      version:str(input.version)||null
    });
  }
  function parse(payload){
    if(!payload||Number(payload.version)!==1||!Array.isArray(payload.offers))throw Error('Invalid Bank Offers response');
    const seen=new Set();
    return Object.freeze(payload.offers.map(normalize).filter(offer=>{
      if(!offer||seen.has(offer.slug))return false;
      seen.add(offer.slug);return true;
    }));
  }
  function publish(nextOffers,patch){
    offers=nextOffers;state=Object.freeze({...state,...patch});
    for(const listener of listeners)listener({offers,state});
    return {offers,state};
  }
  function cacheRead(){
    try{
      const raw=localStorage.getItem(CACHE_KEY);
      if(!raw)return null;
      const value=JSON.parse(raw);
      return {offers:parse(value.payload),updatedAt:value.updatedAt};
    }catch(_){return null;}
  }
  function cacheWrite(payload,updatedAt){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify({payload,updatedAt}));}catch(_){}
  }
  function load(options={}){
    if(pending)return pending;
    const cached=cacheRead();
    if(cached)publish(cached.offers,{status:'refreshing',stale:true,error:null,updatedAt:cached.updatedAt});
    else publish(offers,{status:'loading',stale:false,error:null});
    const fetcher=options.fetcher||window.fetch?.bind(window);
    pending=(async()=>{
      try{
        if(typeof fetcher!=='function')throw Error('Fetch unavailable');
        const response=await fetcher(ENDPOINT,{method:'GET',mode:'cors',credentials:'omit'});
        if(!response?.ok)throw Error('Bank Offers request failed ('+(response?.status||0)+')');
        const payload=await response.json();
        const next=parse(payload),updatedAt=new Date().toISOString();
        cacheWrite(payload,updatedAt);
        return publish(next,{status:'ready',stale:false,error:null,updatedAt});
      }catch(error){
        return publish(offers,{status:'error',stale:!!cached,error:String(error?.message||error)});
      }finally{pending=null;}
    })();
    return pending;
  }
  function forProduct(product){
    const id=str(product?.bankProductId);
    const slugPair=str(product?.bankSlug)&&str(product?.productSlug)?product.bankSlug+'/'+product.productSlug:'';
    if(!id&&!slugPair)return Object.freeze([]);
    return Object.freeze(offers.filter(offer=>offer.productIds.includes(id)||!!slugPair&&offer.productIds.includes(slugPair)));
  }
  window.NextBonusBankOffersCatalog=Object.freeze({
    endpoint:ENDPOINT,cacheKey:CACHE_KEY,load,
    retry(){return load({force:true});},
    subscribe(listener){listeners.add(listener);return ()=>listeners.delete(listener);},
    list(){return offers;},forProduct,getState(){return state;}
  });
})();
