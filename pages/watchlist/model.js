(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function priority(offer){
    if(offer.status==='新奖励') return 1;
    if(['今日截止','即将结束'].includes(offer.status)) return 2;
    if(offer.status) return 3;
    return 4;
  }

  function build({state,offers}){
    const order=new Map(state.savedOfferIds.map((id,index)=>[id,index]));
    const active=state.savedOfferIds
      .map(id=>offers.find(offer=>offer.id===id))
      .filter(Boolean)
      .sort((a,b)=>priority(a)-priority(b)||(order.get(b.id)??0)-(order.get(a.id)??0));
    const unavailable=state.unavailableSavedIds
      .map(id=>offers.find(offer=>offer.id===id))
      .filter(Boolean);
    const count=active.length+unavailable.length;
    return Object.freeze({active,unavailable,count,empty:count===0});
  }

  root.watchlist=Object.freeze({build,priority});
})();
