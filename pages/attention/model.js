(() => {
  'use strict';
  const root=window.NextBonusPageModels=window.NextBonusPageModels||{};

  function build({state,currentActiveAttention,activeAttentionSorted}){
    const active=activeAttentionSorted(currentActiveAttention());
    const historyFeature=window.NextBonusAttentionHistory;
    if(!historyFeature) throw new Error('Attention history feature unavailable');
    const history=historyFeature.allEvents(state);
    const visible=Math.max(20,state.historyVisibleCount||20);
    const shownHistory=history.slice(0,visible);
    return Object.freeze({active,history,shownHistory,hasMore:history.length>shownHistory.length});
  }

  root.attention=Object.freeze({build});
})();
