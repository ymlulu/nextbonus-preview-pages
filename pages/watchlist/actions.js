(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('wishlist',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el||el.dataset.action!=='watchlist-toggle-unavailable') return false;
      ctx.state.wishlistUnavailableOpen=!ctx.state.wishlistUnavailableOpen;
      return {render:true};
    }
  });
})();
