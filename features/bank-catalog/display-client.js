(() => {
 'use strict';
 // Discover presentation only. DD's canonical catalog remains available for
 // Wallet, product selection, Checklist, and Tracker.
 const API=String(window.NextBonusDealsConfig?.apiBase||'https://nextbonus-preview-deals.uscc101-data.workers.dev').trim().replace(/\/+$/,'');
 const ENDPOINT=API+'/api/public/bank-display-offers';
 const listeners=new Set();
 const cache=window.NextBonusDiscoverCache;
 const today=()=>new Date().toISOString().slice(0,10);
 const valid=x=>x?.status==='published'&&typeof x.slug==='string'&&
   (!x.expiresOn||x.expiresOn>=today())&&Number.isSafeInteger(x.bonusAmountCents)&&x.bonusAmountCents>0;
 const cached=cache?.read?.('bank-display',valid);
 let offers=Object.freeze((cached?.items||[]).map(x=>Object.freeze(x))),pending=null;
 let state=Object.freeze({status:cached?'ready':'idle',error:null,stale:!!cached,updatedAt:cached?.updatedAt||null});
 function announce(next,patch){
  offers=Object.freeze(next.map(x=>Object.freeze(x)));
  state=Object.freeze({...state,...patch});
  for(const fn of listeners)fn({offers,state});
  return {offers,state};
 }
 async function load({fetcher=window.fetch?.bind(window),force=false}={}){
  if(pending)return pending;
  if(!force&&state.status==='ready')return {offers,state};
  if(typeof fetcher!=='function')return announce(offers,{status:'error',error:'Fetch unavailable'});
  // Keep the last reviewed snapshot visible while refreshing; do not emit
  // a redundant loading event that rebuilds the whole Discover page.
  state=Object.freeze({...state,status:'loading',error:null});
  pending=(async()=>{
   try{
    let snapshot=null;
    try{snapshot=await window.NextBonusStaticCatalog?.load?.({force,fetcher});}
    catch(_){/* Bootstrap fallback to the existing reviewed Preview API. */}
    if(snapshot){
      const seen=new Set();
      const safe=snapshot.bankOffers.offers.filter(x=>{
        if(!valid(x)||seen.has(x.slug))return false;
        seen.add(x.slug);return true;
      });
      cache?.write?.('bank-display',safe);
      return announce(safe,{status:'ready',error:null,stale:false,updatedAt:new Date().toISOString()});
    }
    const all=[];let offset=0;
    for(let p=0;p<100;p++){
     const response=await fetcher(ENDPOINT+'?offset='+offset,
      {method:'GET',mode:'cors',credentials:'omit',cache:'no-store'});
     if(!response?.ok)throw Error('Preview Bank Display HTTP '+(response?.status||0));
     const data=await response.json();
     if(data?.version!==1||data?.locale!=='zh-CN'||!Array.isArray(data.offers))
      throw Error('Invalid Preview bank display response');
     all.push(...data.offers);
     if(data.nextOffset==null){
      const seen=new Set();
      const safe=all.filter(x=>{
       if(!valid(x)||seen.has(x.slug))return false;
       seen.add(x.slug);return true;
      });
      cache?.write?.('bank-display',safe);
      return announce(safe,{status:'ready',error:null,stale:false,updatedAt:new Date().toISOString()});
     }
     if(!Number.isSafeInteger(data.nextOffset)||data.nextOffset<=offset)
      throw Error('Invalid Preview bank offer pagination');
     offset=data.nextOffset;
    }
    throw Error('Bank display pagination exceeded limit');
   }catch(error){
    // Never fallback to DD's raw published API for Discover. Draft or
    // withdrawn rows must not reappear through another source.
    return announce(offers,{status:'error',error:String(error.message||error),stale:!!cached});
   }finally{pending=null;}
  })();
  return pending;
 }
 window.NextBonusBankDisplayCatalog=Object.freeze({
  endpoint:ENDPOINT,load,
  subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  list(){return offers;},getState(){return state;},
  ensure(){
    if(state.status==='idle')return load();
    if(state.status==='ready'&&Date.now()-Date.parse(state.updatedAt||0)>=(cache?.ttl||300000))
      return load({force:true});
    return null;
  },
  retry(){return load({force:true});}
 });
 const refreshOnReturn=()=>{
   if(state.status==='ready'&&Date.now()-Date.parse(state.updatedAt||0)>=(cache?.ttl||300000))
     void load({force:true});
 };
 window.addEventListener?.('focus',refreshOnReturn);
 if(typeof document!=='undefined')document.addEventListener?.('visibilitychange',()=>{
   if(!document.hidden)refreshOnReturn();
 });
})();
