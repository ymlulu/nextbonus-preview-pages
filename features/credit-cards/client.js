(() => {
  'use strict';
  // Public read-only card catalog. WordPress credentials never reach the browser.
  const API='https://nextbonus-preview-deals.uscc101-data.workers.dev/api/public/credit-cards';
  let cards=Object.freeze([]),offers=Object.freeze([]),pending=null;
  let state=Object.freeze({status:'idle',error:null});
  const valid=v=>typeof v==='string'?v.trim():'';
  const listeners=new Set();
  function adapt(card){
    if(!card||!valid(card.slug)||!valid(card.name)||!Array.isArray(card.offers))return null;
    const primary=card.offers.find(o=>o.id===card.primaryOfferId)||null;
    if(!primary)return null;
    return Object.freeze({
      id:'wp-card:'+card.slug,slug:card.slug,source:'credit-cards-api',category:'信用卡',
      provider:card.issuer||'信用卡',name:card.name,
      value:primary.value||primary.bonus||'查看奖励',
      requirement:primary.requirement||'',
      bonusRaw:primary.bonus||'',status:'',tags:[],
      imageUrl:valid(card.imageUrl),highlight:valid(card.highlight),
      spending:valid(card.spending),reward:valid(card.reward),
      fee:valid(card.fee),feeCurrency:valid(card.feeCurrency),
      feeExtra:valid(card.feeExtra),articleUrl:valid(card.articleUrl),
      applyUrl:valid(primary.goUrl),offers:card.offers
    });
  }
  async function load({force=false}={}){
    if(pending)return pending;
    if(!force&&state.status==='ready')return {cards,offers,state};
    state=Object.freeze({status:'loading',error:null});
    pending=(async()=>{
      try{
        const response=await window.fetch(API,{method:'GET',mode:'cors',credentials:'omit'});
        if(!response.ok)throw Error('Credit Card API HTTP '+response.status);
        const data=await response.json();
        if(data?.version!==1||!Array.isArray(data.items))throw Error('Invalid Credit Card API payload');
        cards=Object.freeze(data.items.filter(c=>c.status==='published').map(c=>Object.freeze(c)));
        offers=Object.freeze(cards.map(adapt).filter(Boolean));
        state=Object.freeze({status:'ready',error:null});
        for(const cb of listeners)cb({cards,offers,state});
        window.dispatchEvent?.(new CustomEvent('nextbonus:credit-cards-updated'));
        return {cards,offers,state};
      }catch(e){
        state=Object.freeze({status:'error',error:String(e?.message||e)});
        return {cards,offers,state};
      }finally{pending=null;}
    })();
    return pending;
  }
  window.NextBonusCreditCardsCatalog=Object.freeze({
    list:()=>offers,products:()=>cards,getById:id=>offers.find(o=>o.id===id)||null,
    getState:()=>state,load,ensure:()=>state.status==='idle'?load():null,
    subscribe:cb=>{listeners.add(cb);return()=>listeners.delete(cb);}
  });
})();
