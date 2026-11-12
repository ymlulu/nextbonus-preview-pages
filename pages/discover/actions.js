(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  events.register('discover',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;
      if(action==='discover-retry-deals'){
        void window.NextBonusDealsCatalog?.load?.({force:true});
        return false;
      }
      if(action==='discover-page'){
        const next=Number(el.dataset.page);
        if(!Number.isSafeInteger(next)||next<1)return false;
        const model=window.NextBonusPageModels?.discover;
        const current=model?.build({state:ctx.state,offers:ctx.discoverOffers||ctx.offers});
        if(!current||next>current.pageCount||next===current.page)return false;
        ctx.state.offerPage=next;
        if(ctx.state.pageScroll)ctx.state.pageScroll.discover=0;
        requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
        return {render:true};
      }
      if(action==='discover-category'){
        ctx.state.offerCategory=el.dataset.category;
        ctx.state.offerPage=1;
        return {render:true};
      }
      if(action==='discover-clear-search'){
        ctx.state.offerSearch='';
        ctx.state.offerPage=1;
        return {render:true,focusId:'discover-search'};
      }
      return false;
    },
    input({event,ctx}){
      if(event.target?.id!=='discover-search') return false;
      ctx.state.offerSearch=event.target.value;
      ctx.state.offerPage=1;
      return {render:true,focusId:'discover-search'};
    }
  });
})();
