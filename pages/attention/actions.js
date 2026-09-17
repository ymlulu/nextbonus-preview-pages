(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('attention',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;
      if(action==='attention-view-tab'){
        ctx.state.attentionTab=el.dataset.tab;
        ctx.state.expandedAttentionId=null;
        ctx.state.historyVisibleCount=20;
        return {render:true};
      }
      if(action==='attention-history-load-more'){
        ctx.state.historyVisibleCount=(ctx.state.historyVisibleCount||20)+20;
        return {render:true};
      }
      if(action==='attention-clear-filter'){
        ctx.state.attentionProductFilter='all';
        ctx.state.expandedAttentionId=null;
        ctx.state.historyVisibleCount=20;
        return {render:true};
      }
      return false;
    },
    change({event,ctx}){
      if(event.target?.id==='attention-product-filter-local'){
        ctx.state.attentionProductFilter=event.target.value;
        ctx.state.expandedAttentionId=null;
        ctx.state.historyVisibleCount=20;
        return {render:true};
      }
      if(event.target?.id==='history-status-filter-local'){
        ctx.state.historyStatusFilter=event.target.value;
        ctx.state.expandedAttentionId=null;
        ctx.state.historyVisibleCount=20;
        return {render:true};
      }
      return false;
    }
  });
})();
