(() => {
  'use strict';
  const base = String(window.NextBonusDealsConfig?.apiBase || '').trim().replace(/\/+$/,'');
  const listeners=new Set();
  const configured=/^https:\/\//.test(base);
  let items=Object.freeze([]), pending=null;
  let state=Object.freeze({status:configured?'idle':'unconfigured',error:null,updatedAt:null});

  const money=(cents,currency='USD')=>{
    if(!Number.isSafeInteger(cents)) return '';
    try{return new Intl.NumberFormat('en-US',{style:'currency',currency,minimumFractionDigits:0,maximumFractionDigits:2}).format(cents/100);}
    catch(_){return '$'+(cents/100).toFixed(2);}
  };
  function normalize(item){
    if(!item||typeof item.id!=='string'||typeof item.title!=='string') return null;
    const price=Number.isSafeInteger(item.priceCents)?item.priceCents:null;
    const original=Number.isSafeInteger(item.originalPriceCents)?item.originalPriceCents:null;
    const value=item.rewardText || (price!==null ? money(price,item.currency||'USD') : '查看优惠');
    return Object.freeze({
      id:item.id,slug:item.slug,source:'deals-api',provider:item.merchant||'Deals',
      name:item.title,category:item.category||'其他',value,
      requirement:item.summary||'',description:item.description||'',
      status:item.expiresOn && item.expiresOn<new Date().toISOString().slice(0,10)?'已结束':'',
      tags:[],imageUrl:item.imageUrl||'',priceCents:price,originalPriceCents:original,
      currency:item.currency||'USD',rewardText:item.rewardText||'',promoCode:item.promoCode||'',
      expiresOn:item.expiresOn||null,startsOn:item.startsOn||null,
      featured:item.featured===true,publishedAt:item.publishedAt||'',
      applyUrl:item.goUrl||'',goUrl:item.goUrl||''
    });
  }
  function publish(next,patch){
    items=Object.freeze(next);
    state=Object.freeze({...state,...patch});
    for(const callback of listeners) callback({items,state});
    window.dispatchEvent(new CustomEvent('nextbonus:deals-updated'));
  }
  async function load({force=false}={}){
    if(!configured) return {items,state};
    if(pending) return pending;
    if(!force && state.status==='ready') return {items,state};
    state=Object.freeze({...state,status:'loading',error:null});
    window.dispatchEvent(new CustomEvent('nextbonus:deals-updated'));
    pending=(async()=>{
      try{
        const all=[],seen=new Set();
        let offset=0,turns=0;
        while(turns++<20){
          const response=await fetch(base+'/api/public/deals?limit=100&offset='+offset,{mode:'cors',credentials:'omit',cache:'no-store'});
          if(!response.ok) throw Error('Deals API HTTP '+response.status);
          const payload=await response.json();
          if(!payload||!Array.isArray(payload.items)) throw Error('Invalid Deals response');
          for(const raw of payload.items){
            const item=normalize(raw);
            if(item&&!seen.has(item.id)){all.push(item);seen.add(item.id);}
          }
          if(payload.nextOffset===null||payload.nextOffset===undefined) break;
          if(!Number.isSafeInteger(payload.nextOffset)||payload.nextOffset<=offset) throw Error('Invalid Deals pagination');
          offset=payload.nextOffset;
        }
        publish(all,{status:'ready',error:null,updatedAt:new Date().toISOString()});
        return {items,state};
      }catch(error){
        publish(items,{status:'error',error:String(error?.message||error)});
        return {items,state};
      }finally{pending=null;}
    })();
    return pending;
  }
  window.NextBonusDealsCatalog=Object.freeze({
    isConfigured:()=>configured,
    list:()=>items,
    getById:id=>items.find(item=>item.id===id)||null,
    getState:()=>state,
    load,subscribe(callback){listeners.add(callback);return ()=>listeners.delete(callback);},
    money
  });
  if(configured) {
    const refreshOnReturn=()=>{
      if(Date.now()-Date.parse(state.updatedAt||0)>=5000)void load({force:true});
    };
    window.addEventListener?.('focus',refreshOnReturn);
    if(typeof document!=='undefined')document.addEventListener?.('visibilitychange',()=>{
      if(!document.hidden)refreshOnReturn();
    });
    void load();
  }
})();
