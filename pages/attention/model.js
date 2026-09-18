(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,uniqueAttentionProducts,currentActiveAttention,activeAttentionSorted,historyBucket,historyDateISO}){
    const productOptions=uniqueAttentionProducts();
    const productFilter=state.attentionProductFilter;
    const active=activeAttentionSorted(
      currentActiveAttention().filter(item=>productFilter==='all'||item.productId===productFilter)
    );
    const historyFeature=window.NextBonusAttentionHistory;
    if(!historyFeature) throw new Error('Attention history feature unavailable');
    let history=historyFeature.allEvents(state).filter(item=>productFilter==='all'||item.productId===productFilter);
    if(state.historyStatusFilter!=='all') history=history.filter(item=>historyFeature.statusBucket(item)===state.historyStatusFilter);
    const visible=Math.max(20,state.historyVisibleCount||20);
    const shownHistory=history.slice(0,visible);
    return Object.freeze({productOptions,productFilter,active,history,shownHistory,hasMore:history.length>shownHistory.length});
  }

  root.attention=Object.freeze({build});
})();
