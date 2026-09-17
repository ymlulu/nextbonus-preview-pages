(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,uniqueAttentionProducts,currentActiveAttention,activeAttentionSorted,historyBucket,historyDateISO}){
    const productOptions=uniqueAttentionProducts();
    const productFilter=state.attentionProductFilter;
    const active=activeAttentionSorted(
      currentActiveAttention().filter(item=>productFilter==='all'||item.productId===productFilter)
    );
    let history=state.attentionHistory.filter(item=>productFilter==='all'||item.productId===productFilter);
    if(state.historyStatusFilter!=='all') history=history.filter(item=>historyBucket(item)===state.historyStatusFilter);
    history=history.sort((a,b)=>
      String(historyDateISO(b.ended)||b.dueDate||'').localeCompare(String(historyDateISO(a.ended)||a.dueDate||'')) ||
      String(b.id).localeCompare(String(a.id))
    );
    const visible=Math.max(20,state.historyVisibleCount||20);
    const shownHistory=history.slice(0,visible);
    return Object.freeze({productOptions,productFilter,active,history,shownHistory,hasMore:history.length>shownHistory.length});
  }

  root.attention=Object.freeze({build});
})();
