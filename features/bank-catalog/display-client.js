(() => {
 'use strict';
 // Discover presentation only. DD's canonical catalog remains available for
 // Wallet, product selection, Checklist, and Tracker.
 const API=String(window.NextBonusDealsConfig?.apiBase||'https://nextbonus-preview-deals.uscc101-data.workers.dev').trim().replace(/\/+$/,'');
 const ENDPOINT=API+'/api/public/bank-display-offers';
 const listeners=new Set();
 let offers=Object.freeze([]),pending=null;
 let state=Object.freeze({status:'idle',error:null,stale:false,updatedAt:null});
 function announce(next,patch){
  offers=Object.freeze(next.map(x=>Object.freeze(x)));
  state=Object.freeze({...state,...patch});
  for(const fn of listeners)fn({offers,state});
  return {offers,state};
 }
 async function load({fetcher=window.fetch?.bind(window)}={}){
  if(pending)return pending;
  if(typeof fetcher!=='function')return announce([],{status:'error',error:'Fetch unavailable'});
  announce(offers,{status:'loading',error:null});
  pending=(async()=>{
   try{
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
       if(!x||typeof x.slug!=='string'||seen.has(x.slug)||x.status!=='published')return false;
       seen.add(x.slug);return true;
      });
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
    return announce([],{status:'error',error:String(error.message||error),stale:false});
   }finally{pending=null;}
  })();
  return pending;
 }
 window.NextBonusBankDisplayCatalog=Object.freeze({
  endpoint:ENDPOINT,load,
  subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  list(){return offers;},getState(){return state;},
  ensure(){return state.status==='idle'?load():null;},
  retry(){return load();}
 });
})();
