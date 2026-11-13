(() => {
  'use strict';
  const events=window.NextBonusEvents;
  if(!events) throw new Error('Page event registry unavailable');

  let pendingSearch=null;
  function stopSearchTimer(){
    if(pendingSearch!==null)window.clearTimeout?.(pendingSearch);
    pendingSearch=null;
  }
  events.register('discover',{
    click({event,ctx}){
      const el=event.target.closest?.('[data-action]');
      if(!el) return false;
      const action=el.dataset.action;
      if(action==='discover-retry-bank'){
        void window.NextBonusDiscoverBankOffers?.reload?.();
        return false;
      }
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
      if(action==='discover-sort'){
        const next=el.dataset.sort;
        if(!['personal','latest'].includes(next)||next===ctx.state.offerSort)return false;
        stopSearchTimer();
        window.NextBonusDiscoverInterests?.refresh?.();
        ctx.state.offerSort=next;
        ctx.state.offerPage=1;
        if(ctx.state.pageScroll)ctx.state.pageScroll.discover=0;
        requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
        return {render:true};
      }
      if(action==='discover-category'){
        stopSearchTimer();
        if(ctx.state.offerCategory!==el.dataset.category)
          window.NextBonusDiscoverInterests?.recordCategory?.(el.dataset.category);
        ctx.state.offerCategory=el.dataset.category;
        ctx.state.offerPage=1;
        return {render:true};
      }
      if(action==='discover-clear-search'){
        stopSearchTimer();
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
      stopSearchTimer();
      if(window.setTimeout&&ctx.state.offerSearch.trim()){
        const query=ctx.state.offerSearch,category=ctx.state.offerCategory,offers=ctx.discoverOffers||[];
        pendingSearch=window.setTimeout(()=>{
          window.NextBonusDiscoverInterests?.recordSearch?.(query,offers,category);
          pendingSearch=null;
        },650);
      }
      return {render:true,focusId:'discover-search'};
    }
  });
})();
