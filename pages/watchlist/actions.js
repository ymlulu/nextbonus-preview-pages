(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events)throw new Error('Page event registry unavailable');

  events.register('wishlist',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el)return false;
      const action=el.dataset.action;
      if(action==='watchlist-history-toggle'){
        ctx.state.watchlistHistoryOpen=!ctx.state.watchlistHistoryOpen;
        return {render:true,preventDefault:true};
      }
      if(action==='watchlist-deal-complete'){
        const result=window.NextBonusDealWatchlistLifecycle?.complete?.(el.dataset.id);
        if(result){
          ctx.toast?.('已完成');
          return {render:true,preventDefault:true};
        }
        return {preventDefault:true};
      }
      if(action==='open-offer'){
        ctx.openOffer?.(el.dataset.id,'wishlist');
        return {preventDefault:true};
      }
      return false;
    }
  });
})();
