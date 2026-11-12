(() => {
  'use strict';
  // Public read-only card catalog. WordPress credentials never reach the browser.
  const API='https://nextbonus-preview-deals.uscc101-data.workers.dev/api/public/credit-cards';
  const cache=window.NextBonusDiscoverCache;
  const cached=cache?.read?.('credit-cards',c=>c.status==='published'&&
    typeof c.slug==='string'&&Array.isArray(c.offers)&&
    c.offers.some(o=>o.id===c.primaryOfferId&&o.goUrl&&o.bonus));
  let cards=Object.freeze((cached?.items||[]).map(c=>Object.freeze(c)));
  let offers=Object.freeze([]),pending=null;
  let state=Object.freeze({status:'idle',error:null,updatedAt:cached?.updatedAt||null});
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
  offers=Object.freeze(cards.map(adapt).filter(Boolean));
  async function load({force=false}={}){
    if(pending)return pending;
    if(!force&&state.status==='ready')return {cards,offers,state};
    state=Object.freeze({...state,status:'loading',error:null});
    pending=(async()=>{
      try{
        const all=[];
        let offset=0;
        for(let page=0;page<100;page++){
          const response=await window.fetch(API+'?offset='+offset,{method:'GET',mode:'cors',credentials:'omit'});
          if(!response.ok)throw Error('Credit Card API HTTP '+response.status);
          const data=await response.json();
          if(data?.version!==1||!Array.isArray(data.items))throw Error('Invalid Credit Card API payload');
          all.push(...data.items);
          if(data.nextOffset==null)break;
          if(!Number.isSafeInteger(data.nextOffset)||data.nextOffset<=offset)throw Error('Invalid credit card pagination');
          offset=data.nextOffset;
          if(page===99)throw Error('Credit card catalog exceeded pagination safety limit');
        }
        cards=Object.freeze(all.filter(c=>c.status==='published').map(c=>Object.freeze(c)));
        cache?.write?.('credit-cards',cards);
        offers=Object.freeze(cards.map(adapt).filter(Boolean));
        state=Object.freeze({status:'ready',error:null,updatedAt:new Date().toISOString()});
        for(const cb of listeners)cb({cards,offers,state});
        window.dispatchEvent?.(new CustomEvent('nextbonus:credit-cards-updated'));
        return {cards,offers,state};
      }catch(e){
        state=Object.freeze({...state,status:'error',error:String(e?.message||e)});
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
