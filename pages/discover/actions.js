(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('discover',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;
      if(action==='discover-category'){
        ctx.state.offerCategory=el.dataset.category;
        return {render:true};
      }
      if(action==='discover-clear-search'){
        ctx.state.offerSearch='';
        return {render:true,focusId:'discover-search'};
      }
      if(action==='open-offer'){
        ctx.openOffer?.(el.dataset.id,'discover');
        return {preventDefault:true};
      }
      return false;
    },
    input({event,ctx}){
      if(event.target?.id!=='discover-search') return false;
      ctx.state.offerSearch=event.target.value;
      return {render:true,focusId:'discover-search'};
    }
  });
})();
